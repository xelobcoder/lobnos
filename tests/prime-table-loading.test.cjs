const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const vm = require('node:vm');
const source = fs.readFileSync(path.join(__dirname, '../components/accessories/Datatables/PrimeTable.js'), 'utf8');
const ast = ts.createSourceFile('PrimeTable.jsx', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.JSX);
let loader;
function visit(node) {
    if (ts.isFunctionDeclaration(node) && node.name?.text === 'RunServerAction') loader = node.getText(ast);
    ts.forEachChild(node, visit);
}
visit(ast);
for (const failure of [new Error('Connection lost'), { error: 'Access denied' }]) {
    test(`server loading recovers from ${failure.message || failure.error} without losing visible rows`, async () => {
        let loading = false, error = '', rows = ['previous'];
        const context = {
            serverSideFiltering: true, urlparams: { branchid: 2 },
            handleSeverSideProcessing: async () => { if (failure instanceof Error) throw failure; return failure; },
            setIsLoading: value => { loading = value; }, setLoadError: value => { error = value; }, setFilteredData: value => { rows = value; },
        };
        vm.runInNewContext(`${loader}\nthis.run = RunServerAction;`, context);
        await context.run(2, 10);
        assert.equal(loading, false);
        assert.equal(error, failure.message || failure.error);
        assert.deepEqual(rows, ['previous']);
    });
}
