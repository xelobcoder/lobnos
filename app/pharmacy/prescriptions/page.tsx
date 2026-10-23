'use client';

import { useCallback, useEffect, useState } from 'react';
import jsPDF from 'jspdf';
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
     const [notice,setNotice]=useState('');
     const [statusFilter, setStatusFilter] = useState<'open' | PrescriptionStatus>('open');
     const [prescriptions, setPrescriptions] = useState<PrescriptionSummary[]>([]);
     const [error, setError] = useState('');

     const [selected, setSelected] = useState<PrescriptionDetail | null>(null);
     const [dispenseQuantities, setDispenseQuantities] = useState<Record<string, number>>({});
     const [paymentMethod, setPaymentMethod] = useState('cash');
     const [submitting, setSubmitting] = useState(false);
     const [detailError, setDetailError] = useState('');

     const loadPrescriptions = useCallback(
          async (page = 1, count = DEFAULT_PAGE_SIZE) => {
               try {
                    setError('');
                    const status = statusFilter === 'open' ? 'pending,partially_fulfilled' : statusFilter;
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
          setDetailError('');
          const response = await customFetch(`prescriptions/${id}`);
          if (response?.success) {
               const detail: PrescriptionDetail = response.data;
               setSelected(detail);
               const outstanding: Record<string, number> = {};
               detail.items.forEach((item) => {
                    if (item.status === 'pending') outstanding[item.id] = 0;
               });
               setDispenseQuantities(outstanding);
          } else {
               setDetailError(response?.error?.message || 'Unable to load this prescription.');
          }
     };

     const closeDetail = () => {
          setSelected(null);
          setDispenseQuantities({});
          setDetailError('');
     };

     const dispensingTotal=selected?selected.items.reduce((cents,item)=>cents+Math.round(Math.round((item.salePrice||0)*100)*Math.round((dispenseQuantities[item.id]||0)*1000)/1000),0)/100:0;
     const fulfillSelected=async()=>{
          if(submitting||(!selected&&!payment.pending))return;
          const lines=Object.entries(dispenseQuantities).filter(([,quantity])=>quantity>0).map(([prescriptionItemId,quantityDispensed])=>({prescriptionItemId,quantityDispensed}));
          if(!payment.pending){
               if(!lines.length){setDetailError('Enter quantities for the drugs you intend to dispense.');return;}
               if(!payment.accountId||(paymentMethod!=='cash'&&!payment.reference.trim())){setDetailError('Select the collection account and enter the payment reference.');return;}
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
          if (!selected||submitting||payment.pending) return;
          if(!window.confirm('Refer all remaining medicines outside this pharmacy?'))return;
          setSubmitting(true);
          setDetailError('');
          const response = await customFetchMutation(`prescriptions/${selected.id}/refer`, 'POST', {});
          setSubmitting(false);
          if (response?.success) {
               printReferralSlip(response.data.referralSlip);
               await loadPrescriptions(1, DEFAULT_PAGE_SIZE);
               closeDetail();
          } else {
               setDetailError(response?.error?.message || 'Unable to refer the remaining items.');
          }
     };

     const printReferralSlip = (slip: { patientId: number; referredAt: string; items: Array<{ drugName: string; dosageInstructions: string | null; dose: string | null; frequency: string | null; duration: string | null; route: string | null; quantityRemaining: number }> }) => {
          const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a5' });
          let y = 15;
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(13);
          pdf.text('Pharmacy referral slip', 10, y);
          y += 8;
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(10);
          pdf.text(`Patient ID: ${slip.patientId}`, 10, y); y += 6;
          pdf.text(`Date: ${new Date(slip.referredAt).toLocaleString()}`, 10, y); y += 8;
          pdf.text('The items below were not in stock. Please present this slip at another pharmacy to purchase them:', 10, y, { maxWidth: 130 });
          y += 12;
          slip.items.forEach((item) => {
               const regimen = [item.dose, item.frequency, item.route, item.duration].filter(Boolean).join(' · ');
               pdf.text(`- ${item.drugName} x${item.quantityRemaining}`, 10, y, { maxWidth: 130 }); y += 6;
               if (regimen) { pdf.text(`  ${regimen}`, 12, y, { maxWidth: 128 }); y += 5; }
               if (item.dosageInstructions) { pdf.text(`  ${item.dosageInstructions}`, 12, y, { maxWidth: 128 }); y += 5; }
               y += 2;
          });
          pdf.autoPrint();
          const url = URL.createObjectURL(pdf.output('blob'));
          window.open(url, '_blank');
          window.setTimeout(() => URL.revokeObjectURL(url), 30000);
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
                    <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => openPrescription(row.original.id)}>
                         <RiFileList3Line size={16} className="me-1" />
                         Review
                    </button>
               ),
          },
     ];

     return (
          <div className={styles.workspace}>
               <div className="d-flex flex-wrap justify-content-between align-items-end gap-3 mb-4">
                    <div>
                         <h4 className="fw-bold mb-1">Prescriptions</h4>
                         <small className="text-muted">Drug orders raised by clinicians during consultation, awaiting pharmacy fulfillment.</small>
                    </div>
                    <select className="form-select" style={{ width: 'auto' }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)}>
                         <option value="open">Open (pending/partial)</option>
                         <option value="fulfilled">Fulfilled</option>
                         <option value="referred">Referred out</option>
                         <option value="cancelled">Cancelled</option>
                    </select>
               </div>

               {notice&&<div className="alert alert-success" role="status">{notice}</div>}
               {payment.pending&&<div className="alert alert-warning">A dispensing request needs confirmation. <button className="btn btn-warning" disabled={submitting||!!payment.pending} onClick={fulfillSelected}>Retry original dispensing</button></div>}
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
                                        <h5 className="modal-title">Fulfill prescription</h5>
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
                                                            <td>{item.quantityOrdered}<div className="small text-muted">Available: {item.availableStock||0}<br/>GHS {Number(item.salePrice||0).toFixed(2)} / unit</div></td>
                                                            <td>{item.quantityDispensed}</td>
                                                            <td><span className="badge text-bg-light border">{item.status}</span></td>
                                                            <td>
                                                                 {item.status === 'pending' ? (
                                                                      <input
                                                                           type="number"
                                                                           min={0}
                                                                           max={Math.min(item.quantityOrdered - item.quantityDispensed,item.availableStock||0)} step="0.001" disabled={submitting||!!payment.pending||!item.inventoryItemId}
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
                                        <PharmacyPaymentFields payment={payment} method={paymentMethod} disabled={submitting}/>
                                        <div className="d-flex align-items-center gap-2">
                                             <label className="small text-muted mb-0">Payment method</label>
                                             <select className="form-select form-select-sm" style={{ width: 'auto' }} value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                                                  <option value="cash">Cash</option>
                                                  <option value="mobile_money">Mobile money</option>
                                                  <option value="card">Card</option>
                                             </select>
                                        </div>
                                   </div>
                                   <div className="modal-footer">
                                        <button type="button" className="btn btn-outline-secondary d-flex align-items-center gap-1" disabled={submitting||!!payment.pending} onClick={referRemaining}>
                                             <RiSendPlaneLine size={16} />
                                             Refer remaining out &amp; print slip
                                        </button>
                                        <button type="button" className="btn btn-primary d-flex align-items-center gap-1" disabled={submitting||!!payment.pending} onClick={fulfillSelected}>
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
