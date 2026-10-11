"use strict";
const { spawn } = require("node:child_process");
const path = require("node:path");
const { SetupError } = require("./setup-config.cjs");

function runProvisionCommand(backendDirectory, request, dependencies = {}) {
	return new Promise((resolve, reject) => {
		const child = (dependencies.spawn || spawn)(process.execPath,
			[path.join(backendDirectory, "dist", "src", "scripts", "standalone-setup.js")], {
				cwd: backendDirectory, windowsHide: true, shell: false,
				env: { ...process.env, ELECTRON_RUN_AS_NODE: "1",
					NODE_PATH: path.join(backendDirectory, "vendor"), PLS_VENDOR_PATH: path.join(backendDirectory, "vendor") },
				stdio: ["pipe", "pipe", "pipe"],
			});
		if (dependencies.onChild) dependencies.onChild(child);
		let output = "", settled = false;
		const fail = () => {
			if (settled) return;
			settled = true;
			clearTimeout(timer);
			reject(new SetupError("Local provisioning command failed or timed out. Keep the saved installation state and retry; no readiness was reported."));
		};
		const timer = setTimeout(() => { child.kill(); fail(); }, dependencies.timeout || 15 * 60 * 1000);
		child.on("error", fail);
		child.stdin.on("error", fail);
		child.stderr.on("data", () => {}); // Never forward legacy driver diagnostics.
		child.stdout.on("data", chunk => {
			output += chunk.toString("utf8");
			if (Buffer.byteLength(output) > 16384) { child.kill(); fail(); }
		});
		child.on("close", code => {
			if (settled) return;
			clearTimeout(timer);
			try {
				const result = JSON.parse(output);
				if (code !== 0 || result.ready !== true) {
					settled = true;
					reject(new SetupError(typeof result.message === "string" && result.message.length < 1024
						? result.message : "Local provisioning failed; readiness was not reached."));
					return;
				}
				settled = true;
				resolve({ ready: true });
			} catch { fail(); }
		});
		// Provisioning state travels only over the anonymous stdin pipe.
		child.stdin.end(JSON.stringify(request));
	});
}
module.exports = { runProvisionCommand };
