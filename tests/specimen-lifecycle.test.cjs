const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');
const ts = require('typescript');
const React = require('react');

const root = path.join(__dirname, '..');
function load(file, mocks = require) {
    const compiled = ts.transpileModule(readFileSync(path.join(root, file), 'utf8'), {
        fileName: file, reportDiagnostics: true,
        compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
    });
    assert.deepEqual(compiled.diagnostics, []);
    const exports = {};
    vm.runInNewContext(compiled.outputText, {
        exports, require: mocks, console, URLSearchParams, Map, Date,
        crypto: { randomUUID: () => 'request-key' },
    });
    return exports;
}
const helper = load('lib/specimenLifecycle.ts');
const base = () => ({
    sample: { id: 12, sample_uid: 'SP-12', barcode: 'SP-12', version: 3, status: 'accepted', storage_state: 'available', remaining_quantity: '5.00', unit: 'mL' },
    parent: null, aliquots: [], storagePosition: null, events: [],
    capabilities: { canAliquot: true, canStore: true, canRetrieve: false, canSetRetention: true, canDispose: true, canManageLocations: false, canOverrideRetention: false },
});
const plain = value => JSON.parse(JSON.stringify(value));

test('aliquot requests preserve the parent version and validate real remaining quantity', () => {
    const form = { ...helper.emptyLifecycleForm(), quantity: '1.25', notes: '  Repeat analysis  ' };
    const request = helper.lifecycleMutation(base(), 'aliquot', form, 1);
    assert.deepEqual(plain(request), { endpoint: 'physical-samples/12/aliquots', method: 'POST', body: { expectedVersion: 3, quantity: 1.25, notes: 'Repeat analysis' } });
    for (const quantity of ['0', '-1', '6', '1.234', '1e2', '']) {
        assert.throws(() => helper.lifecycleMutation(base(), 'aliquot', { ...form, quantity }, 1));
    }
    assert.throws(() => helper.lifecycleMutation({ ...base(), sample: { ...base().sample, remaining_quantity: null } }, 'aliquot', form, 1));
});

test('actions follow server capabilities and disposed specimens have no mutations', () => {
    assert.deepEqual(plain(helper.availableLifecycleActions({ ...base(), capabilities: {} })), []);
    const disposed = { ...base(), sample: { ...base().sample, storage_state: 'disposed' } };
    assert.deepEqual(plain(helper.availableLifecycleActions(disposed)), []);
    assert.throws(() => helper.lifecycleMutation(disposed, 'dispose', helper.emptyLifecycleForm(), 1), /no longer available/);
    assert.throws(() => helper.lifecycleMutation(base(), 'retrieve', { ...helper.emptyLifecycleForm(), reason: 'Retest' }, 1), /no longer available/);
});

test('storage selection excludes occupied and inactive positions', () => {
    const positions = [
        { id: 1, is_active: 1, sample_id: null, freezer: 'F1', rack: 'R1', position: 'A1' },
        { id: 2, is_active: 1, sample_id: 20 }, { id: 3, is_active: 0, sample_id: null },
    ];
    assert.deepEqual(plain(helper.freeStoragePositions(positions)).map(item => item.id), [1]);
    assert.equal(helper.storageLabel(positions[0]), 'F1 / R1 / A1');
    const request = helper.lifecycleMutation(base(), 'store', { ...helper.emptyLifecycleForm(), positionId: '1' }, 1);
    assert.deepEqual(plain(request), { endpoint: 'physical-samples/12/storage', method: 'POST', body: { expectedVersion: 3, positionId: 1 } });
});

test('retention converts operator local time to UTC and validates a future deadline', () => {
    const form = { ...helper.emptyLifecycleForm(), reason: 'Required by policy', retentionMode: 'date', retentionUntil: '2030-04-10T13:30' };
    const request = helper.lifecycleMutation(base(), 'retention', form, 1, new Date('2029-01-01').getTime());
    assert.equal(request.method, 'PUT');
    assert.equal(request.body.retentionUntil, new Date(2030, 3, 10, 13, 30).toISOString());
    assert.equal(request.body.reason, 'Required by policy');
    assert.throws(() => helper.lifecycleMutation(base(), 'retention', form, 1, new Date('2031-01-01').getTime()), /future/);
    assert.throws(() => helper.localRetentionToIso('2030-04-10T13:30Z'), /valid/);
    assert.throws(() => helper.localRetentionToIso('2030-02-31T13:30'), /valid/);
    assert.throws(() => helper.lifecycleMutation(base(), 'retention', { ...form, retentionMode: 'days', retentionDays: '1.5' }, 1), /whole days/);
});

