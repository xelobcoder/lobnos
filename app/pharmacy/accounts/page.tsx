'use client';
import Link from 'next/link';
import {useEffect, useRef, useState} from 'react';
import {customFetch} from '../../../components/Auth/customFetch';
import {usePharmacyDocument} from '../components/PharmacyPaymentFields';
import {LinkedAccountingNotice, useLinkedAccounting} from '../components/LinkedAccountingCompatibility';
import {printPharmacyReceipt} from '../../../lib/pharmacy/receipt';
import {dateLabel, usePharmacyAccess, usePharmacyResource, Message, Modal} from '../components/PharmacyWorkspace';
import {styles, money} from '../accounting/components/common';
import layout from '../accounting/components/AccountingWorkspace.module.css';
import ui from './accounts.module.css';
import records from '../components/PharmacyRecords.module.css';

type CreditAccount = {id: number; patient_id: number; firstname: string; lastname: string; is_active: boolean | number; credit_limit: number; outstanding: number};
type Invoice = {id: string; receipt_number: string; completed_at: string; total_amount: number; paid_amount: number; outstanding_amount: number; status: string};
const patientName = (account: CreditAccount) => [account.firstname, account.lastname].filter(Boolean).join(' ') || `Patient #${account.patient_id}`;

export default function PharmacyAccountsPage() {
     const access = usePharmacyAccess(), resource = usePharmacyResource('pharmacy/credit/accounts');
     const request = usePharmacyDocument('patient-credit'), accounting = useLinkedAccounting();
     const [error, setError] = useState(''), [notice, setNotice] = useState(''), [busy, setBusy] = useState(false);
     const [dialog, setDialog] = useState<{kind: 'account'; account?: CreditAccount} | {kind: 'collection'; invoice: Invoice} | null>(null);
     const [selected, setSelected] = useState<CreditAccount | null>(null), [invoices, setInvoices] = useState<Invoice[]>([]);
     const [invoiceLoading, setInvoiceLoading] = useState(false), [invoiceError, setInvoiceError] = useState('');
     const [receipt, setReceipt] = useState<any>(null), [search, setSearch] = useState(''), [filter, setFilter] = useState('all');
     const [page, setPage] = useState(1), [invoiceFilter, setInvoiceFilter] = useState('outstanding'), [method, setMethod] = useState('cash');
     const [invoicePage, setInvoicePage] = useState(1), [invoiceTotal, setInvoiceTotal] = useState(0), [invoicePages, setInvoicePages] = useState(1);
     const invoiceRequest = useRef(0), invoiceSection = useRef<HTMLElement>(null);
     const accounts: CreditAccount[] = resource.data || [];
     const selectedAccount = accounts.find(account => account.id === selected?.id) || selected;
     const rows = accounts.filter(account => {
          const matches = `${patientName(account)} ${account.patient_id}`.toLowerCase().includes(search.trim().toLowerCase());
          return matches && (filter === 'all' || (filter === 'owing' && Number(account.outstanding) > 0) || (filter === 'active' && !!account.is_active) || (filter === 'inactive' && !account.is_active));
     });
     const totalPages = Math.max(1, Math.ceil(rows.length / 20));
     useEffect(() => {setPage(value => Math.min(value, totalPages));}, [totalPages]);
     const open = async (account: CreditAccount, focus = true, requestedPage = 1, status = 'outstanding') => {
          const generation = ++invoiceRequest.current;
          setSelected(account); setInvoices([]); setInvoiceLoading(true); setInvoiceError(''); setInvoiceFilter(status);
          if (focus) requestAnimationFrame(() => {invoiceSection.current?.focus(); invoiceSection.current?.scrollIntoView({block: 'start', behavior: 'smooth'});});
          try {
               const response = await customFetch(`pharmacy/credit/accounts/${account.id}/invoices?page=${requestedPage}&status=${status}`);
               if (!response?.success) throw new Error(response?.error?.message || 'Unable to load patient invoices.');
               if (generation === invoiceRequest.current) {
                    setInvoices(response.data.items); setInvoicePage(response.data.page);
                    setInvoiceTotal(response.data.total); setInvoicePages(response.data.totalPages);
               }
          } catch (e) {if (generation === invoiceRequest.current) setInvoiceError(e instanceof Error ? e.message : 'Unable to load invoices.');}
          finally {if (generation === invoiceRequest.current) setInvoiceLoading(false);}
     };
     const act = async (endpoint: string, payload: Record<string, unknown>) => {
          if (busy) return;
          setBusy(true); setError(''); setNotice('');
          try {
               const response = await request.execute(endpoint, payload);
               if (!response?.success) throw new Error(response?.error?.message || 'The operation could not be confirmed.');
               setDialog(null);
               if (response.data.receiptNumber) setReceipt(response.data);
               setNotice(response.data.receiptNumber ? 'Payment recorded. The invoice balance has been updated.' : 'Patient credit settings saved.');
               await resource.refresh();
               if (selected) await open(selected, false);
          } catch (e) {setError(e instanceof Error ? e.message : 'Unable to save.');}
          finally {setBusy(false);}
     };
     const shownInvoices = invoices.filter(invoice => invoiceFilter === 'all' || (invoice.status === 'completed' && Number(invoice.outstanding_amount) > 0));
     return <main className={`${styles.page} ${ui.page}`}>
          <header className={styles.header}>
               <div><h1>Patient credit accounts</h1><p>See who owes money for pharmacy purchases, collect invoice payments and manage approved credit limits.</p></div>
               <div className={styles.actions}><button className="btn btn-outline-secondary" disabled={resource.loading || busy} onClick={resource.refresh}>Refresh</button>{access.manager && <button className="btn btn-primary" disabled={busy || !!request.pending} onClick={() => {setError(''); setDialog({kind: 'account'});}}>Add patient credit account</button>}</div>
          </header>
          <Message error={error || resource.error} notice={notice}/>
          <div className={ui.explanation}><p>Use this page when a registered patient buys on credit or returns to pay an existing pharmacy invoice. An approved limit controls how much they can owe.</p><Link href="/pharmacy/collections">Collect medicines for an existing counter invoice →</Link></div>
          <dl className={layout.summaryStrip} aria-label="Patient credit summary">
               <div><dt>Total owed by patients</dt><dd>{resource.data ? money(accounts.reduce((sum, account) => sum + Number(account.outstanding), 0)) : '—'}</dd></div>
               <div><dt>Patients with a balance</dt><dd>{resource.data ? accounts.filter(account => Number(account.outstanding) > 0).length : '—'}</dd></div>
               <div><dt>Active credit accounts</dt><dd>{resource.data ? accounts.filter(account => !!account.is_active).length : '—'}</dd></div>
          </dl>
          {request.pending && <div className="alert alert-warning">A credit operation needs confirmation. <button className="btn btn-warning" disabled={busy} onClick={() => act('', {})}>Retry original operation</button></div>}
          <section className={styles.card} aria-labelledby="accounts-heading">
               <h2 id="accounts-heading">Patient accounts</h2>
               <div className={ui.filters}>
                    <label>Find a patient<input type="search" className="form-control" placeholder="Name or patient ID" value={search} onChange={e => {setSearch(e.target.value); setPage(1);}}/></label>
                    <label>Show accounts<select className="form-select" value={filter} onChange={e => {setFilter(e.target.value); setPage(1);}}><option value="all">All accounts</option><option value="owing">With money owed</option><option value="active">Active for credit purchases</option><option value="inactive">Inactive for credit purchases</option></select></label>
               </div>
               {resource.loading ? <p role="status">Loading patient credit accounts…</p> : rows.length ? <div className="table-responsive"><table className={`${styles.table} ${records.table}`}>
                    <thead><tr><th>Patient</th><th>Credit status</th><th className={styles.number}>Owes now</th><th className={styles.number}>Approved limit</th><th className={styles.number}>Credit available</th><th>Actions</th></tr></thead>
                    <tbody>{rows.slice((page - 1) * 20, page * 20).map(account => <tr key={account.id} aria-selected={selected?.id === account.id}>
                         <td><strong>{patientName(account)}</strong><small className="d-block text-muted">Patient #{account.patient_id}</small></td><td data-label="Credit status">{account.is_active ? 'Active' : 'Inactive'}</td>
                         <td data-label="Owes now" className={styles.number}><strong className={Number(account.outstanding) > 0 ? 'text-danger' : ''}>{money(account.outstanding)}</strong></td><td data-label="Approved limit" className={styles.number}>{money(account.credit_limit)}</td><td data-label="Credit available" className={styles.number}>{account.is_active ? money(Math.max(0, Number(account.credit_limit) - Number(account.outstanding))) : 'Unavailable'}</td>
                         <td data-record-actions><div className={styles.actions}><button className="btn btn-sm btn-outline-primary" disabled={busy} onClick={() => open(account)}>View invoices{Number(account.outstanding) > 0 ? ' & collect' : ''}</button>{access.manager && <button className="btn btn-sm btn-outline-secondary" disabled={busy || !!request.pending} onClick={() => {setError(''); setDialog({kind: 'account', account});}}>Edit credit limit</button>}</div></td>
                    </tr>)}</tbody>
               </table></div> : <div className={ui.empty}>
                    <h3>{accounts.length ? 'No matching patient accounts' : resource.error ? 'Accounts could not be loaded' : 'No patient credit accounts yet'}</h3>
                    <p>{accounts.length ? 'Try another name or show all accounts.' : 'A manager can approve a credit limit for a registered patient. Their unpaid pharmacy invoices will then appear here.'}</p>
                    {(search || filter !== 'all') && <button className="btn btn-outline-secondary" onClick={() => {setSearch(''); setFilter('all'); setPage(1);}}>Clear filters</button>}
                    {resource.error && <button className="btn btn-outline-primary" onClick={resource.refresh}>Retry</button>}
               </div>}
               {rows.length > 0 && <div className={ui.pagination}><span>{rows.length} {rows.length === 1 ? 'account' : 'accounts'} · Page {page} of {totalPages}</span><div className={styles.actions}><button className="btn btn-sm btn-outline-secondary" disabled={page <= 1 || resource.loading} onClick={() => setPage(value => value - 1)}>Previous</button><button className="btn btn-sm btn-outline-secondary" disabled={page >= totalPages || resource.loading} onClick={() => setPage(value => value + 1)}>Next</button></div></div>}
          </section>
          {selectedAccount && <section ref={invoiceSection} tabIndex={-1} className={`${styles.card} ${ui.invoices}`} aria-labelledby="patient-invoices-heading">
               <header className={ui.sectionHeader}><div><h2 id="patient-invoices-heading">Invoices for {patientName(selectedAccount)}</h2><p>Patient #{selectedAccount.patient_id} · Total owed {money(selectedAccount.outstanding)}</p></div><button className="btn btn-sm btn-outline-secondary" disabled={busy} onClick={() => {invoiceRequest.current++; setSelected(null); setInvoices([]);}}>Close invoices</button></header>
               <label className={ui.invoiceFilter}>Show invoices<select className="form-select" value={invoiceFilter} disabled={busy} onChange={e => open(selectedAccount, false, 1, e.target.value)}><option value="outstanding">Unpaid & partially paid</option><option value="all">All invoices</option></select></label>
               {invoiceLoading ? <p role="status">Loading patient invoices…</p> : invoiceError ? <><Message error={invoiceError}/><button className="btn btn-outline-primary" onClick={() => open(selectedAccount, false, invoicePage, invoiceFilter)}>Retry invoices</button></> : shownInvoices.length ? <div className="table-responsive"><table className={`${styles.table} ${records.table}`}>
                    <thead><tr><th>Invoice / receipt</th><th>Date</th><th>Status</th><th className={styles.number}>Sale total</th><th className={styles.number}>Paid</th><th className={styles.number}>Still owed</th><th>Action</th></tr></thead>
                    <tbody>{shownInvoices.map(invoice => <tr key={invoice.id}><td>{invoice.receipt_number}</td><td data-label="Date">{dateLabel(invoice.completed_at)}</td><td data-label="Status">{invoice.status === 'completed' ? Number(invoice.outstanding_amount) > 0 ? 'Payment due' : 'Paid' : invoice.status}</td><td data-label="Sale total" className={styles.number}>{money(invoice.total_amount)}</td><td data-label="Paid" className={styles.number}>{money(invoice.paid_amount)}</td><td data-label="Still owed" className={styles.number}>{money(invoice.outstanding_amount)}</td><td data-record-actions>{invoice.status === 'completed' && Number(invoice.outstanding_amount) > 0 && <button className="btn btn-sm btn-primary" disabled={busy || !!request.pending} onClick={() => {setError(''); setMethod('cash'); setDialog({kind: 'collection', invoice});}}>Collect payment</button>}</td></tr>)}</tbody>
               </table></div> : <p className={ui.empty}>{invoiceFilter === 'outstanding' ? 'No unpaid invoices in this list. Choose All invoices to see paid and reversed sales.' : 'No pharmacy invoices recorded for this patient.'}</p>}
               {!invoiceLoading && !invoiceError && <div className={ui.pagination}><span>{invoiceTotal} {invoiceTotal === 1 ? 'invoice' : 'invoices'} · Page {invoicePage} of {invoicePages}</span><div className={styles.actions}><button className="btn btn-sm btn-outline-secondary" disabled={busy || invoicePage <= 1} onClick={() => open(selectedAccount, true, invoicePage - 1, invoiceFilter)}>Previous invoices</button><button className="btn btn-sm btn-outline-secondary" disabled={busy || invoicePage >= invoicePages} onClick={() => open(selectedAccount, true, invoicePage + 1, invoiceFilter)}>Next invoices</button></div></div>}
          </section>}
          {receipt && <section className={styles.card}><h2>Payment receipt</h2><p>{receipt.receiptNumber} · Received {money(receipt.total)} · Invoice balance {money(receipt.outstanding)}</p><div className={styles.actions}><button className="btn btn-primary" onClick={async () => {try {await printPharmacyReceipt(receipt, {name: typeof access.app?.company === 'string' ? access.app.company : access.app?.company?.name || 'PHARMACY', printedBy: access.app?.user?.username});} catch (e) {setError(e instanceof Error ? e.message : 'Unable to print');}}}>Print payment receipt</button><button className="btn btn-outline-secondary" onClick={() => setReceipt(null)}>Dismiss receipt</button></div></section>}
          {access.finance && <details className={ui.accounting}><summary>Accounting connection</summary><LinkedAccountingNotice policy={accounting}/></details>}
          {dialog && <Modal title={dialog.kind === 'account' ? dialog.account ? 'Edit patient credit account' : 'Add patient credit account' : 'Collect invoice payment'} busy={busy} onClose={() => setDialog(null)}>
               <Message error={error}/>
               <form onSubmit={async e => {
                    e.preventDefault(); const form = new FormData(e.currentTarget);
                    await act(dialog.kind === 'account' ? 'pharmacy/credit/accounts' : `pharmacy/credit/invoices/${dialog.invoice.id}/payment`, dialog.kind === 'account' ? {patientId: Number(form.get('patientId')), creditLimit: Number(form.get('limit')), active: form.get('active') === 'on', reason: form.get('reason')} : {amount: Number(form.get('amount')), method, reference: form.get('reference') || undefined});
               }}>
                    {dialog.kind === 'account' ? <>
                         {dialog.account && <p><strong>{patientName(dialog.account)}</strong> · Currently owes {money(dialog.account.outstanding)}</p>}
                         <label className="form-label d-block">Registered patient ID<input className="form-control" name="patientId" type="number" min="1" step="1" required defaultValue={dialog.account?.patient_id} readOnly={!!dialog.account}/></label>
                         <label className="form-label d-block">Approved credit limit (GHS)<input className="form-control" name="limit" type="number" min="0" step="0.01" required defaultValue={dialog.account?.credit_limit}/><small className="text-muted">Maximum unpaid balance permitted for this patient.</small></label>
                         <label className="form-label d-block">Reason for approval or change<textarea className="form-control" name="reason" minLength={3} maxLength={1000} required/></label>
                         <label><input type="checkbox" name="active" defaultChecked={dialog.account ? !!dialog.account.is_active : true}/> Allow new credit purchases</label><p className="small text-muted mt-2">You can still collect existing balances when new credit purchases are disabled.</p>
                    </> : <>
                         <p>{selectedAccount ? patientName(selectedAccount) + ' · ' : ''}{dialog.invoice.receipt_number}</p><p>Still owed <strong>{money(dialog.invoice.outstanding_amount)}</strong></p>
                         <label className="form-label d-block">Payment collected (GHS)<input className="form-control" name="amount" type="number" min="0.01" max={dialog.invoice.outstanding_amount} step="0.01" required/><small className="text-muted">Enter the amount applied to this invoice after giving any cash change.</small></label>
                         <label className="form-label d-block">Payment method<select className="form-select" value={method} onChange={e => setMethod(e.target.value)}><option value="cash">Cash</option><option value="mobile_money">Mobile money</option><option value="card">Card</option></select></label>
                         <label className="form-label d-block">Payment reference{method === 'cash' ? ' (optional)' : ' (required)'}<input className="form-control" name="reference" required={method !== 'cash'} minLength={method === 'cash' ? undefined : 3} maxLength={128}/></label>
                         <label><input type="checkbox" required/> I confirm this payment has been received.</label>
                    </>}
                    <footer className={ui.formFooter}><button type="button" className="btn btn-outline-secondary" disabled={busy} onClick={() => setDialog(null)}>Cancel</button><button className="btn btn-primary" disabled={busy || !!request.pending}>{busy ? 'Saving…' : dialog.kind === 'account' ? 'Save credit account' : 'Record payment'}</button></footer>
               </form>
          </Modal>}
     </main>;
}
