const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {writeProvenance, verifyProvenance} = require('../desktop/scripts/runtime-provenance.cjs');

test('desktop provenance detects changed frontend and backend output', () => {
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'pls-provenance-'));
    try {
        const frontend = path.join(directory, 'frontend', '.next');
        const backend = path.join(directory, 'backend', 'dist');
        fs.mkdirSync(frontend, {recursive: true});
        fs.mkdirSync(backend, {recursive: true});
        fs.writeFileSync(path.join(frontend, 'page.js'), 'frontend-original');
        fs.writeFileSync(path.join(backend, 'index.js'), 'backend-original');
        writeProvenance(directory, directory, directory);
        assert.doesNotThrow(() => verifyProvenance(directory));
        fs.writeFileSync(path.join(frontend, 'page.js'), 'frontend-changed');
        assert.throws(() => verifyProvenance(directory), /provenance verification/);
        fs.writeFileSync(path.join(frontend, 'page.js'), 'frontend-original');
        fs.writeFileSync(path.join(backend, 'index.js'), 'backend-changed');
        assert.throws(() => verifyProvenance(directory), /provenance verification/);
    } finally {
        fs.rmSync(directory, {recursive: true, force: true});
    }
});
