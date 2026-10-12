const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");
const ts = require("typescript");
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");

test("commissions overview groups all existing destinations into accessible workflow sections", () => {
  const exports = {};
  const source = readFileSync(path.join(__dirname, "..", "app", "commissions", "page.tsx"), "utf8");
  vm.runInNewContext(ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      jsx: ts.JsxEmit.ReactJSX,
      esModuleInterop: true,
    },
  }).outputText, {
    exports,
    require(name) {
      if (name === "next/link") return ({ children, ...props }) => React.createElement("a", props, children);
      if (name === "./commissions.module.css") return new Proxy({}, { get: (_, key) => String(key) });
      return require(name);
    },
  });
  const html = renderToStaticMarkup(React.createElement(exports.default));

  for (const destination of [
    "/commissions/organizations/pending-commissions",
    "/commissions/clinicians/commissions-information",
    "/commissions/untracked-commission-records",
    "/commissions/commission-payments",
    "/commissions/clinicians/commissions-payments-made",
  ]) {
    assert.ok(html.includes(`href="${destination}"`));
  }
  assert.equal((html.match(/<a /g) || []).length, 5);
  assert.equal((html.match(/<h1 /g) || []).length, 1);
  assert.match(html, /aria-labelledby="pending-commissions"/);
  assert.match(html, /aria-labelledby="commission-reporting"/);
  assert.match(html, /col-12 col-md-6 col-xl-4/);
  assert.doesNotMatch(html, /rounded-circle|badge|<button|<form/);
});
