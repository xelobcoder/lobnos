const test = require('node:test');
const assert = require('node:assert/strict');
const {
	assertPatientAnalyticsModuleEnabled,
	assertPatientAnalyticsRequestSucceeded,
	isPatientAnalyticsAccessDeniedError,
	isPatientAnalyticsModuleDisabledError,
	isPatientAnalyticsModuleDisabledResponse,
	patientAnalyticsFailureMessage,
} = require('../components/analytics/patients-analytics/components/patientAnalyticsAccess');

test('recognizes the inactive analytics module 403 before response parsing', () => {
	const response = {
		status: 'error',
		statusCode: 403,
		message: 'analytics module is not activated for this facility',
	};

	assert.equal(isPatientAnalyticsModuleDisabledResponse(response), true);
	assert.throws(
		() => assertPatientAnalyticsModuleEnabled(response),
		error => {
			assert.equal(isPatientAnalyticsModuleDisabledError(error), true);
			assert.equal(error.statusCode, 403);
			assert.equal(error.serverMessage, response.message);
			assert.match(patientAnalyticsFailureMessage(error, 'fallback'), /HTTP 403: analytics module is not activated for this facility/);
			return true;
		},
	);
});

test('recognizes tenant-level analytics authorization failure as an unavailable module', () => {
	const response = {
		status: 'error',
		statusCode: 403,
		message: 'analytics module is not authorized for this tenant',
	};

	assert.equal(isPatientAnalyticsModuleDisabledResponse(response), true);
	assert.throws(
		() => assertPatientAnalyticsModuleEnabled(response),
		error => {
			assert.equal(isPatientAnalyticsModuleDisabledError(error), true);
			assert.match(patientAnalyticsFailureMessage(error, 'fallback'), /not authorized for this tenant/);
			return true;
		},
	);
});

test('preserves the administrator-required 403 as actionable access diagnostics', () => {
	const response = {
		status: 'error',
		statusCode: 403,
		message: 'You do not have permission to access this resources.Contact administrator for more information',
	};

	assert.equal(isPatientAnalyticsModuleDisabledResponse(response), false);
	assert.throws(
		() => assertPatientAnalyticsRequestSucceeded(assertPatientAnalyticsModuleEnabled(response)),
		error => {
			assert.equal(error.code, 'PATIENT_ANALYTICS_REQUEST_FAILED');
			assert.equal(error.statusCode, 403);
			assert.equal(isPatientAnalyticsAccessDeniedError(error), true);
			assert.equal(error.serverMessage, response.message);
			assert.equal(
				patientAnalyticsFailureMessage(error, 'fallback'),
				`Patient analytics request failed (HTTP 403): ${response.message}`,
			);
			return true;
		},
	);
});

test('preserves controller failure status and message instead of passing the error object to a parser', () => {
	const response = { error: 'Error fetching dashboards data', statusCode: 500 };

	assert.throws(
		() => assertPatientAnalyticsRequestSucceeded(response),
		error => {
			assert.equal(error.statusCode, 500);
			assert.equal(isPatientAnalyticsAccessDeniedError(error), false);
			assert.equal(error.serverMessage, response.error);
			assert.equal(
				patientAnalyticsFailureMessage(error, 'fallback'),
				'Patient analytics request failed (HTTP 500): Error fetching dashboards data',
			);
			return true;
		},
	);
});

test('passes successful response rows through unchanged', () => {
	const response = [{ missing_emails: 3, missing_mobile_numbers: 1, missing_middlenames: 0 }];
	assert.equal(assertPatientAnalyticsModuleEnabled(response), response);
});
