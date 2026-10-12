const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");
const ts = require("typescript");
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");

const root = path.join(__dirname, "..");
const scope = path.join(root, "app/commissions/clinicians");
const info = path.join(scope, "commissions-information");
const files = fs.readdirSync(scope, { recursive: true })
  .filter(file => /\.(tsx|css)$/.test(file)).map(file => path.join(scope, file));
const source = file => fs.readFileSync(file, "utf8");
const money = new Intl.NumberFormat("en-GH", { style: "currency", currency: "GHS" });

function tag(name) {
  return function TestElement({ children, ...props }) {
    const domProps = Object.fromEntries(Object.entries(props).filter(([key]) =>
      /^(aria-|data-|on[A-Z])/.test(key) || /^(id|className|style|type|value|min|max|step|required|disabled|checked|htmlFor|form|href|target|rel)$/.test(key)));
    return React.createElement(name, domProps, children);
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
  const exports = {};
  const result = ts.transpileModule(source(file), {
    fileName: file,
    reportDiagnostics: true,
    compilerOptions: {
      module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020,
      jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true,
    },
  });
  assert.deepEqual(result.diagnostics, [], `TSX syntax: ${file}`);
  vm.runInNewContext(result.outputText, {
    exports, console, Map, Set,
    require(name) {
      if (name === "react") return overrides.react || React;
      if (name === "react-bootstrap") return { Modal, Form, Button: tag("button") };
      if (name === "next/link") return tag("a");
      if (name === "next/navigation") return { useParams: () => ({ clinicianid: "17" }) };
      if (name === "@remixicon/react") return new Proxy({}, { get: () => tag("svg") });
      if (name === "recharts") return new Proxy({}, { get: () => tag("div") });
      if (name === "react-toastify") return { toast: { success() {}, error() {} } };
      if (name.includes("customFetch")) return {
        currencyFormatter: money,
        customFetch: overrides.fetch || (async () => ({ success: true, status: true, data: [], result: [] })),
        customPost: overrides.post || (async () => ({ status: true })),
      };
      if (name.includes("useApplicationContext")) return { useApplication: () => ({ user: { employeeid: "8" }, branchid: 3 }) };
      if (name.includes("exportClinicianCommissionPdf")) return { exportClinicianCommissionDataToPDF: async () => {} };
      if (name.endsWith(".css")) return new Proxy({}, { get: (_, key) => String(key) });
      if (name.includes("Datatables/PrimeTable")) return function PrimeTable(props) {
        return React.createElement("div", { "data-prime-table": true, "data-rows": props.data.length });
      };
      if (name.includes("DateFilterReusable")) return tag("select");
      if (name.endsWith("/Loader")) return tag("svg");
      if (overrides.react && /ClinicianUi|CommissionLineChart|CommissionDetailsModal|PaymentReport/.test(name)) {
        return new Proxy({}, { get: (_, key) => key === "__esModule" ? true : tag(String(key)) });
      }
      if (name.startsWith(".") && !name.endsWith(".css")) {
        return load(path.resolve(path.dirname(file), `${name}.tsx`), overrides);
      }
      return require(name);
    },
  }, { filename: file });
  return exports;
}

// Execute page hooks deterministically without a browser or authenticated backend.
// Child controls are inspected as React elements, not simulated clinical records.
function harness(file, api = {}) {
  const states = [], refs = [], memos = [], dependencies = [], effects = [];
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
        dependencies[index] = deps; effects.push(effect);
      }
    },
  };
  const Component = load(file, { ...api, react }).default;
  return {
    render() { cursor = 0; return Component({ params: { clinicianid: "17" } }); },
    async flush() {
      const pending = effects.splice(0);
      pending.forEach(effect => effect());
      for (let i = 0; i < 15; i++) await Promise.resolve();
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
const text = tree => typeof tree === "string" ? tree : Array.isArray(tree) ? tree.map(text).join("") : text(tree?.props?.children || "");
const button = (tree, label) => nodes(tree, node => node.props?.onClick && text(node) === label)[0];
const named = (tree, id) => nodes(tree, node => node.props?.id === id)[0];

test("clinician surfaces contain no badge/pill/icon bubble or hard-coded chart palette", () => {
  for (const file of files) {
    assert.doesNotMatch(source(file), /\bBadge\b|\bbadge\b|rounded-pill|rounded-circle|statIcon|metricHighlight|#[0-9a-f]{3,8}\b|oklch\(/i, file);
    if (file.endsWith(".tsx")) load(file);
  }
});

test("summary uses exact PLS customer structure and honest unknown values", () => {
  const { SummaryMetric } = load(path.join(info, "ClinicianUi.tsx"));
  const html = renderToStaticMarkup(React.createElement(SummaryMetric, {
    title: "Commission", value: "—", subtitle: "In returned records",
    Icon: tag("svg"), variant: "primary",
  }));
  assert.match(html, /card border-0 shadow-sm bg-primary bg-gradient text-white rounded-3 h-100/);
  assert.match(html, /card-body p-3/);
  assert.match(html, /<h3 class="fw-bold mb-0">—<\/h3>/);
  assert.match(html, /aria-hidden="true"/);
});

test("payment summaries distinguish loading, failure, empty and loaded currency", () => {
  const { PaymentSummary } = load(path.join(info, "PaymentReport.tsx"));
  const record = { total_commission_amount: "120.50", payment_amount: "100", waived_amount: "20.50" };
  const render = props => renderToStaticMarkup(React.createElement(PaymentSummary, props));
  assert.equal((render({ data: [], loading: true, error: null }).match(/>—<\/h3>/g) || []).length, 3);
  assert.equal((render({ data: [record], loading: false, error: "Failed" }).match(/>—<\/h3>/g) || []).length, 3);
  assert.match(render({ data: [], loading: false, error: null }), /0\.00/);
  assert.match(render({ data: [record], loading: false, error: null }), /120\.50/);
});

test("payment report uses shared table and preserves date/recipient report context", () => {
  const { PaymentReport } = load(path.join(info, "PaymentReport.tsx"));
  const html = renderToStaticMarkup(React.createElement(PaymentReport, {
    data: [], loading: false, error: null, startDate: "2026-01-01", endDate: "2026-10-12", onBreakdown() {},
  }));
  assert.match(html, /01\/01\/2026/);
  assert.match(html, /No commission payments found/);
  const loaded = renderToStaticMarkup(React.createElement(PaymentReport, {
    data: [{ payment_date: "2026-10-12", total_commission_amount: "1", payment_amount: "1", waived_amount: "0" }],
    loading: false, error: null, startDate: "2026-01-01", endDate: "2026-10-12", onBreakdown() {},
  }));
  assert.match(loaded, /data-prime-table="true"/);
  assert.match(loaded, /Exact values are in the batches table/);
});

test("history failure never renders no-payment or valid-looking totals", () => {
  const Details = load(path.join(info, "[clinicianid]/components/CommissionDetailsModal.tsx")).default;
  const html = renderToStaticMarkup(React.createElement(Details, {
    show: true, onHide() {}, selectedRecord: null, commissionPayments: [],
    loading: false, error: "History retrieval failed", clinicianId: "17", paymentModes: [],
  }));
  assert.match(html, /role="alert"/);
  assert.match(html, /History retrieval failed/);
  assert.doesNotMatch(html, /No payment records|Total due:|Outstanding:/);
});

test("forms remain outside metric and decorative card ancestors", () => {
  for (const relative of [
    "[clinicianid]/page.tsx", "[clinicianid]/commission-update/page.tsx", "DateFilter.tsx",
  ]) {
    const ast = ts.createSourceFile(relative, source(path.join(info, relative)), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    function visit(node, ancestors = []) {
      if (ts.isJsxElement(node)) {
        const name = node.openingElement.tagName.getText(ast);
        if (name === "Form" || name === "form") {
          for (const ancestor of ancestors) {
            const opening = ancestor.openingElement.getText(ast);
            assert.doesNotMatch(opening, /card|shadow|border rounded|bg-white/, `${relative}: ${opening}`);
          }
        }
        ancestors = [...ancestors, node];
      }
      ts.forEachChild(node, child => visit(child, ancestors));
    }
    visit(ast);
  }
  const css = source(path.join(info, "CommissionReport.module.css"));
  assert.doesNotMatch(css, /dateFilterForm|box-shadow|linear-gradient/);
  assert.match(css, /@media print/);
  assert.match(css, /text-align: start/);
});

test("rate page sends real dates, stable page count and guarded unchanged update payload", async () => {
  const calls = [], posts = [];
  const record = {
    id: 55, service_id: 99, service_amount: "100", commission_type: "percentage",
    percentage_rate_applied: 5, fixed_amount_applied: null, commission_due: "5",
    final_commission: "5", recipient_type: "clinician", recipient_id: 17,
    status: "pending", serviceCategory: "lab", test_name: "Fixture", recipient_name: "Fixture",
  };
  let finish;
  const h = harness(path.join(info, "[clinicianid]/commission-update/page.tsx"), {
    fetch: async url => { calls.push(url); return { status: true, data: [record] }; },
    post: (url, method, payload) => { posts.push({ url, method, payload }); return new Promise(resolve => { finish = resolve; }); },
  });
  h.render(); await h.flush();
  let tree = h.render();
  assert.doesNotMatch(calls[0], /undefined/);
  assert.match(calls[0], /page=1&&count=10/);
  const table = nodes(tree, node => node.props?.column && node.props?.data)[0];
  await table.props.handleSeverSideProcessing({ page: 2, count: 10, ...table.props.urlparams });
  assert.match(calls[1], /page=2&&count=10/);
  assert.equal(table.props.data[0].id, 55);
  const cell = table.props.column.find(column => column.id === "actions").Cell({ row: { original: record } });
  cell.props.onClick();
  tree = h.render();
  const rate = nodes(tree, node => node.props?.type === "number")[0];
  rate.props.onChange({ target: { value: "150" } });
  named(h.render(), "commission-rate-form").props.onSubmit({ preventDefault() {} });
  assert.equal(posts.length, 0);
  nodes(h.render(), node => node.props?.type === "number")[0].props.onChange({ target: { value: "7.5" } });
  tree = h.render();
  named(tree, "commission-rate-form").props.onSubmit({ preventDefault() {} });
  named(tree, "commission-rate-form").props.onSubmit({ preventDefault() {} });
  assert.equal(posts.length, 1);
  assert.equal(posts[0].method, "PUT");
  assert.match(posts[0].url, /update-rates\/55$/);
  assert.deepEqual(JSON.parse(JSON.stringify(posts[0].payload)), {
    recipientType: "clinician", recipientId: 17, commissionRate: 7.5, serviceid: 99,
  });
  finish({ status: false, message: "Rejected" }); await h.flush();
  tree = h.render();
  assert.equal(nodes(tree, node => node.props?.type === "number")[0].props.value, "7.5");
  assert.ok(nodes(tree, node => node.props?.message === "Rejected").length);
});

test("clinician bulk payment retains selection and values on failure and prevents duplicate posts", async () => {
  const posts = [];
  let finish;
  const record = {
    service_date: "2026-10-12", clinician_id: 17, clinician_name: "Fixture",
    total_services: 1, serviceid: 99, commission_earned: "10",
  };
  const h = harness(path.join(info, "[clinicianid]/page.tsx"), {
    fetch: async url => url === "paymentmodes" ? { status: true, data: [{ KeyID: 1, PaymentMode: "Fixture" }] } : { success: true, data: [record] },
    post: (url, method, payload) => { posts.push({ url, method, payload }); return new Promise(resolve => { finish = resolve; }); },
  });
  h.render(); await h.flush();
  let tree = h.render();
  const table = nodes(tree, node => node.props?.column && node.props?.data)[0];
  table.props.column[0].Cell({ row: { index: 0, original: record } }).props.onChange();
  tree = h.render();
  button(tree, "Pay Commission for Selected (1)").props.onClick();
  tree = h.render();
  nodes(tree, node => node.props?.onChange && node.props?.value === "")[0].props.onChange({ target: { value: "1" } });
  nodes(tree, node => node.props?.type === "number")[0].props.onChange({ target: { value: "11" } });
  named(h.render(), "bulk-commission-form").props.onSubmit({ preventDefault() {} });
  assert.equal(posts.length, 0, "overpayment is blocked");
  nodes(h.render(), node => node.props?.type === "number")[0].props.onChange({ target: { value: "10" } });
  tree = h.render();
  named(tree, "bulk-commission-form").props.onSubmit({ preventDefault() {} });
  named(tree, "bulk-commission-form").props.onSubmit({ preventDefault() {} });
  assert.equal(posts.length, 1);
  assert.match(posts[0].url, /batch\/process-services\?employeeid=8&branchid=3/);
  assert.equal(posts[0].payload.commissionType, "paid");
  assert.equal(posts[0].payload.amountPaid, 10);
  assert.deepEqual(Array.from(posts[0].payload.services), [99]);
  finish({ status: "error", message: "Payment rejected" }); await h.flush();
  tree = h.render();
  assert.equal(nodes(tree, node => node.props?.type === "number")[0].props.value, "10");
  assert.ok(nodes(tree, node => node.props?.message === "Payment rejected").length);
  assert.ok(button(tree, "Pay Commission for Selected (1)"));
});

test("payment filters preserve endpoints, mutually exclusive recipients and applied date context", async () => {
  const calls = [];
  const h = harness(path.join(scope, "commissions-payments-made/page.tsx"), {
    fetch: async url => {
      calls.push(url);
      if (url === "clinicians" || url === "organizations/details") return { result: [{ id: 17, name: "Fixture" }] };
      return { status: true, data: [] };
    },
  });
  h.render(); await h.flush();
  let tree = h.render();
  button(tree, "Load clinicians").props.onClick(); await h.flush();
  tree = h.render();
  named(tree, "commission-clinician").props.onChange({ target: { value: "17" } });
  tree = h.render();
  const filter = nodes(tree, node => node.props?.onDateRangeChange)[0];
  filter.props.onDateRangeChange("2026-02-01", "2026-02-28");
  tree = h.render();
  const reportBeforeLoad = nodes(tree, node => node.props?.onBreakdown)[0];
  assert.notEqual(reportBeforeLoad.props.startDate, "2026-02-01", "draft date does not relabel loaded report");
  button(tree, "Load").props.onClick(); await h.flush();
  assert.match(calls.at(-1), /startDate=2026-02-01&endDate=2026-02-28&recipient_id=17&recipient_type=clinician/);
  tree = h.render();
  assert.equal(nodes(tree, node => node.props?.onBreakdown)[0].props.startDate, "2026-02-01");
  named(tree, "commission-organization").props.onChange({ target: { value: "17" } });
  tree = h.render();
  assert.equal(named(tree, "commission-clinician").props.value, "");
  button(tree, "Load").props.onClick(); await h.flush();
  assert.match(calls.at(-1), /recipient_id=17&recipient_type=organization/);
  assert.doesNotMatch(calls.at(-1), /page=|count=/, "bounded payment response is not fabricated pagination");
});

test("date filter keeps native constraints, labels and failure-safe entered dates", () => {
  const DateFilter = load(path.join(info, "DateFilter.tsx")).default;
  const html = renderToStaticMarkup(React.createElement(DateFilter, {
    startDate: "2026-02-01", endDate: "2026-02-28", onFilter() {}, loading: true,
  }));
  assert.match(html, /<form[^>]*aria-busy="true"/);
  assert.equal((html.match(/<label /g) || []).length, 2);
  assert.match(html, /min="2026-02-01"/);
  assert.equal((html.match(/required=""/g) || []).length, 2);
  assert.match(html, /value="2026-02-28"/);
  assert.doesNotMatch(html, /card|shadow|bg-white/);
});
