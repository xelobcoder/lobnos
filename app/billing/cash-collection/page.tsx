"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { customFetch, customPost, fetchPatientPersonalInfo } from '../../../components/Auth/customFetch';
import { toast } from 'react-toastify';
import { Form, Accordion } from 'react-bootstrap';
import { RiDeleteBinLine, RiAddLine, RiSubtractLine } from '@remixicon/react';
import BillingPagePatientInformation from '../../../components/Billing/BillingContextComponents/PersonalInfoView';
import { useSearchParams } from 'next/navigation';
import { plsDecryption, plsEncryption } from '../../../lib/encryption';

interface ServiceDetail {
     totalpayable: string;
     totalcost: string;
     serviceid: number;
     service_name: string;
     paymentstatus: string;
     paidamount: string;
     outstanding: string;
     discount: string;
     amountIncurredDueTax: string;
     isRefunded: boolean;
     amountRefunded: number;
}

interface BillingRecord {
     billingid: number;
     patientid: number;
     totalTransactionCost: string;
     totalcost: string;
     paid: string;
     payable: string;
     totalrefunded: string;
     discount: string;
     outstanding: string;
     balance: string;
     billedon: string;
     clientstatus: string;
     year: number;
     month: number;
     day: number;
     amountIncurredDueTax: string;
     lastupdated: string;
     branchid: number;
     isPromo: number;
     promoValue: string;
     promoMethod: string;
     promoCodeId: number;
     status: string;
     relatedBillingId: number | null;
     isAdjustment: number;
     adjustedBy: number | null;
     adjustmentReason: string | null;
     adjustmentType: string | null;
     islocked: number;
     adjustmentdate: string | null;
     adjustmentamount: string | null;
     additionalinformation: string | null;
     writeoff: string;
     serviceDetails: ServiceDetail[];
}

interface BulkOutstandingResponse {
     success: boolean;
     data: {
          outstandingAmount: string;
          records: BillingRecord[];
     };
}

interface PaymentMode {
     KeyID: number;
     PaymentMode: string;
}

