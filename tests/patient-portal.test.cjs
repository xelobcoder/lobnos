const assert = require("node:assert/strict");
const { readFileSync, readdirSync, statSync } = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");
const ts = require("typescript");

const root = path.join(__dirname, "..");
const read = (...parts) => readFileSync(path.join(root, ...parts), "utf8");
const plain = value => JSON.parse(JSON.stringify(value));

function load(relativePath, requireMock = require) {
    const exports = {};
    const output = ts.transpileModule(read(relativePath), {
        compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
    }).outputText;
    vm.runInNewContext(output, { exports, require: requireMock, Intl, Date, Number, String, Map, Error, JSON });
    return exports;
}

const portal = load(path.join("lib", "patientPortal.ts"));

test("password policy mirrors the backend rules", () => {
    assert.match(portal.passwordProblem("short1"), /at least 8/);
    assert.match(portal.passwordProblem("lettersonly"), /letter and one number/);
    assert.match(portal.passwordProblem("12345678"), /letter and one number/);
    assert.match(portal.passwordProblem("a1".repeat(65)), /at most 128/);
    assert.match(portal.passwordProblem("Secure123", "Secure124"), /do not match/);
    assert.equal(portal.passwordProblem("Secure123", "Secure123"), null);
});

test("appointment requests reject past dates, bad times, unknown types and short reasons", () => {
    const today = "2026-10-18";
    const valid = { date: "2026-10-20", time: "09:30", type: "laboratory", reason: "Fasting blood sugar" };
    assert.equal(portal.appointmentRequestProblem(valid, today), null);
    assert.match(portal.appointmentRequestProblem({ ...valid, date: "2026-10-17" }, today), /valid date/);
    assert.match(portal.appointmentRequestProblem({ ...valid, time: "24:00" }, today), /valid time/);
    assert.match(portal.appointmentRequestProblem({ ...valid, type: "surgery" }, today), /appointment type/);
    assert.match(portal.appointmentRequestProblem({ ...valid, reason: " a " }, today), /3-500/);
    assert.equal(portal.appointmentSlotProblem(today, "00:00", today), null);
    assert.deepEqual(plain(portal.APPOINTMENT_TYPES.map(type => type.value)), ["laboratory", "consultation", "ultrasound", "follow_up"]);
});

test("self-registration form validates facility code, patient id, date of birth and email", () => {
    const valid = { facility: "PLS20154", patientNumber: "PLS20154S004", dateOfBirth: "1990-04-01", email: "ama@example.com" };
    assert.equal(portal.registrationProblem(valid), null);
    assert.match(portal.registrationProblem({ ...valid, facility: "P-1" }), /facility code/);
    assert.match(portal.registrationProblem({ ...valid, patientNumber: " " }), /patient ID/);
    assert.match(portal.registrationProblem({ ...valid, dateOfBirth: "" }), /date of birth/);
    assert.match(portal.registrationProblem({ ...valid, email: "ama@" }), /valid email/);
});

test("invitation tokens must be a facility prefix and a 43 character secret", () => {
    const secret = "A".repeat(42) + "_";
    assert.equal(portal.isInvitationToken(`PLS20154.${secret}`), true);
    assert.equal(portal.isInvitationToken(`PLS20154.${secret}x`), false);
    assert.equal(portal.isInvitationToken(`PL.${secret}`), false);
    assert.equal(portal.isInvitationToken(undefined), false);
});

test("result and bill status labels reflect the release gate", () => {
    assert.deepEqual(plain(portal.resultStatus({ released: true, pending: null })), { label: "Ready", variant: "success" });
    assert.deepEqual(plain(portal.resultStatus({ released: false, pending: "awaiting_payment" })), { label: "Awaiting payment", variant: "warning" });
    assert.equal(portal.resultStatus({ released: false, pending: "awaiting_release" }).label, "Awaiting release");
    assert.equal(portal.billStatus({ paid: 100, outstanding: 0 }).label, "Paid");
    assert.equal(portal.billStatus({ paid: 20, outstanding: 80 }).label, "Part paid");
    assert.equal(portal.billStatus({ paid: 0, outstanding: 80 }).label, "Unpaid");
});

test("staff can only release verified results awaiting release and withdraw released ones", () => {
    assert.equal(portal.staffReleaseAction({ released: true, pending: null, stage: "verified" }), "withdraw");
    assert.equal(portal.staffReleaseAction({ released: false, pending: "awaiting_release", stage: "verified" }), "release");
    assert.equal(portal.staffReleaseAction({ released: false, pending: "awaiting_payment", stage: "verified" }), null);
    assert.equal(portal.staffReleaseAction({ released: false, pending: "awaiting_verification", stage: "completed" }), null);
    assert.equal(portal.staffReleaseAction({ released: false, pending: "in_progress", stage: "processing" }), null);
});

