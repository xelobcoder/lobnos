'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

const source = fs.readFileSync(path.resolve(__dirname, '../lib/manualRerunUi.ts'), 'utf8');
const compiled = ts.transpileModule(source, {
	compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText;
const compiledModule = { exports: {} };
vm.runInNewContext(compiled, { module: compiledModule, exports: compiledModule.exports });
const { eligibleManualRerunFields, manualRerunDisplayState } = compiledModule.exports;

test('manual rerun only offers enabled parameters with persisted values', () => {
	const fields = [
		{ fieldid: 11, name: 'Sodium', value: '140' },
		{ fieldid: 12, name: 'Potassium', value: '' },
		{ fieldid: 13, name: 'Chloride', value: '102' },
	];
	const rules = [
		{ fieldid: 11, manual_rerun_enabled: 1 },
		{ fieldid: 12, manual_rerun_enabled: 1 },
		{ fieldid: 13, manual_rerun_enabled: 0 },
	];

	assert.deepEqual(Array.from(eligibleManualRerunFields(fields, rules), ({ fieldid }) => fieldid), [11]);
});

test('manual rerun matches enabled rules by the test-creation database id', () => {
	const fields = [{ fieldid: 11, name: 'Sodium', value: '140' }];
	const rules = [{ id: 11, manual_rerun_enabled: 1 }];

	assert.deepEqual(Array.from(eligibleManualRerunFields(fields, rules), ({ fieldid }) => fieldid), [11]);
});

test('manual rerun labels waiting, confirmation, and revalidated states without requiring an analyzer', () => {
	assert.equal(manualRerunDisplayState({ fieldIds: [11], staged: [] }), 'Awaiting rerun results');
	assert.equal(manualRerunDisplayState({ fieldIds: [11], staged: [{ fieldid: 11 }] }), 'Awaiting confirmation');
	assert.equal(manualRerunDisplayState({
		fieldIds: [11],
		confirmedFieldIds: [11],
		staged: [{ fieldid: 11 }],
	}), 'Revalidated');
});
