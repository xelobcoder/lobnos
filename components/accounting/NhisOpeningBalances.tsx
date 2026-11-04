"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useApplication } from "../Auth/useApplicationContext";
import { customFetch, customPost, currencyFormatter } from "../Auth/customFetch";
import { roleAllowed } from "../Auth/roles";
import { checkedResult } from "../../lib/accounting/nhisApi";
import { today } from "../../lib/accounting/nhis";
import { billingSubmissionIdentity } from "../../lib/billing/submissionIdentity";
import styles from "./NhisWorkspace.module.css";

interface Preview { from: string; to: string; date: string; amount: number; billCount: number; snapshotToken: string; unverifiedLegacyReceipts: number;
    excludedMixedBills: number; offsetAccounts: Array<{ account_code: string; name: string }>; sample: Array<{ billingId: number; amount: number }> }
interface Opening { id: number; reference: string; amount: number; bill_count: number; opening_date: string; reversalId: number | null }
export default function NhisOpeningBalances() {
    const application = useApplication();
    return <OpeningWorkspace key={JSON.stringify(application)} application={application} />;
}
function OpeningWorkspace({ application }: { application: ReturnType<typeof useApplication> }) {
    const owner = roleAllowed(application?.user?.role, ["admin"]);
    const [dates, setDates] = useState({ from: "2000-01-01", to: today(), date: today() });
    const [preview, setPreview] = useState<Preview | null>(null), [history, setHistory] = useState<Opening[]>([]);
    const [offset, setOffset] = useState(""), [reference, setReference] = useState(""), [reason, setReason] = useState("");
    const [confirmed, setConfirmed] = useState(false), [acknowledged, setAcknowledged] = useState(false);
    const [busy, setBusy] = useState(false), [error, setError] = useState(""), [notice, setNotice] = useState("");
    const [reversing, setReversing] = useState<number | null>(null), [reverseReference, setReverseReference] = useState(""), [reverseReason, setReverseReason] = useState("");
    const inFlight = useRef(false);
    const money = (value: number) => currencyFormatter.format(value);
    async function refreshHistory() {
        const result = checkedResult<Opening[]>(await customFetch("accounting/nhis/openings"));
        if (!Array.isArray(result)) throw new Error("Opening history could not be verified");
        setHistory(result);
    }
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const from = params.get("from"), to = params.get("to");
        setDates(value => ({ ...value, ...(from ? { from } : {}), ...(to ? { to } : {}) }));
    }, []);
    useEffect(() => { if (owner) void refreshHistory().catch(error => setError(error.message)); }, [owner]);
    async function run(work: () => Promise<void>) {
        if (inFlight.current) return;
        inFlight.current = true; setBusy(true); setError(""); setNotice("");
        try { await work(); } catch (error) { setError(error instanceof Error ? error.message : "Unable to complete the opening-balance action"); }
        finally { inFlight.current = false; setBusy(false); }
    }
    async function review() {
        await run(async () => {
            const value = checkedResult<Preview>(await customPost("accounting/nhis/openings/preview", "POST", dates));
            if (!Number.isSafeInteger(value.billCount) || value.billCount < 0 || !Number.isFinite(Number(value.amount)) || !Array.isArray(value.offsetAccounts) || !value.snapshotToken)
                throw new Error("Opening preview could not be verified");
            setPreview(value); setConfirmed(false); setAcknowledged(false); setOffset("");
        });
    }
    async function post() {
        if (!preview || !confirmed || !acknowledged || !offset) return;
        await run(async () => {
            const payload = { ...dates, amount: preview.amount, snapshotToken: preview.snapshotToken, offsetAccountCode: offset,
                reference, reason, confirmed: true, acknowledgedLegacyReceipts: true };
            const identity = billingSubmissionIdentity({ namespace: "laboratory-nhis-opening", context: application, endpoint: "openings", payload });
            const result = checkedResult<{ id: number; amount: number; billCount: number }>(await customPost("accounting/nhis/openings", "POST", { ...payload, requestKey: identity.key }));
            if (!result.id || Number(result.amount) !== Number(preview.amount) || result.billCount !== preview.billCount) throw new Error("Opening posting could not be verified. Review history before retrying.");
            identity.complete(); setPreview(null); setConfirmed(false); setAcknowledged(false);
            setNotice(`${money(result.amount)} of opening receivables recorded for ${result.billCount.toLocaleString()} bills. These bills can now be included in an NHIS remittance.`);
            await refreshHistory();
        });
    }
    async function reverse() {
        if (!reversing) return;
        await run(async () => {
            const payload = { reference: reverseReference, reason: reverseReason };
            const identity = billingSubmissionIdentity({ namespace: "laboratory-nhis-opening-reversal", context: application, endpoint: `openings/${reversing}/reversal`, payload });
            const result = checkedResult<{ id: number; reversed: boolean }>(await customPost(`accounting/nhis/openings/${reversing}/reversal`, "POST", { ...payload, requestKey: identity.key }));
            if (!result.reversed || result.id !== reversing) throw new Error("Opening reversal could not be verified");
            identity.complete(); setReversing(null); setPreview(null); setNotice("Opening import reversed in both the general ledger and AR subledger."); await refreshHistory();
        });
    }
    if (!application?.user) return <p role="status">Loading account access…</p>;
    if (!owner) return <div role="alert" className="alert alert-warning">An administrator must review and approve opening receivables.</div>;
    return <main className={styles.page}>
        <div className={styles.header}><div><h1>NHIS opening receivables</h1><p>Review the migrated bill balances and their accounting offset before posting.</p></div><Link href="/accounting/nhis" className="btn btn-outline-secondary">Back to NHIS</Link></div>
        {error && <div role="alert" className="alert alert-danger">{error}</div>}{notice && <div role="status" className="alert alert-success">{notice}</div>}
        <section className={`${styles.panel} p-3`}>
            <p>This records the approved outstanding receivable against the equity account selected by your accountant. Cash receipt and current-period revenue are handled through their respective workflows.</p>
            <form onSubmit={event => { event.preventDefault(); void review(); }}><fieldset disabled={busy}><div className="row g-3">
                {([['from', 'Service period from'], ['to', 'Service period to'], ['date', 'Opening posting date']] as const).map(([key, label]) => <div key={key} className="col-md-4"><label htmlFor={`opening-${key}`} className="form-label">{label}</label>
                    <input id={`opening-${key}`} type="date" className="form-control" required max={today()} value={dates[key]} onChange={event => { setDates({ ...dates, [key]: event.target.value }); setPreview(null); }} /></div>)}
            </div><button className="btn btn-primary mt-3" type="submit">{busy ? 'Working…' : 'Preview opening receivables'}</button></fieldset></form>
        </section>
        {preview && <section className={`${styles.panel} p-3`}><h2 className="h5">Review the opening balance</h2>
            <p><strong>{preview.billCount.toLocaleString()} bills · {money(preview.amount)}</strong></p>
            <p>Legacy receipt-history difference: <strong>{money(preview.unverifiedLegacyReceipts)}</strong>. Mixed-payer bills excluded: {preview.excludedMixedBills}.</p>
            {preview.billCount === 0 ? <p>All eligible bills in this period already have accounting coverage, or have no outstanding balance.</p> :
                <form onSubmit={event => { event.preventDefault(); void post(); }}><fieldset disabled={busy}><div className="row g-3">
                    <div className="col-md-6"><label htmlFor="opening-offset" className="form-label">Accountant-approved equity offset</label><select id="opening-offset" className="form-select" required value={offset} onChange={event => setOffset(event.target.value)}>
                        <option value="">Select the approved opening account</option>{preview.offsetAccounts.map(account => <option key={account.account_code} value={account.account_code}>{account.account_code} — {account.name}</option>)}</select></div>
                    <div className="col-md-6"><label htmlFor="opening-reference" className="form-label">Approval reference</label><input id="opening-reference" className="form-control" required maxLength={120} value={reference} onChange={event => setReference(event.target.value)} /></div>
                    <div className="col-12"><label htmlFor="opening-reason" className="form-label">Opening-balance review and evidence</label><textarea id="opening-reason" className="form-control" required maxLength={1000} rows={2} value={reason} onChange={event => setReason(event.target.value)} /></div>
                </div>
                <label className="d-block mt-3"><input type="checkbox" className="form-check-input me-2" required checked={acknowledged} onChange={event => setAcknowledged(event.target.checked)} />I reviewed the historical receipts and any differences shown above.</label>
                <label className="d-block mt-2"><input type="checkbox" className="form-check-input me-2" required checked={confirmed} onChange={event => setConfirmed(event.target.checked)} />I approve {money(preview.amount)} as the opening NHIS receivable and confirm the selected equity offset.</label>
                <button type="submit" className="btn btn-primary mt-3" disabled={!confirmed || !acknowledged || !offset}>Approve and post opening balances</button>
            </fieldset></form>}
            <details className="mt-3"><summary>Sample of the linked bills</summary><table className="table table-sm"><thead><tr><th>Bill</th><th>Opening receivable</th></tr></thead><tbody>{preview.sample.map(bill => <tr key={bill.billingId}><td>BILL-{bill.billingId}</td><td>{money(bill.amount)}</td></tr>)}</tbody></table></details>
        </section>}
        <section className={`${styles.panel} p-3`}><div className="d-flex justify-content-between"><h2 className="h5">Opening-balance history</h2><button className="btn btn-sm btn-outline-secondary" disabled={busy} onClick={() => void run(refreshHistory)}>Refresh history</button></div>
            <div className={styles.tableScroll}><table className="table"><thead><tr><th>Reference</th><th>Opening date</th><th>Bills</th><th>Amount</th><th>Correction</th></tr></thead><tbody>{history.map(row => <tr key={row.id}><td>{row.reference}</td><td>{String(row.opening_date).slice(0,10)}</td><td>{row.bill_count}</td><td>{money(Number(row.amount))}</td><td>{row.reversalId ? 'Reversed' : <button className="btn btn-sm btn-outline-danger" disabled={busy} onClick={() => { setReversing(row.id); setReverseReference(''); setReverseReason(''); }}>Review reversal</button>}</td></tr>)}</tbody></table></div>
            {!history.length && <p>No opening imports recorded.</p>}
            {reversing && <form onSubmit={event => { event.preventDefault(); void reverse(); }}><fieldset disabled={busy}><h3 className="h6">Reverse opening import #{reversing}</h3>
                <label className="form-label" htmlFor="opening-reverse-reference">Correction reference</label><input id="opening-reverse-reference" className="form-control mb-2" required maxLength={120} value={reverseReference} onChange={event => setReverseReference(event.target.value)} />
                <label className="form-label" htmlFor="opening-reverse-reason">Reason</label><textarea id="opening-reverse-reason" className="form-control mb-2" required value={reverseReason} maxLength={1000} onChange={event => setReverseReason(event.target.value)} />
                <p>Subsequent settlements and bill changes must be reversed first. This correction reverses all linked journals and AR entries together.</p>
                <button type="submit" className="btn btn-danger">Confirm opening-balance reversal</button><button type="button" className="btn btn-outline-secondary ms-2" onClick={() => setReversing(null)}>Cancel</button>
            </fieldset></form>}
        </section>
    </main>;
}
