"use strict";

const fs = require("node:fs");
const path = require("node:path");

const FIELDS = {
	organizationName: "LOCAL_ORGANIZATION_NAME",
	host: "PRODUCTION_DB_HOSTNAME", port: "PRODUCTION_DB_PORT",
	user: "PRODUCTION_DB_USERNAME", password: "PRODUCTION_DB_PASSWORD",
	database: "PRODUCTION_DATABASE",
	controlHost: "SYSTEM_CONFIG_DB_HOST", controlPort: "SYSTEM_CONFIG_DB_PORT",
	controlUser: "SYSTEM_CONFIG_DB_USERNAME", controlPassword: "SYSTEM_CONFIG_DB_PASSWORD",
	controlDatabase: "SYSTEM_CONFIG_DATABASE",
};
const PASSWORDS = new Set(["password", "controlPassword"]);
class SetupError extends Error {}

function validateSetup(input, existing = {}, pinnedTenant) {
	if (!input || typeof input !== "object" || Array.isArray(input) ||
		Object.keys(input).some(key => !Object.hasOwn(FIELDS, key))) {
		throw new SetupError("Invalid local setup fields.");
	}
	const result = {};
	for (const [field, key] of Object.entries(FIELDS)) {
		let value = input[field];
		if (PASSWORDS.has(field) && value === "") value = existing[key];
		if (typeof value !== "string" || !value || value.length > 1024 || /[\r\n\0]/.test(value)) {
			throw new SetupError(`${field}: a value is required (leave an existing password blank to keep it).`);
		}
		if (!PASSWORDS.has(field) && value !== value.trim()) throw new SetupError(`${field}: remove surrounding whitespace.`);
		result[key] = value;
	}
	if (!result.LOCAL_ORGANIZATION_NAME.trim() || result.LOCAL_ORGANIZATION_NAME.length > 100) {
		throw new SetupError("Organization name is required and must be at most 100 characters.");
	}
	if (pinnedTenant && !/^[1-9]\d{0,5}$/.test(String(pinnedTenant))) {
		throw new SetupError("This installer has an invalid pinned facility identity.");
	}
	for (const field of ["port", "controlPort"]) {
		const value = result[FIELDS[field]];
		if (!/^[1-9]\d{0,4}$/.test(value) || Number(value) > 65535) throw new SetupError(`${field}: use an explicit port from 1 to 65535.`);
	}
	for (const field of ["host", "controlHost"]) {
		if (!/^[A-Za-z0-9_.:\[\]-]+$/.test(result[FIELDS[field]])) throw new SetupError(`${field}: enter a hostname or IP address, not a URL.`);
	}
	for (const field of ["database", "controlDatabase"]) {
		if (!/^[A-Za-z0-9_$-]{1,64}$/.test(result[FIELDS[field]])) throw new SetupError(`${field}: unsupported database name.`);
	}
	return {
		...result,
		PLS_DESKTOP_STANDALONE: "true",
		...(pinnedTenant ? {
			PLS_LICENSE_TENANT_ID: String(pinnedTenant),
			DEFAULT_TENANT_ID: String(pinnedTenant),
		} : {}),
		MULTI_TENANT: "false",
		DB_HOST: result.PRODUCTION_DB_HOSTNAME, DB_PORT: result.PRODUCTION_DB_PORT,
		DB_USERNAME: result.PRODUCTION_DB_USERNAME, DB_PASSWORD: result.PRODUCTION_DB_PASSWORD,
		DATABASE: result.PRODUCTION_DATABASE,
	};
}

function setupSummary(config) {
	return Object.fromEntries(Object.entries(FIELDS).map(([field, key]) =>
		[field, PASSWORDS.has(field) ? "" : config[key] || ""]));
}

