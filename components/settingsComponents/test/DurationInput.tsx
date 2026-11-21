"use client";
export default function DurationInput({label,value,onChange}:{label:string;value:string|number|null;onChange:(minutes:number)=>void}){
 const total=Math.max(0,Number(value)||0);const parts={Days:Math.floor(total/1440),Hours:Math.floor(total%1440/60),Minutes:total%60};
 return <fieldset className="mb-3"><legend className="fs-6">{label}</legend><div className="row g-2">{(['Days','Hours','Minutes'] as const).map(key=><label className="col-4" key={key}>{key}<input aria-label={`${label} ${key}`} className="form-control" type="number" min="0" step="1" value={parts[key]} onChange={e=>{const next={...parts,[key]:Number(e.target.value)};onChange(next.Days*1440+next.Hours*60+next.Minutes);}}/></label>)}</div></fieldset>;
}
