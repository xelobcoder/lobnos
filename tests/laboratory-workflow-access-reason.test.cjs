const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');
const ts = require('typescript');

function createWorkspace() {
    const calls = [];
    const states = [];
    let stateIndex = 0;
    const settings = { visibility: 'team', editing: 'team', allow_claim: false, allow_sonographer_amendment_signing: false, version: 1, can_manage: true };
    const react = {
        useState(initial) {
            const index = stateIndex++;
            if (!(index in states)) states[index] = index === 5 ? settings : initial;
            return [states[index], value => { states[index] = typeof value === 'function' ? value(states[index]) : value; }];
        },
        useRef: current => ({ current }),
        useCallback: callback => callback,
        useEffect() {},
    };
    const exports = {};
    const file = path.join(__dirname, '../components/operations/OperationalControlsWorkspace.tsx');
    const compiled = ts.transpileModule(readFileSync(file, 'utf8'), {
        fileName: file,
        compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
    });
    vm.runInNewContext(compiled.outputText, {
        exports,
        require(name) {
            if (name === 'react') return react;
            if (name === 'react/jsx-runtime') return require(name);
            if (name === 'react-bootstrap') return { Offcanvas: { Header: 'header', Title: 'title', Body: 'body' } };
            if (name === 'react-toastify') return { toast: { success() {}, error() {} } };
            if (name === '../Auth/customFetch') return {
                customFetch: async () => ({ success: true, data: settings }),
                customFetchMutation: async (...args) => { calls.push(args); return { success: true, data: {} }; },
            };
            if (name === './OperationalControls.module.css') return { workspace: 'workspace', header: 'header', navigation: 'navigation', panel: 'panel' };
            throw new Error(`Unexpected import ${name}`);
        },
    });
    const render = () => {
        stateIndex = 0;
        return exports.default({ mode: 'settings' });
    };
    return { calls, render };
}

function nodes(value) {
    if (!value || typeof value !== 'object') return [];
    if (Array.isArray(value)) return value.flatMap(nodes);
    return [value, ...nodes(value.props?.children)];
}

function text(value) {
    if (value == null || typeof value === 'boolean') return '';
    if (typeof value !== 'object') return String(value);
    return Array.isArray(value) ? value.map(text).join('') : text(value.props?.children);
}

function findLabel(tree, label) {
    return nodes(tree).find(node => node.type === 'label' && text(node).startsWith(label));
}

test('workflow access offers preset reasons with Other last and requires custom detail', () => {
    const workspace = createWorkspace();
    const tree = workspace.render();
    const reasonLabel = findLabel(tree, 'Reason for change');
    const select = nodes(reasonLabel).find(node => node.type === 'select');
    const options = nodes(select).filter(node => node.type === 'option').map(node => text(node));

    assert.deepEqual(options, [
        'Choose a reason',
        'Facility workflow policy update',
        'Staffing or role change',
        'Workload or coverage adjustment',
        'Access correction',
        'Compliance or audit requirement',
        'Other',
    ]);
    assert.equal(nodes(tree).some(node => node.type === 'textarea'), false);

    select.props.onChange({ target: { value: 'Other' } });
    const updatedTree = workspace.render();
    const customReason = findLabel(updatedTree, 'Specify another reason');
    const textarea = nodes(customReason).find(node => node.type === 'textarea');
    assert.equal(textarea.props.required, true);
    assert.equal(textarea.props.minLength, 3);
});

test('workflow access saves the custom reason text instead of the Other label', async () => {
    const workspace = createWorkspace();
    workspace.render();
    const reasonSelect = nodes(findLabel(workspace.render(), 'Reason for change')).find(node => node.type === 'select');
    reasonSelect.props.onChange({ target: { value: 'Other' } });
    const tree = workspace.render();
    const textarea = nodes(findLabel(tree, 'Specify another reason')).find(node => node.type === 'textarea');
    textarea.props.onChange({ target: { value: '  Local staffing arrangement  ' } });
    const form = nodes(workspace.render()).find(node => node.type === 'form');

    await form.props.onSubmit({ preventDefault() {} });

    assert.equal(workspace.calls.length, 1);
    assert.equal(workspace.calls[0][0], 'operations/control/settings');
    assert.equal(workspace.calls[0][1], 'PUT');
    assert.equal(workspace.calls[0][2].reason, 'Local staffing arrangement');
});

test('workflow access saves a selected preset reason directly', async () => {
    const workspace = createWorkspace();
    const reasonSelect = nodes(findLabel(workspace.render(), 'Reason for change')).find(node => node.type === 'select');
    reasonSelect.props.onChange({ target: { value: 'Access correction' } });
    const form = nodes(workspace.render()).find(node => node.type === 'form');

    await form.props.onSubmit({ preventDefault() {} });

    assert.equal(workspace.calls[0][2].reason, 'Access correction');
});

test('facilities can opt in to sonographer amendment signing for their own ultrasound reports', async () => {
    const workspace = createWorkspace();
    const policyLabel = nodes(workspace.render()).find(node => node.type === 'label' &&
        text(node).includes('Allow sonographers to sign amendments'));
    const policyCheckbox = nodes(policyLabel).find(node => node.type === 'input');

    assert.equal(policyCheckbox.props.checked, false);
    policyCheckbox.props.onChange({ target: { checked: true } });
    const reasonSelect = nodes(findLabel(workspace.render(), 'Reason for change')).find(node => node.type === 'select');
    reasonSelect.props.onChange({ target: { value: 'Facility workflow policy update' } });
    const form = nodes(workspace.render()).find(node => node.type === 'form');
    await form.props.onSubmit({ preventDefault() {} });

    assert.equal(workspace.calls[0][2].allow_sonographer_amendment_signing, true);
});
