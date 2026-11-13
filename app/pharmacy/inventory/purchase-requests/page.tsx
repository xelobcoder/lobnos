'use client';
import PharmacyTaskHelp from '../../components/PharmacyTaskHelp';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { accountingReference, record } from '../../../../lib/pharmacyAccounting';
import { downloadPurchaseRequest } from '../../../../lib/pharmacyPurchaseOrder';
import { usePharmacyDocument } from '../../components/PharmacyPaymentFields';
import { styles, money, dateLabel, usePharmacyAccess, usePharmacyResource, Message } from '../../components/PharmacyWorkspace';
import accountingStyles from '../../accounting/components/AccountingWorkspace.module.css';
import layout from './page.module.css';
import purchasing from '../../components/PharmacyPurchasing.module.css';

type PurchaseLine = { itemId: string; name: string; quantity: number; unitCost: number | null; unit?: string; requestedQuantity?: number; approvedQuantity?: number; amendmentReason?: string };
type Quote = { supplierId: string; reference: string; lines: PurchaseLine[]; total: number };
type SupplierOrder = { orderId: string; supplierId: string; reference: string; lines: PurchaseLine[] };
type PurchaseRequest = {
  id: string; status: string; version: number; createdBy: number; createdAt: string; reason: string;
  lines: PurchaseLine[]; quotes: Quote[]; estimatedValue: number | null; orderId?: string; decisionReason?: string; adminSelfReview: boolean;
  schemaVersion: number; orders: SupplierOrder[];
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
  const lines = (value: unknown, optionalCost = false): PurchaseLine[] => {
    if (!Array.isArray(value) || !value.length) throw Error('A purchase request has no medicine lines.');
    return value.map(value => {
      const line = record(value);
      return { itemId: requiredText(line.itemId), name: requiredText(line.name), quantity: requiredNumber(line.quantity),
        unitCost: optionalCost && line.unitCost == null ? null : requiredNumber(line.unitCost),
        unit: typeof line.unit === 'string' ? line.unit : undefined,
        requestedQuantity: line.requestedQuantity == null ? undefined : requiredNumber(line.requestedQuantity),
        approvedQuantity: line.approvedQuantity == null ? undefined : requiredNumber(line.approvedQuantity),
        amendmentReason: typeof line.amendmentReason === 'string' ? line.amendmentReason : undefined };
    });
  };
  return value.map(value => {
    const row = record(value), details = record(row.details);
    const schemaVersion = details.schemaVersion === 2 ? 2 : 1;
    if (!Array.isArray(details.quotes) || (schemaVersion === 1 && !details.quotes.length)) throw Error('A purchase request has no supplier quotation.');
    const version = requiredNumber(row.version), createdBy = requiredNumber(row.created_by);
    if (!Number.isSafeInteger(version) || version < 1 || !Number.isSafeInteger(createdBy) || createdBy < 1)
      throw Error('A purchase request has invalid review information. Reload it before continuing.');
    const status = requiredText(row.status);
    if (!['requested', 'approved', 'rejected'].includes(status)) throw Error('A purchase request has an unrecognized status.');
    return {
      id: requiredText(row.id), status, version, createdBy, createdAt: requiredText(row.created_at), reason: requiredText(row.reason),
      schemaVersion, lines: lines(details.lines, schemaVersion === 2), estimatedValue: schemaVersion === 2 && details.estimatedValue == null ? null : requiredNumber(details.estimatedValue),
      quotes: details.quotes.map(value => {
        const quote = record(value);
        return { supplierId: requiredText(quote.supplierId), reference: requiredText(quote.reference), lines: lines(quote.lines), total: requiredNumber(quote.total) };
      }),
      orderId: typeof details.orderId === 'string' ? details.orderId : undefined,
      decisionReason: typeof details.decisionReason === 'string' ? details.decisionReason : undefined,
      adminSelfReview: details.adminSelfReview === true,
      orders: schemaVersion === 2 && Array.isArray(details.orders) ? details.orders.map(value => {
        const order = record(value);
        return { orderId: requiredText(order.orderId), supplierId: requiredText(order.supplierId), reference: requiredText(order.reference), lines: lines(order.lines) };
      }) : [],
    };
  });
}
export default function PharmacyPurchaseRequestsPage() {
  const access = usePharmacyAccess();
  return <main className={`${styles.page} ${accountingStyles.page} ${purchasing.theme} ${layout.canvas}`}><header className={styles.header}><div><h1>Purchase requests</h1><p>Request medicines, approve quantities, then order from a supplier.</p></div><div className={styles.actions}>{access.stock && <Link className="btn btn-primary" href="/pharmacy/inventory?tab=orders&action=request">New purchase request</Link>}<Link className="btn btn-outline-secondary" href="/pharmacy/inventory?tab=orders">Purchase orders &amp; deliveries</Link></div></header>
    {!access.stock ? <p role="status">A pharmacy manager, administrator or storekeeper role is required. If your session is loading, please wait.</p> : <PurchaseRequests/>}
  </main>;
}
export function PurchaseRequests() {
  const access = usePharmacyAccess();
  const [page,setPage]=useState(1),[search,setSearch]=useState(''),[status,setStatus]=useState('all'),[serverSearch,setServerSearch]=useState('');
  useEffect(()=>{const timer=setTimeout(()=>{setServerSearch(search);setPage(1);},250);return()=>clearTimeout(timer);},[search]);
  const resource = usePharmacyResource(`pharmacy/enterprise/purchase-requests?page=${page}&count=25&search=${encodeURIComponent(serverSearch)}&status=${encodeURIComponent(status)}`);
  const suppliers = usePharmacyResource('pharmacy/suppliers');
  const document = usePharmacyDocument('purchase-request-review');
  const [selectedId, setSelectedId] = useState(''), [decision, setDecision] = useState(''), [busy, setBusy] = useState(false);
  const [error, setError] = useState(''), [notice, setNotice] = useState('');

  const reviewHeading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (selectedId) { reviewHeading.current?.focus(); reviewHeading.current?.scrollIntoView({ block: 'start', behavior: 'smooth' }); }
  }, [selectedId]);
  const decoded = useMemo(() => {
    if (resource.data == null && (resource.loading || resource.error)) return { rows: [], error: '' };
    try { return { rows: decodePurchaseRequests(resource.data?.items??resource.data), error: '' }; }
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
  const selfReview = !!selected && selected.createdBy === actor && access.administrator;
  const canDecide = access.manager && Number.isSafeInteger(actor) && actor > 0 && selected && (selected.createdBy !== actor || selfReview);
  const visible = decoded.rows.filter(row => (status === 'all' || row.status === status) &&
    [row.id, accountingReference(row.id), row.reason, ...row.lines.map(line => line.name), ...row.quotes.map(quote => supplierName(quote.supplierId))]
      .join(' ').toLowerCase().includes(search.trim().toLowerCase()));
  const statusLabel = (value: string) => value === 'requested' ? 'Awaiting review' : value === 'approved' ? 'Approved' : 'Rejected';
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
    if (!selected || !canDecide) { setError('A different pharmacy manager or administrator must review this request.'); return; }
    if (selected.schemaVersion !== 2 && (!suppliersReady || !quotesIdentified)) { setError('Verify the supplier names before approving or rejecting this request.'); return; }
    const form = new FormData(event.currentTarget);
    if (selfReview && (form.get('adminSelfReview') !== 'on' || String(form.get('reason') || '').trim().length < 10)) {
      setError('Acknowledge administrator self-review and enter a reason of at least 10 characters.'); return;
    }
    await save(`pharmacy/enterprise/purchase-requests/${encodeURIComponent(selected.id)}/decision`, {
      expectedVersion: selected.version, decision, reason: form.get('reason'),
      ...(decision === 'approve' ? selected.schemaVersion === 2 ? { lines: selected.lines.map((line, index) => ({
        itemId: line.itemId, approvedQuantity: Number(form.get(`approved-${index}`)), reason: form.get(`amendment-${index}`),
      })) } : { quoteIndex: Number(form.get('quoteIndex')) } : {}),
      ...(selfReview ? { adminSelfReview: true } : {}),
    }, decision === 'approve' ? selected.schemaVersion === 2 ? 'Quantities approved. Choose Order from supplier to create a purchase order.' : 'Request approved. The purchase order is ready in Purchase orders.' : 'Request rejected. No purchase order was created.');
  };
  return <>
    <PharmacyTaskHelp slug="approve-request"/>
    <p className={styles.muted}>Request medicines → Approve quantities → Order from supplier → Receive stock → Record supplier invoice. <Link href="/pharmacy/guide/approve-request">Purchasing guide</Link></p>
    <details className={layout.approvalHelp}><summary>Who can approve a purchase request?</summary><p>A pharmacy manager or administrator in the operating branch can approve or reject a request created by someone else.</p><p>Only one pharmacy manager? A different administrator can review it. No pharmacy manager? A storekeeper can submit the request and an administrator can review it. Administrators may also review their own requests with an explicit acknowledgement and a reason of at least 10 characters; the exception is recorded in the audit history. Pharmacy managers cannot self-approve.</p></details>
    <Message error={error || resource.error || decoded.error || suppliers.error || supplierError} notice={notice}/>
    {document.pending && <div role="alert" className="alert alert-warning">A previous purchase review needs confirmation. Do not start another review until it is resolved.<button type="button" className="btn btn-warning ms-2" disabled={busy} onClick={() => save('', {}, 'Original purchase review confirmed. Reloaded the current request status.')}>Retry original review</button></div>}
    {available && <dl className={`${accountingStyles.summaryStrip} ${layout.panel}`} aria-label="Purchase request summary">
      {[['requested', 'Awaiting review', 'Needs an authorized decision'], ['approved', 'Approved', 'Order remaining approved quantities'], ['rejected', 'Rejected', 'No purchase order created']].map(([value, title, detail]) => <div key={value}><dt>{title}</dt><dd>{decoded.rows.filter(row => row.status === value).length}</dd><dd className={accountingStyles.summaryDetail}>{detail}</dd></div>)}
    </dl>}
    <div className={`${accountingStyles.filters} ${layout.panel} ${layout.filterPanel}`}>
      <label className="form-label">Find a request<input className="form-control" type="search" placeholder="Reference, medicine or reason" value={search} onChange={event => setSearch(event.target.value)}/></label>
      <label className="form-label">Status<select className="form-select" value={status} onChange={event => {setStatus(event.target.value);setPage(1);}}><option value="all">All requests</option><option value="requested">Awaiting review</option><option value="approved">Approved</option><option value="rejected">Rejected</option></select></label>
      <button type="button" className="btn btn-outline-secondary" disabled={busy || resource.loading} onClick={() => { resource.refresh(); suppliers.refresh(); }}>Refresh requests</button>
    </div>
    <p className={styles.muted}>{available ? `${visible.length} of ${decoded.rows.length} requests shown. ` : ''}Purchase requests for this branch; summary counts cover this list.</p>
    {resource.loading ? <p role="status">Loading purchase requests...</p> : available && (visible.length ? <div className={`table-responsive ${layout.tableCard}`} tabIndex={0} role="region" aria-label="Purchase requests table"><table className={`${styles.table} ${layout.requestTable}`}><thead><tr><th>Request / date</th><th>What is needed</th><th>Estimated cost</th><th>Status</th><th>Action</th></tr></thead><tbody>{visible.map(row => <tr key={row.id} aria-selected={row.id === selectedId}><td data-label="Request"><span title={row.id}>{accountingReference(row.id)}</span><small className="d-block text-muted">{dateLabel(row.createdAt)}</small>{row.createdBy === actor && <small className={layout.ownRequest}>Requested by you</small>}</td><td data-label="What is needed"><strong>{row.reason}</strong><small className="d-block text-muted">{row.lines.length} {row.lines.length === 1 ? 'medicine' : 'medicines'} · {row.quotes.length} {row.quotes.length === 1 ? 'quotation' : 'quotations'}</small></td><td data-label="Estimated cost">{money(row.estimatedValue)}</td><td data-label="Status"><span className={layout.status} data-status={row.status}>{statusLabel(row.status)}</span></td><td data-label="Action"><button type="button" className="btn btn-sm btn-outline-primary" disabled={busy || !!document.pending} aria-expanded={row.id === selectedId} aria-controls="purchase-request-review" onClick={() => { setSelectedId(row.id); setDecision(''); setError(''); setNotice(''); }}>{row.status === 'requested' ? 'Review request' : 'View details'}</button></td></tr>)}</tbody></table></div> : <p role="status">{decoded.rows.length ? 'No requests match these filters. Change the status or search text.' : <>No purchase requests yet. <Link href="/pharmacy/inventory?tab=orders&action=request">Create your first request</Link>.</>}</p>)}
    <div className="d-flex justify-content-between align-items-center gap-3 flex-wrap my-3" aria-label="Purchase request pages"><small>Page {page} - {Number(resource.data?.total??decoded.rows.length).toLocaleString()} matching requests</small><div className="d-flex gap-2"><button className="btn btn-outline-secondary" disabled={resource.loading||page<=1||busy||!!document.pending} onClick={()=>setPage(value=>value-1)}>Previous page</button><button className="btn btn-outline-secondary" disabled={resource.loading||busy||!!document.pending||page*25>=Number(resource.data?.total??decoded.rows.length)} onClick={()=>setPage(value=>value+1)}>Next page</button></div></div>
    {selected && <section id="purchase-request-review" className={`${layout.review} mt-4`} aria-label="Purchase request review">
      <div className={styles.toolbar}><h2 ref={reviewHeading} tabIndex={-1} className="mb-0">Purchase request <span title={selected.id}>{accountingReference(selected.id)}</span></h2><div className={styles.actions}><button className="btn btn-sm btn-outline-primary" type="button" onClick={async () => { try { await downloadPurchaseRequest({ ...selected, reference: accountingReference(selected.id) }); } catch (e) { setError(e instanceof Error ? e.message : 'Unable to generate purchase request PDF.'); } }}>Download / print PDF</button><button className="btn btn-sm btn-outline-secondary" type="button" disabled={busy} onClick={() => setSelectedId('')}>Close review</button></div></div>
      <p><strong>Request reason</strong> {selected.reason}</p><p className={styles.muted}>Requested {dateLabel(selected.createdAt)} · {statusLabel(selected.status)} · Version {selected.version}</p>
      {selected.decisionReason && <p><strong>Decision reason:</strong> {selected.decisionReason}</p>}
      {selected.adminSelfReview && <details className={layout.audit}><summary>Administrator self-review recorded</summary><p>The decision reason and reviewer are retained in the audit history.</p></details>}
      <div className={layout.reviewStage} role="status"><strong>{selected.status === 'requested' ? 'Next step · Review quantities' : selected.status === 'rejected' ? 'Request rejected' : 'Next step · Supplier orders'}</strong><p>{selected.status === 'requested' ? 'Check the medicines below, then approve or reject this request.' : selected.status === 'rejected' ? 'Read the decision reason above before preparing another request.' : 'Open an existing supplier order to track delivery, or order any remaining approved quantities below.'}</p></div>
      {selected.orderId && <p><Link className="btn btn-primary" href={`/pharmacy/inventory/orders?order=${encodeURIComponent(selected.orderId)}`}>Open approved order &amp; receive delivery</Link></p>}
      {selected.schemaVersion === 2 && <>
        <h3>Requested and approved quantities</h3>
        <div className="table-responsive"><table className={styles.table}><thead><tr><th>Medicine</th><th>Requested</th><th>Approved</th><th>Ordered</th><th>Amendment reason</th></tr></thead><tbody>{selected.lines.map(line => <tr key={line.itemId}><td>{line.name}<small className="d-block text-muted">{line.unit || 'base units'}</small></td><td>{line.requestedQuantity ?? line.quantity}</td><td>{line.approvedQuantity ?? 'Awaiting review'}</td><td>{allocatedQuantity(selected, line.itemId)}</td><td>{line.amendmentReason || '—'}</td></tr>)}</tbody></table></div>
        {selected.orders.map(order => <p key={order.orderId}><Link href={`/pharmacy/inventory/orders?order=${encodeURIComponent(order.orderId)}`}>Open supplier order {accountingReference(order.orderId)}</Link> · {supplierName(order.supplierId)} · {order.reference}</p>)}
        {selected.status === 'approved' && access.manager && <SupplierOrderForm key={`${selected.id}-${selected.version}`} request={selected} suppliers={supplierRows} locked={busy || !!document.pending || !suppliersReady} save={save}/>}
      </>}
      <details className={layout.supporting}><summary>Supplier quotations ({selected.quotes.length}) · Optional evidence</summary>
      <h3>Supplier quotations</h3>
      {!selected.quotes.length && <p className={styles.muted}>No supplier quotation recorded. A quotation is optional evidence, not required for quantity approval.</p>}
      {selected.quotes.map((quote, index) => <section key={index} className="mb-4" aria-label={`Quotation ${index + 1}`}><h4 className="h6">Quote {index + 1}: {supplierName(quote.supplierId)} · {quote.reference} · {money(quote.total)}</h4><p className={layout.scrollHint}>Scroll sideways to see every quotation column.</p><div className="table-responsive" tabIndex={0} role="region" aria-label={`Quotation ${index + 1} medicine lines`}><table className={`${styles.table} ${layout.quoteTable}`}><thead><tr><th>Medicine</th><th>Base units requested</th><th>Cost per base unit</th></tr></thead><tbody>{quote.lines.map(line => <tr key={line.itemId}><td>{line.name}</td><td>{line.quantity}</td><td>{money(line.unitCost)}</td></tr>)}</tbody></table></div></section>)}
      </details>
      {selected.status === 'requested' && <>
        {selected.schemaVersion !== 2 && (!suppliersReady || !quotesIdentified) ? <p role="status">Wait for verified supplier names, or refresh the supplier list before confirming a decision.</p> : null}
        {canDecide ? <form key={`decision-${selected.id}`} className={layout.decision} onSubmit={submitDecision} aria-label="Purchase approval decision"><h3>{selfReview ? 'Administrator self-review' : 'Approve or reject'}</h3><p className={styles.muted}>{selfReview ? 'This is your request. Verify the medicines and supplier costs, explain why you are reviewing your own request and acknowledge responsibility. This exception is recorded in the audit history.' : 'You are reviewing as a pharmacy manager or administrator. Choose a decision and record why.'}</p>
          <label className="form-label d-block">Decision<select name="decision" className="form-select" required value={decision} disabled={busy || !!document.pending} onChange={event => setDecision(event.target.value)}><option value="">Choose approve or reject</option><option value="approve">{selected.schemaVersion === 2 ? 'Approve medicine quantities' : 'Approve a quotation and create the order'}</option><option value="reject">Reject this purchase request</option></select></label>
          {decision === 'approve' && selected.schemaVersion !== 2 && <label className="form-label d-block">Quotation to approve<select name="quoteIndex" className="form-select" required defaultValue="" disabled={busy || !!document.pending}><option value="">Choose supplier quotation</option>{selected.quotes.map((quote, index) => <option key={index} value={index}>Quote {index + 1}: {supplierName(quote.supplierId)} — {money(quote.total)}</option>)}</select></label>}
          {decision === 'approve' && selected.schemaVersion === 2 && <fieldset disabled={busy || !!document.pending}><legend className="h6">Approved quantities</legend><p className={styles.muted}>The original request is retained. Give a reason for each changed quantity; zero excludes a medicine.</p>{selected.lines.map((line, index) => <div key={line.itemId} className={layout.quantityReview}><label className="form-label">{line.name} — requested {line.quantity} {line.unit || 'base units'}<input className="form-control" aria-label={`Approved quantity for ${line.name}`} name={`approved-${index}`} type="number" min="0" max="99999999999.999" step="0.001" required defaultValue={line.quantity}/></label><label className="form-label">Reason if quantity changes<input className="form-control" name={`amendment-${index}`} maxLength={500}/></label></div>)}</fieldset>}
          <label className="form-label d-block">Reason for decision<textarea name="reason" className="form-control" required minLength={selfReview ? 10 : 3} maxLength={1000} disabled={busy || !!document.pending}/></label>
          {selfReview && <label className="form-check d-flex gap-2 align-items-start mb-3"><input className="form-check-input" type="checkbox" name="adminSelfReview" required disabled={busy || !!document.pending}/><span>I have verified my own purchase request and accept responsibility for this administrator self-review.</span></label>}
          <p className={styles.muted}>{selected.schemaVersion === 2 ? 'Approval records quantities only. Order from a supplier separately after approval.' : 'Approval creates one purchase order for the selected quotation.'} No stock or payment is recorded here.</p>
          <button type="submit" className="btn btn-primary" disabled={busy || !!document.pending || !decision || (selected.schemaVersion !== 2 && (!suppliersReady || !quotesIdentified))}>Confirm decision</button>
        </form> : <div className={layout.decision} role="status"><strong>{selected.createdBy === actor ? 'This is your request.' : 'An authorized reviewer is needed.'}</strong><p>A different pharmacy manager or administrator must approve or reject this request.</p><p className="mb-0">{selected.createdBy === actor ? 'You cannot approve your own request. If you are the only pharmacy manager, ask a different administrator to review it.' : 'Storekeepers can submit requests and add quotations, but cannot approve or reject them.'}</p></div>}
      </>}
      {(selected.status === 'requested' || (selected.schemaVersion === 2 && selected.status === 'approved')) && <details key={`quotation-${selected.id}-${selected.version}`} className={layout.supporting}><summary>Add supplier quotation evidence (optional)</summary><form className="mt-3" aria-label="Supplier quotation" onSubmit={async event => {
          event.preventDefault(); const form = new FormData(event.currentTarget);
          await save(`pharmacy/enterprise/purchase-requests/${encodeURIComponent(selected.id)}/quote`, {
            expectedVersion: selected.version, supplierId: form.get('supplierId'), reference: form.get('reference'),
            lines: selected.lines.map((line, index) => ({ itemId: line.itemId, unitCost: Number(form.get(`cost-${index}`)) })),
          }, 'Quotation added. A manager or administrator can now review the updated supplier choices.');
        }}>
          <label className="form-label d-block">Supplier<select className="form-select" name="supplierId" required disabled={busy || !!document.pending || suppliers.loading || !!suppliers.error}><option value="">Choose supplier</option>{supplierRows.map(row => <option key={String(row.id)} value={String(row.id)}>{String(row.name)}</option>)}</select></label>
          <label className="form-label d-block">Quotation reference<input className="form-control" name="reference" required minLength={3} maxLength={120} disabled={busy || !!document.pending}/></label>
          {selected.lines.map((line, index) => <label key={line.itemId} className="form-label d-block">{line.name} — cost per base unit<input className="form-control" type="number" min="0" step="0.01" required name={`cost-${index}`} defaultValue={line.unitCost ?? ''} disabled={busy || !!document.pending}/></label>)}
          <button className="btn btn-outline-primary" disabled={busy || !!document.pending || !suppliersReady}>Save quotation</button>
        </form></details>}
    </section>}
  </>;
}
function allocatedQuantity(request: PurchaseRequest, itemId: string) {
  return Number(request.orders.reduce((sum, order) => sum + order.lines.filter(line => line.itemId === itemId).reduce((sum, line) => sum + line.quantity, 0), 0).toFixed(3));
}
function SupplierOrderForm({ request, suppliers, locked, save }: {
  request: PurchaseRequest; suppliers: Record<string, unknown>[]; locked: boolean;
  save: (endpoint: string, payload: Record<string, unknown>, message: string) => Promise<void>;
}) {
  const [quoteIndex, setQuoteIndex] = useState(''), [supplierId, setSupplierId] = useState('');
  const remaining = request.lines.map(line => ({ ...line, remaining: Number(((line.approvedQuantity ?? 0) - allocatedQuantity(request, line.itemId)).toFixed(3)) })).filter(line => line.remaining > 0);
  const quote = quoteIndex === '' ? undefined : request.quotes[Number(quoteIndex)];
  if (!remaining.length) return <p className="alert alert-success" role="status">All approved quantities have supplier orders. Open a supplier order above to continue with delivery.</p>;
  return <details className={layout.order}><summary>Order from supplier</summary><form className="mt-3" aria-label="Order approved medicines from supplier" onSubmit={async event => {
    event.preventDefault(); const form = new FormData(event.currentTarget);
    const lines = remaining.map((line, index) => ({ itemId: line.itemId, quantity: Number(form.get(`quantity-${index}`)) })).filter(line => line.quantity > 0);
    await save(`pharmacy/enterprise/purchase-requests/${encodeURIComponent(request.id)}/convert`, {
      expectedVersion: request.version, supplierId, reference: form.get('reference'), lines,
      ...(quoteIndex === '' ? {} : { quoteIndex: Number(quoteIndex) }),
    }, 'Supplier order created. Open its link above to record the actual delivery; no stock or payment was posted.');
  }}>
    <h3>Order approved medicines</h3><p className={styles.muted}>Choose the supplier and the quantities to order. No price is needed now — actual buying costs are entered when the goods are received. You may split the remaining quantities between supplier orders. Set a quantity to zero to leave it for later. Allocated quantities cannot be ordered twice.</p>
    <fieldset disabled={locked}>
      <label className="form-label d-block">Quotation evidence (optional)<select className="form-select" value={quoteIndex} onChange={event => {
        const index = event.target.value; setQuoteIndex(index); if (index !== '') setSupplierId(request.quotes[Number(index)].supplierId);
      }}><option value="">No quotation</option>{request.quotes.map((quote, index) => <option key={index} value={index}>{quote.reference} — {money(quote.total)}</option>)}</select></label>
      <label className="form-label d-block">Supplier<select className="form-select" required value={supplierId} onChange={event => { setSupplierId(event.target.value); setQuoteIndex(''); }}><option value="">Choose supplier</option>{suppliers.map(supplier => <option key={String(supplier.id)} value={String(supplier.id)}>{String(supplier.name)}</option>)}</select></label>
      <label className="form-label d-block">Supplier order / agreement reference<input className="form-control" name="reference" required minLength={3} maxLength={120}/></label>
      <div key={quoteIndex}>{remaining.map((line, index) => <div className={layout.quantityReview} key={line.itemId}>
        <label className="form-label">{line.name} — {line.remaining} {line.unit || 'base units'} remaining<input className="form-control" name={`quantity-${index}`} type="number" min="0" max={line.remaining} step="0.001" required defaultValue={line.remaining}/></label>
        {quote && <p className={styles.muted}>Quoted cost (reference only, not saved on the order): {money(quote.lines.find(value => value.itemId === line.itemId)?.unitCost ?? 0)} per {line.unit || 'base unit'}</p>}
      </div>)}</div>
      <button className="btn btn-primary" type="submit">Create supplier order</button>
    </fieldset>
  </form></details>;
}
