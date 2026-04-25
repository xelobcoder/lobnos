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

const SkeletonRow = () => (
     <div className="rounded p-2 mb-2 border" style={{ background: '#f5f5f5' }}>
          <div style={{ height: 12, background: '#e0e0e0', borderRadius: 4, width: '60%', marginBottom: 6 }} />
          <div style={{ height: 10, background: '#e0e0e0', borderRadius: 4, width: '80%' }} />
     </div>
);

export default function CashCollection() {
     const [searchPatientId, setSearchPatientId]       = useState<string>('');
     const [statusFilter, setStatusFilter]             = useState<string>(useSearchParams()?.get('paymentstatus') || 'pending');
     const [billingRecords, setBillingRecords]         = useState<BillingRecord[]>([]);
     const [selectedBillingId, setSelectedBillingId]  = useState<number | null>(null);
     const [patientId, setPatientId]                  = useState<number | null>(null);
     const [patientInfo, setPatientInfo]               = useState<any>(null);
     const [isLoading, setIsLoading]                  = useState<boolean>(false);
     const [hasSearched, setHasSearched]              = useState<boolean>(false);
     const [paymentInputs, setPaymentInputs]          = useState<{ [key: number]: string }>({});
     const [inputErrors, setInputErrors]              = useState<{ [key: number]: boolean }>({});
     const [globalPaymentMode, setGlobalPaymentMode]  = useState<number | ''>('');
     const [paymentModes, setPaymentModes]            = useState<PaymentMode[]>([]);
     const urlPatientid = useSearchParams()?.get('patientid') || '';
     const employeeid   = useApplication()?.user?.employeeid;

     useEffect(() => { fetchPaymentModes(); }, []);
     useEffect(() => {
          if (urlPatientid) {
               const decoded = plsDecryption(urlPatientid);
               setSearchPatientId(decoded);
               doSearch(decoded);
          }
     }, [urlPatientid]);

     const fetchPaymentModes = async () => {
          try {
               const r = await customFetch('paymentmodes');
               if (r?.status === 'success') setPaymentModes(r.data || []);
          } catch { /* silent */ }
     };

     const doSearch = async (pid?: string) => {
          const id = pid || searchPatientId;
          if (!id.trim()) return;
          setIsLoading(true);
          setHasSearched(true);
          try {
               const r = await customFetch(`billing/client/bulk/outstanding?patientid=${id}&status=${statusFilter}`) as BulkOutstandingResponse;
               if (r?.success && r?.data?.records?.length > 0) {
                    setBillingRecords(r.data.records);
                    setSelectedBillingId(r.data.records[0].billingid);
                    setPatientId(parseInt(id));
                    setPaymentInputs({});
                    setInputErrors({});
                    try {
                         const info = await fetchPatientPersonalInfo(parseInt(id)) as any;
                         if (info?.result) setPatientInfo(info.result);
                    } catch { /* silent */ }
               } else {
                    setBillingRecords([]);
                    setPatientId(null);
                    setPatientInfo(null);
               }
          } catch { setBillingRecords([]); } finally { setIsLoading(false); }
     };

     const payAllOutstanding = () => {
          const inputs: { [key: number]: string } = {};
          billingRecords.forEach(r => r.serviceDetails.forEach(s => {
               const bal = parseFloat(s.totalpayable) - parseFloat(s.paidamount);
               if (s.paymentstatus !== 'paid' && bal > 0) inputs[s.serviceid] = bal.toFixed(2);
          }));
          setPaymentInputs(inputs);
          setInputErrors({});
     };

     const payBillingRecord = (billingId: number) => {
          const record = billingRecords.find(r => r.billingid === billingId);
          if (!record) return;
          const inputs = { ...paymentInputs };
          record.serviceDetails.forEach(s => {
               const bal = parseFloat(s.totalpayable) - parseFloat(s.paidamount);
               if (s.paymentstatus !== 'paid' && bal > 0) inputs[s.serviceid] = bal.toFixed(2);
          });
          setPaymentInputs(inputs);
     };

     const handleAmountChange = (serviceId: number, value: string, maxBalance: number) => {
          setPaymentInputs(prev => ({ ...prev, [serviceId]: value }));
          const num = parseFloat(value);
          setInputErrors(prev => ({ ...prev, [serviceId]: !isNaN(num) && num > maxBalance }));
     };

     const servicesReady  = Object.entries(paymentInputs).filter(([_, v]) => parseFloat(v) > 0);
     const totalReady     = servicesReady.reduce((s, [_, v]) => s + parseFloat(v), 0);
     const hasErrors      = Object.values(inputErrors).some(Boolean);
     const canSubmit      = servicesReady.length > 0 && !!globalPaymentMode && !hasErrors;

     const getStagedForBilling = (billingId: number) => {
          const record = billingRecords.find(r => r.billingid === billingId);
          if (!record) return 0;
          return record.serviceDetails.reduce((s, svc) => s + parseFloat(paymentInputs[svc.serviceid] || '0'), 0);
     };

     const handleSubmit = async () => {
          if (!canSubmit) return;
          const allPayments: any[] = [];
          billingRecords.forEach(record => record.serviceDetails.forEach(s => {
               const amount = parseFloat(paymentInputs[s.serviceid] || '0');
               if (amount > 0) allPayments.push({ service_id: s.serviceid, amount, payment_mode_id: globalPaymentMode, billing_id: record.billingid });
          }));
          setIsLoading(true);
          try {
               const r = await customPost('billing/multi-service/payment', 'POST', {
                    service_payments: allPayments, employeeid,
                    total_amount: allPayments.reduce((s, p) => s + p.amount, 0),
                    description: `Cash collection for ${allPayments.length} service(s)`
               });
               if (r?.success == true) {
                    toast.success(r.message || 'Payment recorded successfully');
                    setPaymentInputs({}); setInputErrors({}); setGlobalPaymentMode('');
                    doSearch();
               } else { toast.error(r?.message || 'Failed to record payment'); }
          } catch { toast.error('An error occurred. Please try again.'); } finally { setIsLoading(false); }
     };

     const selectedRecord = billingRecords.find(r => r.billingid === selectedBillingId);
     const panelHeight    = 'calc(100vh - 280px)';

     return (
          <div>
               {/* ── PAGE TITLE ── */}
               <div className="d-flex align-items-center justify-content-between mb-2">
                    <div>
                         <h4 className="mb-0 fw-bold">Cash Collection</h4>
                         <span className="text-muted" style={{ fontSize: '0.95rem' }}>Search a patient to view and collect outstanding payments</span>
                    </div>
                    {patientId && (
                         <Link href={`/billing/patientid/${plsEncryption(patientId.toString())}/multi`} className="btn btn-outline-secondary">
                              &larr; Back to Billing
                         </Link>
                    )}
               </div>

               <div className="card shadow-sm">

                    {/* ── TOOLBAR ── */}
                    <div className="card-header bg-white border-bottom py-2 px-3">
                         <div className="d-flex flex-wrap align-items-center justify-content-between gap-2">
                              <div>{patientInfo && <BillingPagePatientInformation data={patientInfo} loadingststate={false} />}</div>
                              <div className="d-flex gap-2 align-items-center">
                                   <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Patient ID…"
                                        style={{ width: 200, fontSize: '1rem' }}
                                        value={searchPatientId}
                                        onChange={e => setSearchPatientId(e.target.value)}
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

                    {/* ── BODY ── */}
                    <div className="card-body p-0">
                         {!hasSearched ? (
                              /* Welcome state — large prominent search */
                              <div className="d-flex flex-column align-items-center justify-content-center text-center py-5" style={{ minHeight: 380 }}>
                                   <div style={{ fontSize: '4rem', opacity: 0.25, lineHeight: 1 }}>💳</div>
                                   <h4 className="fw-bold mt-3 mb-1">Find a Patient</h4>
                                   <p className="text-muted mb-4" style={{ fontSize: '1rem' }}>Enter the patient ID below to load their outstanding billing records</p>
                                   <div className="d-flex gap-2 justify-content-center" style={{ width: '100%', maxWidth: 460 }}>
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
                                        <button
                                             className="btn btn-primary btn-lg px-4"
                                             onClick={() => doSearch()}
                                             disabled={isLoading || !searchPatientId.trim()}
                                             style={{ fontSize: '1rem', whiteSpace: 'nowrap' }}
                                        >
                                             {isLoading ? <span className="spinner-border spinner-border-sm" /> : 'Search'}
                                        </button>
                                   </div>
                                   <small className="text-muted mt-3">Press <kbd>Enter</kbd> to search quickly</small>
                              </div>
                         ) : isLoading && billingRecords.length === 0 ? (
                              /* Loading skeleton */
                              <div className="p-3" style={{ minHeight: 320 }}>
                                   {[1, 2, 3].map(i => <SkeletonRow key={i} />)}
                              </div>
                         ) : billingRecords.length === 0 ? (
                              /* No results */
                              <div className="d-flex flex-column align-items-center justify-content-center text-center py-5" style={{ minHeight: 320 }}>
                                   <div style={{ fontSize: '3.5rem', opacity: 0.2 }}>📭</div>
                                   <h6 className="text-muted mt-3 mb-1">No billing records found</h6>
                                   <p className="text-muted small mb-0">This patient has no outstanding billing records matching the selected filter</p>
                              </div>
                         ) : (
                              <div className="row g-0">

                                   {/* ── LEFT: Billing record list ── */}
                                   <div className="col-12 col-lg-4 border-end" style={{ height: panelHeight, overflowY: 'auto' }}>
                                        <div className="p-2">
                                             <div className="d-flex align-items-center justify-content-between mb-2 px-1">
                                                  <span className="text-muted fw-semibold text-uppercase" style={{ fontSize: '0.8rem', letterSpacing: '0.5px' }}>
                                                       Billing Records <span className="badge bg-primary rounded-pill ms-1">{billingRecords.length}</span>
                                                  </span>
                                                  <button className="btn btn-sm btn-success px-2" style={{ fontSize: '0.85rem' }} onClick={payAllOutstanding}>
                                                       ✓ Pay All Outstanding
                                                  </button>
                                             </div>

                                             {billingRecords.map(record => {
                                                  const outstanding = parseFloat(record.outstanding);
                                                  const staged      = getStagedForBilling(record.billingid);
                                                  const isSelected  = selectedBillingId === record.billingid;
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
                                                            <div className="d-flex justify-content-between mt-2">
                                                                 <span className="text-success fw-semibold" style={{ fontSize: "0.92rem" }}>Paid: ₵{parseFloat(record.paid).toFixed(2)}</span>
                                                                  <span className={`fw-bold ${outstanding > 0 ? 'text-danger' : 'text-muted'}`} style={{ fontSize: "0.92rem" }}>
                                                                       Bal: ₵{outstanding.toFixed(2)}
                                                                  </span>
                                                            </div>
                                                            {outstanding > 0 && (
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

                                   {/* ── RIGHT: Service detail + action ── */}
                                   <div className="col-12 col-lg-8 d-flex flex-column" style={{ height: panelHeight }}>

                                        {selectedRecord ? (
                                             <>
                                                  {/* Service table — scrollable */}
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
                                                                           <th style={{ width: 190 }}>Payment</th>
                                                                      </tr>
                                                                 </thead>
                                                                 <tbody>
                                                                      {selectedRecord.serviceDetails.map(service => {
                                                                           const paid    = parseFloat(service.paidamount);
                                                                           const payable = parseFloat(service.totalpayable);
                                                                           const balance = payable - paid;
                                                                           const isPaid  = service.paymentstatus === 'paid';
                                                                           const staged  = parseFloat(paymentInputs[service.serviceid] || '0');
                                                                           const hasError = inputErrors[service.serviceid];

                                                                           // Row background based on state
                                                                           let rowBg = 'transparent';
                                                                           if (isPaid) rowBg = '#f8fff8';
                                                                           else if (staged > 0 && !hasError) rowBg = '#fffbe6';
                                                                           else if (hasError) rowBg = '#fff0f0';

                                                                           return (
                                                                                <tr key={service.serviceid} style={{ background: rowBg }}>
                                                                                     <td>
                                                                                          <div className="fw-medium">{service.service_name}</div>
                                                                                          {isPaid && <span className="badge bg-success-subtle text-success border border-success-subtle" style={{ fontSize: '0.65rem' }}>PAID</span>}
                                                                                          {!isPaid && staged > 0 && !hasError && <span className="badge bg-warning-subtle text-warning border border-warning-subtle" style={{ fontSize: '0.65rem' }}>STAGED</span>}
                                                                                     </td>
                                                                                     <td className="text-end">₵{payable.toFixed(2)}</td>
                                                                                     <td className="text-end text-success fw-medium">₵{paid.toFixed(2)}</td>
                                                                                     <td className={`text-end fw-bold ${balance > 0 ? 'text-danger' : 'text-muted'}`}>
                                                                                          ₵{balance.toFixed(2)}
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
                                                                                                              value={paymentInputs[service.serviceid] || ''}
                                                                                                              onChange={e => handleAmountChange(service.serviceid, e.target.value, balance)}
                                                                                                         />
                                                                                                         <button
                                                                                                              className="btn btn-outline-primary"
                                                                                                              style={{ fontSize: '0.85rem', whiteSpace: 'nowrap' }}
                                                                                                              onClick={() => handleAmountChange(service.serviceid, balance.toFixed(2), balance)}
                                                                                                         >
                                                                                                              Pay Full
                                                                                                         </button>
                                                                                                    </div>
                                                                                                    {hasError && (
                                                                                                         <div className="text-danger mt-1" style={{ fontSize: '0.85rem' }}>
                                                                                                              ⚠ Exceeds balance of ₵{balance.toFixed(2)}
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

                                                  {/* ── STICKY ACTION FOOTER ── */}
                                                  {servicesReady.length > 0 && (
                                                       <div className="border-top bg-light p-3" style={{ flexShrink: 0 }}>
                                                            <div className="d-flex flex-wrap align-items-center gap-2">
                                                                 {/* Summary */}
                                                                 <div className="me-auto">
                                                                      <div className="fw-bold text-success lh-1" style={{ fontSize: "1.6rem" }}>
                                                                      ₵{totalReady.toFixed(2)}
                                                                      
                                                                 </div>
                                                                      <small className="text-muted">{servicesReady.length} service(s) ready</small>
                                                                 </div>

                                                                 {/* Payment mode */}
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

                                                                 <button className="btn btn-sm btn-outline-secondary" onClick={() => { setPaymentInputs({}); setInputErrors({}); }}>
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