test('scientific staff can extend retention while shortening requires a manager or administrator', () => {
    const detail = { ...base(), sample: { ...base().sample, retention_until: '2030-01-01T00:00:00Z' } };
    const form = { ...helper.emptyLifecycleForm(), reason: 'Policy review', retentionMode: 'date', retentionUntil: '2029-04-10T13:30' };
    const now = new Date('2028-01-01').getTime();
    assert.throws(() => helper.lifecycleMutation(detail, 'retention', form, 1, now), /shorten/);
    const privileged = { ...detail, capabilities: { ...detail.capabilities, canOverrideRetention: true } };
    assert.ok(helper.lifecycleMutation(privileged, 'retention', form, 1, now));
    assert.ok(helper.lifecycleMutation(detail, 'retention', { ...form, retentionUntil: '2031-04-10T13:30' }, 1, now));
});

test('disposal requires a different witness, attestation, irreversible confirmation and authorized retention override', () => {
    const now = new Date('2028-01-01').getTime();
    const detail = { ...base(), sample: { ...base().sample, retention_until: '2029-01-01T00:00:00Z' } };
    const form = { ...helper.emptyLifecycleForm(), method: 'Incineration', reason: 'Contaminated container', witnessEmployeeId: '2', witnessed: true, confirmDisposal: true };
    assert.throws(() => helper.lifecycleMutation(detail, 'dispose', form, 1, now), /Retention has not expired/);
    const privileged = { ...detail, capabilities: { ...detail.capabilities, canOverrideRetention: true } };
    assert.throws(() => helper.lifecycleMutation(privileged, 'dispose', form, 1, now), /explicitly authorize/);
    const approved = { ...form, overrideRetention: true };
    const request = helper.lifecycleMutation(privileged, 'dispose', approved, 1, now);
    assert.deepEqual(plain(request.body), { expectedVersion: 3, overrideRetention: true, method: 'Incineration', reason: 'Contaminated container', witnessEmployeeId: 2 });
    assert.throws(() => helper.lifecycleMutation(privileged, 'dispose', { ...approved, witnessEmployeeId: '1' }, 1, now), /different/);
    assert.throws(() => helper.lifecycleMutation(privileged, 'dispose', { ...approved, witnessed: false }, 1, now), /Confirm/);
    assert.throws(() => helper.lifecycleMutation(privileged, 'dispose', { ...approved, confirmDisposal: false }, 1, now), /Confirm/);
});

test('network retries reuse one idempotency key for the same version and payload', () => {
    const keys = new Map();
    let calls = 0;
    const create = () => `key-${++calls}`;
    assert.equal(helper.requestIdempotencyKey(keys, 'same-payload', create), 'key-1');
    assert.equal(helper.requestIdempotencyKey(keys, 'same-payload', create), 'key-1');
    assert.equal(helper.requestIdempotencyKey(keys, 'changed-payload', create), 'key-2');
    keys.delete('same-payload');
    assert.equal(helper.requestIdempotencyKey(keys, 'same-payload', create), 'key-3');
});

const nodes = (tree, predicate) => tree == null || typeof tree !== 'object' ? [] : Array.isArray(tree)
    ? tree.flatMap(child => nodes(child, predicate))
    : [...(predicate(tree) ? [tree] : []), ...nodes(tree.props?.children, predicate)];
const text = tree => tree == null ? '' : typeof tree !== 'object' ? String(tree) : Array.isArray(tree) ? tree.map(text).join('') : text(tree.props?.children);

