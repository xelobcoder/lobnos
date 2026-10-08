"use strict";

const fs = require("node:fs");
const path = require("node:path");
const { parse } = require("dotenv");

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
}

process.stdout.write(`Desktop runtime verification passed (${desktopMode} mode).\n`);
