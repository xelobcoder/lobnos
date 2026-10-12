const path = require("node:path");
const { rmSync } = require("node:fs");

function clean(root = path.resolve(__dirname, "..")) {
	for (const entry of [".next", "out", "cache", "node_modules"]) {
		rmSync(path.join(root, entry), { recursive: true, force: true });
	}
}

if (require.main === module) {
	clean();
}

module.exports = { clean };
