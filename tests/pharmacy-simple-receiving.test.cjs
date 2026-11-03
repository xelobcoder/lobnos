const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const test = require('node:test');
const ts = require('typescript');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const { randomUUID } = require('node:crypto');

function find(node, predicate) {
  if (!node || typeof node !== 'object') return;
  if (predicate(node)) return node;
  for (const child of React.Children.toArray(node.props?.children)) {
    const result = find(child, predicate);
    if (result) return result;
  }
}
const text = node => node == null ? '' : typeof node !== 'object' ? String(node)
  : Array.isArray(node) ? node.map(text).join('') : text(node.props?.children);

function fixture({ manager = true, unitCost = 5, ordered = true, additionalMedicine = false, props = {} } = {}) {
  const state = [], refs = [], effects = [], queue = [], timers = new Map(), calls = [], previews = [];
  let stateIndex = 0, refIndex = 0, effectIndex = 0, timerId = 0;
  const item = { id: 'drug', name: 'Medicine', sku: 'D', consumption_unit: 'tablet', sale_price: 30, wholesale_price: 25, pharmacy_batch_tracking: true };
  const medicines = additionalMedicine ? [item, { ...item, id: 'other', name: 'Other medicine' }] : [item];
  const setup = { items: medicines, suppliers: [{ id: 'supplier', name: 'Supplier' }], policy: { mode: 'approval' },
    orders: [{ id: 'order', supplier_id: 'supplier', status: 'approved', lines: medicines.map(medicine => ({ id: `order-line-${medicine.id}`, item_id: medicine.id, name: medicine.name, quantity_ordered: 10, quantity_received: 0, unit_cost: unitCost })) }] };
  const hooks = { ...React, useId: () => 'picker',
    useState(initial) {
      const index = stateIndex++;
      if (!(index in state)) state[index] = typeof initial === 'function' ? initial() : initial;
      return [state[index], value => { state[index] = typeof value === 'function' ? value(state[index]) : value; }];
    },
    useRef(initial) { const index = refIndex++; return refs[index] ||= { current: initial }; },
    useEffect(work, dependencies) {
      const index = effectIndex++, previous = effects[index];
      if (previous && dependencies && dependencies.every((value, i) => Object.is(value, previous.dependencies?.[i]))) return;
      previous?.cleanup?.();
      effects[index] = { dependencies };
      queue.push(() => { effects[index].cleanup = work(); });
    },
  };
  const exports = {};
  const library = {};
  const compile = (file, output, requireModule) => vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(__dirname, '..', file), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
  }).outputText, { exports: output, require: requireModule, crypto: { randomUUID }, setTimeout(work) { timers.set(++timerId, work); return timerId; }, clearTimeout(id) { timers.delete(id); } });
  compile('lib/pharmacyReceiving.ts', library, require);
  compile('app/pharmacy/components/PharmacyReceivingModal.tsx', exports, name => {
    if (name === 'react') return hooks;
    if (name === 'next/link') return { __esModule: true, default: ({ children }) => React.createElement('a', null, children) };
    if (name === 'react-select') return { __esModule: true, default: () => React.createElement('span', null, 'Medicine picker') };
    if (name.endsWith('/isLoading')) return { __esModule: true, default: () => React.createElement('span', null, 'Loading...') };
    if (name.endsWith('.module.css')) return { __esModule: true, default: {} };
    if (name.endsWith('pharmacyReceiving')) return library;
    if (name.endsWith('pharmacyAccounting')) return { accountingReference: value => value };
    if (name.endsWith('customFetch')) return { reactSelectCustomStyles: {}, customFetchMutation: async (endpoint, method, input) => {
      previews.push({ endpoint, method, input: JSON.parse(JSON.stringify(input)) });
      return { success: true, data: { price: 33, cost: 5, margin: 84.848 } };
    } };
    if (name === './PharmacyPaymentFields') return { usePharmacyDocument: () => ({ pending: null, execute: async (endpoint, input) => {
      calls.push({ endpoint, input: JSON.parse(JSON.stringify(input)) });
      return { success: true, data: { acceptedQuantity: 10, heldQuantity: 0 } };
    } }) };
    if (name === './PharmacyWorkspace') return { styles: {}, money: n => `GHS ${Number(n || 0).toFixed(2)}`,
      usePharmacyAccess: () => ({ manager }), usePharmacyResource: () => ({ data: setup, loading: false, error: '' }),
      Modal: ({ children }) => React.createElement('section', { role: 'dialog', 'aria-modal': true }, children),
      Message: ({ error, notice }) => React.createElement('p', null, error || notice) };
    return require(name);
  });
  const render = () => {
    stateIndex = refIndex = effectIndex = 0;
    return exports.default({ initialOrderId: ordered ? 'order' : '', onClose() {}, onCompleted: async () => {}, ...props });
  };
  const settle = async () => {
    for (let i = 0; i < 5; i++) {
      render();
      while (queue.length) queue.shift()();
      const pending = [...timers.values()]; timers.clear();
      for (const work of pending) await work();
    }
    return render();
  };
  const field = label => find(render(), node => node.type === 'label' && text(node).trim().startsWith(label));
  const input = (label, value) => find(field(label), node => node.type === 'input').props.onChange({ target: { value } });
  const button = label => find(render(), node => node.type === 'button' && text(node) === label);
  const expiry = () => find(render(), node => node.type === 'input' && node.props['aria-label'] === 'Expiry Medicine').props.onChange({ target: { value: '2099-12-31' } });
  const submit = async () => {
    find(render(), node => node.type === 'form').props.onSubmit({ preventDefault() {} });
    await new Promise(resolve => setImmediate(resolve));
    return settle();
  };
  return { render, settle, field, input, button, expiry, submit, calls, previews };
}

