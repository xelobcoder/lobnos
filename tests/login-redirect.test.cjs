const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");
const ts = require("typescript");

const source = readFileSync(path.join(__dirname, "..", "app", "authentications", "login", "page.tsx"), "utf8");
const compiled = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
}).outputText;
const destinations = {};
vm.runInNewContext(ts.transpileModule(readFileSync(path.join(__dirname, '..', 'lib', 'workspaceDestination.ts'), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText, { exports: destinations });
const nodes = (tree, predicate) => !tree || typeof tree !== "object" ? [] : Array.isArray(tree)
    ? tree.flatMap(child => nodes(child, predicate))
    : [...(predicate(tree) ? [tree] : []), ...nodes(tree.props?.children, predicate)];
const text = tree => tree == null ? "" : typeof tree !== "object" ? String(tree)
    : Array.isArray(tree) ? tree.map(text).join("") : text(tree.props?.children);

function harness({ context, role = "admin", blockedStorage = false, search = "" } = {}) {
    const states = [], redirects = [], writes = [], requests = [];
    let cursor = 0;
    const exports = {};
    const storage = {
        getItem: () => "test-device",
        setItem: (key, value) => {
            if (blockedStorage) throw new Error("Storage blocked");
            writes.push([key, JSON.parse(value)]);
        },
    };
    vm.runInNewContext(compiled, {
        exports, AbortSignal, URLSearchParams, Error, Date, console: { error() {}, warn() {} },
        window: { navigator: {}, localStorage: storage, location: { search, replace: url => redirects.push(url) } },
        localStorage: storage,
        fetch: async (url, options) => {
            requests.push({ url, options });
            if (url === "/api/auth/login") return { ok: true, json: async () => ({ status: true, role }) };
            return context ? context(options) : {
                ok: true,
                json: async () => ({ user: { user: { role } }, tenantId: 397773, settings: { homeCollectionPromptEnabled: 1 } }),
            };
        },
        require(name) {
            if (name === "react") return {
                useEffect() {},
                useState(initial) {
                    const index = cursor++;
                    if (!(index in states)) states[index] = initial;
                    return [states[index], next => { states[index] = typeof next === "function" ? next(states[index]) : next; }];
                },
            };
            if (name === "react/jsx-runtime") return require(name);
            if (name === "react-bootstrap") return { Alert: "Alert", Spinner: "Spinner" };
            if (name === "next/navigation") return { useRouter: () => ({ push: url => redirects.push(url) }) };
            if (name === "next/link") return "Link";
            if (name.includes("customFetch")) return { customPost: async () => ({ status: true, accessToken: "test-token", tenantId: 397773 }) };
            if (name.endsWith("workspaceDestination")) return destinations;
            if (name.endsWith(".css")) return {};
            if (name === "@remixicon/react") return new Proxy({}, { get: () => "Icon" });
            throw new Error(`Unexpected dependency: ${name}`);
        },
    });
    const render = () => { cursor = 0; return exports.default(); };
    const submit = () => {
        nodes(render(), node => node.props?.id === "username")[0].props.onChange({ target: { value: "PLS20154S004" } });
        nodes(render(), node => node.props?.id === "password")[0].props.onChange({ target: { value: "test-password" } });
        nodes(render(), node => node.type === "form")[0].props.onSubmit({ preventDefault() {} });
    };
    return { render, submit, redirects, writes, requests, flush: () => new Promise(resolve => setImmediate(resolve)) };
}

for (const [role, target] of [
    ["admin", "/analytics"], ["super-admin", "/settings/facilities"], ["scientist", "/operations/laboratory"],
    ["patient", "/patientportal"], ["clinician", "/doctor"], ["manager", "/"],
    ["marketer", "/crm/acquisition"], ["customer service representative", "/crm/overview"], ["sonographer", "/operations/imaging/ultrasound"],
    ["storekeeper", "/inventory"], ["accountant", "/accounting"], ["unknown", "/"],
]) {
    test(`verified ${role} session leaves the login page for ${target}`, async () => {
        const h = harness({ role });
        h.submit();
        await h.flush();
        assert.deepEqual(h.redirects, [target]);
        assert.equal(h.writes[0][1].settings.homeCollectionPromptEnabled, 1, "full settings remain available outside the cookie");
        assert.ok(h.requests[1].options.signal instanceof AbortSignal);
    });
}

test("does not show success before session verification finishes", async () => {
    let complete;
    const pending = new Promise(resolve => { complete = resolve; });
    const h = harness({ context: () => pending });
    h.submit();
    await h.flush();
    assert.equal(h.redirects.length, 0);
    assert.doesNotMatch(text(h.render()), /Login successful/);
    complete({ ok: true, json: async () => ({ user: { user: { role: "admin" } }, tenantId: 397773 }) });
    await h.flush();
    assert.deepEqual(h.redirects, ["/analytics"]);
});

test("a rejected browser session displays an error and re-enables login", async () => {
    const h = harness({ context: async () => ({ ok: false, json: async () => ({ error: "Session not found" }) }) });
    h.submit();
    await h.flush();
    assert.equal(h.redirects.length, 0);
    const tree = h.render();
    assert.match(text(tree), /Session not found/);
    assert.doesNotMatch(text(tree), /Login successful/);
    assert.equal(nodes(tree, node => node.type === "button" && node.props.type === "submit")[0].props.disabled, false);
});

test("context timeout is an explicit retryable error, not an endless success message", async () => {
    const h = harness({ context: async () => { const error = new Error("Timeout"); error.name = "TimeoutError"; throw error; } });
    h.submit();
    await h.flush();
    assert.match(text(h.render()), /Session verification timed out/);
    assert.equal(h.redirects.length, 0);
});

test("a different tenant's context cannot complete login", async () => {
    const h = harness({ context: async () => ({ ok: true, json: async () => ({ user: {}, tenantId: 99 }) }) });
    h.submit();
    await h.flush();
    assert.equal(h.redirects.length, 0);
    assert.match(text(h.render()), /did not retain the login session/);
});

test("blocked local storage does not prevent an otherwise verified login", async () => {
    const h = harness({ blockedStorage: true });
    h.submit();
    await h.flush();
    assert.deepEqual(h.redirects, ["/analytics"]);
});

test("portal staff login retains only safe dedicated portal destinations", async () => {
    for (const [role, search, expected] of [
        ["admin", "?returnTo=%2Fpatient-portal-admin", "/patient-portal-admin"],
        ["manager", "?returnTo=%2Fpatient-portal-admin%2Fsettings", "/patient-portal-admin/settings"],
        ["patient", "?returnTo=%2Fpatient-portal-admin", "/patientportal"],
        ["admin", "?returnTo=https%3A%2F%2Fevil.test", "/analytics"],
        ["admin", "?returnTo=%2F%2Fevil.test", "/analytics"],
    ]) {
        const h = harness({ role, search });
        h.submit(); await h.flush();
        assert.deepEqual(h.redirects, [expected]);
    }
});
