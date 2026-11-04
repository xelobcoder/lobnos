const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const React = require('react');
const root = path.resolve(__dirname, '..');
function load(file, requireModule) {
     const source = ts.transpileModule(fs.readFileSync(path.join(root, file), 'utf8'), {
          fileName: file, reportDiagnostics: true,
          compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX },
     });
     assert.deepEqual(source.diagnostics, []);
     const exports = {};
     vm.runInNewContext(source.outputText, { exports, require: requireModule, Date, Error, console });
     return exports;
}
const helpers = load('lib/accounting/financialDaySettings.ts', () => ({}));
const tick = () => new Promise(resolve => setImmediate(resolve));
const response = result => ({ status: 'success', statusCode: 200, result });
const settings = (overrides = {}) => ({
     policy: { enabled: false, graceHours: 48 },
     bounds: { earliestDate: '2020-01-01', latestDate: '2026-12-01', currentDate: '2026-11-04' },
     ranges: [], ...overrides,
});
const counts = { financialDayCount: 10, alreadyLockedDayCount: 2, eligibleDayCount: 8 };
const nodes = (tree, predicate) => tree == null || typeof tree !== 'object' ? [] : Array.isArray(tree)
     ? tree.flatMap(child => nodes(child, predicate))
     : [...(predicate(tree) ? [tree] : []), ...nodes(tree.props?.children, predicate)];
const text = tree => tree == null ? '' : typeof tree !== 'object' ? String(tree)
     : Array.isArray(tree) ? tree.map(text).join('') : text(tree.props?.children);

function harness(api = {}, file = 'components/settings/FinancialDaySettingsWorkspace.tsx') {
     let cursor = 0;
     const states = [], deps = [], effects = [], cleanups = [];
     const react = {
          ...React,
          useState(initial) { const i = cursor++; if (!(i in states)) states[i] = initial; return [states[i], value => { states[i] = typeof value === 'function' ? value(states[i]) : value; }]; },
          useRef(initial) { const i = cursor++; if (!(i in states)) states[i] = { current: initial }; return states[i]; },
          useEffect(callback, next) {
               const i = cursor++;
               if (!deps[i] || next.some((value, index) => value !== deps[i][index])) {
                    deps[i] = next; effects.push(() => { cleanups[i]?.(); cleanups[i] = callback(); });
               }
          },
     };
     const calls = [];
     const mocked = Object.fromEntries(['get', 'savePolicy', 'preview', 'lock', 'financialDayReadiness'].map(name => [name, async payload => {
          calls.push({ name, payload });
          return api[name] ? api[name](payload) : response(name === 'preview' ? counts : settings());
     }]));
     const Component = load(file, name => {
          if (name === 'react') return react;
          if (name === 'react/jsx-runtime') return require(name);
          if (name.endsWith('.module.css')) return { default: new Proxy({}, { get: (_, key) => String(key) }) };
          if (name.includes('financialDaySettings')) return { ...helpers, financialDaySettingsApi: mocked };
          if (name.includes('accountingApi')) return { accountingApi: mocked };
          if (name.includes('useApplicationContext')) return { useApplication: () => ({ branchid: 1 }) };
          if (name === 'next/link') return { default: 'a' };
          throw new Error(`Unexpected dependency ${name}`);
     }).default;
     const h = {
          calls,
          render() { cursor = 0; return Component({}); },
          flush() { while (effects.length) effects.shift()(); },
          close() { cleanups.forEach(cleanup => cleanup?.()); },
          byId(id) { const node = nodes(h.render(), node => node.props?.id === id)[0]; assert.ok(node, id); return node; },
          change(id, value) { h.byId(id).props.onChange({ target: typeof value === 'boolean' ? { checked: value } : { value } }); },
          button(label) { const node = nodes(h.render(), node => node.type === 'button' && text(node) === label)[0]; assert.ok(node, label); return node; },
          submit(index) { nodes(h.render(), node => node.type === 'form')[index].props.onSubmit({ preventDefault() {} }); },
     };
     return h;
}
async function ready(api) {
     const h = harness(api);
     h.render(); h.flush(); await tick();
     return h;
}