test('ordered stock is saved once with prices unchanged and blank batch/reference generated by the server', async () => {
  const ui = fixture(); await ui.settle();
  const html = renderToStaticMarkup(ui.render());
  assert.match(html, /Auto-generated when blank/);
  assert.doesNotMatch(html, /Review selling prices &amp; finish|Retail per base unit/);
  const reference = find(ui.field('Delivery reference (optional)'), node => node.type === 'input');
  assert.ok(!reference.props.required);
  ui.expiry();
  await ui.submit();
  assert.equal(ui.calls.length, 1);
  assert.equal(ui.calls[0].endpoint, 'pharmacy/receiving/receive');
  assert.deepEqual(ui.calls[0].input.pricing, []);
  assert.equal(ui.calls[0].input.reference, undefined);
  assert.equal(ui.calls[0].input.reason, undefined);
  assert.equal(ui.calls[0].input.lines[0].batchNumber, '');
  assert.equal(ui.calls[0].input.lines[0].unitCost, 5);
});

const byLabel = (ui, label) => find(ui.render(), node => node.props?.['aria-label'] === label);
const openPrice = ui => byLabel(ui, 'Change price for Medicine').props.onClick();
const changePrice = (ui, checked) => find(ui.field('Change prices when this stock is received'), node => node.type === 'input').props.onChange({ target: { checked } });
const applyPrice = ui => ui.button('Apply prices').props.onClick();

test('each medicine row opens a price modal, previews and applies prices before saving the receipt', async () => {
  const ui = fixture(); await ui.settle(); ui.expiry();
  assert.equal(byLabel(ui, 'How should Medicine prices change?'), undefined);
  openPrice(ui);
  assert.ok(find(ui.render(), node => node.props?.title === 'Change selling prices · Medicine'));
  assert.equal(byLabel(ui, 'How should Medicine prices change?').props.value, 'increase_percentage');
  byLabel(ui, 'Percentage increase Medicine').props.onChange({ target: { value: '10' } });
  await ui.settle();
  assert.equal(ui.calls.length, 0);
  assert.equal(ui.previews.at(-1).input.deliveryId, undefined);
  assert.equal(ui.previews.at(-1).input.receipt.lines[0].unitCost, 5);
  const html = renderToStaticMarkup(ui.render());
  assert.match(html, /Current price: retail GHS 30\.00 · wholesale GHS 25\.00/);
  assert.match(html, /New retail: GHS 33\.00/);
  assert.match(html, /Profit per unit: GHS 28\.00/);
  applyPrice(ui);
  assert.equal(byLabel(ui, 'How should Medicine prices change?'), undefined);
  assert.ok(byLabel(ui, 'Edit price change for Medicine'));
  await ui.settle();
  await ui.submit();
  assert.equal(ui.calls.length, 1);
  assert.deepEqual(ui.calls[0].input.pricing, [{ itemId: 'drug', method: 'increase_percentage', value: 10, expectedPrice: 33, wholesale: { method: 'increase_percentage', value: 10, expectedPrice: 33 } }]);
});

