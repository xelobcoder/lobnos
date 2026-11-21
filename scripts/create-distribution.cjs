"use strict";
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');
const output = path.join(root, 'distribution');

if (!process.argv.includes('--skip-build')) {
  const result = spawnSync('pnpm', ['run', 'build'], {
    cwd: root, stdio:'inherit', shell:process.platform === 'win32',
    env:{...process.env, PLS_DESKTOP_BUILD:'true'},
  });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status || 1);
}
const standalone = path.join(root, '.next/standalone');
if (!fs.existsSync(path.join(standalone, 'server.js'))) throw new Error('Standalone frontend build is missing. Run pnpm create-distribution without --skip-build.');
// This command owns only the fixed distribution directory inside this project.
if (path.dirname(path.resolve(output)) !== root) throw new Error('Unsafe distribution path');
fs.rmSync(output, {recursive:true, force:true});
fs.cpSync(standalone, output, {recursive:true, filter:source => !path.basename(source).startsWith('.env')});
fs.cpSync(path.join(root, '.next/static'), path.join(output, '.next/static'), {recursive:true});
fs.cpSync(path.join(root, 'public'), path.join(output, 'public'), {recursive:true});
fs.writeFileSync(path.join(output, 'START-HERE.txt'),
  'Frontend standalone distribution\n\n1. Copy this entire directory to the device. Node.js must be installed.\n2. Set HOSTNAME=127.0.0.1 and PORT=2377 in the process environment.\n3. Supply the existing frontend JWT_SECRET_KEY through the process environment.\n4. Run: node server.js\n\nThe backend is packaged separately. API URLs are fixed when building; rebuild for a different backend URL.\nNative dependencies match the build machine: build on Linux for a Linux VPS.\nNo development .env file is included.\n');
for (const required of ['server.js','node_modules/next/package.json','.next/static','public']) {
  if (!fs.existsSync(path.join(output, required))) throw new Error(`Incomplete frontend distribution: ${required}`);
}
const forbidden = fs.readdirSync(output).filter(name => name.startsWith('.env'));
if (forbidden.length) throw new Error('Frontend distribution contains development environment files');
console.log(`Frontend distribution verified: ${output}`);
