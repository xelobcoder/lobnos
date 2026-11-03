const assert = require('node:assert/strict'), fs = require('node:fs'), path = require('node:path');
const test = require('node:test'), vm = require('node:vm'), ts = require('typescript');
const React = require('react'), { renderToStaticMarkup } = require('react-dom/server');
const medicine = { inventoryItemId: 'medicine-1', name: 'Example tablets', unit: 'tablet', costPrice: 2.5 };
function find(node, predicate) {
  if (!node || typeof node !== 'object') return;
  if (predicate(node)) return node;
  for (const child of React.Children.toArray(node.props?.children)) {
    const result = find(child, predicate); if (result) return result;
  }
}
function fixture(locked = false, mode = 'request', lowStock = []) {
  let cursor = 0, refCursor = 0, focusCount = 0; const state = [], calls = [], effects = [], refs = [];
  const hooks = { ...React, useId: () => 'medicine-picker', useEffect: fn => effects.push(fn), useRef: initial => {
    const index = refCursor++; refs[index] ||= { current: initial === null ? { focus() { focusCount++; } } : initial }; return refs[index];
  }, useState: initial => {
    const index = cursor++; if (!(index in state)) state[index] = typeof initial === 'function' ? initial() : initial;
    return [state[index], value => { state[index] = typeof value === 'function' ? value(state[index]) : value; }];
  }};
  const Picker = () => React.createElement('span', null, 'Medicine search');
  class FormDataFixture { constructor(values) { this.values = values; } get(key) { return this.values[key] ?? null; } }
  const exports = {};
  const file = path.join(__dirname, '..', 'app', 'pharmacy', 'components', 'PharmacyPurchaseRequestForm.tsx');
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: {
    module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2020, esModuleInterop: true,
  }}).outputText, { exports, FormData: FormDataFixture, require: name => {
    if (name === 'react') return hooks;
    if (name === 'react-select') return Picker;
    if (name.endsWith('.module.css')) return { __esModule: true, default: {} };
    if (name.includes('customFetch')) return { reactSelectCustomStyles: {} };
    if (name === './PharmacyWorkspace') return { styles: {}, money: n => `GHS ${n.toFixed(2)}`,
      usePharmacyResource: endpoint => ({ data: { items: endpoint.includes('filter=low') ? lowStock : [medicine] }, loading: false, error: '' }),
      Message: ({ error }) => error ? React.createElement('p', { role: 'alert' }, error) : null };
    return require(name);
  }});
  const render = () => { cursor = 0; refCursor = 0; effects.length = 0; return exports.default({
    suppliers: [{ id: 'supplier-1', name: 'Example supplier' }], locked, mode, onCancel() {},
    onSubmit: async payload => calls.push(JSON.parse(JSON.stringify(payload))),
  }); };
  const choose = item => find(render(), node => node.type === Picker).props.onChange(item);
  const button = text => find(render(), node => node.type === 'button' && node.props.children === text);
  const input = (label, value, section = 'Add medicine to request') => {
    const group = find(render(), node => node.type === 'section' && node.props['aria-label'] === section);
    const field = find(group, node => node.type === 'label' && React.Children.toArray(node.props.children).filter(child => typeof child === 'string').join('') === label);
    find(field, node => node.type === 'input').props.onChange({ target: { value } });
  };
  const submit = () => find(render(), node => node.type === 'form').props.onSubmit({
    preventDefault() {}, currentTarget: { supplier: 'supplier-1', supplierId: 'supplier-1', notes: 'Replenish tablets' },
  });
  return { render, choose, button, input, submit, calls, exports, focusCount: () => focusCount, picker: () => find(render(), node => node.type === Picker) };
}
test('low-stock medicines can be added in one tap with a suggested quantity that stays editable', async () => {
  const low = [
    { inventoryItemId: 'low-1', name: 'Low tablets', unit: 'tablet', availableStock: 4, minimumStock: 10 },
    { inventoryItemId: 'low-2', name: 'Empty syrup', unit: 'bottle', availableStock: 0, minimumStock: 0 },
  ];
  const ui = fixture(false, 'order', low);
  assert.equal(ui.exports.suggestedQuantity(low[0]), 16);
  assert.equal(ui.exports.suggestedQuantity(low[1]), 1);
  assert.equal(ui.exports.suggestedQuantity({ availableStock: 25, minimumStock: 10 }), 1);
  find(ui.render(), node => node.type === 'button' && node.props['aria-label'] === 'Add Low tablets').props.onClick();
  assert.match(renderToStaticMarkup(ui.render()), /Add all suggested \(1\)/);
  ui.button('Add all suggested (1)').props.onClick();
  assert.match(renderToStaticMarkup(ui.render()), /Your order \(2 medicines\)/);
  assert.match(renderToStaticMarkup(ui.render()), /Add all suggested \(0\)/);
  ui.input('Quantity (tablet)', '30', 'Medicines in request');
  await ui.submit();
  assert.deepEqual(ui.calls[0].lines, [{ itemId: 'low-1', quantity: 30 }, { itemId: 'low-2', quantity: 1 }]);
});
test('purchase entry records quantities and optional estimates before submitting a requisition', async () => {
  const ui = fixture();
  ui.choose(medicine); ui.input('Quantity (tablet)', '40'); ui.input('Estimate per tablet (GHS, optional)', '3.25');
  ui.button('Add item').props.onClick();
  assert.match(renderToStaticMarkup(ui.render()), /Your request \(1 medicine\)/);
  ui.choose({ ...medicine, inventoryItemId: 'medicine-2', name: 'Second medicine', unit: 'bottle' });
  ui.input('Quantity (bottle)', '2'); ui.input('Estimate per bottle (GHS, optional)', '2.5'); ui.button('Add item').props.onClick();
  await ui.submit();
  assert.deepEqual(ui.calls, [{ schemaVersion: 2, notes: 'Replenish tablets',
    lines: [{ itemId: 'medicine-1', quantity: 40, unitCost: 3.25 }, { itemId: 'medicine-2', quantity: 2, unitCost: 2.5 }] }]);
  assert.match(renderToStaticMarkup(ui.render()), /Estimated total: GHS 135.00/);
});
test('duplicate selection updates one item rather than creating duplicate medicine lines', async () => {
  const ui = fixture(); ui.choose(medicine); ui.input('Estimate per tablet (GHS, optional)', '2.5'); ui.button('Add item').props.onClick();
  ui.choose(medicine); ui.input('Quantity (tablet)', '12'); ui.button('Update item').props.onClick();
  await ui.submit(); assert.deepEqual(ui.calls[0].lines, [{ itemId: 'medicine-1', quantity: 12, unitCost: 2.5 }]);
  ui.input('Quantity (tablet)', '15', 'Medicines in request');
  await ui.submit(); assert.equal(ui.calls[1].lines[0].quantity, 15);
  ui.button('Remove').props.onClick();
  assert.match(renderToStaticMarkup(ui.render()), /No medicines added yet/);
});
test('invalid input, an empty request and an unadded selection never silently submit', async () => {
  const ui = fixture(); await ui.submit(); assert.equal(ui.calls.length, 0);
  ui.choose(medicine);
  for (const value of ['0', '-1', '', '1.0001', 'Infinity']) {
    ui.input('Quantity (tablet)', value); ui.button('Add item').props.onClick();
    assert.match(renderToStaticMarkup(ui.render()), /positive quantity/);
  }
  ui.input('Quantity (tablet)', '1'); ui.input('Estimate per tablet (GHS, optional)', '1.001');
  ui.button('Add item').props.onClick(); assert.match(renderToStaticMarkup(ui.render()), /non-negative cost/);
  ui.input('Estimate per tablet (GHS, optional)', '0'); ui.button('Add item').props.onClick();
  ui.choose({ ...medicine, inventoryItemId: 'medicine-2' });
  await ui.submit(); assert.equal(ui.calls.length, 0);
  assert.match(renderToStaticMarkup(ui.render()), /before submitting so this medicine is included/);
});
test('Enter adds the current medicine instead of prematurely submitting the purchase', async () => {
  const ui = fixture(); ui.choose(medicine); let prevented = false;
  const input = find(ui.render(), node => node.type === 'input' && node.props.value === '1');
  input.props.onKeyDown({ key: 'Enter', preventDefault() { prevented = true; } });
  assert.equal(prevented, true); assert.equal(ui.calls.length, 0);
  await ui.submit(); assert.equal(ui.calls[0].lines.length, 1);
});
test('pending or busy requests lock edits and prevent a replacement submission', async () => {
  const ui = fixture(true);
  assert.equal(find(ui.render(), node => node.type === 'fieldset').props.disabled, true);
  await ui.submit(); assert.equal(ui.calls.length, 0);
});
test('medicine selection stays mounted and returns focus after every added item', () => {
  const ui = fixture(), picker = ui.picker();
  ui.choose(medicine);
  assert.equal(ui.picker().type, picker.type);
  assert.equal(ui.picker().props.blurInputOnSelect, false);
  ui.button('Add item').props.onClick();
  assert.equal(ui.picker().props.value, null);
  assert.equal(ui.focusCount(), 1);
  ui.choose({ ...medicine, inventoryItemId: 'medicine-2' });
  ui.button('Add item').props.onClick();
  assert.equal(ui.focusCount(), 2);
});
test('supplier-first purchase orders submit one supplier and several lines with draft intent', async () => {
  const ui = fixture(false, 'order');
  ui.choose(medicine); ui.input('Quantity (tablet)', '20'); ui.button('Add item').props.onClick();
  ui.choose({ ...medicine, inventoryItemId: 'medicine-2', name: 'Second medicine' });
  ui.input('Quantity (tablet)', '10'); ui.button('Add item').props.onClick();
  ui.button('Save draft').props.onClick(); await ui.submit();
  assert.equal(ui.calls[0].supplierId, 'supplier-1'); assert.equal(ui.calls[0].submit, false);
  assert.equal(ui.calls[0].lines.length, 2);
  assert.deepEqual(ui.calls[0].lines, [{ itemId: 'medicine-1', quantity: 20 }, { itemId: 'medicine-2', quantity: 10 }]);
  ui.button('Submit for approval').props.onClick(); await ui.submit();
  assert.equal(ui.calls[1].submit, true);
  assert.match(renderToStaticMarkup(ui.render()), /one purchase order and supplier/);
});
test('supplier orders have no price input or required cost, and internal estimates remain optional', async () => {
  const order = fixture(false, 'order'); order.choose(medicine); order.button('Add item').props.onClick(); await order.submit();
  assert.equal(order.calls.length, 1); assert.equal(order.calls[0].lines[0].unitCost, undefined);
  assert.doesNotMatch(renderToStaticMarkup(order.render()), /Agreed cost|Agreed unit cost|Order total|Line total|type="number"[^>]*step="0.01"/);
  const request = fixture(); request.choose(medicine); request.button('Add item').props.onClick(); await request.submit();
  assert.equal(request.calls[0].lines[0].unitCost, undefined);
});
