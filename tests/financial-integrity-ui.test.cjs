const assert = require("node:assert/strict");
const test = require("node:test");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");
const React = require("react");
const root = path.join(__dirname, "..");
const nodes = (tree, predicate) => !tree || typeof tree !== "object" ? [] : Array.isArray(tree)
     ? tree.flatMap(item => nodes(item, predicate))
     : [...(predicate(tree) ? [tree] : []), ...nodes(tree.props?.children, predicate), ...nodes(tree.props?.filters, predicate)];
const text = tree => tree == null ? "" : typeof tree !== "object" ? String(tree)
     : Array.isArray(tree) ? tree.map(text).join("") : text(tree.props?.children);
const tick = () => new Promise(resolve => setImmediate(resolve));
const deferred = () => { let resolve, reject; const promise = new Promise((ok, fail) => { resolve = ok; reject = fail; }); return { promise, resolve, reject }; };
function load(file, dependencies) {
     const source = ts.transpileModule(fs.readFileSync(path.join(root, file), "utf8"), {
          fileName: file, reportDiagnostics: true,
          compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
     });
     assert.deepEqual(source.diagnostics, []);
     const exports = {};
     vm.runInNewContext(source.outputText, { exports, Error, Date, console, window: { addEventListener() {}, removeEventListener() {}, location: { reload() {} } }, alert() {}, crypto: require("node:crypto").webcrypto, setTimeout, clearTimeout, require: dependencies });
     return exports;
}
function harness(file, api = {}, fetch = async () => ({ success: true, data: { records: [], summary: {} } }), post = async () => ({ status: true })) {
     let cursor = 0;
     const states = [], dependencies = [], effects = [], cleanups = [], requests = [];
     const changed = (index, next) => !dependencies[index] || !next || next.some((value, i) => value !== dependencies[index][i]);
     const react = {
          ...React,
          useState(initial) { const i = cursor++; if (!(i in states)) states[i] = typeof initial === "function" ? initial() : initial; return [states[i], value => { states[i] = typeof value === "function" ? value(states[i]) : value; }]; },
          useRef(initial) { const i = cursor++; if (!(i in states)) states[i] = { current: initial }; return states[i]; },
          useEffect(callback, next) { const i = cursor++; if (changed(i, next)) { dependencies[i] = next; effects.push(() => { cleanups[i]?.(); cleanups[i] = callback(); }); } },
          useCallback(callback, next) { const i = cursor++; if (changed(i, next)) { dependencies[i] = next; states[i] = callback; } return states[i]; },
          useMemo(callback, next) { const i = cursor++; if (changed(i, next)) { dependencies[i] = next; states[i] = callback(); } return states[i]; },
     };
     const customFetch = async url => { requests.push(url); return fetch(url); };
     const Component = load(file, name => {
          if (name === "react") return react;
          if (name === "react/jsx-runtime" || name === "dayjs" || name === "xlsx") return require(name);
          if (name === "next/navigation") return { useSearchParams: () => new URLSearchParams(api.__query || ""), useRouter: () => ({ push() {}, refresh() {} }) };
          if (name === "react-bootstrap") return new Proxy({}, { get: (_, key) => key === "Button" ? "button" : new Proxy(() => null, { get: (_, child) => `Bootstrap.${String(child)}` }) });
          if (name.includes("financialControls")) return load("lib/billing/financialControls.ts", () => ({ customFetch }));
          if (name.includes("submissionIdentity")) return { billingSubmissionIdentity: () => ({ key: "refund-test-request-0001", complete() {} }) };
          if (name.includes("usePageStickyTableHeader")) return { __esModule: true, default() {} };
          if (name.includes("billingLib")) return { billingSource: [] };
          if (name.endsWith("/roles")) return load("components/Auth/roles.ts", require);
          if (name.includes("accountingApi")) return { accountingApi: api };
          if (name.includes("bankStatement")) return load("lib/accounting/bankStatement.ts", require);
          if (name.includes("ReportShell")) return { __esModule: true, default: "ReportShell", formatRange: (from, to) => `${from} to ${to}` };
          if (name.includes("customFetch")) return { currencyFormatter: { format: value => Number(value).toFixed(2), resolvedOptions: () => ({ currency: "GHS" }) }, customFetch, customPost: post, fetchPatientPersonalInfo: async () => ({ result: { patientid: 1 } }) };
          if (name.includes("useApplication")) return { useApplication: () => api.__application || ({ branchid: 1, user: { employeeid: 1, role: "admin" } }), useApplicationSettings: () => ({ applicationsettings: { user: { employeeid: 1 } } }) };
          if (name.includes("encryption")) return { plsDecryption: value => value, plsEncryption: value => value };
          if (name.includes("allocateWaiver")) return { allocateWaiver: () => ({}) };
          if (name === "react-toastify") return { toast: { error() {}, success() {} } };
          if (name === "@remixicon/react" || name.endsWith(".css")) return new Proxy({}, { get: (_, key) => key });
          return { __esModule: true, default: name.includes("DateFilter") ? "DateFilter" : name.includes("AccountingSummary") ? "AccountingSummary" : "MockComponent" };
     }).default;
     return {
          requests,
          render(props = {}) { cursor = 0; return Component(props); },
          flush() { while (effects.length) effects.shift()(); },
          close() { cleanups.forEach(cleanup => cleanup?.()); },
     };
}
const sheet = (totals = {}, rows = {}) => ({ status: "success", result: { assets: [], liabilities: [], equity: [], ...rows, totals: { assets: 0, liabilities: 0, equity: 0, retainedProfit: 0, liabilitiesAndEquity: 0, difference: 0, ...totals } } });
const pnl = () => ({ status: "success", result: { revenue: [], costOfSales: [], operatingExpenses: [], totals: { revenue: 0, costOfSales: 0, grossProfit: 0, operatingExpenses: 0, netProfit: 0 } } });
const tb = (debits = 0, credits = 0) => ({ status: "success", result: { rows: [], totals: { debits, credits, balanced: true } } });
test('financial closing notice shows the authoritative overdue date and leaves closing available', async () => {
     for (const ledger of ['facility', 'pharmacy']) {
          const calls = [];
          const closeUrl = ledger === 'pharmacy' ? '/pharmacy/finance' : '/accounting/daily-close?financialDate=2026-11-02';
          const h = harness('components/accounting/FinancialDayReadinessNotice.tsx', {
               financialDayReadiness: async selected => {
                    calls.push(selected);
                    return { status: 'success', result: { branchId: 1, blocked: true, graceHours: 48, oldestFinancialDate: '2026-11-02', deadline: '2026-11-04T00:00:00.000Z', closeUrl } };
               },
          });
          try {
               h.render({ ledger }); h.flush(); await tick();
               const tree = h.render({ ledger });
               assert.match(text(tree), /Transactions blocked.*2026-11-02.*2026-11-04.*UTC/);
               assert.match(text(tree), /Administrator status does not bypass/);
               assert.equal(nodes(tree, node => node.props?.href === closeUrl).length, 1);
               assert.deepEqual(calls, [ledger]);
          } finally { h.close(); }
     }
});
test('financial closing notice never reports an unknown or cross-branch status as ready', async () => {
     for (const response of [{ status: 'error', message: 'Closing status unavailable' }, { status: 'success', result: { branchId: 2, blocked: false } }]) {
          const h = harness('components/accounting/FinancialDayReadinessNotice.tsx', { financialDayReadiness: async () => response });
          try {
               h.render(); h.flush(); await tick();
               const tree = h.render();
               assert.match(text(tree), /Closing and reconciliation remain available/);
               assert.doesNotMatch(text(tree), /No unclosed financial activity/);
          } finally { h.close(); }
     }
});
test('financial closing notice refreshes after closing and preserves the grace-period deadline', async () => {
     let blocked = true;
     const h = harness('components/accounting/FinancialDayReadinessNotice.tsx', {
          financialDayReadiness: async () => ({ status: 'success', result: { branchId: 1, blocked, oldestFinancialDate: blocked ? '2026-11-02' : null, graceHours: 48, deadline: blocked ? '2026-11-04T00:00:00.000Z' : null, closeUrl: '/pharmacy/finance' } }),
     });
     try {
          h.render({ ledger: 'pharmacy', refreshKey: 1 }); h.flush(); await tick();
          assert.match(text(h.render({ ledger: 'pharmacy', refreshKey: 1 })), /Transactions blocked/);
          blocked = false;
          h.render({ ledger: 'pharmacy', refreshKey: 2 }); h.flush(); await tick();
          assert.match(text(h.render({ ledger: 'pharmacy', refreshKey: 2 })), /No unclosed financial activity/);
     } finally { h.close(); }
});
test('an overdue-day link updates an already-open daily-close page to the blocking date', async () => {
     const filters = [];
     const api = { __query: '', dailyCloses: async value => { filters.push(value); return { status: 'success', result: { data: [], total: 0 } }; } };
     const h = harness('app/accounting/daily-close/page.tsx', api);
     try {
          h.render(); h.flush(); await tick();
          api.__query = 'financialDate=2026-11-02';
          h.render(); h.flush(); await tick();
          h.render(); h.flush(); await tick();
          assert.equal(filters.at(-1).from, '2026-11-02');
          assert.equal(filters.at(-1).to, '2026-11-02');
     } finally { h.close(); }
});
for (const [page, method, success] of [
     ["balance-sheet", "balanceSheet", sheet],
     ["trial-balance", "trialBalance", tb],
     ["income-statement", "incomeStatement", pnl],
     ["cash-flow", "cashFlow", () => ({ status: "success", result: { lines: [], classificationIssues: [], totals: { openingCash: 0, operating: 0, investing: 0, financing: 0, netMovement: 0, closingCash: 0 } } })],
]) {
     test(`${page}: loading, failed and malformed responses cannot masquerade as zero-valued statements`, async () => {
          const pending = deferred();
          const h = harness(`app/accounting/${page}/page.tsx`, { [method]: () => pending.promise });
          let tree = h.render();
          assert.equal(tree.props.exportable, false);
          assert.doesNotMatch(text(tree), /Balance check: PASS|Debits = Credits/);
          assert.equal(nodes(tree, n => n.type === "AccountingSummary").length, 0);
          h.flush(); pending.resolve({ status: "error", message: "Financial data unavailable" }); await tick();
          tree = h.render();
          assert.equal(tree.props.exportable, false);
          assert.match(text(tree), /Financial data unavailable/);
          h.close();
          const malformed = harness(`app/accounting/${page}/page.tsx`, { [method]: async () => ({ status: "success", result: {} }) });
          malformed.render(); malformed.flush(); await tick();
          tree = malformed.render();
          assert.equal(tree.props.exportable, false);
          assert.equal(nodes(tree, n => n.props?.role === "alert").length, 1);
          malformed.close();
     });
     test(`${page}: a verified genuine zero statement remains available`, async () => {
          const h = harness(`app/accounting/${page}/page.tsx`, { [method]: async () => success() });
          h.render(); h.flush(); await tick();
          assert.equal(h.render().props.exportable, true);
          h.close();
     });
}
test("one-cent differences fail balance checks even when the API marks the trial balance balanced", async () => {
     const bs = harness("app/accounting/balance-sheet/page.tsx", { balanceSheet: async () => sheet({ assets: 0.01, difference: 0.01 }) });
     bs.render(); bs.flush(); await tick(); assert.match(text(bs.render()), /Balance check: FAIL/); bs.close();
     const trial = harness("app/accounting/trial-balance/page.tsx", { trialBalance: async () => tb(1, 0.99) });
     trial.render(); trial.flush(); await tick(); assert.match(text(trial.render()), /Debits \u2260 Credits/); trial.close();
});
test("balance-sheet cutoffs hide old totals immediately and ignore late earlier requests", async () => {
     const replies = [];
     const h = harness("app/accounting/balance-sheet/page.tsx", { balanceSheet: () => { const reply = deferred(); replies.push(reply); return reply.promise; } });
     h.render(); h.flush();
     nodes(h.render(), n => n.type === "DateFilter")[0].props.onDateRangeChange("2026-09-30", "2026-09-30");
     assert.equal(h.render().props.exportable, false); h.flush();
     replies[1].resolve(sheet({ assets: 200, equity: 200, liabilitiesAndEquity: 200 })); await tick();
     assert.match(text(h.render()), /200\.00/);
     replies[0].resolve(sheet({ assets: 999, equity: 999, liabilitiesAndEquity: 999 })); await tick();
     assert.doesNotMatch(text(h.render()), /999\.00/);
     nodes(h.render(), n => n.type === "DateFilter")[0].props.onDateRangeChange("2026-08-31", "2026-08-31");
     const loading = h.render(); assert.equal(loading.props.exportable, false); assert.doesNotMatch(text(loading), /200\.00/);
     h.flush(); replies[2].reject(new Error("New cutoff unavailable")); await tick();
     assert.match(text(h.render()), /New cutoff unavailable/); assert.doesNotMatch(text(h.render()), /Balance check: PASS/);
     h.close();
});
test("balance-sheet classification uses metadata, never illustrative account-number ranges", async () => {
     const h = harness("app/accounting/balance-sheet/page.tsx", { balanceSheet: async () => sheet({}, {
          assets: [{ account_code: "99999", name: "Custom fixed asset", type: "asset", normal_balance: "debit", balance: 12, statement_classification: "non_current" }],
          liabilities: [{ account_code: "2000", name: "Unclassified loan", type: "liability", normal_balance: "credit", balance: 12 }],
     }) });
     h.render(); h.flush(); await tick();
     const tree = h.render();
     assert.match(text(tree), /Non-current AssetsCustom fixed asset12\.00/);
     assert.match(text(tree), /Unclassified LiabilitiesUnclassified loan12\.00/);
     assert.match(text(tree), /not inferred from their account numbers/);
     h.close();
});
test("receivables and payables initially include all open document dates", async () => {
     for (const ledger of ["AR", "AP"]) {
          const calls = [];
          const record = filters => { calls.push(filters); return Promise.resolve({ status: "success", result: { rows: [], total: 0, totals: { total: 0 } } }); };
          const h = harness("components/accounting/SubledgerReport.tsx", { outstandingReceivables: record, payableAging: (_, filters) => record(filters) });
          h.render({ ledger, title: "Outstanding", partyLabel: "Customer" }); h.flush(); await tick();
          const tree = h.render({ ledger, title: "Outstanding", partyLabel: "Customer" });
          assert.equal(calls[0].from, "");
          assert.equal(nodes(tree, n => n.type === "DateFilter")[0].props.value, "All");
          assert.match(tree.props.range, /^All open documents through /);
          assert.equal(tree.props.exportable, true);
          h.close();
     }
});
test("cash collection distinguishes failed lookups from a verified empty result", async () => {
     for (const failure of [true, false]) {
          const h = harness("app/billing/cash-collection/page.tsx", {}, async url => {
               if (url.includes("bulk/outstanding")) { if (failure) throw new Error("Network unavailable"); return { success: true, data: { records: [] } }; }
               return [];
          });
          let tree = h.render();
          const input = nodes(tree, n => n.type === "input" && /[Bb]ill/.test(n.props.placeholder || ""))[0];
          assert.ok(input); input.props.onChange({ target: { value: "100" } }); tree = h.render();
          const search = nodes(tree, n => n.type === "form" && n.props["aria-label"] === "Find a bill")[0];
          assert.ok(search); search.props.onSubmit({ preventDefault() {} }); await tick();
          tree = h.render();
          assert.equal(/Retry bill search/.test(text(tree)), failure);
          assert.equal(/No billing records found/.test(text(tree)), !failure);
          h.close();
     }
});
const parser = load("lib/accounting/bankStatement.ts", require);
test("bank dates are explicit and calendar-valid; ambiguous values follow the selected format", () => {
     assert.equal(parser.bankStatementDate("03/11/2026", "DMY"), "2026-11-03");
     assert.equal(parser.bankStatementDate("03/11/2026", "MDY"), "2026-03-11");
     assert.equal(parser.bankStatementDate("31/10/2026", "DMY"), "2026-10-31");
     assert.equal(parser.bankStatementDate("2026/10/31", "YMD"), "2026-10-31");
     assert.equal(parser.bankStatementDate("2026-10-31", "DMY"), "2026-10-31");
     assert.equal(parser.bankStatementDate(46326, "DMY"), "2026-10-31");
     assert.equal(parser.bankStatementDate(44864, "DMY", true), "2026-10-31");
     assert.throws(() => parser.bankStatementDate("31/02/2026", "DMY"));
     assert.throws(() => parser.bankStatementDate("31/10/2026", "MDY"));
     assert.throws(() => parser.bankStatementDate("31/10-2026", "DMY"));
});
test("bank amounts preserve withdrawal signs and reject invalid text rather than stripping it", () => {
     assert.equal(parser.bankStatementAmount("(100.00)"), -100);
     assert.equal(parser.bankStatementAmount("1,234.50 DR"), -1234.5);
     assert.equal(parser.bankStatementAmount("100.00 CR"), 100);
     assert.equal(parser.bankStatementAmount("-100.00"), -100);
     assert.throws(() => parser.bankStatementAmount("1O0.00"));
     assert.throws(() => parser.bankStatementAmount("1,00.00"));
     assert.throws(() => parser.bankStatementAmount("(100.00) CR"));
     assert.throws(() => parser.bankStatementAmount("(-100.00)"));
     assert.equal(parser.bankStatementAmount(0.1 + 0.2), 0.3);
     const preview = parser.parseBankStatement([["Date", "Description", "Reference", "Debit", "Credit"], ["31/10/2026", "Withdrawal", "A", "100", ""], ["31/02/2026", "Bad date", "B", "", "200"]], "DMY");
     assert.equal(preview.lines.length, 1); assert.equal(preview.lines[0].amount, -100);
     assert.equal(preview.problems.length, 1);
     for (const [debit, credit] of [["-100", ""], ["100", "50"]]) {
          assert.equal(parser.parseBankStatement([["31/10/2026", "Invalid", "A", debit, credit]], "DMY").problems.length, 1);
     }
});
test("gross cash-flow classification preserves offsetting receipts/payments and safely retries reviews", async () => {
     const calls = [], replies = [];
     const onSave = (...args) => { calls.push(args); const reply = deferred(); replies.push(reply); return reply.promise; };
     const props = { netAmount: 0, idPrefix: "cash-1", requireReason: true, onSave };
     const h = harness("components/accounting/CashFlowAllocationForm.tsx");
     let tree = h.render(props);
     assert.match(text(tree), /Net movement is zero/);
     assert.equal(nodes(tree, n => n.type === "button" && n.props.type === "submit")[0].props.disabled, true);
     function input(id, value) { nodes(h.render(props), n => n.props?.id === id)[0].props.onChange({ target: { value } }); }
     input("cash-1-operating-inflow", "100");
     input("cash-1-operating-outflow", "100");
     input("cash-1-reason", "Reviewed bank receipts and operating payment evidence");
     tree = h.render(props);
     assert.equal(nodes(tree, n => n.type === "button" && n.props.type === "submit")[0].props.disabled, false);
     const attempt = tree.props.onSubmit({ preventDefault() {} });
     await tree.props.onSubmit({ preventDefault() {} });
     assert.equal(calls.length, 1);
     assert.equal(calls[0][0][0].inflow, 100); assert.equal(calls[0][0][0].outflow, 100);
     replies[0].reject(new Error("Ambiguous network failure")); await attempt;
     assert.match(text(h.render(props)), /Ambiguous network failure/);
     const retry = h.render(props).props.onSubmit({ preventDefault() {} });
     assert.equal(calls[1][2], calls[0][2]);
     replies[1].resolve(); await retry;
     input("cash-1-operating-outflow", "99.99");
     assert.equal(nodes(h.render(props), n => n.type === "button" && n.props.type === "submit")[0].props.disabled, true);
     h.close();
});
test("bank statement review requests real paginated unmatched data and exposes later pages", async () => {
     const calls = [];
     const h = harness("app/accounting/bank-reconciliation/page.tsx", {
          bankAccounts: async () => ({ status: "success", result: [{ id: 1, name: "Bank" }] }),
          bankStatementLines: async (_, filters) => { calls.push(filters); return { status: "success", result: { data: Array.from({ length: filters.page === 1 ? 200 : 1 }, (_, index) => ({ id: (filters.page - 1) * 200 + index + 1, amount: 10, status: "unmatched" })), total: 201 } }; },
          bankUnmatchedLedger: async () => ({ status: "success", result: [] }),
          bankSummary: async () => ({ status: "success", result: { glBalance: 0, outstandingDeposits: 0, outstandingPayments: 0, adjustedBankBalance: 0, statementBalance: 0, difference: 0 } }),
     });
     h.render(); h.flush(); await tick(); h.render(); h.flush(); await tick();
     let tree = h.render();
     assert.equal(calls[0].status, "unmatched"); assert.equal(calls[0].page, 1); assert.equal(calls[0].count, 200);
     const next = nodes(tree, n => n.type === "button" && text(n) === "Next statement page")[0];
     assert.match(text(tree), /200 shown/);
     assert.equal(next.props.disabled, false); next.props.onClick();
     h.render(); h.flush(); await tick(); tree = h.render();
     assert.equal(calls[1].page, 2); assert.match(text(tree), /Page 2 of 2/); assert.match(text(tree), /1 shown/);
     assert.equal(nodes(tree, n => n.type === "button" && text(n) === "Next statement page")[0].props.disabled, true);
     h.close();
});
test("a cash lookup late failure cannot overwrite the next successful search", async () => {
     const replies = [];
     const h = harness("app/billing/cash-collection/page.tsx", {}, url => {
          if (!url.includes("bulk/outstanding")) return Promise.resolve([]);
          const reply = deferred(); replies.push(reply); return reply.promise;
     });
     const search = id => {
          let tree = h.render();
          nodes(tree, n => n.type === "input" && n.props.id === "collection-bill")[0].props.onChange({ target: { value: id } });
          tree = h.render(); nodes(tree, n => n.type === "form" && n.props["aria-label"] === "Find a bill")[0].props.onSubmit({ preventDefault() {} });
     };
     search("100"); search("200");
     replies[1].resolve({ success: true, data: { records: [] } }); await tick();
     replies[0].reject(new Error("Earlier request failed")); await tick();
     assert.match(text(h.render()), /No billing records found/);
     assert.doesNotMatch(text(h.render()), /Retry bill search|Earlier request failed/);
     h.close();
});
const closure = (billingid, closed = false) => ({ billingid, closed_status: closed ? "CLOSED" : "OPEN", closure_evidence: closed ? { closure_id: 7, closed_at: "2026-10-25T10:00:00Z", closed_by: 1, signed_off: true } : null });
const refundQuote = (remaining = 300, refunded = 100, closed = false) => ({
     ...closure(123, closed), remaining_refundable_amount: remaining, remaining_voidable_amount: remaining,
     remaining_tax_amount: 0, total_refunded_amount: refunded,
     refund_state: remaining === 0 ? "FULLY_REFUNDED" : refunded ? "PARTIALLY_REFUNDED" : "NOT_REFUNDED",
     can_refund_all: !closed && remaining > 0, services: [],
});
test("closure verification batches more than 200 sales and fails closed on incomplete results", async () => {
     const calls = [];
     const controls = load("lib/billing/financialControls.ts", () => ({ customFetch: async url => {
          calls.push(url); return { data: url.split("=")[1].split(",").map(id => closure(Number(id))) };
     } }));
     const result = await controls.fetchSaleClosures(Array.from({ length: 250 }, (_, i) => i + 1));
     assert.equal(result.size, 250); assert.equal(calls.length, 2);
     assert.equal(calls[0].split("=")[1].split(",").length, 200);
     const incomplete = load("lib/billing/financialControls.ts", () => ({ customFetch: async () => ({ data: [] }) }));
     await assert.rejects(() => incomplete.fetchSaleClosures([123]), /incomplete/);
     const badQuote = load("lib/billing/financialControls.ts", () => ({ customFetch: async () => ({ data: { ...refundQuote(), remaining_refundable_amount: -1 } }) }));
     await assert.rejects(() => badQuote.fetchRefundQuote(123), /could not be verified/);
});
test("sales list has a verified closed column and disables mutation actions without hiding receipts", async () => {
     const h = harness("components/Billing/BilledClientsView.tsx", {}, async () => ({ data: [closure(123, true)] }));
     const props = { data: [{ billingid: 123, patientid: 1, billedon: "2026-10-24", fullname: "Synthetic client", outstanding: 100 }], branchid: 1 };
     let tree = h.render(props);
     assert.match(text(tree), /Sales closing/); assert.match(text(tree), /Verifying/);
     h.flush(); await tick(); tree = h.render(props);
     assert.match(text(tree), /Closed - read-only/);
     const actions = nodes(tree, n => n.type === "Bootstrap.Item");
     for (const label of ["Correct Billing Source", "Update Transaction", "Void Transaction"]) {
          const action = actions.find(n => text(n).includes(label)); assert.ok(action, label); assert.equal(action.props.disabled, true);
     }
     assert.ok(actions.some(n => /Print Receipt A4/.test(text(n)) && !n.props.disabled));
     assert.ok(nodes(tree, n => n.type === "a" && n.props.href === "/accounting/daily-close?closeId=7").length);
     h.close();
});
test("refund remaining uses the server quote, a POST retry key, and never re-subtracts earlier refunds", async () => {
     const calls = []; let quote = refundQuote(100, 300);
     const h = harness("app/billing/transactions/previous-transaction/[billingid]/PreviousTransactionWorkspace.tsx", {}, async url => {
          if (url.startsWith("billing/refund-quote")) return { data: quote };
          if (url.startsWith("billing/previous/transaction/data")) return { result: [{ billingid: 123, payable: 100, paid: 100, totalrefunded: 300, islocked: 0 }] };
          return { result: [] };
     }, async (...args) => { calls.push(args); quote = refundQuote(0, 400); return { status: true }; });
     const props = { billingid: 123 };
     h.render(props); h.flush(); await tick();
     let tree = h.render(props);
     const start = nodes(tree, n => n.type === "button" && text(n).includes("Refund remaining"))[0];
     assert.ok(start); assert.equal(start.props.disabled, false); start.props.onClick();
     tree = h.render(props);
     assert.match(text(tree), /Already refunded: 300\.00/); assert.match(text(tree), /Remaining cash refund: 100\.00/);
     const set = (id, value) => nodes(h.render(props), n => n.props?.id === id)[0].props.onChange({ target: { value } });
     set("refundAllReason", "Refund the remaining services"); set("refundAllAcknowledge", "I acknowledge"); set("refundAllPaymentMode", "1");
     tree = h.render(props);
     const confirm = nodes(tree, n => n.type === "button" && /Refund All$/.test(text(n)))[0];
     assert.ok(confirm); await confirm.props.onClick(); await tick();
     assert.equal(calls.length, 1); assert.equal(calls[0][0], "billing/refund-all"); assert.equal(calls[0][1], "POST");
     assert.equal(calls[0][2].billingid, 123); assert.equal(calls[0][2].selectedPaymentMode, 1);
     assert.ok(calls[0][2].request_key);
     assert.equal("amount" in calls[0][2], false);
     assert.equal(h.requests.some(url => url.includes("previous/refund/all")), false);
     assert.equal(nodes(h.render(props), n => n.type === "button" && text(n).includes("Refund remaining"))[0].props.disabled, true);
     h.close();
});
test("closed transaction detail is read-only and unverified controls do not enable refunds", async () => {
     for (const closed of [true, false]) {
          const h = harness("app/billing/transactions/previous-transaction/[billingid]/PreviousTransactionWorkspace.tsx", {}, async url => {
               if (url.startsWith("billing/refund-quote")) { if (!closed) throw new Error("Controls unavailable"); return { data: refundQuote(300, 100, true) }; }
               if (url.startsWith("billing/previous/transaction/data")) return { result: [{ billingid: 123, payable: 300, paid: 300, totalrefunded: 100, islocked: 0 }] };
               return { result: [] };
          });
          const props = { billingid: 123 };
          h.render(props); h.flush(); await tick(); const tree = h.render(props);
          assert.match(text(tree), closed ? /Closed sale - read-only/ : /Controls unavailable/);
          const action = nodes(tree, n => n.type === "button" && text(n).includes("Refund remaining"))[0];
          assert.ok(action); assert.equal(action.props.disabled, true);
          h.close();
     }
});
test("sales closing links open the existing signed-off financial-day evidence", async () => {
     const calls = [];
     const h = harness("app/accounting/daily-close/page.tsx", {
          __query: "closeId=7",
          dailyCloses: async () => ({ status: "success", result: { data: [], total: 0 } }),
          dailyClose: async id => { calls.push(id); return { status: "success", result: { closure: { id: 7, branchid: 1, financial_date: "2026-10-24", status: "finalized", version: 1 }, actions: [], snapshots: [], lockedRecords: 4 } }; },
     });
     h.render(); h.flush(); await tick(); const tree = h.render();
     assert.deepEqual(calls, [7]);
     assert.match(text(tree), /24 Oct 2026|2026-10-24/);
     h.close();
});

