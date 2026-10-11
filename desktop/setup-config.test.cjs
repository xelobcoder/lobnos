"use strict";
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { validateSetup, setupSummary, saveSetup, readSetup, testConnections, trustedSender } = require("./setup-config.cjs");

const valid = () => ({
	organizationName: "Local Diagnostic Laboratory",
	host: "db.local", port: "3306", user: "tenant_user",
	password: "sensitive#'\"`\\password", database: "PLS00125",
	controlHost: "control.local", controlPort: "3307", controlUser: "registry_user",
	controlPassword: "control-secret", controlDatabase: "primelabmaster_control",
});

test("setup has no tenant input and validates organization and database settings", () => {
	const config = validateSetup(valid());
	assert.equal(config.PLS_DESKTOP_STANDALONE, "true");
	assert.equal(config.MULTI_TENANT, "false");
	assert.equal(config.LOCAL_ORGANIZATION_NAME, "Local Diagnostic Laboratory");
	for (const [field, value] of [["organizationName", ""], ["organizationName", "x".repeat(101)],
		["tenant", "125"], ["port", "0"], ["controlPort", "65536"], ["host", "mysql://db"],
		["database", "db;DROP"], ["user", ""], ["password", "secret\n"]]) {
		assert.throws(() => validateSetup({ ...valid(), [field]: value }));
	}
	assert.throws(() => validateSetup({ ...valid(), PLS_LICENSE_MODE: "legacy" }));
	assert.throws(() => validateSetup(valid(), {}, "invalid"));
	assert.equal(validateSetup(valid(), {}, "125").PLS_LICENSE_TENANT_ID, "125");
});

test("blank passwords preserve existing secrets; summaries never disclose them", () => {
	const config = validateSetup(valid());
	const updated = validateSetup({ ...valid(), password: "", controlPassword: "" }, config);
	assert.equal(updated.PRODUCTION_DB_PASSWORD, config.PRODUCTION_DB_PASSWORD);
	assert.equal(updated.SYSTEM_CONFIG_DB_PASSWORD, config.SYSTEM_CONFIG_DB_PASSWORD);
	assert.equal(setupSummary(config).password, "");
	assert.equal(setupSummary(config).controlPassword, "");
	assert.throws(() => validateSetup({ ...valid(), password: "" }), /password: a value is required/);
});

test("atomic protected storage preserves compatibility and backend.env without plaintext credential writes", () => {
	const dir = fs.mkdtempSync(path.join(os.tmpdir(), "pls-setup-test-"));
	try {
		const backend = path.join(dir, "backend.env");
		fs.writeFileSync(backend, "EXISTING_SECRET=keep-this");
		const file = path.join(dir, "installation.json");
		const config = { ...validateSetup(valid()), PLS_LICENSE_TENANT_ID: "654321", DEFAULT_TENANT_ID: "654321" };
		const storage = { isEncryptionAvailable: () => true,
			encryptString: value => Buffer.from(value.split("").reverse().join("")),
			decryptString: value => value.toString().split("").reverse().join("") };
		saveSetup(file, config, storage, () => {});
		const { readProtected } = require("./secure-setup-store.cjs");
		assert.equal(readProtected(file, storage).PRODUCTION_DB_PASSWORD, valid().password);
		assert.equal(readProtected(file, storage).DEFAULT_TENANT_ID, "654321");
		assert.equal(fs.readFileSync(file, "utf8").includes(valid().password), false);
		assert.throws(() => saveSetup(file, config), /encryption/);
		assert.equal(fs.readFileSync(backend, "utf8"), "EXISTING_SECRET=keep-this");
		// Legacy fixture remains readable; the main process migrates it on launch.
		fs.writeFileSync(file, JSON.stringify(config));
		assert.equal(readSetup(file).DEFAULT_TENANT_ID, "654321");
		fs.writeFileSync(file, "not-json");
		assert.throws(() => readSetup(file), /Saved local database setup is invalid/);
	} finally { fs.rmSync(dir, { recursive: true, force: true }); }
});

test("connection checks infer the active identity by facility database without asking for an ID", async () => {
	const calls = [];
	let closed = 0;
	await testConnections(validateSetup(valid()), { createConnection: async config => {
		calls.push(config);
		return {
			query: async query => assert.equal(query.sql, "SELECT 1"),
			execute: async (query, args) => {
				assert.match(query.sql, /FROM prime_tenants WHERE database_name = \? LIMIT 2/);
				assert.deepEqual(args, ["PLS00125"]);
				return [[{
					id: "PLS20154", tenant_number: 125, company_name: "Existing organization",
					database_name: "PLS00125", status: "active", deleted_at: null,
				}]];
			},
			end: async () => { closed++; },
		};
	} });
	assert.equal(closed, 2);
	assert.equal(calls[1].port, 3307);
	assert.equal(calls[0].multipleStatements, false);
	assert.equal(calls.length, 2);
	await assert.rejects(testConnections(validateSetup(valid()), { createConnection: async () => ({
		query: async () => {}, execute: async () => [[{
			id: "PLS20154", tenant_number: 125, database_name: "different", status: "active", deleted_at: null,
		}]], end: async () => {},
	}) }), /inactive|database/);
});

test("non-generic facility-pinned setup does not create missing registry entries", async () => {
	await assert.rejects(testConnections(validateSetup(valid(), {}, "125"), {
		createConnection: async () => ({
			query: async () => {},
			execute: async () => [[]],
			end: async () => {},
		}),
	}, "125"), /no active registry entry/);
});

