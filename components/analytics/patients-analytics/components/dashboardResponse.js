/**
 * @typedef {{
 *   total_patients: number | string,
 *   active_patients: number | string,
 *   male_patients: number | string,
 *   female_patients: number | string
 * }} PatientDashboardData
 */

const metricFields = ['total_patients', 'active_patients', 'male_patients', 'female_patients'];

/**
 * The dashboard API has historically returned its aggregate row in an array,
 * while some deployments return the single aggregate row directly.
 *
 * @param {unknown} response
 * @returns {PatientDashboardData}
 */
function dashboardRowFromResponse(response) {
	const row = Array.isArray(response) ? response[0] : response;
	if (
		!row ||
		typeof row !== 'object' ||
		Array.isArray(row) ||
		!metricFields.every(field => Object.prototype.hasOwnProperty.call(row, field))
	) {
		throw new Error('Unexpected dashboard response');
	}

	for (const field of metricFields) {
		const count = Number(row[field]);
		if (row[field] === null || row[field] === undefined || !Number.isSafeInteger(count) || count < 0) {
			throw new Error(`Invalid patient dashboard count: ${field}`);
		}
	}

	return /** @type {PatientDashboardData} */ (row);
}

module.exports = { dashboardRowFromResponse };
