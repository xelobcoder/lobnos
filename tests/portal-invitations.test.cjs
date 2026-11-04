const assert = require('node:assert/strict');
const test = require('node:test');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const root = path.join(__dirname, '..');
function load(file, mocks = {}) {
    const exports = {};
    vm.runInNewContext(ts.transpileModule(readFileSync(path.join(root, file), 'utf8'), {
        compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
    }).outputText, { exports, require: name => mocks[name] || require(name), URLSearchParams, AbortSignal, Date, Number, Error, JSON, fetch: () => { throw Error('Unexpected network'); } });
    return exports;
}
const invitations = load("lib/portalInvitations.ts");
const portal = load("lib/patientPortal.ts");
const { establishPatientSession } = load("lib/patientPortalSession.ts");

test('patient login verifies same-origin cookies and normalizes backend context before navigation', async () => {
    const calls = [];
    const context = await establishPatientSession({ status: true, token: 'synthetic-token', tenantId: 42, loginsessionId: 17 }, async (url, options) => {
        calls.push([url, options]);
        return { ok: true, json: async () => url === '/api/auth/login' ? { status: true, role: 'patient' } : { user: { user: { role: 'patient', patientid: 7 } }, tenantId: 42 } };
    });
    assert.equal(context.user.patientid, 7);
    assert.equal(calls[0][0], '/api/auth/login');
    assert.equal(calls[0][1].credentials, 'include');
    assert.equal(JSON.parse(calls[0][1].body).accessToken, 'synthetic-token');
    assert.equal(calls[1][0], '/api/auth/context-retrieval');
    assert.equal(calls[1][1].cache, 'no-store');
});

test('patient login rejects backend auth errors, missing tenant, wrong roles and lost cookies', async () => {
    await assert.rejects(establishPatientSession({ status: 'error', message: 'Token not provided' }), /Token not provided/);
    await assert.rejects(establishPatientSession({ status: true, token: 'x' }), /valid patient session/);
    await assert.rejects(establishPatientSession({ status: true, token: 'x', tenantId: 42 }, async () => ({ ok: true, json: async () => ({ status: true, role: 'admin' }) })), /patient account/);
    for (const context of [{ user: { role: 'patient' }, tenantId: 43 }, { error: 'Session not found' }]) {
        let call = 0;
        await assert.rejects(establishPatientSession({ status: true, token: 'x', tenantId: 42 }, async () => ({ ok: true, json: async () => ++call === 1 ? { status: true, role: 'patient' } : context })), /retain the patient session/);
    }
});

test('invitation queries encode search safely, preserve page size and reject unknown totals', () => {
    const query = new URLSearchParams(invitations.invitationEndpoint('pending', ' Ama & Kojo ', 2, 50).split('?')[1]);
    assert.equal(query.get('search'), 'Ama & Kojo');
    assert.equal(query.get('status'), 'pending');
    assert.equal(query.get('page'), '2');
    assert.equal(query.get('pageSize'), '50');
    for (const status of ['pending', 'expired']) assert.equal(invitations.canReplaceInvitation(status), true);
    for (const status of ['accepted', 'revoked']) assert.equal(invitations.canReplaceInvitation(status), false);
    assert.throws(() => invitations.validateInvitationPage({ invitations: [], total: 'unknown', page: 1, pageSize: 20 }), /invalid/);
    assert.equal(invitations.invitationDeliveryNotice({ emailed: false, deliveryError: 'Provider unavailable' }).variant, 'warning');
    assert.equal(invitations.invitationDeliveryNotice({ emailed: true }).variant, 'success');
});

