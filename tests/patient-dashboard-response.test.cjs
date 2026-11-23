const test = require('node:test');
const assert = require('node:assert/strict');
const { dashboardRowFromResponse } = require('../components/analytics/patients-analytics/components/dashboardResponse.js');

test('normalizes the dashboard aggregate row from the array API response', () => {
	const row = { total_patients: 12, active_patients: 8, male_patients: 5, female_patients: 7 };
	assert.equal(dashboardRowFromResponse([row]), row);
});

test('accepts a dashboard aggregate row returned directly', () => {
	const row = { total_patients: '12', active_patients: '8', male_patients: '5', female_patients: '7' };
	assert.equal(dashboardRowFromResponse(row), row);
});

test('rejects an empty aggregate result because the dashboard query always returns one row', () => {
	assert.throws(() => dashboardRowFromResponse([]), /Unexpected dashboard response/);
});

test('rejects API error objects and unrelated response shapes', () => {
	assert.throws(() => dashboardRowFromResponse({ error: 'Request failed' }), /Unexpected dashboard response/);
	assert.throws(() => dashboardRowFromResponse('unexpected'), /Unexpected dashboard response/);
	assert.throws(() => dashboardRowFromResponse({ total_patients: 8 }), /Unexpected dashboard response/);
});

test('rejects missing, negative, and nonnumeric dashboard metrics instead of coercing them to zero', () => {
	for (const response of [
		{ total_patients: null, active_patients: 0, male_patients: 0, female_patients: 0 },
		{ total_patients: -1, active_patients: 0, male_patients: 0, female_patients: 0 },
		{ total_patients: 'not-a-count', active_patients: 0, male_patients: 0, female_patients: 0 },
	]) {
		assert.throws(() => dashboardRowFromResponse(response), /Invalid patient dashboard count/);
	}
});
