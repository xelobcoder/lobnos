const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const root = path.join(__dirname, '..');
function load(relative) {
    const file = path.join(root, relative);
    const exports = {};
    const compiled = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true } }).outputText;
    vm.runInNewContext(compiled, { exports, console, URL, Date, Map, Set, require(name) {
        if (/customFetch|requestHeaders|companyImage/.test(name)) return {};
        if (name.startsWith('.')) return load(path.relative(root, path.resolve(path.dirname(file), name + '.ts')));
        return require(name);
    } });
    return exports;
}
const { priceListReport } = load('lib/priceListReport.ts');

test('price-list export preserves zero prices and marks missing or invalid prices unavailable', () => {
    const spec = priceListReport([0, '12.5', null, undefined, '', 'invalid'].map((price, index) => ({ testid: index + 1, name: 'Test', discountedValue: price })));
    assert.deepEqual(Array.from(spec.tables[0].body, row => row[3]), ['0.00', '12.50', 'N/A', 'N/A', 'N/A', 'N/A']);
    assert.equal(spec.tables[0].body.length, 6);
    assert.equal(spec.title, 'Price List');
});

test('full price lists generate a multipage PDF through the shared report renderer', () => {
    const { buildReportPdf } = load('components/reports/reportPdf.ts');
    const spec = priceListReport(Array.from({ length: 180 }, (_, index) => ({ testid: index + 1, name: `Laboratory service ${index + 1}`, discountedValue: 12.5 })));
    const pdf = buildReportPdf(spec, { company: { name: 'Example Laboratory', address: 'Accra' }, logo: null });
    assert.ok(pdf.getNumberOfPages() > 1);
    assert.ok(pdf.output().startsWith('%PDF-'));
    assert.equal(spec.tables[0].body.length, 180);
});
