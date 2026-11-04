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
        compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX },
    }).outputText, { exports, require: name => name.startsWith('.') ? compile(path.relative(root, path.resolve(path.dirname(path.join(root, filename)), name + (require('node:fs').existsSync(path.resolve(path.dirname(path.join(root, filename)), name + '.tsx')) ? '.tsx' : '.ts'))), mocks) : mocks(name), TextEncoder, URL, process: { env: { JWT_SECRET_KEY: "synthetic" } } });
    return exports;
}

function middlewareFor(role, valid = true) {
    return compile("proxy.ts", (name) => {
        if (name === "next/server") return { NextResponse: {
            next: () => ({ allowed: true, headers: new Map() }),
            redirect: (url) => ({ allowed: false, url: url.pathname, headers: new Map(), cookies: { delete() {}, set() {} } }),
        } };
        if (name === "jose") return { jwtVerify: async () => {
            if (!valid) throw new Error("Invalid token");
            return { payload: { user: { role, employeeid: 1 }, settings: {} } };
        } };
        throw new Error(name);
    }).proxy;
}
const requestFor = (pathname) => ({
    url: `http://localhost${pathname}`, nextUrl: { pathname }, cookies: { get: () => ({ value: "synthetic-session" }) },
});

test("signed super-admin can open every formerly restricted module", async () => {
    const middleware = middlewareFor("super-admin");
    for (const pathname of ["/settings/applicationsettings", "/inventory", "/analytics", "/doctor", "/communications", "/operations/imaging", "/billing/expenses", "/settings/facilities/payments", "/settings/facilities/audit", "/settings/facilities/applications", "/settings/facilities/devices"]) {
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
    assert.equal((await middlewareFor("admin")(requestFor("/settings/facilities/applications"))).url, "/unauthorized");
    assert.equal((await middlewareFor("admin")(requestFor("/settings/facilities/devices"))).url, "/unauthorized");
    assert.equal((await middlewareFor("sonographer")(requestFor("/inventory"))).url, "/unauthorized");
});
test("navigation page utility flattens nested pages and removes duplicate destinations", () => {
    const navigation = compile('components/Layout/links/RoleSidebars.tsx', name => {
        if (name === 'react/jsx-runtime') return require(name);
        if (name === '@remixicon/react') return new Proxy({}, {get: () => () => null});
        throw Error(name);
    });
    const pages = navigation.roleSidebarQuickLinks("super-admin", [
        { title: "Settings", link: "", children: [
            { title: "Provisioning", link: "/settings/facilities", roles: ["super-admin"] },
            { title: "Payments", link: "/settings/facilities/payments" },
            { title: "Audit logs", link: "/settings/facilities/audit" },
        ] },
        { title: "Other", link: "", children: [{ title: "Same payments", link: "/settings/facilities/payments" }] },
    ]);
    assert.equal(pages.length, 3);
    assert.equal(pages[0].category, "Settings");
    assert.equal(pages[2].label, "Audit logs");
});
test("super-admin menu extends the admin module menu with only platform administration", () => {
    const { AdminRoleLinks, SuperAdminRoleLinks } = compile(
        path.join("components", "FrontPageView", "RoleLinks.tsx"),
        (name) => {
            if (name === "react/jsx-runtime") return require(name);
            if (name === "@remixicon/react") return new Proxy({}, { get: () => () => null });
            throw new Error(name);
        },
    );
    assert.equal(SuperAdminRoleLinks.length, AdminRoleLinks.length + 1);
    for (let index = 0; index < AdminRoleLinks.length; index++) {
        assert.equal(SuperAdminRoleLinks[index], AdminRoleLinks[index]);
    }
    const platform = SuperAdminRoleLinks[AdminRoleLinks.length];
    assert.equal(platform.label, "Platform Administration");
    assert.equal(platform.href, "/settings/facilities");
    assert.equal(new Set(SuperAdminRoleLinks.map(link => link.href)).size, SuperAdminRoleLinks.length);
});
