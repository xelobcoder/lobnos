const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');
const ts = require('typescript');
const React = require('react');
const root = path.join(__dirname, '..');

function compile(file, mocks, globals = {}) {
    const result = ts.transpileModule(readFileSync(path.join(root, file), 'utf8'), {
        fileName: file, reportDiagnostics: true,
        compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
    });
    assert.deepEqual(result.diagnostics, []);
    const exports = {};
    vm.runInNewContext(result.outputText, { exports, require: mocks, console, URL, URLSearchParams, Blob, FormData, AbortController, ...globals });
    return exports;
}
const png = () => new Blob(['synthetic image bytes'], { type: 'image/png' });
const json = (data, status = 200) => new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });

function api(options = {}) {
    let imagePath = null;
    const calls = [];
    const helper = compile('lib/patientImages.ts', name => {
        if (name.endsWith('apiBaseUrl')) return { buildApiUrl: endpoint => `https://facility.test/api/v1/${endpoint}` };
        if (name.endsWith('requestHeaders')) return { getRequestContext: async () => options.context || {tenantId:7,authenticated:true} };
        if (name.endsWith('NewPasswordInput')) return { __esModule: true, default: () => null, validatePasswordControl: () => true };
        throw new Error(`Unexpected dependency ${name}`);
    }, { fetch: async (url, request) => {
        calls.push({ url: new URL(url), request });
        if (options.fetch) return options.fetch(url, request);
        if (request.method === 'POST') { imagePath = `patients_t7_p42_${calls.length}.png`; return json({ status: 'success', imagePath }); }
        if (new URL(url).pathname.endsWith('patients/images')) return json({ status: 'success', imagePath });
        return new Response(png(), { headers: { 'Content-Type': 'image/png' } });
    } });
    return { helper, calls };
}

test('a saved patient photo reloads on revisit, and replacement uses the current server reference', async () => {
    const { helper, calls } = api();
    assert.equal(await helper.loadPatientImage(42), null);
    const first = await helper.uploadPatientImage(42, png());
    const reopened = await helper.loadPatientImage(42);
    assert.equal(reopened.imagePath, first);
    assert.equal(reopened.blob.type, 'image/png');
    const second = await helper.uploadPatientImage(42, png());
    assert.notEqual(second, first);
    assert.equal((await helper.loadPatientImage(42)).imagePath, second);
    for (const { url, request } of calls) {
        assert.equal(url.origin, 'https://facility.test');
        assert.equal(url.searchParams.get('tenantId'), '7');
        assert.equal(url.searchParams.get('patientid'), '42');
        assert.equal(request.headers,undefined);
        assert.equal(request.credentials, 'include');
        assert.equal(request.cache, 'no-store');
        if (request.method === 'POST') {
            assert.equal(url.searchParams.get('category'), 'patients');
            assert.equal(request.body.get('file').type, 'image/png');
            assert.equal(request.headers?.['Content-Type'], undefined);
        }
    }
});

test('HTTP errors and HTTP 200 error payloads never confirm a successful photo save', async () => {
    for (const [status, body] of [[413, { status: 'error', message: 'Image too large' }], [200, { status: 'error', message: 'Disk write failed' }], [200, { error: 'Session not found' }], [200, { status: 'success' }]]) {
        const { helper } = api({ fetch: async () => json(body, status) });
        await assert.rejects(helper.uploadPatientImage(42, png()));
    }
});

test('missing or malformed saved photo references and inaccessible image bytes are visible failures', async () => {
    for (const imagePath of [undefined, '', '../photo.png', 'folder/photo.png']) {
        const { helper } = api({ fetch: async () => json({ status: 'success', imagePath }) });
        await assert.rejects(helper.loadPatientImage(42), /reference/);
    }
    const { helper } = api({ fetch: async url => new URL(url).pathname.endsWith('patients/images')
        ? json({ status: 'success', imagePath: 'photo.png' }) : new Response('Forbidden', { status: 403 }) });
    await assert.rejects(helper.loadPatientImage(42), /could not be loaded/);
});

