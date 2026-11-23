/**
 * The patient-analytics distribution routes return the SQL rows directly.
 * Accept the common result/data envelopes as well, since customFetch passes
 * through JSON from deployments that wrap successful backend responses.
 *
 * @param {unknown} response
 * @returns {Record<string, unknown>[]}
 */
function patientDistributionRowsFromResponse(response) {
	if (Array.isArray(response)) return response;

	if (response && typeof response === 'object') {
		const envelope = /** @type {Record<string, unknown>} */ (response);
		const statusCode = Number(envelope.statusCode);
		const status = String(envelope.status ?? '').toLowerCase();
		if (
			(statusCode >= 400 && statusCode <= 599) ||
			envelope.success === false ||
			envelope.status === false ||
			status === 'error' ||
			Boolean(envelope.error)
		) {
			throw new Error('Patient distribution request failed.');
		}

		if (Array.isArray(envelope.result)) return envelope.result;
		if (Array.isArray(envelope.data)) return envelope.data;
	}

	throw new Error('Unexpected patient distribution response.');
}

module.exports = { patientDistributionRowsFromResponse };
