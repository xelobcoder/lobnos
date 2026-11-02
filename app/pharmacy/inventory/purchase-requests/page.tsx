'use client';
import PharmacyTaskHelp from '../../components/PharmacyTaskHelp';
import Link from 'next/link';
import { useMemo, useState, type FormEvent } from 'react';
import { accountingReference, record } from '../../../../lib/pharmacyAccounting';
import { usePharmacyDocument } from '../../components/PharmacyPaymentFields';
import { styles, money, dateLabel, usePharmacyAccess, usePharmacyResource, Message } from '../../components/PharmacyWorkspace';
import accountingStyles from '../../accounting/components/AccountingWorkspace.module.css';
import layout from './page.module.css';

type PurchaseLine = { itemId: string; name: string; quantity: number; unitCost: number };
type Quote = { supplierId: string; reference: string; lines: PurchaseLine[]; total: number };
type PurchaseRequest = {
  id: string; status: string; version: number; createdBy: number; createdAt: string; reason: string;
  lines: PurchaseLine[]; quotes: Quote[]; estimatedValue: number; orderId?: string; decisionReason?: string;
};
function requiredNumber(value: unknown): number {
  if ((typeof value !== 'number' && typeof value !== 'string') || value === '' || !Number.isFinite(Number(value)) || Number(value) < 0)
    throw Error('A purchase request contains an invalid quantity, cost or version. Reload the page before continuing.');
  return Number(value);
}
function requiredText(value: unknown): string {
  if (typeof value !== 'string' || !value.trim()) throw Error('A purchase request is missing required details. Reload the page before continuing.');
  return value;
}
export function decodePurchaseRequests(value: unknown): PurchaseRequest[] {
  if (!Array.isArray(value)) throw Error('The purchase request list is unavailable. Reload the page before continuing.');
  const lines = (value: unknown): PurchaseLine[] => {
    if (!Array.isArray(value) || !value.length) throw Error('A purchase request has no medicine lines.');
    return value.map(value => {
      const line = record(value);
      return { itemId: requiredText(line.itemId), name: requiredText(line.name), quantity: requiredNumber(line.quantity), unitCost: requiredNumber(line.unitCost) };
    });
  };
  return value.map(value => {
    const row = record(value), details = record(row.details);
    if (!Array.isArray(details.quotes) || !details.quotes.length) throw Error('A purchase request has no supplier quotation.');
    const version = requiredNumber(row.version), createdBy = requiredNumber(row.created_by);
    if (!Number.isSafeInteger(version) || version < 1 || !Number.isSafeInteger(createdBy) || createdBy < 1)
      throw Error('A purchase request has invalid review information. Reload it before continuing.');
    const status = requiredText(row.status);
    if (!['requested', 'approved', 'rejected'].includes(status)) throw Error('A purchase request has an unrecognized status.');
    return {
      id: requiredText(row.id), status, version, createdBy, createdAt: requiredText(row.created_at), reason: requiredText(row.reason),
      lines: lines(details.lines), estimatedValue: requiredNumber(details.estimatedValue),
      quotes: details.quotes.map(value => {
        const quote = record(value);
        return { supplierId: requiredText(quote.supplierId), reference: requiredText(quote.reference), lines: lines(quote.lines), total: requiredNumber(quote.total) };
      }),
      orderId: typeof details.orderId === 'string' ? details.orderId : undefined,
      decisionReason: typeof details.decisionReason === 'string' ? details.decisionReason : undefined,
    };
  });
}
export default function PharmacyPurchaseRequestsPage() {
  const access = usePharmacyAccess();
  return <main className={`${styles.page} ${accountingStyles.page}`}><header className={styles.header}><div><h1>Purchase requests</h1><p>Review what to buy before an order is created. Stock is added only when a delivery is received.</p></div><div className={styles.actions}><Link href="/pharmacy/inventory?tab=orders">Purchase orders &amp; deliveries</Link><Link href="/pharmacy/guide/approve-request">Purchasing guide</Link></div></header>
    {!access.stock ? <p role="status">A pharmacy manager or storekeeper role is required. If your session is loading, please wait.</p> : <PurchaseRequests/>}
  </main>;
}
export function PurchaseRequests() {
  const access = usePharmacyAccess();
  const resource = usePharmacyResource('pharmacy/enterprise/workflows?kind=purchase_requisition');
  const suppliers = usePharmacyResource('pharmacy/suppliers');
  const document = usePharmacyDocument('purchase-request-review');
  const [selectedId, setSelectedId] = useState(''), [decision, setDecision] = useState(''), [busy, setBusy] = useState(false);
  const [error, setError] = useState(''), [notice, setNotice] = useState('');
  const decoded = useMemo(() => {
    if (resource.data == null && (resource.loading || resource.error)) return { rows: [], error: '' };
    try { return { rows: decodePurchaseRequests(resource.data), error: '' }; }
    catch (error) { return { rows: [], error: error instanceof Error ? error.message : 'Unable to read purchase requests.' }; }
  }, [resource.data, resource.loading, resource.error]);
  const available = !resource.loading && !resource.error && !decoded.error;
  const selected = available ? decoded.rows.find(row => row.id === selectedId) : undefined;
  const supplierRows = Array.isArray(suppliers.data) ? suppliers.data.map(record) : [];
  const supplierName = (id: string) => {
    const name = supplierRows.find(row => String(row.id) === id)?.name;
    return typeof name === 'string' ? name : 'Supplier name unavailable';
  };
  const actor = Number(access.app?.user?.employeeid);
  const supplierError = !suppliers.loading && !suppliers.error && !Array.isArray(suppliers.data) ? 'Supplier names could not be verified. Reload before reviewing a quotation.' : '';
  const suppliersReady = !suppliers.loading && !suppliers.error && !supplierError;
  const canDecide = access.manager && Number.isSafeInteger(actor) && actor > 0 && selected && selected.createdBy !== actor;
  const quotesIdentified = selected?.quotes.every(quote => supplierRows.some(row => String(row.id) === quote.supplierId && typeof row.name === 'string' && row.name.trim()));
  const save = async (endpoint: string, payload: Record<string, unknown>, message: string) => {
    if (busy) return;
    setBusy(true); setError(''); setNotice('');
    try {
      const response = await document.execute(endpoint, payload);
      if (!response?.success) throw Error(response?.error?.message || 'The purchase review could not be confirmed.');
      setNotice(message); setDecision('');
      await resource.refresh();
    } catch (error) { setError(error instanceof Error ? error.message : 'Unable to save the purchase review.'); }
    finally { setBusy(false); }
  };
  const submitDecision = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selected || !canDecide) { setError('A different authorized manager must review this request.'); return; }
    if (!suppliersReady || !quotesIdentified) { setError('Verify the supplier names before approving or rejecting this request.'); return; }
    const form = new FormData(event.currentTarget);
    await save(`pharmacy/enterprise/purchase-requests/${encodeURIComponent(selected.id)}/decision`, {
      expectedVersion: selected.version, decision, reason: form.get('reason'),
      ...(decision === 'approve' ? { quoteIndex: Number(form.get('quoteIndex')) } : {}),
    }, decision === 'approve' ? 'Request approved. The purchase order is ready in Purchase orders.' : 'Request rejected. No purchase order was created.');
  };
  return <>
    <PharmacyTaskHelp slug="approve-request"/>
    <p className={styles.muted}><strong>1. Submit request</strong> → <strong>2. Another manager reviews</strong> → <strong>3. Receive approved order</strong>. Submitting or approving a request does not add stock or record a payment.</p>
    <Message error={error || resource.error || decoded.error || suppliers.error || supplierError} notice={notice}/>
    {document.pending && <div role="alert" className="alert alert-warning">A previous purchase review needs confirmation. Do not start another review until it is resolved.<button type="button" className="btn btn-warning ms-2" disabled={busy} onClick={() => save('', {}, 'Original purchase review confirmed. Reloaded the current request status.')}>Retry original review</button></div>}
    <div className={styles.toolbar}><p className="mb-0">Latest 200 requests for this branch. Refresh before reviewing a changed request.</p><button type="button" className="btn btn-outline-secondary" disabled={busy || resource.loading} onClick={() => { resource.refresh(); suppliers.refresh(); }}>Refresh requests</button></div>
    {resource.loading ? <p role="status">Loading purchase requests...</p> : available && (decoded.rows.length ? <><p className={layout.scrollHint}>Scroll sideways in the request list to see costs, next steps and review actions.</p><div className="table-responsive" tabIndex={0} role="region" aria-label="Purchase requests table"><table className={`${styles.table} ${layout.requestTable}`}><thead><tr><th>Request / date</th><th>Reason</th><th>Estimated cost</th><th>Next step</th><th>Action</th></tr></thead><tbody>{decoded.rows.map(row => <tr key={row.id}><td><span title={row.id}>{accountingReference(row.id)}</span><small className="d-block text-muted">{dateLabel(row.createdAt)}</small></td><td>{row.reason}</td><td>{money(row.estimatedValue)}</td><td>{row.status === 'requested' ? 'Awaiting another manager' : row.status === 'approved' ? 'Approved — receive the order' : 'Rejected — no order created'}</td><td><button type="button" className="btn btn-sm btn-outline-primary" disabled={busy || !!document.pending} onClick={() => { setSelectedId(row.id); setDecision(''); setError(''); setNotice(''); }}>Review request</button></td></tr>)}</tbody></table></div></> : <p>No purchase requests yet. <Link href="/pharmacy/inventory?tab=orders">Open Purchase orders</Link> and choose Submit purchase request.</p>)}
    {selected && <section className={`${layout.review} mt-4 pt-4 border-top`} aria-label="Purchase request review">
      <div className={styles.toolbar}><h2 className="mb-0">Review purchase request</h2><button className="btn btn-sm btn-outline-secondary" type="button" disabled={busy} onClick={() => setSelectedId('')}>Close review</button></div>
      <p>{selected.reason}</p><p className={styles.muted}>Requested {dateLabel(selected.createdAt)} · {selected.status} · Version {selected.version}</p>
      {selected.decisionReason && <p><strong>Decision reason:</strong> {selected.decisionReason}</p>}
      {selected.orderId && <p><Link className="btn btn-primary" href={`/pharmacy/inventory?tab=orders&order=${encodeURIComponent(selected.orderId)}`}>Open approved order &amp; receive delivery</Link></p>}
      <h3>Supplier quotations</h3>
      {selected.quotes.map((quote, index) => <section key={index} className="mb-4" aria-label={`Quotation ${index + 1}`}><h4 className="h6">Quote {index + 1}: {supplierName(quote.supplierId)} · {quote.reference} · {money(quote.total)}</h4><p className={layout.scrollHint}>Scroll sideways to see every quotation column.</p><div className="table-responsive" tabIndex={0} role="region" aria-label={`Quotation ${index + 1} medicine lines`}><table className={`${styles.table} ${layout.quoteTable}`}><thead><tr><th>Medicine</th><th>Base units requested</th><th>Cost per base unit</th></tr></thead><tbody>{quote.lines.map(line => <tr key={line.itemId}><td>{line.name}</td><td>{line.quantity}</td><td>{money(line.unitCost)}</td></tr>)}</tbody></table></div></section>)}
      {selected.status === 'requested' && <>
        {!suppliersReady || !quotesIdentified ? <p role="status">Wait for verified supplier names, or refresh the supplier list before confirming a decision.</p> : null}
        {canDecide ? <form onSubmit={submitDecision} aria-label="Purchase approval decision"><h3>Manager decision</h3>
          <label className="form-label d-block">Decision<select name="decision" className="form-select" required value={decision} disabled={busy || !!document.pending} onChange={event => setDecision(event.target.value)}><option value="">Choose approve or reject</option><option value="approve">Approve a quotation and create the order</option><option value="reject">Reject this purchase request</option></select></label>
          {decision === 'approve' && <label className="form-label d-block">Quotation to approve<select name="quoteIndex" className="form-select" required defaultValue="" disabled={busy || !!document.pending}><option value="">Choose supplier quotation</option>{selected.quotes.map((quote, index) => <option key={index} value={index}>Quote {index + 1}: {supplierName(quote.supplierId)} — {money(quote.total)}</option>)}</select></label>}
          <label className="form-label d-block">Reason for decision<textarea name="reason" className="form-control" required minLength={3} maxLength={1000} disabled={busy || !!document.pending}/></label>
          <p className={styles.muted}>Approval creates one purchase order for the selected quotation. No stock or payment is recorded here.</p>
          <button type="submit" className="btn btn-primary" disabled={busy || !!document.pending || !decision || !suppliersReady || !quotesIdentified}>Confirm decision</button>
        </form> : <p role="status">A different pharmacy manager must approve or reject this request. You cannot approve your own request.</p>}
        <details className="mt-4"><summary>Add another supplier quotation</summary><form className="mt-3" aria-label="Supplier quotation" onSubmit={async event => {
          event.preventDefault(); const form = new FormData(event.currentTarget);
          await save(`pharmacy/enterprise/purchase-requests/${encodeURIComponent(selected.id)}/quote`, {
            expectedVersion: selected.version, supplierId: form.get('supplierId'), reference: form.get('reference'),
            lines: selected.lines.map((line, index) => ({ itemId: line.itemId, unitCost: Number(form.get(`cost-${index}`)) })),
          }, 'Quotation added. The manager can now review the updated supplier choices.');
        }}>
          <label className="form-label d-block">Supplier<select className="form-select" name="supplierId" required disabled={busy || !!document.pending || suppliers.loading || !!suppliers.error}><option value="">Choose supplier</option>{supplierRows.map(row => <option key={String(row.id)} value={String(row.id)}>{String(row.name)}</option>)}</select></label>
          <label className="form-label d-block">Quotation reference<input className="form-control" name="reference" required minLength={3} maxLength={120} disabled={busy || !!document.pending}/></label>
          {selected.lines.map((line, index) => <label key={line.itemId} className="form-label d-block">{line.name} — cost per base unit<input className="form-control" type="number" min="0" step="0.01" required name={`cost-${index}`} defaultValue={line.unitCost} disabled={busy || !!document.pending}/></label>)}
          <button className="btn btn-outline-primary" disabled={busy || !!document.pending || !suppliersReady}>Save quotation</button>
        </form></details>
      </>}
    </section>}
  </>;
}
