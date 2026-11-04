const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const test = require('node:test');
const ts = require('typescript');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');

function compile(file, requireModule, context = {}) {
    const exports = {};
    const output = ts.transpileModule(readFileSync(path.join(__dirname, '..', file), 'utf8'), {
        compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
    }).outputText;
    vm.runInNewContext(output, { exports, require: requireModule, ...context });
    return exports;
}
const navigation = compile(path.join('lib', 'ribbonNavigation.ts'), require);
const links = [
    { title: 'Overview', link: '/lab' },
    { title: 'Operations', link: '/lab/operations', children: [
        { title: 'Orders', link: '', children: [{ title: 'Pending requests', link: '/lab/pending' }] },
        { title: 'Samples', link: '', children: [
            { title: 'Collection', link: '/lab/collection?source=lab' },
            { title: 'Validation', link: '/lab/validation' },
        ] },
    ] },
    { title: 'Reporting', link: '', children: [{ title: 'History', link: '/lab/history' }] },
];

test('ribbon retains every configured destination, including navigable parents and query strings', () => {
    const tabs = navigation.buildRibbonTabs(links);
    assert.deepEqual(Array.from(tabs, tab => tab.title), ['Workspace', 'Operations', 'Reporting']);
    const commands = tabs.flatMap(tab => navigation.buildRibbonGroups(tab.items, tab.title).flatMap(group => group.commands));
    assert.deepEqual(Array.from(commands, item => item.link), [
        '/lab', '/lab/operations', '/lab/pending', '/lab/collection?source=lab', '/lab/validation', '/lab/history',
    ]);
    assert.deepEqual(Array.from(navigation.buildRibbonTabs([])), []);
});

test('active path chooses the deepest route using path boundaries and ignores query strings', () => {
    const find = pathname => Array.from(navigation.findActiveNavigationPath(links, pathname), item => item.title);
    assert.deepEqual(find('/lab/pending/123'), ['Operations', 'Orders', 'Pending requests']);
    assert.deepEqual(find('/lab/collection'), ['Operations', 'Samples', 'Collection']);
    assert.deepEqual(find('/laboratory'), []);
    assert.deepEqual(find('/lab'), ['Overview']);
    const duplicated = [{ title: 'Laboratory', link: '/lab', children: [{ title: 'Home', link: '/lab' }] }];
    assert.deepEqual(Array.from(navigation.findActiveNavigationPath(duplicated, '/lab'), item => item.title), ['Laboratory', 'Home']);
});

function harness(pathname = '/lab/pending', inputLinks = links, storage) {
    const states = [], refs = [], effects = [];
    let cursor = 0;
    let navigations = 0;
    const mocks = name => {
        if (name === 'react') return {
            ...React,
            useId: () => 'test-ribbon',
            useMemo: callback => callback(),
            useEffect: callback => { effects.push(callback); },
            useRef: initial => {
                const index = cursor++;
                return refs[index] ||= { current: initial };
            },
            useState: initial => {
                const index = cursor++;
                if (!(index in states)) states[index] = initial;
                return [states[index], value => { states[index] = typeof value === 'function' ? value(states[index]) : value; }];
            },
        };
        if (name.endsWith('ribbonNavigation')) return navigation;
        if (name.endsWith('.module.css')) return { __esModule: true, default: new Proxy({}, { get: (_, key) => key }) };
        if (name === 'next/link') return { __esModule: true, default: ({ prefetch, ...props }) => React.createElement('a', props) };
        return require(name);
    };
    const Ribbon = compile(path.join('components', 'Layout', 'RibbonNavigation.tsx'), mocks,
        storage ? { window: { localStorage: storage } } : {}).default;
    const props = { links: inputLinks, pathname, onNavigate: () => navigations++ };
    const render = () => { cursor = 0; effects.length = 0; return Ribbon(props); };
    const find = (node, predicate) => {
        if (Array.isArray(node)) return node.map(child => find(child, predicate)).find(Boolean);
        if (!node || typeof node !== 'object') return;
        if (predicate(node)) return node;
        return find(node.props?.children, predicate);
    };
    return {
        render, props,
        html: () => renderToStaticMarkup(render()),
        mount: () => { render(); for (const effect of effects) effect(); },
        panel: () => find(render(), node => node.props?.role === 'tabpanel'),
        tab: label => find(render(), node => node.props?.role === 'tab' && node.props.children === label),
        toggle: () => find(render(), node => node.props?.['aria-controls'] === 'test-ribbon-commands' && node.props?.role !== 'tab'),
        command: href => find(render(), node => node.props?.href === href),
        group: label => find(render(), node => node.props?.role === 'group' && node.props['aria-label'] === label),
        get navigations() { return navigations; },
    };
}

