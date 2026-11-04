const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");
const React = require("react");
const root = path.join(__dirname, "..");
const nodes = (tree, predicate) => !tree || typeof tree !== "object" ? [] : Array.isArray(tree)
    ? tree.flatMap(item => nodes(item, predicate))
    : [...(predicate(tree) ? [tree] : []), ...nodes(tree.props?.children, predicate)];
const text = tree => tree == null || typeof tree === "boolean" ? "" : typeof tree !== "object" ? String(tree)
    : Array.isArray(tree) ? tree.map(text).join("") : text(tree.props?.children);
const tick = () => new Promise(resolve => setImmediate(resolve));

function harness({ pin = false, bulk = false, error = false, finalized = false } = {}) {
    let cursor = 0;
    const states = [], effects = [], deps = [], writes = [], closes = [];
    const react = {
        ...React,
        useState(initial) {
            const i = cursor++;
            if (!(i in states)) states[i] = typeof initial === "function" ? initial() : initial;
            return [states[i], value => { states[i] = typeof value === "function" ? value(states[i]) : value; }];
        },
        useRef(initial) { const i = cursor++; if (!(i in states)) states[i] = { current: initial }; return states[i]; },
        useEffect(callback, next) {
            const i = cursor++;
            if (!deps[i] || next.some((value, index) => value !== deps[i][index])) { deps[i] = next; effects.push(callback); }
        },
    };
    const bootstrap = { Modal: Object.assign("Modal", {}), Button: "button", Spinner: "Spinner", Form: { Check: "Check" } };
    bootstrap.Modal = Object.assign(function Modal() {}, { Header: "Header", Title: "Title", Body: "Body", Footer: "Footer" });
    const api = {
        ResultEntrydefaultData: { maximumResultValidation: 3, minimumResultValidation: 2 },
        getResultEntrySettings: async () => ({ maximumResultValidation: 3, minimumResultValidation: 2 }),
        customFetch: async () => {
            if (error) throw new Error("Current review unavailable");
            return { staff: [{ employeeid: 2, username: "Recorded reviewer" }], approval_revision: 4, requires_revalidation: true };
        },
        validatePin: async () => ({ status: true }),
        customPost: async (url, method, body) => { writes.push({ url, method, body }); return { status: true, finalized }; },
    };
    const exports = {};
    const source = ts.transpileModule(fs.readFileSync(path.join(root, "components", "operations", "Laboratory", "ValidationModal.jsx"), "utf8"), {
        compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
    }).outputText;
    vm.runInNewContext(source, {
        exports, console, window: {},
        require(name) {
            if (name === "react") return react;
            if (name === "react/jsx-runtime") return require(name);
            if (name === "react-bootstrap") return bootstrap;
            if (name === "react-toastify") return { toast: { error() {}, warn() {}, info() {}, success() {} } };
            if (name.includes("customFetch")) return api;
            if (name.includes("useApplicationContext")) return { useApplicationSettings: () => ({ applicationsettings: { user: { employeeid: 1 }, settings: { pinOnResultValidation: pin ? 1 : 0 } } }) };
            if (name.endsWith(".css")) return { __esModule: true, default: new Proxy({}, { get: (_, key) => key }) };
            return { __esModule: true, default: name.includes("PreviewPatient") ? "Patient" : name.includes("Comment") ? "Comments" : "Results" };
        },
    });
    const selected = { ascensionid: 7, id: 3, patientid: 9, billingid: 11, name: "Synthetic ESR", fullname: "Synthetic patient" };
    const props = { show: true, onClose: value => closes.push(value), selectedAscension: bulk ? [selected, { ...selected, ascensionid: 8 }] : selected, isBulk: bulk };
    return {
        writes, closes,
        render() { cursor = 0; return exports.default(props); },
        flush() { while (effects.length) effects.shift()(); },
    };
}

