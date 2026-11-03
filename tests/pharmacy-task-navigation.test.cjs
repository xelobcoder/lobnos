const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const { JSDOM } = require('jsdom');
const root = path.resolve(__dirname, '..');
const styles = new Proxy({}, { get: (_, key) => String(key) });
const Link = ({ href, children, ...props }) => React.createElement('a', { href, ...props }, children);
function compile(file, imports) {
  const exports = {};
  const source = ts.transpileModule(fs.readFileSync(path.join(root, file), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  }).outputText;
  vm.runInNewContext(source, { exports, require: name => {
    if (name in imports) return imports[name];
    if (name.endsWith('.module.css')) return { __esModule: true, default: styles };
    return require(name);
  } });
  return exports;
}
function workspace(role) {
  return compile('app/pharmacy/components/PharmacyWorkspace.tsx', {
    react: React, 'next/link': Link,
    '../../../components/Auth/useApplicationContext': { useApplication: () => ({ user: { role, employeeid: 3 } }) },
    '../../../components/Auth/customFetch': { currencyFormatter: new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS' }) },
  });
}
test('daily task launcher exposes only tasks appropriate for the active pharmacy role', () => {
  const forRole = role => {
    const shared = workspace(role);
    return new JSDOM(renderToStaticMarkup(React.createElement(shared.PharmacyTaskLinks))).window.document;
  };
  const paths = role => [...forRole(role).querySelectorAll('a')].map(a => a.getAttribute('href'));
  const cashier = paths('pharmacy_cashier');
  assert.ok(cashier.includes('/pharmacy/sell'));
  assert.ok(cashier.includes('/pharmacy/counter'));
  assert.ok(!cashier.includes('/pharmacy/collections'));
  assert.ok(!cashier.includes('/pharmacy/accounting/payables'));
  const storekeeper = paths('pharmacy_storekeeper');
  assert.ok(storekeeper.includes('/pharmacy/inventory/receive'));
  assert.ok(storekeeper.includes('/pharmacy/inventory/orders'));
  assert.ok(!storekeeper.includes('/pharmacy/sell'));
  assert.ok(!storekeeper.includes('/pharmacy/accounts'));
  const accountant = paths('pharmacy_accountant');
  assert.ok(accountant.includes('/pharmacy/accounting/payables'));
  assert.ok(accountant.includes('/pharmacy/finance#days'));
  assert.ok(!accountant.includes('/pharmacy/inventory/receive'));
  assert.ok(paths('pharmacist').includes('/pharmacy/collections'));
  for (const role of ['pharmacy_cashier','pharmacy_storekeeper','pharmacy_accountant','pharmacist','pharmacy_manager']) {
    const links = paths(role);
    assert.equal(new Set(links).size, links.length);
    assert.ok(links.every(link => link.startsWith('/pharmacy/')));
  }
});
test('task launcher uses flat grouped rows instead of cards and keeps complete clickable labels', () => {
  for (const role of ['pharmacy_manager', 'pharmacy_storekeeper', 'pharmacy_cashier']) {
    const shared = workspace(role);
    const document = new JSDOM(renderToStaticMarkup(React.createElement(shared.PharmacyTaskLinks))).window.document;
    const launcher = document.querySelector('section');
    assert.ok(launcher.classList.contains('taskSection'));
    assert.ok(launcher.classList.contains('theme'));
    assert.equal(launcher.querySelector('.card, .order, .stepCount, .btn'), null);
    const groups = document.querySelectorAll('nav [role="group"]');
    assert.ok(groups.length > 0);
    for (const group of groups) {
      assert.ok(group.classList.contains('taskGroup'));
      assert.ok(document.getElementById(group.getAttribute('aria-labelledby')));
      const links = group.querySelectorAll('a');
      assert.equal(group.querySelector('.taskCount').textContent, `${links.length} tasks`);
      for (const link of links) {
        assert.ok(link.classList.contains('taskTile'));
        assert.ok(link.querySelector('.taskIcon[aria-hidden="true"]'));
        assert.ok(link.querySelector('strong').textContent);
        assert.ok(link.querySelector('small').textContent);
      }
    }
  }
});
test('overview uses the stock workspace and summary strip rather than the purchase request canvas', () => {
  const shared = workspace('pharmacy_manager');
  const Page = compile('app/pharmacy/page.tsx', {
    'next/link': Link,
    './components/PharmacyWorkspace': {
      ...shared,
      usePharmacyAccess: () => ({ selling: true, stock: true, finance: true }),
      usePharmacyResource: endpoint => ({
        data: endpoint === 'pharmacy/dashboard'
          ? { todaySales: 250, completedSales: 3, lowStockItems: 2, recentSales: [] }
          : null,
        loading: false, error: '', refresh: async () => {},
      }),
      FinancialDayPanel: () => null,
    },
    './components/PharmacyPurchasing.module.css': { __esModule: true, default: { theme: 'stock-theme' } },
    './accounting/components/AccountingWorkspace.module.css': {
      __esModule: true,
      default: { page: 'stock-page', summaryStrip: 'stock-summary', summaryDetail: 'stock-detail' },
    },
  }).default;
  const document = new JSDOM(renderToStaticMarkup(React.createElement(Page))).window.document;
  assert.ok(document.querySelector('main').classList.contains('stock-page'));
  assert.ok(document.querySelector('main').classList.contains('stock-theme'));
  assert.ok(document.querySelector('main').classList.contains('overview'));
  assert.equal(document.querySelector('.canvas'), null);
  const summary = document.querySelector('dl.stock-summary');
  assert.ok(summary);
  assert.equal(summary.querySelectorAll('dt').length, 3);
  assert.equal(summary.querySelector('a').getAttribute('href'), '/pharmacy/stock?filter=low');
});
test('previous-day checklist separates the four steps and names the responsible staff', () => {
  const shared = workspace('pharmacy_cashier');
  const html = renderToStaticMarkup(React.createElement(shared.PreviousDayChecklist, { canManage: false }));
  const document = new JSDOM(html).window.document;
  assert.equal(document.querySelectorAll('ol li').length, 4);
  assert.match(html, /different authorized manager or administrator/);
  assert.match(html, /Changing your role does not change your employee identity/);
  assert.match(html, /opens today separately/);
  assert.match(html, /Do not collect payment or create another sale/);
  assert.equal(document.querySelector('a,button'), null, 'cashier guidance must not expose unauthorized finance controls');
});
test('cashier cannot act on stale shift data after a loading or retrieval failure', async () => {
  for (const stale of [{ loading: true, error: '' }, { loading: false, error: 'Shift refresh failed' }]) {
    const shared = workspace('pharmacy_cashier'), writes = [], messages = [];
    const hooks = { ...React, useState: initial => [initial, value => messages.push(value)] };
    const Page = compile('app/pharmacy/cashier/page.tsx', {
      react: hooks, 'next/link': Link,
      '../../../components/Auth/customFetch': { customFetchMutation: async (...args) => { writes.push(args); return { success: true }; } },
      '../components/PharmacyWorkspace': { ...shared,
        usePharmacyAccess: () => ({ selling: true, finance: false }),
        usePharmacyResource: () => ({ data: { day: { status: 'open' }, shift: { id: 'old', opened_at: '2026-11-02' } }, ...stale, refresh: async () => {} }),
      },
    }).default;
    const tree = Page();
    const find = value => {
      if (!React.isValidElement(value)) return null;
      if (value.type === 'form') return value;
      for (const child of React.Children.toArray(value.props.children)) { const form = find(child); if (form) return form; }
      return null;
    };
    const form = find(tree);
    const document = new JSDOM(renderToStaticMarkup(tree)).window.document;
    assert.ok([...document.querySelectorAll('button')].find(button => button.textContent === 'Close shift & record count').disabled);
    await form.props.onSubmit({ preventDefault() {} });
    assert.equal(writes.length, 0);
    assert.ok(messages.some(value => typeof value === 'string' && value.startsWith('Refresh the financial day')));
  }
});
