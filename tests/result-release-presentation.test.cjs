const assert = require('node:assert/strict');
const test = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

const sourcePath = path.join(__dirname, '..', 'components', 'operations', 'Laboratory', 'resultReleasePresentation.ts');
const output = {};
vm.runInNewContext(ts.transpileModule(fs.readFileSync(sourcePath, 'utf8'), {
     compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText, { exports: output });

test('optional validated results can print without sign-off', () => {
     const item = { explicitReleaseRequired: false, availableForPrinting: true, paymentstatus: 'paid' };
     assert.equal(output.printBlockedReason(item, 0), null);
     assert.equal(output.releaseStatusLabel(item), 'Available for printing (sign-off optional)');
});

test('manager approval and payment restrictions still block printing', () => {
     const pendingManagerApproval = {
          explicitReleaseRequired: false, availableForPrinting: false,
          releaseStatus: 'awaiting_manager_approval', paymentstatus: 'paid',
     };
     assert.equal(output.printBlockedReason(pendingManagerApproval, 1), 'manager');
     assert.equal(output.releaseStatusLabel(pendingManagerApproval), 'Awaiting manager approval');

     const unpaid = { releaseStatus: 'released', paymentstatus: 'pending' };
     assert.equal(output.printBlockedReason(unpaid, 0), 'unpaid');
});

test('grouped results select a printable test even if another test is awaiting release', () => {
     const results = [
          { releaseStatus: 'awaiting_release', paymentstatus: 'paid' },
          { explicitReleaseRequired: false, availableForPrinting: true, paymentstatus: 'paid' },
     ];
     assert.equal(results.find(output.isPrintableResult), results[1]);
     assert.equal(output.printBlockedReason({ tests: results }, 0), null);
});
