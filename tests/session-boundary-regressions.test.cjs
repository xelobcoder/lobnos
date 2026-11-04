const test = require('node:test'), assert = require('node:assert/strict'), fs = require('node:fs'), path = require('node:path'), vm = require('node:vm'), ts = require('typescript');
const root = path.join(__dirname, '..');
function fixture({ scheme = 'https', context = true, upstreamStatus = 200, env = {} } = {}) { const calls = [], deleted = [], jar = new Map(context ? [['PLS-SESSION', 'signed-page'], ['pls-prime-tenant-session', 'private-backend'], ['loginsessionId', '12']] : []), modules = new Map(); const settings = { NODE_ENV: 'production', PRODUCTION_BASEURL: 'https://backend.example.test/api/v1/', JWT_SECRET_KEY: 'fixture', ...env }; function load(file) { if (modules.has(file))
    return modules.get(file); const exports = {}; modules.set(file, exports); const source = fs.readFileSync(path.join(root, file), 'utf8'); vm.runInNewContext(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText, { exports, URL, Headers, Response, AbortSignal, TextEncoder, Error, Number, process: { env: settings }, fetch: async (url, options) => { calls.push({ url: new URL(url), options }); return new Response(JSON.stringify({ status: upstreamStatus === 200 ? 'success' : false, value: 123 }), { status: upstreamStatus, headers: { 'Content-Type': 'application/json' } }); }, require: name => { if (name === 'server-only')
        return {}; if (name === 'next/headers')
        return { cookies: async () => ({ get: key => jar.has(key) ? { value: jar.get(key) } : undefined, delete: key => deleted.push(key) }) }; if (name === 'jose')
        return { jwtVerify: async (token) => { if (token !== 'signed-page')
                throw Error('Invalid'); return { payload: { tenantId: 7 } }; } }; if (name === 'next/server')
        return { NextResponse: { json: (body, options = {}) => ({ body, status: options.status || 200 }) } }; if (name.startsWith('.'))
        return load(path.posix.normalize(path.posix.join(path.posix.dirname(file), name)) + '.ts'); throw Error(name); } }); return exports; } return { load, calls, deleted, jar, settings, request: { url: `${scheme}://app.example.test/api/auth/logout`, headers: new Headers({ origin: `${scheme}://app.example.test` }) } }; }
test('callable request context exposes only tenant and authentication state', async () => { const f = fixture(); const result = await f.load('components/serverActions/requestHeaders.tsx').getRequestContext(); assert.equal(result.tenantId, 7); assert.equal(result.authenticated, true); assert.deepEqual(Object.keys(result).sort(), ['authenticated', 'tenantId']); assert(!JSON.stringify(result).includes('private-backend')); });
test('backend requests replace forged identity and tenant scope with verified server cookies', async () => { const f = fixture(); await f.load('lib/serverBackendRequest.ts').serverBackendRequest('patients?tenantId=99', { headers: { 'pls-session': 'forged', 'pls-prime-tenant-session': 'forged', 'Cookie': 'other=secret', Authorization: 'Bearer forged' } }); const { url, options } = f.calls[0]; assert.equal(url.searchParams.get('tenantId'), '7'); assert.equal(options.headers.get('pls-session'), 'signed-page'); assert.equal(options.headers.get('pls-prime-tenant-session'), 'private-backend'); assert.equal(options.headers.has('cookie'), false); assert.equal(options.headers.has('Authorization'), false); assert.equal(options.redirect, 'manual'); });
test('invalid or absent page credentials never forward raw backend cookies', async () => { const f = fixture(); f.jar.set('PLS-SESSION', 'invalid'); await f.load('lib/serverBackendRequest.ts').serverBackendRequest('patients', { headers: { 'pls-prime-tenant-session': 'forged' } }); assert.equal(f.calls[0].options.headers.has('pls-prime-tenant-session'), false); });
for (const endpoint of ['../private', '%2e%2e/private', '%252e%252e/private', 'https://evil.example.test/x', 'safe/%2f../private', 'safe\\private'])
    test('backend target rejects ' + endpoint, () => { const f = fixture(); assert.throws(() => f.load('lib/serverBackendRequest.ts').backendTarget(endpoint, 'https://backend.example.test/api/v1/')); });