for (const [status, preparer, reviewer, action, blocked] of [
     ['accountant_submitted', 1, null, 'Approve', true],
     ['accountant_submitted', 1, null, 'Return', true],
     ['accountant_submitted', 2, null, 'Approve', false],
     ['manager_approved', 1, 2, 'Finalize', true],
     ['manager_approved', 2, 1, 'Finalize', true],
     ['manager_approved', 2, 3, 'Finalize', false],
]) {
     test(`daily close ${action}: preparer ${preparer}, reviewer ${reviewer} respects employee separation`, async () => {
          const h = harness("app/accounting/daily-close/page.tsx", {
               dailyCloses: async () => ({ status: 'success', result: { data: [{ id: 7, branchid: 1, financial_date: '2026-11-03', status, workflow_version: 1, accountant_employeeid: preparer, manager_employeeid: reviewer }], total: 1 } }),
          });
          h.render(); h.flush(); await tick(); const tree = h.render();
          assert.match(text(tree), /does not change your role or lock the day/);
          assert.doesNotMatch(text(tree), /Accountant submitted/);
          const button = nodes(tree, n => n.type === 'button' && text(n) === action)[0];
          assert.ok(button);
          assert.equal(Boolean(button.props.disabled), blocked);
          if (blocked) {
               assert.match(text(tree), /You prepared/);
               button.props.onClick();
               assert.equal(nodes(h.render(), n => n.props?.show === true).length, 0, 'handler also blocks a stale or programmatic click');
          }
          h.close();
     });
}

          for (const [status, label, method] of [
               ['accountant_submitted', 'Override approval', 'decideDailyClose'],
               ['manager_approved', 'Override finalization', 'finalizeDailyClose'],
          ]) {
               test(`daily close ${label} requires explicit reason and PIN and forwards audit intent`, async () => {
                    const calls = [];
                    const h = harness("app/accounting/daily-close/page.tsx", {
                         dailyCloses: async () => ({ status: 'success', result: { data: [{ id: 7, branchid: 1, financial_date: '2026-11-03', status, workflow_version: 1, accountant_employeeid: 1, manager_employeeid: 1 }], total: 1 } }),
                         [method]: async (id, body) => { calls.push({ id, body }); return { status: 'success' }; },
                    });
                    h.render(); h.flush(); await tick(); let tree = h.render();
                    nodes(tree, n => n.type === 'button' && text(n) === label)[0].props.onClick();
                    tree = h.render();
                    assert.match(text(tree), /authorizing an exception to independent review/);
                    let confirm = nodes(tree, n => n.type === 'button' && n.props.onClick && /Confirm administrator override|Override and finalize permanently/.test(text(n)))[0];
                    assert.equal(confirm.props.disabled, true);
                    await confirm.props.onClick();
                    assert.equal(calls.length, 0);
                    nodes(tree, n => n.props?.id === 'daily-close-override-reason')[0].props.onChange({ target: { value: 'No independent reviewer is available today.' } });
                    nodes(tree, n => n.type === 'input' && n.props.type === 'password')[0].props.onChange({ target: { value: '1234' } });
                    tree = h.render();
                    confirm = nodes(tree, n => n.type === 'button' && n.props.onClick && /Confirm administrator override|Override and finalize permanently/.test(text(n)))[0];
                    assert.equal(confirm.props.disabled, false);
                    await confirm.props.onClick();
                    assert.equal(calls.length, 1);
                    assert.equal(calls[0].body.overrideSegregationOfDuties, true);
                    assert.equal(calls[0].body.overrideReason, 'No independent reviewer is available today.');
                    assert.equal(calls[0].body.pin, '1234');
                    assert.equal(calls[0].body.expectedVersion, 1);
                    h.close();
               });
          }
          test("accountants do not see administrator exception actions", async () => {
               const h = harness("app/accounting/daily-close/page.tsx", {
                    __application: { branchid: 1, user: { employeeid: 1, role: 'accountant' } },
                    dailyCloses: async () => ({ status: 'success', result: { data: [{ id: 7, status: 'accountant_submitted', financial_date: '2026-11-03', accountant_employeeid: 1 }], total: 1 } }),
               });
               h.render(); h.flush(); await tick();
               assert.equal(nodes(h.render(), n => n.type === 'button' && /Override approval/.test(text(n))).length, 0);
               h.close();
          });