test("tests are grouped by visit with the newest visit first", () => {
    const tests = [
        { ascensionid: 1, billingid: 10, requestedOn: "2026-10-01", released: true },
        { ascensionid: 2, billingid: 12, requestedOn: "2026-10-05", released: false },
        { ascensionid: 3, billingid: 10, requestedOn: "2026-10-01", released: false },
    ];
    assert.deepEqual(plain(portal.groupTestsByVisit(tests).map(group => [group.billingid, group.tests.length, group.released])), [[12, 1, 0], [10, 2, 1]]);
});

test("audit labels cover the backend actions including failed sign-in reasons", () => {
    assert.equal(portal.auditActionLabel("login.success"), "Signed in");
    assert.equal(portal.auditActionLabel("login.failed.invalid_credentials"), "Failed sign-in (invalid credentials)");
    assert.equal(portal.auditActionLabel("login.failed"), "Failed sign-in");
    assert.equal(portal.auditActionLabel("result.withdrawn"), portal.AUDIT_ACTIONS["result.withdrawn"]);
    assert.equal(portal.auditActionLabel("something.new"), "Something new");
    const backendActions = [
        "logout", "account.activated.invitation", "account.activated.self_registration", "registration.started",
        "invitation.created", "invitation.revoked", "account.enabled", "account.disabled", "settings.updated",
        "results.list", "results.report.view", "result.released", "result.withdrawn", "billing.view",
        "appointment.requested", "appointment.cancel_requested", "appointment.reschedule_requested",
        "preferences.updated", "password.changed",
    ];
    for (const action of backendActions) assert.ok(portal.AUDIT_ACTIONS[action], `missing label for ${action}`);
});

test("portal responses unwrap data or surface the server message", () => {
    assert.deepEqual(plain(portal.unwrap({ status: "success", data: { ok: 1 } })), { ok: 1 });
    assert.throws(() => portal.unwrap({ status: "error", message: "Portal disabled" }), /Portal disabled/);
    assert.throws(() => portal.unwrap(undefined, "Network down"), /Network down/);
});

test("patient navigation links every portal page", () => {
    const { PatientPortalLinks } = load(path.join("components", "Layout", "links", "categories", "PatientPortalLinks.tsx"), name => {
        if (name === "@remixicon/react") return new Proxy({}, { get: () => "Icon" });
        if (name === "react/jsx-runtime") return require(name);
        return {};
    });
    const links = PatientPortalLinks.map(link => link.link);
    assert.deepEqual(plain(links), ["/patientportal", "/patientportal/results", "/patientportal/appointments", "/patientportal/billing", "/patientportal/account"]);
    for (const link of links.slice(1)) {
        assert.ok(statSync(path.join(root, "app", ...link.split("/").filter(Boolean), "page.tsx")).isFile(), `${link} has no page`);
    }
});

