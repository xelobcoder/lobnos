const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const exportsForInput = {};
vm.runInNewContext(ts.transpileModule(read('components/laboratory/QualityControl/MaintenanceCheckInput.tsx'), {
     compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
}).outputText, {
     exports: exportsForInput,
     require: name => name.endsWith('.module.css') ? new Proxy({}, { get: (_, key) => key === '__esModule' ? false : key }) : require(name),
});

const check = { title: 'Bath temperature', instructions: '', kind: 'numeric', required: true, min: 35, max: 38, unit: '°C' };

test('check status handles inclusive limits, blank and invalid values', () => {
     const status = exportsForInput.maintenanceCheckStatus;
     for (const value of ['35', '36.5', '38']) assert.equal(status(check, value), 'pass');
     for (const value of ['34.9', '38.1']) assert.equal(status(check, value), 'fail');
     for (const value of ['', '  ']) assert.equal(status(check, value), 'pending');
     for (const value of ['NaN', 'Infinity']) assert.equal(status(check, value), 'invalid');
     assert.equal(status({ ...check, kind: 'completion' }, 'completed'), 'pass');
     assert.equal(status({ ...check, kind: 'completion' }, 'not_completed'), 'fail');
     assert.equal(status({ ...check, kind: 'pass_fail' }, 'fail'), 'fail');
});

test('check controls expose readable status, range and clearable choices', () => {
     const render = (item, value) => renderToStaticMarkup(React.createElement(exportsForInput.MaintenanceCheckInput, {
          check: item, value, index: 0, taskId: 7, onChange() {},
     }));
     assert.match(render(check, '36.5'), /executionCheckPass.*Within specification/s);
     assert.match(render(check, '42'), /executionCheckFail.*outside 35 to 38/s);
     assert.doesNotMatch(render(check, ''), /executionCheckPass|executionCheckFail/);
     const choices = render({ ...check, kind: 'completion' }, 'not_completed');
     assert.match(choices, /role="radiogroup"/);
     assert.match(choices, /type="radio"/);
     assert.match(choices, /Clear/);
     assert.match(choices, /Failed/);
});

test('overall result tracks progress and any failure takes precedence', () => {
     const summarize = exportsForInput.maintenanceCheckSummary;
     const checks = [check, { ...check, kind: 'pass_fail' }, { ...check, required: false }];
     let summary = summarize(checks, { 0: '36.5' });
     assert.equal(summary.recorded, 1);
     assert.equal(summary.requiredOutstanding, 1);
     assert.equal(summary.result, 'Incomplete');
     summary = summarize(checks, { 0: '36.5', 1: 'pass' });
     assert.equal(summary.result, 'Pass');
     summary = summarize(checks, { 0: '42' });
     assert.equal(summary.result, 'Fail');
     assert.equal(summary.failedCount, 1);
     assert.equal(summary.requiredOutstanding, 1);
     assert.equal(summarize(checks, { 0: '36.5', 1: 'pass', 2: 'NaN' }).result, 'Incomplete');
});

test('maintenance has a dedicated route and old QC links redirect to it', () => {
     const route = '/operations/laboratory/instrument-maintenance';
     assert.match(read('app/operations/laboratory/instrument-maintenance/page.tsx'), /<InstrumentMaintenanceManager\s*\/>/);
     const qc = read('components/laboratory/QualityControl/QualityControlWorkspace.tsx');
     assert.ok(qc.includes(`router.replace('${route}')`));
     assert.ok(qc.includes(`href="${route}"`));
     for (const file of [
          'app/operations/laboratory/page.tsx',
          'components/Layout/links/categories/LaboratoryOperationsLinks.tsx',
          'components/Layout/links/categories/CombinedLinks.tsx',
     ]) assert.ok(read(file).includes(route), file);
});

test('maintenance exposes one schedule workflow and uses PrimeTable for its lists', () => {
     const manager = read('components/laboratory/QualityControl/InstrumentMaintenanceManager.tsx');
     const tasks = read('components/laboratory/QualityControl/MaintenanceTasks.tsx');
     assert.doesNotMatch(manager, /legacy|instrument-maintenance\/checklist|devices\/\$\{[^}]+\}\/schedule/i);
     assert.match(manager, /Maintenance tasks/);
     assert.match(manager, /Maintenance schedules/);
     assert.match(manager, /Maintenance history/);
     assert.match(manager, /instrument-maintenance\/runs\/\$\{runId\}/);
     assert.match(manager, /instrument-maintenance\/actions\/\$\{actionId\}\/complete/);
     assert.match(manager, /instrument-maintenance\/runs\/\$\{selectedRun\.id\}\/supervisor-review/);
     for (const source of [manager, tasks]) {
          assert.match(source, /<PrimeTable /);
          assert.doesNotMatch(source, /<table\b|<Table\b/);
     }
});

