'use client';
import { useState } from 'react';
import { accountEditPayload, financialQuery, record, rowsOf, text, type Accounts, type Account, type Settings, type RecordData } from '../../../../lib/pharmacyAccounting';
import { useMutation, useResource } from './api';
import { DataTable, Facts, Feedback, Field, ResourceState, styles } from './common';
import { canonicalControl, configurationIssues, requiredMappingCategories } from '../../../../lib/pharmacyAccountingConfiguration';

export function AccountSelect({ accounts, name, required = true, value, onChange, label = 'Shared general-ledger account' }: { accounts: Account[]; name?: string; required?: boolean; value?: string; onChange?: (value: string) => void; label?: string }) {
  return <select aria-label={label} name={name} required={required} className="form-select" value={value} onChange={onChange ? e => onChange(e.target.value) : undefined}><option value="">Select an account</option>{accounts.filter(a => a.is_active !== false).map(a => <option key={a.id} value={a.account_code}>{a.account_code} — {a.name}</option>)}</select>;
}
export function LocalAccountSelect({ accounts, name, value, onChange, expense = false, label }: { accounts: Account[]; name?: string; value?: string; onChange?: (value: string) => void; expense?: boolean; label?: string }) {
  const options = accounts.filter(a => a.is_active !== false).flatMap(a => (a.local_codes || []).filter(code => !expense || code === 'operating_expenses' || code.startsWith('expense:')).map(code => ({ code, name: a.name })));
  return <select aria-label={label} name={name} required className="form-select" value={value} onChange={onChange ? e => onChange(e.target.value) : undefined}><option value="">Select mapped local account</option>{options.map(a => <option key={a.code} value={a.code}>{a.code} — {a.name}</option>)}</select>;
}
export function ChartOfAccounts() {
  const resource = useResource<Accounts>('accounts'), mutation = useMutation();
  const [editing, setEditing] = useState<Account | null>(null), [version, setVersion] = useState(0);
  return <><details className="mb-3 d-print-none" open={!!editing}><summary className="btn btn-primary">{editing?'Edit selected account':'New local account'}</summary><section className={`${styles.section} mt-3`}><h2>{editing ? `Edit ${editing.account_code}` : 'Create local account'}</h2><p className={styles.muted}>Local account codes must be explicitly mapped to an active shared general-ledger account before posting.</p>
    <Feedback {...mutation}/><form key={version} onSubmit={async e => {
      e.preventDefault(); const f = new FormData(e.currentTarget);
      const body = editing ? accountEditPayload({ name: String(f.get('name')), parentAccountId: String(f.get('parentAccountId') || ''), isActive: f.get('isActive') === 'on' })
        : { accountCode: String(f.get('accountCode')), name: String(f.get('name')), type: String(f.get('type')), normalBalance: String(f.get('normalBalance')), parentAccountId: f.get('parentAccountId') ? Number(f.get('parentAccountId')) : null, localCode: f.get('localCode') || undefined };
      if (await mutation.mutate(editing ? `accounts/${editing.id}` : 'accounts', body, editing ? 'PUT' : 'POST')) { setEditing(null); setVersion(v => v + 1); resource.refresh(); }
    }}><fieldset disabled={mutation.pending || resource.loading}><div className={styles.grid}>
      <Field label="Account code"><input required readOnly={!!editing} maxLength={20} name="accountCode" className="form-control" defaultValue={editing?.account_code}/></Field>
      <Field label="Account name"><input required name="name" className="form-control" defaultValue={editing?.name}/></Field>
      <Field label="Account type"><select required disabled={!!editing} className="form-select" name="type" defaultValue={editing?.type || ''}><option value="">Choose type</option>{['asset','liability','equity','revenue','expense'].map(type => <option key={type}>{type}</option>)}</select></Field>
      <Field label="Normal balance"><select disabled={!!editing} name="normalBalance" className="form-select" defaultValue={editing?.normal_balance || 'debit'}><option>debit</option><option>credit</option></select></Field>
      <Field label="Parent account (optional)"><select className="form-select" name="parentAccountId" defaultValue={String(editing?.parent_account_id || '')}><option value="">No parent</option>{resource.data?.items.filter(a => a.id !== editing?.id).map(a => <option key={a.id} value={a.id}>{a.account_code} — {a.name}</option>)}</select></Field>
      {!editing && <Field label="Local mapping code (optional)"><input name="localCode" className="form-control"/></Field>}
    </div>{editing && <label className="mb-3 d-block"><input type="checkbox" name="isActive" defaultChecked={editing.is_active !== false}/> Active account</label>}<button type="submit" className="btn btn-primary">{mutation.pending ? 'Saving…' : editing ? 'Save changes' : 'Create account'}</button>{editing && <button type="button" className="btn btn-link" onClick={() => { setEditing(null); setVersion(v => v + 1); }}>Cancel edit</button>}</fieldset></form>
  </section></details><section className={styles.card}><h2>Local chart of accounts</h2><ResourceState {...resource} retry={resource.refresh}/>{resource.data && <DataTable rows={resource.data.items.map(a => ({ ...a }))} columns={['account_code','name','type','normal_balance','parent_account_id','is_active','local_codes']} inlineActions actions={row => <button className="btn btn-sm btn-outline-primary" type="button" onClick={() => { setEditing(row as unknown as Account); setVersion(v => v + 1); window.scrollTo({ top: 0, behavior: 'auto' }); }}>Edit</button>}/>}</section></>;
}
export function SettingsEditor({ initial, accounts, refresh, collectionAccounts = [] }: { initial: Settings; accounts: Accounts; refresh: () => void; collectionAccounts?: RecordData[] }) {
  const [enabled, setEnabled] = useState(initial.enabled), [effective, setEffective] = useState(initial.effective_date?.slice(0, 10) || '');
  const [mappings, setMappings] = useState<Record<string, string>>({ ...Object.fromEntries([...requiredMappingCategories, 'liability:grni', 'asset:input_tax'].map(key => [key, ''])), ...initial.mappings });
  const [newCode, setNewCode] = useState(''), [validation, setValidation] = useState(''); const mutation = useMutation();
  return <form onSubmit={async e => {
    e.preventDefault(); setValidation('');
    const mapped = Object.fromEntries(Object.entries(mappings).filter(([, code]) => code));
    if (enabled && (!effective || !Object.keys(mapped).length)) { setValidation('Enabling requires an effective date and explicit mappings. The server validates required posting categories.'); return; }
    const issues=configurationIssues(enabled,mapped,collectionAccounts);
    if(issues.length){setValidation(issues.join(' '));return;}
    if (await mutation.mutate('settings', { enabled, effective_date: effective || null, mappings: mapped }, 'PUT')) refresh();
  }}><Feedback error={validation || mutation.error} notice={mutation.notice}/>
    <fieldset disabled={mutation.pending}><label className="d-block mb-3"><input type="checkbox" checked={enabled} onChange={e => setEnabled(e.target.checked)}/> Enable shared-ledger posting for configured transactions</label>
      <Field label="Effective date"><input type="date" required={enabled} className="form-control" value={effective} onChange={e => setEffective(e.target.value)}/></Field>
      <p className={styles.muted}>No live backfill. Transactions before this date stay as local evidence. Missing mappings must be resolved, never guessed.</p>
      <p className={styles.muted}>Before accepting new pharmacy deliveries with shared posting enabled, map liability:grni to a separate goods-received-not-invoiced liability account, not supplier payables. Map asset:input_tax only when recoverable purchase tax applies.</p>
      <p className="alert alert-info">Enabled shared reporting currently requires canonical AR/AP, inventory/COGS and cash controls. Requirements below are validation constraints, not account allocations. Select every mapping explicitly. Disabled drafts may be incomplete; custom core controls require a reviewed report-classification migration.</p>
      <div className="table-responsive"><table className={styles.table}><thead><tr><th>Local code / posting category</th><th>Shared GL account</th><th>Required canonical control when enabled</th></tr></thead><tbody>{Object.entries(mappings).map(([key, value]) => <tr key={key}><th scope="row">{key}</th><td><AccountSelect label={`Shared GL account for ${key}`} accounts={accounts.sharedAccounts} required={false} value={value} onChange={code => setMappings({ ...mappings, [key]: code })}/></td><td>{canonicalControl(key,collectionAccounts)||'Explicit active account of the required type'}</td></tr>)}</tbody></table></div>
      <div className={`${styles.actions} mt-3`}><Field label="Additional local code"><input className="form-control" value={newCode} onChange={e => setNewCode(e.target.value)}/></Field><button type="button" className="btn btn-outline-secondary" disabled={!newCode.trim() || newCode in mappings} onClick={() => { setMappings({ ...mappings, [newCode.trim()]: '' }); setNewCode(''); }}>Add mapping</button></div>
      <button type="submit" className="btn btn-primary">{mutation.pending ? 'Saving…' : 'Save posting configuration'}</button>
    </fieldset></form>;
}
export function AccountingSettings() {
  const settings = useResource<Settings>('settings'), accounts = useResource<Accounts>('accounts');
  const collections=useResource<unknown>('pharmacy/collection-accounts',true);
  return <><section className={styles.card}><h2>Shared-ledger posting settings</h2>
    <ResourceState {...settings} retry={settings.refresh}/><ResourceState {...accounts} retry={accounts.refresh}/><ResourceState {...collections} retry={collections.refresh}/>
    {settings.data && <p className={`alert ${settings.data.enabled ? 'alert-info' : 'alert-warning'}`}>{settings.data.enabled ? `Posting enabled from ${settings.data.effective_date || 'date not supplied — review configuration'}.` : 'Shared-ledger posting is not enabled. Local transaction evidence is not proof of a shared GL posting.'}</p>}
    {settings.data && accounts.data && <SettingsEditor key={JSON.stringify(settings.data)} initial={settings.data} accounts={accounts.data} collectionAccounts={rowsOf(collections.data)} refresh={settings.refresh}/>}
  </section><Consolidation enabled={settings.data?.enabled === true}/></>;
}
export function Consolidation({ enabled }: { enabled: boolean }) {
  const [filters, setFilters] = useState({ from: '', to: '' }), [reviewed, setReviewed] = useState({ from: '', to: '' });
  const rangeSelected = !!reviewed.from && !!reviewed.to && reviewed.from <= reviewed.to;
  // Never scan all historical sources merely because Settings was opened.
  const status = useResource<RecordData>(`consolidation?${financialQuery(reviewed)}`, false, rangeSelected);
  const reconciliation = useResource<RecordData>(`consolidation/reconciliation?${financialQuery(reviewed)}`, false, rangeSelected);
  const mutation = useMutation();
  const pending=record(status.data),check=record(reconciliation.data),sourceRows=rowsOf(pending.items),comparison=rowsOf(check.rows);
  const journalIds=sourceRows.map(row=>row.id);
  const validIds=journalIds.length>0&&journalIds.length<=100&&pending.reviewLimit===100&&check.reviewLimit===100&&new Set(journalIds).size===journalIds.length&&journalIds.every(id=>typeof id==='string'&&id.trim()&&id.length<=64);
  const rangeMatches=!!reviewed.from&&!!reviewed.to&&pending.from===reviewed.from&&pending.to===reviewed.to&&check.from===reviewed.from&&check.to===reviewed.to;
  const linkedMismatch=Number(check.linkedMismatchCount)>0||comparison.some(row=>row.shared_entry_id!=null&&[row.debitDifference,row.creditDifference].some(value=>value==null||!Number.isFinite(Number(value))||Number(value)!==0));
  const unlinkedEvidence=new Set(comparison.filter(row=>row.shared_entry_id==null).map(row=>row.journal_id));
  const reviewedSources=validIds&&journalIds.every(id=>unlinkedEvidence.has(id));
  const orphanCount=Number(check.unlinkedShared);
  // Missing local links are the intended cutover batch, not a reason to require balanced=true.
  // Existing shared or linked mismatches must instead be resolved before adding shared postings.
  const ready=enabled&&rangeMatches&&reviewedSources&&check.fullyChecked===true&&check.linkedMismatchCount===0&&typeof check.unlinkedShared==='number'&&orphanCount===0&&Array.isArray(check.orphanSharedEntries)&&check.orphanSharedEntries.length===0&&!linkedMismatch&&!status.loading&&!status.error&&!reconciliation.loading&&!reconciliation.error;
  return <section className={styles.card}><h2>Shared-book consolidation review</h2><ResourceState {...status} retry={status.refresh}/>{status.data&&<><Facts data={status.data}/><p className={styles.muted}>{text(record(status.data).note)}</p><DataTable rows={rowsOf(record(status.data).items)}/></>}
    {!rangeSelected && <p role="status">Choose and review an explicit historical date range to load consolidation evidence. No full-history scan runs automatically.</p>}
    {pending.truncated === true && <p role="alert" className="alert alert-warning">This is a bounded review batch: only the first {journalIds.length.toLocaleString()} unlinked sources are loaded, not all {Number(pending.unlinked).toLocaleString()} remaining sources. Each batch contains at most 100 journals. Confirmation submits only these loaded IDs. Reload and review each remaining batch separately; nothing automatically replays all history.</p>}
    <form className={`${styles.actions} mt-3`} onSubmit={e => { e.preventDefault(); setReviewed({ ...filters }); }}><Field label="Historical range from"><input required type="date" className="form-control" value={filters.from} onChange={e => setFilters({ ...filters, from: e.target.value })}/></Field><Field label="Historical range to"><input required type="date" min={filters.from || undefined} className="form-control" value={filters.to} onChange={e => setFilters({ ...filters, to: e.target.value })}/></Field><button type="submit" className="btn btn-outline-primary">Review range reconciliation</button></form>
    <ResourceState {...reconciliation} retry={reconciliation.refresh}/>{reconciliation.data&&<><Facts data={reconciliation.data}/>
    {check.fullyChecked===true ? <p role="status">Source integrity was scanned across the full selected date range. Global linked mismatches: {Number(check.linkedMismatchCount).toLocaleString()}. Tables show bounded review samples, not every scanned journal.</p> : <p role="alert" className="alert alert-warning">Full-range source integrity has not been confirmed. Consolidation is blocked.</p>}
    {check.rowsTruncated===true&&<p className={styles.muted}>Reconciliation rows are sampled: first 100 unlinked sources, first 100 linked sources and first 100 mismatch sources. Global counts and full-range integrity checks are not limited to these displayed rows.</p>}
    <DataTable rows={rowsOf(reconciliation.data)}/>
    <h3>Shared pharmacy entries without a local posting link</h3><DataTable rows={rowsOf(check.orphanSharedEntries)}/></>}
    {check.orphanSharedEntriesTruncated===true&&<p role="alert" className="alert alert-warning">Only the first 100 orphan shared entries are displayed. The exact global orphan count is {orphanCount.toLocaleString()}; any orphan blocks consolidation.</p>}
    {orphanCount>0&&<p role="alert" className="alert alert-danger">Consolidation is blocked: shared pharmacy entries have no local source link. Review and reconcile them before adding postings; automatic replay could duplicate shared books.</p>}
    {linkedMismatch&&<p role="alert" className="alert alert-danger">Consolidation is blocked: existing linked journals have debit or credit differences. The full-range mismatch count applies even when affected journals are outside the displayed sample.</p>}
    {rangeMatches&&journalIds.length>0&&!reviewedSources&&<p role="alert" className="alert alert-warning">Loaded source IDs do not match unlinked reconciliation evidence. Refresh both registers and review again.</p>}
    <Feedback {...mutation}/>
    <div role="note" className="alert alert-warning mt-3"><strong>Historical consolidation changes shared books.</strong> It is not automatic backfill. Review the date range, local evidence, explicit mappings and reconciliation first. Closed periods reject posting. Never allocate missing mappings by guesswork.</div>
    {!enabled && <p role="status">Consolidation is unavailable while mapped shared-ledger posting is disabled.</p>}
    <form onSubmit={async e => {
      e.preventDefault(); const f = new FormData(e.currentTarget);
      if(!ready||f.get('confirmed')!=='on')return;
      if (await mutation.mutate('consolidation', { ...reviewed, journalIds, confirmed: true, reason: f.get('reason') })) { await Promise.all([status.refresh(),reconciliation.refresh()]); }
    }} key={journalIds.join('|')}><fieldset disabled={mutation.pending || !ready}>
      <p>Reviewed range: {reviewed.from || 'Not selected'} — {reviewed.to || 'Not selected'}. Loaded batch: {journalIds.length} source journals.</p><Field label="Review evidence and consolidation reason"><textarea required name="reason" className="form-control"/></Field><label className="d-block mb-3"><input required type="checkbox" name="confirmed"/> I reviewed these loaded source IDs, mappings and reconciliation and authorize this batch to change shared books.</label><button type="submit" className="btn btn-danger">{mutation.pending ? 'Consolidating…' : 'Consolidate reviewed source batch'}</button>
    </fieldset></form>
  </section>;
}
