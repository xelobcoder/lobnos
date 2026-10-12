const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");
const ts = require("typescript");
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");

const root = path.join(__dirname, "..");
const scope = path.join(root, "app/commissions/organizations");
const source = file => fs.readFileSync(file, "utf8");
const money = new Intl.NumberFormat("en-GH", { style: "currency", currency: "GHS" });
const pages = [
  "pending-commissions/page.tsx", "commission-details/[organization]/page.tsx",
  "commission-update/[organization]/page.tsx", "commissions-paid/[organization]/page.tsx",
  "untracked-commission-records/page.tsx",
  "untracked-commission-records/recipient/[recipient_type]/[recipient_id]/page.tsx",
];

function tag(name) {
  return function TestElement({ children, ...props }) {
    const safe = Object.fromEntries(Object.entries(props).filter(([key]) =>
      /^(aria-|data-|on[A-Z])/.test(key) ||
      /^(id|className|style|type|value|min|max|step|required|disabled|checked|htmlFor|form|href|target|rel)$/.test(key)));
    return React.createElement(name, safe, children);
  };
}
const Modal = tag("section");
Modal.Header = tag("header");
Modal.Title = tag("h2");
Modal.Body = tag("div");
Modal.Footer = tag("footer");
const Form = tag("form");
Form.Group = tag("div");
Form.Label = tag("label");
Form.Control = tag("input");
Form.Select = tag("select");
Form.Text = tag("small");

function load(file, overrides = {}) {
  const result = ts.transpileModule(source(file), {
    fileName: file, reportDiagnostics: true,
    compilerOptions: {
      module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020,
      jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true,
    },
  });
  assert.deepEqual(result.diagnostics, [], `TSX syntax: ${file}`);
  const exports = {};
  vm.runInNewContext(result.outputText, {
    exports, console, Map, Set,
    require(name) {
      if (name === "react") return overrides.react || React;
      if (name === "react-bootstrap") return { Modal, Form, Button: tag("button") };
      if (name === "next/link") return tag("a");
      if (name === "@remixicon/react") return new Proxy({}, { get: () => tag("svg") });
      if (name === "react-toastify") return { toast: { success() {}, error() {} } };
      if (name.includes("customFetch")) return {
        currencyFormatter: money,
        customFetch: overrides.fetch || (async () => ({ status: true, result: [], data: [] })),
        customPost: overrides.post || (async () => ({ status: true })),
      };
      if (name.includes("useApplicationContext")) return {
        useApplication: () => overrides.application || { user: { employeeid: "8" }, branchid: 3 },
      };
      if (name.includes("exportCommissionPdf")) return { exportCommissionDataToPDF: overrides.export || (() => {}) };
      if (name.endsWith(".css")) return new Proxy({}, { get: (_, key) => String(key) });
      if (name.includes("Datatables/PrimeTable")) return function PrimeTable(props) {
        return React.createElement("div", { "data-prime-table": true, "data-rows": props.data.length });
      };
      if (name.includes("DateFilterReusable")) return tag("select");
      if (name.endsWith("/Loader")) return tag("svg");
      if (name.includes("CommissionLineChart")) return tag("div");
      if (name.startsWith(".")) return load(path.resolve(path.dirname(file), `${name}.tsx`), overrides);
      return require(name);
    },
  }, { filename: file });
  return exports;
}

