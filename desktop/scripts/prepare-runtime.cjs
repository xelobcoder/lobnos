"use strict";

const { spawnSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");
const { parse } = require("dotenv");
const { pruneRuntimeSources } = require("./prune-runtime-sources.cjs");
const { validateLicensePolicy } = require("../license-policy.cjs");

const frontendRoot = path.resolve(__dirname, "..", "..");
const backendRoot = path.resolve(
	process.env.PLS_SERVER_DIR || path.join(frontendRoot, "..", "lobnos-server"),
);
const runtimeRoot = path.join(frontendRoot, ".desktop-runtime");
const frontendRuntime = path.join(runtimeRoot, "frontend");
const backendRuntime = path.join(runtimeRoot, "backend");
const configRuntime = path.join(runtimeRoot, "config");
const skipBuild = process.argv.includes("--skip-build");
const requireConfig = process.argv.includes("--require-config");
const pnpmCommand = "pnpm";

function run(command, args, cwd, env = {}) {
	const result = spawnSync(command, args, {
		cwd,
		env: { ...process.env, ...env },
		stdio: "inherit",
		// Keep Node's executable path with spaces out of cmd.exe; only the pnpm shim
		// requires a Windows shell for command resolution.
		shell: process.platform === "win32" && command === pnpmCommand,
	});
	if (result.error) {
		throw result.error;
	}
	if (result.status !== 0) {
		throw new Error(`${command} ${args.join(" ")} failed with exit code ${result.status}`);
	}
}

function requirePath(target, description) {
	if (!fs.existsSync(target)) {
		throw new Error(`${description} was not found at ${target}`);
	}
}

function copyDirectory(source, destination) {
	requirePath(source, "Required build output");
	fs.cpSync(source, destination, { recursive: true, force: true });
}

requirePath(path.join(backendRoot, "package.json"), "PLS backend sibling project");
const requestedBackendConfig = process.env.PLS_DESKTOP_BACKEND_ENV ||
	path.join(frontendRoot, "desktop", "config", "backend.env");
const genericBuildRequested = fs.existsSync(requestedBackendConfig) &&
	parse(fs.readFileSync(requestedBackendConfig, "utf8")).PLS_DESKTOP_GENERIC === "true";
if (genericBuildRequested) {
	throw new Error("Generic standalone auto-provisioning has been retired. Provision the local database first and package a facility-specific desktop.");
}

if (!skipBuild) {
	run(pnpmCommand, ["run", "build"], backendRoot);
	run(pnpmCommand, ["run", "build"], frontendRoot, {
		NODE_ENV: "production",
		PRODUCTION_BASEURL: "http://127.0.0.1:2300/api/v1/",
	});
}

requirePath(path.join(frontendRoot, ".next", "standalone", "server.js"), "Next.js standalone server");
requirePath(path.join(backendRoot, "dist", "src", "start.js"), "Compiled PLS backend entry point");

fs.rmSync(runtimeRoot, { recursive: true, force: true });
fs.mkdirSync(runtimeRoot, { recursive: true });

copyDirectory(path.join(frontendRoot, ".next", "standalone"), frontendRuntime);
copyDirectory(path.join(frontendRoot, ".next", "static"), path.join(frontendRuntime, ".next", "static"));
if (fs.existsSync(path.join(frontendRoot, "public"))) {
	copyDirectory(path.join(frontendRoot, "public"), path.join(frontendRuntime, "public"));
}
const frontendNodeModules = path.join(frontendRuntime, "node_modules");
const frontendVendor = path.join(frontendRuntime, "vendor");
requirePath(frontendNodeModules, "Next.js standalone dependencies");
fs.renameSync(frontendNodeModules, frontendVendor);
pruneRuntimeSources(frontendVendor);

fs.mkdirSync(backendRuntime, { recursive: true });
for (const fileName of ["package.json", "pnpm-lock.yaml", "pnpm-workspace.yaml"]) {
	fs.copyFileSync(path.join(backendRoot, fileName), path.join(backendRuntime, fileName));
}
const stagedWorkspacePath = path.join(backendRuntime, "pnpm-workspace.yaml");
const stagedWorkspace = fs.readFileSync(stagedWorkspacePath, "utf8");
fs.writeFileSync(stagedWorkspacePath, `nodeLinker: hoisted\n${stagedWorkspace}`);
run(
	pnpmCommand,
	["install", "--prod", "--frozen-lockfile", "--ignore-scripts"],
	backendRuntime,
);
copyDirectory(path.join(backendRoot, "dist"), path.join(backendRuntime, "dist"));
if (fs.existsSync(path.join(backendRoot, "public"))) {
	copyDirectory(path.join(backendRoot, "public"), path.join(backendRuntime, "public"));
}

const packagedConfig =
	process.env.PLS_DESKTOP_BACKEND_ENV ||
	path.join(frontendRoot, "desktop", "config", "backend.env");
const desktopConfigSource =
	process.env.PLS_DESKTOP_CONFIG ||
	path.join(frontendRoot, "desktop", "config", "desktop.env");
const desktopConfigExample = path.join(
	frontendRoot,
	"desktop",
	"config",
	"desktop.env.example",
);
const desktopConfigPath = fs.existsSync(desktopConfigSource)
	? desktopConfigSource
	: desktopConfigExample;
const desktopConfigContent = fs.readFileSync(desktopConfigPath, "utf8");
const desktopConfig = parse(desktopConfigContent);
const desktopMode = desktopConfig.PLS_DESKTOP_MODE || "standalone";
if (desktopMode !== "standalone" && desktopMode !== "facility") {
	throw new Error("PLS_DESKTOP_MODE must be standalone or facility.");
}
const isFacilityMode = desktopMode === "facility";
if (isFacilityMode) {
	if (!desktopConfig.PLS_FACILITY_URL) {
		throw new Error(
			"PLS_FACILITY_URL is required when PLS_DESKTOP_MODE is facility.",
		);
	}
	const facilityUrl = new URL(desktopConfig.PLS_FACILITY_URL);
	const allowHttp = desktopConfig.PLS_FACILITY_ALLOW_HTTP === "true";
	const validProtocol =
		facilityUrl.protocol === "https:" ||
		(allowHttp && facilityUrl.protocol === "http:");
	if (!validProtocol || facilityUrl.username || facilityUrl.password) {
		throw new Error(
			"PLS_FACILITY_URL must use HTTPS, or HTTP when PLS_FACILITY_ALLOW_HTTP=true, without credentials.",
		);
	}
}
if (requireConfig && !isFacilityMode && !fs.existsSync(packagedConfig)) {
	throw new Error(
		"A production backend configuration is required for standalone installers. Create desktop/config/backend.env or set PLS_DESKTOP_BACKEND_ENV.",
	);
}
const configSource = !isFacilityMode && fs.existsSync(packagedConfig)
	? packagedConfig
	: path.join(frontendRoot, "desktop", "config", "backend.env.example");
const backendConfigContent = fs.readFileSync(configSource, "utf8");
if (/-----BEGIN (?:[A-Z]+ )*PRIVATE KEY-----/.test(backendConfigContent)) {
	throw new Error("Backend installer configuration must never contain a license-signing private key.");
}
if (!isFacilityMode) {
	if (validateLicensePolicy(parse(backendConfigContent)) === "signed") {
		requirePath(path.join(backendRuntime, "dist", "src", "scripts", "license.js"), "Compiled signed licensing CLI");
	}
}
fs.mkdirSync(configRuntime, { recursive: true });
const installerVerifierPath = process.env.PLS_INSTALLER_VERIFIER_FILE;
if (!installerVerifierPath || !fs.existsSync(installerVerifierPath)) {
	throw new Error("Windows installer authorization is not configured. Run desktop:configure-install-password, then desktop:build:licensed from the backend.");
}
const installerVerifier = JSON.parse(fs.readFileSync(installerVerifierPath, "utf8"));
if (installerVerifier.version !== 1 || installerVerifier.algorithm !== "pbkdf2-sha256" ||
	installerVerifier.iterations !== 600000 ||
	Buffer.from(installerVerifier.salt || "", "base64").length !== 32 ||
	Buffer.from(installerVerifier.hash || "", "base64").length !== 32 ||
	Object.keys(installerVerifier).some(key => !["version", "algorithm", "iterations", "salt", "hash"].includes(key))) {
	throw new Error("Invalid Windows installer authorization verifier.");
}
fs.writeFileSync(path.join(configRuntime, "installer-verifier.json"), JSON.stringify(installerVerifier));
fs.copyFileSync(configSource, path.join(configRuntime, "backend.env"));
fs.copyFileSync(
	desktopConfigPath,
	path.join(configRuntime, "desktop.env"),
);

const bcryptModuleDir = path.join(backendRuntime, "node_modules", "bcrypt");
const bcryptNativeBuildFile = path.join(bcryptModuleDir, "binding.gyp");
if (fs.existsSync(bcryptNativeBuildFile)) {
	run(
		pnpmCommand,
		[
			"exec",
			"electron-rebuild",
			"--force",
			"--only",
			"bcrypt",
			"--module-dir",
			backendRuntime,
		],
		frontendRoot,
	);
}

const backendNodeModules = path.join(backendRuntime, "node_modules");
const backendVendor = path.join(backendRuntime, "vendor");
requirePath(backendNodeModules, "Backend production dependencies");
fs.renameSync(backendNodeModules, backendVendor);
pruneRuntimeSources(backendVendor);

run(process.execPath, [path.join(__dirname, "verify-runtime.cjs")], frontendRoot);
process.stdout.write(`Desktop runtime prepared at ${runtimeRoot}\n`);
