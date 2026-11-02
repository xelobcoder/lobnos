const ts = require('typescript');
const path = require('node:path');
module.exports = function (source) {
  if (this.resourcePath.endsWith('.css')) {
    let css = source;
    const names = {};
    if (this.resourcePath.endsWith('.module.css')) {
      const globals = [];
      css = css.replace(/:global\(([^)]+)\)/g, (_, value) => `GLOBALTOKEN${globals.push(value) - 1}END`);
      css = css.replace(/\.([a-zA-Z_][\w-]*)/g, (_, name) => {
        names[name] ||= `browser_${path.basename(this.resourcePath).replace(/\W/g, '_')}_${name}`;
        return `.${names[name]}`;
      });
      css = css.replace(/GLOBALTOKEN(\d+)END/g, (_, index) => globals[index]);
    }
    return `const style=document.createElement('style');style.textContent=${JSON.stringify(css)};document.head.append(style);export default ${JSON.stringify(names)};`;
  }
  return ts.transpileModule(source, {
    compilerOptions: { jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.ESNext, esModuleInterop: true },
    fileName: this.resourcePath,
  }).outputText;
};
