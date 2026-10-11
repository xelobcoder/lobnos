"use strict";

const fs = require("node:fs");
const path = require("node:path");
const { parse } = require("dotenv");
const { validateLicensePolicy } = require("../license-policy.cjs");
const { assertGenericConfig, assertGenericReleaseConfig } = require("../generic-config.cjs");

const frontendRoot = path.resolve(__dirname, "..", "..");
const runtimeRoot = path.join(frontendRoot, ".desktop-runtime");
const requiredFiles = [
	path.join(runtimeRoot, "frontend", "server.js"),
	path.join(runtimeRoot, "frontend", ".next", "static"),
	path.join(runtimeRoot, "frontend", "vendor", "next"),
	path.join(runtimeRoot, "backend", "dist", "src", "start.js"),
	path.join(runtimeRoot, "backend", "vendor", "bcrypt"),
	path.join(runtimeRoot, "backend", "vendor", "dotenv"),
	path.join(runtimeRoot, "config", "backend.env"),
	path.join(runtimeRoot, "config", "desktop.env"),
];

const missing = requiredFiles.filter((target) => !fs.existsSync(target));
if (missing.length > 0) {
	process.stderr.write(`Desktop runtime is incomplete:\n${missing.join("\n")}\n`);
	process.exit(1);
}

const forbiddenFiles = [
	path.join(runtimeRoot, "backend", ".env"),
	path.join(runtimeRoot, "backend", "src"),
];
const leaked = forbiddenFiles.filter((target) => fs.existsSync(target));
if (leaked.length > 0) {
	process.stderr.write(`Desktop runtime contains development or secret files:\n${leaked.join("\n")}\n`);
	process.exit(1);
}

const backendConfigContent = fs.readFileSync(path.join(runtimeRoot, "config", "backend.env"), "utf8");
if (/-----BEGIN (?:[A-Z]+ )*PRIVATE KEY-----/.test(backendConfigContent)) {
	throw new Error("Staged backend configuration contains a private key. Never distribute license-signing keys.");
}

const frontendServer = fs.readFileSync(requiredFiles[0], "utf8");
if (!frontendServer.includes("next")) {
	throw new Error("Frontend runtime is not a Next.js standalone SSR server.");
}

const desktopConfig = parse(
	fs.readFileSync(path.join(runtimeRoot, "config", "desktop.env"), "utf8"),
);
const desktopMode = desktopConfig.PLS_DESKTOP_MODE || "standalone";
if (desktopMode !== "standalone" && desktopMode !== "facility") {
	throw new Error("Staged PLS_DESKTOP_MODE must be standalone or facility.");
}
if (desktopMode === "facility") {
	const facilityUrl = new URL(desktopConfig.PLS_FACILITY_URL || "");
	const allowHttp = desktopConfig.PLS_FACILITY_ALLOW_HTTP === "true";
	const validProtocol =
		facilityUrl.protocol === "https:" ||
		(allowHttp && facilityUrl.protocol === "http:");
	if (!validProtocol || facilityUrl.username || facilityUrl.password) {
		throw new Error(
			"Staged facility mode requires HTTPS, or HTTP when PLS_FACILITY_ALLOW_HTTP=true, without credentials.",
		);
	}
} else {
	if (parse(backendConfigContent).PLS_DESKTOP_GENERIC === "true") assertGenericConfig(parse(backendConfigContent));
	if (validateLicensePolicy(parse(backendConfigContent)) === "signed" &&
		!fs.existsSync(path.join(runtimeRoot, "backend", "dist", "src", "scripts", "license.js"))) {
		throw new Error("Signed runtime is missing the compiled licensing CLI. Rebuild and prepare the runtime.");
	}
}

if (parse(backendConfigContent).PLS_DESKTOP_GENERIC === "true") {
	assertGenericReleaseConfig(parse(backendConfigContent));
	for (const filename of ["standalone-setup.js"]) {
		if (!fs.existsSync(path.join(runtimeRoot, "backend", "dist", "src", "scripts", filename))) {
			throw new Error("Generic runtime is missing the compiled standalone provisioning pipeline.");
		}
	}
	require(path.join(runtimeRoot, "backend", "dist", "src", "models", "Tenancy", "FacilityStructureExports.js")).loadFacilityStructureExports();
	const seeds = ["samplecontainer", "sampletype", "testdetailcategory", "test_panels", "testdetails",
		"testcreationrules", "testconditiondefinitions", "testconditions", "test_report_settings"];
	for (const name of seeds) {
		if (!fs.existsSync(path.join(runtimeRoot, "backend", "db-exports", "primelabmaster", "seeds", `primelabmaster_${name}.sql`))) {
			throw new Error("Generic runtime is missing reviewed reference catalog assets.");
		}
	}
	const pending = [runtimeRoot];
	while (pending.length) {
		const directory = pending.pop();
		for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
			const target = path.join(directory, entry.name);
			if (entry.isDirectory()) pending.push(target);
			else if (/^\.env(?:\.|$)|^(?:issuer(?:-private|-public)?\.(?:pem|cjs)|license-state\.json|activation-request\.json|signed-certificate\.json)$/i.test(entry.name)) {
				throw new Error("Generic runtime contains environment, issuer or installation-state files.");
			}
		}
	}
	const serverConfig = frontendServer.slice(frontendServer.indexOf("const nextConfig"));
	if (/"(?:NEXT_PUBLIC_ACCESS_TOKEN|HASH_SECRET|JWT_SECRET_KEY)"\s*:/.test(serverConfig)) {
		throw new Error("Generic frontend runtime contains historical embedded token settings.");
	}
}

process.stdout.write(`Desktop runtime verification passed (${desktopMode} mode).\n`);