test("middleware keeps staff out of the patient portal and patients inside it", () => {
    const middleware = read("middleware.ts");
    assert.match(middleware, /currentPath\.startsWith\('\/patientportal'\) && normalizedRole !== 'patient'/);
    assert.match(middleware, /normalizedRole === "patient"[\s\S]{0,120}redirect\(new URL\('\/patientportal'/);
    assert.doesNotMatch(middleware.slice(middleware.indexOf('matcher:')), /'\/patient-access/, "public activation pages must not require a session");
});

test("page files only export the page component", () => {
    const pages = [];
    const walk = dir => {
        for (const entry of readdirSync(dir)) {
            const full = path.join(dir, entry);
            if (statSync(full).isDirectory()) walk(full);
            else if (entry === "page.tsx") pages.push(full);
        }
    };
    walk(path.join(root, "app", "patientportal"));
    walk(path.join(root, "app", "patient-access"));
    walk(path.join(root, "app", "settings", "applicationsettings", "patient-portal"));
    assert.ok(pages.length >= 10);
    for (const page of pages) {
        const source = readFileSync(page, "utf8");
        const named = source.match(/^export (?!default)(const|function|interface|type|class) \w+/gm) || [];
        assert.deepEqual(named, [], `${path.relative(root, page)} has non-page exports`);
    }
});

test("public activation pages call unauthenticated endpoints without a tenant", () => {
    for (const page of [["app", "patient-access", "invite", "page.tsx"], ["app", "patient-access", "register", "page.tsx"]]) {
        const source = read(...page);
        const calls = source.match(/customPost\('[^']+', 'POST', .*?, false, true\)/g) || [];
        const total = (source.match(/customPost\(/g) || []).length;
        assert.ok(calls.length >= 2 && calls.length === total, `${page.join("/")} must make every public call without a tenant`);
        for (const call of calls) assert.match(call, /'patient-portal\/public\//);
    }
});

test("staff surfaces are wired in and role gated", () => {
    assert.match(read("app", "authentications", "login", "page.tsx"), /href="\/patient-access\/register"/);
    const settingsLinks = read("components", "Layout", "links", "categories", "ApplicationSettingsLinks.tsx");
    assert.match(settingsLinks, /title: "Patient Portal", link: "\/settings\/applicationsettings\/patient-portal"[^\n]*roles: \['admin', 'manager'/);
    assert.match(read("app", "settings", "applicationsettings", "patient-portal", "page.tsx"), /roleAllowed\(role, \['admin', 'manager'\]\)/);
    assert.match(read("app", "crm", "customers", "transactions", "[patientid]", "page.tsx"), /<PatientPortalAccessPanel patientid=\{pidNumber\} \/>/);
    const panel = read("components", "PatientPortal", "PatientPortalAccessPanel.tsx");
    assert.match(panel, /roleAllowed\(role, \['admin', 'manager'\]\)/);
    assert.match(panel, /roleAllowed\(role, \['admin', 'manager', 'scientist'\]\)/);
    assert.match(panel, /withdrawReason\.trim\(\)\.length < 3/);
});

test("CRM patient menu opens portal controls for authorized staff only", () => {
    const roles = load(path.join("components", "Auth", "roles.ts"));
    for (const role of ["admin", "manager", "scientist", "super admin", "customer service representative", "accountant"]) {
        const destinations = [];
        const { default: Actions } = load(path.join("components", "customer", "CustomersActionDropDown.jsx"), name => {
            if (name === "react-bootstrap") return { Dropdown: Object.assign(() => null, { Toggle: "Toggle", Menu: "Menu", Item: "Item" }) };
            if (name === "@remixicon/react") return { RiMoreFill: "Icon", RiUserHeartLine: "Icon" };
            if (name === "../../lib/encryption") return { plsEncryption: value => `encrypted-${value}` };
            if (name === "../Auth/useApplicationContext") return { useApplicationSettings: () => ({ applicationsettings: { user: { role } } }) };
            if (name === "../Auth/roles") return roles;
            return require(name);
        });
        const tree = Actions({ item: { patientid: 42 }, router: { push: destination => destinations.push(destination) } });
        const items = [];
        const walk = node => {
            if (!node || typeof node !== "object") return;
            if (node.type === "Item") items.push(node);
            for (const child of [node.props?.children].flat(Infinity)) walk(child);
        };
        walk(tree);
        const portalItem = items.find(item => [item.props.children].flat().includes(" Patient Portal"));
        const allowed = ["admin", "manager", "scientist", "super admin"].includes(role);
        assert.equal(!!portalItem, allowed, role);
        if (portalItem) {
            portalItem.props.onClick();
            assert.deepEqual(destinations, ["/crm/customers/transactions/encrypted-42#patient-portal-access"]);
        }
    }
    const page = read("app", "crm", "customers", "transactions", "[patientid]", "page.tsx");
    assert.ok(page.indexOf("<PatientPortalAccessPanel") < page.indexOf("<TransactionsViewOnly"));
    assert.match(read("components", "PatientPortal", "PatientPortalAccessPanel.tsx"), /id="patient-portal-access"/);
});

test("staff shortcut opens dedicated role-gated portal administration outside CRM", () => {
    const links = read("components", "Layout", "links", "categories", "crmLinks.tsx");
    const entry = links.slice(links.indexOf('title: "Patient Portal"'), links.indexOf("}", links.indexOf('title: "Patient Portal"')));
    assert.match(entry, /link: "\/patient-portal-admin"/);
    assert.match(entry, /roles: \['admin', 'manager'\]/);
    assert.match(read("app", "crm", "patient-portal", "page.tsx"), /redirect\('\/patient-portal-admin'\)/);
    const page = read("app", "patient-portal-admin", "access", "page.tsx");
    assert.match(page, /<PatientPortalAccessPanel key=\{selected\.patientid\} patientid=/);
    assert.match(page, /roleAllowed\(applicationsettings\?\.user\?\.role, PORTAL_STAFF_ROLES\)/);
    assert.match(page, /customFetch\(`customers\?/);
});

test("patient portal uses its own Device Manager styled shell without staff or CRM navigation", () => {
    const shell = read("components", "PatientPortal", "PortalShell.tsx");
    for (const layout of [read("app", "patientportal", "layout.tsx"), read("app", "patient-portal-admin", "layout.tsx")]) {
        assert.match(layout, /<PortalShell/);
        assert.doesNotMatch(layout, /MAIN_LAYOUT|PrimeLayout|CrmLinks/);
    }
    assert.doesNotMatch(shell, /CrmLinks|MAIN_LAYOUT|PrimeLayout|\/crm\//);
    const deviceManager = readFileSync(path.join(root, "..", "Devices-interfacing", "device-manager", "src", "index.html"), "utf8");
    const css = read("components", "PatientPortal", "PortalShell.module.css");
    for (const token of ["#2e7d32", "#1b5e20", "#18212f", "#263244", "#e7edf5", "#9aa6b8", "#344767"]) {
        assert.ok(deviceManager.includes(token), `Device Manager defines ${token}`);
        assert.ok(css.includes(token), `portal styles reuse ${token}`);
    }
    assert.match(read("components", "PatientPortal", "PatientAccessShell.tsx"), /loginBrandOverlay[\s\S]*loginFormSide/);
});
