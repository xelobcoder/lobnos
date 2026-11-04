import { cents, decimal, entryPayload, nhisPermissions, periodPreviewPayload, periodSettlementPayload, reversalPayload, sumMoney, today } from "../../../lib/accounting/nhis";
import type { EntryDraft, EntryPayload, NhisBill, NhisEvent, PeriodPreviewInput, PeriodSettlementPayload, PeriodSettlementPreview, PeriodSettlementResult, ReversalPayload } from "../../../lib/accounting/nhis";

export const currencyFormatter = new Intl.NumberFormat("en-GH", { style: "currency", currency: "GHS" });
const baseBills: NhisBill[] = [
    { billingId: 101, reference: "BILL-101", serviceDate: "2026-01-15", expected: "700000.00", received: "300000.00", revenueAdjustments: "0.00", writtenOff: "0.00", outstanding: "400000.00", unverifiedLegacyReceipts: "0.00", reconciliationDifference: "0.00" },
    { billingId: 102, reference: "BILL-102", serviceDate: "2026-01-20", expected: "500000.00", received: "200000.00", revenueAdjustments: "0.00", writtenOff: "0.00", outstanding: "300000.00", unverifiedLegacyReceipts: "0.00", reconciliationDifference: "0.00" },
];
let events: NhisEvent[] = [{
    id: 1, kind: "receipt", reference: "SYNTH-INITIAL", reason: "Synthetic opening remittance (no real data)", event_date: "2026-02-10", amount: "500000.00", created_by: 9,
    allocations: [{ id: 1, event_id: 1, billingid: 101, amount: "300000.00", tax_amount: "0.00" }, { id: 2, event_id: 1, billingid: 102, amount: "200000.00", tax_amount: "0.00" }],
}];
const requests = new Map<string, { fingerprint: string; result: unknown }>();
const calls: Array<{ endpoint: string; method: string; payload?: unknown }> = [];
const query = new URLSearchParams(location.search);
if (query.has("bulk")) {
    baseBills.splice(0, baseBills.length, ...Array.from({ length: 5000 }, (_, index): NhisBill => ({
        billingId: index + 101, reference: `BILL-${index + 101}`, serviceDate: `2026-${String(1 + index % 5).padStart(2, "0")}-15`,
        expected: "160.00", received: "0.00", revenueAdjustments: "0.00", writtenOff: "0.00", outstanding: "160.00",
        unverifiedLegacyReceipts: "0.00", reconciliationDifference: "0.00",
    })));
    events = [];
}
const controls = { calls, failNext: false, loseNextResponse: false, reportError: query.has("reportError"), authorityError: query.has("authorityError") };
declare global { interface Window { nhisFixture: typeof controls } }
window.nhisFixture = controls;
const success = (result: unknown, statusCode = 200) => ({ status: "success", statusCode, result: JSON.parse(JSON.stringify(result)) });
const failure = (message: string, code = "FIXTURE_REJECTED") => ({ status: "error", statusCode: 409, code, message });
const permitted = (permission: string) => !query.has("readonly") &&
    (!query.has("receiptOnly") || permission === "accounting.journal.post");
