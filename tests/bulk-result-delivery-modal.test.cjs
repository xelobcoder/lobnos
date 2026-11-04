const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");

const root = path.join(__dirname, "..");
const folder = "components/operations/Laboratory";
const nodes = (tree, predicate) => !tree || typeof tree !== "object" ? [] : Array.isArray(tree)
    ? tree.flatMap(item => nodes(item, predicate))
    : [...(predicate(tree) ? [tree] : []), ...nodes(tree.props?.children, predicate)];
const text = tree => tree == null || typeof tree === "boolean" ? "" : typeof tree !== "object" ? String(tree)
    : Array.isArray(tree) ? tree.map(text).join("") : text(tree.props?.children);
const finish = () => new Promise(resolve => setImmediate(resolve));
const selected = [
    { billingid: "3", ascension_id: "7", name: "FBC NEONATE", fullname: "Synthetic patient" },
    { billingid: 3, ascensionid: 8, test_name: "ESR" },
];
const labels = { whatapp: "WhatsApp", email: "Email", hardcopy: "Printed copy", phonecall: "Phone call" };
const save = tree => nodes(tree, node => node.type === "button" && node.props.type === "submit")[0];

function harness(options = {}) {
    let cursor = 0, mountedKey;
    let states = [], dependencies = [], cleanup = [], effects = [];
    const modules = new Map(), reads = [], writes = [], notices = [], closes = [], successes = [], pendingReads = [], pendingWrites = [];
    const server = structuredClone(options.history || {});
    const props = { show: options.show ?? true, items: options.items || selected, employeeid: 9,
        onHide: () => closes.push(true), onSuccess: value => successes.push(value) };
    const application = { user: { tenantId: 17, branch: 4, employeeid: 9 } };
    const config = { deferredRead: !!options.deferredRead, deferredWrite: !!options.deferredWrite, readError: options.readError, writeError: options.writeError };
    const bootstrap = {
        Modal: Object.assign(function Modal() {}, { Header: "Header", Title: "Title", Body: "Body", Footer: "Footer" }),
        Button: "button", Spinner: "Spinner",
        Form: Object.assign(function Form() {}, { Group: "Group", Label: "Label", Control: "textarea", Text: "Help" }),
    };
    const react = {
        ...React, useId: () => "delivery-test",
        useState(initial) {
            const index = cursor++;
            if (!(index in states)) states[index] = typeof initial === "function" ? initial() : initial;
            return [states[index], value => { states[index] = typeof value === "function" ? value(states[index]) : value; }];
        },
        useRef(initial) { const index = cursor++; if (!(index in states)) states[index] = { current: initial }; return states[index]; },
        useEffect(callback, next) {
            const index = cursor++;
            if (!dependencies[index] || next.some((value, i) => value !== dependencies[index][i])) {
                dependencies[index] = next;
                effects.push(() => { cleanup[index]?.(); cleanup[index] = callback(); });
            }
        },
    };
    const history = bill => server[bill] || { status: true, billingid: bill, deliveries: [], attempts: [] };
    const api = {
        customFetch(endpoint) {
            const bill = Number(endpoint.split("/").at(-1));
            reads.push(endpoint);
            if (config.readError) return Promise.reject(new Error(config.readError));
            if (config.deferredRead) return new Promise((resolve, reject) => pendingReads.push({ bill, resolve, reject }));
            return Promise.resolve(structuredClone(history(bill)));
        },
        customPost(url, method, body) {
            const index = writes.length;
            writes.push({ url, method, body });
            const response = options.responses?.[index] || { status: true };
            const complete = () => {
                if (config.writeError) throw new Error("Synthetic request failure");
                if (response.status === true) {
                    const bill = history(body.billingid);
                    const event = { id: index + 1, ascensionid: body.ascensionid, delivered_mode: body.delivered_mode,
                        created_at: body.delivered_at.toISOString(), username: "Recorded operator", notes: body.notes, failure_notes: null };
                    server[body.billingid] = { ...bill, attempts: [...(bill.attempts || []), event] };
                }
                return response;
            };
            if (config.deferredWrite) return new Promise((resolve, reject) => pendingWrites.push(() => {
                try { resolve(complete()); } catch (error) { reject(error); }
            }));
            return Promise.resolve().then(complete);
        },
    };
    function load(name) {
        if (modules.has(name)) return modules.get(name);
        const exports = {};
        modules.set(name, exports);
        const source = ts.transpileModule(fs.readFileSync(path.join(root, folder, `${name}.tsx`.replace("resultDeliveryHistory.tsx", "resultDeliveryHistory.ts")), "utf8"), {
            compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
        }).outputText;
        vm.runInNewContext(source, {
            exports, Date, Error, console: { error() {} },
            require(name) {
                if (name === "react") return react;
                if (name === "react/jsx-runtime") return require(name);
                if (name === "react-bootstrap") return bootstrap;
                if (name === "@remixicon/react") return new Proxy({}, { get: () => "Icon" });
                if (name === "react-toastify") return { toast: {
                    error: message => notices.push({ type: "error", message }),
                    success: message => notices.push({ type: "success", message }),
                } };
                if (name.includes("customFetch")) return api;
                if (name.includes("useApplicationContext")) return { useApplication: () => application };
                if (name.endsWith(".module.css")) return { __esModule: true, default: new Proxy({}, { get: (_, key) => key }) };
                if (name === "./resultDeliveryHistory") return load("resultDeliveryHistory");
                if (name === "./bulkWorkFlowDeliveryResult") return load("bulkWorkFlowDeliveryResult");
                throw new Error(`Unexpected module ${name}`);
            },
        });
        return exports;
    }
    const exports = load("bulkWorkFlowDeliveryResult");
    return {
        props, application, config, reads, writes, notices, closes, successes, pendingReads, pendingWrites, server,
        helper: load("resultDeliveryHistory"),
        render() {
            const element = exports.default(props);
            if (element.key !== mountedKey) {
                cleanup.forEach(callback => callback?.());
                states = []; dependencies = []; cleanup = []; effects = []; mountedKey = element.key;
            }
            cursor = 0;
            return element.type(element.props);
        },
        flush() { while (effects.length) effects.shift()(); },
        async start() { this.render(); this.flush(); await finish(); return this.render(); },
        choose(mode, checked = true, testName) {
            const label = `${labels[mode]} for ${testName || "all tests"}`;
            const input = nodes(this.render(), node => node.type === "input" && node.props["aria-label"] === label)[0];
            assert.ok(input, `Missing checkbox ${label}`);
            input.props.onChange({ target: { checked } });
        },
        notes(value) { nodes(this.render(), node => node.type === "textarea")[0].props.onChange({ target: { value } }); },
        submit() {
            let prevented = false;
            nodes(this.render(), node => node.type === bootstrap.Form)[0].props.onSubmit({ preventDefault() { prevented = true; } });
            assert.equal(prevented, true);
        },
        single() { return load("singleWorkFlowDeliveryResult").default({ ...props, item: props.items[0], workflow: "resultDelivery" }); },
    };
}

