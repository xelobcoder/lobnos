const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');
const ts = require('typescript');
const React = require('react');
const root = path.join(__dirname, '..');
const plain = value => JSON.parse(JSON.stringify(value));
function load(file, mocks = require, globals = {}) {
    const compiled = ts.transpileModule(readFileSync(path.join(root, file), 'utf8'), {
        fileName: file, reportDiagnostics: true,
        compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
    });
    assert.deepEqual(compiled.diagnostics, []);
    const exports = {};
    vm.runInNewContext(compiled.outputText, { exports, require: mocks, console, URLSearchParams, Date, Error, Number, crypto: { randomUUID: () => 'retry-key-123456' }, ...globals });
    return exports;
}
const apiMock = name => name.endsWith('/apiBaseUrl') ? { buildApiUrl: endpoint => `https://example.test/api/v1/${endpoint}` } : require(name);
const helper = load('lib/walkInQueue.ts', apiMock);
const handoffHelper = load('lib/queueHandoff.ts', name => name.endsWith('/walkInQueue') ? helper : { customFetch: async () => { throw new Error('Unexpected handoff lookup'); } });
const ticket = (extra = {}) => ({ id: 8, ticketNumber: 'Q-008', version: 3, name: 'Private Name', phone: '0241234567', patientid: 10, billingid: 20, status: 'waiting', createdAt: '2030-01-02T08:00:00Z', testsTotal: 5, testsCompleted: 3, testsValidated: 2, ...extra });
const config = () => ({ facility: { slug: 'prime-lab', name: 'Prime Lab' }, settings: { publicEnabled: true, displayEnabled: true, ticketPrefix: 'Q', version: 2 }, date: '2030-01-02' });
const board = () => ({ facility: config().facility, date: '2030-01-02', tickets: [ticket()], summary: { waiting: 1, called: 0, serving: 0, completed: 0, total: 1 }, updatedAt: '2030-01-02T08:00:00Z' });
const nodes = (tree, predicate) => tree == null || typeof tree !== 'object' ? [] : Array.isArray(tree) ? tree.flatMap(value => nodes(value, predicate)) : [...(predicate(tree) ? [tree] : []), ...nodes(tree.props?.children, predicate)];
const text = tree => tree == null ? '' : typeof tree !== 'object' ? String(tree) : Array.isArray(tree) ? tree.map(text).join('') : text(tree.props?.children);
const button = (tree, value) => { const found = nodes(tree, node => node.type === 'button' && text(node) === value)[0]; assert.ok(found, `Missing button ${value}`); return found; };
function harness(file, options = {}) {
    const state = [], effects = [], calls = [];
    let cursor = 0, mounted = false, failures = options.failures || 0;
    let latestBoard = options.board || board();
    const exports = load(file, name => {
        if (name === 'react/jsx-runtime') return require(name);
        if (name === 'react') return {
            ...React,
            useState: initial => { const key = cursor++; if (!(key in state)) state[key] = typeof initial === 'function' ? initial() : initial; return [state[key], next => { state[key] = typeof next === 'function' ? next(state[key]) : next; }]; },
            useRef: initial => { const key = cursor++; if (!(key in state)) state[key] = { current: initial }; return state[key]; },
            useCallback: callback => callback,
            useEffect: effect => { if (!mounted) effects.push(effect); },
        };
        if (name.endsWith('/walkInQueue')) return { ...helper, publicQueueRequest: async (slug, resource, body) => {
            calls.push([resource, slug, plain(body || {})]);
            if (resource === 'config') return options.config || config();
            if (resource === 'display') return latestBoard;
            if (failures-- > 0) throw new Error('Connection interrupted');
            return { ticket: ticket() };
        } };
        if (name.endsWith('/useVisiblePolling')) return { __esModule: true, default: refresh => { if (!mounted) effects.push(refresh); } };
        if (name.endsWith('/useApplicationContext')) return { useApplicationSettings: () => ({ applicationsettings: { user: { role: options.role || 'admin' } } }) };
        if (name.endsWith('/queueHandoff')) return handoffHelper;
        if (name.endsWith('/encryption')) return { plsEncryption: id => `encrypted-${id}` };
        if (name.endsWith('/customFetch')) return {
            customFetch: async endpoint => { calls.push(['GET', endpoint]); return { status: 'success', data: endpoint === 'queue/settings' ? (options.settings || config()) : latestBoard }; },
            customFetchMutation: async (endpoint, method, body) => {
                calls.push([method, endpoint, plain(body)]);
                if (options.rejectUpdate) return { status: 'error', message: 'Finish all linked tests first.' };
                if (endpoint === 'queue/settings') return { status: 'success', data: { ...config(), settings: { ...body, version: 3 } } };
                latestBoard = { ...latestBoard, tickets: [ticket({ ...body, version: 4 })] };
                return { status: 'success', data: { ticket: latestBoard.tickets[0] } };
            },
        };
        if (name === 'next/link') return { __esModule: true, default: 'a' };
        return { __esModule: true, default: () => null };
    });
    const component = exports[options.exportName || 'default'];
    return {
        calls,
        render: props => { cursor = 0; return component(props || { slug: 'prime-lab' }); },
        mount: async () => { mounted = true; for (const effect of effects.splice(0)) await effect(); await new Promise(resolve => setImmediate(resolve)); },
    };
}