// Execute actual page/hook handlers with synthetic responses, never clinical data.
function harness(relative, api = {}, props = { params: { organization: "17" } }, exportName = "default") {
  const states = [], refs = [], memos = [], dependencies = [], effects = [], cleanups = [];
  let cursor = 0;
  const react = {
    ...React,
    useState(initial) {
      const index = cursor++;
      if (!(index in states)) states[index] = typeof initial === "function" ? initial() : initial;
      return [states[index], value => { states[index] = typeof value === "function" ? value(states[index]) : value; }];
    },
    useRef(initial) { const index = cursor++; return refs[index] ||= { current: initial }; },
    useMemo(factory, deps) {
      const index = cursor++;
      if (!memos[index] || deps.some((value, i) => value !== memos[index].deps[i])) {
        memos[index] = { value: factory(), deps };
      }
      return memos[index].value;
    },
    useCallback(callback, deps) { return react.useMemo(() => callback, deps); },
    useEffect(effect, deps) {
      const index = cursor++;
      if (!dependencies[index] || deps.some((value, i) => value !== dependencies[index][i])) {
        dependencies[index] = deps;
        effects.push(() => { cleanups[index]?.(); cleanups[index] = effect(); });
      }
    },
  };
  const Component = load(path.join(scope, relative), { ...api, react })[exportName];
  return {
    render(nextProps = props) { cursor = 0; return Component(nextProps); },
    async flush() {
      effects.splice(0).forEach(effect => effect());
      for (let i = 0; i < 20; i++) await Promise.resolve();
    },
  };
}
function nodes(tree, predicate, result = []) {
  if (!tree || typeof tree !== "object") return result;
  if (Array.isArray(tree)) { tree.forEach(child => nodes(child, predicate, result)); return result; }
  if (predicate(tree)) result.push(tree);
  nodes(tree.props?.children, predicate, result);
  return result;
}
const text = tree => typeof tree === "string" || typeof tree === "number" ? String(tree)
  : Array.isArray(tree) ? tree.map(text).join("") : text(tree?.props?.children || "");
const named = (tree, id) => nodes(tree, node => node.props?.id === id)[0];
const button = (tree, label) => nodes(tree, node => node.props?.onClick && text(node) === label)[0];
const table = tree => nodes(tree, node => node.type?.name === "OrganizationTable")[0];
const toolbar = tree => nodes(tree, node => node.type?.name === "DateToolbar")[0];
const metrics = tree => nodes(tree, node => node.type?.name === "SummaryMetric");
const submitted = { preventDefault() {} };
const record = {
  id: 9, service_id: 12, serviceid: 12, organization_id: 17,
  organization_name: "Example organization", organization_phone: "000", service_date: "2026-01-01",
  total_services: 1, total_payable: "100", total_paid: "50", commission_earned_total: "20",
  commission_earned: "20", service_amount: "100", final_commission: "20",
  min_cap_adjustment: "0", max_cap_adjustment: "0", period_cap_adjustment: "0",
  config_id: 4, recipient_type: "organization", recipient_id: 17,
  test_name: "Example service", serviceCategory: "Laboratory", commission_type: "fixed",
  status: "pending", totalpayable: "100", paidamount: "50", paymentstatus: "paid",
  clinicianId: null, organizationId: 17,
};

