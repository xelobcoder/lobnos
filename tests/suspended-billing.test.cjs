const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');
const ts = require('typescript');

const root = path.join(__dirname, '..');
function compile(filename, mocks) {
     const exports = {};
     vm.runInNewContext(ts.transpileModule(readFileSync(path.join(root, filename), 'utf8'), {
          compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX },
     }).outputText, { exports, require: mocks, URLSearchParams });
     return exports;
}
const { defaultMultiBillingData } = compile(path.join('lib', 'Multi', 'MultiTypes.ts'), () => { throw new Error('Unexpected dependency'); });
function setup(overrides = {}) {
     const calls = [];
     const draft = {
          patientid: null, isPricingQuote: true, billingSource: 2,
          entitytype: 'organization', entityId: 14, entityname: 'Example Organization',
          selectedTestIds: [50], selectedServiceIds: [9],
          selectedTestOptions: [{ testid: 50, userAdjustmentType: 'discount', userAdjustedValue: 5, prioritised: true, outsourceid: 20 }],
          selectedServiceOptions: [{ keyid: 9, userAdjustmentType: 'surcharge', userAdjustedValue: 2 }],
          isPackageUsed: false, includeServices: true, notes: 'Return next week',
          ...overrides.draft,
     };
     const current = {
          testList: [{ testid: 50, id: 50, price: 150 }, { testid: 60, id: 60, price: 300 }],
          servicesList: [{ keyid: 9, servicePrice: 40 }, { keyid: 10, servicePrice: 50 }],
          entityType: 'organization', entityId: 14, patientId: 0,
          paymentModes: [{ KeyID: 1, PaymentMode: 'Cash' }],
          ...overrides.current,
     };
     const api = {
          customFetch: async url => {
               calls.push({ method: 'GET', url });
               if (url.startsWith('billing/multi/init?')) {
                    if (overrides.serviceCurrent && new URLSearchParams(url.split('?')[1]).get('isPackageUsed') === 'false') return overrides.serviceCurrent;
                    return current;
               }
               return { success: true, data: { id: 7, draft_data: draft } };
          },
          customFetchMutation: async (url, method, body) => {
               calls.push({ url, method, body });
               return overrides.mutation || { success: true, data: { id: 7 } };
          },
          customPost: async (url, method, body) => {
               calls.push({ url, method, body });
               return overrides.checkout || {
                    success: true,
                    data: { cart: body.cart, servicesList: body.servicesList, amountPayable: 187, patientId: 0 },
               };
          },
     };
     const helper = compile(path.join('lib', 'Multi', 'suspendedBilling.ts'), name => {
          if (name.endsWith('customFetch')) return api;
          if (name === './MultiTypes') return { defaultMultiBillingData };
          throw new Error(name);
     });
     return { ...helper, calls, draft };
}
const billingData = overrides => ({
     ...defaultMultiBillingData, patientid: 101, billingSource: 1,
     cart: [{ id: 50, testid: 50, price: 100 }],
     servicesProvided: [{ keyid: 9, servicePrice: 30 }],
     servicesList: [{ keyid: 9 }, { keyid: 10 }],
     payments: [{ mode: 'cash', amount: 50 }], paid: 50,
     ...overrides,
});
const plain = value => JSON.parse(JSON.stringify(value));