function adminHarness({ failure = false, smsAvailable = true, delivery } = {}) {
    const states = [], dependencies = [], effects = [], calls = [], mutations = [];
    let cursor = 0, tree;
    const row = { id: 9, patientid: 7, patientName: 'Ama Example', patientNumber: 'PLS42P007', email: 'a**@example.test', status: 'pending', created_at: '2026-10-17', expires_at: '2026-10-20', accepted_at: null, revoked_at: null };
    row.channels = { email: { available: true, reason: null }, sms: { available: smsAvailable, reason: smsAvailable ? null : 'SMS is not activated' } };
    const react = {
        useRef(initial) {
            const index = cursor++;
            if (!(index in states)) states[index] = { current: initial };
            return states[index];
        },
        useState(initial) {
            const index = cursor++;
            if (!(index in states)) states[index] = initial;
            return [states[index], value => { states[index] = typeof value === 'function' ? value(states[index]) : value; }];
        },
        useEffect(effect, deps) {
            const index = cursor++;
            if (!dependencies[index] || deps.some((value, i) => value !== dependencies[index][i])) { dependencies[index] = deps; effects.push(effect); }
        },
    };
    const form = Object.assign(() => null, { Label: 'Label', Control: 'Control', Select: 'Select' });
    const modal = Object.assign(() => null, { Header: 'ModalHeader', Title: 'ModalTitle', Body: 'ModalBody', Footer: 'ModalFooter' });
    const component = load("app/patient-portal-admin/page.tsx", {
        react,
        'next/link': { __esModule: true, default: 'Link' },
        'react-bootstrap': { Alert: 'Alert', Button: 'Button', Form: form, Modal: modal, Spinner: 'Spinner', Table: 'Table' },
        '../../components/Auth/customFetch': {
            customFetch: async endpoint => { calls.push(endpoint); if (failure) throw Error('List unavailable'); return { status: 'success', data: { invitations: [row], total: 45, page: Number(new URLSearchParams(endpoint.split('?')[1]).get('page')), pageSize: 20 } }; },
            customFetchMutation: async (endpoint, method, body) => { mutations.push([endpoint, method, body]); return { status: 'success', data: { link: 'https://portal.test/invite?token=synthetic', emailed: false, deliveryError: 'Mail offline', delivery } }; },
        },
        '../../lib/patientPortal': portal,
        '../../lib/portalInvitations': invitations,
        '../../components/PatientPortal/PortalShell.module.css': new Proxy({}, { get: (_target, key) => String(key) }),
    }).default;
    function render() { cursor = 0; tree = component(); for (const effect of effects.splice(0)) effect(); return tree; }
    function nodes() {
        const result = [];
        function walk(node) { if (!node || typeof node !== 'object') return; result.push(node); for (const child of [node.props?.children].flat(Infinity)) walk(child); }
        walk(tree);
        return result;
    }
    const find = predicate => nodes().find(predicate);
    const button = label => find(node => node.type === 'Button' && [node.props.children].flat().filter(child => typeof child === 'string').join('') === label);
    async function flush() { await new Promise(resolve => setImmediate(resolve)); render(); }
    return { render, flush, find, button, calls, mutations };
}

test('admin list filters and backend pagination keep page size stable', async () => {
    const ui = adminHarness();
    ui.render(); await ui.flush();
    assert.match(ui.calls[0], /status=pending/);
    ui.button('Next').props.onClick(); ui.render(); await ui.flush();
    assert.match(ui.calls.at(-1), /page=2&pageSize=20/);
    ui.find(node => node.props?.id === 'invitation-status').props.onChange({ target: { value: 'expired' } });
    ui.render(); await ui.flush();
    assert.match(ui.calls.at(-1), /status=expired/);
    assert.match(ui.calls.at(-1), /page=1&pageSize=20/);
});

test('admin invitation loading spinner uses inline markup inside its status paragraph', () => {
    const ui = adminHarness();
    ui.render();
    const spinner = ui.find(node => node.type === 'Spinner');
    assert.equal(spinner.props.as, 'span');
    assert.equal(spinner.props['aria-hidden'], 'true');
});

test('admin revoke and replacement require confirmation; failed email displays warning and a copyable link', async () => {
    const ui = adminHarness();
    ui.render(); await ui.flush();
    ui.button('Revoke').props.onClick(); ui.render();
    assert.equal(ui.mutations.length, 0);
    await ui.button('Revoke invitation').props.onClick(); ui.render(); await ui.flush();
    assert.deepEqual(ui.mutations[0], ['patient-portal/admin/invitations/9/revoke', 'POST', undefined]);
    ui.button('Resend email').props.onClick(); ui.render();
    assert.equal(ui.mutations.length, 1);
    await ui.button('Create replacement').props.onClick(); ui.render(); await ui.flush();
    assert.equal(JSON.stringify(ui.mutations[1]), JSON.stringify(['patient-portal/admin/invitations/9/resend', 'POST', { channel: 'email' }]));
    const warning = ui.find(node => node.type === 'Alert' && node.props.variant === 'warning');
    assert.match(warning.props.children, /not emailed/);
    assert.equal(ui.find(node => node.props?.id === 'replacement-link').props.readOnly, true);
});

