// Isolated development/test compilation, NOT a Next application or production build.
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const http = require('node:http');
const compiled = require('next/dist/compiled/webpack/webpack');
const root = path.resolve(__dirname, '../../..');
const output = fs.mkdtempSync(path.join(os.tmpdir(), 'pls-accounting-browser-'));
const alias = Object.fromEntries([
  [path.join(root, 'components/Auth/customFetch') + '$', path.join(__dirname, 'api.ts')],
  [path.join(root, 'components/Auth/useApplicationContext'), path.join(__dirname, 'context.tsx')],
  [path.join(root, 'components/serverActions/requestHeaders'), path.join(__dirname, 'context.tsx')],
  ['next/link', path.join(__dirname, 'context.tsx')],
  ['next/navigation', path.join(__dirname, 'context.tsx')],
]);
const compiler = compiled.webpack({
  mode: 'development', devtool: false, context: root, target: 'web',
  entry: path.join(__dirname, 'entry.tsx'), output: { path: output, filename: 'harness.js', publicPath: '/bundle/' },
  resolve: { extensions: ['.tsx', '.ts', '.jsx', '.js', '.json'], alias },
  module: { rules: [
    { test: /\.[jt]sx?$/, exclude: /node_modules/, use: path.join(__dirname, 'loader.cjs') },
    { test: /\.css$/, use: path.join(__dirname, 'loader.cjs') },
    { test: /\.(woff2?|ttf|svg|png|gif)$/, type: 'asset/inline' },
  ] },
  optimization: { minimize: false },
});
let server;
function cleanup() {
  server?.close();
  compiler.close(() => { fs.rmSync(output, { recursive: true, force: true }); process.exit(0); });
}
process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
compiler.run((error, stats) => {
  if (error || stats.hasErrors()) { console.error(error || stats.toString({ all: false, errors: true })); fs.rmSync(output, { recursive: true, force: true }); process.exit(1); }
  server = http.createServer((request, response) => {
    if (request.url === '/shutdown') { response.end('Closed isolated harness'); cleanup(); return; }
    const url = new URL(request.url, 'http://localhost');
    let file;
    if (url.pathname.startsWith('/bundle/')) file = path.join(output, path.basename(url.pathname));
    else if (/^\/pharmacy-help\/[a-z-]+\.png$/.test(url.pathname)) file = path.join(root,'public','pharmacy-help',path.basename(url.pathname));
    else if (url.pathname.startsWith('/assets/')) {
      const asset=url.pathname.slice('/assets/'.length);
      if (!(asset.startsWith('styles/')&&asset.endsWith('.css')) && asset!=='node_modules/bootstrap/dist/css/bootstrap.min.css') { response.writeHead(403).end(); return; }
      file = path.join(root, asset);
    }
    if (file) {
      if (!file.startsWith(root+path.sep) && !file.startsWith(output+path.sep)) { response.writeHead(403).end(); return; }
      if (!fs.existsSync(file)) { response.writeHead(404).end(); return; }
      response.setHeader('Content-Type', file.endsWith('.css') ? 'text/css' : file.endsWith('.js') ? 'text/javascript' : file.endsWith('.png') ? 'image/png' : 'application/octet-stream');
      fs.createReadStream(file).pipe(response); return;
    }
    response.setHeader('Content-Type', 'text/html');
    response.end(`<!doctype html><html lang="en" data-bs-theme="light" style="--font-segoe:'Segoe UI',Tahoma,sans-serif;--theme-font-family:var(--font-segoe)"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Isolated Pharmacy Accounting verification</title><link rel="stylesheet" href="/assets/node_modules/bootstrap/dist/css/bootstrap.min.css"><link rel="stylesheet" href="/assets/styles/globals.css"></head><body><div id="root"></div><script src="/bundle/harness.js"></script></body></html>`);
  }).listen(0, '127.0.0.1', () => console.log(JSON.stringify({ url: `http://127.0.0.1:${server.address().port}`, output, pid: process.pid })));
});
