const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');

const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'components/laboratory/QualityControl/TestInstrumentMappings.tsx'), 'utf8');
const exportsForPage = {};
vm.runInNewContext(ts.transpileModule(source, {
     compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
}).outputText, { exports: exportsForPage, require(name) {
     if (name.endsWith('/customFetch')) return { customFetch() {}, customFetchMutation() {} };
     if (name.endsWith('/useApplicationContext')) return { useApplicationSettings: () => ({ applicationsettings: { user: { role: 'manager' } } }) };
     if (name.endsWith('/roles')) return { roleAllowed: () => true };
     return require(name);
} });

test('mapping page explains compatibility and avoids automatic attribution', () => {
     const html = renderToStaticMarkup(React.createElement(exportsForPage.TestInstrumentMappings));
     assert.match(html, /Unconfigured tests retain their existing workflow/);
     assert.match(html, /explicitly selected active mapped instrument/);
     assert.match(html, /Previously recorded results cannot be reassigned/);
     assert.match(html, /Search tests/);
});
test('configuration and history use tenant-aware API helpers and paginated lists', () => {
     assert.match(source, /customFetch\(`test-instrument-mappings\?page=/);
     assert.match(source, /customFetch\(`devices\?page=/);
     assert.match(source, /\/history\?page=/);
     assert.match(source, /customFetchMutation\(`test-instrument-mappings\/\$\{selected\.id\}`, 'PUT'/);
     assert.match(source, /version: selected\.version, reason/);
     assert.match(source, /\['admin', 'manager'\]/);
     assert.match(source, /event\.before_data/);
     assert.match(source, /event\.after_data/);
     assert.match(fs.readFileSync(path.join(root, 'app/operations/laboratory/test-instruments/page.tsx'), 'utf8'), /<TestInstrumentMappings\s*\/>/);
});
