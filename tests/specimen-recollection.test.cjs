const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');
const ts = require('typescript');
const React = require('react');
function load(file, mocks, crypto = { randomUUID: () => 'completion-key' }) {
    const compiled = ts.transpileModule(readFileSync(path.join(__dirname, '..', file), 'utf8'), {
        fileName: file, reportDiagnostics: true,
        compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
    });
    assert.deepEqual(compiled.diagnostics, []);
    const exports = {};
    vm.runInNewContext(compiled.outputText, { exports, console, Date, crypto, require: name => name === 'react/jsx-runtime' ? require(name) : mocks(name) });
    return exports.default;
}
const nodes = (tree, predicate) => tree == null || typeof tree !== 'object' ? [] : Array.isArray(tree) ? tree.flatMap(child => nodes(child, predicate)) : [...(predicate(tree) ? [tree] : []), ...nodes(tree.props?.children, predicate)];
const text = tree => tree == null ? '' : typeof tree !== 'object' ? String(tree) : Array.isArray(tree) ? tree.map(text).join('') : text(tree.props?.children);
const original = { id: 10, sample_uid: 'ORIGINAL-10', status: 'rejected', version: 2, rejection_reason: 'Haemolysed', tests: [{ ascensionId: 101, testName: 'FBC' }] };
const replacement = { id: 11, sample_uid: 'REPLACEMENT-11', status: 'collection_started', version: 1, replaces_sample_id: 10, tests: original.tests };
function harness(records = [original], options = {}) {
    let samples = records.map(sample => ({ ...sample }));
    let cursor = 0;
    const states = [], effects = [], calls = [], messages = [], effectState = [], callbacks = [];
    const sameDependencies = (left, right) => left && right && left.length === right.length && left.every((value, index) => Object.is(value, right[index]));
    const props = { billingid: 3, ...options.props };
    if (!options.fetchSamples) props.samples = records;
    const component = load('components/phelobotomy/SpecimenRecollectionPanel.tsx', name => {
        if (name === 'react') return { ...React, useState: initial => {
            const key = cursor++;
            if (!(key in states)) states[key] = typeof initial === 'function' ? initial() : initial;
            return [states[key], next => { states[key] = typeof next === 'function' ? next(states[key]) : next; }];
        }, useRef: initial => { const key = cursor++; if (!(key in states)) states[key] = { current: initial }; return states[key]; },
        useCallback: (fn, deps) => { const key = cursor++; if (!sameDependencies(callbacks[key]?.deps, deps)) callbacks[key] = { fn, deps }; return callbacks[key].fn; },
        useEffect: (fn, deps) => { const key = cursor++; if (!sameDependencies(effectState[key]?.deps, deps)) effects.push({ key, fn, deps }); } };
        if (name.endsWith('/useApplicationContext')) return { useApplicationSettings: () => ({ applicationsettings: { user: { role: options.role || 'scientist' } } }) };
        if (name.endsWith('/roles')) return { roleAllowed: (role, allowed) => allowed.includes(role) };
        if (name === 'react-toastify') return { toast: { success: message => messages.push(message), error: message => messages.push(message) } };
        if (name.endsWith('/customFetch')) return {
            customFetch: async endpoint => {
                calls.push(['GET', endpoint]);
                if (options.fetchOverride) { const result = options.fetchOverride(endpoint); if (result !== undefined) return result; }
                if (options.error) return { success: false, message: options.error };
                if (endpoint.includes('/candidates?')) return { success: true, data: { samples } };
                return { success: true, data: { ...original, lineage: samples, events: [
                    { id: 1, sample_uid: original.sample_uid, event_type: 'collected', created_at: '2026-01-01T10:00:00Z', actor_name: 'Collector' },
                    { id: 2, sample_uid: original.sample_uid, event_type: 'rejected', created_at: '2026-01-01T11:00:00Z', actor_name: 'Scientist', reason: 'Haemolysed' },
                    { id: 3, sample_uid: replacement.sample_uid, event_type: 'recollection_started', created_at: '2026-01-01T12:00:00Z', actor_name: 'Collector' },
                ], communications: [{ id: 1, sample_uid: original.sample_uid, requested_channels: '["sms","email"]', status: 'partial', message: 'Please return for recollection.', attempts: [{ id: 1, channel: 'sms', status: 'sent' }, { id: 2, channel: 'email', status: 'failed', failure_reason: 'Invalid address' }] }] } };
            },
            customFetchMutation: async (endpoint, method, body) => {
                calls.push([method, endpoint, JSON.parse(JSON.stringify(body))]);
                if (options.mutationError) return { success: false, message: options.mutationError };
                if (endpoint.endsWith('/recollect')) { if (!samples.some(sample => sample.id === 11)) samples.push({ ...replacement }); return { success: true, data: replacement }; }
                samples = samples.map(sample => sample.id === 11 ? { ...sample, status: body.status, version: sample.version + 1 } : sample);
                return { success: true, data: samples.find(sample => sample.id === 11) };
            },
        };
        throw new Error(name);
    }, options.crypto);
    const render = () => { cursor = 0; return component(props); };
    const click = async label => {
        const button = nodes(render(), node => node.type === 'button' && text(node) === label)[0];
        assert.ok(button, `Missing button ${label}`);
        assert.equal(Boolean(button.props.disabled), false);
        await button.props.onClick();
    };
    const flush = async () => {
        for (const effect of effects.splice(0)) { effectState[effect.key]?.cleanup?.(); effectState[effect.key] = { deps: effect.deps, cleanup: effect.fn() }; }
        await new Promise(resolve => setImmediate(resolve));
    };
    return { render, click, calls, messages, mount: async () => { render(); await flush(); }, updateProps: async next => { Object.assign(props, next); render(); await flush(); }, unmount: () => { effectState.forEach(effect => effect?.cleanup?.()); } };
}

