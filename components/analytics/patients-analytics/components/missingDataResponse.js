/**
 * Convert the missing-data endpoint's single aggregate row into display rows.
 * The controller returns that row as an object; an empty array is retained as
 * the established no-data response.
 *
 * @param {unknown} result
 * @returns {{field: string, missing: number}[]}
 */
function missingDataRowsFromResponse(result) {
	const row = Array.isArray(result) ? result[0] : result;
	if (!row || typeof row !== 'object' || Array.isArray(row)) {
		throw new Error('Unexpected data format received.');
	}

	const response = /** @type {Record<string, unknown>} */ (row);
	const asCount = (value) => {
		const count = Number(value);
		if (value === undefined || value === null || !Number.isFinite(count) || count < 0) {
			throw new Error('Invalid missing-data count in response.');
		}
		return count;
	};

	return [
		{ field: 'Email', missing: asCount(response.missing_emails) },
		{ field: 'Mobile number', missing: asCount(response.missing_mobile_numbers) },
		{ field: 'Middle name', missing: asCount(response.missing_middlenames) },
	];
}

module.exports = { missingDataRowsFromResponse };
