const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");
const { build, root } = require("./build.cjs");

build().then(output => {
     const server = http.createServer((request, response) => {
          const url = new URL(request.url, "http://127.0.0.1");
          if (url.pathname === "/shutdown") {
               response.end("Synthetic theme fixture stopped");
               server.close(() => { fs.rmSync(output, { recursive: true, force: true }); process.exit(0); });
               return;
          }
          let file;
          if (url.pathname === "/fixture.js") file = path.join(output, "fixture.js");
          else if (url.pathname === "/assets/bootstrap.css") file = path.join(root, "node_modules", "bootstrap", "dist", "css", "bootstrap.min.css");
          else if (/^\/assets\/styles\/[a-z-]+\.css$/.test(url.pathname)) file = path.join(root, "styles", path.basename(url.pathname));
          if (file) {
               if (!fs.existsSync(file)) { response.writeHead(404).end(); return; }
               response.setHeader("Content-Type", file.endsWith(".css") ? "text/css" : "text/javascript");
               fs.createReadStream(file).pipe(response);
               return;
          }
          if (url.pathname !== "/") { response.writeHead(404).end(); return; }
          response.setHeader("Content-Type", "text/html");
          response.end('<!doctype html><html lang="en" data-bs-theme="light" style="--theme-font-family:system-ui,sans-serif"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Synthetic records theme fixture</title><link rel="stylesheet" href="/assets/bootstrap.css"><link rel="stylesheet" href="/assets/styles/globals.css"></head><body><div id="root"></div><script src="/fixture.js"></script></body></html>');
     }).listen(0, "127.0.0.1", () => console.log(JSON.stringify({ url: `http://127.0.0.1:${server.address().port}`, pid: process.pid })));
     const cleanup = () => server.close(() => { fs.rmSync(output, { recursive: true, force: true }); process.exit(0); });
     process.on("SIGINT", cleanup);
     process.on("SIGTERM", cleanup);
}).catch(error => { console.error(error); process.exitCode = 1; });
