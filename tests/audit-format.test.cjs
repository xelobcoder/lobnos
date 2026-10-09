const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");
const ts = require("typescript");

const filename = path.join(__dirname, "..", "app", "settings", "facilities", "auditFormat.ts");
const exportsObject = {};
vm.runInNewContext(ts.transpileModule(readFileSync(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText, { exports: exportsObject });
const plain = (value) => JSON.parse(JSON.stringify(value));
const { actionLabel, actorLabel, describePlan, formatDateTime, statusLabel, summarizeDetails } = exportsObject;

test("labels status changes and payments", () => {
    assert.equal(actionLabel({ action: "status_changed", toStatus: "active" }), "Facility activated");
    assert.equal(actionLabel({ action: "status_changed", toStatus: "suspended" }), "Facility deactivated");
    assert.equal(actionLabel({ action: "payment_recorded", toStatus: null }), "Payment recorded");
    assert.equal(actionLabel({ action: "payment_voided", toStatus: null }), "Payment voided");
    assert.equal(actionLabel({ action: "some_new_action", toStatus: null }), "Some new action");
    assert.equal(statusLabel("suspended"), "Deactivated");
    assert.equal(statusLabel(null), "-");
});
test("labels actors without a name", () => {
    assert.equal(actorLabel({ actorEmployeeId: 9, actorTenantId: 1 }), "Staff #9 (Tenant #1)");
});
test("summarizes plan changes from JSON strings or objects", () => {
    const next = { frequency: "monthly", amount: "150.00", currency: "ghs", startDate: "2026-02-01" };
    const replaced = { frequency: "weekly", amount: "40.00", currency: "GHS", startDate: "2026-01-01" };
    const expected = [
        { label: "Before", value: "Weekly · GHS 40.00 · from 2026-01-01" },
        { label: "After", value: "Monthly · GHS 150.00 · from 2026-02-01" },
    ];
    assert.deepEqual(plain(summarizeDetails({ action: "plan_replace", details: JSON.stringify({ replaced, next }) })), expected);
    assert.deepEqual(plain(summarizeDetails({ action: "plan_replace", details: { replaced, next } })), expected);
    assert.equal(summarizeDetails({ action: "plan_create", details: { replaced: null, next } })[0].value, "No plan");
    assert.equal(describePlan(null), "No plan");
});
test("summarizes payments and tolerates malformed details", () => {
    const summary = summarizeDetails({ action: "payment_recorded", details: JSON.stringify({ periodStart: "2026-01-01", periodEnd: "2026-01-31", amount: "150.00", currency: "GHS", paidAt: "2026-01-02" }) });
    assert.deepEqual(plain(summary.map((item) => item.value)), ["2026-01-01 to 2026-01-31", "GHS 150.00", "2026-01-02"]);
    assert.deepEqual(plain(summarizeDetails({ action: "payment_recorded", details: "not json" })), []);
    assert.deepEqual(plain(summarizeDetails({ action: "status_changed", details: null })), []);
});
test("formats dates with locale and falls back to the raw value", () => {
    assert.match(formatDateTime("2026-03-05T14:30:00Z", "en-US", "UTC"), /Mar 5, 2026/);
    assert.match(formatDateTime("2026-03-05 14:30:00", "en-US", "UTC"), /2:30/);
    assert.equal(formatDateTime("garbage"), "garbage");
});
test("describes scheduled plans and provisioning failures without raw action codes", () => {
    assert.equal(actionLabel({ action: "failed:reference_seeds" }), "Provisioning failed: Reference seeds");
    assert.equal(summarizeDetails({ action: "plan_append", details: { next: { frequency: "yearly", amount: "100.00", currency: "GHS", startDate: "2027-01-01" } } })[0].label, "Scheduled plan");
    assert.deepEqual(plain(summarizeDetails({ action: "failed:reference_seeds", details: { stage: "reference_seeds", failed: true } })), [
        { label: "Provisioning stage", value: "Reference seeds" }, { label: "Outcome", value: "Failed" },
    ]);
});