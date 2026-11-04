/** NHIS money is calculated in integer pesewas, never with floating-point sums. */
export type Money = number | string;
export const balanceKeys = ["expected", "received", "revenueAdjustments", "writtenOff", "outstanding", "unverifiedLegacyReceipts", "reconciliationDifference"] as const;
export type Balances = Record<(typeof balanceKeys)[number], Money>;
export interface NhisBill extends Balances {
    billingId: number;
    reference: string;
    serviceDate: string;
}
export interface PageResult<T> { rows: T[]; total: number; page: number; count: number }
export interface ReceivablesResult extends PageResult<NhisBill> {
    payer: unknown;
    basis: "current_balances_for_service_period";
    from: string;
    to: string;
    totals: Balances;
    excludedMixedBills: number[];
}
export interface CashRow { source: string; reference: string; billingId: number; date: string; amount: Money }
export interface CashResult extends PageResult<CashRow> {
    basis: "cash_received_in_period";
    totals: { received: Money; reversedOrRefunded: Money; netReceived: Money };
}
export type EventKind = "receipt" | "revenue_adjustment" | "write_off" | "reversal";
export interface NhisEvent {
    id: number; kind: EventKind; reverses_kind?: EventKind; reversal_of_event_id?: number | null;
    reference: string; reason: string; event_date: string; amount: Money; created_by: number | string;
    allocations: Array<{ id: number; event_id: number; billingid: number; amount: Money; tax_amount: Money }>;
    allocationCount?: number;
    periodSettlement?: PeriodSettlementRecord;
}
export interface PeriodQuery { from: string; to: string; page: number; count: number }
export function periodQuery(filters: PeriodQuery): string {
    if (!Number.isSafeInteger(filters.page) || filters.page < 1 || !Number.isSafeInteger(filters.count) || filters.count < 1)
        throw new Error("Invalid page or row count");
    if (filters.from && filters.to && filters.from > filters.to) throw new Error("From date must not be after to date");
    const params = new URLSearchParams({ page: String(filters.page), count: String(filters.count) });
    if (filters.from) params.set("from", filters.from);
    if (filters.to) params.set("to", filters.to);
    return `?${params}`;
}
export function cents(value: Money): number {
    const text = String(value).trim();
    if (!/^-?\d+(?:\.\d{1,2})?$/.test(text)) throw new Error("Use a decimal amount with at most two decimal places (no commas)");
    const negative = text.startsWith("-");
    const [whole, fraction = ""] = text.replace(/^-/, "").split(".");
    const result = Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
    if (!Number.isSafeInteger(result)) throw new Error("Amount exceeds the supported money range");
    return negative ? -result : result;
}
export function decimal(value: number): string {
    if (!Number.isSafeInteger(value)) throw new Error("Invalid money total");
    return `${value < 0 ? "-" : ""}${Math.floor(Math.abs(value) / 100)}.${String(Math.abs(value) % 100).padStart(2, "0")}`;
}
export function sumMoney(values: Money[]): string {
    return decimal(values.reduce<number>((sum, value) => {
        const next = sum + cents(value);
        if (!Number.isSafeInteger(next)) throw new Error("Amount exceeds the supported money range");
        return next;
    }, 0));
}
export function today(): string {
    const date = new Date();
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
export interface AllocationDraft { bill: NhisBill; amount: string }
export interface EntryDraft {
    kind: Exclude<EventKind, "reversal">;
    reference: string; reason: string; date: string; amount: string;
    paymentAccountCode: "acc-1000" | "acc-1001";
    allocations: AllocationDraft[];
}
export interface EntryPayload {
    requestKey: string; reference: string; reason: string; date: string; amount: string;
    paymentAccountCode?: "acc-1000" | "acc-1001";
    kind?: "revenue_adjustment" | "write_off";
    allocations: Array<{ billingId: number; amount: string }>;
}
export interface ReversalPayload { requestKey: string; reference: string; reason: string; date: string }
export type RemainingDisposition = "pending" | "appeal" | "disputed" | "final";
export interface PeriodSettlementDraft {
    from: string; to: string; amount: string; date: string;
    reference: string; reason: string; paymentAccountCode: "acc-1000" | "acc-1001";
    remainingDisposition: RemainingDisposition; remainingReason: string;
    adjustmentKind: "" | "revenue_adjustment" | "write_off"; adjustmentReference: string; adjustmentReason: string;
}
export interface PeriodPreviewInput {
    from: string; to: string; amount: string; date: string; remainingDisposition: RemainingDisposition;
    adjustmentKind?: "revenue_adjustment" | "write_off";
}
export interface PeriodSettlementPreview {
    from: string; to: string; billCount: number; eligibleOutstanding: Money; received: Money;
    remaining: Money; adjusted: Money; outstandingAfter: Money; allocationMethod: "proportional";
    snapshotToken: string; excludedMixedBillCount: number;
    allocationSample: Array<{ billingId: number; reference: string; outstanding: Money; received: Money; remaining: Money }>;
}
export interface PeriodSettlementPayload extends PeriodPreviewInput {
    requestKey: string; reference: string; reason: string; snapshotToken: string;
    paymentAccountCode?: "acc-1000" | "acc-1001"; remainingReason?: string;
    adjustmentReference?: string; adjustmentReason?: string;
}
export interface PeriodSettlementRecord {
    id: string | number; from: string; to: string; billCount: number; remainingDisposition: RemainingDisposition;
    received: Money; remaining: Money; adjusted: Money; outstandingAfter: Money;
    remainingReason?: string; adjustmentKind?: "revenue_adjustment" | "write_off";
}
export interface PeriodSettlementResult {
    receiptEvent: NhisEvent | null; adjustmentEvent?: NhisEvent | null;
    settlement: PeriodSettlementRecord; alreadyApplied?: boolean;
}
function validateDate(date: string) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(`${date}T00:00:00Z`)) ||
        new Date(`${date}T00:00:00Z`).toISOString().slice(0, 10) !== date || date > today())
        throw new Error("Choose a valid date that is not in the future");
}
function metadata(reference: string, reason: string, date: string) {
    reference = reference.trim(); reason = reason.trim();
    if (!reference || reference.length > 120) throw new Error("Reference is required (up to 120 characters)");
    if (!reason || reason.length > 1000) throw new Error("Reason is required (up to 1000 characters)");
    validateDate(date);
    return { reference, reason, date };
}
export function periodPreviewPayload(draft: PeriodSettlementDraft): PeriodPreviewInput {
    validateDate(draft.from); validateDate(draft.to); validateDate(draft.date);
    if (draft.from > draft.to) throw new Error("Service-period from date must not be after to date");
    if (draft.to > draft.date) throw new Error("The posting date must be on or after the service period");
    if (!["pending", "appeal", "disputed", "final"].includes(draft.remainingDisposition)) throw new Error("Choose how the unpaid balance will be handled");
    const amount = cents(draft.amount);
    if (amount < 0 || (amount === 0 && draft.remainingDisposition !== "final")) throw new Error("Enter a positive received amount; zero is only allowed for a final noncash adjustment");
    const input: PeriodPreviewInput = { from: draft.from, to: draft.to, date: draft.date, amount: decimal(amount), remainingDisposition: draft.remainingDisposition };
    if (draft.remainingDisposition === "final") {
        if (draft.adjustmentKind !== "revenue_adjustment" && draft.adjustmentKind !== "write_off") throw new Error("Choose a tariff adjustment or a bad-debt write-off for the final unpaid balance");
        input.adjustmentKind = draft.adjustmentKind;
    }
    return input;
}
export function periodSettlementPayload(draft: PeriodSettlementDraft, preview: PeriodSettlementPreview, confirmed: boolean): Omit<PeriodSettlementPayload, "requestKey"> {
    const input = periodPreviewPayload(draft);
    const common = metadata(draft.reference, draft.reason, draft.date);
    if (preview.from !== input.from || preview.to !== input.to || cents(preview.received) !== cents(input.amount)) throw new Error("Preview the current service period and amount before posting");
    if (!Number.isSafeInteger(preview.billCount) || preview.billCount < 1) throw new Error("There are no eligible outstanding NHIS bills in this period");
    if (!preview.snapshotToken) throw new Error("The reviewed balance snapshot is missing");
    if (!confirmed) throw new Error("Confirm the reviewed period allocation before posting");
    const payload: Omit<PeriodSettlementPayload, "requestKey"> = { ...input, ...common, snapshotToken: preview.snapshotToken };
    if (cents(input.amount) > 0) {
        if (!["acc-1000", "acc-1001"].includes(draft.paymentAccountCode)) throw new Error("Choose cash or bank");
        payload.paymentAccountCode = draft.paymentAccountCode;
    }
    const remainingReason = draft.remainingReason.trim();
    if (remainingReason.length > 1000 || (["appeal", "disputed"].includes(input.remainingDisposition) && !remainingReason)) throw new Error("Explain the appeal or disputed balance (up to 1000 characters)");
    if (remainingReason) payload.remainingReason = remainingReason;
    if (input.remainingDisposition === "final") {
        const approval = metadata(draft.adjustmentReference, draft.adjustmentReason, input.date);
        payload.adjustmentReference = approval.reference;
        payload.adjustmentReason = approval.reason;
    }
    return payload;
}
export function entryPayload(draft: EntryDraft): Omit<EntryPayload, "requestKey"> {
    const common = metadata(draft.reference, draft.reason, draft.date);
    const amount = cents(draft.amount);
    if (amount <= 0) throw new Error("Amount must be positive");
    if (!draft.allocations.length) throw new Error("Select at least one NHIS bill from the service-period report");
    const ids = new Set<number>();
    const allocations = draft.allocations.map(({ bill, amount: allocationAmount }) => {
        if (!Number.isSafeInteger(bill.billingId) || bill.billingId <= 0 || ids.has(bill.billingId)) throw new Error("Invalid or duplicate bill allocation");
        ids.add(bill.billingId);
        const allocated = cents(allocationAmount);
        if (allocated <= 0 || allocated > cents(bill.outstanding)) throw new Error(`${bill.reference}: allocation must be positive and not exceed outstanding`);
        if (draft.date < bill.serviceDate.slice(0, 10)) throw new Error(`${bill.reference}: date cannot be before the bill's service date`);
        return { billingId: bill.billingId, amount: decimal(allocated) };
    }).sort((a, b) => a.billingId - b.billingId);
    if (cents(sumMoney(allocations.map(a => a.amount))) !== amount) throw new Error("Allocation total must exactly equal the explicit amount");
    if (draft.kind === "receipt") {
        if (!["acc-1000", "acc-1001"].includes(draft.paymentAccountCode)) throw new Error("Choose cash or bank");
        return { ...common, amount: decimal(amount), paymentAccountCode: draft.paymentAccountCode, allocations };
    }
    if (!["revenue_adjustment", "write_off"].includes(draft.kind)) throw new Error("Invalid adjustment kind");
    return { ...common, amount: decimal(amount), kind: draft.kind, allocations };
}
export function reversalPayload(reference: string, reason: string, date: string, eventDate: string, confirmed: boolean): Omit<ReversalPayload, "requestKey"> {
    if (!confirmed) throw new Error("Explicitly confirm the reversal");
    const common = metadata(reference, reason, date);
    if (date < eventDate.slice(0, 10)) throw new Error("Reversal date cannot be before the original event");
    return common;
}
export interface RequestAttempt<T> { fingerprint: string; payload: T & { requestKey: string } }
/** Keep this attempt after errors/unknown outcomes. Retry only on an explicit user submission. */
export function requestAttempt<T extends object>(payload: T, previous: RequestAttempt<T> | null, key: () => string): RequestAttempt<T> {
    const fingerprint = JSON.stringify(payload);
    if (previous?.fingerprint === fingerprint) return previous;
    const requestKey = key();
    if (!/^[A-Za-z0-9_-]{16,80}$/.test(requestKey)) throw new Error("Invalid request key");
    return { fingerprint, payload: { ...payload, requestKey } };
}
export interface Authority { permissions: Record<string, { allowed: boolean; reason?: string }> }
export const nhisPermissions = {
    receipt: "accounting.journal.post",
    revenue_adjustment: "accounting.journal.approve",
    write_off: "accounting.journal.approve",
    reversal: "accounting.financial_correction.execute",
} as const;
export function canAct(authority: Authority | null, kind: EventKind): boolean {
    return authority?.permissions?.[nhisPermissions[kind]]?.allowed === true;
}
export function payerDisplay(row: { partyType: string; partyName: string | null; classification?: string }): string {
    return row.classification === "mixed" ? `Mixed payer — ${row.partyName || "review required"}` :
        row.partyType === "nhis" || row.classification === "nhis" ? "NHIS" : row.partyName || "Unknown patient";
}
/** Guard known NHIS/mixed bills on legacy collection surfaces; unknown metadata is server-validated. */
export function requiresNhisWorkspace(row: {
    source?: number | string; billingsource?: number | string; billingSource?: number | string;
    entityType?: string; partyType?: string; classification?: string;
}): boolean {
    const classification = String(row.classification || "").toLowerCase();
    if (["nhis", "patient", "mixed"].includes(classification)) return classification !== "patient";
    const partyType = String(row.partyType || "").toLowerCase();
    if (["nhis", "patient", "mixed"].includes(partyType)) return partyType !== "patient";
    // Only old responses without canonical metadata use compatibility flags.
    return [row.source, row.billingsource, row.billingSource].some(value => Number(value) === 4) ||
        ["nhis", "mixed"].includes(String(row.entityType).toLowerCase());
}
