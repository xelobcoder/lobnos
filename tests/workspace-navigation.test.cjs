const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');
const ts = require('typescript');

function compile(relativePath, mocks, globals = {}) {
    const exports = {};
    vm.runInNewContext(ts.transpileModule(readFileSync(path.join(__dirname, '..', relativePath), 'utf8'), {
        compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
    }).outputText, { exports, require: mocks, ...globals });
    return exports;
}

const { PayrollLinks } = compile(path.join('components', 'Layout', 'links', 'categories', 'PayrollLinks.tsx'), require);

test('new layout uses Zoho-style Inter navigation typography', () => {
    const styles = readFileSync(path.join(__dirname, '..', 'components', 'Layout', 'WorkspaceLayout.module.css'), 'utf8');
    const rootLayout = readFileSync(path.join(__dirname, '..', 'app', 'layout.tsx'), 'utf8');
    assert.match(rootLayout, /import \{ Inter,/);
    assert.match(rootLayout, /inter\.variable/);
    assert.match(styles, /font-family: var\(--theme-font-family, var\(--font-inter\)\)/);
    assert.match(styles, /font-weight: 400;\s+font-size: 13px;\s+line-height: 1\.6;/);
    assert.match(styles, /\.active \{[\s\S]*?font-weight: 400;/);
});

test('context refresh unwraps the validated user before updating the application context', () => {
    const mainLayout = readFileSync(path.join(__dirname, '..', 'components', 'Layout', 'MainLayout.tsx'), 'utf8');
    const primeLayout = readFileSync(path.join(__dirname, '..', 'components', 'Layout', 'PrimeLayout.tsx'), 'utf8');
    assert.match(mainLayout, /const authenticatedUser = user\?\.user \?\? user;/);
    assert.match(mainLayout, /if \(!authenticatedUser\)/);
    assert.match(mainLayout, /const freshSettings = \{\s+\.\.\.user,\s+user: authenticatedUser,\s+settings,/);
    assert.match(primeLayout, /const \{ company, user, branchid, tenantId, daysToExpiration, settings \} = useApplicationSettings\(\)\.applicationsettings;/);
    assert.match(primeLayout, /\{company \|\| 'Organization'\}/);
});

test('Claude layout has its own light, warm sidebar treatment', () => {
    const styles = readFileSync(path.join(__dirname, '..', 'components', 'Layout', 'WorkspaceLayout.module.css'), 'utf8');
    const html = renderLayout('claude');
    assert.match(html, /claudeLayout/);
    assert.match(styles, /\.claudeLayout \{[\s\S]*?grid-template-areas: "sidebar header" "sidebar content"/);
    assert.match(styles, /\.claudeLayout \{[\s\S]*?--workspace-sidebar-bg: #f9f8f6/);
    assert.match(styles, /\.claudeLayout \.sidebar \{[\s\S]*?height: 100dvh;/);
    assert.match(styles, /\.claudeLayout \.active \{[\s\S]*?background: var\(--workspace-selected\)/);
    assert.match(html, /claudeSidebarHeader/);
    assert.match(html, /claudeAppsButton/);
    assert.match(html, /claudeAccount/);
    assert.match(styles, /\.claudeLayout \.companyName \{[\s\S]*?text-overflow: ellipsis/);
    assert.match(styles, /\.claudeLayout \.companyName \{\s+display: block !important;\s+max-width: 44vw;/);
});

test('new layout shows child icons with Zoho-style indentation and active treatment', () => {
    const styles = readFileSync(path.join(__dirname, '..', 'components', 'Layout', 'WorkspaceLayout.module.css'), 'utf8');
    assert.match(styles, /\.shell \.sidebar \{[\s\S]*?width: 250px;/);
    assert.match(styles, /\.submenu \{[\s\S]*?margin: 0;\s+padding: 0;\s+\}/);
    assert.doesNotMatch(styles.match(/\.submenu \{[\s\S]*?\}/)[0], /border-left/);
    assert.match(styles, /\.submenu \.item \{[\s\S]*?padding: 8px 12px 8px 35px/);
    assert.doesNotMatch(styles, /\.submenu \.child \.icon\s*\{\s*display:\s*none/);
    assert.match(styles, /\.item\.child \.icon svg \{[\s\S]*?width: 16px;\s+height: 16px;/);
    assert.match(styles, /\.active \{[\s\S]*?background: #408dfb;\s+color: #fff;/);
    assert.doesNotMatch(styles.match(/\.active \{[\s\S]*?\}/)[0], /box-shadow/);
});

function renderLayout(preference, actions = [], options = {}) {
    const React = require('react');
    const { renderToStaticMarkup } = require('react-dom/server');
    const state = [];
    let stateIndex = 0;
    const savedPreferences = [];
    const location = { pathname: options.pathname || '/human-resource/payroll/periods', href: '' };
    const links = options.links || PayrollLinks;
    const navigation = { superAdminNavigation: () => options.platformLinks || links };
    const mocks = (name) => {
        if (name === 'react/jsx-runtime') return require(name);
        if (name === 'react') return {
            ...React,
            useState: initial => {
                const index = stateIndex++;
                if (!(index in state)) state[index] = initial === 'classic' ? preference : initial;
                return [state[index], value => { state[index] = typeof value === 'function' ? value(state[index]) : value; }];
            },
            useEffect: () => {},
            useMemo: callback => callback(),
            useCallback: callback => callback,
            useRef: initial => ({ current: initial }),
            useId: () => 'ribbon-test',
        };
        if (name.endsWith('.module.css')) return {
            __esModule: true,
            default: new Proxy({}, { get: (_, key) => `${options.scopedCSS ? (name.includes('WorkspaceLayout') ? 'w_' : name.includes('RibbonLayout') ? 'r_' : 'p_') : ''}${String(key)}` }),
        };
        if (name === '@remixicon/react') return require(name);
        if (name === 'next/link') return {
            __esModule: true,
            default: ({ prefetch, ...props }) => React.createElement('a', props),
        };
        if (name.endsWith('ribbonNavigation')) return compile(path.join('lib', 'ribbonNavigation.ts'), require);
        if (name.endsWith('RibbonNavigation')) return compile(path.join('components', 'Layout', 'RibbonNavigation.tsx'), mocks).default;
        if (name.endsWith('useApplicationContext')) return { useApplicationSettings: () => ({
            applicationsettings: {
                company: 'Test laboratory',
                user: { role: options.role || 'admin', username: 'Tester' },
                settings: {
                    workspaceLayout: options.workspaceLayout || preference,
                },
            },
        }) };
        if (name.endsWith('crmLinks')) return {MarketerLinks: []};
        if (name.endsWith('roleNavigationPolicy')) return compile('lib/roleNavigationPolicy.ts', mocks);
        if (name.endsWith('RoleSidebars')) return compile('components/Layout/links/RoleSidebars.tsx', mocks);
        if (name.includes('/categories/')) return compile('components/Layout/links/categories/' + name.split('/').at(-1) + '.tsx', mocks);
        if (name.endsWith('RoleLinks')) return { AdminRoleLinks: [], SuperAdminRoleLinks: [] };
        if (name.endsWith('SuperAdminLinks')) return navigation;
        if (name.endsWith('ThemeProvider')) return { useTheme: () => ({ theme: 'light', toggleTheme: () => {} }) };
        if (name === 'next/navigation') return {
            usePathname: () => location.pathname,
            useRouter: () => ({ push: () => {} }),
            useSearchParams: () => new URLSearchParams(options.hideSidebar ? 'isOpenSideBarShow=false' : ''),
        };
        if (name.endsWith('facilityModuleAccess')) return { canAccessFacilityModule: destination => !options.deniedPaths?.includes(destination) };
        if (name.endsWith('/roles')) return compile(path.join('components', 'Auth', 'roles.ts'), require);
        if (name.endsWith('FontSelector')) return { FontSelector: () => null };
        if (name.endsWith('themes') || name.endsWith('customFetch')) return {};
        throw new Error(`Unexpected import: ${name}`);
    };
    const component = compile(path.join('components', 'Layout', 'PrimeLayout.tsx'), mocks, {
        URLSearchParams,
        window: { location, localStorage: { setItem: (key, value) => savedPreferences.push({ key, value }) } },
    });
    const props = { links, children: React.createElement('div', null, 'Page content') };
    const render = () => {
        stateIndex = 0;
        return component.default(props);
    };
    const findButton = (node, label) => {
        if (Array.isArray(node)) return node.map(child => findButton(child, label)).find(Boolean);
        if (!node || typeof node !== 'object') return undefined;
        if (node.type === 'button' && (node.props['aria-label'] === label || node.props.title === label)) return node;
        return findButton(node.props?.children, label);
    };
    let tree = render();
    for (const action of actions) {
        if (action === 'Escape') {
            tree.props.onKeyDown({ key: 'Escape' });
            tree = render();
            continue;
        }
        const button = findButton(tree, action);
        assert.ok(button, `Missing action: ${action}`);
        button.props.onClick();
        tree = render();
    }
    const html = renderToStaticMarkup(tree);
    return options.result ? { html, location, savedPreferences } : html;
}

function titles(items) {
    return items.flatMap(item => [item.title, ...titles(item.children || [])]);
}

test('new sidebar preserves every existing payroll label in its original order', () => {
    const html = renderLayout('zoho');
    const aside = html.match(/<aside\b[\s\S]*?<\/aside>/)[0];
    let position = 0;
    for (const title of PayrollLinks.map(item => item.title)) {
        const next = aside.indexOf(`>${title}</span>`, position);
        assert.ok(next >= position, `Missing or reordered link: ${title}`);
        position = next + title.length;
    }
    assert.doesNotMatch(aside, />Clinical<|>Administration<|>Finance</);
    assert.doesNotMatch(html, /workspaceToolbar|Go to page/);
    assert.match(html, /Prime Laboratory Software/);
    assert.doesNotMatch(aside, /Lobnos/);
    assert.match(html, /aria-label="All Periods" aria-current="page"/);
    assert.doesNotMatch(aside, />All Compensations<\/span>/);
});

test('active section opens by default and only one sibling section stays open', () => {
    const initial = renderLayout('zoho');
    assert.match(initial, />All Periods<\/span>/);
    assert.doesNotMatch(initial, />All Compensations<\/span>/);
    const nextSection = renderLayout('zoho', ['Compensation']);
    assert.match(nextSection, />All Compensations<\/span>/);
    assert.doesNotMatch(nextSection, />All Periods<\/span>/);
});

test('navigation group can be collapsed and reopened', () => {
    const collapsed = renderLayout('zoho', ['Payroll Periods']);
    assert.doesNotMatch(collapsed, />All Periods<\/span>/);
    assert.doesNotMatch(collapsed, />All Compensations<\/span>/);
    const reopened = renderLayout('zoho', ['Payroll Periods', 'Payroll Periods']);
    assert.match(reopened, />All Periods<\/span>/);
});

test('every existing destination remains navigable', () => {
    const visit = (items, groups = []) => {
        for (const item of items) {
            if (item.children?.length) visit(item.children, [...groups, item.title]);
            else {
                const { location } = renderLayout('zoho', [...groups, item.title], { result: true, pathname: '/other-page' });
                assert.equal(location.href, item.link, item.title);
            }
        }
    };
    visit(PayrollLinks);
});

test('compact group buttons expand the sidebar and reveal their original pages', () => {
    const compact = renderLayout('zoho', ['Collapse navigation']);
    assert.match(compact, /collapsed/);
    assert.match(compact, /aria-label="Payroll Periods" aria-expanded="false"/);
    const expanded = renderLayout('zoho', ['Collapse navigation', 'Payroll Periods']);
    assert.match(expanded, /aria-label="Payroll Periods" aria-expanded="true"/);
    assert.match(expanded, />All Periods<\/span>/);
});

test('all presentations retain role and module filtering', () => {
    const links = [
        { title: 'Allowed', link: '/allowed' },
        { title: 'Restricted', link: '/restricted', roles: ['super-admin'] },
        { title: 'Disabled', link: '/disabled' },
    ];
    for (const preference of ['classic', 'zoho', 'claude', 'ribbon', 'slack', 'portal']) {
        const html = renderLayout(preference, [], { links, deniedPaths: ['/disabled'] });
        assert.match(html, />Allowed<\/span>/);
        assert.doesNotMatch(html, /Restricted|Disabled/);
    }
});

test('super-admin retains the same complete platform navigation in all layouts', () => {
    for (const preference of ['classic', 'zoho', 'claude', 'ribbon', 'slack', 'portal']) {
        const options = {
            role: 'super-admin',
            links: [{ title: 'Platform and settings', link: '', children: [{ title: 'Audit logs', link: '/settings/facilities/audit' }] }],
        };
        const html = renderLayout(preference, preference === 'classic' || preference === 'ribbon' ? [] : ['Platform and settings'], options);
        assert.match(html, /Platform and settings/);
        assert.match(html, /Audit logs/);
    }
});

test('facility setting selects the same layout for every signed-in user without a personal toggle', () => {
    const settings = readFileSync(path.join(__dirname, '..', 'app', 'settings', 'applicationsettings', 'page.tsx'), 'utf8');
    for (const [selected, expected] of [
        ['classic', /container /],
        ['zoho', /class="container shell/],
        ['claude', /claudeLayout/],
        ['ribbon', /Workspace ribbon/],
        ['portal', /portalLayout/],
    ]) {
        const html = renderLayout(selected, [], { workspaceLayout: selected, role: 'scientist' });
        assert.match(html, expected);
        assert.doesNotMatch(html, /Use the new layout|Use the classic layout|New layout|Classic layout/);
        const headings = selected === 'ribbon'
            ? compile(path.join('lib', 'ribbonNavigation.ts'), require).buildRibbonTabs(PayrollLinks).map(tab => tab.title)
            : PayrollLinks.map(item => item.title);
        for (const title of headings) assert.ok(html.includes(title), `Missing navigation heading: ${title}`);
    }
    assert.match(settings, /workspace-layout/);
    assert.match(settings, /workspaceLayout/);
    assert.match(settings, /canManageWorkspaceLayout/);
});

test('apps launcher and mobile drawer controls remain functional', () => {
    const apps = renderLayout('zoho', ['Open apps menu from navigation']);
    assert.match(apps, /role="dialog"[^>]*aria-modal="true"[^>]*aria-labelledby="apps-launcher-title"/);
    const mobile = renderLayout('zoho', ['Toggle navigation menu']);
    assert.match(mobile, /mobileOpen/);
});

test('sidebar-hidden pages do not acquire new navigation or branding', () => {
    const html = renderLayout('zoho', [], { hideSidebar: true });
    assert.doesNotMatch(html, /<aside\b/);
    assert.match(html, /sidebarHidden/);
    assert.match(html, /Page content/);
});

test('ribbon exposes nested navigation in command groups without a redundant sidebar', () => {
    const links = [
        { title: 'Orders', link: '', children: [
            { title: 'Results', link: '', children: [{ title: 'Review', link: '/review' }] },
            { title: 'Samples', link: '', children: [{ title: 'Collection', link: '/collection' }] },
        ] },
    ];
    const html = renderLayout('ribbon', [], { links, pathname: '/review/123' });
    assert.doesNotMatch(html, /<aside|Toggle navigation menu|Collapse navigation/);
    assert.match(html, /role="group" aria-label="Results"/);
    assert.match(html, /role="group" aria-label="Samples"/);
    assert.match(html, /href="\/review"[^>]*aria-current="page"/);
    assert.match(html, /href="\/collection"/);
});

test('ribbon stays absent from sidebar-hidden pages and existing content is preserved', () => {
    const html = renderLayout('ribbon', [], { hideSidebar: true });
    assert.doesNotMatch(html, /Workspace ribbon|Breadcrumb|<aside/);
    assert.match(html, /Page content/);
});

test('ribbon groups never reintroduce restricted or disabled descendants', () => {
    const links = [{ title: 'Operations', link: '', children: [
        { title: 'Allowed page', link: '/allowed' },
        { title: 'Owner only', link: '/owner', roles: ['admin'] },
        { title: 'Disabled module', link: '/disabled' },
    ] }];
    const html = renderLayout('ribbon', [], { links, role: 'scientist', pathname: '/allowed', deniedPaths: ['/disabled'] });
    assert.match(html, /Allowed page/);
    assert.doesNotMatch(html, /Owner only|Disabled module|href="\/owner"|href="\/disabled"/);
});

test('Portal uses the administrative shell dimensions and Inter without patient navigation', () => {
    const html = renderLayout('portal');
    const css = readFileSync(path.join(__dirname, '..', 'components', 'Layout', 'WorkspaceLayout.module.css'), 'utf8');
    assert.match(html, /portalBrand/);
    assert.match(html, /Staff workspace/);
    assert.doesNotMatch(html, /Patient portal|My results|My appointments/);
    assert.match(css, /\.shell\.portalLayout,[\s\S]*?--workspace-sidebar-bg: #18212f;/);
    assert.match(css, /font-family: var\(--theme-font-family, var\(--font-inter\)\)/);
    assert.match(css, /\.shell \.sidebar \{[\s\S]*?width: 250px;/);
    assert.match(css, /--header-height: 64px;/);
    assert.match(css, /\.portalBrand \{[\s\S]*?height: 64px;/);
    assert.match(css, /\.shell\.portalLayout \.sidebar \{[\s\S]*?height: 100dvh;/);
    assert.match(css, /\.portalLayout \.active \{[\s\S]*?border-left-color: #4caf50;/);
    assert.match(css, /\.shell\.portalLayout\.sidebarHidden,[\s\S]*?grid-template-areas: "header" "content";/);
    assert.match(css, /@media \(max-width: 768px\)[\s\S]*?\.shell\.portalLayout \.sidebar \{[\s\S]*?width: min\(250px, 86vw\) !important;/);
});

test('Portal keeps all staff destinations, active groups, collapse, mobile and app interactions', () => {
    const visit = (items, groups = []) => {
        for (const item of items) {
            if (item.children?.length) visit(item.children, [...groups, item.title]);
            else {
                const { location } = renderLayout('portal', [...groups, item.title], { result: true, pathname: '/other-page' });
                assert.equal(location.href, item.link, item.title);
            }
        }
    };
    visit(PayrollLinks);
    assert.match(renderLayout('portal'), /aria-label="All Periods" aria-current="page"/);
    const compact = renderLayout('portal', ['Collapse navigation']);
    assert.match(compact, /collapsed/);
    assert.match(compact, /aria-label="Payroll Periods" aria-expanded="false"/);
    assert.match(renderLayout('portal', ['Collapse navigation', 'Payroll Periods']), /aria-label="Payroll Periods" aria-expanded="true"/);
    const mobile = renderLayout('portal', ['Collapse navigation', 'Toggle navigation menu']);
    assert.match(mobile, /mobileOpen/);
    assert.match(mobile, /aria-label="Toggle navigation menu" aria-expanded="true"/);
    assert.match(mobile, /aria-label="All Periods"/);
    assert.doesNotMatch(renderLayout('portal', ['Toggle navigation menu', 'Toggle navigation menu']), /mobileOpen/);
    assert.doesNotMatch(renderLayout('portal', ['Toggle navigation menu', 'Escape']), /mobileOpen/);
    assert.doesNotMatch(renderLayout('portal', ['Toggle navigation menu', 'All Periods']), /mobileOpen/);
    assert.match(renderLayout('portal', ['Open apps menu from navigation']), /role="dialog"/);
    assert.doesNotMatch(renderLayout('portal', ['Open apps menu from navigation', 'Close applications']), /role="dialog"/);
    const hidden = renderLayout('portal', [], { hideSidebar: true });
    assert.doesNotMatch(hidden, /<aside|portalBrand|Toggle navigation menu/);
    assert.match(hidden, /sidebarHidden/);
    assert.match(hidden, /Page content/);
});

test('Portal filters nested permissions and disabled modules using the shared staff navigation', () => {
    const links = [{ title: 'Operations', link: '', children: [
        { title: 'Allowed', link: '/allowed' },
        { title: 'Owner only', link: '/owner', roles: ['admin'] },
        { title: 'Disabled', link: '/disabled' },
    ] }];
    const options = { links, role: 'scientist', pathname: '/allowed', deniedPaths: ['/disabled'] };
    const html = renderLayout('portal', [], options);
    assert.match(html, /aria-label="Allowed" aria-current="page"/);
    assert.doesNotMatch(html, /Owner only|Disabled/);
    assert.match(renderLayout('portal', [], { ...options, role: 'super-admin' }), /Owner only|Disabled/);
    assert.doesNotMatch(renderLayout('portal', [], { pathname: '/disabled', deniedPaths: ['/disabled'] }), /Page content/);
});

test('facility Portal selection saves through the real PATCH and refreshes shared settings only after success', async () => {
    const source = readFileSync(path.join(__dirname, '..', 'app', 'settings', 'applicationsettings', 'page.tsx'), 'utf8');
    const ast = ts.createSourceFile('page.tsx', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    let save, select;
    const visit = node => {
        if (ts.isVariableDeclaration(node) && node.name.getText(ast) === 'saveWorkspaceLayout') save = node.initializer.getText(ast);
        if (ts.isJsxAttribute(node) && node.name.getText(ast) === 'onChange' && node.initializer?.getText(ast).includes('setWorkspaceLayout(value)')) {
            select = node.initializer.expression.getText(ast);
        }
        ts.forEachChild(node, visit);
    };
    visit(ast);
    assert.match(source, /<option value="portal">Portal<\/option>/);
    assert.ok(save && select);
    const context = {
        applicationsettings: { user: { role: 'admin' }, settings: { workspaceLayout: 'classic', smsActivated: 1 } },
        workspaceLayout: 'classic', savingWorkspaceLayout: false,
        setWorkspaceLayout: value => { context.workspaceLayout = value; },
        setSavingWorkspaceLayout: value => { context.savingWorkspaceLayout = value; },
        setWorkspaceLayoutMessage: value => { context.message = value; },
        setApplicationSettings: value => { context.updated = value; },
    };
    const calls = [];
    context.customFetchMutation = async (...args) => { calls.push(args); return { status: 'success' }; };
    const evaluate = expression => vm.runInNewContext(ts.transpile(`(${expression})`, { target: ts.ScriptTarget.ES2020 }), context);
    evaluate(select)({ target: { value: 'portal' } });
    assert.equal(context.workspaceLayout, 'portal');
    await evaluate(save)();
    assert.deepEqual(calls[0].slice(0, 2), ['applicationsettings/workspace-layout', 'PATCH']);
    assert.equal(calls[0][2].workspaceLayout, 'portal');
    assert.equal(context.updated.settings.workspaceLayout, 'portal');
    assert.equal(context.updated.settings.smsActivated, 1);
    assert.equal(context.savingWorkspaceLayout, false);
    assert.match(renderLayout(context.updated.settings.workspaceLayout), /portalLayout/);
    context.updated = null;
    context.customFetchMutation = async () => ({ status: 'error', message: 'Rejected' });
    await evaluate(save)();
    assert.equal(context.updated, null);
    assert.equal(context.message.text, 'Rejected');
});
