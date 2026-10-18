const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');
const ts = require('typescript');

const root = path.join(__dirname, '..');
function load(file, mocks = () => { throw new Error('Unexpected dependency'); }) {
    const exports = {};
    const compiled = ts.transpileModule(readFileSync(path.join(root, file), 'utf8'), {
        fileName: file, reportDiagnostics: true,
        compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
    });
    assert.deepEqual(compiled.diagnostics, []);
    vm.runInNewContext(compiled.outputText, { exports, console: { log() {} }, require: mocks });
    return exports;
}
const helpers = load('lib/patientBillingRequests.ts');

test('review URL opens the real General composer with the patient and request id', () => {
    assert.equal(helpers.requestReviewUrl('encrypted-patient', 42),
        '/billing/patientid/encrypted-patient/multi/1?entitytype=general&isRelatedBilling=0&billingRequestId=42');
    assert.throws(() => helpers.requestReviewUrl('encrypted-patient', NaN));
});
test('prefill uses actual current catalog test rows, never prices supplied by a patient', () => {
    const catalog = [{ testid: 1, actualPrice: 40 }, { testid: 2, actualPrice: 65.25 }, { testid: 3, actualPrice: 10 }];
    const result = helpers.requestedCart(catalog, [2, 1]);
    assert.equal(result[0], catalog[1]);
    assert.equal(result[1], catalog[0]);
    assert.equal(result.length, 2);
    assert.throws(() => helpers.requestedCart(catalog, [1, 99]), /no longer available/);
    assert.throws(() => helpers.requestedCart(catalog, []), /no longer available/);
});
const billing = {
    billingSource: 1, patientid: 101, employeeid: 12, branchid: 4,
    cart: [{ testid: 1 }, { testid: 2 }], servicesProvided: [],
    amountPayable: 105.25, subtotal: 105.25, totaldiscount: 0,
    totalAmountIncurredDueTax: 0, balance: 105.25, paid: 0, payments: [],
};
test('saving a reviewed request calls atomic conversion, not normal submit plus a separate status mutation', async () => {
    const calls = [];
    const validation = load('lib/Multi/multiBillingValidation.ts', name =>
        name.includes('customFetch') ? { customPost: async (...args) => { calls.push(args); return { status: true, billingid: 9000 }; } }
            : name === 'react-toastify' ? { toast: { success() {} } } : {});
    const result = await validation.MultiValidateAndSubmitBillingInformation({ ...billing, billingRequestId: 42 });
    assert.equal(result.billingid, 9000);
    assert.equal(calls.length, 1);
    assert.equal(calls[0][0], 'patient-portal/admin/billing-requests/42/convert');
    assert.equal(calls[0][1], 'POST');
    assert.equal(calls[0][2].amountPayable, 105.25);
});
test('ordinary billing still uses the original submission route', async () => {
    const calls = [];
    const validation = load('lib/Multi/multiBillingValidation.ts', name =>
        name.includes('customFetch') ? { customPost: async (...args) => { calls.push(args); return { status: true }; } }
            : name === 'react-toastify' ? { toast: { success() {} } } : {});
    await validation.MultiValidateAndSubmitBillingInformation(billing);
    assert.equal(calls[0][0], 'billing/multi/submit');
});
test('both new request pages and composer integration compile as TSX', () => {
    for (const file of [
        'app/patientportal/requests/page.tsx', 'app/patient-portal-admin/requests/page.tsx',
        'components/Billing/Multi/MultBillingLayout.tsx',
        'app/billing/patientid/[patientid]/multi/[billingsourceid]/page.tsx',
    ]) {
        const compiled = ts.transpileModule(readFileSync(path.join(root, file), 'utf8'), {
            fileName: file, reportDiagnostics: true,
            compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX },
        });
        assert.deepEqual(compiled.diagnostics, [], file);
    }
});