test('patient and session identity must be valid before any photo request', async () => {
    for (const context of [{}, { tenantId: 0, PLS_SESSION: 's', PLS_PRIME_TENANT_SESSION: 't' }, { tenantId: 7, PLS_SESSION: 's' }]) {
        const { helper, calls } = api({ context });
        await assert.rejects(helper.loadPatientImage(42), /session/);
        assert.equal(calls.length, 0);
    }
    const { helper, calls } = api();
    for (const id of [0, -1, 1.5, NaN]) await assert.rejects(helper.loadPatientImage(id), /valid patient/);
    assert.equal(calls.length, 0);
});

test('client image policy agrees with the server: JPEG, PNG and GIF up to 5 MB', async () => {
    const { helper, calls } = api();
    for (const type of ['image/jpeg', 'image/png', 'image/gif']) helper.validatePatientImage(new Blob(['pixels'], { type }));
    for (const file of [new Blob(['pixels'], { type: 'image/webp' }), new Blob(['html'], { type: 'text/html' }), new Blob([], { type: 'image/png' }), new Blob([new Uint8Array(helper.MAX_PATIENT_IMAGE_BYTES + 1)], { type: 'image/png' })]) {
        await assert.rejects(helper.uploadPatientImage(42, file));
    }
    assert.equal(calls.length, 0);
});

function hooks() {
    const state = [], refs = [], deps = [], cleanups = [], pending = [];
    let cursor = 0;
    const react = {
        ...React,
        useState(initial) { const index = cursor++; if (!(index in state)) state[index] = typeof initial === 'function' ? initial() : initial; return [state[index], next => { state[index] = typeof next === 'function' ? next(state[index]) : next; }]; },
        useRef(initial) { const index = cursor++; return refs[index] ||= { current: initial }; },
        useCallback(callback, values) { const index = cursor++; if (!deps[index] || values.some((value, i) => !Object.is(value, deps[index][i]))) { deps[index] = values; state[index] = callback; } return state[index]; },
        useEffect(effect, values) { const index = cursor++; if (!deps[index] || values.some((value, i) => !Object.is(value, deps[index][i]))) { deps[index] = values; pending.push(() => { cleanups[index]?.(); cleanups[index] = effect(); }); } },
    };
    return { react, render: callback => { cursor = 0; return callback(); }, async flush() { pending.splice(0).forEach(run => run()); for (let i = 0; i < 30; i++) await Promise.resolve(); }, unmount() { cleanups.forEach(cleanup => cleanup?.()); } };
}
const nodes = (tree, predicate) => tree == null || typeof tree !== 'object' ? [] : Array.isArray(tree) ? tree.flatMap(child => nodes(child, predicate)) : [...(predicate(tree) ? [tree] : []), ...nodes(tree.props?.children, predicate)];
const text = tree => tree == null ? '' : typeof tree !== 'object' ? String(tree) : Array.isArray(tree) ? tree.map(text).join('') : text(tree.props?.children);
const button = (tree, label) => nodes(tree, node => node.props?.onClick && text(node).trim() === label)[0];

