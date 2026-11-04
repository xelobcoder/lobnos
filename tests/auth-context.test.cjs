const loadBackendTransport = require('./helpers/backend-transport.cjs');
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const source = fs.readFileSync(path.join(__dirname, '../app/api/auth/context-retrieval/route.ts'), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
function handler(body, status = 200) {
    const exports = {};
    vm.runInNewContext(compiled, {
        exports, URL, Response, console: { error() {} }, process: { env: { DEVELOPMENT_BASEURL: 'http://backend/api/v1/', NODE_ENV: 'development' } },
        require(name) {
            if (name.endsWith('serverRequestContext')) return { getServerRequestContext: async () => ({ PLS_SESSION: 'synthetic', PLS_PRIME_TENANT_SESSION: 'synthetic-tenant', tenantId: 42 }) };
            if (name.endsWith('serverBackendAccess')) return { assertBackendTransport: loadBackendTransport(), getBackendAuthorization: () => '' };
            if (name === 'next/server') return { NextResponse: { json(body, options) {
                const response = Response.json(body, options);
                response.cookies = { set(name, value) { response.headers.append('Set-Cookie', `${name}=${value}; Path=/; Max-Age=0; HttpOnly`); } };
                return response;
            } } };
            return {};
        },
        fetch: async () => new Response(JSON.stringify(body), { status }),
    });
    return exports.GET(new Request('http://localhost/api/auth/context-retrieval'));
}
test('upstream session outages remain retryable without a login redirect', async () => {
    const response = await handler({ status: false, message: 'Unavailable' }, 503);
    assert.equal(response.status, 502);
    assert.equal((await response.json()).redirect, undefined);
});
test('missing account data is rejected as a retryable upstream failure', async () => {
    const response = await handler({ status: true });
    assert.equal(response.status, 502);
    assert.equal((await response.json()).redirect, undefined);
});
test('explicit session rejection redirects to login', async () => {
    const response = await handler({ status: false, message: 'Session expired' }, 401);
    assert.equal(response.status, 401);
    assert.equal((await response.json()).redirect, '/authentications/login');
});
test('a validated nested user retains its verified tenant and settings', async () => {
    const response = await handler({ status: true, user: { user: { role: 'admin', employeeid: 1 } }, settings: { workspaceLayout: 'ribbon' } });
    const data = await response.json();
    assert.equal(response.status, 200);
    assert.equal(data.tenantId, 42);
    assert.equal(data.user.user.role, 'admin');
});

test('the layout catches failed and incomplete context responses without an unhandled rejection', async () => {
    const layout = fs.readFileSync(path.join(__dirname, '../components/Layout/MainLayout.tsx'), 'utf8');
    const ast = ts.createSourceFile('MainLayout.tsx', layout, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    let callback;
    function visit(node) {
        if (ts.isVariableDeclaration(node) && node.name.getText(ast) === 'getRetrieval') callback = node.initializer.arguments[0].getText(ast);
        ts.forEachChild(node, visit);
    }
    visit(ast);
    for (const [body, status] of [[{ error: 'Session service unavailable' }, 502], [{ status: true }, 200]]) {
        let shownError = '', checking;
        const context = {
            setChecking: value => { checking = value; }, setContextError: value => { shownError = value; },
            setApplicationSettings: () => assert.fail('An invalid context must not be applied'),
            fetch: async () => new Response(JSON.stringify(body), { status }),
        };
        const output = ts.transpileModule(`this.run = ${callback};`, { compilerOptions: { target: ts.ScriptTarget.ES2020 } }).outputText;
        vm.runInNewContext(output, context);
        await assert.doesNotReject(() => context.run(new AbortController().signal));
        assert.ok(shownError);
        assert.equal(checking, false);
    }
});

for (const code of ['SESSION_REPLACED', 'SESSION_EXPIRED', 'SESSION_INVALID']) {
    test(`${code} clears both credentials before redirecting, preventing a login loop`, async () => {
        const response = await handler({ status: false, code, message: 'Sign in again', isExpired: true }, 401);
        assert.equal(response.status, 401);
        const cookies = response.headers.get('set-cookie');
        for (const name of ['PLS-SESSION', 'pls-prime-tenant-session', 'loginsessionId']) assert.ok(cookies.includes(`${name}=`));
        assert.equal((await response.json()).code, code);
    });
}
