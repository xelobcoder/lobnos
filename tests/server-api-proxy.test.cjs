const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");
const ts = require("typescript");

const root = path.join(__dirname, "..");

for (const route of ["v1", "inventory"]) {
	test(`${route} route awaits promised path parameters before forwarding requests`, async () => {
		const exports = {};
		const request = { method: "POST" };
		const response = { status: 200 };
		let forwarded;
		const source = readFileSync(path.join(root, `app/api/${route}/[...path]/route.ts`), "utf8");
		vm.runInNewContext(ts.transpileModule(source, {
			compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
		}).outputText, {
			exports,
			process: { env: { NODE_ENV: "development", DEVELOPMENT_BASEURL: "http://backend.test", PSL_INVEN_ROUTE: "http://inventory.test" } },
			require: () => ({ proxyBackendRequest: (...args) => { forwarded = args; return response; } }),
		});
		const segments = ["prime", "login"];
		const result = await exports.POST(request, { params: Promise.resolve({ path: segments }) });
		assert.equal(result, response);
		assert.equal(forwarded[0], request);
		assert.equal(forwarded[1], segments);
		assert.equal(forwarded[2], route === "v1" ? "http://backend.test" : "http://inventory.test");
	});
}

function loadProxy({ env, fetch, context={PLS_SESSION:'signed-session',PLS_PRIME_TENANT_SESSION:'tenant-session',tenantId:42} }) {
	const accessExports = {};
	vm.runInNewContext(ts.transpileModule(
		readFileSync(path.join(root, "lib/serverBackendAccess.ts"), "utf8"),
		{ compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } },
	).outputText, { exports: accessExports, process: { env } });
	const exports = {};
	const source = readFileSync(path.join(root, "lib/serverBackendProxy.ts"), "utf8");
	const compiled = ts.transpileModule(source, {
		compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
	}).outputText;
	vm.runInNewContext(compiled, {
		exports,
		require(name) {
			if (name === "next/server") {
				return { NextResponse: { json: (body, options) => ({ body, status: options.status }) } };
			}
			if(name==='./serverBackendRequest') {
                const nested={};
                vm.runInNewContext(ts.transpileModule(readFileSync(path.join(root,'lib/serverBackendRequest.ts'),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{exports:nested,URL,Headers,AbortSignal,process:{env},fetch,require:dependency=>{
                    if(dependency==='server-only')return {};
                    if(dependency==='./serverRequestContext')return {getServerRequestContext:async()=>context||{}};
                    if(dependency==='./serverBackendAccess')return accessExports;
                    if(dependency==='./apiBaseUrl')return {usesTenantQuery:endpoint=>!endpoint.startsWith('marketplace/')};
                    throw Error(dependency);
                }});
                return nested;
            }
            if (name === "./serverBackendAccess") {
				return accessExports;
			}
			throw new Error(`Unexpected dependency: ${name}`);
		},
		Headers,
		Response,
		URL,
		console: { error() {} },
		fetch,
	});
	return exports.proxyBackendRequest;
}

test("server API proxy replaces browser authorization and preserves session and tenant context", async () => {
	let upstreamUrl;
	let upstreamOptions;
	const proxy = loadProxy({
		env: { PLS_BACKEND_ACCESS_TOKEN: "server-only-test-token" },
		fetch: async (url, options) => {
			upstreamUrl = url;
			upstreamOptions = options;
			return new Response("created", {
				status: 201,
				headers: { "content-type": "text/plain", "content-length": "7" },
			});
		},
	});
	const request = {
		method: "POST",
		url: "http://localhost:2377/api/v1/lab/results?tenantId=42",
		headers: new Headers({
			authorization: "Bearer untrusted-browser-token",
			cookie: "PLS-SESSION=session-cookie",
			"pls-session": "signed-session",
		}),
		arrayBuffer: async () => new TextEncoder().encode("payload").buffer,
	};

	const response = await proxy(request, ["lab", "results"], "http://backend.test/api/v1/");

	assert.equal(upstreamUrl.toString(), "http://backend.test/api/v1/lab/results?tenantId=42");
	assert.equal(upstreamOptions.headers.get("authorization"), "Bearer server-only-test-token");
	assert.equal(upstreamOptions.headers.get("cookie"), null);
	assert.equal(upstreamOptions.headers.get("pls-session"), "signed-session");
	assert.equal(new TextDecoder().decode(upstreamOptions.body), "payload");
	assert.equal(response.status, 201);
	assert.match(response.headers.get("Cache-Control"), /private.*no-store/);
	assert.equal(response.headers.get("Cloudflare-CDN-Cache-Control"), "no-store");
	assert.equal(response.headers.get("content-length"), null);
	assert.equal(await response.text(), "created");
});

test("server API proxy forwards session-authenticated requests without a global service token", async () => {
	let fetchCalled = false;
	const proxy = loadProxy({
		env: {},
		fetch: async (url, options) => {
			fetchCalled = true;
			assert.equal(options.headers.has("authorization"), false);
			assert.equal(options.headers.get("pls-prime-tenant-session"), "tenant-session");
			return new Response("backend response", { status: 200 });
		},
	});
	const request = {
		method: "GET",
		url: "http://localhost:2377/api/v1/lab/results",
		headers: new Headers({
			authorization: "Bearer untrusted-browser-token",
			"pls-prime-tenant-session": "tenant-session",
		}),
	};

	const response = await proxy(request, ["lab", "results"], "http://backend.test/api/v1/");

	assert.equal(response.status, 200);
	assert.equal(await response.text(), "backend response");
	assert.equal(fetchCalled, true);
});

test("Next.js build-time environment contains no authentication secrets", () => {
	const config = require(path.join(root, "next.config.js"));
	for (const key of ["NEXT_PUBLIC_ACCESS_TOKEN", "HASH_SECRET", "JWT_SECRET_KEY", "ACCESS_SECRET"]) {
		assert.equal(Object.hasOwn(config.env, key), false, `${key} must remain server-only`);
	}
	assert.equal(config.rewrites, undefined, "API requests must reach the server-side proxy route");
});

test("public patient login reaches backend through same-origin proxy without tenant or session cookies", async () => {
    let reached = false;
    const proxy = loadProxy({
        env: {}, context:null,
        fetch: async (url, options) => {
            reached = true;
            assert.equal(url.pathname, "/api/v1/login/patient");
            assert.equal(url.searchParams.has("tenantId"), false);
            assert.equal(options.headers.has("cookie"), false);
            assert.equal(options.cache, "no-store");
            assert.equal(JSON.parse(new TextDecoder().decode(options.body)).username, "PLS42P007");
            return new Response(JSON.stringify({ status: true, accessToken: "synthetic-token", tenantId: 42 }), { headers: { "content-type": "application/json" } });
        },
    });
    const response = await proxy({
        method: "POST",
        url: "http://portal.test/api/v1/login/patient",
        headers: new Headers({ "content-type": "application/json" }),
        arrayBuffer: async () => new TextEncoder().encode(JSON.stringify({ username: "PLS42P007", password: "synthetic-password" })).buffer,
    }, ["login", "patient"], "http://backend.test/api/v1/");
    assert.equal(reached, true);
    assert.equal((await response.json()).tenantId, 42);
});
