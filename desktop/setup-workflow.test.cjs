"use strict";
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const vm = require("node:vm");
const { EventEmitter } = require("node:events");
const { generateKeyPairSync } = require("node:crypto");
const { parse } = require("dotenv");
const { genericConfig } = require("./generic-config.cjs");
const { createVerifier } = require("./setup-auth.cjs");
const secureStore = require("./secure-setup-store.cjs");
const verifier = createVerifier("fixture-install-password-only");
const storage = {
	isEncryptionAvailable: () => true,
	encryptString: value => Buffer.from(value.split("").reverse().join("")),
	decryptString: value => value.toString().split("").reverse().join(""),
};

function harness(t, confirmation = 1) {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), "pls-native-workflow-"));
	t.after(() => fs.rmSync(root, { recursive: true, force: true }));
	const resources = path.join(root, "resources");
	const configDir = path.join(resources, "runtime", "config");
	fs.mkdirSync(configDir, { recursive: true });
	const pem = generateKeyPairSync("ed25519").publicKey.export({ type: "spki", format: "pem" });
	fs.writeFileSync(path.join(configDir, "backend.env"), genericConfig(pem, parse, verifier));
	fs.writeFileSync(path.join(configDir, "desktop.env"), "PLS_DESKTOP_MODE=standalone\n");
	const userData = path.join(root, "userData");
	fs.mkdirSync(path.join(userData, "config"), { recursive: true });
	fs.writeFileSync(path.join(userData, "config", "backend.env"), "PLS_LICENSE_MODE=legacy\nPLS_LICENSE_PUBLIC_KEY_FILE=evil.pem\nPLS_DESKTOP_STANDALONE=false\nMULTI_TENANT=true\nDEFAULT_TENANT_ID=999\nEXISTING_SECRET=preserve\n");
	const handlers = new Map();
	const windows = [];
	const actions = [];
	class Window extends EventEmitter {
		constructor(options) {
			super();
			this.options = options;
			this.destroyed = false;
			this.webContents = new EventEmitter();
			this.webContents.mainFrame = { url: "" };
			this.webContents.setWindowOpenHandler = handler => { this.popupHandler = handler; };
			windows.push(this);
		}
		isDestroyed() { return this.destroyed; }
		async loadURL(url) { this.webContents.mainFrame.url = url; }
		close() { this.destroyed = true; this.emit("closed"); }
		focus() {}
	}
	const electron = {
		safeStorage: storage,
		app: { isPackaged: true, setName() {}, getPath: () => userData,
			requestSingleInstanceLock: () => false, quit: () => actions.push("quit"), relaunch: () => actions.push("relaunch") },
		BrowserWindow: Window,
		ipcMain: { handle: (name, fn) => handlers.set(name, fn), removeHandler: name => handlers.delete(name) },
		dialog: { showMessageBox: async () => ({ response: confirmation }) },
	};
	const queries = [];
	const mysql = {
		createConnection: async () => ({
			query: async query => queries.push(query.sql),
			execute: async (_query, args) => {
				queries.push(args);
				return [[{
					id: "PLS20154", tenant_number: 125, company_name: "Local lab",
					database_name: "facilitydb", status: "active", deleted_at: null,
				}]];
			},
			end: async () => {},
		}),
	};
	const context = {
		require: name => {
			if (name === "electron") return electron;
			if (name.endsWith(path.join("vendor", "dotenv"))) return { parse };
			if (name.endsWith(path.join("mysql2", "promise"))) return mysql;
			if (name === "./secure-setup-store.cjs") return {
				...secureStore, writeProtected: (file, config, storage) => secureStore.writeProtected(file, config, storage, () => {}),
			};
			if (name === "./standalone-setup.cjs") return {
				provisionStandalone: options => require("./standalone-setup.cjs").provisionStandalone({
					...options, persist: (file, config, storage) => secureStore.writeProtected(file, config, storage, () => {}),
				}),
			};
			if (name === "./provision-command.cjs") return { runProvisionCommand: async (_directory, request) => {
				queries.push({ provisioning: true, tenantId: request.state.tenantId });
				return { ready: true };
			} };
			return require(name);
		},
		__dirname, setImmediate,
		process: { ...process, resourcesPath: resources },
	};
	vm.createContext(context);
	vm.runInContext(fs.readFileSync(path.join(__dirname, "main.cjs"), "utf8") +
		"\nglobalThis.testApi = { openDatabaseSetup, ensureLocalSetup, loadBackendEnvironment, loadDesktopConfig };", context);
	const input = {
		organizationName: "Local lab", installationPassword: "fixture-install-password-only",
		host: "127.0.0.1", port: "3306", user: "localadmin", password: "fixture-admin-password",
	};
	return {
		api: context.testApi, handlers, windows, actions, queries, input, userData, pem,
		event: () => ({ sender: windows.at(-1).webContents, senderFrame: windows.at(-1).webContents.mainFrame }),
	};
}

