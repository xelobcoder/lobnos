const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm'), ts = require('typescript');
const exportsObject = {};
const source = ts.createSourceFile('page.tsx', fs.readFileSync(path.join(__dirname, '../app/pharmacy/sell/page.tsx'), 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
const helper = source.statements.find(node => ts.isFunctionDeclaration(node) && node.name?.text === 'recoveryIssue');
assert.ok(helper, 'the actual POS owns the pure recovery-line validation');
vm.runInNewContext(ts.transpileModule(helper.getText(source),
    { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText + '\nexports.recoveryIssue=recoveryIssue;', { exports: exportsObject });
const { recoveryIssue } = exportsObject;
const line = { inventoryItemId: 'medicine', name: 'Medicine', sku: 'M', quantity: 2,
    salePrice: 15, wholesalePrice: 10, availableStock: 20, dispensableStock: 1 };

test('unavailable lines require explicit removal, not silent dropping', () => {
    assert.match(recoveryIssue({ ...line, unavailable: true }, 'retail'), /Remove or replace/);
    assert.equal(line.quantity, 2);
});
test('review checks usable stock and clears the issue after a quantity edit', () => {
    assert.match(recoveryIssue(line, 'retail'), /Reduce quantity/);
    assert.equal(recoveryIssue({ ...line, quantity: 1 }, 'retail'), '');
});
test('original pricing mode is used and missing prices or prescription lines require review', () => {
    assert.match(recoveryIssue({ ...line, quantity: 1, wholesalePrice: 0 }, 'wholesale'), /price unavailable/);
    assert.equal(recoveryIssue({ ...line, quantity: 1, wholesalePrice: 0 }, 'retail'), '');
    assert.match(recoveryIssue({ ...line, requiresPrescription: true }, 'retail'), /prescription queue/);
});