function readSetup(file) {
	if (!fs.existsSync(file)) return {};
	try {
		const config = JSON.parse(fs.readFileSync(file, "utf8"));
		const input = Object.fromEntries(Object.entries(FIELDS).map(([field, key]) => [
			field, config[key] ?? (field === "organizationName" ? "Local organization" : undefined),
		]));
		const validated = validateSetup(input);
		const tenantId = config.PLS_LICENSE_TENANT_ID || config.DEFAULT_TENANT_ID;
		if (!/^[1-9]\d{0,5}$/.test(String(tenantId || ""))) throw new SetupError("Saved local organization identity is missing.");
		return {
			...validated,
			PLS_LICENSE_TENANT_ID: String(tenantId),
			DEFAULT_TENANT_ID: String(tenantId),
		};
	} catch {
		throw new SetupError("Saved local database setup is invalid. Open Settings > Database setup to repair it.");
	}
}

function saveSetup(file, config, storage, secure) {
	// Compatibility helper name retained, but plaintext credential writes are no longer supported.
	require("./secure-setup-store.cjs").writeProtected(file, config, storage, secure);
}

const REGISTRY = "prime_tenants";
const REQUIRED_COLUMNS = [
	"id", "company_name", "email", "phone", "country_id", "state_id", "district_id",
	"country_code", "state_code", "district_code", "sequence_number", "database_name",
	"db_connection_string", "status", "deleted_at", "provisioned_at", "created_by", "tenant_number", "facility_code",
];

function facilityCodeBase(name) {
	const stop = new Set(["AND", "OF", "THE", "FOR", "LTD", "LIMITED", "CO", "INC", "PLC"]);
	const words = String(name || "").toUpperCase().split(/[^A-Z0-9]+/).filter(word => word && !stop.has(word));
	if (!words.length) return "LABXXX";
	const initials = words.slice(1).map(word => word[0]).join("").slice(0, 2);
	const head = words[0].slice(0, 6 - initials.length);
	let code = head + initials;
	if (code.length < 6) code += words.join("").slice(head.length);
	code = code.slice(0, 6).padEnd(6, "X");
	return /^[A-Z]/.test(code) ? code : `L${code.slice(0, 5)}`;
}

async function queryRows(connection, sql, values = []) {
	const [rows] = await connection.execute({ sql, timeout: 5000 }, values);
	return rows;
}

function localRegistryIdentity(rows, pinnedTenant, databaseName) {
	if (rows.length > 1) throw new SetupError("Control database: multiple registry entries use this facility database; an administrator must resolve the duplicate before setup.");
	if (!rows.length) return null;
	const row = rows[0];
	if (databaseName && row.database_name !== databaseName) {
		throw new SetupError("Control database: facility registry identity does not match the configured facility database.");
	}
	if (row.status !== "active" || row.deleted_at) {
		throw new SetupError("Control database: this facility database is already registered but inactive; contact your administrator.");
	}
	const id = Number(row.tenant_number);
	if (!Number.isSafeInteger(id) || id < 1 || id > 999999 || !/^[A-Z][A-Z0-9]{2,31}$/.test(String(row.id || ""))) {
		throw new SetupError("Control database: the active facility registry entry has no valid organization identity; an administrator must update the registry schema.");
	}
	if (pinnedTenant && id !== Number(pinnedTenant)) {
		throw new SetupError("This installer is licensed for a different facility than the configured database.");
	}
	return id;
}

async function findDatabaseRows(connection, database, forUpdate = false) {
	return queryRows(connection,
		`SELECT id, tenant_number, company_name, database_name, status, deleted_at FROM ${REGISTRY} WHERE database_name = ? LIMIT 2${forUpdate ? " FOR UPDATE" : ""}`,
		[database]);
}