function wizard(options = {}) {
    const lifecycle = hooks();
    const calls = [], success = [], errors = [], revoked = [];
    const window = { location: { href: '' } };
    let photoUrl = options.savedPhoto || null;
    const photo = { get imageUrl() { return photoUrl; }, loading: false, error: '', refresh: async () => { calls.push(['refresh']); if (options.reloadError) throw new Error('Read failed'); photoUrl = 'blob:saved-new'; } };
    const noop = () => null;
    const Modal = Object.assign(noop, { Header: noop, Title: noop, Body: noop, Footer: noop });
    const Component = compile('components/registration/RegistrationWizard.tsx', name => {
        if (name === 'react') return lifecycle.react;
        if (name === 'react/jsx-runtime') return require(name);
        if (name === 'react-bootstrap') return { Modal, Button: 'button', Spinner: 'span', Alert: 'aside', Form: noop };
        if (name === 'next/navigation') return { useRouter: () => ({ push: noop }), useParams: () => ({}), useSearchParams: () => new URLSearchParams() };
        if (name.endsWith('queueHandoff')) return {
            parseQueueHandoff: () => options.queue ? { ticketId: 8, date: '2030-01-02' } : null,
            withQueueHandoff: (url, handoff, pending) => handoff ? `${url}?queueTicket=8&queueDate=2030-01-02${pending ? '&queueLinkPending=1' : ''}` : url,
            linkSavedRecordToQueue: async (handoff, values) => { if (handoff) calls.push(['queue-link', values]); return { warning: options.queueWarning || '' }; },
        };
        if (name.endsWith('useApplicationContext')) return { useApplication: () => ({ user: { employeeid: 9 } }) };
        if (name.endsWith('usePatientImage')) return { __esModule: true, default: () => photo };
        if (name.endsWith('patientImages')) return {
            validatePatientImage: file => { if (file.type !== 'image/png' || file.size > 5 * 1024 * 1024) throw new Error('Choose an allowed photo'); },
            uploadPatientImage: async (id, file) => { calls.push(['upload', id, file]); if (options.upload) await options.upload(); return 'saved-photo.png'; },
        };
        if (name.endsWith('customFetch')) return { customFetch: async () => ({}), customPost: async (endpoint, method, data) => { calls.push(['credentials', endpoint, data]); return options.credentialsError ? { status: 'error', message: 'Credentials rejected' } : { status: 'success', ...(options.registeredId ? { patientid: options.registeredId } : {}) }; } };
        if (name === 'react-toastify') return { toast: { success: message => success.push(message), error: message => errors.push(message), info: noop } };
        if (name.endsWith('encryption')) return { plsEncryption: id => `encrypted-${id}` };
        if (name.endsWith('fields/Util')) return { designation: [], PatientPersonalInformationFields: options.personalData || {}, ghanaDistricts: {} };
        if (name.endsWith('registerclient')) return { handleAgeCalculations: noop };
        if (name.endsWith('NewPasswordInput')) return { __esModule: true, default: noop, validatePasswordControl: () => true };
        if (name.endsWith('.css')) return {};
        if (name === '@remixicon/react') return new Proxy({}, { get: () => noop });
        throw new Error(`Unexpected dependency ${name}`);
    }, { window, URL: { createObjectURL: () => 'blob:pending', revokeObjectURL: url => revoked.push(url) } }).default;
    const render = () => lifecycle.render(() => Component({ initialPatientId: options.newPatient ? undefined : 42, initialStep: options.initialStep ?? 3 }));
    return { ...lifecycle, calls, success, errors, window, revoked, render, async select(file = png()) {
        const input = nodes(render(), node => node.props?.id === 'patient-photo-file')[0];
        input.props.onChange({ target: { files: [file], value: 'photo.png' } });
        render(); await lifecycle.flush();
    } };
}

