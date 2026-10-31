"use client";
import {useCallback,useEffect,useRef,useState} from 'react';
import Link from 'next/link';
import Select from 'react-select';
import {useApplicationSettings} from '../../../../components/Auth/useApplicationContext';
import PrimeTable from '../../../../components/accessories/Datatables/PrimeTable';
import {customFetch} from '../../../../components/Auth/customFetch';
import DateFilterReusable from '../../../../components/operations/Laboratory/ResuableFilter/DateFilterReusable';
import styles from './HistoryWorkspace.module.css';
type Filters={item_id:string;startDate:string;endDate:string};
type RecordRow={id:string;item_id:string;item_name?:string;item_sku?:string;batch_number?:string;brand_name?:string;expiry_date?:string;quantity_consumed:number|string;wastage_type?:string;reason?:string;performed_by?:{full_name?:string;username?:string};transaction_date?:string;notes?:string};
const empty:Filters={item_id:'',startDate:'',endDate:''};
const date=(value?:string)=>{if(!value)return 'Not recorded';const parsed=new Date(value);return Number.isNaN(parsed.getTime())?'Not recorded':parsed.toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'});};
export default function ExpiredConsumptionHistoryPage(){
 const [draft,setDraft]=useState<Filters>(empty),[applied,setApplied]=useState<Filters>(empty),[preset,setPreset]=useState('');
 const [rows,setRows]=useState<RecordRow[]>([]),[loading,setLoading]=useState(false),[error,setError]=useState(''),[revision,setRevision]=useState(0),[total,setTotal]=useState<number|null>(null);
 const sequence=useRef(0);
 const {branchid,user}=useApplicationSettings().applicationsettings||{};
 const [items,setItems]=useState<any[]>([]),[itemSearch,setItemSearch]=useState(''),[itemsLoading,setItemsLoading]=useState(false),[itemsError,setItemsError]=useState('');
 useEffect(()=>{if(!branchid||!user?.employeeid)return;let active=true;const timer=setTimeout(async()=>{setItemsLoading(true);setItemsError('');try{const q=new URLSearchParams({branchid:String(branchid),employeeid:String(user.employeeid),inventory_domain:'lab',count:'100',search:itemSearch});const r=await customFetch(`inventory/items?${q}`);if(!r?.success)throw new Error('Unable to load items');const list=Array.isArray(r.data)?r.data:r.data?.items||[];if(active)setItems(list.map((i:any)=>({value:String(i.id),label:`${i.name}${i.sku?' · '+i.sku:''}`})));}catch{if(active)setItemsError('Unable to load items. Type to retry.');}finally{if(active)setItemsLoading(false);}},250);return()=>{active=false;clearTimeout(timer);};},[branchid,user?.employeeid,itemSearch]);
 const [selectedItem,setSelectedItem]=useState<any>(null);
 const fetchRows=useCallback(async({page=1,count=10,sortby='DESC',filters={}}:any={})=>{
  const ticket=++sequence.current;setLoading(true);setError('');
  try{const query=new URLSearchParams({page:String(page),count:String(count),sortby});
   for(const [key,value] of Object.entries({...filters,...applied}))if(value)query.set(key,String(value));
   const response=await customFetch(`inventory/transactions/expired-consumption-history?${query}`);
   if(!response?.success)throw new Error(response?.message||response?.error?.message||'Unable to load expired-product history.');
   const records=Array.isArray(response.data?.expired_consumptions)?response.data.expired_consumptions:[];
   const countTotal=response.data?.total==null?null:Number(response.data.total);
   if(ticket===sequence.current){setRows(records);setTotal(Number.isFinite(countTotal)?countTotal:null);}
   return {result:records,error:false,total:countTotal,totalRecords:countTotal??records.length};
  }catch(e:any){if(ticket===sequence.current)setError(e?.message||'Unable to load expired-product history.');return {result:[],error:e?.message||'Unable to load history',totalRecords:0};}
  finally{if(ticket===sequence.current)setLoading(false);}
 },[applied,revision]);
 useEffect(()=>{fetchRows();return()=>{sequence.current++;};},[fetchRows]);
 const apply=(event:React.FormEvent)=>{event.preventDefault();if(draft.startDate&&draft.endDate&&draft.startDate>draft.endDate){setError('Start date must be on or before end date.');return;}setApplied({...draft,item_id:draft.item_id.trim()});setRevision(value=>value+1);};
 const reset=()=>{setDraft(empty);setSelectedItem(null);setItemSearch('');setApplied(empty);setPreset('');setRevision(value=>value+1);};
 const columns=[
  {Header:'Item',accessor:'item_name',Cell:({row}:any)=><div><strong>{row.original.item_name||'Unnamed item'}</strong><small className="d-block text-muted">{row.original.item_sku||row.original.item_id}</small></div>},
  {Header:'Batch / brand',accessor:'batch_number',Cell:({row}:any)=><div><span>{row.original.batch_number||'Not recorded'}</span><small className="d-block text-muted">{row.original.brand_name||'No brand recorded'}</small></div>},
  {Header:'Expiry date',accessor:'expiry_date',Cell:({value}:any)=>date(value)},
  {Header:'Quantity / recorded date',accessor:'quantity_consumed',Cell:({row}:any)=><div><strong>{Number(row.original.quantity_consumed||0).toLocaleString()}</strong><small className="d-block text-muted">{date(row.original.transaction_date)}</small></div>},
  {Header:'Recorded by',accessor:'performed_by',Cell:({value}:any)=>value?.full_name||value?.username||'Not recorded'},
  {Header:'Reason / notes',accessor:'reason',Cell:({row}:any)=><div className={styles.details}><span className={styles.status}>{row.original.wastage_type?String(row.original.wastage_type).replaceAll('_',' '):'Type not recorded'}</span><p>{row.original.reason||'No reason recorded'}</p>{row.original.notes&&<small className="text-muted">{row.original.notes}</small>}</div>}
 ];
 return <div className={`${styles.page} container-fluid`}>
 <header className={styles.header}><div><span className={styles.eyebrow}>Inventory / Expired products</span><h1>Consumption history</h1><p>Review recorded usage and wastage involving expired stock.</p></div><div className={styles.actions}><Link className="btn btn-outline-secondary" href="/inventory/expired-products">Expired products</Link><button type="button" className="btn btn-outline-primary" disabled={loading} onClick={()=>setRevision(value=>value+1)}>{loading?'Refreshing…':'Refresh'}</button></div></header>
 <section className={styles.panel} aria-label="History filters"><form onSubmit={apply}><div className={styles.filters}><div><label htmlFor="history-item" className="form-label">Inventory item</label><Select inputId="history-item" aria-label="Inventory item" options={items} value={selectedItem} isClearable isLoading={itemsLoading} filterOption={null} placeholder="All items — type to search" onInputChange={value=>setItemSearch(value)} onChange={option=>{setSelectedItem(option);setDraft(v=>({...v,item_id:option?.value||''}));}}/>{itemsError&&<small role="alert" className="text-danger">{itemsError}</small>}</div><div><label htmlFor="report-period" className="form-label">Date period</label><DateFilterReusable id="report-period" className="w-100" value={preset} onChange={setPreset} label="Date period" onDateRangeChange={(startDate,endDate)=>setDraft(v=>({...v,startDate,endDate}))}/></div><label className="form-label">From<input aria-label="From date" type="date" className="form-control" value={draft.startDate} onChange={e=>{setPreset('');setDraft(v=>({...v,startDate:e.target.value}));}}/></label><label className="form-label">To<input aria-label="To date" type="date" className="form-control" min={draft.startDate||undefined} value={draft.endDate} onChange={e=>{setPreset('');setDraft(v=>({...v,endDate:e.target.value}));}}/></label></div><div className={styles.filterFooter}><small className="text-muted">Filters apply to the table and its exports.</small><div className={styles.actions}><button className="btn btn-outline-secondary" type="button" disabled={loading} onClick={reset}>Reset filters</button><button className="btn btn-primary" type="submit" disabled={loading}>Apply filters</button></div></div></form></section>
 {error&&<div role="alert" className="alert alert-danger d-flex gap-3 flex-wrap justify-content-between"><span>{error}</span><button type="button" className="btn btn-sm btn-outline-danger" disabled={loading} onClick={()=>setRevision(value=>value+1)}>Retry loading</button></div>}
 <section className={styles.summary} aria-label="Loaded history summary"><div><span>Loaded records</span><strong>{loading?'…':rows.length.toLocaleString()}</strong></div><div><span>Affected items on this page</span><strong>{loading?'…':new Set(rows.map(row=>row.item_id)).size.toLocaleString()}</strong></div><div><span>Expired wastage on this page</span><strong>{loading?'…':rows.filter(row=>String(row.wastage_type||'').toLowerCase()==='expired').length.toLocaleString()}</strong></div></section>
 <section className={styles.panel} aria-label="Expired stock records" aria-busy={loading}><div className={styles.tableHeading}><div><h2>Recorded movements</h2><p>{total==null?'Review the loaded records below.':`${total.toLocaleString()} matching record${total===1?'':'s'}`}</p></div><small className="text-muted">{applied.startDate||'Any start date'} – {applied.endDate||'Any end date'}</small></div>
 {!loading&&!error&&rows.length===0&&<p className="text-muted" role="status">No records match these filters. Try another period or reset the filters.</p>}
 <PrimeTable key={JSON.stringify([applied,revision])} initialPageSize={10} totalRecords={total} pdfExport pdfTitle="Expired Products Consumption History" column={columns} data={rows} filtering handleSeverSideProcessing={fetchRows} serverSideFiltering/>
 </section></div>;
}