test('a rejected sample starts a separate replacement and only explicit completion records its collection', async () => {
    const view = harness(); await view.mount();
    assert.match(text(view.render()), /Rejection reason: Haemolysed/);
    await view.click('Recollect sample');
    assert.match(text(view.render()), /Replacement: REPLACEMENT-11/);
    assert.equal(view.calls.filter(([method]) => method === 'PATCH').length, 0);
    assert.equal(nodes(view.render(), node => node.type === 'button' && text(node) === 'Recollect sample').length, 0);
    await view.click('Complete recollection');
    assert.deepEqual(view.calls.find(([method]) => method === 'PATCH'), ['PATCH', 'physical-samples/11/status', { status: 'collected', expectedVersion: 1, idempotencyKey: 'completion-key' }]);
    assert.match(text(view.render()), /collected/);
    assert.equal(view.calls.some(([, , body]) => body?.status === 'accepted'), false);
    assert.match(view.messages.at(-1), /validation are still required/);
});
test('existing replacement is resumed without offering a second recollection from its original', async () => {
    const view = harness([original, replacement]); await view.mount();
    assert.equal(nodes(view.render(), node => node.type === 'button' && text(node) === 'Recollect sample').length, 0);
    assert.equal(nodes(view.render(), node => node.type === 'button' && text(node) === 'Complete recollection').length, 1);
    assert.equal(view.calls.filter(([method]) => method !== 'GET').length, 0);
});
test('history traces both sample IDs and shows selected notification channels with delivery outcomes', async () => {
    const view = harness([original, replacement]); await view.mount(); await view.click('History & notifications');
    const tree = nodes(view.render(), node => node.props?.['aria-label'] === 'Recollection history')[0];
    assert.match(text(tree), /ORIGINAL-10/); assert.match(text(tree), /REPLACEMENT-11/);
    assert.match(text(tree), /collected/); assert.match(text(tree), /rejected/); assert.match(text(tree), /recollection started/);
    assert.match(text(tree), /sms, email/); assert.match(text(tree), /sms: sent/); assert.match(text(tree), /email: failed/); assert.match(text(tree), /Invalid address/);
});
test('recollection is restricted to authorized staff and never appears for a collected sample', async () => {
    for (const [samples, options] of [[[original], { role: 'accountant' }], [[{ ...original, status: 'collected' }], {}]]) {
        const view = harness(samples, options); await view.mount();
        assert.equal(nodes(view.render(), node => node.type === 'button' && ['Recollect sample', 'Complete recollection'].includes(text(node))).length, 0);
    }
});
test('selected-test recollection excludes unrelated samples in the same billing', async () => {
    const view = harness([original, { ...original, id: 99, sample_uid: 'OTHER', tests: [{ ascensionId: 202 }] }], { props: { ascensionId: 101 } }); await view.mount();
    assert.match(text(view.render()), /ORIGINAL-10/); assert.doesNotMatch(text(view.render()), /OTHER/);
});
test('a failed read is visible and a failed mutation leaves the rejection and retry action intact', async () => {
    const read = harness([], { fetchSamples: true, error: 'Server unavailable' }); await read.mount(); assert.match(text(read.render()), /Server unavailable/);
    const mutation = harness([original], { mutationError: 'Version changed' }); await mutation.mount(); await mutation.click('Recollect sample');
    assert.match(text(mutation.render()), /Haemolysed/); assert.match(mutation.messages.at(-1), /Version changed/);
    assert.equal(nodes(mutation.render(), node => node.type === 'button' && text(node) === 'Recollect sample').length, 1);
});
test('a slow history response cannot reveal the previous patient after the selection changes', async () => {
    let finishHistory;
    const oldHistory = new Promise(resolve => { finishHistory = resolve; });
    const view = harness([original], { fetchOverride: endpoint => endpoint.includes('/worklists/samples/') ? oldHistory : undefined });
    await view.mount(); const pending = view.click('History & notifications');
    const next = { ...original, id: 99, sample_uid: 'NEXT-PATIENT', tests: [{ ascensionId: 202 }] };
    await view.updateProps({ billingid: 9, ascensionId: 202, samples: [next] });
    finishHistory({ success: true, data: { ...original, events: [], communications: [] } }); await pending;
    assert.match(text(view.render()), /NEXT-PATIENT/); assert.doesNotMatch(text(view.render()), /ORIGINAL-10/);
    assert.equal(nodes(view.render(), node => node.props?.['aria-label'] === 'Recollection history').length, 0);
});
test('a slow worklist response cannot replace the new patient specimens', async () => {
    let finishFirst;
    const firstRequest = new Promise(resolve => { finishFirst = resolve; });
    const next = { ...original, id: 99, sample_uid: 'NEXT-PATIENT', tests: [{ ascensionId: 202 }] };
    const view = harness([], { fetchSamples: true, fetchOverride: endpoint => endpoint.endsWith('billingid=3') ? firstRequest : { success: true, data: { samples: [next] } } });
    await view.mount(); await view.updateProps({ billingid: 9, ascensionId: 202 });
    finishFirst({ success: true, data: { samples: [original] } }); await new Promise(resolve => setImmediate(resolve));
    assert.match(text(view.render()), /NEXT-PATIENT/); assert.doesNotMatch(text(view.render()), /ORIGINAL-10/);
});
test('a recollection action invalidates an older history read', async () => {
    let finishHistory;
    const delayed = new Promise(resolve => { finishHistory = resolve; });
    const view = harness([original], { fetchOverride: endpoint => endpoint.includes('/worklists/samples/') ? delayed : undefined });
    await view.mount(); const pending = view.click('History & notifications'); await view.click('Recollect sample');
    finishHistory({ success: true, data: { ...original, events: [], communications: [] } }); await pending;
    assert.equal(nodes(view.render(), node => node.props?.['aria-label'] === 'Recollection history').length, 0);
    assert.match(text(view.render()), /REPLACEMENT-11/);
});
test('recollection completion works on a LAN browser without randomUUID using secure random bytes', async () => {
    const view = harness([original, replacement], { crypto: { getRandomValues: bytes => { for (let index = 0; index < bytes.length; index++) bytes[index] = index; return bytes; } } });
    await view.mount(); await view.click('Complete recollection');
    assert.equal(view.calls.find(([method]) => method === 'PATCH')[2].idempotencyKey, '000102030405060708090a0b0c0d0e0f');
});

