const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');
const ts = require('typescript');

const root = path.join(__dirname, '..');
const nodes = tree => !tree || typeof tree !== 'object' ? [] : Array.isArray(tree)
    ? tree.flatMap(nodes)
    : [tree, ...nodes(tree.props?.children)];
const text = tree => tree == null || typeof tree === 'boolean' ? '' : typeof tree !== 'object' ? String(tree)
    : Array.isArray(tree) ? tree.map(text).join('') : text(tree.props?.children);

function renderResult(records) {
    let stateIndex = 0;
    const values = ['Ultrasound Report', records, false];
    const react = {
        useState: () => [values[stateIndex++], () => {}],
        useEffect() {},
    };
    const exports = {};
    const file = path.join(root, 'components/ResutlUI/useCustomResultTemplating.jsx');
    const source = ts.transpileModule(readFileSync(file, 'utf8'), {
        compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
    }).outputText;
    vm.runInNewContext(source, {
        exports,
        require(name) {
            if (name === 'react') return react;
            if (name === 'react/jsx-runtime') return require(name);
            if (name.includes('ResultViewHtmlGenerator')) return { __esModule: true, default: 'LabResultRow' };
            if (name.endsWith('ReportRichText')) return { __esModule: true, default: 'SafeReportRichText' };
            if (name.endsWith('Loader')) return { __esModule: true, default: 'Loader' };
            return {};
        },
    });
    return exports.default({ billingid: 1, testid: 2, test: 'Ultrasound', patientid: 3, isResultView: false });
}

test('ultrasound validation preview renders report content instead of the laboratory result table', () => {
    const tree = renderResult([
        { fieldid: 1, field: 'Findings', value: '<p>Normal appearance</p>' },
        { fieldid: 2, field: 'Impression', value: '<p>No abnormality detected</p>' },
    ]);

    assert.equal(nodes(tree).some(node => node.type === 'table'), false);
    assert.equal(nodes(tree).filter(node => node.type === 'SafeReportRichText').length, 2);
    assert.match(text(tree), /Findings/);
    assert.match(text(tree), /Impression/);
    assert.doesNotMatch(text(tree), /<p>|<\/p>/);
});

test('ordinary laboratory results continue to use the result table', () => {
    const tree = renderResult([{ fieldid: 1, field: 'Hemoglobin', value: '12.5' }]);

    assert.equal(nodes(tree).some(node => node.type === 'table'), true);
    assert.equal(nodes(tree).some(node => node.type === 'SafeReportRichText'), false);
});

test('rich-text report sanitizer never flashes source HTML as visible text', () => {
    const exports = {};
    const file = path.join(root, 'components/ResultView/ReportRichText.tsx');
    const source = ts.transpileModule(readFileSync(file, 'utf8'), {
        compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
    }).outputText;
    vm.runInNewContext(source, {
        exports,
        require(name) {
            if (name === 'react') return { useEffect() {}, useState: initial => [initial, () => {}] };
            if (name === 'react/jsx-runtime') return require(name);
            throw new Error(`Unexpected import ${name}`);
        },
    });
    const tree = exports.default({ html: '<p>Normal appearance</p>' });

    assert.equal(text(tree), '');
    assert.equal(nodes(tree).some(node => node.type === 'div' && node.props['aria-busy'] === 'true'), true);
});
