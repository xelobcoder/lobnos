"use strict";

const { createPublicKey } = require("node:crypto");

function validateLicensePolicy(config) {
	if (config.PLS_DESKTOP_GENERIC !== undefined && !["true", "false"].includes(config.PLS_DESKTOP_GENERIC)) {
		throw new Error("PLS_DESKTOP_GENERIC must be true or false.");
	}
	const mode = config.PLS_LICENSE_MODE || "legacy";
	if (config.PLS_DESKTOP_GENERIC === "true" && mode !== "signed") {
		throw new Error("Generic desktop installers require signed licensing.");
	}
	if (!["legacy", "signed"].includes(mode)) {
		throw new Error("PLS_LICENSE_MODE must be legacy or signed.");
	}
	if (mode === "signed") {
		const pem = config.PLS_LICENSE_PUBLIC_KEY;
		if (!pem || !pem.includes("-----BEGIN PUBLIC KEY-----") || pem.includes("PRIVATE KEY")) {
			throw new Error("Signed desktop licensing requires PLS_LICENSE_PUBLIC_KEY containing only a public Ed25519 PEM key.");
		}
		let key;
		try {
			key = createPublicKey(pem);
		} catch {
			throw new Error("PLS_LICENSE_PUBLIC_KEY is not a valid public PEM key.");
		}
		if (key.asymmetricKeyType !== "ed25519") {
			throw new Error("PLS_LICENSE_PUBLIC_KEY must be an Ed25519 public key.");
		}
		const tenantId = Number(config.PLS_LICENSE_TENANT_ID);
		if (config.PLS_DESKTOP_GENERIC === "true") {
			if (config.PLS_LICENSE_TENANT_ID !== undefined || config.DEFAULT_TENANT_ID !== undefined) {
				throw new Error("Generic packages must not bind a tenant.");
			}
		} else if (!/^[1-9]\d*$/.test(config.PLS_LICENSE_TENANT_ID || "") || !Number.isSafeInteger(tenantId)) {
			throw new Error("Signed desktop licensing requires a valid PLS_LICENSE_TENANT_ID.");
		}
	}
	return mode;
}

function applyPackagedLicensePolicy(userConfig, packagedConfig) {
	const mode = validateLicensePolicy(packagedConfig);
	if (mode === "signed") {
		const { PLS_LICENSE_PUBLIC_KEY_FILE, ...localConfig } = userConfig;
		return {
			...localConfig,
			PLS_LICENSE_MODE: "signed",
			PLS_LICENSE_PUBLIC_KEY: packagedConfig.PLS_LICENSE_PUBLIC_KEY,
			PLS_DESKTOP_GENERIC: packagedConfig.PLS_DESKTOP_GENERIC || "false",
			PLS_LICENSE_TENANT_ID: packagedConfig.PLS_DESKTOP_GENERIC === "true"
				? userConfig.PLS_LICENSE_TENANT_ID : packagedConfig.PLS_LICENSE_TENANT_ID,
		};
	}
	validateLicensePolicy(userConfig);
	return userConfig;
}

module.exports = { validateLicensePolicy, applyPackagedLicensePolicy };
