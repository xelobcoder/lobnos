"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { customFetch, customPost, fetchPatientPersonalInfo } from '../../../components/Auth/customFetch';
import { toast } from 'react-toastify';
import BillingPagePatientInformation from '../../../components/Billing/BillingContextComponents/PersonalInfoView';
import { useSearchParams } from 'next/navigation';
import { plsDecryption, plsEncryption } from '../../../lib/encryption';
import { useApplication } from '../../../components/Auth/useApplicationContext';

interface ServiceDetail {
     totalpayable: string; totalcost: string; serviceid: number; service_name: string;
     paymentstatus: string; paidamount: string; outstanding: string; discount: string;
     amountIncurredDueTax: string; isRefunded: boolean; amountRefunded: number;
}
interface BillingRecord {
     billingid: number; patientid: number; totalTransactionCost: string; totalcost: string;
     paid: string; payable: string; totalrefunded: string; discount: string; outstanding: string;
     balance: string; billedon: string; clientstatus: string; year: number; month: number;
     day: number; amountIncurredDueTax: string; lastupdated: string; branchid: number;
     isPromo: number; promoValue: string; promoMethod: string; promoCodeId: number; status: string;
     relatedBillingId: number | null; isAdjustment: number; adjustedBy: number | null;
     adjustmentReason: string | null; adjustmentType: string | null; islocked: number;
     adjustmentdate: string | null; adjustmentamount: string | null; additionalinformation: string | null;
     writeoff: string; serviceDetails: ServiceDetail[];
}
interface BulkOutstandingResponse { success: boolean; data: { outstandingAmount: string; records: BillingRecord[] }; }
interface PaymentMode { KeyID: number; PaymentMode: string; }
interface StagedService { payment: string; waiveOff: string; error: boolean; }

const SkeletonRow = () => (
     <div className="rounded p-2 mb-2 border" style={{ background: '#f5f5f5' }}>
          <div style={{ height: 12, background: '#e0e0e0', borderRadius: 4, width: '60%', marginBottom: 6 }} />
          <div style={{ height: 10, background: '#e0e0e0', borderRadius: 4, width: '80%' }} />
     </div>
);

