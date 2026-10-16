const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");
const ts = require("typescript");
const root = path.join(__dirname, "..");
const compile = (file) => {
    const exports = {};
    vm.runInNewContext(ts.transpileModule(readFileSync(path.join(root, file), "utf8"), {
        compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
    }).outputText, { exports, TextEncoder });
    return exports;
};
const formHelpers = compile(path.join("app", "settings", "facilities", "provisioningForm.ts"));
const { canAccessFacilityModule } = compile(path.join("lib", "facilityModuleAccess.ts"));
const config = formHelpers.defaultModuleConfiguration();
test("module totals sum enabled modules exactly and exclude disabled charges", () => {
    config.modules.email = { enabled: true, monthlyPrice: "10.01" };
    config.modules.sms = { enabled: true, monthlyPrice: "20.02" };
    config.modules.inventory = { enabled: false, monthlyPrice: "999.99" };
    assert.equal(formHelpers.moduleMonthlyTotal(config), "30.03");
    config.modules.email.monthlyPrice = "bad";
    assert.equal(formHelpers.moduleMonthlyTotal(config), "");
});
test("module pricing catalog supplies zero prices for newly supported modules", () => {
    const legacyModules = Object.fromEntries(
        ["pharmacy", "email", "sms", "inventory", "deviceInterfacing"]
            .map(module => [module, "1.00"]),
    );
    const catalog = formHelpers.parseModulePricingCatalogEntry({ currency: "GHS", modules: legacyModules });
    assert.equal(catalog.modules.analytics, "0.00");
    assert.equal(catalog.modules.billing, "0.00");
    assert.equal(catalog.modules.registration, "0.00");
    assert.equal(catalog.modules.laboratoryOperations, "0.00");
    assert.equal(catalog.modules.pharmacy, "1.00");
    assert.equal(formHelpers.parseModulePricingCatalogEntry({
        currency: "GHS",
        modules: { ...legacyModules, pharmacy: "invalid" },
    }), null);
    assert.equal(formHelpers.parseModulePricingCatalogEntry({ currency: "GHS", modules: {} }), null);
});
test("universal pricing input accepts two-decimal prices such as 100.00", () => {
    const editor = readFileSync(path.join(root, "app", "settings", "facilities", "ModulePricingCatalogEditor.tsx"), "utf8");
    const priceInput = editor.split(/\r?\n/).find(line => line.includes("universal monthly price"));
    const match = priceInput?.match(/pattern="([^"]+)"/);
    assert.ok(match, "module price input must retain native format validation");
    const pattern = new RegExp(`^(?:${match[1]})$`);
    assert.equal(pattern.test("100.00"), true);
    assert.equal(pattern.test("100.000"), false);
});
test("activation gates cover existing email, SMS, pharmacy, inventory and device routes", () => {
    const disabled = formHelpers.defaultModuleConfiguration();
    for (const route of ["/email-services/queue", "/settings/email-services/templates", "/communications/sms/dashboard",
        "/pharmacy/sales", "/inventory/items", "/settings/devices", "/settings/super-admin/medical-devices-interfacing"]) {
        assert.equal(canAccessFacilityModule(route, disabled), false, route);
        assert.equal(canAccessFacilityModule(route, JSON.stringify(disabled)), false, route);
        assert.equal(canAccessFacilityModule(route, null), true, route);
        assert.equal(canAccessFacilityModule(route, "{"), false, route);
    }
    assert.equal(canAccessFacilityModule("/operations/laboratory/main/dailyRequest", disabled), true);
    assert.equal(canAccessFacilityModule("/communications/sms/dashboard", null, { smsActivated: 0 }), false);
    assert.equal(canAccessFacilityModule("/communications/sms/dashboard", null, { smsActivated: 1 }), true);
    disabled.modules.email.enabled = true;
    assert.equal(canAccessFacilityModule("/email-services", disabled), true);
});
test("application settings exposes the operational SMS activation switch", () => {
    const page = readFileSync(path.join(root, "app", "settings", "applicationsettings", "page.tsx"), "utf8");
    assert.match(page, /name="smsActivated"/);
    assert.match(page, /SMS module active/);
    assert.match(page, /canAccessFacilityModule\('\/communications\/sms'/);
});
test("provisioning includes billing, registration and laboratory operations modules", () => {
    const page = readFileSync(path.join(root, "app", "settings", "facilities", "page.tsx"), "utf8");
    assert.match(page, /moduleConfiguration: form\.moduleConfiguration/);
    assert.match(page, /Modules and branches/);
    assert.match(page, /Single branch/);
    assert.match(page, /Multiple branches/);
    assert.match(page, /company address is mandatory/);
    assert.equal(formHelpers.MODULE_LABELS.billing, "Billing");
    assert.equal(formHelpers.MODULE_LABELS.registration, "Registration");
    assert.equal(formHelpers.MODULE_LABELS.laboratoryOperations, "Laboratory operations");
    assert.deepEqual(Object.keys(formHelpers.defaultModuleConfiguration().modules), Object.keys(formHelpers.MODULE_LABELS));
});
test("payment page itemizes module costs without changing schedules automatically", () => {
    const page = readFileSync(path.join(root, "app", "settings", "facilities", "FacilityManagement.tsx"), "utf8");
    assert.match(page, /Facility modules and pricing/);
    assert.match(page, /Use module total for monthly schedule/);
    assert.match(page, /recurring payment schedule below must be changed separately/);
});