test("opening only checks history, once per bill, and never writes or preselects delivered methods", async () => {
    const h = harness();
    const tree = await h.start();
    assert.deepEqual(h.reads, ["result/delivery/chain/3"]);
    assert.equal(h.writes.length, 0);
    assert.equal(save(tree).props.disabled, true);
    assert.match(text(tree), /Nothing is recorded until you confirm/);
    assert.equal(nodes(tree, node => node.type === "input" && node.props.checked).length, 0);
    assert.equal((text(tree).match(/No successful delivery recorded/g) || []).length, 2);
    assert.equal(tree.props.fullscreen, true, "uses fullscreen at every viewport size");
});

test("hidden modal does not request history or record delivery", async () => {
    const h = harness({ show: false }); await h.start();
    assert.equal(h.reads.length, 0); assert.equal(h.writes.length, 0);
});

test("loading spinners render as phrasing content inside status paragraphs and submit buttons", async () => {
    const { Spinner } = require("react-bootstrap");
    const h = harness({ deferredRead: true });
    h.render(); h.flush();
    const loadingSpinners = nodes(h.render(), node => node.type === "Spinner");
    assert.ok(loadingSpinners.length);
    for (const spinner of loadingSpinners) {
        assert.equal(spinner.props.as, "span");
        const html = renderToStaticMarkup(React.createElement("p", null, React.createElement(Spinner, spinner.props)));
        assert.match(html, /<p><span/);
        assert.doesNotMatch(html, /<div/);
    }
    h.pendingReads[0].resolve({ status: true, billingid: 3, deliveries: [], attempts: [] });
    await finish();
    h.config.deferredWrite = true; h.choose("email"); h.submit();
    const button = save(h.render());
    const spinner = nodes(button, node => node.type === "Spinner")[0];
    assert.equal(spinner.props.as, "span");
    const html = renderToStaticMarkup(React.createElement("button", null, React.createElement(Spinner, spinner.props)));
    assert.match(html, /<button><span/);
    assert.doesNotMatch(html, /<div/);
    h.pendingWrites.forEach(resolve => resolve()); await finish();
});

