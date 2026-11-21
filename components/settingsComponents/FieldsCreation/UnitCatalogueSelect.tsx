"use client";
import {useEffect,useState} from 'react';
import {customFetch,customPost} from '../../Auth/customFetch';
import {useTestPanelBasePath} from '../TestPanelWorkspace';
type Unit={code:string;symbol:string;label:string;aliases:string[]};
export default function UnitCatalogueSelect({field,onChange}:{field:any;onChange:(field:any)=>void}){
 const [units,setUnits]=useState<Unit[]>([]),[loading,setLoading]=useState(true),[error,setError]=useState(''),[custom,setCustom]=useState(false),[adding,setAdding]=useState(false);
 const [draft,setDraft]=useState({code:'',symbol:'',label:''});
 const master=useTestPanelBasePath()==='/master-platform/test-catalog';
 async function load(){setLoading(true);setError('');try{const response=await customFetch('testpanel/unit-catalogue');if(!response?.success||!Array.isArray(response.data))throw Error(response?.message||'Unable to load shared units');setUnits(response.data);}catch(e:any){setError(e.message);}finally{setLoading(false);}}
 useEffect(()=>{void load()},[]);
 const selected=units.find(unit=>unit.code===field.unit_code&&unit.symbol===field.units);
 const legacy=!!field.units&&!selected;
 return <div style={{minWidth:150}}>
  <select aria-label="Unit catalogue" className="form-select form-select-sm" disabled={loading} value={custom?'__custom':selected?.code||(legacy?'__legacy':'')} onChange={event=>{
   const code=event.target.value;if(code==='__custom'){setCustom(true);return;}setCustom(false);
   const unit=units.find(item=>item.code===code);onChange({...field,unit_code:unit?.code??null,units:unit?.symbol||'',hasunits:!!unit});
  }}>
   <option value="">{loading?'Loading units…':'No unit'}</option>
   {legacy&&<option value="__legacy">{field.units} (existing/custom)</option>}
   {units.map(unit=><option key={unit.code} value={unit.code}>{unit.symbol}{unit.label!==unit.symbol?` — ${unit.label}`:''}</option>)}
   <option value="__custom">Custom / legacy unit…</option>
  </select>
  {custom&&<input aria-label="Custom unit" className="form-control form-control-sm mt-1" value={field.units||''} maxLength={64} onChange={e=>onChange({...field,unit_code:null,units:e.target.value,hasunits:!!e.target.value})}/>}
  {error&&<div role="alert" className="small text-danger">{error}<button type="button" className="btn btn-link btn-sm" onClick={()=>void load()}>Retry units</button></div>}
  {master&&<details className="small mt-1"><summary>Add shared unit</summary>
   {(['code','symbol','label'] as const).map(key=><input key={key} aria-label={`Unit ${key}`} placeholder={key} maxLength={key==='label'?120:64} className="form-control form-control-sm mt-1" value={draft[key]} onChange={e=>setDraft({...draft,[key]:e.target.value})}/>)}
   <button type="button" className="btn btn-outline-primary btn-sm mt-1" disabled={adding} onClick={async()=>{if(adding)return;setAdding(true);setError('');try{const response=await customPost('testpanel/unit-catalogue','POST',draft);if(!response?.success)throw Error(response?.message||'Unable to add shared unit');await load();onChange({...field,unit_code:response.data.code,units:response.data.symbol,hasunits:true});setCustom(false);setDraft({code:'',symbol:'',label:''});}catch(e:any){setError(e.message);}finally{setAdding(false);}}}>Add unit to catalogue</button>
  </details>}
 </div>;
}
