const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const test = require('node:test');
const ts = require('typescript');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const root = path.join(__dirname, '..');
const css = { __esModule: true, default: new Proxy({}, { get: (_, key) => String(key) }) };
const link = { __esModule: true, default: ({ prefetch, ...props }) => React.createElement('a', props) };
function compile(file, resolve) {
  const exports = {};
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(root, file), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
  }).outputText, { exports, URLSearchParams, require: name => {
    if (name.endsWith('.module.css')) return css;
    if (name === 'next/link') return link;
    if (name === 'react/jsx-runtime') return require(name);
    return resolve(name);
  } });
  return exports;
}
function fixture(query = '', { stock = true, resource = { data: null, loading: false, error: '' } } = {}) {
  const pushes = [], requests = [];
  let frame, refreshes = 0;
  const page = compile('app/pharmacy/inventory/receive/page.tsx', name => {
    if (name === 'next/navigation') return { useRouter: () => ({ push: href => pushes.push(href) }), useSearchParams: () => new URLSearchParams(query) };
    if (name.endsWith('/PharmacyReceivingModal')) return { __esModule: true, default: props => {
      frame = props; return React.createElement('main', null, 'Receiving form');
    } };
    if (name.endsWith('/PharmacyWorkspace')) return {
      styles: css.default, usePharmacyAccess: () => ({ stock }),
      usePharmacyResource: endpoint => { requests.push(endpoint); return { ...resource, refresh: async () => { refreshes++; } }; },
      Empty: ({ children }) => React.createElement('p', null, children),
      Message: ({ error }) => React.createElement('p', { role: 'alert' }, error),
    };
    throw new Error(`Unexpected dependency ${name}`);
  }).default;
  return { render: () => renderToStaticMarkup(React.createElement(page)), tree: () => { const element = page(); return typeof element.type === 'function' ? element.type(element.props) : element; },
    frame: () => frame, pushes, requests, refreshes: () => refreshes };
}
function find(node, predicate) {
  if (!node || typeof node !== 'object') return;
  if (predicate(node)) return node;
  for (const child of React.Children.toArray(node.props?.children)) {
    const result = find(child, predicate); if (result) return result;
  }
}
test('new receiving opens a real page with explicit back and supplier-payables continuation', () => {
  const ui = fixture(); ui.render();
  assert.equal(ui.frame().presentation, 'page');
  ui.frame().onClose(); ui.frame().onPaySupplier();
  assert.deepEqual(ui.pushes, ['/pharmacy/inventory/deliveries', '/pharmacy/accounting/payables']);
  assert.deepEqual(ui.requests, []);
});
test('order and medicine entry context is preserved and navigation ids are encoded', () => {
  const ui = fixture('orderId=order%2Fone%3F&itemId=drug'); ui.render();
  assert.equal(ui.frame().initialOrderId, 'order/one?');
  assert.equal(ui.frame().initialItemId, 'drug');
  ui.frame().onClose(); ui.frame().onPaySupplier();
  assert.deepEqual(ui.pushes, ['/pharmacy/inventory/orders?order=order%2Fone%3F', '/pharmacy/inventory/orders?order=order%2Fone%3F#payments']);
});
test('existing receipts load directly by id and use the authoritative order for back/payment', async () => {
  const data = { id: 'old/receipt', details: { orderId: 'original-order', reference: 'OLD' } };
  const ui = fixture('deliveryId=old%2Freceipt&orderId=wrong', { resource: { data, loading: false } }); ui.render();
  assert.deepEqual(ui.requests, ['pharmacy/receiving/deliveries/old%2Freceipt']);
  assert.equal(ui.frame().initialDelivery, data);
  assert.equal(ui.frame().initialOrderId, 'original-order');
  ui.frame().onClose(); ui.frame().onPaySupplier(); await ui.frame().onCompleted();
  assert.deepEqual(ui.pushes, ['/pharmacy/inventory/orders?order=original-order', '/pharmacy/inventory/orders?order=original-order#payments']);
  assert.equal(ui.refreshes(), 1);
});
test('delivery load errors are visible and retryable without rendering stale stock controls', async () => {
  const ui = fixture('deliveryId=missing', { resource: { data: { details: {} }, error: 'Delivery unavailable', loading: false } });
  const html = ui.render();
  assert.match(html, /Delivery unavailable/); assert.match(html, /Back to deliveries/);
  assert.doesNotMatch(html, /Receiving form/);
  const retry = find(ui.tree(), node => node.type === 'button');
  await retry.props.onClick();
  assert.equal(ui.refreshes(), 1);
});
test('loading and finance-only access do not expose the receiving form', () => {
  const loading = fixture('deliveryId=old', { resource: { loading: true } });
  assert.match(loading.render(), /Loading delivery/); assert.equal(loading.frame(), undefined);
  const forbidden = fixture('deliveryId=old', { stock: false });
  assert.match(forbidden.render(), /Pharmacy stock access is required/);
  assert.deepEqual(forbidden.requests, []); assert.equal(forbidden.frame(), undefined);
});
test('every existing receiving entry point navigates to the dedicated page instead of opening a modal', () => {
  for (const file of ['app/pharmacy/components/PharmacyInventoryWorkspace.tsx', 'app/pharmacy/inventory/orders/page.tsx', 'app/pharmacy/inventory/deliveries/DeliveriesWorkspace.tsx']) {
    const source = fs.readFileSync(path.join(root, file), 'utf8');
    assert.match(source, /href=.*\/pharmacy\/inventory\/receive/);
    assert.doesNotMatch(source, /PharmacyReceivingModal/);
  }
  const source = fs.readFileSync(path.join(root, 'app/pharmacy/components/PharmacyInventoryWorkspace.tsx'), 'utf8');
  assert.match(source, /itemId=\$\{encodeURIComponent\(m.inventoryItemId\)\}/);
  assert.match(source, /orderId=\$\{encodeURIComponent\(o.id\)\}/);
});
function shell(layout, pathname, mobileOpen = false) {
  let stateIndex = 0;
  const links = [{ title: 'Inventory', href: '/pharmacy/inventory' }];
  const hooks = { ...React, useState: initial => {
    const index = stateIndex++;
    return [index === 3 && mobileOpen ? true : typeof initial === 'function' ? initial() : initial, () => {}];
  }, useEffect() {}, useMemo: work => work(), useCallback: work => work };
  const component = compile('components/Layout/PrimeLayout.tsx', name => {
    if (name === 'react') return hooks;
    if (name === 'next/navigation') return { usePathname: () => pathname, useRouter: () => ({ push() {} }), useSearchParams: () => new URLSearchParams() };
    if (name === '@remixicon/react') return require(name);
    if (name.endsWith('/useApplicationContext')) return { useApplicationSettings: () => ({ applicationsettings: { company: 'PLS', user: { role: 'pharmacy_manager' }, settings: { workspaceLayout: layout } } }) };
    if (name.endsWith('/RoleLinks')) return { AdminRoleLinks: [], SuperAdminRoleLinks: [] };
    if (name.endsWith('/crmLinks')) return { MarketerLinks: [] };
    if (name.endsWith('/RoleSidebars')) return { roleWorkspaceSidebar: () => links, roleSidebarQuickLinks: () => [] };
    if (name.endsWith('/roleNavigationPolicy')) return { roleWorkspace: () => 'pharmacymanager', canAccessRolePage: () => true };
    if (name.endsWith('/facilityModuleAccess')) return { canAccessFacilityModule: () => true };
    if (name.endsWith('/roles')) return { roleAllowed: () => false };
    if (name.endsWith('/ribbonNavigation')) return { findActiveNavigationPath: () => [] };
    if (name.endsWith('/RibbonNavigation')) return { __esModule: true, default: () => React.createElement('nav', { 'aria-label': 'Ribbon navigation' }) };
    if (name.endsWith('/ThemeProvider')) return { useTheme: () => ({ theme: 'light', toggleTheme() {} }) };
    if (name.endsWith('/FontSelector')) return { FontSelector: () => null };
    if (name.endsWith('/customFetch')) return {};
    throw new Error(`Unexpected layout dependency ${name}`);
  }).default;
  return renderToStaticMarkup(React.createElement(component, { links }, React.createElement('div', null, 'Receiving content')));
}
for (const layout of ['classic', 'claude', 'zoho', 'ribbon', 'slack', 'portal']) {
  test(`receiving is sidebar-free in ${layout}, including a previously open mobile menu`, () => {
    const html = shell(layout, '/pharmacy/inventory/receive', true);
    assert.match(html, /Receiving content/);
    assert.match(html, /sidebarHidden/);
    assert.doesNotMatch(html, /<aside|aria-label="Ribbon navigation"|aria-label="Toggle navigation menu"|aria-label="Collapse navigation"|aria-label="Expand navigation"|mobileOverlay|mobileSidebarOpen|mobileOpen/);
    assert.match(html, /max-width:100%/);
    const normal = shell(layout, '/pharmacy/inventory');
    assert.match(normal, layout === 'ribbon' ? /aria-label="Ribbon navigation"/ : /<aside/);
    assert.doesNotMatch(normal, /sidebarHidden/);
  });
}
