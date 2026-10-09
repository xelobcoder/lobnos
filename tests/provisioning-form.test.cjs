const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");
const ts = require("typescript");
const { webcrypto } = require("node:crypto");

const filename = path.join(__dirname, "..", "app", "settings", "facilities", "provisioningForm.ts");
const exportsObject = {};
vm.runInNewContext(ts.transpileModule(readFileSync(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText, { exports: exportsObject, TextEncoder, crypto: webcrypto });
const { validateFacilityForm, generateFacilityPassword } = exportsObject;
const valid = {
    companyName: "Test facility", email: "office@example.test", phone: "0595964565",
    address: "Test address", countryId: "1", stateId: "2", districtId: "3",
    adminName: "Test admin", adminEmail: "admin@example.test", adminPassword: "TestPassword123!",
    licenseDays: "365",
};

test("accepts a valid form with a leading-zero phone number", () => {
    assert.equal(Object.keys(validateFacilityForm(valid)).length, 0);
});
test("reports required fields and invalid locations", () => {
    const errors = validateFacilityForm({ ...valid, companyName: " ", email: "invalid", countryId: "", stateId: "0", districtId: "-1" });
    for (const field of ["companyName", "email", "countryId", "stateId", "districtId"]) assert.ok(errors[field]);
});
test("enforces phone storage and license limits", () => {
    for (const phone of ["+123456789", "9999999999", "123"]) assert.ok(validateFacilityForm({ ...valid, phone }).phone);
    for (const licenseDays of ["0", "3651", "1.5", ""]) assert.ok(validateFacilityForm({ ...valid, licenseDays }).licenseDays);
    for (const licenseDays of ["1", "3650"]) assert.equal(validateFacilityForm({ ...valid, licenseDays }).licenseDays, undefined);
});
test("enforces password character minimum and UTF-8 byte maximum", () => {
    assert.ok(validateFacilityForm({ ...valid, adminPassword: "short" }).adminPassword);
    assert.ok(validateFacilityForm({ ...valid, adminPassword: "\u00e9".repeat(37) }).adminPassword);
    assert.equal(validateFacilityForm({ ...valid, adminPassword: "\u00e9".repeat(36) }).adminPassword, undefined);
});
test("generates backend-valid 16-character passwords from all four character groups", () => {
    const passwords = new Set();
    for (let index = 0; index < 100; index++) {
        const password = generateFacilityPassword();
        assert.equal(password.length, 16);
        for (const pattern of [/[a-z]/, /[A-Z]/, /[0-9]/, /[^A-Za-z0-9]/]) assert.match(password, pattern);
        assert.equal(validateFacilityForm({ ...valid, adminPassword: password }).adminPassword, undefined);
        passwords.add(password);
    }
    assert.equal(passwords.size, 100);
});

test("provisioning starts hidden and renders only when explicitly opened", () => {
    const page = readFileSync(path.join(__dirname, "..", "app", "settings", "facilities", "page.tsx"), "utf8");
    assert.match(page, /const \[provisionOpen, setProvisionOpen\] = useState\(false\)/);
    assert.match(page, /\{provisionOpen && <form[^>]*id="provision-facility"/);
    assert.match(page, /setProvisionOpen\(!provisionOpen\)/);
    assert.doesNotMatch(page, /facilities\.length === 0\) setProvisionOpen\(true\)/);
});

test("tenant deletion requires explicit confirmation and protects platform home", () => {
    const page = readFileSync(path.join(__dirname, "..", "app", "settings", "facilities", "page.tsx"), "utf8");
    assert.match(page, /row\.original\.isControlTenant \|\| row\.original\.status === "provisioning"/);
    assert.match(page, /deleteConfirmation !== deleteFacility\.platformId/);
    assert.match(page, /deleteReason\.trim\(\)\.length < 3/);
    assert.match(page, /confirmation: deleteConfirmation, reason: deleteReason\.trim\(\)/);
    assert.match(page, /customFetchMutation\(`platform\/facilities\/\$\{deleteFacility\.tenantId\}`, "DELETE"/);
    assert.match(page, /result\.result\?\.deleted !== true/);
    assert.match(page, /setFacilities\(\(current\) => current\.filter/);
    assert.match(page, /Its database, subscription payments and facility audit records are preserved/);
});
