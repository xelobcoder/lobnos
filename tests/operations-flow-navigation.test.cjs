const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');
const React = require('react');
const ts = require('typescript');
const root = path.join(__dirname, '..');
function load(file, mocks = require) {
    const result = ts.transpileModule(readFileSync(path.join(root, file), 'utf8'), {
        fileName: file, reportDiagnostics: true,
        compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
    });
    assert.deepEqual(result.diagnostics, []);
    const exports = {};
    vm.runInNewContext(result.outputText, { exports, require: mocks, URL, console, TextEncoder });
    return exports;
}
const nodes = tree => tree == null || typeof tree !== 'object' ? [] : Array.isArray(tree) ? tree.flatMap(nodes) : [tree, ...nodes(tree.props?.children)];
const text = tree => tree == null ? '' : typeof tree !== 'object' ? String(tree) : Array.isArray(tree) ? tree.map(text).join('') : text(tree.props?.children);
const button = (tree, label) => nodes(tree).find(node => node.props?.onClick && text(node) === label);
const icons = new Proxy({}, { get: () => () => null });

for (const flow of [0, 1]) test(`queue is visible on the laboratory home with completeFlow=${flow}`, () => {
    const Home = load('app/operations/laboratory/page.tsx', name => {
        if (name === 'react' || name === 'react/jsx-runtime') return require(name);
        if (name === 'next/link') return { __esModule: true, default: 'a' };
        if (name.endsWith('useApplicationContext')) return { useApplication: () => ({ settings: { completeFlow: flow } }) };
        return icons;
    }).default;
    assert.ok(nodes(Home()).some(node => node.type === 'a' && node.props.href === '/operations/queue'));
});

test('staff and patient navigation exposes the real queue and specimen history routes', () => {
    const cases = [['LaboratoryOperationsLinks', '/operations/queue'], ['PhlebotomyLinks', '/operations/queue'], ['crmLinks', '/operations/queue'], ['PatientPortalLinks', '/patientportal/samples']];
    for (const [file, destination] of cases) {
        const exported = load(`components/Layout/links/categories/${file}.tsx`, name => name === '@remixicon/react' ? icons : require(name));
        const links = exported.CrmLinks || Object.values(exported).find(Array.isArray);
        const flatten = values => values.flatMap(value => [value, ...flatten(value.children || [])]);
        assert.ok(flatten(links).some(link => link.link === destination), `${file} missing ${destination}`);
    }
});

const rejected = { id: 10, sampleUid: 'ORIGINAL', barcode: 'ORIGINAL', billingid: 20, status: 'rejected', sampleType: 'Blood', containerType: 'Tube', replacesSampleId: null, rejectionReason: 'Insufficient volume' };
const replacement = { ...rejected, id: 11, sampleUid: 'REPLACEMENT', status: 'accepted', replacesSampleId: 10, rejectionReason: null };
function patientPage(options = {}) {
    const state = [], endpoints = [];
    let cursor = 0;
    const Page = load('app/patientportal/samples/page.tsx', name => {
        if (name === 'react') return { ...React, useState: initial => { const key = cursor++; if (!(key in state)) state[key] = initial; return [state[key], next => { state[key] = typeof next === 'function' ? next(state[key]) : next; }]; } };
        if (name === 'react/jsx-runtime') return require(name);
        if (name === 'next/link') return { __esModule: true, default: 'a' };
        if (name.endsWith('usePortalResource')) return { usePortalResource: endpoint => {
            endpoints.push(endpoint);
            const list = endpoint?.includes('?page=');
            return { loading: false, error: options.error || '', reload() {}, data: options.error ? null : list
                ? { items: [rejected, replacement, { ...rejected, id: 12, sampleUid: 'NEEDS-RECOLLECTION' }], page: 1, total: 50, totalPages: 2 }
                : endpoint ? { sample: rejected, lineage: [rejected, replacement], events: [{ id: 1, sampleUid: 'ORIGINAL', type: 'rejected', reason: 'Insufficient volume' }, { id: 2, sampleUid: 'REPLACEMENT', type: 'collected' }], communications: [{ sampleUid: 'ORIGINAL', message: 'Please return for recollection', status: 'sent' }] } : null };
        } };
        if (name.endsWith('patientPortal')) return { formatDate: () => 'Recorded time' };
        if (name.endsWith('.css')) return {};
        if (name.endsWith('roleNavigationPolicy')) return load('lib/roleNavigationPolicy.ts', dependency => dependency.endsWith('/roles') ? load('components/Auth/roles.ts') : require(dependency));
        if (name.startsWith('.')) return load(path.relative(root, path.resolve(path.dirname(path.join(root, 'proxy.ts')), name + '.ts')), require);
        throw new Error(name);
    }).default;
    return { endpoints, render: () => { cursor = 0; return Page(); } };
}

test('patients can see a rejection, arrange recollection and inspect the original and replacement history', () => {
    const view = patientPage();
    const tree = view.render();
    assert.match(text(tree), /Insufficient volume/);
    const arrange = nodes(tree).find(node => node.type === 'a' && text(node) === 'Arrange recollection');
    assert.equal(arrange.props.href, '/patientportal/appointments');
    assert.equal(nodes(tree).filter(node => node.type === 'a' && text(node) === 'Arrange recollection').length, 1);
    assert.match(text(tree), /Replacement REPLACEMENT: accepted/);
    button(tree, 'View sample history').props.onClick();
    const history = view.render();
    assert.ok(view.endpoints.includes('patient-portal/samples/10'));
    assert.match(text(history), /original container/);
    assert.match(text(history), /replaces sample #10/);
    assert.match(text(history), /Please return for recollection/);
    assert.ok(!nodes(history).some(node => node.props?.onClick && text(node) === 'Complete collection'));
});

test('patient sample pages paginate through owned server results and surface errors with retry', () => {
    const view = patientPage();
    button(view.render(), 'Next').props.onClick(); view.render();
    assert.ok(view.endpoints.includes('patient-portal/samples?page=2'));
    const failed = patientPage({ error: 'Session expired' }).render();
    assert.match(text(failed), /Session expired/);
    assert.ok(button(failed, 'Retry'));
});

test('public kiosk routes remain outside staff authentication middleware matching', () => {
    const { config } = load('proxy.ts', name => {
        if (name === 'next/server') return { NextResponse: {} };
        if (name === 'jose') return { jwtVerify() {} };
        if (name.endsWith('roleNavigationPolicy')) return load('lib/roleNavigationPolicy.ts', dependency => dependency.endsWith('/roles') ? load('components/Auth/roles.ts') : require(dependency));
        if (name.startsWith('.')) return load(path.relative(root, path.resolve(path.dirname(path.join(root, 'proxy.ts')), name + '.ts')), require);
        throw new Error(name);
    });
    assert.ok(!config.matcher.some(pattern => pattern === '/:path*' || pattern.startsWith('/queue')));
    assert.ok(config.matcher.includes('/operations/:path*'));
});
