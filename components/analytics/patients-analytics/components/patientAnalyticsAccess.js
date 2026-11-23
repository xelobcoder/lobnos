const PATIENT_ANALYTICS_DISABLED_CODE = 'PATIENT_ANALYTICS_MODULE_INACTIVE';
const PATIENT_ANALYTICS_REQUEST_FAILED_CODE = 'PATIENT_ANALYTICS_REQUEST_FAILED';
const PATIENT_ANALYTICS_DISABLED_MESSAGE =
	'Patient analytics is unavailable because the Analytics module is not enabled for this facility or tenant.';

function statusCodeFrom(body) {
	const value = Number(body.statusCode ?? (typeof body.status === 'number' ? body.status : NaN));
	return Number.isInteger(value) && value >= 100 && value <= 599 ? value : null;
}

function messageFrom(body) {
	if (typeof body.message === 'string' && body.message.trim()) return body.message.trim();
	if (typeof body.error === 'string' && body.error.trim()) return body.error.trim();
	if (body.error && typeof body.error === 'object' && typeof body.error.message === 'string') {
		return body.error.message;
	}
	return '';
}

/**
 * The server responds to an inactive analytics module with a JSON 403 body.
 * customFetch returns that body rather than rejecting on the HTTP status.
 *
 * @param {unknown} response
 */
function isPatientAnalyticsModuleDisabledResponse(response) {
	if (!response || typeof response !== 'object' || Array.isArray(response)) return false;
	const body = /** @type {Record<string, unknown>} */ (response);
	const statusCode = Number(body.statusCode ?? body.status);
	const message = String(body.message ?? '');
	return statusCode === 403 &&
		/analytics module is not (?:activated for this facility|authorized for this tenant)/i.test(message);
}

/**
 * Call before interpreting a response as analytics data.
 *
 * @param {unknown} response
 * @returns {unknown}
 */
function assertPatientAnalyticsModuleEnabled(response) {
	if (isPatientAnalyticsModuleDisabledResponse(response)) {
		const error = new Error(PATIENT_ANALYTICS_DISABLED_MESSAGE);
		Object.assign(error, {
			code: PATIENT_ANALYTICS_DISABLED_CODE,
			statusCode: statusCodeFrom(/** @type {Record<string, unknown>} */ (response)),
			serverMessage: messageFrom(/** @type {Record<string, unknown>} */ (response)),
		});
		throw error;
	}
	return response;
}

/**
 * Other failed endpoint responses (for example a controller's 500 JSON body)
 * are also data-shaped objects to customFetch and must not reach metric parsers.
 *
 * @param {unknown} response
 * @returns {unknown}
 */
function assertPatientAnalyticsRequestSucceeded(response) {
	if (!response || typeof response !== 'object' || Array.isArray(response)) return response;
	const body = /** @type {Record<string, unknown>} */ (response);
	const statusCode = Number(body.statusCode ?? (typeof body.status === 'number' ? body.status : NaN));
	const status = String(body.status ?? '').toLowerCase();
	if (
		(statusCode >= 400 && statusCode <= 599) ||
		body.success === false ||
		body.status === false ||
		status === 'error' ||
		Boolean(body.error)
	) {
		const error = new Error(messageFrom(body) || 'Patient analytics request failed.');
		Object.assign(error, {
			code: PATIENT_ANALYTICS_REQUEST_FAILED_CODE,
			statusCode: statusCodeFrom(body),
			serverMessage: messageFrom(body),
		});
		throw error;
	}
	return response;
}

/**
 * @param {unknown} error
 */
function isPatientAnalyticsModuleDisabledError(error) {
	return Boolean(
		error &&
		typeof error === 'object' &&
		'code' in error &&
		error.code === PATIENT_ANALYTICS_DISABLED_CODE
	);
}

/**
 * Authentication/authorization failures are expected access states, not
 * report-parser or server failures.
 *
 * @param {unknown} error
 */
function isPatientAnalyticsAccessDeniedError(error) {
	if (!error || typeof error !== 'object') return false;
	const statusCode = statusCodeFrom(/** @type {Record<string, unknown>} */ (error));
	return statusCode === 401 || statusCode === 403;
}

/**
 * Keep the backend diagnostic visible while giving disabled-module responses
 * a clear, user-facing explanation.
 *
 * @param {unknown} error
 * @param {string} fallback
 */
function patientAnalyticsFailureMessage(error, fallback) {
	if (!error || typeof error !== 'object') return fallback;
	const details = /** @type {Record<string, unknown>} */ (error);
	const statusCode = statusCodeFrom(details);
	const serverMessage = typeof details.serverMessage === 'string' && details.serverMessage
		? details.serverMessage
		: typeof details.message === 'string' ? details.message : '';

	if (details.code === PATIENT_ANALYTICS_DISABLED_CODE) {
		return `${PATIENT_ANALYTICS_DISABLED_MESSAGE}${statusCode ? ` (HTTP ${statusCode}: ${serverMessage})` : ''}`;
	}
	if (details.code === PATIENT_ANALYTICS_REQUEST_FAILED_CODE) {
		return statusCode
			? `Patient analytics request failed (HTTP ${statusCode}): ${serverMessage || fallback}`
			: serverMessage || fallback;
	}
	return serverMessage || fallback;
}

module.exports = {
	PATIENT_ANALYTICS_DISABLED_MESSAGE,
	assertPatientAnalyticsModuleEnabled,
	assertPatientAnalyticsRequestSucceeded,
	isPatientAnalyticsAccessDeniedError,
	isPatientAnalyticsModuleDisabledError,
	isPatientAnalyticsModuleDisabledResponse,
	patientAnalyticsFailureMessage,
};
