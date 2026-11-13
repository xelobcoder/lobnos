'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import {useSearchParams} from 'next/navigation';
import { accountingReference } from '../../../../lib/pharmacyAccounting';
import { usePharmacyDocument } from '../../components/PharmacyPaymentFields';
import { dateLabel, Empty, Message, Modal, money, styles, usePharmacyAccess, usePharmacyResource } from '../../components/PharmacyWorkspace';
import { heldQuantity, invoiceAllocation, uninvoicedQuantity, type ReceivingLine } from '../../../../lib/pharmacyReceiving';
import layout from './page.module.css';
import purchasing from '../../components/PharmacyPurchasing.module.css';

export type ReceivingView = 'deliveries' | 'uninvoiced' | 'invoices';
const destinations = [
  {view:'deliveries',href:'/pharmacy/inventory/deliveries',label:'Physical deliveries'},
  {view:'uninvoiced',href:'/pharmacy/inventory/uninvoiced',label:'Received but not invoiced'},
  {view:'invoices',href:'/pharmacy/inventory/supplier-invoices',label:'Supplier invoices'},
] as const;
export function ReceivingNavigation({view}:{view:ReceivingView}) {
  const access=usePharmacyAccess();
  return <nav className={layout.navigation} aria-label="Receiving and supplier invoices">{destinations.filter(item=>item.view==='deliveries'?access.stock:access.finance).map(item=><Link key={item.view} href={item.href} aria-current={item.view===view?'page':undefined}>{item.label}</Link>)}</nav>;
}
export default function PharmacyDeliveriesPage({view='deliveries'}:{view?:ReceivingView}) {
  const access=usePharmacyAccess();
  const title=destinations.find(item=>item.view===view)!.label;
  if (view==='deliveries'?!access.stock:!access.finance) return <main className={styles.page}><h1>{title}</h1><Empty>{view==='deliveries'?'Pharmacy stock access is required.':'Pharmacy finance access is required.'}</Empty><ReceivingNavigation view={view}/></main>;
  return <ReceivingRegister view={view} title={title} stockAccess={access.stock} manager={access.manager}/>;
}
function ReceivingRegister({view,title,stockAccess,manager}:{view:ReceivingView;title:string;stockAccess:boolean;manager:boolean}) {
  const deliveries=usePharmacyResource(view==='uninvoiced'||view==='invoices'?'pharmacy/receiving/uninvoiced':stockAccess?'pharmacy/receiving/deliveries':'pharmacy/receiving/invoices');
  const setup=usePharmacyResource(stockAccess?'pharmacy/receiving/setup':'pharmacy/suppliers');
  const [search,setSearch]=useState(''),[page,setPage]=useState(1);
  const params=useSearchParams();
  const refresh=async()=>{await Promise.all([deliveries.refresh(),setup.refresh()]);};
  const suppliers=view!=='deliveries'?deliveries.data?.suppliers||[]:stockAccess?setup.data?.suppliers||[]:setup.data||[];
  const rows:any[]=view!=='deliveries'?deliveries.data?.deliveries||[]:stockAccess?deliveries.data||[]:[];
  const supplierName=(id:string)=>suppliers.find((row:any)=>row.id===id)?.name||accountingReference(id,'id','supplier');
  const matches=(value:string)=>value.toLowerCase().includes(search.trim().toLowerCase());
  const uninvoiced=rows.flatMap(delivery=>(delivery.details?.lines||[]).filter((line:ReceivingLine)=>uninvoicedQuantity(line)>0).map((line:ReceivingLine)=>({delivery,line,
    value:Math.max(0,Number(line.acceptedValue||0)-Number(line.invoiceAmount||0)),
    remaining:uninvoicedQuantity(line),
  }))).filter(row=>matches(`${supplierName(row.delivery.details.supplierId)} ${row.delivery.details.reference} ${row.line.name} ${row.line.batchNumber}`));
  const filtered=rows.filter(row=>matches(`${row.details.reference} ${supplierName(row.details.supplierId)} ${row.status}`));
  const total=view==='uninvoiced'?uninvoiced.length:filtered.length, totalPages=Math.max(1,Math.ceil(total/20));
  useEffect(()=>{setPage(value=>Math.min(value,totalPages));},[totalPages]);
  return <main className={`${styles.page} ${purchasing.theme}`}>
    <header className={styles.header}><div><h1>{title}</h1><p className={styles.muted}>{view==='deliveries'?'Track what arrived, review held goods and accept eligible medicines.':view==='uninvoiced'?'Find accepted goods that still need a supplier invoice.':'Review supplier invoices, keep original copies and follow their linked bills.'}</p></div><div className={styles.actions}><button className="btn btn-outline-secondary" disabled={deliveries.loading||setup.loading} onClick={refresh}>Refresh</button>{view==='deliveries'&&<Link className="btn btn-primary" href="/pharmacy/inventory/receive">Receive stock</Link>}</div></header>
    <ReceivingNavigation view={view}/><Message error={deliveries.error||setup.error}/>
    {view==='invoices'?<SupplierInvoices deliveries={rows} suppliers={suppliers} canRecord={manager} onCompleted={refresh} initialSupplierId={params.get('supplierId')||''} initialOpen={params.get('action')==='record'}/>:
    <section className={styles.card}>
      <div className={layout.toolbar}><label className={layout.search}>Find {view==='deliveries'?'a delivery':'uninvoiced goods'}<input className="form-control" type="search" placeholder={view==='deliveries'?'Reference, supplier or status':'Supplier, medicine, batch or delivery'} value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}}/></label>{view==='uninvoiced'?<strong>{money(uninvoiced.reduce((sum,row)=>sum+row.value,0))} awaiting invoice</strong>:<small className={styles.muted}>Latest 200 branch deliveries</small>}</div>
      {deliveries.loading?<Empty>Loading records…</Empty>:!total?<Empty>{search?'No records match your search.':view==='uninvoiced'?'All accepted delivery quantities have been invoiced.':'No physical deliveries recorded yet.'}</Empty>:<div className="table-responsive"><table className={styles.table}>
        <thead>{view==='uninvoiced'?<tr><th>Supplier / delivery</th><th>Medicine / batch</th><th>Quantity to invoice</th><th>Amount to invoice</th><th>Action</th></tr>:<tr><th>Delivery / date</th><th>Supplier</th><th>Delivered</th><th>Accepted</th><th>Held</th><th>Returned</th><th>Status</th><th>Action</th></tr>}</thead>
        <tbody>{view==='uninvoiced'?uninvoiced.slice((page-1)*20,page*20).map(({delivery,line,remaining,value})=><tr key={`${delivery.id}:${line.id}`}><td>{supplierName(delivery.details.supplierId)}<small className="d-block">{delivery.details.reference} · {dateLabel(delivery.created_at)}</small></td><td>{line.name}<small className="d-block">{line.batchNumber}</small></td><td>{remaining.toLocaleString()}</td><td>{money(value)}</td><td>{manager?<Link className="btn btn-sm btn-outline-primary" href={`/pharmacy/inventory/supplier-invoices?action=record&supplierId=${encodeURIComponent(delivery.details.supplierId)}`}>Record invoice</Link>:<Link href="/pharmacy/inventory/supplier-invoices">View supplier invoices</Link>}</td></tr>):filtered.slice((page-1)*20,page*20).map(row=>{
          const lines:ReceivingLine[]=row.details?.lines||[],sum=(field:keyof ReceivingLine)=>lines.reduce((total,line)=>total+Number(line[field]||0),0);
          return <tr key={row.id}><td className={layout.reference}><strong>{row.details.reference}</strong><small className="d-block">{dateLabel(row.created_at)}</small></td><td>{supplierName(row.details.supplierId)}{row.details.orderId&&<small className="d-block">{accountingReference(row.details.orderId,'id','order')}</small>}</td><td>{sum('quantityDelivered')}</td><td>{sum('acceptedQuantity')}</td><td>{Number(lines.reduce((total,line)=>total+heldQuantity(line),0).toFixed(3))}</td><td>{sum('returnedQuantity')}</td><td>{String(row.status).replaceAll('_',' ')}</td><td><Link className="btn btn-sm btn-outline-primary" href={`/pharmacy/inventory/receive?deliveryId=${encodeURIComponent(row.id)}`}>View delivery</Link></td></tr>;
        })}</tbody>
      </table></div>}
      {total>0&&<div className={layout.toolbar}><span>{total} {view==='uninvoiced'?'lines':'deliveries'} · Page {page} of {totalPages}</span><div className={styles.actions}><button className="btn btn-sm btn-outline-secondary" disabled={deliveries.loading||page<=1} onClick={()=>setPage(value=>value-1)}>Previous</button><button className="btn btn-sm btn-outline-secondary" disabled={deliveries.loading||page>=totalPages} onClick={()=>setPage(value=>value+1)}>Next</button></div></div>}
    </section>}
  </main>;
}
export function SupplierInvoices({ deliveries, suppliers, canRecord, onCompleted, supplierId = '', orderInvoices, initialSupplierId = '', initialOpen = false }: { deliveries: any[]; suppliers: any[]; canRecord: boolean; onCompleted: () => Promise<void>; supplierId?: string; orderInvoices?: any[]; initialSupplierId?:string; initialOpen?:boolean }) {
  const invoices = usePharmacyResource('pharmacy/receiving/invoices'), request = usePharmacyDocument('supplier-invoice');
  const [open, setOpen] = useState(initialOpen), [supplier, setSupplier] = useState(supplierId||initialSupplierId), [reference, setReference] = useState(''), [invoiceDate, setInvoiceDate] = useState(''), [dueDate, setDueDate] = useState(''), [reason, setReason] = useState('Accepted delivery invoice');
  const [quantities, setQuantities] = useState<Record<string, string>>({}), [tax, setTax] = useState(''), [busy, setBusy] = useState(false), [error, setError] = useState(''), [notice, setNotice] = useState('');
  const eligible = deliveries.filter(delivery => delivery.details?.supplierId === supplier).flatMap(delivery => (delivery.details.lines || []).filter((line: ReceivingLine) => uninvoicedQuantity(line) > 0).map((line: ReceivingLine) => ({ deliveryId: delivery.id, deliveryReference: delivery.details.reference, line, key: `${delivery.id}:${line.id}` })));
  const selected = eligible.filter(row => Number(quantities[row.key]) > 0);
  const [search, setSearch] = useState(''), [invoicePage, setInvoicePage] = useState(1);
  const visibleInvoices: any[] = (orderInvoices ?? invoices.data ?? []).filter((row:any) => {
    const detail=row.details||{}, name=suppliers.find(item=>item.id===(detail.supplierId||row.supplier_id))?.name||detail.supplierName||'';
    return `${detail.reference||row.reference||''} ${name}`.toLowerCase().includes(search.trim().toLowerCase());
  });
  const invoicePages=Math.max(1,Math.ceil(visibleInvoices.length/20));
  useEffect(()=>{setInvoicePage(value=>Math.min(value,invoicePages));},[invoicePages]);
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
      setNotice(`Supplier invoice recorded. Linked bill ${accountingReference(result.data.billId || result.data.details?.billId || result.data.id, 'id', 'bill')}.`);
      setOpen(false); setQuantities({}); setTax(''); setSupplier(supplierId); setReference(''); setInvoiceDate(''); setDueDate(''); setReason('Accepted delivery invoice');
      await Promise.all([invoices.refresh(), onCompleted()]);
    } catch (e) { setError(e instanceof Error ? e.message : 'Unable to record invoice.'); } finally { setBusy(false); }
  };
  return <section className={styles.card}><div className={layout.toolbar}><div><h2>Supplier invoices</h2><p className={styles.muted}>Match accepted delivery quantities to the supplier’s invoice. Use the linked bill to pay the supplier.</p></div><div className={styles.actions}><Link className="btn btn-outline-secondary" href="/pharmacy/accounting/payables">Supplier bills &amp; settlement</Link>{canRecord && <button className="btn btn-primary" disabled={busy || !!request.pending} onClick={() => { setOpen(true); setError(''); }}>Record supplier invoice</button>}</div></div>
    <Message error={error || invoices.error} notice={notice}/>
    {canRecord && request.pending && <div className="alert alert-warning">An invoice needs confirmation. Do not enter a replacement.<button className="btn btn-warning ms-2" disabled={busy} onClick={() => save(true)}>Retry original invoice</button></div>}
    <div className={layout.toolbar}><label className={layout.search}>Find an invoice<input className="form-control" type="search" placeholder="Invoice reference or supplier" value={search} onChange={e=>{setSearch(e.target.value);setInvoicePage(1);}}/></label>{orderInvoices===undefined&&<small className={styles.muted}>Latest 200 branch invoices</small>}</div>
    {orderInvoices === undefined && invoices.loading ? <Empty>Loading invoices...</Empty> : !visibleInvoices.length ? <Empty>{search?'No invoices match your search.':'No supplier invoices recorded yet.'}</Empty> : <div className="table-responsive"><table className={styles.table}><thead><tr><th>Invoice / date</th><th>Supplier</th><th>Amount</th><th>Linked bill</th><th>Action</th></tr></thead><tbody>{visibleInvoices.slice((invoicePage-1)*20,invoicePage*20).map((row: any) => {
      const detail = row.details || {}, billId = detail.billId || row.billId;
      return <tr key={row.id}>
        <td className={layout.reference}>{detail.reference || row.reference}<small className="d-block">{dateLabel(detail.invoiceDate || row.created_at)}</small>{detail.dueDate && <small className="d-block">Due: {dateLabel(detail.dueDate)}</small>}</td>
        <td>{suppliers.find(item => item.id === (detail.supplierId || row.supplier_id))?.name || detail.supplierName || accountingReference(detail.supplierId || row.supplier_id, 'id', 'supplier')}</td><td>{money(row.amount ?? detail.amount)}</td>
        <td><Link title={billId} href={supplierId ? '#payments' : `/pharmacy/accounting/payables${billId ? `?billId=${encodeURIComponent(billId)}` : ''}`}>{supplierId ? 'Pay supplier / payment history' : billId ? `View bill ${accountingReference(billId, 'id', 'bill')}` : 'View supplier bills'}</Link><details><summary>{detail.lines?.length || 0} exact line allocations</summary>{detail.lines?.map((line: any) => <small className="d-block" title={`${line.deliveryId} / ${line.lineId}`} key={`${line.deliveryId}:${line.lineId}`}>{accountingReference(line.deliveryId, 'id', 'delivery')} / {accountingReference(line.lineId, 'id', 'line')}: {line.quantity} units · {money(line.amount)}</small>)}</details></td>
        <td><Link className="btn btn-sm btn-outline-primary" href={`/pharmacy/inventory/supplier-invoices/${encodeURIComponent(row.id)}`}>View invoice</Link></td>
      </tr>;
    })}</tbody></table></div>}
    {visibleInvoices.length>0&&<div className={layout.toolbar}><span>{visibleInvoices.length} invoices · Page {invoicePage} of {invoicePages}</span><div className={styles.actions}><button className="btn btn-sm btn-outline-secondary" disabled={invoicePage<=1||invoices.loading} onClick={()=>setInvoicePage(value=>value-1)}>Previous</button><button className="btn btn-sm btn-outline-secondary" disabled={invoicePage>=invoicePages||invoices.loading} onClick={()=>setInvoicePage(value=>value+1)}>Next</button></div></div>}
    {open && <Modal title="Record supplier invoice" size="wide" onClose={() => setOpen(false)} busy={busy}><Message error={error}/><p className={styles.muted}>Use the real invoice reference and date. Amounts come from accepted landed cost. Leave uninvoiced quantities for a later invoice; do not combine suppliers.</p>
      <form onSubmit={e => { e.preventDefault(); save(); }}><fieldset disabled={busy || !!request.pending} className="border-0 p-0"><div className={layout.grid}>
        <label className="form-label">Supplier<select className="form-select" required disabled={!!supplierId} value={supplier} onChange={e => { setSupplier(e.target.value); setQuantities({}); }}><option value="">Choose supplier</option>{suppliers.map(row => <option value={row.id} key={row.id}>{row.name}</option>)}</select></label>
        <label className="form-label">Invoice reference<input className="form-control" required maxLength={120} value={reference} onChange={e => setReference(e.target.value)}/></label>
        <label className="form-label">Invoice date<input className="form-control" required type="date" value={invoiceDate} onChange={e => setInvoiceDate(e.target.value)}/></label>
        <label className="form-label">Due date (if shown)<input className="form-control" type="date" min={invoiceDate || undefined} value={dueDate} onChange={e => setDueDate(e.target.value)}/></label>
        <label className="form-label">Recoverable purchase tax (GHS, if applicable)<input className="form-control" type="number" min="0" step=".01" value={tax} onChange={e => setTax(e.target.value)}/><small>Requires a configured input-tax asset account. Nonrecoverable tax belongs in the delivery cost.</small></label>
        <label className={`${layout.wide} form-label`}>Invoice note (optional)<input className="form-control" maxLength={500} value={reason} onChange={e => setReason(e.target.value)}/></label>
      </div>
      <div className="table-responsive"><table className={styles.table}><thead><tr><th>Delivery / medicine / batch</th><th>Accepted / already invoiced</th><th>Invoice quantity</th><th>Exact amount</th></tr></thead><tbody>{eligible.map(row => <tr key={row.key}><td>{row.deliveryReference} · {row.line.name}<small className="d-block">{row.line.batchNumber} / {row.line.expiryDate?.slice(0, 10)}</small></td><td>{row.line.acceptedQuantity} / {row.line.invoiceQuantity ?? row.line.invoicedQuantity ?? 0}</td><td><input aria-label={`Invoice quantity ${row.deliveryReference} ${row.line.name} ${row.line.batchNumber || row.line.id}`} className={`form-control ${layout.quantity}`} type="number" min="0" max={uninvoicedQuantity(row.line)} step=".001" value={quantities[row.key] || ''} onChange={e => setQuantities(current => ({ ...current, [row.key]: e.target.value }))}/></td><td>{Number(quantities[row.key]) > 0 ? money(amount(row.line, quantities[row.key])) : '—'}</td></tr>)}</tbody></table></div>
      {!eligible.length && <Empty>{supplier ? 'No uninvoiced accepted quantities for this supplier. Accept eligible goods first.' : 'Choose the supplier to see accepted delivery lines.'}</Empty>}
      <p className="text-end fw-bold">Invoice total: {money(selected.reduce((sum, row) => sum + (amount(row.line, quantities[row.key]) || 0), 0) + Number(tax || 0))}</p>
      <footer className={styles.footer}><button type="button" className="btn btn-outline-secondary" onClick={() => setOpen(false)}>Cancel</button><button className="btn btn-primary" disabled={!selected.length || busy}>Record linked supplier invoice</button></footer></fieldset></form>
    </Modal>}
  </section>;
}