test('admin SMS is conditional and confirmed sends suppress repeated clicks with truthful acceptance', async () => {
    const disabled = adminHarness({ smsAvailable: false });
    disabled.render(); await disabled.flush();
    assert.equal(disabled.button('Resend SMS').props.disabled, true);
    assert.equal(disabled.button('Resend SMS').props.title, 'SMS is not activated');
    const ui = adminHarness({ delivery: { channel: 'sms', status: 'accepted' } });
    ui.render(); await ui.flush();
    ui.button('Resend SMS').props.onClick(); ui.render();
    assert.equal(ui.mutations.length, 0);
    const confirm = ui.button('Create replacement');
    const first = confirm.props.onClick();
    const second = confirm.props.onClick();
    await Promise.all([first, second]); ui.render();
    assert.equal(ui.mutations.length, 1);
    assert.equal(ui.mutations[0][2].channel, 'sms');
    assert.match(ui.find(node => node.type === 'Alert' && node.props.variant === 'success').props.children, /SMS accepted by the provider; delivery is not confirmed/);
});

test('delivery feedback distinguishes queued, failed and link-only outcomes without claiming delivery', () => {
    for (const channel of ['email', 'sms']) {
        const queued = invitations.invitationDeliveryNotice({ delivery: { channel, status: 'queued' } }, false);
        assert.match(queued.text, /queued for processing; delivery is not confirmed/);
        const failed = invitations.invitationDeliveryNotice({ delivery: { channel, status: 'failed', reason: 'Provider unavailable' } });
        assert.equal(failed.variant, 'warning');
        assert.match(failed.text, /previous link no longer works/);
        assert.match(failed.text, /Provider unavailable/);
    }
    assert.match(invitations.invitationDeliveryNotice({ delivery: { channel: 'link', status: 'not_requested' } }, false).text, /No message sent/);
    assert.match(invitations.channelReason(undefined, 'sms'), /could not be verified/);
});

function accessHarness({ channel = 'email', available = true, outcome = 'accepted' } = {}) {
    const states = [], mutations = [];
    let cursor = 0, tree, reloads = 0;
    const react = {
        useState(initial) { const index = cursor++; if (!(index in states)) states[index] = initial; return [states[index], value => { states[index] = value; }]; },
        useRef(initial) { const index = cursor++; if (!(index in states)) states[index] = { current: initial }; return states[index]; },
    };
    const summary = {
        patientid: 7, loginUsername: 'PLS42-P7', hasEmail: true, email: 'a**@example.test', account: null,
        invitations: [], portalEnabled: true, invitationsEnabled: true,
        channels: { email: { available: true, reason: null }, sms: { available, reason: available ? null : 'SMS is not activated' } },
    };
    const form = Object.assign(() => null, { Label: 'Label', Control: 'Control', Check: 'Check' });
    const modal = Object.assign(() => null, { Header: 'ModalHeader', Title: 'ModalTitle', Body: 'ModalBody', Footer: 'ModalFooter' });
    const component = load("components/PatientPortal/PatientPortalAccessPanel.tsx", {
        react,
        'react-bootstrap': { Alert: 'Alert', Button: 'Button', Form: form, Modal: modal, Spinner: 'Spinner', Table: 'Table' },
        '@remixicon/react': { RiFileCopyLine: 'Copy', RiMailSendLine: 'Mail', RiUserHeartLine: 'Heart' },
        './portal.module.css': {},
        './usePortalResource': { usePortalResource: endpoint => ({ data: endpoint.endsWith('/access') ? summary : [], reload: () => { reloads++; } }) },
        '../Auth/useApplicationContext': { useApplicationSettings: () => ({ applicationsettings: { user: { role: 'admin' } } }) },
        '../Auth/roles': { roleAllowed: (role, allowed) => allowed.includes(role) },
        '../Auth/customFetch': { customFetchMutation: async (endpoint, method, body) => {
            mutations.push({ endpoint, method, body });
            return { status: 'success', data: { link: 'https://portal.test/invite?token=synthetic', delivery: { channel, status: outcome, reason: outcome === 'failed' ? 'Provider unavailable' : null } } };
        } },
        '../../lib/patientPortal': portal,
        '../../lib/portalInvitations': invitations,
    }).default;
    function render() { cursor = 0; tree = component({ patientid: 7 }); }
    function nodes() {
        const result = [];
        function walk(node) { if (!node || typeof node !== 'object') return; result.push(node); for (const child of [node.props?.children].flat(Infinity)) walk(child); }
        walk(tree); return result;
    }
    const button = label => nodes().find(node => node.type === 'Button' && [node.props.children].flat().filter(child => typeof child === 'string').join('') === label);
    return { render, button, nodes, mutations, reloads: () => reloads };
}

