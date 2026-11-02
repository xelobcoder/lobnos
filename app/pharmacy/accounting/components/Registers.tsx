'use client';
import Link from 'next/link';
import { useState } from 'react';
import { RiArrowRightLine, RiBarChartBoxLine, RiBook2Line, RiPercentLine, RiShieldCheckLine, RiTruckLine, RiWallet3Line } from '@remixicon/react';
import { csv, financialQuery, record, rowsOf, text, type RecordData } from '../../../../lib/pharmacyAccounting';
import DateFilterReusable from '../../../../components/operations/Laboratory/ResuableFilter/DateFilterReusable';
import { request, useResource } from './api';
import { DataTable, Facts, Feedback, Field, label, money, Money, ResourceState, styles, SummaryMetrics } from './common';
import { downloadAccountingExport, fullFilteredExport } from './exports';
import SupplierPicker from './SupplierPicker';
import layout from './AccountingWorkspace.module.css';

const today = () => new Date().toISOString().slice(0, 10);
const plural = (value: number, noun: string) => `${value.toLocaleString()} ${noun}${value === 1 ? '' : 's'}`;
const ledgerColumns=['date','journal_id','account','description','source_document','debit','credit','running_balance'];
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
  const filterSupported = dateSupported || approvalRegisters.includes(endpoint) || endpoint === 'audit';
  const datePresetId = `accounting-${endpoint.replace(/\W/g, '-')}-date-preset`;
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
    {filterSupported && <form className={`${layout.filters} d-print-none`} aria-label="Report filters" onSubmit={e => { e.preventDefault(); setApplied(filters); setSelectedSupplier(supplierId);setSelectedName(supplierName); setPage(1); }}>
      {dateSupported&&<div className={styles.field}><label htmlFor={datePresetId}>Date preset</label><DateFilterReusable id={datePresetId} className="w-100" value={preset} onChange={setPreset} onDateRangeChange={(from,to)=>setFilters({...filters,from,to})} label="Choose date range"/></div>}
      {dateSupported && <><Field label="From"><input type="date" className="form-control" value={filters.from} onChange={e => setFilters({ ...filters, from: e.target.value })}/></Field>
      <Field label="To"><input required type="date" min={filters.from || undefined} className="form-control" value={filters.to} onChange={e => setFilters({ ...filters, to: e.target.value })}/></Field></>}
      {ledger && <Field label="Account code"><input className="form-control" value={filters.account} onChange={e => setFilters({ ...filters, account: e.target.value })}/></Field>}
      {ledger && <Field label="Search"><input type="search" className="form-control" value={filters.search} onChange={e => setFilters({ ...filters, search: e.target.value })}/></Field>}
      {endpoint === 'tax-credits' && <><Field label="Original sale ID"><input className="form-control" value={filters.saleId} onChange={e => setFilters({ ...filters, saleId: e.target.value })}/></Field><Field label="Source credit ID"><input className="form-control" value={filters.sourceCreditId} onChange={e => setFilters({ ...filters, sourceCreditId: e.target.value })}/></Field></>}
      {approvalRegisters.includes(endpoint) && <Field label="Status"><select className="form-select" value={filters.status} onChange={e => setFilters({ ...filters, status: e.target.value })}><option value="">All statuses</option>{approvalStatuses(endpoint).map(status => <option key={status} value={status}>{label(status)}</option>)}</select></Field>}
      {endpoint === 'audit' && <><Field label="Entity ID"><input className="form-control" value={filters.entityId} onChange={e => setFilters({ ...filters, entityId: e.target.value })}/></Field><Field label="Audit action"><input className="form-control" value={filters.action} onChange={e => setFilters({ ...filters, action: e.target.value })}/></Field></>}
      {supplier && <div className={`${styles.field} d-flex flex-column gap-1 mb-3`}><label htmlFor="accounting-supplier">Supplier</label><SupplierPicker value={supplierId} onChange={(id,name)=>{setSupplierId(id);setSupplierName(name);}}/></div>}
      {report && report !== 'trial_balance' && <Field label="Statement"><select className="form-select" value={statement} onChange={e => { setStatement(e.target.value); setPage(1); }}>{[['profit_loss','Profit & loss'],['balance_sheet','Balance sheet'],['cash_flow','Cash flow'],['transactions','Transactions']].map(([value,label]) => <option value={value} key={value}>{label}</option>)}</select></Field>}
      <button className="btn btn-primary" type="submit">Apply filters</button>
      <button className="btn btn-outline-secondary" type="button" disabled={resource.loading} onClick={() => resource.refresh()}>Refresh</button>
    </form>}
    <div className={`${layout.reportActions} d-print-none`}>
      <span className="small text-muted">{resource.loading ? 'Loading records…' : resource.error ? 'Records unavailable' : serverTotal !== undefined ? plural(total, 'record') : plural(rows.length, 'returned row')}</span>
      <div className={layout.exportActions}>
      {!filterSupported && <button className="btn btn-sm btn-outline-secondary" type="button" disabled={resource.loading} onClick={() => resource.refresh()}>Refresh</button>}
      <button className="btn btn-sm btn-outline-secondary" type="button" disabled={resource.loading || !!resource.error || !resource.data} onClick={() => window.print()}>Print displayed rows</button>
      <details className={layout.exportMenu} data-accounting-export><summary className="btn btn-sm btn-outline-secondary">Export all filtered records</summary><div>
      <button className="btn btn-outline-secondary" type="button" disabled={exporting || resource.loading || !!resource.error} onClick={() => exportDocument('xlsx')}>{exporting ? 'Exporting…' : 'Excel · all filtered rows'}</button>
      <button className="btn btn-outline-secondary" type="button" disabled={exporting || resource.loading || !!resource.error} onClick={() => exportDocument('pdf')}>PDF · all filtered rows</button>
      {ledger && <button className="btn btn-outline-secondary" type="button" disabled={exporting || resource.loading} onClick={exportLedger}>{exporting ? 'Exporting…' : 'Export filtered ledger'}</button>}
      </div></details></div>
    </div>
    <Feedback error={exportError}/>
    <ResourceState {...resource} retry={resource.refresh}/>
    {!resource.loading && !resource.error && <>
      {report && <section aria-label="Financial statement identification"><h2>{statement.replace(/_/g, ' ').toUpperCase()}</h2><p>{applied.from || 'Beginning of records'} — {applied.to}</p><p className={styles.muted}>Server financial statement • current branch scope • values as returned by the ledger</p></section>}
      {ledger && <><h2 className="d-none d-print-block">General ledger</h2><p className={styles.muted}>{applied.from || 'Beginning of records'} — {applied.to} · {applied.account || 'All pharmacy accounts'}{applied.search ? ` · Search: ${applied.search}` : ''}</p></>}
      {ledger && <p>Opening balance: <Money value={data.openingBalance}/> · Closing balance: <Money value={data.closingBalance}/></p>}
      {ledger && !applied.account && rowsOf(data.accountBalances).length > 0 && <details className="mb-3"><summary>Opening and closing balances by account</summary><DataTable rows={rowsOf(data.accountBalances)} columns={['account','opening','closing']}/></details>}
      {rowsOf(data.classificationIssues).length > 0 && <div role="alert" className="alert alert-warning"><strong>Cash-flow classification is incomplete.</strong> Unclassified movements are not assigned to operating, investing or financing activities. Resolve classification before relying on this statement.<DataTable rows={rowsOf(data.classificationIssues)}/></div>}
      {supplier && selectedSupplier && <><h2>Supplier statement · {text(record(data.party).name||selectedName)}</h2><p>{applied.from || 'Beginning of records'} — {applied.to} · Opening: <Money value={data.openingBalance}/> · Closing: <Money value={data.closingBalance}/> · {text(data.balanceConvention)}</p></>}
      {report ? <ReportSummary data={data.summary}/> : <Facts data={data.summary}/>}
      <Facts data={data.capabilities}/>
      {endpoint==='tax-credits'&&data.policy!=null&&<p>Tax-credit policy: {text(data.policy)}</p>}
      {groups.length > 0 ? groups.map(group => <section key={group} className="mt-3" aria-label={group}><DataTable rows={rows.filter(row => text(row.section) === group)} columns={columns?.filter(column => column !== 'section')} labels={columnLabels} caption={group}/></section>) : <DataTable rows={rows} labels={columnLabels} columns={columns || registerColumns(endpoint,supplier)} pageSlice={!supplier&&!report} inlineActions={ledger||endpoint==='journals'||supplier} cell={ledger?(row,key)=>key==='account'?<><strong>{text(row.account)}</strong><small className="d-block text-muted">{text(row.account_name)}</small></>:['debit','credit','running_balance'].includes(key)?money(row[key]):undefined:undefined} actions={supplier && !selectedSupplier ? row => <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => { setSupplierId(text(row.id)); setSelectedSupplier(text(row.id));setSupplierName(text(row.name));setSelectedName(text(row.name)); setPage(1); }}>View statement</button> : actions ? row => actions(row, resource.refresh) : ledger ? row => row.journal_id ? <Link href={`/pharmacy/accounting/general-ledger/journals/${encodeURIComponent(text(row.journal_id))}`}>Inspect posted journal</Link> : null : endpoint === 'journals' ? row => <Link href={`/pharmacy/accounting/journals/${encodeURIComponent(text(row.id))}`}>Review journal</Link> : undefined}/>}
      {data.totals !== undefined && <section className="mt-4"><h3>{report ? 'Statement totals' : 'Register totals'}</h3>{Array.isArray(data.totals) ? <DataTable rows={rowsOf(data.totals)}/> : <DataTable rows={Object.entries(record(data.totals)).map(([key,value]) => ({ measure: label(key), value }))} columns={['measure','value']}/>}</section>}
      <p className="d-none d-print-block">Page {page} · {rows.length} displayed rows{serverTotal !== undefined ? ` of ${total}` : ''}</p>
      {supplier||report?<p className="small text-muted mt-3">Complete returned {supplier?'supplier directory / statement':'financial statement'} · {rows.length.toLocaleString()} rows. This endpoint is not page-based.</p>:<div className={`${styles.actions} d-print-none mt-3`}><button type="button" className="btn btn-outline-secondary" disabled={page === 1 || resource.loading} onClick={() => setPage(page - 1)}>Previous</button><span>Page {page}{serverTotal !== undefined ? ` · ${plural(total, 'record')}` : ''}</span><button type="button" className="btn btn-outline-secondary" disabled={resource.loading || (serverTotal !== undefined ? page * count >= total : rows.length < count)} onClick={() => setPage(page + 1)}>Next</button><label className="d-flex align-items-center gap-2 ms-auto">Rows <select className="form-select form-select-sm w-auto" aria-label="Rows per page" value={count} onChange={e => { setCount(Number(e.target.value)); setPage(1); }}>{[25,50,100].map(n => <option key={n}>{n}</option>)}</select></label></div>}
    </>}
  </section>;
}
export function ReportSummary({ data }: { data: unknown }) {
  const summary = record(data);
  const groups = [
    { title: 'Sales', metrics: [
      { key: 'grossSales', title: 'Gross sales', subtitle: 'Sales before refunds and tax adjustments' },
      { key: 'refunds', title: 'Refunds', subtitle: 'Recorded customer refunds' },
      { key: 'netSales', title: 'Net sales', subtitle: 'Sales after refunds and collected tax' },
      { key: 'taxCollected', title: 'Tax collected', subtitle: 'Net tax recorded for selected dates' },
      { key: 'receipts', title: 'Receipts', count: true, subtitle: 'Sales receipts in selected dates' },
      { key: 'refundCount', title: 'Refund count', count: true, subtitle: 'Recorded refunds in selected dates' },
    ] },
    { title: 'Stock', metrics: [
      { key: 'stockValue', title: 'Stock value', subtitle: 'Current medicine stock at cost' },
      { key: 'medicines', title: 'Medicines', count: true, subtitle: 'Medicines in stock records' },
      { key: 'reorderItems', title: 'Reorder items', count: true, subtitle: 'Medicines at or below reorder level' },
      { key: 'outOfStock', title: 'Out of stock', count: true, subtitle: 'Medicines with no available stock' },
    ] },
    { title: 'Ledger & expenses', metrics: [
      { key: 'bookRevenue', title: 'Book revenue', subtitle: 'Posted ledger sales revenue' },
      { key: 'costOfSales', title: 'Cost of sales', subtitle: 'Inventory cost recognised on sales' },
      { key: 'operatingExpenses', title: 'Operating expenses', subtitle: 'Posted pharmacy operating expenses' },
      { key: 'profit', title: 'Profit', subtitle: 'After costs, expenses and adjustments' },
    ] },
  ];
  return <>{groups.map(group => {
    const metrics = group.metrics.filter(metric => Object.prototype.hasOwnProperty.call(summary, metric.key));
    if (!metrics.length) return null;
    return <section key={group.title} className="mb-4" aria-label={`${group.title} summary`}>
      <div className={layout.reportActions}><h3 className="mb-0">{group.title}</h3>{group.title === 'Ledger & expenses' && <Link className="d-print-none" href="/pharmacy/accounting/expenses">Review expenses</Link>}</div>
      <SummaryMetrics metrics={metrics.map(metric => ({ title: metric.title, value: summary[metric.key], count: 'count' in metric && metric.count, subtitle: metric.subtitle }))}/>
      {group.title === 'Ledger & expenses' && <p className={styles.muted}>Profit is book revenue less cost of sales, operating expenses and any inventory adjustments. Only posted ledger expenses affect these totals.</p>}
    </section>;
  })}</>;
}
const cycle = [
  { title: 'Prepare', detail: 'Draft journals and expenses with source evidence.' },
  { title: 'Review & approve', detail: 'A second accountant approves before posting.' },
  { title: 'Post to shared ledger', detail: 'Approved entries post once to the shared GL.' },
  { title: 'Reconcile & report', detail: 'Match bank statements, then review statements.' },
];
const tools = [
  { href: 'general-ledger', title: 'General ledger', detail: 'Trace balances to source documents', Icon: RiBook2Line },
  { href: 'payables', title: 'Payables', detail: 'Supplier bills, settlements and credits', Icon: RiTruckLine },
  { href: 'receivables', title: 'Receivables', detail: 'Customer balances and adjustments', Icon: RiWallet3Line },
  { href: 'statements', title: 'Financial statements', detail: 'Profit & loss, balance sheet, cash flow', Icon: RiBarChartBoxLine },
  { href: 'tax', title: 'Tax', detail: 'Approved rules and frozen tax evidence', Icon: RiPercentLine },
  { href: 'audit', title: 'Audit trail', detail: 'Approvals, postings and corrections', Icon: RiShieldCheckLine },
];
const dailyTasks = [
  { href: '/pharmacy/accounting/expenses', title: 'Record a running expense', detail: 'Transport, electricity and other pharmacy costs' },
  { href: '/pharmacy/accounting/payables', title: 'Pay a supplier', detail: 'Find the bill, prepare payment and request approval' },
  { href: '/pharmacy/accounts', title: 'Collect a customer balance', detail: 'Find the customer invoice before collecting payment' },
  { href: '/pharmacy/accounting/statements', title: 'Check pharmacy profit', detail: 'Review income, costs and the reported result' },
  { href: '/pharmacy/accounting/reconciliation', title: 'Check a bank statement', detail: 'Match actual bank lines with recorded payments' },
  { href: '/pharmacy/finance#days', title: 'Review cash & close the day', detail: 'Check cashier handovers before closing the trading day' },
];
function SummaryTable({ rows, columns }: { rows: RecordData[]; columns: string[] }) {
  return <div className={layout.panelTableWrap}><table className={layout.panelTable}><thead><tr>{columns.map(key => <th key={key} scope="col">{label(key)}</th>)}</tr></thead>
    <tbody>{rows.map((row, index) => <tr key={index}>{columns.map(key => <td key={key}>{key === 'count' ? (Number(row[key]) || 0).toLocaleString() : label(text(row[key]))}</td>)}</tr>)}</tbody></table></div>;
}
export function Overview() {
  const resource = useResource<unknown>('overview');
  const data = record(resource.data), documents = rowsOf(data.documents), statements = rowsOf(data.reconciliations);
  const sum = (rows: RecordData[]) => rows.reduce((total, row) => total + (Number(row.count) || 0), 0);
  const awaiting = documents.filter(row => ['draft', 'submitted'].includes(text(row.status)));
  const openStatements = statements.filter(row => text(row.status) !== 'finalized');
  const ready = !resource.loading && !resource.error && resource.data !== null;
  return <>
    <nav className="mb-4 d-print-none" aria-label="Everyday pharmacy money tasks"><h2 className="h5">What do you need to do?</h2><p className={layout.muted}>Choose a task. Ordinary sales and stock receipts already record their own financial evidence.</p><div className={layout.tools}>{dailyTasks.map(task => <Link key={task.href} href={task.href}><div><strong>{task.title}</strong><small>{task.detail}</small></div><RiArrowRightLine size={16} aria-hidden="true"/></Link>)}</div></nav>
    <ResourceState {...resource} retry={resource.refresh}/>
    {ready && <SummaryMetrics metrics={[
      { title: 'Receivables', value: data.receivables, subtitle: 'Outstanding customer balances', variant: 'primary' },
      { title: 'Payables', value: data.payables, subtitle: 'Supplier control balance', variant: 'warning' },
      { title: 'Awaiting approval', value: sum(awaiting), subtitle: 'Draft and submitted documents', variant: 'info', count: true },
      { title: 'Open bank statements', value: sum(openStatements), subtitle: 'Not yet finalized', variant: 'secondary', count: true },
    ]}/>}
    <div className={layout.overviewGrid}>
      <div className={layout.stack}>
        {ready && <section className={layout.panel} aria-labelledby="accounting-documents">
          <div className={layout.panelHead}><div><h2 id="accounting-documents">Documents by status</h2><p>Journals and expenses moving through approval.</p></div><Link href="/pharmacy/accounting/journals">Review journals <RiArrowRightLine size={14}/></Link></div>
          {documents.length ? <SummaryTable rows={documents} columns={['kind','status','count']}/> : <p className={layout.empty}>No accounting documents yet.</p>}
        </section>}
        {ready && <section className={layout.panel} aria-labelledby="accounting-reconciliation">
          <div className={layout.panelHead}><div><h2 id="accounting-reconciliation">Bank reconciliation</h2><p>Statements matched against recorded movements.</p></div><Link href="/pharmacy/accounting/reconciliation">Reconcile <RiArrowRightLine size={14}/></Link></div>
          {statements.length ? <SummaryTable rows={statements} columns={['status','count']}/> : <p className={layout.empty}>No bank statements imported yet.</p>}
        </section>}
      </div>
      <aside className={layout.panel} aria-labelledby="accounting-cycle">
        <div className={layout.panelHead}><div><h2 id="accounting-cycle">Journal workflow</h2><p>Draft journals require independent approval.</p></div></div>
        <div className={layout.workflow}><ol>{cycle.map((step, index) => <li key={step.title}><span>{index + 1}</span><div><strong>{step.title}</strong><small>{step.detail}</small></div></li>)}</ol>
          <p className={layout.muted}>Daily cash and customer credit stay in <Link href="/pharmacy/finance">Cash & financial days</Link> and <Link href="/pharmacy/accounts">Customer accounts</Link>.</p></div>
      </aside>
    </div>
    <details className="d-print-none"><summary>Accounting checks &amp; investigation tools</summary><nav aria-label="Accounting tools"><div className={layout.tools}>{tools.map(({ href, title, detail, Icon }) => <Link key={href} href={`/pharmacy/accounting/${href}`}><Icon size={22} aria-hidden="true"/><div><strong>{title}</strong><small>{detail}</small></div><RiArrowRightLine size={16} aria-hidden="true" className="ms-auto"/></Link>)}</div></nav></details>
  </>;
}
function registerColumns(endpoint:string,supplier:boolean):string[]|undefined {
  if(supplier)return undefined; // Named directory versus statement rows have different business shapes.
  if(endpoint==='audit')return ['id','created_at','actor_id','action','entity_id','before_state','after_state'];
  if(endpoint==='tax-credits')return ['financial_date','event_type','sale_id','source_credit_id','credit_document_id','component_ref','tax_event_id','sale_line_id','gross_amount','net_amount','tax_amount','original_gross_amount','original_net_amount','original_tax_amount','rate','local_account','reversal_of_adjustment_id','policy','id'];
  if(endpoint==='journals'||endpoint.includes('settlements')||endpoint.includes('adjustments')||endpoint.includes('allocations')||endpoint.includes('-reversals'))return ['financial_date','id','description','amount','status','version','reversal_of','replaces_intent_id'];
  if(endpoint==='receivables')return ['receipt_number','customer_name','total_amount','paid_amount','outstanding_amount','due_date','status'];
  return undefined;
}
