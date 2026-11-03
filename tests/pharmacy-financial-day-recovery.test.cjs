const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');
const ts = require('typescript');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');

const styles = new Proxy({}, { get: (_, key) => String(key) });
const hooks = { ...React, useEffect() {}, useId: () => ':test:', useRef: value => ({ current: value }) };

function compile(file, overrides = {}) {
     const exports = {};
     const mockRequire = name => {
          if (overrides[name]) return overrides[name];
          if (name.endsWith('.module.css')) return { __esModule: true, default: styles };
          if (name.includes('customFetch')) return { currencyFormatter: new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS' }) };
          if (name.includes('useApplicationContext')) return { useApplication: () => null };
          if (name === 'next/link') return ({ href, children, ...props }) => React.createElement('a', { href, ...props }, children);
          return require(name);
     };
     const source = fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
     const output = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } }).outputText;
     vm.runInNewContext(output, { exports, require: mockRequire });
     return exports;
}

const shared = compile('app/pharmacy/components/PharmacyWorkspace.tsx', { react: hooks });
const previous = { id: 'previous', financial_date: '2026-11-02', status: 'open', opened_at: '2026-11-02T00:56:44Z' };
const openShift = { id: 'open', cashier_id: 2, financial_date: '2026-11-02', opened_at: '2026-11-02T08:00:00Z', opening_float: 10 };
const unreviewedShift = { id: 'review', cashier_id: 3, financial_date: '2026-11-02', opened_at: '2026-11-02T09:00:00Z', closed_at: '2026-11-02T18:00:00Z', opening_float: 0, counted_cash: 12, variance: 2 };

function renderFinance({ shifts = [openShift, unreviewedShift], days = [previous], manager = true, administrator = false, employeeid = 1, tab = 'days' } = {}) {
     let state = 0;
     const react = { ...hooks, useState: initial => [state++ === 0 ? tab : initial, () => {}] };
     const report = { days, shifts, balances: [], documents: [], events: [], revenue: 0, costOfSales: 0, expenses: 0, profit: 0 };
     const resource = endpoint => ({
          data: endpoint.endsWith('reports') ? report : endpoint.endsWith('suppliers') ? [] : { financialDate: '2026-11-03', day: null, previousDay: previous, accounts: [] },
          loading: false, error: '', refresh: async () => {},
     });
     const page = compile('app/pharmacy/finance/page.tsx', {
          react,
          '../components/ShiftHandoverForm': { __esModule: true, default: () => null },
          '../components/PharmacyPaymentFields': { usePharmacyDocument: () => ({ pending: null }) },
          '../components/LinkedAccountingCompatibility': { useLinkedAccounting: () => ({ mode: 'legacy', refresh() {} }), LinkedAccountingNotice: () => null, isLegacyAccountingPost: () => false },
          '../accounting/components/common': { ...shared, styles, FormSection: () => null, ResourceState: () => null, SummaryMetrics: () => null },
          '../components/PharmacyWorkspace': {
               ...shared, styles, usePharmacyAccess: () => ({ finance: true, manager, administrator, app: { user: { employeeid } } }),
               usePharmacyResource: resource, FinancialDayPanel: () => null, Tabs: () => null,
          },
     }).default;
     return renderToStaticMarkup(React.createElement(page));
}
test('daily checklist names each blocker and never offers accountant handover approval', () => {
     const html = renderFinance({ tab: 'overview', manager: false });
     assert.match(html, /1 shift\(s\) need a physical cash count and closing/);
     assert.match(html, /1 closed handover\(s\) await review/);
     assert.match(html, /an accountant cannot approve handovers/);
     assert.match(html, /4\. Open today separately/);
     assert.match(html, /Opening today stays blocked until the previous trading day is closed/);
     assert.doesNotMatch(html, />Review handovers<\/button>/);
});

test('both previous-day shift actions are visible before the wide cash columns and closing stays blocked', () => {
     const html = renderFinance();
     const handovers = html.slice(html.indexOf('id="financial-days-workflow"'), html.indexOf('<h2>Financial-day history'));
     assert.ok(handovers.indexOf('Status / action') < handovers.indexOf('Opening float'));
     assert.ok(handovers.indexOf('Close with cash count') < handovers.indexOf('Staff #2'));
     assert.match(handovers, />Review handover<\/button>/);
     assert.match(html, /disabled=""[^>]*>Close previous financial day/);
     assert.match(html, />Go to required shift actions<\/button>/);
});

test('an accountant can find their own shift and is told who must review the handover', () => {
     const html = renderFinance({ manager: false, employeeid: 2 });
     assert.match(html, /href="\/pharmacy\/cashier"[^>]*>Close your shift<\/a>/);
     assert.match(html, /Ask a pharmacy manager or administrator to review/);
     assert.doesNotMatch(html, />Review handover<\/button>/);
});

test('an unresolved shift on a closed older day offers audited reopening instead of an impossible handover action', () => {
     const closedDay = { id: 'older', financial_date: '2026-11-01', status: 'closed', closed_at: '2026-11-01T22:00:00Z' };
     const shifts = [
          { ...openShift, financial_date: '2026-11-01' },
          { ...unreviewedShift, financial_date: '2026-11-01' },
     ];
     const html = renderFinance({ shifts, days: [previous, closedDay] });
     assert.equal((html.match(/>Reopen shift day<\/button>/g) || []).length, 2);
     assert.doesNotMatch(html, />Close with cash count<\/button>|>Review handover<\/button>/);
     assert.match(html, /disabled=""[^>]*>Close previous financial day/);
});

test('a reopened legacy day remains the next day to close after its handovers are reviewed', () => {
     const reopened = { id: 'legacy', financial_date: '2026-11-01', status: 'open', opened_at: null, explicitly_reopened: true };
     const html = renderFinance({ days: [previous, reopened], shifts: [{ ...unreviewedShift, financial_date: '2026-11-01', reviewed_by: 1 }] });
     assert.match(html, /Finish 1 Nov 2026/);
     assert.doesNotMatch(html, /disabled=""[^>]*>Close previous financial day/);
});
