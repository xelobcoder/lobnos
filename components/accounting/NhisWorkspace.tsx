"use client";
import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Modal from "react-bootstrap/Modal";
import { RiAddLine, RiArrowDownSLine, RiArrowRightLine, RiRefreshLine, RiShieldCheckLine } from "@remixicon/react";
import { useApplication } from "../Auth/useApplicationContext";
import { currencyFormatter } from "../Auth/customFetch";
import Loader from "../isLoading";
import { accountingApi } from "../../lib/accounting/accountingApi";
import { checkedResult, nhisApi } from "../../lib/accounting/nhisApi";
import { canAct, cents, today } from "../../lib/accounting/nhis";
import type { AllocationDraft, Authority, CashResult, EntryDraft, NhisBill, NhisEvent, PageResult, PeriodQuery, PeriodSettlementResult, ReceivablesResult } from "../../lib/accounting/nhis";
import { NhisEntryForm, NhisPeriodRemittanceForm, NhisReversalForm } from "./NhisForms";
import styles from "./NhisWorkspace.module.css";
import summaryStyles from "../../app/pharmacy/accounting/components/AccountingWorkspace.module.css";

const money = (value: number | string) => currencyFormatter.format(Number(value));
const dateLabel = (value: string) => new Intl.DateTimeFormat("en-GH", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(`${value.slice(0, 10)}T00:00:00Z`));
const eventLabels = { receipt: "Remittance", revenue_adjustment: "Tariff adjustment", write_off: "Write-off", reversal: "Reversal" };
type View = "receivables" | "cash" | "activity";
type EntryKind = EntryDraft["kind"];

function useReport<T extends PageResult<unknown>>(fetchReport: (query: PeriodQuery) => Promise<T>, refresh: number, sessionKey: string) {
    const [filters, setFilters] = useState<PeriodQuery>(() => ({ from: "", to: today(), page: 1, count: 25 }));
    const [data, setData] = useState<T | null>(null), [error, setError] = useState("");
    const context = JSON.stringify([filters, refresh, sessionKey]);
    const [loadedContext, setLoadedContext] = useState(""), [errorContext, setErrorContext] = useState("");
    useEffect(() => {
        let active = true;
        fetchReport(filters).then(result => {
            if (active) { setData(result); setLoadedContext(context); setError(""); setErrorContext(""); }
        }).catch(error => {
            if (active) { setError(error instanceof Error ? error.message : "Unable to load report"); setErrorContext(context); }
        });
        return () => { active = false; };
    }, [fetchReport, filters, context]);
    return { filters, setFilters, data: loadedContext === context && errorContext !== context ? data : null, error: errorContext === context ? error : "" };
}
type ReportState<T extends PageResult<unknown>> = ReturnType<typeof useReport<T>>;

