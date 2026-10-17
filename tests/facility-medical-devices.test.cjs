const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");
const ts = require("typescript");
const React = require("react");
const root = path.join(__dirname, "..");
const editor = path.join("components", "settings", "MedicalDevicesInterfacing.tsx");

function load(file, mocks) {
     const exports = {};
     const compiled = ts.transpileModule(fs.readFileSync(path.join(root, file), "utf8"), {
          reportDiagnostics: true,
          compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX },
     });
     assert.deepEqual(compiled.diagnostics, []);
     vm.runInNewContext(compiled.outputText, {
          exports, require: name => name === "react/jsx-runtime" ? require(name) : mocks(name),
          window: { scrollTo() {} }, console,
     });
     return exports;
}

function nodes(tree, predicate) {
     if (!tree || typeof tree !== "object") return [];
     if (Array.isArray(tree)) return tree.flatMap(child => nodes(child, predicate));
     return [...(predicate(tree) ? [tree] : []), ...nodes(tree.props?.children, predicate)];
}
const text = tree => tree == null ? "" : typeof tree !== "object" ? String(tree)
     : Array.isArray(tree) ? tree.map(text).join("") : text(tree.props?.children);
const button = (tree, label) => nodes(tree, node => node.type === "button" && text(node) === label)[0];

function harness(api, props) {
     const states = [], memos = [], effects = [], dependencies = [];
     const values = {}, notices = [];
     let cursor = 0;
     const react = {
          ...React,
          useState(initial) {
               const index = cursor++;
               if (!(index in states)) states[index] = initial;
               return [states[index], next => { states[index] = typeof next === "function" ? next(states[index]) : next; }];
          },
          useMemo(factory, deps) {
               const index = cursor++;
               if (!memos[index] || deps.some((dep, i) => dep !== memos[index].deps[i])) memos[index] = { value: factory(), deps };
               return memos[index].value;
          },
          useCallback(callback, deps) { return react.useMemo(() => callback, deps); },
          useEffect(effect, deps) {
               const index = cursor++;
               if (!dependencies[index] || deps.some((dep, i) => dep !== dependencies[index][i])) {
                    dependencies[index] = deps;
                    effects.push(effect);
               }
          },
     };
     const controls = { Group: "div", Label: "label", Control: Object.assign(() => null, { Feedback: "small" }), Select: "select", Check: "input" };
     const form = Object.assign(function Form() {}, controls);
     const modal = Object.assign(function Modal() {}, { Header: "header", Title: "h2", Body: "div", Footer: "footer" });
     const Component = load(editor, name => {
          if (name === "react") return react;
          if (name === "react-bootstrap") return { Form: form, Modal: modal, Button: "button", Table: "table", Badge: "span", Alert: "alert" };
          if (name === "react-hook-form") return { useForm: () => ({
               register: () => ({}), handleSubmit: fn => fn,
               reset: () => {}, setValue: (key, value) => { values[key] = value; },
               watch: () => "server", formState: { errors: {}, isSubmitting: false },
          }) };
          if (name === "@remixicon/react") return new Proxy({}, { get: (_, key) => key });
          if (name === "react-toastify") return { toast: { success: message => notices.push(message), error: message => notices.push(message) } };
          if (name.includes("customFetch")) return api;
          throw new Error(name);
     }).default;
     return {
          values, notices, form, modal,
          render() { cursor = 0; return Component(props); },
          async flush() { effects.splice(0).forEach(effect => effect()); for (let i = 0; i < 10; i++) await Promise.resolve(); },
     };
}

