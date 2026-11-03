'use client';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { accountingReference, record, rowsOf, text, type Accounts, type RecordData } from '../../../../lib/pharmacyAccounting';
import { usePharmacyAccess } from '../../components/PharmacyWorkspace';
import { useMutation, useResource } from './api';
import { LocalAccountSelect } from './Configuration';
import { DataTable, Facts, Feedback, Field, money, Money, ReferenceText, ResourceState, styles, SummaryMetrics, WorkflowLinks, WorkflowViews } from './common';
import { Register } from './Registers';
import { downloadAccountingExport } from './exports';
import SupplierAllocations from './SupplierAllocations';

const today = () => new Date().toISOString().slice(0,10);
export type ControlledKind = 'settlement' | 'adjustment' | 'refund' | 'allocation' | 'release' | 'payable_terms' | 'receivable_terms';
export function controlledActions(row: RecordData, actor: unknown, finance: boolean, kind: ControlledKind): string[] {
  if (!finance || !Number.isSafeInteger(Number(row.version)) || Number(row.version)<1) return [];
  const status = String(row.status), own = [row.created_by,row.submitted_by].some(id => id != null && String(id) === String(actor));
  const direct = kind === 'settlement' ? ['record_payment'] : [];
  if (status === 'draft') return [...direct,'submit','void'];
  if (status === 'submitted') return actor != null && !own ? [...direct,'approve','void'] : [...direct,'void'];
  return status === 'approved' ? [kind === 'settlement' ? 'pay' : kind === 'refund' ? 'receive' : 'post', ...(['settlement','payable_terms','receivable_terms'].includes(kind) ? ['void'] : [])] : [];
}
const actionLabels: Record<string, string> = { record_payment: 'Record payment now', submit: 'Submit for approval', approve: 'Approve', pay: 'Record payment', receive: 'Record refund received', post: 'Post', void: 'Cancel request (void)' };
export function ControlledActions({ row, kind, refresh }: { row: RecordData; kind: ControlledKind; refresh: () => void }) {
  const { app, finance } = usePharmacyAccess(), mutation = useMutation();
  const [action, setAction] = useState('');
  const options = controlledActions(row, app?.user?.employeeid, finance, kind);
  const endpoint = kind === 'payable_terms' ? 'payables/terms-amendments' : kind === 'receivable_terms' ? 'receivables/terms-amendments' : kind === 'settlement' ? 'payables/settlements' : kind === 'adjustment' ? 'receivables/adjustments' : kind === 'allocation' ? 'payables/allocations' : kind === 'release' ? 'payables/allocation-reversals' : 'expense-refunds';
  return <div className="d-print-none"><details className="mb-2"><summary>Review source allocations / correction evidence</summary><Facts data={row.details}/><DataTable rows={rowsOf(record(row.details).allocations)}/></details><Feedback {...mutation}/>{options.length ? <><select aria-label={`Workflow action for ${text(row.id)}`} className="form-select" disabled={mutation.pending} value={action} onChange={e => setAction(e.target.value)}><option value="">Select controlled action</option>{options.map(a => <option key={a} value={a}>{actionLabels[a] || a}</option>)}</select>{action && <form className="mt-2" onSubmit={async e => {
    e.preventDefault(); const f = new FormData(e.currentTarget);
    const body: RecordData = { expectedVersion: Number(row.version) };
    if (f.get('reason')) body.reason = f.get('reason');
    if (['pay','record_payment'].includes(action)) body.method = f.get('method');
    if (['pay','record_payment','receive'].includes(action) && f.get('reference')) body.reference = f.get('reference');
    if (await mutation.mutate(`${endpoint}/${encodeURIComponent(text(row.id))}/${action}`, body)) { setAction(''); refresh(); }
  }}><fieldset disabled={mutation.pending}>{['pay','record_payment'].includes(action) && <Field label="Paid from"><select required name="method" className="form-select"><option value="">Select payment account</option><option value="cash">Cash on hand (requires your open cash shift)</option><option value="card">Bank (transfer, cheque or card)</option><option value="mobile_money">Mobile money</option></select></Field>}{['pay','record_payment','receive'].includes(action) && <Field label="External reference (required for non-cash)"><input name="reference" className="form-control"/></Field>}<Field label={action === 'void' ? 'Void reason' : 'Review evidence / reason'}><input required={action === 'void'} name="reason" className="form-control"/></Field><p className={styles.muted}>Confirm {(actionLabels[action] || action).toLowerCase()} for <ReferenceText value={row.id} field="id" kind={kind}/>. Approved amounts, allocations and financial date remain immutable. {kind === 'refund' ? 'Money returns only to the original payment destination; cash requires an open shift.' : ['pay','record_payment'].includes(action) ? 'The payment posts immediately on the request date. Cash requires your open shift on that date.' : ''}</p><button className="btn btn-primary">Confirm: {actionLabels[action] || action}</button><button type="button" className="btn btn-link" onClick={() => setAction('')}>Cancel</button></fieldset></form>}</> : <span className={styles.muted}>No permitted transition. Independent approval is required for submitted documents.</span>}</div>;
}
export function DueDateForm({ id, endpoint, dueDate, refresh }: { id: string; endpoint: 'receivables' | 'payables/bills'; dueDate: unknown; refresh: () => void }) {
  const mutation = useMutation();
  if (dueDate) return <details className="d-print-none"><summary>Correct due date: {text(dueDate).slice(0,10)}</summary><p>The recorded date stays in history. This creates a separate correction: submit it, ask another finance user to approve, then apply it from Due-date corrections. No payment or balance is changed.</p><Feedback {...mutation}/><form onSubmit={async e => {
    e.preventDefault(); const f = new FormData(e.currentTarget);
    if (await mutation.mutate(`${endpoint}/${encodeURIComponent(id)}/terms-amendments`, { expectedDueDate: String(dueDate).slice(0,10), dueDate: f.get('dueDate'), date: f.get('date'), reason: f.get('reason') })) refresh();
  }}><fieldset disabled={mutation.pending}><Field label="Correct due date"><input required type="date" name="dueDate" className="form-control"/></Field><Field label="Correction effective date"><input required type="date" name="date" defaultValue={today()} max={today()} className="form-control"/></Field><Field label="Agreed terms / correction evidence"><textarea required minLength={3} maxLength={500} name="reason" className="form-control"/></Field><button className="btn btn-outline-primary">Prepare due-date correction</button></fieldset></form></details>;
  return <details className="d-print-none"><summary>Record evidenced due date</summary><Feedback {...mutation}/><form onSubmit={async e => { e.preventDefault(); const f = new FormData(e.currentTarget); if (await mutation.mutate(`${endpoint}/${encodeURIComponent(id)}/due-date`, { dueDate: f.get('dueDate'), reason: f.get('reason') }, 'PUT')) refresh(); }}><fieldset disabled={mutation.pending}><Field label="Due date"><input required type="date" name="dueDate" className="form-control"/></Field><Field label="Terms evidence / reason"><textarea required name="reason" className="form-control"/></Field><p className={styles.muted}>Fills unknown terms once; existing due dates cannot be silently rewritten.</p><button className="btn btn-outline-primary">Record due date</button></fieldset></form></details>;
}
type ReversalKind = 'settlement' | 'adjustment';
const reversalEndpoint = (kind: ReversalKind) => kind === 'settlement' ? 'payables/settlement-reversals' : 'receivables/adjustment-reversals';
export function ReversalRequest({row,kind,refresh}:{row:RecordData;kind:ReversalKind;refresh:()=>void}) {
  const {finance}=usePharmacyAccess(),mutation=useMutation();
  if(!finance||row.status!==(kind==='settlement'?'paid':'posted'))return null;
  const source=kind==='settlement'?'payables/settlements':'receivables/adjustments';
  return <details className="mt-3 d-print-none"><summary>Request reviewed reversal</summary><p>Only one active reversal intent is permitted per original document. Continue an existing draft, or request an audited replacement from the latest voided reversal in the reversal register. Original amounts and allocation evidence remain immutable.</p><Feedback {...mutation}/><form onSubmit={async e=>{
    e.preventDefault();const f=new FormData(e.currentTarget);
    if(await mutation.mutate(`${source}/${encodeURIComponent(text(row.id))}/reversals`,{date:f.get('date'),reason:f.get('reason')}))refresh();
  }}><fieldset disabled={mutation.pending}><Field label="Correction financial date"><input required type="date" name="date" defaultValue={today()} className="form-control"/></Field><Field label="Reversal evidence / reason"><textarea required name="reason" className="form-control"/></Field><button className="btn btn-outline-danger">Save reversal for review</button></fieldset></form></details>;
}
export function ReversalReplacement({row,kind,refresh}:{row:RecordData;kind:ReversalKind;refresh:()=>void}) {
  const {finance}=usePharmacyAccess(),mutation=useMutation();
  if(!finance||row.status!=='voided'||!Number.isSafeInteger(Number(row.version))||Number(row.version)<1)return null;
  return <details className="mt-3 d-print-none"><summary>Replace this voided reversal intent</summary><p>This creates a separately audited draft, linked to this voided intent and the unchanged original document. Only the latest voided intent can be replaced; an active replacement blocks duplicates. No original amount, allocation, tax snapshot or payment destination is editable.</p><Feedback {...mutation}/><form onSubmit={async e=>{
    e.preventDefault();const f=new FormData(e.currentTarget);
    if(await mutation.mutate(`${reversalEndpoint(kind)}/${encodeURIComponent(text(row.id))}/replacements`,{date:f.get('date'),reason:f.get('reason'),expectedVersion:Number(row.version)}))refresh();
  }}><fieldset disabled={mutation.pending}><Field label="Replacement financial date"><input required type="date" name="date" className="form-control" defaultValue={today()}/></Field><Field label="Replacement evidence / reason"><textarea required name="reason" className="form-control"/></Field><button className="btn btn-outline-danger">Save replacement for independent review</button></fieldset></form></details>;
}
export function ReversalActions({row,kind,refresh}:{row:RecordData;kind:ReversalKind;refresh:()=>void}) {
  const {app,finance}=usePharmacyAccess(),mutation=useMutation(),[action,setAction]=useState('');
  const options=controlledActions(row,app?.user?.employeeid,finance,'adjustment');
  const details=record(row.details),payment=record(details.payment);
  const sourceJournal=typeof details.originalJournalId==='string'?details.originalJournalId:'';
  return <div><details><summary>Review original immutable evidence</summary><Facts data={details}/><Facts data={payment}/><DataTable rows={rowsOf(details.allocations)}/>{sourceJournal&&<Link href={`/pharmacy/accounting/general-ledger/journals/${encodeURIComponent(sourceJournal)}`}>Original posted journal</Link>}</details><Feedback {...mutation}/>
    {options.length>0?<><select aria-label={`Reversal action for ${text(row.id)}`} value={action} disabled={mutation.pending} className="form-select" onChange={e=>setAction(e.target.value)}><option value="">Select reviewed action</option>{options.map(option=><option key={option}>{option}</option>)}</select>{action&&<form onSubmit={async e=>{
      e.preventDefault();const f=new FormData(e.currentTarget),body:RecordData={expectedVersion:Number(row.version)};
      if(f.get('reason'))body.reason=f.get('reason');
      if(kind==='settlement'&&action==='post'){body.confirmedReceived=f.get('confirmedReceived')==='on';if(f.get('reference'))body.reference=f.get('reference');}
      if(await mutation.mutate(`${reversalEndpoint(kind)}/${encodeURIComponent(text(row.id))}/${action}`,body)){setAction('');refresh();}
    }}><fieldset disabled={mutation.pending}>
      {kind==='settlement'&&action==='post'&&<><p>Funds return only to the original collection destination ({text(payment.method)} / {text(payment.accountId)}). Cash requires an open posting-date shift.</p><label><input required name="confirmedReceived" type="checkbox"/> I confirm the original funds were actually returned or cancelled with funds restored.</label><Field label="New return/cancellation reference"><input required={payment.method!=='cash'} name="reference" className="form-control"/></Field></>}
      <Field label={action==='void'?'Void reason':'Review evidence / reason'}><input required={action==='void'} name="reason" className="form-control"/></Field><button className="btn btn-primary">Confirm reversal {action}</button><button type="button" className="btn btn-link" onClick={()=>setAction('')}>Cancel</button>
    </fieldset></form>}</>:<p>No permitted reversal transition. Submitted documents require independent approval.</p>}
    <ReversalReplacement row={row} kind={kind} refresh={refresh}/>
  </div>;
}
export function Aging({ kind, version = 0 }: { kind: 'receivables' | 'payables'; version?: number }) {
  const [asOf, setAsOf] = useState(today()), [exportError, setExportError] = useState('');
  const resource = useResource<RecordData>(`${kind}/aging?asOf=${asOf}&refresh=${version}`);
  const reconciliation = record(resource.data?.reconciliation);
  async function exportRows(format: 'xlsx' | 'pdf') {
    setExportError('');
    try { await downloadAccountingExport(format, `Pharmacy ${kind} aging`, { rows: rowsOf(resource.data), metadata: { totals: record(resource.data?.buckets) } }, `Historical as of ${asOf}; reconciliation difference ${text(reconciliation.difference)}. Unknown terms remain unknown.`); }
    catch(e) { setExportError(e instanceof Error ? e.message : 'Aging export failed.'); }
  }
  return <section className={styles.card}><h2>{kind === 'payables' ? 'Supplier bill' : 'Customer invoice'} aging</h2><Field label="Historical as-of date"><input required type="date" className="form-control d-print-none" value={asOf} onChange={e => { if (e.target.value) setAsOf(e.target.value); }}/></Field><ResourceState {...resource} retry={resource.refresh}/><Feedback error={exportError}/>
    {resource.data && <><p>As of {asOf} · Total outstanding: <Money value={resource.data.total}/></p><p>{text(resource.data.note)}</p><h3>Age buckets</h3><Facts data={resource.data.buckets}/><h3>Control reconciliation</h3><Facts data={reconciliation}/>{reconciliation.reconciled !== true && <p role="alert" className="alert alert-warning">The source subledger does not fully reconcile to the control account. Unallocated historical payments, credits or missing sources remain differences; no allocations have been invented.</p>}<DataTable rows={rowsOf(reconciliation.parties)}/><DataTable rows={rowsOf(resource.data)} actions={row => <DueDateForm id={text(row.id)} endpoint={kind === 'payables' ? 'payables/bills' : 'receivables'} dueDate={row.due_date} refresh={resource.refresh}/>}/><div className={`${styles.actions} mt-3 d-print-none`}><button type="button" className="btn btn-outline-secondary" onClick={() => exportRows('xlsx')}>Excel aging</button><button type="button" className="btn btn-outline-secondary" onClick={() => exportRows('pdf')}>PDF aging</button><button type="button" className="btn btn-outline-secondary" onClick={() => window.print()}>Print aging</button></div></>}
  </section>;
}
export function BillRegistration({ refresh }: { refresh: () => void }) {
  const mutation = useMutation(), [version,setVersion] = useState(0);
  return <section className={styles.card}><h2>Register a posted supplier receipt as a bill</h2><p>No inventory or payable is posted again. Use the original posted receipt ID; approved expenses register their own bills.</p><Feedback {...mutation}/><form key={version} onSubmit={async e => { e.preventDefault(); const f = new FormData(e.currentTarget); const body: RecordData = { receiptId: f.get('receiptId') }; if(f.get('dueDate')) body.dueDate=f.get('dueDate'); if(f.get('reference')) body.reference=f.get('reference'); if(await mutation.mutate('payables/bills',body)){setVersion(v=>v+1);refresh();} }}><fieldset disabled={mutation.pending}><div className={styles.grid}><Field label="Original posted receipt ID"><input required name="receiptId" className="form-control"/></Field><Field label="Supplier invoice reference (optional)"><input name="reference" className="form-control"/></Field><Field label="Evidenced due date (leave unknown if unavailable)"><input type="date" name="dueDate" className="form-control"/></Field></div><button className="btn btn-primary">Register existing liability bill</button></fieldset></form></section>;
}
interface Allocation { billId: string; amount: string }
export function SettlementForm({ bills, refresh, initialBillId = '', simple = false, initialAllocations, replacesSettlementId }: { bills: RecordData[]; refresh: () => void; initialBillId?: string; simple?: boolean; initialAllocations?: Allocation[]; replacesSettlementId?: string }) {
  const defaultBillId = initialBillId || (bills.length === 1 && ['receipt', 'supplier_invoice'].includes(String(bills[0].source_kind)) && Number(bills[0].outstanding_amount) > 0 ? String(bills[0].id) : '');
  const mutation = useMutation(), [lines,setLines] = useState<Allocation[]>(initialAllocations || [{billId:defaultBillId,amount:simple&&defaultBillId?String(bills.find(b=>String(b.id)===defaultBillId)?.outstanding_amount??''):''}]), [validation,setValidation] = useState(''), [version,setVersion] = useState(0);
  const eligible = bills.filter(b=>['receipt','supplier_invoice'].includes(String(b.source_kind)) && Number(b.outstanding_amount)>0);
  const supplier = eligible.find(b=>String(b.id)===lines.find(l=>l.billId)?.billId)?.supplier_id;
  const patch = (i:number,value:Partial<Allocation>)=>setLines(lines.map((line,n)=>n===i?{...line,...value}:line));
  const total = lines.reduce((sum,line)=>sum+(Number.isFinite(Number(line.amount))?Number(line.amount):0),0);
  return <section className={styles.card} id="record-supplier-payment"><h2>{simple ? 'Record supplier payment' : 'Create allocated supplier settlement'}</h2><p>{simple ? 'Select the supplier bill, enter the amount paid and choose the account the money was paid from. The payment posts immediately: Accounts payable is debited and the cash, bank or mobile money account is credited. A part payment leaves the balance due on the bill.' : 'Allocate explicit amounts to supplier invoice or older receipt-backed bills from one supplier. Expense bills are paid through Expenses. The server rechecks open balances on approval and payment.'}</p><Feedback error={validation||mutation.error} errorCode={validation ? '' : mutation.errorCode} notice={mutation.notice && simple ? 'Payment recorded. Accounts payable and the paying account have been updated.' : mutation.notice}/><form key={version} onSubmit={async e=>{
    e.preventDefault();setValidation('');const f=new FormData(e.currentTarget);
    if(lines.length>100||lines.some(l=>!eligible.some(b=>String(b.id)===l.billId)||!l.amount||!Number.isFinite(Number(l.amount))||Number(l.amount)<=0)||new Set(lines.map(l=>l.billId)).size!==lines.length){setValidation(simple ? 'Select each supplier bill once and enter an amount greater than zero.' : 'Select 1–100 distinct open supplier bills and positive explicit allocation amounts.');return;}
    if(simple){
      const method=f.get('method'),reference=String(f.get('reference')||'').trim(),description=String(f.get('description')||'').trim();
      if(!method){setValidation('Choose how the supplier was paid.');return;}
      if(method!=='cash'&&!reference){setValidation('Enter the bank, cheque or mobile money reference for a non-cash payment.');return;}
      const body:RecordData={date:f.get('date'),method,allocations:lines};
      if(reference)body.reference=reference;
      if(description)body.description=description;
      if(await mutation.mutate('payables/payments',body)){setLines([{billId:'',amount:''}]);setVersion(v=>v+1);refresh();}
      return;
    }
    if(await mutation.mutate('payables/settlements',{date:f.get('date'),description:f.get('description'),allocations:lines,...(replacesSettlementId?{replacesSettlementId}:{})})){setLines([{billId:'',amount:''}]);setVersion(v=>v+1);refresh();}
  }}><fieldset disabled={mutation.pending}>
    <p className="alert alert-info">{simple ? 'Use this for an actual payment you are authorized to record now. It does not go through a separate approval step. If payment needs approval first, close this form and use Payment history > Prepare payment for independent approval. Do not record the same payment in both workflows.' : 'This only prepares a request: no money moves. Submit it, ask another finance user to approve, then record payment. Recording payment now is a separate authorized workflow, not an approval.'}</p>
    {simple ? <div className={styles.grid}>
      <Field label="Payment date"><input required type="date" name="date" defaultValue={today()} className="form-control"/></Field>
      <Field label="Paid from"><select required name="method" defaultValue="" className="form-select"><option value="">Select payment account</option><option value="cash">Cash on hand (requires your open cash shift)</option><option value="card">Bank (transfer, cheque or card)</option><option value="mobile_money">Mobile money</option></select></Field>
      <Field label="Payment reference (required for bank or mobile money)"><input name="reference" maxLength={128} className="form-control" placeholder="e.g. cheque no. or transaction ID"/></Field>
      <Field label="Memo (optional)"><input name="description" maxLength={255} className="form-control" placeholder="Payment to supplier"/></Field>
    </div> : <>
      <Field label="Settlement financial date"><input required type="date" name="date" defaultValue={today()} className="form-control"/></Field>
      <Field label="Settlement description"><input required name="description" defaultValue="Supplier invoice settlement" className="form-control"/></Field>
    </>}
    {lines.map((line,i)=><div className={styles.grid} key={i}>
      <Field label={simple ? `Bill ${i+1}` : `Allocation ${i+1} bill`}><select required className="form-select" value={line.billId} onChange={e=>{const bill=eligible.find(b=>String(b.id)===e.target.value);patch(i,{billId:e.target.value,amount:simple&&bill&&!line.amount?String(bill.outstanding_amount):line.amount});}}>
        <option value="">Select supplier bill</option>{eligible.filter(b=>supplier==null||String(b.supplier_id)===String(supplier)).map(b=><option key={text(b.id)} value={text(b.id)} title={text(b.reference)} disabled={lines.some((l,n)=>n!==i&&l.billId===String(b.id))}>{text(b.supplier_name||`Supplier #${b.supplier_id}`)} · {accountingReference(b.reference,'source_document',String(b.source_kind))} · balance due {money(b.outstanding_amount)}</option>)}
      </select></Field>
      <Field label={simple ? `Amount paid ${i+1} (GHS)` : `Allocation ${i+1} amount`}><input required type="number" min="0.01" max={Number(eligible.find(b=>String(b.id)===line.billId)?.outstanding_amount)||undefined} step="0.01" className="form-control" value={line.amount} onChange={e=>patch(i,{amount:e.target.value})}/></Field>
      {lines.length>1&&<button type="button" className="btn btn-outline-danger" onClick={()=>setLines(lines.filter((_,n)=>n!==i))}>{simple ? `Remove bill ${i+1}` : `Remove allocation ${i+1}`}</button>}
    </div>)}
    {simple && <p><strong>Total payment: {money(total)}</strong></p>}
    <div className={styles.actions}><button type="button" className="btn btn-outline-secondary" onClick={()=>setLines([...lines,{billId:'',amount:''}])}>{simple ? 'Pay another bill from this supplier' : 'Add bill allocation'}</button><button className="btn btn-primary">{simple ? 'Record payment' : 'Save draft allocated settlement'}</button></div>
  </fieldset></form></section>;
}
export function AdjustmentForm({ invoices, accounts, refresh }: { invoices: RecordData[]; accounts: Accounts; refresh: () => void }) {
  const mutation=useMutation(),[kind,setKind]=useState(''),[version,setVersion]=useState(0);
  return <section className={styles.card}><h2>Create invoice credit / write-off</h2><p>Reduces the receivable, not actual cash paid. Credit requires a revenue contra-account; write-off requires an expense account and never reverses tax. Facility mappings are required only when shared posting is enabled. Taxed credits require explicit frozen original-gross proportional allocation, not current tax rates. No inventory restocking or cash refund is implied.</p><Feedback {...mutation}/><form key={version} onSubmit={async e=>{
    e.preventDefault();const f=new FormData(e.currentTarget);
    const body:RecordData={saleId:f.get('saleId'),date:f.get('date'),kind,amount:f.get('amount'),account:f.get('account'),reason:f.get('reason')};
    if(kind==='credit'&&f.get('taxPolicy'))body.taxPolicy=f.get('taxPolicy');
    if(await mutation.mutate('receivables/adjustments',body)){setVersion(v=>v+1);setKind('');refresh();}
  }}><fieldset disabled={mutation.pending}><div className={styles.grid}><Field label="Original credit invoice"><select required name="saleId" className="form-select"><option value="">Select invoice with an open receivable</option>{invoices.filter(r=>Number(r.outstanding_amount)>0).map(r=><option value={text(r.id)} key={text(r.id)} title={text(r.receipt_number)}>{accountingReference(r.receipt_number,'receipt_number','sale')} · {text(r.customer_name)} · open {money(r.outstanding_amount)}</option>)}</select></Field><Field label="Adjustment type"><select required className="form-select" value={kind} onChange={e=>setKind(e.target.value)}><option value="">Select adjustment type</option><option value="credit">Credit</option><option value="writeoff">Write-off</option></select></Field><Field label="Pharmacy counterpart account"><LocalAccountSelect key={kind} name="account" accounts={accounts.items.filter(a=>kind&&a.type===(kind==='credit'?'revenue':'expense'))}/></Field>{kind==='credit'&&<Field label="Explicit tax-credit policy"><select name="taxPolicy" className="form-select" defaultValue=""><option value="">No tax-relief policy (untaxed invoice only)</option><option value="original_gross_proportional_v1">Allocate original gross proportionally using frozen sale tax snapshots</option></select></Field>}<Field label="Amount"><input required type="number" min="0.01" step="0.01" name="amount" className="form-control"/></Field><Field label="Financial date"><input required type="date" name="date" defaultValue={today()} className="form-control"/></Field><Field label="Evidence / reason"><textarea required name="reason" className="form-control"/></Field></div><button className="btn btn-primary">Save draft invoice adjustment</button></fieldset></form></section>;
}
export function TermsCorrections({ party, version, refresh }: { party: 'payables' | 'receivables'; version: number; refresh: () => void }) {
  return <section><h2>Due-date corrections</h2><p>Start from the original bill or invoice in Aging and choose Correct due date. Submit the request, ask another finance user to approve, then post it here. Posting changes due-date reporting from the correction effective date, not the original record or any money balance.</p>
    <Register endpoint={`${party}/terms-amendments`} key={`terms-${version}`} actions={(row,reload)=><ControlledActions row={row} kind={party==='payables'?'payable_terms':'receivable_terms'} refresh={()=>{reload();refresh();}}/>}/>
  </section>;
}
export function SettlementCorrection({ row, refresh }: { row: RecordData; refresh: () => void }) {
  const { finance } = usePharmacyAccess(), mutation = useMutation();
  const cancelled = row.status === 'voided';
  const bills = useResource<RecordData>('payables/bills', false, finance && cancelled);
  if (!finance || !['draft','submitted','approved','voided'].includes(String(row.status))) return null;
  return <details className="mt-3 d-print-none"><summary>Correct this unpaid request</summary>
    <p>Keep the original request in history. Cancel it with a reason, then prepare a replacement with the right date, bills and amounts. The replacement needs fresh independent approval; no payment is recorded here.</p>
    {cancelled ? <><ResourceState {...bills} retry={bills.refresh}/>{bills.data && <SettlementForm bills={rowsOf(bills.data)} replacesSettlementId={text(row.id)} initialAllocations={rowsOf(record(row.details).allocations).map(a=>({billId:text(a.billId),amount:text(a.amount)}))} refresh={refresh}/>}</> : <><Feedback {...mutation}/><form onSubmit={async e=>{
      e.preventDefault(); const f=new FormData(e.currentTarget);
      if(await mutation.mutate(`payables/settlements/${encodeURIComponent(text(row.id))}/void`,{expectedVersion:Number(row.version),reason:f.get('reason')}))refresh();
    }}><fieldset disabled={mutation.pending}><Field label="Why this request needs correction"><textarea required minLength={3} maxLength={500} name="reason" className="form-control"/></Field><button className="btn btn-outline-danger">Cancel unpaid request before replacement</button></fieldset></form></>}
  </details>;
}
export function Receivables() {
  const initialView = useSearchParams()?.get('view');
  const [version,setVersion]=useState(0), invoices=useResource<RecordData>(`receivables/aging?asOf=${today()}&refresh=${version}`), accounts=useResource<Accounts>('accounts');
  const refresh=()=>{setVersion(v=>v+1);invoices.refresh();};
  return <WorkflowViews label="Receivables views" initialView={initialView} views={[
    {id:'invoices',title:'Customer invoices',content:<><Register endpoint="receivables" key={`register-${version}`}/><section className={styles.section}><h2>Customer collections</h2><p>Collect invoice payments in the existing customer account workflow.</p><WorkflowLinks/></section></>},
    {id:'adjustments',title:'Credits & write-offs',content:<><ResourceState {...invoices} retry={invoices.refresh}/><ResourceState {...accounts} retry={accounts.refresh}/>
      {invoices.data&&accounts.data&&<details className="mb-3 d-print-none"><summary className="btn btn-primary">New invoice credit / write-off</summary><div className="mt-3"><AdjustmentForm invoices={rowsOf(invoices.data)} accounts={accounts.data} refresh={refresh}/></div></details>}
      <Register endpoint="receivables/adjustments" key={`adjustments-${version}`} actions={(row,reload)=><><ControlledActions row={row} kind="adjustment" refresh={()=>{reload();refresh();}}/><ReversalRequest row={row} kind="adjustment" refresh={()=>{reload();refresh();}}/></>}/></>},
    {id:'reversals',title:'Reversals',content:<><p className={styles.muted}>Restore original invoice allocations after independent approval. Customer cash paid is unchanged.</p><Register endpoint="receivables/adjustment-reversals" key={`reversals-${version}`} actions={(row,reload)=><ReversalActions row={row} kind="adjustment" refresh={()=>{reload();refresh();}}/>}/></>},
    {id:'aging',title:'Aging',content:<Aging kind="receivables" version={version}/>},
    {id:'terms',title:'Due-date corrections',content:<TermsCorrections party="receivables" version={version} refresh={refresh}/>},
  ]}/>;
}
const pendingPaymentStatuses = ['draft', 'submitted', 'approved'];
const requestStatusLabels: Record<string, string> = { draft: 'Draft — not submitted', submitted: 'Awaiting approval', approved: 'Approved — not yet paid' };
export function Payables() {
  const params = useSearchParams(), linkedId = params?.get('billId') || null;
  const [version,setVersion]=useState(0), [payBill,setPayBill]=useState<string|null>(linkedId), [notice,setNotice]=useState(''), [showAll,setShowAll]=useState(false);
  const bills=useResource<RecordData>(`payables/bills?asOf=${today()}&refresh=${version}`);
  const requests=useResource<RecordData>(`payables/settlements?refresh=${version}`);
  const refresh=()=>setVersion(v=>v+1);
  const allBills=rowsOf(bills.data), open=allBills.filter(b=>Number(b.outstanding_amount)>0);
  const names=new Map(allBills.filter(b=>b.supplier_id!=null).map(b=>[String(b.supplier_id),text(b.supplier_name||`Supplier #${b.supplier_id}`)]));
  const supplierName=(b:RecordData)=>text(b.supplier_name||names.get(String(b.supplier_id))||`Supplier #${b.supplier_id}`);
  const focused=Boolean(linkedId)&&!showAll, linkedBill=linkedId?allBills.find(b=>String(b.id)===linkedId):undefined;
  const listed=focused?(linkedBill?[linkedBill]:[]):open;
  const pending=rowsOf(requests.data).filter(r=>pendingPaymentStatuses.includes(String(r.status)));
  const overdue=open.filter(b=>!['current','unknown_due_date'].includes(String(b.bucket))).reduce((s,b)=>s+Number(b.outstanding_amount),0);
  const payable=(b:RecordData)=>['receipt','supplier_invoice'].includes(String(b.source_kind));
  const startPayment=(billId:string)=>{setNotice('');setPayBill(billId);setTimeout(()=>document.getElementById('record-supplier-payment')?.scrollIntoView({behavior:'smooth',block:'start'}),0);};
  const paid=()=>{setNotice('Payment recorded. Accounts payable and the paying account have been updated; see Payment history.');setPayBill(null);refresh();};
  return <>
    {bills.data && <SummaryMetrics metrics={[
      {title:'Total owed to suppliers',value:bills.data.total,subtitle:'Balance due on open bills',variant:'primary'},
      {title:'Unpaid bills',value:open.length,subtitle:'Bills with a balance due',variant:'info',count:true},
      {title:'Overdue',value:overdue,subtitle:'Past the recorded due date',variant:'danger'},
      {title:'Payments not yet completed',value:pending.length,subtitle:'Prepared but not paid',variant:'warning',count:true},
    ]}/>}
    <Feedback notice={notice}/>
    {pending.length>0 && <section className="alert alert-warning" aria-label="Payments not yet completed"><h2 className="h6">{pending.length} supplier payment{pending.length===1?' was':'s were'} prepared but never paid</h2><p className="mb-2">These have <strong>not</strong> reduced Accounts payable. Continue submission and independent approval if required, or use <em>Record payment now</em> only for an actual payment you are authorized to record without that separate approval. This posts money immediately; it is not an approval. Do not start a second payment for the same bills.</p>{pending.map(row=><div key={text(row.id)} className="border-top pt-2 mt-2"><strong>{names.get(String(record(row.details).supplierId))||'Supplier'} · {money(row.amount)}</strong> <span className="badge text-bg-secondary">{requestStatusLabels[String(row.status)]||text(row.status)}</span> <span className={styles.muted}>dated {text(row.financial_date).slice(0,10)}</span><ControlledActions row={row} kind="settlement" refresh={refresh}/><SettlementCorrection row={row} refresh={refresh}/></div>)}</section>}
    <div className={`${styles.actions} mb-3 d-print-none`}><button type="button" className="btn btn-primary" onClick={()=>payBill===null?startPayment(''):setPayBill(null)}>{payBill===null?'Record supplier payment':'Close payment form'}</button><Link className="btn btn-outline-secondary" href="/pharmacy/accounting/suppliers">Supplier statements</Link></div>
    {payBill!==null && <><ResourceState {...bills} retry={bills.refresh}/>{bills.data && (!linkedId || payBill!==linkedId || open.some(b=>String(b.id)===linkedId)) && <SettlementForm key={payBill||'new'} simple bills={allBills} initialBillId={payBill} refresh={paid}/>}</>}
    <WorkflowViews label="Payables views" initialView={params?.get('view')} views={[
      {id:'bills',title:'Unpaid bills',content:<><h2>{focused?'Linked supplier bill':'Unpaid supplier bills'}</h2>{focused && <p className="d-print-none"><button type="button" className="btn btn-link p-0" onClick={()=>setShowAll(true)}>Show all unpaid bills</button></p>}<ResourceState {...bills} retry={bills.refresh}/>{bills.data && focused && !linkedBill && <p role="alert">This bill is unavailable in this branch as of today. Check its invoice date and refresh.</p>}{bills.data && focused && linkedBill && Number(linkedBill.outstanding_amount)<=0 && <p role="status">This bill is fully paid; there is no balance due.</p>}{bills.data && (listed.length ? <div className="table-responsive"><table className={styles.table}><caption className="visually-hidden">{focused?'Linked supplier bill':'Unpaid supplier bills'}</caption><thead><tr><th>Supplier</th><th>Bill reference</th><th>Bill date</th><th>Due date</th><th className={styles.number}>Bill amount</th><th className={styles.number}>Paid</th><th className={styles.number}>Balance due</th><th className="d-print-none">Action</th></tr></thead><tbody>{listed.map(b=><tr key={text(b.id)}><td>{supplierName(b)}</td><td title={text(b.reference)}>{accountingReference(b.reference,'source_document',String(b.source_kind))}</td><td>{text(b.document_date).slice(0,10)}</td><td>{b.due_date?text(b.due_date).slice(0,10):'Not recorded'}</td><td className={styles.number}>{money(b.amount)}</td><td className={styles.number}>{money(b.allocated_amount)}</td><td className={styles.number}><strong>{money(b.outstanding_amount)}</strong></td><td className="d-print-none">{Number(b.outstanding_amount)<=0?'Paid':payable(b)?<button type="button" className="btn btn-sm btn-primary" onClick={()=>startPayment(String(b.id))}>Record payment</button>:<Link href="/pharmacy/accounting/expenses">Pay in Expenses</Link>}</td></tr>)}</tbody></table></div> : !focused && <p className={styles.empty}>No unpaid supplier bills. Everything owed to suppliers has been paid.</p>)}
        <h2 className="mt-4">Balances by supplier</h2><p className={styles.muted}>Accounts payable control balance for each supplier.</p><Register endpoint="payables" key={`register-${version}`}/>
        <details className="mt-3 d-print-none"><summary>Older stock receipt missing from the list? Register it as a bill</summary><div className="mt-3"><BillRegistration refresh={refresh}/></div></details></>},
      {id:'settlements',title:'Payment history',content:<><p className={styles.muted}>Every supplier payment, newest first. Paid payments can be reversed through a reviewed reversal.</p>
        <Register endpoint="payables/settlements" key={`settlements-${version}`} actions={(row,reload)=><><ControlledActions row={row} kind="settlement" refresh={()=>{reload();refresh();}}/><SettlementCorrection row={row} refresh={()=>{reload();refresh();}}/><ReversalRequest row={row} kind="settlement" refresh={()=>{reload();refresh();}}/></>}/>
        {bills.data&&<details className="mt-3 d-print-none"><summary>Prepare payment for independent approval</summary><div className="mt-3"><SettlementForm bills={allBills} refresh={refresh}/></div></details>}</>},
      {id:'applications',title:'Supplier credits & advances',content:<SupplierAllocations refresh={refresh} actions={(row,kind,reload)=><ControlledActions row={row} kind={kind} refresh={reload}/>}/>},
      {id:'reversals',title:'Payment reversals',content:<><p className={styles.muted}>Reopen original bills only after approval and confirmation that funds were returned or cancelled.</p><Register endpoint="payables/settlement-reversals" key={`reversals-${version}`} actions={(row,reload)=><ReversalActions row={row} kind="settlement" refresh={()=>{reload();refresh();}}/>}/></>},
      {id:'aging',title:'Aged payables',content:<Aging kind="payables" version={version}/>},
      {id:'terms',title:'Due-date corrections',content:<TermsCorrections party="payables" version={version} refresh={refresh}/>},
    ]}/>
  </>;
}
