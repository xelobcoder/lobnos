'use client';
import Link from 'next/link';
import { useState } from 'react';
import { accountingReference } from '../../../../lib/pharmacyAccounting';
import PharmacyReceivingModal from '../../components/PharmacyReceivingModal';
import { usePharmacyDocument } from '../../components/PharmacyPaymentFields';
import { dateLabel, Empty, Message, Modal, money, styles, usePharmacyAccess, usePharmacyResource } from '../../components/PharmacyWorkspace';
import { heldQuantity, invoiceAllocation, uninvoicedQuantity, type ReceivingLine } from '../../../../lib/pharmacyReceiving';
import layout from './page.module.css';

export default function PharmacyDeliveriesPage() {
  const access = usePharmacyAccess();
  if (!access.stock && !access.finance) return <main className={styles.page}><h1>Deliveries &amp; invoices</h1><Empty>Pharmacy stock or finance access is required.</Empty></main>;
  if (!access.stock) return <main className={styles.page}><h1>Supplier invoices</h1><SupplierInvoices deliveries={[]} suppliers={[]} canRecord={false} onCompleted={async () => {}}/></main>;
  return <DeliveriesWorkspace stockAccess={access.stock} financeAccess={access.finance} manager={access.manager}/>;
}
function DeliveriesWorkspace({ stockAccess, financeAccess, manager }: { stockAccess: boolean; financeAccess: boolean; manager: boolean }) {
  const deliveries = usePharmacyResource('pharmacy/receiving/deliveries'), setup = usePharmacyResource('pharmacy/receiving/setup');
  const [dialog, setDialog] = useState<any>(null), [policyOpen, setPolicyOpen] = useState(false);
  const refresh = async () => { await Promise.all([deliveries.refresh(), setup.refresh()]); };
  const rows: any[] = deliveries.data || [];
  const supplierName = (id: string) => setup.data?.suppliers?.find((row: any) => row.id === id)?.name || id;
  return <main className={styles.page}>
    <header className={styles.header}><div><h1>Deliveries &amp; invoices</h1><p className={styles.muted}>Physical arrival → acceptance → supplier invoice → payment.</p></div><div className={styles.actions}><Link className="btn btn-outline-secondary" href="/pharmacy/inventory">Inventory &amp; orders</Link><button className="btn btn-outline-secondary" disabled={deliveries.loading || setup.loading} onClick={refresh}>Refresh</button>{manager && <button className="btn btn-outline-secondary" onClick={() => setPolicyOpen(true)}>Receiving policy</button>}{stockAccess && <button className="btn btn-primary" onClick={() => setDialog({})}>Record delivery</button>}</div></header>
    <Message error={deliveries.error || setup.error}/>
    <section className={styles.card}><div className={layout.toolbar}><h2>Physical deliveries</h2><small className={styles.muted}>Latest 200 branch records. Quantities are base units.</small></div>
      {deliveries.loading ? <Empty>Loading deliveries...</Empty> : !rows.length ? <Empty>No physical deliveries recorded yet.</Empty> : <div className="table-responsive"><table className={styles.table}><thead><tr><th>Reference / date</th><th>Supplier / order</th><th>Delivered / accepted / held / returned</th><th>Status</th><th/></tr></thead><tbody>{rows.map(row => {
        const lines: ReceivingLine[] = row.details?.lines || [], sum = (field: keyof ReceivingLine) => lines.reduce((total, line) => total + Number(line[field] || 0), 0);
        return <tr key={row.id}><td className={layout.reference}><strong>{row.details.reference}</strong><small className="d-block">{dateLabel(row.created_at)}</small></td><td>{supplierName(row.details.supplierId)}<small className="d-block" title={row.details.orderId}>{row.details.orderId ? `Order: ${accountingReference(row.details.orderId, 'id', 'order')}` : 'Without order'}</small></td><td>{sum('quantityDelivered')} / {sum('acceptedQuantity')} / {Number(lines.reduce((total, line) => total + heldQuantity(line), 0).toFixed(3))} / {sum('returnedQuantity')}<small className="d-block">{lines.length} batch lines</small></td><td>{String(row.status).replaceAll('_', ' ')}</td><td>{stockAccess && <button className="btn btn-sm btn-outline-primary" onClick={() => setDialog(row)}>Review / accept / return</button>}</td></tr>;
      })}</tbody></table></div>}
    </section>
    {financeAccess && <SupplierInvoices deliveries={rows} suppliers={setup.data?.suppliers || []} canRecord={manager} onCompleted={refresh}/>}
    {dialog && <PharmacyReceivingModal initialDelivery={dialog.id ? dialog : undefined} onClose={() => setDialog(null)} onCompleted={refresh}/>}
    {policyOpen && <ReceivingPolicy policy={setup.data?.policy} onClose={() => setPolicyOpen(false)} onCompleted={refresh}/>}
  </main>;
}
function SupplierInvoices({ deliveries, suppliers, canRecord, onCompleted }: { deliveries: any[]; suppliers: any[]; canRecord: boolean; onCompleted: () => Promise<void> }) {
  const invoices = usePharmacyResource('pharmacy/receiving/invoices'), request = usePharmacyDocument('supplier-invoice');
  const [open, setOpen] = useState(false), [supplier, setSupplier] = useState(''), [reference, setReference] = useState(''), [invoiceDate, setInvoiceDate] = useState(''), [dueDate, setDueDate] = useState(''), [reason, setReason] = useState('');
  const [quantities, setQuantities] = useState<Record<string, string>>({}), [tax, setTax] = useState(''), [busy, setBusy] = useState(false), [error, setError] = useState(''), [notice, setNotice] = useState('');
  const eligible = deliveries.filter(delivery => delivery.details?.supplierId === supplier).flatMap(delivery => (delivery.details.lines || []).filter((line: ReceivingLine) => uninvoicedQuantity(line) > 0).map((line: ReceivingLine) => ({ deliveryId: delivery.id, deliveryReference: delivery.details.reference, line, key: `${delivery.id}:${line.id}` })));
  const selected = eligible.filter(row => Number(quantities[row.key]) > 0);
  const amount = (line: ReceivingLine, value: string) => { try { return invoiceAllocation(line, Number(value)); } catch { return null; } };
  const save = async (retry = false) => {
    if (busy || !canRecord) return;
    if (!retry && (!selected.length || selected.some(row => amount(row.line, quantities[row.key]) === null))) { setError('Choose exact accepted, uninvoiced line quantities.'); return; }
    setBusy(true); setError(''); setNotice('');
    try {
      const result = await request.execute('pharmacy/receiving/invoices', { supplierId: supplier, reference: reference.trim(), invoiceDate, dueDate: dueDate || undefined, reason: reason.trim(),
        lines: selected.map(row => ({ deliveryId: row.deliveryId, lineId: row.line.id, quantity: Number(quantities[row.key]), amount: invoiceAllocation(row.line, Number(quantities[row.key])) })),
        ...(Number(tax) > 0 ? { recoverableTax: { account: 'asset:input_tax', amount: Number(tax) } } : {}) });
      if (!result?.success) throw new Error(result?.error?.message || 'Unable to confirm invoice. Retry the original invoice.');
      setNotice(`Supplier invoice recorded. Payable bill: ${accountingReference(result.data.billId || result.data.details?.billId || result.data.id, 'id', 'bill')}. No supplier payment was made.`);
      setOpen(false); setQuantities({}); setTax(''); setSupplier(''); setReference(''); setInvoiceDate(''); setDueDate(''); setReason('');
      await Promise.all([invoices.refresh(), onCompleted()]);
    } catch (e) { setError(e instanceof Error ? e.message : 'Unable to record invoice.'); } finally { setBusy(false); }
  };
  return <section className={styles.card}><div className={layout.toolbar}><div><h2>Supplier invoices</h2><p className={styles.muted}>A manager allocates exact accepted quantities. Recording creates the linked payable, not a payment.</p></div><div className={styles.actions}><Link className="btn btn-outline-secondary" href="/pharmacy/accounting/payables">Supplier bills &amp; settlement</Link>{canRecord && <button className="btn btn-primary" disabled={busy || !!request.pending} onClick={() => { setOpen(true); setError(''); }}>Record supplier invoice</button>}</div></div>
    <Message error={error || invoices.error} notice={notice}/>
    {canRecord && request.pending && <div className="alert alert-warning">An invoice needs confirmation. Do not enter a replacement.<button className="btn btn-warning ms-2" disabled={busy} onClick={() => save(true)}>Retry original invoice</button></div>}
    {invoices.loading ? <Empty>Loading invoices...</Empty> : !invoices.data?.length ? <Empty>No supplier invoices recorded yet.</Empty> : <div className="table-responsive"><table className={styles.table}><thead><tr><th>Invoice / date</th><th>Supplier</th><th>Amount</th><th>Linked payable / allocations</th></tr></thead><tbody>{invoices.data.map((row: any) => {
      const detail = row.details || {}, billId = detail.billId || row.billId;
      return <tr key={row.id}>
        <td className={layout.reference}>{detail.reference || row.reference}<small className="d-block">{dateLabel(detail.invoiceDate || row.created_at)}</small>{detail.dueDate && <small className="d-block">Due: {dateLabel(detail.dueDate)}</small>}</td>
        <td>{suppliers.find(item => item.id === (detail.supplierId || row.supplier_id))?.name || detail.supplierName || accountingReference(detail.supplierId || row.supplier_id, 'id', 'supplier')}</td><td>{money(row.amount ?? detail.amount)}</td>
        <td><Link title={billId} href={`/pharmacy/accounting/payables${billId ? `?billId=${encodeURIComponent(billId)}` : ''}`}>{billId ? `View bill ${accountingReference(billId, 'id', 'bill')}` : 'View supplier bills'}</Link><details><summary>{detail.lines?.length || 0} exact line allocations</summary>{detail.lines?.map((line: any) => <small className="d-block" title={`${line.deliveryId} / ${line.lineId}`} key={`${line.deliveryId}:${line.lineId}`}>{accountingReference(line.deliveryId, 'id', 'delivery')} / {accountingReference(line.lineId, 'id', 'line')}: {line.quantity} units · {money(line.amount)}</small>)}</details></td>
      </tr>;
    })}</tbody></table></div>}
    {open && <Modal title="Record supplier invoice" size="wide" onClose={() => setOpen(false)} busy={busy}><Message error={error}/><p className={styles.muted}>Use the real invoice reference and date. Amounts come from accepted landed cost. Leave uninvoiced quantities for a later invoice; do not combine suppliers.</p>
      <form onSubmit={e => { e.preventDefault(); save(); }}><fieldset disabled={busy || !!request.pending} className="border-0 p-0"><div className={layout.grid}>
        <label className="form-label">Supplier<select className="form-select" required value={supplier} onChange={e => { setSupplier(e.target.value); setQuantities({}); }}><option value="">Choose supplier</option>{suppliers.map(row => <option value={row.id} key={row.id}>{row.name}</option>)}</select></label>
        <label className="form-label">Invoice reference<input className="form-control" required maxLength={120} value={reference} onChange={e => setReference(e.target.value)}/></label>
        <label className="form-label">Invoice date<input className="form-control" required type="date" value={invoiceDate} onChange={e => setInvoiceDate(e.target.value)}/></label>
        <label className="form-label">Due date (if shown)<input className="form-control" type="date" min={invoiceDate || undefined} value={dueDate} onChange={e => setDueDate(e.target.value)}/></label>
        <label className="form-label">Recoverable purchase tax (GHS, if applicable)<input className="form-control" type="number" min="0" step=".01" value={tax} onChange={e => setTax(e.target.value)}/><small>Requires a configured input-tax asset account. Nonrecoverable tax belongs in the delivery cost.</small></label>
        <label className={`${layout.wide} form-label`}>Invoice reason<input className="form-control" required maxLength={1000} value={reason} onChange={e => setReason(e.target.value)}/></label>
      </div>
      <div className="table-responsive"><table className={styles.table}><thead><tr><th>Delivery / medicine / batch</th><th>Accepted / already invoiced</th><th>Invoice quantity</th><th>Exact amount</th></tr></thead><tbody>{eligible.map(row => <tr key={row.key}><td>{row.deliveryReference} · {row.line.name}<small className="d-block">{row.line.batchNumber} / {row.line.expiryDate?.slice(0, 10)}</small></td><td>{row.line.acceptedQuantity} / {row.line.invoiceQuantity ?? row.line.invoicedQuantity ?? 0}</td><td><input aria-label={`Invoice quantity ${row.deliveryReference} ${row.line.name} ${row.line.batchNumber || row.line.id}`} className={`form-control ${layout.quantity}`} type="number" min="0" max={uninvoicedQuantity(row.line)} step=".001" value={quantities[row.key] || ''} onChange={e => setQuantities(current => ({ ...current, [row.key]: e.target.value }))}/></td><td>{Number(quantities[row.key]) > 0 ? money(amount(row.line, quantities[row.key])) : '—'}</td></tr>)}</tbody></table></div>
      {!eligible.length && <Empty>{supplier ? 'No uninvoiced accepted quantities for this supplier. Accept eligible goods first.' : 'Choose the supplier to see accepted delivery lines.'}</Empty>}
      <p className="text-end fw-bold">Invoice total: {money(selected.reduce((sum, row) => sum + (amount(row.line, quantities[row.key]) || 0), 0) + Number(tax || 0))}</p>
      <footer className={styles.footer}><button type="button" className="btn btn-outline-secondary" onClick={() => setOpen(false)}>Cancel</button><button className="btn btn-primary" disabled={!selected.length || busy}>Record linked supplier invoice</button></footer></fieldset></form>
    </Modal>}
  </section>;
}
function ReceivingPolicy({ policy, onClose, onCompleted }: { policy: any; onClose: () => void; onCompleted: () => Promise<void> }) {
  const [mode, setMode] = useState(policy?.mode || 'approval'), [tolerance, setTolerance] = useState(String(policy?.tolerancePercent ?? 0)), [increment, setIncrement] = useState(String(policy?.roundingIncrement ?? .01)), [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false), [error, setError] = useState(''), request = usePharmacyDocument('receiving-policy');
  const save = async () => {
    if (busy) return; setBusy(true); setError('');
    try {
      const result = await request.execute('pharmacy/receiving/policy', { mode, tolerancePercent: Number(tolerance), roundingIncrement: Number(increment), reason: reason.trim() });
      if (!result?.success) throw new Error(result?.error?.message || 'Unable to confirm policy.');
      await onCompleted(); onClose();
    } catch (e) { setError(e instanceof Error ? e.message : 'Unable to save policy.'); } finally { setBusy(false); }
  };
  return <Modal title="Receiving policy" onClose={onClose} busy={busy}><Message error={error}/><p className={styles.muted}>Controls acceptance of excess quantities, not recording their physical arrival. Saved deliveries retain their policy snapshot.</p>
    {request.pending && <div className="alert alert-warning">A policy change needs confirmation.<button className="btn btn-warning ms-2" disabled={busy} onClick={save}>Retry original policy</button></div>}
    <form onSubmit={e => { e.preventDefault(); save(); }}><fieldset disabled={busy || !!request.pending} className="border-0 p-0">
      <label className="form-label d-block">Excess acceptance<select className="form-select" value={mode} onChange={e => setMode(e.target.value)}><option value="approval">Manager approval required</option><option value="tolerance">Allow within tolerance; manager above tolerance</option><option value="prohibit">Prohibit excess acceptance</option></select></label>
      <label className="form-label d-block">Tolerance (%)<input className="form-control" type="number" min="0" max="100" step=".001" disabled={mode !== 'tolerance'} required value={tolerance} onChange={e => setTolerance(e.target.value)}/></label>
      <label className="form-label d-block">Selling-price rounding increment (GHS)<input className="form-control" type="number" min=".01" step=".01" required value={increment} onChange={e => setIncrement(e.target.value)}/></label>
      <label className="form-label d-block">Change reason<input className="form-control" required maxLength={1000} value={reason} onChange={e => setReason(e.target.value)}/></label>
      <footer className={styles.footer}><button type="button" className="btn btn-outline-secondary" onClick={onClose}>Cancel</button><button className="btn btn-primary">Save policy</button></footer>
    </fieldset></form>
  </Modal>;
}