function harness(detail = base(), failFirstMutation = false, options = {}) {
    const state = [];
    const locationState = [];
    let activeState = state;
    let positions = options.positions || [{ id: 9, freezer: 'F1', rack: 'R1', position: 'A1', is_active: 1, sample_id: null }];
    const effects = [];
    const calls = [];
    let cursor = 0;
    let mounted = false;
    let mutations = 0;
    const noop = () => null;
    const Modal = Object.assign(noop, { Header: 'header', Title: 'h2', Body: 'section', Footer: 'footer' });
    const component = load('components/phelobotomy/SpecimenLifecycleWorkspace.tsx', name => {
        if (name === 'react/jsx-runtime') return require(name);
        if (name === 'react') return {
            ...React,
            useState: initial => {
                const key = cursor++;
                const hookState = activeState;
                if (!(key in hookState)) hookState[key] = typeof initial === 'function' ? initial() : initial;
                return [hookState[key], next => { hookState[key] = typeof next === 'function' ? next(hookState[key]) : next; }];
            },
            useRef: initial => { const key = cursor++; if (!(key in state)) state[key] = { current: initial }; return state[key]; },
            useCallback: callback => callback,
            useEffect: callback => { if (!mounted) effects.push(callback); },
        };
        if (name.endsWith('/specimenLifecycle')) return helper;
        if (name.endsWith('/useApplicationContext')) return { useApplicationSettings: () => ({ applicationsettings: { user: { role: options.role || 'scientist', employeeid: 1 } } }) };
        if (name.endsWith('/customFetch')) return {
            customFetch: async endpoint => {
                calls.push(['GET', endpoint]);
                if (endpoint.includes('/lifecycle/worklist')) return { success: true, data: { items: [detail.sample], pagination: { page: 1, count: 25, total: 1, totalPages: 1 } } };
                if (endpoint.endsWith('/storage/positions')) return options.positionsError ? { success: false, message: options.positionsError } : { success: true, data: positions };
                return { success: true, data: detail };
            },
            customFetchMutation: async (endpoint, method, body) => {
                calls.push([method, endpoint, plain(body)]);
                if (endpoint.endsWith('/storage/positions')) {
                    const position = { id: 10, freezer: body.freezer, rack: body.rack, position: body.position, is_active: 1, sample_id: null };
                    positions = [...positions, position];
                    return { success: true, data: position };
                }
                if (failFirstMutation && mutations++ === 0) throw new Error('Network interrupted');
                return { success: true, data: { ...detail, sample: { ...detail.sample, version: 4, remaining_quantity: 4 }, aliquots: [{ ...detail.sample, id: 13, barcode: 'SP-13', sample_uid: 'SP-13', remaining_quantity: 1 }] } };
            },
        };
        if (name === 'react-bootstrap') return { Modal, Spinner: noop };
        if (name === 'react-toastify') return { toast: { success: noop, error: noop } };
        return new Proxy({ __esModule: true, default: noop }, { get: (target, key) => key in target ? target[key] : noop });
    }).default;
    const render = () => { cursor = 0; activeState = state; return component({ initialSampleId: options.initialSampleId === null ? undefined : 12, initialAction: options.initialAction }); };
    return {
        calls, render,
        locations: tree => {
            const element = nodes(tree, node => typeof node.type === 'function' && typeof node.props?.onCreated === 'function')[0];
            assert.ok(element, 'Missing storage configuration');
            cursor = 0;
            activeState = locationState;
            const result = element.type(element.props);
            activeState = state;
            return result;
        },
        mount: async () => { render(); mounted = true; effects.forEach(effect => effect()); await new Promise(resolve => setImmediate(resolve)); },
        click: (tree, label) => { const button = nodes(tree, node => node.type === 'button' && text(node) === label)[0]; assert.ok(button, `Missing button ${label}`); return button.props.onClick(); },
        change: (tree, id, value) => { const input = nodes(tree, node => node.props?.id === id)[0]; assert.ok(input, `Missing input ${id}`); input.props.onChange({ target: { value } }); },
    };
}

test('workspace loads actual tenant-aware endpoints, opens a selected sample and respects capabilities', async () => {
    const view = harness();
    await view.mount();
    const tree = view.render();
    assert.match(text(tree), /SP-12/);
    assert.ok(view.calls.some(([method, endpoint]) => method === 'GET' && endpoint === 'physical-samples/12/lifecycle'));
    assert.ok(view.calls.some(([, endpoint]) => endpoint.includes('physical-samples/lifecycle/worklist?')));
    assert.equal(nodes(tree, node => node.type === 'button' && text(node) === 'Retrieve specimen').length, 0);
    assert.equal(nodes(tree, node => node.type === 'button' && text(node) === 'Create aliquot').length, 1);
});

