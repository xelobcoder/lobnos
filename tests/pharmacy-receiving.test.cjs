const assert = require('node:assert/strict'), fs = require('node:fs'), path = require('node:path');
const test = require('node:test'), vm = require('node:vm'), ts = require('typescript');
const exportsFixture = {};
vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(__dirname, '..', 'lib', 'pharmacyReceiving.ts'), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText, { exports: exportsFixture });
const { invoiceAllocation, heldQuantity, uninvoicedQuantity } = exportsFixture;
const line = (overrides = {}) => ({ id: 'batch', itemId: 'medicine', name: 'Tablets', quantityDelivered: 120, acceptedQuantity: 100, returnedQuantity: 0, acceptedValue: 2000, unitCost: 20, condition: 'good', ...overrides });
test('invoice allocation uses exact half-up cents instead of binary toFixed rounding', () => {
  assert.equal(invoiceAllocation(line({ acceptedQuantity: 2, acceptedValue: 2.01 }), 1), 1.01);
  assert.equal(invoiceAllocation(line({ acceptedQuantity: 2, acceptedValue: 2.01, invoiceQuantity: 1, invoiceAmount: 1.01 }), 1), 1);
});
test('partial invoices preserve the last-cent residual and base-unit quantities', () => {
  const first = line({ acceptedQuantity: 3, acceptedValue: 10 });
  assert.equal(invoiceAllocation(first, 1), 3.33);
  assert.equal(invoiceAllocation({ ...first, invoiceQuantity: 2, invoiceAmount: 6.66 }, 1), 3.34);
  assert.equal(invoiceAllocation(line({ acceptedQuantity: 1.5, acceptedValue: 10 }), .75), 5);
  assert.equal(heldQuantity(line({ returnedQuantity: 5 })), 15);
  assert.equal(uninvoicedQuantity(line({ invoiceQuantity: 60 })), 40);
});
test('invoice allocation rejects malformed quantities and prior financial evidence', () => {
  for (const quantity of [0, -1, NaN, Infinity, 101, .0001]) assert.throws(() => invoiceAllocation(line(), quantity));
  for (const override of [{ invoiceAmount: -1 }, { invoiceAmount: 2001 }, { acceptedValue: NaN }, { acceptedValue: .001 }, { invoiceQuantity: -.5 }, { acceptedQuantity: .0001 }]) assert.throws(() => invoiceAllocation(line(override), .001));
});