test('the actual registration screen shows a saved photo when reopened without uploading it again', async () => {
    const view = wizard({ savedPhoto: 'blob:already-saved' });
    view.render(); await view.flush();
    const tree = view.render();
    assert.equal(nodes(tree, node => node.type === 'img')[0].props.src, 'blob:already-saved');
    await button(tree, 'Complete Registration & Go to Billing').props.onClick();
    assert.equal(view.calls.filter(call => call[0] === 'upload').length, 0);
    assert.match(view.window.location.href, /encrypted-42/);
});
test('registration links a newly saved patient before carrying the queue into billing', async () => {
    const view = wizard({ queue: true, newPatient: true, initialStep: 0, registeredId: 77, personalData: { firstname: 'Jane', lastname: 'Doe', gender: 'female' } });
    view.render(); await view.flush();
    await button(view.render(), 'Save & Proceed to Billing').props.onClick();
    assert.deepEqual(JSON.parse(JSON.stringify(view.calls.filter(call => call[0] === 'queue-link'))), [['queue-link', { patientid: 77 }]]);
    assert.match(view.window.location.href, /encrypted-77\/multi\?queueTicket=8&queueDate=2030-01-02/);
    assert.equal(view.errors.length, 0);
    assert.equal(view.calls.filter(call => call[0] === 'credentials').length, 1);
});
test('queue linkage failure preserves patient save success and carries a concrete follow-up warning', async () => {
    const view = wizard({ queue: true, queueWarning: 'Saved record needs a queue link. Do not save again.', newPatient: true, initialStep: 0, registeredId: 77, personalData: { firstname: 'Jane', lastname: 'Doe', gender: 'female' } });
    view.render(); await view.flush();
    await button(view.render(), 'Save & Proceed to Billing').props.onClick();
    assert.equal(view.success.length, 1); assert.equal(view.errors.length, 0);
    assert.match(view.window.location.href, /queueLinkPending=1/);
    assert.match(text(view.render()), /Do not save again/);
});
test('photo completion still saves the portrait before linking the queue and proceeding to billing', async () => {
    const view = wizard({ queue: true }); view.render(); await view.flush(); await view.select();
    await button(view.render(), 'Complete Registration & Go to Billing').props.onClick();
    assert.deepEqual(view.calls.map(call => call[0]), ['upload', 'refresh', 'queue-link']);
    assert.match(view.window.location.href, /queueTicket=8/);
});

test('completion waits for a selected photo to persist and reload before success or billing navigation', async () => {
    let finish;
    const waiting = new Promise(resolve => { finish = resolve; });
    const view = wizard({ upload: () => waiting });
    view.render(); await view.flush(); await view.select();
    const saving = button(view.render(), 'Complete Registration & Go to Billing').props.onClick();
    assert.equal(view.success.length, 0);
    assert.equal(view.window.location.href, '');
    assert.equal(button(view.render(), 'Upload File').props.disabled, true);
    finish(); await saving;
    assert.deepEqual(view.calls.map(call => call[0]), ['upload', 'refresh']);
    assert.equal(view.calls[0][1], 42);
    assert.match(view.window.location.href, /encrypted-42/);
    assert.equal(view.success.length, 1);
});

test('failed upload retains the selected file and prevents the false completion message and redirect', async () => {
    let failing = true;
    const view = wizard({ upload: async () => { if (failing) throw new Error('Upload rejected'); } });
    view.render(); await view.flush(); await view.select();
    await button(view.render(), 'Complete Registration & Go to Billing').props.onClick();
    assert.equal(view.success.length, 0);
    assert.equal(view.window.location.href, '');
    assert.match(text(view.render()), /Upload rejected/);
    assert.ok(button(view.render(), 'Save photo'));
    failing = false;
    await button(view.render(), 'Save photo').props.onClick();
    assert.equal(view.success.length, 1);
    assert.equal(view.window.location.href, '');
    assert.equal(nodes(view.render(), node => node.type === 'img')[0].props.src, 'blob:saved-new');
});

test('discarding an unsaved replacement restores the saved photo and frees its preview URL', async () => {
    const view = wizard({ savedPhoto: 'blob:old-photo' });
    view.render(); await view.flush(); await view.select();
    assert.equal(nodes(view.render(), node => node.type === 'img')[0].props.src, 'blob:pending');
    button(view.render(), 'Discard selected photo').props.onClick();
    view.render(); await view.flush();
    assert.equal(nodes(view.render(), node => node.type === 'img')[0].props.src, 'blob:old-photo');
    assert.ok(view.revoked.includes('blob:pending'));
    assert.equal(view.calls.length, 0);
});

test('invalid files cannot create pending photo saves', async () => {
    const view = wizard();
    view.render(); await view.flush(); await view.select(new Blob(['svg'], { type: 'image/svg+xml' }));
    assert.match(text(view.render()), /Choose an allowed photo/);
    assert.equal(button(view.render(), 'Save photo'), undefined);
    assert.equal(view.calls.length, 0);
});

