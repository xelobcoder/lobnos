const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const test = require('node:test');
const ts = require('typescript');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const root = path.join(__dirname, '..');

function load(file, mocks = {}) {
    const exports = {};
    const output = ts.transpileModule(readFileSync(path.join(root, file), 'utf8'), {
        compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
    }).outputText;
    vm.runInNewContext(output, {
        exports, Date, Number, String, Map, Intl, JSON, Error, Infinity,
        require: name => {
            if (name in mocks) return mocks[name];
            if (mocks.resolve) {
                const resolved = mocks.resolve(name);
                if (resolved !== undefined) return resolved;
            }
            if (name.endsWith('.module.css')) {
                const prefix = path.basename(name, '.module.css');
                return new Proxy({}, { get: (_, key) => key === '__esModule' ? false : `${prefix}_${String(key)}` });
            }
            return require(name);
        },
    });
    return exports;
}
const portal = load('lib\\patientPortal.ts');
const trends = load('lib\\patientPortalTrends.ts');
const Link = ({ href, children, ...props }) => React.createElement('a', { href, ...props }, children);
const row = (overrides = {}) => ({
    ascensionid: 1, billingid: 31, fieldid: 2, field: 'Haemoglobin', value: '10', numericValue: 10,
    recordedOn: '2026-10-01', completedOn: '2026-10-01', units: 'g/dL', plan: 'limits',
    lowerlimit: 12, upperlimit: 16, textReference: '', ...overrides,
});
const history = {
    testid: 7, testname: 'Blood count', page: 1, count: 25, total: 3, totalPages: 1,
    referenceNote: 'Reference ranges reflect the current laboratory configuration.',
    rows: [row(), row({ ascensionid: 2, value: '12', recordedOn: '2026-10-10' }),
        row({ ascensionid: 3, value: '<5', recordedOn: '2026-10-18' })],
};
function stateHooks(overrides = {}) {
    const state = [];
    let cursor = 0;
    return {
        react: {
            ...React, useEffect() {},
            useState(initial) {
                const index = cursor++;
                if (!(index in state)) state[index] = index in overrides ? overrides[index] : initial;
                return [state[index], value => { state[index] = typeof value === 'function' ? value(state[index]) : value; }];
            },
        },
        reset() { cursor = 0; },
    };
}
function nodes(tree) {
    const found = [];
    function visit(node) {
        if (!node || typeof node !== 'object') return;
        found.push(node);
        for (const child of [node.props?.children].flat(Infinity)) visit(child);
    }
    visit(tree);
    return found;
}
function trendHarness(view = 'chart') {
    const hooks = stateHooks({ 0: '7' });
    const chart = load('components\\PatientPortal\\TrendChart.tsx', {
        '../../lib/patientPortalTrends': trends, '../../lib/patientPortal': portal,
    }).default;
    const component = load('components\\PatientPortal\\PatientTestTrends.tsx', {
        react: hooks.react, 'next/link': { __esModule: true, default: Link },
        './usePortalResource': { usePortalResource: endpoint => ({
            data: endpoint.endsWith('/tests') ? [{ testid: 7, testname: 'Blood count', resultCount: 3 }] : history,
            loading: false, error: '', reload() {},
        }) },
        '../../lib/patientPortal': portal, '../../lib/patientPortalTrends': trends,
        './TrendChart': { __esModule: true, default: chart },
    }).default;
    hooks.reset();
    const tree = component();
    const historyNode = nodes(tree).find(node => node.type?.name === 'TestHistory');
    // The history component has its own hook state in the actual React tree.
    const historyHooks = stateHooks({ 2: view });
    Object.assign(hooks.react, historyHooks.react);
    return {
        render() { historyHooks.reset(); return historyNode.type(historyNode.props); },
        tree, component,
    };
}
function resultsHarness() {
    const hooks = stateHooks();
    const endpoints = [];
    const dates = load('components\\operations\\Laboratory\\ResuableFilter\\DateFilterReusable.tsx').default;
    const component = load('app\\patientportal\\results\\page.tsx', {
        react: hooks.react, 'next/link': { __esModule: true, default: Link },
        '../../../components/operations/Laboratory/ResuableFilter/DateFilterReusable': { __esModule: true, default: dates },
        '../../../lib/patientPortal': portal,
        '../../../components/PatientPortal/usePortalResource': { usePortalResource: endpoint => {
            endpoints.push(endpoint);
            return { data: [{ ascensionid: 1, billingid: 31, requestedOn: '2026-10-18', testname: 'Blood count',
                stage: 'verified', released: true, pending: null, completedOn: '2026-10-18' }], loading: false, error: '', reload() {} };
        } },
    }).default;
    return {
        endpoints,
        render() { hooks.reset(); return component(); },
    };
}

