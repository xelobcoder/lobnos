"use strict";
const crypto = require("node:crypto");
const fs = require("node:fs");
const { SetupError, facilityCodeBase } = require("./setup-config.cjs");
const { writeProtected, readProtected, requireEncryption } = require("./secure-setup-store.cjs");

function validateInitialInput(input) {
	const fields = ["organizationName", "installationPassword", "host", "port", "user", "password"];
	if (!input || typeof input !== "object" || Array.isArray(input) ||
		Object.keys(input).some(key => !fields.includes(key))) throw new SetupError("Invalid standalone setup fields.");
	for (const field of fields) {
		if (typeof input[field] !== "string" || input[field].length > 256 || /[\r\n\0]/.test(input[field])) {
			throw new SetupError("Invalid standalone setup value.");
		}
	}
	if (!input.organizationName.trim() || input.organizationName !== input.organizationName.trim() ||
		input.organizationName.length > 100) throw new SetupError("Organization name must contain 1 to 100 characters.");
	if (!["localhost", "127.0.0.1", "::1"].includes(input.host)) throw new SetupError("Automatic provisioning requires local loopback MySQL; remote hosts are refused.");
	if (!/^[1-9]\d{0,4}$/.test(input.port) || Number(input.port) > 65535) throw new SetupError("Use a MySQL port from 1 to 65535.");
	if (!input.user.trim()) throw new SetupError("A local MySQL administrator username is required.");
	return input;
}
function newInstallation(input) {
	const installationId = crypto.randomBytes(16).toString("hex");
	const secret = () => crypto.randomBytes(32).toString("base64url");
	const tenantId = String(crypto.randomInt(100000, 1000000));
	return {
		version: 1, installationId, organizationName: input.organizationName, host: input.host, port: input.port,
		account: `pls_${installationId.slice(0, 20)}`, accountPassword: secret(),
		tenantId, organizationId: `LOCAL${tenantId}`, facilityCode: facilityCodeBase(input.organizationName),
		loginPassword: secret(), jwtSecret: secret(), windowKey: secret(), frontendJwtSecret: secret(),
	};
}
function applicationConfig(state) {
	const result = {
		LOCAL_ORGANIZATION_NAME: state.organizationName, PLS_DESKTOP_STANDALONE: "true", MULTI_TENANT: "false",
		PLS_LICENSE_TENANT_ID: state.tenantId, DEFAULT_TENANT_ID: state.tenantId,
		PRODUCTION_DB_HOSTNAME: state.host, PRODUCTION_DB_PORT: state.port,
		PRODUCTION_DB_USERNAME: state.account, PRODUCTION_DB_PASSWORD: state.accountPassword,
		PRODUCTION_DATABASE: "Primelabsys", SYSTEM_CONFIG_DB_HOST: state.host, SYSTEM_CONFIG_DB_PORT: state.port,
		SYSTEM_CONFIG_DB_USERNAME: state.account, SYSTEM_CONFIG_DB_PASSWORD: state.accountPassword,
		SYSTEM_CONFIG_DATABASE: "primelabmaster_control", ACCESS_TOKEN_SECRET: state.jwtSecret, PRIME_WINDOWS_KEY: state.windowKey,
		JWT_SECRET_KEY: state.frontendJwtSecret || state.jwtSecret,
		PLS_LOCAL_PROVISION_VERSION: "1",
	};
	return { ...result, DB_HOST: state.host, DB_PORT: state.port, DB_USERNAME: state.account,
		DB_PASSWORD: state.accountPassword, DATABASE: "Primelabsys" };
}
function frontendRuntimeConfig(config) {
	if (config.PLS_LOCAL_PROVISION_VERSION !== "1") return {};
	if (!/^[A-Za-z0-9_-]{43}$/.test(config.JWT_SECRET_KEY || "")) {
		throw new SetupError("Protected frontend session key is missing. Restore the original local installation configuration.");
	}
	// The existing Next auth route and middleware sign/verify PLS-SESSION at runtime.
	// Never pass database credentials or backend signing keys to the frontend process.
	return { JWT_SECRET_KEY: config.JWT_SECRET_KEY };
}
async function provisionStandalone({ input, gate, pendingFile, storage, run, persist = writeProtected, load = readProtected }) {
	// Authorization is deliberately first, before validation, disk writes, or driver loading.
	try { gate.authorize(input?.installationPassword); } catch (error) { throw new SetupError(error.message); }
	validateInitialInput(input);
	requireEncryption(storage);
	let state = fs.existsSync(pendingFile) ? load(pendingFile, storage) : null;
	if (state && (state.organizationName !== input.organizationName || state.host !== input.host || state.port !== input.port)) {
		throw new SetupError("A pending installation already owns these settings. Retry with its original organization and MySQL endpoint; do not replace existing databases.");
	}
	if (!state) {
		state = newInstallation(input);
		// Persist generated credentials before any MySQL side effect, so retries use the same account.
		persist(pendingFile, state, storage);
	}
	const result = await run({ state, admin: { host: input.host, port: Number(input.port), user: input.user, password: input.password } });
	if (!result || result.ready !== true) throw new SetupError("Local database provisioning did not reach readiness.");
	return { config: applicationConfig(state), adminUsername: `${state.organizationId}S001`, loginPassword: state.loginPassword };
}
module.exports = { validateInitialInput, newInstallation, applicationConfig, frontendRuntimeConfig, provisionStandalone };