async function provisionLocalRegistry(connection, config, pinnedTenant) {
	let transaction = false;
	try {
		await connection.beginTransaction();
		transaction = true;
		let rows = await findDatabaseRows(connection, config.PRODUCTION_DATABASE);
		let existing = localRegistryIdentity(rows, pinnedTenant, config.PRODUCTION_DATABASE);
		if (existing) {
			await connection.commit();
			return existing;
		}
		if (rows.length) throw new SetupError("Control database: this facility database is already registered but inactive; contact your administrator.");

		const schema = await queryRows(connection,
			"SELECT COLUMN_NAME, IS_NULLABLE, COLUMN_DEFAULT, EXTRA FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?",
			[REGISTRY]);
		const available = new Set(schema.map(column => column.COLUMN_NAME));
		if (REQUIRED_COLUMNS.some(column => !available.has(column))) {
			throw new SetupError("Control database: prime_tenants is missing current facility identity columns. Ask an administrator to prepare the existing registry schema; setup does not run migrations.");
		}
		const requiredUnknown = schema.find(column => column.IS_NULLABLE === "NO" && column.COLUMN_DEFAULT === null &&
			!String(column.EXTRA || "").includes("auto_increment") && !REQUIRED_COLUMNS.includes(column.COLUMN_NAME));
		if (requiredUnknown) {
			throw new SetupError("Control database: prime_tenants has an unsupported required column. Ask an administrator to prepare the registry schema.");
		}
		const indexes = await queryRows(connection,
			"SELECT INDEX_NAME, NON_UNIQUE, GROUP_CONCAT(COLUMN_NAME ORDER BY SEQ_IN_INDEX) AS indexed_columns FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? GROUP BY INDEX_NAME, NON_UNIQUE",
			[REGISTRY]);
		const uniqueColumn = name => indexes.some(index => Number(index.NON_UNIQUE) === 0 && index.indexed_columns === name);
		if (!["id", "tenant_number", "facility_code"].every(uniqueColumn)) {
			throw new SetupError("Control database: prime_tenants is missing required unique indexes. Ask an administrator to update the existing registry schema.");
		}

		const locations = await queryRows(connection,
			"SELECT c.id AS country_id, c.country_code, s.id AS state_id, s.state_code, d.id AS district_id, d.district_code FROM platform_countries c JOIN platform_states s ON s.country_id = c.id JOIN platform_districts d ON d.state_id = s.id WHERE c.status = 'active' AND c.deleted_at IS NULL AND s.status = 'active' AND s.deleted_at IS NULL AND d.status = 'active' AND d.deleted_at IS NULL ORDER BY c.id, s.id, d.id LIMIT 1 FOR UPDATE");
		if (!locations.length) throw new SetupError("Control database: active platform country/state/district reference rows are required before local organization setup.");
		// Serialize local setup against the same location lock used by facility provisioning,
		// then do a current read so a concurrent first-run cannot create a second local row.
		rows = await findDatabaseRows(connection, config.PRODUCTION_DATABASE, true);
		existing = localRegistryIdentity(rows, pinnedTenant, config.PRODUCTION_DATABASE);
		if (existing) {
			await connection.commit();
			return existing;
		}
		if (rows.length) throw new SetupError("Control database: this facility database is already registered but inactive; contact your administrator.");
		const location = locations[0];
		const creatorRows = await queryRows(connection, "SELECT id FROM platform_users ORDER BY id LIMIT 1 FOR UPDATE");
		if (!creatorRows.length) throw new SetupError("Control database: a platform user is required to register a local organization.");
		const sequenceRows = await queryRows(connection,
			"SELECT last_sequence FROM tenant_code_sequences WHERE country_id = ? AND state_id = ? AND district_id = ? FOR UPDATE",
			[location.country_id, location.state_id, location.district_id]);
		const priorSequence = await queryRows(connection,
			"SELECT MAX(sequence_number) AS last_sequence FROM prime_tenants WHERE country_id = ? AND state_id = ? AND district_id = ?",
			[location.country_id, location.state_id, location.district_id]);
		let sequence = Math.max(Number(sequenceRows[0]?.last_sequence || 0), Number(priorSequence[0]?.last_sequence || 0)) + 1;
		let organizationIdentifier = `${location.state_code}${location.district_code}${sequence}`.toUpperCase();
		for (;;) {
			rows = await queryRows(connection, "SELECT id FROM prime_tenants WHERE id = ? LIMIT 1", [organizationIdentifier]);
			if (!rows.length) break;
			sequence++;
			if (!Number.isSafeInteger(sequence) || sequence > 4294967295) {
				throw new SetupError("Control database: organization sequence is exhausted; ask an administrator to review registry data.");
			}
			organizationIdentifier = `${location.state_code}${location.district_code}${sequence}`.toUpperCase();
		}
		if (!/^[A-Z][A-Z0-9]{2,31}$/.test(organizationIdentifier)) {
			throw new SetupError("Control database: location codes cannot form a valid organization identifier; ask an administrator to review registry reference data.");
		}
		if (sequenceRows.length) {
			await queryRows(connection,
				"UPDATE tenant_code_sequences SET last_sequence = ? WHERE country_id = ? AND state_id = ? AND district_id = ?",
				[sequence, location.country_id, location.state_id, location.district_id]);
		} else {
			await queryRows(connection,
				"INSERT INTO tenant_code_sequences (country_id, state_id, district_id, last_sequence) VALUES (?, ?, ?, ?)",
				[location.country_id, location.state_id, location.district_id, sequence]);
		}

		let tenantId = Number(pinnedTenant) || 0;
		if (tenantId) {
			rows = await queryRows(connection, "SELECT id FROM prime_tenants WHERE tenant_number = ? LIMIT 1", [tenantId]);
			if (rows.length) throw new SetupError("This installer facility identity is already assigned to another organization.");
		} else {
			for (let attempt = 0; attempt < 20; attempt++) {
				tenantId = require("node:crypto").randomInt(100000, 1000000);
				rows = await queryRows(connection, "SELECT id FROM prime_tenants WHERE tenant_number = ? LIMIT 1", [tenantId]);
				if (!rows.length) break;
				tenantId = 0;
			}
			if (!tenantId) throw new SetupError("Control database: unable to allocate a unique local organization ID; retry setup.");
		}
		const base = facilityCodeBase(config.LOCAL_ORGANIZATION_NAME);
		const facilityCodes = [base];
		for (let n = 1; n <= 99; n++) facilityCodes.push(base.slice(0, 4) + String(n).padStart(2, "0"));
		for (let n = 100; n <= 999; n++) facilityCodes.push(base.slice(0, 3) + String(n));
		let facilityCode;
		for (const candidate of facilityCodes) {
			rows = await queryRows(connection, "SELECT id FROM prime_tenants WHERE facility_code = ? LIMIT 1", [candidate]);
			if (!rows.length) { facilityCode = candidate; break; }
		}
		if (!facilityCode) throw new SetupError("Control database: unable to allocate a unique facility code; retry setup.");
		const email = `local.${tenantId}@pls.local`;
		rows = await queryRows(connection, "SELECT id FROM prime_tenants WHERE email = ? LIMIT 1", [email]);
		if (rows.length) throw new SetupError("Control database: generated local contact identity already exists; retry setup.");
		const values = {
			id: organizationIdentifier,
			company_name: config.LOCAL_ORGANIZATION_NAME,
			email,
			phone: "",
			country_id: location.country_id,
			state_id: location.state_id,
			district_id: location.district_id,
			country_code: location.country_code,
			state_code: location.state_code,
			district_code: location.district_code,
			sequence_number: sequence,
			database_name: config.PRODUCTION_DATABASE,
			db_connection_string: `mysql://${config.PRODUCTION_DB_HOSTNAME}:${config.PRODUCTION_DB_PORT}/${config.PRODUCTION_DATABASE}`,
			status: "active",
			provisioned_at: new Date(),
			created_by: creatorRows[0].id,
			tenant_number: tenantId,
			facility_code: facilityCode,
		};
		const fields = Object.keys(values);
		await queryRows(connection,
			`INSERT INTO ${REGISTRY} (${fields.join(", ")}) VALUES (${fields.map(() => "?").join(", ")})`,
			fields.map(field => values[field]));
		await connection.commit();
		transaction = false;
		return tenantId;
	} catch (error) {
		if (transaction) await connection.rollback().catch(() => {});
		if (error instanceof SetupError) throw error;
		if (error && error.code === "ER_DUP_ENTRY") {
			const rows = await findDatabaseRows(connection, config.PRODUCTION_DATABASE).catch(() => []);
			const existing = localRegistryIdentity(rows, pinnedTenant, config.PRODUCTION_DATABASE);
			if (existing) return existing;
			throw new SetupError("Control database: a registry identity conflicted during setup. Retry once; if it persists, ask an administrator to review registry indexes.");
		}
		throw error;
	}
}

