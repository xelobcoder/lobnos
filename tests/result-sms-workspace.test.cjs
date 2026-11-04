const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");
const test = require("node:test");
const root = path.join(__dirname, "..");
const folder = "app/communications/sms/laboratory-lifecycle-events/sends/";

// Execute the real hooks/components with a deterministic React hook lifecycle.
// No browser, backend connection, or patient SMS is used.
function load(file, resolve, globals = {}) {
    const code = ts.transpileModule(fs.readFileSync(path.join(root, file), "utf8"), {
        compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX },
    }).outputText;
    const exports = {};
    vm.runInNewContext(code, { exports, require: resolve, URLSearchParams, console, Error, ...globals });
    return exports;
}
const types = load("lib/resultSmsWorkspace.ts", name => { throw new Error(name); });
function harness() {
    const slots = [];
    let index = 0, dirty = true, renderFn, value;
    let effects = [];
    const react = {
        useState(initial) {
            const i = index++;
            if (!slots[i]) slots[i] = { value: typeof initial === "function" ? initial() : initial };
            return [slots[i].value, next => {
                const updated = typeof next === "function" ? next(slots[i].value) : next;
                if (!Object.is(updated, slots[i].value)) { slots[i].value = updated; dirty = true; }
            }];
        },
        useRef(initial) {
            const i = index++;
            if (!slots[i]) slots[i] = { current: initial };
            return slots[i];
        },
        useEffect(fn, deps) {
            const i = index++;
            const old = slots[i];
            if (!old || !deps || deps.some((dep, n) => !Object.is(dep, old.deps[n]))) {
                slots[i] = { deps, cleanup: old?.cleanup };
                effects.push(() => {
                    slots[i].cleanup?.();
                    slots[i].cleanup = fn();
                });
            }
        },
    };
    function render() {
        let iterations = 0;
        while (dirty) {
            if (++iterations > 50) throw new Error("Unbounded renders");
            dirty = false; index = 0; effects = [];
            value = renderFn();
            effects.forEach(effect => effect());
        }
        return value;
    }
    return {
        react,
        mount(fn) { renderFn = fn; return render(); },
        render,
        async flush() { for (let i = 0; i < 8; i++) { await Promise.resolve(); render(); } return value; },
        get value() { return value; },
        unmount() { slots.forEach(slot => slot.cleanup?.()); },
        rerender() { dirty = true; return render(); },
    };
}
const deferred = () => {
    let resolve, reject;
    const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
    return { promise, resolve, reject };
};
const readyTest = id => ({ ascensionid: id, testid: id * 10, name: `Test ${id}`, resultEntryEnd: "2026-11-04", status: "ready", reason: null });
const workspace = {
    billingid: 2, patient: { patientid: 4, name: "Patient Example", phone: "+000000000" },
    smsAvailable: true, smsUnavailableReason: null,
    tests: [readyTest(7), readyTest(8), { ...readyTest(9), status: "critical_hold", reason: "Clinical review required" }],
};
const ok = data => ({ success: true, data });
const preview = (ids = [7], overrides = {}) => ({
    billingid: 2, patientid: 4, phone: workspace.patient.phone,
    message: ids.map(id => `Test ${id}`).join(", ") + " ready. Contact reception.",
    ascensionids: ids, testNames: ids.map(id => `Test ${id}`), pendingCount: 1,
    fingerprint: "verified-hash", encoding: "GSM-7", segments: 1, ...overrides,
});
function setup({ linkedId = "7", patientid = "4", data = workspace, mutate = async () => ok(preview()) } = {}) {
    const h = harness(), calls = [];
    const api = {
        customFetch: async endpoint => { calls.push({ endpoint, method: "GET" }); return typeof data === "function" ? data(endpoint) : ok(data); },
        customFetchMutation: async (endpoint, method, body) => {
            calls.push({ endpoint, method, body }); return mutate(endpoint, method, body);
        },
    };
    const hook = load(folder + "useResultSmsWorkspace.ts", name => {
        if (name === "react") return h.react;
        if (name.endsWith("customFetch")) return api;
        if (name.endsWith("resultSmsWorkspace")) return types;
        throw new Error(name);
    }).useResultSmsWorkspace;
    h.mount(() => hook("2", patientid, linkedId));
    return { h, calls };
}
const plain = value => JSON.parse(JSON.stringify(value));
async function prepared(h) {
    await h.flush();
    await h.value.requestPreview();
    await h.flush();
    h.value.confirm(true);
    await h.flush();
}
test("ready linked row only; unready/missing link selects nothing and cannot preview", async () => {
    for (const linkedId of ["7", "9", "", "99"]) {
        const { h, calls } = setup({ linkedId });
        await h.flush();
        assert.deepEqual(plain(h.value.selected), linkedId === "7" ? [7] : []);
        if (linkedId !== "7") {
            await h.value.requestPreview();
            assert.equal(calls.filter(call => call.method === "POST").length, 0);
        }
        h.value.changeSelection([7, 8, 9]);
        await h.flush();
        assert.deepEqual(plain(h.value.selected), [7, 8]);
        h.unmount();
    }
});
test("preview POST carries selected ready tests and note; no supplied phone and no send", async () => {
    const { h, calls } = setup({ mutate: async (_url, _method, body) => ok(preview(plain(body.ascensionids))) });
    await h.flush();
    h.value.changeSelection([8, 7]);
    h.value.changeNote("Collect tomorrow.");
    await h.flush();
    await h.value.requestPreview();
    await h.flush();
    const request = calls.find(call => call.method === "POST");
    assert.equal(request.endpoint, "sms/events/result-ready/preview?billingid=2");
    assert.deepEqual(plain(request.body), { ascensionids: [7, 8], message: "Collect tomorrow." });
    assert.match(h.value.preview.message, /Test 7, Test 8/);
    assert.equal(calls.filter(call => call.endpoint.includes("/send?")).length, 0);
    assert.equal(h.value.confirmed, false);
    h.unmount();
});
test("workspace supports optional patient ID; unavailable SMS never previews", async () => {
    const available = setup({ patientid: "" });
    await available.h.flush();
    assert.equal(available.calls[0].endpoint, "sms/events/result-ready/workspace?billingid=2");
    assert.equal(available.h.value.workspace.patient.patientid, 4);
    available.h.unmount();
    for (const data of [
        { ...workspace, smsAvailable: false, smsUnavailableReason: "SMS disabled for branch" },
        { ...workspace, patient: { ...workspace.patient, phone: null } },
    ]) {
        const { h, calls } = setup({ data });
        await h.flush();
        await h.value.requestPreview();
        assert.equal(h.value.eligible, false);
        assert.equal(calls.filter(call => call.method === "POST").length, 0);
        h.unmount();
    }
});
test("note/selection changes immediately invalidate preview; stale preview responses are ignored", async () => {
    const first = deferred(), second = deferred();
    let count = 0;
    const { h } = setup({ mutate: () => (++count === 1 ? first.promise : second.promise) });
    await h.flush();
    const p1 = h.value.requestPreview();
    h.render();
    h.value.changeNote("New note");
    assert.equal(h.render().preview, null);
    const p2 = h.value.requestPreview();
    second.resolve(ok(preview([7], { message: "New note rendered" })));
    await p2; await h.flush();
    first.resolve(ok(preview()));
    await p1; await h.flush();
    assert.equal(h.value.preview.message, "New note rendered");
    h.value.confirm(true); await h.flush();
    const staleSend = h.value.send;
    h.value.changeSelection([8]);
    await staleSend();
    assert.equal(count, 2, "stale closure cannot send invalidated preview");
    assert.equal(h.render().preview, null);
    h.unmount();
});
test("send requires confirmation, synchronously prevents duplicates, and locks edits/dismissals", async () => {
    const pending = deferred();
    const { h, calls } = setup({ mutate: endpoint => endpoint.includes("/send?") ? pending.promise : Promise.resolve(ok(preview())) });
    await h.flush();
    await h.value.requestPreview(); await h.flush();
    await h.value.send();
    assert.equal(calls.filter(call => call.endpoint.includes("/send?")).length, 0);
    h.value.confirm(true); await h.flush();
    const send = h.value.send;
    const sending = send();
    void send();
    h.value.changeSelection([8]);
    h.value.changeNote("Changed");
    h.value.confirm(false);
    h.value.refreshWorkspace();
    h.render();
    assert.equal(h.value.sending, true);
    assert.deepEqual(plain(h.value.selected), [7]);
    assert.equal(h.value.note, "");
    assert.equal(h.value.confirmed, true);
    const sent = calls.filter(call => call.endpoint.includes("/send?"));
    assert.equal(sent.length, 1);
    assert.equal(sent[0].method, "POST");
    assert.deepEqual(plain(sent[0].body), { ascensionids: [7], message: "", fingerprint: "verified-hash" });
    pending.resolve(ok({ jobid: 45, status: "delivered" }));
    await sending; await h.flush();
    assert.deepEqual(plain(h.value.confirmation), { jobid: 45, status: "delivered" });
    assert.equal(h.value.preview, null);
    assert.equal(h.value.historyRevision, 1);
    h.value.changeNote("Another note");
    await h.flush();
    assert.equal(h.value.confirmation.jobid, 45, "confirmation stays visible");
    h.unmount();
});
test("stale/rejected send retains explicit reason and refreshes workspace/history", async () => {
    const { h, calls } = setup({ mutate: endpoint => Promise.resolve(endpoint.includes("/send?")
        ? { success: false, error: "Selection changed; preview again (409)." } : ok(preview())) });
    await prepared(h);
    await h.value.send(); await h.flush();
    assert.match(h.value.actionError, /Selection changed/);
    assert.equal(h.value.uncertain, false);
    assert.equal(h.value.historyRevision, 1);
    assert.equal(calls.filter(call => call.method === "GET").length, 2);
    h.unmount();
});
test("same approved selection may reuse a job with its current submitted/delivered status", async () => {
    let attempt = 0;
    const { h } = setup({ mutate: async endpoint => endpoint.includes("/send?")
        ? ok({ jobid: 45, status: ++attempt === 1 ? "submitted" : "delivered" }) : ok(preview()) });
    await prepared(h);
    await h.value.send(); await h.flush();
    assert.deepEqual(plain(h.value.confirmation), { jobid: 45, status: "submitted" });
    await prepared(h);
    await h.value.send(); await h.flush();
    assert.deepEqual(plain(h.value.confirmation), { jobid: 45, status: "delivered" });
    assert.equal(types.smsStatusTone("unknown"), "secondary");
    assert.equal(types.smsStatusTone("cancelled"), "danger");
    h.unmount();
});
test("confirmation dismissal immediately prevents a stale handler from sending", async () => {
    const { h, calls } = setup();
    await prepared(h);
    const staleSend = h.value.send;
    h.value.confirm(false);
    await staleSend();
    assert.equal(calls.filter(call => call.endpoint.includes("/send?")).length, 0);
    h.unmount();
});
test("uncertain network outcome blocks blind retry until explicit history review", async () => {
    const { h, calls } = setup({ mutate: endpoint => endpoint.includes("/send?")
        ? Promise.reject(new Error("Connection lost")) : Promise.resolve(ok(preview())) });
    await prepared(h);
    await h.value.send(); await h.flush();
    assert.match(h.value.actionError, /Review refreshed message history first/);
    assert.equal(h.value.uncertain, true);
    const count = calls.length;
    await h.value.requestPreview();
    await h.value.send();
    assert.equal(calls.length, count);
    h.value.acknowledgeHistoryReview(); await h.flush();
    assert.equal(h.value.uncertain, false);
    assert.equal(h.value.preview, null);
    assert.match(h.value.actionError, /uncertain/);
    h.unmount();
});
test("old instance cannot consume a preview after branch/tenant keyed unmount", async () => {
    const request = deferred();
    const { h } = setup({ mutate: () => request.promise });
    await h.flush();
    const task = h.value.requestPreview();
    h.unmount();
    request.resolve(ok(preview()));
    await task; await h.flush();
    assert.equal(h.value.preview, null);
});
test("late workspace/send responses cannot populate a disposed context", async () => {
    const workspaceRequest = deferred();
    const workspaceSetup = setup({ data: () => workspaceRequest.promise });
    workspaceSetup.h.unmount();
    workspaceRequest.resolve(ok(workspace));
    await workspaceSetup.h.flush();
    assert.equal(workspaceSetup.h.value.workspace, null);
    const sendRequest = deferred();
    const sending = setup({ mutate: endpoint => endpoint.includes("/send?") ? sendRequest.promise : Promise.resolve(ok(preview())) });
    await prepared(sending.h);
    const task = sending.h.value.send();
    sending.h.unmount();
    sendRequest.resolve(ok({ jobid: 45, status: "sent" }));
    await task; await sending.h.flush();
    assert.equal(sending.h.value.confirmation, null);
});
test("workspace errors and mismatched preview identities are not empty/success states", async () => {
    const { h } = setup({ data: () => ({ success: false, error: "Branch not authorized" }) });
    await h.flush();
    assert.equal(h.value.workspace, null);
    assert.match(h.value.loadError, /Branch not authorized/);
    h.unmount();
    const other = setup({ mutate: async () => ok(preview([7], { billingid: 88 })) });
    await other.h.flush();
    await other.h.value.requestPreview(); await other.h.flush();
    assert.equal(other.h.value.preview, null);
    assert.match(other.h.value.actionError, /does not match/);
    other.h.unmount();
});
function realMutation(serverBackendRequest) {
    const backend = load("components/serverActions/backendRequest.ts", name => {
        if (name.endsWith("serverBackendRequest")) return { serverBackendRequest };
        throw new Error(name);
    });
    return load("components/Auth/customFetch.js", name => {
        if (name.endsWith("/backendRequest")) return backend;
        if (name === "react-toastify") return { toast: {} };
        if (name === "js-cookie" || name === "moment") return { default: {} };
        if (name.endsWith("/requestHeaders") || name.endsWith("/apiBaseUrl")) return {};
        throw new Error(name);
    }).customFetchMutation;
}
test("actual request wrapper preview failure renders nested message, never [object Object]", async () => {
    const mutation = realMutation(async () => { throw new Error("Offline"); });
    const { h } = setup({ mutate: mutation });
    await h.flush();
    await h.value.requestPreview(); await h.flush();
    assert.match(h.value.actionError, /The server response could not be confirmed/);
    assert.match(h.value.actionError, /UPSTREAM_UNAVAILABLE/);
    assert.doesNotMatch(h.value.actionError, /\[object Object\]/);
    assert.equal(h.value.preview, null);
    h.unmount();
});
test("actual request wrapper successful preview retains rendered selected-test scope", async () => {
    const mutation = realMutation(async (_endpoint, options) => {
        const body = JSON.parse(options.body);
        return { ok: true, status: 200, json: async () => ok(preview(body.ascensionids, {
            message: `Test 7 ready. Notice covers only listed tests. ${body.message}`,
        })) };
    });
    const { h } = setup({ mutate: mutation });
    await h.flush();
    h.value.changeNote("Collect tomorrow."); await h.flush();
    await h.value.requestPreview(); await h.flush();
    assert.equal(h.value.actionError, "");
    assert.equal(h.value.preview.message, "Test 7 ready. Notice covers only listed tests. Collect tomorrow.");
    assert.equal(h.value.confirmed, false);
    h.unmount();
});
test("thrown structured errors preserve actionable preview and uncertain-send details", async () => {
    const failure = { error: { code: "CONNECTION_INTERRUPTED", message: "Connection to SMS service was interrupted.", details: { endpoint: ["Review notification history before retrying."] } } };
    const { h } = setup({ mutate: async () => { throw failure; } });
    await h.flush();
    await h.value.requestPreview(); await h.flush();
    assert.match(h.value.actionError, /Connection to SMS service was interrupted/);
    assert.match(h.value.actionError, /CONNECTION_INTERRUPTED/);
    assert.match(h.value.actionError, /endpoint: Review notification history/);
    assert.doesNotMatch(h.value.actionError, /\[object Object\]/);
    h.unmount();
    const sending = setup({ mutate: async endpoint => {
        if (endpoint.includes("/send?")) throw failure;
        return ok(preview());
    } });
    await prepared(sending.h);
    await sending.h.value.send(); await sending.h.flush();
    assert.equal(sending.h.value.uncertain, true);
    assert.match(sending.h.value.actionError, /Connection to SMS service was interrupted/);
    assert.match(sending.h.value.actionError, /CONNECTION_INTERRUPTED/);
    sending.h.unmount();
});
test("real mutation serializes JSON once and preserves structured backend validation details", async () => {
    const requests = [];
    const mutation = realMutation(async (endpoint, options) => {
        requests.push({ endpoint, options });
        return { ok: false, status: 400, json: async () => ({
            success: false,
            error: {
                code: "VALIDATION_ERROR", message: "Selected tests cannot be previewed.",
                details: {
                    ascensionids: ["Test 7 is awaiting release."],
                    issues: [{ path: ["message"], message: "Note must be at most 1000 characters." }],
                },
            },
        }) };
    });
    const { h } = setup({ mutate: mutation });
    await h.flush();
    h.value.changeNote("Collection note"); await h.flush();
    await h.value.requestPreview(); await h.flush();
    assert.equal(requests[0].endpoint, "sms/events/result-ready/preview?billingid=2");
    assert.equal(requests[0].options.method, "POST");
    assert.equal(requests[0].options.headers["Content-Type"], "application/json");
    assert.deepEqual(JSON.parse(requests[0].options.body), { ascensionids: [7], message: "Collection note" });
    assert.match(h.value.actionError, /Selected tests cannot be previewed/);
    assert.match(h.value.actionError, /ascensionids: Test 7 is awaiting release/);
    assert.match(h.value.actionError, /message: Note must be at most 1000 characters/);
    assert.doesNotMatch(h.value.actionError, /\[object Object\]/);
    h.unmount();
});
test("wrapper-shaped unavailable send is uncertain, while structured validation rejection is explicit", async () => {
    for (const unavailable of [true, false]) {
        const mutation = unavailable
            ? realMutation(async () => { throw new Error("Connection dropped"); })
            : realMutation(async () => ({ ok: false, status: 409, json: async () => ({
                success: false, error: { code: "STALE_PREVIEW", message: "Approval revision changed.", details: { ascensionids: ["Refresh Test 7."] } },
            }) }));
        const { h, calls } = setup({ mutate: (endpoint, method, body) => endpoint.includes("/send?")
            ? mutation(endpoint, method, body) : Promise.resolve(ok(preview())) });
        await prepared(h);
        await h.value.send(); await h.flush();
        assert.equal(h.value.uncertain, unavailable);
        assert.equal(h.value.historyRevision, 1);
        assert.doesNotMatch(h.value.actionError, /\[object Object\]/);
        if (unavailable) {
            assert.match(h.value.actionError, /Review refreshed message history first/);
            assert.doesNotMatch(h.value.actionError, /Retry the original operation/);
            const count = calls.length;
            await h.value.requestPreview();
            assert.equal(calls.length, count);
        } else {
            assert.match(h.value.actionError, /Approval revision changed/);
            assert.match(h.value.actionError, /ascensionids: Refresh Test 7/);
        }
        h.unmount();
    }
});
test("SMS error formatter supports primitive failures, nested messages and safe fallback", () => {
    assert.equal(types.smsErrorMessage("Phone unavailable"), "Phone unavailable");
    assert.equal(types.smsErrorMessage(503), "503");
    assert.equal(types.smsErrorMessage({ unexpected: { value: 1 } }, "Could not preview."), "Could not preview.");
    assert.match(types.smsErrorMessage({ error: { error: { message: "Nested validation reason" } } }), /Nested validation reason/);
});

