const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');
const ts = require('typescript');

function mountResultForm(countRequest) {
    const effects = [];
    const states = [];
    const writes = [];
    const exports = {};
    const source = readFileSync(path.join(__dirname, '../components/LabTestForms/testrule.jsx'), 'utf8');
    const compiled = ts.transpileModule(source, { compilerOptions: {
        module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX,
    } }).outputText;
    vm.runInNewContext(compiled, {
        exports, console: { log() {} },
        require(name) {
            if (name.endsWith('resultSaveSession')) return { createResultSaveSession: () => ({}) };
            if (name === 'react') return {
                useState(initial) {
                    const index = states.length;
                    states.push(initial);
                    return [initial, value => { states[index] = value; writes.push({ index, value }); }];
                },
                useEffect: effect => effects.push(effect),
                useRef: () => ({ current: null }),
            };
            if (name === 'react/jsx-runtime') return { jsx: () => null, jsxs: () => null };
            if (name.endsWith('useApplicationContext')) return {
                useApplicationSettings: () => ({ applicationsettings: { settings: {} } }),
            };
            if (name.endsWith('ActionFiltering')) return {
                getAscensionEditCountServerideS: countRequest,
                getResultEntryDataServerSide: async () => [{ result: [{ value: 'existing' }] }, { comments: 'Existing comment' }],
            };
            return {};
        },
    });
    exports.default({ clientdata: {
        testid: 1, billingid: 'billing-token', patientid: 'patient-token', employeeid: 1,
        ascensionid: 2, resultEntryStart: '2026-10-23',
    } });
    effects[0]();
    return { states, writes };
}

const settle = () => new Promise(resolve => setImmediate(resolve));

test('result form never renders the pending edit-count Promise as a React 19 child', async () => {
    let resolveCount;
    const request = new Promise(resolve => { resolveCount = resolve; });
    const form = mountResultForm(() => request);
    await settle();
    assert.equal(form.states[5], 0);
    assert.equal(form.writes.some(({ value }) => typeof value?.then === 'function'), false);
    resolveCount(3);
    await settle();
    assert.equal(form.states[5], 3);
    assert.equal(form.writes.some(({ value }) => typeof value?.then === 'function'), false);
});

test('an unavailable edit count leaves the loaded result fields intact', async () => {
    const form = mountResultForm(async () => { throw new Error('unavailable'); });
    await settle();
    assert.equal(form.states[5], 0);
    assert.equal(form.states[4][0].value, 'existing');
    assert.equal(form.states[0].comments, 'Existing comment');
});
