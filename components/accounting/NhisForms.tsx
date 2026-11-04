"use client";
import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { currencyFormatter } from "../Auth/customFetch";
import { useApplication } from "../Auth/useApplicationContext";
import { billingSubmissionIdentity } from "../../lib/billing/submissionIdentity";
import { nhisApi } from "../../lib/accounting/nhisApi";
import { canAct, cents, decimal, entryPayload, periodPreviewPayload, periodSettlementPayload, requestAttempt, reversalPayload, sumMoney, today } from "../../lib/accounting/nhis";
import type { AllocationDraft, Authority, EntryDraft, EntryPayload, NhisBill, NhisEvent, PeriodSettlementDraft, PeriodSettlementPayload, PeriodSettlementPreview, PeriodSettlementResult, RequestAttempt, ReversalPayload } from "../../lib/accounting/nhis";
import styles from "./NhisWorkspace.module.css";

interface ActionState { error?: string; success?: string; unresolved?: boolean; preview?: PeriodSettlementPreview; previewContext?: string }
interface MutationLock { busy?: boolean; begin?: () => boolean; end?: () => void; onUnresolvedChange?: (blocked: boolean) => void }
function Submit({ label, retry, name, value, formNoValidate }: { label: string; retry: boolean; name?: string; value?: string; formNoValidate?: boolean }) {
    const { pending } = useFormStatus();
    return <button className="btn btn-primary" type="submit" name={name} value={value} formNoValidate={formNoValidate} disabled={pending}>{pending ? "Submitting…" : retry ? "Retry / submit reviewed changes" : label}</button>;
}
function Outcome({ state }: { state: ActionState }) {
    return <>{state.error && <div className="alert alert-danger" role="alert">{state.error}</div>}
        {state.success && <div className="alert alert-success" role="status">{state.success}</div>}</>;
}
function RetryWarning({ checked, onChange }: { checked: boolean; onChange: (value: boolean) => void }) {
    return <div className="alert alert-warning">
        A failed or interrupted response may already have been applied. Retry unchanged data with the same request key; do not create a duplicate remittance.
        <label className="d-block mt-2"><input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} className="me-2" />
            I checked audit history before changing or closing this failed submission.</label>
        <a href="/accounting/nhis" target="_blank" rel="noopener noreferrer">Open NHIS workspace to review Activity</a>
    </div>;
}
function Fields({ prefix, reference, reason, date, setReference, setReason, setDate, dateLocked = false }: {
    prefix: string; reference: string; reason: string; date: string;
    dateLocked?: boolean;
    setReference: (value: string) => void; setReason: (value: string) => void; setDate: (value: string) => void;
}) {
    return <div className="row g-3 mb-3">
        <div className="col-md-6"><label className="form-label" htmlFor={`${prefix}-reference`}>Remittance / approval reference</label>
            <input id={`${prefix}-reference`} name="reference" className="form-control" required maxLength={120} placeholder="e.g. NHIA-2026-0042" value={reference} onChange={e => setReference(e.target.value)} />
            <small className={styles.fieldHint}>Use the unique reference on the remittance or approval.</small></div>
        <div className="col-md-6"><label className="form-label" htmlFor={`${prefix}-date`}>{dateLocked ? "Posting date (today UTC)" : "Posting date"}</label>
            <input id={`${prefix}-date`} name="date" type="date" className="form-control" required readOnly={dateLocked} max={dateLocked ? date : today()} value={date} onChange={e => setDate(e.target.value)} /></div>
        <div className="col-12"><label className="form-label" htmlFor={`${prefix}-reason`}>Reason / remittance details</label>
            <textarea id={`${prefix}-reason`} name="reason" className="form-control" required maxLength={1000} rows={2} placeholder="Add the remittance details or approval reason" value={reason} onChange={e => setReason(e.target.value)} /></div>
    </div>;
}
export function NhisPeriodRemittanceForm({ authority, from, to, adjustmentOnly = false, onSuccess, onCancel, busy, begin, end, onUnresolvedChange }: {
    authority: Authority; from: string; to: string; adjustmentOnly?: boolean;
    onSuccess: (result: PeriodSettlementResult) => void; onCancel: () => void;
} & MutationLock) {
    const application = useApplication();
    const [draft, setDraft] = useState<PeriodSettlementDraft>(() => ({
        from, to, amount: adjustmentOnly ? "0.00" : "", date: new Date().toISOString().slice(0, 10), reference: "", reason: "",
        paymentAccountCode: "acc-1001", remainingDisposition: adjustmentOnly ? "final" : "pending", remainingReason: "",
        adjustmentKind: "", adjustmentReference: "", adjustmentReason: "",
    }));
    const [reviewedChanges, setReviewedChanges] = useState(false), [confirmed, setConfirmed] = useState(false);
    const attempt = useRef<RequestAttempt<Omit<PeriodSettlementPayload, "requestKey">> | null>(null), completed = useRef("");
    const previewContext = JSON.stringify([draft.from, draft.to, draft.amount, draft.date, draft.remainingDisposition, draft.adjustmentKind]);
    const [state, action, pending] = useActionState<ActionState, FormData>(async (previous, formData) => {
        let acquired = false;
        try {
            if (begin && !begin()) throw new Error("Another NHIS mutation is in progress");
            acquired = true;
            const input = periodPreviewPayload(draft);
            if (cents(input.amount) > 0 && !canAct(authority, "receipt")) throw new Error("You do not have remittance posting authority");
            if (input.remainingDisposition === "final" && !canAct(authority, "revenue_adjustment")) throw new Error("Final adjustments require accounting approval authority");
            const intent = formData.get("intent");
            if (intent === "preview") {
                if (attempt.current && !reviewedChanges) throw new Error("Retry the unchanged submission or review Activity before requesting a new preview");
                const preview = await nhisApi.previewPeriod(input);
                setConfirmed(false);
                return { preview, previewContext, unresolved: !!attempt.current };
            }
            if (intent !== "post") throw new Error("Choose preview or record settlement");
            if (!previous.preview || previous.previewContext !== previewContext) throw new Error("Preview the current period and received amount before posting");
            const payload = periodSettlementPayload(draft, previous.preview, confirmed);
            const fingerprint = JSON.stringify(payload);
            if (completed.current === fingerprint) return { success: "This period settlement was already confirmed." };
            if (attempt.current && attempt.current.fingerprint !== fingerprint && !reviewedChanges) throw new Error("Check Activity and confirm before changing a failed submission");
            const identity = billingSubmissionIdentity({ namespace: "laboratory-nhis", context: application, endpoint: "period-settlements", payload });
            attempt.current = requestAttempt(payload, attempt.current, () => identity.key);
            const result = await nhisApi.settlePeriod(attempt.current.payload);
            identity.complete(); completed.current = fingerprint; attempt.current = null;
            onSuccess(result);
            return { success: result.alreadyApplied ? "Previously recorded period settlement confirmed." : "Period settlement recorded." };
        } catch (error) {
            if (error instanceof Error && error.message.startsWith("NHIS_SNAPSHOT_STALE:")) {
                attempt.current = null; setConfirmed(false);
                return { error: `${error.message}. Preview the period again before posting.`, unresolved: false };
            }
            return { ...previous, error: error instanceof Error ? error.message : "Unable to settle this NHIS period", unresolved: !!attempt.current };
        } finally { if (acquired) end?.(); }
    }, {});
    useEffect(() => { onUnresolvedChange?.(!!state.unresolved && !reviewedChanges); }, [state.unresolved, reviewedChanges, onUnresolvedChange]);
    function update<K extends keyof PeriodSettlementDraft>(key: K, value: PeriodSettlementDraft[K]) {
        setDraft(previous => ({ ...previous, [key]: value })); setConfirmed(false);
    }
    const preview = state.previewContext === previewContext ? state.preview : null;
    const final = draft.remainingDisposition === "final";
    const money = (amount: number | string) => currencyFormatter.format(Number(amount));
    return <form action={action} aria-label={adjustmentOnly ? "Finalize NHIS service period" : "NHIS period remittance"}>
        <p className={styles.formIntro}>{adjustmentOnly ? "Resolve the unpaid balance for an entire service period with an approved noncash adjustment. No new cash receipt will be created." :
            "Choose the service period and enter the amount received. It will be allocated proportionally across every eligible outstanding NHIS bill in that period — not just the bills on this page."}</p>
        <Outcome state={state} />
        <fieldset disabled={pending || busy}>
            {state.unresolved && <RetryWarning checked={reviewedChanges} onChange={setReviewedChanges} />}
            <div className="row g-3 mb-3">
                <div className="col-md-6"><label className="form-label" htmlFor="nhis-period-from">Service period from</label><input id="nhis-period-from" type="date" className="form-control" required max={draft.to || draft.date} value={draft.from} onChange={e => update("from", e.target.value)} /></div>
                <div className="col-md-6"><label className="form-label" htmlFor="nhis-period-to">Service period to</label><input id="nhis-period-to" type="date" className="form-control" required min={draft.from} max={draft.date} value={draft.to} onChange={e => update("to", e.target.value)} /></div>
                {!adjustmentOnly && <><div className="col-md-6"><label className="form-label" htmlFor="nhis-period-amount">Actual received amount (GHS)</label><input id="nhis-period-amount" className="form-control" inputMode="decimal" required pattern="\d+(\.\d{1,2})?" placeholder="e.g. 600000.00" value={draft.amount} onChange={e => update("amount", e.target.value)} /></div>
                    <div className="col-md-6"><label className="form-label" htmlFor="nhis-period-account">Received into</label><select id="nhis-period-account" className="form-select" value={draft.paymentAccountCode} onChange={e => update("paymentAccountCode", e.target.value as PeriodSettlementDraft["paymentAccountCode"])}><option value="acc-1001">Bank account</option><option value="acc-1000">Cash account</option></select></div></>}
            </div>
            <Fields prefix="nhis-period" dateLocked reference={draft.reference} reason={draft.reason} date={draft.date} setReference={value => update("reference", value)} setReason={value => update("reason", value)} setDate={value => update("date", value)} />
            <div className={styles.formSection}>
                <div className={styles.allocationHeading}><h3>How should the unpaid balance be handled?</h3></div>
                <div className={styles.periodDecision}>
                    {!adjustmentOnly && <><label className="form-label" htmlFor="nhis-period-disposition">Remaining balance</label>
                        <select id="nhis-period-disposition" className="form-select mb-3" value={draft.remainingDisposition} onChange={e => update("remainingDisposition", e.target.value as PeriodSettlementDraft["remainingDisposition"])}>
                            <option value="pending">Expected later — keep receivable open</option><option value="appeal">Under appeal — keep receivable open</option><option value="disputed">Disputed / awaiting reconciliation — keep open</option>
                            <option value="final" disabled={!canAct(authority, "revenue_adjustment")}>Final unpaid balance — authorized adjustment</option>
                        </select></>}
                    {final ? <>
                        <p className={styles.adjustmentNote}>A final decision will settle the unpaid balance, not record additional cash. Tariff adjustments reduce revenue; write-offs record bad-debt expense. Historic accounting periods are not reopened or automatically closed.</p>
                        <label className="form-label" htmlFor="nhis-period-adjustment-kind">Final adjustment type</label>
                        <select id="nhis-period-adjustment-kind" className="form-select mb-3" required value={draft.adjustmentKind} onChange={e => update("adjustmentKind", e.target.value as PeriodSettlementDraft["adjustmentKind"])}>
                            <option value="">Choose the approved accounting treatment</option><option value="revenue_adjustment">Tariff / revenue adjustment</option><option value="write_off">Authorized bad-debt write-off</option>
                        </select>
                        <label className="form-label" htmlFor="nhis-period-approval-reference">Adjustment approval reference</label><input id="nhis-period-approval-reference" className="form-control mb-3" required maxLength={120} value={draft.adjustmentReference} onChange={e => update("adjustmentReference", e.target.value)} />
                        <label className="form-label" htmlFor="nhis-period-approval-reason">Approved adjustment reason</label><textarea id="nhis-period-approval-reason" className="form-control" rows={2} required maxLength={1000} value={draft.adjustmentReason} onChange={e => update("adjustmentReason", e.target.value)} />
                    </> : <>
                        <p className={styles.fieldHint}>The unpaid amount remains in accounts receivable. It will not become a write-off automatically.</p>
                        <label className="form-label" htmlFor="nhis-period-remaining-reason">Unpaid balance notes{draft.remainingDisposition !== "pending" ? " (required)" : " (optional)"}</label>
                        <textarea id="nhis-period-remaining-reason" className="form-control" rows={2} maxLength={1000} required={draft.remainingDisposition !== "pending"} value={draft.remainingReason} onChange={e => update("remainingReason", e.target.value)} />
                    </>}
                </div>
            </div>
            {state.preview && !preview && <p className={styles.adjustmentNote} role="status">The period, amount or decision changed. Refresh the preview before recording.</p>}
            <div className={styles.previewAction}><Submit label="Preview period allocation" retry={false} name="intent" value="preview" formNoValidate /></div>
            {preview && <section className={styles.periodPreview} aria-label="Reviewed period allocation">
                <h3>{preview.billCount.toLocaleString()} outstanding NHIS bills in this period</h3>
                <p>Proportional allocation across all eligible bills. {preview.excludedMixedBillCount > 0 && `${preview.excludedMixedBillCount.toLocaleString()} mixed-payer bills excluded.`}</p>
                {!!preview.excludedMissingAccrualBillCount && <p className="alert alert-warning" role="alert">{preview.excludedMissingAccrualBillCount.toLocaleString()} bills excluded because their NHIS receivable has not been recognized. Reconcile these bills in accounting before including them; this settlement will not silently recreate historical revenue.</p>}
                <dl><div><dt>Outstanding before settlement</dt><dd>{money(preview.eligibleOutstanding)}</dd></div><div><dt>Cash received in this settlement</dt><dd>{money(preview.received)}</dd></div>
                    <div><dt>Unpaid after cash receipt</dt><dd>{money(preview.remaining)}</dd></div><div><dt>Authorized noncash adjustment</dt><dd>{money(preview.adjusted)}</dd></div><div><dt>Outstanding afterwards</dt><dd>{money(preview.outstandingAfter)}</dd></div></dl>
                {preview.allocationSample.length > 0 && <details><summary>View sample allocations ({preview.allocationSample.length} of {preview.billCount.toLocaleString()} bills)</summary>
                    <div className={styles.tableScroll}><table className={styles.table}><caption className="visually-hidden">Sample proportional allocations</caption><thead><tr><th>Bill</th><th className={styles.numeric}>Outstanding before</th><th className={styles.numeric}>Cash allocation</th><th className={styles.numeric}>Unpaid before adjustment</th></tr></thead>
                        <tbody>{preview.allocationSample.map(row => <tr key={row.billingId}><td>{row.reference}</td><td className={styles.numeric}>{money(row.outstanding)}</td><td className={styles.numeric}>{money(row.received)}</td><td className={styles.numeric}>{money(row.remaining)}</td></tr>)}</tbody></table></div>
                </details>}
                <label className={styles.confirmation}><input className="form-check-input" type="checkbox" required checked={confirmed} onChange={e => setConfirmed(e.target.checked)} />
                    I reviewed the complete service-period totals and confirm {final ? "the authorized noncash treatment of the unpaid balance" : "that the unpaid balance remains receivable"}.</label>
            </section>}
            <div className={styles.formFooter}><button className="btn btn-outline-secondary" type="button" disabled={!!state.unresolved && !reviewedChanges} onClick={onCancel}>Cancel</button>
                {preview && <Submit label={adjustmentOnly ? "Finalize period balance" : "Record period remittance"} retry={!!state.unresolved} name="intent" value="post" />}</div>
        </fieldset>
    </form>;
}
export function NhisEntryForm({ authority, allocations, setAllocations, onSuccess, busy, begin, end, initialKind, candidates = [], onSelect, onCancel, onUnresolvedChange }: {
    authority: Authority; allocations: AllocationDraft[]; setAllocations: (value: AllocationDraft[]) => void; onSuccess: () => void;
    initialKind?: EntryDraft["kind"]; candidates?: NhisBill[]; onSelect?: (bill: NhisBill) => void; onCancel?: () => void;
} & MutationLock) {
    const application = useApplication();
    const kinds = (["receipt", "revenue_adjustment", "write_off"] as const).filter(kind => canAct(authority, kind) &&
        (!initialKind || (initialKind === "receipt" ? kind === "receipt" : kind !== "receipt")));
    const [kind, setKind] = useState<EntryDraft["kind"]>(initialKind ?? kinds[0] ?? "receipt");
    const [reference, setReference] = useState(""), [reason, setReason] = useState(""), [date, setDate] = useState(today);
    const [amount, setAmount] = useState(""), [account, setAccount] = useState<"acc-1000" | "acc-1001">("acc-1001");
    const [reviewedChanges, setReviewedChanges] = useState(false);
    const [confirmedAdjustment, setConfirmedAdjustment] = useState(false);
    const attempt = useRef<RequestAttempt<Omit<EntryPayload, "requestKey">> | null>(null);
    const completed = useRef("");
    // An Action scopes pending state; there is deliberately no automatic network retry.
    const [state, action, pending] = useActionState<ActionState, FormData>(async () => {
        let acquired = false;
        try {
            if (begin && !begin()) throw new Error("Another NHIS mutation is in progress");
            acquired = true;
            if (!canAct(authority, kind)) throw new Error("You do not have authority for this action");
            if (kind !== "receipt" && !confirmedAdjustment) throw new Error("Explicitly confirm the noncash adjustment");
            const payload = entryPayload({ kind, reference, reason, date, amount, paymentAccountCode: account, allocations });
            const fingerprint = JSON.stringify(payload);
            // Also guard a queued/stale callback after success, not just disabled buttons.
            if (completed.current === fingerprint) return { success: "This submission was already confirmed. Do not submit it again." };
            if (attempt.current && JSON.stringify(payload) !== attempt.current.fingerprint && !reviewedChanges)
                throw new Error("Check audit history and confirm before changing a failed submission");
            // Reuse the existing hashed session-storage identity pattern: no financial
            // metadata is persisted, and an unchanged retry survives a page remount.
            const identity = billingSubmissionIdentity({ namespace: "laboratory-nhis", context: application, endpoint: kind === "receipt" ? "receipts" : "adjustments", payload });
            attempt.current = requestAttempt(payload, attempt.current, () => identity.key);
            const result = await nhisApi.entry(attempt.current.payload);
            identity.complete();
            completed.current = fingerprint;
            attempt.current = null;
            setReference(""); setReason(""); setAmount(""); setReviewedChanges(false); setAllocations([]);
            onSuccess();
            return { success: result.alreadyApplied ? "Previously applied event confirmed; balances and reports are refreshing." : "Event recorded; balances and reports are refreshing." };
        } catch (error) { return { error: error instanceof Error ? error.message : "Unable to record the event", unresolved: !!attempt.current }; }
        finally { if (acquired) end?.(); }
    }, {});
    useEffect(() => { onUnresolvedChange?.(!!state.unresolved && !reviewedChanges); }, [state.unresolved, reviewedChanges, onUnresolvedChange]);
    let allocationTotal = "Invalid amount";
    let rawAllocationTotal: string | null = null;
    let difference: string | null = null;
    try {
        const total = sumMoney(allocations.map(a => a.amount || "0"));
        rawAllocationTotal = total;
        allocationTotal = currencyFormatter.format(Number(total));
        difference = amount.trim() ? decimal(cents(amount) - cents(total)) : null;
    } catch { /* Invalid draft values remain visibly invalid. */ }
    if (!kinds.length) return null;
    const amountsMatch = difference === "0.00" && rawAllocationTotal !== null && cents(rawAllocationTotal) > 0;
    const available = candidates.filter(bill => cents(bill.outstanding) > 0 && !allocations.some(a => a.bill.billingId === bill.billingId));
    return <section aria-label="NHIS settlement details">
        <p className={styles.formIntro}>{kind === "receipt" ? "Enter the money received, then allocate it to the covered bills." : "Reduce the receivable only with an approved tariff adjustment or write-off. This does not record cash received."}</p>
        <form action={action}>
            <Outcome state={state} />
            <fieldset disabled={pending || busy}>
                {state.error && state.unresolved && <RetryWarning checked={reviewedChanges} onChange={setReviewedChanges} />}
                <div className="row g-3 mb-3">
                    {kinds.length > 1 && <div className="col-md-6"><label className="form-label" htmlFor="nhis-kind">Adjustment type</label>
                        <select id="nhis-kind" className="form-select" value={kind} onChange={e => { setKind(e.target.value as EntryDraft["kind"]); setConfirmedAdjustment(false); }}>
                            {kinds.map(k => <option key={k} value={k}>{k === "receipt" ? "Cash / bank remittance" : k === "revenue_adjustment" ? "Tariff / revenue adjustment (noncash)" : "Bad-debt write-off (noncash)"}</option>)}
                        </select></div>}
                    <div className="col-md-6"><label className="form-label" htmlFor="nhis-amount">{kind === "receipt" ? "Actual received amount (GHS)" : "Authorized settlement amount (GHS)"}</label>
                        <input id="nhis-amount" name="amount" className="form-control" inputMode="decimal" required pattern="\d+(\.\d{1,2})?" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" /></div>
                    {kind === "receipt" && <div className="col-md-6"><label className="form-label" htmlFor="nhis-account">Received into</label>
                        <select id="nhis-account" className="form-select" value={account} onChange={e => setAccount(e.target.value as typeof account)}>
                            <option value="acc-1001">Bank account</option><option value="acc-1000">Cash account</option>
                        </select></div>}
                </div>
                {kind !== "receipt" && <p className={styles.adjustmentNote}>{kind === "write_off" ? "A write-off records bad-debt expense. Rejected or pending claims are not automatically bad debt." : "A tariff adjustment reduces recognized revenue and applicable tax, not bad-debt expense."}</p>}
                <Fields prefix="nhis-entry" {...{ reference, reason, date, setReference, setReason, setDate }} />
                <div className={styles.formSection}>
                    <div className={styles.allocationHeading}><h3>Bill allocations <span>{allocations.length} selected</span></h3></div>
                    {onSelect && <div className={styles.billPicker}><label className="visually-hidden" htmlFor="nhis-add-bill">Add an outstanding bill</label>
                        <select id="nhis-add-bill" className="form-select form-select-sm" value="" disabled={!available.length} onChange={e => { const bill = available.find(bill => bill.billingId === Number(e.target.value)); if (bill) onSelect(bill); }}>
                            <option value="">{available.length ? "Add an outstanding bill from this page" : "No more outstanding bills on this page"}</option>
                            {available.map(bill => <option key={bill.billingId} value={bill.billingId}>{bill.reference} · {currencyFormatter.format(Number(bill.outstanding))} outstanding</option>)}
                        </select></div>}
                {allocations.length > 0 && <div className={styles.tableScroll}>
                    <table className={`${styles.table} ${styles.formTable}`}><caption className="visually-hidden">Selected bill allocations</caption>
                        <thead><tr><th>NHIS bill</th><th className={styles.numeric}>Outstanding</th><th>Allocation (GHS)</th><th><span className="visually-hidden">Remove</span></th></tr></thead>
                        <tbody>{allocations.map((a, index) => <tr key={a.bill.billingId}>
                            <td><strong>{a.bill.reference}</strong><small>{a.bill.serviceDate.slice(0, 10)}</small></td><td className={styles.numeric}>{currencyFormatter.format(Number(a.bill.outstanding))}</td>
                            <td><input aria-label={`Allocation for ${a.bill.reference}`} className="form-control form-control-sm" inputMode="decimal" required pattern="\d+(\.\d{1,2})?" value={a.amount}
                                onChange={e => setAllocations(allocations.map((item, i) => i === index ? { ...item, amount: e.target.value } : item))} />
                                <button type="button" className={styles.textButton} onClick={() => setAllocations(allocations.map((item, i) => i === index ? { ...item, amount: decimal(cents(item.bill.outstanding)) } : item))}>Use full balance</button></td>
                            <td><button type="button" className={styles.dangerButton} aria-label={`Remove ${a.bill.reference}`} onClick={() => setAllocations(allocations.filter((_, i) => i !== index))}>Remove</button></td>
                        </tr>)}</tbody>
                    </table>
                </div>}
                {!allocations.length && <p className={styles.formEmpty}>Add the bills covered by this remittance or adjustment. You can select bills across report pages.</p>}
                <div className={styles.allocationSummary}><span>Allocated <strong>{allocationTotal}</strong></span>
                    <span className={amountsMatch ? styles.matched : styles.unmatched}>{difference === null ? "Enter an amount" : amountsMatch ? "Amounts match" : `${currencyFormatter.format(Number(difference))} difference`}</span>
                    <button type="button" className={styles.textButton} disabled={!allocations.length || rawAllocationTotal === null || cents(rawAllocationTotal) <= 0} onClick={() => setAmount(sumMoney(allocations.map(a => a.amount || "0")))}>Use allocated total</button></div>
                </div>
                {kind !== "receipt" && <label className={styles.confirmation}><input type="checkbox" className="form-check-input" required checked={confirmedAdjustment} onChange={e => setConfirmedAdjustment(e.target.checked)} />
                    I confirm this {kind === "write_off" ? "authorized bad-debt write-off" : "approved tariff / revenue adjustment"} and understand it is not a cash receipt.</label>}
                <div className={styles.formFooter}>{onCancel && <button type="button" className="btn btn-outline-secondary" disabled={!!state.unresolved && !reviewedChanges} onClick={onCancel}>Cancel</button>}
                    <Submit label={kind === "receipt" ? "Record remittance" : kind === "write_off" ? "Confirm write-off" : "Confirm adjustment"} retry={!!state.unresolved} /></div>
            </fieldset>
        </form>
    </section>;
}
export function NhisReversalForm({ event, authority, onSuccess, onCancel, busy, begin, end, onUnresolvedChange }: {
    event: NhisEvent; authority: Authority; onSuccess: () => void; onCancel: () => void;
} & MutationLock) {
    const application = useApplication();
    const [reference, setReference] = useState(""), [reason, setReason] = useState(""), [date, setDate] = useState(() => event.periodSettlement ? new Date().toISOString().slice(0, 10) : today());
    const [confirmed, setConfirmed] = useState(false), [reviewedChanges, setReviewedChanges] = useState(false);
    const attempt = useRef<RequestAttempt<Omit<ReversalPayload, "requestKey">> | null>(null);
    const completed = useRef(false);
    const [state, action, pending] = useActionState<ActionState, FormData>(async () => {
        let acquired = false;
        try {
            if (begin && !begin()) throw new Error("Another NHIS mutation is in progress");
            acquired = true;
            if (!canAct(authority, "reversal")) throw new Error("You do not have reversal authority");
            if (completed.current) return { success: "This reversal was already confirmed." };
            const payload = reversalPayload(reference, reason, date, event.event_date, confirmed);
            if (attempt.current && JSON.stringify(payload) !== attempt.current.fingerprint && !reviewedChanges)
                throw new Error("Check audit history before changing a failed reversal");
            const periodId = event.periodSettlement?.id;
            const identity = billingSubmissionIdentity({ namespace: "laboratory-nhis", context: application, endpoint: periodId != null ? `period-settlements/${periodId}/reversal` : `events/${event.id}/reversal`, payload });
            attempt.current = requestAttempt(payload, attempt.current, () => identity.key);
            if (periodId != null) await nhisApi.reversePeriod(periodId, attempt.current.payload);
            else await nhisApi.reverse(event.id, attempt.current.payload);
            identity.complete();
            completed.current = true;
            attempt.current = null; onSuccess();
            return { success: "Reversal recorded; original history is preserved." };
        } catch (error) { return { error: error instanceof Error ? error.message : "Unable to reverse the event", unresolved: !!attempt.current }; }
        finally { if (acquired) end?.(); }
    }, {});
    useEffect(() => { onUnresolvedChange?.(!!state.unresolved && !reviewedChanges); }, [state.unresolved, reviewedChanges, onUnresolvedChange]);
    return <form action={action} aria-label={`Reverse ${event.reference}`}>
        <div className={styles.reversalSource}><span>Original event</span><strong>{event.reference}<span>{currencyFormatter.format(Number(event.amount))}</span></strong>
            <small>{event.event_date.slice(0, 10)} · {event.kind.replaceAll("_", " ")}</small></div>
        <p className={styles.formIntro}>{event.periodSettlement ? `This reverses the entire service-period settlement atomically: ${currencyFormatter.format(Number(event.periodSettlement.received))} cash and ${currencyFormatter.format(Number(event.periodSettlement.adjusted))} noncash adjustment. All linked allocations are restored; original history remains.` : "The full amount and every allocation will be reversed. The original event stays in history."}</p>
        <Outcome state={state} />
        <fieldset disabled={pending || busy}>
            {state.error && state.unresolved && <RetryWarning checked={reviewedChanges} onChange={setReviewedChanges} />}
            <Fields prefix={`nhis-reversal-${event.id}`} dateLocked={!!event.periodSettlement} {...{ reference, reason, date, setReference, setReason, setDate }} />
            <label className="d-block mb-3"><input type="checkbox" className="me-2" required checked={confirmed} onChange={e => setConfirmed(e.target.checked)} />I confirm the exact reversal of {event.periodSettlement ? "the entire linked period settlement" : event.reference} and understand that history is preserved.</label>
            <div className={styles.formFooter}><button type="button" className="btn btn-outline-secondary" disabled={!!state.unresolved && !reviewedChanges} onClick={onCancel}>Cancel</button>
                <Submit label="Confirm reversal" retry={!!state.unresolved} /></div>
        </fieldset>
    </form>;
}
