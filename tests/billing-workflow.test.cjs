const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');
const ts = require('typescript');
const React = require('react');

const root = path.join(__dirname, '..');
function load(file, mocks, globals = {}) {
    const exports = {};
    const compiled = ts.transpileModule(readFileSync(path.join(root, file), 'utf8'), {
        fileName: file, reportDiagnostics: true,
        compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
    });
    assert.deepEqual(compiled.diagnostics, []);
    vm.runInNewContext(compiled.outputText, {
        exports, URLSearchParams, console,
        require: name => name === 'react/jsx-runtime' ? require(name) : mocks(name),
        ...globals,
    });
    return exports;
}
const types = load(path.join('lib', 'Multi', 'MultiTypes.ts'), name => { throw new Error(name); });
const workflow = api => load(path.join('lib', 'Multi', 'billingWorkflow.ts'), () => ({ customFetch: api }));
const context = { patientid: 101, categorytrackid: 1, ispricingcheckout: false };
const plain = value => JSON.parse(JSON.stringify(value));
const nodes = (tree, predicate) => !tree || typeof tree !== 'object' ? [] : Array.isArray(tree)
    ? tree.flatMap(child => nodes(child, predicate))
    : [...(predicate(tree) ? [tree] : []), ...nodes(tree.props?.children, predicate)];
const text = tree => tree == null ? '' : typeof tree !== 'object' ? String(tree)
    : Array.isArray(tree) ? tree.map(text).join('') : text(tree.props?.children);

test('mode is authoritative and failures never select General', async () => {
    for (const [hasActiveStrategies, expected] of [[false, 'simple'], [true, 'advanced']]) {
        assert.equal(await workflow(async () => ({ status: 'success', hasActiveStrategies })).getFacilityBillingMode(), expected);
    }
    for (const response of [{}, { status: 'error', hasActiveStrategies: false }, { status: 'success', result: [] }]) {
        await assert.rejects(workflow(async () => response).getFacilityBillingMode(), /billing configuration/);
    }
    await assert.rejects(workflow(async () => { throw new Error('Offline'); }).getFacilityBillingMode(), /Offline/);
});

test('general redirect preserves quote, adjustment, related-billing and suspended-draft context', () => {
    const helper = workflow();
    const query = 'billingid=42&isAdjustment=1&adjustmentType=correction&adjustmentReason=A%26B&ispricingcheckout=1&suspendedDraftId=7';
    const url = helper.generalBillingUrl('encrypted-patient', query);
    assert.ok(url.startsWith('/billing/patientid/encrypted-patient/multi/1?'));
    const params = new URLSearchParams(url.split('?')[1]);
    assert.equal(params.get('adjustmentReason'), 'A&B');
    for (const [key, value] of new URLSearchParams(query)) assert.equal(params.get(key), value);
    assert.equal(params.get('isOpenSideBarShow'), 'false');
});

test('automatic catalog load never overwrites a draft, adjustment, referral price or existing bill', () => {
    const helper = workflow();
    assert.equal(helper.canPreloadGeneralBilling(context), true);
    for (const override of [
        { categorytrackid: 2 }, { categorytrackid: 3 }, { categorytrackid: 4 }, { categorytrackid: 6 },
        { suspendedDraftId: 7 }, { billingid: 42 }, { isAdjustment: true }, { specialcode: 'REF' }, { entityid: '14' },
    ]) assert.equal(helper.canPreloadGeneralBilling({ ...context, ...override }), false);
});

test('catalog uses the existing init contract without sending client prices or referral entities as payers', () => {
    const data = { ...types.defaultMultiBillingData, billingSource: 1, patientid: 101, branchid: 4, organizationId: 14, clinicianId: 8 };
    const params = new URLSearchParams(workflow().billingInitUrl(data, false, false).split('?')[1]);
    assert.equal(params.get('entityType'), 'general');
    assert.equal(params.get('billingSource'), '1');
    assert.equal(params.get('patientId'), '101');
    assert.equal(params.get('branchid'), '4');
    assert.equal(params.has('entityId'), false);
    assert.equal(params.has('price'), false);
    assert.equal(params.get('ispricingcheckout'), 'false');
});

