const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');
const ts = require('typescript');

const source = fs.readFileSync(path.join(__dirname, '../app/result/lab-report-multiple/page.tsx'), 'utf8');
const ast = ts.createSourceFile('page.tsx', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
let effect;
function visit(node) {
    if (ts.isCallExpression(node) && node.expression.getText(ast) === 'useEffect' &&
        node.arguments[0].getText(ast).includes('pdfJobRef.current =')) effect = node.arguments[0].getText(ast);
    ts.forEachChild(node, visit);
}
visit(ast);

function setup(selectedTests) {
    const pending = new Map();
    let nextId = 0;
    const context = {
        loader: false, resultdata: { test: [{ records: [] }] }, selectedTests,
        setPdfError() {}, setPdfLoading() {},
        setTimeout(callback) { const id = ++nextId; pending.set(id, callback); return id; },
        clearTimeout(id) { pending.delete(id); },
    };
    const compiled = ts.transpileModule(`const run = ${effect};`, {
        compilerOptions: { target: ts.ScriptTarget.ES2020 },
    }).outputText;
    vm.runInNewContext(`${compiled}\nthis.run = run;`, context);
    return { run: context.run, pending };
}

test('report PDF waits until test selection is initialized', () => {
    const { run, pending } = setup([]);
    run();
    assert.equal(pending.size, 0);
});

test('superseded and unmounted PDF effects cancel their queued captures', () => {
    const { run, pending } = setup([0]);
    const cleanup = run();
    assert.equal(pending.size, 1);
    cleanup();
    assert.equal(pending.size, 0);
    const cleanupNext = run();
    assert.equal(pending.size, 1);
    cleanupNext();
    assert.equal(pending.size, 0);
});
