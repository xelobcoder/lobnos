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
