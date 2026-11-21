import React from 'react';
function initialTat(data:any){
 const value=String(data.tat??'').trim();
 if(/^\d+(?:\.\d+)?$/.test(value)){
  const n=Number(value)*(data.tatEvaluation==='hour'?60:data.tatEvaluation==='seconds'?1/60:1);
  const total=Math.ceil(n);return {days:Math.floor(total/1440),hours:Math.floor(total%1440/60),minutes:total%60};
 }
 const amount=(pattern:RegExp)=>Number(value.match(pattern)?.[1]??0);
 return {days:amount(/(\d+)\s*days?/i),hours:amount(/(\d+)\s*(?:hours?|hrs?)/i),minutes:amount(/(\d+)\s*min/i)};
}
export default function TatForm({data,setTestData}:any){
 const duration=data.analyticTat??initialTat(data);
 return <section aria-labelledby="analytic-tat-heading">
  <h5 id="analytic-tat-heading">Analytic TAT</h5>
  <p className="text-muted">Expected analytical turnaround time. Enter days, hours and minutes.</p>
  <div className="row g-3">{(['days','hours','minutes'] as const).map(key=><div className="col-12 col-sm-4" key={key}>
   <label className="pls-label d-block" htmlFor={`analytic-tat-${key}`}>{key==='minutes'?'Minutes':key==='hours'?'Hours':'Days'}</label>
   <input id={`analytic-tat-${key}`} className="custom-input w-100" type="number" min="0" step="1" value={duration[key]} onChange={event=>setTestData((previous:any)=>({...previous,analyticTat:{...duration,[key]:event.target.value}}))}/>
  </div>)}</div>
 </section>;
}
