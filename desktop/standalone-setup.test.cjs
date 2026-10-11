"use strict";
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { EventEmitter } = require("node:events");
const { PassThrough } = require("node:stream");
const { createVerifier, InstallationGate } = require("./setup-auth.cjs");
const { provisionStandalone, frontendRuntimeConfig } = require("./standalone-setup.cjs");
const { writeProtected, readProtected } = require("./secure-setup-store.cjs");
const { runProvisionCommand } = require("./provision-command.cjs");

// Mock encryption only: these tests do not claim to validate DPAPI.
const storage = { isEncryptionAvailable: () => true,
	encryptString: value => Buffer.from(value.split("").reverse().join("")),
	decryptString: value => value.toString().split("").reverse().join("") };
const input = { installationPassword: "fixture-authorization-only" };
const verifier = createVerifier(input.installationPassword);
function fixture(t) {
	const directory = fs.mkdtempSync(path.join(os.tmpdir(), "pls-provision-test-"));
	t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
	return { input, gate: new InstallationGate(verifier), storage,
		pendingFile: path.join(directory, "pending.json"),
		persist: (file, state, storage) => writeProtected(file, state, storage, () => {}) };
}
test("authorization and encryption fail before credentials are persisted or a command is run", async t => {
	const options = fixture(t);
	let runs = 0;
	const run = async () => { runs++; return { ready: true }; };
	await assert.rejects(provisionStandalone({ ...options, input: { ...input, installationPassword: "wrong" }, run }), /Incorrect/);
	await assert.rejects(provisionStandalone({ ...options, storage: { isEncryptionAvailable: () => false }, run }), /encryption/);
	assert.equal(runs, 0);
	assert.equal(fs.existsSync(options.pendingFile), false);
});
test("failures retain the same generated account and retry does not store either supplied password", async t => {
	const options = fixture(t);
	let first;
	await assert.rejects(provisionStandalone({ ...options, run: async request => {
		first = request.state;
		throw new Error("fixture failure");
	} }), /fixture failure/);
	const saved = readProtected(options.pendingFile, storage);
	assert.deepEqual(saved, first);
	assert.equal("admin" in saved, false);
	assert.equal("installationPassword" in saved, false);
	const disk = fs.readFileSync(options.pendingFile, "utf8");
	for (const secret of [input.installationPassword, saved.accountPassword]) assert.equal(disk.includes(secret), false);
	const result = await provisionStandalone({ ...options, run: async request => {
		assert.deepEqual(request.state, first);
		return { ready: true };
	} });
	assert.equal(result.config.PRODUCTION_DB_USERNAME, "primelab");
	assert.equal(result.config.PRODUCTION_DB_USERNAME, first.account);
	assert.equal(result.config.MULTI_TENANT, "false");
	assert.equal(result.config.PRODUCTION_DATABASE, "Primelabsys");
	assert.equal(result.config.LOCAL_ORGANIZATION_NAME, "Prime Laboratory System");
	assert.equal(result.loginPassword, "12345");
	assert.match(result.config.JWT_SECRET_KEY, /^[A-Za-z0-9_-]{43}$/);
	assert.notEqual(result.config.JWT_SECRET_KEY, result.config.ACCESS_TOKEN_SECRET);
	assert.deepEqual(frontendRuntimeConfig(result.config), { JWT_SECRET_KEY: result.config.JWT_SECRET_KEY });
	assert.throws(() => frontendRuntimeConfig({ ...result.config, JWT_SECRET_KEY: "" }), /session key is missing/);
	assert.deepEqual(frontendRuntimeConfig({}), {});
	// Any pending installation is reused as-is; there are no per-install fields left to disagree about.
	await assert.rejects(provisionStandalone({ ...options, input: { ...input, unexpected: "value" }, run: async () => assert.fail() }), /Invalid standalone setup/);
});
test("protected storage enforces directory/file permissions and rejects corrupt envelopes or fallback encryption", t => {
	const options = fixture(t);
	const calls = [];
	writeProtected(options.pendingFile, { account: "test-only" }, storage, (target, directory) => calls.push({ target, directory }));
	assert.equal(calls[0].directory, true);
	assert.equal(calls.slice(1).every(call => call.directory === false), true);
	assert.deepEqual(readProtected(options.pendingFile, storage), { account: "test-only" });
	fs.writeFileSync(options.pendingFile, "{}");
	assert.throws(() => readProtected(options.pendingFile, storage), /could not be read/);
	assert.throws(() => writeProtected(options.pendingFile, {}, { ...storage, getSelectedStorageBackend: () => "basic_text" }), /encryption/);
});
function childHarness() {
	const child = new EventEmitter();
	child.stdin = new PassThrough(); child.stdout = new PassThrough(); child.stderr = new PassThrough();
	child.kill = () => { child.emit("close", 1); };
	let captured;
	const spawn = (...args) => { captured = args; return child; };
	return { child, spawn, args: () => captured };
}
test("provisioning uses stdin only, no shell/credential argv, and does not forward raw stderr", async () => {
	const h = childHarness();
	const fixtureSecret = "fixture-admin-credential";
	const pending = runProvisionCommand(path.resolve("fixture-backend"), { state: { accountPassword: fixtureSecret } }, { spawn: h.spawn });
	const payload = h.child.stdin.read().toString();
	h.child.stderr.write("raw driver message with a fixture credential");
	h.child.stdout.end('{"ready":true}\n');
	h.child.emit("close", 0);
	assert.deepEqual(await pending, { ready: true });
	assert.equal(h.args()[2].shell, false);
	assert.equal(JSON.stringify(h.args()).includes(fixtureSecret), false);
	assert.equal(JSON.parse(payload).state.accountPassword, fixtureSecret);
});
test("provisioning rejects nonzero exit, malformed output, explicit readiness failure and timeout", async () => {
	for (const [code, output] of [[1, '{"ready":false,"message":"Local setup failed during fixture stage."}'], [0, "invalid"], [0, '{"ready":false}']]) {
		const h = childHarness();
		const pending = runProvisionCommand(path.resolve("fixture-backend"), {}, { spawn: h.spawn });
		h.child.stdout.write(output); h.child.emit("close", code);
		await assert.rejects(pending, /failed|readiness/);
	}
	const h = childHarness();
	await assert.rejects(runProvisionCommand(path.resolve("fixture-backend"), {}, { spawn: h.spawn, timeout: 5 }), /failed|timed out/);
});
