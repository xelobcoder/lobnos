'use client';
import { useEffect, useRef, useState } from 'react';
import dayjs from 'dayjs';
import { customFetch, generateRandomTextAndNumbers } from '../Auth/customFetch';
import { plsEncryption } from '../../lib/encryption';
import PreviewPatientInformation from '../petientsComponent/PreviewPatientInformation';
import OperationsWorkspaceNavigation from './OperationsWorkspaceNavigation';
import s from './OperationsWorkspace.module.css';
const empty = { field:'patientid', value:'', from:'', to:'' };
const when = (value:any) => value && dayjs(value).isValid() ? dayjs(value).format('DD MMM YYYY, HH:mm') : 'Not recorded';
export default function PatientArchivesWorkspace({ patientId, patientName = '' }: { patientId?: string | number; patientName?: string }) {
    const fixedPatient = patientId !== undefined;
    const validPatient = !fixedPatient || Number.isSafeInteger(Number(patientId)) && Number(patientId)>0;
    const initialFilters={...empty,field:fixedPatient?'billingid':'patientid'};
    const [draft,setDraft] = useState(initialFilters), [filters,setFilters] = useState(initialFilters), [page,setPage] = useState(1), [size,setSize] = useState(10);
    const [rows,setRows] = useState<any[]>([]), [loading,setLoading] = useState(true), [error,setError] = useState(''), [filterError,setFilterError] = useState(''), [revision,setRevision] = useState(0), [lastPage,setLastPage] = useState<number|null>(null);
    const request = useRef(0);
    useEffect(()=>{
        const id=++request.current; let live=true;
        if(!validPatient){setError('This patient reference is invalid. Return to patient archives and select the patient again.');setLoading(false);return;}
        setLoading(true);setError('');
        const query=new URLSearchParams({page:String(page),count:String(size)});
        if(fixedPatient)query.set('patientid',String(patientId));
        if(filters.value&&(!fixedPatient||filters.field!=='patientid'))query.set(filters.field,filters.value);
        if(filters.from)query.set('from',filters.from);if(filters.to)query.set('to',filters.to);
        customFetch(`operations/collection/result?${query}`).then(response=>{
            if(!live||id!==request.current)return;
            if(response?.statusCode!==200||!Array.isArray(response?.result))throw Error(response?.message||'The patient archive could not be loaded. Please retry.');
            if(page>1&&!response.result.length){setLastPage(page-1);setPage(page-1);return;}
            setRows(response.result);if(response.result.length<size)setLastPage(page);
        }).catch((failure:any)=>{if(live&&id===request.current){setRows([]);setError(failure.message||'Unable to load patient archives.');}}).finally(()=>{if(live&&id===request.current)setLoading(false)});
        return()=>{live=false;};
    },[filters,page,size,revision,patientId,fixedPatient,validPatient]);
    const update=(key:string,value:string)=>setDraft(previous=>({...previous,[key]:value}));
    function apply(event:React.FormEvent){event.preventDefault();if(draft.to&&!draft.from){setFilterError('Choose a start date when filtering by end date.');return;}if(draft.from&&draft.to&&draft.from>draft.to){setFilterError('The end date must be on or after the start date.');return;}setFilterError('');setFilters({...draft,value:draft.value.trim()});setPage(1);setLastPage(null);}
    function clear(){setDraft({...initialFilters});setFilters({...initialFilters});setPage(1);setLastPage(null);setFilterError('');}
    function view(row:any){const query=new URLSearchParams({csvid:generateRandomTextAndNumbers(70)+row.billingid,ptid:generateRandomTextAndNumbers(50)+row.patientid,target:'70,50',testid:String(row.testid),testname:String(row.test_name||''),ascensionId:String(row.ascensionid),isMultiple:'false',isUltrasound:'false',is_password_encrypted:'false',password:'',isOpenSideBarShow:'false'});window.open('/result/labreport/4?'+query,'_blank','noopener,noreferrer');}
    const filtered=!!(filters.value||filters.from||filters.to);
    return <main className={s.workspace}>
        <header className={s.header}><div><small>LABORATORY OPERATIONS</small><h1>{fixedPatient?'Patient history':'Patient archives'}</h1><p>{fixedPatient?(patientName?`Laboratory records for ${patientName}.`:'Review this patient’s laboratory records, validation and report history.'):'Find previous laboratory cases, review validation and open the original results.'}</p></div><button type="button" className="btn btn-outline-primary" disabled={loading||!validPatient} onClick={()=>{setLastPage(null);setRevision(value=>value+1)}}>Refresh</button></header>
        <OperationsWorkspaceNavigation current="archives"/>
        {fixedPatient&&validPatient&&<div className={s.profile}><PreviewPatientInformation patientid={String(patientId)}/></div>}
        <section className={s.panel} aria-labelledby="archive-filter-title"><div className={s.panelHeading}><h2 id="archive-filter-title">Find laboratory records</h2><span>Search identifiers or choose a date range</span></div>
            <form className={s.filters} onSubmit={apply}>
                <label className={s.field}>Search by<select aria-label="Search by" className="form-select" value={draft.field} onChange={event=>{update('field',event.target.value);update('value','')}}>{!fixedPatient&&<option value="patientid">Patient ID</option>}<option value="fullname">Patient name</option><option value="billingid">Bill number</option><option value="ascensionid">Accession number</option></select></label>
                <label className={`${s.field} ${s.searchField}`}>Search value<input className="form-control" type="search" maxLength={100} inputMode={draft.field==='patientid'||draft.field==='billingid'?'numeric':'text'} placeholder={draft.field==='fullname'?'Enter the patient’s name':'Enter an identifier'} value={draft.value} onChange={event=>update('value',event.target.value)}/></label>
                <label className={s.field}>From date<input className="form-control" type="date" value={draft.from} max={draft.to||undefined} onChange={event=>update('from',event.target.value)}/></label><label className={s.field}>To date<input className="form-control" type="date" value={draft.to} min={draft.from||undefined} onChange={event=>update('to',event.target.value)}/></label>
                <div className={s.actions}><button type="submit" className="btn btn-primary" disabled={loading||!validPatient}>Search</button><button type="button" className="btn btn-outline-secondary" disabled={loading} onClick={clear}>Clear filters</button></div>
            </form>{filterError&&<div className="alert alert-danger mt-3 mb-0" role="alert">{filterError}</div>}
        </section>
        <section className={s.panel} aria-labelledby="archive-results-title"><div className={s.panelHeading}><div><h2 id="archive-results-title">{fixedPatient?'Laboratory case history':'Archived laboratory cases'}</h2><p className={s.help}>{loading?'Loading records…':`${rows.length} records on this page${filtered?' · Filters applied':''}`}</p></div><label className={s.pageSize}>Rows per page<select className="form-select" value={size} disabled={loading} onChange={event=>{setSize(Number(event.target.value));setPage(1);setLastPage(null)}}>{[10,20,50].map(value=><option key={value} value={value}>{value}</option>)}</select></label></div>
            {error?<div className={s.empty} role="alert"><h3>We couldn’t load these records</h3><p>{error}</p>{validPatient&&<button type="button" className="btn btn-outline-primary" onClick={()=>setRevision(value=>value+1)}>Retry</button>}</div>:loading?<div className={s.empty} role="status">Loading patient archives…</div>:!rows.length?<div className={s.empty}><h3>{filtered?'No records match your search':'No laboratory records found'}</h3><p>{filtered?'Try a different identifier, patient name or date range.':'Laboratory case history will appear here when it is available.'}</p>{filtered&&<button type="button" className="btn btn-outline-secondary" onClick={clear}>Clear filters</button>}</div>:<><div className={s.tableWrap} role="region" aria-label="Patient archive records" tabIndex={0}><table className={s.table}><thead><tr><th>Patient / bill</th><th>Test / case</th><th>Result status</th><th>Validation</th><th>History</th><th>Actions</th></tr></thead><tbody>{rows.map((row:any,index:number)=><tr key={row.ascensionid||`${row.billingid}-${row.testid}-${index}`}>
                <td><div className={s.record}><strong>{row.fullname||'Patient name unavailable'}</strong><span>Patient #{row.patientid} · Bill #{row.billingid}</span>{row.gender&&<small>{row.gender}</small>}<small>Billed: {when(row.billing_date)}</small></div></td>
                <td><div className={s.record}><strong>{row.test_name||'Laboratory test'}</strong><small>Accession #{row.ascensionid}</small></div></td>
                <td><div className={s.record}><span className={s.badge} data-tone={Number(row.requires_revalidation)===1?'warning':Number(row.isapproved)===1?'success':'warning'}>{Number(row.requires_revalidation)===1?'Needs revalidation':Number(row.isapproved)===1?'Approved':'Pending approval'}</span>{row.approvedBy&&<small>Approved by: {row.approvedBy}</small>}{row.result_entry_date&&<small>Entered: {when(row.result_entry_date)}</small>}</div></td>
                <td><div className={s.record}><span>{Array.isArray(row.validators)&&row.validators.length?row.validators.map((value:any)=>value.username).filter(Boolean).join(', '):row.validatedby||'Validator not recorded'}</span><small>{when(row.samplevalidatedon)}</small></div></td>
                <td><div className={s.record}><span>{Number(row.printCount)||0} printed copies</span><small>Updated: {when(row.lastupdatedon)}</small></div></td>
                <td><div className={s.rowActions}><button type="button" className="btn btn-outline-primary btn-sm" onClick={()=>view(row)}>View result</button>{!fixedPatient&&<a className="btn btn-outline-secondary btn-sm" href={`/operations/laboratory/patientarchives/${plsEncryption(String(row.patientid))}?isOpenSideBarShow=false`} target="_blank" rel="noopener noreferrer">Patient history</a>}</div></td>
            </tr>)}</tbody></table></div><footer className={s.pagination}><span>Page {page} · {rows.length} records shown</span><div><button type="button" className="btn btn-outline-primary btn-sm" disabled={page===1||loading} onClick={()=>setPage(value=>value-1)}>Previous</button><span className={s.count}>{page}</span><button type="button" className="btn btn-outline-primary btn-sm" disabled={loading||rows.length<size||lastPage!==null&&page>=lastPage} onClick={()=>setPage(value=>value+1)}>Next</button></div></footer></>}
        </section>
    </main>;
}
