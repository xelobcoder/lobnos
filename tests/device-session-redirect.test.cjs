const loadBackendTransport = require('./helpers/backend-transport.cjs');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');
const ts = require('typescript');

function compile(file, jsx = false) {
    return ts.transpileModule(fs.readFileSync(path.join(__dirname, '..', file), 'utf8'), {
        compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: jsx ? ts.JsxEmit.ReactJSX : undefined },
    }).outputText;
}

test('logout renders without mounting the session-required workspace layout', () => {
    for (const pathname of ['/authentication/logout', '/authentication/users']) {
        const exports = {};
        const child = { type: 'logout-content' };
        vm.runInNewContext(compile('app/authentication/layout.tsx', true), {
            exports,
            require(name) {
                if (name === 'react') return { Suspense: 'Suspense' };
                if (name === 'react/jsx-runtime') return require(name);
                if (name === 'next/navigation') return { usePathname: () => pathname };
                if (name.endsWith('useApplicationContext')) return { ApplicationProvider: 'ApplicationProvider' };
                if (name.endsWith('MainLayout')) return { default: 'ProtectedWorkspace' };
                if (name.endsWith('PrimeLayout')) return { default: 'PrimeLayout' };
                if (name.endsWith('ApplicationSettingsLinks')) return { ApplicationSettingsLinks: [] };
                if (name.endsWith('.css')) return {};
                throw Error(name);
            },
        });
        const rendered = exports.default({ children: child });
        if (pathname.endsWith('/logout')) assert.equal(rendered, child);
        else assert.notEqual(rendered, child, 'staff administration must retain its protected layout');
    }
});

function proxyFixture({ revoked = false, outage = false, missingBackend = false, env = {} } = {}) {
    const exports = {}, calls = [];
    const payload = { user: { role: 'admin', employeeid: 7 }, tenantId: 2, settings: {} };
    const result = type => ({ type, headers: new Headers(), cleared: [], cookies: { delete(name) { this.names.push(name); }, names: [] } });
    vm.runInNewContext(compile('proxy.ts'), {
        exports, URL, TextEncoder, Headers, AbortSignal, console,
        process: { env: { NODE_ENV: 'development', DEVELOPMENT_BASEURL: 'https://backend.test/api/v1/', JWT_SECRET_KEY: 'fixture', ...env } },
        require(name) {
            if (name === 'next/server') return { NextResponse: { next: () => result('next'), redirect: url => ({ ...result('redirect'), location: url.pathname }) } };
            if (name === 'jose') return { jwtVerify: async () => ({ payload }) };
            if (name.endsWith('serverBackendAccess')) return { assertBackendTransport: loadBackendTransport(env), getBackendAuthorization: () => undefined };
            if (name.endsWith('roleNavigationPolicy')) return { roleWorkspace: role => role, isMasterPlatformPath: () => false, canAccessRolePage: () => true };
            throw Error(name);
        },
        fetch: async (url, options) => {
            calls.push({ url: String(url), options });
            if (outage) throw Error('backend unavailable');
            return { ok: !revoked, status: revoked ? 401 : 200, json: async () => ({ status: !revoked, code: revoked ? 'SESSION_REPLACED' : undefined }) };
        },
    });
    const request = {
        url: 'https://app.test/authentications/login', nextUrl: { pathname: '/authentications/login' },
        cookies: { get: name => missingBackend && name === 'pls-prime-tenant-session' ? undefined : { value: name === 'PLS-SESSION' ? 'page-token' : 'backend-token' } },
    };
    return { run: () => exports.proxy(request), calls };
}

test('replaced device remains on login while the active device is redirected into its workspace', async () => {
    const oldDevice = proxyFixture({ revoked: true });
    const oldResult = await oldDevice.run();
    assert.equal(oldResult.type, 'next');
    assert.deepEqual(Array.from(oldResult.cookies.names), ['PLS-SESSION', 'pls-prime-tenant-session', 'loginsessionId']);
    assert.match(oldDevice.calls[0].url, /prime\/validate-token\?tenantId=2/);
    assert.equal(oldDevice.calls[0].options.headers['pls-prime-tenant-session'], 'backend-token');
    assert.equal(oldDevice.calls[0].options.cache, 'no-store');
    const activeDevice = proxyFixture();
    assert.equal((await activeDevice.run()).location, '/');
});

test('backend outage does not bounce login into a protected page or erase credentials', async () => {
    const response = await proxyFixture({ outage: true }).run();
    assert.equal(response.type, 'next');
    assert.equal(response.cookies.names.length, 0);
});

test('a frontend JWT without its backend credential cannot redirect away from login', async () => {
    const fixture = proxyFixture({ missingBackend: true });
    const response = await fixture.run();
    assert.equal(response.type, 'next');
    assert.ok(response.cookies.names.includes('PLS-SESSION'));
    assert.equal(fixture.calls.length, 0);
});

function logoutFixture(ok) {
    const exports = {}, redirects = [], calls = [];
    vm.runInNewContext(compile('components/Auth/customFetch.js'), {
        exports, console: { error() {}, warn() {}, log() {} },
        window: { location: { replace: value => redirects.push(value), pathname: '/authentication/logout' } },
        localStorage: { removeItem() {} },
        setTimeout: callback => callback(),
        require: name => name === 'react-toastify' ? { toast: { error() {} } } : {},
        fetch: async (url, options) => {
            calls.push({ url, options });
            return { ok, json: async () => ({ status: ok }) };
        },
    });
    return { logout: exports.handleLogout, redirects, calls };
}

test('failed cookie clearing does not redirect back into the login/workspace cycle and permits retry', async () => {
    const fixture = logoutFixture(false);
    await fixture.logout();
    await fixture.logout();
    assert.equal(fixture.redirects.length, 0);
    assert.equal(fixture.calls.length, 2);
});

test('successful logout redirects once and concurrent requests share the same sign-out', async () => {
    const fixture = logoutFixture(true);
    await Promise.all([fixture.logout(), fixture.logout(), fixture.logout()]);
    assert.deepEqual(fixture.redirects, ['/authentications/login']);
    assert.equal(fixture.calls.length, 1);
});

test('all remounted/concurrent logout callers receive failure and stop their loading state', async () => {
    const fixture = logoutFixture(false);
    const states = [[], []];
    const results = await Promise.all(states.map(state => fixture.logout(value => state.push(value))));
    assert.deepEqual(results, [false, false]);
    assert.deepEqual(states, [[false], [false]]);
    assert.equal(fixture.calls.length, 1);
});

test('HTTPS-required login validation never sends session credentials to a plaintext backend', async () => {
    const fixture = proxyFixture({ env: { HTTPS_REQUIRED: 'true', DEVELOPMENT_BASEURL: 'http://backend.test/api/v1/' } });
    const result = await fixture.run();
    assert.equal(result.type, 'next');
    assert.equal(fixture.calls.length, 0);
    assert.equal(result.cookies.names.length, 0);
});
