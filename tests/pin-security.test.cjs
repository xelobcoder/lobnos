const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");
const ts = require("typescript");
const React = require("react");

const source = fs.readFileSync(path.join(__dirname, "../components/settings/applicationsettings/PinSecuritySettings.tsx"), "utf8");
function nodes(tree, predicate) {
     if (!tree || typeof tree !== "object") return [];
     if (Array.isArray(tree)) return tree.flatMap(child => nodes(child, predicate));
     return [...(predicate(tree) ? [tree] : []), ...nodes(tree.props?.children, predicate)];
}
const text = tree => tree == null ? "" : typeof tree !== "object" ? String(tree)
     : Array.isArray(tree) ? tree.map(text).join("") : text(tree.props?.children);
const button = (tree, label) => nodes(tree, node => node.type === "button" && text(node) === label)[0];
const input = (tree, id) => nodes(tree, node => node.type === "input" && node.props.id === id)[0];

function harness(role = "admin") {
     const state = [], refs = [], dependencies = [], effects = [], cleanups = [];
     let cursor = 0;
     const context = { applicationsettings: { tenantId: 42, user: { role, employeeid: 1 } } };
     const calls = [];
     let failure = false;
     let staff = [
          { employeeid: 7, username: "Locked staff", role: "scientist", failed_attempts: 5, locked_at: "2026-10-18" },
          { employeeid: 8, username: "Available staff", role: "scientist", failed_attempts: 1, locked_at: null },
     ];
     const api = {
          customFetch: async endpoint => ({ status: "success", result: endpoint.includes("/staff?") ? staff : { pinAttemptLimit: 5 } }),
          customFetchMutation: async (endpoint, method, body) => {
               calls.push({ endpoint, method, body });
               return failure ? { status: "error", message: "Administrator permission required" } : { status: "success" };
          },
     };
     const react = {
          ...React,
          useState(initial) {
               const index = cursor++;
               if (!(index in state)) state[index] = initial;
               return [state[index], next => { state[index] = typeof next === "function" ? next(state[index]) : next; }];
          },
          useRef(initial) {
               const index = cursor++;
               if (!(index in refs)) refs[index] = { current: initial };
               return refs[index];
          },
          useEffect(effect, deps) {
               const index = cursor++;
               if (!dependencies[index] || deps.some((value, i) => value !== dependencies[index][i])) {
                    dependencies[index] = deps;
                    effects.push(() => { cleanups[index]?.(); cleanups[index] = effect(); });
               }
          },
     };
     const compiled = ts.transpileModule(source, {
          reportDiagnostics: true,
          compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX },
     });
     assert.deepEqual(compiled.diagnostics, []);
     const exports = {};
     vm.runInNewContext(compiled.outputText, {
          exports,
          require(name) {
               if (name === "react") return react;
               if (name === "react/jsx-runtime") return require(name);
               if (name.includes("customFetch")) return api;
               if (name.includes("useApplicationContext")) return { useApplicationSettings: () => context };
               if (name.includes("/roles")) return { roleAllowed: (value, allowed) => allowed.includes(value) };
               throw new Error(`Unexpected import ${name}`);
          },
     });
     const render = () => { cursor = 0; return exports.default(); };
     const flush = async () => { effects.splice(0).forEach(effect => effect()); await new Promise(resolve => setImmediate(resolve)); };
     return { render, flush, calls, context, fail: () => { failure = true; }, setStaff: value => { staff = value; } };
}

test("PIN controls are administrator-only and explain persistent lockout without PIN changes", async () => {
     for (const role of ["manager", "scientist", "patient", "accountant"]) {
          const h = harness(role);
          assert.equal(h.render(), null);
     }
     const h = harness();
     h.render(); await h.flush();
     const tree = h.render();
     assert.match(text(tree), /reset does not change the PIN/);
     assert.equal(input(tree, "pin-attempt-limit").props.min, 1);
     assert.equal(input(tree, "pin-attempt-limit").props.max, 20);
     const resets = nodes(tree, node => node.type === "button" && text(node) === "Reset attempts");
     assert.equal(resets[0].props.disabled, false);
     assert.equal(resets[1].props.disabled, true);
});

test("policy save uses dedicated API, validates integer bounds, and never sends credentials", async () => {
     const h = harness();
     h.render(); await h.flush();
     let tree = h.render();
     input(tree, "pin-attempt-limit").props.onChange({ target: { value: "0" } });
     tree = h.render();
     await nodes(tree, node => node.type === "form")[0].props.onSubmit({ preventDefault() {} });
     assert.equal(h.calls.length, 0);
     tree = h.render();
     assert.match(text(tree), /whole number from 1 to 20/);
     input(tree, "pin-attempt-limit").props.onChange({ target: { value: "4" } });
     input(tree, "pin-policy-reason").props.onChange({ target: { value: "Policy review" } });
     tree = h.render();
     await nodes(tree, node => node.type === "form")[0].props.onSubmit({ preventDefault() {} });
     assert.equal(h.calls[0].endpoint, "applicationsettings/pin-security");
     assert.equal(h.calls[0].method, "PUT");
     assert.deepEqual(JSON.parse(JSON.stringify(h.calls[0].body)), { pinAttemptLimit: 4, reason: "Policy review" });
});

test("reset requires explicit target confirmation and support reason; API failure is shown", async () => {
     const h = harness();
     h.render(); await h.flush();
     button(h.render(), "Reset attempts").props.onClick();
     let tree = h.render();
     assert.match(text(tree), /Confirm reset for Locked staff/);
     assert.equal(input(tree, "pin-reset-reason").props.required, true);
     input(tree, "pin-reset-reason").props.onChange({ target: { value: "Support reference verified" } });
     tree = h.render();
     h.fail();
     nodes(tree, node => node.type === "form")[1].props.onSubmit({ preventDefault() {} });
     await h.flush();
     assert.equal(h.calls[0].endpoint, "applicationsettings/pin-security/staff/7/reset");
     assert.deepEqual(JSON.parse(JSON.stringify(h.calls[0].body)), { reason: "Support reference verified" });
     assert.match(text(h.render()), /Administrator permission required/);
     assert.doesNotMatch(text(h.render()), /Their PIN is unchanged/);
});

test("switching authenticated tenant clears selected staff and fetches that tenant's counters", async () => {
     const h = harness();
     h.render(); await h.flush();
     button(h.render(), "Reset attempts").props.onClick();
     assert.ok(input(h.render(), "pin-reset-reason"));
     h.context.applicationsettings.tenantId = 43;
     h.setStaff([]);
     h.render(); await h.flush();
     const tree = h.render();
     assert.equal(input(tree, "pin-reset-reason"), undefined);
     assert.doesNotMatch(text(tree), /Locked staff/);
});

test("application settings mounts PIN controls outside the general settings form", () => {
     const page = fs.readFileSync(path.join(__dirname, "../app/settings/applicationsettings/page.tsx"), "utf8");
     assert.match(page, /<PinSecuritySettings\s*\/>\s*<Form onSubmit=\{handleSubmit\}>/);
});
