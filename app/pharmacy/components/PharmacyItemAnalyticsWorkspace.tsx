'use client';
import Link from 'next/link';
import {useState} from 'react';
import {useParams, useSearchParams} from 'next/navigation';
import {styles, money, dateLabel, Message, Empty, usePharmacyAccess, usePharmacyResource} from './PharmacyWorkspace';
import {PharmacyItemTrend} from './PharmacyReportCharts';
import accounting from '../accounting/components/AccountingWorkspace.module.css';
import purchasing from './PharmacyPurchasing.module.css';
import ui from './PharmacyItemAnalyticsWorkspace.module.css';
import DateFilterReusable from '../../../components/operations/Laboratory/ResuableFilter/DateFilterReusable';

const pages = [
  {id:'summary', title:'Overview', description:'Current stock and activity across the selected dates.'},
  {id:'orders', title:'Orders', description:'Supplier orders, approved quantities and current fulfilment.'},
  {id:'usage', title:'Usage', description:'Gross stock issues and their recorded stock costs.'},
  {id:'wastage', title:'Wastage', description:'Posted stock write-offs and the value lost.'},
  {id:'dispensing', title:'Prescription dispensing', description:'Stock issues linked to patient prescriptions.'},
  {id:'supplier-performance', title:'Supplier performance', description:'Ordered and accepted quantities by supplier.'},
  {id:'movements', title:'Stock movements', description:'Additions, issues, corrections and returns in the stock ledger.'},
] as const;
export type ItemAnalyticsSection = typeof pages[number]['id'];
const number = new Intl.NumberFormat('en-GH',{maximumFractionDigits:3});

