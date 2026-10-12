const assert = require("node:assert/strict");
const { existsSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");
const { clean } = require("../scripts/clean.cjs");

test("clean removes generated files and dependencies without deleting package-manager lockfiles", () => {
	const root = mkdtempSync(path.join(os.tmpdir(), "lobnos-clean-"));
	try {
		for (const entry of [".next", "out", "cache", "node_modules"]) {
			mkdirSync(path.join(root, entry), { recursive: true });
			writeFileSync(path.join(root, entry, "generated.txt"), "generated");
		}
		writeFileSync(path.join(root, "pnpm-lock.yaml"), "lockfileVersion: '9.0'");
		writeFileSync(path.join(root, "package-lock.json"), "{}");

		clean(root);

		for (const entry of [".next", "out", "cache", "node_modules"]) {
			assert.equal(existsSync(path.join(root, entry)), false);
		}
		assert.equal(readFileSync(path.join(root, "pnpm-lock.yaml"), "utf8"), "lockfileVersion: '9.0'");
		assert.equal(readFileSync(path.join(root, "package-lock.json"), "utf8"), "{}");
	} finally {
		rmSync(root, { recursive: true, force: true });
	}
});