function simpleHarness(file, props, extraMocks) {
    const state = [], effects = [], calls = []; let cursor = 0, mounted = false;
    const component = load(file, name => {
        if (name === 'react') return { ...React, useState: initial => { const key = cursor++; if (!(key in state)) state[key] = initial; return [state[key], next => { state[key] = typeof next === 'function' ? next(state[key]) : next; }]; }, useEffect: effect => { if (!mounted) effects.push(effect); } };
        return extraMocks(name, calls);
    });
    const render = () => { cursor = 0; return component(props); };
    return { render, calls, mount: async () => { render(); mounted = true; effects.forEach(effect => effect()); await new Promise(resolve => setImmediate(resolve)); } };
}
test('TAT summary and individual tests are separate views and a threshold drills into pending individual tests', async () => {
    const Overview = () => null, Table = () => null;
    const view = simpleHarness('components/operations/Laboratory/TurnAroundWorkspace.tsx', { data: [{ id: 1 }] }, name => ({ __esModule: true, default: name.includes('PendingResult') ? Overview : Table }));
    let tree = view.render(); assert.equal(nodes(tree, node => node.type === Table).length, 0);
    let summary = nodes(tree, node => node.type === Overview)[0]; assert.equal(summary.props.view, 'summary');
    nodes(tree, node => node.props?.id === 'tat-individual-tab')[0].props.onClick();
    assert.equal(nodes(view.render(), node => node.type === Table).length, 1);
    nodes(view.render(), node => node.props?.id === 'tat-summary-tab')[0].props.onClick();
    summary = nodes(view.render(), node => node.type === Overview)[0]; summary.props.onThresholdSelect(24);
    tree = view.render(); const cases = nodes(tree, node => node.type === Overview)[0];
    assert.equal(cases.props.view, 'cases'); assert.equal(cases.props.initialThreshold, 24);
    assert.equal(nodes(tree, node => node.type === Table).length, 0);
    assert.equal(nodes(tree, node => node.props?.id === 'tat-individual-tab')[0].props['aria-selected'], true);
});
for (const mode of ['summary', 'cases']) test(`TAT ${mode} requests and displays only its own data`, async () => {
    const view = simpleHarness('components/operations/Laboratory/PendingResultTATOverview.tsx', { view: mode, initialThreshold: 24 }, (name, calls) => {
        if (name.endsWith('/useApplicationContext')) return { useApplicationSettings: () => ({ applicationsettings: { user: { employeeid: 7 } } }) };
        if (name.endsWith('/customFetch')) return { customFetch: async endpoint => { calls.push(endpoint); return { success: true, data: [], total: 0 }; } };
        if (name === 'react-bootstrap') return { Alert: 'aside', Button: 'button', Spinner: 'span', Table: 'table' };
        if (name === 'moment') return { __esModule: true, default: () => ({ format: () => '' }) };
        throw new Error(name);
    });
    await view.mount();
    assert.equal(view.calls.length, 1); assert.ok(view.calls[0].includes(mode === 'summary' ? '/summary?' : '/cases?'));
    assert.equal(nodes(view.render(), node => node.type === 'table').length, mode === 'summary' ? 0 : 1);
    if (mode === 'cases') assert.ok(view.calls[0].includes('thresholdHours=24'));
});