test("platform navigation exposes the tenant-selected editor while retaining the original settings page", () => {
     const links = load(path.join("components", "Layout", "links", "categories", "ApplicationSettingsLinks.tsx"), () =>
          new Proxy({}, { get: () => () => null })).ApplicationSettingsLinks;
     const platform = links.find(link => link.title === "Platform Administration");
     assert.ok(platform.roles.includes("super-admin"));
     assert.ok(platform.children.some(link => link.link === "/settings/facilities/devices"));
     const page = load(path.join("app", "settings", "facilities", "devices", "page.tsx"), name => ({ default: name })).default();
     assert.equal(page.type, "../FacilityPicker");
     const child = page.props.children({ tenantId: 654321, name: "Selected lab" });
     const editorNode = nodes(child, node => node.props?.platform)[0];
     assert.equal(editorNode.props.endpoint, "platform/facilities/654321/medical-devices");
     assert.equal(editorNode.key, "654321");
     const original = load(path.join("app", "settings", "super-admin", "medical-devices-interfacing", "page.tsx"), name => ({ default: name })).default();
     assert.deepEqual(Object.keys(original.props), []);
     const tabs = load(path.join("app", "settings", "facilities", "FacilityNav.tsx"), name => {
          if (name === "next/link") return { default: "a" };
          if (name === "next/navigation") return { usePathname: () => "/settings/facilities/devices" };
          throw new Error(name);
     }).default();
     const tab = nodes(tabs, node => node.props?.href === "/settings/facilities/devices")[0];
     assert.equal(text(tab), "Medical Device Interfacing");
     assert.equal(tab.props["aria-current"], "page");
});

test("selected-facility CRUD and active toggle use platform mutations and the same device ID", async () => {
     const endpoint = "platform/facilities/654321/medical-devices";
     const device = { id: 12, name: "MindRay", ip: "192.168.1.20", dial_port: "5000", connection_mode: "server",
          testid: [11, 12], use_tls: 0, active: 1, test_names: "FBC", created_at: "2026-01-01" };
     const writes = [], reads = [];
     const h = harness({
          customFetch: async url => { reads.push(url); return { status: "success", result: [device] }; },
          customFetchMutation: async (...args) => { writes.push(args); return { status: "success", result: { id: 12 } }; },
          customPost: () => { throw new Error("Must not use ordinary-tenant mutation"); },
     }, { endpoint, platform: true });
     h.render(); await h.flush();
     let tree = h.render();
     const actions = nodes(tree, node => node.type === "button" && node.props.size === "sm");
     await actions[2].props.onClick();
     assert.equal(writes[0][0], `${endpoint}/12`);
     assert.equal(writes[0][1], "PUT");
     assert.equal(writes[0][2].active, 0);
     assert.equal(writes[0][2].created_at, undefined);
     assert.equal(writes[0][2].test_names, undefined);
     actions[0].props.onClick();
     assert.equal(h.values.testid, "11,12");
     tree = h.render();
     await nodes(tree, node => node.type === h.form)[0].props.onSubmit({ name: "Updated", use_tls: false, active: true });
     assert.equal(writes[1][0], `${endpoint}/12`);
     assert.equal(writes[1][1], "PUT");
     button(h.render(), "Add Device").props.onClick();
     await nodes(h.render(), node => node.type === h.form)[0].props.onSubmit({ name: "New", use_tls: false, active: true });
     assert.equal(writes[2][0], endpoint);
     assert.equal(writes[2][1], "POST");
     actions[1].props.onClick();
     tree = h.render();
     await button(tree, "Delete").props.onClick();
     assert.equal(writes[3][0], `${endpoint}/12`);
     assert.equal(writes[3][1], "DELETE");
     assert.ok(reads.every(url => url === endpoint));
});

test("device API errors are shown instead of rendering a successful empty facility list", async () => {
     const h = harness({ customFetch: async () => ({ status: "error", message: "Selected facility is unavailable" }) }, { platform: true });
     h.render(); await h.flush();
     assert.match(text(h.render()), /Selected facility is unavailable/);
     assert.ok(h.notices.includes("Failed to load medical interfacing devices"));
});

test("the original settings editor retains its ordinary authenticated API and does not use the platform endpoint", async () => {
     const writes = [];
     const h = harness({
          customFetch: async () => [],
          customPost: async (...args) => { writes.push(args); return { status: "success" }; },
          customFetchMutation: () => { throw new Error("Not a platform operation"); },
     }, {});
     h.render(); await h.flush();
     await nodes(h.render(), node => node.type === h.form)[0].props.onSubmit({ name: "Local analyzer", use_tls: true, active: true });
     assert.equal(writes[0][0], "devices/interfacing/verified/devices");
     assert.equal(writes[0][1], "POST");
     assert.equal(writes[0][2].use_tls, 1);
});
