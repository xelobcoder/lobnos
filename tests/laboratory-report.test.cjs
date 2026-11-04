const assert = require('node:assert/strict');
const test = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const root = path.join(__dirname, '..');
const cache = new Map();
let portalResource;
function load(filename) {
    const full = path.isAbsolute(filename) ? filename : path.join(root, filename);
    const resolved = ['', '.tsx', '.ts', '.jsx', '.js'].map(extension => full + extension).find(file => fs.existsSync(file) && fs.statSync(file).isFile());
    if (!resolved) throw Error(`Missing test module: ${full}`);
    if (cache.has(resolved)) return cache.get(resolved);
    const output = {};
    cache.set(resolved, output);
    vm.runInNewContext(ts.transpileModule(fs.readFileSync(resolved, 'utf8'), {
        compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
    }).outputText, {
        exports: output, URL, Date, Number, String, Map, Set, Error, console, process: { env: {} },
        require(name) {
            if (name.endsWith('.css')) return new Proxy({}, { get: (_target, key) => key === '__esModule' ? false : String(key) });
            if (name.endsWith('/companyImage')) return { scopedCompanyImageUrl: value => value || '' };
            if (name.endsWith('/usePortalResource')) return { usePortalResource: endpoint => endpoint?.endsWith('/summary') ? {...portalResource, data: portalResource.data ? {payable: portalResource.data.length ? 12.30 : 0, paid: portalResource.data.length ? 10.20 : 0, outstanding: portalResource.data.length ? 2.10 : 0, bills: portalResource.data.length, unpaidBills: portalResource.data.length} : null} : portalResource };
            if (name === 'jspdf' || name === 'html2canvas') return {};
            if (name.startsWith('.')) return load(path.resolve(path.dirname(resolved), name));
            return require(name);
        },
    });
    return output;
}
const { default: Report, resolveReportSettings } = load("components/ResultView/LaboratoryReport.tsx");
const { reportPageCuts, laboratoryReportFilename } = load("lib/laboratoryReportPdf.ts");
const fixture = {
    ascensionid: 108, billingid: 31, patientid: 21,
    companyInfo: { name: 'Example Laboratory', address: 'Facility address', email: 'lab@example.test', phonenumber: '123' },
    patientInformation: { firstname: 'Ama', middlename: '', lastname: 'Patient', gender: 'female', age: 30, agetype: 'years', fullpatientid: 'P021', organization: '' },
    testname: 'Full blood count', logourl: '/api/v1/settings/companyprofile/images?tenantId=4',
    testInfo: { reportitle: 'Haematology report', method: 'Automated', instrumentation: 'Analyzer' },
    resultsettings: { fontfamily: 'Inter', includeBarcode: false, companyInfo: { breakname: true },
        testBody: { hasColorsForFlags: true, highlightFlags: true, hightFlagColor: '#cc0000', lowFlagColor: '#0000cc' } },
    records: [
        { name: 'Haemoglobin', value: '8.2', plan: 'limits', units: 'g/dL', lowerlimit: 12, upperlimit: 16, flag: 'L', categoryid: 4 },
        { name: 'White cells', value: '15', plan: 'limits', units: '10⁹/L', lowerlimit: 4, upperlimit: 11, flag: 'H', categoryid: 4 },
        { name: 'Morphology', value: 'Reviewed', plan: 'input', units: '' },
    ],
    testdetailcategory: [{ categoryid: 4, categoryname: 'Haematology' }],
    comments: '<p>Review with your clinician.</p>', literatureReview: '<p>Interpretive notes</p>',
    validators: [{ employeeid: 3, username: 'Actual verifier' }], resultentry: 'Entry scientist',
    enteredOn: '2026-10-17T12:00:00Z', lastupdatedon: '2026-10-18T12:00:00Z',
    samplingInformation: { id: 108, billingid: 31, collectionEndDate: '2026-10-17T12:00:00Z', resultEntryEnd: '2026-10-18T12:00:00Z' },
};
const render = data => renderToStaticMarkup(React.createElement(Report, { data }));

