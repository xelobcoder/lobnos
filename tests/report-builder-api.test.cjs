const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

const root = path.resolve(__dirname, '..');

function compile(file, context) {
     const exports = {};
     const source = ts.transpileModule(fs.readFileSync(path.join(root, file), 'utf8'), {
          compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
     }).outputText;
     vm.runInNewContext(source, { exports, ...context }, { filename: file });
     return exports;
}

test('report builder server actions use endpoints relative to the backend API base', async () => {
     const calls = [];
     const customFetch = async (endpoint) => {
          calls.push({ endpoint, method: 'GET' });
          return { status: 'success', data: [] };
     };
     const customFetchMutation = async (endpoint, method, body) => {
          calls.push({ endpoint, method, body });
          return { status: 'success', data: {} };
     };
     const api = compile('lib/reports/reportApi.ts', { require: () => ({ customFetch, customFetchMutation }) });

     await api.fetchReportDatasets();
     await api.previewReport({ dataset: 'billing', columns: ['paid'] });
     await api.listSavedReports();
     await api.getSavedReport('abc');
     await api.saveReport({ name: 'Report', visibility: 'private', definition: { dataset: 'billing', columns: ['paid'] } });
     await api.runSavedReport('abc');
     await api.deleteSavedReport('abc');

     assert.deepEqual(calls.map((call) => call.endpoint), [
          'reports/datasets',
          'reports/preview',
          'reports',
          'reports/abc',
          'reports',
          'reports/abc/run',
          'reports/abc',
     ]);
     assert.deepEqual(calls.map((call) => call.method), ['GET', 'POST', 'GET', 'GET', 'POST', 'POST', 'DELETE']);
     for (const call of calls) {
          assert.ok(!call.endpoint.startsWith('/api/v1/'), `endpoint ${call.endpoint} must not repeat the API base prefix`);
          assert.ok(!call.endpoint.startsWith('/'), `endpoint ${call.endpoint} must be relative`);
     }
});

test('browser export URLs still target the Next proxy under /api/v1', () => {
     const source = fs.readFileSync(path.join(root, 'lib/reports/reportApi.ts'), 'utf8');
     assert.match(source, /fetch\('\/api\/v1\/reports\/export'/);
     assert.match(source, /fetch\(`\/api\/v1\/reports\/\$\{encodeURIComponent\(id\)\}\/export\?format=\$\{format\}`\)/);
});
