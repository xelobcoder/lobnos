const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
function profile(id, record) {
    const exports = {}, effects = [], requests = [];
    let index = 0;
    const initial = [record, false, '', 0];
    const source = fs.readFileSync(path.join(__dirname, '../app/clinicians/clinicianview/page.tsx'), 'utf8');
    vm.runInNewContext(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } }).outputText, { exports, require(name) {
        if (name === 'react') return { ...React, useState: () => [initial[index++], () => {}], useEffect: effect => effects.push(effect) };
        if (name === 'next/navigation') return { useSearchParams: () => new URLSearchParams({ clinicianid: id }) };
        if (name === 'next/link') return { __esModule: true, default: 'a' };
        if (name.endsWith('.css')) return {};
        if (name.endsWith('customFetch')) return { customFetch: async url => { requests.push(url); return { result: [record] }; } };
        return require(name);
    } });
    const html = renderToStaticMarkup(exports.default());
    effects.forEach(effect => effect());
    return { html, requests };
}
test('clinician profile shows recorded details and links all actions to that clinician', () => {
    const { html, requests } = profile('7', { name: 'Example Clinician', phone: '0241234567', occupation: 'Doctor' });
    assert.match(html, /Example Clinician/);
    assert.match(html, /tel:0241234567/);
    assert.match(html, /Not recorded/);
    assert.match(html, /add-new\?clinicianid=7/);
    assert.match(html, /payment-information\/7/);
    assert.deepEqual(requests, ['clinicians/getclinician?id=7']);
});
test('invalid clinician IDs never trigger a profile request', () => {
    const { requests } = profile('invalid', null);
    assert.equal(requests.length, 0);
});
