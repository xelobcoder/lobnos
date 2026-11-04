const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

function transport(response) {
     const calls = [];
     const exports = {};
     const source = ts.transpileModule(fs.readFileSync(path.join(__dirname, '../lib/backupDownload.ts'), 'utf8'), {
          compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
     }).outputText;
     vm.runInNewContext(source, {
          exports, URL, Error,
          require: name => {
               assert.equal(name, './apiBaseUrl');
               return { buildApiUrl: endpoint => `https://facility.test/api/v1/${endpoint}` };
          },
          fetch: async (url, options) => { calls.push({ url: new URL(url), options }); return response; },
     });
     return { ...exports, calls };
}

test('valid backup bytes and attachment headers pass through with authenticated same-origin routing', async () => {
     const body = new Response('synthetic encrypted backup', { headers: { 'Content-Type': 'application/octet-stream', 'Content-Disposition': 'attachment; filename="backup.sql.encrypted"' } });
     const { requestBackupDownload, calls } = transport(body);
     const response = await requestBackupDownload(17, false);
     assert.equal(await response.text(), 'synthetic encrypted backup');
     assert.match(response.headers.get('content-disposition'), /\.encrypted/);
     assert.equal(calls[0].url.pathname, '/api/v1/security-features/backup/logs/17/download');
     assert.equal(calls[0].url.searchParams.has('tenantId'), false);
     assert.equal(calls[0].options.credentials, 'include');
     assert.equal(calls[0].options.cache, 'no-store');
});

test('decryption remains explicit and invalid backup identifiers never make a request', async () => {
     const { requestBackupDownload, calls } = transport(new Response('synthetic sql', { headers: { 'Content-Type': 'application/sql' } }));
     await requestBackupDownload(17, true);
     assert.equal(calls[0].url.searchParams.get('decrypt'), 'true');
     await assert.rejects(requestBackupDownload(0, false), /valid backup/);
     assert.equal(calls.length, 1);
});

test('missing backup files report the server reason and recovery action, including older backend responses', async () => {
     for (const code of [undefined, 'BACKUP_FILE_NOT_FOUND']) {
          const { requestBackupDownload, BackupDownloadError } = transport(new Response(JSON.stringify({ status: false, error: 'Backup file not found', code }), { status: 404, headers: { 'Content-Type': 'application/json' } }));
          await assert.rejects(requestBackupDownload(17, false), error => {
               assert.ok(error instanceof BackupDownloadError);
               assert.equal(error.status, 404);
               assert.equal(error.code, 'BACKUP_FILE_NOT_FOUND');
               assert.match(error.message, /Restore the original file or create a new backup/);
               return true;
          });
     }
});

test('missing records and route errors remain distinguishable', async () => {
     const missing = transport(new Response(JSON.stringify({ error: 'Backup not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } }));
     await assert.rejects(missing.requestBackupDownload(17, false), /Refresh the backup logs/);
     const route = transport(new Response('<html>Not found</html>', { status: 404, statusText: 'Not Found', headers: { 'Content-Type': 'text/html' } }));
     await assert.rejects(route.requestBackupDownload(17, false), error => {
          assert.equal(error.code, undefined);
          assert.match(error.message, /404.*Not Found/);
          return true;
     });
});

test('JSON failures and login pages are never downloaded as successful backup files', async () => {
     for (const type of ['application/json', 'text/html']) {
          const { requestBackupDownload } = transport(new Response('not a backup', { headers: { 'Content-Type': type } }));
          await assert.rejects(requestBackupDownload(17, false), /instead of a backup file/);
     }
});

test('backup log controls disable unavailable files without hiding historical success', () => {
     const exports = {};
     const source = ts.transpileModule(fs.readFileSync(path.join(__dirname, '../components/settings/backup/BackupLogsTable.tsx'), 'utf8'), {
          compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX },
     }).outputText;
     vm.runInNewContext(source, {
          exports,
          require: name => {
               if (name === 'react-bootstrap') return { Button: 'button' };
               if (name === '../../accessories/Datatables/PrimeTable') return { default: 'prime-table' };
               if (name === '@remixicon/react') return { RiDatabaseLine: 'span', RiDownloadLine: 'span', RiDeleteBinLine: 'span' };
               return require(name);
          },
     });
     const table = exports.default({ backupLogs: [] }).props.children[1];
     const actions = table.props.column.find(column => column.Header === 'Actions');
     const status = table.props.column.find(column => column.Header === 'Status');
     for (const [is_successful, file_available, disabled] of [
          [true, true, false], [true, undefined, false], [true, false, true], [false, true, true],
     ]) {
          const row = { original: { is_successful, file_available } };
          assert.equal(actions.Cell({ row }).props.children[0].props.disabled, disabled);
     }
     const row = { original: { is_successful: true, file_available: false } };
     const statusCell = status.Cell({ row });
     assert.equal(statusCell.props.children[0], 'Success');
     assert.equal(statusCell.props.children[1].props.children, 'File unavailable');
     assert.match(actions.Cell({ row }).props.children[0].props.title, /unavailable/);
});