test('patient access explicitly confirms EMAIL/SMS, blocks unavailable SMS, and suppresses repeat sends', async () => {
    const disabled = accessHarness({ available: false });
    disabled.render();
    assert.equal(disabled.button('Send invitation SMS').props.disabled, true);
    assert.equal(disabled.button('Send invitation SMS').props.title, 'SMS is not activated');
    for (const channel of ['email', 'sms']) {
        const ui = accessHarness({ channel });
        ui.render();
        ui.button(`Send invitation ${channel === 'email' ? 'email' : 'SMS'}`).props.onClick(); ui.render();
        assert.equal(ui.mutations.length, 0);
        const confirm = ui.button('Confirm send');
        await Promise.all([confirm.props.onClick(), confirm.props.onClick()]); ui.render();
        assert.equal(ui.mutations.length, 1);
        assert.equal(ui.mutations[0].body.channel, channel);
        assert.equal(ui.mutations[0].endpoint, 'patient-portal/admin/patients/7/invitations');
        assert.equal(ui.reloads(), 1);
        const notice = ui.nodes().find(node => node.type === 'Alert' && node.props.variant === 'success');
        assert.match(notice.props.children, /accepted by the provider; delivery is not confirmed/);
    }
});

test('patient access keeps the copyable new link and warns when provider sending fails', async () => {
    const ui = accessHarness({ channel: 'sms', outcome: 'failed' });
    ui.render(); ui.button('Send invitation SMS').props.onClick(); ui.render();
    await ui.button('Confirm send').props.onClick(); ui.render();
    assert.match(ui.nodes().find(node => node.type === 'Alert' && node.props.variant === 'warning').props.children, /Provider unavailable/);
    const input = ui.nodes().find(node => node.props?.['aria-label'] === 'Invitation link');
    assert.equal(input.props.readOnly, true);
    assert.match(input.props.value, /synthetic/);
});

test('admin retrieval failure renders retry rather than an empty list', async () => {
    const ui = adminHarness({ failure: true });
    ui.render(); await ui.flush();
    assert.ok(ui.button('Retry'));
    assert.equal(ui.find(node => node.type === 'Table'), undefined);
    assert.equal(ui.button('Next'), undefined);
});

test('middleware protects portal administration from every role except admin and manager', async () => {
    for (const role of ['admin', 'manager', 'patient', 'clinician', 'scientist', 'accountant', 'super-admin']) {
        const exports = {};
        const source = ts.transpileModule(readFileSync(path.join(root, 'proxy.ts'), 'utf8'), {
            compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
        }).outputText;
        vm.runInNewContext(source, {
            exports, URL, TextEncoder, process: { env: { JWT_SECRET_KEY: 'synthetic-key' } },
            require(name) {
                if (name === 'jose') return { jwtVerify: async () => ({ payload: { user: { role }, tenantId: 42, settings: {} } }) };
                if (name.endsWith('roleNavigationPolicy')) return load('lib/roleNavigationPolicy.ts', {'../components/Auth/roles': load('components/Auth/roles.ts')});
                if (name.endsWith('serverBackendAccess')) return {getBackendAuthorization() {}};
                return { NextResponse: { redirect: url => ({ destination: url.pathname, url: url.toString(), headers: new Headers() }), next: () => ({ headers: new Headers() }) } };
            },
        });
        for (const pathname of ['/patient-portal-admin', '/patient-portal-admin/access', '/patient-portal-admin/settings']) {
            const result = await exports.proxy({ nextUrl: { pathname }, url: `http://portal.test${pathname}`, cookies: { get: () => ({ value: 'synthetic-session' }) } });
            assert.equal(result.destination, ['admin', 'manager', 'super-admin'].includes(role) ? undefined : '/unauthorized', `${role} ${pathname}`);
        }
        const entry = await exports.proxy({ nextUrl: { pathname: '/patientportal' }, url: 'http://portal.test/patientportal', cookies: { get: () => ({ value: 'synthetic-session' }) } });
        assert.equal(entry.destination, ['admin', 'manager', 'super-admin'].includes(role) ? '/patient-portal-admin' : role === 'patient' ? undefined : '/unauthorized', `${role} patient portal entry`);
        const anonymous = await exports.proxy({ nextUrl: { pathname: '/patient-portal-admin/settings' }, url: 'http://portal.test/patient-portal-admin/settings', cookies: { get: () => undefined } });
        assert.equal(anonymous.destination, '/authentications/login');
        assert.equal(new URL(anonymous.url).searchParams.get('returnTo'), '/patient-portal-admin/settings');
    }
});
