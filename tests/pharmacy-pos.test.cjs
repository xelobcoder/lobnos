const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');
const ts = require('typescript');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
function compile(file, overrides = {}) {
     const exports = {};
     const code = ts.transpileModule(readFileSync(path.join(__dirname, '..', file), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } }).outputText;
     const mocked = name => {
          if (overrides[name]) return overrides[name];
          if (name.includes('customFetch')) return {};
          if (name.includes('useApplicationContext')) return { useApplication: () => ({ user: { employeeid: 3, branch: 2 } }) };
          return require(name);
     };
     vm.runInNewContext(code, { exports, require: mocked }); return exports;
}
const Fields = compile('app/pharmacy/components/PharmacyPaymentFields.tsx').default;
const payment = amount => ({ amount, reference: '', setup: { shift: { id: 'shift' }, routes: [{ method: 'cash' }] }, setAmount() {}, setReference() {}, execute() {}, pending: null });
test('cash checkout shows tender and change without an account selector', () => {
     const html = renderToStaticMarkup(React.createElement(Fields, { payment: payment('100'), method: 'cash', total: 85 }));
     assert.match(html, /Amount received/); assert.match(html, /Change.*GHS 15\.00/); assert.doesNotMatch(html, /Collection account|Select an authorized account/);
});
test('short cash tender shows the remaining balance', () => {
     const html = renderToStaticMarkup(React.createElement(Fields, { payment: payment('80'), method: 'cash', total: 85 }));
     assert.match(html, /Still due.*GHS 5\.00/);
});
test('noncash checkout asks for a reference and never offers cash change', () => {
     const p = payment('85'); p.setup.routes = [{ method: 'card' }];
     const html = renderToStaticMarkup(React.createElement(Fields, { payment: p, method: 'card', total: 85 }));
     assert.match(html, /Payment reference/); assert.doesNotMatch(html, /Change:/);
});
test('the basket sits below medicine selection with payment alongside it', () => {
     let index = 0;
     const hooks = { ...React, useEffect() {}, useCallback: fn => fn, useRef: value => ({ current: value }), useState: initial => {
          const current = index++;
          return [current === 0 ? 'standard' : current === 6 ? [{ inventoryItemId: 'drug', name: 'Medicine', sku: 'D', salePrice: 42.5, quantity: 2, availableStock: 10 }] : initial, () => {}];
     } };
     const Page = compile('app/pharmacy/sell/page.tsx', { react: hooks, 'next/link': ({ children, href }) => React.createElement('a', { href }, children), '../components/PharmacyPaymentFields': { __esModule: true, default: Fields, usePharmacyPayment: () => payment('100'), usePharmacyDocument: () => ({ execute: async () => ({ success: true }), pending: null }) }, '../../../lib/pharmacy/receipt': { printPharmacyReceipt() {} }, './pos.module.css': { __esModule: true, default: {} }, '../components/InvoiceCollectionPanel': { __esModule: true, default: () => null } }).default;
     const html = renderToStaticMarkup(React.createElement(Page));
     assert.ok(html.indexOf('Search medicine or scan barcode') < html.indexOf('Basket'));
     assert.ok(html.indexOf('Basket') < html.indexOf('<aside'));
     assert.match(html, /GHS 85\.00/); assert.match(html, /Change.*GHS 15\.00/);
});
test('pharmacy navigation never links into lab inventory and scopes finance by role', () => {
     const { PharmacyLinks } = compile('components/Layout/links/categories/PharmacyLinks.tsx', { '../../../../lib/pharmacyAccounting': { accountingDestinations: [], accountingFriendlyTitles: {} } });
     const flatten = items => items.flatMap(link => [link, ...flatten(link.children || [])]);
     const links = flatten(PharmacyLinks);
     assert.ok(links.every(link => !link.link.startsWith('/inventory')));
     const finance = links.find(link => link.link === '/pharmacy/finance');
     assert.ok(finance.roles.includes('pharmacy_accountant')); assert.ok(!finance.roles.includes('manager'));
});
test('pharmacy activation does not activate laboratory inventory', () => {
     const { canAccessFacilityModule } = compile('lib/facilityModuleAccess.ts');
     const settings = { modules: { pharmacy: { enabled: true }, inventory: { enabled: false } } };
     assert.equal(canAccessFacilityModule('/pharmacy/inventory', settings), true);
     assert.equal(canAccessFacilityModule('/inventory/items', settings), false);
});
