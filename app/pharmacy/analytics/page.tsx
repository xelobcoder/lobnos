'use client';
import { useSearchParams } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { customFetch } from '../../../components/Auth/customFetch';
import { styles, money, dateLabel, usePharmacyAccess, usePharmacyResource, Message, Empty, Tabs } from '../components/PharmacyWorkspace';

const reports=[{id:'overview',label:'Overview'},{id:'sales',label:'Sales & margins'},{id:'inventory',label:'Stock & replenishment'},{id:'expiry',label:'Batch expiry'},{id:'procurement',label:'Purchase orders'},{id:'suppliers',label:'Supplier performance'},{id:'movements',label:'Stock movements'},{id:'finance',label:'Financial accounts'}];
const stockReports=['inventory','expiry','procurement','movements'];
const number=new Intl.NumberFormat('en-GH',{maximumFractionDigits:3});
function csvCell(value:unknown){let text=value==null?'':String(value);if(typeof value==='string'&&/^[\s=+\-@]/.test(text))text="'"+text;return '"'+text.replaceAll('"','""')+'"';}
export default function PharmacyAnalyticsPage(){
     const access=usePharmacyAccess(),params=useSearchParams();
     const today=new Date().toISOString().slice(0,10);
     const [report,setReport]=useState(params.get('report')||(access.finance?'overview':'inventory')),[page,setPage]=useState(1),[count,setCount]=useState(25);
     const [from,setFrom]=useState(()=>new Date(Date.now()-29*86400000).toISOString().slice(0,10)),[to,setTo]=useState(today),[search,setSearch]=useState(params.get('search')||'');
     const [filters,setFilters]=useState({from,to,search:params.get('search')||''}),[error,setError]=useState(''),[exporting,setExporting]=useState(false);
     const query=new URLSearchParams({...filters,report,page:String(page),count:String(count)}),resource=usePharmacyResource('pharmacy/analytics?'+query.toString()),data=resource.data;
     const format=(value:any,type?:string)=>value==null?'—':type==='money'?money(Number(value)):type==='number'?number.format(Number(value)):type==='date'?dateLabel(value):String(value);
     const apply=(event:FormEvent)=>{event.preventDefault();if(from>to){setError('The start date must be on or before the end date');return;}setError('');setFilters({from,to,search:search.trim()});setPage(1);};
     const download=async()=>{
          if(exporting)return;setExporting(true);setError('');
          try{const params=new URLSearchParams({...filters,report,all:'true'}),response=await customFetch('pharmacy/analytics?'+params.toString());if(!response?.success)throw new Error(response?.error?.message||'Unable to export this report');const d=response.data;
               const csv=[d.columns.map((column:any)=>csvCell(column.label)).join(','),...d.rows.map((row:any)=>d.columns.map((column:any)=>csvCell(row[column.key])).join(','))].join('\r\n');
               const url=URL.createObjectURL(new Blob(['\uFEFF'+csv],{type:'text/csv;charset=utf-8;'})),a=document.createElement('a');a.href=url;a.download=`pharmacy-${report}-${filters.from}-${filters.to}.csv`;a.click();URL.revokeObjectURL(url);
          }catch(error){setError(error instanceof Error?error.message:'Export failed');}finally{setExporting(false);}
     };
     const metrics=data?.summary?[
          ...(access.finance?[['Net sales',data.summary.netSales,true],['Book gross profit',Number(data.summary.bookRevenue)-Number(data.summary.costOfSales),true],['Operating profit',data.summary.profit,true],['Refunds',data.summary.refunds,true]]:[]),
          ['Stock at cost',data.summary.stockValue,true],['Medicines to reorder',data.summary.reorderItems,false],['Out of stock',data.summary.outOfStock,false],['Medicines',data.summary.medicines,false],
     ]:[];
     const max=Math.max(1,...(data?.rows||[]).map((row:any)=>Math.abs(Number(row.netSales||0))));
     return <main className={styles.page}>
          <header className={styles.header}><div><h1>Pharmacy analytics</h1><p>Sales performance, stock valuation, expiry risk, purchasing and pharmacy books for the current branch.</p></div><div className={styles.actions}><button className="btn btn-outline-secondary" disabled={resource.loading} onClick={resource.refresh}>Refresh</button><button className="btn btn-primary" disabled={resource.loading||exporting||!data} onClick={download}>{exporting?'Preparing export…':'Export full report'}</button></div></header>
          <Message error={error||resource.error}/>
          <form className={styles.card} onSubmit={apply}><div className="row g-3 align-items-end"><div className="col-sm-3"><label className="form-label w-100">From<input className="form-control" type="date" required value={from} onChange={event=>setFrom(event.target.value)}/></label></div><div className="col-sm-3"><label className="form-label w-100">To<input className="form-control" type="date" required value={to} onChange={event=>setTo(event.target.value)}/></label></div><div className="col-sm-4"><label className="form-label w-100">Find medicine, batch or supplier<input className="form-control" value={search} maxLength={100} onChange={event=>setSearch(event.target.value)} placeholder="Search report rows"/></label></div><div className="col-sm-2"><button className="btn btn-primary mb-2 w-100">Apply filters</button></div></div><p className={styles.muted+' mb-0 mt-2'}>Stock and expiry show current balances. Sales, movements, journals and purchasing use the selected dates. Summary cards cover the whole branch; text search filters the table.</p></form>
          <div className={styles.stats}>{metrics.map(([label,value,currency])=><div className={styles.stat} key={String(label)}><span>{label}</span><strong>{currency?money(Number(value)):number.format(Number(value))}</strong></div>)}</div>
          <Tabs active={report} onChange={id=>{setReport(id);setPage(1);}} tabs={reports.filter(item=>access.finance||stockReports.includes(item.id))}/>
          {resource.loading?<Empty>Loading report…</Empty>:data&&<>
               {report==='overview'&&data.rows.length>0&&<section className={styles.card}><h2>Daily net sales</h2><div style={{display:'flex',height:180,alignItems:'end',gap:4,overflowX:'auto',padding:'1rem 0'}}>{data.rows.map((row:any)=><div key={String(row.date)} title={`${dateLabel(row.date)}: ${money(row.netSales)}`} style={{flex:'1 0 10px',height:Math.max(3,Math.abs(Number(row.netSales))/max*140),background:Number(row.netSales)<0?'#dc3545':'#087f73',borderRadius:'4px 4px 0 0'}}/>)}</div><p className={styles.muted}>Each bar represents a day with sales or refunds. Red indicates net refunds. Exact values appear below.</p></section>}
               <section className={styles.card}><div className={styles.toolbar}><h2>{reports.find(item=>item.id===report)?.label}</h2><span className={styles.muted}>{data.total} row(s) · Updated {new Date(data.asOf).toLocaleString('en-GH')}</span></div>
                    {data.rows.length?<div className="table-responsive"><table className={styles.table}><thead><tr>{data.columns.map((column:any)=><th key={column.key} className={['money','number'].includes(column.format)?styles.number:undefined}>{column.label}</th>)}</tr></thead><tbody>{data.rows.map((row:any,index:number)=><tr key={index}>{data.columns.map((column:any)=><td key={column.key} className={['money','number'].includes(column.format)?styles.number:undefined}>{column.key==='status'?<span className={'badge '+(row.status==='Expired'?'text-bg-danger':row.status==='Expires within 90 days'?'text-bg-warning':'text-bg-light border')}>{row.status}</span>:format(row[column.key],column.format)}</td>)}</tr>)}</tbody></table></div>:<Empty>No activity matches these filters.</Empty>}
                    {report!=='overview'&&<div className={styles.toolbar+' mt-3 mb-0'}><label>Rows <select className="form-select d-inline-block w-auto" value={count} onChange={event=>{setCount(Number(event.target.value));setPage(1);}}>{[25,50,100,200].map(value=><option key={value}>{value}</option>)}</select></label><div className={styles.actions}><button className="btn btn-outline-secondary" disabled={page<=1} onClick={()=>setPage(value=>value-1)}>Previous</button><span>Page {page} of {data.totalPages}</span><button className="btn btn-outline-secondary" disabled={page>=data.totalPages} onClick={()=>setPage(value=>value+1)}>Next</button></div></div>}
               </section>
          </>}
     </main>;
}
