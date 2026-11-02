'use client';
import Link from 'next/link';
import { useState } from 'react';
import { documentActions, journalError, record, rowsOf, text, type Accounts, type JournalLine, type RecordData } from '../../../../lib/pharmacyAccounting';
import { usePharmacyAccess } from '../../components/PharmacyWorkspace';
import { LocalAccountSelect } from './Configuration';
import { useMutation, useResource } from './api';
import { DataTable, Facts, Feedback, Field, Money, ReferenceText, ResourceState, styles } from './common';
import { Register } from './Registers';
import layout from './AccountingWorkspace.module.css';

const date = () => new Date().toISOString().slice(0, 10);
export function JournalForm({ onSaved }: { onSaved: () => void }) {
  const accounts = useResource<Accounts>('accounts'), mutation = useMutation();
  const [lines, setLines] = useState<JournalLine[]>([{ account: '', debit: '', credit: '' }, { account: '', debit: '', credit: '' }]);
  const [validation, setValidation] = useState(''), [formKey, setFormKey] = useState(0);
  const update = (index: number, patch: Partial<JournalLine>) => setLines(lines.map((line, i) => i === index ? { ...line, ...patch } : line));
  return <section className={styles.card}><h2>Create draft journal</h2><p className={styles.muted}>Drafts do not post to the general ledger. Submit, independent approval, and posting are separate steps.</p>
    <ResourceState {...accounts} retry={accounts.refresh}/><Feedback error={validation || mutation.error} notice={mutation.notice}/>
    <div className={layout.editorGrid}><form key={formKey} onSubmit={async e => {
      e.preventDefault(); const error = journalError(lines); setValidation(error); if (error) return;
      const f = new FormData(e.currentTarget);
      if (await mutation.mutate('journals', { description: f.get('description'), financialDate: f.get('financialDate'), date: f.get('financialDate'), lines: lines.map(l => ({ account: l.account, debit: Number(l.debit || 0).toFixed(2), credit: Number(l.credit || 0).toFixed(2) })) })) {
        setLines([{ account: '', debit: '', credit: '' }, { account: '', debit: '', credit: '' }]); setFormKey(v => v + 1); onSaved();
      }
    }}><fieldset disabled={mutation.pending || accounts.loading || !!accounts.error}>
      <fieldset><legend className="h6 mb-3">Journal details</legend><div className={styles.grid}><Field label="Description"><input required name="description" maxLength={500} className="form-control"/></Field>
      <Field label="Financial date"><input required type="date" name="financialDate" className="form-control" defaultValue={date()}/></Field></div></fieldset>
      <h3 className="mt-3">Journal lines</h3>
      <p className="small text-muted d-md-none">Scroll horizontally to view all line fields.</p>
      <div className="table-responsive" tabIndex={0} role="region" aria-label="Journal lines; scroll horizontally to view all fields"><table className={styles.table}><thead><tr><th>Account</th><th>Debit</th><th>Credit</th><th>Line</th></tr></thead><tbody>{lines.map((line, index) => <tr key={index}><td><LocalAccountSelect label={`Line ${index+1} account`} accounts={accounts.data?.items || []} value={line.account} onChange={account => update(index, { account })}/></td><td><input aria-label={`Line ${index + 1} debit`} type="number" min="0" step="0.01" className="form-control" value={line.debit} onChange={e => update(index, { debit: e.target.value })}/></td><td><input aria-label={`Line ${index + 1} credit`} type="number" min="0" step="0.01" className="form-control" value={line.credit} onChange={e => update(index, { credit: e.target.value })}/></td><td><button type="button" className="btn btn-outline-danger btn-sm" disabled={lines.length <= 2} onClick={() => setLines(lines.filter((_, i) => i !== index))}>Remove line {index + 1}</button></td></tr>)}</tbody></table></div>
      <div className={layout.saveBar}><button type="button" className="btn btn-outline-primary" disabled={lines.length >= 100} onClick={() => setLines([...lines, { account: '', debit: '', credit: '' }])}>Add line</button><button type="submit" className="btn btn-primary">{mutation.pending ? 'Saving…' : 'Save draft journal'}</button></div>
    </fieldset></form><aside className={layout.editorAside} aria-label="Journal summary"><h3>Review before saving</h3><dl><dt>Debits</dt><dd><Money value={lines.reduce((sum, l) => sum + Number(l.debit || 0), 0)}/></dd><dt>Credits</dt><dd><Money value={lines.reduce((sum, l) => sum + Number(l.credit || 0), 0)}/></dd></dl><p>Debits and credits must balance. Each line uses one side only.</p><p className="mb-0">Saving creates a draft. Submit it for independent approval before posting.</p></aside></div>
  </section>;
}
/** Visibility is a UX aid; the backend enforces authority, version and separation of duties. */
export function DocumentActions({ row, kind, refresh }: { row: RecordData; kind: 'journals' | 'expenses'; refresh: () => void }) {
  const { app, finance } = usePharmacyAccess();
  const actor = record(record(app).user).employeeid ?? record(record(app).user).id;
  const mutation = useMutation(), [action, setAction] = useState(''), [reason, setReason] = useState('');
  const status = String(row.status || ''), actions = documentActions(kind, row, actor, finance);
  const ownDocument = actor !== undefined && [row.created_by, row.submitted_by].some(id => id != null && String(id) === String(actor));
  if (!actions.length) return <span className={styles.muted}>{ownDocument && status === 'submitted' ? 'Independent approval required.' : 'No permitted transitions.'}</span>;
  return <div className="d-print-none"><Feedback {...mutation}/><select disabled={mutation.pending} aria-label={`Action for ${text(row.id)}`} className="form-select" value={action} onChange={e => setAction(e.target.value)}><option value="">Select action</option>{actions.map(a => <option value={a} key={a}>{a}</option>)}</select>
    {action && <form className="mt-2" onSubmit={async e => {
      e.preventDefault(); const f = new FormData(e.currentTarget);
      const body: RecordData = { expectedVersion: Number(row.version), ...(reason ? { reason } : {}) };
      if (['pay','reverse'].includes(action)) { body.date = f.get('financialDate'); body.financialDate = f.get('financialDate'); }
      if (action === 'pay') { body.method = f.get('method'); if (f.get('reference')) body.reference = f.get('reference'); body.amount = f.get('amount'); }
      if (await mutation.mutate(`${kind}/${encodeURIComponent(text(row.id))}/${action}`, body)) { setAction(''); setReason(''); refresh(); }
    }}><fieldset disabled={mutation.pending}>
      {action === 'pay' && <><Field label="Payment amount"><input required type="number" min="0.01" step="0.01" max={String(record(row.details).outstandingAmount || row.amount || '')} name="amount" className="form-control"/></Field><Field label="Method"><select name="method" className="form-select"><option value="cash">Cash</option><option value="card">Card / bank</option><option value="mobile_money">Mobile money</option></select></Field><Field label="Reference (required for non-cash)"><input name="reference" className="form-control"/></Field></>}
      {['pay','reverse'].includes(action) && <Field label="Transaction financial date"><input required type="date" name="financialDate" className="form-control" defaultValue={date()}/></Field>}
      <Field label={['void','reverse'].includes(action) ? 'Reason (required)' : 'Reason (optional)'}><input className="form-control" required={['void','reverse'].includes(action)} value={reason} onChange={e => setReason(e.target.value)}/></Field>
      <p className={styles.muted}>Confirm {action} for {text(row.id)}. This changes financial workflow state.</p><button type="submit" className="btn btn-primary">{mutation.pending ? 'Processing…' : `Confirm ${action}`}</button><button type="button" className="btn btn-link" onClick={() => setAction('')}>Cancel</button>
    </fieldset></form>}
  </div>;
}
export function JournalDetail({ id }: { id: string }) {
  const resource = useResource<RecordData>(`journals/${encodeURIComponent(id)}`);
  const data = record(resource.data), journal = record(data.journal || data.document || data);
  const lines = rowsOf(data.lines || journal.lines || record(journal.details).lines);
  return <section className={styles.card}><Link href="/pharmacy/accounting/journals">← Journal register</Link><h2 className="mt-3">Journal <ReferenceText value={id} field="journal_id"/></h2><ResourceState {...resource} retry={resource.refresh}/>{resource.data && <><Facts data={journal}/><DataTable rows={lines} columns={['account','debit','credit']}/><DocumentActions row={journal} kind="journals" refresh={resource.refresh}/></>}</section>;
}
export function Expenses() {
  const accounts = useResource<Accounts>('accounts'), mutation = useMutation();
  const suppliers = useResource<unknown>('pharmacy/suppliers', true);
  const [version, setVersion] = useState(0);
  return <><details className="mb-3 d-print-none"><summary className="btn btn-primary">New expense draft</summary><section className={`${styles.section} mt-3`}><h2>Record draft expense</h2><ResourceState {...accounts} retry={accounts.refresh}/><Feedback {...mutation}/><div className={layout.editorGrid}><form key={version} onSubmit={async e => {
    e.preventDefault(); const f = new FormData(e.currentTarget);
    if (await mutation.mutate('expenses', { description: f.get('description'), amount: f.get('amount'), expenseAccount: f.get('expenseAccount'), supplierId: f.get('supplierId'), financialDate: f.get('financialDate'), date: f.get('financialDate'), ...(f.get('dueDate') ? { dueDate: f.get('dueDate') } : {}) })) setVersion(v => v + 1);
  }}><fieldset disabled={mutation.pending || accounts.loading || !!accounts.error}><legend className="h6 mb-3">Expense details</legend><div className={styles.grid}><Field label="Description"><input required name="description" className="form-control"/></Field><Field label="Amount"><input required type="number" name="amount" min="0.01" step="0.01" className="form-control"/></Field><Field label="Expense account"><LocalAccountSelect accounts={(accounts.data?.items || []).filter(a => a.type === 'expense')} expense name="expenseAccount"/></Field><Field label="Supplier"><select name="supplierId" required className="form-select"><option value="">Choose active supplier</option>{rowsOf(suppliers.data).filter(row => row.is_active !== false).map(row => <option key={text(row.id)} value={text(row.id)}>{text(row.name)}</option>)}</select></Field><Field label="Financial date"><input required type="date" name="financialDate" className="form-control" defaultValue={date()}/></Field><Field label="Evidenced due date (optional)"><input type="date" name="dueDate" className="form-control"/></Field></div><ResourceState {...suppliers} retry={suppliers.refresh}/><div className={layout.saveBar}><button className="btn btn-primary">{mutation.pending ? 'Saving…' : 'Save expense draft'}</button></div></fieldset></form><aside className={layout.editorAside} aria-label="Expense guidance"><h3>Before you save</h3><p>Use this form for non-inventory expenses. Choose the supplier and the account that matches the expense.</p><p>Use a due date only when it is supported by the supplier document.</p><p className="mb-0">Saving creates a draft, not a payment. Approval and payment are separate steps.</p></aside></div></section>
    </details><Register key={version} endpoint="expenses" actions={(row, refresh) => <><Link href={`/pharmacy/accounting/expenses/${encodeURIComponent(text(row.id))}`}>Review payments, attachments & refunds</Link><DocumentActions row={row} kind="expenses" refresh={refresh}/></>}/></>;
}
