"use strict";

const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const vm = require("node:vm");

function createHarness(t, { mode = "standalone", licenseMode = "signed", failActivation = false } = {}) {
	const userData = fs.mkdtempSync(path.join(os.tmpdir(), "pls-hidden-license-controls-"));
	t.after(() => fs.rmSync(userData, { recursive: true, force: true }));
	const applicationMenus = [];
	const windowOperations = [];
	const commands = [];
	const logs = [];
	const testWindow = {
		isDestroyed: () => false,
		setMenuBarVisibility: visible => windowOperations.push({ visible }),
		setAutoHideMenuBar: enabled => windowOperations.push({ autoHide: enabled }),
	};
	const electron = {
		app: {
			setName() {},
			setPath() {},
			getPath: () => userData,
			isPackaged: false,
			requestSingleInstanceLock: () => false,
			quit() {},
		},
		BrowserWindow: class {},
		Menu: { setApplicationMenu: menu => applicationMenus.push(menu) },
		shell: { openExternal() {} },
	};
	const processMock = {
		...process,
		stdout: { write: message => logs.push(message) },
		resourcesPath: userData,
	};
	const context = {
		require: name => {
			if (name === "electron") return electron;
			if (name === "./license-commands.cjs") return {
				runLicenseCommand: async (options, command, filePath) => {
					commands.push({ options, command, filePath });
					if (command === "request") {
						fs.writeFileSync(filePath, JSON.stringify({ version: 1, tenantId: 990556 }));
					} else if (failActivation) {
						throw new Error("Signed certificate rejected.");
					}
				},
			};
			return require(name);
		},
		__dirname,
		process: processMock,
		testWindow,
		testMode: mode,
		testLicenseMode: licenseMode,
	};
	vm.createContext(context);
	vm.runInContext(fs.readFileSync(path.join(__dirname, "main.cjs"), "utf8") +
		"\nmainWindow = testWindow; desktopConfig = { PLS_DESKTOP_MODE: testMode }; " +
		"hideDesktopMenus(); globalThis.prepareFiles = prepareOfflineLicenseFiles;", context);
	return {
		prepareFiles: context.prepareFiles,
		applicationMenus,
		windowOperations,
		commands,
		logs,
		userData,
	};
}

test("desktop application menu and window menu bar are hidden", t => {
	const harness = createHarness(t);
	assert.deepEqual(harness.applicationMenus, [null]);
	assert.deepEqual(harness.windowOperations, [{ visible: false }, { autoHide: true }]);
});

test("signed standalone writes an activation request into the per-user config folder", async t => {
	const harness = createHarness(t);
	const backendDirectory = path.join(harness.userData, "runtime", "backend");
	const env = { PLS_LICENSE_MODE: "signed", PLS_LICENSE_TENANT_ID: "990556" };
	await harness.prepareFiles(backendDirectory, env);
	const requestPath = path.join(harness.userData, "config", "PLS-activation-request.json");
	assert.equal(fs.existsSync(requestPath), true);
	assert.equal(harness.commands.length, 1);
	assert.equal(harness.commands[0].command, "request");
	assert.equal(harness.commands[0].filePath, requestPath);
	assert.equal(harness.commands[0].options.env.NODE_PATH, path.join(backendDirectory, "vendor"));
	await harness.prepareFiles(backendDirectory, env);
	assert.equal(harness.commands.length, 1);
});

test("signed certificate is imported from config folder and removed only after success", async t => {
	const harness = createHarness(t);
	const configDirectory = path.join(harness.userData, "config");
	fs.mkdirSync(configDirectory, { recursive: true });
	const certificatePath = path.join(configDirectory, "PLS-signed-certificate.json");
	fs.writeFileSync(certificatePath, JSON.stringify({ payload: {}, signature: "fixture" }));
	await harness.prepareFiles(path.join(harness.userData, "runtime", "backend"),
		{ PLS_LICENSE_MODE: "signed", PLS_LICENSE_TENANT_ID: "990556" });
	assert.equal(harness.commands.some(command => command.command === "activate"), true);
	assert.equal(fs.existsSync(certificatePath), false);
});

test("failed certificate import is logged and the certificate remains available", async t => {
	const harness = createHarness(t, { failActivation: true });
	const configDirectory = path.join(harness.userData, "config");
	fs.mkdirSync(configDirectory, { recursive: true });
	const certificatePath = path.join(configDirectory, "PLS-signed-certificate.json");
	fs.writeFileSync(certificatePath, JSON.stringify({ payload: {}, signature: "fixture" }));
	await harness.prepareFiles(path.join(harness.userData, "runtime", "backend"),
		{ PLS_LICENSE_MODE: "signed", PLS_LICENSE_TENANT_ID: "990556" });
	assert.equal(fs.existsSync(certificatePath), true);
	assert.equal(harness.logs.some(line => line.includes("Signed certificate rejected.")), true);
});

test("facility and legacy modes do not create local activation files", async t => {
	const facility = createHarness(t, { mode: "facility" });
	await facility.prepareFiles(path.join(facility.userData, "runtime", "backend"),
		{ PLS_LICENSE_MODE: "signed" });
	assert.equal(fs.existsSync(path.join(facility.userData, "config")), false);

	const legacy = createHarness(t, { licenseMode: "legacy" });
	await legacy.prepareFiles(path.join(legacy.userData, "runtime", "backend"),
		{ PLS_LICENSE_MODE: "legacy" });
	assert.equal(fs.existsSync(path.join(legacy.userData, "config")), false);
});
