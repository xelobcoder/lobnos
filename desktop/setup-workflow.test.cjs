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

function harness(t, confirmation = 1, generic = false) {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), "pls-native-workflow-"));
	t.after(() => fs.rmSync(root, { recursive: true, force: true }));
	const resources = path.join(root, "resources");
	const configDir = path.join(resources, "runtime", "config");
	fs.mkdirSync(configDir, { recursive: true });
	const pem = generateKeyPairSync("ed25519").publicKey.export({ type: "spki", format: "pem" });
	let packagedBackend = genericConfig(pem, parse, verifier);
	if (!generic) {
		packagedBackend = packagedBackend.replace("PLS_DESKTOP_GENERIC=true", "PLS_DESKTOP_GENERIC=false") +
			"PLS_LICENSE_TENANT_ID=125\n";
	}
	fs.writeFileSync(path.join(configDir, "backend.env"), packagedBackend);
	fs.writeFileSync(path.join(configDir, "desktop.env"), "PLS_DESKTOP_MODE=standalone\n");
	const userData = path.join(root, "userData");
	fs.mkdirSync(path.join(userData, "config"), { recursive: true });
	fs.writeFileSync(path.join(userData, "config", "backend.env"),
		"PLS_LICENSE_MODE=legacy\nPLS_LICENSE_PUBLIC_KEY_FILE=evil.pem\nPLS_DESKTOP_STANDALONE=false\nMULTI_TENANT=true\nDEFAULT_TENANT_ID=999\nEXISTING_SECRET=preserve\n" +
		"DB_HOST=127.0.0.1\nDB_PORT=2309\nDB_USERNAME=root\nDB_PASSWORD=fixture-db-password\nDATABASE=primelabtestmig\n" +
		"PRODUCTION_DB_HOSTNAME=127.0.0.1\nPRODUCTION_DB_PORT=2309\nPRODUCTION_DB_USERNAME=root\nPRODUCTION_DB_PASSWORD=fixture-db-password\nPRODUCTION_DATABASE=primelabtestmig\n" +
		"SYSTEM_CONFIG_DB_HOST=localhost\nSYSTEM_CONFIG_DB_PORT=2309\nSYSTEM_CONFIG_DB_USERNAME=root\nSYSTEM_CONFIG_DB_PASSWORD=fixture-control-password\nSYSTEM_CONFIG_DATABASE=primelabmaster_control\nJWT_SECRET_KEY=fixture-frontend-secret\n");
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
		"\nglobalThis.testApi = { loadBackendEnvironment, loadDesktopConfig, setDesktopConfig: value => { desktopConfig = value; } };", context);
	const input = { installationPassword: "fixture-install-password-only" };
	return {
		api: context.testApi, handlers, windows, actions, queries, input, userData, pem,
		event: () => ({ sender: windows.at(-1).webContents, senderFrame: windows.at(-1).webContents.mainFrame }),
	};
}

test("pre-provisioned standalone starts without database setup or provisioning", async t => {
	const h = harness(t);
	const desktop = h.api.loadDesktopConfig();
	h.api.setDesktopConfig(desktop);
	assert.equal(desktop.PLS_DESKTOP_MODE, "standalone");
	const env = h.api.loadBackendEnvironment();
	assert.equal(env.PLS_LICENSE_MODE, "signed");
	assert.equal(env.PLS_LICENSE_PUBLIC_KEY, h.pem);
	assert.equal(env.PLS_LICENSE_PUBLIC_KEY_FILE, undefined);
	assert.equal(env.PLS_LICENSE_TENANT_ID, "125");
	assert.equal(env.DEFAULT_TENANT_ID, "125");
	assert.equal(env.MULTI_TENANT, "false");
	assert.equal(env.PLS_DESKTOP_STANDALONE, "true");
	assert.equal(env.DATABASE, "primelabtestmig");
	assert.equal(env.DB_PORT, "2309");
	assert.equal(env.DB_USERNAME, "root");
	assert.equal(env.PRODUCTION_DATABASE, "primelabtestmig");
	assert.equal(env.PRODUCTION_DB_PORT, "2309");
	assert.equal(env.PRODUCTION_DB_USERNAME, "root");
	assert.equal(env.JWT_SECRET_KEY, "fixture-frontend-secret");
	assert.equal(h.windows.length, 0);
	assert.equal(h.handlers.size, 0);
	assert.equal(h.queries.some(query => query && query.provisioning), false);
	assert.equal(fs.existsSync(path.join(h.userData, "config", "installation.json")), false);
});

test("legacy generic auto-provisioning configurations are refused, not run", async t => {
	const h = harness(t, 1, true);
	assert.throws(() => h.api.loadDesktopConfig(), /auto-provisioning has been retired/);
	assert.equal(h.windows.length, 0);
	assert.equal(h.queries.length, 0);
	assert.equal(fs.existsSync(path.join(h.userData, "config", "installation.json")), false);
});
