"use strict";
const crypto = require("node:crypto");
const OPTIONS = { N: 32768, r: 8, p: 1, maxmem: 64 * 1024 * 1024 };
function parseEnvelope(text) {
	const e = typeof text === "string" ? JSON.parse(text) : text;
	if (!e || e.version !== 1 || e.kdf !== "scrypt-32768-8-1" ||
		! /^[a-f0-9]{32}$/.test(e.salt) || !/^[a-f0-9]{24}$/.test(e.iv) ||
		!/^[a-f0-9]{32}$/.test(e.tag) || !/^[a-f0-9]{2,8192}$/.test(e.data) || e.data.length % 2) {
		throw new Error("Invalid protected release credential.");
	}
	return e;
}
function sealCredential(password, credential) {
	if (typeof credential !== "string" || !credential || credential.length > 256) throw new Error("Existing database credential is required.");
	const salt = crypto.randomBytes(16), iv = crypto.randomBytes(12);
	const key = crypto.scryptSync(password, salt, 32, OPTIONS);
	try {
		const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
		cipher.setAAD(Buffer.from("PLS-fixed-database-v1"));
		const data = Buffer.concat([cipher.update(credential, "utf8"), cipher.final()]);
		return JSON.stringify({ version: 1, kdf: "scrypt-32768-8-1", salt: salt.toString("hex"),
			iv: iv.toString("hex"), tag: cipher.getAuthTag().toString("hex"), data: data.toString("hex") });
	} finally { key.fill(0); }
}
function openCredential(password, text) {
	let key;
	try {
		const e = parseEnvelope(text);
		key = crypto.scryptSync(password, Buffer.from(e.salt, "hex"), 32, OPTIONS);
		const cipher = crypto.createDecipheriv("aes-256-gcm", key, Buffer.from(e.iv, "hex"));
		cipher.setAAD(Buffer.from("PLS-fixed-database-v1"));
		cipher.setAuthTag(Buffer.from(e.tag, "hex"));
		return Buffer.concat([cipher.update(Buffer.from(e.data, "hex")), cipher.final()]).toString("utf8");
	} catch { throw new Error("Installation authorization failed or protected release credential is damaged."); }
	finally { if (key) key.fill(0); }
}
module.exports = { parseEnvelope, sealCredential, openCredential };
