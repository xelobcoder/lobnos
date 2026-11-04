import { customFetch, customPost } from "../../components/Auth/customFetch";
import { balanceKeys, cents, periodQuery } from "./nhis";
import type { CashResult, EntryPayload, NhisEvent, PageResult, PeriodQuery, PeriodPreviewInput, PeriodSettlementPayload, PeriodSettlementPreview, PeriodSettlementResult, ReceivablesResult, ReversalPayload } from "./nhis";

export function checkedResult<T>(response: { status?: string; statusCode?: number; message?: string; code?: string; result?: T } | null | undefined): T {
    if (response?.status !== "success" || ![200, 201].includes(response.statusCode ?? 0) || response.result == null)
        throw new Error([response?.code, response?.message || "The request could not be completed"].filter(Boolean).join(": "));
    return response.result;
}
export function checkedPage<T>(value: PageResult<T>): PageResult<T> {
    if (!value || !Array.isArray(value.rows) || !Number.isSafeInteger(value.total) || value.total < 0 ||
        !Number.isSafeInteger(value.page) || value.page < 1 || !Number.isSafeInteger(value.count) || value.count < 1)
        throw new Error("The server returned an invalid paginated report");
    return value;
}
export const nhisApi = {
    async receivables(filters: PeriodQuery): Promise<ReceivablesResult> {
        const result = checkedResult<ReceivablesResult>(await customFetch(`accounting/nhis/receivables${periodQuery(filters)}`));
        checkedPage(result);
        if (result.basis !== "current_balances_for_service_period" || !Array.isArray(result.excludedMixedBills)) throw new Error("Invalid service-period report");
        balanceKeys.forEach(key => cents(result.totals?.[key]));
        result.rows.forEach(row => balanceKeys.forEach(key => cents(row[key])));
        return result;
    },
    async cash(filters: PeriodQuery): Promise<CashResult> {
        const result = checkedResult<CashResult>(await customFetch(`accounting/nhis/cash-receipts${periodQuery(filters)}`));
        checkedPage(result);
        if (result.basis !== "cash_received_in_period") throw new Error("Invalid receipt-date cash report");
        ["received", "reversedOrRefunded", "netReceived"].forEach(key => cents(result.totals?.[key as keyof CashResult["totals"]]));
        result.rows.forEach(row => cents(row.amount));
        return result;
    },
    async events(filters: PeriodQuery): Promise<PageResult<NhisEvent>> {
        const result = checkedResult<PageResult<NhisEvent>>(await customFetch(`accounting/nhis/events${periodQuery(filters)}`));
        checkedPage(result);
        result.rows.forEach(event => {
            cents(event.amount);
            if (!Array.isArray(event.allocations)) throw new Error("Invalid event allocations");
        });
        return result;
    },
    async allocations(id: number, filters: Pick<PeriodQuery, "page" | "count">): Promise<PageResult<NhisEvent["allocations"][number]>> {
        if (!Number.isSafeInteger(id) || id < 1) throw new Error("Invalid NHIS event");
        const query = periodQuery({ ...filters, from: "", to: "" });
        const result = checkedPage(checkedResult<PageResult<NhisEvent["allocations"][number]>>(await customFetch(`accounting/nhis/events/${id}/allocations${query}`)));
        result.rows.forEach(row => { cents(row.amount); cents(row.tax_amount); });
        return result;
    },
    async entry(payload: EntryPayload) {
        return checkedResult<{ event: NhisEvent; allocations: NhisEvent["allocations"]; alreadyApplied?: boolean }>(
            await customPost(`accounting/nhis/${payload.kind ? "adjustments" : "receipts"}`, "POST", payload));
    },
    async previewPeriod(payload: PeriodPreviewInput): Promise<PeriodSettlementPreview> {
        const result = checkedResult<PeriodSettlementPreview>(await customPost("accounting/nhis/period-settlements/preview", "POST", payload));
        if (result.from !== payload.from || result.to !== payload.to || result.allocationMethod !== "proportional" ||
            !Number.isSafeInteger(result.billCount) || result.billCount < 0 || !Number.isSafeInteger(result.excludedMixedBillCount) || result.excludedMixedBillCount < 0 ||
            typeof result.snapshotToken !== "string" || !result.snapshotToken || !Array.isArray(result.allocationSample))
            throw new Error("The server returned an invalid period allocation preview");
        const outstanding = cents(result.eligibleOutstanding), received = cents(result.received), remaining = cents(result.remaining), adjusted = cents(result.adjusted), after = cents(result.outstandingAfter);
        if ([outstanding, received, remaining, adjusted, after].some(value => value < 0) || received !== cents(payload.amount) ||
            received > outstanding || remaining !== outstanding - received || after !== remaining - adjusted ||
            adjusted !== (payload.remainingDisposition === "final" ? remaining : 0))
            throw new Error("Period allocation totals do not reconcile");
        result.allocationSample.forEach(row => {
            if (!Number.isSafeInteger(row.billingId) || row.billingId <= 0 || typeof row.reference !== "string") throw new Error("Invalid period allocation sample");
            const balance = cents(row.outstanding), allocation = cents(row.received), remainder = cents(row.remaining);
            if (balance < 0 || allocation < 0 || remainder < 0 || balance - allocation !== remainder) throw new Error("Invalid period allocation sample amounts");
        });
        return result;
    },
    async settlePeriod(payload: PeriodSettlementPayload): Promise<PeriodSettlementResult> {
        const result = checkedResult<PeriodSettlementResult>(await customPost("accounting/nhis/period-settlements", "POST", payload));
        if (!result.settlement || result.settlement.from !== payload.from || result.settlement.to !== payload.to ||
            !Number.isSafeInteger(result.settlement.billCount) || result.settlement.billCount < 1)
            throw new Error("The server did not confirm the period settlement");
        const settlement = result.settlement;
        const received = cents(settlement.received), remaining = cents(settlement.remaining), adjusted = cents(settlement.adjusted), outstanding = cents(settlement.outstandingAfter);
        if ([received, remaining, adjusted, outstanding].some(amount => amount < 0) || received !== cents(payload.amount) ||
            remaining - adjusted !== outstanding || settlement.remainingDisposition !== payload.remainingDisposition ||
            adjusted !== (payload.remainingDisposition === "final" ? remaining : 0) ||
            (received > 0 && !result.receiptEvent) || (adjusted > 0 && !result.adjustmentEvent))
            throw new Error("The confirmed period settlement does not reconcile");
        return result;
    },
    async reverse(id: number, payload: ReversalPayload) {
        return checkedResult<{ event: NhisEvent; allocations: NhisEvent["allocations"]; alreadyApplied?: boolean }>(
            await customPost(`accounting/nhis/events/${id}/reversal`, "POST", payload));
    },
};
