const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");
const ts = require("typescript");
const root = path.join(__dirname, "..");

function compile(filename, mocks) {
    const exports = {};
    vm.runInNewContext(ts.transpileModule(readFileSync(path.join(root, filename), "utf8"), {
        compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
    }).outputText, { exports, require: mocks, TextEncoder, URL, process: { env: { JWT_SECRET_KEY: "synthetic" } } });
    return exports;
}

function middlewareFor(role, valid = true) {
    return compile("middleware.ts", (name) => {
        if (name === "next/server") return { NextResponse: {
            next: () => ({ allowed: true, headers: new Map() }),
            redirect: (url) => ({ allowed: false, url: url.pathname, cookies: { delete() {} } }),
        } };
        if (name === "jose") return { jwtVerify: async () => {
            if (!valid) throw new Error("Invalid token");
            return { payload: { user: { role, employeeid: 1 }, settings: {} } };
        } };
        throw new Error(name);
    }).middleware;
}
const requestFor = (pathname) => ({
    url: `http://localhost${pathname}`, nextUrl: { pathname }, cookies: { get: () => ({ value: "synthetic-session" }) },
});

test("signed super-admin can open every formerly restricted module", async () => {
    const middleware = middlewareFor("super-admin");
    for (const pathname of ["/settings/applicationsettings", "/inventory", "/analytics", "/doctor", "/patientportal", "/communications", "/operations/imaging", "/billing/expenses", "/settings/facilities/payments", "/settings/facilities/audit"]) {
        const result = await middleware(requestFor(pathname));
        assert.equal(result.allowed, true, pathname);
        assert.match(result.headers.get("Cache-Control"), /no-store/);
    }
});
test("unverified super-admin claims cannot bypass authentication", async () => {
    const result = await middlewareFor("super-admin", false)(requestFor("/inventory"));
    assert.equal(result.allowed, false);
    assert.equal(result.url, "/authentications/login");
});
test("ordinary admins cannot open platform subpages and sonographers retain restrictions", async () => {
    assert.equal((await middlewareFor("admin")(requestFor("/settings/facilities/audit"))).url, "/unauthorized");
    assert.equal((await middlewareFor("sonographer")(requestFor("/inventory"))).url, "/unauthorized");
});
test("apps menu flattens all nested pages and removes duplicate destinations", () => {
    const navigation = compile(path.join("components", "Layout", "links", "SuperAdminLinks.tsx"), () => ({}));
    const pages = navigation.navigationPages([
        { title: "Settings", link: "", children: [
            { title: "Provisioning", link: "/settings/facilities", roles: ["super-admin"] },
            { title: "Payments", link: "/settings/facilities/payments" },
            { title: "Audit logs", link: "/settings/facilities/audit" },
        ] },
        { title: "Other", link: "", children: [{ title: "Same payments", link: "/settings/facilities/payments" }] },
    ]);
    assert.equal(pages.length, 3);
    assert.equal(pages[0].description, "Settings");
    assert.equal(pages[2].label, "Audit logs");
});
