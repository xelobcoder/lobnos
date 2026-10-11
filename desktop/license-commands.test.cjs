"use strict";

const { test } = require("node:test");
const assert = require("node:assert/strict");
const { EventEmitter } = require("node:events");
const path = require("node:path");
const { runLicenseCommand } = require("./license-commands.cjs");

const options = {
	executable: process.execPath,
	resolver: path.resolve("desktop", "vendor-resolver.cjs"),
	backendDirectory: path.resolve(".desktop-runtime", "backend"),
	env: { PLS_LICENSE_TENANT_ID: "990556", PLS_LICENSE_STORAGE_DIR: path.resolve("license-state") },
};

function fakeSpawn(callback, code = 0, error = "") {
	return (...args) => {
		callback(...args);
		const child = new EventEmitter();
		child.stdout = new EventEmitter();
		child.stderr = new EventEmitter();
		child.kill = () => {};
		process.nextTick(() => {
			if (error) child.stderr.emit("data", Buffer.from(error));
			child.emit("close", code);
		});
		return child;
	};
}

test("exports a request via isolated Node CLI without shell interpolation", async () => {
	const file = path.resolve("activation request & example.json");
	await runLicenseCommand(options, "request", file, fakeSpawn((exe, args, config) => {
		assert.equal(exe, process.execPath);
		assert.deepEqual(args.slice(-5), ["request", "--tenant-id", "990556", "--output", file]);
		assert.equal(config.shell, false);
		assert.equal(config.env.ELECTRON_RUN_AS_NODE, "1");
		assert.equal(config.env.PLS_LICENSE_STORAGE_DIR, options.env.PLS_LICENSE_STORAGE_DIR);
	}));
});

test("imports a signed file using activate and --file", async () => {
	const file = path.resolve("license.json");
	await runLicenseCommand(options, "activate", file, fakeSpawn((_exe, args) => {
		assert.deepEqual(args.slice(-5), ["activate", "--tenant-id", "990556", "--file", file]);
	}));
});

test("invalid tenant and paths never spawn a process", async () => {
	const unexpected = () => assert.fail("Must not launch");
	await assert.rejects(runLicenseCommand({ ...options, env: {} }, "request", path.resolve("x"), unexpected), /tenant ID/);
	await assert.rejects(runLicenseCommand(options, "request", "relative.json", unexpected), /absolute/);
	await assert.rejects(runLicenseCommand(options, "delete", path.resolve("x"), unexpected), /Unsupported/);
});

test("surfaces CLI failure rather than reporting activation success", async () => {
	await assert.rejects(runLicenseCommand(options, "activate", path.resolve("x"), fakeSpawn(() => {}, 1, "License signature invalid")), /signature invalid/);
});

test("surfaces spawn failure", async () => {
	await assert.rejects(runLicenseCommand(options, "request", path.resolve("x"), () => {
		const child = new EventEmitter();
		child.stdout = new EventEmitter();
		child.stderr = new EventEmitter();
		process.nextTick(() => child.emit("error", new Error("Cannot start runtime")));
		return child;
	}), /Cannot start runtime/);
});

test("bounds command output and terminates a noisy process", async () => {
	let killed = false;
	await assert.rejects(runLicenseCommand(options, "request", path.resolve("x"), () => {
		const child = new EventEmitter();
		child.stdout = new EventEmitter();
		child.stderr = new EventEmitter();
		child.kill = () => { killed = true; };
		process.nextTick(() => child.stdout.emit("data", Buffer.alloc(64 * 1024 + 1)));
		return child;
	}), /excessive output/);
	assert.equal(killed, true);
});
