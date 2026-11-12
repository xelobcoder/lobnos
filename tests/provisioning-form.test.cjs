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
    assert.match(page, /recoveringProvisioning \? "POST" : "DELETE"/);
    assert.match(page, /\/recover-provisioning/);
    assert.match(page, /result\.result\?\.deleted !== true/);
    assert.match(page, /setFacilities\(\(current\) => current\.filter/);
    assert.match(page, /deleteFacility\.status === "failed"/);
    assert.match(page, /This permanently deletes the partial database/);
    assert.match(page, /Database deletion cannot be undone/);
    assert.match(page, /Its database is preserved/);
    assert.match(page, /Subscription payments and facility audit records are preserved/);
    assert.match(page, /Delete database and tenant/);
});

const pageFilename = path.join(__dirname, "..", "app", "settings", "facilities", "page.tsx");
const pageSource = readFileSync(pageFilename, "utf8");
const pageAst = ts.createSourceFile(pageFilename, pageSource, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
let deletionHandler;
const findDeletionHandler = (node) => {
    if (ts.isVariableDeclaration(node) && node.name.getText(pageAst) === "confirmDelete") {
        deletionHandler = node.initializer.getText(pageAst);
    }
    ts.forEachChild(node, findDeletionHandler);
};
findDeletionHandler(pageAst);

const runDeletion = async (payload, options = {}) => {
    const facility = { tenantId: 654321, platformId: "NRAM11", status: options.recovery ? "provisioning" : "failed" };
    const state = {
        facilities: [facility], selectedTenantId: facility.tenantId, created: { tenantId: facility.tenantId },
        retryFacility: facility, provisioningApplication: { linked_tenant_id: facility.tenantId },
        form: { adminPassword: "do-not-retain" }, deleteFacility: facility, showPassword: true,
    };
    const context = {
        deleteFacility: facility, deleteBusy: false, busy: false, deleteConfirmation: facility.platformId,
        recoveringProvisioning: Boolean(options.recovery),
        deleteReason: " Retry from scratch ", selectedTenantId: facility.tenantId, created: state.created,
        retryFacility: facility, provisioningApplication: state.provisioningApplication,
        customFetchMutation: async (...args) => {
            state.request = args;
            if (options.error) throw new Error(options.error);
            return payload;
        },
        errorMessage: (error) => error.message,
    };
    for (const key of ["facilities", "selectedTenantId", "created", "retryFacility", "provisioningApplication",
        "form", "deleteFacility", "showPassword", "deletedMessage", "deleteError", "deleteBusy"]) {
        context[`set${key[0].toUpperCase()}${key.slice(1)}`] = (value) => {
            state[key] = typeof value === "function" ? value(state[key]) : value;
        };
    }
    vm.runInNewContext(ts.transpileModule(`const confirmDelete = ${deletionHandler}; globalThis.handler = confirmDelete;`, {
        compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
    }).outputText, context);
    await context.handler({ preventDefault() {} });
    return state;
};

test("failed database deletion uses the confirmed response and clears stale retry state", async () => {
    const state = await runDeletion({ status: "success", result: { deleted: true, databasePreserved: false } });
    assert.equal(state.request[0], "platform/facilities/654321");
    assert.equal(state.request[1], "DELETE");
    assert.equal(state.request[2].reason, "Retry from scratch");
    assert.equal(state.facilities.length, 0);
    assert.equal(state.retryFacility, null);
    assert.equal(state.provisioningApplication.linked_tenant_id, null);
    assert.equal(state.form.adminPassword, "");
    assert.match(state.deletedMessage, /partial database was permanently deleted/);
    assert.match(state.deletedMessage, /same company email/);
    assert.equal(state.deleteBusy, false);
});

test("registry-only deletion never claims that the database was dropped", async () => {
    const state = await runDeletion({ status: "success", result: { deleted: true, databasePreserved: true } });
    assert.match(state.deletedMessage, /database was preserved/);
    assert.doesNotMatch(state.deletedMessage, /permanently deleted/);
});

test("cleanup errors and unconfirmed database outcomes do not remove the visible facility", async () => {
    for (const [payload, options] of [
        [{ status: "success", result: { deleted: true } }, {}],
        [{ status: "error", message: "Cleanup unavailable" }, {}],
        [null, { error: "Network unavailable" }],
    ]) {
        const state = await runDeletion(payload, options);
        assert.equal(state.facilities.length, 1);
        assert.ok(state.deleteFacility);
        assert.ok(state.deleteError);
        assert.equal(state.deletedMessage, undefined);
        assert.equal(state.deleteBusy, false);
    }
});

test("interrupted setup recovery preserves the facility and enables retry or deletion", async () => {
    const state = await runDeletion({ status: "success", result: { status: "failed", databasePreserved: true } }, { recovery: true });
    assert.equal(state.request[0], "platform/facilities/654321/recover-provisioning");
    assert.equal(state.request[1], "POST");
    assert.equal(state.request[2].confirmation, "NRAM11");
    assert.equal(state.request[2].reason, "Retry from scratch");
    assert.equal(state.facilities.length, 1);
    assert.equal(state.facilities[0].status, "failed");
    assert.equal(state.deleteFacility, null);
    assert.match(state.deletedMessage, /database was preserved/);
    assert.match(state.deletedMessage, /retry provisioning or delete/);
    assert.equal(state.deleteBusy, false);
});

test("busy workers and unconfirmed recovery responses keep provisioning unchanged", async () => {
    for (const payload of [
        { status: "error", message: "Facility setup or cleanup is still running" },
        { status: "success", result: { status: "failed" } },
        { status: "success", result: { status: "active", databasePreserved: true } },
    ]) {
        const state = await runDeletion(payload, { recovery: true });
        assert.equal(state.facilities[0].status, "provisioning");
        assert.ok(state.deleteFacility);
        assert.ok(state.deleteError);
        assert.equal(state.deletedMessage, undefined);
        assert.equal(state.deleteBusy, false);
    }
});

test("directory offers confirmed recovery instead of unsafe deletion for provisioning rows", () => {
    assert.match(pageSource, /status\.toLowerCase\(\) === "provisioning" && !row\.original\.isControlTenant/);
    assert.match(pageSource, /Recover interrupted setup/);
    assert.match(pageSource, /Mark interrupted setup as failed/);
    assert.match(pageSource, /ref=\{cleanupRef\}/);
    assert.match(pageSource, /server refuses recovery while a provisioning worker is running/);
});