test('public check-in validates contact details and retains an explicit retry key', () => {
    assert.deepEqual(plain(helper.checkInBody('  Jane   Doe  ', '+233 241 234 567', 'key-123456789')), { name: 'Jane Doe', phone: '+233 241 234 567', idempotencyKey: 'key-123456789' });
    for (const [name, phone, key] of [[' ', '0241234567', 'key-123456789'], ['Jane', 'abc', 'key-123456789'], ['Jane', '0241234567', 'bad']]) assert.throws(() => helper.checkInBody(name, phone, key));
});
test('HTTP LAN kiosks can create valid retry keys without crypto.randomUUID', () => {
    const key = helper.createQueueRetryKey({ getRandomValues: bytes => bytes.fill(7) });
    assert.match(key, /^queue-[a-f0-9]{32}$/);
    assert.doesNotThrow(() => helper.checkInBody('Jane', '0241234567', key));
    assert.match(helper.createQueueRetryKey(null), /^[A-Za-z0-9_-]{10,100}$/);
});
test('public requests use the facility slug without staff credentials or tenant selectors', async () => {
    let request;
    const publicApi = load('lib/walkInQueue.ts', apiMock, { fetch: async (url, options) => { request = { url, options }; return { ok: true, json: async () => ({ status: 'success', data: { received: true } }) }; } });
    assert.deepEqual(plain(await publicApi.publicQueueRequest('prime lab', 'tickets', { name: 'Jane' })), { received: true });
    assert.equal(request.url, 'https://example.test/api/v1/public/queue/prime%20lab/tickets');
    assert.equal(request.options.credentials, 'omit');
    assert.equal(request.options.cache, 'no-store');
    assert.deepEqual(Object.keys(request.options.headers), ['Content-Type']);
});
test('non-JSON or unsuccessful public responses cannot produce a successful check-in', async () => {
    const bad = load('lib/walkInQueue.ts', apiMock, { fetch: async () => ({ ok: false, json: async () => ({ status: 'error', message: 'Check-in is closed' }) }) });
    await assert.rejects(() => bad.publicQueueRequest('prime', 'tickets', {}), /closed/);
    assert.throws(() => helper.queueData({ status: 'error', message: 'Denied' }), /Denied/);
});
test('queue transitions preserve the expected version and prevent edits using invalid identifiers', () => {
    assert.deepEqual(plain(helper.queueUpdate(ticket(), { status: 'called', counter: ' Desk 1 ', patientid: '10', billingid: '20' })), { expectedVersion: 3, status: 'called', counter: 'Desk 1', patientid: 10, billingid: 20 });
    assert.throws(() => helper.queueUpdate(ticket(), { status: 'completed' }), /no longer/);
    assert.throws(() => helper.queueUpdate(ticket(), { patientid: '1e2' }), /valid patient/);
    assert.throws(() => helper.queueUpdate(ticket({ version: undefined }), { status: 'called' }), /Refresh/);
    assert.deepEqual(plain(helper.nextQueueStatuses('completed')), []);
});
test('test counters distinguish completed results from validated results', () => {
    assert.deepEqual(plain(helper.queueProgress(ticket())), { total: 5, completed: 3, validated: 2, pending: 2, percent: 60 });
    assert.deepEqual(plain(helper.queueProgress({ testsTotal: 2, testsCompleted: 50, testsValidated: -1 })), { total: 2, completed: 2, validated: 0, pending: 0, percent: 100 });
});
test('actual check-in submit retries reuse one key and shows a confirmed ticket only after success', async () => {
    const h = harness('components/queue/PublicQueueCheckIn.tsx', { failures: 1 });
    h.render(); await h.mount();
    let tree = h.render();
    nodes(tree, node => node.props?.id === 'queue-visitor-name')[0].props.onChange({ target: { value: 'Jane Doe' } });
    nodes(tree, node => node.props?.id === 'queue-visitor-phone')[0].props.onChange({ target: { value: '0241234567' } });
    tree = h.render(); await nodes(tree, node => node.type === 'form')[0].props.onSubmit({ preventDefault() {} });
    assert.match(text(h.render()), /Connection interrupted/);
    await nodes(h.render(), node => node.type === 'form')[0].props.onSubmit({ preventDefault() {} });
    tree = h.render();
    assert.match(text(tree), /Q-008/);
    assert.equal(nodes(tree, node => node.type === 'form').length, 0);
    const submits = h.calls.filter(call => call[0] === 'tickets');
    assert.equal(submits.length, 2); assert.equal(submits[0][2].idempotencyKey, submits[1][2].idempotencyKey);
    button(tree, 'Check in another person').props.onClick();
    assert.equal(nodes(h.render(), node => node.props?.id === 'queue-visitor-name')[0].props.value, '');
});
test('closed public queues do not show a check-in form', async () => {
    const value = config(); value.settings.publicEnabled = false;
    const h = harness('components/queue/PublicQueueCheckIn.tsx', { config: value });
    h.render(); await h.mount(); const tree = h.render();
    assert.match(text(tree), /closed/); assert.equal(nodes(tree, node => node.type === 'form').length, 0);
});
test('a rapid double submit creates one check-in request', async () => {
    const h = harness('components/queue/PublicQueueCheckIn.tsx'); h.render(); await h.mount();
    let tree = h.render();
    nodes(tree, node => node.props?.id === 'queue-visitor-name')[0].props.onChange({ target: { value: 'Jane Doe' } });
    nodes(tree, node => node.props?.id === 'queue-visitor-phone')[0].props.onChange({ target: { value: '0241234567' } });
    tree = h.render(); const submit = nodes(tree, node => node.type === 'form')[0].props.onSubmit;
    await Promise.all([submit({ preventDefault() {} }), submit({ preventDefault() {} })]);
    assert.equal(h.calls.filter(call => call[0] === 'tickets').length, 1);
});
test('public TV renders ticket and progress while excluding patient names and phone numbers', async () => {
    const h = harness('components/queue/QueueDisplay.tsx'); h.render(); await h.mount();
    const tree = h.render();
    assert.match(text(tree), /Q-008/); assert.match(text(tree), /Tests complete: 3 \/ 5/);
    assert.doesNotMatch(text(tree), /Private Name|0241234567|patientid|billingid/);
});
test('public TV puts called and active clients ahead of a compact recent-finished list', async () => {
    const value = board(); value.tickets = [ticket({ ticketNumber: 'OLD-001', status: 'completed' }), ticket({ ticketNumber: 'WAIT-002' }), ticket({ ticketNumber: 'CALL-003', status: 'called' })];
    const h = harness('components/queue/QueueDisplay.tsx', { board: value }); h.render(); await h.mount();
    const output = text(h.render());
    assert.ok(output.indexOf('CALL-003') < output.indexOf('WAIT-002'));
    assert.ok(output.indexOf('WAIT-002') < output.indexOf('Recently finished'));
    assert.ok(output.indexOf('Recently finished') < output.indexOf('OLD-001'));
});
test('staff worklist performs versioned call actions through its actual mutation handler', async () => {
    const h = harness('components/queue/WalkInQueueWorkspace.tsx'); h.render(); await h.mount();
    const card = nodes(h.render(), node => typeof node.type === 'function' && node.props?.ticket?.id === 8)[0];
    await card.props.onUpdate({ status: 'called', counter: 'Reception' });
    assert.deepEqual(h.calls.find(call => call[0] === 'PATCH'), ['PATCH', 'queue/tickets/8', { expectedVersion: 3, status: 'called', counter: 'Reception' }]);
    assert.match(text(h.render()), /Ticket Q-008 updated/);
});
test('failed status updates remain visible after the queue refreshes', async () => {
    const h = harness('components/queue/WalkInQueueWorkspace.tsx', { rejectUpdate: true }); h.render(); await h.mount();
    const card = nodes(h.render(), node => typeof node.type === 'function' && node.props?.ticket?.id === 8)[0];
    await card.props.onUpdate({ status: 'called' }); await new Promise(resolve => setImmediate(resolve));
    assert.match(text(h.render()), /Finish all linked tests first/);
    assert.doesNotMatch(text(h.render()), /updated\./);
});
test('queue settings save includes the loaded version and is hidden from reception users', async () => {
    const h = harness('components/queue/WalkInQueueWorkspace.tsx'); h.render(); await h.mount();
    button(h.render(), 'Queue settings').props.onClick();
    await nodes(h.render(), node => node.type === 'form')[0].props.onSubmit({ preventDefault() {} });
    assert.deepEqual(h.calls.find(call => call[0] === 'PUT'), ['PUT', 'queue/settings', { publicEnabled: true, displayEnabled: true, ticketPrefix: 'Q', expectedVersion: 2 }]);
    const reception = harness('components/queue/WalkInQueueWorkspace.tsx', { role: 'receptionist' }); reception.render(); await reception.mount();
    assert.equal(nodes(reception.render(), node => node.type === 'button' && text(node) === 'Queue settings').length, 0);
});
test('individual client cards expose real progress and link patient/bill input to the save handler', async () => {
    const h = harness('components/queue/WalkInQueueWorkspace.tsx', { exportName: 'TicketCard' });
    const updates = []; const props = { ticket: ticket(), disabled: false, busy: false, onUpdate: async values => updates.push(values) };
    let tree = h.render(props);
    assert.match(text(tree), /Completed 3 · Pending 2/); assert.match(text(tree), /Validated 2/);
    button(tree, 'Link patient / bill & desk').props.onClick(); tree = h.render(props);
    nodes(tree, node => node.props?.id === 'queue-bill-8')[0].props.onChange({ target: { value: '42' } });
    tree = h.render(props); await nodes(tree, node => node.type === 'form')[0].props.onSubmit({ preventDefault() {} });
    assert.deepEqual(plain(updates), [{ counter: '', patientid: '10', billingid: '42', note: '' }]);
});
test('client card destinations use linked patient and bill records and carry only queue identity', () => {
    for (const [value, expectedRegistration, expectedBilling] of [
        [ticket({ patientid: null, billingid: null }), '/crm/registration', '/billing/patientid'],
        [ticket({ patientid: 10, billingid: null }), '/crm/registration/10/personal-information', '/billing/patientid/encrypted-10/multi'],
        [ticket(), '/crm/registration/10/personal-information', '/billing/transactions/previous-transaction/20'],
    ]) {
        const h = harness('components/queue/WalkInQueueWorkspace.tsx', { exportName: 'TicketCard' });
        const tree = h.render({ ticket: value, disabled: false, busy: false, onUpdate: async () => {} });
        const links = nodes(tree, node => node.type === 'a');
        assert.equal(links[0].props.href, `${expectedRegistration}?queueTicket=8`);
        assert.equal(links[1].props.href, `${expectedBilling}?queueTicket=8`);
        assert.doesNotMatch(links.map(link => link.props.href).join(' '), /Private|0241234567/);
    }
});
test('public routes pass only their slug to check-in and display components', async () => {
    const stub = () => null;
    const checkin = load('app/queue/[slug]/page.tsx', name => name === 'react/jsx-runtime' ? require(name) : { __esModule: true, default: stub }).default;
    const display = load('app/queue/[slug]/display/page.tsx', name => name === 'react/jsx-runtime' ? require(name) : { __esModule: true, default: stub }).default;
    assert.equal((await checkin({ params: Promise.resolve({ slug: 'prime' }) })).props.slug, 'prime');
    assert.equal((await display({ params: Promise.resolve({ slug: 'prime' }) })).props.slug, 'prime');
});
test('finished client cards do not offer registration, linking or queue mutations', () => {
    const h = harness('components/queue/WalkInQueueWorkspace.tsx', { exportName: 'TicketCard' });
    const tree = h.render({ ticket: ticket({ status: 'completed' }), disabled: false, busy: false, onUpdate: async () => assert.fail('Closed ticket mutation') });
    assert.equal(nodes(tree, node => node.type === 'button' || node.type === 'a').length, 0);
    assert.match(text(tree), /Completed 3/);
});
test('polling pauses for hidden screens, resumes when visible and cleans up timers', async () => {
    const effects = [], listeners = new Map(); let timer, cleared, refreshes = 0;
    const document = { visibilityState: 'hidden', addEventListener: (name, listener) => listeners.set(name, listener), removeEventListener: name => listeners.delete(name) };
    const hook = load('components/queue/useVisiblePolling.ts', name => name === 'react' ? { useRef: current => ({ current }), useEffect: effect => effects.push(effect) } : require(name), {
        document, window: { setInterval: callback => { timer = callback; return 7; }, clearInterval: id => { cleared = id; } },
    }).default;
    hook(async () => { refreshes++; }); const cleanup = effects[0]();
    assert.equal(refreshes, 0);
    document.visibilityState = 'visible'; await listeners.get('visibilitychange')();
    assert.equal(refreshes, 1); timer(); await new Promise(resolve => setImmediate(resolve)); assert.equal(refreshes, 2);
    document.visibilityState = 'hidden'; timer(); assert.equal(refreshes, 2);
    cleanup(); assert.equal(cleared, 7); assert.equal(listeners.size, 0);
});