function bills() {
    const balances = new Map<number, { received: string; revenueAdjustments: string; writtenOff: string }>();
    for (const event of events) {
        const kind = event.kind === "reversal" ? event.reverses_kind : event.kind;
        const key = kind === "receipt" ? "received" : kind === "write_off" ? "writtenOff" : "revenueAdjustments";
        for (const allocation of event.allocations) {
            const balance = balances.get(allocation.billingid) || { received: "0.00", revenueAdjustments: "0.00", writtenOff: "0.00" };
            balance[key] = sumMoney([balance[key], allocation.amount]);
            balances.set(allocation.billingid, balance);
        }
    }
    return baseBills.map(base => {
        const bill = { ...base, received: "0.00", revenueAdjustments: "0.00", writtenOff: "0.00", ...balances.get(base.billingId) };
        bill.outstanding = decimal(cents(bill.expected) - cents(bill.received) - cents(bill.revenueAdjustments) - cents(bill.writtenOff));
        if (query.has("warnings") && bill.billingId === 101) { bill.unverifiedLegacyReceipts = "25.00"; bill.reconciliationDifference = "10.00"; }
        return bill;
    });
}
async function preview(input: PeriodPreviewInput) {
    periodPreviewPayload({ ...input, reference: "", reason: "", remainingReason: "", adjustmentReference: "", adjustmentReason: "", adjustmentKind: input.adjustmentKind || "", paymentAccountCode: "acc-1001" });
    const rows = bills().filter(bill => bill.serviceDate >= input.from && bill.serviceDate <= input.to && cents(bill.outstanding) > 0);
    const total = cents(sumMoney(rows.map(bill => bill.outstanding))), received = cents(input.amount);
    if (!total || received > total) throw new Error("NHIS_PERIOD_BALANCE_EXCEEDED: No eligible balance, or amount exceeds outstanding");
    const allocated = rows.map(bill => {
        const product = BigInt(cents(bill.outstanding)) * BigInt(received);
        return { bill, received: Number(product / BigInt(total)), remainder: product % BigInt(total) };
    });
    let left = received - allocated.reduce((sum, row) => sum + row.received, 0);
    for (const row of [...allocated].sort((a, b) => a.remainder === b.remainder ? a.bill.billingId - b.bill.billingId : a.remainder > b.remainder ? -1 : 1)) {
        if (!left) break;
        row.received++; left--;
    }
    const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(JSON.stringify({ input, balances: rows.map(bill => [bill.billingId, bill.outstanding]) })));
    const result: PeriodSettlementPreview = {
        from: input.from, to: input.to, billCount: rows.length, eligibleOutstanding: decimal(total), received: decimal(received),
        remaining: decimal(total - received), adjusted: input.remainingDisposition === "final" ? decimal(total - received) : "0.00",
        outstandingAfter: input.remainingDisposition === "final" ? "0.00" : decimal(total - received), allocationMethod: "proportional",
        snapshotToken: `fixture-${Array.from(new Uint8Array(digest)).map(byte => byte.toString(16).padStart(2, "0")).join("")}`,
        excludedMixedBillCount: query.has("warnings") ? 1 : 0,
        allocationSample: allocated.slice(0, 20).map(row => ({ billingId: row.bill.billingId, reference: row.bill.reference, outstanding: row.bill.outstanding, received: decimal(row.received), remaining: decimal(cents(row.bill.outstanding) - row.received) })),
    };
    return { result, allocated };
}
function inPeriod(date: string, params: URLSearchParams) {
    return (!params.get("from") || date >= params.get("from")!) && (!params.get("to") || date <= params.get("to")!);
}
function page<T>(rows: T[], params: URLSearchParams) {
    const page = Number(params.get("page")), count = Number(params.get("count"));
    if (!Number.isSafeInteger(page) || page < 1 || !Number.isSafeInteger(count) || count < 1) throw new Error("Every fixture report requires page and count");
    return { rows: rows.slice((page - 1) * count, page * count), total: rows.length, page, count };
}
export async function customFetch(endpoint: string) {
    calls.push({ endpoint, method: "GET" });
    if (endpoint === "accounting/authority/mine") {
        if (controls.authorityError) return failure("Synthetic authority lookup failure");
        return success({ employeeid: 9, role: "accountant", permissions: Object.fromEntries(Object.values(nhisPermissions).map(permission => [permission, { allowed: permitted(permission), reason: "Synthetic authority" }])) });
    }
    if (controls.reportError) return failure("Synthetic report failure");
    const url = new URL(endpoint, "http://synthetic.invalid/");
    if (url.pathname === "/accounting/nhis/receivables") {
        const rows = bills().filter(bill => inPeriod(bill.serviceDate, url.searchParams));
        const keys = ["expected", "received", "revenueAdjustments", "writtenOff", "outstanding", "unverifiedLegacyReceipts", "reconciliationDifference"] as const;
        return success({ ...page(rows, url.searchParams), payer: "NHIS", basis: "current_balances_for_service_period", from: url.searchParams.get("from") || "", to: url.searchParams.get("to") || "",
            totals: Object.fromEntries(keys.map(key => [key, sumMoney(rows.map(row => row[key]))])), excludedMixedBills: query.has("warnings") ? [999] : [] });
    }
    if (url.pathname === "/accounting/nhis/events")
        return success(page(events.filter(event => inPeriod(event.event_date, url.searchParams)).slice().reverse().map(event => ({ ...event, allocationCount: event.allocations.length, allocations: event.allocations.slice(0, 10) })), url.searchParams));
    const allocations = /^\/accounting\/nhis\/events\/(\d+)\/allocations$/.exec(url.pathname);
    if (allocations) {
        const event = events.find(item => item.id === Number(allocations[1]));
        return event ? success(page(event.allocations, url.searchParams)) : failure("Event not found");
    }
    if (url.pathname === "/accounting/nhis/cash-receipts") {
        const matching = events.filter(event => (event.kind === "receipt" || event.kind === "reversal" && event.reverses_kind === "receipt") && inPeriod(event.event_date, url.searchParams));
        const rows = matching.flatMap(event => event.allocations.map(a => ({ source: event.kind, reference: event.reference, billingId: a.billingid, date: event.event_date, amount: a.amount })));
        return success({ ...page(rows, url.searchParams), basis: "cash_received_in_period", totals: {
            received: sumMoney(matching.filter(e => e.kind === "receipt").map(e => e.amount)),
            reversedOrRefunded: sumMoney(matching.filter(e => e.kind === "reversal").map(e => e.amount)),
            netReceived: sumMoney(matching.map(e => e.amount)),
        } });
    }
    return failure(`Unknown synthetic endpoint: ${endpoint}`, "UNKNOWN_ENDPOINT");
}
export async function customPost(endpoint: string, method: string, payload: EntryPayload | ReversalPayload | PeriodPreviewInput | PeriodSettlementPayload) {
    calls.push({ endpoint, method, payload: JSON.parse(JSON.stringify(payload)) });
    if (endpoint === "accounting/nhis/period-settlements/preview") {
        try {
            if (method !== "POST" || !("remainingDisposition" in payload)) throw new Error("Invalid preview schema");
            return success((await preview(payload)).result);
        } catch (error) { return failure(error instanceof Error ? error.message : "Synthetic preview rejected"); }
    }
    if (!("requestKey" in payload)) return failure("Request key required");
    const fingerprint = JSON.stringify({ endpoint, method, payload });
    const existing = requests.get(payload.requestKey);
    if (existing) return existing.fingerprint === fingerprint ? success({ ...(existing.result as object), alreadyApplied: true }, 201) : failure("Request key changed payload");
    if (controls.failNext) { controls.failNext = false; return failure("Synthetic mutation rejection — no success fallback"); }
    try {
        if (method !== "POST" || !/^[A-Za-z0-9_-]{16,80}$/.test(payload.requestKey)) throw new Error("Invalid request schema");
        if ("remainingDisposition" in payload) {
            if (endpoint !== "accounting/nhis/period-settlements") throw new Error("Unknown period endpoint");
            const core: PeriodPreviewInput = { from: payload.from, to: payload.to, amount: payload.amount, date: payload.date, remainingDisposition: payload.remainingDisposition, ...(payload.adjustmentKind ? { adjustmentKind: payload.adjustmentKind } : {}) };
            const { result: reviewed, allocated } = await preview(core);
            if (payload.snapshotToken !== reviewed.snapshotToken) throw new Error("NHIS_STALE_PERIOD_PREVIEW: Balances changed; preview again");
            const validated = periodSettlementPayload({ ...payload, reference: payload.reference, reason: payload.reason, remainingReason: payload.remainingReason || "", adjustmentReference: payload.adjustmentReference || "", adjustmentReason: payload.adjustmentReason || "", adjustmentKind: payload.adjustmentKind || "", paymentAccountCode: payload.paymentAccountCode || "acc-1001" }, reviewed, true);
            if (Object.keys(payload).sort().join() !== [...Object.keys(validated), "requestKey"].sort().join()) throw new Error("Strict period schema rejected");
            if (cents(payload.amount) > 0 && !permitted(nhisPermissions.receipt)) throw new Error("Posting authority denied");
            if (cents(reviewed.adjusted) > 0 && !permitted(nhisPermissions.write_off)) throw new Error("Approval authority denied");
            const settlement: PeriodSettlementResult["settlement"] = { id: events.length + 1, from: payload.from, to: payload.to, billCount: reviewed.billCount, received: reviewed.received, remaining: reviewed.remaining, adjusted: reviewed.adjusted, outstandingAfter: reviewed.outstandingAfter, remainingDisposition: payload.remainingDisposition, remainingReason: payload.remainingReason, adjustmentKind: payload.adjustmentKind };
            const makeEvent = (kind: "receipt" | "revenue_adjustment" | "write_off", id: number, reference: string, reason: string): NhisEvent => ({
                id, kind, reference, reason, event_date: payload.date, created_by: 9, amount: kind === "receipt" ? reviewed.received : reviewed.adjusted, periodSettlement: settlement,
                allocations: allocated.map((row, index) => ({ id: id * 10000 + index, event_id: id, billingid: row.bill.billingId, amount: decimal(kind === "receipt" ? row.received : cents(row.bill.outstanding) - row.received), tax_amount: "0.00" })).filter(row => cents(row.amount) > 0),
            });
            const receipt = cents(reviewed.received) > 0 ? makeEvent("receipt", events.length + 1, payload.reference, payload.reason) : null;
            const adjustment = cents(reviewed.adjusted) > 0 ? makeEvent(payload.adjustmentKind!, events.length + (receipt ? 2 : 1), payload.adjustmentReference!, payload.adjustmentReason!) : null;
            const added = [receipt, adjustment].filter((event): event is NhisEvent => !!event);
            if (added.some(event => events.some(existing => existing.kind === event.kind && existing.reference === event.reference))) throw new Error("Reference already exists");
            events = [...events, ...added];
            const bounded = (event: NhisEvent | null) => event ? { ...event, allocationCount: event.allocations.length, allocations: event.allocations.slice(0, 10) } : null;
            const result: PeriodSettlementResult = { receiptEvent: bounded(receipt), adjustmentEvent: bounded(adjustment), settlement };
            requests.set(payload.requestKey, { fingerprint, result });
            if (controls.loseNextResponse) { controls.loseNextResponse = false; throw new Error("Synthetic interrupted response AFTER application; retry unchanged"); }
            return success(result, 201);
        }
        const reversal = /^accounting\/nhis\/events\/(\d+)\/reversal$/.exec(endpoint);
        let event: NhisEvent;
        const id = events.length + 1;
        if (reversal) {
            if (!permitted(nhisPermissions.reversal)) throw new Error("Reversal authority denied");
            if (Object.keys(payload).sort().join() !== ["requestKey", "reference", "reason", "date"].sort().join()) throw new Error("Strict reversal schema rejected");
            const original = events.find(e => e.id === Number(reversal[1]));
            if (!original || original.kind === "reversal" || events.some(e => e.reversal_of_event_id === original.id)) throw new Error("Event is already reversed or not reversible");
            reversalPayload(payload.reference, payload.reason, payload.date, original.event_date, true);
            event = { id, kind: "reversal", reverses_kind: original.kind, reversal_of_event_id: original.id, reference: payload.reference, reason: payload.reason, event_date: payload.date,
                amount: decimal(-cents(original.amount)), created_by: 9, allocations: original.allocations.map((a, i) => ({ ...a, id: id * 100 + i, event_id: id, amount: decimal(-cents(a.amount)), tax_amount: decimal(-cents(a.tax_amount)) })) };
        } else {
            if (!["accounting/nhis/receipts", "accounting/nhis/adjustments"].includes(endpoint)) throw new Error("Unknown mutation endpoint");
            const entry = payload as EntryPayload;
            const kind = entry.kind || "receipt";
            if (!permitted(nhisPermissions[kind])) throw new Error("Posting authority denied");
            const candidateBills = bills();
            const validated = entryPayload({ ...entry, kind, paymentAccountCode: entry.paymentAccountCode || "acc-1001", allocations: entry.allocations.map(a => {
                const bill = candidateBills.find(b => b.billingId === a.billingId);
                if (!bill) throw new Error("Bill is not an active-branch NHIS candidate");
                return { bill, amount: a.amount };
            }) } as EntryDraft);
            if (Object.keys(entry).sort().join() !== [...Object.keys(validated), "requestKey"].sort().join()) throw new Error("Strict event schema rejected");
            event = { id, kind, reference: validated.reference, reason: validated.reason, event_date: validated.date, amount: validated.amount, created_by: 9,
                allocations: validated.allocations.map((a, i) => ({ id: id * 100 + i, event_id: id, billingid: a.billingId, amount: a.amount, tax_amount: "0.00" })) };
        }
        if (events.some(e => e.reference === event.reference && e.kind === event.kind)) throw new Error("Reference already exists for this event kind");
        if (event.event_date > today()) throw new Error("Future date rejected");
        events = [...events, event];
        const result = { event, allocations: event.allocations };
        requests.set(payload.requestKey, { fingerprint, result });
        if (controls.loseNextResponse) { controls.loseNextResponse = false; throw new Error("Synthetic interrupted response AFTER application; retry unchanged"); }
        return success(result, 201);
    } catch (error) { return failure(error instanceof Error ? error.message : "Synthetic request rejected"); }
}