test("missing identity creates one safe registry record transactionally and retry is idempotent", async () => {
	const calls = [];
	const required = [
		"id", "company_name", "email", "phone", "country_id", "state_id", "district_id", "country_code", "deleted_at",
		"state_code", "district_code", "sequence_number", "database_name", "db_connection_string",
		"status", "provisioned_at", "created_by", "tenant_number", "facility_code",
	];
	let registered;
	let insertCount = 0;
	const control = {
		query: async () => {},
		beginTransaction: async () => calls.push("begin"),
		commit: async () => calls.push("commit"),
		rollback: async () => calls.push("rollback"),
		end: async () => {},
		execute: async (request, args = []) => {
			const sql = request.sql;
			calls.push(sql);
			if (/WHERE database_name = \?/.test(sql)) return [[...(registered ? [registered] : [])]];
			if (/INFORMATION_SCHEMA\.COLUMNS/.test(sql)) return [[...required.map(COLUMN_NAME => ({
				COLUMN_NAME, IS_NULLABLE: "NO", COLUMN_DEFAULT: null, EXTRA: "",
			}))]];
			if (/INFORMATION_SCHEMA\.STATISTICS/.test(sql)) return [[
				...["id", "tenant_number", "facility_code", "database_name"].map(indexed_columns => ({
					NON_UNIQUE: 0, indexed_columns,
				})),
			]];
			if (/FROM platform_countries/.test(sql)) return [[{
				country_id: 1, country_code: "GH", state_id: 2, state_code: "GH", district_id: 3, district_code: "ACC",
			}]];
			if (/FROM platform_users/.test(sql)) return [[{ id: 5 }]];
			if (/FROM tenant_code_sequences/.test(sql)) return [[]];
			if (/MAX\(sequence_number\)/.test(sql)) return [[{ last_sequence: 0 }]];
			if (/FROM prime_tenants WHERE id = \?/.test(sql)) return [[]];
			if (/FROM prime_tenants WHERE tenant_number = \?/.test(sql)) return [[]];
			if (/FROM prime_tenants WHERE facility_code = \?/.test(sql)) return [[]];
			if (/FROM prime_tenants WHERE email = \?/.test(sql)) return [[]];
			if (/INSERT INTO tenant_code_sequences/.test(sql)) return [[{}]];
			if (/INSERT INTO prime_tenants/.test(sql)) {
				insertCount++;
				registered = Object.fromEntries(sql.match(/\(([^)]+)\)/)[1].split(", ").map((key, index) => [key, args[index]]));
				registered.status = "active";
				registered.deleted_at = null;
				return [[{ insertId: 1 }]];
			}
			throw new Error(`Unexpected test query: ${sql}`);
		},
	};
	let opened = 0;
	const config = validateSetup(valid());
	const mysql = { createConnection: async () => {
		opened++;
		return opened % 2 ? { query: async () => {}, end: async () => {} } : control;
	} };
	const first = await testConnections(config, mysql, undefined, true);
	const second = await testConnections(config, mysql, undefined, true);
	assert.match(first.DEFAULT_TENANT_ID, /^[1-9]\d{5}$/);
	assert.equal(second.DEFAULT_TENANT_ID, first.DEFAULT_TENANT_ID);
	assert.equal(insertCount, 1);
	assert.equal(calls.filter(call => call === "begin").length, 1);
	assert.equal(calls.filter(call => call === "commit").length, 1);
	assert.ok(calls.some(sql => typeof sql === "string" && /INSERT INTO prime_tenants/.test(sql)));
	assert.ok(!calls.some(sql => typeof sql === "string" && /\b(DROP|ALTER|CREATE DATABASE)\b/i.test(sql)));
	assert.equal(registered.company_name, "Local Diagnostic Laboratory");
	assert.equal(registered.database_name, "PLS00125");
	assert.equal(registered.status, "active");
});

test("driver failures disclose neither password nor raw SQL/driver message", async () => {
	await assert.rejects(testConnections(validateSetup(valid()), {
		createConnection: async () => { throw Object.assign(new Error("SQL with sensitive-password"), { code: "ER_ACCESS_DENIED_ERROR" }); },
	}), error => error.message.includes("access denied") && !error.message.includes("sensitive-password"));
});

test("IPC accepts only local setup webContents, main frame and exact URL", () => {
	const frame = { url: "file:///trusted/setup.html" };
	const window = { isDestroyed: () => false, webContents: { mainFrame: frame } };
	const event = { sender: window.webContents, senderFrame: frame };
	assert.equal(trustedSender(event, window, frame.url), true);
	assert.equal(trustedSender({ ...event, sender: {} }, window, frame.url), false);
	assert.equal(trustedSender({ ...event, senderFrame: { url: frame.url } }, window, frame.url), false);
	assert.equal(trustedSender(event, window, "https://remote.example"), false);
});

test("setup assets mask passwords and use local-only CSP and a narrow preload", () => {
	const html = fs.readFileSync(path.join(__dirname, "setup.html"), "utf8");
	assert.equal((html.match(/type="password"/g) || []).length, 1);
	assert.match(html, /name="installationPassword"/);
	assert.doesNotMatch(html, /name="organizationName"|name="tenant"|numeric ID/i);
	assert.match(html, /connect-src 'none'/);
	assert.match(html, /script-src 'self'/);
	assert.doesNotMatch(html, /unsafe-inline|https?:\/\//);
	const preload = fs.readFileSync(path.join(__dirname, "setup-preload.cjs"), "utf8");
	assert.doesNotMatch(preload, /eval|executeJavaScript|sendSync/);
	assert.match(preload, /pls-setup-save/);
});
