"use strict";

const fs = require("node:fs");
const path = require("node:path");
const { validateLicensePolicy } = require("./license-policy.cjs");
const SAFE = {
	NODE_ENV: "production", PLS_DESKTOP_GENERIC: "true", PLS_DESKTOP_STANDALONE: "true", PLS_LICENSE_MODE: "signed",
	MULTI_TENANT: "false", PRODUCTION_PORT: "2300",
};

function assertGenericConfig(config) {
	validateLicensePolicy(config);
	if (config.PLS_DESKTOP_GENERIC !== "true") throw new Error("Expected a generic installer configuration.");
	for (const [key, value] of Object.entries(config)) {
		if (key === "PLS_LICENSE_PUBLIC_KEY") continue;
		if (key === "PLS_INSTALL_PASSWORD_VERIFIER") { require("./setup-auth.cjs").parseVerifier(value); continue; }
		if (SAFE[key] !== value) throw new Error("Generic package contains an unreviewed setting or secret.");
	}
	for (const [key, value] of Object.entries(SAFE)) {
		if (config[key] !== value) throw new Error("Generic package is missing a reviewed setting.");
	}
}

function assertGenericReleaseConfig(config) {
	assertGenericConfig(config);
	require("./setup-auth.cjs").parseVerifier(config.PLS_INSTALL_PASSWORD_VERIFIER);
}

function genericConfig(publicPem, parse, verifier) {
	const template = fs.readFileSync(path.join(__dirname, "config", "generic-backend.env.example"), "utf8");
	if (verifier) require("./setup-auth.cjs").parseVerifier(verifier);
	const content = `${template.trimEnd()}\nPLS_LICENSE_PUBLIC_KEY=${JSON.stringify(publicPem)}\n` +
		(verifier ? `PLS_INSTALL_PASSWORD_VERIFIER=${verifier}\n` : "");
	assertGenericConfig(parse(content));
	return content;
}

function removeStagedEnvironments(directory) {
	for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
		const target = path.join(directory, entry.name);
		if (entry.isDirectory()) removeStagedEnvironments(target);
		else if (entry.isFile() && /^\.env(?:\.|$)/i.test(entry.name)) fs.unlinkSync(target);
	}
}

module.exports = { assertGenericConfig, assertGenericReleaseConfig, genericConfig, removeStagedEnvironments };