test('sale suspension sends the canonical source and selected items, not the service catalog or prices', async () => {
     const helper = setup();
     assert.equal(await helper.saveSuspendedBilling(billingData(), ' Later '), 7);
     const sent = helper.calls[0];
     assert.equal(sent.url, 'billing/suspended');
     assert.equal(sent.method, 'POST');
     assert.equal(sent.body.billingSource, 1);
     assert.deepEqual(plain(sent.body.selectedTestIds), [50]);
     assert.deepEqual(plain(sent.body.selectedServiceIds), [9]);
     assert.equal(sent.body.isPricingQuote, false);
     assert.equal(sent.body.notes, 'Later');
     for (const key of ['billing_source', 'draft_data', 'price', 'payments', 'paid']) assert.equal(key in sent.body, false);
});
test('patientless quotes can be suspended; normal sales still require a patient', async () => {
     const helper = setup();
     await helper.saveSuspendedBilling(billingData({ patientid: null, ispricingcheckout: true }), '');
     assert.equal(helper.calls[0].body.isPricingQuote, true);
     assert.equal(helper.calls[0].body.patientid, null);
     assert.throws(() => helper.buildSuspendedBillingDraft(billingData({ patientid: null }), ''), /Select a patient/);
});
test('resuspending updates the existing draft rather than creating a duplicate', async () => {
     const helper = setup();
     await helper.saveSuspendedBilling(billingData({ suspendedDraftId: 7 }), '');
     assert.equal(helper.calls[0].url, 'billing/suspended/7');
     assert.equal(helper.calls[0].method, 'PUT');
});
test('service-only sales save only selected services; an available catalog is not a selection', () => {
     const helper = setup();
     assert.deepEqual(plain(helper.buildSuspendedBillingDraft(billingData({ cart: [] }), '').selectedServiceIds), [9]);
     assert.throws(() => helper.buildSuspendedBillingDraft(billingData({ cart: [], servicesProvided: [] }), ''), /Select at least one/);
     assert.throws(() => helper.buildSuspendedBillingDraft(billingData({ isAdjustment: 1 }), ''), /adjustments cannot be suspended/);
});
test('quote resume loads current prices and reapplies options without creating a sale', async () => {
     const helper = setup();
     const { billingdata: data, notes } = await helper.resumeSuspendedBilling(7, 0, 4, 12, true);
     const init = new URLSearchParams(helper.calls[1].url.split('?')[1]);
     assert.equal(init.get('ispricingcheckout'), 'true');
     assert.equal(init.get('entityId'), '14');
     assert.equal(init.get('billingSource'), '2');
     assert.equal(data.cart.length, 1);
     assert.equal(data.cart[0].price, 150);
     assert.equal(data.cart[0].userAdjustedValue, 5);
     assert.equal(data.cart[0].outsourceid, 20);
     assert.equal(data.servicesProvided.length, 1);
     assert.equal(data.servicesProvided[0].servicePrice, 40);
     assert.equal(data.servicesProvided[0].userAdjustedValue, 2);
     assert.equal(data.ispricingcheckout, true);
     assert.equal(data.patientid, null);
     assert.equal(data.billingid, undefined);
     assert.equal(notes, 'Return next week');
     assert.equal(helper.calls.some(call => call.url === 'billing/multi/submit'), false);
});
test('quote-to-sale conversion preserves the newly chosen patient, entity, and selections', async () => {
     const helper = setup();
     const { billingdata: data } = await helper.resumeSuspendedBilling(7, 101, 4, 12, false);
     assert.equal(data.patientid, 101);
     assert.equal(data.ispricingcheckout, false);
     assert.equal(data.billingSource, 2);
     assert.equal(data.entityId, 14);
     assert.equal(data.entitytype, 'organization');
     assert.equal(data.suspendedDraftId, 7);
     assert.equal(data.branchid, 4);
     assert.equal(data.employeeid, 12);
     assert.deepEqual(plain(data.payments), []);
     assert.equal(data.paid, 0);
     assert.equal(data.balance, 187);
     assert.equal(new URLSearchParams(helper.calls[1].url.split('?')[1]).get('patientId'), '101');
     assert.equal(helper.calls[2].body.patientId, 101);
});
test('a patient-bound sale cannot be resumed against another patient', async () => {
     const helper = setup({ draft: { patientid: 101, isPricingQuote: false } });
     await assert.rejects(helper.resumeSuspendedBilling(7, 102, 4, 12, false), /different patient/);
     assert.equal(helper.calls.length, 1);
});
test('unavailable saved tests or services fail explicitly rather than silently dropping selections', async () => {
     const tests = setup({ current: { testList: [] } });
     await assert.rejects(tests.resumeSuspendedBilling(7, 101, 4, 12, false), /Saved test 50/);
     const services = setup({ current: { servicesList: [] } });
     await assert.rejects(services.resumeSuspendedBilling(7, 101, 4, 12, false), /Saved service 9/);
});
test('NHIS and reference-code details are included when current prices are loaded', async () => {
     const helper = setup({ draft: { billingSource: 4, entitytype: 'nhis', nhismembershipid: 123, claimscheckcode: 456, useSpecialCode: true, specialCode: 'REF123' } });
     await helper.resumeSuspendedBilling(7, 101, 4, 12, false);
     const params = new URLSearchParams(helper.calls[1].url.split('?')[1]);
     assert.equal(params.get('nhisMemberId'), '123');
     assert.equal(params.get('claimCheckCode'), '456');
     assert.equal(params.get('referalCode'), 'REF123');
});
test('packages resume using current package contents rather than stale selections', async () => {
     const helper = setup({ draft: { isPackageUsed: true, packageid: 8, selectedTestIds: [999] } });
     const { billingdata } = await helper.resumeSuspendedBilling(7, 101, 4, 12, false);
     assert.equal(billingdata.cart.length, 2);
     assert.equal(billingdata.packageid, 8);
});
test('package sales with additional services load the service catalog separately when package init omits it', async () => {
     const helper = setup({
          draft: { isPackageUsed: true, packageid: 8 },
          current: { servicesList: undefined },
          serviceCurrent: { servicesList: [{ keyid: 9, servicePrice: 55 }] },
     });
     const { billingdata } = await helper.resumeSuspendedBilling(7, 101, 4, 12, false);
     assert.equal(helper.calls.filter(call => call.url.startsWith('billing/multi/init?')).length, 2);
     assert.equal(billingdata.servicesProvided[0].servicePrice, 55);
     assert.equal(billingdata.isPackageUsed, true);
});
test('save and checkout failures are surfaced', async () => {
     const save = setup({ mutation: { success: false, message: 'Database unavailable' } });
     await assert.rejects(save.saveSuspendedBilling(billingData(), ''), /Database unavailable/);
     const checkout = setup({ checkout: { success: false, message: 'Outstanding debt found' } });
     await assert.rejects(checkout.resumeSuspendedBilling(7, 101, 4, 12, false), /Outstanding debt/);
});
test('finalization targets the saved billing ID and failures do not resubmit billing', async () => {
     const helper = setup();
     await helper.finalizeSuspendedBilling(7, 555);
     assert.deepEqual(plain(helper.calls[0]), { url: 'billing/suspended/7/finalize', method: 'POST', body: { billingId: 555 } });
     const failure = setup({ mutation: { success: false, message: 'Unable to finalize draft' } });
     await assert.rejects(failure.finalizeSuspendedBilling(7, 555), /Unable to finalize draft/);
     assert.equal(failure.calls.length, 1);
});