function PeriodControls<T extends PageResult<unknown>>({ report, prefix, label }: { report: ReportState<T>; prefix: string; label: string }) {
    const { filters, setFilters } = report;
    return <div className={styles.periodControls}>
        <span className={styles.periodLabel}>{label}</span>
        <div><label htmlFor={`${prefix}-from`}>From</label><input id={`${prefix}-from`} aria-label={`${label} from`} type="date" className="form-control form-control-sm" value={filters.from}
            onChange={e => setFilters({ ...filters, from: e.target.value, page: 1 })} /></div>
        <span className={styles.dateSeparator} aria-hidden="true">to</span>
        <div><label htmlFor={`${prefix}-to`}>To</label><input id={`${prefix}-to`} aria-label={`${label} to`} type="date" className="form-control form-control-sm" value={filters.to} min={filters.from}
            onChange={e => setFilters({ ...filters, to: e.target.value, page: 1 })} /></div>
        <button type="button" className={styles.textButton} onClick={() => setFilters({ ...filters, from: "", to: today(), page: 1 })}>All dates</button>
    </div>;
}
function Pagination<T extends PageResult<unknown>>({ report, prefix }: { report: ReportState<T>; prefix: string }) {
    const { filters, setFilters, data } = report;
    const pages = Math.max(1, Math.ceil((data?.total ?? 0) / filters.count));
    return <div className={styles.pagination}>
        <div className={styles.rowCount}><label htmlFor={`${prefix}-count`}>Rows per page</label>
            <select id={`${prefix}-count`} className="form-select form-select-sm" value={filters.count} onChange={e => setFilters({ ...filters, count: Number(e.target.value), page: 1 })}>
                {[10, 25, 50, 100].map(n => <option key={n} value={n}>{n}</option>)}
            </select><span>{data ? `${data.total} results` : "Loading"}</span></div>
        <div className={styles.pageButtons}>
            <button type="button" className="btn btn-sm btn-outline-secondary" disabled={filters.page <= 1 || !data} onClick={() => setFilters({ ...filters, page: filters.page - 1 })}>Previous</button>
            <span>{data?.page ?? filters.page} / {data ? pages : "..."}</span>
            <button type="button" className="btn btn-sm btn-outline-secondary" disabled={!data || filters.page >= pages} onClick={() => setFilters({ ...filters, page: filters.page + 1 })}>Next</button>
        </div>
    </div>;
}
function ReportStatus({ error, ready }: { error: string; ready: boolean }) {
    return error ? <div className="alert alert-danger m-3" role="alert">{error}</div> : !ready ? <div className={styles.loading} role="status"><Loader /></div> : null;
}
function EmptyState({ title, text }: { title: string; text: string }) {
    return <div className={styles.empty}><RiShieldCheckLine size={30} aria-hidden="true" /><h3>{title}</h3><p>{text}</p></div>;
}
function Metrics({ data }: { data: ReceivablesResult | null }) {
    const recovery = data && cents(data.totals.expected) > 0 ? (cents(data.totals.received) / cents(data.totals.expected)) * 100 : 0;
    const percentage = recovery.toFixed(2);
    return <><dl className={`${summaryStyles.summaryStrip} ${styles.summary}`} aria-label="NHIS service-period totals">
        <div><dt>Expected from NHIS</dt><dd>{data ? money(data.totals.expected) : "..."}</dd><dd className={`${summaryStyles.summaryDetail} ${styles.summaryNote}`}>From billing records</dd></div>
        <div><dt>Money received</dt><dd>{data ? money(data.totals.received) : "..."}</dd><dd className={`${summaryStyles.summaryDetail} ${styles.summaryNote}`}>Cash and bank remittances</dd></div>
        <div><dt>Still outstanding</dt><dd>{data ? money(data.totals.outstanding) : "..."}</dd><dd className={`${summaryStyles.summaryDetail} ${styles.summaryNote}`}>After adjustments and write-offs</dd></div>
        <div><dt>Cash recovery</dt><dd>{data ? `${percentage}%` : "..."}
            {data && <progress className={styles.recoveryProgress} aria-label="NHIS cash recovery" aria-valuetext={`${percentage}% received`} max={100} value={Math.min(100, Math.max(0, Number(percentage)))} />}</dd>
            <dd className={`${summaryStyles.summaryDetail} ${styles.summaryNote}`}>Received / expected</dd></div>
    </dl>
        {data?.accountingCoverage && data.accountingCoverage.unrecognizedBillCount > 0 && <div className="alert alert-warning mt-3" role="alert">
            <strong>Legacy receivables need accounting reconciliation.</strong>
            <p className="mb-2">{data.accountingCoverage.unrecognizedBillCount.toLocaleString()} bills, totaling {money(data.accountingCoverage.unrecognizedOutstanding)}, have outstanding billing balances awaiting accounting recognition.
                Currently eligible for settlement: <strong>{money(data.accountingCoverage.eligibleOutstanding)}</strong> in this branch and service period.</p>
            <Link href="/accounting/nhis/opening-balances" className="btn btn-sm btn-outline-primary">Review opening receivables</Link><Link href="/accounting/reconciliation" className="btn btn-sm btn-link">View accounting coverage</Link>
        </div>}
    </>;
}
function Receivables({ report, selected, toggle, enabled, openEntry }: {
    report: ReportState<ReceivablesResult>; selected: AllocationDraft[]; toggle: (bill: NhisBill) => void; enabled: boolean; openEntry: (kind: EntryKind) => void;
}) {
    const [expanded, setExpanded] = useState<number | null>(null);
    const data = report.data;
    const warning = data && (data.excludedMixedBills.length > 0 || cents(data.totals.unverifiedLegacyReceipts) !== 0 || cents(data.totals.reconciliationDifference) !== 0 ||
        data.rows.some(row => cents(row.unverifiedLegacyReceipts) !== 0 || cents(row.reconciliationDifference) !== 0));
    return <>
        <div className={styles.reportHeading}><div><h2>Receivables</h2><p>Current recovery position for bills in the selected service period.</p></div>
            <span className={styles.basis}>Service-date basis</span></div>
        <PeriodControls report={report} prefix="nhis-service" label="Service period" />
        <ReportStatus error={report.error} ready={!!data} />
        {data && <>
            {warning && <div className={styles.review} role="alert"><strong>Some balances need review.</strong>
                <span>{data.excludedMixedBills.length} mixed-payer bills excluded. Unverified receipts: {money(data.totals.unverifiedLegacyReceipts)}. Difference: {money(data.totals.reconciliationDifference)}.</span>
                <details><summary>View reconciliation notes</summary><p>Mixed bills: {data.excludedMixedBills.map(id => `BILL-${id}`).join(", ") || "None"}. Review these amounts before recording a remittance or write-off.</p></details>
            </div>}
            {selected.length > 0 && <div className={styles.selectionBar}><strong>{selected.length} {selected.length === 1 ? "bill" : "bills"} selected</strong><span>Ready to allocate a remittance or adjustment</span>
                <button type="button" className="btn btn-sm btn-primary" onClick={() => openEntry("receipt")}>Allocate selected bills <RiArrowRightLine size={16} aria-hidden="true" /></button></div>}
            {data.rows.length > 0 ? <div className={styles.tableScroll}><table className={styles.table}>
                <caption className="visually-hidden">NHIS receivables for the selected service period</caption>
                <thead><tr>{enabled && <th className={styles.selectColumn}><span className="visually-hidden">Select bill</span></th>}<th>Bill</th><th>Service date</th><th className={styles.numeric}>Expected</th><th className={styles.numeric}>Received</th><th className={styles.numeric}>Outstanding</th><th><span className="visually-hidden">Details</span></th></tr></thead>
                <tbody>{data.rows.map(bill => <Fragment key={bill.billingId}>
                    <tr className={selected.some(a => a.bill.billingId === bill.billingId) ? styles.selectedRow : undefined}>
                        {enabled && <td><input type="checkbox" className="form-check-input" aria-label={`Select ${bill.reference}`} checked={selected.some(a => a.bill.billingId === bill.billingId)} disabled={cents(bill.outstanding) <= 0} onChange={() => toggle(bill)} /></td>}
                        <td><strong className={styles.billReference}>{bill.reference}</strong><small className={styles.payerLabel}>NHIS</small></td><td className={styles.dateCell}>{dateLabel(bill.serviceDate)}</td>
                        <td className={styles.numeric}>{money(bill.expected)}</td><td className={styles.numeric}>{money(bill.received)}</td><td className={`${styles.numeric} ${styles.balanceCell}`}>{money(bill.outstanding)}</td>
                        <td><button type="button" className={styles.textButton} aria-label={`View ${bill.reference} details`} aria-expanded={expanded === bill.billingId} onClick={() => setExpanded(expanded === bill.billingId ? null : bill.billingId)}>{expanded === bill.billingId ? "Hide" : "Details"}</button></td>
                    </tr>
                    {expanded === bill.billingId && <tr className={styles.detailRow}><td colSpan={enabled ? 7 : 6}><div className={styles.billDetails}>
                        <div><span>Tariff / revenue adjustments</span><strong>{money(bill.revenueAdjustments)}</strong></div><div><span>Written off</span><strong>{money(bill.writtenOff)}</strong></div>
                        <div><span>Unverified legacy receipts</span><strong>{money(bill.unverifiedLegacyReceipts)}</strong></div><div><span>Reconciliation difference</span><strong>{money(bill.reconciliationDifference)}</strong></div>
                    </div></td></tr>}
                </Fragment>)}</tbody>
                <tfoot><tr>{enabled && <td />}<th colSpan={2}>All-result totals</th><td className={styles.numeric}>{money(data.totals.expected)}</td><td className={styles.numeric}>{money(data.totals.received)}</td><td className={styles.numeric}>{money(data.totals.outstanding)}</td><td /></tr></tfoot>
            </table></div> : <EmptyState title="No NHIS bills in this period" text="Choose a different service period to see receivables." />}
            <div className={styles.reportNotes}><span>Tariff adjustments: <strong>{money(data.totals.revenueAdjustments)}</strong></span><span>Written off: <strong>{money(data.totals.writtenOff)}</strong></span>
                <details><summary>About these balances</summary><p>These are current balances for the service period, not historical as-of balances or externally approved claim values. Rejected claims are not automatically written off.</p></details></div>
        </>}
        <Pagination report={report} prefix="nhis-service" />
    </>;
}
function CashReceipts({ report }: { report: ReportState<CashResult> }) {
    const data = report.data;
    return <>
        <div className={styles.reportHeading}><div><h2>Cash received</h2><p>Remittances by receipt date, including payments for older bills.</p></div><span className={styles.basis}>Receipt-date basis</span></div>
        <PeriodControls report={report} prefix="nhis-cash" label="Receipt period" />
        <ReportStatus error={report.error} ready={!!data} />
        {data && <>
            <dl className={summaryStyles.summaryStrip} aria-label="NHIS receipt-period totals">{[["Received", data.totals.received], ["Refunded / reversed", data.totals.reversedOrRefunded], ["Net received", data.totals.netReceived]].map(([label, amount]) =>
                <div key={label}><dt>{label}</dt><dd>{money(amount)}</dd></div>)}</dl>
            {data.rows.length > 0 ? <div className={styles.tableScroll}><table className={styles.table}><caption className="visually-hidden">NHIS cash movements by receipt date</caption>
                <thead><tr><th>Reference</th><th>Bill</th><th>Receipt date</th><th>Type</th><th className={styles.numeric}>Amount</th></tr></thead>
                <tbody>{data.rows.map((row, index) => <tr key={`${row.source}-${row.reference}-${row.billingId}-${index}`}><td><strong className={styles.billReference}>{row.reference}</strong></td>
                    <td>BILL-{row.billingId}</td><td>{dateLabel(row.date)}</td><td><span className={styles.basis}>{cents(row.amount) < 0 ? "Refund / reversal" : "Remittance"}</span></td><td className={styles.numeric}>{money(row.amount)}</td></tr>)}</tbody>
            </table></div> : <EmptyState title="No cash receipts in this period" text="Adjust the receipt dates to see NHIS remittances." />}
        </>}
        <Pagination report={report} prefix="nhis-cash" />
    </>;
}
function EventAllocations({ event }: { event: NhisEvent }) {
    const fetchAllocations = useCallback((filters: PeriodQuery) => nhisApi.allocations(event.id, filters), [event.id]);
    const report = useReport(fetchAllocations, 0, `event-${event.id}`);
    return <section className={styles.eventAllocations} aria-labelledby={`nhis-allocations-${event.id}`}>
        <div className={styles.eventSectionHeading}>
            <h3 id={`nhis-allocations-${event.id}`}>Bill allocations</h3>
            <p>Signed amounts for this event.</p>
        </div>
        <ReportStatus error={report.error} ready={!!report.data} />
        {report.data && <>
            {report.data.rows.length > 0 ? <div className={styles.tableScroll}><table className={styles.allocationDetails}>
                <caption className="visually-hidden">Signed allocations for {event.reference}</caption>
                <thead><tr><th scope="col">Bill</th><th scope="col">Amount</th><th scope="col">Tax</th></tr></thead>
                <tbody>{report.data.rows.map(a => <tr key={a.id}><td>BILL-{a.billingid}</td><td>{money(a.amount)}</td><td>{money(a.tax_amount)}</td></tr>)}</tbody>
            </table></div> : <p className={styles.allocationEmpty}>No bill allocations found for this event.</p>}
            <Pagination report={report} prefix={`nhis-allocation-${event.id}`} />
        </>}
    </section>;
}
function PeriodAudit({ settlement }: { settlement: NonNullable<NhisEvent["periodSettlement"]> }) {
    const stateLabels = { applied: "Applied", partially_reversed: "Partially reversed", reversed: "Reversed" };
    const stateStyles = { applied: styles.stateApplied, partially_reversed: styles.statePartial, reversed: styles.stateReversed };
    const decisions = { pending: "Expected later", appeal: "Under appeal", disputed: "Disputed / awaiting reconciliation", final: "Final unpaid balance" };
    return <section className={styles.periodAudit} aria-label="Settlement at posting">
        <div className={styles.periodAuditHeader}>
            <div>
                <span className={styles.eventLabel}>Service period</span>
                <h3>{dateLabel(settlement.from)} – {dateLabel(settlement.to)}</h3>
                <p>{settlement.billCount.toLocaleString()} eligible {settlement.billCount === 1 ? "bill" : "bills"} · Proportional allocation</p>
            </div>
            <div className={styles.settlementState}>
                <span className={styles.eventLabel}>Settlement status</span>
                <strong className={`${styles.stateBadge} ${stateStyles[settlement.state]}`}>{stateLabels[settlement.state]}</strong>
            </div>
        </div>
        <dl className={styles.auditMetrics}>
            <div><dt>Cash received</dt><dd>{money(settlement.received)}</dd></div>
            <div><dt>Noncash adjustment</dt><dd>{money(settlement.adjusted)}</dd></div>
            <div><dt>Outstanding after posting</dt><dd>{money(settlement.outstandingAfter)}</dd></div>
        </dl>
        <div className={styles.auditDecision}><span>Unpaid decision when recorded</span><strong>{decisions[settlement.remainingDisposition]}</strong></div>
        {settlement.remainingReason && <div className={styles.auditReason}><span className={styles.eventLabel}>Unpaid balance notes</span><p>{settlement.remainingReason}</p></div>}
        <p className={styles.auditNote}>These totals describe the original posting, not today&apos;s receivable balance.</p>
    </section>;
}
function EventDetails({ event }: { event: NhisEvent }) {
    return <>
        <div className={styles.eventIntro}>
            <span className={styles.eventLabel}>Recorded reason</span>
            <p className={styles.eventReason}>{event.reason}</p>
            <p className={styles.eventMetadata}>Recorded by employee #{event.created_by} · Event #{event.id}
                {event.reversal_of_event_id && <> · Reverses {eventLabels[event.reverses_kind ?? "receipt"].toLowerCase()} #{event.reversal_of_event_id}</>}</p>
        </div>
        {event.periodSettlement && <PeriodAudit settlement={event.periodSettlement} />}
        <EventAllocations event={event} />
    </>;
}
function Events({ report, authority, onReverse, busy }: { report: ReportState<PageResult<NhisEvent>>; authority: Authority | null; onReverse: (event: NhisEvent) => void; busy: boolean }) {
    const data = report.data;
    const [expanded, setExpanded] = useState<Set<number>>(() => new Set());
    const reversedIds = new Set(data?.rows.filter(event => event.kind === "reversal").map(event => event.reversal_of_event_id));
    return <>
        <div className={styles.reportHeading}><div><h2>Activity</h2><p>Remittances, adjustments and corrections with their bill allocations.</p></div><span className={styles.basis}>Event-date basis</span></div>
        <PeriodControls report={report} prefix="nhis-events" label="Activity period" />
        <ReportStatus error={report.error} ready={!!data} />
        {data && (data.rows.length > 0 ? <div className={styles.tableScroll}><table className={`${styles.table} ${styles.activityTable}`}><caption className="visually-hidden">NHIS accounting activity</caption>
            <thead><tr><th>Reference / allocations</th><th>Type</th><th>Date</th><th className={styles.numeric}>Amount</th><th><span className="visually-hidden">Correction</span></th></tr></thead>
            <tbody>{data.rows.map(event => {
                const isExpanded = expanded.has(event.id);
                const isReversed = reversedIds.has(event.id) || event.periodSettlement?.state === "reversed";
                const canReverse = canAct(authority, "reversal") && event.kind !== "reversal";
                const allocationCount = event.allocationCount ?? event.allocations.length;
                return <Fragment key={event.id}>
                    <tr className={styles.activityRow}>
                        <td><button id={`nhis-event-${event.id}-toggle`} type="button" className={styles.eventToggle}
                            aria-expanded={isExpanded} aria-controls={`nhis-event-${event.id}-details`} onClick={() => setExpanded(previous => {
                                const next = new Set(previous); if (next.has(event.id)) next.delete(event.id); else next.add(event.id); return next;
                            })}>
                            <RiArrowDownSLine size={19} aria-hidden="true" />
                            <span><strong>{event.reference}</strong><small>{allocationCount.toLocaleString()} bill allocation{allocationCount === 1 ? "" : "s"}</small></span>
                        </button></td>
                        <td><span className={styles.mobileLabel}>Type</span><span className={event.kind === "receipt" ? styles.receiptBadge : styles.basis}>{eventLabels[event.kind]}</span></td>
                        <td className={styles.dateCell}><span className={styles.mobileLabel}>Date</span>{dateLabel(event.event_date)}</td>
                        <td className={styles.numeric}><span className={styles.mobileLabel}>Amount</span>{money(event.kind === "reversal" ? -Math.abs(Number(event.amount)) : event.amount)}</td>
                        <td>{(isReversed || canReverse) && <span className={styles.mobileLabel}>Correction</span>}
                            {isReversed ? <span className={styles.basis}>Reversed</span> : canReverse && <button type="button" className={styles.dangerButton} disabled={busy} onClick={() => onReverse(event)} aria-label={`Reverse ${event.reference}`}>{event.periodSettlement ? "Reverse period" : "Reverse"}</button>}</td>
                    </tr>
                    <tr className={`${styles.detailRow} ${styles.eventDetailRow}`} hidden={!isExpanded}>
                        <td colSpan={5}><div id={`nhis-event-${event.id}-details`} className={styles.eventPanel} role="region" aria-labelledby={`nhis-event-${event.id}-toggle`}>
                            {isExpanded && <EventDetails event={event} />}
                        </div></td>
                    </tr>
                </Fragment>;
            })}</tbody>
        </table></div> : <EmptyState title="No activity in this period" text="Recorded remittances and adjustments will appear here." />)}
        <Pagination report={report} prefix="nhis-events" />
    </>;
}

export default function NhisWorkspace() {
    const application = useApplication();
    const sessionKey = JSON.stringify(application);
    const hasUser = !!application?.user;
    const [authorityState, setAuthorityState] = useState<{ sessionKey: string; refresh: number; authority: Authority | null; error: string } | null>(null);
    const [refresh, setRefresh] = useState(0), [allocations, setAllocations] = useState<AllocationDraft[]>([]);
    const [authorityRefresh, setAuthorityRefresh] = useState(0), [view, setView] = useState<View>("receivables");
    const [entry, setEntry] = useState<EntryKind | null>(null), [reversing, setReversing] = useState<NhisEvent | null>(null), [notice, setNotice] = useState("");
    const [entryMode, setEntryMode] = useState<"period" | "manual">("period");
    const [unresolved, setUnresolved] = useState(false);
    const mutationLock = useRef(false);
    const [busy, setBusy] = useState(false);
    const begin = () => { if (mutationLock.current) return false; mutationLock.current = true; setBusy(true); return true; };
    const end = () => { mutationLock.current = false; setBusy(false); };
    const receivables = useReport<ReceivablesResult>(nhisApi.receivables, refresh, sessionKey);
    const cash = useReport<CashResult>(nhisApi.cash, refresh, sessionKey);
    const events = useReport<PageResult<NhisEvent>>(nhisApi.events, refresh, sessionKey);
    useEffect(() => {
        let active = true;
        if (!hasUser) return;
        accountingApi.myAuthority().then(response => {
            const result = checkedResult<Authority>(response);
            if (!result.permissions) throw new Error("Authority response is missing permissions");
            if (active) {
                setAuthorityState({ sessionKey, refresh: authorityRefresh, authority: result, error: "" });
                setAllocations([]); setEntry(null); setReversing(null); setUnresolved(false); setNotice("");
            }
        }).catch(error => {
            if (active) {
                setAuthorityState({ sessionKey, refresh: authorityRefresh, authority: null, error: error instanceof Error ? error.message : "Unable to check authority" });
                setAllocations([]); setEntry(null); setReversing(null); setUnresolved(false); setNotice("");
            }
        });
        return () => { active = false; };
    }, [sessionKey, hasUser, authorityRefresh]);
    const checking = hasUser && (authorityState?.sessionKey !== sessionKey || authorityState?.refresh !== authorityRefresh);
    const authorityError = !checking ? authorityState?.error || "" : "";
    const authority = !checking && !authorityError && authorityState?.sessionKey === sessionKey ? authorityState?.authority ?? null : null;
    const canSelect = canAct(authority, "receipt") || canAct(authority, "revenue_adjustment");
    const refreshReports = () => {
        setAllocations([]); setRefresh(value => value + 1);
        receivables.setFilters(previous => ({ ...previous, page: 1 }));
        cash.setFilters(previous => ({ ...previous, page: 1 }));
        events.setFilters(previous => ({ ...previous, page: 1 }));
    };
    const toggle = (bill: NhisBill) => setAllocations(previous => previous.some(a => a.bill.billingId === bill.billingId) ? previous.filter(a => a.bill.billingId !== bill.billingId) : [...previous, { bill, amount: "" }]);
    const openEntry = (kind: EntryKind, mode: "period" | "manual" = "period") => {
        setEntryMode(mode);
        if (canAct(authority, kind)) { setEntry(kind); setNotice(""); setUnresolved(false); }
        else if (canAct(authority, "revenue_adjustment")) { setEntry("revenue_adjustment"); setNotice(""); setUnresolved(false); }
    };
    const completeEntry = (result?: PeriodSettlementResult) => {
        if (result) {
            const balance = result.settlement.outstandingAfter;
            const disposition = { pending: "expected later", appeal: "under appeal", disputed: "disputed", final: "final adjustment" }[result.settlement.remainingDisposition];
            setNotice(result.settlement.state !== "applied" ? `Previously recorded settlement confirmed; it has since been ${result.settlement.state.replaceAll("_", " ")}. Review the refreshed current receivable balances.` :
                `${entry === "receipt" ? "Period remittance" : "Period adjustment"} recorded for ${result.settlement.billCount.toLocaleString()} NHIS bills. ${cents(balance) > 0 ? `${money(balance)} remains receivable (${disposition}).` : "The service-period receivable balance is settled."}`);
        } else setNotice(entry === "receipt" ? "Remittance recorded. Balances and activity have been updated." : "Balance adjustment recorded. No cash receipt was created.");
        setEntry(null); refreshReports();
    };
    return <main className={styles.page}>
        <div className={styles.header}>
            <div><span className={styles.eyebrow}><RiShieldCheckLine size={16} aria-hidden="true" /> National Health Insurance Scheme</span><h1>NHIS receivables</h1><p>Know what is owed, what has been paid, and what still needs recovery.</p></div>
            <div className={styles.headerActions}>
                <button type="button" className={styles.iconButton} aria-label="Refresh NHIS reports" title="Refresh reports" disabled={busy} onClick={refreshReports}><RiRefreshLine size={19} /></button>
                {canAct(authority, "revenue_adjustment") && <button type="button" className="btn btn-outline-secondary" disabled={busy} onClick={() => openEntry("revenue_adjustment")}>Adjust balance</button>}
                {canAct(authority, "receipt") && <button type="button" className="btn btn-primary" disabled={busy} onClick={() => openEntry("receipt")}><RiAddLine size={18} aria-hidden="true" /> Record remittance</button>}
            </div>
        </div>
        {checking && <p className={styles.accessNote} role="status">Checking posting access...</p>}
        {authorityError && <div className="alert alert-danger" role="alert">{authorityError} <button className="btn btn-sm btn-outline-danger" type="button" onClick={() => setAuthorityRefresh(value => value + 1)}>Retry access check</button></div>}
        {!checking && !authorityError && !canSelect && <p className={styles.accessNote}>Read-only access. An authorized accountant can record remittances and adjustments.</p>}
        {notice && <div className={styles.notice} role="status"><RiShieldCheckLine size={20} aria-hidden="true" /><span>{notice}</span><button type="button" aria-label="Dismiss confirmation" onClick={() => setNotice("")}>Dismiss</button></div>}
        <div className={styles.metricHeading}><span>Service-period overview · {receivables.filters.from ? dateLabel(receivables.filters.from) : "All service dates"}{receivables.filters.to ? ` to ${dateLabel(receivables.filters.to)}` : ""}</span><Link href="/accounting/receivables">All payer receivables <RiArrowRightLine size={15} aria-hidden="true" /></Link></div>
        <Metrics data={receivables.data} />
        {receivables.error && view !== "receivables" && <div className="alert alert-danger" role="alert">Service-period overview: {receivables.error}</div>}
        <section className={styles.panel}>
            <div className={styles.tabs} role="tablist" aria-label="NHIS reports">
                {([["receivables", "Receivables"], ["cash", "Cash received"], ["activity", "Activity"]] as const).map(([tab, label]) =>
                    <button id={`nhis-tab-${tab}`} key={tab} type="button" role="tab" aria-selected={view === tab} aria-controls="nhis-report-panel" tabIndex={view === tab ? 0 : -1} className={view === tab ? styles.activeTab : undefined}
                        onClick={() => setView(tab)} onKeyDown={event => {
                            const tabs: View[] = ["receivables", "cash", "activity"];
                            if (["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) {
                                event.preventDefault();
                                const next = event.key === "Home" ? 0 : event.key === "End" ? 2 : (tabs.indexOf(view) + (event.key === "ArrowRight" ? 1 : 2)) % tabs.length;
                                setView(tabs[next]);
                                event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('[role="tab"]')[next]?.focus();
                            }
                        }}>{label}</button>)}
                {allocations.length > 0 && <button type="button" className={styles.clearSelection} disabled={busy} onClick={() => setAllocations([])}>Clear {allocations.length} selected</button>}
            </div>
            <div id="nhis-report-panel" role="tabpanel" aria-labelledby={`nhis-tab-${view}`}>
                {view === "receivables" && <Receivables report={receivables} selected={allocations} toggle={toggle} enabled={canSelect && !busy} openEntry={kind => openEntry(kind, "manual")} />}
                {view === "cash" && <CashReceipts report={cash} />}
                {view === "activity" && <Events report={events} authority={authority} onReverse={event => { setReversing(event); setUnresolved(false); }} busy={busy} />}
            </div>
        </section>
        <Modal show={!!entry && authorityState?.sessionKey === sessionKey} onHide={() => { if (!busy && !unresolved) setEntry(null); }} size="lg" centered backdrop={busy || unresolved ? "static" : true} keyboard={!busy && !unresolved} contentClassName={styles.dialog}>
            <Modal.Header closeButton={!busy && !unresolved}><Modal.Title>{entry === "receipt" ? "Record remittance" : "Adjust NHIS balance"}</Modal.Title></Modal.Header>
            <Modal.Body>{entry && authority && <>
                <div className={styles.entryModes} role="group" aria-label="Allocation workflow">
                    <button type="button" aria-pressed={entryMode === "period"} disabled={busy || unresolved} className={entryMode === "period" ? styles.entryModeActive : undefined} onClick={() => setEntryMode("period")}>By service period</button>
                    <button type="button" aria-pressed={entryMode === "manual"} disabled={busy || unresolved} className={entryMode === "manual" ? styles.entryModeActive : undefined} onClick={() => setEntryMode("manual")}>Selected bills (advanced)</button>
                </div>
                {entryMode === "period" ? <NhisPeriodRemittanceForm authority={authority} from={receivables.filters.from} to={receivables.filters.to} adjustmentOnly={entry !== "receipt"}
                    onCancel={() => setEntry(null)} onUnresolvedChange={setUnresolved} busy={busy} begin={begin} end={end} onSuccess={completeEntry} /> :
                    <NhisEntryForm initialKind={entry} authority={authority} allocations={allocations} setAllocations={setAllocations} candidates={receivables.data?.rows ?? []}
                        onSelect={toggle} onCancel={() => setEntry(null)} onUnresolvedChange={setUnresolved} busy={busy} begin={begin} end={end} onSuccess={completeEntry} />}
            </>}</Modal.Body>
        </Modal>
        <Modal show={!!reversing && authorityState?.sessionKey === sessionKey} onHide={() => { if (!busy && !unresolved) setReversing(null); }} size="lg" centered backdrop={busy || unresolved ? "static" : true} keyboard={!busy && !unresolved} contentClassName={styles.dialog}>
            <Modal.Header closeButton={!busy && !unresolved}><Modal.Title>Reverse NHIS event</Modal.Title></Modal.Header>
            <Modal.Body>{reversing && authority && <NhisReversalForm key={reversing.id} event={reversing} authority={authority} busy={busy} begin={begin} end={end}
                onUnresolvedChange={setUnresolved} onCancel={() => setReversing(null)} onSuccess={() => { setReversing(null); setNotice("Reversal recorded. The original event remains in activity history."); refreshReports(); }} />}</Modal.Body>
        </Modal>
    </main>;
}