test('workspace preserves a failed mutation for safe retry and renders its returned aliquot', async () => {
    const view = harness(base(), true);
    await view.mount();
    view.click(view.render(), 'Create aliquot');
    view.change(view.render(), 'aliquot-quantity', '1');
    const submit = tree => nodes(tree, node => node.type === 'form' && text(node).includes('Aliquot quantity'))[0].props.onSubmit({ preventDefault() {} });
    await submit(view.render());
    assert.match(text(view.render()), /Network interrupted/);
    await submit(view.render());
    const requests = view.calls.filter(([method]) => method === 'POST');
    assert.equal(requests.length, 2);
    assert.equal(requests[0][1], 'physical-samples/12/aliquots');
    assert.deepEqual(requests[0][2], { expectedVersion: 3, quantity: 1, idempotencyKey: 'request-key' });
    assert.deepEqual(requests[1][2], requests[0][2]);
    assert.match(text(view.render()), /SP-13/);
    assert.match(text(view.render()), /Open aliquot/);
});

test('Store sample opens the position selector directly and remains bounded by server capabilities', async () => {
    const view = harness(base(), false, { initialSampleId: null });
    await view.mount();
    await view.click(view.render(), 'Store sample');
    assert.equal(nodes(view.render(), node => node.props?.id === 'specimen-position').length, 1);
    const denied = { ...base(), capabilities: { ...base().capabilities, canStore: false } };
    const unauthorized = harness(denied, false, { initialAction: 'store' });
    await unauthorized.mount();
    assert.equal(nodes(unauthorized.render(), node => node.props?.id === 'specimen-position').length, 0);
});

test('an empty storage list explains setup and disables storage until a real position exists', async () => {
    const view = harness(base(), false, { positions: [], initialAction: 'store' });
    await view.mount();
    const tree = view.render();
    assert.match(text(tree), /0 available storage positions/);
    assert.match(text(tree), /Ask an administrator or manager/);
    const selector = nodes(tree, node => node.props?.id === 'specimen-position')[0];
    assert.equal(selector.props.disabled, true);
    assert.match(text(selector), /No available storage positions/);
    const form = nodes(tree, node => node.type === 'form' && nodes(node, item => item.props?.id === 'specimen-position').length)[0];
    assert.equal(nodes(form, node => node.type === 'button' && text(node) === 'Save')[0].props.disabled, true);
    assert.equal(nodes(tree, node => node.type === 'button' && text(node) === 'Add storage position').length, 0);
});

test('storage lookup errors remain visible inside the store form and are not presented as setup state', async () => {
    const view = harness(base(), false, { positionsError: 'Storage service unavailable', initialAction: 'store' });
    await view.mount();
    const tree = view.render();
    assert.match(text(tree), /Storage availability could not be loaded/);
    const form = nodes(tree, node => node.type === 'form' && nodes(node, item => item.props?.id === 'specimen-position').length)[0];
    assert.match(text(form), /Storage service unavailable/);
    assert.match(text(form), /Retry the lookup/);
});

test('administrators can create a position from the store form and return with it selected without stacked dialogs', async () => {
    const view = harness(base(), false, { positions: [], role: 'manager', initialAction: 'store' });
    await view.mount();
    let tree = view.render();
    const storeForm = nodes(tree, node => node.type === 'form' && nodes(node, item => item.props?.id === 'specimen-position').length)[0];
    view.click(storeForm, 'Add storage position');
    tree = view.render();
    assert.equal(nodes(tree, node => node.props?.size === 'xl')[0].props.show, false);
    let config = view.locations(tree);
    assert.equal(config.props.show, true);
    view.click(config, 'Return to specimen');
    assert.equal(nodes(view.render(), node => node.props?.size === 'xl')[0].props.show, true);
    assert.equal(nodes(view.render(), node => node.props?.id === 'specimen-position').length, 1);
    view.click(storeForm, 'Add storage position');
    for (const [id, value] of [['storage-freezer', 'Freezer 2'], ['storage-rack', 'Rack B'], ['storage-position', 'B03']]) {
        view.change(view.locations(view.render()), id, value);
    }
    config = view.locations(view.render());
    await nodes(config, node => node.type === 'form')[0].props.onSubmit({ preventDefault() {} });
    tree = view.render();
    assert.equal(nodes(tree, node => node.props?.size === 'xl')[0].props.show, true);
    assert.equal(view.locations(tree).props.show, false);
    const selector = nodes(tree, node => node.props?.id === 'specimen-position')[0];
    assert.equal(selector.props.value, '10');
    assert.match(text(selector), /Freezer 2 \/ Rack B \/ B03/);
    const store = nodes(tree, node => node.type === 'form' && nodes(node, item => item.props?.id === 'specimen-position').length)[0];
    await store.props.onSubmit({ preventDefault() {} });
    const request = view.calls.find(([method, endpoint]) => method === 'POST' && endpoint === 'physical-samples/12/storage');
    assert.equal(request[2].positionId, 10);
});