test('advanced init retains organization, insurer, NHIS, clinician, package and reference-code contracts', () => {
    const helper = workflow();
    for (const [billingSource, entitytype] of [[2, 'organization'], [3, 'insurance'], [6, 'clinician']]) {
        const params = new URLSearchParams(helper.billingInitUrl({
            ...types.defaultMultiBillingData, billingSource, entitytype, entityId: 14, billingid: 42,
            isPackageUsed: true, packageid: 9,
        }, true, true).split('?')[1]);
        assert.equal(params.get('entityType'), entitytype);
        assert.equal(params.get('entityId'), '14');
        assert.equal(params.get('billingSource'), String(billingSource));
        assert.equal(params.get('billingid'), '42');
        assert.equal(params.get('packageid'), '9');
        assert.equal(params.get('includeServices'), 'true');
        assert.equal(params.get('ispricingcheckout'), 'true');
    }
    const nhis = { ...types.defaultMultiBillingData, billingSource: 4, nhismembershipid: 123, claimscheckcode: 456 };
    const params = new URLSearchParams(helper.billingInitUrl(nhis, false, false).split('?')[1]);
    assert.equal(params.get('nhisMemberId'), '123');
    assert.equal(params.get('claimCheckCode'), '456');
    assert.equal(params.get('entityType'), 'nhis');
    const referral = new URLSearchParams(helper.billingInitUrl({
        ...types.defaultMultiBillingData, billingSource: 2, useSpecialCode: true, specialCode: 'A&B',
    }, false, false).split('?')[1]);
    assert.equal(referral.get('referalCode'), 'A&B');
    assert.throws(() => helper.billingInitUrl({ ...nhis, claimscheckcode: null }, false, false), /NHIS/);
    assert.throws(() => helper.billingInitUrl({ ...types.defaultMultiBillingData, billingSource: 2 }, false, false), /billing entity/);
});

