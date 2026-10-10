const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");
const ts = require("typescript");

const exportsObject = {};
vm.runInNewContext(ts.transpileModule(readFileSync(path.join(__dirname, "..", "lib", "companyImage.ts"), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText, {
    exports: exportsObject, URL,
    require: () => ({ apiPath: endpoint => `/api/v1/${endpoint}` }),
});
const { companyImageUrl, scopedCompanyImageUrl } = exportsObject;

test("builds only explicit valid tenant logo paths with no default", () => {
    assert.equal(companyImageUrl(4), "/api/v1/settings/companyprofile/images?tenantId=4");
    assert.notEqual(companyImageUrl(3), companyImageUrl(4));
    for (const tenant of [null, undefined, "", "4", 0, -1, 1.2, NaN, Infinity, [], {}, Number.MAX_SAFE_INTEGER + 1]) {
        assert.equal(companyImageUrl(tenant), "");
    }
});
test("normalizes scoped backend report URLs to the same-origin proxy", () => {
    assert.equal(scopedCompanyImageUrl("https://backend.invalid/api/v1/settings/companyprofile/images?tenantId=4"),
        companyImageUrl(4));
    assert.equal(scopedCompanyImageUrl(companyImageUrl(3)), companyImageUrl(3));
});
test("never uses an unscoped legacy or malformed report logo as a fallback", () => {
    for (const logo of [undefined, null, "", "http://localhost:5000/api/v1/settings/companyprofile/images",
        "/api/v1/settings/companyprofile/images?tenantId=4junk",
        "/api/v1/settings/companyprofile/images?tenantId=0",
        "/api/v1/settings/companyprofile/images?tenantId=3&tenantId=4",
        "/api/v1/settings/companyprofile/images?tenantId=9007199254740992",
        "javascript:alert(1)", "/other?tenantId=4"]) {
        assert.equal(scopedCompanyImageUrl(logo), "");
    }
});

const { renderToStaticMarkup } = require("react-dom/server");
const React = require("react");
function loadComponent(relative) {
    const filename = path.join(__dirname, "..", "components", "ResultView", `${relative}.tsx`);
    const componentExports = {};
    vm.runInNewContext(ts.transpileModule(readFileSync(filename, "utf8"), {
        compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX },
    }).outputText, {
        exports: componentExports,
        require: name => {
            if (name.endsWith(".module.css")) return { default: {} };
            if (name === "../../lib/companyImage") return exportsObject;
            if (name.startsWith("./CompanyHeaders")) return loadComponent(name.slice(2));
            return require(name);
        },
    });
    return componentExports;
}
const company = { name: "Test Facility", address: "Tenant address", street: "Tenant street", email: "lab@example.test", phonenumber: "123" };
for (const component of ["CompanyHeaders", "CompanyHeadersDONDEE", "CompanyHeadersFULLWIDTH"]) {
    test(`${component} displays tenant address/street and no unscoped logo fallback`, () => {
        const Header = loadComponent(component).default;
        const html = renderToStaticMarkup(React.createElement(Header, {
            companyInfo: company, logo: "/api/v1/settings/companyprofile/images", resultsettings: {},
        }));
        assert.ok(html.includes("Tenant address"));
        assert.ok(html.includes("Tenant street"));
        assert.ok(!html.includes("<img"));
        const scoped = renderToStaticMarkup(React.createElement(Header, {
            companyInfo: company, logo: companyImageUrl(4), resultsettings: {},
        }));
        assert.ok(scoped.includes("tenantId=4"));
    });
}
test("split-name report header uses the scoped tenant logo, never a hardcoded tenant", () => {
    const Header = loadComponent("MdsCompanyInformation").default;
    const html = renderToStaticMarkup(React.createElement(Header, {
        companyInfo: company, logourl: companyImageUrl(4), resultsettings: { companyInfo: { breakname: true } },
    }));
    assert.ok(html.includes("tenantId=4"));
    assert.ok(!html.includes("tenantid=3"));
    assert.ok(html.includes("Tenant address"));
    assert.ok(html.includes("Tenant street"));
});
