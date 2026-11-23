const test = require('node:test');
const assert = require('node:assert/strict');
const {
	assertPatientAnalyticsModuleEnabled,
	assertPatientAnalyticsRequestSucceeded,
} = require('../components/analytics/patients-analytics/components/patientAnalyticsAccess');
const { missingDataRowsFromResponse } = require('../components/analytics/patients-analytics/components/missingDataResponse');

test('parses the aggregate row returned by the missing-data controller', () => {
	const response = {
		missing_emails: '12',
		missing_mobile_numbers: 4,
		missing_middlenames: '0',
	};

	assert.deepEqual(
		missingDataRowsFromResponse(assertPatientAnalyticsRequestSucceeded(response)),
		[
			{ field: 'Email', missing: 12 },
			{ field: 'Mobile number', missing: 4 },
			{ field: 'Middle name', missing: 0 },
		],
	);
});

test('rejects the controller 500 error body before treating it as metric data', () => {
	const response = {
		error: 'Error fetching missing data analysis',
		statusCode: 500,
	};

	assert.throws(
		() => missingDataRowsFromResponse(
			assertPatientAnalyticsRequestSucceeded(
				assertPatientAnalyticsModuleEnabled(response),
			),
		),
		/Error fetching missing data analysis/,
	);
});

test('continues to reject malformed successful aggregate rows', () => {
	const response = {
		missing_emails: 'not-a-count',
		missing_mobile_numbers: 4,
		missing_middlenames: 0,
	};

	assert.throws(
		() => missingDataRowsFromResponse(assertPatientAnalyticsRequestSucceeded(response)),
		/Invalid missing-data count/,
	);
	assert.throws(
		() => missingDataRowsFromResponse(assertPatientAnalyticsRequestSucceeded({
			missing_emails: 1,
			missing_mobile_numbers: 2,
		})),
		/Invalid missing-data count/,
	);
});

test('rejects an empty aggregate result instead of presenting it as no data', () => {
	assert.throws(() => missingDataRowsFromResponse([]), /Unexpected data format/);
});
