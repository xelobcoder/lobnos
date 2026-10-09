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

function createHandler(role, verified = true) {
    const savedCookies = [];
    const signedPayloads = [];
    const exports = {};
    const backendUser = { role, employeeid: 1, email: "admin@example.test" };
    class SignJWT {
        constructor(payload) { signedPayloads.push(payload); }
        setProtectedHeader() { return this; }
        setIssuedAt() { return this; }
        setExpirationTime() { return this; }
        async sign() { return "synthetic-signed-session"; }
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
            if (name === "jose") return { SignJWT, jwtVerify: async () => ({}) };
            throw new Error(`Unexpected dependency: ${name}`);
        },
        process: { env: { NODE_ENV: "development", DEVELOPMENT_BASEURL: "http://localhost/api/v1/", JWT_SECRET_KEY: "synthetic-test-key" } },
        URL, TextEncoder, Date, console,
        fetch: async (url) => {
            assert.equal(url.searchParams.get("tenantId"), "397773");
            return {
                ok: verified,
                json: async () => ({ status: verified, user: { user: backendUser }, settings: {}, message: verified ? "" : "Session rejected" }),
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