test('task and schedule rows render through PrimeTable with their actions', () => {
     const css = new Proxy({}, { get: (_, key) => key === '__esModule' ? false : key });
     const tableExports = {};
     vm.runInNewContext(ts.transpileModule(read('components/accessories/Datatables/PrimeTable.js'), {
          compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
     }).outputText, { exports: tableExports, require(name) {
          if (name.endsWith('.css')) return css;
          if (['./GlobalFilter', './TableDisplayShowCount', './TableLoading'].includes(name)) return () => null;
          if (name === '../../reports/tableSources') return { registerTableSource() {} };
          return require(name);
     } });
     const task = {
          id: 1, plan_id: 1, device_id: 'instrument-1', deviceName: 'Analyzer A', model: 'Model A',
          due_date: '2000-01-01', revision: 1, draft: null,
          snapshot: { title: 'Daily check', activity_type: 'Routine', interval: 1, frequency: 'daily', checklist: [check] },
     };
     const plan = {
          id: 1, device_id: 'instrument-1', deviceName: 'Analyzer A', title: 'Daily check',
          activity_type: 'Routine', interval: 1, frequency: 'daily', next_due_date: '2000-01-01',
          active: true, checklist: [check],
     };
     const renderView = view => {
          let stateIndex = 0;
          const mockedReact = { ...React, useState(initial) {
               const index = stateIndex++;
               return [index === 0 ? [plan] : index === 1 ? [task] : index === 2 ? false : typeof initial === 'function' ? initial() : initial, () => {}];
          } };
          const component = {};
          vm.runInNewContext(ts.transpileModule(read('components/laboratory/QualityControl/MaintenanceTasks.tsx'), {
               compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
          }).outputText, { exports: component, require(name) {
               if (name === 'react') return mockedReact;
               if (name.endsWith('.module.css')) return css;
               if (name === '../../accessories/Datatables/PrimeTable') return tableExports.default;
               if (name === './MaintenanceCheckInput') return exportsForInput;
               if (name === '../../Auth/customFetch') return {};
               return require(name);
          } });
          return renderToStaticMarkup(React.createElement(component.default, {
               view, devices: [{ id: 'instrument-1', deviceName: 'Analyzer A' }],
               canSupervise: true, onChanged: async () => {}, blocked: [],
          }));
     };
     const tasks = renderView('tasks');
     assert.match(tasks, /Due &amp; overdue \(1\)/);
     assert.match(tasks, /Analyzer A/);
     assert.match(tasks, /Daily check/);
     assert.match(tasks, />Perform</);
     const plans = renderView('plans');
     assert.match(plans, /Daily check/);
     assert.match(plans, />Edit</);
     assert.match(plans, /1 items/);
});

test('numeric typing waits for blur or Enter before reporting a failure', async () => {
     const task = { id: 11, plan_id: 1, revision: 1, device_id: 'instrument-1', deviceName: 'Analyzer',
          due_date: '2026-01-01', draft: null, snapshot: { title: 'Daily', activity_type: 'Routine',
               frequency: 'daily', interval: 1, instructions: '', assigned_to: null, checklist: [check] } };
     const state = [], refs = [], calls = [];
     let stateIndex = 0, refIndex = 0;
     const mockedReact = { ...React, useState(initial) {
          const index = stateIndex++;
          if (!(index in state)) state[index] = index === 6 ? task : typeof initial === 'function' ? initial() : initial;
          return [state[index], value => { state[index] = typeof value === 'function' ? value(state[index]) : value; }];
     }, useRef(initial) { const index = refIndex++; return refs[index] || (refs[index] = { current: initial }); },
     useEffect() {}, useCallback(fn) { return fn; } };
     const component = {};
     vm.runInNewContext(ts.transpileModule(read('components/laboratory/QualityControl/MaintenanceTasks.tsx'), {
          compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
     }).outputText, { exports: component, require(name) {
          if (name === 'react') return mockedReact;
          if (name.endsWith('.module.css')) return new Proxy({}, { get: (_, key) => key === '__esModule' ? false : key });
          if (name === '../../accessories/Datatables/PrimeTable') return () => null;
          if (name === './MaintenanceCheckInput') return exportsForInput;
          if (name === '../../Auth/customFetch') return { customFetchMutation: async (url, method, body) => {
               calls.push({ url, method, body });
               return { id: 11, revision: 2, hold: true, draft: { checks: body.checks, failure_evidence: body.checks, observations: '' } };
          } };
          return require(name);
     } });
     const render = () => { stateIndex = 0; refIndex = 0; return component.default({ view: 'tasks', devices: [], blocked: [], canSupervise: true, onChanged: async () => {} }); };
     const find = (node, predicate) => {
          if (!node || typeof node !== 'object') return null;
          if (predicate(node)) return node;
          for (const child of React.Children.toArray(node.props?.children)) { const found = find(child, predicate); if (found) return found; }
          return null;
     };
     const input = tree => find(tree, node => node.type === exportsForInput.MaintenanceCheckInput);
     const field = tree => find(tree, node => node.type === 'fieldset');
     let tree = render();
     for (const value of ['3', '36', '36.5']) { input(tree).props.onChange(value); tree = render(); }
     assert.equal(calls.length, 0);
     field(tree).props.onBlur(); tree = render();
     assert.equal(calls.length, 0);
     for (const value of ['4', '42']) { input(tree).props.onChange(value); tree = render(); }
     assert.equal(calls.length, 0);
     let prevented = false;
     field(tree).props.onKeyDown({ key: 'Enter', preventDefault() { prevented = true; } });
     await new Promise(resolve => setImmediate(resolve));
     assert.equal(prevented, true);
     assert.equal(calls.length, 1);
     assert.equal(calls[0].body.failure_only, true);
     assert.equal(calls[0].body.checks[0].value, '42');
});

test('maintenance shows advisory staff options and durable failure and scheduling warnings', () => {
     const source = read('components/laboratory/QualityControl/MaintenanceTasks.tsx');
     assert.match(source, /operations\/laboratory\/workbench\/options/);
     assert.match(source, /Assigned staff \(optional\)/);
     assert.match(source, /Assignment is advisory/);
     assert.match(source, /Failure reporting history/);
     assert.match(source, /reported_by/);
     assert.match(source, /scheduling_conflict/);
     assert.match(source, /Retry failure hold/);
     assert.match(source, /beforeunload/);
});
