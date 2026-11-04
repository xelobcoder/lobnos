'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {buildPharmacyReferralPdf, type PharmacyReferralSlip} from '../pharmacy-referral';

import Link from 'next/link';
import useCompanyImageUrl from '../../../components/Auth/useCompanyImageUrl';
import { RiCheckLine, RiFileList3Line, RiSendPlaneLine } from '@remixicon/react';
import { customFetch, customFetchMutation } from '../../../components/Auth/customFetch';
import PrimeTable from '../../../components/accessories/Datatables/PrimeTable';
import styles from '../pharmacy.module.css';
import PharmacyPaymentFields,{usePharmacyPayment} from '../components/PharmacyPaymentFields';

type PrescriptionStatus = 'pending' | 'partially_fulfilled' | 'fulfilled' | 'referred' | 'cancelled';
type PrescriptionItemStatus = 'pending' | 'dispensed' | 'referred' | 'cancelled';

type PrescriptionSummary = {
     id: string;
     patientId: number;
     patientName: string;
     clinicianId: number;
     clinicianName: string;
     status: PrescriptionStatus;
     createdAt: string;
};

type PrescriptionItem = {
     id: string;
     inventoryItemId: string | null;
     drugName: string;
     dosageInstructions: string | null;
     dose: string | null;
     frequency: string | null;
     duration: string | null;
     route: string | null;
     availableStock?:number;
     salePrice?:number;
     quantityOrdered: number;
     quantityDispensed: number;
     status: PrescriptionItemStatus;
};

type PrescriptionDetail = {
     patientName?:string;
     id: string;
     patientId: number;
     status: PrescriptionStatus;
     notes: string | null;
     items: PrescriptionItem[];
};

const STATUS_META: Record<PrescriptionStatus, { label: string; badge: string }> = {
     pending: { label: 'Pending', badge: 'text-bg-warning' },
     partially_fulfilled: { label: 'Partially fulfilled', badge: 'text-bg-info' },
     fulfilled: { label: 'Fulfilled', badge: 'text-bg-success' },
     referred: { label: 'Referred out', badge: 'text-bg-secondary' },
     cancelled: { label: 'Cancelled', badge: 'text-bg-danger' },
};

const DEFAULT_PAGE_SIZE = 20;