test("history combines multiple successful methods, operators, notes and failed attempts per ordered test", async () => {
    const h = harness({ history: { 3: { status: true, billingid: 3, deliveries: [], attempts: [
        { ascensionid: 7, delivered_mode: "hardcopy", created_at: "2026-11-04T08:00:00Z", username: "Synthetic reviewer", notes: "Handed to recipient" },
        { ascensionid: 7, delivered_mode: "whatsapp", created_at: "2026-11-04T08:10:00Z", username: "Recorded sender" },
        { ascensionid: 7, delivered_mode: null, created_at: "2026-11-04T08:20:00Z", failure_notes: "Email unavailable" },
        { ascensionid: 99, delivered_mode: "email", created_at: "2026-11-04T08:00:00Z", notes: "Unrelated test note" },
    ] } } });
    const tree = await h.start(), rows = nodes(tree, node => node.type === "li" && node.props.className === "testItem");
    assert.match(text(rows[0]), /Already delivered: WhatsApp, Printed copy/);
    assert.match(text(rows[0]), /View history \(3\)/);
    assert.match(text(tree), /Synthetic reviewer/);
    assert.match(text(tree), /Email unavailable/);
    assert.match(text(rows[1]), /No successful delivery recorded/);
    assert.doesNotMatch(text(tree), /Unrelated test note/);
    const timeline = nodes(tree, node => node.type === "ol" && node.props.className === "timeline")[0];
    assert.equal(timeline.props["aria-label"], "Delivery history for FBC NEONATE");
    assert.deepEqual(nodes(timeline, node => node.type === "li").map(node => node.props["data-status"]), ["failed", "delivered", "delivered"]);
    assert.ok(nodes(tree, node => node.props.id === "delivery-test-history-panel").length, "delivery timeline has its own history column");
    assert.match(text(timeline), /Recorded by Synthetic reviewer/);
    assert.match(text(timeline), /Delivered by Printed copy/);
});

test("legacy successful log remains visible after a failed attempt and aliases are normalized", async () => {
    const h = harness({ history: { 3: { status: true, billingid: 3,
        deliveries: [{ ascensionid: 7, delivered_mode: "hard copy", delivered_at: "2024-01-01T12:00:00Z", delivered_by_username: "Legacy operator", failurenotes: "Later retry failed", notes: "Failure note" }],
        attempts: [{ ascensionid: 7, delivered_mode: null, failure_notes: "Later retry failed", created_at: "2026-11-04T08:00:00Z" }],
    } } });
    assert.match(text(await h.start()), /Already delivered: Printed copy/);
    assert.match(text(h.render()), /Legacy operator/);
    assert.doesNotMatch(text(h.render()), /Failure note/);
    assert.equal(h.helper.normalizedDeliveryMethod("whatapp"), "whatapp");
    assert.equal(h.helper.normalizedDeliveryMethod("Phone Call"), "phonecall");
});

test("attempt and summary log describing the same successful delivery are not counted twice", async () => {
    const h = harness({ history: { 3: { status: true, billingid: 3,
        deliveries: [{ ascensionid: 7, delivered_mode: "email", delivered_at: "2026-11-04T08:00:00.000Z" }],
        attempts: [{ ascensionid: 7, delivered_mode: "email", created_at: "2026-11-04T08:00:00Z" }],
    } } });
    assert.match(text(await h.start()), /View history \(1\)/);
});