test('staff and patient report pages use one canonical renderer and A4 PDF exporter', () => {
    for (const file of ["app/result/labreport/4/page.tsx", "app/patientportal/results/[billingid]/page.tsx"]) {
        const source = fs.readFileSync(path.join(root, file), 'utf8');
        assert.match(source, /<LaboratoryReport/);
        assert.match(source, /createLaboratoryReportPdf/);
    }
    const source = fs.readFileSync(path.join(root, "app/patientportal/results/[billingid]/page.tsx"), 'utf8');
    assert.doesNotMatch(source, /result\/printout\/ascension\/getResult/);
    assert.match(source, /patient-portal\/results\/\$\{billingid\}\/report/);
});
test('canonical report retains facility, patient, panel/category, values, units, ranges, flags and actual validators', () => {
    const html = render(fixture);
    for (const text of ['Example', 'Laboratory', 'Facility address', 'P021', 'Ama', 'Haematology report',
        'Haemoglobin', '8.2', 'g/dL', '12', '16', 'White cells', '10⁹/L', 'Morphology',
        'Actual verifier', 'Entry scientist', 'Automated', 'Analyzer', 'Review with your clinician']) {
        assert.ok(html.includes(text), `Missing report content: ${text}`);
    }
    assert.match(html, />L<\/span>/);
    assert.match(html, />H<\/span>/);
    assert.match(html, /tenantId=4/);
    assert.doesNotMatch(html, /Printed By:/);
});
test('reported flags take precedence over recalculation in the shared staff/patient result rows', () => {
    const html = render({ ...fixture, records: [{ name: 'Explicit low', value: '15', units: 'g/L', plan: 'limits', lowerlimit: 1, upperlimit: 20, flag: 'L' }] });
    assert.match(html, />L<\/span>/);
});
test('optional report metadata and single-test reports do not fabricate a verifier or specimen date', () => {
    const html = render({ ...fixture, records: [fixture.records[0]], validators: [], resultentry: '', enteredOn: null,
        lastupdatedon: null, samplingInformation: null, referrerFacility: null,
        resultsettings: { ...fixture.resultsettings, includeSignature: false }, comments: '', literatureReview: '' });
    assert.ok(html.includes('Haemoglobin'));
    assert.doesNotMatch(html, /Invalid Date|Actual verifier|undefined|null/);
});
test('multi-panel reports retain every panel and long interpretive note', () => {
    const reports = [fixture, { ...fixture, ascensionid: 109, testname: 'Culture', testInfo: { reportitle: 'Culture' },
        comments: '<p>' + 'Long interpretation. '.repeat(500) + '</p>',
        hasDrugs: true, drugList: [{ id: 1, ascensionid: 109, drug: 'Ampicillin', sensitivity: 'Resistant' }] }];
    const html = reports.map(render).join('');
    assert.match(html, /Culture/);
    assert.match(html, /Ampicillin/);
    assert.match(html, /Resistant/);
    assert.equal((html.match(/Long interpretation/g) || []).length, 500);
    assert.equal((html.match(/MEDICAL LABORATORY REPORT/g) || []).length, 2);
});
test('A4 pagination covers the complete document without gaps or overlap and chooses row boundaries', () => {
    for (const height of [100, 2670, 9500, 25000]) {
        const cuts = Array.from(reportPageCuts(height, 2670, Array.from({ length: 100 }, (_value, index) => index * 160)));
        assert.equal(cuts[0], 0);
        assert.equal(cuts.at(-1), height);
        assert.equal(cuts.slice(1).reduce((sum, value, index) => sum + value - cuts[index], 0), height);
        assert.ok(cuts.slice(1).every((value, index) => value > cuts[index] && value - cuts[index] <= 2670));
    }
    assert.equal(reportPageCuts(6000, 2670, [2400, 4800])[1], 2400);
    assert.throws(() => reportPageCuts(0, 2670, []), /Invalid report/);
    assert.equal(laboratoryReportFilename(31, 108), 'Laboratory-report-31-108.pdf');
    assert.equal(resolveReportSettings({ testBody: { fontSize: 18 } }).testBody.trFirstColumnName, 'Investigation');
});
test('patient and Daily Sales summaries share the same analytic card renderer', () => {
    const { default: Summary } = load("components/PatientPortal/PortalSummary.tsx");
    const html = renderToStaticMarkup(React.createElement(Summary, { items: [{ label: 'Paid', value: 'GHS 20.00' }, { label: 'Outstanding', value: 'GHS 10.00' }] }));
    assert.match(html, /summaryGrid/);
    assert.match(html, /summaryCard/);
    assert.match(html, /GHS 20.00/);
    const css = fs.readFileSync(path.join(root, "components/PatientPortal/PortalShell.module.css"), 'utf8');
    assert.match(css, /\.patientContent \{ font-family: inherit; font-size: inherit;/);
    assert.match(css, /\.loginLayout \{[^}]*font-family: var\(--theme-font-family, var\(--font-open-sans\)\)/);
    assert.doesNotMatch(css, /font-inter|Candara/);
    const cardCss = fs.readFileSync(path.join(root, "components/Billing/AnalyticSummaryCard.module.css"), 'utf8');
    assert.match(cardCss, /tabular-nums/);
    assert.match(html, /bg-primary bg-gradient text-white/);
    for (const file of ["components/PatientPortal/PortalSummary.tsx", "components/Billing/BillingSumamry/BilledSummary.tsx"]) {
        assert.match(fs.readFileSync(path.join(root, file), 'utf8'), /<AnalyticSummaryCard/);
    }
});
test('portal typography follows the configured software workspace, including Slack Aspire', () => {
    const { workspaceFontFamily, DEFAULT_FONT_FAMILY } = load("lib/themes.ts");
    assert.match(workspaceFontFamily({ workspaceLayout: 'slack', fontFamily: 'var(--font-raleway)' }), /^var\(--font-raleway\)/);
    assert.match(workspaceFontFamily({ workspaceLayout: 'ribbon' }), /^"Segoe UI"/);
    for (const workspaceLayout of ['zoho', 'claude', 'portal']) {
        assert.match(workspaceFontFamily({ workspaceLayout }), /^var\(--font-inter\)/);
    }
    assert.equal(workspaceFontFamily({ workspaceLayout: 'classic', fontFamily: 'Open Sans' }), 'var(--font-open-sans)');
    assert.equal(workspaceFontFamily(), DEFAULT_FONT_FAMILY);
    const shell = fs.readFileSync(path.join(root, "components/PatientPortal/PortalShell.tsx"), 'utf8');
    assert.match(shell, /'--theme-font-family': workspaceFontFamily\(context.settings\)/);
    const css = fs.readFileSync(path.join(root, "components/PatientPortal/PortalShell.module.css"), 'utf8');
    const workspaceCss = fs.readFileSync(path.join(root, "components/Layout/WorkspaceLayout.module.css"), 'utf8');
    assert.match(css, /\.shell \{[^}]*grid-template-columns: 272px minmax\(0, 1fr\)/);
    assert.match(workspaceCss, /\.slackLayout \.sidebar \{\s*width: 272px/);
    assert.doesNotMatch(css, /grid-template-columns: (250|210)px/);
    assert.match(css, /\.scope :global\(\.btn\) \{ font-family: inherit; \}/);
});
test('patient billing summary renders accurate totals using the Daily Sales cards', () => {
    portalResource = { data: [
        { billingid: 1, billedon: '2026-10-01', payable: '12.10', paid: '10.10', outstanding: '2.00' },
        { billingid: 2, billedon: '2026-10-02', payable: '0.20', paid: '0.10', outstanding: '0.10' },
    ], loading: false, error: '', code: '', reload() {} };
    const { default: Billing } = load("app/patientportal/billing/page.tsx");
    const html = renderToStaticMarkup(React.createElement(Billing));
    const { formatMoney } = load("lib/patientPortal.ts");
    for (const amount of [12.30, 10.20, 2.10]) assert.ok(html.includes(formatMoney(amount)), `Missing total ${amount}`);
    assert.match(html, /Financial Summary/);
    assert.match(html, /bg-success bg-gradient/);
    assert.match(html, /bg-warning bg-gradient/);
    assert.match(html, /href="\/patientportal\/requests"/);
    portalResource = { ...portalResource, data: [], };
    const empty = renderToStaticMarkup(React.createElement(Billing));
    assert.ok(empty.includes(formatMoney(0)));
    assert.match(empty, /You have no bills/);
    portalResource = { data: null, loading: false, error: 'Could not load bills', code: '', reload() {} };
    const failure = renderToStaticMarkup(React.createElement(Billing));
    assert.match(failure, /Could not load bills/);
    assert.doesNotMatch(failure, /Financial Summary/);
});
