"use strict";
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { spawnSync } = require('node:child_process');
function treeDigest(directory) {
    const digest = crypto.createHash('sha256');
    function visit(current) {
        for (const entry of fs.readdirSync(current, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
            if (entry.name === 'cache')
                continue;
            const filename = path.join(current, entry.name);
            const relative = path.relative(directory, filename).split(path.sep).join('/');
            if (entry.isDirectory())
                visit(filename);
            else if (entry.isFile()) {
                digest.update(relative + '\0');
                digest.update(fs.readFileSync(filename));
            }
        }
    }
    visit(directory);
    return digest.digest('hex');
}
function revision(directory) {
    const result = spawnSync('git', ['rev-parse', 'HEAD'], { cwd: directory, encoding: 'utf8' });
    const value = result.stdout?.trim();
    return result.status === 0 && /^[a-f0-9]{40,64}$/.test(value) ? value : null;
}
function writeProvenance(frontend, backend, runtime) {
    const backendRevision = revision(backend);
    if (process.env.PLS_SERVER_REVISION && process.env.PLS_SERVER_REVISION !== backendRevision)
        throw new Error('The backend revision does not match PLS_SERVER_REVISION');
    const manifest = {
        version: 1,
        frontendRevision: revision(frontend),
        backendRevision,
        frontendDigest: treeDigest(path.join(runtime, 'frontend', '.next')),
        backendDigest: treeDigest(path.join(runtime, 'backend', 'dist')),
    };
    fs.writeFileSync(path.join(runtime, 'runtime-provenance.json'), JSON.stringify(manifest, null, 2));
}
function verifyProvenance(runtime) {
    const manifest = JSON.parse(fs.readFileSync(path.join(runtime, 'runtime-provenance.json'), 'utf8'));
    if (manifest.version !== 1 || manifest.frontendDigest !== treeDigest(path.join(runtime, 'frontend', '.next')) || manifest.backendDigest !== treeDigest(path.join(runtime, 'backend', 'dist')))
        throw new Error('Desktop runtime provenance verification failed. Rebuild the frontend/backend bundle.');
}
module.exports = { treeDigest, writeProvenance, verifyProvenance };
