"use strict";
const { test } = require("node:test");
const assert = require("node:assert/strict");
const { createVerifier, InstallationGate, verifyPassword } = require("./setup-auth.cjs");
const password = "test-only-authorization-password";
const verifier = createVerifier(password);
test("wrong authorization performs no downstream writes; correct authorization permits them", () => {
	const gate = new InstallationGate(verifier);
	let writes = 0;
	const provision = value => { gate.authorize(value); writes++; };
	assert.throws(() => provision("incorrect"), /Incorrect installation/);
	assert.equal(writes, 0);
	provision(password);
	assert.equal(writes, 1);
	assert.equal(verifier.includes(password), false);
	assert.equal(verifyPassword(password, verifier), true);
});
test("limited attempts and cooldown; malformed verifier fails closed", () => {
	let now = 0;
	const gate = new InstallationGate(verifier, () => now);
	for (let i = 0; i < 5; i++) assert.throws(() => gate.authorize("wrong"), /Incorrect/);
	assert.throws(() => gate.authorize(password), /Wait five minutes/);
	now = 300001;
	gate.authorize(password);
	assert.throws(() => new InstallationGate("plaintext"), /verifier/);
});