function harness({ advanced = false, api, billingContext = context, resume, query = '', selection = false, patientPage = false } = {}) {
    const states = [], effects = [], dependencies = [], cleanups = [];
    const calls = [], redirects = [];
    let cursor = 0, billingdata = { ...types.defaultMultiBillingData };
    const react = {
        ...React,
        useState(initial) {
            const index = cursor++;
            if (!(index in states)) states[index] = typeof initial === 'function' ? initial() : initial;
            return [states[index], next => { states[index] = typeof next === 'function' ? next(states[index]) : next; }];
        },
        useContext: () => ({
            billingdata,
            setBillingData: next => { billingdata = typeof next === 'function' ? next(billingdata) : next; },
            recalculateTotalBill() {},
        }),
        useEffect(effect, deps) {
            const index = cursor++;
            if (!dependencies[index] || deps.some((dep, i) => dep !== dependencies[index][i])) {
                dependencies[index] = deps;
                effects.push(() => { cleanups[index]?.(); cleanups[index] = effect(); });
            }
        },
    };
    const fetch = async url => {
        calls.push(url);
        if (api) return api(url);
        if (url.includes('mode-capability')) return { status: 'success', hasActiveStrategies: advanced };
        return { testList: [{ id: 50, testid: 50, name: 'FBC', price: 100 }], entityType: 'general', patientId: 101, billingSource: 1 };
    };
    const helper = workflow(fetch);
    const router = { replace: url => redirects.push(url), push: url => redirects.push(url) };
    const application = { tenantId: 397773, branchid: 4, user: { employeeid: 8, role: 'admin' } };
    const modal = Object.assign(() => null, { Header: 'header', Title: 'h2', Body: 'div', Footer: 'footer' });
    const card = Object.assign(() => null, { Header: 'header', Body: 'div' });
    const bootstrap = new Proxy({ Modal: modal, Card: card }, { get: (target, name) => target[name] || name });
    const mocks = name => {
        if (name === 'react') return react;
        if (name === 'next/navigation') return {
            useRouter: () => router, useParams: () => ({ patientid: 'encrypted', billingsourceid: '1' }), useSearchParams: () => new URLSearchParams(query),
        };
        if (name === 'react-bootstrap') return bootstrap;
        if (name === '@remixicon/react') return new Proxy({}, { get: (_, key) => key });
        if (name === 'react-toastify') return { toast: { error() {}, success() {} } };
        if (name.includes('customFetch')) return { customFetch: fetch };
        if (name.includes('useApplicationContext')) return { useApplication: () => application };
        if (name.includes('billingWorkflow')) return helper;
        if (name.includes('MultiTypes')) return types;
        if (name.includes('billingLib')) return { billingSource: [] };
        if (name.includes('BillingContextPropsContext')) return { BillingContextPropsProvider: 'props', useBillingContextProps: () => ({ billingContextProps: billingContext }) };
        if (name.includes('MultiBillingContext')) return { MultiBillingContext: {}, MultiBillingProvider: 'billing-provider' };
        if (name.includes('roles')) return { roleAllowed: () => true };
        if (name.includes('encryption')) return { plsDecryption: () => String(billingContext.patientid) };
        if (name.includes('suspendedBilling')) return { resumeSuspendedBilling: resume };
        return name;
    };
    const Component = load(patientPage
        ? path.join('app', 'billing', 'patientid', '[patientid]', 'multi', '[billingsourceid]', 'page.tsx')
        : selection
        ? path.join('app', 'billing', 'patientid', '[patientid]', 'multi', 'page.tsx')
        : path.join('components', 'Billing', 'Multi', 'MultBillingLayout.tsx'), mocks, {
        window: { location: { pathname: '/billing/patientid/encrypted/multi/1', search: '' }, history: { replaceState() {} } },
    }).default;
    return {
        calls, redirects, application, get data() { return plain(billingdata); },
        providerKey() { return Component({ billingContextProps: billingContext }).key; },
        render() {
            cursor = 0;
            if (selection || patientPage) return Component();
            const outer = Component({ billingContextProps: billingContext });
            return outer.props.children.props.children.type();
        },
        async flush() {
            effects.splice(0).forEach(effect => effect());
            for (let i = 0; i < 30; i++) await Promise.resolve();
        },
        unmount() { cleanups.forEach(cleanup => cleanup?.()); },
    };
}

test('registration/source-selection entry redirects General automatically and keeps query context', async () => {
    const h = harness({ selection: true, query: 'ispricingcheckout=1&adjustmentReason=A%26B' });
    h.render(); await h.flush();
    assert.equal(h.redirects.length, 1);
    assert.equal(new URLSearchParams(h.redirects[0].split('?')[1]).get('adjustmentReason'), 'A&B');
    assert.ok(h.redirects[0].includes('/multi/1?'));
});

test('multi-source facilities stay on source selection; configuration failures show Retry', async () => {
    const h = harness({ selection: true, advanced: true });
    h.render(); await h.flush();
    assert.deepEqual(h.redirects, []);
    assert.match(text(h.render()), /Select Billing Source/);
    const failed = harness({ selection: true, api: async () => ({ status: 'error' }) });
    failed.render(); await failed.flush();
    assert.deepEqual(failed.redirects, []);
    assert.match(text(failed.render()), /Retry/);
});

test('general-only billing preloads once with initialized patient, branch and employee, without creating a sale', async () => {
    const h = harness();
    h.render(); await h.flush();
    h.render(); await h.flush();
    assert.equal(h.calls.filter(url => url.startsWith('billing/multi/init?')).length, 1);
    const init = new URLSearchParams(h.calls[1].split('?')[1]);
    assert.equal(init.get('patientId'), '101');
    assert.equal(init.get('branchid'), '4');
    assert.equal(init.get('billingSource'), '1');
    assert.equal(h.data.employeeid, 8);
    assert.equal(h.data.testList[0].price, 100);
    assert.deepEqual(h.data.cart, []);
    assert.equal(nodes(h.render(), node => node.type?.includes?.('MultiBillingHeader'))[0].props.autoStarted, true);
    assert.equal(h.calls.some(url => !url.includes('mode-capability') && !url.startsWith('billing/multi/init?')), false);
});

