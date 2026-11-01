const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

test('new clinical pages use the billing strategy design source', () => {
    for (const file of [
        'app/operations/imaging/page.tsx',
        'app/operations/laboratory/test-panels/layout.tsx',
        'components/inventory/DepartmentStockWorkspace.tsx',
    ]) {
        const source = read(file);
        assert.match(source, /billing-strategy\/StrategyWorkspace\.module\.css/);
        assert.match(source, /ui\.workspace/);
        assert.match(source, /ui\.header/);
        if (file !== 'app/operations/imaging/page.tsx') {
            assert.match(source, /ui\.heading/);
            assert.match(source, /ui\.icon/);
            assert.match(source, /ui\.eyebrow/);
        }
        assert.match(source, /<h1(?:\s[^>]*)?>/);
    }
});

test('laboratory layout wraps all existing editor pages without replacing their workflows', () => {
    const exports = {};
    const createElement = (type, props, ...children) => ({ type, props: { ...props, children } });
    const css = new Proxy({}, { get: (_, key) => String(key) });
    vm.runInNewContext(ts.transpileModule(read('app/operations/laboratory/test-panels/layout.tsx'), {
        compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.React },
    }).outputText, {
        exports, React: { createElement },
        require: name => name.endsWith('.module.css')
            ? { default: css, __esModule: true }
            : { RiTestTubeLine: 'TestIcon' },
    });
    const child = { type: 'ExistingEditor', props: {} };
    const tree = exports.default({ children: child });
    assert.equal(tree.type, 'section');
    assert.equal(tree.props.className, 'workspace');
    const content = tree.props.children.find(node => node.props.className === 'content');
    assert.equal(content.props.children[0], child);
    for (const suffix of ['testlist/page.tsx', 'testlist/[id]/page.tsx', 'testlist/createcustomtest/page.tsx']) {
        assert.match(read(`app/operations/laboratory/test-panels/${suffix}`), /export \{ default \} from/);
    }
});

test('clinical styling is responsive and inherits theme tokens instead of hardcoding a new palette', () => {
    const css = read('components/operations/ClinicalWorkspace.module.css');
    assert.match(css, /grid-template-columns: repeat\(3, minmax\(0, 1fr\)\)/);
    assert.match(css, /@media \(max-width: 600px\)/);
    assert.match(css, /grid-template-columns: minmax\(0, 1fr\)/);
    for (const token of ['paper', 'line', 'soft', 'accent', 'deep', 'muted']) {
        assert.ok(css.includes(`var(--${token})`), token);
    }
    assert.doesNotMatch(css, /#[0-9a-f]{3,8}\b/i);
    assert.match(read('components/Billing/billing-strategy/StrategyWorkspace.module.css'), /:focus-visible/);
});

test('imaging uses compact laboratory-style cards without dropping links or the stock warning', () => {
    const source = read('app/operations/imaging/page.tsx');
    assert.match(source, /groupLinks\.map\(item =>/);
    assert.match(source, /links\.filter\(item => isReportLink\(item\.link\) === group\.reports\)/);
    assert.match(source, /Daily workflows/);
    assert.match(source, /Reports & oversight/);
    assert.match(source, /href=\{item\.link\}/);
    assert.match(source, /stockAccess.*required/);
    assert.match(source, /permissionRequired &&/);
    assert.match(source, /role="alert"/);
    assert.match(source, /Stock permission required/);
    assert.match(source, /styles\.permissionPath/);
    assert.match(source, /styles\.dashboardHeader/);
    assert.match(source, /styles\.cardHeading/);
    assert.doesNotMatch(source, /RiArrowRight|>Manage </);
    assert.match(source, /styles\.cardIcon.*aria-hidden="true"/);
    assert.doesNotMatch(source, /Open workspace/);
    const css = read('components/operations/ClinicalWorkspace.module.css');
    assert.match(css, /\.cards\s*\{[^}]*grid-template-columns: repeat\(3, minmax\(0, 1fr\)\)/);
    assert.match(css, /\.cards \.card\s*\{[^}]*flex-direction: column/);
    assert.match(css, /\.cards \.card\s*\{[^}]*padding: 16px/);
    assert.match(css, /\.cards \.card p\s*\{[^}]*line-height: 1\.4/);
});

test('imaging uses the laboratory heading and icon colors', () => {
    const laboratory = read('app/operations/laboratory/page.tsx');
    const imaging = read('app/operations/imaging/page.tsx');
    const colors = source => source.match(/const (?:iconColors|colors) = (\[[^\]]+\])/)[1];
    assert.equal(colors(imaging), colors(laboratory));
    assert.match(imaging, /<h1 style=\{\{ color: '#1E88E5' \}\}/);
    assert.match(imaging, /color: iconColors\[index % iconColors\.length\]/);
});

test('imaging reports share billing strategy styling while retaining data and access contracts', () => {
    const audit = read('app/operations/imaging/audit/page.tsx');
    const analytics = read('app/analytics/imaging/page.tsx');
    for (const source of [audit, analytics]) {
        assert.match(source, /billing-strategy\/StrategyWorkspace\.module\.css/);
        assert.match(source, /className=\{ui\.workspace\}/);
        assert.match(source, /className=\{ui\.header\}/);
        assert.match(source, /AnalyticSummaryCard/);
        assert.match(source, /<PrimeTable/);
        assert.match(source, /role="alert"/);
        assert.match(source, /Retry loading/);
        assert.doesNotMatch(source, /<Badge|className="badge/);
        const result = ts.transpileModule(source, {
            compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.React },
            reportDiagnostics: true,
        });
        assert.deepEqual((result.diagnostics || []).filter(diagnostic => diagnostic.category === ts.DiagnosticCategory.Error), []);
    }
    assert.match(audit, /roleAllowed\(role, \['admin'\]\)/);
    assert.match(audit, /if \(!isAdmin\) return <Authorization/);
    assert.match(audit, /count: String\(PAGE_SIZE\)/);
    assert.match(audit, /!isLoading && !error &&/);
    assert.match(audit, /isLoading \? <Loader \/> : !error &&/);
    for (const field of ['case', 'employee', 'action', 'start', 'end']) {
        assert.ok(audit.includes(`htmlFor="imaging-audit-${field}"`));
        assert.ok(audit.includes(`id="imaging-audit-${field}"`));
    }
    assert.match(analytics, /<DateFilterReusable/);
    assert.match(analytics, /operations\/imaging\/analytics\?startDate=/);
    assert.match(analytics, /showModality && casesByModality\.length > 0/);
    assert.match(analytics, /showDay && casesByDay\.length > 0/);
});

test('stock workspace retains all actions and uses billing strategy summary and feedback styles', () => {
    const source = read('components/inventory/DepartmentStockWorkspace.tsx');
    for (const className of ['stats', 'stat', 'secondary', 'primary', 'error', 'success']) {
        assert.ok(source.includes(`ui.${className}`), className);
    }
    for (const permission of ['can_request', 'can_receive', 'can_consume', 'can_issue', 'can_manage_access']) {
        assert.ok(source.includes(`data.${permission}`), permission);
    }
    for (const label of ['Requisitions & stock', 'Department analytics', 'Movement history', 'Staff permissions']) {
        assert.ok(source.includes(label), label);
    }
});
