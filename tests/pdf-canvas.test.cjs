const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const ts = require('typescript');
const vm = require('node:vm');
const exportsObject = {};
vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(__dirname, '../lib/pdfCanvas.ts'), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
}).outputText, { exports: exportsObject });
const { reportCanvasPng } = exportsObject;

test('zero-size verification blocks are skipped before PNG encoding', () => {
    for (const [width, height] of [[0, 10], [100, 0]]) {
        assert.equal(reportCanvasPng({ width, height, toDataURL() { throw Error('must not encode'); } }, 190), null);
    }
});

test('an empty canvas data URL never reaches jsPDF as a PNG', () => {
    assert.equal(reportCanvasPng({ width: 100, height: 50, toDataURL: () => 'data:,' }, 190), null);
});

test('valid captures preserve their PNG and proportional print height', () => {
    const data = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAAB';
    const image = reportCanvasPng({ width: 200, height: 50, toDataURL: () => data }, 190);
    assert.equal(image.data, data);
    assert.equal(image.heightMm, 47.5);
});

test('non-PNG captures fail with a useful error', () => {
    assert.throws(() => reportCanvasPng({ width: 100, height: 50, toDataURL: () => 'data:image/jpeg;base64,invalid' }, 190), /valid PNG/);
});
