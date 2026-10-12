"use strict";
const crypto = require("node:crypto");
const fs = require("node:fs");
const { SetupError, facilityCodeBase } = require("./setup-config.cjs");
const { writeProtected, readProtected, requireEncryption } = require("./secure-setup-store.cjs");

// Everything except the installation authorization password is fixed/defaulted so the
// customer never has to supply a database name, host, port, account, or admin credentials.
// Organization name and the initial administrator login are simple defaults that can be
// changed from within the application after first login.
const DEFAULT_ORGANIZATION_NAME = "Prime Laboratory Software";
const DEFAULT_LOGIN_PASSWORD = "12345";
const LOCAL_HOST = "127.0.0.1";
const LOCAL_PORT = "2309";
const LOCAL_ACCOUNT = "primelab";

function validateInitialInput(input) {
	const fields = ["installationPassword"];
	if (!input || typeof input !== "object" || Array.isArray(input) ||
		Object.keys(input).some(key => !fields.includes(key))) throw new SetupError("Invalid standalone setup fields.");
	for (const field of fields) {
		if (typeof input[field] !== "string" || input[field].length > 256 || /[\r\n\0]/.test(input[field])) {
			throw new SetupError("Invalid standalone setup value.");
		}
	}
	return input;
}
function newInstallation() {
	const installationId = crypto.randomBytes(16).toString("hex");
	const secret = () => crypto.randomBytes(32).toString("base64url");
	const tenantId = String(crypto.randomInt(100000, 1000000));
	return {
		version: 1, installationId, organizationName: DEFAULT_ORGANIZATION_NAME, host: LOCAL_HOST, port: LOCAL_PORT,
		account: LOCAL_ACCOUNT, accountPassword: secret(),
		tenantId, organizationId: `LOCAL${tenantId}`, facilityCode: facilityCodeBase(DEFAULT_ORGANIZATION_NAME),
		loginPassword: DEFAULT_LOGIN_PASSWORD, jwtSecret: secret(), windowKey: secret(), frontendJwtSecret: secret(),
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
	// A pending installation always has the same fixed organization/host/port/account, so
	// any existing pending state is simply reused as-is to retry with the same credentials.
	let state = fs.existsSync(pendingFile) ? load(pendingFile, storage) : null;
	if (!state) {
		state = newInstallation();
		// Persist generated credentials before any MySQL side effect, so retries use the same account.
		persist(pendingFile, state, storage);
	}
	const result = await run({ state });
	if (!result || result.ready !== true) throw new SetupError("Local database provisioning did not reach readiness.");
	return { config: applicationConfig(state), adminUsername: `${state.organizationId}S001`, loginPassword: state.loginPassword };
}
module.exports = { validateInitialInput, newInstallation, applicationConfig, frontendRuntimeConfig, provisionStandalone };
