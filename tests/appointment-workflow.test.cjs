const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');
const ts = require('typescript');

const root = path.join(__dirname, '..');
const read = (file) => readFileSync(path.join(root, file), 'utf8');
function load(file, mocks = () => { throw new Error('Unexpected dependency'); }) {
    const exports = {};
    const compiled = ts.transpileModule(read(file), {
        fileName: file, reportDiagnostics: true,
        compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
    });
    assert.deepEqual(compiled.diagnostics, []);
    vm.runInNewContext(compiled.outputText, { exports, console: { log() {} }, require: mocks });
    return exports;
}

test('conversion opens the existing General composer with the appointment id', () => {
    const helpers = load('lib/appointmentWorkflow.ts');
    assert.equal(helpers.appointmentConversionUrl('enc', 7),
        '/billing/patientid/enc/multi/1?entitytype=general&isRelatedBilling=0&appointmentId=7');
    assert.throws(() => helpers.appointmentConversionUrl('enc', 0), /Invalid appointment/);
    assert.throws(() => helpers.appointmentConversionUrl('', 7), /Invalid patient/);
});

test('billed appointments hand off to the matching clinical workspace', () => {
    const helpers = load('lib/appointmentWorkflow.ts');
    assert.equal(helpers.appointmentOperationsUrl('ultrasound', 3, 9), '/operations/imaging/ultrasound?patientid=3&billingid=9');
    assert.equal(helpers.appointmentOperationsUrl('laboratory', 3, 9), '/operations/laboratory?patientid=3&billingid=9');
    assert.equal(helpers.appointmentOperationsUrl('consultation', 3, 9), '');
});

const billing = {
    billingSource: 1, patientid: 101, employeeid: 12, branchid: 4,
    cart: [{ testid: 1 }], servicesProvided: [],
    amountPayable: 40, subtotal: 40, totaldiscount: 0,
    totalAmountIncurredDueTax: 0, balance: 40, paid: 0, payments: [],
};

test('saving an appointment conversion calls the atomic appointment convert route', async () => {
    const calls = [];
    const validation = load('lib/Multi/multiBillingValidation.ts', name =>
        name.includes('customFetch') ? { customPost: async (...args) => { calls.push(args); return { status: true, billingid: 55 }; } }
            : name === 'react-toastify' ? { toast: { success() {} } } : {});
    const result = await validation.MultiValidateAndSubmitBillingInformation({ ...billing, appointmentId: 7 });
    assert.equal(result.billingid, 55);
    assert.equal(calls.length, 1);
    assert.equal(calls[0][0], 'appointments/7/convert');
});

test('open workflow routes lab/ultrasound bookings to the recommendation page', () => {
    const page = read('app/appointments/page.jsx');
    assert.match(page, /`\/appointments\/\$\{appointment\.refid\}\/workflow`/);
    const workflow = read('app/appointments/[id]/workflow/page.tsx');
    assert.match(workflow, /appointments\/\$\{appointmentId\}\/workflow/);
    assert.match(workflow, /Do not create another bill/);
});

test('billing composer refuses to rebill an appointment that already has a bill', () => {
    const layout = read('components/Billing/Multi/MultBillingLayout.tsx');
    assert.match(layout, /already created bill #/);
    assert.match(layout, /requestedCart\(backendData\.testList, workflow\.appointment\.service_ids\)/);
});

test('new appointment form offers a service picker for lab and ultrasound bookings', () => {
    const modal = read('components/appointments/newAppointmentModal.jsx');
    assert.match(modal, /loadAppointmentServices/);
    assert.match(modal, /isMulti/);
    assert.doesNotMatch(modal, /setSelected\(false\)/);
});
