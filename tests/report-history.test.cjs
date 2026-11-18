const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');
const ts = require('typescript');

const root = path.join(__dirname, '..');

function createJsx(type, props, key) {
    return { type, props: { ...props, key } };
}

function load(filename, react) {
    const full = path.isAbsolute(filename) ? filename : path.join(root, filename);
    const resolved = ['', '.tsx', '.ts', '.jsx', '.js'].map(extension => full + extension)
        .find(file => fs.existsSync(file) && fs.statSync(file).isFile());
    if (!resolved) throw Error(`Missing test module: ${full}`);
    const exports = {};
    vm.runInNewContext(ts.transpileModule(fs.readFileSync(resolved, 'utf8'), {
        compilerOptions: {
            module: ts.ModuleKind.CommonJS,
            target: ts.ScriptTarget.ES2020,
            jsx: ts.JsxEmit.ReactJSX,
            esModuleInterop: true,
        },
    }).outputText, {
        exports,
        require(name) {
            if (name === 'react') return react || {};
            if (name === 'react/jsx-runtime') return { jsx: createJsx, jsxs: createJsx };
            if (name === 'next/navigation') return { useParams: () => ({ ascensionid: '25659' }) };
            if (name.endsWith('OperationalControlsWorkspace')) return { controlApi: async () => ({}) };
            if (name.startsWith('.')) return load(path.resolve(path.dirname(resolved), name), react);
            return require(name);
        },
    });
    return exports;
}

function nodes(tree) {
    if (!tree || typeof tree !== 'object') return [];
    if (Array.isArray(tree)) return tree.flatMap(nodes);
    if (typeof tree.type === 'function' && tree.type.name !== 'ReportRichText') {
        return [tree, ...nodes(tree.type(tree.props))];
    }
    return [tree, ...nodes(tree.props?.children)];
}

function text(tree) {
    if (tree == null || typeof tree === 'boolean') return '';
    if (typeof tree !== 'object') return String(tree);
    if (Array.isArray(tree)) return tree.map(text).join('');
    if (typeof tree.type === 'function') {
        return tree.type.name === 'ReportRichText' ? '' : text(tree.type(tree.props));
    }
    return text(tree.props?.children);
}

test('archived HTML reports render as rich report content instead of a laboratory table', () => {
    const archived = {
        version: 2,
        report: {
            testname: 'Ultrasound',
            records: [{ field: 'Findings', value: '<p>Normal appearance</p>' }],
            comments: '<p>Scanned comments</p>',
            literatureReview: '<p>Interpretation</p>',
        },
    };
    const state = [[], archived, false, null, '', false, false, '', ''];
    let stateIndex = 0;
    const page = load('app/operations/laboratory/validated/report-history/[ascensionid]/page.tsx', {
        useState: () => [state[stateIndex++], () => {}],
        useEffect() {},
        useRef: () => ({ current: false }),
    }).default;

    const tree = page();
    const rendered = nodes(tree);

    assert.equal(rendered.some(node => node.type === 'table'), false);
    assert.equal(rendered.filter(node => node.type?.name === 'ReportRichText').length, 3);
    assert.equal(rendered.find(node => node.type?.name === 'ReportRichText').props.html, '<p>Normal appearance</p>');
    assert.ok(rendered.some(node => node.type === 'strong' && node.props.children === 'Findings'));
});

test('ultrasound reports use report layout even when archived values contain no markup', () => {
    const archived = {
        version: 1,
        report: { testname: 'Ultrasound Abdomen', records: [{ field: 'Impression', value: 'Normal' }] },
    };
    const state = [[], archived, false, null, '', false, false, '', ''];
    let stateIndex = 0;
    const page = load('app/operations/laboratory/validated/report-history/[ascensionid]/page.tsx', {
        useState: () => [state[stateIndex++], () => {}],
        useEffect() {},
        useRef: () => ({ current: false }),
    }).default;

    const rendered = nodes(page());

    assert.equal(rendered.some(node => node.type === 'table'), false);
    assert.ok(rendered.some(node => node.type === 'div' && node.props.children?.[0]?.type === 'strong'));
});

test('ordinary laboratory results keep their archived values in a table', () => {
    const archived = {
        version: 1,
        report: { testname: 'Full blood count', records: [{ field: 'Haemoglobin', value: '12.5', units: 'g/dL' }] },
    };
    const state = [[], archived, false, null, '', false, false, '', ''];
    let stateIndex = 0;
    const page = load('app/operations/laboratory/validated/report-history/[ascensionid]/page.tsx', {
        useState: () => [state[stateIndex++], () => {}],
        useEffect() {},
        useRef: () => ({ current: false }),
    }).default;

    const rendered = nodes(page());

    assert.equal(rendered.some(node => node.type === 'table'), true);
    assert.equal(rendered.some(node => node.type?.name === 'ReportRichText'), false);
});

test('amendment HTML values use the rich-text renderer while ordinary values remain text', () => {
    const { ReportChangesTable } = load('components/ResultView/ReportAmendmentNotice.tsx');
    const tree = ReportChangesTable({
        changes: [{ field: 'Findings', before: '<p>Earlier</p>', after: 'Unchanged text' }],
    });
    const rendered = nodes(tree);
    const richText = rendered.find(node => node.type?.name === 'ReportRichText');

    assert.equal(richText.props.html, '<p>Earlier</p>');
    assert.match(text(tree), /Unchanged text/);
    assert.doesNotMatch(text(tree), /<p>Earlier<\/p>/);
});

test('HTML-escaped report tags are detected for safe decoding and rendering', () => {
    const { containsReportMarkup } = load('components/ResultView/ReportRichText.tsx');
    assert.equal(containsReportMarkup('&lt;p&gt;Encoded report&lt;/p&gt;'), true);
    assert.equal(containsReportMarkup('A plain result value'), false);
});