test('public sign-in and marketplace retain their tenancy semantics', async () => { const f = fixture(); const { serverBackendRequest } = f.load('lib/serverBackendRequest.ts'); await serverBackendRequest('prime/login', { method: 'POST', body: '{}' }, true, 42); assert.equal(f.calls[0].url.searchParams.get('tenantId'), '42'); assert.equal(f.calls[0].options.headers.has('pls-session'), false); await serverBackendRequest('marketplace/platform/facilities'); assert.equal(f.calls[1].url.searchParams.has('tenantId'), false); });
test('logout revokes the backend session before clearing browser cookies and failure remains retryable', async () => { const f = fixture(); const result = await f.load('app/api/auth/logout/route.ts').POST(f.request); assert.equal(result.status, 200); assert.equal(f.calls[0].url.pathname, '/api/v1/logins/logout'); assert.equal(f.calls[0].url.searchParams.get('tenantId'), '7'); assert.equal(f.deleted.length, 3); const failed = fixture({ upstreamStatus: 503 }); assert.equal((await failed.load('app/api/auth/logout/route.ts').POST(failed.request)).status, 502); assert.equal(failed.deleted.length, 0); });
test('logout rejects cross-origin requests before revoking a session', async () => { const f = fixture(); f.request.headers.set('origin', 'https://evil.example.test'); assert.equal((await f.load('app/api/auth/logout/route.ts').POST(f.request)).status, 403); assert.equal(f.calls.length, 0); });
for (const [url, env, expected] of [['https://app.example.test', {}, true], ['http://app.example.test', {}, true], ['http://127.0.0.1:2377', {}, false], ['http://facility.local', { PLS_FACILITY_ALLOW_HTTP: 'true' }, false]])
    test('session cookie transport ' + url, () => { const f = fixture({ env }); assert.equal(f.load('lib/sessionCookies.ts').secureSessionCookies({ url, headers: new Headers() }), expected); });
for (const endpoint of ['prime/refresh-role-session', 'PRIME/switch-role/', 'p%72ime/refresh-role-session', 'prime%2fswitch-role'])
    test('generic bridge blocks credential minting ' + endpoint, async () => { const f = fixture(); await assert.rejects(() => f.load('lib/serverBackendRequest.ts').serverBackendRequest(endpoint, { method: 'POST' }), /dedicated/); assert.equal(f.calls.length, 0); });
test('logout attempts backend revocation when the page token has expired', async () => { const f = fixture(); f.jar.set('PLS-SESSION', 'expired'); const result = await f.load('app/api/auth/logout/route.ts').POST(f.request); assert.equal(result.status, 200); assert.equal(f.calls[0].options.headers['pls-prime-tenant-session'], 'private-backend'); assert.equal(f.deleted.length, 3); });
test('root backend configuration still blocks credential minting', async () => {
    const f = fixture({ env: { PRODUCTION_BASEURL: 'https://backend.example.test/' } });
    await assert.rejects(() => f.load('lib/serverBackendRequest.ts').serverBackendRequest('prime/switch-role', { method: 'POST' }), /dedicated/);
    assert.equal(f.calls.length, 0);
});


test('encryption-required backend transport rejects remote HTTP before forwarding credentials', async () => {
    const f = fixture({ env: { PLS_ENCRYPTION_REQUIRED: 'true', PRODUCTION_BASEURL: 'http://backend.example.test/api/v1/' } });
    await assert.rejects(() => f.load('lib/serverBackendRequest.ts').serverBackendRequest('patients'), /requires HTTPS/);
    assert.equal(f.calls.length, 0);
});

test('HTTPS backend transport preserves authenticated tenant scoping', async () => {
    const f = fixture({ env: { HTTPS_REQUIRED: 'true' } });
    await f.load('lib/serverBackendRequest.ts').serverBackendRequest('patients?tenantId=99');
    assert.equal(f.calls[0].url.protocol, 'https:');
    assert.equal(f.calls[0].url.searchParams.get('tenantId'), '7');
    assert.equal(f.calls[0].options.headers.get('pls-prime-tenant-session'), 'private-backend');
});

test('local HTTP backend requires an explicit loopback exception under encryption enforcement', () => {
    const f = fixture({ env: { HTTPS_REQUIRED: 'true' } });
    const target = f.load('lib/serverBackendRequest.ts').backendTarget;
    assert.throws(() => target('patients', 'http://127.0.0.1:5000/api/v1/'), /requires HTTPS/);
    f.settings.HTTPS_ALLOW_LOOPBACK_HTTP = 'true';
    assert.equal(target('patients', 'http://127.0.0.1:5000/api/v1/').hostname, '127.0.0.1');
    assert.throws(() => target('patients', 'http://backend.example.test/api/v1/'), /requires HTTPS/);
});