export default function CashCollection() {
     const [searchPatientId, setSearchPatientId]       = useState<string>('');
     const [searchBillingId, setSearchBillingId]       = useState<string>('');
     const [statusFilter, setStatusFilter]             = useState<string>(useSearchParams()?.get('paymentstatus') || 'pending');
     const [billingRecords, setBillingRecords]         = useState<BillingRecord[]>([]);
     const [selectedBillingId, setSelectedBillingId]  = useState<number | string | null>(null);
     const [patientId, setPatientId]                  = useState<number | string | null>(null);
     const [patientInfo, setPatientInfo]               = useState<any>(null);
     const [isLoading, setIsLoading]                  = useState<boolean>(false);
     const [hasSearched, setHasSearched]              = useState<boolean>(false);
     
     const [stagedData, setStagedData]                = useState<{ [serviceId: number]: StagedService }>({});
     const [globalWaiveOff, setGlobalWaiveOff]        = useState<string>('');
     const [globalPaymentMode, setGlobalPaymentMode]  = useState<number | ''>('');
     const [paymentModes, setPaymentModes]            = useState<PaymentMode[]>([]);
     const urlPatientid = useSearchParams()?.get('patientid') || '';
     const urlBillingid = useSearchParams()?.get('billingid') || '';
     const employeeid   = useApplication()?.user?.employeeid;

     useEffect(() => { fetchPaymentModes(); }, []);
     useEffect(() => {
          if (urlPatientid || urlBillingid) {
               const decodedPid = urlPatientid ? plsDecryption(urlPatientid) : '';
               if (decodedPid) setSearchPatientId(decodedPid);
               if (urlBillingid) setSearchBillingId(urlBillingid);
               
               doSearch(decodedPid, urlBillingid);
          }
     }, [urlPatientid, urlBillingid]);

     const fetchPaymentModes = async () => {
          try {
               const r = await customFetch('paymentmodes');
               if (r?.status === 'success') setPaymentModes(r.data || []);
          } catch { }
     };

     const doSearch = async (pid?: string, bid?: string) => {
          const pId = pid !== undefined ? pid : searchPatientId;
          const bId = bid !== undefined ? bid : searchBillingId;
          
          if (!pId.trim() && !bId.trim()) return;
          
          setIsLoading(true);
          setHasSearched(true);

          if (pId.trim() && !isNaN(parseInt(pId))) {
               try {
                    const info = await fetchPatientPersonalInfo(parseInt(pId)) as any;
                    if (info?.result) {
                         setPatientInfo(info.result);
                         setPatientId(parseInt(pId));
                    }
               } catch (e) {
                    console.error("Initial patient info fetch failed", e);
               }
          }

          try {
               let url = `billing/client/bulk/outstanding?status=${statusFilter}`;
               if (pId.trim()) url += `&patientid=${pId}`;
               if (bId.trim()) url += `&billingid=${bId}`;
               
               const r = await customFetch(url) as BulkOutstandingResponse;
               
               if (r?.success && r?.data?.records?.length > 0) {
                    setBillingRecords(r.data.records);
                    
                    const recordIds = r.data.records.map(rec => rec.billingid);
                    if (bId.trim()) {
                         const firstBid = bId.split(',')[0].trim();
                         if (recordIds.includes(parseInt(firstBid))) {
                              setSelectedBillingId(parseInt(firstBid));
                         } else {
                              setSelectedBillingId(r.data.records[0].billingid);
                         }
                    } else {
                         setSelectedBillingId(r.data.records[0].billingid);
                    }

                    const actualPatientId = r.data.records[0].patientid;
                    
                    if (actualPatientId !== patientId) {
                         setPatientId(actualPatientId);
                         try {
                              const info = await fetchPatientPersonalInfo(actualPatientId) as any;
                              if (info?.result) setPatientInfo(info.result);
                         } catch { }
                    }
                    
                    setStagedData({});
                    setGlobalWaiveOff('');
               } else {
                    setBillingRecords([]);
                    if (pId.trim()) setPatientId(pId);
                    if (bId.trim()) setSelectedBillingId(bId);

                    if (!pId.trim() && !bId.trim()) {
                         setPatientId(null);
                         setPatientInfo(null);
                    }
                    setStagedData({});
                    setGlobalWaiveOff('');
               }
          } catch { 
               setBillingRecords([]); 
               if (pId.trim()) setPatientId(pId);
               if (bId.trim()) setSelectedBillingId(bId);
               setStagedData({});
               setGlobalWaiveOff('');
          } finally { 
               setIsLoading(false); 
          }
     };

     const payAllOutstanding = () => {
          const newData: { [key: number]: StagedService } = {};
          billingRecords.forEach(r => r.serviceDetails.forEach(s => {
               const bal = parseFloat(s.totalpayable) - parseFloat(s.paidamount);
               if (s.paymentstatus !== 'paid' && bal > 0) {
                    newData[s.serviceid] = { payment: bal.toFixed(2), waiveOff: '', error: false };
               }
          }));
          setStagedData(newData);
          setGlobalWaiveOff('');
     };

     const payBillingRecord = (billingId: number) => {
          const record = billingRecords.find(r => r.billingid === billingId);
          if (!record) return;
          
          const newData: { [key: number]: StagedService } = {};
          record.serviceDetails.forEach(s => {
               const bal = parseFloat(s.totalpayable) - parseFloat(s.paidamount);
               if (s.paymentstatus !== 'paid' && bal > 0) {
                    newData[s.serviceid] = { payment: bal.toFixed(2), waiveOff: '', error: false };
               }
          });
          setStagedData(newData);
          setGlobalWaiveOff('');
          setSelectedBillingId(billingId);
     };

     const applyGlobalWaiveOff = (value: string) => {
          setGlobalWaiveOff(value);
          const totalWaive = parseFloat(value);
          
          if (isNaN(totalWaive) || totalWaive <= 0) {
               setStagedData(prev => {
                    const updated = { ...prev };
                    Object.keys(updated).forEach(id => {
                         const svcId = parseInt(id);
                         updated[svcId] = { ...updated[svcId], waiveOff: '' };
                    });
                    return updated;
               });
               return;
          }

          const outstandingServices = billingRecords.flatMap(r => 
               r.serviceDetails.filter(s => s.paymentstatus !== 'paid' && (parseFloat(s.totalpayable) - parseFloat(s.paidamount)) > 0)
          );
          
          const totalOutstanding = outstandingServices.reduce((sum, s) => sum + (parseFloat(s.totalpayable) - parseFloat(s.paidamount)), 0);
          if (totalOutstanding === 0) return;

          setStagedData(prev => {
               const newData = { ...prev };
               outstandingServices.forEach(s => {
                    const bal = parseFloat(s.totalpayable) - parseFloat(s.paidamount);
                    const proportion = bal / totalOutstanding;
                    const serviceWaive = Math.min(bal, totalWaive * proportion);
                    
                    newData[s.serviceid] = {
                         payment: (bal - serviceWaive).toFixed(2),
                         waiveOff: serviceWaive.toFixed(2),
                         error: false
                    };
               });
               return newData;
          });
     };

     const handleValueChange = (serviceId: number, type: 'payment' | 'waiveOff', value: string, balance: number) => {
          setStagedData(prev => {
               const current = prev[serviceId] || { payment: '', waiveOff: '', error: false };
               let updated = { ...current, [type]: value };
               
               let p = parseFloat(updated.payment || '0');
               let w = parseFloat(updated.waiveOff || '0');
               
               const safeP = isNaN(p) ? 0 : p;
               const safeW = isNaN(w) ? 0 : w;

               if (type !== 'payment' && (safeP + safeW) > balance + 0.01) {
                    const remaining = Math.max(0, balance - safeW);
                    updated.payment = remaining > 0 ? remaining.toFixed(2) : '';
                    p = remaining;
               }
               
               const finalTotal = (isNaN(p) ? 0 : p) + safeW;
               updated.error = finalTotal > (balance + 0.05);
               
               return { ...prev, [serviceId]: updated };
          });
     };

     const getNetOutstandingForBilling = (billingId: number) => {
          const record = billingRecords.find(r => r.billingid === billingId);
          if (!record) return 0;
          const originalBal = parseFloat(record.outstanding);
          const adjustments = record.serviceDetails.reduce((s, svc) => {
               const stagedSvc = stagedData[svc.serviceid];
               if (!stagedSvc) return s;
               const w = parseFloat(stagedSvc.waiveOff || '0');
               return s + (isNaN(w) ? 0 : w);
          }, 0);
          return Math.max(0, originalBal - adjustments);
     };

     const stagedEntries = Object.entries(stagedData).filter(([_, v]) => {
          const p = parseFloat(v.payment || '0');
          const w = parseFloat(v.waiveOff || '0');
          return (p > 0 || w > 0);
     });
     
     const totalReady     = stagedEntries.reduce((s, [_, v]) => {
          const val = parseFloat(v.payment);
          return s + (isNaN(val) ? 0 : val);
     }, 0);
     const totalWaiveOff  = stagedEntries.reduce((s, [_, v]) => {
          const val = parseFloat(v.waiveOff);
          return s + (isNaN(val) ? 0 : val);
     }, 0);
     
     const hasErrors      = stagedEntries.some(([_, v]) => v.error);
     const canSubmit      = stagedEntries.length > 0 && !!globalPaymentMode && !hasErrors;

     const getStagedForBilling = (billingId: number) => {
          const record = billingRecords.find(r => r.billingid === billingId);
          if (!record) return 0;
          return record.serviceDetails.reduce((s, svc) => s + parseFloat(stagedData[svc.serviceid]?.payment || '0'), 0);
     };

     const handleSubmit = async () => {
          if (!canSubmit) return;
          const allPayments: any[] = [];
          
          stagedEntries.forEach(([svcId, data]) => {
               const serviceId = parseInt(svcId);
               const record = billingRecords.find(r => r.serviceDetails.some(s => s.serviceid === serviceId));
               if (record) {
                    allPayments.push({
                         service_id: serviceId,
                         amount: parseFloat(data.payment || '0'),
                         waive_off: parseFloat(data.waiveOff || '0'),
                         payment_mode_id: globalPaymentMode,
                         billing_id: record.billingid
                    });
               }
          });

          setIsLoading(true);
          try {
               const r = await customPost('billing/multi-service/payment', 'POST', {
                    service_payments: allPayments, employeeid,
                    total_amount: totalReady,
                    total_waive_off: totalWaiveOff,
                    description: `Cash collection for ${stagedEntries.length} service(s). Waive-off: ${totalWaiveOff.toFixed(2)}`
               });
               if (r?.success == true) {
                    toast.success(r.message || 'Payment recorded successfully');
                    setStagedData({}); setGlobalPaymentMode('');
                    doSearch();
               } else { toast.error(r?.message || 'Failed to record payment'); }
          } catch { toast.error('An error occurred. Please try again.'); } finally { setIsLoading(false); }
     };

     const selectedRecord = billingRecords.find(r => r.billingid === selectedBillingId);
     const panelHeight    = 'calc(100vh - 280px)';

     return (
          <div>
               <div className="d-flex align-items-center justify-content-between mb-3">
                    <div className="d-flex align-items-center gap-4">
                         <div>
                              <h4 className="mb-0 fw-bold">Cash Collection</h4>
                              <p className="text-muted mb-0 small">Process outstanding payments</p>
                         </div>

                         {(patientId || selectedBillingId) && (
                              <div className="d-flex align-items-center gap-3 ps-4 border-start" style={{ borderColor: 'var(--bs-border-color)' }}>
                                   {patientId && (
                                        <div className="d-flex flex-column align-items-center p-2 rounded bg-primary-subtle border border-primary-subtle shadow-sm" style={{ minWidth: '120px' }}>
                                             <span className="text-primary text-uppercase fw-bold mb-1" style={{ fontSize: '0.7rem', letterSpacing: '1px' }}>Patient ID</span>
                                             <span className="text-primary fw-bolder h4 mb-0" style={{ letterSpacing: '0.5px' }}>#{patientId}</span>
                                        </div>
                                   )}
                                   {selectedBillingId && (
                                        <div className="d-flex flex-column align-items-center p-2 rounded bg-danger-subtle border border-danger-subtle shadow-sm" style={{ minWidth: '120px' }}>
                                             <span className="text-danger text-uppercase fw-bold mb-1" style={{ fontSize: '0.7rem', letterSpacing: '1px' }}>Billing ID</span>
                                             <span className="text-danger fw-bolder h4 mb-0" style={{ letterSpacing: '0.5px' }}>#{selectedBillingId}</span>
                                        </div>
                                   )}
                              </div>
                         )}
                    </div>
                    {patientId && (
                         <Link href={`/billing/patientid/${plsEncryption(patientId.toString())}/multi`} className="btn btn-outline-secondary d-flex align-items-center gap-2">
                              <span>&larr;</span> Back to Billing
                         </Link>
                    )}
               </div>

               <div className="card shadow-sm">

                    <div className="card-header bg-white border-bottom py-2 px-3">
                         <div className="d-flex flex-wrap align-items-center justify-content-between gap-2">
                              <div>{patientInfo && <BillingPagePatientInformation data={patientInfo} loadingststate={false} />}</div>
                              <div className="d-flex gap-2 align-items-center">
                                   <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Patient ID…"
                                        style={{ width: 150, fontSize: '0.9rem' }}
                                        value={searchPatientId}
                                        onChange={e => setSearchPatientId(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && doSearch()}
                                   />
                                   <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Billing ID…"
                                        style={{ width: 150, fontSize: '0.9rem' }}
                                        value={searchBillingId}
                                        onChange={e => setSearchBillingId(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && doSearch()}
                                   />
                                   <select className="form-select" style={{ width: 130, fontSize: '1rem' }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                                        <option value="all">All</option>
                                        <option value="pending">Pending</option>
                                        <option value="completed">Completed</option>
                                   </select>
                                   <button className="btn btn-primary px-4" style={{ fontSize: '1rem' }} onClick={() => doSearch()} disabled={isLoading}>
                                        {isLoading ? <><span className="spinner-border spinner-border-sm me-1" />Searching…</> : 'Search'}
                                   </button>
                              </div>
                         </div>
                    </div>

                    <div className="card-body p-0">
                         {!hasSearched ? (
                         <div className="d-flex flex-column align-items-center justify-content-center text-center py-5" style={{ minHeight: 380 }}>
                              <div style={{ fontSize: '4rem', opacity: 0.25, lineHeight: 1 }}>💳</div>
                              <h4 className="fw-bold mt-3 mb-1">Find a Patient or Transaction</h4>
                              <p className="text-muted mb-4" style={{ fontSize: '1rem' }}>Enter the patient ID or billing ID below to load outstanding records</p>
                              <div className="d-flex flex-column gap-3 justify-content-center" style={{ width: '100%', maxWidth: 460 }}>
                                   <div className="d-flex gap-2">
                                        <input
                                             type="text"
                                             className="form-control form-control-lg shadow-sm"
                                             placeholder="Enter Patient ID…"
                                             autoFocus
                                             value={searchPatientId}
                                             onChange={e => setSearchPatientId(e.target.value)}
                                             onKeyDown={e => e.key === 'Enter' && doSearch()}
                                             style={{ fontSize: '1.2rem', letterSpacing: '0.5px' }}
                                        />
                                        <input
                                             type="text"
                                             className="form-control form-control-lg shadow-sm"
                                             placeholder="Billing ID…"
                                             value={searchBillingId}
                                             onChange={e => setSearchBillingId(e.target.value)}
                                             onKeyDown={e => e.key === 'Enter' && doSearch()}
                                             style={{ fontSize: '1.2rem', letterSpacing: '0.5px' }}
                                        />
                                   </div>
                                   <button
                                        className="btn btn-primary btn-lg px-4 w-100 shadow"
                                        onClick={() => doSearch()}
                                        disabled={isLoading || (!searchPatientId.trim() && !searchBillingId.trim())}
                                        style={{ fontSize: '1.1rem', fontWeight: 'bold' }}
                                   >
                                        {isLoading ? <><span className="spinner-border spinner-border-sm me-2" />Searching…</> : 'Search & Load Records'}
                                   </button>
                              </div>
                              <small className="text-muted mt-3">Press <kbd>Enter</kbd> to search quickly</small>
                         </div>
                         ) : isLoading && billingRecords.length === 0 ? (
                              <div className="p-3" style={{ minHeight: 320 }}>
                                   {[1, 2, 3].map(i => <SkeletonRow key={i} />)}
                              </div>
                         ) : billingRecords.length === 0 ? (
                              <div className="d-flex flex-column align-items-center justify-content-center text-center py-5" style={{ minHeight: 320 }}>
                                   <div style={{ fontSize: '3.5rem', opacity: 0.2 }}>📭</div>
                                   <h6 className="text-muted mt-3 mb-1">No billing records found</h6>
                                   <p className="text-muted small mb-0">This patient has no outstanding billing records matching the selected filter</p>
                              </div>
                         ) : (
                              <div className="row g-0">

                                   <div className="col-12 col-lg-4 border-end" style={{ height: panelHeight, overflowY: 'auto' }}>
                                        <div className="p-2">
                                             <div className="d-flex align-items-center justify-content-between mb-2 px-1">
                                                  <span className="text-muted fw-semibold text-uppercase" style={{ fontSize: '0.8rem', letterSpacing: '0.5px' }}>
                                                       Billing Records <span className="badge bg-primary rounded-pill ms-1">{billingRecords.length}</span>
                                                  </span>
                                                  <div className="d-flex gap-2">
                                                       <div className="input-group input-group-sm" style={{ width: 160 }}>
                                                            <span className="input-group-text bg-warning-subtle border-warning-subtle" style={{ fontSize: '0.75rem' }}>Waive.</span>
                                                            <input 
                                                                 type="number" 
                                                                 className="form-control border-warning-subtle" 
                                                                 placeholder="Global..." 
                                                                 value={globalWaiveOff}
                                                                 onChange={e => applyGlobalWaiveOff(e.target.value)}
                                                                 style={{ fontSize: '0.85rem' }}
                                                            />
                                                       </div>
                                                       <button className="btn btn-sm btn-success px-2" style={{ fontSize: '0.85rem' }} onClick={payAllOutstanding}>
                                                            ✓ Pay All
                                                       </button>
                                                  </div>
                                             </div>

                                             {billingRecords.map(record => {
                                                  const outstanding = parseFloat(record.outstanding);
                                                  const netOutstanding = getNetOutstandingForBilling(record.billingid);
                                                  const staged      = getStagedForBilling(record.billingid);
                                                  const isSelected  = selectedBillingId === record.billingid;
                                                  const hasAdjustment = netOutstanding !== outstanding;
                                                  
                                                  return (
                                                       <div
                                                            key={record.billingid}
                                                            onClick={() => setSelectedBillingId(record.billingid)}
                                                            className={`rounded mb-2 border-2 ${isSelected ? 'border-primary' : 'border'}`}
                                                            style={{
                                                                 cursor: 'pointer',
                                                                 borderLeft: isSelected ? '4px solid #0d6efd' : '4px solid transparent',
                                                                 background: isSelected ? '#f0f6ff' : '#fff',
                                                                 transition: 'all 0.15s ease',
                                                                 padding: '10px 12px'
                                                            }}
                                                       >
                                                            <div className="d-flex align-items-center justify-content-between">
                                                                 <span className="fw-bold" style={{ fontSize: "1rem" }}>#{record.billingid}</span>
                                                                 <div className="d-flex align-items-center gap-1">
                                                                      {staged > 0 && (
                                                                           <span className="badge bg-success" style={{ fontSize: '0.82rem' }}>
                                                                                ₵{staged.toFixed(2)} staged
                                                                           </span>
                                                                      )}
                                                                      {record.isAdjustment === 1 && (
                                                                           <span className="badge bg-warning text-dark" style={{ fontSize: '0.78rem' }}>ADJ</span>
                                                                      )}
                                                                 </div>
                                                            </div>
                                                            <span className="text-muted d-block mt-1" style={{ fontSize: "0.88rem" }}>
                                                                 {new Date(record.billedon).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                            </span>
                                                            <div className="mt-2">
                                                                 <div className="d-flex justify-content-between">
                                                                      <span className="text-success fw-semibold" style={{ fontSize: "0.85rem" }}>Paid: ₵{parseFloat(record.paid).toFixed(2)}</span>
                                                                      <span className={`fw-bold ${outstanding > 0 ? 'text-danger' : 'text-muted'}`} style={{ fontSize: "0.85rem", textDecoration: hasAdjustment ? 'line-through' : 'none', opacity: hasAdjustment ? 0.6 : 1 }}>
                                                                           Bal: ₵{outstanding.toFixed(2)}
                                                                      </span>
                                                                 </div>
                                                                 {hasAdjustment && (
                                                                      <div className="text-end">
                                                                           <span className="badge bg-primary-subtle text-primary border border-primary-subtle" style={{ fontSize: '0.85rem' }}>
                                                                                Net Bal: ₵{netOutstanding.toFixed(2)}
                                                                           </span>
                                                                      </div>
                                                                 )}
                                                            </div>
                                                            {netOutstanding > 0 && (
                                                                 <button
                                                                       className="btn btn-outline-success w-100 mt-2"
                                                                       style={{ fontSize: '0.92rem' }}
                                                                      onClick={e => { e.stopPropagation(); payBillingRecord(record.billingid); }}
                                                                 >
                                                                      Pay This Bill
                                                                 </button>
                                                            )}
                                                       </div>
                                                  );
                                             })}
                                        </div>
                                   </div>

                                   <div className="col-12 col-lg-8 d-flex flex-column" style={{ height: panelHeight }}>

                                        {selectedRecord ? (
                                             <>
                                                  <div style={{ flex: 1, overflowY: 'auto' }}>
                                                       <div className="p-3">
                                                            <div className="d-flex align-items-center justify-content-between mb-2 pb-2 border-bottom">
                                                                 <div>
                                                                      <h5 className="mb-0 fw-bold">Services</h5>
                                                                      <span className="text-muted" style={{ fontSize: "0.9rem" }}>Billing #{selectedRecord.billingid}</span>
                                                                 </div>
                                                                 <span className="badge bg-secondary" style={{ fontSize: "0.85rem" }}>{selectedRecord.serviceDetails.length} service(s)</span>
                                                            </div>

                                                            {selectedRecord.adjustmentReason && (
                                                                 <div className="alert alert-warning py-2 px-3 mb-2" style={{ fontSize: "0.95rem" }}>
                                                                      ⚠ Adjustment: {selectedRecord.adjustmentReason}
                                                                 </div>
                                                            )}

                                                            <table className="table align-middle mb-0" style={{ fontSize: '0.97rem' }}>
                                                                 <thead className="table-light sticky-top" style={{ top: 0, zIndex: 10 }}>
                                                                      <tr>
                                                                           <th>Service</th>
                                                                           <th className="text-end">Payable</th>
                                                                           <th className="text-end">Paid</th>
                                                                           <th className="text-end">Balance</th>
                                                                           <th style={{ width: 120 }}>Waive-off</th>
                                                                           <th style={{ width: 190 }}>Payment</th>
                                                                      </tr>
                                                                 </thead>
                                                                 <tbody>
                                                                      {selectedRecord.serviceDetails.map(service => {
                                                                           const paid    = parseFloat(service.paidamount);
                                                                           const payable = parseFloat(service.totalpayable);
                                                                           const balance = payable - paid;
                                                                           const isPaid  = service.paymentstatus === 'paid';
                                                                           const stagedSvc = stagedData[service.serviceid] || { payment: '', waiveOff: '', error: false };
                                                                           const staged  = parseFloat(stagedSvc.payment || '0');
                                                                           const waive   = parseFloat(stagedSvc.waiveOff || '0');
                                                                           const netBalance = balance - (isNaN(waive) ? 0 : waive);
                                                                           const hasError = stagedSvc.error;

                                                                           let rowBg = 'transparent';
                                                                           if (isPaid) rowBg = '#f8fff8';
                                                                           else if ((staged > 0 || waive > 0) && !hasError) rowBg = '#fffbe6';
                                                                           else if (hasError) rowBg = '#fff0f0';

                                                                           return (
                                                                                <tr key={service.serviceid} style={{ background: rowBg }}>
                                                                                     <td>
                                                                                          <div className="fw-medium">{service.service_name}</div>
                                                                                          {isPaid && <span className="badge bg-success-subtle text-success border border-success-subtle" style={{ fontSize: '0.65rem' }}>PAID</span>}
                                                                                          {!isPaid && (staged > 0 || waive > 0) && !hasError && <span className="badge bg-warning-subtle text-warning border border-warning-subtle" style={{ fontSize: '0.65rem' }}>STAGED</span>}
                                                                                     </td>
                                                                                     <td className="text-end">₵{payable.toFixed(2)}</td>
                                                                                     <td className="text-end text-success fw-medium">₵{paid.toFixed(2)}</td>
                                                                                     <td className="text-end">
                                                                                          <div className={`fw-bold ${balance > 0 ? 'text-danger' : 'text-muted'}`} style={{ fontSize: '0.9rem', textDecoration: (waive > 0) ? 'line-through' : 'none', opacity: (waive > 0) ? 0.6 : 1 }}>₵{balance.toFixed(2)}</div>
                                                                                          {!isPaid && (waive > 0) && (
                                                                                               <div className="text-primary fw-bold" style={{ fontSize: '0.9rem' }}>
                                                                                                    Net: {netBalance.toFixed(2)}
                                                                                               </div>
                                                                                          )}
                                                                                     </td>
                                                                                     <td>
                                                                                          {!isPaid && balance > 0 ? (
                                                                                               <input
                                                                                                    type="number"
                                                                                                    className="form-control form-control-sm"
                                                                                                    style={{ width: 100 }}
                                                                                                    placeholder="0.00"
                                                                                                    min={0}
                                                                                                    max={balance}
                                                                                                    step="0.01"
                                                                                                    value={stagedSvc.waiveOff}
                                                                                                    onChange={e => handleValueChange(service.serviceid, 'waiveOff', e.target.value, balance)}
                                                                                               />
                                                                                          ) : <small className="text-muted">—</small>}
                                                                                     </td>
                                                                                     <td>
                                                                                          {!isPaid && balance > 0 ? (
                                                                                               <div>
                                                                                                    <div className="d-flex align-items-center gap-2">
                                                                                                         <input
                                                                                                              type="number"
                                                                                                              className={`form-control ${hasError ? 'border-danger' : staged > 0 ? 'border-warning' : ''}`}
                                                                                                              style={{ width: 110, fontSize: '0.95rem' }}
                                                                                                              placeholder="0.00"
                                                                                                              min={0}
                                                                                                              max={balance}
                                                                                                              step="0.01"
                                                                                                              value={stagedSvc.payment}
                                                                                                              onChange={e => handleValueChange(service.serviceid, 'payment', e.target.value, balance)}
                                                                                                         />
                                                                                                         <button
                                                                                                              className="btn btn-outline-primary"
                                                                                                              style={{ fontSize: '0.85rem', whiteSpace: 'nowrap' }}
                                                                                                              onClick={() => {
                                                                                                                   setStagedData(prev => ({
                                                                                                                        ...prev,
                                                                                                                        [service.serviceid]: {
                                                                                                                             payment: balance.toFixed(2),
                                                                                                                             waiveOff: '',
                                                                                                                             error: false
                                                                                                                        }
                                                                                                                   }));
                                                                                                              }}
                                                                                                         >
                                                                                                              Pay Full
                                                                                                         </button>
                                                                                                    </div>
                                                                                                    {hasError && (
                                                                                                         <div className="text-danger mt-1" style={{ fontSize: '0.85rem' }}>
                                                                                                              ⚠ Total exceeds balance of ₵{balance.toFixed(2)}
                                                                                                         </div>
                                                                                                    )}
                                                                                               </div>
                                                                                          ) : isPaid && service.amountRefunded > 0 ? (
                                                                                               <small className="text-muted">Refunded ₵{service.amountRefunded.toFixed(2)}</small>
                                                                                          ) : (
                                                                                               <small className="text-muted">—</small>
                                                                                          )}
                                                                                     </td>
                                                                                </tr>
                                                                           );
                                                                      })}
                                                                 </tbody>
                                                            </table>
                                                       </div>
                                                  </div>

                                                  {stagedEntries.length > 0 && (
                                                       <div className="border-top bg-light p-3" style={{ flexShrink: 0 }}>
                                                            <div className="d-flex flex-wrap align-items-center gap-2">
                                                                 <div className="me-auto">
                                                                      <div className="fw-bold text-success lh-1" style={{ fontSize: "1.6rem" }}>
                                                                           {totalReady.toFixed(2)}
                                                                      </div>
                                                                      <div className="d-flex gap-2 mt-1">
                                                                           {totalWaiveOff > 0 && <span className="badge bg-warning text-dark" style={{ fontSize: '0.75rem' }}>Waive-off: ₵{totalWaiveOff.toFixed(2)}</span>}
                                                                      </div>
                                                                      <small className="text-muted">{stagedEntries.length} service(s) ready</small>
                                                                 </div>

                                                                 <div>
                                                                      <select
                                                                           className={`form-select ${!globalPaymentMode ? 'border-warning' : 'border-success'}`}
                                                                           style={{ width: 195, fontSize: '0.95rem' }}
                                                                           value={globalPaymentMode}
                                                                           onChange={e => setGlobalPaymentMode(e.target.value ? parseInt(e.target.value) : '')}
                                                                      >
                                                                           <option value="">⚠ Select method…</option>
                                                                           {paymentModes.map(m => (
                                                                                <option key={m.KeyID} value={m.KeyID}>{m.PaymentMode}</option>
                                                                           ))}
                                                                      </select>
                                                                      {!globalPaymentMode && (
                                                                           <small className="text-warning fw-medium d-block mt-1" style={{ fontSize: '0.72rem' }}>
                                                                                ← Required to proceed
                                                                           </small>
                                                                      )}
                                                                 </div>

                                                                 <button className="btn btn-sm btn-outline-secondary" onClick={() => { setStagedData({}); setGlobalWaiveOff(''); }}>
                                                                      Clear
                                                                 </button>
                                                                 <button
                                                                      className="btn btn-success px-4"
                                                                      onClick={handleSubmit}
                                                                      disabled={!canSubmit || isLoading}
                                                                      title={!globalPaymentMode ? 'Select a payment method first' : hasErrors ? 'Fix amount errors first' : ''}
                                                                 >
                                                                      {isLoading
                                                                           ? <><span className="spinner-border spinner-border-sm me-1" />Processing…</>
                                                                           : '✓ Collect Payment'}
                                                                 </button>
                                                            </div>
                                                       </div>
                                                       
                                                  )}
                                       </>   
                                        ) : (
                                             <div className="d-flex flex-column align-items-center justify-content-center h-100 text-center p-5">
                                                  <div style={{ fontSize: '3rem', opacity: 0.2 }}>📋</div>
                                                  <p className="text-muted small mt-2 mb-0">Select a billing record from the left to view its services</p>
                                             </div>
                                        )}
                                   </div>
                              </div>
                         )}
                    </div>
               </div>
          </div>

     );
}
