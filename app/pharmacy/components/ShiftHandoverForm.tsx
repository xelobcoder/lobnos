'use client';
import {useState} from 'react';
import {Message,Empty,money,dateLabel,styles,usePharmacyResource} from './PharmacyWorkspace';

interface ShiftHandoverFormProps {
 shift: any;
 review: boolean;
 adminSelfReview?: boolean;
 busy: boolean;
 onConfirm: (payload: any) => Promise<void>;
 onCancel: () => void;
}

export default function ShiftHandoverForm({shift,review,adminSelfReview=false,busy,onConfirm,onCancel}:ShiftHandoverFormProps){
 const resource=usePharmacyResource(`pharmacy/management/shifts/${encodeURIComponent(shift.id)}/handover`);
 const [count,setCount]=useState('');
 const [acknowledged,setAcknowledged]=useState(false);
 const [validationError,setValidationError]=useState('');
 const data=resource.data;
 const selfReview=review&&adminSelfReview;
 return <>
  <Message error={resource.error||validationError}/>
  {resource.error?<button className="btn btn-outline-secondary" disabled={busy||resource.loading} onClick={resource.refresh}>Reload shift breakdown</button>:
   resource.loading?<Empty>Loading shift cash movements...</Empty>:data&&<>
    <p><strong>{shift.cashier_name||`Cashier #${data.cashierId}`}</strong> · {dateLabel(data.financialDate)}</p>
    <dl className="row mb-2">
     {[['Opening float',data.openingFloat],['Cash collected',data.cashSales],['Cash refunds',-data.cashRefunds],['Cash expenses / supplier payments',-data.cashOut],[review?'Expected cash at close':'Expected cash',data.expectedCash]].map(([label,value])=>
      <div key={String(label)} className="d-flex justify-content-between gap-3 mb-2"><dt>{label}</dt><dd className="mb-0 text-nowrap">{money(value)}</dd></div>)}
    </dl>
    {review&&data.currentExpectedCash!==undefined&&data.currentExpectedCash!==data.expectedCash&&<div role="alert" className="alert alert-warning">Cash movements now total {money(data.currentExpectedCash)}. The expected cash and difference below preserve the figures recorded when the shift closed. Investigate the change and explain it in your review.</div>}
    {review&&<div className="alert alert-info">Cash counted: <strong>{money(data.countedCash)}</strong><br/>Recorded difference: <strong>{money(data.variance)}</strong></div>}
    <p className={styles.muted}>{review?
     selfReview?'Administrator self-review: verify the cash breakdown and explain any difference. Your acknowledgement and reason will be recorded in the financial-day audit history.':
      'Verify the handover and explain any difference before approving. A different employee must review this handover.':
     'Count the physical cash, including the opening float. Card and mobile money are excluded. Any difference is recorded; it is not silently adjusted.'}</p>
    <form onSubmit={async e=>{
     e.preventDefault();
     if(busy)return;
     setValidationError('');
     const f=new FormData(e.currentTarget),note=String(f.get('note')||'').trim();
     if(selfReview&&(!acknowledged||note.length<10)){
      setValidationError('Acknowledge administrator self-review and enter a reason of at least 10 characters.');
      return;
     }
     await onConfirm(review?{note,...(selfReview?{adminSelfReview:true}:{})}:{countedCash:Number(count)});
    }}>
     <fieldset disabled={busy} className="border-0 p-0">
      {review?<>
       <label className="form-label d-block">{selfReview?'Administrator review reason':'Review note'}
        <textarea className="form-control" name="note" required minLength={selfReview?10:undefined} maxLength={500} rows={3} autoFocus/>
       </label>
       {selfReview&&<label className="form-check d-flex gap-2 align-items-start">
        <input type="checkbox" className="form-check-input" required checked={acknowledged} onChange={e=>setAcknowledged(e.target.checked)}/>
        <span>I have verified my own handover and accept responsibility for the recorded cash count and difference.</span>
       </label>}
      </>:<>
       <label className="form-label d-block">Cash counted (GHS)<input className="form-control form-control-lg" name="count" type="number" min="0" step="0.01" required autoFocus value={count} onChange={e=>setCount(e.target.value)}/></label>
       {count!==''&&<p role="status">Difference: <strong>{money(Number(count)-data.expectedCash)}</strong></p>}
      </>}
      <div className={styles.footer}>
       <button type="button" className="btn btn-outline-secondary" disabled={busy} onClick={onCancel}>Cancel</button>
       <button className="btn btn-primary" disabled={busy||resource.loading||(selfReview&&!acknowledged)||(review?(!data.closed||data.reviewed):data.closed)}>{busy?'Saving...':review?'Confirm handover review':'Close shift & record variance'}</button>
      </div>
     </fieldset>
    </form>
   </>}
 </>;
}
