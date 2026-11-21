"use client";
import {useState} from 'react';
import {usePathname} from 'next/navigation';
import {customFetch,customFetchMutation} from '../Auth/customFetch';
type Kind='departments'|'samples'|'containers';
export default function MasterLookupImport({kind,onImported}:{kind:Kind;onImported:()=>void|Promise<void>}){
 const pathname=usePathname();const [open,setOpen]=useState(false),[rows,setRows]=useState<any[]>([]),[selected,setSelected]=useState<number[]>([]),[query,setQuery]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState('');
 if(pathname?.startsWith('/master-platform'))return null;
 const label=kind==='samples'?'sample types':kind;
 async function load(){setBusy(true);setError('');try{const r=await customFetch(`testpanel/master-lookups/${kind}`);if(!r?.success||!Array.isArray(r.data))throw new Error(r?.message||'Unable to load master items');setRows(r.data);setSelected([]);}catch(e:any){setError(e.message);}finally{setBusy(false);}}
 async function apply(){setBusy(true);setError('');setNotice('');try{const r=await customFetchMutation(`testpanel/master-lookups/${kind}`,'POST',{ids:selected});if(!r?.success)throw new Error(r?.message||'Unable to import');setNotice(`${r.data.imported} imported; ${r.data.skipped} already present and kept unchanged.`);await onImported();await load();}catch(e:any){setError(e.message);}finally{setBusy(false);}}
 const shown=rows.filter(row=>row.name.toLowerCase().includes(query.toLowerCase())),available=shown.filter(row=>row.status==='new');
 return <section className="border rounded bg-white p-3 my-3" aria-label={`Import master ${label}`}>
 <button type="button" className="btn btn-outline-primary" disabled={busy} onClick={()=>{setOpen(!open);if(!open)void load();}}>Import {label} from master</button>
 {open&&<div className="mt-3"><p>Select master {label} to add. Existing items and conflicting container specifications are kept unchanged.</p>{error&&<p role="alert" className="alert alert-danger">{error}</p>}{notice&&<p role="status" className="alert alert-success">{notice}</p>}
 <fieldset disabled={busy}><label className="d-block">Search master {label}<input className="form-control" type="search" value={query} onChange={e=>setQuery(e.target.value)}/></label>
 <label className="d-block my-2"><input type="checkbox" checked={available.length>0&&available.every(row=>selected.includes(row.id))} onChange={e=>setSelected(previous=>e.target.checked?[...new Set([...previous,...available.map(row=>row.id)])]:previous.filter(id=>!available.some(row=>row.id===id)))}/> Select all new matching items</label>
 <div className="table-responsive" style={{maxHeight:340}}><table className="table table-sm align-middle"><thead><tr><th>Select</th><th>Name</th><th>Master details</th><th>Preview</th></tr></thead><tbody>{shown.map(row=><tr key={row.id}><td><input type="checkbox" aria-label={`Import ${row.name}`} disabled={row.status!=='new'} checked={selected.includes(row.id)} onChange={e=>setSelected(previous=>e.target.checked?[...previous,row.id]:previous.filter(id=>id!==row.id))}/></td><td>{row.name}</td><td>{row.details||'—'}</td><td>{row.status==='new'?'Add':row.status==='conflict'?'Conflict — keep facility setup':'Already present'}</td></tr>)}</tbody></table>{!shown.length&&!busy&&<p>No master items match.</p>}</div>
 <button type="button" className="btn btn-primary" disabled={!selected.length||busy} onClick={apply}>Import selected ({selected.length})</button><button type="button" className="btn btn-outline-secondary ms-2" onClick={load}>Refresh preview</button></fieldset>{busy&&<p role="status">Working...</p>}</div>}
 </section>;
}