export default function PharmacyPrescriptionsPage() {
     const payment=usePharmacyPayment('prescription');
     const companyLogoUrl=useCompanyImageUrl();

     const [notice,setNotice]=useState('');
     const [reprinting,setReprinting]=useState<string|null>(null);
     const reprintReferral=async(id:string)=>{if(reprinting)return;setReprinting(id);setError('');try{const r=await customFetch('prescriptions/'+id+'/referral-slip');if(!r?.success)throw new Error(r?.error?.message||'Unable to retrieve referral');await printReferralSlip({...r.data,reprint:true});}catch(e){setError(e instanceof Error?e.message:'Unable to reprint referral');}finally{setReprinting(null);}};
     const [statusFilter, setStatusFilter] = useState<'all' | 'open' | PrescriptionStatus>('open');
     const [prescriptions, setPrescriptions] = useState<PrescriptionSummary[]>([]);
     const [error, setError] = useState('');

     const detailGeneration=useRef(0);
     const [detailLoading,setDetailLoading]=useState(false);
     useEffect(()=>()=>{detailGeneration.current++;},[]);
     const [selected, setSelected] = useState<PrescriptionDetail | null>(null);
     const [supplyQuantities,setSupplyQuantities]=useState<Record<string,string>>({});
     const [dispenseQuantities, setDispenseQuantities] = useState<Record<string, number>>({});
     const [paymentMethod, setPaymentMethod] = useState('cash');
     const [submitting, setSubmitting] = useState(false);
     const [detailError, setDetailError] = useState('');

     const loadPrescriptions = useCallback(
          async (page = 1, count = DEFAULT_PAGE_SIZE) => {
               try {
                    setError('');
                    const status = statusFilter === 'all' ? '' : statusFilter === 'open' ? 'pending,partially_fulfilled' : statusFilter;
                    const response = await customFetch(`prescriptions?page=${page}&count=${count}&status=${status}`);
                    if (response?.success) {
                         const items: PrescriptionSummary[] = response.data.prescriptions || [];
                         setPrescriptions(items);
                         return { result: items, error: false };
                    }
                    setError(response?.error?.message || 'Unable to load the prescription queue.');
               } catch {
                    setError('Unable to load the prescription queue.');
               }
               setPrescriptions([]);
               return { result: [], error: true };
          },
          [statusFilter]
     );

     useEffect(() => {
          loadPrescriptions(1, DEFAULT_PAGE_SIZE);
     }, [loadPrescriptions]);

     const openPrescription = async (id: string) => {
          const generation=++detailGeneration.current;
          setSelected(null);
          setSupplyQuantities({});
          setDispenseQuantities({});
          setDetailError('');
          setDetailLoading(true);
          try {
               const response=await customFetch(`prescriptions/${id}`);
               if(generation!==detailGeneration.current)return;
               if(!response?.success)throw new Error(response?.error?.message||'Unable to load this prescription.');
               const detail:PrescriptionDetail=response.data;
               if(String(detail.id)!==String(id))throw new Error('The returned prescription does not match your selection.');
               setSelected(detail);
               setDispenseQuantities(Object.fromEntries(detail.items.filter(item=>item.status==='pending').map(item=>[item.id,0])));
          } catch(error) {
               if(generation===detailGeneration.current)setDetailError(error instanceof Error?error.message:'Unable to load this prescription.');
          } finally {
               if(generation===detailGeneration.current)setDetailLoading(false);
          }
     };
     const closeDetail = () => {
          detailGeneration.current++;
          setSelected(null);
          setDispenseQuantities({});
          setSupplyQuantities({});
          setDetailError('');
          setDetailLoading(false);
     };

     const dispensingTotal=selected?selected.items.reduce((cents,item)=>cents+Math.round(Math.round((item.salePrice||0)*100)*Math.round((dispenseQuantities[item.id]||0)*1000)/1000),0)/100:0;
     const fulfillSelected=async()=>{
          if(submitting||(!selected&&!payment.pending))return;
          const lines=Object.entries(dispenseQuantities).filter(([,quantity])=>quantity>0).map(([prescriptionItemId,quantityDispensed])=>({prescriptionItemId,quantityDispensed}));
          if(!payment.pending){
               if(!lines.length){setDetailError('Enter quantities for the drugs you intend to dispense.');return;}
               if(!payment.amount||(paymentMethod!=='cash'&&!payment.reference.trim())){setDetailError('Enter the amount received and payment reference.');return;}
               if(!window.confirm('Dispense selected medicines for '+(selected?.patientName||'patient #'+selected?.patientId)+' and record GHS '+dispensingTotal.toFixed(2)+' received?'))return;
          }
          setSubmitting(true);setDetailError('');
          try {
               const response=await payment.execute('prescriptions/'+selected?.id+'/fulfill',{lines,paymentMethod,customerName:selected?.patientName,expectedTotal:dispensingTotal});
               if(!response?.success)throw new Error(response?.error?.message||'Dispensing could not be confirmed. Retry the original request.');
               setNotice('Dispensing recorded. Receipt '+response.data.receipt.receiptNumber+' — GHS '+Number(response.data.receipt.total).toFixed(2));
               closeDetail();await loadPrescriptions(1,DEFAULT_PAGE_SIZE);
          }catch(error){setDetailError(error instanceof Error?error.message:'Dispensing could not be confirmed');}finally{setSubmitting(false);}
     };

     const referRemaining = async () => {
          if(!selected||submitting||payment.pending)return;
          if(!window.confirm('Refer all remaining medicines outside this pharmacy?'))return;
          const prescriptionId=selected.id;
          setSubmitting(true);
          setDetailError('');
          try {
               const response=await customFetchMutation(`prescriptions/${prescriptionId}/refer`,'POST',{});
               if(!response?.success)throw new Error(response?.error?.message||'Unable to refer the remaining items.');
               try { await printReferralSlip(response.data.referralSlip); }
               catch(error) { setError('Referral saved. '+(error instanceof Error?error.message:'Unable to print. Use Reprint referral to try again.')); }
               await loadPrescriptions(1,DEFAULT_PAGE_SIZE);
               closeDetail();
          } catch(error) {
               setDetailError(error instanceof Error?error.message:'Unable to confirm referral. Refresh this prescription before retrying.');
          } finally { setSubmitting(false); }
     };

     const printReferralSlip = async (slip: PharmacyReferralSlip) => {
          if(!slip.company){const response=await customFetch('prescriptions/'+slip.prescriptionId+'/referral-slip');if(!response?.success)throw new Error(response?.error?.message||'Unable to load referral details');slip={...response.data,reprint:slip.reprint};}
          let logo:string|undefined;
          if(companyLogoUrl){try{logo=await new Promise<string>((resolve,reject)=>{const image=new Image();image.crossOrigin='anonymous';image.onload=()=>{try{const canvas=document.createElement('canvas');canvas.width=image.naturalWidth;canvas.height=image.naturalHeight;const context=canvas.getContext('2d');if(!context)throw new Error('Image conversion unavailable');context.drawImage(image,0,0);resolve(canvas.toDataURL('image/png'));}catch(error){reject(error);}};image.onerror=()=>reject(new Error('Logo unavailable'));image.src=companyLogoUrl;});}catch{setNotice('The referral is ready, but the company logo could not be loaded. Check the logo in Company Profile.');}}

          const patientName=selected?.patientName||prescriptions.find(row=>row.id===slip.prescriptionId)?.patientName;
          const pdf=buildPharmacyReferralPdf(slip,patientName,logo);
          pdf.autoPrint();
          const url=URL.createObjectURL(pdf.output('blob'));
          window.open(url,'_blank');
          window.setTimeout(()=>URL.revokeObjectURL(url),60000);
     };

     const columns = [
          { Header: 'Patient', accessor: 'patientName' },
          { Header: 'Clinician', accessor: 'clinicianName' },
          {
               Header: 'Status',
               accessor: 'status',
               Cell: ({ value }: { value: PrescriptionStatus }) => <span className={`badge ${STATUS_META[value].badge}`}>{STATUS_META[value].label}</span>,
          },
          {
               Header: 'Ordered',
               accessor: 'createdAt',
               Cell: ({ value }: { value: string }) => new Date(value).toLocaleString(),
          },
          {
               Header: 'Action',
               accessor: 'id',
               Cell: ({ row }: { row: { original: PrescriptionSummary } }) => (
                    <div className="d-flex flex-wrap gap-2"><button type="button" className="btn btn-sm btn-outline-primary" disabled={submitting||!!payment.pending} onClick={() => openPrescription(row.original.id)}>
                         <RiFileList3Line size={16} className="me-1" />
                         Review
                    </button>{['referred','fulfilled'].includes(row.original.status)&&<button type="button" className="btn btn-sm btn-outline-secondary" disabled={!!reprinting} onClick={()=>reprintReferral(row.original.id)}>{reprinting===row.original.id?'Preparing...':'Reprint referral'}</button>}</div>
               ),
          },
     ];

     return (
          <div className={styles.workspace}>{detailLoading&&<p role="status">Loading selected prescription...</p>}{detailError&&!selected&&<p role="alert" className="text-danger">{detailError}</p>}
               <div className="d-flex flex-wrap justify-content-between align-items-end gap-3 mb-4">
                    <div>
                         <h4 className="fw-bold mb-1">Prescriptions</h4><Link className="btn btn-primary my-2" href="/pharmacy/prescriptions/new">Create prescription</Link>
                         <small className="text-muted">Drug orders raised by clinicians during consultation, awaiting pharmacy fulfillment.</small>
                    </div>
                    <select className="form-select" style={{ width: 'auto' }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)}>
                         <option value="all">All prescriptions</option><option value="open">Open (pending/partial)</option>
                         <option value="fulfilled">Fulfilled</option>
                         <option value="referred">Referred out</option>
                         <option value="cancelled">Cancelled</option>
                    </select>
               </div>


               {notice&&<div className="alert alert-success" role="status">{notice}</div>}
               {payment.pending&&<div className="alert alert-warning">A dispensing request needs confirmation. <button className="btn btn-warning" disabled={submitting} onClick={fulfillSelected}>Retry original dispensing</button></div>}
               {!selected&&detailError&&<div className="alert alert-danger" role="alert">{detailError}</div>}
               {error && <div className="alert alert-danger">{error}</div>}

               <PrimeTable
                    column={columns}
                    data={prescriptions}
                    filtering={false}
                    serverSideFiltering={true}
                    urlparams={{}}
                    handleSeverSideProcessing={({ page, count }: { page: number; count: number }) => loadPrescriptions(page, count)}
               />

               {selected && (
                    <div className="modal d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                         <div className="modal-dialog modal-lg">
                              <div className="modal-content">
                                   <div className="modal-header">
                                        <h5 className="modal-title">Fulfill prescription</h5><Link className="btn btn-sm btn-outline-primary" href={'/pharmacy/clinical?prescriptionId='+selected.id}>Pharmacist review</Link>
                                        <button type="button" className="btn-close" onClick={closeDetail} />
                                   </div>
                                   <div className="modal-body">
                                        <p className="fw-semibold">{selected.patientName||'Patient'} · Patient #{selected.patientId}</p>
                                        <p className="small text-muted">Review the patient, directions, available stock and quantities before collecting payment.</p>
                                        {detailError && <div className="alert alert-danger py-2">{detailError}</div>}
                                        <table className="table table-sm align-middle">
                                             <thead>
                                                  <tr>
                                                       <th>Drug</th>
                                                       <th>Ordered</th>
                                                       <th>Dispensed</th>
                                                       <th>Status</th>
                                                       <th style={{ width: 120 }}>Dispense now</th>
                                                  </tr>
                                             </thead>
                                             <tbody>
                                                  {selected.items.map((item) => {
                                                       const regimen = [item.dose, item.frequency, item.route, item.duration].filter(Boolean).join(' · ');
                                                       return (
                                                       <tr key={item.id}>
                                                            <td>
                                                                 {item.drugName}
                                                                 {regimen ? <div className="text-muted small">{regimen}</div> : null}
                                                                 {item.dosageInstructions ? <div className="text-muted small fst-italic">{item.dosageInstructions}</div> : null}
                                                            </td>
                                                            <td>{item.quantityOrdered>0?item.quantityOrdered:<div><small className="d-block text-muted">Pharmacist to confirm</small><input aria-label={'Supply quantity for '+item.drugName} className="form-control form-control-sm" type="number" min="0.001" step="0.001" value={supplyQuantities[item.id]||''} disabled={submitting||!!payment.pending} onChange={e=>setSupplyQuantities(values=>({...values,[item.id]:e.target.value}))}/><button type="button" className="btn btn-sm btn-outline-primary mt-1" disabled={submitting||!!payment.pending||!Number(supplyQuantities[item.id])} onClick={async()=>{setSubmitting(true);setDetailError('');try{const r=await customFetchMutation('prescriptions/'+selected.id+'/items/'+item.id+'/supply-quantity','PUT',{quantity:Number(supplyQuantities[item.id])});if(!r?.success)throw new Error(r?.error?.message||'Unable to confirm quantity');await openPrescription(selected.id);}catch(e){setDetailError(e instanceof Error?e.message:'Unable to confirm quantity');}finally{setSubmitting(false);}}}>Confirm quantity</button><small className="d-block text-muted">Confirm before pharmacist review.</small></div>}<div className="small text-muted">Available: {item.availableStock||0}<br/>GHS {Number(item.salePrice||0).toFixed(2)} / unit</div></td>
                                                            <td>{item.quantityDispensed}</td>
                                                            <td><span className="badge text-bg-light border">{item.status}</span></td>
                                                            <td>
                                                                 {item.status === 'pending' ? (
                                                                      <input
                                                                           type="number"
                                                                           min={0}
                                                                           max={Math.min(item.quantityOrdered - item.quantityDispensed,item.availableStock||0)} step="0.001" disabled={submitting||!!payment.pending||!item.inventoryItemId||!item.quantityOrdered}
                                                                           className="form-control form-control-sm"
                                                                           value={dispenseQuantities[item.id] ?? 0}
                                                                           onChange={(e) => setDispenseQuantities((current) => ({ ...current, [item.id]: Math.max(0, Number(e.target.value)) }))}
                                                                      />
                                                                 ) : null}
                                                            </td>
                                                       </tr>
                                                       );
                                                  })}
                                             </tbody>
                                        </table>
                                        <p className="fw-bold">Amount to collect: GHS {dispensingTotal.toFixed(2)}</p>
                                        <PharmacyPaymentFields payment={payment} total={dispensingTotal} method={paymentMethod} disabled={submitting}/>
                                        <div className="d-flex align-items-center gap-2">
                                             <label className="small text-muted mb-0">Payment method</label>
                                             <select className="form-select form-select-sm" style={{ width: 'auto' }} value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                                                  <option value="cash">Cash</option>
                                                  <option value="mobile_money">Mobile money</option>
                                                  <option value="card">Card</option>
                                             </select>
                                        </div>
                                   </div>
                                   <div className="modal-footer">{selected.items.some(item=>item.status==='referred')&&<button type="button" className="btn btn-outline-secondary" disabled={!!reprinting} onClick={()=>reprintReferral(selected.id)}>Reprint referral slip</button>}
                                        <button type="button" className="btn btn-outline-secondary d-flex align-items-center gap-1" disabled={submitting||!!payment.pending} onClick={referRemaining}>
                                             <RiSendPlaneLine size={16} />
                                             Refer remaining out &amp; print slip
                                        </button>
                                        <button type="button" className="btn btn-primary d-flex align-items-center gap-1" disabled={submitting||!!payment.pending||payment.setup?.day?.status!=='open'||!payment.setup?.shift} onClick={fulfillSelected}>
                                             <RiCheckLine size={16} />
                                             Dispense selected
                                        </button>
                                   </div>
                              </div>
                         </div>
                    </div>
               )}
          </div>
     );
}