test("every owned page compiles and has no badges, pills, decorative bubbles or hard-coded palette", () => {
  const files = fs.readdirSync(scope, { recursive: true }).filter(file => /\.(tsx|css)$/.test(file));
  for (const relative of files) {
    const file = path.join(scope, relative);
    assert.doesNotMatch(source(file), /\bBadge\b|\bbadge\b|rounded-pill|rounded-circle|oklch\(|#[0-9a-f]{3,8}\b/i, relative);
    if (relative.endsWith(".tsx")) load(file);
  }
  assert.equal(pages.filter(file => fs.existsSync(path.join(scope, file))).length, 6);
});

test("exact customer summary presentation formats currency, counts and unknowns", () => {
  const { SummaryMetric } = load(path.join(scope, "OrganizationUi.tsx"));
  const render = props => renderToStaticMarkup(React.createElement(SummaryMetric, {
    title: "Commission", subtitle: "Returned records", variant: "primary", ...props,
  }));
  assert.match(render({ value: null }), /card border-0 shadow-sm bg-primary bg-gradient text-white rounded-3 h-100/);
  assert.match(render({ value: null }), /card-body p-3/);
  assert.match(render({ value: null }), /<h3 class="fw-bold mb-0">—<\/h3>/);
  assert.match(render({ value: null }), /aria-hidden="true"/);
  assert.match(render({ value: 1234 }), /1,234/);
  assert.match(render({ value: 120.5, financial: true }), /120\.50/);
});

test("response validation distinguishes an empty response from failure and malformed data", () => {
  const { reportRecords } = load(path.join(scope, "OrganizationUi.tsx"));
  assert.equal(reportRecords({ status: true, data: [] }, "data").length, 0);
  assert.equal(reportRecords({ status: "success", result: [record] }, "result").length, 1);
  for (const response of [null, {}, { status: false, data: [] }, { status: "error", data: [] }, { success: false, data: [] }]) {
    assert.throws(() => reportRecords(response, "data"), /Unable to load/);
  }
});

test("list pages expose honest loading, failure, empty and initial-response summaries", async () => {
  for (const relative of [pages[0], pages[2], pages[3], "UntrackedServices.tsx"]) {
    const failed = harness(relative, { fetch: async () => ({ status: false, message: "Denied" }) });
    assert.ok(metrics(failed.render()).every(node => node.props.value === null), relative);
    await failed.flush();
    const failedTree = failed.render();
    assert.ok(metrics(failedTree).every(node => node.props.value === null), relative);
    assert.equal(table(failedTree), undefined);
    assert.equal(nodes(failedTree, node => node.type?.name === "ReportState")[0].props.error, "Denied");
    const empty = harness(relative);
    empty.render(); await empty.flush();
    assert.ok(metrics(empty.render()).every(node => node.props.value === 0), relative);
    assert.equal(table(empty.render()), undefined);
  }
});

test("pagination preserves backend page/count/date/recipient parameters without changing parent records", async () => {
  for (const relative of [pages[0], pages[2], pages[3], "UntrackedServices.tsx"]) {
    const urls = [];
    const app = harness(relative, { fetch: async url => {
      urls.push(url);
      return { status: true, result: [record], data: [record] };
    } });
    app.render(); await app.flush();
    const before = table(app.render()).props.data;
    const handler = table(app.render()).props.handleSeverSideProcessing;
    const result = await handler({ page: 3, count: 25, sortby: "DESC" });
    assert.equal(result.error, false);
    assert.equal(result.result.length, 1);
    assert.match(urls.at(-1), /page=3/);
    assert.match(urls.at(-1), /count=25/);
    assert.match(urls.at(-1), /startDate=.*endDate=/);
    assert.equal(table(app.render()).props.data, before);
    if (relative !== pages[0] && relative !== "UntrackedServices.tsx") assert.match(urls.at(-1), /(?:recipientType|recipient_type)=organization/);
  }
});

test("table wrapper retains successful rows and announces server failure rather than an empty list", async () => {
  const app = harness("OrganizationUi.tsx", {}, {
    data: [record], column: [], handleSeverSideProcessing: async () => ({ result: [], error: "Pagination failed" }),
  }, "OrganizationTable");
  const prime = nodes(app.render(), node => node.type?.name === "PrimeTable")[0];
  const result = await prime.props.handleSeverSideProcessing({ page: 2, count: 10 });
  assert.equal(result.result[0], record);
  assert.equal(result.error, "Pagination failed");
  const alert = nodes(app.render(), node => node.props?.role === "alert")[0];
  assert.match(text(alert), /last successfully loaded rows remain visible/);
});

test("a stale request cannot overwrite records from a new date or recipient scope", async () => {
  let finishOld, finishNew;
  const oldRequest = () => new Promise(resolve => { finishOld = resolve; });
  const newRequest = () => new Promise(resolve => { finishNew = resolve; });
  const app = harness("OrganizationUi.tsx", {}, oldRequest, "useOrganizationReport");
  assert.equal(app.render().loading, true);
  await app.flush();
  app.render(newRequest); await app.flush();
  finishNew([{ id: 2 }]);
  await app.flush();
  assert.equal(app.render(newRequest).data[0].id, 2);
  finishOld([{ id: 1 }]);
  await app.flush();
  assert.equal(app.render(newRequest).data[0].id, 2);
  assert.equal(app.render(newRequest).loading, false);
});

test("organization update preserves audited payload, rejects invalid amounts and retains values on failure", async () => {
  const posts = [];
  const app = harness(pages[2], {
    fetch: async () => ({ status: true, data: [record] }),
    post: async (...args) => { posts.push(args); return { status: false, message: "Update rejected" }; },
  });
  app.render(); await app.flush();
  table(app.render()).props.column.find(column => column.id === "actions").Cell({ row: { original: record } }).props.onClick();
  let tree = app.render();
  const input = nodes(tree, node => node.props?.type === "number")[0];
  input.props.onChange({ target: { value: "NaN" } });
  await named(app.render(), "organization-commission-update").props.onSubmit(submitted);
  assert.equal(posts.length, 0);
  nodes(app.render(), node => node.props?.type === "number")[0].props.onChange({ target: { value: "7.50" } });
  await named(app.render(), "organization-commission-update").props.onSubmit(submitted);
  assert.match(posts[0][0], /update-rates\/9\?employeeid=8/);
  assert.equal(posts[0][1], "PUT");
  assert.equal(posts[0][2].recipientId, 17);
  assert.equal(posts[0][2].configId, 4);
  assert.equal(posts[0][2].serviceId, 12);
  assert.equal(posts[0][2].newCommissionAmount, 7.5);
  tree = app.render();
  assert.equal(nodes(tree, node => node.props?.type === "number")[0].props.value, "7.50");
  assert.match(text(tree), /Update rejected/);
  assert.equal(nodes(tree, node => node.type === Modal)[0].props.backdrop, "static");
});

test("commission updates prevent duplicate submission and close only after confirmed success", async () => {
  let finish;
  const posts = [];
  const app = harness(pages[2], {
    fetch: async () => ({ status: true, data: [record] }),
    post: (...args) => { posts.push(args); return new Promise(resolve => { finish = resolve; }); },
  });
  app.render(); await app.flush();
  table(app.render()).props.column.find(column => column.id === "actions").Cell({ row: { original: record } }).props.onClick();
  const submitting = named(app.render(), "organization-commission-update").props.onSubmit(submitted);
  await named(app.render(), "organization-commission-update").props.onSubmit(submitted);
  assert.equal(posts.length, 1);
  nodes(app.render(), node => node.type === Modal)[0].props.onHide();
  assert.equal(nodes(app.render(), node => node.type === Modal)[0].props.show, true);
  finish({ status: true });
  await submitting;
  assert.equal(nodes(app.render(), node => node.type === Modal)[0].props.show, false);
});

test("bulk payment preserves employee/branch/services/type and prevents duplicate or excessive submissions", async () => {
  const posts = [];
  let finish;
  const app = harness(pages[1], {
    fetch: async url => ({
      status: true, result: url.startsWith("organization/basic") ? [{ name: "Example", mobile: "000" }] : [record],
      data: [{ KeyID: 2, PaymentMode: "Cash" }],
    }),
    post: (...args) => { posts.push(args); return new Promise(resolve => { finish = resolve; }); },
  });
  app.render(); await app.flush();
  const selection = table(app.render()).props.column.find(column => column.id === "selection");
  selection.Cell({ row: { original: record } }).props.onChange();
  button(app.render(), "Pay selected commissions").props.onClick();
  nodes(app.render(), node => node.type === Form.Select)[0].props.onChange({ target: { value: "2" } });
  nodes(app.render(), node => node.props?.type === "number")[0].props.onChange({ target: { value: "21" } });
  await named(app.render(), "organization-commission-payment").props.onSubmit(submitted);
  assert.equal(posts.length, 0);
  nodes(app.render(), node => node.props?.type === "number")[0].props.onChange({ target: { value: "10" } });
  const submitting = named(app.render(), "organization-commission-payment").props.onSubmit(submitted);
  await named(app.render(), "organization-commission-payment").props.onSubmit(submitted);
  assert.equal(posts.length, 1);
  assert.match(posts[0][0], /batch\/process-services\?employeeid=8&branchid=3/);
  assert.equal(posts[0][2].recipient_type, "organization");
  assert.equal(posts[0][2].recipientid, "17");
  assert.equal(posts[0][2].commissionType, "paid");
  assert.equal(posts[0][2].commissionDue, 20);
  assert.equal(posts[0][2].paymentMethod, 2);
  assert.deepEqual(Array.from(posts[0][2].services), [12]);
  const pendingModal = nodes(app.render(), node => node.type === Modal)[0];
  assert.equal(pendingModal.props.keyboard, false);
  pendingModal.props.onHide();
  assert.equal(nodes(app.render(), node => node.type === Modal)[0].props.show, true);
  finish({ status: false, message: "Payment rejected" });
  await submitting;
  assert.equal(nodes(app.render(), node => node.props?.type === "number")[0].props.value, "10");
  assert.match(text(app.render()), /Payment rejected/);
});

test("payment cannot post without an audited context or an available payment method", async () => {
  for (const application of [{ user: {} }, { user: { employeeid: "8" }, branchid: 3 }]) {
    const posts = [];
    const app = harness(pages[1], {
      application,
      fetch: async () => ({ status: true, result: [record], data: [] }),
      post: async (...args) => { posts.push(args); return { status: true }; },
    });
    app.render(); await app.flush();
    table(app.render()).props.column[0].Cell({ row: { original: record } }).props.onChange();
    nodes(app.render(), node => node.props?.type === "number")[0].props.onChange({ target: { value: "10" } });
    await named(app.render(), "organization-commission-payment").props.onSubmit(submitted);
    assert.equal(posts.length, 0);
  }
});

test("date changes clear payment selections and the bounded detail endpoint stays unpaginated", async () => {
  const urls = [];
  const app = harness(pages[1], { fetch: async url => {
    urls.push(url);
    return { status: true, result: [record], data: [] };
  } });
  app.render(); await app.flush();
  table(app.render()).props.column[0].Cell({ row: { original: record } }).props.onChange();
  assert.equal(button(app.render(), "Pay selected commissions").props.disabled, false);
  toolbar(app.render()).props.onDateRangeChange("2026-02-01", "2026-02-28");
  assert.equal(button(app.render(), "Pay selected commissions").props.disabled, true);
  app.render(); await app.flush();
  assert.ok(urls.filter(url => url.startsWith("organization/commission?")).every(url => !/page=|count=/.test(url)));
});

test("untracked services preserve inferred/explicit recipient scope and guard duplicate tracking", async () => {
  for (const props of [{}, { recipientType: "organization", recipientId: "17" }, { recipientType: "clinician", recipientId: "23" }]) {
    let finish;
    const posts = [], urls = [];
    const app = harness("UntrackedServices.tsx", {
      fetch: async url => { urls.push(url); return { status: true, data: [record] }; },
      post: (...args) => { posts.push(args); return new Promise(resolve => { finish = resolve; }); },
    }, props);
    app.render(); await app.flush();
    const action = () => table(app.render()).props.column.find(column => column.id === "actions").Cell({ row: { original: record } });
    const submitting = action().props.onClick();
    action().props.onClick();
    assert.equal(posts.length, 1);
    assert.equal(posts[0][0], "commission-payments/untracked/services");
    assert.equal(posts[0][2].serviceid, 12);
    assert.equal(posts[0][2].recipient_type, props.recipientType || "organization");
    assert.equal(posts[0][2].recipient_id, Number(props.recipientId || 17));
    assert.equal(action().props.disabled, true);
    finish({ status: true, data: { tracking_id: 44 } });
    await submitting;
    assert.match(text(app.render()), /Tracking ID: 44/);
    if (props.recipientType) {
      assert.match(urls[0], new RegExp(`recipient_type=${props.recipientType}&recipient_id=${props.recipientId}`));
    } else {
      const view = table(app.render()).props.column.find(column => column.id === "view").Cell({ row: { original: record } });
      assert.equal(view.props.href, "/commissions/organizations/untracked-commission-records/recipient/organization/17");
    }
  }
});

test("forms have no decorative ancestors, fields keep native constraints and labels", () => {
  for (const relative of [pages[1], pages[2]]) {
    const code = source(path.join(scope, relative));
    assert.doesNotMatch(code, /className=["'][^"']*(?:card|shadow|border rounded)/);
    assert.match(code, /controlId="organization-/);
    assert.match(code, /type="number".*required|type="number"[\s\S]*?required/);
    assert.match(code, /step="0\.01"/);
    assert.match(code, /backdrop="static"/);
    assert.match(code, /role="alert"/);
  }
  for (const file of ["app/commissions/layout.tsx", "app/layout.tsx", "components/Layout/MainLayout.tsx"]) {
    assert.doesNotMatch(source(path.join(root, file)), /className=["'][^"']*(?:card|shadow)/);
  }
  const layout = source(path.join(root, "components/Layout/PrimeLayout.tsx"));
  assert.match(layout, /<main className=[\s\S]*?contentWrapper[\s\S]*?\? children/);
});