async function resolveLocalIdentity(connection, config, pinnedTenant, allowProvision) {
	const rows = await findDatabaseRows(connection, config.PRODUCTION_DATABASE);
	const existing = localRegistryIdentity(rows, pinnedTenant, config.PRODUCTION_DATABASE);
	if (existing) return existing;
	if (rows.length) throw new SetupError("Control database: this facility database is already registered but inactive; contact your administrator.");
	if (!allowProvision) {
		throw new SetupError("Control database: no active registry entry matches this facility database; ask an administrator to register it.");
	}
	return provisionLocalRegistry(connection, config, pinnedTenant);
}

async function testConnections(config, mysql, pinnedTenant, allowProvision = false) {
	let facility;
	let control;
	try {
		facility = await mysql.createConnection({
			host: config.PRODUCTION_DB_HOSTNAME, port: Number(config.PRODUCTION_DB_PORT),
			user: config.PRODUCTION_DB_USERNAME, password: config.PRODUCTION_DB_PASSWORD,
			database: config.PRODUCTION_DATABASE, connectTimeout: 5000, multipleStatements: false,
		});
		await facility.query({ sql: "SELECT 1", timeout: 5000 });
		control = await mysql.createConnection({
			host: config.SYSTEM_CONFIG_DB_HOST, port: Number(config.SYSTEM_CONFIG_DB_PORT),
			user: config.SYSTEM_CONFIG_DB_USERNAME, password: config.SYSTEM_CONFIG_DB_PASSWORD,
			database: config.SYSTEM_CONFIG_DATABASE, connectTimeout: 5000, multipleStatements: false,
		});
		await control.query({ sql: "SELECT 1", timeout: 5000 });
		const tenantId = await resolveLocalIdentity(control, config, pinnedTenant, allowProvision);
		return {
			...config,
			PLS_LICENSE_TENANT_ID: String(tenantId),
			DEFAULT_TENANT_ID: String(tenantId),
			PLS_DESKTOP_STANDALONE: "true",
			MULTI_TENANT: "false",
		};
	} catch (error) {
		if (error instanceof SetupError) throw error;
		const reasons = {
			ER_ACCESS_DENIED_ERROR: "access denied; check the supplied username/password and existing grants",
			ER_DBACCESS_DENIED_ERROR: "database access denied; ask your database administrator to review existing grants",
			ER_BAD_DB_ERROR: "database does not exist; an administrator must provision the existing databases first",
			ECONNREFUSED: "connection refused; check host, port and MySQL service",
			ENOTFOUND: "hostname could not be resolved",
			ETIMEDOUT: "connection timed out; check host, port and firewall",
			ER_NO_SUCH_TABLE: "required registry/reference tables are missing; an administrator must prepare the existing control database",
			ER_BAD_FIELD_ERROR: "the control database schema is not current; ask an administrator to update its existing schema",
		};
		throw new SetupError(`Database setup: ${reasons[error.code] || "connection or validation failed; check configuration and existing database prerequisites"}.`);
	} finally {
		if (facility) await facility.end().catch(() => {});
		if (control) await control.end().catch(() => {});
	}
}

function trustedSender(event, window, url) {
	return Boolean(window && !window.isDestroyed() && event.sender === window.webContents &&
		event.senderFrame === window.webContents.mainFrame && event.senderFrame.url === url);
}

module.exports = {
	SetupError, FIELDS, validateSetup, setupSummary, readSetup, saveSetup,
	testConnections, trustedSender, facilityCodeBase, localRegistryIdentity,
};
