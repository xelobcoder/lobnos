const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { webpack } = require("next/dist/compiled/webpack/webpack");

const root = path.resolve(__dirname, "../../..");
const loader = path.join(root, "tests", "browser", "accounting-harness", "loader.cjs");

function build() {
     const output = fs.mkdtempSync(path.join(os.tmpdir(), "pls-records-theme-"));
     const compiler = webpack({
          mode: "development",
          context: root,
          entry: path.join(__dirname, "entry.tsx"),
          output: { path: output, filename: "fixture.js" },
          devtool: false,
          resolve: {
               extensions: [".tsx", ".ts", ".jsx", ".js", ".json"],
               alias: {
                    [path.join(root, "components", "Auth", "customFetch") + "$"]: path.join(__dirname, "api.ts"),
                    [path.join(root, "components", "Auth", "useApplicationContext") + "$"]: path.join(__dirname, "context.tsx"),
                    [path.join(root, "components", "reports", "reportPdf") + "$"]: path.join(__dirname, "api.ts"),
                    "next/navigation": path.join(__dirname, "context.tsx"),
                    "next/link": path.join(__dirname, "context.tsx"),
               },
          },
          module: { rules: [
               { test: /\.[jt]sx?$/, exclude: /node_modules/, use: loader },
               { test: /\.css$/, use: loader },
          ] },
     });
     return new Promise((resolve, reject) => {
          compiler.run((error, stats) => compiler.close(() => {
               if (error || stats.hasErrors()) {
                    fs.rmSync(output, { recursive: true, force: true });
                    reject(error || new Error(stats.toString({ errors: true, errorDetails: true })));
               } else {
                    resolve(output);
               }
          }));
     });
}

module.exports = { build, root };