test('General selected in an advanced facility still waits for the existing Start Transaction action', async () => {
    const h = harness({ advanced: true });
    h.render(); await h.flush();
    assert.equal(h.calls.length, 1);
    assert.equal(h.calls[0], 'billing/strategies/mode-capability');
    assert.deepEqual(h.data.testList, []);
});

test('catalog failure blocks the form, offers retry and recovers without navigating or resubmitting', async () => {
    let healthy = false;
    const h = harness({ api: async url => url.includes('mode-capability')
        ? { status: 'success', hasActiveStrategies: false }
        : healthy ? { testList: [{ id: 50, price: 123 }], entityType: 'general' }
            : { status: false, message: 'Sales session required' } });
    h.render(); await h.flush();
    const error = h.render();
    assert.match(text(error), /Sales session required/);
    assert.deepEqual(h.data.cart, []);
    healthy = true;
    nodes(error, node => node.type === 'Button')[0].props.onClick();
    await h.flush();
    assert.equal(h.data.testList[0].price, 123);
    assert.equal(h.redirects.length, 0);
});

test('empty catalog and failed configuration cannot become ready-to-bill defaults', async () => {
    for (const empty of [false, true]) {
        const h = harness({ api: async url => url.includes('mode-capability')
            ? empty ? { status: 'success', hasActiveStrategies: false } : { status: 'error' }
            : { testList: [] } });
        h.render(); await h.flush();
        assert.match(text(h.render()), /Retry/);
        assert.deepEqual(h.data.cart, []);
        assert.deepEqual(h.data.testList, []);
    }
});

test('unmounted billing ignores late catalog responses', async () => {
    let resolve;
    const h = harness({ api: async url => url.includes('mode-capability')
        ? { status: 'success', hasActiveStrategies: false }
        : new Promise(done => { resolve = done; }) });
    h.render(); await h.flush();
    h.unmount();
    resolve({ testList: [{ id: 50, price: 999 }] });
    await h.flush();
    assert.deepEqual(h.data.testList, []);
});

test('suspended drafts use their existing current-price restoration rather than General auto-init', async () => {
    const h = harness({
        billingContext: { ...context, suspendedDraftId: 7 },
        resume: async () => ({ billingdata: { ...types.defaultMultiBillingData, cart: [{ id: 50, price: 150 }] }, notes: 'Resume' }),
    });
    h.render(); await h.flush();
    assert.deepEqual(h.calls, []);
    assert.equal(h.data.cart[0].price, 150);
});

test('provider identity changes with the facility, branch or patient, preventing cross-context catalog reuse', () => {
    const billingContext = { ...context };
    const h = harness({ billingContext });
    let key = h.providerKey();
    h.application.tenantId = 654321;
    assert.notEqual(h.providerKey(), key);
    key = h.providerKey();
    h.application.branchid = 5;
    assert.notEqual(h.providerKey(), key);
    key = h.providerKey();
    billingContext.patientid = 102;
    assert.notEqual(h.providerKey(), key);
    key = h.providerKey();
    billingContext.entitytype = 'general';
    assert.equal(h.providerKey(), key, 'history updates after init must not remount and clear the cart');
});

