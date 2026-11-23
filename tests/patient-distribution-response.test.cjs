const test = require('node:test');
const assert = require('node:assert/strict');
const { patientDistributionRowsFromResponse } = require('../components/analytics/patients-analytics/components/patientDistributionResponse');

const rows = [
	{ gender: 'Female', patient_count: '14' },
	{ gender: 'Male', patient_count: '9' },
];

test('preserves every row from raw distribution endpoint arrays', () => {
	assert.deepEqual(patientDistributionRowsFromResponse(rows), rows);
	assert.deepEqual(patientDistributionRowsFromResponse([]), []);
});

test('accepts result and data wrappers without collapsing multiple categories', () => {
	assert.deepEqual(patientDistributionRowsFromResponse({ result: rows }), rows);
	assert.deepEqual(patientDistributionRowsFromResponse({ status: 'success', data: rows }), rows);
});

test('rejects API error envelopes rather than treating them as empty reports', () => {
	for (const response of [
		{ status: 'error', statusCode: 500, message: 'query failed' },
		{ success: false, statusCode: 503 },
		{ statusCode: 400, result: rows },
	]) {
		assert.throws(() => patientDistributionRowsFromResponse(response), /request failed/);
	}
});

test('rejects malformed or unsupported response shapes', () => {
	for (const response of [null, undefined, 'not rows', { result: { gender: 'Female' } }, { data: null }]) {
		assert.throws(() => patientDistributionRowsFromResponse(response), /Unexpected patient distribution response/);
	}
});
