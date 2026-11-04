// Bounded build only. Output contains synthetic data and real production components.
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { webpack } = require('next/dist/compiled/webpack/webpack');
const root = path.resolve(__dirname, '../../..');
function build() {
    const output = fs.mkdtempSync(path.join(os.tmpdir(), 'pls-lab-nhis-fixture-'));
    const alias = Object.fromEntries([
        [path.join(root, 'components/Auth/customFetch') + '$', path.join(__dirname, 'api.ts')],
        [path.join(root, 'components/Auth/useApplicationContext'), path.join(__dirname, 'context.tsx')],
        ['next/link', path.join(__dirname, 'context.tsx')],
        ['next/navigation', path.join(__dirname, 'context.tsx')],
    ]);
    const compiler = webpack({
        mode: 'development', devtool: false, context: root, target: 'web',
        entry: path.join(__dirname, 'entry.tsx'), output: { path: output, filename: 'fixture.js', publicPath: '/bundle/' },
        resolve: { extensions: ['.tsx', '.ts', '.jsx', '.js', '.json'], alias },
        module: { rules: [
            { test: /\.[jt]sx?$/, exclude: /node_modules/, use: path.join(__dirname, '../accounting-harness/loader.cjs') },
            { test: /\.css$/, use: path.join(__dirname, '../accounting-harness/loader.cjs') },
        ] }, optimization: { minimize: false },
    });
    return new Promise((resolve, reject) => compiler.run((error, stats) => compiler.close(() => {
        if (error || stats.hasErrors()) {
            fs.rmSync(output, { recursive: true, force: true });
            reject(error || new Error(stats.toString({ all: false, errors: true })));
        } else resolve(output);
    })));
}
module.exports = { build, root };
if (require.main === module) build().then(output => {
    console.log(JSON.stringify({ output, bundle: path.join(output, 'fixture.js'), root }));
    fs.rmSync(output, { recursive: true, force: true });
    console.log('Build verified; temporary artifacts removed. Use serve.cjs to retain artifacts for browser validation.');
}).catch(error => { console.error(error); process.exitCode = 1; });
