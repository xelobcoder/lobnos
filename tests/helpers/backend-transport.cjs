const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const source = fs.readFileSync(path.join(__dirname, '../../lib/serverBackendAccess.ts'), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;

module.exports = function loadBackendTransport(env = {}) {
    const exports = {};
    vm.runInNewContext(compiled, { exports, process: { env } });
    return exports.assertBackendTransport;
};
