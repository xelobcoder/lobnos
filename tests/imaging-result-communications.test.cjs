const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");
const test = require("node:test");
const root = path.join(__dirname, "..");
const actionsPath = "components/operations/Ultrasound/ImagingResultActions.tsx";
const sends = "app/communications/sms/laboratory-lifecycle-events/sends";
function load(file, requireModule) {
    const code = ts.transpileModule(fs.readFileSync(path.join(root, file), "utf8"), {
        compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX },
    }).outputText;
    const exports = {};
    vm.runInNewContext(code, { exports, require: requireModule, URLSearchParams, console, Error });
    return exports;
}
function nodes(tree, predicate) {
    if (!tree || typeof tree !== "object") return [];
    if (Array.isArray(tree)) return tree.flatMap(child => nodes(child, predicate));
    return [...(predicate(tree) ? [tree] : []), ...nodes(tree.props?.children, predicate)];
}
const readiness = load("lib/resultSmsReadiness.ts", () => { throw new Error("Unexpected dependency"); });
test("SMS readiness uses finalized approval, not custom/imaging flags", () => {
    const ready = { isapproved: 1, requires_revalidation: 0, resultEntryEnd: "2026-11-04" };
    assert.equal(readiness.isResultSmsReady({ ...ready, iscustom: 0 }), true);
    assert.equal(readiness.isResultSmsReady({ ...ready, iscustom: 1 }), true);
    for (const result of [{ iscustom: 1 }, { ...ready, isapproved: null }, { ...ready, isapproved: 0 },
        { ...ready, requires_revalidation: 1 }, { ...ready, resultEntryEnd: null }])
        assert.equal(readiness.isResultSmsReady(result), false);
});
test("imaging actions open the shared delivery modal with ordered identity and preserve partial saves", () => {
    let state = false;
    const Component = load(actionsPath, name => {
        if (name === "react") return { useState: () => [state, value => { state = value; }] };
        if (name === "react/jsx-runtime") return { jsx: (type, props) => ({ type, props }), jsxs: (type, props) => ({ type, props }) };
        if (name.endsWith("useApplicationContext")) return { useApplication: () => ({ user: { employeeid: 9 } }) };
        if (name.endsWith("singleWorkFlowDeliveryResult")) return { default: "DeliveryModal" };
        if (name === "@remixicon/react") return { RiCheckboxCircleLine: "Icon", RiSendPlaneLine: "Icon" };
        throw new Error(`Unexpected dependency ${name}`);
    }).default;
    const item = { billingid: 2, ascensionid: 7, testid: 100221, patientid: 4, name: "Ultrasound" };
    let tree = Component({ item });
    const link = nodes(tree, node => node.type === "a")[0];
    const url = new URL(link.props.href, "http://localhost");
    assert.equal(url.searchParams.get("service"), "imaging");
    for (const key of ["billingid", "ascensionid", "testid", "patientid"])
        assert.equal(url.searchParams.get(key), String(item[key]));
    assert.equal(link.props.rel, "noopener noreferrer");
    nodes(tree, node => node.type === "button")[0].props.onClick();
    tree = Component({ item });
    let modal = nodes(tree, node => node.type === "DeliveryModal")[0];
    assert.equal(modal.props.item, item);
    assert.equal(modal.props.employeeid, 9);
    modal.props.onSuccess(false);
    assert.equal(nodes(Component({ item }), node => node.type === "DeliveryModal").length, 1);
    modal.props.onSuccess(true);
    assert.equal(nodes(Component({ item }), node => node.type === "DeliveryModal").length, 0);
});
test("imaging entry and completed worklists expose communications without adding actions to unsaved results", () => {
    const entry = fs.readFileSync(path.join(root, "app/operations/imaging/ultrasound/result/[branchid]/page.tsx"), "utf8");
    const list = fs.readFileSync(path.join(root, "components/operations/Ultrasound/UncompletedUltrasoundWaitingListTable.jsx"), "utf8");
    assert.match(entry, /entered && testid && patientid && billingid && ascensionid && <ImagingResultActions/);
    assert.match(list, /stage == "ULTRASOUND_COMPLETED" && row\.original\.resultEntryEnd && \([\s\S]*?<ImagingResultActions/);
    assert.match(list, /testid: row\.original\.testid \|\| row\.original\.id/);
});
test("both default and override SMS use the same approval rule and distinguish queueing from delivery", () => {
    for (const file of ["page.tsx", "OverrideSmsForm.tsx"]) {
        const source = fs.readFileSync(path.join(root, sends, file), "utf8");
        assert.match(source, /isResultSmsReady/);
        assert.doesNotMatch(source, /iscustom === 1/);
        assert.match(source, /queued successfully/);
        assert.match(source, /response\?\.error/);
        assert.match(source, /Check message history before retrying/);
    }
});