test('repricing preserves outsourcing and priority metadata omitted by the checkout response', async () => {
     const helper = setup({ checkout: { success: true, data: {
          cart: [{ testid: 50, price: 170, userAdjustedValue: 5 }],
          servicesList: [{ keyid: 9, servicePrice: 45 }],
          amountPayable: 210,
     } } });
     const { billingdata } = await helper.resumeSuspendedBilling(7, 101, 4, 12, false);
     assert.equal(billingdata.cart[0].price, 170);
     assert.equal(billingdata.cart[0].outsourceid, 20);
     assert.equal(billingdata.cart[0].prioritised, true);
});

function headerFor(data) {
     const calls = [];
     const helper = setup();
     const component = () => null;
     const Header = compile(path.join('components', 'Billing', 'Multi', 'MultiBillingHeader.tsx'), name => {
          if (name === 'react/jsx-runtime') return require(name);
          if (name === 'react') return {
               useState: value => [value, () => {}],
               useEffect: () => {},
          };
          if (name === 'react-bootstrap') return {
               Card: { Header: component }, Form: Object.assign(component, { Check: component, Label: component, Control: component }),
               Button: component, Spinner: component,
               Modal: Object.assign(component, { Header: component, Title: component, Body: component, Footer: component }),
          };
          if (name === '@remixicon/react') return new Proxy({}, { get: () => component });
          if (name === 'next/navigation') return { useRouter: () => ({ push: url => calls.push(url) }) };
          if (name === 'react-toastify') return { toast: { success() {}, error: message => { throw new Error(message); } } };
          if (name.endsWith('suspendedBilling')) return helper;
          if (name.endsWith('customFetch')) return {};
          throw new Error(name);
     }).default;
     const tree = Header({ billingdata: data, isSaleSaved: false });
     function elements(node) {
          if (!node || typeof node !== 'object') return [];
          if (Array.isArray(node)) return node.flatMap(elements);
          return [node, ...elements(node.props?.children)];
     }
     return { elements: elements(tree), calls, helper };
}

test('the lab billing header suspend action actually sends canonical fields and opens suspended transactions', async () => {
     const header = headerFor(billingData());
     const action = header.elements.find(element =>
          element.props?.variant === 'warning' && typeof element.props.onClick === 'function');
     assert.ok(action);
     action.props.onClick();
     await new Promise(resolve => setImmediate(resolve));
     assert.equal(header.helper.calls[0].body.billingSource, 1);
     assert.deepEqual(plain(header.helper.calls[0].body.selectedTestIds), [50]);
     assert.equal(header.calls[0], '/billing/suspended-transactions');
});
test('the price quote conversion control saves a patientless draft before requesting a patient', async () => {
     const header = headerFor(billingData({ patientid: null, ispricingcheckout: true }));
     const action = header.elements.find(element => element.props?.children === 'Convert to Sale');
     assert.ok(action);
     action.props.onClick();
     await new Promise(resolve => setImmediate(resolve));
     assert.equal(header.helper.calls[0].body.isPricingQuote, true);
     assert.equal(header.calls[0], '/billing/patientid?resumeDraftId=7&resumeBillingSource=1');
});