test("review uses compact patient details, scoped comments, current revisions and real recorded approvals", async () => {
    const h = harness();
    h.render(); h.flush(); await tick(); const tree = h.render();
    assert.equal(nodes(tree, n => n.type === "Patient")[0].props.compact, true);
    assert.equal(nodes(tree, n => n.type === "Comments")[0].props.reviewMode, true);
    assert.match(text(tree), /Revision 4/);
    assert.match(text(tree), /Updated result - revalidation required/);
    assert.match(text(tree), /Recorded reviewer/);
    assert.match(text(tree), /1 recorded \/ 2 required/);
    assert.doesNotMatch(text(tree), /Approved without PIN|Remove Validation|Do you approve this result/);
});
test("checking the review confirmation stages approval without falsely marking it recorded", async () => {
    const h = harness();
    h.render(); h.flush(); await tick(); let tree = h.render();
    const save = () => nodes(tree, n => n.type === "button" && text(n) === "Record approval")[0];
    assert.equal(save().props.disabled, true);
    nodes(tree, n => n.type === "Check")[0].props.onChange({ target: { checked: true } });
    h.render(); h.flush(); tree = h.render();
    assert.match(text(tree), /not saved until/);
    assert.match(text(tree), /1 recorded \/ 2 required/);
    assert.equal(save().props.disabled, false);
    await save().props.onClick();
    assert.equal(h.writes.length, 1);
    assert.equal(h.writes[0].body.approval_revision, 4);
    assert.equal(h.writes[0].body.employeeid, 1);
});
test("PIN verification remains required and changing a verified PIN disables submission again", async () => {
    const h = harness({ pin: true });
    h.render(); h.flush(); await tick(); let tree = h.render();
    nodes(tree, n => n.type === "Check")[0].props.onChange({ target: { checked: true } });
    tree = h.render();
    nodes(tree, n => n.type === "input")[0].props.onChange({ target: { value: "1234" } });
    tree = h.render();
    await nodes(tree, n => n.type === "button" && text(n) === "Verify PIN")[0].props.onClick();
    tree = h.render();
    assert.equal(nodes(tree, n => n.type === "button" && text(n) === "Record approval")[0].props.disabled, false);
    nodes(tree, n => n.type === "input")[0].props.onChange({ target: { value: "5678" } });
    tree = h.render();
    assert.equal(nodes(tree, n => n.type === "button" && text(n) === "Record approval")[0].props.disabled, true);
});
test("bulk review keeps each test identity and submits the reviewed revision for every test", async () => {
    const h = harness({ bulk: true });
    h.render(); h.flush(); await tick(); let tree = h.render();
    assert.equal(nodes(tree, n => n.type === "Patient").length, 2);
    nodes(tree, n => n.type === "Check")[0].props.onChange({ target: { checked: true } });
    tree = h.render();
    await nodes(tree, n => n.type === "button" && text(n) === "Record all approvals")[0].props.onClick();
    assert.deepEqual(h.writes.map(write => write.body.ascensionid), [7, 8]);
    assert.ok(h.writes.every(write => write.body.approval_revision === 4));
});
test("a failed revision load leaves approval unavailable and presents retry guidance", async () => {
    const h = harness({ error: true });
    h.render(); h.flush(); await tick(); const tree = h.render();
    assert.match(text(tree), /Current review unavailable/);
    assert.equal(nodes(tree, n => n.type === "button" && text(n) === "Record approval")[0].props.disabled, true);
    assert.equal(nodes(tree, n => n.type === "Patient").length, 0);
});
for (const bulk of [false, true]) {
    test(`finalized ${bulk ? 'bulk' : 'single'} approvals close directly without a success modal`, async () => {
        const h = harness({ bulk, finalized: true });
        h.render(); h.flush(); await tick(); let tree = h.render();
        nodes(tree, n => n.type === "Check")[0].props.onChange({ target: { checked: true } });
        h.render(); h.flush(); tree = h.render();
        await nodes(tree, n => n.type === 'button' && text(n) === (bulk ? 'Record all approvals' : 'Record approval'))[0].props.onClick();
        assert.equal(h.closes.length, 1);
        assert.deepEqual(JSON.parse(JSON.stringify(h.closes[0])), bulk ? [7, 8] : 7);
        assert.doesNotMatch(text(h.render()), /Validation Successful|Would you like to proceed/);
    });
}