test('history list and table toggle remain functional after storage navigation changes', async () => {
    const detail = { ...base(), events: [{ id: 1, event_type: 'stored', actor_name: 'Scientist', created_at: '2028-01-01', reason: 'Retention', metadata: { freezer: 'F1', rack: 'R1' } }] };
    const view = harness(detail);
    await view.mount();
    assert.equal(nodes(view.render(), node => node.type === 'ol').length, 1);
    view.click(view.render(), 'Table');
    const table = nodes(view.render(), node => node.type === 'table' && node.props?.['aria-labelledby'] === 'specimen-history-heading')[0];
    assert.ok(table);
    assert.match(text(table), /Scientist/);
    assert.match(text(table), /Retention/);
    view.click(view.render(), 'List');
    assert.equal(nodes(view.render(), node => node.type === 'ol').length, 1);
});

for (const status of ['collected', 'received']) test(`${status} containers have a direct storage action while aliquots remain governed by capabilities`, async () => {
    const detail = { ...base(), sample: { ...base().sample, status }, capabilities: { ...base().capabilities, canAliquot: false } };
    const view = harness(detail, false, { initialSampleId: null });
    await view.mount();
    await view.click(view.render(), 'Store sample');
    assert.equal(nodes(view.render(), node => node.props?.id === 'specimen-position').length, 1);
    assert.equal(nodes(view.render(), node => node.type === 'button' && text(node) === 'Create aliquot').length, 0);
});

function workflowHarness(file, props, samples, role = 'scientist') {
    const states = [];
    const effects = [];
    const calls = [];
    let index = 0;
    let mounted = false;
    let records = samples.map(sample => ({ ...sample, tests: sample.tests || [{ ascensionId: sample.id, testName: 'Test' }] }));
    const noop = () => null;
    const Modal = Object.assign(noop, { Header: 'header', Title: 'h2', Body: 'section', Footer: 'footer' });
    const component = load(file, name => {
        if (name === 'react/jsx-runtime') return require(name);
        if (name === 'react') return {
            ...React,
            useState: initial => {
                const key = index++;
                if (!(key in states)) states[key] = typeof initial === 'function' ? initial() : initial;
                return [states[key], next => { states[key] = typeof next === 'function' ? next(states[key]) : next; }];
            },
            useCallback: callback => callback,
            useEffect: callback => { if (!mounted) effects.push(callback); },
        };
        if (name.endsWith('/useApplicationContext')) return { useApplicationSettings: () => ({ applicationsettings: { user: { role } } }) };
        if (name.endsWith('/roles')) return load('components/Auth/roles.ts');
        if (name.endsWith('/customFetch')) return {
            customFetch: async endpoint => {
                calls.push(['GET', endpoint]);
                return { success: true, data: endpoint.includes('/candidates?') ? { samples: records, groups: [] } : { summary: {}, items: records, pagination: { page: 1, count: 10, total: records.length, totalPages: 1 } } };
            },
            customFetchMutation: async (endpoint, method, body) => {
                calls.push([method, endpoint, body]);
                records = records.map(sample => endpoint === `physical-samples/${sample.id}/status` ? { ...sample, status: body.status, version: sample.version + 1 } : sample);
                return { success: true };
            },
        };
        if (name === 'react-bootstrap') return { Modal, Spinner: noop };
        if (name === 'react-toastify') return { toast: { success: noop, error: noop } };
        return new Proxy({ __esModule: true, default: noop }, { get: (target, key) => key in target ? target[key] : noop });
    }).default;
    const render = () => { index = 0; return component(props); };
    return { calls, render, mount: async () => { render(); mounted = true; effects.forEach(effect => effect()); await new Promise(resolve => setImmediate(resolve)); } };
}

test('sample summary offers direct storage for real collected, received and accepted containers only', async () => {
    const records = ['collected', 'received', 'accepted', 'rejected', 'planned'].map((status, index) => ({ ...base().sample, id: index + 1, status }));
    records.push({ ...base().sample, id: 99, storage_state: 'disposed' });
    const view = workflowHarness('components/phelobotomy/SampleReportsWorkspace.tsx', { mode: 'samples' }, records);
    await view.mount();
    const links = nodes(view.render(), node => typeof node.props?.href === 'string' && node.props.href.includes('&action=store'));
    assert.deepEqual(links.map(link => link.props.href), [1, 2, 3].map(id => `/operations/phelobotomy/specimen-storage?sampleId=${id}&action=store`));
    assert.equal(view.calls.some(([method]) => method !== 'GET'), false, 'Opening the report must not accept samples');
});