test('entering exact new prices sends only the prices that actually changed', async () => {
  const ui = fixture(); await ui.settle(); ui.expiry();
  openPrice(ui);
  byLabel(ui, 'How should Medicine prices change?').props.onChange({ target: { value: 'manual' } });
  byLabel(ui, 'New retail price Medicine').props.onChange({ target: { value: '33' } });
  await ui.settle(); applyPrice(ui); await ui.settle(); await ui.submit();
  assert.deepEqual(ui.calls[0].input.pricing, [{ itemId: 'drug', method: 'manual', value: 33, expectedPrice: 33, wholesale: { method: 'keep' } }]);
});

test('unticking change price or leaving the increase blank keeps the old prices', async () => {
  const blank = fixture(); await blank.settle(); blank.expiry();
  openPrice(blank);
  await blank.settle(); applyPrice(blank); await blank.settle(); await blank.submit();
  assert.equal(blank.calls.length, 1);
  assert.deepEqual(blank.calls[0].input.pricing, []);
  const ui = fixture(); await ui.settle(); ui.expiry();
  openPrice(ui);
  byLabel(ui, 'Percentage increase Medicine').props.onChange({ target: { value: '10' } });
  await ui.settle();
  changePrice(ui, false);
  await ui.settle(); applyPrice(ui); await ui.settle(); await ui.submit();
  assert.deepEqual(ui.calls[0].input.pricing, []);
});

test('non-managers receive stock without a price control', async () => {
  const ui = fixture({ manager: false }); await ui.settle();
  const html = renderToStaticMarkup(ui.render());
  assert.match(html, /Prices stay unchanged\. A manager can change them\./);
  assert.equal(byLabel(ui, 'Change price for Medicine'), undefined);
});

test('cancelling the price modal discards draft edits and keeps original prices', async () => {
  const ui = fixture(); await ui.settle(); ui.expiry();
  openPrice(ui);
  byLabel(ui, 'Percentage increase Medicine').props.onChange({ target: { value: '10' } });
  await ui.settle();
  const dialog = find(ui.render(), node => node.props?.title === 'Change selling prices · Medicine');
  find(dialog, node => node.type === 'button' && text(node) === 'Cancel').props.onClick();
  await ui.settle(); await ui.submit();
  assert.deepEqual(ui.calls[0].input.pricing, []);
});

test('closing a reopened modal preserves an already applied price change', async () => {
  const ui = fixture(); await ui.settle(); ui.expiry();
  openPrice(ui);
  byLabel(ui, 'Percentage increase Medicine').props.onChange({ target: { value: '10' } });
  assert.ok(ui.button('Apply prices').props.disabled, 'Must wait for the preview');
  await ui.settle(); applyPrice(ui); await ui.settle();
  byLabel(ui, 'Edit price change for Medicine').props.onClick();
  byLabel(ui, 'Percentage increase Medicine').props.onChange({ target: { value: '20' } });
  const dialog = find(ui.render(), node => node.props?.title === 'Change selling prices · Medicine');
  dialog.props.onClose();
  await ui.settle(); await ui.submit();
  assert.equal(ui.calls[0].input.pricing[0].value, 10);
});

test('each row has its own button and a fixed increase changes only the chosen medicine', async () => {
  const ui = fixture({ additionalMedicine: true }); await ui.settle(); ui.expiry();
  byLabel(ui, 'Expiry Other medicine').props.onChange({ target: { value: '2099-12-31' } });
  assert.ok(byLabel(ui, 'Change price for Medicine'));
  byLabel(ui, 'Change price for Other medicine').props.onClick();
  assert.ok(find(ui.render(), node => node.props?.title === 'Change selling prices · Other medicine'));
  byLabel(ui, 'How should Other medicine prices change?').props.onChange({ target: { value: 'increase_fixed' } });
  byLabel(ui, 'Fixed increase amount Other medicine').props.onChange({ target: { value: '2' } });
  await ui.settle(); applyPrice(ui); await ui.settle(); await ui.submit();
  assert.equal(ui.calls[0].input.pricing.length, 1);
  assert.equal(ui.calls[0].input.pricing[0].itemId, 'other');
  assert.equal(ui.calls[0].input.pricing[0].method, 'increase_fixed');
  assert.ok(byLabel(ui, 'Change price for Medicine'));
});