test("first run waits for native setup, invalid input writes nothing, valid save pins policy without leaking passwords", async t => {
	const h = harness(t);
	let completed = false;
	const pending = h.api.ensureLocalSetup().then(() => { completed = true; });
	await new Promise(resolve => setImmediate(resolve));
	assert.equal(completed, false);
	const summary = h.handlers.get("pls-setup-summary")(h.event());
	assert.equal(summary.fields.password, "");
	assert.equal(summary.fields.controlPassword, undefined);
	assert.equal(summary.fields.database, undefined);
	const unauthorized = await h.handlers.get("pls-setup-save")(h.event(), { ...h.input, installationPassword: "incorrect" });
	assert.match(unauthorized.message, /Incorrect installation/);
	assert.equal(h.queries.length, 0);
	const rejected = await h.handlers.get("pls-setup-save")(h.event(), { ...h.input, organizationName: "" });
	assert.match(rejected.message, /Organization name/);
	assert.equal(h.queries.length, 0);
	assert.equal(fs.existsSync(path.join(h.userData, "config", "installation.json")), false);
	await assert.rejects(h.handlers.get("pls-setup-save")({ ...h.event(), sender: {} }, h.input), /Untrusted/);
	const result = await h.handlers.get("pls-setup-save")(h.event(), h.input);
	assert.doesNotMatch(JSON.stringify(result), /fixture-admin-password|fixture-install-password-only/);
	await pending;
	const env = h.api.loadBackendEnvironment();
	assert.equal(env.PLS_LICENSE_MODE, "signed");
	assert.equal(env.PLS_LICENSE_PUBLIC_KEY, h.pem);
	assert.equal(env.PLS_LICENSE_PUBLIC_KEY_FILE, undefined);
	assert.match(env.PLS_LICENSE_TENANT_ID, /^[1-9]\d{5}$/);
	assert.equal(env.DEFAULT_TENANT_ID, env.PLS_LICENSE_TENANT_ID);
	assert.equal(env.MULTI_TENANT, "false");
	assert.equal(env.PLS_DESKTOP_STANDALONE, "true");
	assert.match(env.PRODUCTION_DB_PASSWORD, /^[A-Za-z0-9_-]{43}$/);
	const disk = fs.readFileSync(path.join(h.userData, "config", "installation.json"), "utf8");
	assert.doesNotMatch(disk, /fixture-admin-password|fixture-install-password-only/);
	assert.equal(disk.includes(env.PRODUCTION_DB_PASSWORD), false);
	assert.equal(h.handlers.size, 0);
	assert.match(fs.readFileSync(path.join(h.userData, "config", "backend.env"), "utf8"), /EXISTING_SECRET=preserve/);
	assert.equal(h.windows[0].options.webPreferences.sandbox, true);
	assert.equal(h.windows[0].options.webPreferences.nodeIntegration, false);
	assert.equal(h.windows[0].popupHandler({ url: "https://remote.example" }).action, "deny");
});

test("canceling first run starts no backend and writes no installation settings", async t => {
	const h = harness(t);
	const pending = h.api.ensureLocalSetup();
	h.windows[0].close();
	await assert.rejects(pending, /setup was canceled/);
	assert.equal(fs.existsSync(path.join(h.userData, "config", "installation.json")), false);
});

test("repair menu requires confirmation before save/restart and keeps stored secrets out of summary", async t => {
	const h = harness(t);
	const pending = h.api.openDatabaseSetup();
	await h.handlers.get("pls-setup-save")(h.event(), h.input);
	assert.deepEqual(h.actions.slice(-2), ["relaunch", "quit"]);
	h.windows[0].close();
	await pending;
	const next = h.api.openDatabaseSetup();
	const summary = h.handlers.get("pls-setup-summary")(h.event());
	assert.equal(summary.fields.organizationName, "Local lab");
	assert.equal(summary.fields.tenant, undefined);
	assert.equal(summary.fields.password, "");
	assert.equal(summary.fields.controlPassword, undefined);
	h.windows[1].close();
	await next;
});

test("canceling restart preserves existing configuration", async t => {
	const h = harness(t, 0);
	const pending = h.api.openDatabaseSetup();
	const result = await h.handlers.get("pls-setup-save")(h.event(), h.input);
	assert.match(result.message, /No settings were changed/);
	assert.equal(fs.existsSync(path.join(h.userData, "config", "installation.json")), false);
	assert.deepEqual(h.actions, ["quit"]);
	h.windows[0].close();
	await pending;
});

test("generic desktop policy ignores user attempts to switch to a remote facility URL", t => {
	const h = harness(t);
	fs.writeFileSync(path.join(h.userData, "config", "desktop.env"), "PLS_DESKTOP_MODE=facility\nPLS_FACILITY_URL=https://remote.example\n");
	assert.equal(h.api.loadDesktopConfig().PLS_DESKTOP_MODE, "standalone");
});
