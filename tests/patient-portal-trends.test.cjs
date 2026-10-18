const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');
const ts = require('typescript');
const root = path.join(__dirname, '..');
const source = readFileSync(path.join(root, 'lib/patientPortalTrends.ts'), 'utf8');
const output = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
const helpers = {};
vm.runInNewContext(output, { exports: helpers, Date, Number, String, Map, JSON, Infinity });
const plain = value => JSON.parse(JSON.stringify(value));

test('only complete finite numeric values are plotted, including genuine zero', () => {
     for (const value of ['', ' ', null, undefined, '<5', '>10', 'Positive', '12mg/L', '1,000', 'NaN', 'Infinity', '0x12', false]) {
          assert.equal(helpers.numericTrendValue(value), null, String(value));
     }
     assert.equal(helpers.numericTrendValue('0'), 0);
     assert.equal(helpers.numericTrendValue('-1.2'), -1.2);
     assert.equal(helpers.numericTrendValue('1e2'), 100);
});

test('groups parameters by stable rule identity and units, sorting dates without modifying the response', () => {
     const row = { fieldid: 2, field: 'Example', units: 'mg/L', ascensionid: 2, recordedOn: '2026-02-01', value: '5' };
     const rows = [row, { ...row, ascensionid: 1, recordedOn: '2026-01-01', value: '4' },
          { ...row, units: 'g/L' }, { ...row, fieldid: 3 }, { ...row, recordedOn: null }];
     const groups = helpers.groupTrendRows(rows);
     assert.equal(groups.length, 3);
     assert.deepEqual(plain(groups[0].rows.map(value => value.recordedOn)), ['2026-01-01', '2026-02-01', null]);
     assert.equal(rows[0].ascensionid, 2);
     assert.equal(helpers.trendTimestamp('invalid'), null);
     assert.equal(helpers.trendTimestamp(null), null);
});

test('reference display preserves zero limits, one-sided ranges and qualitative references', () => {
     assert.equal(helpers.trendReference({ plan: 'limits', lowerlimit: 0, upperlimit: 5 }), '0 – 5');
     assert.equal(helpers.trendReference({ plan: 'limits', lowerlimit: null, upperlimit: 5 }), '≤ 5');
     assert.equal(helpers.trendReference({ plan: 'limits', lowerlimit: 0, upperlimit: '' }), '≥ 0');
     assert.equal(helpers.trendReference({ plan: 'text', textReference: 'Negative' }), 'Negative');
     assert.equal(helpers.trendReference({ plan: 'limits' }), 'Not provided');
});

test('patient page uses only the patient API, real paging and accessible complete data', () => {
     const page = readFileSync(path.join(root, 'components/PatientPortal/PatientTestTrends.tsx'), 'utf8');
     const chart = readFileSync(path.join(root, 'components/PatientPortal/TrendChart.tsx'), 'utf8');
     assert.match(page, /patient-portal\/trends\/tests/);
     assert.match(page, /page=\$\{page\}&count=\$\{count\}/);
     assert.doesNotMatch(page, /result\/trends|patientid=|tenantId=/);
     assert.match(page, /<caption>/);
     assert.match(page, /scope="col"/);
     assert.match(page, /scope="row"/);
     assert.match(page, /role="alert"/);
     assert.match(page, /role="status"/);
     assert.match(page, /referenceNote/);
     assert.match(chart, /role="img"/);
     assert.match(chart, /connected = false/);
     assert.doesNotMatch(chart, /parseFloat|Math\.random/);
});

function renderChart(rows) {
     const React = require('react');
     const { renderToStaticMarkup } = require('react-dom/server');
     const source = readFileSync(path.join(root, 'components/PatientPortal/TrendChart.tsx'), 'utf8');
     const output = ts.transpileModule(source, {
          compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
     }).outputText;
     const exports = {};
     vm.runInNewContext(output, {
          exports, Date, Number, String, Math,
          require: name => {
               if (name.endsWith('patientPortalTrends')) return helpers;
               if (name.endsWith('patientPortal')) return { formatDate: value => value || '-' };
               if (name.endsWith('.css')) return {};
               return require(name);
          },
     });
     return renderToStaticMarkup(React.createElement(exports.default, { field: 'Example', units: 'mg/L', rows }));
}

test('rendered chart plots genuine zero, leaves categorical gaps and exposes accessible exact values', () => {
     const row = { ascensionid: 1, recordedOn: '2026-01-01', value: '0' };
     const html = renderChart([row, { ...row, ascensionid: 2, recordedOn: '2026-02-01', value: '<5' },
          { ...row, ascensionid: 3, recordedOn: '2026-03-01', value: '10' }]);
     assert.equal((html.match(/<circle /g) || []).length, 2);
     assert.match(html, /2026-01-01: 0 mg\/L/);
     assert.match(html, /role="img"/);
     assert.match(html, /aria-labelledby=/);
     assert.match(html, /1 nonnumeric or undated/);
     // A new move command, not an interpolated/connected measurement, follows the qualified result.
     assert.match(html, /<path d="M [^"]+ M /);
});

test('rendered chart explicitly handles all-nonnumeric and single-point histories', () => {
     const row = { ascensionid: 1, recordedOn: '2026-01-01', value: 'Negative' };
     const categorical = renderChart([row]);
     assert.match(categorical, /No dated, purely numeric values to plot/);
     assert.doesNotMatch(categorical, /<circle/);
     assert.match(renderChart([{ ...row, value: '2' }]), /One numeric result/);
});
