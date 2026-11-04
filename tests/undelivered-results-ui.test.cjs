const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const test = require('node:test');
const ts = require('typescript');
const React = require('react');
const source = fs.readFileSync(path.join(__dirname, '../components/operations/Laboratory/UndeliveredResultTable.jsx'), 'utf8');
const code = ts.transpileModule(source, {fileName: 'UndeliveredResultTable.jsx', compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true, allowJs: true}}).outputText;
const nodes = (tree, predicate) => !tree || typeof tree !== 'object' ? [] : Array.isArray(tree) ? tree.flatMap(node => nodes(node, predicate)) : [...(predicate(tree) ? [tree] : []), ...nodes(tree.props?.children, predicate)];
const text = tree => tree == null ? '' : typeof tree !== 'object' ? String(tree) : Array.isArray(tree) ? tree.map(text).join('') : text(tree.props?.children);
function harness() {
    const states = [], dependencies = [], cleanups = [], effects = [], calls = [];
    let cursor = 0;
    const react = {
        ...React,
        useState(initial) {
            const index = cursor++;
            if (!(index in states)) states[index] = typeof initial === 'function' ? initial() : initial;
            return [states[index], value => {states[index] = typeof value === 'function' ? value(states[index]) : value;}];
        },
        useRef(initial) {const index = cursor++; return states[index] ||= {current: initial};},
        useMemo: factory => factory(),
        useCallback: callback => callback,
        useEffect(effect, deps) {
            const index = cursor++;
            if (!dependencies[index] || deps.some((value, key) => value !== dependencies[index][key])) {
                dependencies[index] = deps;
                effects.push(() => {cleanups[index]?.(); cleanups[index] = effect();});
            }
        },
    };
    const Modal = Object.assign(() => null, {Header: 'modal-header', Title: 'modal-title', Body: 'modal-body', Footer: 'modal-footer'});
    const data = [{ascensionid: 11, billingid: 21, patientid: 31, firstname: 'First', lastname: 'Patient', fullpatientid: 'P31'}, {ascensionid: 12, billingid: 22, patientid: 32, firstname: 'Second', lastname: 'Patient'}];
    const exports = {};
    vm.runInNewContext(code, {exports, URLSearchParams, console, Set, require(name) {
        if (name === 'react') return react;
        if (name === 'react/jsx-runtime' || name === 'dayjs') return require(name);
        if (name === 'react-bootstrap') return {Modal};
        if (name.includes('customFetch')) return {customFetch: async url => {calls.push(new URL(url, 'http://localhost').searchParams); return {status: true, records: {dataset: data, totalcount: 42}};}, customPost: async () => ({status: true})};
        if (name.includes('singleWorkFlow')) return 'SingleDelivery';
        if (name.includes('bulkWorkFlow')) return 'BulkDelivery';
        if (name.includes('OperationsWorkspaceNavigation')) return () => null;
        if (name === '@remixicon/react') return new Proxy({}, {get: (_, key) => key});
        if (name.endsWith('.css')) return {__esModule: true, default: new Proxy({}, {get: (_, key) => String(key)})};
        throw Error('Unexpected dependency ' + name);
    }});
    return {
        calls, Modal,
        render() {cursor = 0; return exports.default({employeeid: 5});},
        async flush() {effects.splice(0).forEach(effect => effect()); await new Promise(resolve => setImmediate(resolve));},
    };
}
const button = (tree, label) => nodes(tree, node => node.type === 'button' && (text(node).trim() === label || node.props['aria-label'] === label))[0];

test('undelivered row actions open delivery and issue dialogs for the correct record', async () => {
    const h = harness(); h.render(); await h.flush();
    const row = nodes(h.render(), node => node.type === 'tr' && text(node).includes('First Patient'))[0];
    button(row, 'Record delivery').props.onClick();
    const dialog = nodes(h.render(), node => node.type === 'SingleDelivery')[0];
    assert.equal(dialog.props.item.ascensionid, 11);
    assert.equal(dialog.props.employeeid, 5);
    assert.equal(dialog.props.show, true);
    button(row, 'Log issue').props.onClick();
    assert.equal(nodes(h.render(), node => node.type === h.Modal)[0].props.show, true);
    assert.match(nodes(row, node => node.type === 'a')[0].props.href, /billingid=21&patientid=31/);
});

test('bulk delivery uses selected records and page changes clear selection', async () => {
    const h = harness(); h.render(); await h.flush();
    nodes(h.render(), node => node.type === 'input' && node.props['aria-label']?.startsWith('Select First Patient'))[0].props.onChange();
    button(h.render(), 'Record selected (1)').props.onClick();
    const bulk = nodes(h.render(), node => node.type === 'BulkDelivery')[0];
    assert.equal(bulk.props.items.length, 1);
    assert.equal(bulk.props.items[0].ascensionid, 11);
    button(h.render(), 'Next page').props.onClick(); h.render(); await h.flush();
    assert.equal(button(h.render(), 'Record selected').props.disabled, true);
    assert.equal(h.calls.at(-1).get('page'), '2');
});

test('undelivered date filters remain on pagination requests', async () => {
    const h = harness(); h.render(); await h.flush();
    const dates = nodes(h.render(), node => node.type === 'input' && node.props.type === 'date');
    dates[0].props.onChange({target: {value: '2026-10-01'}});
    nodes(h.render(), node => node.type === 'input' && node.props.type === 'date')[1].props.onChange({target: {value: '2026-10-25'}});
    nodes(h.render(), node => node.type === 'form')[0].props.onSubmit({preventDefault() {}});
    h.render(); await h.flush();
    button(h.render(), 'Next page').props.onClick(); h.render(); await h.flush();
    assert.equal(h.calls.at(-1).get('startDate'), '2026-10-01');
    assert.equal(h.calls.at(-1).get('endDate'), '2026-10-25');
    assert.equal(h.calls.at(-1).get('page'), '2');
});
