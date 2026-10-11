"use strict";

const { spawn } = require("node:child_process");
const path = require("node:path");

function runLicenseCommand(options, command, filePath, spawnProcess = spawn) {
	if (!["request", "activate"].includes(command)) {
		return Promise.reject(new Error("Unsupported license command."));
	}
	const tenantId = Number(options.env.PLS_LICENSE_TENANT_ID);
	if (!Number.isSafeInteger(tenantId) || tenantId <= 0) {
		return Promise.reject(new Error("Set PLS_LICENSE_TENANT_ID to the licensed facility's tenant ID in backend.env."));
	}
	if (!path.isAbsolute(filePath)) {
		return Promise.reject(new Error("Select an absolute activation file path."));
	}

	return new Promise((resolve, reject) => {
		const child = spawnProcess(options.executable, [
			"--require", options.resolver,
			path.join(options.backendDirectory, "dist", "src", "scripts", "license.js"),
			command, "--tenant-id", String(tenantId),
			command === "request" ? "--output" : "--file", filePath,
		], {
			cwd: options.backendDirectory,
			env: { ...options.env, ELECTRON_RUN_AS_NODE: "1" },
			stdio: ["ignore", "pipe", "pipe"],
			windowsHide: true,
			shell: false,
		});
		let errorOutput = "";
		let outputBytes = 0;
		let failed = false;
		const timeout = setTimeout(() => {
			failed = true;
			child.kill();
			reject(new Error("License operation timed out."));
		}, 30_000);
		const capture = (data, isError) => {
			outputBytes += data.length;
			if (outputBytes > 64 * 1024 && !failed) {
				failed = true;
				child.kill();
				clearTimeout(timeout);
				reject(new Error("License operation returned excessive output."));
			}
			if (isError && !failed) errorOutput += data.toString();
		};
		child.stdout.on("data", (data) => capture(data, false));
		child.stderr.on("data", (data) => capture(data, true));
		child.once("error", (error) => {
			clearTimeout(timeout);
			failed = true;
			reject(error);
		});
		child.once("close", (code) => {
			clearTimeout(timeout);
			if (failed) return;
			if (code !== 0) {
				reject(new Error(errorOutput.trim() || `License operation failed (exit code ${code}).`));
				return;
			}
			resolve();
		});
	});
}

module.exports = { runLicenseCommand };
