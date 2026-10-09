"use strict";

const fs = require("node:fs");
const path = require("node:path");

function pruneRuntimeSources(vendorDirectory) {
	for (const packageName of ["agent-base", "fecha", "zod"]) {
		const packageDirectory = path.join(vendorDirectory, packageName);
		const sourceDirectory = path.join(packageDirectory, "src");
		if (!fs.existsSync(sourceDirectory)) continue;

		const entryPoint = require.resolve(packageDirectory);
		if (!/\.(?:js|cjs|mjs)$/.test(entryPoint) ||
			entryPoint.startsWith(sourceDirectory + path.sep)) {
			throw new Error(packageName + " must have a compiled runtime entry point before pruning sources.");
		}
		fs.rmSync(sourceDirectory, { recursive: true, force: true });
	}
}

module.exports = { pruneRuntimeSources };

if (require.main === module) {
	for (const directory of process.argv.slice(2)) {
		pruneRuntimeSources(path.resolve(directory));
	}
}
