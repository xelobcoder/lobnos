'use client';

import {useCallback, useEffect, useRef, useState} from 'react';
import Link from 'next/link';
import {customFetch} from '../../../components/Auth/customFetch';
import {canCollectCounterInvoice, counterInvoiceReference} from '../../../lib/pharmacy/counterInvoice';
import type {CounterInvoice, CounterInvoiceQueueRow} from '../../../lib/pharmacy/counterInvoice';
import {printPharmacyReceipt} from '../../../lib/pharmacy/receipt';
import {usePharmacyDocument} from './PharmacyPaymentFields';
import {styles as workspaceStyles, money as workspaceMoney, Message, Empty, usePharmacyAccess} from './PharmacyWorkspace';
import posStyles from '../sell/pos.module.css';

interface InvoiceCollectionPanelProps {
    queue?: boolean;
    lookupRequest?: {value: string; key: number};
    onBusyChange?: (busy: boolean) => void;
    variant?: 'workspace' | 'pos';
}
type QueueData = {invoices: CounterInvoiceQueueRow[]; total: number; page: number; count: number};

export default function InvoiceCollectionPanel({queue=false, lookupRequest, onBusyChange, variant='workspace'}: InvoiceCollectionPanelProps) {
    const styles = variant === 'pos' ? {...workspaceStyles, toolbar: posStyles.collectionToolbar, card: posStyles.collectionCard, table: posStyles.table, actions: posStyles.collectionActions} : workspaceStyles;
    const money = variant === 'pos' ? (value: unknown) => 'GHS ' + Number(value).toFixed(2) : workspaceMoney;
    const access = usePharmacyAccess();
    const operation = usePharmacyDocument('invoice-collection');
    const role = String(access.app?.user?.role || '').toLowerCase().replace(/[\s_-]/g, '');
    const canCollect = access.manager || ['pharmacist', 'pharmacydispensaryofficer'].includes(role);
    const [reference, setReference] = useState('');
    const [invoice, setInvoice] = useState<CounterInvoice | null>(null);
    const [error, setError] = useState(''), [notice, setNotice] = useState('');
    const [busy, setBusy] = useState(false), [refreshKey, setRefreshKey] = useState(0);
    const [status, setStatus] = useState('paid'), [search, setSearch] = useState(''), [page, setPage] = useState(1);
    const [queueData, setQueueData] = useState<QueueData | null>(null);
    const [queueLoading, setQueueLoading] = useState(queue), [queueError, setQueueError] = useState('');
    const [lookupLoading, setLookupLoading] = useState(false);
    const requestVersion = useRef(0), lock = useRef(false);
    const pending = useRef(operation.pending);
    pending.current = operation.pending;
    const locked = busy || !!operation.pending;
    useEffect(() => {onBusyChange?.(busy);}, [busy, onBusyChange]);
    useEffect(() => () => {requestVersion.current++;}, []);

    const lookup = useCallback(async (value: string) => {
        if (lock.current || pending.current) return;
        const version = ++requestVersion.current;
        setError(''); setNotice(''); setInvoice(null); setLookupLoading(false);
        let parsed: string;
        try {parsed = counterInvoiceReference(value);}
        catch (e) {setError(e instanceof Error ? e.message : 'Invalid invoice number'); return;}
        setLookupLoading(true);
        try {
            const response = await customFetch('pharmacy/counter/lookup/' + encodeURIComponent(parsed));
            if (!response?.success) throw new Error(response?.error?.message || 'Invoice not found in this branch.');
            if (version === requestVersion.current) {setInvoice(response.data); setReference(parsed);}
        } catch (e) {
            if (version === requestVersion.current) setError(e instanceof Error ? e.message : 'Unable to load invoice.');
        } finally {
            if (version === requestVersion.current) setLookupLoading(false);
        }
    }, []);
    const requestedValue = lookupRequest?.value, requestedKey = lookupRequest?.key;
    useEffect(() => {if (requestedValue !== undefined) {setReference(requestedValue); void lookup(requestedValue);}}, [requestedValue, requestedKey, lookup]);

    useEffect(() => {
        if (!queue) return;
        let active = true;
        setQueueLoading(true); setQueueError('');
        const timer = setTimeout(async () => {
            try {
                const response = await customFetch(`pharmacy/counter/invoices/uncollected?status=${status}&page=${page}&count=25&search=${encodeURIComponent(search.trim())}`);
                if (!response?.success) throw new Error(response?.error?.message || 'Unable to load uncollected invoices.');
                if (active) setQueueData(response.data);
            } catch (e) {
                if (active) {setQueueData(null); setQueueError(e instanceof Error ? e.message : 'Unable to load collection queue.');}
            } finally {if (active) setQueueLoading(false);}
        }, 200);
        return () => {active = false; clearTimeout(timer);};
    }, [queue, status, page, search, refreshKey]);

    async function collect() {
        if (lock.current || lookupLoading || !canCollect || (!operation.pending && (!invoice || !canCollectCounterInvoice(invoice)))) return;
        if (!operation.pending && !window.confirm(`Confirm the medicines on ${invoice?.invoice_number} have been checked and are being handed to this customer?`)) return;
        lock.current = true; setBusy(true); setError(''); setNotice('');
        try {
            const response = await operation.execute(operation.pending ? '' : `pharmacy/counter/invoices/${invoice!.id}/collect`, {});
            if (!response?.success) throw new Error(response?.error?.message || 'Collection needs confirmation. Retry the original request.');
            setInvoice(current => current && current.id === response.data.id ? {...current, status: 'collected'} : current);
            setNotice('Medication collection confirmed. You can print the receipt or look up the next customer.');
            setRefreshKey(value => value + 1);
            const latest = await customFetch('pharmacy/counter/lookup/' + encodeURIComponent(response.data.code));
            if (!latest?.success) throw new Error(latest?.error?.message || 'Collection was recorded, but invoice refresh failed. Look it up again before printing.');
            setInvoice(latest.data);
            setReference(latest.data.invoice_number);
        } catch (e) {setError(e instanceof Error ? e.message : 'Unable to confirm collection.');}
        finally {lock.current = false; setBusy(false);}
    }
    async function print() {
        if (!invoice?.sale_id || lock.current) return;
        lock.current = true; setBusy(true); setError('');
        try {
            const response = await customFetch('pharmacy/sales/' + encodeURIComponent(invoice.sale_id));
            if (!response?.success) throw new Error(response?.error?.message || 'Unable to load saved receipt.');
            const app = access.app;
            await printPharmacyReceipt({...response.data, reprint: true, counterCode: invoice.code, collectionStatus: invoice.status, attendantName: invoice.attendant_name}, {
                name: typeof app?.company === 'string' ? app.company : app?.company?.name || 'PHARMACY',
                printedBy: app?.user?.username,
            });
        } catch (e) {setError(`${e instanceof Error ? e.message : 'Unable to print receipt.'} Collection status is unchanged; retry printing.`);}
        finally {lock.current = false; setBusy(false);}
    }

    return <div className={variant === 'pos' ? posStyles.collectionPanel : undefined} aria-busy={lookupLoading || busy}>
        <Message error={error} notice={notice}/>
        <form className={variant === 'pos' ? posStyles.collectionLookup : styles.toolbar} onSubmit={event => {event.preventDefault(); void lookup(reference);}}>
            <label className={variant === 'pos' ? posStyles.searchLabel : 'form-label mb-0 flex-grow-1'}>Invoice number or counter code
                <input className="form-control" aria-label="Invoice number or counter code" placeholder="INV-DC20-00001 or DC20" maxLength={80} value={reference} disabled={locked} onChange={event => setReference(event.target.value)}/>
            </label>
            <button className="btn btn-primary" disabled={locked || !reference.trim()}>Find invoice</button>
        </form>
        {lookupLoading && <div className={variant === 'pos' ? posStyles.collectionLoading : styles.empty} role="status"><span className="spinner-border spinner-border-sm me-2" aria-hidden="true"/>Finding invoice and saved medicines...</div>}
        {!invoice && !lookupLoading && !error && !operation.pending && !queue && <div className={variant === 'pos' ? posStyles.collectionEmpty : styles.empty}><h2>Find a customer's invoice</h2><p>Enter the full invoice number or four-character counter code to review saved medicines and confirm pickup. Your current basket stays unchanged.</p></div>}
        {operation.pending && <div className="alert alert-warning" role="alert">Collection confirmation is pending. Do not hand these medicines over twice.
            <button type="button" className="btn btn-warning ms-2" disabled={busy} onClick={() => void collect()}>Retry original collection</button>
        </div>}
        {invoice && <section className={styles.card}>
            <div className={styles.toolbar}>
                <div><span className={`badge ${invoice.status === 'collected' ? 'text-bg-success' : invoice.status === 'paid' ? 'text-bg-info' : 'text-bg-warning'}`}>{invoice.status === 'paid' ? 'Paid / awaiting collection' : invoice.status}</span>
                    <h2 className="mt-2">{invoice.invoice_number}</h2><p className="mb-0">{invoice.details.customerName} / Code {invoice.code}</p><small className={styles.muted}>Attendant: {invoice.attendant_name}</small></div>
                <strong>{money(invoice.total)}</strong>
            </div>
            {invoice.status === 'unpaid' && <p className="alert alert-warning">Payment has not been recorded. Do not release medicines. <Link href={`/pharmacy/counter?code=${encodeURIComponent(invoice.invoice_number)}`}>Open cashier invoice</Link></p>}
            {invoice.status === 'paid' && !canCollectCounterInvoice(invoice) && <p className="alert alert-danger" role="alert">The sale is reversed, incomplete or not fully paid. Do not release medicines.</p>}
            {invoice.status === 'collected' && <p className="alert alert-success">These medicines have already been collected. You may reprint the receipt, but cannot confirm collection again.</p>}
            {invoice.status === 'cancelled' && <p className="alert alert-warning">This invoice was cancelled. Do not release medicines.</p>}
            <div className="table-responsive"><table className={styles.table}><caption className="visually-hidden">Medicines on {invoice.invoice_number}</caption>
                <thead><tr><th scope="col">Medicine</th><th scope="col" className={styles.number}>Qty</th><th scope="col" className={styles.number}>Rate</th><th scope="col" className={styles.number}>Total</th></tr></thead>
                <tbody>{invoice.details.lines.map(line => <tr key={line.inventoryItemId}><td>{line.name}<small className="d-block text-muted">{line.priceType} pricing</small></td><td className={styles.number}>{line.quantity}</td><td className={styles.number}>{money(line.unitPrice)}</td><td className={styles.number}>{money(line.lineTotal)}</td></tr>)}</tbody>
            </table></div>
            <div className={`${styles.actions} mt-3`}>
                {canCollect && canCollectCounterInvoice(invoice) && <button type="button" className="btn btn-primary" disabled={locked} onClick={() => void collect()}>Confirm medication collection</button>}
                {invoice.sale_id && <button type="button" className="btn btn-outline-secondary" disabled={locked} onClick={() => void print()}>{invoice.status === 'collected' ? 'Print collection receipt' : 'Reprint payment receipt'}</button>}
                {!canCollect && canCollectCounterInvoice(invoice) && <span className={styles.muted}>A pharmacist, dispensary officer or pharmacy manager must confirm collection.</span>}
            </div>
        </section>}
        {queue && <section className={styles.card}>
            <div className={styles.toolbar}>
                <label className="form-label">Status<select className="form-select" value={status} disabled={locked} onChange={event => {setStatus(event.target.value); setPage(1);}}>
                    <option value="paid">Paid / awaiting collection</option><option value="unpaid">Awaiting payment</option><option value="all">All uncollected</option>
                </select></label>
                <label className="form-label flex-grow-1">Search queue<input type="search" className="form-control" maxLength={80} value={search} disabled={locked} onChange={event => {setSearch(event.target.value); setPage(1);}} placeholder="Invoice, code or customer"/></label>
                <button type="button" className="btn btn-outline-secondary" disabled={busy || queueLoading} onClick={() => setRefreshKey(value => value + 1)}>Refresh queue</button>
            </div>
            {queueError && <div className="alert alert-danger" role="alert">{queueError}<button className="btn btn-outline-secondary ms-2" type="button" onClick={() => setRefreshKey(value => value + 1)}>Retry queue</button></div>}
            {queueLoading ? <p role="status">Loading collection queue...</p> : queueData && (queueData.invoices.length ? <>
                <div className="table-responsive"><table className={styles.table}><caption className="visually-hidden">Uncollected counter invoices, oldest first</caption>
                    <thead><tr><th scope="col">Invoice / customer</th><th scope="col">Created</th><th scope="col">Items</th><th scope="col" className={styles.number}>Total</th><th scope="col">Status</th><th scope="col">Action</th></tr></thead>
                    <tbody>{queueData.invoices.map(row => <tr key={row.id}>
                        <td><strong>{row.invoice_number}</strong><small className="d-block text-muted">{row.customerName} / {row.code}</small></td>
                        <td>{new Date(row.created_at).toLocaleString('en-GH')}</td><td>{row.itemCount}</td><td className={styles.number}>{money(row.total)}</td>
                        <td>{row.status === 'unpaid' ? 'Awaiting payment' : canCollectCounterInvoice(row) ? 'Ready to collect' : 'Blocked / review sale'}</td>
                        <td><button type="button" className="btn btn-sm btn-outline-primary" disabled={locked} onClick={() => {void lookup(row.invoice_number);}}>View medicines</button></td>
                    </tr>)}</tbody>
                </table></div>
                <nav className={`${styles.actions} mt-3`} aria-label="Collection queue pagination">
                    <span role="status">{queueData.total} invoices / Page {queueData.page} of {Math.max(1, Math.ceil(queueData.total / queueData.count))}</span>
                    <button className="btn btn-outline-secondary" type="button" disabled={locked || queueData.page <= 1} onClick={() => setPage(queueData.page - 1)}>Previous</button>
                    <button className="btn btn-outline-secondary" type="button" disabled={locked || queueData.page * queueData.count >= queueData.total} onClick={() => setPage(queueData.page + 1)}>Next</button>
                </nav>
            </> : <Empty>No invoices match this collection queue.</Empty>)}
        </section>}
    </div>;
}