export default function PharmacyItemAnalyticsWorkspace({section='summary'}: {section?: ItemAnalyticsSection}) {
  const access = usePharmacyAccess();
  if (!access.stock && !access.finance) return <main className={styles.page}><h1>Medicine analytics</h1><Empty>Pharmacy reporting permission is required.</Empty></main>;
  return <ItemAnalytics section={section}/>;
}
function ItemAnalytics({section}: {section: ItemAnalyticsSection}) {
  const {itemId} = useParams<{itemId:string}>(), params = useSearchParams();
  const today = new Date().toISOString().slice(0,10);
  const initial = {from:params.get('from')||new Date(Date.now()-29*86400000).toISOString().slice(0,10),to:params.get('to')||today,
    period:params.get('period')||'daily',search:'',supplierId:''};
  const [draft,setDraft] = useState(initial), [filters,setFilters] = useState(initial), [page,setPage] = useState(1), [count,setCount] = useState(25), [error,setError] = useState('');
  const [datePreset,setDatePreset] = useState('Custom Range');
  const query = new URLSearchParams({...filters,page:String(page),count:String(count)});
  const resource = usePharmacyResource(`pharmacy/analytics/items/${encodeURIComponent(itemId)}/${section}?${query}`);
  const data = resource.data, current = pages.find(value=>value.id===section)!;
  const base = `/pharmacy/analytics/items/${encodeURIComponent(itemId)}`;
  const dates = new URLSearchParams({from:filters.from,to:filters.to,period:filters.period});
  const link = (id:string) => `${base}${id==='summary'?'':'/'+id}?${dates}`;
  const format = (value:unknown, type:string) => value == null ? '—' : type==='money' ? money(value) : type==='number' ? number.format(Number(value)) : type==='date' ? dateLabel(String(value)) : String(value).replaceAll('_',' ');
  const suppliersView = section==='orders'||section==='supplier-performance';
  return <main className={`${styles.page} ${accounting.page} ${purchasing.theme}`}>
    <header className={styles.header}><div><Link href="/pharmacy/analytics?report=inventory">← Stock &amp; replenishment</Link><h1>{data?.item.name || 'Medicine analytics'}</h1><p>{data?.item.sku}{data?.item.unit ? ` · Quantities in ${data.item.unit}` : ''}</p></div><div className={styles.actions}><Link className="btn btn-outline-secondary" href={`/pharmacy/catalogue/${encodeURIComponent(itemId)}/batches`}>Batch balances</Link><button className="btn btn-outline-secondary" disabled={resource.loading} onClick={resource.refresh}>Refresh</button></div></header>
    <nav className={ui.navigation} aria-label="Medicine analytics pages">{pages.map(value=><Link key={value.id} href={link(value.id)} aria-current={section===value.id?'page':undefined}>{value.title}</Link>)}</nav>
    <h2>{current.title}</h2><p>{current.description}</p>
    <form className={`${accounting.filters} ${ui.filters}`} onSubmit={event=>{event.preventDefault();if(!draft.from||!draft.to||draft.from>draft.to){setError('Choose a complete date range with the start date on or before the end date.');return;}setError('');setFilters({...draft,search:draft.search.trim()});setPage(1);}}>
      <div className={ui.date}><label className="form-label" htmlFor="medicine-analytics-period">Date range</label><DateFilterReusable id="medicine-analytics-period" className="" label="Medicine activity period" value={datePreset} startDate={draft.from} endDate={draft.to} onChange={setDatePreset} onDateRangeChange={(from,to)=>setDraft(previous=>({...previous,from,to}))}/><small className="text-muted">{draft.from} to {draft.to}</small></div>
      {section!=='movements'&&<label className="form-label">Group by<select className="form-select" value={draft.period} onChange={e=>setDraft({...draft,period:e.target.value})}><option value="daily">Day</option><option value="monthly">Month</option><option value="yearly">Year</option></select></label>}
      {suppliersView&&<label className="form-label">Supplier<select className="form-select" value={draft.supplierId} onChange={e=>setDraft({...draft,supplierId:e.target.value})}><option value="">All suppliers</option>{data?.suppliers.map((supplier:any)=><option key={supplier.id} value={supplier.id}>{supplier.name}</option>)}</select></label>}
      <label className="form-label">Search<input className="form-control" type="search" placeholder={suppliersView?'Supplier or order reference':'Batch, movement reason or reference'} value={draft.search} onChange={e=>setDraft({...draft,search:e.target.value})}/></label>
      <button className="btn btn-primary" disabled={resource.loading}>Apply filters</button>
    </form>
    <Message error={error||resource.error}/>
    {resource.loading ? <Empty>Loading medicine analytics…</Empty> : resource.error ? <button className="btn btn-outline-primary" onClick={resource.refresh}>Retry</button> : data && <>
      <dl className={accounting.summaryStrip} aria-label="Medicine stock and activity">{[
        ['Physical stock',data.summary.physical],['Dispensable stock',data.summary.dispensable],['Gross issued units',data.summary.issued],['Written-off units',data.summary.wasted],['Average daily issues',data.summary.dailyUsage],
      ].map(([label,value])=><div key={String(label)}><dt>{label}</dt><dd>{number.format(Number(value))}</dd></div>)}</dl>
      <p className={styles.muted}>{data.note}</p>
      {section==='summary'&&<div className={ui.destinations}>{pages.filter(value=>value.id!=='summary').map(value=><Link key={value.id} href={link(value.id)}><strong>{value.title}</strong><span>{value.description}</span></Link>)}</div>}
      <PharmacyItemTrend rows={data.trend} label={data.trendLabel} series={data.series}/>
      <section className={styles.card} aria-label={`${current.title} records`}>
        {data.rows.length ? <div className="table-responsive" tabIndex={0}><table className={styles.table}><thead><tr>{data.columns.map((column:any)=><th key={column.key} scope="col">{column.label}</th>)}</tr></thead><tbody>{data.rows.map((row:any)=><tr key={row.id||row.period}>{data.columns.map((column:any)=><td key={column.key}>{column.key==='reference'&&row.orderId?<Link href={`/pharmacy/inventory/orders?order=${encodeURIComponent(row.orderId)}`}>{row.reference||row.orderId}</Link>:format(row[column.key],column.format)}</td>)}</tr>)}</tbody></table></div> : <Empty>No activity matches these dates and filters. <button className="btn btn-sm btn-outline-secondary" onClick={()=>{const cleared={...filters,search:'',supplierId:''};setFilters(cleared);setDraft(cleared);setPage(1);}}>Clear search and supplier</button></Empty>}
        <div className={ui.pagination}><span>{data.total} records · Page {data.page} of {data.totalPages}</span><label>Rows<select aria-label="Rows per page" className="form-select form-select-sm" value={count} onChange={e=>{setCount(Number(e.target.value));setPage(1);}}>{[10,25,50,100].map(value=><option key={value} value={value}>{value}</option>)}</select></label><div className={styles.actions}><button className="btn btn-sm btn-outline-secondary" disabled={data.page<=1} onClick={()=>setPage(data.page-1)}>Previous</button><button className="btn btn-sm btn-outline-secondary" disabled={data.page>=data.totalPages} onClick={()=>setPage(data.page+1)}>Next</button></div></div>
      </section>
    </>}
  </main>;
}
