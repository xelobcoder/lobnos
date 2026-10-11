"use strict";

const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

function createMenuHarness(mode = "standalone", importSize = 1024, canceled = false) {
	let template;
	const operations = [];
	const messages = [];
	const userData = path.resolve("test-user-data");
	const window = { setMenuBarVisibility: (visible) => operations.push({ visible }) };
	const electron = {
		app: {
			setName() {},
			getPath: () => userData,
			isPackaged: false,
			requestSingleInstanceLock: () => false,
			quit() {},
		},
		Menu: {
			buildFromTemplate: (value) => value,
			setApplicationMenu: (value) => { template = value; },
		},
		dialog: {
			showSaveDialog: async () => ({ canceled, filePath: path.resolve("request.json") }),
			showOpenDialog: async () => ({ canceled, filePaths: [path.resolve("license.json")] }),
			showMessageBox: async (_window, message) => { messages.push(message); },
		},
	};
	const fileSystem = {
		mkdirSync() {},
		existsSync: target => !String(target).endsWith("installation.json"),
		readFileSync: () => "production config",
		statSync: () => ({ size: importSize }),
	};
	const context = {
		require: (name) => {
			if (name === "electron") return electron;
			if (name === "node:fs") return fileSystem;
			if (name === "./license-commands.cjs") return {
				runLicenseCommand: async (options, command, filePath) => operations.push({ options, command, filePath }),
			};
			if (name.endsWith(path.join("vendor", "dotenv"))) return {
				parse: () => ({ PLS_LICENSE_TENANT_ID: "990556", PLS_LICENSE_STORAGE_DIR: "unsafe-build-path" }),
			};
			return require(name);
		},
		__dirname: __dirname,
		process: { ...process, stdout: { write() {} } },
		testWindow: window,
		testMode: mode,
	};
	vm.createContext(context);
	vm.runInContext(fs.readFileSync(path.join(__dirname, "main.cjs"), "utf8") +
		"\nmainWindow = testWindow; desktopConfig = { PLS_DESKTOP_MODE: testMode }; configureLicenseMenu();", context);
	return { template, operations, messages, userData };
}

async function flush() {
	await new Promise((resolve) => setImmediate(resolve));
}

test("facility clients do not get local activation controls", () => {
	const harness = createMenuHarness("facility");
	assert.equal(harness.template, undefined);
});

test("export uses persistent per-installation storage instead of bundled state", async () => {
	const harness = createMenuHarness();
	harness.template[0].submenu[0].click();
	await flush();
	const operation = harness.operations.find((entry) => entry.command);
	assert.equal(operation.command, "request");
	assert.equal(operation.options.env.PLS_LICENSE_STORAGE_DIR, path.join(harness.userData, "licensing"));
	assert.equal(operation.options.env.PLS_LICENSE_TENANT_ID, "990556");
	assert.equal(harness.messages[0].type, "info");
});

test("signed import uses main-process native dialog and reports success", async () => {
	const harness = createMenuHarness();
	harness.template[0].submenu[1].click();
	await flush();
	assert.equal(harness.operations.find((entry) => entry.command).command, "activate");
	assert.match(harness.messages[0].message, /Restart PLS/);
});

test("oversized license never launches the activation CLI", async () => {
	const harness = createMenuHarness("standalone", 64 * 1024 + 1);
	harness.template[0].submenu[1].click();
	await flush();
	assert.equal(harness.operations.filter((entry) => entry.command).length, 0);
	assert.equal(harness.messages[0].type, "error");
	assert.match(harness.messages[0].message, /64 KB/);
});

test("canceling a native dialog makes no changes or success notification", async () => {
	const harness = createMenuHarness("standalone", 1024, true);
	harness.template[0].submenu[0].click();
	await flush();
	harness.template[0].submenu[1].click();
	await flush();
	assert.equal(harness.operations.filter((entry) => entry.command).length, 0);
	assert.equal(harness.messages.length, 0);
});

test("repeated clicks cannot launch concurrent activation operations", async () => {
	const harness = createMenuHarness();
	harness.template[0].submenu[0].click();
	harness.template[0].submenu[1].click();
	await flush();
	assert.equal(harness.operations.filter((entry) => entry.command).length, 1);
});