test('patient trends switch between Chart and Values, retaining exact qualified values and change information', () => {
    const harness = trendHarness();
    let tree = harness.render();
    assert.ok(nodes(tree).some(node => node.type?.name === 'TrendChart'));
    nodes(tree).find(node => node.type === 'button' && node.props.children === 'Values').props.onClick();
    tree = harness.render();
    assert.ok(!nodes(tree).some(node => node.type?.name === 'TrendChart'));
    const html = renderToStaticMarkup(tree);
    assert.match(html, /&lt;5/);
    assert.match(html, /2\.00 increase/);
    assert.match(html, /\+20\.00%/);
    assert.match(html, /Accession #3/);
    assert.match(html, /The reference range is between 12\.00 and 16\.00 g\/dL\./);
    assert.match(html, /This result is within the range/);
    assert.match(html, /aria-pressed="true">Values/);
    nodes(tree).find(node => node.type === 'button' && node.props.children === 'Chart').props.onClick();
    assert.ok(nodes(harness.render()).some(node => node.type?.name === 'TrendChart'));
});

test('results reuse the PLS date control, send inclusive dates to the API, and clear to all dates', () => {
    const harness = resultsHarness();
    let tree = harness.render();
    const control = nodes(tree).find(node => node.type?.name === 'DateFilterReusable');
    assert.equal(control.props.id, 'patient-result-dates');
    control.props.onChange('Custom Range');
    control.props.onDateRangeChange('2026-10-01', '2026-10-18');
    tree = harness.render();
    assert.equal(harness.endpoints.at(-1), 'patient-portal/results?from=2026-10-01&to=2026-10-18');
    assert.match(renderToStaticMarkup(tree), /Custom range start date/);
    nodes(tree).find(node => node.props.children === 'Clear dates').props.onClick();
    harness.render();
    assert.equal(harness.endpoints.at(-1), 'patient-portal/results');
    control.props.onChange('Custom Range');
    control.props.onDateRangeChange('2026-10-20', '2026-10-18');
    assert.match(renderToStaticMarkup(harness.render()), /Select a valid start and end date/);
    assert.equal(harness.endpoints.at(-1), null);
});

// Synthetic, non-patient data for browser viewport checks; uses the real page markup and CSS.
function renderFixture(kind = 'values') {
    let content;
    if (kind === 'results') {
        const harness = resultsHarness();
        const control = nodes(harness.render()).find(node => node.type?.name === 'DateFilterReusable');
        control.props.onChange('Custom Range');
        control.props.onDateRangeChange('2026-10-01', '2026-10-18');
        content = harness.render();
    } else if (['values', 'chart'].includes(kind)) {
        content = React.createElement('main', { className: 'trends_page' }, trendHarness(kind).render());
    } else {
        const profile = { firstname: 'Synthetic', lastname: 'Patient', fullpatientid: 'TEST-P001',
            email: 'synthetic-patient-with-a-long-address@example.test', account: {} };
        const bill = { billingid: 31, billedon: '2026-10-18', total: 250, discount: 0, payable: 250, paid: 100,
            outstanding: 150, status: 'normal', items: [{ serviceid: 1, description: 'Full blood count', amount: 250, paid: 100, outstanding: 150 }],
            payments: [{ receiptNumber: 'TEST-R001', paidon: '2026-10-18', amount: 100, mode: 'cash', type: 'payment' }] };
        const appointment = { refid: 'test-appointment', appointment_date: '2026-10-25', appointment_time: '09:30',
            title: 'Laboratory visit', status: 'pending', upcoming: true, appointment_type: 'laboratory' };
        const resources = {
            'patient-portal/me': profile,
            'patient-portal/billing': [bill],
            'patient-portal/billing/31': bill,
            'patient-portal/dashboard': { results: { available: 1, inProgress: 0, recent: [] }, appointments: { upcoming: [appointment] },
                billing: { bills: 1, outstanding: 150 }, features: { billing: true, appointmentRequests: true } },
            'patient-portal/appointments': { appointments: [appointment], requestsEnabled: true },
            'patient-portal/billing-requests/catalog': [{ testid: 7, name: 'Full blood count', estimatedPrice: '250' }],
            'patient-portal/billing-requests?page=1': [{ id: 1, patientid: 1, testIds: [7], note: 'Request for review',
                status: 'submitted', created_at: '2026-10-18' }],
        };
        const card = load('components\\Billing\\AnalyticSummaryCard.tsx').default;
        const summary = load('components\\PatientPortal\\PortalSummary.tsx', {
            '../Billing/AnalyticSummaryCard': { __esModule: true, default: card },
        }).default;
        const resolve = name => {
            if (name === 'next/link') return { __esModule: true, default: Link };
            if (name === 'next/navigation') return { useParams: () => ({ billingid: '31' }) };
            if (name.endsWith('/patientPortal')) return portal;
            if (name.endsWith('/usePortalResource')) return { usePortalResource: endpoint => ({
                data: resources[endpoint], loading: false, error: '', code: '', reload() {},
            }) };
            if (name.endsWith('/Auth/customFetch')) return { customFetchMutation() { throw Error('No network in synthetic fixture'); } };
            if (name.endsWith('/signOutPatient')) return { signOutPatient() {} };
            if (name.endsWith('/PortalSummary')) return { __esModule: true, default: summary };
        };
        const pageFile = kind === 'home' ? 'app\\patientportal\\page.tsx'
            : kind === 'bill-detail' ? 'app\\patientportal\\billing\\[billingid]\\page.tsx' : `app\\patientportal\\${kind}\\page.tsx`;
        content = React.createElement(load(pageFile, { resolve }).default);
    }
    const cssFiles = [
        'node_modules\\bootstrap\\dist\\css\\bootstrap.min.css',
        'components\\PatientPortal\\PortalShell.module.css',
        'components\\PatientPortal\\portal.module.css',
        'components\\PatientPortal\\trends.module.css',
        'components\\Billing\\AnalyticSummaryCard.module.css',
    ];
    const css = cssFiles.map(file => {
        let text = readFileSync(path.join(root, file), 'utf8');
        if (file.endsWith('.module.css')) {
            const prefix = path.basename(file, '.module.css');
            const globals = [];
            text = text.replace(/:global\(([^)]+)\)/g, (_, selector) => {
                globals.push(selector);
                return `__GLOBAL${globals.length - 1}__`;
            }).replace(/\.([A-Za-z][A-Za-z0-9]*)/g, (_, name) => `.${prefix}_${name}`)
                .replace(/__GLOBAL(\d+)__/g, (_, index) => globals[Number(index)]);
        }
        return text;
    }).join('\n');
    const links = ['Home', 'My Results', 'Test trends', 'Request tests', 'Appointments', 'Billing', 'My Account'];
    const markup = React.createElement('div', { className: 'PortalShell_scope PortalShell_shell' },
        React.createElement('aside', { className: 'PortalShell_sidebar' },
            React.createElement('div', { className: 'PortalShell_brand' }, 'Prime Laboratory Software'),
            React.createElement('nav', { className: 'PortalShell_nav' }, links.map(label => React.createElement('a', { key: label, href: '#' }, label))),
            React.createElement('div', { className: 'PortalShell_footer' },
                React.createElement('span', { className: 'PortalShell_identity' }, 'Synthetic Patient · synthetic@example.test'),
                React.createElement('button', null, 'Sign out'))),
        React.createElement('div', { className: 'PortalShell_content' },
            React.createElement('header', { className: 'PortalShell_header' }, 'Patient Portal'),
            React.createElement('div', { className: 'PortalShell_main PortalShell_patientContent' }, content)));
    return `<!doctype html><html lang="en"><meta name="viewport" content="width=device-width, initial-scale=1"><title>PLS synthetic ${kind} viewport check</title><style>${css}</style><body>${renderToStaticMarkup(markup)}</body></html>`;
}
module.exports = { renderFixture };

test('mobile fixtures render the real home, billing, appointments, request and account content', () => {
    for (const kind of ['home', 'billing', 'bill-detail', 'appointments', 'requests', 'account']) {
        const html = renderFixture(kind);
        assert.match(html, /<main/);
        assert.match(html, /PortalShell_patientContent/);
        assert.doesNotMatch(html, /Loading your|Loading bills|Loading appointments|Loading tests/);
    }
});
