const loadBackendTransport = require('./helpers/backend-transport.cjs');
const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");
const ts = require("typescript");

const source = readFileSync(path.join(__dirname, "..", "app", "api", "auth", "login", "route.ts"), "utf8");
const compiled = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText;

function createHandler(role, verified = true, settings = {}, tokenOverride) {
    const savedCookies = [];
    const signedPayloads = [];
    const exports = {};
    const backendUser = { role, employeeid: 1, email: "admin@example.test" };
    class SignJWT {
        constructor(payload) { this.payload = payload; signedPayloads.push(payload); }
        setProtectedHeader() { return this; }
        setIssuedAt() { return this; }
        setExpirationTime() { return this; }
        async sign() {
            return tokenOverride || `eyJhbGciOiJIUzI1NiJ9.${Buffer.from(JSON.stringify(this.payload)).toString('base64url')}.${'s'.repeat(43)}`;
        }
    }
    vm.runInNewContext(compiled, {
        exports,
        require(name) {
            if (name === "next/server") return {
                NextResponse: { json: (body, options = {}) => ({ status: options.status || 200, body }) },
            };
            if (name === "next/headers") return {
                cookies: () => ({ set: (...args) => savedCookies.push(args) }),
            };
            if (name.endsWith("sessionCookies")) return {secureSessionCookies:()=>false};
            if (name.endsWith("serverBackendAccess")) return { assertBackendTransport: loadBackendTransport(), getBackendAuthorization: () => "Bearer test-service-token" };
            if (name === "jose") return { SignJWT, jwtVerify: async () => ({}) };
            throw new Error(`Unexpected dependency: ${name}`);
        },
        process: { env: { NODE_ENV: "development", DEVELOPMENT_BASEURL: "http://localhost/api/v1/", JWT_SECRET_KEY: "synthetic-test-key" } },
        URL, TextEncoder, Date, console,
        fetch: async (url, options) => {
            assert.equal(options.headers.Authorization, "Bearer test-service-token");
            assert.equal(url.searchParams.get("tenantId"), "397773");
            return {
                ok: verified,
                json: async () => ({ status: verified, user: { user: backendUser }, settings, message: verified ? "" : "Session rejected" }),
            };
        },
    });
    return { POST: exports.POST, savedCookies, signedPayloads };
}

const request = {
    json: async () => ({
        status: true, accessToken: "synthetic-backend-token", tenantId: 397773,
        user: { role: "super-admin" },
    }),
};

for (const role of ["super-admin", "admin", "patient", "clinician"]) {
    test(`creates a session for a backend-verified ${role}`, async () => {
        const handler = createHandler(role);
        const result = await handler.POST(request);
        assert.equal(result.status, 200);
        assert.equal(result.body.role, role);
        assert.equal(handler.savedCookies.length, 3);
        assert.equal(handler.signedPayloads[0].user.role, role);
        assert.equal(handler.signedPayloads[0].tenantId, 397773);
        assert.equal(handler.savedCookies[0][2].httpOnly, true);
    });
}

test("rejects an unsupported backend role despite the caller claiming super-admin", async () => {
    const handler = createHandler("unsupported-role");
    const result = await handler.POST(request);
    assert.equal(result.status, 403);
    assert.equal(result.body.error, "Invalid role");
    assert.equal(handler.savedCookies.length, 0);
    assert.equal(handler.signedPayloads.length, 0);
});

test("does not grant super-admin a session when backend verification fails", async () => {
    const handler = createHandler("super-admin", false);
    const result = await handler.POST(request);
    assert.equal(result.status, 401);
    assert.equal(handler.savedCookies.length, 0);
    assert.equal(handler.signedPayloads.length, 0);
});

test("large application settings never overflow the browser's session cookie limit", async () => {
    const handler = createHandler("scientist", true, {
        allowScientistToRegisterClient: 0,
        homeCollectionPromptEnabled: 1,
        resultDeliveryPromptEnabled: 1,
        moduleConfiguration: "x".repeat(10000),
    });
    const result = await handler.POST(request);
    assert.equal(result.status, 200);
    const [name, value] = handler.savedCookies[0];
    assert.ok(Buffer.byteLength(`${name}=${value}`) < 3800);
    assert.equal(handler.signedPayloads[0].settings.allowScientistToRegisterClient, 0);
    assert.equal(Object.keys(handler.signedPayloads[0].settings).length, 1);
    assert.equal(handler.signedPayloads[0].accessToken, undefined, "the backend token has its own cookie");
    assert.equal(handler.savedCookies[1][1], "synthetic-backend-token");
});

test("does not report success or set cookies if the signed session is too large", async () => {
    const handler = createHandler("admin", true, {}, "x".repeat(4000));
    const result = await handler.POST(request);
    assert.equal(result.status, 500);
    assert.equal(handler.savedCookies.length, 0);
});

for (const format of ['iso', 'milliseconds']) {
    test(`server ${format} expiry produces a finite positive lifetime for every cookie`, async () => {
        const handler = createHandler('admin');
        const expiry = Date.now() + 8 * 60 * 60 * 1000;
        const result = await handler.POST({ json: async () => ({
            ...await request.json(),
            sessionExpiryTime: format === 'iso' ? new Date(expiry).toISOString() : expiry,
        }) });
        assert.equal(result.status, 200);
        for (const [, , options] of handler.savedCookies) {
            assert.ok(Number.isSafeInteger(options.maxAge));
            assert.ok(options.maxAge > 28790 && options.maxAge <= 28800);
        }
    });
}

for (const expiry of ['not-a-date', '', 0, Date.now() - 1000, {}]) {
    test(`invalid or expired session lifetime is rejected before writing cookies (${JSON.stringify(expiry)})`, async () => {
        const handler = createHandler('admin');
        const result = await handler.POST({ json: async () => ({ ...await request.json(), sessionExpiryTime: expiry }) });
        assert.equal(result.status, 400);
        assert.equal(handler.savedCookies.length, 0);
    });
}
