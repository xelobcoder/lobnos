export type ResultSmsApproval = {
	isapproved?: number | string | null;
	requires_revalidation?: number | string | null;
	resultEntryEnd?: string | null;
};

export function isResultSmsReady(result: ResultSmsApproval): boolean {
	return Number(result.isapproved) === 1 && Number(result.requires_revalidation) !== 1 && Boolean(result.resultEntryEnd);
}
