"use strict";
const { test } = require("node:test");
const assert = require("node:assert/strict");
const { generateKeyPairSync } = require("node:crypto");
const { parse } = require("dotenv");
const { genericConfig, assertGenericConfig, assertGenericReleaseConfig, removeStagedEnvironments } = require("./generic-config.cjs");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { applyPackagedLicensePolicy, validateLicensePolicy } = require("./license-policy.cjs");
const publicPem = () => generateKeyPairSync("ed25519").publicKey.export({ format: "pem", type: "spki" });

test("a real generic release is blocked until a valid administrator verifier exists", () => {
	const config = parse(genericConfig(publicPem(), parse));
	assert.throws(() => assertGenericReleaseConfig(config), /verifier is missing or invalid/);
	assert.throws(() => assertGenericReleaseConfig({ ...config, PLS_INSTALL_PASSWORD_VERIFIER: "literal-password" }));
	const { createVerifier } = require("./setup-auth.cjs");
	const verifier = createVerifier("fixture-release-authorization-only");
	assert.doesNotThrow(() => assertGenericReleaseConfig(parse(genericConfig(publicPem(), parse, verifier))));
});
test("generic config is a reviewed allowlist without tenant, database or service secrets", () => {
	const config = parse(genericConfig(publicPem(), parse));
	assertGenericConfig(config);
	assert.equal(config.PLS_LICENSE_TENANT_ID, undefined);
	for (const key of ["PRODUCTION_DB_PASSWORD", "API_KEY", "EMAIL_PASSWORD", "DEFAULT_TENANT_ID", "PRODUCTION_DATABASE"]) {
		assert.equal(config[key], undefined);
		assert.throws(() => assertGenericConfig({ ...config, [key]: "real-production-secret" }));
	}
});

test("generic user settings select tenant but cannot downgrade or replace issuer", () => {
	const packaged = parse(genericConfig(publicPem(), parse));
	const user = { PLS_LICENSE_MODE: "legacy", PLS_LICENSE_PUBLIC_KEY: publicPem(),
		PLS_LICENSE_PUBLIC_KEY_FILE: "evil.pem", PLS_LICENSE_TENANT_ID: "125",
		PLS_DESKTOP_GENERIC: "false", PRODUCTION_DB_PASSWORD: "local-only" };
	const applied = applyPackagedLicensePolicy(user, packaged);
	assert.equal(applied.PLS_LICENSE_TENANT_ID, "125");
	assert.equal(applied.PLS_LICENSE_MODE, "signed");
	assert.equal(applied.PLS_LICENSE_PUBLIC_KEY, packaged.PLS_LICENSE_PUBLIC_KEY);
	assert.equal(applied.PLS_LICENSE_PUBLIC_KEY_FILE, undefined);
	assert.equal(applied.PRODUCTION_DB_PASSWORD, "local-only");
});

test("generic marker is strict and cannot bind a packaged tenant or use legacy", () => {
	const config = parse(genericConfig(publicPem(), parse));
	for (const marker of ["yes", "TRUE", "1", ""]) assert.throws(() => validateLicensePolicy({ ...config, PLS_DESKTOP_GENERIC: marker }));
	assert.throws(() => validateLicensePolicy({ ...config, PLS_LICENSE_MODE: "legacy" }));
	assert.throws(() => validateLicensePolicy({ ...config, PLS_LICENSE_TENANT_ID: "125" }));
});

test("generic staging strips Next copied environment files without touching backend.env", t => {
	const dir = fs.mkdtempSync(path.join(os.tmpdir(), "pls-staged-env-"));
	t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
	fs.mkdirSync(path.join(dir, "frontend"));
	fs.writeFileSync(path.join(dir, "frontend", ".env"), "do-not-package");
	fs.writeFileSync(path.join(dir, "frontend", ".env.local"), "do-not-package");
	fs.writeFileSync(path.join(dir, "backend.env"), "safe-reviewed-template");
	removeStagedEnvironments(dir);
	assert.equal(fs.existsSync(path.join(dir, "frontend", ".env")), false);
	assert.equal(fs.existsSync(path.join(dir, "frontend", ".env.local")), false);
	assert.equal(fs.readFileSync(path.join(dir, "backend.env"), "utf8"), "safe-reviewed-template");
});
