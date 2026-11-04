const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
const vm = require('node:vm');
const path = require('node:path');
const exportsObject = {};
vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(__dirname, '../lib/resultSaveSession.ts'), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText, { exports: exportsObject });

test('double clicks are guarded synchronously, including while PIN verification is pending', () => {
    const session = exportsObject.createResultSaveSession(() => 'synthetic-request-id');
    assert.equal(session.start(), true);
    assert.equal(session.start(), false);
    session.finish();
    assert.equal(session.start(), true);
});
test('an uncertain response and identical resave retain identity; edits and deliberate reversions get a new identity', () => {
    let sequence = 0;
    const session = exportsObject.createResultSaveSession(() => `synthetic-request-${++sequence}`);
    const original = { ascensionid: 1, fields: [{ fieldid: 2, value: 'synthetic' }] };
    const first = session.identify(original);
    session.finish();
    assert.equal(session.identify(original).request_id, first.request_id);
    assert.equal(session.identify({ ...original, pin: 'synthetic-new-pin' }).request_id, first.request_id);
    assert.notEqual(session.identify({ ...original, comments: 'amendment' }).request_id, first.request_id);
    assert.notEqual(session.identify(original).request_id, first.request_id);
});
test('both result editors use the guard before validation and send stable identities', () => {
    for (const file of [
        '../components/LabTestForms/testrule.jsx',
        '../app/operations/imaging/ultrasound/result/[branchid]/page.tsx',
    ]) {
        const source = fs.readFileSync(path.join(__dirname, file), 'utf8');
        assert.match(source, /saveSession\.current!?\.(start)\(\)/);
        assert.match(source, /saveSession\.current!?\.(identify)\(/);
        assert.match(source, /saveSession\.current!?\.(finish)\(\)/);
        assert.ok(source.indexOf('.start()') < source.indexOf('await validatePin('));
    }
});

test('laboratory editor double click during PIN and network failure sends one request, then retries the original identity', async () => {
    let submit, releasePin, pinCalls = 0, stateIndex = 0, sequence = 0;
    const sent = [], modalStates = [];
    const pinPending = new Promise(resolve => { releasePin = resolve; });
    const formExports = {};
    const code = ts.transpileModule(fs.readFileSync(path.join(__dirname, '../components/LabTestForms/testrule.jsx'), 'utf8'), {
        compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX },
    }).outputText;
    vm.runInNewContext(code, {
        exports: formExports,
        require(name) {
            if (name === 'react') return {
                useState(initial) {
                    const index = stateIndex++;
                    const value = index === 3 ? false : index === 4 ? [{ fieldid: 10, name: 'Synthetic parameter', value: '7' }] : initial;
                    return [value, next => { if (index === 10) modalStates.push(next); }];
                },
                useRef: () => ({ current: null }), useEffect() {},
            };
            if (name === 'react/jsx-runtime') return { jsx: (_type, props) => {
                if (props?.handleSubmit) submit = props.handleSubmit;
                return null;
            }, jsxs: () => null };
            if (name === 'react-bootstrap') return { Modal: {} };
            if (name === 'react-toastify') return { toast: { success() {}, error() {} } };
            if (name.endsWith('useApplicationContext')) return {
                useApplicationSettings: () => ({ applicationsettings: { result: {}, settings: { pinOnResultEntry: 1 } } }),
            };
            if (name.endsWith('resultSaveSession')) return {
                createResultSaveSession: () => exportsObject.createResultSaveSession(() => `synthetic-editor-${++sequence}`),
            };
            if (name.endsWith('customFetch')) return {
                validatePin: () => { pinCalls++; return pinPending; },
                customPost: async (_url, _method, data) => {
                    sent.push(data);
                    if (sent.length === 1) throw Error('Simulated response lost after server commit');
                    return { status: 'success', statusCode: 200, replayed: true };
                },
            };
            return {};
        },
    });
    formExports.default({ clientdata: {
        ascensionid: 1, billingid: 'synthetic-billing', patientid: 'synthetic-patient',
        testid: 3, employeeid: 9, globalPin: 'synthetic-pin',
    } });
    assert.equal(typeof submit, 'function');
    const first = submit();
    await submit();
    assert.equal(pinCalls, 1);
    assert.equal(sent.length, 0);
    releasePin({ status: true });
    await first;
    assert.equal(sent.length, 1);
    await submit();
    assert.equal(sent.length, 2);
    assert.equal(sent[1].request_id, sent[0].request_id);
    assert.equal(modalStates.includes(true), false, 'a stale replay must not open local result validation');
});
