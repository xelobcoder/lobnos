"use strict";

const { spawnSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");
const { parse } = require("dotenv");

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
		shell: process.platform === "win32",
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

requirePath(path.join(backendRoot, "package.json"), "lobnos-server sibling project");

if (!skipBuild) {
	run(pnpmCommand, ["run", "build"], backendRoot);
	run(pnpmCommand, ["run", "build"], frontendRoot, {
		NODE_ENV: "production",
		PRODUCTION_BASEURL: "http://127.0.0.1:2300/api/v1/",
	});
}

requirePath(path.join(frontendRoot, ".next", "standalone", "server.js"), "Next.js standalone server");
requirePath(path.join(backendRoot, "dist", "src", "start.js"), "Compiled lobnos-server entry point");

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
fs.mkdirSync(configRuntime, { recursive: true });
fs.copyFileSync(configSource, path.join(configRuntime, "backend.env"));
fs.copyFileSync(
	desktopConfigPath,
	path.join(configRuntime, "desktop.env"),
);

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

const backendNodeModules = path.join(backendRuntime, "node_modules");
const backendVendor = path.join(backendRuntime, "vendor");
requirePath(backendNodeModules, "Backend production dependencies");
fs.renameSync(backendNodeModules, backendVendor);

process.stdout.write(`Desktop runtime prepared at ${runtimeRoot}\n`);