test('tab switching changes grouped commands without navigation or workspace mutation', () => {
    const h = harness();
    assert.equal(h.tab('Operations').props['aria-selected'], true);
    assert.match(h.html(), /role="group" aria-label="Samples"/);
    h.tab('Reporting').props.onClick();
    assert.equal(h.tab('Reporting').props['aria-selected'], true);
    assert.match(h.html(), /href="\/lab\/history"/);
    assert.doesNotMatch(h.html(), /href="\/lab\/pending"/);
    assert.equal(h.props.pathname, '/lab/pending');
    assert.equal(h.navigations, 0);
});

test('tabs support arrow keys, Home, End, wrapping, and a single tab stop', () => {
    const h = harness();
    const key = (label, value) => {
        let prevented = false;
        h.tab(label).props.onKeyDown({ key: value, preventDefault: () => { prevented = true; } });
        assert.ok(prevented);
    };
    key('Operations', 'ArrowRight');
    assert.equal(h.tab('Reporting').props.tabIndex, 0);
    assert.equal(h.tab('Operations').props.tabIndex, -1);
    key('Reporting', 'ArrowRight');
    assert.equal(h.tab('Workspace').props['aria-selected'], true);
    key('Workspace', 'ArrowLeft');
    assert.equal(h.tab('Reporting').props['aria-selected'], true);
    key('Reporting', 'Home');
    assert.equal(h.tab('Workspace').props['aria-selected'], true);
    key('Workspace', 'End');
    assert.equal(h.tab('Reporting').props['aria-selected'], true);
});

test('direct routes and browser path changes synchronize the ribbon and active command', () => {
    const h = harness('/lab/collection');
    assert.match(h.html(), /href="\/lab\/collection\?source=lab"[^>]*aria-current="page"/);
    h.tab('Reporting').props.onClick();
    h.props.pathname = '/lab/validation/123';
    assert.equal(h.tab('Operations').props['aria-selected'], true);
    assert.match(h.html(), /href="\/lab\/validation"[^>]*aria-current="page"/);
    h.command('/lab/validation').props.onClick();
    assert.equal(h.navigations, 1);
});

test('ribbon can collapse and reopen without dropping commands', () => {
    const h = harness();
    h.toggle().props.onClick();
    assert.equal(h.toggle().props['aria-expanded'], false);
    assert.match(h.html(), /role="tabpanel"[^>]*hidden/);
    h.toggle().props.onClick();
    assert.equal(h.toggle().props['aria-expanded'], true);
    assert.doesNotMatch(h.html(), /hidden=""/);
});

test('empty authorized navigation renders no ribbon or invented actions', () => {
    assert.equal(harness('/lab', []).render(), null);
});

test('facility settings exposes the fourth saved layout without a decorative form panel', () => {
    const source = readFileSync(path.join(__dirname, '..', 'app', 'settings', 'applicationsettings', 'page.tsx'), 'utf8');
    assert.match(source, /<option value="ribbon">Office-inspired ribbon<\/option>/);
    assert.match(source, /'applicationsettings\/workspace-layout',\s*'PATCH',\s*\{ workspaceLayout \}/);
    assert.match(source, /<section[^>]*aria-labelledby="workspace-layout-heading"/);
    assert.match(source, /role=\{workspaceLayoutMessage\.type === 'danger' \? 'alert' : 'status'\}/);
});

