"use strict";
const crypto = require("node:crypto");

const OPTIONS = { N: 32768, r: 8, p: 1, maxmem: 64 * 1024 * 1024 };
function parseVerifier(value) {
	if (typeof value !== "string" || !/^scrypt-v1:32768:8:1:[a-f0-9]{32}:[a-f0-9]{64}$/.test(value)) {
		throw new Error("Installation authorization verifier is missing or invalid. Contact the installer administrator.");
	}
	const parts = value.split(":");
	return { salt: Buffer.from(parts[4], "hex"), hash: Buffer.from(parts[5], "hex") };
}
function createVerifier(password) {
	if (typeof password !== "string" || password.length < 12 || password.length > 256 || /[\r\n\0]/.test(password)) {
		throw new Error("Use an installation password of 12 to 256 characters.");
	}
	const salt = crypto.randomBytes(16);
	const hash = crypto.scryptSync(password, salt, 32, OPTIONS);
	return `scrypt-v1:32768:8:1:${salt.toString("hex")}:${hash.toString("hex")}`;
}
function verifyPassword(password, verifier) {
	const parsed = parseVerifier(verifier);
	if (typeof password !== "string" || !password || password.length > 256) return false;
	return crypto.timingSafeEqual(crypto.scryptSync(password, parsed.salt, 32, OPTIONS), parsed.hash);
}
class InstallationGate {
	constructor(verifier, now = Date.now) {
		parseVerifier(verifier);
		this.verifier = verifier;
		this.now = now;
		this.attempts = 0;
		this.blockedUntil = 0;
	}
	authorize(password) {
		if (this.now() < this.blockedUntil) throw new Error("Too many incorrect installation passwords. Wait five minutes.");
		if (this.blockedUntil) { this.attempts = 0; this.blockedUntil = 0; }
		if (!verifyPassword(password, this.verifier)) {
			this.attempts++;
			if (this.attempts >= 5) this.blockedUntil = this.now() + 300000;
			throw new Error("Incorrect installation authorization password. No database changes were made.");
		}
		this.attempts = 0;
	}
}
module.exports = { createVerifier, parseVerifier, verifyPassword, InstallationGate };