test('validation keeps accepted container storage reachable alongside remaining decisions', async () => {
    const samples = [{ ...base().sample, status: 'received' }, { ...base().sample, id: 13, sample_uid: 'SP-13', status: 'collected' }];
    const view = workflowHarness('components/accessories/SampleAssessmentModal/SampleAssessmentModal.tsx', { show: true, hide() {}, billingid: 3 }, samples);
    await view.mount();
    let tree = view.render();
    assert.equal(nodes(tree, node => typeof node.props?.href === 'string' && node.props.href.includes('&action=store')).length, 2);
    await nodes(tree, node => node.type === 'button' && text(node).includes('Accept container'))[0].props.onClick();
    tree = view.render();
    assert.match(text(tree), /Accepted containers/);
    assert.ok(nodes(tree, node => node.props?.href === '/operations/phelobotomy/specimen-storage?sampleId=12&action=store').length);
    assert.equal(nodes(tree, node => node.type === 'button' && text(node).includes('Accept container')).length, 1);
    assert.equal(view.calls.filter(([method]) => method === 'PATCH').length, 1);
});

test('sample storage shortcuts are hidden from roles that cannot handle specimens', async () => {
    for (const [file, props] of [
        ['components/phelobotomy/SampleReportsWorkspace.tsx', { mode: 'samples' }],
        ['components/accessories/SampleAssessmentModal/SampleAssessmentModal.tsx', { show: true, hide() {}, billingid: 3 }],
    ]) {
        const view = workflowHarness(file, props, [base().sample], 'accountant');
        await view.mount();
        assert.equal(nodes(view.render(), node => typeof node.props?.href === 'string' && node.props.href.includes('&action=store')).length, 0);
    }
});

test('disposed detail is read-only while preserving history', async () => {
    const detail = { ...base(), sample: { ...base().sample, storage_state: 'disposed' }, events: [{ id: 1, event_type: 'disposed', actor_name: 'Scientist', created_at: '2028-01-01', metadata: '{"method":"Incineration","witnessEmployeeId":2}' }] };
    const view = harness(detail);
    await view.mount();
    const tree = view.render();
    assert.match(text(tree), /record and history remain available/);
    assert.match(text(tree), /Incineration/);
    assert.match(text(tree), /witness Employee Id: 2/);
    assert.equal(nodes(tree, node => node.type === 'button' && text(node) === 'Document disposal').length, 0);
});

test('sample summary and both laboratory navigation contexts link to the real storage page', async () => {
    const destination = '/operations/phelobotomy/specimen-storage';
    for (const file of ['components/Layout/links/categories/PhlebotomyLinks.tsx', 'components/Layout/links/categories/LaboratoryOperationsLinks.tsx']) {
        const exports = load(file, name => name === 'react/jsx-runtime' ? require(name) : new Proxy({}, { get: () => () => null }));
        const links = Object.values(exports)[0];
        const flatten = items => items.flatMap(item => [item, ...flatten(item.children || [])]);
        assert.ok(flatten(links).some(item => item.link === destination));
    }
    const summary = readFileSync(path.join(root, 'components/phelobotomy/SampleReportsWorkspace.tsx'), 'utf8');
    assert.ok(summary.includes(`${destination}?sampleId=`));
    const page = load('app/operations/phelobotomy/specimen-storage/page.tsx', name => name === 'react/jsx-runtime' ? require(name) : { __esModule: true, default: () => null });
    assert.equal((await page.default({ searchParams: Promise.resolve({ sampleId: '12' }) })).props.initialSampleId, 12);
    assert.equal((await page.default({ searchParams: Promise.resolve({ sampleId: '-1' }) })).props.initialSampleId, undefined);
    assert.equal((await page.default({ searchParams: Promise.resolve({ sampleId: '12', action: 'store' }) })).props.initialAction, 'store');
    assert.equal((await page.default({ searchParams: Promise.resolve({ sampleId: '12', action: 'dispose' }) })).props.initialAction, undefined);
});
