'use client';
import Link from 'next/link';
import { useState } from 'react';
import { csv, financialQuery, record, rowsOf, text, type RecordData } from '../../../../lib/pharmacyAccounting';
import DateFilterReusable from '../../../../components/operations/Laboratory/ResuableFilter/DateFilterReusable';
import { request, useResource } from './api';
import { DataTable, Facts, Feedback, Field, label, money, Money, ResourceState, styles, SummaryMetrics, WorkflowLinks } from './common';
import { downloadAccountingExport, fullFilteredExport } from './exports';
import SupplierPicker from './SupplierPicker';

const today = () => new Date().toISOString().slice(0, 10);
const ledgerColumns=['date','journal_id','account','description','source_document','business_unit','debit','credit','running_balance'];
const ledgerLabels={date:'Date',journal_id:'Journal ref',account:'Account code / name',description:'Description',source_document:'Source document',business_unit:'Business unit',debit:'Debit',credit:'Credit',running_balance:'Running balance'};
const approvalRegisters=['journals','expenses','payables/settlements','receivables/adjustments','payables/settlement-reversals','receivables/adjustment-reversals','payables/allocations','payables/allocation-reversals'];
const approvalStatuses=(endpoint:string)=>endpoint==='expenses'?['draft','submitted','approved','partially_paid','paid','partially_refunded','refunded','reversed','voided']
  : ['draft','submitted','approved',endpoint==='payables/settlements'?'paid':'posted',...(['journals','payables/settlements','receivables/adjustments'].includes(endpoint)?['reversed']:[]),'voided'];
