const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');
const ts = require('typescript');
const React = require('react');

function load(file, mocks) {
    const exports = {};
    const compiled = ts.transpileModule(readFileSync(path.join(__dirname, '..', file), 'utf8'), {
        fileName: file, reportDiagnostics: true,
        compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
    });
    assert.deepEqual(compiled.diagnostics, []);
    vm.runInNewContext(compiled.outputText, {
        exports, console, URLSearchParams, Set,
        require: name => name === 'react/jsx-runtime' ? require(name) : mocks(name),
    });
    return exports;
}
const helper = load('lib/laboratoryWorkflow.ts', name => { if(name==='./resultPaymentPolicy')return load('lib/resultPaymentPolicy.ts',()=>{throw Error('Unexpected dependency');}); throw new Error(name); });
const nodes = (tree, predicate) => !tree || typeof tree !== 'object' ? [] : Array.isArray(tree)
    ? tree.flatMap(child => nodes(child, predicate))
    : [...(predicate(tree) ? [tree] : []), ...nodes(tree.props?.children, predicate)];
const text = tree => tree == null ? '' : typeof tree !== 'object' ? String(tree)
    : Array.isArray(tree) ? tree.map(text).join('') : text(tree.props?.children);
const ResultForm = () => null;
const noop = () => null;
const base = {
    ascension_id: 1, testid: 2, billingid: 3, test_name: 'Test', paymentstatus:'paid',
    workflow: {
        collection: 'bypassed', sampleValidation: 'bypassed', processing: 'bypassed',
        canCollect: false, canValidateSample: false, canProcess: false, canEnterResults: true, blockedReason: null,
    },
};
const files = [
    'app/operations/laboratory/main/dailyRequest/visit/page.tsx',
    'app/operations/laboratory/main/dailyRequest/multiple/visit/page.tsx',
];
function render(file, item, settings) {
    const isMultiple = file.includes('/multiple/');
    const states = isMultiple
        ? [[{ patient: { patientid: 4, billingid: 3 }, tests: [item], loading: false }], 0, 1, { 1: { csvid: 'token', ptid: 'token' } }, new Set([3]), '', null]
        : [[item], false, false, '', 1, [1], '', '', { 1: { csvid: 'token', ptid: 'token' } }, null];
    let index = 0;
    const component = load(file, name => {
        if (name === 'react') return { ...React, useState: () => [states[index++], noop], useEffect: noop };
        if (name === 'next/navigation') return { useSearchParams: () => new URLSearchParams('billingid=3&patientid=4') };
        if (name.endsWith('useApplicationContext')) return { useApplicationSettings: () => ({ applicationsettings: { user: { employeeid: 5 }, settings } }) };
        if (name.endsWith('laboratoryWorkflow')) return helper;
        if (name.endsWith('ResultEntryComponent')) return { __esModule: true, default: ResultForm };
        return new Proxy({ __esModule: true, default: noop }, { get: (target, key) => key in target ? target[key] : noop });
    }).default;
    return component();
}