test('settings API uses existing fetch context, exact paths and separate policy/lock bodies', async () => {
     const calls = [];
     const api = load('lib/accounting/financialDaySettings.ts', () => ({
          customFetch: async endpoint => { calls.push({ endpoint }); return response(settings()); },
          customPost: async (endpoint, method, body) => { calls.push({ endpoint, method, body }); return response(settings()); },
     })).financialDaySettingsApi;
     await api.get();
     await api.savePolicy({ enabled: true, graceHours: 168, reason: 'Activate' });
     await api.preview({ startDate: '2020-01-01', endDate: '2026-11-03' });
     await api.lock({ startDate: '2020-01-01', endDate: '2026-11-03', reason: 'Migration', confirm: true });
     assert.deepEqual(calls.map(call => call.endpoint), ['financial-day/settings', 'financial-day/settings', 'financial-day/historical-locks/preview', 'financial-day/historical-locks']);
     assert.deepEqual(calls.map(call => call.method), [undefined, 'PUT', 'POST', 'POST']);
     assert.deepEqual(Object.keys(calls[3].body).sort(), ['confirm', 'endDate', 'reason', 'startDate']);
});

test('defaults use server yesterday regardless of latest activity, with UTC month/year/leap boundaries', () => {
     assert.equal(helpers.defaultMigrationRange(settings().bounds).endDate, '2026-11-03');
     assert.equal(helpers.defaultMigrationRange({ ...settings().bounds, latestDate: '2021-01-01' }).endDate, '2026-11-03');
     assert.equal(helpers.serverYesterday('2026-01-01'), '2025-12-31');
     assert.equal(helpers.serverYesterday('2024-03-01'), '2024-02-29');
     assert.equal(helpers.defaultMigrationRange({ earliestDate: null, latestDate: null, currentDate: '2026-11-04' }).startDate, '');
     assert.equal(helpers.defaultMigrationRange({ ...settings().bounds, earliestDate: '2026-11-04' }).startDate, '');
});

test('range, reason and safe integer validation reject malformed, today/future and unsafe inputs', () => {
     for (const [startDate, endDate] of [['2026-02-30', '2026-11-03'], ['2026-11-03', '2026-11-02'], ['2026-11-04', '2026-11-04'], ['2026-11-03', '2026-11-05']]) {
          assert.ok(helpers.historicalRangeError({ startDate, endDate }, '2026-11-04'));
     }
     assert.equal(helpers.historicalRangeError({ startDate: '2026-11-03', endDate: '2026-11-03' }, '2026-11-04'), '');
     for (const hours of ['', '0', '-1', '1.5', '8761', '9007199254740992', 'Infinity']) assert.ok(helpers.policyError(hours, 'Reason'));
     for (const hours of ['1', '24', '48', '168', '8760']) assert.equal(helpers.policyError(hours, 'Reason'), '');
     assert.ok(helpers.policyError('48', '  '));
     assert.ok(helpers.reasonError('a'.repeat(1001)));
     assert.throws(() => helpers.settingsResult(response({ ...settings(), policy: { enabled: false, graceHours: 0 } })));
     assert.equal(helpers.settingsResult({ ...response(settings()), statusCode: 201 }).policy.enabled, false);
     assert.throws(() => helpers.previewResult(response({ ...counts, eligibleDayCount: -1 })));
});

