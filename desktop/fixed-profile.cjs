"use strict";
// Trusted standalone launcher only; facility/cloud profiles do not use this override.
const FIXED = Object.freeze({
	PRODUCTION_DB_HOSTNAME: "127.0.0.1", PRODUCTION_DB_PORT: "2309",
	PRODUCTION_DB_USERNAME: "primelab", PRODUCTION_DATABASE: "Primelabsys",
	DB_HOST: "127.0.0.1", DB_PORT: "2309", DB_USERNAME: "primelab", DATABASE: "Primelabsys",
	SYSTEM_CONFIG_DB_HOST: "127.0.0.1", SYSTEM_CONFIG_DB_PORT: "2309",
	SYSTEM_CONFIG_DB_USERNAME: "primelab", SYSTEM_CONFIG_DATABASE: "primelabmaster_control",
	MULTI_TENANT: "false", PLS_DESKTOP_STANDALONE: "true",
});
function enforceFixedProfile(config, packaged) {
	if (packaged.PLS_DESKTOP_GENERIC !== "true") return config;
	if (typeof config.PRODUCTION_DB_PASSWORD !== "string" || !config.PRODUCTION_DB_PASSWORD) {
		throw new Error("Protected existing MySQL credential is missing. Complete authorized local setup.");
	}
	return { ...config, ...FIXED, DB_PASSWORD: config.PRODUCTION_DB_PASSWORD,
		SYSTEM_CONFIG_DB_PASSWORD: config.PRODUCTION_DB_PASSWORD };
}
module.exports = { FIXED, enforceFixedProfile };