export default function CashCollection() {
     const [searchPatientId, setSearchPatientId] = useState<string>('');
     const [statusFilter, setStatusFilter] = useState<string>('all');
     const [billingRecords, setBillingRecords] = useState<BillingRecord[]>([]);
     const [selectedBillingId, setSelectedBillingId] = useState<number | null>(null);
     const [outstandingAmount, setOutstandingAmount] = useState<string>('0.00');
     const [patientId, setPatientId] = useState<number | null>(null);
     const [patientBasicInformation, setPatientBasicInformation] = useState<any>(null);
     const [isLoading, setIsLoading] = useState<boolean>(false);
     const [selectedServices, setSelectedServices] = useState<Set<number>>(new Set());
     const [collectionAmount, setCollectionAmount] = useState<string>('');
     const [showCollectionModal, setShowCollectionModal] = useState<boolean>(false);
     const [paymentInputs, setPaymentInputs] = useState<{ [key: number]: string }>({});
     const [payAll, setPayAll] = useState<boolean>(false);
     const [showRemoveModal, setShowRemoveModal] = useState<boolean>(false);
     const [actionServiceId, setActionServiceId] = useState<number | null>(null);
     const [actionBillingId, setActionBillingId] = useState<number | null>(null);
     const [actionReason, setActionReason] = useState<string>('');
     const [reasonType, setReasonType] = useState<string>('');
     const [expandedBillings, setExpandedBillings] = useState<Set<number>>(new Set());
     const [paymentMode, setPaymentMode] = useState<'all' | 'billing' | 'service'>('service');
     const [paymentModes, setPaymentModes] = useState<PaymentMode[]>([]);
     const [selectedPaymentModes, setSelectedPaymentModes] = useState<{ [key: string | number]: number | null }>({});
     const urlPatientid = useSearchParams().get('patientid') || '';
     useEffect(() => {
          fetchPaymentModes();
     }, []);

     const removeReasons = [
          'Patient Request',
          'Service Not Rendered',
          'Duplicate Entry',
          'Wrong Service Added',
          'Patient Transferred',
          'Insurance Denial',
          'Service Cancelled',
          'Test Not Needed',
          'Billing Error',
          'Incorrect Patient',
          'Service Adjustment',
          'Facility Error',
          'Data Entry Mistake',
          'Service Rescheduled',
          'Patient Refusal',
          'Clinical Decision',
          'Test Result Pending',
          'Authorization Denied',
          'System Error',
          'Other'
     ];

     const fetchPaymentModes = async () => {
          try {
               const response = await customFetch('paymentmodes');
               if (response?.status === 'success' && response?.statusCode === 200) {
                    setPaymentModes(response.data || []);
               }
          } catch (error) {
               console.error('Error fetching payment modes:', error);
          }
     };

     const searchBilling = async (patientIdParam?: string) => {
          const searchPatientIdFinal = patientIdParam || searchPatientId;
          if (!searchPatientIdFinal.trim()) {
               toast.warning('Please enter a patient ID');
               return;
          }


          setIsLoading(true);
          try {
               const bulkUrl = `billing/client/bulk/outstanding?patientid=${searchPatientIdFinal}&status=${statusFilter}`;
               console.log('Fetching bulk outstanding from URL:', bulkUrl);
               const response = await customFetch(bulkUrl) as BulkOutstandingResponse;
               console.log('Bulk Outstanding Response:', response);

               if (response?.success && response?.data?.records && response.data.records.length > 0) {
                    setBillingRecords(response.data.records);
                    setSelectedBillingId(response.data.records[0].billingid); // Auto-select first billing record
                    setOutstandingAmount(response.data.outstandingAmount);
                    setPatientId(parseInt(searchPatientIdFinal));

                    // Fetch patient information
                    try {
                         const patientInfo = await fetchPatientPersonalInfo(parseInt(searchPatientIdFinal)) as any;
                         if (patientInfo?.result) {
                              setPatientBasicInformation(patientInfo.result);
                         }
                    } catch (patientError) {
                         console.error('Error fetching patient information:', patientError);
                    }

                    setSelectedServices(new Set());
                    setPaymentInputs({});
               } else {
                    console.log('No billing records found');
                    setBillingRecords([]);
                    setOutstandingAmount('0.00');
                    setPatientId(null);
                    setPatientBasicInformation(null);
                    toast.info('No outstanding billing records found');
               }
          } catch (error) {
               console.error('Error searching billing:', error);
               toast.error('Error searching billing records');
               setBillingRecords([]);
               setOutstandingAmount('0.00');
               setPatientBasicInformation(null);
          } finally {
               setIsLoading(false);
          }
     };

     const toggleBillingExpansion = (billingId: number) => {
          const newExpanded = new Set(expandedBillings);
          if (newExpanded.has(billingId)) {
               newExpanded.delete(billingId);
          } else {
               newExpanded.add(billingId);
          }
          setExpandedBillings(newExpanded);
     };

     const handlePayAllOutstanding = () => {
          const newInputs: { [key: number]: string } = {};
          billingRecords.forEach(record => {
               record.serviceDetails.forEach(service => {
                    const paidAmount = parseFloat(service.paidamount);
                    const totalPayable = parseFloat(service.totalpayable);
                    if (service.paymentstatus !== 'paid' && totalPayable > paidAmount) {
                         const balance = totalPayable - paidAmount;
                         newInputs[service.serviceid] = balance.toString();
                    }
               });
          });
          setPaymentInputs(newInputs);
          toast.info('All outstanding services marked for payment');
     };

     const handlePayBilling = (billingId: number) => {
          const record = billingRecords.find(r => r.billingid === billingId);
          if (!record) return;

          const newInputs = { ...paymentInputs };
          record.serviceDetails.forEach(service => {
               const paidAmount = parseFloat(service.paidamount);
               const totalPayable = parseFloat(service.totalpayable);
               if (service.paymentstatus !== 'paid' && totalPayable > paidAmount) {
                    const balance = totalPayable - paidAmount;
                    newInputs[service.serviceid] = balance.toString();
               }
          });
          setPaymentInputs(newInputs);
          toast.info(`All services in Billing ID ${billingId} marked for payment`);
     };

     const handleRecordCollection = async () => {
          // Calculate total from payment inputs
          const servicesToPay = Object.entries(paymentInputs).filter(([_, amount]) => parseFloat(amount) > 0);

          if (servicesToPay.length === 0) {
               toast.warning('Please enter payment amounts for at least one service');
               return;
          }

          // Check that all services with payment amounts have selected payment modes
          const servicesWithoutPaymentMode = servicesToPay.filter(([serviceId]) => !selectedPaymentModes[parseInt(serviceId)]);
          if (servicesWithoutPaymentMode.length > 0) {
               toast.warning('Please select a payment mode for all services with payment amounts');
               return;
          }

          const totalAmount = servicesToPay.reduce((sum, [_, amount]) => sum + parseFloat(amount), 0);

          setIsLoading(true);
          try {
               // Group services by billing ID
               const servicesByBilling: { [billingId: number]: { serviceId: number; amount: number }[] } = {};

               billingRecords.forEach(record => {
                    record.serviceDetails.forEach(service => {
                         const amount = parseFloat(paymentInputs[service.serviceid] || '0');
                         if (amount > 0) {
                              if (!servicesByBilling[record.billingid]) {
                                   servicesByBilling[record.billingid] = [];
                              }
                              servicesByBilling[record.billingid].push({
                                   serviceId: service.serviceid,
                                   amount: amount
                              });
                         }
                    });
               });

               // Collect all service payments across all billings
               const allServicePayments: { service_id: number; amount: number; payment_mode_id: number | null; billing_id: number }[] = [];

               for (const [billingId, services] of Object.entries(servicesByBilling)) {
                    const servicePayments = services.map(service => ({
                         service_id: service.serviceId,
                         amount: service.amount,
                         payment_mode_id: selectedPaymentModes[service.serviceId],
                         billing_id: parseInt(billingId)
                    }));
                    allServicePayments.push(...servicePayments);
               }

               // Send all services in one API call
               const payload = {
                    service_payments: allServicePayments,
                    total_amount: allServicePayments.reduce((sum, s) => sum + s.amount, 0),
                    description: `Cash collection for ${allServicePayments.length} service(s)`
               };

               const response = await customPost('billing/multi-service/payment', 'POST', payload);
               const { success, message } = response;
               if (success == true) {
                    toast.success(message || `Successfully collected ₵${totalAmount.toLocaleString()} from ${allServicePayments.length} service(s)`);
                    setPaymentInputs({});
                    setSelectedPaymentModes({});
                    setShowCollectionModal(false);
                    searchBilling();
               } else {
                    toast.error(message || 'Failed to record collection. Please try again.');
               }
          } catch (error) {
               console.error('Error recording collection:', error);
               toast.error('Error recording collection');
          } finally {
               setIsLoading(false);
          }
     };

     const handleRemoveService = (serviceId: number) => {
          setActionServiceId(serviceId);
          setActionReason('');
          setReasonType('');
          setShowRemoveModal(true);
     };

     const confirmRemove = () => {
          if (!actionReason.trim()) {
               toast.warning('Please select or enter a reason for removal');
               return;
          }

          // Remove service from billing records
          const updatedRecords = billingRecords.map(record => ({
               ...record,
               serviceDetails: record.serviceDetails.filter(s => s.serviceid !== actionServiceId)
          })).filter(record => record.serviceDetails.length > 0);

          setBillingRecords(updatedRecords);
          setSelectedServices(new Set([...selectedServices].filter(id => id !== actionServiceId)));

          // Remove from payment inputs
          const updatedInputs = { ...paymentInputs };
          delete updatedInputs[actionServiceId!];
          setPaymentInputs(updatedInputs);

          setShowRemoveModal(false);
          setActionReason('');
          setReasonType('');
          toast.info('Service removed from view');
     };


     useEffect(() => {
          if (urlPatientid) {
               const decodePatientid = plsDecryption(urlPatientid);
               setSearchPatientId(decodePatientid);
               searchBilling(decodePatientid);
          }
     }, [urlPatientid]);

     return (
          <div>
               {patientId && (
                    <div className="mb-3">
                         <Link href={`/billing/patientid/${plsEncryption(patientId?.toString())}/multi`} className="btn btn-outline-secondary btn-sm">&larr; Back to Billing</Link>
                    </div>
               )}
               <div className="card mt-2">
                    <div className="card-header p-0 bg-white border-bottom">
                         <div className="p-3">
                              <div className="d-flex justify-content-between align-items-center mb-2">
                                   <div>
                                        {patientBasicInformation && <BillingPagePatientInformation data={patientBasicInformation} loadingststate={false} />}
                                   </div>
                                   <div className="d-flex gap-2 align-items-center">
                                        <div className="input-group input-group-sm" style={{ width: '500px' }}>
                                             <input
                                                  type="text"
                                                  className="form-control form-control-sm"
                                                  placeholder="Patient ID..."
                                                  value={searchPatientId}
                                                  onChange={(e) => setSearchPatientId(e.target.value)}
                                                  onKeyPress={(e) => e.key === 'Enter' && searchBilling()}
                                             />
                                             <select
                                                  className="form-select form-select-sm"
                                                  value={statusFilter}
                                                  onChange={(e) => setStatusFilter(e.target.value)}
                                                  style={{ width: '120px' }}
                                             >
                                                  <option value="all">All</option>
                                                  <option value="pending">Pending</option>
                                                  <option value="completed">Completed</option>
                                             </select>
                                             <button
                                                  className="btn btn-sm btn-outline-primary"
                                                  onClick={() => { searchBilling(); }}
                                                  disabled={isLoading}
                                             >
                                                  {isLoading ? 'Searching...' : 'Search'}
                                             </button>
                                        </div>
                                   </div>
                              </div>
                              {billingRecords.length > 0 && Object.values(paymentInputs).filter(v => parseFloat(v) > 0).length > 0 && (
                                   <div className="d-flex justify-content-between align-items-center border-top pt-3">
                                        <div>
                                             <h5 className="mb-1 text-success fw-bold">₵{Object.values(paymentInputs).reduce((sum, val) => sum + parseFloat(val || '0'), 0).toFixed(2)}</h5>
                                             <small className="text-muted">{Object.values(paymentInputs).filter(v => parseFloat(v) > 0).length} service(s) ready for payment</small>
                                        </div>
                                        <div className="d-flex gap-2">
                                             <button
                                                  className="btn btn-sm btn-outline-success"
                                                  onClick={handlePayAllOutstanding}
                                             >
                                                  Pay All Outstanding
                                             </button>
                                             <button
                                                  className="btn btn-sm btn-outline-success"
                                                  onClick={() => setShowCollectionModal(true)}
                                             >
                                                  Process Payment
                                             </button>
                                             <button
                                                  className="btn btn-sm btn-outline-secondary"
                                                  onClick={() => setPaymentInputs({})}
                                             >
                                                  Clear All
                                             </button>
                                        </div>
                                   </div>
                              )}
                         </div>
                    </div>

                    <div className="card-body m-0 p-0">
                         {billingRecords.length > 0 ? (
                              <div className="row g-0" style={{ minHeight: '500px' }}>
                                   {/* LEFT COLUMN: Billing Records Master List (40%) */}
                                   <div className="col-12 col-lg-5 border-end" style={{ maxHeight: '500px', overflowY: 'auto' }}>
                                        <div className="p-2">
                                             <div className="d-flex align-items-center justify-content-between mb-2 px-2 py-1 bg-light rounded">
                                                  <small className="text-muted fw-medium text-uppercase" style={{ fontSize: '0.7rem', letterSpacing: '0.5px' }}>
                                                       Billing Records
                                                  </small>
                                                  <span className="badge bg-primary">{billingRecords.length}</span>
                                             </div>

                                             <div className="list-group list-group-flush">
                                                  {billingRecords.map((record) => {
                                                       const recordOutstanding = parseFloat(record.outstanding);
                                                       const isSelected = selectedBillingId === record.billingid;

                                                       return (
                                                            <div
                                                                 key={record.billingid}
                                                                 onClick={() => setSelectedBillingId(record.billingid)}
                                                                 className={`border border-1 my-2 ${isSelected ? "border-primary" : ""} rounded p-2`}
                                                                 style={{
                                                                      cursor: 'pointer',
                                                                      transition: 'all 0.2s ease'
                                                                 }}
                                                            >
                                                                 {/* First Row: Main Content */}
                                                                 <div className="d-flex align-items-center justify-content-between mb-2">
                                                                      {/* Left side: Billing ID and Meta Info */}
                                                                      <div className="d-flex align-items-center gap-3">
                                                                           <div className="d-flex align-items-center gap-2">
                                                                                <strong style={{ fontSize: '1rem' }}>#{record.billingid}</strong>
                                                                                {record.isAdjustment === 1 && (
                                                                                     <span className="badge bg-warning text-dark" style={{ fontSize: '0.65rem' }}>ADJ</span>
                                                                                )}
                                                                           </div>
                                                                      </div>

                                                                      {/* Right side: Financial Summary */}
                                                                      <div className="d-flex align-items-center" style={{ gap: '0.5rem' }}>
                                                                           <div style={{ minWidth: '120px' }}>
                                                                                <span className="text-success-emphasis">Paid: ₵{parseFloat(record.paid).toFixed(2)}</span>
                                                                           </div>
                                                                           <span className="text-muted">||</span>
                                                                           <div style={{ minWidth: '140px' }}>
                                                                                <span className="text-body">Payable: ₵{parseFloat(record.payable).toFixed(2)}</span>
                                                                           </div>
                                                                           <span className="text-muted">||</span>
                                                                           <div style={{ minWidth: '150px' }}>
                                                                                <span className={recordOutstanding > 0 ? 'text-danger' : 'text-muted'}>Outstanding: ₵{recordOutstanding.toFixed(2)}</span>
                                                                           </div>
                                                                      </div>
                                                                 </div>

                                                                 {/* Second Row: Date and Pay Button */}
                                                                 <div className="d-flex align-items-center justify-content-between">
                                                                      <span className="text-muted" style={{ fontSize: '0.8rem' }}>
                                                                           {new Date(record.billedon).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                                      </span>
                                                                      <button
                                                                           className="btn btn-sm btn-outline-success"
                                                                           onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                handlePayBilling(record.billingid);
                                                                           }}
                                                                           disabled={recordOutstanding <= 0}
                                                                           style={{ fontSize: '0.8rem', padding: '0.2rem 0.5rem', fontWeight: '600' }}
                                                                      >
                                                                           Make Payment for All
                                                                      </button>
                                                                 </div>
                                                            </div>
                                                       );
                                                  })}
                                             </div>
                                        </div>
                                   </div>

                                   {/* RIGHT COLUMN: Service Details Panel (60%) */}
                                   <div className="col-12 col-lg-7" style={{ maxHeight: '500px', overflowY: 'auto' }}>
                                        {selectedBillingId ? (
                                             <>
                                                  {(() => {
                                                       const selectedRecord = billingRecords.find(r => r.billingid === selectedBillingId);
                                                       if (!selectedRecord) return null;

                                                       return (
                                                            <div className="p-3">
                                                                 {/* Panel Header */}
                                                                 <div className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom">
                                                                      <div>
                                                                           <h6 className="mb-0 fw-bold">Service Details</h6>
                                                                           <small className="text-muted">Billing #{selectedRecord.billingid}</small>
                                                                      </div>
                                                                      <span className="badge bg-primary">{selectedRecord.serviceDetails.length} Services</span>
                                                                 </div>

                                                                 {/* Adjustment Notice */}
                                                                 {selectedRecord.adjustmentReason && (
                                                                      <div className="alert alert-warning mb-3 py-2 px-3">
                                                                           <div className="d-flex align-items-start gap-2">
                                                                                <i className="bi bi-exclamation-triangle-fill"></i>
                                                                                <div>
                                                                                     <div className="fw-semibold" style={{ fontSize: '0.85rem' }}>Adjustment Applied</div>
                                                                                     <small>{selectedRecord.adjustmentReason}</small>
                                                                                </div>
                                                                           </div>
                                                                      </div>
                                                                 )}

                                                                 {/* Services Table */}
                                                                 <div className="table-responsive">
                                                                      <table className="table table-sm table-hover align-middle mb-0">
                                                                           <thead className="sticky-top" style={{ backgroundColor: '#f8f9fa', top: 0, zIndex: 10 }}>
                                                                                <tr style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                                                                     <th className="py-2">Service</th>

                                                                                     <th className="py-2 text-start" style={{ width: '90px' }}>Amount</th>
                                                                                     <th className="py-2 text-start" style={{ width: '90px' }}>Paid</th>
                                                                                     <th className="py-2 text-start" style={{ width: '90px' }}>Balance</th>
                                                                                     <th className="py-2 text-start" style={{ width: '320px' }}>Payment Action</th>
                                                                                </tr>
                                                                           </thead>
                                                                           <tbody>
                                                                                {selectedRecord.serviceDetails.map((service) => {
                                                                                     const paidAmount = parseFloat(service.paidamount);
                                                                                     const totalPayable = parseFloat(service.totalpayable);
                                                                                     const balance = totalPayable - paidAmount;
                                                                                     const isPaid = service.paymentstatus === 'paid';
                                                                                     const refunded = service.amountRefunded;


                                                                                     return (
                                                                                          <tr key={service.serviceid} style={{ fontSize: '1rem' }}>
                                                                                               <td className="py-2">
                                                                                                    <div className="fw-semibold">{service.service_name}</div>
                                                                                               </td>

                                                                                               <td className="py-2 text-start">₵{totalPayable.toFixed(2)}</td>
                                                                                               <td className="py-2 text-start text-success fw-medium">₵{paidAmount.toFixed(2)}</td>
                                                                                               <td className={`py-2 text-start fw-bold ${balance > 0 ? 'text-danger' : 'text-muted'}`}>
                                                                                                    ₵{balance.toFixed(2)}
                                                                                               </td>
                                                                                               <td className="py-2 text-start">
                                                                                                    {!isPaid && balance > 0 ? (
                                                                                                         <div className="d-flex justify-content-start align-items-center gap-1">
                                                                                                              <Form.Control
                                                                                                                   type="number"
                                                                                                                   size="sm"
                                                                                                                   placeholder="0.00"
                                                                                                                   value={paymentInputs[service.serviceid] || ''}
                                                                                                                   onChange={(e) => {
                                                                                                                        setPaymentInputs({
                                                                                                                             ...paymentInputs,
                                                                                                                             [service.serviceid]: e.target.value
                                                                                                                        });
                                                                                                                   }}
                                                                                                                   min="0"
                                                                                                                   max={balance}
                                                                                                                   step="0.01"
                                                                                                                   style={{ fontSize: '0.9rem', maxWidth: '90px' }}
                                                                                                              />
                                                                                                              <button
                                                                                                                   className="btn btn-sm btn-outline-primary"
                                                                                                                   style={{ fontSize: '0.9rem' }}
                                                                                                                   onClick={() => {
                                                                                                                        setPaymentInputs({
                                                                                                                             ...paymentInputs,
                                                                                                                             [service.serviceid]: balance.toString()
                                                                                                                        });
                                                                                                                   }}
                                                                                                                   title="Pay full balance"
                                                                                                              >
                                                                                                                   make full payment
                                                                                                              </button>
                                                                                                              <button
                                                                                                                   className="btn btn-sm btn-outline-danger p-1"
                                                                                                                   style={{ fontSize: '0.9rem' }}
                                                                                                                   onClick={() => handleRemoveService(service.serviceid)}
                                                                                                                   title="Remove from payment"
                                                                                                              >
                                                                                                                   <RiDeleteBinLine size={14} />
                                                                                                              </button>
                                                                                                         </div>
                                                                                                    ) : isPaid && (service.isRefunded || (refunded && refunded > 0)) ? (
                                                                                                         <span className="text-muted" style={{ fontSize: '0.9rem' }}>
                                                                                                              Refunded: ₵{Number(refunded || 0).toFixed(2)}
                                                                                                         </span>
                                                                                                    ) : (
                                                                                                         <span className="text-muted" style={{ fontSize: '0.9rem' }}>—</span>
                                                                                                    )}
                                                                                               </td>
                                                                                          </tr>
                                                                                     );
                                                                                })}
                                                                           </tbody>
                                                                      </table>
                                                                 </div>
                                                            </div>
                                                       );
                                                  })()}
                                             </>
                                        ) : (
                                             <div className="d-flex flex-column align-items-center justify-content-center h-100 text-center p-5">
                                                  <div className="mb-3" style={{ fontSize: '3rem', opacity: 0.3 }}>
                                                       📋
                                                  </div>
                                                  <h6 className="text-muted mb-2">No Billing Record Selected</h6>
                                                  <p className="text-muted small mb-0">
                                                       Select a billing record from the left panel to view service details
                                                  </p>
                                             </div>
                                        )}
                                   </div>
                              </div>
                         ) : (
                              <div className="text-center py-5">
                                   <p className="text-muted">No billing records found</p>
                              </div>
                         )}
                    </div>
               </div>

               {showCollectionModal && (
                    <div className="modal d-block" >
                         <div className="modal-dialog modal-lg">
                              <div className="modal-content">
                                   <div className="modal-header bg-secondary-subtle">
                                        <h5 className="modal-title">Payment Review</h5>
                                        <button
                                             type="button"
                                             className="btn-close"
                                             onClick={() => {
                                                  setShowCollectionModal(false);
                                                  setSelectedPaymentModes({});
                                             }}
                                        />
                                   </div>
                                   <div className="modal-body">
                                        <div className="border rounded mb-3">
                                             <div className="p-3">
                                                  <div className="d-flex align-items-center justify-content-between">
                                                       <div>
                                                            <p className="mb-1 text-muted small">Total Payment</p>
                                                            <h3 className="mb-0">₵{Object.values(paymentInputs).reduce((sum, val) => sum + parseFloat(val || '0'), 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
                                                       </div>
                                                       <div className="text-start">
                                                            <span className="text-muted small">
                                                                 {Object.entries(paymentInputs).filter(([_, val]) => parseFloat(val) > 0).length} Services
                                                            </span>
                                                            <div className="mt-1">
                                                                 {(() => {
                                                                      const servicesWithPayments = Object.entries(paymentInputs).filter(([_, val]) => parseFloat(val) > 0);
                                                                      const servicesWithModes = servicesWithPayments.filter(([serviceId]) => selectedPaymentModes[parseInt(serviceId)]);
                                                                      const allHaveModes = servicesWithPayments.length > 0 && servicesWithModes.length === servicesWithPayments.length;
                                                                      const noneHaveModes = servicesWithModes.length === 0;

                                                                      return (
                                                                           <small className={`fw-medium ${allHaveModes ? 'text-success' : noneHaveModes ? 'text-danger' : 'text-warning'}`}>
                                                                                {allHaveModes ? '✓' : noneHaveModes ? '⚠' : '○'} {servicesWithModes.length}/{servicesWithPayments.length} payment modes set
                                                                           </small>
                                                                      );
                                                                 })()}
                                                            </div>
                                                       </div>
                                                  </div>
                                             </div>
                                        </div>

                                        <div className="border rounded mb-3">
                                             <div className="p-3">
                                                  <div className="row align-items-end">
                                                       <div className="col-md-8">
                                                            <Form.Group>
                                                                 <Form.Label className="small fw-medium">Apply Payment Mode to All Services</Form.Label>
                                                                 <Form.Select
                                                                      value={selectedPaymentModes['global'] || ''}
                                                                      onChange={(e) => {
                                                                           const modeId = e.target.value ? parseInt(e.target.value) : null;
                                                                           setSelectedPaymentModes(prev => ({
                                                                                ...prev,
                                                                                global: modeId
                                                                           }));
                                                                      }}
                                                                      className="form-select-sm"
                                                                 >
                                                                      <option value="">Select Payment Mode</option>
                                                                      {paymentModes.map((mode) => (
                                                                           <option key={mode.KeyID} value={mode.KeyID}>
                                                                                {mode.PaymentMode}
                                                                           </option>
                                                                      ))}
                                                                 </Form.Select>
                                                            </Form.Group>
                                                       </div>
                                                       <div className="col-md-4">
                                                            <button
                                                                 type="button"
                                                                 className="btn btn-outline-primary btn-sm w-100"
                                                                 onClick={() => {
                                                                      const globalMode = selectedPaymentModes['global'];
                                                                      if (!globalMode) {
                                                                           toast.warning('Please select a payment mode first');
                                                                           return;
                                                                      }

                                                                      // Apply to all services with payment amounts
                                                                      const updatedModes = { ...selectedPaymentModes };
                                                                      Object.entries(paymentInputs).forEach(([serviceId, amount]) => {
                                                                           if (parseFloat(amount) > 0) {
                                                                                updatedModes[parseInt(serviceId)] = globalMode;
                                                                           }
                                                                      });
                                                                      setSelectedPaymentModes(updatedModes);
                                                                      toast.success('Payment mode applied to all services');
                                                                 }}
                                                                 disabled={!selectedPaymentModes['global'] || (() => {
                                                                      const globalMode = selectedPaymentModes['global'];
                                                                      if (!globalMode) return true;
                                                                      const servicesWithPayments = Object.entries(paymentInputs).filter(([_, val]) => parseFloat(val) > 0);
                                                                      return servicesWithPayments.every(([serviceId]) => selectedPaymentModes[parseInt(serviceId)] === globalMode);
                                                                 })()}
                                                            >
                                                                 Apply to All
                                                            </button>
                                                       </div>
                                                  </div>
                                             </div>
                                        </div>

                                        <div className="border rounded" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                             <table className="table table-hover mb-0">
                                                  <thead className="table-light" style={{ position: 'sticky', top: 0, zIndex: 10 }}>
                                                       <tr>
                                                            <th>Billing ID</th>
                                                            <th>Service ID</th>
                                                            <th className="text-start">Balance</th>
                                                            <th className="text-start">Payment</th>
                                                            <th>Payment Mode</th>
                                                       </tr>
                                                  </thead>
                                                  <tbody>
                                                       {billingRecords.map(record => {
                                                            const servicesWithPayment = record.serviceDetails.filter(s =>
                                                                 paymentInputs[s.serviceid] && parseFloat(paymentInputs[s.serviceid]) > 0
                                                            );

                                                            if (servicesWithPayment.length === 0) return null;

                                                            return servicesWithPayment.map((service, idx) => {
                                                                 const paidAmount = parseFloat(service.paidamount);
                                                                 const balance = parseFloat(service.totalpayable) - paidAmount;
                                                                 const payAmount = parseFloat(paymentInputs[service.serviceid] || '0');

                                                                 return (
                                                                      <tr key={service.serviceid}>
                                                                           {idx === 0 && (
                                                                                <td rowSpan={servicesWithPayment.length} >
                                                                                     <span className="fw-bold">#{record.billingid}</span>
                                                                                </td>
                                                                           )}
                                                                           <td>
                                                                                <span className="fw-bold">#{service.serviceid}</span>
                                                                           </td>
                                                                           <td className="text-start">
                                                                                ₵{balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                                           </td>
                                                                           <td className="text-start">
                                                                                <span className="fw-bold text-success">₵{payAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                                                           </td>
                                                                           <td>
                                                                                <div className="d-flex align-items-center gap-2">
                                                                                     <Form.Select
                                                                                          size="sm"
                                                                                          value={selectedPaymentModes[service.serviceid] || ''}
                                                                                          onChange={(e) => {
                                                                                               const modeId = e.target.value ? parseInt(e.target.value) : null;
                                                                                               setSelectedPaymentModes(prev => ({
                                                                                                    ...prev,
                                                                                                    [service.serviceid]: modeId
                                                                                               }));
                                                                                          }}
                                                                                          className={`form-select-sm ${selectedPaymentModes[service.serviceid] ? 'border-success' : ''}`}
                                                                                          style={{ minWidth: '120px' }}
                                                                                     >
                                                                                          <option value="">Select Mode</option>
                                                                                          {paymentModes.map((mode) => (
                                                                                               <option key={mode.KeyID} value={mode.KeyID}>
                                                                                                    {mode.PaymentMode}
                                                                                               </option>
                                                                                          ))}
                                                                                     </Form.Select>
                                                                                     {selectedPaymentModes[service.serviceid] && (
                                                                                          <i className="bi bi-check-circle-fill text-success" title="Payment mode selected"></i>
                                                                                     )}
                                                                                </div>
                                                                           </td>
                                                                      </tr>
                                                                 );
                                                            });
                                                       })}
                                                  </tbody>
                                                  <tfoot className="table-light">
                                                       <tr>
                                                            <th colSpan={3} className="text-start">Total Payment:</th>
                                                            <th className="text-start">
                                                                 <span className="text-success fw-bold">₵{Object.values(paymentInputs).reduce((sum, val) => sum + parseFloat(val || '0'), 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                                            </th>
                                                       </tr>
                                                  </tfoot>
                                             </table>
                                        </div>

                                        <div className="alert alert-info mt-3">
                                             <p className="mb-0">
                                                  This payment will be recorded for <strong>{Object.entries(paymentInputs).filter(([_, val]) => parseFloat(val) > 0).length} service(s)</strong> across <strong>{new Set(billingRecords.filter(r => r.serviceDetails.some(s => paymentInputs[s.serviceid] && parseFloat(paymentInputs[s.serviceid]) > 0)).map(r => r.billingid)).size} billing record(s)</strong>.
                                             </p>
                                        </div>
                                   </div>
                                   <div className="modal-footer">
                                        <button
                                             type="button"
                                             className="btn btn-outline-danger btn-sm"
                                             onClick={() => {
                                                  setShowCollectionModal(false);
                                                  setSelectedPaymentModes({});
                                             }}
                                        >
                                             Cancel
                                        </button>
                                        <button
                                             type="button"
                                             className="btn btn-sm btn-outline-success  "
                                             onClick={handleRecordCollection}
                                             disabled={isLoading}
                                        >
                                             {isLoading ? (
                                                  <>
                                                       <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                                       {' '}Processing...
                                                  </>
                                             ) : (
                                                  'Confirm & Process'
                                             )}
                                        </button>
                                   </div>
                              </div>
                         </div>
                    </div>
               )}

               {showRemoveModal && (
                    <div className="modal d-block" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                         <div className="modal-dialog">
                              <div className="modal-content">
                                   <div className="modal-header">
                                        <h5 className="modal-title">Remove Service</h5>
                                        <button
                                             type="button"
                                             className="btn-close"
                                             onClick={() => setShowRemoveModal(false)}
                                        />
                                   </div>
                                   <div className="modal-body">
                                        <div className="mb-3">
                                             <label htmlFor="removeReason" className="form-label">
                                                  Reason for Removal <span className="text-danger">*</span>
                                             </label>
                                             <select
                                                  id="removeReason"
                                                  className="form-select form-select-sm"
                                                  value={reasonType}
                                                  onChange={(e) => {
                                                       setReasonType(e.target.value);
                                                       setActionReason(e.target.value === 'Other' ? '' : e.target.value);
                                                  }}
                                             >
                                                  <option value="">-- Select a Reason --</option>
                                                  {removeReasons.map((reason) => (
                                                       <option key={reason} value={reason}>
                                                            {reason}
                                                       </option>
                                                  ))}
                                             </select>
                                        </div>
                                        {reasonType === 'Other' && (
                                             <div className="mb-3">
                                                  <label htmlFor="removeOtherReason" className="form-label">
                                                       Please Specify <span className="text-danger">*</span>
                                                  </label>
                                                  <textarea
                                                       id="removeOtherReason"
                                                       className="form-control form-control-sm"
                                                       placeholder="Enter your reason"
                                                       value={actionReason}
                                                       onChange={(e) => setActionReason(e.target.value)}
                                                       rows={3}
                                                  />
                                             </div>
                                        )}
                                   </div>
                                   <div className="modal-footer">
                                        <button
                                             type="button"
                                             className="btn btn-sm btn-outline-danger"
                                             onClick={() => setShowRemoveModal(false)}
                                        >
                                             Cancel
                                        </button>
                                        <button
                                             type="button"
                                             className="btn btn-sm btn-outline-danger"
                                             onClick={confirmRemove}
                                        >
                                             Confirm Remove
                                        </button>
                                   </div>
                              </div>
                         </div>
                    </div>
               )}
          </div>
     );
}
