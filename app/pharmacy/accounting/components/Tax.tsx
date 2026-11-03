'use client';
import Link from 'next/link';
import { useState } from 'react';
import { financialQuery, record, type Accounts, type Settings } from '../../../../lib/pharmacyAccounting';
import { filterTaxTransactions, taxLiabilityOptions, taxRulePayload, type TaxData, type TaxFilters, type TaxTransaction } from '../../../../lib/pharmacyTax';
import { MedicinePicker, usePharmacyAccess } from '../../components/PharmacyWorkspace';
import { useMutation, useResource } from './api';
import { DataTable, Feedback, Field, ResourceState, styles } from './common';
import { downloadAccountingExport } from './exports';
import { Register } from './Registers';
import DateFilterReusable from '../../../../components/operations/Laboratory/ResuableFilter/DateFilterReusable';

interface Medicine { id: string | number; name: string }
export function TaxRuleForm({ accounts, settings, refresh }: { accounts: Accounts; settings: Settings; refresh: () => void }) {
  const { manager } = usePharmacyAccess();
  const mutation = useMutation(), [medicine, setMedicine] = useState<Medicine | null>(null);
  const [validation, setValidation] = useState(''), [version, setVersion] = useState(0);
  const options = taxLiabilityOptions(accounts, settings);
  if (!manager) return <p role="status" className="alert alert-info">Finance can review tax rules and transaction evidence. Only a pharmacy manager or administrator can configure medicine tax rules.</p>;
  return <section className={`${styles.card} d-print-none`}><h2>Assign an explicit medicine tax rule</h2>
    <p>Tax is included in the existing selling price. This rule splits that gross amount into net revenue and a tax liability; it does not add a charge to the selling total.</p>
    {!options.length && <p role="status" className="alert alert-warning">{settings.enabled ? <>No eligible tax liability is mapped. Explicitly map a <code>liability:&lt;tax-account&gt;</code> code in <Link href="/pharmacy/accounting/settings">Accounting settings</Link>.</> : <>Create an active local liability account in the chart of accounts.</>}</p>}
    <Feedback error={validation || mutation.error} notice={mutation.notice}/>
    <form key={version} onSubmit={async e => {
      e.preventDefault(); setValidation(''); const f = new FormData(e.currentTarget);
      try {
        const body = taxRulePayload({ itemId: medicine?.id ?? '', rate: String(f.get('rate') ?? ''), localAccount: String(f.get('localAccount') ?? ''), effectiveDate: String(f.get('effectiveDate') ?? ''), reason: String(f.get('reason') ?? '') }, options.map(a => a.localAccount));
        if (await mutation.mutate('tax/rules', body)) { setMedicine(null); setVersion(v => v + 1); refresh(); }
      } catch (error) { setValidation(error instanceof Error ? error.message : 'Review the tax rule fields.'); }
    }}><fieldset disabled={mutation.pending || !options.length}>
      <MedicinePicker onSelect={(value: unknown) => {
        const item = record(value), id = item.inventoryItemId;
        if ((typeof id === 'string' || typeof id === 'number') && typeof item.name === 'string') { setMedicine({ id, name: item.name }); setValidation(''); }
        else setValidation('The catalogue did not provide a valid medicine identifier.');
      }}/>
      {medicine ? <p role="status">Selected medicine: <strong>{medicine.name}</strong> · {medicine.id}</p> : <p>Select one medicine from the catalogue. A rule never applies to unassigned medicines.</p>}
      <div className={styles.grid}><Field label="Tax rate (%)"><input required type="number" step="0.0001" min="0" max="100" name="rate" className="form-control" aria-describedby="tax-rate-unit"/></Field>
        <Field label={settings.enabled ? "Mapped tax liability" : "Local tax liability"}><select required name="localAccount" className="form-select"><option value="">Select a configured liability</option>{options.map(a => <option value={a.localAccount} key={a.localAccount}>{a.localAccount} — {a.code} · {a.name}</option>)}</select></Field>
        <Field label="Rule effective date (no backdating)"><input required type="date" min={new Date().toISOString().slice(0,10)} name="effectiveDate" className="form-control"/></Field>
        <Field label="Policy evidence / reason"><textarea required maxLength={1000} name="reason" className="form-control"/></Field>
      </div>
      <p id="tax-rate-unit" className={styles.muted}>Enter an approved percentage rate, with up to four decimal places. No rate, jurisdiction or default liability is inferred.</p>
      <p className={styles.muted}>Rule changes affect eligible subsequent sales only. Refunds reverse the original sale's recorded tax snapshot, never a later rate.</p>
      <button type="submit" className="btn btn-primary" disabled={!medicine}>{mutation.pending ? 'Saving rule…' : 'Save explicit tax rule'}</button>
    </fieldset></form>
  </section>;
}
const columns = ['id','sale_id','sale_line_id','financial_date','event_type','gross_amount','net_amount','tax_amount','rate','local_account'];
export function TaxTransactions({ transactions, range = { from: '', to: '' } }: { transactions: TaxTransaction[]; range?: { from: string; to: string } }) {
  const [filters, setFilters] = useState<TaxFilters>({ from: '', to: '', search: '', eventType: '' });
  const [page, setPage] = useState(1), [count, setCount] = useState(25);
  const [exporting, setExporting] = useState(false), [error, setError] = useState('');
  const filtered = filterTaxTransactions(transactions, filters), pages = Math.max(1, Math.ceil(filtered.length / count)), current = Math.min(page, pages);
  const displayed = filtered.slice((current - 1) * count, current * count);
  function update(patch: Partial<TaxFilters>) { setFilters({ ...filters, ...patch }); setPage(1); }
  async function exportRows(format: 'pdf' | 'xlsx') {
    setExporting(true); setError('');
    try { await downloadAccountingExport(format, 'Pharmacy tax transactions', { rows: filtered.map(row => ({ ...row })), metadata: { columns } }, `${range.from || 'Beginning of records'} to ${range.to || 'latest'}; ${filtered.length} filtered snapshots from ${transactions.length} complete server-filtered records. Tax-inclusive prices.`); }
    catch (e) { setError(e instanceof Error ? e.message : 'Tax export failed.'); }
    finally { setExporting(false); }
  }
  return <section className={styles.card}><h2>Tax transaction register</h2><p className={styles.muted}>All server-filtered snapshots from {range.from || 'the beginning of records'} to {range.to || 'the latest transaction'}. Requests exceeding 10,000 rows are rejected rather than truncated. Reversal event types identify original snapshots; historical tax is never recomputed here.</p><Feedback error={error}/>
    <div className={`${styles.actions} d-print-none`}><Field label="Search source / account"><input type="search" className="form-control" value={filters.search} onChange={e => update({ search: e.target.value })}/></Field><Field label="Event type"><select className="form-select" value={filters.eventType} onChange={e => update({ eventType: e.target.value })}><option value="">All event types</option>{Array.from(new Set(transactions.map(row => row.event_type))).map(type => <option key={type}>{type}</option>)}</select></Field></div>
    <p>{filtered.length.toLocaleString()} matching transactions of {transactions.length.toLocaleString()} server-filtered records · page {current} of {pages}</p><DataTable rows={displayed.map(row => ({ ...row }))} columns={columns} pageSlice/>
    <div className={`${styles.actions} mt-3 d-print-none`}><button type="button" className="btn btn-outline-secondary" disabled={current === 1} onClick={() => setPage(current - 1)}>Previous</button><button type="button" className="btn btn-outline-secondary" disabled={current >= pages} onClick={() => setPage(current + 1)}>Next</button><label>Rows <select aria-label="Tax transaction rows per page" value={count} onChange={e => { setCount(Number(e.target.value)); setPage(1); }}>{[25,50,100].map(n => <option key={n}>{n}</option>)}</select></label><button type="button" className="btn btn-outline-secondary" onClick={() => window.print()}>Print / Save PDF (displayed rows)</button><button type="button" disabled={exporting || !filtered.length} className="btn btn-outline-secondary" onClick={() => exportRows('xlsx')}>Excel · all filtered rows</button><button type="button" disabled={exporting || !filtered.length} className="btn btn-outline-secondary" onClick={() => exportRows('pdf')}>PDF · all filtered rows</button></div>
  </section>;
}
export default function Tax() {
  const [range, setRange] = useState({ from: '', to: '' });
  const [draft,setDraft]=useState(range),[preset,setPreset]=useState('');
  const tax = useResource<TaxData>(`tax?${financialQuery(range)}`), accounts = useResource<Accounts>('accounts'), settings = useResource<Settings>('settings');
  return <><section className={styles.section} aria-busy={tax.loading}><h2>Tax-inclusive medicine accounting</h2>
    <p>Existing selling totals are unchanged. This is transaction evidence, not a jurisdictional filing or tax-rate recommendation.</p>
    <form className={`${styles.actions} d-print-none mb-3`} onSubmit={e => { e.preventDefault(); const f = new FormData(e.currentTarget); setRange({ from: String(f.get('from') || ''), to: String(f.get('to') || '') }); }}>
      <Field label="Date preset"><DateFilterReusable value={preset} onChange={setPreset} onDateRangeChange={(from,to)=>setDraft({from,to})} label="Choose tax financial range"/></Field>
      <Field label="Financial date from"><input type="date" name="from" value={draft.from} onChange={e=>setDraft({...draft,from:e.target.value})} className="form-control"/></Field>
      <Field label="Financial date to"><input type="date" name="to" min={draft.from||undefined} value={draft.to} onChange={e=>setDraft({...draft,to:e.target.value})} className="form-control"/></Field>
      <button type="submit" className="btn btn-primary">Load complete filtered tax history</button><button type="button" className="btn btn-outline-secondary" onClick={()=>tax.refresh()} disabled={tax.loading}>Refresh tax evidence</button>
    </form><ResourceState {...tax} retry={tax.refresh}/>{tax.data&&<p className="alert alert-info">{tax.data.policy}</p>}
  </section>
    {tax.data && <TaxTransactions key={JSON.stringify([range,tax.data.transactions])} transactions={tax.data.transactions} range={range}/>}
    {tax.data&&<details className="mb-3"><summary>Recorded medicine tax rules</summary><DataTable rows={tax.data.rules.map(rule=>({...rule}))} columns={['id','item_id','rate','local_account','effective_date','reason','is_active']}/>{!tax.data.rules.length&&<p role="status">No explicit medicine rules have been returned. No tax rate will be assumed.</p>}</details>}
    <details className="mb-3 d-print-none"><summary>Configure an explicit medicine tax rule</summary><ResourceState {...accounts} retry={accounts.refresh}/><ResourceState {...settings} retry={settings.refresh}/>
      {tax.data && accounts.data && settings.data && <TaxRuleForm accounts={accounts.data} settings={settings.data} refresh={tax.refresh}/>}
    </details>
    <section className={styles.card}><h2>Frozen-snapshot tax credit / reversal evidence</h2><p>Separate from original sale and refund tax events. Credits allocate original gross, net and tax snapshots; reversals copy the exact signed original allocation. Current medicine rates are never substituted. Untaxed residual components have no original tax account or rate. Earlier credits without allocation evidence require explicit historical reconciliation.</p></section>
    <Register endpoint="tax-credits"/>
  </>;
}