export function Register({ endpoint, ledger = false, report, supplier = false, initialAccount = '', actions }: {
  endpoint: string; ledger?: boolean; report?: string; supplier?: boolean; initialAccount?: string; actions?: (row: RecordData, refresh: () => void) => React.ReactNode;
}) {
  const [filters, setFilters] = useState({ from: report ? `${today().slice(0, 4)}-01-01` : '', to: today(), account: initialAccount, search: '', status: '', entityId: '', action: '', saleId: '', sourceCreditId: '' });
  const [applied, setApplied] = useState(filters), [page, setPage] = useState(1), [count, setCount] = useState(25);
  const [statement, setStatement] = useState(report || 'profit_loss');
  const [supplierId, setSupplierId] = useState(''), [selectedSupplier, setSelectedSupplier] = useState('');
  const [exportError, setExportError] = useState(''), [exporting, setExporting] = useState(false);
  const [preset,setPreset]=useState(''),[supplierName,setSupplierName]=useState(''),[selectedName,setSelectedName]=useState('');
  const query = financialQuery({ ...applied, page, count, limit: count, offset: (page - 1) * count, ...(report ? { report: statement } : {}) });
  const path = supplier ? selectedSupplier ? `suppliers/${encodeURIComponent(selectedSupplier)}/statement?${query}` : `pharmacy/suppliers?${query}` : `${endpoint}?${query}`;
  const resource = useResource<unknown>(path, supplier && !selectedSupplier);
  const data = record(resource.data), rows = rowsOf(resource.data);
  const serverTotal = data.total ?? record(data.totals).count;
  const total = Number(serverTotal ?? rows.length);
  const dateSupported = ledger || !!report || supplier || ['receivables','revenue','tax-credits'].includes(endpoint);
  const columns = ledger?ledgerColumns:Array.isArray(data.columns) ? data.columns.map(column => typeof column === 'string' ? column : String(record(column).key || record(column).field || '')).filter(Boolean) : undefined;
  if(report&&columns&&rows.some(row=>row.account_name)&&!columns.includes('account_name')) columns.splice(Math.max(0,columns.indexOf('account')+1),0,'account_name');
  if(report&&columns&&rows.some(row=>row.document_ref)&&!columns.includes('document_ref')) columns.push('document_ref');
  const columnLabels = ledger?ledgerLabels:Array.isArray(data.columns) ? Object.fromEntries(data.columns.filter(c => typeof c === 'object').map(c => {
    const column = record(c); return [String(column.key || column.field || ''), String(column.label || column.title || column.key || column.field || '')];
  })) : {};
  const groups = report && rows.some(row => row.section) ? Array.from(new Set(rows.map(row => text(row.section)))) : [];
  async function exportLedger() {
    setExporting(true); setExportError('');
    try {
      const result = await request<unknown>(`ledger?${financialQuery({ ...applied, all: true })}`);
      const exportData = record(result), all = rowsOf(result);
      if (exportData.truncated === true || Number(exportData.total ?? all.length) > all.length) throw Error('Export exceeds the server limit. Narrow the date range before exporting.');
      const keys = all.length ? Object.keys(all[0]) : columns || [];
      const url = URL.createObjectURL(new Blob([csv(all, keys)], { type: 'text/csv;charset=utf-8' }));
      const a = document.createElement('a'); a.href = url; a.download = 'pharmacy-general-ledger.csv'; a.click(); URL.revokeObjectURL(url);
    } catch (e) { setExportError(e instanceof Error ? e.message : 'Export failed.'); }
    finally { setExporting(false); }
  }
  async function exportDocument(format: 'pdf' | 'xlsx') {
    setExporting(true); setExportError('');
    try {
      const exportEndpoint = supplier ? selectedSupplier ? `suppliers/${encodeURIComponent(selectedSupplier)}/statement` : 'pharmacy/suppliers' : endpoint;
      const result = await fullFilteredExport(exportEndpoint, { ...applied, ...(report ? { report: statement } : {}) }, { ledger, external: supplier && !selectedSupplier, unpaged: supplier||!!report });
      await downloadAccountingExport(format, `Pharmacy ${report ? label(statement) : supplier && selectedSupplier ? 'Supplier statement' : label(endpoint)}`, result, `${dateSupported ? `${applied.from || 'Beginning of records'} to ${applied.to}` : 'Current source register'} • ${result.rows.length} rows • Pharmacy-local evidence`);
    } catch (e) { setExportError(e instanceof Error ? e.message : 'Export failed.'); }
    finally { setExporting(false); }
  }
  return <section className={styles.section} aria-busy={resource.loading||exporting}>
    <form className={`${styles.actions} d-print-none mb-3`} onSubmit={e => { e.preventDefault(); setApplied(filters); setSelectedSupplier(supplierId);setSelectedName(supplierName); setPage(1); }}>
      {dateSupported&&<div className={`${styles.field} d-flex flex-column gap-1 mb-3`}><label htmlFor="accounting-date-preset">Date preset</label><DateFilterReusable id="accounting-date-preset" value={preset} onChange={setPreset} onDateRangeChange={(from,to)=>setFilters({...filters,from,to})} label="Choose accounting date range"/></div>}
      {dateSupported && <><Field label="From"><input type="date" className="form-control" value={filters.from} onChange={e => setFilters({ ...filters, from: e.target.value })}/></Field>
      <Field label="To"><input required type="date" min={filters.from || undefined} className="form-control" value={filters.to} onChange={e => setFilters({ ...filters, to: e.target.value })}/></Field></>}
      {ledger && <Field label="Account code"><input className="form-control" value={filters.account} onChange={e => setFilters({ ...filters, account: e.target.value })}/></Field>}
      {ledger && <Field label="Search"><input type="search" className="form-control" value={filters.search} onChange={e => setFilters({ ...filters, search: e.target.value })}/></Field>}
      {endpoint === 'tax-credits' && <><Field label="Original sale ID"><input className="form-control" value={filters.saleId} onChange={e => setFilters({ ...filters, saleId: e.target.value })}/></Field><Field label="Source credit ID"><input className="form-control" value={filters.sourceCreditId} onChange={e => setFilters({ ...filters, sourceCreditId: e.target.value })}/></Field></>}
      {approvalRegisters.includes(endpoint) && <Field label="Status"><select className="form-select" value={filters.status} onChange={e => setFilters({ ...filters, status: e.target.value })}><option value="">All statuses</option>{approvalStatuses(endpoint).map(status => <option key={status}>{status}</option>)}</select></Field>}
      {endpoint === 'audit' && <><Field label="Entity ID"><input className="form-control" value={filters.entityId} onChange={e => setFilters({ ...filters, entityId: e.target.value })}/></Field><Field label="Audit action"><input className="form-control" value={filters.action} onChange={e => setFilters({ ...filters, action: e.target.value })}/></Field></>}
      {supplier && <div className={`${styles.field} d-flex flex-column gap-1 mb-3`}><label htmlFor="accounting-supplier">Supplier</label><SupplierPicker value={supplierId} onChange={(id,name)=>{setSupplierId(id);setSupplierName(name);}}/></div>}
      {report && report !== 'trial_balance' && <Field label="Statement"><select className="form-select" value={statement} onChange={e => { setStatement(e.target.value); setPage(1); }}>{[['profit_loss','Profit & loss'],['balance_sheet','Balance sheet'],['cash_flow','Cash flow'],['transactions','Transactions']].map(([value,label]) => <option value={value} key={value}>{label}</option>)}</select></Field>}
      <button className="btn btn-primary" type="submit">Apply filters</button>
      <button className="btn btn-outline-secondary" type="button" disabled={resource.loading} onClick={() => resource.refresh()}>Refresh</button>
      <button className="btn btn-outline-secondary" type="button" disabled={resource.loading || !!resource.error || !resource.data} onClick={() => window.print()}>Print / Save PDF (displayed rows)</button>
      <button className="btn btn-outline-secondary" type="button" disabled={exporting || resource.loading || !!resource.error} onClick={() => exportDocument('xlsx')}>{exporting ? 'Exporting…' : 'Excel · all filtered rows'}</button>
      <button className="btn btn-outline-secondary" type="button" disabled={exporting || resource.loading || !!resource.error} onClick={() => exportDocument('pdf')}>PDF · all filtered rows</button>
      {ledger && <button className="btn btn-outline-secondary" type="button" disabled={exporting || resource.loading} onClick={exportLedger}>{exporting ? 'Exporting…' : 'Export filtered ledger'}</button>}
    </form>
    <Feedback error={exportError}/>
    <ResourceState {...resource} retry={resource.refresh}/>
    {!resource.loading && !resource.error && <>
      {report && <section aria-label="Financial statement identification"><h2>{statement.replace(/_/g, ' ').toUpperCase()}</h2><p>{applied.from || 'Beginning of records'} — {applied.to}</p><p className={styles.muted}>Server financial statement • current branch scope • values as returned by the ledger</p></section>}
      {ledger && <><h2>General ledger</h2><p>{applied.from || 'Beginning of records'} — {applied.to}. Account: {applied.account || 'All authorized pharmacy accounts'}{applied.search ? ` · Search: ${applied.search}` : ''}. Displayed page {page.toLocaleString()}, {rows.length.toLocaleString()} rows. Full-filtered PDF / Excel exports include every matching row or report an explicit limit error.</p></>}
      {ledger && <p>Opening balance: <Money value={data.openingBalance}/> · Closing balance: <Money value={data.closingBalance}/> <span className={styles.muted}>(server-computed across full history; multi-account totals are not implied)</span></p>}
      {ledger && !applied.account && rowsOf(data.accountBalances).length > 0 && <details className="mb-3"><summary>Opening and closing balances by account</summary><DataTable rows={rowsOf(data.accountBalances)} columns={['account','opening','closing']}/></details>}
      {rowsOf(data.classificationIssues).length > 0 && <div role="alert" className="alert alert-warning"><strong>Cash-flow classification is incomplete.</strong> Unclassified movements are not assigned to operating, investing or financing activities. Resolve classification before relying on this statement.<DataTable rows={rowsOf(data.classificationIssues)}/></div>}
      {supplier && selectedSupplier && <><h2>Supplier statement · {text(record(data.party).name||selectedName)}</h2><p>{applied.from || 'Beginning of records'} — {applied.to} · Opening: <Money value={data.openingBalance}/> · Closing: <Money value={data.closingBalance}/> · {text(data.balanceConvention)}</p></>}
      <Facts data={data.summary}/>
      <Facts data={data.capabilities}/>
      {endpoint==='tax-credits'&&data.policy!=null&&<p>Tax-credit policy: {text(data.policy)}</p>}
      {groups.length > 0 ? groups.map(group => <section key={group} className="mt-3"><h3>{group}</h3><DataTable rows={rows.filter(row => text(row.section) === group)} columns={columns} labels={columnLabels} caption={group}/></section>) : <DataTable rows={rows} labels={columnLabels} columns={columns || registerColumns(endpoint,supplier)} pageSlice={!supplier&&!report} inlineActions={ledger||endpoint==='journals'||supplier} cell={ledger?(row,key)=>key==='account'?<><strong>{text(row.account)}</strong><small className="d-block text-muted">{text(row.account_name)}</small></>:['debit','credit','running_balance'].includes(key)?money(row[key]):undefined:undefined} actions={supplier && !selectedSupplier ? row => <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => { setSupplierId(text(row.id)); setSelectedSupplier(text(row.id));setSupplierName(text(row.name));setSelectedName(text(row.name)); setPage(1); }}>View statement</button> : actions ? row => actions(row, resource.refresh) : ledger ? row => row.journal_id ? <Link href={`/pharmacy/accounting/general-ledger/journals/${encodeURIComponent(text(row.journal_id))}`}>Inspect posted journal</Link> : null : endpoint === 'journals' ? row => <Link href={`/pharmacy/accounting/journals/${encodeURIComponent(text(row.id))}`}>Review journal</Link> : undefined}/>}
      {data.totals !== undefined && <section className="mt-4"><h3>{report ? 'Statement totals' : 'Register totals'}</h3>{Array.isArray(data.totals) ? <DataTable rows={rowsOf(data.totals)}/> : <DataTable rows={Object.entries(record(data.totals)).map(([key,value]) => ({ measure: label(key), value }))} columns={['measure','value']}/>}</section>}
      <p className="d-none d-print-block">Page {page} · {rows.length} displayed rows{serverTotal !== undefined ? ` of ${total}` : ''}</p>
      {supplier||report?<p className="small text-muted mt-3">Complete returned {supplier?'supplier directory / statement':'financial statement'} · {rows.length.toLocaleString()} rows. This endpoint is not page-based.</p>:<div className={`${styles.actions} d-print-none mt-3`}><button type="button" className="btn btn-outline-secondary" disabled={page === 1 || resource.loading} onClick={() => setPage(page - 1)}>Previous</button><span>Page {page}{serverTotal !== undefined ? ` · ${total.toLocaleString()} records` : ''}</span><button type="button" className="btn btn-outline-secondary" disabled={resource.loading || (serverTotal !== undefined ? page * count >= total : rows.length < count)} onClick={() => setPage(page + 1)}>Next</button><label>Rows <select aria-label="Rows per page" value={count} onChange={e => { setCount(Number(e.target.value)); setPage(1); }}>{[25,50,100].map(n => <option key={n}>{n}</option>)}</select></label></div>}
    </>}
  </section>;
}
export function Overview() {
  const resource = useResource<unknown>('overview');
  const data = record(resource.data);
  return <><section className={styles.section}><h2>Accounting position</h2><ResourceState {...resource} retry={resource.refresh}/>{!resource.loading&&!resource.error&&resource.data!==null&&<><SummaryMetrics metrics={[{title:'Receivables',value:data.receivables,subtitle:'Customer obligations from source books',variant:'primary'},{title:'Payables',value:data.payables,subtitle:'Supplier control balance',variant:'warning'}]}/><h3>Document workflow</h3><DataTable rows={rowsOf(data.documents)} columns={['kind','status','count','amount']}/><h3 className="mt-3">Bank reconciliation progress</h3><DataTable rows={rowsOf(data.reconciliations)} columns={['status','count']}/></>}</section><section className={styles.section}><h2>Next accounting task</h2><div className={styles.actions}><Link className="btn btn-primary" href="/pharmacy/accounting/journals">Create or review a journal</Link><Link href="/pharmacy/accounting/expenses">Expenses</Link><Link href="/pharmacy/accounting/payables">Supplier settlements</Link></div><div className="mt-3"><WorkflowLinks/></div><p className="mt-3">Only configured, eligible postings reach the shared general ledger. <Link href="/pharmacy/accounting/settings">Review posting configuration</Link>.</p></section></>;
}
function registerColumns(endpoint:string,supplier:boolean):string[]|undefined {
  if(supplier)return undefined; // Named directory versus statement rows have different business shapes.
  if(endpoint==='audit')return ['id','created_at','actor_id','action','entity_id','before_state','after_state'];
  if(endpoint==='tax-credits')return ['financial_date','event_type','sale_id','source_credit_id','credit_document_id','component_ref','tax_event_id','sale_line_id','gross_amount','net_amount','tax_amount','original_gross_amount','original_net_amount','original_tax_amount','rate','local_account','reversal_of_adjustment_id','policy','id'];
  if(endpoint==='journals'||endpoint.includes('settlements')||endpoint.includes('adjustments')||endpoint.includes('allocations')||endpoint.includes('-reversals'))return ['financial_date','id','description','amount','status','version','reversal_of','replaces_intent_id'];
  if(endpoint==='receivables')return ['receipt_number','customer_name','total_amount','paid_amount','outstanding_amount','due_date','status'];
  return undefined;
}
