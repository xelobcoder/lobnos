'use client';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { accountingReference, record, rowsOf, text, type Accounts, type RecordData } from '../../../../lib/pharmacyAccounting';
import { usePharmacyAccess } from '../../components/PharmacyWorkspace';
import { useMutation, useResource } from './api';
import { LocalAccountSelect } from './Configuration';
import { DataTable, Facts, Feedback, Field, money, Money, ReferenceText, ResourceState, styles, WorkflowLinks, WorkflowViews } from './common';
import { Register } from './Registers';
import { downloadAccountingExport } from './exports';
import SupplierAllocations from './SupplierAllocations';

const today = () => new Date().toISOString().slice(0,10);
export type ControlledKind = 'settlement' | 'adjustment' | 'refund' | 'allocation' | 'release';
export function controlledActions(row: RecordData, actor: unknown, finance: boolean, kind: ControlledKind): string[] {
  if (!finance || !Number.isSafeInteger(Number(row.version)) || Number(row.version)<1) return [];
  const status = String(row.status), own = [row.created_by,row.submitted_by].some(id => id != null && String(id) === String(actor));
  if (status === 'draft') return ['submit','void'];
  if (status === 'submitted') return actor != null && !own ? ['approve','void'] : ['void'];
  return status === 'approved' ? [kind === 'settlement' ? 'pay' : kind === 'refund' ? 'receive' : 'post'] : [];
}
export function ControlledActions({ row, kind, refresh }: { row: RecordData; kind: ControlledKind; refresh: () => void }) {
  const { app, finance } = usePharmacyAccess(), mutation = useMutation();
  const [action, setAction] = useState('');
  const options = controlledActions(row, app?.user?.employeeid, finance, kind);
  const endpoint = kind === 'settlement' ? 'payables/settlements' : kind === 'adjustment' ? 'receivables/adjustments' : kind === 'allocation' ? 'payables/allocations' : kind === 'release' ? 'payables/allocation-reversals' : 'expense-refunds';
  return <div className="d-print-none"><details className="mb-2"><summary>Review source allocations / correction evidence</summary><Facts data={row.details}/><DataTable rows={rowsOf(record(row.details).allocations)}/></details><Feedback {...mutation}/>{options.length ? <><select aria-label={`Workflow action for ${text(row.id)}`} className="form-select" disabled={mutation.pending} value={action} onChange={e => setAction(e.target.value)}><option value="">Select controlled action</option>{options.map(a => <option key={a}>{a}</option>)}</select>{action && <form className="mt-2" onSubmit={async e => {
    e.preventDefault(); const f = new FormData(e.currentTarget);
    const body: RecordData = { expectedVersion: Number(row.version) };
    if (f.get('reason')) body.reason = f.get('reason');
    if (action === 'pay') body.method = f.get('method');
    if (['pay','receive'].includes(action) && f.get('reference')) body.reference = f.get('reference');
    if (await mutation.mutate(`${endpoint}/${encodeURIComponent(text(row.id))}/${action}`, body)) { setAction(''); refresh(); }
  }}><fieldset disabled={mutation.pending}>{action === 'pay' && <Field label="Payment method"><select required name="method" className="form-select"><option value="">Select method</option><option value="cash">Cash</option><option value="card">Card / bank</option><option value="mobile_money">Mobile money</option></select></Field>}{['pay','receive'].includes(action) && <Field label="External reference (required for non-cash)"><input name="reference" className="form-control"/></Field>}<Field label={action === 'void' ? 'Void reason' : 'Review evidence / reason'}><input required={action === 'void'} name="reason" className="form-control"/></Field><p className={styles.muted}>Confirm {action} for <ReferenceText value={row.id} field="id" kind={kind}/>. Approved amounts, allocations and financial date remain immutable. {kind === 'refund' ? 'Money returns only to the original payment destination; cash requires an open shift.' : action === 'pay' ? 'Cash requires an open shift on the settlement date.' : ''}</p><button className="btn btn-primary">Confirm {action}</button><button type="button" className="btn btn-link" onClick={() => setAction('')}>Cancel</button></fieldset></form>}</> : <span className={styles.muted}>No permitted transition. Independent approval is required for submitted documents.</span>}</div>;
}
export function DueDateForm({ id, endpoint, dueDate, refresh }: { id: string; endpoint: 'receivables' | 'payables/bills'; dueDate: unknown; refresh: () => void }) {
  const mutation = useMutation();
  if (dueDate) return <span>{text(dueDate)}</span>;
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
export function SettlementForm({ bills, refresh }: { bills: RecordData[]; refresh: () => void }) {
  const mutation = useMutation(), [lines,setLines] = useState<Allocation[]>([{billId:'',amount:''}]), [validation,setValidation] = useState(''), [version,setVersion] = useState(0);
  const eligible = bills.filter(b=>['receipt','supplier_invoice'].includes(String(b.source_kind)) && Number(b.outstanding_amount)>0);
  const supplier = eligible.find(b=>String(b.id)===lines.find(l=>l.billId)?.billId)?.supplier_id;
  const patch = (i:number,value:Partial<Allocation>)=>setLines(lines.map((line,n)=>n===i?{...line,...value}:line));
  return <section className={styles.card}><h2>Create allocated supplier settlement</h2><p>Allocate explicit amounts to supplier invoice or older receipt-backed bills from one supplier. Expense bills are paid through Expenses. The server rechecks open balances on approval and payment.</p><Feedback error={validation||mutation.error} notice={mutation.notice}/><form key={version} onSubmit={async e=>{
    e.preventDefault();setValidation('');const f=new FormData(e.currentTarget);
    if(lines.length>100||lines.some(l=>!eligible.some(b=>String(b.id)===l.billId)||!l.amount||!Number.isFinite(Number(l.amount))||Number(l.amount)<=0)||new Set(lines.map(l=>l.billId)).size!==lines.length){setValidation('Select 1–100 distinct open supplier bills and positive explicit allocation amounts.');return;}
    if(await mutation.mutate('payables/settlements',{date:f.get('date'),description:f.get('description'),allocations:lines})){setLines([{billId:'',amount:''}]);setVersion(v=>v+1);refresh();}
  }}><fieldset disabled={mutation.pending}><Field label="Settlement financial date"><input required type="date" name="date" defaultValue={today()} className="form-control"/></Field><Field label="Settlement description"><input required name="description" className="form-control"/></Field>{lines.map((line,i)=><div className={styles.grid} key={i}><Field label={`Allocation ${i+1} bill`}><select required className="form-select" value={line.billId} onChange={e=>patch(i,{billId:e.target.value})}><option value="">Select receipt bill</option>{eligible.filter(b=>supplier==null||String(b.supplier_id)===String(supplier)).map(b=><option key={text(b.id)} value={text(b.id)} title={text(b.reference)} disabled={lines.some((l,n)=>n!==i&&l.billId===String(b.id))}>{accountingReference(b.reference,'source_document','receipt')} · {text(b.supplier_name||`Supplier #${b.supplier_id}`)} · open {money(b.outstanding_amount)}</option>)}</select></Field><Field label={`Allocation ${i+1} amount`}><input required type="number" min="0.01" step="0.01" className="form-control" value={line.amount} onChange={e=>patch(i,{amount:e.target.value})}/></Field>{lines.length>1&&<button type="button" className="btn btn-outline-danger" onClick={()=>setLines(lines.filter((_,n)=>n!==i))}>Remove allocation {i+1}</button>}</div>)}<div className={styles.actions}><button type="button" className="btn btn-outline-secondary" onClick={()=>setLines([...lines,{billId:'',amount:''}])}>Add bill allocation</button><button className="btn btn-primary">Save draft allocated settlement</button></div></fieldset></form></section>;
}
export function AdjustmentForm({ invoices, accounts, refresh }: { invoices: RecordData[]; accounts: Accounts; refresh: () => void }) {
  const mutation=useMutation(),[kind,setKind]=useState(''),[version,setVersion]=useState(0);
  return <section className={styles.card}><h2>Create invoice credit / write-off</h2><p>Reduces the receivable, not actual cash paid. Credit requires a mapped revenue contra-account; write-off requires a mapped expense and never reverses tax. Taxed credits require explicit frozen original-gross proportional allocation, not current tax rates. No inventory restocking or cash refund is implied.</p><Feedback {...mutation}/><form key={version} onSubmit={async e=>{
    e.preventDefault();const f=new FormData(e.currentTarget);
    const body:RecordData={saleId:f.get('saleId'),date:f.get('date'),kind,amount:f.get('amount'),account:f.get('account'),reason:f.get('reason')};
    if(kind==='credit'&&f.get('taxPolicy'))body.taxPolicy=f.get('taxPolicy');
    if(await mutation.mutate('receivables/adjustments',body)){setVersion(v=>v+1);setKind('');refresh();}
  }}><fieldset disabled={mutation.pending}><div className={styles.grid}><Field label="Original credit invoice"><select required name="saleId" className="form-select"><option value="">Select invoice with an open receivable</option>{invoices.filter(r=>Number(r.outstanding_amount)>0).map(r=><option value={text(r.id)} key={text(r.id)} title={text(r.receipt_number)}>{accountingReference(r.receipt_number,'receipt_number','sale')} · {text(r.customer_name)} · open {money(r.outstanding_amount)}</option>)}</select></Field><Field label="Adjustment type"><select required className="form-select" value={kind} onChange={e=>setKind(e.target.value)}><option value="">Select adjustment type</option><option value="credit">Credit</option><option value="writeoff">Write-off</option></select></Field><Field label="Explicit mapped counterpart"><LocalAccountSelect key={kind} name="account" accounts={accounts.items.filter(a=>kind&&a.type===(kind==='credit'?'revenue':'expense'))}/></Field>{kind==='credit'&&<Field label="Explicit tax-credit policy"><select name="taxPolicy" className="form-select" defaultValue=""><option value="">No tax-relief policy (untaxed invoice only)</option><option value="original_gross_proportional_v1">Allocate original gross proportionally using frozen sale tax snapshots</option></select></Field>}<Field label="Amount"><input required type="number" min="0.01" step="0.01" name="amount" className="form-control"/></Field><Field label="Financial date"><input required type="date" name="date" defaultValue={today()} className="form-control"/></Field><Field label="Evidence / reason"><textarea required name="reason" className="form-control"/></Field></div><button className="btn btn-primary">Save draft invoice adjustment</button></fieldset></form></section>;
}
export function Receivables() {
  const [version,setVersion]=useState(0), invoices=useResource<RecordData>(`receivables/aging?asOf=${today()}&refresh=${version}`), accounts=useResource<Accounts>('accounts');
  const refresh=()=>{setVersion(v=>v+1);invoices.refresh();};
  return <WorkflowViews label="Receivables views" views={[
    {id:'invoices',title:'Customer invoices',content:<><Register endpoint="receivables" key={`register-${version}`}/><section className={styles.section}><h2>Customer collections</h2><p>Collect invoice payments in the existing customer account workflow.</p><WorkflowLinks/></section></>},
    {id:'adjustments',title:'Credits & write-offs',content:<><ResourceState {...invoices} retry={invoices.refresh}/><ResourceState {...accounts} retry={accounts.refresh}/>
      {invoices.data&&accounts.data&&<details className="mb-3 d-print-none"><summary className="btn btn-primary">New invoice credit / write-off</summary><div className="mt-3"><AdjustmentForm invoices={rowsOf(invoices.data)} accounts={accounts.data} refresh={refresh}/></div></details>}
      <Register endpoint="receivables/adjustments" key={`adjustments-${version}`} actions={(row,reload)=><><ControlledActions row={row} kind="adjustment" refresh={()=>{reload();refresh();}}/><ReversalRequest row={row} kind="adjustment" refresh={()=>{reload();refresh();}}/></>}/></>},
    {id:'reversals',title:'Reversals',content:<><p className={styles.muted}>Restore original invoice allocations after independent approval. Customer cash paid is unchanged.</p><Register endpoint="receivables/adjustment-reversals" key={`reversals-${version}`} actions={(row,reload)=><ReversalActions row={row} kind="adjustment" refresh={()=>{reload();refresh();}}/>}/></>},
    {id:'aging',title:'Aging',content:<Aging kind="receivables" version={version}/>},
  ]}/>;
}
export function Payables() {
  const [version,setVersion]=useState(0), bills=useResource<RecordData>(`payables/bills?asOf=${today()}&refresh=${version}`);
  const linkedId = useSearchParams()?.get('billId'), linkedBill = rowsOf(bills.data).find(bill => String(bill.id) === linkedId);
  const refresh=()=>{setVersion(v=>v+1);bills.refresh();};
  return <WorkflowViews label="Payables views" views={[
    {id:'bills',title:'Supplier bills',content:<>{linkedId && <section aria-label="Linked supplier bill"><h2>Linked supplier bill</h2><ResourceState {...bills} retry={bills.refresh}/>{!bills.loading && !bills.error && (linkedBill ? <DataTable rows={[linkedBill]} columns={['id','supplier_name','source_kind','document_date','due_date','amount','outstanding_amount']} caption="Linked supplier bill"/> : <p role="alert">This bill is unavailable in this branch as of today. Check its invoice date and refresh.</p>)}<p>Select Settlements to allocate a payment to this bill.</p></section>}<div className={`${styles.actions} mb-3 d-print-none`}><Link href="/pharmacy/accounting/suppliers">Supplier statements</Link></div>
      <details className="mb-3 d-print-none"><summary className="btn btn-outline-primary">Register posted receipt bill</summary><div className="mt-3"><BillRegistration refresh={refresh}/></div></details><Register endpoint="payables" key={`register-${version}`}/></>},
    {id:'settlements',title:'Settlements',content:<><ResourceState {...bills} retry={bills.refresh}/>
      {bills.data&&<details className="mb-3 d-print-none"><summary className="btn btn-primary">New allocated supplier settlement</summary><div className="mt-3"><SettlementForm bills={rowsOf(bills.data)} refresh={refresh}/></div></details>}
      <Register endpoint="payables/settlements" key={`settlements-${version}`} actions={(row,reload)=><><ControlledActions row={row} kind="settlement" refresh={()=>{reload();refresh();}}/><ReversalRequest row={row} kind="settlement" refresh={()=>{reload();refresh();}}/></>}/></>},
    {id:'applications',title:'Existing payments & credits',content:<SupplierAllocations refresh={refresh} actions={(row,kind,reload)=><ControlledActions row={row} kind={kind} refresh={reload}/>}/>},
    {id:'reversals',title:'Reversals',content:<><p className={styles.muted}>Reopen original bills only after approval and confirmation that funds were returned or cancelled.</p><Register endpoint="payables/settlement-reversals" key={`reversals-${version}`} actions={(row,reload)=><ReversalActions row={row} kind="settlement" refresh={()=>{reload();refresh();}}/>}/></>},
    {id:'aging',title:'Aging',content:<Aging kind="payables" version={version}/>},
  ]}/>;
}
