const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');
const ts = require('typescript');

function render(completeFlow) {
  const source = readFileSync(path.join(__dirname, '../app/operations/laboratory/page.tsx'), 'utf8');
  const compiled = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  });
  const exports = {};
  vm.runInNewContext(compiled.outputText, { exports, require: name => {
    if (name === 'react' || name === 'react/jsx-runtime') return require(name);
    if (name.endsWith('useApplicationContext')) return { useApplication: () => ({ settings: { completeFlow } }) };
    if (name === 'next/link') return { __esModule: true, default: 'a' };
    return new Proxy({}, { get: () => () => null });
  } });
  return exports.default();
}
const nodes = tree => !tree || typeof tree !== 'object' ? [] : Array.isArray(tree) ? tree.flatMap(nodes) : [tree, ...nodes(tree.props?.children)];

for (const completeFlow of [0, '0', 1, '1', undefined]) {
  test(`laboratory home exposes sample storage with completeFlow=${String(completeFlow)}`, () => {
    const tree = nodes(render(completeFlow));
    assert.ok(tree.some(node => node.type === 'a' && node.props.href === '/operations/phelobotomy/specimen-storage'));
    assert.ok(tree.some(node => node.type === 'a' && node.props.href === '/operations/laboratory/completed'));
    if (completeFlow !== 1 && completeFlow !== '1') {
      assert.equal(tree.some(node => node.type === 'a' && node.props.href === '/operations/laboratory/sample/validation'), false);
    }
  });
}
