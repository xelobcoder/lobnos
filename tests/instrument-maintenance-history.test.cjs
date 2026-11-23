const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');

const source = fs.readFileSync(path.join(__dirname, '../components/laboratory/QualityControl/InstrumentMaintenanceManager.tsx'), 'utf8');
const compiled = ts.transpileModule(source, {
     compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
}).outputText;
const css = new Proxy({}, { get: (_, key) => key === '__esModule' ? false : key });

function loadManager(fetch, state = {}) {
     const component = {};
     let index = 0;
     const mockedReact = {
          ...React,
          useState(initial) { const i = index++; return [Object.hasOwn(state, i) ? state[i] : initial, () => {}]; },
          useEffect() {},
          useCallback(fn) { return fn; },
     };
     function Modal({ show, children }) { return show ? React.createElement('div', null, children) : null; }
     Modal.Header = Modal.Title = Modal.Body = ({ children }) => React.createElement('div', null, children);
     function Table({ column, data }) {
          return React.createElement('div', null, data.map((row, i) =>
               React.createElement('div', { key: i }, column.map((col, j) =>
                    React.createElement('div', { key: j }, col.Cell
                         ? React.createElement(col.Cell, { row: { original: row }, value: row[col.accessor] })
                         : row[col.accessor])))));
     }
     vm.runInNewContext(compiled, { exports: component, URLSearchParams, setTimeout, clearTimeout, require(name) {
          if (name === 'react') return mockedReact;
          if (name.endsWith('.module.css')) return css;
          if (name === '../../Auth/customFetch') return { customFetch: fetch };
          if (name === '../../Auth/useApplicationContext') return { useApplicationSettings: () => ({ applicationsettings: {} }) };
          if (name === '../../Auth/roles') return { roleAllowed: () => true };
          if (name === '../../accessories/Datatables/PrimeTable') return Table;
          if (name === './MaintenanceTasks') return () => null;
          if (name === 'react-bootstrap') return { Modal, Button: ({ children }) => React.createElement('button', null, children), Form: Object.assign(() => null, { Group: ({ children }) => children, Label: ({ children }) => children, Control: () => null }), Spinner: () => null };
          return require(name);
     } });
     return component;
}

test('history requests send server-side pagination and encoded filters', async () => {
     let endpoint;
     const page = { data: [{ id: 8 }], total: 45, page: 2, count: 20 };
     const manager = loadManager(async url => { endpoint = url; return page; });
     assert.equal(await manager.fetchMaintenanceHistory(2, ' A&B ', 'cleared'), page);
     const params = new URLSearchParams(endpoint.split('?')[1]);
     assert.equal(endpoint.split('?')[0], 'instrument-maintenance/history');
     assert.equal(params.get('page'), '2');
     assert.equal(params.get('count'), '20');
     assert.equal(params.get('search'), 'A&B');
     assert.equal(params.get('status'), 'cleared');
     await manager.fetchMaintenanceHistory(1, '', 'all');
     assert.equal(new URLSearchParams(endpoint.split('?')[1]).has('status'), false);
});

test('history rejects backend errors and malformed pagination', async () => {
     await assert.rejects(loadManager(async () => ({ status: 'error', message: 'Not authorized' })).fetchMaintenanceHistory(1, '', 'all'), /Not authorized/);
     await assert.rejects(loadManager(async () => ({ data: [], total: 0 })).fetchMaintenanceHistory(1, '', 'all'), /Invalid maintenance history response/);
     const wrapped = { data: [], total: 0, page: 1, count: 20 };
     assert.equal(await loadManager(async () => ({ data: wrapped })).fetchMaintenanceHistory(1, '', 'all'), wrapped);
});

test('history and details display activity, identities and recorded check and action information', () => {
     const run = { id: 8, device_id: 'a', deviceName: 'Analyzer', activity_title: 'Clean', activity_type: 'Routine',
          performed_at: '2026-01-02T10:00:00Z', scheduled_date: '2026-01-01', performed_by: 12, reviewed_by: 18,
          reviewed_at: '2026-01-03T10:00:00Z', status: 'cleared', observations: 'Observed residue', review_comment: 'Verified clean',
          checks: [{ id: 3, title_snapshot: 'Tubing', instructions_snapshot: 'Inspect tubing', result: 'fail', comment: 'Leaking' }],
          correctiveActions: [{ id: 4, check_id: 3, description: 'Replace tube\nCompleted: replaced', status: 'completed', completed_by: 27, completed_at: '2026-01-02T12:00:00Z' }],
          task: { id: 14, status: 'completed', snapshot: { title: 'Clean', activity_type: 'Routine', interval: 1, frequency: 'weekly', assigned_to: 30, instructions: 'Disconnect power' }, failure_reason: 'Tubing leak' },
     };
     const manager = loadManager(async () => {}, { 0: [run], 2: [{ id: 'a', deviceName: 'Analyzer' }], 3: false,
          5: 'history', 8: 2, 9: 45, 13: run });
     const markup = renderToStaticMarkup(React.createElement(manager.InstrumentMaintenanceManager));
     for (const value of ['Analyzer', 'Clean', 'Routine', '2026-01-01', 'Employee #12', 'Employee #18',
          'Inspect tubing', 'Leaking', 'Observed residue', 'Replace tube', 'Completed: replaced', 'Employee #27', 'Verified clean', 'Page 2 of 3', 'Scheduled task #14', 'Disconnect power', 'Tubing leak', 'Employee #30']) {
          assert.ok(markup.includes(value), value);
     }
});