test('optional organization and clinician referrals never switch the payer or reprice a General cart', () => {
    let data = { ...types.defaultMultiBillingData, billingSource: 1, entitytype: 'general', cart: [{ id: 50, price: 100 }] };
    const setBillingData = next => { data = typeof next === 'function' ? next(data) : next; };
    const modal = Object.assign(() => null, { Header: 'header', Title: 'h2', Body: 'div', Footer: 'footer' });
    const Component = load(path.join('components', 'Billing', 'Multi', 'RenderingBillingSourceFields.tsx'), name => {
        if (name === 'react') return {
            ...React, useContext: () => ({ billingdata: data, setBillingData }), useState: () => [false, () => {}],
        };
        if (name === 'react-bootstrap') return { Modal: modal, Button: 'button', Form: { Group: 'div', Label: 'label', Select: 'select' } };
        if (name.includes('MultiBillingContext')) return { MultiBillingContext: {} };
        if (name.includes('billingLib')) return { urgencyOptions: [] };
        return name;
    }).default;
    const props = { isClient: true };
    let tree = Component(props);
    nodes(tree, node => node.type?.includes?.('OrganizationBillingSearch'))[0].props.updatefunction({ id: 14, name: 'Referral lab' });
    tree = Component(props);
    nodes(tree, node => node.type?.includes?.('ClinicianFiltering'))[0].props.onSelect({ id: 8, name: 'Dr Example' });
    assert.equal(data.organizationId, 14);
    assert.equal(data.clinicianId, 8);
    assert.equal(data.billingSource, 1);
    assert.equal(data.entitytype, 'general');
    assert.equal(data.entityId, undefined);
    assert.equal(data.cart[0].price, 100);
    tree = Component(props);
    nodes(tree, node => node.type === 'button' && text(node) === 'Remove organization')[0].props.onClick();
    nodes(tree, node => node.type === 'button' && text(node) === 'Remove clinician')[0].props.onClick();
    assert.equal(data.organizationId, null);
    assert.equal(data.clinicianId, null);
    assert.equal(data.billingSource, 1);
});

test('patient validation must succeed before the billing form can initialize, with retry on failure', async () => {
    let healthy = false;
    const h = harness({ patientPage: true, api: async () => healthy
        ? { status: 'success', statusCode: 200, result: { patientid: 101 } }
        : { status: 'error', statusCode: 500 } });
    assert.match(text(h.render()), /Loading patient/);
    await h.flush();
    let tree = h.render();
    assert.equal(nodes(tree, node => node.type?.includes?.('MultBillingLayout')).length, 0);
    assert.match(text(tree), /Failed to fetch patient/);
    healthy = true;
    nodes(tree, node => node.type === 'Button')[0].props.onClick();
    h.render(); await h.flush();
    tree = h.render();
    const layout = nodes(tree, node => node.type?.includes?.('MultBillingLayout'))[0];
    assert.equal(layout.props.billingContextProps.patientid, 101);
    assert.equal(h.calls.every(url => url.startsWith('register/personalinformation?')), true);
});

test('General sales keep the existing submit endpoint, payer identifier, payment and referral fields', async () => {
    const calls = [];
    const helper = load(path.join('lib', 'Multi', 'multiBillingValidation.ts'), name => {
        if (name.includes('customFetch')) return { customPost: async (...args) => {
            calls.push(args);
            return { status: 'success', data: { billingid: 700 } };
        } };
        if (name === 'react-toastify') return { toast: { success() {} } };
        throw new Error(name);
    }, { console: { log() {} } });
    const result = await helper.MultiValidateAndSubmitBillingInformation({
        ...types.defaultMultiBillingData,
        patientid: 101, employeeid: 8, branchid: 4, billingSource: 1, entitytype: 'general',
        cart: [{ id: 50, testid: 50, price: 100 }], organizationId: 14, clinicianId: 8,
        finalCart: [{ id: 50, testid: 50, price: 100, paymentstatus: 'paid', paidamount: 100 }],
        subtotal: 100, amountPayable: 100, balance: 0, paid: 100,
        payments: [{ mode: 'cash', amount: 100 }],
    });
    assert.equal(result.status, 'success', JSON.stringify(result));
    const [endpoint, method, payload] = calls[0];
    assert.equal(endpoint, 'billing/multi/submit');
    assert.equal(method, 'POST');
    assert.equal(payload.billingSource, 1);
    assert.equal(payload.entitytype, 'general');
    assert.equal(payload.entityid, null);
    assert.equal(payload.patientid, 101);
    assert.equal(payload.organizationId, 14);
    assert.equal(payload.clinicianId, 8);
    assert.deepEqual(plain(payload.payments), [{ mode: 'cash', amount: 100 }]);
});