test('credential errors also prevent completion after an optional photo is saved', async () => {
    const view = wizard({ credentialsError: true });
    view.render(); await view.flush(); await view.select();
    const inputs = nodes(view.render(), node => node.type === 'input');
    inputs.find(node => node.props.type === 'text').props.onChange({ target: { value: 'patient-user' } });
    nodes(view.render(), node => node.props?.id === 'registration-password')[0].props.onChange({ target: { value: 'synthetic-password7' } });
    await button(view.render(), 'Complete Registration & Go to Billing').props.onClick();
    assert.equal(view.success.length, 0);
    assert.equal(view.window.location.href, '');
    assert.match(text(view.render()), /Credentials rejected/);
});

test('the photo hook cancels obsolete patients, clears their previews and revokes URLs on unmount', async () => {
    const life = hooks();
    const requests = [], revoked = [];
    let next = 0;
    const hook = compile('components/petientsComponent/usePatientImage.ts', name => {
        if (name === 'react') return life.react;
        if (name.endsWith('patientImages')) return { loadPatientImage: (id, options) => new Promise(resolve => requests.push({ id, options, resolve })) };
        throw new Error(name);
    }, { URL: { createObjectURL: () => `blob:photo-${++next}`, revokeObjectURL: url => revoked.push(url) } }).default;
    const render = id => life.render(() => hook(id));
    render(42); await life.flush();
    requests[0].resolve({ imagePath: 'old.png', blob: png() }); await life.flush();
    assert.equal(render(42).imageUrl, 'blob:photo-1');
    assert.equal(render(43).imageUrl, null);
    await life.flush();
    assert.equal(requests[0].options.signal.aborted, true);
    assert.ok(revoked.includes('blob:photo-1'));
    requests[1].resolve({ imagePath: 'new.png', blob: png() }); await life.flush();
    assert.equal(render(43).imageUrl, 'blob:photo-2');
    life.unmount();
    assert.ok(revoked.includes('blob:photo-2'));
});

test('a slow response for a previous patient cannot replace the currently selected patient photo', async () => {
    const life = hooks(), requests = [];
    let created = 0;
    const hook = compile('components/petientsComponent/usePatientImage.ts', name => {
        if (name === 'react') return life.react;
        if (name.endsWith('patientImages')) return { loadPatientImage: id => new Promise(resolve => requests.push({ id, resolve })) };
        throw new Error(name);
    }, { URL: { createObjectURL: () => `blob:current-${++created}`, revokeObjectURL() {} } }).default;
    const render = id => life.render(() => hook(id));
    render(42); await life.flush();
    render(43); await life.flush();
    requests[1].resolve({ imagePath: 'current.png', blob: png() }); await life.flush();
    requests[0].resolve({ imagePath: 'obsolete.png', blob: png() }); await life.flush();
    assert.equal(render(43).imageUrl, 'blob:current-1');
    assert.equal(created, 1);
    life.unmount();
});

for (const compact of [false, true]) test(`patient summary displays the saved portrait and a local fallback (compact=${compact})`, async () => {
    const life = hooks();
    let imageUrl = 'blob:stored-photo';
    const Component = compile('components/petientsComponent/PreviewPatientInformation.jsx', name => {
        if (name === 'react') return life.react;
        if (name === 'react/jsx-runtime') return require(name);
        if (name.endsWith('customFetch')) return { customFetch: async () => ({ result: { firstname: 'Synthetic', lastname: 'Patient' } }), formatDateOrNA: () => 'N/A' };
        if (name.endsWith('usePatientImage')) return { __esModule: true, default: () => ({ imageUrl, loading: false, error: '', refresh: async () => undefined }) };
        if (name === 'react-bootstrap') return { Row: 'section', Col: 'div' };
        throw new Error(name);
    }).default;
    const render = () => life.render(() => Component({ patientid: 42, compact }));
    render(); await life.flush();
    const photos = nodes(render(), node => node.type === 'img');
    assert.equal(photos.length, 1);
    assert.equal(photos[0].props.src, 'blob:stored-photo');
    imageUrl = null;
    assert.equal(nodes(render(), node => node.type === 'img').length, 0);
    assert.equal(nodes(render(), node => node.props?.['aria-label'] === 'Patient initials').length, 1);
});
