'use client';
import Link from 'next/link';
import {useEffect, useState} from 'react';
import {createPortal} from 'react-dom';
import {useParams} from 'next/navigation';
import {customFetch} from '../../../../../components/Auth/customFetch';
import {useApplication} from '../../../../../components/Auth/useApplicationContext';
import {usePharmacyDocument} from '../../../components/PharmacyPaymentFields';
import {dateLabel, Empty, Message, money, styles, usePharmacyAccess, usePharmacyResource} from '../../../components/PharmacyWorkspace';
import {ReceivingNavigation} from '../../deliveries/DeliveriesWorkspace';
import ui from './invoice.module.css';
import purchasing from '../../../components/PharmacyPurchasing.module.css';

export default function SupplierInvoicePage() {
  const access = usePharmacyAccess();
  if (!access.finance) return <main className={styles.page}><h1>Supplier invoice</h1><Empty>Pharmacy finance access is required.</Empty></main>;
  return <InvoiceDetail canAttach={access.manager}/>;
}
function InvoiceDetail({canAttach}: {canAttach: boolean}) {
  const {invoiceId} = useParams<{invoiceId: string}>();
  const app = useApplication() as any;
  const [mounted, setMounted] = useState(false);
  useEffect(() => {setMounted(true);}, []);
  const resource = usePharmacyResource(`pharmacy/receiving/invoices/${encodeURIComponent(invoiceId)}`);
  const request = usePharmacyDocument('supplier-invoice-copy:' + invoiceId);
  const [busy, setBusy] = useState(false), [error, setError] = useState(''), [notice, setNotice] = useState('');
  const invoice = resource.data, detail = invoice?.details || {}, supplier = invoice?.supplier || {};
  const company = typeof app?.company === 'string' ? {name:app.company} : app?.company || {};
  const tax = Number(detail.recoverableTax?.amount || 0);
  const subtotal = detail.inventoryAmount ?? Number(invoice?.amount || 0) - tax;
  const downloadPdf = async () => {
    setError('');
    try {
      const [{buildSupplierInvoicePdf}, {loadCompanyBranding}] = await Promise.all([
        import('../../../../../lib/pharmacySupplierInvoicePdf'), import('../../../../../components/reports/reportPdf'),
      ]);
      const branding = await loadCompanyBranding();
      const profile = Object.fromEntries(Object.entries(branding.company).filter(([, value]) => value != null && value !== ''));
      buildSupplierInvoicePdf(invoice, {...company, ...profile}, branding.logo).save(`${String(detail.reference || invoice.id).replace(/[^A-Za-z0-9_-]/g, '_')}.pdf`);
    } catch (e) {setError(e instanceof Error ? e.message : 'Unable to generate supplier invoice PDF.');}
  };
  const attach = async (payload: Record<string, unknown>) => {
    if (busy) return;
    setBusy(true); setError(''); setNotice('');
    try {
      const response = await request.execute(`pharmacy/receiving/invoices/${encodeURIComponent(invoiceId)}/copies`, payload);
      if (!response?.success) throw new Error(response?.error?.message || 'Unable to confirm document upload.');
      setNotice('Supplier document copy saved.'); await resource.refresh();
    } catch (e) {setError(e instanceof Error ? e.message : 'Unable to save document copy.');}
    finally {setBusy(false);}
  };
  const upload = async (file: File) => {
    if (file.size > 1024 * 1024) {setError('Choose a PDF, PNG or JPEG up to 1 MB.'); return;}
    try {
      const content = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result).split(',')[1]);
        reader.onerror = () => reject(new Error('Unable to read this file.'));
        reader.readAsDataURL(file);
      });
      await attach({filename:file.name, mimeType:file.type, contentBase64:content});
    } catch (e) {setError(e instanceof Error ? e.message : 'Unable to read this file.');}
  };
  const download = async (file: {id: string}) => {
    setError('');
    try {
      const response = await customFetch(`pharmacy/receiving/invoices/${encodeURIComponent(invoiceId)}/copies/${encodeURIComponent(file.id)}`);
      if (!response?.success) throw new Error(response?.error?.message || 'Unable to download document copy.');
      const bytes = Uint8Array.from(atob(response.data.content), char => char.charCodeAt(0));
      const url = URL.createObjectURL(new Blob([bytes], {type:response.data.mimeType}));
      const link = document.createElement('a'); link.href=url; link.download=response.data.filename; link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (e) {setError(e instanceof Error ? e.message : 'Unable to download document copy.');}
  };
  const paper = invoice ? (
    <article className={ui.paper} aria-label="Supplier invoice recorded copy">
        <header className={ui.invoiceHeader}><div><h2>{supplier.name || detail.supplierName}</h2>{supplier.address && <p>{supplier.address}</p>}{supplier.phone && <p>{supplier.phone}</p>}{supplier.email && <p>{supplier.email}</p>}</div><div><h2>SUPPLIER INVOICE</h2><p className={ui.reference}>{detail.reference}</p><small>Recorded copy</small></div></header>
        <div className={ui.parties}><section><h3>Bill to</h3><strong>{company.name || 'Pharmacy'}</strong>{company.address && <p>{company.address}</p>}{company.phonenumber && <p>{company.phonenumber}</p>}</section><dl><div><dt>Invoice date</dt><dd>{dateLabel(detail.invoiceDate || invoice.created_at)}</dd></div><div><dt>Due date</dt><dd>{detail.dueDate ? dateLabel(detail.dueDate) : 'Not recorded'}</dd></div><div><dt>Currency</dt><dd>GHS</dd></div></dl></div>
        <div className={ui.tableWrap}><table><thead><tr><th>Medicine / batch</th><th>Quantity</th><th>Unit amount (GHS)</th><th>Amount (GHS)</th></tr></thead><tbody>{(detail.lines || []).map((line:any)=><tr key={`${line.deliveryId}:${line.lineId}`}><td><strong>{line.name}</strong>{line.sku && <small>{line.sku}</small>}{line.batchNumber && <small>Batch {line.batchNumber}{line.expiryDate ? ` · Expiry ${dateLabel(line.expiryDate)}` : ''}</small>}<small>Delivery {line.deliveryReference}</small></td><td>{Number(line.quantity).toLocaleString()}</td><td>{Number(line.quantity) > 0 ? (Number(line.amount)/Number(line.quantity)).toLocaleString('en-GH',{minimumFractionDigits:2, maximumFractionDigits:6}) : '—'}</td><td>{Number(line.amount).toLocaleString('en-GH',{minimumFractionDigits:2,maximumFractionDigits:2})}</td></tr>)}</tbody></table></div>
        {!detail.lines?.length && <p>Line allocations were not recorded for this invoice.</p>}
        <dl className={ui.totals}><div><dt>Subtotal</dt><dd>{money(subtotal)}</dd></div>{tax > 0 && <div><dt>Recoverable purchase tax</dt><dd>{money(tax)}</dd></div>}<div className={ui.grandTotal}><dt>Invoice total</dt><dd>{money(invoice.amount ?? detail.amount)}</dd></div></dl>
        {detail.reason && <section className={ui.note}><h3>Invoice note</h3><p>{detail.reason}</p></section>}
        <footer className={ui.documentFooter}>Recorded from matched supplier delivery quantities.<span>Record {invoice.id}</span></footer>
      </article>
  ) : null;
  return <main className={`${styles.page} ${purchasing.theme} ${ui.page}`}>
    <div className={ui.controls}>
      <header className={styles.header}><div><Link href="/pharmacy/inventory/supplier-invoices">← Supplier invoices</Link><h1>{detail.reference || 'Supplier invoice'}</h1></div><div className={styles.actions}><button className="btn btn-outline-secondary" disabled={resource.loading} onClick={resource.refresh}>Refresh</button><button className="btn btn-primary" disabled={!invoice || resource.loading} onClick={downloadPdf}>Download / print PDF</button>{detail.billId && <Link className="btn btn-outline-primary" href={`/pharmacy/accounting/payables?billId=${encodeURIComponent(detail.billId)}`}>View bill & payments</Link>}</div></header>
      <ReceivingNavigation view="invoices"/><Message error={error || resource.error} notice={notice}/>
    </div>
    {resource.loading ? <Empty>Loading supplier invoice…</Empty> : !invoice ? <Empty>Supplier invoice unavailable. <button className="btn btn-outline-secondary" onClick={resource.refresh}>Retry</button></Empty> : <>
      {paper}
      {mounted && createPortal(<div className={ui.printRoot}>{paper}</div>, document.body)}
      <section className={`${styles.card} ${ui.controls}`} aria-labelledby="original-copy-heading"><h2 id="original-copy-heading">Original supplier documents</h2><p>Keep the supplier’s PDF or a scan or photo of the paper invoice with this record.</p>
        {request.pending && <div className="alert alert-warning">A document upload needs confirmation. <button className="btn btn-warning" disabled={busy} onClick={()=>attach({})}>Retry original upload</button></div>}
        {canAttach && <label className="form-label d-block">Attach original copy (PDF, PNG or JPEG, up to 1 MB)<input className="form-control" type="file" accept="application/pdf,image/png,image/jpeg" disabled={busy || !!request.pending} onChange={event=>{const file=event.target.files?.[0];event.target.value='';if(file)void upload(file);}}/></label>}
        {invoice.files?.length ? <ul className={ui.files}>{invoice.files.map((file:any)=><li key={file.id}><button className="btn btn-link p-0" onClick={()=>download(file)}>{file.filename}</button><small>{Math.ceil(Number(file.byte_length)/1024)} KB · Saved {dateLabel(file.created_at)}</small></li>)}</ul> : <p className={styles.muted}>No original document copies attached.</p>}
      </section>
    </>}
  </main>;
}