test('price drafts translate to keep, percentage, fixed and manual rules and last cost prefill', () => {
  const library = {};
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(__dirname, '..', 'lib/pharmacyReceiving.ts'), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText, { exports: library, require, crypto: { randomUUID } });
  const current = { retail: 30, wholesale: 0 };
  const plain = value => JSON.parse(JSON.stringify(value));
  assert.deepEqual(plain(library.priceDraftChoices({ mode: 'increase_percentage', value: '', retail: '30', wholesale: '' }, current)), { retail: { method: 'keep', value: '' }, wholesale: { method: 'keep', value: '' } });
  assert.deepEqual(plain(library.priceDraftChoices({ mode: 'increase_percentage', value: '10', retail: '30', wholesale: '' }, current)), { retail: { method: 'increase_percentage', value: '10' }, wholesale: { method: 'keep', value: '' } });
  assert.deepEqual(plain(library.priceDraftChoices({ mode: 'increase_fixed', value: '2', retail: '30', wholesale: '' }, { retail: 30, wholesale: 25 })), { retail: { method: 'increase_fixed', value: '2' }, wholesale: { method: 'increase_fixed', value: '2' } });
  assert.deepEqual(plain(library.priceDraftChoices({ mode: 'manual', value: '', retail: '30', wholesale: '26' }, { retail: 30, wholesale: 25 })), { retail: { method: 'keep', value: '' }, wholesale: { method: 'manual', value: '26' } });
  assert.equal(library.lastCost({ cost: 1.234 }, 10), '12.34');
  assert.equal(library.lastCost({ cost: 0 }), '');
});
test('unknown costs block usable stock but still permit an explicit physical-only delivery', async () => {
  const ui = fixture({ unitCost: null }); await ui.settle(); await ui.submit();
  assert.equal(ui.calls.length, 0);
  assert.match(renderToStaticMarkup(ui.render()), /Enter the purchase cost for Medicine/);
  ui.button('Save physical delivery only').props.onClick();
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(ui.calls[0].endpoint, 'pharmacy/receiving/deliveries');
  assert.equal(ui.calls[0].input.lines[0].unitCost, undefined);
});

test('storekeepers can receive with current prices without seeing manager-only price controls', async () => {
  const ui = fixture({ manager: false }); await ui.settle();
  const html = renderToStaticMarkup(ui.render());
  assert.doesNotMatch(html, /Change selling price for Medicine|Supplier bill \(optional\)/);
  assert.match(html, /Selling prices stay unchanged/);
  ui.expiry();
  await ui.submit();
  assert.equal(ui.calls[0].endpoint, 'pharmacy/receiving/receive');
});
test('tracked medicines still require a real expiry rather than a fabricated default', async () => {
  const ui = fixture(); await ui.settle(); await ui.submit();
  assert.equal(ui.calls.length, 0);
  assert.match(renderToStaticMarkup(ui.render()), /Enter a valid unexpired expiry date for Medicine/);
});

test('unordered receiving uses the same one-save flow and permits supplier selection after adding a medicine', async () => {
  const ui = fixture({ ordered: false }); await ui.settle();
  find(ui.render(), node => node.props?.inputId === 'picker').props.onChange({ id: 'drug', name: 'Medicine', sku: 'D', unit: 'tablet', factor: 1, batchTracking: true });
  ui.input('Actual count', '10');
  ui.input('Cost per counted unit', '5');
  ui.input('Expiry date', '2099-12-31');
  ui.button('Add medicine').props.onClick();
  const supplier = find(ui.field('Supplier'), node => node.type === 'select');
  assert.equal(supplier.props.disabled, false);
  supplier.props.onChange({ target: { value: 'supplier' } });
  await ui.submit();
  assert.equal(ui.calls.length, 1);
  assert.equal(ui.calls[0].endpoint, 'pharmacy/receiving/receive');
  assert.equal(ui.calls[0].input.orderId, undefined);
  assert.equal(ui.calls[0].input.supplierId, 'supplier');
  assert.equal(ui.calls[0].input.lines[0].batchNumber, '');
});