test('workflow helper fails closed for missing server eligibility rather than inventing dates or acceptance', () => {
    assert.equal(helper.workflowFor().canEnterResults, false);
    assert.equal(helper.workflowFor({}).canValidateSample, false);
    assert.match(helper.workflowFor({}).blockedReason, /Refresh/);
    assert.equal(helper.workflowFor(base), base.workflow);
});
for (const file of files) {
    test(`${file}: unpaid validation follows its own setting, and revalidation never unlocks delivery`, () => {
        const item = { ...base, paymentstatus: 'unpaid', resultEntryEnd: '2026-11-06', isapproved: 0, requires_revalidation: 1, result_validation_stage: 'Unapproved' };
        for (const allow of [0, 1]) {
            const tree = render(file, item, { allowResultEnteringUpaid: 0, allowValidationUpaid: allow });
            const validate = nodes(tree, node => node.type === 'button' && text(node).trim() === 'Validate Result');
            assert.equal(validate.length, 1);
            assert.equal(validate[0].props.disabled, !allow);
            const delivery = nodes(tree, node => node.type === 'button' && text(node).trim() === 'Record Result Delivery');
            assert.equal(delivery.length, 1);
            assert.equal(delivery[0].props.disabled, true);
            assert.match(text(tree), /Revalidation required/);
        }
    });
    test(`${file}: all bypasses show result entry without an enabled validation modal action`, () => {
        const tree = render(file, base);
        assert.equal(nodes(tree, node => node.type === ResultForm).length, 1);
        assert.equal(nodes(tree, node => node.type === 'button' && text(node) === 'Validate Sample' && !node.props.disabled).length, 0);
        assert.match(text(tree), /Sample Validation Bypassed/);
        assert.match(text(tree), /Processing Bypassed/);
        assert.match(text(tree), /Bypassed by configuration/);
    });
    test(`${file}: missing mandatory sample remains blocked despite prior result-entry dates`, () => {
        const tree = render(file, {
            ...base, resultEntryStart: '2026-01-01',
            workflow: { ...base.workflow, sampleValidation: 'pending', canCollect: true, canEnterResults: false, blockedReason: 'Collect a physical sample for validation' },
        });
        assert.equal(nodes(tree, node => node.type === ResultForm).length, 0);
        const validation = nodes(tree, node => node.type === 'button' && text(node) === 'Validate Sample');
        assert.equal(validation.length, 1);
        assert.equal(validation[0].props.disabled, true);
        assert.match(text(tree), /Collect a physical sample/);
    });
    test(`${file}: real collected samples expose validation only when the server permits it`, () => {
        const tree = render(file, {
            ...base, workflow: { ...base.workflow, collection: 'completed', sampleValidation: 'pending', canValidateSample: true, canEnterResults: false },
        });
        const validation = nodes(tree, node => node.type === 'button' && text(node) === 'Validate Sample');
        assert.equal(validation.length, 1);
        assert.equal(validation[0].props.disabled, false);
        assert.equal(nodes(tree, node => node.type === ResultForm).length, 0);
    });
    test(`${file}: rejected container and absent workflow metadata cannot unlock old result entry`, () => {
        for (const workflow of [undefined, { ...base.workflow, canEnterResults: false, blockedReason: 'A required sample is rejected' }]) {
            const tree = render(file, { ...base, resultEntryStart: '2026-01-01', samplevalidatedon: '2026-01-01', processingEndDate: '2026-01-01', workflow });
            assert.equal(nodes(tree, node => node.type === ResultForm).length, 0);
        }
    });
}

test('approval checks reject negative display labels, explicit unapproved state and amended approvals', () => {
    for (const stage of ['Unapproved', 'Not approved', 'Not validated', 'Pending approval', 'Changed - revalidation required']) {
        assert.equal(helper.isResultApproved({ result_validation_stage: stage }), false);
    }
    assert.equal(helper.isResultApproved({ isapproved: 0, result_validation_stage: 'Approved' }), false);
    assert.equal(helper.isResultApproved({ isapproved: 1, requires_revalidation: 1 }), false);
    assert.equal(helper.isResultApproved({ isapproved: '1', requires_revalidation: 0 }), true);
    assert.equal(helper.isResultApproved({ result_validation_stage: 'Approved' }), true);
    assert.equal(helper.isResultApproved(), false);
    assert.equal(helper.resultApprovalLabel({ isapproved: 0, resultEntryEnd: '2026-11-06', result_validation_stage: 'Approved' }), 'Pending approval');
    assert.equal(helper.resultApprovalLabel({ isapproved: 1, requires_revalidation: 1 }), 'Revalidation required');
});

test('paid, partial and unpaid validation/entry settings stay independent and missing metadata fails closed', () => {
    for (const paymentstatus of ['paid', 'partial', 'unpaid', undefined]) {
        for (const entry of [0, 1]) for (const validation of [0, 1]) {
            const item = { ...base, paymentstatus, resultEntryEnd: '2026-11-06', isapproved: 0 };
            const settings = { allowResultEnteringUpaid: entry, allowValidationUpaid: validation };
            assert.equal(helper.workflowFor(item, settings).canEnterResults, paymentstatus === 'paid' || entry === 1);
            assert.equal(helper.canValidateResult(item, settings), paymentstatus === 'paid' || validation === 1);
            assert.equal(helper.canValidateResult({ ...item, workflow: undefined }, settings), false);
            assert.equal(helper.canValidateResult({ ...item, resultEntryEnd: null }, settings), false);
        }
    }
});
