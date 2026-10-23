const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const React = require('react');

function page() {
    const values = [], requests = [];
    let cursor = 0;
    const output = {};
    const source = fs.readFileSync(path.join(__dirname, '../app/billing/expenses/reversed-payments/page.tsx'), 'utf8');
    vm.runInNewContext(ts.transpileModule(source, { compilerOptions: {
        module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true,
    } }).outputText, { exports: output, URLSearchParams, require(name) {
        if (name === 'react') return { ...React,
            useState(initial) { const key = cursor++; if (!(key in values)) values[key] = initial; return [values[key], next => { values[key] = typeof next === 'function' ? next(values[key]) : next; }]; },
            useRef(initial) { const key = cursor++; return values[key] ||= { current: initial }; }, useEffect() {},
        };
        if (name.endsWith('useApplicationContext')) return { useApplicationSettings: () => ({ applicationsettings: { user: { employeeid: 1 }, branchid: 2 } }) };
        if (name.endsWith('customFetch')) return { currencyFormatter: new Intl.NumberFormat('en-GH'), customFetch: async url => {
            requests.push(url); return { data: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 1 } };
        } };
        if (name.endsWith('.css')) return {};
        if (name === 'next/link') return { __esModule: true, default: 'a' };
        if (name === 'react-bootstrap') return { Button: 'button', Modal: Object.assign(() => null, { Header: 'header', Title: 'h2', Body: 'section', Footer: 'footer' }) };
        if (name === '@remixicon/react') return new Proxy({}, { get: () => 'svg' });
        return require(name);
    } });
    const render = () => { cursor = 0; return output.default(); };
    function find(node, predicate) {
        if (!React.isValidElement(node)) return;
        if (predicate(node)) return node;
        for (const child of React.Children.toArray(node.props.children)) { const found = find(child, predicate); if (found) return found; }
    }
    const submit = () => find(render(), element => element.type === 'form').props.onSubmit({ preventDefault() {} });
    const date = (name, value) => find(render(), element => element.type === 'input' && element.props.name === name).props.onChange({ target: { name, value } });
    return { requests, date, submit };
}

test('date filters are sent to the reversal API with staff and branch context', async () => {
    const view = page();
    view.date('from', '2026-10-01'); view.date('to', '2026-10-23'); view.submit();
    await new Promise(resolve => setImmediate(resolve));
    const url = new URL(view.requests[0], 'http://test/');
    assert.equal(url.searchParams.get('from'), '2026-10-01');
    assert.equal(url.searchParams.get('to'), '2026-10-23');
    assert.equal(url.searchParams.get('branchid'), '2');
    assert.equal(url.searchParams.get('page'), '1');
});

test('a reversed date range does not request misleading results', () => {
    const view = page();
    view.date('from', '2026-10-23'); view.date('to', '2026-10-01'); view.submit();
    assert.equal(view.requests.length, 0);
});
