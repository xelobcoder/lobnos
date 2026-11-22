export interface ManualRerunField {
	fieldid: number | string;
	name?: string;
	value?: unknown;
}

export interface ManualRerunRule {
	fieldid?: number | string;
	id?: number | string;
	manual_rerun_enabled?: number | boolean | string;
}

export interface ManualRerunSnapshot {
	fieldIds?: Array<number | string>;
	confirmedFieldIds?: Array<number | string>;
	staged?: Array<{ fieldid: number | string }>;
}

const numericId = (id: number | string): number => Number(id);

/** Intersect enabled test parameters with fields that currently have persisted values. */
export function eligibleManualRerunFields(
	persistedFields: ManualRerunField[],
	rules: ManualRerunRule[],
): ManualRerunField[] {
	const enabled = new Set(
		rules
			.filter((rule) => Number(rule.manual_rerun_enabled) === 1)
			.map((rule) => numericId(rule.fieldid ?? rule.id ?? Number.NaN))
			.filter((id) => Number.isSafeInteger(id) && id > 0),
	);

	return persistedFields.filter((field) => {
		const id = numericId(field.fieldid);
		const hasValue = field.value !== null && field.value !== undefined && String(field.value).trim() !== "";
		return Number.isSafeInteger(id) && enabled.has(id) && hasValue;
	});
}

/** Show a stable workflow label without changing or implying the saved result value. */
export function manualRerunDisplayState(run: ManualRerunSnapshot | null): string {
	if (!run) return "Ready";
	const requested = new Set((run.fieldIds || []).map(numericId));
	const confirmed = new Set((run.confirmedFieldIds || []).map(numericId));
	if (requested.size > 0 && [...requested].every((id) => confirmed.has(id))) return "Revalidated";
	if ((run.staged || []).length > 0) return "Awaiting confirmation";
	return "Awaiting rerun results";
}
