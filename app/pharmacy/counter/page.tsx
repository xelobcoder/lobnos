'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { customFetch } from '../../../components/Auth/customFetch';
import { usePharmacyAccess, styles, money, Message, Empty } from '../components/PharmacyWorkspace';
import PharmacyPaymentFields, { usePharmacyPayment, usePharmacyDocument } from '../components/PharmacyPaymentFields';
import { printPharmacyReceipt } from '../../../lib/pharmacy/receipt';
import { counterInvoiceReference } from '../../../lib/pharmacy/counterInvoice';
export default function PharmacyCounterPage() {
    const access = usePharmacyAccess(), payment = usePharmacyPayment('counter'), operation = usePharmacyDocument('counter-action');
    const [code, setCode] = useState(''), [invoice, setInvoice] = useState<any>(null), [error, setError] = useState(''), [notice, setNotice] = useState(''), [busy, setBusy] = useState(false), [method, setMethod] = useState('cash'), [reason, setReason] = useState('');
    const lock = useRef(false);
    const [review, setReview] = useState<any>(null);
    async function reviewBasket() {
        if (lock.current || operation.pending || !invoice) return;
        lock.current = true; setBusy(true); setError('');
        try {
            const r = await customFetch(`pharmacy/counter/invoices/${invoice.id}/review`);
            if (!r?.success) throw Error(r?.error?.message || 'Unable to review this invoice');
            setReview(r.data);
        } catch (e) { setError(e instanceof Error ? e.message : 'Unable to review this invoice'); }
        finally { lock.current = false; setBusy(false); }
    }
    const role = String(access.app?.user?.role || '').toLowerCase().replace(/[\s_-]/g, '');
    const canPay = access.manager || ['pharmacycashier', 'pharmacyaccountant'].includes(role), canCollect = access.manager || ['pharmacist', 'pharmacydispensaryofficer'].includes(role);
    async function lookup(value = code) { let parsed: string; try { parsed = counterInvoiceReference(value); } catch (error) {
        setError(error instanceof Error ? error.message : 'Enter a counter code or full invoice number.');
        return;
    } if (lock.current)
        return; lock.current = true; setBusy(true); setError(''); setInvoice(null); try {
        const r = await customFetch('pharmacy/counter/lookup/' + encodeURIComponent(parsed));
        if (!r?.success)
            throw Error(r?.error?.message || 'Invoice not found');
        setCode(parsed);
        setInvoice(r.data);
        setReview(null);
        payment.setAmount('');
        payment.setReference('');
        if (r.data.status === 'unpaid' && canPay)
            requestAnimationFrame(() => document.querySelector<HTMLInputElement>('input[aria-label="Amount received (GHS)"]')?.focus());
    }
    catch (e) {
        setError(e instanceof Error ? e.message : 'Unable to find invoice');
    }
    finally {
        lock.current = false;
        setBusy(false);
    } }
    useEffect(() => { const value = new URLSearchParams(window.location.search).get('code'); if (value) {
        setCode(value);
        lookup(value);
    } }, []);
    async function action(kind: 'pay' | 'collect' | 'cancel') { if (lock.current || (!invoice && !operation.pending))
        return; if (kind === 'collect' && !window.confirm('Confirm the listed medicines have been handed to this customer?'))
        return; lock.current = true; setBusy(true); setError(''); setNotice(''); try {
        const r = await operation.execute(invoice ? `pharmacy/counter/invoices/${invoice.id}/${kind}` : '', kind === 'pay' ? { paymentMethod: method, amountTendered: Number(payment.amount), paymentReference: payment.reference.trim() } : kind === 'cancel' ? { reason } : {});
        if (!r?.success)
            throw Error(r?.error?.message || 'Operation needs confirmation. Retry the original request.');
        const currentCode = invoice?.code || r.data.counterCode || r.data.code;
        if (currentCode) {
            const latest = await customFetch('pharmacy/counter/lookup/' + currentCode);
            if (latest?.success) {
                setInvoice(latest.data);
                setCode(currentCode);
            }
        }
        setNotice(kind === 'pay' ? 'Payment recorded. Print the receipt for medication collection.' : kind === 'collect' ? 'Medication collection recorded. This invoice cannot be collected again.' : 'Unpaid invoice cancelled.');
        payment.setAmount('');
        payment.setReference('');
        await payment.refresh();
    }
    catch (e) {
        setError(e instanceof Error ? e.message : 'Unable to confirm this operation');
    }
    finally {
        lock.current = false;
        setBusy(false);
    } }
    async function print(unpaid = false) { if (!invoice)
        return; setError(''); try {
        const app = access.app as any;
        let receipt: any;
        if (unpaid)
            receipt = { unpaid: true, receiptNumber: invoice.invoice_number, company: invoice.company, patientName: invoice.patientName, counterCode: invoice.code, completedAt: invoice.created_at, total: invoice.total, customerName: invoice.details.customerName, attendantName: invoice.attendant_name, lines: invoice.details.lines };
        else {
            const r = await customFetch('pharmacy/sales/' + invoice.sale_id);
            if (!r?.success)
                throw Error(r?.error?.message || 'Receipt unavailable');
            receipt = { ...r.data, reprint: true, completedAt: r.data.completedAt, counterCode: invoice.code, attendantName: invoice.attendant_name };
        }
        await printPharmacyReceipt(receipt, { name: typeof app?.company === 'string' ? app.company : app?.company?.name || 'PHARMACY', printedBy: app?.user?.username });
    }
    catch (e) {
        setError(e instanceof Error ? e.message : 'Unable to print receipt');
    } }
    const locked = busy || !!operation.pending;
    return <main className={styles.page}><header className={styles.header}><div><h1>Counter invoices</h1><p>Find the customer’s invoice using four characters. Collect payment, print the receipt, then confirm medication handover.</p></div><div className={styles.actions}><Link className="btn btn-outline-secondary" href="/pharmacy/sell">Attendant / POS</Link><Link className="btn btn-outline-secondary" href="/pharmacy/cashier">Cashier shift</Link></div></header><Message error={error} notice={notice}/><section className={styles.card}><form onSubmit={e => { e.preventDefault(); lookup(); }} className={styles.toolbar}><label className="form-label mb-0">Counter code or invoice barcode<input className="form-control form-control-lg" autoFocus aria-label="Counter code" placeholder="e.g. DC20" value={code} maxLength={80} disabled={locked} onChange={e => setCode(e.target.value.toUpperCase())}/></label><button className="btn btn-primary" disabled={locked || !code.trim()}>{busy ? 'Loading…' : 'Find invoice'}</button></form></section>{operation.pending && <div className="alert alert-warning">An operation needs confirmation. Keep the original request; do not collect payment again.<button className="btn btn-warning ms-2" disabled={busy} onClick={() => action(operation.pending?.endpoint.endsWith('/pay') ? 'pay' : operation.pending?.endpoint.endsWith('/collect') ? 'collect' : 'cancel')}>Retry original operation</button></div>}
 {!invoice ? <Empty>Enter the short code written by the attendant, or scan the receipt barcode.</Empty> : <><section className={styles.card}><div className={styles.toolbar}><div><span className="badge text-bg-secondary">{invoice.status.replace('_', ' ').toUpperCase()}</span><h2 style={{ fontSize: 32, letterSpacing: 4 }}>{invoice.code}</h2><p>{invoice.invoice_number}</p></div><div><strong className="fs-3">{money(invoice.total)}</strong><p>{invoice.details.customerName}</p><small>Attendant: {invoice.attendant_name}</small></div></div>{invoice.saleStatus && invoice.saleStatus !== 'completed' && <div className="alert alert-danger">Sale {invoice.saleStatus}. Do not release medicines.</div>}<div className="table-responsive"><table className={styles.table}><thead><tr><th>Medicine</th><th>Quantity</th><th>Rate</th><th>Total</th></tr></thead><tbody>{invoice.details.lines.map((line: any) => <tr key={line.inventoryItemId}><td>{line.name}<small className="d-block text-muted">{line.priceType} pricing</small></td><td>{line.quantity}</td><td>{money(line.unitPrice)}</td><td>{money(line.lineTotal)}</td></tr>)}</tbody></table></div><div className={styles.actions}>{invoice.status === 'unpaid' && <button type="button" className="btn btn-outline-secondary" disabled={locked} onClick={() => print(true)}>Print payment slip</button>}{invoice.sale_id && <button type="button" className="btn btn-outline-secondary" disabled={locked} onClick={() => print()}>Reprint receipt</button>}{invoice.status === 'paid' && invoice.saleStatus === 'completed' && canCollect && <button className="btn btn-primary" disabled={locked} onClick={() => action('collect')}>Confirm medication collected</button>}</div>{invoice.status === 'collected' && <p className="text-success mt-3">Collected {new Date(invoice.collected_at).toLocaleString('en-GH')} · Staff #{invoice.collected_by}</p>}</section>
 {invoice.status === 'unpaid' && canPay && <section className={styles.card}><h2>Cashier payment</h2><p>Prices and available stock are rechecked before payment. An invoice does not reserve stock.</p><form onSubmit={e => { e.preventDefault(); action('pay'); }}><label className="form-label">Payment method<select className="form-select" value={method} disabled={locked} onChange={e => { setMethod(e.target.value); payment.setAmount(''); }}><option value="cash">Cash</option><option value="mobile_money">Mobile money</option><option value="card">Card</option></select></label><PharmacyPaymentFields payment={payment} method={method} total={invoice.total} disabled={locked}/><div className={styles.actions}><button type="button" className="btn btn-outline-secondary" disabled={locked} onClick={() => payment.setAmount(invoice.total.toFixed(2))}>Exact amount</button><button className="btn btn-primary" disabled={locked || payment.setup?.day?.status !== 'open' || !payment.setup?.shift || !payment.setup?.routes?.some((r: any) => r.method === method)}>Receive payment</button></div></form></section>}
 {['unpaid', 'cancelled'].includes(invoice.status) && <section className={styles.card}><h2>Return to attendant for review</h2><p>If price or stock prevents payment, do not collect money or retype the basket. Return code <strong>{invoice.code}</strong> to <strong>{invoice.attendant_name}</strong> or a pharmacy manager. Only they can cancel and reissue it after reviewing current prices and stock. The charged total will not change automatically.</p><button className="btn btn-outline-secondary" disabled={locked} onClick={reviewBasket}>Review current prices and stock</button>{review && <div className="mt-3"><p>Original total: {money(review.invoice.total)}. Current basket: {money(review.refreshedTotal)} ({review.invoice.details.priceType}). Customer: {review.invoice.details.customerName}. Patient ID: {review.invoice.details.patientId ?? 'None'}.</p><ul>{review.lines.map((line: any) => <li key={line.inventoryItemId}>{line.name}: {line.quantity} × {money(line.unitPrice)}; available {line.dispensableStock}. {line.issue && <strong>{line.issue}</strong>}</li>)}</ul>{review.invoice.details.replacementId ? <p>This invoice has already been reissued. Find the replacement invoice before taking payment.</p> : review.canRecover && !locked ? <Link className="btn btn-primary" href={`/pharmacy/sell?recover=${encodeURIComponent(invoice.id)}`}>Review and recover basket</Link> : <p>Handoff required: the original attendant or a pharmacy manager must open this invoice to recover the basket.</p>}</div>}</section>}</>}
 </main>;
}
