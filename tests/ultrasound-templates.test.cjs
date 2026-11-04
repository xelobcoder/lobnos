const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");
const test = require("node:test");

const directory = path.join(__dirname, "..", "app", "operations", "imaging", "ultrasound", "templates");
const listSource = readFileSync(path.join(directory, "list", "page.tsx"), "utf8");
const editorSource = readFileSync(path.join(directory, "page.tsx"), "utf8");
function handler(source, name) {
    const ast = ts.createSourceFile("page.tsx", source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    let result;
    function visit(node) {
        if (ts.isVariableDeclaration(node) && node.name.getText(ast) === name) result = node.initializer.getText(ast);
        ts.forEachChild(node, visit);
    }
    visit(ast);
    assert.ok(result, `${name} must exist`);
    return ts.transpileModule(`globalThis.handler = ${result}`, {
        compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
    }).outputText;
}
const deletion = handler(listSource, "deleteTemplate");
const creation = handler(editorSource, "createTemplateHandler");

async function remove(response, options = {}) {
    const state = { list: [{ keyid: 3, name: "Kidney" }, { keyid: 4, name: "Keep" }], success: [], errors: [] };
    const context = {
        Error, deletingId: options.busy ? 3 : null,
        window: { confirm: message => { state.confirmation = message; return options.confirm !== false; } },
        setDeletingId: value => { state.deletingId = value; },
        setTemplateList: update => { state.list = update(state.list); },
        customFetchMutation: async (...args) => {
            state.request = args;
            if (options.networkError) throw new Error("Network unavailable");
            return response;
        },
        toast: { success: value => state.success.push(value), error: value => state.errors.push(value) },
    };
    vm.runInNewContext(deletion, context);
    await context.handler(state.list[0]);
    return state;
}

test("imaging template deletion requires confirmation and a confirmed server result", async () => {
    const state = await remove({ status: "success", result: { deleted: true, templateId: 3 } });
    assert.equal(state.request[0], "result/entry/ultrasound/templates/3");
    assert.equal(state.request[1], "DELETE");
    assert.match(state.confirmation, /Existing patient reports will not be changed/);
    assert.deepEqual(state.list.map(item => item.keyid), [4]);
    assert.equal(state.success.length, 1);
    assert.equal(state.deletingId, null);
});

test("cancelled or duplicate deletion never sends a request", async () => {
    for (const options of [{ confirm: false }, { busy: true }]) {
        const state = await remove(null, options);
        assert.equal(state.request, undefined);
        assert.equal(state.list.length, 2);
    }
});

test("forbidden, stale, unconfirmed and network failures keep the template visible", async () => {
    for (const [response, options] of [
        [{ status: "error", message: "Permission denied" }, {}],
        [{ status: "success", result: { deleted: false, templateId: 3 } }, {}],
        [{ status: "success", result: { deleted: true, templateId: 4 } }, {}],
        [null, { networkError: true }],
    ]) {
        const state = await remove(response, options);
        assert.equal(state.list.length, 2);
        assert.equal(state.success.length, 0);
        assert.equal(state.errors.length, 1);
        assert.equal(state.deletingId, null);
    }
});

test("delete controls match creator/admin/manager policy and synchronize paginated rows", () => {
    assert.match(listSource, /canManageAll \|\| Number\(row\.original\.createdby\) === Number\(employeeid\)/);
    assert.match(listSource, /\["admin", "manager", "superadmin"\]/);
    assert.match(listSource, /setTemplateList\(response\)/);
    assert.match(listSource, /aria-label=\{`Delete template/);
});

async function save(response, edit = false) {
    const state = { errors: [], success: [] };
    const context = {
        selectedTest: "100221", name: " Kidney ", associatedbodypart: "Kidney", employeeid: 9,
        rule: edit ? [{ field: "Findings", fieldid: 21, value: "Updated" }] : [{ name: "Findings", id: 21 }],
        isSaving: false, visible: 1, templateid: edit ? "3" : null, isEdit: edit ? "true" : null,
        setIsSaving: value => { state.saving = value; },
        customPost: async (...args) => { state.request = args; return response; },
        toast: { success: value => state.success.push(value), error: value => state.errors.push(value) },
        console: { error() {} },
    };
    vm.runInNewContext(creation, context);
    await context.handler();
    return state;
}

test("template creation normalizes rule field names, IDs and empty values", async () => {
    const state = await save({ status: true });
    const payload = state.request[2];
    assert.equal(payload.name, "Kidney");
    assert.equal(payload.fields[0].field, "Findings");
    assert.equal(payload.fields[0].fieldid, 21);
    assert.equal(payload.fields[0].value, "");
    assert.equal(state.success.length, 1);
    assert.equal(state.saving, false);
});

test("error-shaped template responses are never treated as successful saves", async () => {
    for (const response of [{ status: "error", message: "Table does not exist" }, { status: false }, null]) {
        const state = await save(response);
        assert.equal(state.success.length, 0);
        assert.equal(state.errors.length, 1);
        assert.equal(state.saving, false);
    }
});

test("editing a saved template retains its field IDs and uses PUT", async () => {
    const state = await save({ status: true }, true);
    assert.equal(state.request[1], "PUT");
    assert.equal(state.request[2].keyid, 3);
    assert.equal(state.request[2].fields[0].fieldid, 21);
    assert.equal(state.request[2].fields[0].value, "Updated");
});

test("a deleted template selected from a stale list never clears the current patient report", async () => {
    const source = readFileSync(path.join(directory, "..", "result", "[branchid]", "page.tsx"), "utf8");
    const state = { errors: [], fields: ["Keep report"], requests: 0 };
    const context = {
        Error, testid: 100221, loadedResultKey: "report", resultKey: "report", submitting: false, fields: [], impression: "", selectedTemplate: null, templateGeneration: {current: 0}, setTemplateUndo() {}, window: {confirm: () => true},
        setSelectedTemplate() {},
        setIsTemplateLoading: value => { state.loading = value; },
        customFetch: async () => { state.requests++; return { status: "error", message: "Ultrasound template not found" }; },
        setFields: fields => { state.fields = fields; },
        setImpression() {},
        toast: { error: message => state.errors.push(message) },
        console: { error() {} },
    };
    vm.runInNewContext(handler(source, "handleTemplateChange"), context);
    await context.handler({ value: 3 });
    assert.deepEqual(state.fields, ["Keep report"]);
    assert.equal(state.requests, 1);
    assert.equal(state.errors[0], "Ultrasound template not found");
    assert.equal(state.loading, false);
});