test("long timelines stay in the history column and switching tests never alters delivery choices", async () => {
    const h = harness({ history: { 3: { status: true, billingid: 3, deliveries: [], attempts:
        Array.from({ length: 120 }, (_, index) => ({ ascensionid: 7, delivered_mode: "email", created_at: "2026-11-04T08:00:00Z", notes: `Recorded event ${index + 1}` })),
    } } });
    let tree = await h.start();
    const controls = nodes(tree, node => node.props.className === "controls")[0];
    assert.equal(nodes(controls, node => node.type === "ol").length, 0);
    assert.equal(nodes(tree, node => node.props.className === "timelineItem").length, 120);
    const historyPane = nodes(tree, node => node.props.className === "historyScroll")[0];
    assert.equal(historyPane.props.tabIndex, 0);
    assert.equal(historyPane.props["aria-label"], "Delivery history for FBC NEONATE");
    h.choose("hardcopy", true, "ESR");
    const selector = nodes(h.render(), node => node.type === "select" && node.props.id === "delivery-test-history-test")[0];
    selector.props.onChange({ target: { value: "3:8" } });
    tree = h.render();
    assert.equal(nodes(tree, node => node.props.className === "timelineItem").length, 0);
    assert.match(text(tree), /No delivery events recorded for this test/);
    assert.match(text(tree), /Record 1 delivery/);
    nodes(tree, node => node.type === "button" && node.props["aria-label"] === "View history for FBC NEONATE")[0].props.onClick();
    assert.equal(nodes(h.render(), node => node.props.className === "timelineItem").length, 120);
    assert.equal(h.reads.length, 1, "history navigation reuses the verified bill history");
    assert.equal(h.writes.length, 0, "viewing a timeline never records delivery");
});
test("multiple methods can be selected per test, with unchanged per-event API identities and notes", async () => {
    const h = harness(); await h.start();
    h.choose("hardcopy"); h.choose("whatapp", true, "FBC NEONATE"); h.notes("  Synthetic handover  ");
    assert.match(text(h.render()), /Record 3 deliveries/);
    h.submit(); await finish();
    assert.deepEqual(h.writes.map(write => [write.url, write.method, write.body.billingid, write.body.ascensionid, write.body.delivered_mode, write.body.notes]), [
        ["result/delivery/record", "POST", 3, 7, "whatapp", "Synthetic handover"],
        ["result/delivery/record", "POST", 3, 7, "hardcopy", "Synthetic handover"],
        ["result/delivery/record", "POST", 3, 8, "hardcopy", "Synthetic handover"],
    ].sort((a, b) => a[3] - b[3] || (a[4] === "hardcopy" ? -1 : 1)));
    assert.ok(h.writes.every(write => write.body.delivered_at instanceof Date && write.body.failurenotes === null));
    assert.deepEqual(h.successes, [true]); assert.equal(h.closes.length, 1);
});

test("bulk controls reflect mixed per-test choices and can deliberately record another delivery", async () => {
    const h = harness(); await h.start();
    h.choose("email", true, "ESR");
    const bulk = nodes(h.render(), node => node.type === "input" && node.props["aria-label"] === "Email for all tests")[0];
    assert.equal(bulk.props["aria-checked"], "mixed");
    h.choose("email"); h.submit(); await finish();
    assert.equal(h.writes.length, 2);
});

test("partial success stays open, refreshes history and retries only unsuccessful test/method pairs", async () => {
    const h = harness({ responses: [{ status: true }, { status: false, message: "Delivery rejected" }] });
    await h.start(); h.choose("email"); h.submit(); await finish();
    assert.deepEqual(h.successes, [false]); assert.equal(h.closes.length, 0);
    assert.match(text(h.render()), /Already delivered: Email/);
    assert.match(text(h.render()), /Email: Delivery rejected/);
    assert.match(text(h.render()), /Record 1 delivery/);
    assert.equal(h.reads.length, 2);
    h.submit(); await finish();
    assert.deepEqual(h.writes.map(write => write.body.ascensionid), [7, 8, 8]);
    assert.deepEqual(h.successes, [false, true]); assert.equal(h.closes.length, 1);
});

test("submit is guarded before rerender and fields/dismissal stay locked while saving", async () => {
    const h = harness({ deferredWrite: true }); await h.start(); h.choose("email");
    h.submit(); h.submit();
    assert.equal(h.writes.length, 2);
    const tree = h.render();
    assert.equal(save(tree).props.disabled, true);
    assert.ok(nodes(tree, node => node.type === "input").every(node => node.props.disabled));
    assert.equal(nodes(tree, node => node.type === "textarea")[0].props.disabled, true);
    tree.props.onHide(); assert.equal(h.closes.length, 0);
    h.pendingWrites.forEach(resolve => resolve()); await finish(); assert.equal(h.closes.length, 1);
});

for (const invalid of [
    { status: false, message: "Delivery access denied" },
    { status: true, billingid: 3, deliveries: "invalid" },
    { status: true, billingid: 4, deliveries: [], attempts: [] },
    { status: true, billingid: 3, deliveries: [], attempts: [{ ascensionid: "wrong", delivered_mode: "email" }] },
]) {
    test(`invalid history fails closed without claiming never delivered: ${JSON.stringify(invalid)}`, async () => {
        const h = harness({ history: { 3: invalid } });
        const tree = await h.start();
        assert.ok(nodes(tree, node => node.props.role === "alert").length);
        assert.doesNotMatch(text(tree), /No successful delivery recorded/);
        h.choose("email"); h.submit();
        assert.equal(h.writes.length, 0);
    });
}

