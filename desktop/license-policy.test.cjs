"use strict";

const { test } = require("node:test");
const assert = require("node:assert/strict");
const { generateKeyPairSync } = require("node:crypto");
const { validateLicensePolicy, applyPackagedLicensePolicy } = require("./license-policy.cjs");
const pem = generateKeyPairSync("ed25519").publicKey.export({ type: "spki", format: "pem" }).toString();
const signed = { PLS_LICENSE_MODE: "signed", PLS_LICENSE_PUBLIC_KEY: pem, PLS_LICENSE_TENANT_ID: "990556" };

test("legacy deployments remain compatible", () => {
	assert.equal(validateLicensePolicy({}), "legacy");
	assert.deepEqual(applyPackagedLicensePolicy({ DATABASE: "existing" }, {}), { DATABASE: "existing" });
});

test("signed policy requires Ed25519 public key and tenant", () => {
	assert.equal(validateLicensePolicy(signed), "signed");
	assert.throws(() => validateLicensePolicy({ ...signed, PLS_LICENSE_PUBLIC_KEY: "" }), /public Ed25519/);
	assert.throws(() => validateLicensePolicy({ ...signed, PLS_LICENSE_TENANT_ID: "0" }), /TENANT_ID/);
	assert.throws(() => validateLicensePolicy({ PLS_LICENSE_MODE: "off" }), /legacy or signed/);
});

test("a user environment cannot downgrade signed installer policy or replace its trust key", () => {
	const replacement = generateKeyPairSync("ed25519").publicKey.export({ type: "spki", format: "pem" }).toString();
	const result = applyPackagedLicensePolicy({
		PLS_LICENSE_MODE: "legacy",
		PLS_LICENSE_PUBLIC_KEY: replacement,
		PLS_LICENSE_TENANT_ID: "1",
		PLS_LICENSE_PUBLIC_KEY_FILE: "untrusted.pem",
		PRODUCTION_DATABASE: "local-db",
	}, signed);
	assert.equal(result.PLS_LICENSE_MODE, "signed");
	assert.equal(result.PLS_LICENSE_PUBLIC_KEY, pem);
	assert.equal(result.PLS_LICENSE_TENANT_ID, "990556");
	assert.equal(result.PRODUCTION_DATABASE, "local-db");
	assert.equal(result.PLS_LICENSE_PUBLIC_KEY_FILE, undefined);
});

test("private keys and malformed keys are rejected", () => {
	const privatePem = generateKeyPairSync("ed25519").privateKey.export({ type: "pkcs8", format: "pem" }).toString();
	assert.throws(() => validateLicensePolicy({ ...signed, PLS_LICENSE_PUBLIC_KEY: privatePem }), /only a public/);
	assert.throws(() => validateLicensePolicy({ ...signed, PLS_LICENSE_PUBLIC_KEY: "-----BEGIN PUBLIC KEY-----\ninvalid\n-----END PUBLIC KEY-----" }), /valid public/);
	const ecPem = generateKeyPairSync("ec", { namedCurve: "prime256v1" }).publicKey.export({ type: "spki", format: "pem" }).toString();
	assert.throws(() => validateLicensePolicy({ ...signed, PLS_LICENSE_PUBLIC_KEY: ecPem }), /must be an Ed25519/);
});
