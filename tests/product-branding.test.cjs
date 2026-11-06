const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const vm = require('node:vm');
const test = require('node:test');

const root = path.join(__dirname, '..');

test('public entry screens and package metadata use Prime Laboratory Software', () => {
    assert.ok(fs.existsSync(path.join(root, 'app', '(website)', 'page.tsx')), 'public homepage is present in its route group');
    const packageJson = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
    assert.equal(packageJson.productName, 'Prime Laboratory Software');
    const installer = fs.readFileSync(path.join(root, 'electron-builder.yml'), 'utf8');
    assert.match(installer, /productName: Prime Laboratory Software/);
    assert.match(installer, /shortcutName: Prime Laboratory Software/);
    for (const relative of [
        ['website', 'components', 'layout', 'SiteHeader.tsx'],
        ['app', 'authentications', 'login', 'page.tsx'],
        ['app', 'authentications', 'license-expired', 'page.tsx'],
        ['components', 'Layout', 'PrimeLayout.tsx'],
    ]) {
        const text = fs.readFileSync(path.join(root, ...relative), 'utf8');
        assert.match(text, /Prime Laboratory Software/);
        assert.doesNotMatch(text, /Prime Lab(?:oratory)? System|>Lobnos</);
    }
    const pharmacy = fs.readFileSync(path.join(root, 'app', 'pharmacy', 'sell', 'page.tsx'), 'utf8');
    assert.match(pharmacy, /app\?\.company\?\.name\|\|'PHARMACY'/);
    assert.doesNotMatch(pharmacy, /LOBNOS PHARMACY/);
});


test('Electron uses the correct product name without relocating installation settings', () => {
    const calls = [];
    const appData = path.join(os.tmpdir(), 'pls-branding-app-data');
    const source = fs.readFileSync(path.join(root, 'desktop', 'main.cjs'), 'utf8');
    vm.runInNewContext(source.slice(0, source.indexOf('function runtimeRoot()')), {
        require: name => {
            if (name === 'electron') return { app: {
                setName: name => calls.push(['name', name]),
                getPath: name => { assert.equal(name, 'appData'); return appData; },
                setPath: (name, value) => calls.push(['path', name, value]),
            } };
            if (name.startsWith('./')) return {};
            return require(name);
        },
    });
    assert.deepEqual(calls, [
        ['name', 'Prime Laboratory Software'],
        ['path', 'userData', path.join(appData, 'Prime Laboratory System')],
    ]);
});

test('project instructions persist the official product identity', () => {
    for (const directory of [root, path.join(root, '..', 'lobnos-server')]) {
        const instructions = fs.readFileSync(path.join(directory, '.github', 'copilot-instructions.md'), 'utf8');
        assert.match(instructions, /The product is \*\*Prime Laboratory Software\*\*, abbreviated \*\*PLS\*\*/);
        assert.match(instructions, /Use pnpm, not npm/);
    }
});