function nodes(tree, predicate) {
    if (!tree || typeof tree !== "object") return [];
    if (Array.isArray(tree)) return tree.flatMap(child => nodes(child, predicate));
    return [...(predicate(tree) ? [tree] : []), ...nodes(tree.props?.children, predicate)];
}
const jsx = { jsx: (type, props, key) => ({ type, props, key }), jsxs: (type, props, key) => ({ type, props, key }) };
const item = (status = "queued") => ({
    id: 1, jobid: 45, message: "Test 7 ready.", status,
    queuedAt: "2026-11-04T10:00:00Z", sentAt: null, lastCheckedAt: null, error: null, employeeid: 3,
});
function historySetup(fetch) {
    const h = harness(), calls = [], timers = new Map();
    let timerId = 0;
    const props = { billingid: "2", refreshRevision: 0, sending: false, uncertain: false, onHistoryReviewed() {} };
    const Component = load(folder + "SentMessagesTable.tsx", name => {
        if (name === "react") return h.react;
        if (name === "react/jsx-runtime") return jsx;
        if (name === "react-bootstrap") return { Button: "Button", Spinner: "Spinner" };
        if (name.endsWith("customFetch")) return { customFetch: endpoint => { calls.push(endpoint); return fetch(endpoint); } };
        if (name.endsWith("resultSmsWorkspace")) return types;
        if (name.endsWith(".css")) return { default: {} };
        throw new Error(name);
    }, {
        setTimeout(fn, delay) { const id = ++timerId; timers.set(id, { fn, delay }); return id; },
        clearTimeout(id) { timers.delete(id); },
    }).default;
    h.mount(() => Component(props));
    return { h, calls, timers, props };
}
test("history renders actual states, reasons and timestamps; polls only pending and cleans up", async () => {
    let status = "submitted";
    const { h, timers, calls } = historySetup(async () => ok({ items: [{ ...item(status), error: "Provider waiting" }], total: 1, page: 1, count: 10 }));
    await h.flush();
    assert.equal(timers.size, 1);
    const badge = nodes(h.value, n => n.type === "span" && n.props.children === "submitted")[0];
    assert.match(badge.props.className, /warning/);
    assert.equal(nodes(h.value, n => n.type === "p" && Array.isArray(n.props.children) && n.props.children.includes("Provider waiting")).length, 1);
    const timer = [...timers.values()][0];
    assert.equal(timer.delay, 15000);
    status = "delivered";
    timer.fn();
    await h.flush();
    assert.equal(calls.length, 2);
    assert.equal(timers.size, 0);
    assert.equal(nodes(h.value, n => n.type === "span" && n.props.children === "delivered").length, 1);
    h.unmount();
    assert.equal(timers.size, 0);
    const queued = historySetup(async () => ok({ items: [item()], total: 1, page: 1, count: 10 }));
    await queued.h.flush();
    assert.equal(queued.timers.size, 1);
    queued.h.unmount();
    assert.equal(queued.timers.size, 0);
});
test("history retains records/errors, stops polling on error, refreshes manually and bounds pages", async () => {
    let fail = false;
    const { h, calls, timers } = historySetup(async endpoint => fail
        ? { success: false, error: "History unavailable" }
        : ok({ items: [item("unknown")], total: 11, page: Number(new URLSearchParams(endpoint.split("?")[1]).get("page")), count: 10 }));
    await h.flush();
    assert.equal(timers.size, 0);
    const buttons = label => nodes(h.value, n => n.type === "Button" && n.props.children === label)[0];
    assert.equal(buttons("Previous").props.disabled, true);
    buttons("Next").props.onClick(); await h.flush();
    assert.match(calls.at(-1), /billingid=2&page=2&count=10/);
    assert.equal(buttons("Next").props.disabled, true);
    fail = true;
    buttons("Refresh history").props.onClick(); await h.flush();
    assert.equal(nodes(h.value, n => n.props?.role === "alert").length, 1);
    assert.equal(nodes(h.value, n => n.type === "span" && n.props.children === "unknown").length, 1);
    assert.equal(timers.size, 0);
    fail = false;
    buttons("Refresh history").props.onClick(); await h.flush();
    assert.equal(nodes(h.value, n => n.props?.role === "alert").length, 0);
    h.unmount();
});
test("history review is enabled only after a successful refreshed fetch", async () => {
    const pending = deferred();
    const { h, props } = historySetup(() => pending.promise);
    props.uncertain = true; props.refreshRevision++; h.rerender();
    let review = () => nodes(h.value, n => n.type === "Button" && n.props.children === "I reviewed refreshed history")[0];
    assert.equal(review().props.disabled, true);
    pending.resolve(ok({ items: [], total: 0, page: 1, count: 10 }));
    await h.flush();
    assert.equal(review().props.disabled, false);
    props.sending = true; h.rerender();
    assert.equal(review().props.disabled, true);
    h.unmount();
});
test("structured history failure retains nested reason and previously loaded records", async () => {
    let fail = false;
    const { h } = historySetup(async () => fail ? {
        success: false, error: { code: "HISTORY_UNAVAILABLE", message: "Cannot read notification history.", details: { billingid: ["Bill access changed."] } },
    } : ok({ items: [item("delivered")], total: 1, page: 1, count: 10 }));
    await h.flush();
    fail = true;
    nodes(h.value, n => n.type === "Button" && n.props.children === "Refresh history")[0].props.onClick();
    await h.flush();
    const alert = nodes(h.value, n => n.props?.role === "alert")[0];
    assert.match(JSON.stringify(alert), /Cannot read notification history/);
    assert.match(JSON.stringify(alert), /billingid: Bill access changed/);
    assert.doesNotMatch(JSON.stringify(alert), /\[object Object\]/);
    assert.equal(nodes(h.value, n => n.type === "span" && n.props.children === "delivered").length, 1);
    h.unmount();
});
test("send refresh returns history to newest page and discards stale page responses", async () => {
    let holdPage2 = false;
    const pending = deferred();
    const { h, props, calls } = historySetup(async endpoint => {
        const page = Number(new URLSearchParams(endpoint.split("?")[1]).get("page"));
        if (page === 2 && holdPage2) return pending.promise;
        return ok({ items: [{ ...item("sent"), message: `Page ${page}` }], total: 11, page, count: 10 });
    });
    await h.flush();
    holdPage2 = true;
    nodes(h.value, n => n.type === "Button" && n.props.children === "Next")[0].props.onClick();
    h.render();
    props.refreshRevision++; h.rerender();
    await h.flush();
    assert.match(calls.at(-1), /page=1&count=10/);
    pending.resolve(ok({ items: [{ ...item(), message: "Old page" }], total: 11, page: 2, count: 10 }));
    await h.flush();
    assert.match(JSON.stringify(h.value), /Page 1/);
    assert.doesNotMatch(JSON.stringify(h.value), /Old page/);
    h.unmount();
});
test("composer shows mixed-bill scope, blockers, saved recipient, safe spinners and confirmed preview", () => {
    let model = {
        workspace, selected: [7], loading: false, loadError: "", note: "", preview: preview(),
        previewing: false, sending: false, confirmed: false, eligible: true, actionError: "",
        confirmation: { jobid: 45, status: "submitted" }, uncertain: false, historyRevision: 1,
        refreshWorkspace() {}, changeSelection() {}, changeNote() {}, requestPreview() {}, send() {}, confirm() {}, acknowledgeHistoryReview() {},
    };
    let application = { user: { branchid: 1, tenantId: 2 } };
    const Page = load(folder + "page.tsx", name => {
        if (name === "react/jsx-runtime") return jsx;
        if (name === "next/navigation") return { useSearchParams: () => new URLSearchParams("billingid=2&patientid=4&ascensionid=7&service=imaging") };
        if (name === "react-bootstrap") return { Button: "Button", Spinner: "Spinner" };
        if (name.endsWith("useApplicationContext")) return { useApplication: () => application };
        if (name.endsWith("resultSmsWorkspace")) return types;
        if (name === "./useResultSmsWorkspace") return { useResultSmsWorkspace: () => model };
        if (name === "./SentMessagesTable") return { default: "History" };
        if (name.endsWith(".css")) return { default: {} };
        throw new Error(name);
    });
    const tree = Page.ResultSmsWorkspaceView({ billingid: "2", patientid: "4", linkedId: "7", imaging: true });
    assert.equal(nodes(tree, n => n.type === "h1")[0].props.children, "Imaging result SMS");
    const checkboxes = nodes(tree, n => n.type === "input" && n.props.type === "checkbox");
    assert.equal(checkboxes[2].props.disabled, true, "critical hold is visible but disabled");
    const sendButton = nodes(tree, n => n.type === "Button" && n.props.children === "Send confirmed SMS")[0];
    assert.equal(sendButton.props.disabled, true);
    const text = JSON.stringify(tree);
    assert.match(text, /Clinical review required/);
    assert.match(text, /Patient Example/);
    assert.match(text, /this bill may contain other services/);
    assert.doesNotMatch(text, /specimen|processingStart|collectionStart/);
    const firstIdentity = Page.default().key;
    application = { user: { branchid: 8, tenantId: 2 } };
    assert.notEqual(Page.default().key, firstIdentity);
    const branchIdentity = Page.default().key;
    application = { user: { branchid: 8, tenantId: 9 } };
    assert.notEqual(Page.default().key, branchIdentity);
    model = { ...model, loading: true, workspace: null };
    const spinner = nodes(Page.ResultSmsWorkspaceView({ billingid: "2", patientid: "4", linkedId: "7", imaging: true }), n => n.type === "Spinner")[0];
    assert.equal(spinner.props.as, "span");
});
test("bill-switch key resets selection/preview/history and cannot send a late prior-bill preview", async () => {
    let params = new URLSearchParams("billingid=2&patientid=4&ascensionid=7");
    const requests = [], latePreview = deferred();
    let previews = 0;
    const Page = load(folder + "page.tsx", name => {
        if (name === "react/jsx-runtime") return jsx;
        if (name === "next/navigation") return { useSearchParams: () => params };
        if (name === "react-bootstrap") return { Button: "Button", Spinner: "Spinner" };
        if (name.endsWith("useApplicationContext")) return { useApplication: () => ({ user: { branchid: 1, tenantId: 2 } }) };
        if (name.endsWith("resultSmsWorkspace")) return types;
        if (name === "./useResultSmsWorkspace") return {};
        if (name === "./SentMessagesTable") return { default: "History" };
        if (name.endsWith(".css")) return { default: {} };
        throw new Error(name);
    });
    let instance;
    function reconcile() {
        const node = Page.default();
        if (instance?.key === node.key) return instance;
        instance?.h.unmount();
        instance?.history.h.unmount();
        const h = harness();
        const api = {
            customFetch: async endpoint => {
                const bill = Number(new URLSearchParams(endpoint.split("?")[1]).get("billingid"));
                return ok(bill === 2 ? workspace : { ...workspace, billingid: 3, tests: [readyTest(10)] });
            },
            customFetchMutation: async (endpoint, method, body) => {
                requests.push({ endpoint, method, body });
                const bill = Number(new URLSearchParams(endpoint.split("?")[1]).get("billingid"));
                if (endpoint.includes("/send?")) return ok({ jobid: 55, status: "submitted" });
                if (bill === 2 && ++previews === 2) return latePreview.promise;
                return ok(preview(plain(body.ascensionids), { billingid: bill }));
            },
        };
        const hook = load(folder + "useResultSmsWorkspace.ts", name => {
            if (name === "react") return h.react;
            if (name.endsWith("customFetch")) return api;
            if (name.endsWith("resultSmsWorkspace")) return types;
            throw new Error(name);
        }).useResultSmsWorkspace;
        h.mount(() => hook(node.props.billingid, node.props.patientid, node.props.linkedId));
        const history = historySetup(async endpoint => {
            const bill = Number(new URLSearchParams(endpoint.split("?")[1]).get("billingid"));
            return ok({ items: bill === 2 ? [{ ...item("delivered"), message: "Prior bill notification" }] : [], total: bill === 2 ? 1 : 0, page: 1, count: 10 });
        });
        history.props.billingid = node.props.billingid;
        history.h.rerender();
        instance = { key: node.key, h, history };
        return instance;
    }
    const old = reconcile();
    await prepared(old.h);
    await old.history.h.flush();
    assert.deepEqual(plain(old.h.value.selected), [7]);
    assert.equal(old.h.value.preview.billingid, 2);
    assert.match(JSON.stringify(old.history.h.value), /Prior bill notification/);
    const staleSend = old.h.value.send;
    const pending = old.h.value.requestPreview();
    params = new URLSearchParams("billingid=3&patientid=4");
    const current = reconcile();
    assert.notEqual(current.key, old.key);
    assert.deepEqual(plain(current.h.value.selected), []);
    assert.equal(current.h.value.preview, null);
    assert.equal(current.h.value.confirmation, null);
    assert.doesNotMatch(JSON.stringify(current.history.h.value), /Prior bill notification/);
    await current.h.flush(); await current.history.h.flush();
    assert.deepEqual(plain(current.h.value.selected), [], "new bill does not inherit linked selection");
    assert.doesNotMatch(JSON.stringify(current.history.h.value), /Prior bill notification/);
    latePreview.resolve(ok(preview()));
    await pending; await old.h.flush();
    await staleSend();
    await current.h.value.send();
    assert.equal(current.h.value.preview, null);
    assert.equal(requests.filter(request => request.endpoint.includes("/send?")).length, 0);
    current.h.value.changeSelection([10]); await current.h.flush();
    await prepared(current.h);
    await current.h.value.send(); await current.h.flush();
    const send = requests.find(request => request.endpoint.includes("/send?"));
    assert.equal(send.endpoint, "sms/events/result-ready/send?billingid=3");
    assert.deepEqual(plain(send.body), { ascensionids: [10], message: "", fingerprint: "verified-hash" });
    current.h.unmount(); current.history.h.unmount();
});
