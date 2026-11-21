"use client";
import {useCallback,useEffect,useState} from 'react';
import {customFetch} from '../../Auth/customFetch';
export type ReportValidationDraft={testid:number;loading:boolean;error:string;rules:any[]};
export default function ReportValidationRules({testid,onStateChange,disabled=false}:{testid:number;onStateChange:(draft:ReportValidationDraft)=>void;disabled?:boolean}){
 const [rules,setRules]=useState<any[]>([]),[loading,setLoading]=useState(true),[error,setError]=useState(''),[inherited,setInherited]=useState<any[]>([]);
 const load=useCallback(async()=>{setLoading(true);setError('');try{const response=await customFetch(`testpanel/${testid}/validation-rules`);if(!response?.success||!Array.isArray(response.data))throw new Error(response?.message||'Unable to load validation rules');setRules(response.data);setInherited(response.inheritedRules??[]);}catch(e:any){setError(e.message);}finally{setLoading(false);}},[testid]);
 useEffect(()=>{void load();},[load]);
 useEffect(()=>{onStateChange({testid,loading,error,rules});},[testid,loading,error,rules,onStateChange]);
 const update=(id:number,key:string,value:any)=>{setRules(rows=>rows.map(row=>row.fieldid===id?{...row,[key]:value}:row));};

 const check=(row:any,key:string,label:string)=><label className="d-flex align-items-center gap-2"><input type="checkbox" checked={Boolean(Number(row[key]))} onChange={e=>update(row.fieldid,key,e.target.checked)}/><strong>{label}</strong></label>;
 const input=(row:any,key:string,label:string,min?:number)=><label className="d-block flex-grow-1">{label}<input aria-label={`${row.name} ${label}`} type="number" step="any" min={min} className="custom-input w-100" value={row[key]??''} onChange={e=>update(row.fieldid,key,e.target.value)}/></label>;
 return <section aria-labelledby="report-validation-heading" className="mt-4 border rounded p-3 bg-white">
 <fieldset disabled={disabled} style={{minWidth:0}}>
 <h5 id="report-validation-heading">Report Validation Rules</h5>
 <p className="text-muted">Linearity Check verifies the measurable range. Delta Check compares a patient's previous result. These are separate from reference ranges.</p>
 {error&&<div role="alert" className="alert alert-danger">{error} <button type="button" className="btn btn-sm btn-outline-secondary" onClick={load}>Retry loading rules</button></div>}
 {loading?<p role="status">Loading rules...</p>:<>
 {inherited.length>0&&<p className="alert alert-info">{inherited.length} active panel or global Delta Check rule(s) also apply. Disabling a parameter rule falls back to inherited rules.</p>}
 {!rules.length&&<p>Add parameters before configuring validation rules.</p>}
 {rules.map(row=><div key={row.fieldid} className="border-bottom pb-3 mb-3"><h6 className="fw-bold">{row.name} {row.units&&<span className="text-muted">({row.units})</span>}</h6>
 {check(row,'linearity_enabled','Linearity Check')}
 {Boolean(Number(row.linearity_enabled))&&<div className="d-flex flex-wrap gap-3 mt-2">{input(row,'linearity_lower','Linearity lower limit')}{input(row,'linearity_upper','Linearity upper limit')}</div>}
 <div className="mt-3">{check(row,'delta_enabled','Delta Check')}</div>
 {Boolean(Number(row.delta_enabled))&&<div className="d-flex flex-wrap gap-3 mt-2">{input(row,'window_hours','Lookback hours',1)}{input(row,'max_absolute','Maximum absolute change',0)}{input(row,'max_percent','Maximum percentage change',0)}<label className="d-block">When exceeded<select className="custom-select d-block" value={row.action} onChange={e=>update(row.fieldid,'action',e.target.value)}><option value="warn">Warn and audit</option><option value="block">Require acknowledgement</option></select></label></div>}
 </div>)}
 <p className="text-muted mb-0">Saved together with Test Details using Save Changes below.</p>
 </>}
 </fieldset>
 </section>;
}