test('page restricts access with existing roles and keys branch-specific drafts', () => {
     let application = { branchid: 1, user: { role: 'accountant', employeeid: 7 } };
     const roles = load('components/Auth/roles.ts', require);
     const Page = load('app/settings/financial-days/page.tsx', name => {
          if (name === 'react/jsx-runtime') return require(name);
          if (name.endsWith('/roles')) return roles;
          if (name.includes('useApplicationContext')) return { useApplication: () => application };
          return { default: 'Workspace' };
     }).default;
     assert.match(text(Page()), /Only an administrator or owner/);
     for (const role of ['admin', 'owner', 'Super Admin']) {
          application.user.role = role;
          assert.equal(Page().type, 'Workspace');
     }
     const oldKey = Page().key;
     application.branchid = 2;
     assert.notEqual(Page().key, oldKey);
     const nav = fs.readFileSync(path.join(root, 'components/Layout/links/categories/ApplicationSettingsLinks.tsx'), 'utf8');
     assert.match(nav, /link: "\/settings\/financial-days".*roles: \['admin', 'owner'/);
});

test('migration requires preview and confirmation, is inclusive and never saves or activates policy drafts', async () => {
     const migrated = settings({ ranges: [{ id: 1, startDate: '2020-01-01', endDate: '2026-11-03', reason: 'Migration', createdBy: 7, createdAt: '2026-11-04T00:00:00Z' }] });
     const h = await ready({ lock: async () => response(migrated) });
     try {
          assert.equal(h.byId('lock-start').props.value, '2020-01-01');
          assert.equal(h.byId('lock-end').props.value, '2026-11-03');
          assert.equal(h.byId('lock-end').props.max, '2026-11-03');
          assert.match(text(h.render()), /irreversible.*do not reconcile or finalize.*enforcement is off/);
          assert.match(text(h.render()), /Review outstanding balances and pending refunds before locking/);
          assert.match(text(h.render()), /Historical locks freeze source financial records, including old bills/);
          h.change('closing-enabled', true); // Unsaved activation is independent.
          h.change('lock-reason', ' Migration ');
          h.submit(1); await tick();
          assert.match(text(nodes(h.render(), node => node.props?.htmlFor === 'lock-confirm')[0]), /reviewed outstanding balances and pending refunds.*does not assert reconciliation/);
          assert.match(text(h.render()), /Financial days10Already locked days2Eligible days8/);
          assert.equal(h.button('Permanently lock historical range').props.disabled, true);
          h.change('lock-confirm', true);
          h.button('Permanently lock historical range').props.onClick(); await tick();
          assert.deepEqual(JSON.parse(JSON.stringify(h.calls.find(call => call.name === 'lock').payload)), { startDate: '2020-01-01', endDate: '2026-11-03', reason: 'Migration', confirm: true });
          assert.equal(h.calls.filter(call => call.name === 'savePolicy').length, 0);
          assert.equal(h.byId('closing-enabled').props.checked, true);
          assert.match(text(h.render()), /Saved enforcement: Off.*Immutable historical lock ranges.*Migration/);
          assert.match(text(h.render()), /No activation was requested/);
     } finally { h.close(); }
});

test('date edits discard previews and reason edits require renewed confirmation', async () => {
     const h = await ready();
     try {
          h.change('lock-reason', 'Migration'); h.submit(1); await tick();
          h.change('lock-confirm', true);
          h.change('lock-reason', 'Revised migration');
          assert.equal(h.byId('lock-confirm').props.checked, false);
          h.change('lock-end', '2026-11-02');
          assert.equal(nodes(h.render(), node => node.props?.id === 'lock-preview').length, 0);
          h.change('lock-end', '2026-11-04'); h.submit(1); await tick();
          assert.match(text(h.render()), /cannot include today or future/);
          assert.equal(h.calls.filter(call => call.name === 'preview').length, 1);
     } finally { h.close(); }
});

test('save policy validates hours/reason and is the only activation action', async () => {
     const h = await ready({ savePolicy: async payload => response(settings({ policy: { enabled: payload.enabled, graceHours: payload.graceHours } })) });
     try {
          h.change('closing-preset', 'custom');
          h.change('closing-hours', '1.5'); h.change('policy-reason', 'Reason'); h.submit(0);
          assert.equal(h.calls.filter(call => call.name === 'savePolicy').length, 0);
          h.change('closing-hours', '72'); h.change('closing-enabled', true); h.submit(0); await tick();
          const payload = h.calls.find(call => call.name === 'savePolicy').payload;
          assert.deepEqual(JSON.parse(JSON.stringify(payload)), { enabled: true, graceHours: 72, reason: 'Reason' });
          assert.match(text(h.render()), /Saved enforcement: On.*72 hours/);
          assert.equal(h.calls.filter(call => call.name === 'lock').length, 0);
     } finally { h.close(); }
});

test('workflow navigation, server bounds and form guidance distinguish drafts from saved policy', async () => {
     const h = await ready();
     try {
          const tree = h.render();
          const workflowNav = nodes(tree, node => node.type === 'nav' && node.props['aria-label'] === 'Financial settings workflows')[0];
          assert.deepEqual(nodes(workflowNav, node => node.type === 'a').map(node => node.props.href), ['#closing-policy', '#historical-locking', '#locked-ranges']);
          assert.match(text(tree), /Last eligible historical date2026-11-03/);
          assert.match(text(tree), /not your device date/);
          assert.match(text(tree), /Matches saved policy/);
          assert.match(text(tree), /Does not lock historical dates/);
          assert.match(text(tree), /Preview only\. No records are changed/);
          assert.equal(h.button('Refresh settings').props['aria-describedby'], 'refresh-help');
          assert.match(text(h.byId('refresh-help')), /discards unsaved drafts/);
          assert.match(h.byId('closing-enabled').props['aria-describedby'], /enforcement-help/);
          assert.match(h.byId('closing-hours').props['aria-describedby'], /hours-help/);
          h.change('closing-enabled', true);
          assert.match(text(h.render()), /Unsaved changes/);
          assert.match(text(h.render()), /Saved enforcement: Off/);
          assert.equal(h.calls.filter(call => call.name !== 'get').length, 0);
     } finally { h.close(); }
});

test('custom interval mode stays editable even when its value equals a preset', async () => {
     const h = await ready();
     try {
          assert.equal(h.byId('closing-hours').props.readOnly, true);
          h.change('closing-preset', 'custom');
          assert.equal(h.byId('closing-hours').props.readOnly, false);
          assert.equal(h.byId('closing-hours').props.value, '');
          h.change('closing-hours', '48');
          assert.equal(h.byId('closing-preset').props.value, 'custom');
          assert.equal(h.byId('closing-hours').props.readOnly, false);
          h.change('closing-preset', '168');
          assert.equal(h.byId('closing-hours').props.value, '168');
          assert.equal(h.byId('closing-hours').props.readOnly, true);
     } finally { h.close(); }
     const custom = await ready({ get: async () => response(settings({ policy: { enabled: false, graceHours: 72 } })) });
     try {
          assert.equal(custom.byId('closing-preset').props.value, 'custom');
          assert.equal(custom.byId('closing-hours').props.readOnly, false);
          assert.equal(custom.byId('closing-hours').props.value, '72');
     } finally { custom.close(); }
});

test('a requested preview receives focus and reason edits do not steal it', async () => {
     const h = await ready();
     try {
          h.change('lock-reason', 'Migration'); h.submit(1); await tick();
          const heading = h.byId('lock-preview');
          assert.equal(heading.props.tabIndex, -1);
          let focused = 0;
          heading.props.ref.current = { focus() { focused++; } };
          h.flush();
          assert.equal(focused, 1);
          h.change('lock-reason', 'Revised migration');
          h.render(); h.flush();
          assert.equal(focused, 1);
          assert.equal(h.button('Permanently lock historical range').props.disabled, true);
     } finally { h.close(); }
});

test('recorded locks have a keyboard-scrollable region and semantic dates', async () => {
     const h = await ready({ get: async () => response(settings({ ranges: [{ id: 1, startDate: '2020-01-01', endDate: '2026-11-03', reason: 'Migration', createdBy: 7, createdAt: '2026-11-04T00:00:00Z' }] })) });
     try {
          const region = nodes(h.render(), node => node.props?.['aria-label'] === 'Historical lock records')[0];
          assert.equal(region.props.role, 'region');
          assert.equal(region.props.tabIndex, 0);
          assert.equal(nodes(region, node => node.type === 'time').length, 3);
          assert.match(text(region), /regardless of enforcement activation\. Dates are inclusive/);
          assert.match(text(h.render()), /1 recorded ranges/);
     } finally { h.close(); }
});

test('loading, failed GET, failed preview and failed lock provide feedback and retry safety', async () => {
     let fail = true;
     const h = harness({ get: async () => fail ? { status: 'error', message: 'Access denied' } : response(settings()), preview: async () => ({ status: 'error', message: 'Preview unavailable' }) });
     try {
          h.render(); h.flush();
          assert.match(text(h.render()), /Loading financial-day settings/);
          await tick(); assert.match(text(h.render()), /Access denied/);
          fail = false; h.button('Refresh settings').props.onClick(); h.render(); h.flush(); await tick();
          h.change('lock-reason', 'Migration'); h.submit(1); await tick();
          assert.match(text(h.render()), /Preview unavailable/);
          assert.equal(nodes(h.render(), node => node.props?.id === 'lock-preview').length, 0);
     } finally { h.close(); }
     const failed = await ready({ lock: async () => { throw new Error('Network failure'); } });
     try {
          failed.change('lock-reason', 'Migration'); failed.submit(1); await tick();
          failed.change('lock-confirm', true); failed.button('Permanently lock historical range').props.onClick(); await tick();
          assert.match(text(failed.render()), /Network failure.*refresh settings to verify/);
          assert.equal(nodes(failed.render(), node => node.props?.id === 'lock-confirm').length, 0);
     } finally { failed.close(); }
});

test('late preview response after branch workspace unmount cannot update discarded state', async () => {
     let resolve;
     const h = await ready({ preview: () => new Promise(ok => { resolve = ok; }) });
     h.change('lock-reason', 'Migration'); h.submit(1); h.close();
     resolve(response(counts)); await tick();
     assert.equal(nodes(h.render(), node => node.props?.id === 'lock-preview').length, 0);
});

test('empty eligible-day count still allows explicitly confirmed inclusive range protection', async () => {
     const h = await ready({ preview: async () => response({ financialDayCount: 0, alreadyLockedDayCount: 0, eligibleDayCount: 0 }) });
     try {
          h.change('lock-reason', 'Protect historical gaps'); h.submit(1); await tick();
          h.change('lock-confirm', true);
          assert.equal(h.button('Permanently lock historical range').props.disabled, false);
          assert.match(text(h.render()), /range includes|entire inclusive date range/);
          h.button('Permanently lock historical range').props.onClick(); await tick();
          assert.equal(h.calls.filter(call => call.name === 'lock').length, 1);
     } finally { h.close(); }
});

test('readiness notice uses dynamic hours instead of hardcoded 48-hour text', () => {
     const source = fs.readFileSync(path.join(root, 'components/accounting/FinancialDayReadinessNotice.tsx'), 'utf8');
     assert.doesNotMatch(source, /48-hour/);
     assert.match(source, /readiness\.graceHours/);
});

test('readiness renders enforcement-off and overdue states with authoritative custom hours', async () => {
     for (const enabled of [false, true]) {
          const h = harness({
               financialDayReadiness: async () => response({ branchId: 1, enabled, overdue: true, blocked: enabled, graceHours: 72, oldestFinancialDate: '2026-11-01', deadline: '2026-11-04T00:00:00Z', closeUrl: '/accounting/daily-close' }),
          }, 'components/accounting/FinancialDayReadinessNotice.tsx');
          try {
               h.render(); h.flush(); await tick();
               if (!enabled) {
                    assert.match(text(h.render()), /Overdue enforcement off \(72-hour interval\)/);
                    assert.match(text(h.render()), /Historical migration locks and finalized-day restrictions remain/);
                    assert.doesNotMatch(text(h.render()), /must be|Transactions blocked/);
               } else assert.match(text(h.render()), /Transactions blocked.*must be finalized/);
          } finally { h.close(); }
     }
});