test("failed history has explicit retry and cannot be used as an empty delivery history", async () => {
    const h = harness({ readError: "Synthetic history unavailable" }); await h.start();
    assert.match(text(h.render()), /Synthetic history unavailable/);
    assert.equal(save(h.render()).props.disabled, true);
    h.config.readError = null;
    nodes(h.render(), node => node.type === "button" && text(node) === "Retry history check")[0].props.onClick();
    await finish();
    assert.match(text(h.render()), /No successful delivery recorded/);
    h.choose("email"); assert.equal(save(h.render()).props.disabled, false);
});

test("a new selection discards old drafts and ignores the previous selection's late history", async () => {
    const h = harness({ deferredRead: true }); h.render(); h.flush();
    const old = h.pendingReads[0];
    h.props.items = [{ billingid: 4, ascensionid: 9, name: "New test" }];
    h.render(); h.flush();
    old.resolve({ status: true, billingid: 3, deliveries: [], attempts: [{ ascensionid: 7, delivered_mode: "email", notes: "Old selection history" }] });
    await finish();
    assert.doesNotMatch(text(h.render()), /Old selection history/);
    assert.match(text(h.render()), /Checking delivery history/);
    h.pendingReads[1].resolve({ status: true, billingid: 4, deliveries: [], attempts: [] });
    await finish();
    assert.match(text(h.render()), /No successful delivery recorded/);
});

test("branch changes reset channel choices, notes and loaded history", async () => {
    const h = harness(); await h.start(); h.choose("email"); h.notes("Prior branch draft");
    h.application.user.branch = 5;
    const tree = h.render(); h.flush();
    assert.equal(nodes(tree, node => node.type === "textarea")[0].props.value, "");
    assert.equal(nodes(tree, node => node.type === "input" && node.props.checked).length, 0);
    assert.equal(save(tree).props.disabled, true);
    await finish();
    assert.equal(h.reads.length, 2);
});

test("different bills are checked independently and late saves cannot close a new selection", async () => {
    const h = harness({ deferredWrite: true });
    h.props.items = [selected[0], { billingid: 4, ascensionid: 9, name: "Other bill test" }];
    await h.start();
    assert.deepEqual(h.reads, ["result/delivery/chain/3", "result/delivery/chain/4"]);
    h.choose("email"); h.submit();
    h.props.items = [{ billingid: 5, ascensionid: 10, name: "New selection" }];
    h.render(); h.flush();
    h.pendingWrites.forEach(resolve => resolve());
    await finish();
    assert.equal(h.closes.length, 0);
    assert.equal(h.successes.length, 0);
    assert.match(text(h.render()), /New selection/);
    assert.match(text(h.render()), /0 new delivery records/);
});

test("empty/invalid selections never write and notes retain the 500-character boundary", async () => {
    const empty = harness({ items: [] }); await empty.start(); empty.submit();
    assert.match(text(empty.render()), /No tests selected/); assert.equal(empty.writes.length, 0);
    const invalid = harness({ items: [{ billingid: 3, name: "Missing identity" }] }); await invalid.start();
    assert.match(text(invalid.render()), /valid billing and ordered-test identity/); assert.equal(invalid.reads.length, 0);
    const h = harness(); await h.start(); h.choose("email"); h.notes("x".repeat(501)); h.submit();
    assert.equal(h.writes.length, 0); assert.match(h.notices[0].message, /500 characters/);
    h.notes("x".repeat(500)); h.submit(); await finish(); assert.equal(h.writes.length, 2);
});

test("network failures remain visible with uncertainty guidance and verified history is refreshed", async () => {
    const h = harness({ writeError: true }); await h.start(); h.choose("email"); h.submit(); await finish();
    assert.match(text(h.render()), /Could not confirm this delivery/);
    assert.equal(h.closes.length, 0); assert.equal(h.successes.length, 0); assert.equal(h.reads.length, 2);
});

test("single-test delivery uses the same history and multi-method workspace", async () => {
    const h = harness({ items: [selected[0]] });
    const single = h.single();
    assert.equal(single.props.items.length, 1);
    assert.equal(single.props.onSuccess, h.props.onSuccess);
    await h.start();
    assert.match(text(h.render()), /Record result delivery/);
    h.choose("email"); h.choose("hardcopy"); h.submit(); await finish(); assert.equal(h.writes.length, 2);
});