test('Word-style commands retain accessible icons and full labels above the group caption', () => {
    const h = harness('/lab/collection');
    const command = h.command('/lab/collection?source=lab');
    const [icon, label] = command.props.children;
    assert.equal(icon.props.className, 'commandIcon');
    assert.equal(icon.props['aria-hidden'], 'true');
    assert.equal(label.props.className, 'commandLabel');
    assert.equal(label.props.children, 'Collection');
    assert.equal(command.props.title, 'Collection');
    const css = readFileSync(path.join(__dirname, '..', 'components', 'Layout', 'RibbonLayout.module.css'), 'utf8');
    assert.match(css, /\.command \{[\s\S]*?flex-direction: column;[\s\S]*?text-align: center;/);
    assert.match(css, /\.commandIcon svg \{\s*width: 32px;\s*height: 32px;/);
    assert.match(css, /font-family: var\(--theme-font-family/);
    assert.match(css, /--ribbon-surface: var\(--bs-body-bg\)/);
    assert.match(css, /--ribbon-chrome: var\(--bs-tertiary-bg\)/);
    assert.match(css, /\.groupTitle \{[\s\S]*?text-align: center;/);
    assert.doesNotMatch(h.html(), /ribbon-rows|badge|rounded-pill/);
});

const denseLinks = [
    { title: 'Overview', link: '/lab' },
    { title: 'Operations', link: '', children: [
        { title: 'Orders', link: '', children: [
            { title: 'Pending requests', link: '/lab/pending' },
            { title: 'Approved requests', link: '/lab/approved' },
            { title: 'Rejected requests', link: '/lab/rejected' },
            { title: 'Archived requests', link: '/lab/archived' },
        ] },
        { title: 'Samples', link: '', children: [{ title: 'Collection', link: '/lab/collection' }] },
    ] },
];

test('crowded groups switch to compact command rows while small groups keep large tiles', () => {
    const h = harness('/lab/pending', denseLinks);
    const list = node => node.props.children[0].props.className;
    assert.equal(list(h.group('Orders')), 'commandList compact');
    assert.equal(list(h.group('Samples')), 'commandList');
    const css = readFileSync(path.join(__dirname, '..', 'components', 'Layout', 'RibbonLayout.module.css'), 'utf8');
    assert.match(css, /\.commandList\.compact \{[\s\S]*?grid-template-rows: repeat\(3,/);
    assert.match(css, /\.compact \.command \{[\s\S]*?flex-direction: row;/);
    assert.match(css, /\.compact \.commandIcon svg \{\s*width: 18px;\s*height: 18px;/);
});

test('a collapsed ribbon opens the clicked tab as a flyout and closes it after navigating', () => {
    const h = harness();
    h.toggle().props.onClick();
    assert.ok(h.panel().props.hidden);
    h.tab('Reporting').props.onClick();
    const panel = h.panel();
    assert.equal(panel.props.hidden, false);
    assert.equal(panel.props.className, 'commands flyout');
    h.command('/lab/history').props.onClick();
    assert.equal(h.navigations, 1);
    assert.ok(h.panel().props.hidden);
    h.tab('Reporting').props.onClick();
    h.render().props.onKeyDown({ key: 'Escape' });
    assert.ok(h.panel().props.hidden);
    const css = readFileSync(path.join(__dirname, '..', 'components', 'Layout', 'RibbonLayout.module.css'), 'utf8');
    assert.match(css, /\.commands\.flyout:not\(\[hidden\]\) \{[\s\S]*?position: absolute;/);
});

test('the collapse preference is restored on mount and saved when toggled', () => {
    const store = new Map([['pls.ribbon.collapsed', 'true']]);
    const storage = {
        getItem: key => (store.has(key) ? store.get(key) : null),
        setItem: (key, value) => { store.set(key, value); },
    };
    const h = harness('/lab/pending', links, storage);
    assert.equal(h.toggle().props['aria-expanded'], true);
    h.mount();
    assert.equal(h.toggle().props['aria-expanded'], false);
    h.toggle().props.onClick();
    assert.equal(store.get('pls.ribbon.collapsed'), 'false');
    assert.equal(h.toggle().props['aria-expanded'], true);
});