test('an optional supplier invoice is included in the same stock operation', async () => {
  const ui = fixture(); await ui.settle(); ui.expiry();
  find(ui.field('Invoice availability'), node => node.type === 'select').props.onChange({ target: { value: 'now' } });
  ui.input('Supplier invoice reference', 'INV-123');
  await ui.submit();
  assert.equal(ui.calls.length, 1);
  assert.equal(ui.calls[0].endpoint, 'pharmacy/receiving/receive');
  assert.deepEqual(ui.calls[0].input.invoice, { reference: 'INV-123', invoiceDate: new Date().toISOString().slice(0, 10) });
});

test('page presentation is a full-width main rather than a receiving modal, retaining the single-save form', async () => {
  const ui = fixture({ props: { presentation: 'page', backLabel: 'Back to purchase order' } }); await ui.settle();
  const html = renderToStaticMarkup(ui.render());
  assert.match(html, /<main/);
  assert.match(html, /<h1>Receive stock<\/h1>/);
  assert.match(html, /Back to purchase order/);
  assert.doesNotMatch(html, /role="dialog"|aria-modal/);
  const css = fs.readFileSync(path.join(__dirname, '..', 'app/pharmacy/components/PharmacyReceivingModal.module.css'), 'utf8');
  assert.match(css, /\.page\{max-width:none;width:100%;margin:0\}/);
  ui.expiry(); await ui.submit();
  assert.equal(ui.calls[0].endpoint, 'pharmacy/receiving/receive');
});

test('a medicine selected from inventory is preselected on the receiving page', async () => {
  const ui = fixture({ ordered: false, props: { presentation: 'page', initialItemId: 'drug' } }); await ui.settle();
  assert.equal(find(ui.render(), node => node.props?.inputId === 'picker').props.value.id, 'drug');
  ui.input('Actual count', '10'); ui.input('Cost per counted unit', '5'); ui.input('Expiry date', '2099-12-31');
  ui.button('Add medicine').props.onClick();
  find(ui.field('Supplier'), node => node.type === 'select').props.onChange({ target: { value: 'supplier' } });
  await ui.submit();
  assert.equal(ui.calls[0].input.lines[0].itemId, 'drug');
});

test('an unavailable preselected medicine reports the issue instead of silently choosing another item', async () => {
  const ui = fixture({ ordered: false, props: { presentation: 'page', initialItemId: 'other-branch' } }); await ui.settle();
  assert.match(renderToStaticMarkup(ui.render()), /unavailable for receiving in your branch/);
  assert.equal(ui.calls.length, 0);
});

test('receiving separates delivery details, batch entry and a live review without changing the order', async () => {
  const ui = fixture({ props: { presentation: 'page' } }); await ui.settle();
  const html = renderToStaticMarkup(ui.render());
  for (const heading of ['Delivery details', 'Medicines received', 'Review &amp; save']) assert.ok(html.includes(heading));
  assert.match(html, /1 batch needs a purchase cost or valid expiry date/);
  assert.match(html, /Estimated stock cost/);
  assert.equal(byLabel(ui, 'Expiry Medicine').props['aria-invalid'], true, 'Missing expiry is highlighted on the batch');
  assert.ok(byLabel(ui, 'Remove Medicine batch'));
  assert.equal(byLabel(ui, 'Add delivered batch').props.open, false, 'Order entry is optional when ordered lines are already loaded');
  ui.expiry();
  const complete = renderToStaticMarkup(ui.render());
  assert.doesNotMatch(complete, /1 batch needs/);
  assert.match(complete, /Only eligible goods become usable stock/);
  assert.equal(ui.calls.length, 0, 'Reviewing the receipt never saves it');
});

test('the review counts a batch once for missing details and excludes deliberately held goods', async () => {
  const ui = fixture({ unitCost: null }); await ui.settle();
  assert.match(renderToStaticMarkup(ui.render()), /1 batch needs/);
  byLabel(ui, 'Condition Medicine').props.onChange({ target: { value: 'damaged' } });
  assert.doesNotMatch(renderToStaticMarkup(ui.render()), /batch needs|batches need/);
  assert.equal(ui.calls.length, 0);
});