test("fullscreen delivery modal and vertical timeline remain scoped, theme-aware, keyboard accessible and responsive", () => {
    const css = fs.readFileSync(path.join(root, folder, "BulkResultDeliveryModal.module.css"), "utf8");
    assert.match(css, /var\(--theme-font-family/);
    assert.match(css, /grid-template-columns: minmax\(0, 1fr\)/);
    assert.match(css, /max-width: 767px/);
    assert.match(css, /:focus-visible/);
    assert.match(css, /min-height: 44px/);
    assert.match(css, /overscroll-behavior: contain/);
    assert.match(css, /grid-template-columns: minmax\(0, \.95fr\) minmax\(0, 1\.05fr\)/);
    assert.match(css, /\.layout \{[^}]*flex: 1; min-height: 0/);
    assert.doesNotMatch(css, /height: clamp/);
    assert.match(css, /\.layout \{[^}]*grid-template-columns: minmax\(0, 1fr\); flex: none/);
    assert.match(css, /\.controls \{[^}]*overflow-y: auto/);
    assert.match(css, /\.historyScroll \{[^}]*overflow-y: auto/);
    assert.match(css, /\.timelineItem:not\(:last-child\)::before/);
    assert.match(css, /grid-template-columns: 28px minmax\(0, 1fr\)/);
    assert.match(css, /var\(--bs-success-bg-subtle\)/);
    assert.match(css, /var\(--bs-danger-bg-subtle\)/);
    assert.doesNotMatch(css, /1\.25fr/);
});

test("pending queue retains selections on partial delivery and refreshes only when the modal closes", () => {
    let cursor = 0;
    const states = [];
    const overrides = { 0: selected.map((item, index) => ({ ...item, ascensionid: index + 7, patientid: 1 })),
        1: 2, 2: false, 11: new Set([7, 8]), 12: selected[0], 13: true };
    const react = { ...React,
        useState(initial) {
            const index = cursor++;
            if (!(index in states)) states[index] = index in overrides ? overrides[index] : initial;
            return [states[index], value => { states[index] = typeof value === "function" ? value(states[index]) : value; }];
        },
        useRef(initial) { const index = cursor++; if (!(index in states)) states[index] = { current: initial }; return states[index]; },
        useCallback: callback => callback, useMemo: callback => callback(), useEffect() {},
    };
    const exports = {};
    const source = ts.transpileModule(fs.readFileSync(path.join(root, folder, "UndeliveredResultTable.jsx"), "utf8"), {
        fileName: "UndeliveredResultTable.jsx",
        compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
    }).outputText;
    vm.runInNewContext(source, {
        exports, console, URLSearchParams, Set,
        require(name) {
            if (name === "react") return react;
            if (name === "react/jsx-runtime") return require(name);
            if (name === "dayjs") return require(name);
            if (name === "react-bootstrap") return { Modal: Object.assign(function Modal() {}, { Header: "Header", Title: "Title", Body: "Body", Footer: "Footer" }) };
            if (name.includes("singleWorkFlow")) return { __esModule: true, default: "SingleDelivery" };
            if (name.includes("bulkWorkFlow")) return { __esModule: true, default: "BulkDelivery" };
            if (name.endsWith(".module.css")) return { __esModule: true, default: new Proxy({}, { get: (_, key) => key }) };
            if (name === "@remixicon/react") return new Proxy({}, { get: () => "Icon" });
            return { __esModule: true, default: "Navigation" };
        },
    });
    const render = () => { cursor = 0; return exports.default({ employeeid: 9 }); };
    let tree = render();
    const bulk = nodes(tree, node => node.type === "BulkDelivery")[0];
    bulk.props.onSuccess(false);
    tree = render();
    assert.equal(nodes(tree, node => node.type === "BulkDelivery")[0].props.items.length, 2);
    assert.equal(states[9], 0, "partial saves do not refresh and remove still-pending method selections");
    const single = nodes(tree, node => node.type === "SingleDelivery")[0];
    single.props.onSuccess(false);
    assert.ok(nodes(render(), node => node.type === "SingleDelivery").length);
    bulk.props.onHide();
    tree = render();
    assert.equal(nodes(tree, node => node.type === "BulkDelivery").length, 0);
    assert.equal(states[9], 1);
    assert.equal(states[11].size, 0);
});
