"use client";
import React, { useState } from 'react';
import { customFetch, customPost, fetchPatientPersonalInfo } from '../../../components/Auth/customFetch';
import { toast } from 'react-toastify';
import { ListGroup, Button, Form } from 'react-bootstrap';
import { RiDeleteBinLine, RiRefundLine } from '@remixicon/react';
import BillingPagePatientInformation from '../../../components/Billing/BillingContextComponents/PersonalInfoView';

interface BillingService {
     serviceid: number;
     billingid: number;
     patientid?: number;
     name: boolean | string;
     cost: string;
     totalcost: string;
     totalpayable: string;
     paidamount: string | null;
     paymentstatus: string | null;
     discount: string;
     taxValue: string;
     nightAdjustmentValue: string;
     organizationName?: string;
     trackId?: number;
     serviceCategory?: string;
}

interface BillingRecord {
     id: number;
     billing_id: string;
     patient_name?: string;
     amount?: number;
     balance?: number;
     date?: string;
     status?: string;
}

interface TransactionData {
     billingid: number;
     patientid: number;
     totalTransactionCost: string;
     totalcost: string;
     totalpayable?: string;
     paid: string;
     payable: string;
     outstanding: string;
     balance: string;
     status: string;
}

export default function CashCollection() {
     const [searchBillingId, setSearchBillingId] = useState<string>('');
     const [billingServices, setBillingServices] = useState<BillingService[]>([]);
     const [currentBillingId, setCurrentBillingId] = useState<string>('');
     const [patientId, setPatientId] = useState<number | null>(null);
     const [patientBasicInformation, setPatientBasicInformation] = useState<any>(null);
     const [transactionData, setTransactionData] = useState<TransactionData | null>(null);
     const [isLoading, setIsLoading] = useState<boolean>(false);
     const [selectedServices, setSelectedServices] = useState<Set<number>>(new Set());
     const [collectionAmount, setCollectionAmount] = useState<string>('');
     const [showCollectionModal, setShowCollectionModal] = useState<boolean>(false);
     const [paymentInputs, setPaymentInputs] = useState<{ [key: number]: string }>({});
     const [payAll, setPayAll] = useState<boolean>(false);
     const [showRefundModal, setShowRefundModal] = useState<boolean>(false);
     const [showRemoveModal, setShowRemoveModal] = useState<boolean>(false);
     const [actionServiceId, setActionServiceId] = useState<number | null>(null);
     const [actionReason, setActionReason] = useState<string>('');
     const [reasonType, setReasonType] = useState<string>('');

     const refundReasons = [
          'Patient Request',
          'Duplicate Charge',
          'Insurance Denial',
          'Service Not Rendered',
          'Incorrect Amount Charged',
          'Service Quality Issue',
          'Patient Dissatisfaction',
          'Billing Error',
          'Insurance Adjustment',
          'Patient Financial Hardship',
          'Service Cancellation',
          'Wrong Service Billed',
          'Test Not Performed',
          'Patient Transferred',
          'Adjustment Period',
          'Credit Memo',
          'Courtesy Adjustment',
          'Overpayment',
          'System Error',
          'Other'
     ];

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

     const searchBilling = async () => {
          if (!searchBillingId.trim()) {
               toast.warning('Please enter a billing ID');
               return;
          }

          setIsLoading(true);
          try {
               // Fetch transaction data
               const transactionUrl = `billing/previous/transaction/data?billingid=${searchBillingId}&tenantId=3`;
               console.log('Fetching transaction data from URL:', transactionUrl);
               const transactionResponse = await customFetch(transactionUrl);
               console.log('Transaction Response:', transactionResponse);

               if (transactionResponse?.result && Array.isArray(transactionResponse.result) && transactionResponse.result.length > 0) {
                    const transData = transactionResponse.result[0];
                    console.log('Setting transaction data:', transData);
                    setTransactionData(transData);
                    setPatientId(transData.patientid);
                    setCurrentBillingId(searchBillingId);

                    // Fetch patient information
                    try {
                         const patientInfo = await fetchPatientPersonalInfo(transData.patientid) as any;
                         if (patientInfo?.result) {
                              setPatientBasicInformation(patientInfo.result);
                         }
                    } catch (patientError) {
                         console.error('Error fetching patient information:', patientError);
                    }
               } else {
                    console.log('No transaction data found');
                    setTransactionData(null);
                    setPatientId(null);
                    setPatientBasicInformation(null);
                    toast.info('No transaction data found');
                    setIsLoading(false);
                    return;
               }

               // Fetch service details
               const servicesUrl = `billing/information/single?billingid=${searchBillingId}&tenantId=3`;
               console.log('Fetching services from URL:', servicesUrl);
               const servicesResponse = await customFetch(servicesUrl);
               console.log('Services Response:', servicesResponse);

               if (servicesResponse?.result && Array.isArray(servicesResponse.result)) {
                    console.log('Setting services, count:', servicesResponse.result.length);
                    setBillingServices(servicesResponse.result);
                    setSelectedServices(new Set());
               } else {
                    console.log('No services found');
                    setBillingServices([]);
                    toast.info('No billing services found');
               }
          } catch (error) {
               console.error('Error searching billing:', error);
               toast.error('Error searching billing records');
               setBillingServices([]);
               setTransactionData(null);
               setPatientBasicInformation(null);
          } finally {
               setIsLoading(false);
          }
     };

     const handleRecordCollection = async () => {
          if (selectedServices.size === 0) {
               toast.warning('Please select at least one service');
               return;
          }

          if (!collectionAmount || parseFloat(collectionAmount) <= 0) {
               toast.warning('Please enter a valid collection amount');
               return;
          }

          setIsLoading(true);
          try {
               const selectedServiceIds = Array.from(selectedServices);
               const payload = {
                    billing_id: currentBillingId,
                    service_ids: selectedServiceIds,
                    amount: parseFloat(collectionAmount),
                    description: `Cash collection for ${selectedServices.size} service(s)`
               };

               const response = await customPost('billing/cash-collection', 'POST', payload);
               if (response?.status === 'success') {
                    toast.success(`Successfully collected ₵${parseFloat(collectionAmount).toLocaleString()} from ${selectedServices.size} service(s)`);
                    setSelectedServices(new Set());
                    setCollectionAmount('');
                    setShowCollectionModal(false);
                    searchBilling();
               } else {
                    toast.error(response?.message || 'Error recording collection');
               }
          } catch (error) {
               console.error('Error recording collection:', error);
               toast.error('Error recording collection');
          } finally {
               setIsLoading(false);
          }
     };

     const handleRefundService = async (serviceId: number) => {
          if (!currentBillingId) {
               toast.warning('Please search for a billing ID first');
               return;
          }

          setActionServiceId(serviceId);
          setActionReason('');
          setShowRefundModal(true);
     };

     const confirmRefund = async () => {
          if (!actionReason.trim()) {
               toast.warning('Please select or enter a reason for refund');
               return;
          }

          setIsLoading(true);
          try {
               const payload = {
                    billing_id: currentBillingId,
                    service_id: actionServiceId,
                    description: actionReason
               };

               const response = await customPost('billing/refund-service', 'POST', payload);
               if (response?.status === 'success') {
                    toast.success('Service refund initiated successfully');
                    setShowRefundModal(false);
                    setActionReason('');
                    setReasonType('');
                    searchBilling();
               } else {
                    toast.error(response?.message || 'Error initiating refund');
               }
          } catch (error) {
               console.error('Error initiating refund:', error);
               toast.error('Error initiating refund');
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

          setBillingServices(billingServices.filter(s => s.serviceid !== actionServiceId));
          setSelectedServices(new Set([...selectedServices].filter(id => id !== actionServiceId)));
          setShowRemoveModal(false);
          setActionReason('');
          setReasonType('');
          toast.info('Service removed');
     };

     const totalCost = billingServices
          .filter(s => selectedServices.has(s.serviceid))
          .reduce((sum, s) => sum + parseFloat(s.totalpayable || '0'), 0);

     return (
          <div>
               <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                         {patientBasicInformation && <BillingPagePatientInformation data={patientBasicInformation} loadingststate={false} />}
                    </div>
                    <div className="input-group input-group-sm" style={{ width: '300px' }}>
                         <input
                              type="text"
                              className="form-control form-control-sm"
                              placeholder="Billing ID..."
                              value={searchBillingId}
                              onChange={(e) => setSearchBillingId(e.target.value)}
                              onKeyPress={(e) => e.key === 'Enter' && searchBilling()}
                         />
                         <button
                              className="btn btn-sm btn-outline-primary"
                              onClick={searchBilling}
                              disabled={isLoading}
                         >
                              {isLoading ? 'Searching...' : 'Search'}
                         </button>
                    </div>
               </div>

               <hr />

               {billingServices.length > 0 && (
                    <div className="mb-4">
                         {transactionData && (
                              <div className="mb-3 p-3 border rounded bg-info bg-opacity-10">
                                   <div className="row d-flex justify-content-between align-items-center g-2">
                                        <div className="col-md-auto">
                                             <p className="mb-0 small">
                                                  <strong>Total Payable: ₵{parseFloat(transactionData.payable).toLocaleString()}</strong>
                                             </p>
                                        </div>
                                        <div className="col-md-auto">
                                             <p className="mb-0 small">
                                                  <strong>Paid: ₵{parseFloat(transactionData.paid).toLocaleString()}</strong>
                                             </p>
                                        </div>
                                        <div className="col-md-auto">
                                             <p className="mb-0 small">
                                                  <strong className="text-danger">Outstanding: ₵{parseFloat(transactionData.outstanding).toLocaleString()}</strong>
                                             </p>
                                        </div>
                                        <div className="col-md-auto">
                                             <p className="mb-0 small">
                                                  <strong className="text-warning">Balance: ₵{parseFloat(transactionData.balance).toLocaleString()}</strong>
                                             </p>
                                        </div>
                                        <div className="col-md-auto">
                                             <p className="mb-0 small">
                                                  <span>Status: <span className="badge bg-primary">{transactionData.status}</span></span>
                                             </p>
                                        </div>
                                   </div>
                              </div>
                         )}
                         <div className="mb-3 p-3 border rounded bg-light">
                              <div className="row align-items-center">
                                   <div className="col-md-6">
                                        <div className="form-check">
                                             <input
                                                  className="form-check-input"
                                                  type="checkbox"
                                                  id="payAllCheck"
                                                  checked={payAll}
                                                  onChange={(e) => {
                                                       setPayAll(e.target.checked);
                                                       if (e.target.checked) {
                                                            // Auto-fill all unpaid services with their balance
                                                            const newInputs: { [key: number]: string } = {};
                                                            billingServices.forEach(service => {
                                                                 const paidAmount = service.paidamount ?? '0';
                                                                 const isPaid = parseFloat(paidAmount) > 0;
                                                                 if (!isPaid) {
                                                                      const balance = parseFloat(service.totalpayable || '0') - parseFloat(paidAmount);
                                                                      newInputs[service.serviceid] = balance.toString();
                                                                 }
                                                            });
                                                            setPaymentInputs(newInputs);
                                                       } else {
                                                            setPaymentInputs({});
                                                       }
                                                  }}
                                             />
                                             <label className="form-check-label" htmlFor="payAllCheck">
                                                  <strong>Pay All Services</strong>
                                             </label>
                                        </div>
                                        {payAll && (
                                             <div className="mt-2 p-2 bg-white border rounded">
                                                  <p className="mb-0"><strong className="text-success">Pay All is Enabled</strong></p>
                                                  <small className="text-muted">All unpaid services will be marked for payment with their full balance</small>
                                             </div>
                                        )}
                                   </div>
                                   <div className="col-md-6">
                                        <div>
                                             <p className="mb-0"><strong>Total Services: {billingServices.length}</strong></p>
                                             {selectedServices.size > 0 && (
                                                  <p className="mb-0"><strong className="text-danger">Selected: {selectedServices.size} | Total: ₵{totalCost.toLocaleString()}</strong></p>
                                             )}
                                        </div>
                                        {selectedServices.size > 0 && (
                                             <button
                                                  className="btn btn-sm btn-outline-success mt-2"
                                                  onClick={() => setShowCollectionModal(true)}
                                             >
                                                  Record Collection
                                             </button>
                                        )}
                                   </div>
                              </div>
                         </div>

                         <div className="mt-3">
                              <ListGroup>
                                   {billingServices.map((service) => {
                                        const serviceName = typeof service.name === 'boolean' ? service.organizationName : service.name;
                                        const paidAmount = service.paidamount ?? '0';
                                        const status = service.paymentstatus ?? 'unpaid';
                                        const balance = parseFloat(service.totalpayable || '0') - parseFloat(paidAmount);
                                        const isPaid = parseFloat(paidAmount) > 0;

                                        return (
                                             <ListGroup.Item key={service.serviceid} className="d-flex justify-content-between align-items-center">
                                                  <div className="flex-grow-1">
                                                       <p className="mb-1"><strong>{serviceName}</strong></p>
                                                       <small className="text-muted">
                                                            Amount: ₵{parseFloat(service.totalpayable).toLocaleString()} |
                                                            Paid: ₵{parseFloat(paidAmount).toLocaleString()} |
                                                            Balance: ₵{balance.toLocaleString()}
                                                       </small>
                                                  </div>

                                                  {!isPaid && (
                                                       <div className="ms-3 d-flex align-items-center gap-2">
                                                            <Form.Control
                                                                 type="number"
                                                                 size="sm"
                                                                 placeholder="Pay amount"
                                                                 style={{ width: '120px' }}
                                                                 value={paymentInputs[service.serviceid] || ''}
                                                                 onChange={(e) => setPaymentInputs({
                                                                      ...paymentInputs,
                                                                      [service.serviceid]: e.target.value
                                                                 })}
                                                                 min="0"
                                                                 step="0.01"
                                                            />
                                                            <Button
                                                                 variant="outline-danger"
                                                                 size="sm"
                                                                 onClick={() => handleRemoveService(service.serviceid)}
                                                                 title="Remove service"
                                                            >
                                                                 <RiDeleteBinLine size={16} className="me-1" />
                                                                 Remove
                                                            </Button>
                                                       </div>
                                                  )}

                                                  {isPaid && (
                                                       <div className="ms-3 d-flex align-items-center gap-2">
                                                            <Button
                                                                 variant="outline-warning"
                                                                 size="sm"
                                                                 onClick={() => handleRefundService(service.serviceid)}
                                                                 disabled={isLoading}
                                                                 title="Refund service"
                                                            >
                                                                 <RiRefundLine size={16} className="me-1" />
                                                                 Refund
                                                            </Button>
                                                            <span className="badge bg-success">Paid</span>
                                                       </div>
                                                  )}
                                             </ListGroup.Item>
                                        );
                                   })}
                              </ListGroup>
                         </div>
                    </div>
               )}

               {showCollectionModal && (
                    <div className="modal d-block" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                         <div className="modal-dialog">
                              <div className="modal-content">
                                   <div className="modal-header">
                                        <h5 className="modal-title">Record Cash Collection</h5>
                                        <button
                                             type="button"
                                             className="btn-close"
                                             onClick={() => setShowCollectionModal(false)}
                                        />
                                   </div>
                                   <div className="modal-body">
                                        <div className="mb-3">
                                             <label className="form-label">
                                                  <strong>Services Selected:</strong> {selectedServices.size}
                                             </label>
                                        </div>
                                        <div className="mb-3">
                                             <div className="card">
                                                  <div className="card-body">
                                                       {billingServices
                                                            .filter(s => selectedServices.has(s.serviceid))
                                                            .map(s => {
                                                                 const serviceName = typeof s.name === 'boolean' ? s.organizationName : s.name;
                                                                 const paidAmount = s.paidamount ?? '0';
                                                                 const balance = parseFloat(s.totalpayable) - parseFloat(paidAmount);
                                                                 return (
                                                                      <div key={s.serviceid} className="mb-2 pb-2 border-bottom">
                                                                           <p className="mb-1"><strong>{serviceName}</strong></p>
                                                                           <p className="mb-0 text-muted small">
                                                                                Balance: ₵{balance.toLocaleString()}
                                                                           </p>
                                                                      </div>
                                                                 );
                                                            })}
                                                  </div>
                                             </div>
                                        </div>
                                        <div className="mb-3">
                                             <label htmlFor="collectionAmount" className="form-label">
                                                  Collection Amount <span className="text-danger">*</span>
                                             </label>
                                             <input
                                                  id="collectionAmount"
                                                  type="number"
                                                  className="form-control"
                                                  placeholder="Enter amount collected"
                                                  value={collectionAmount}
                                                  onChange={(e) => setCollectionAmount(e.target.value)}
                                                  min="0"
                                                  step="0.01"
                                             />
                                        </div>
                                        {collectionAmount && (
                                             <div className="alert alert-info">
                                                  Amount: ₵{parseFloat(collectionAmount || '0').toLocaleString()}
                                             </div>
                                        )}
                                   </div>
                                   <div className="modal-footer">
                                        <button
                                             type="button"
                                             className="btn btn-sm btn-outline-danger"
                                             onClick={() => setShowCollectionModal(false)}
                                        >
                                             Cancel
                                        </button>
                                        <button
                                             type="button"
                                             className="btn btn-sm btn-outline-success"
                                             onClick={handleRecordCollection}
                                             disabled={isLoading}
                                        >
                                             {isLoading ? 'Processing...' : 'Confirm Collection'}
                                        </button>
                                   </div>
                              </div>
                         </div>
                    </div>
               )}

               {showRefundModal && (
                    <div className="modal d-block" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                         <div className="modal-dialog">
                              <div className="modal-content">
                                   <div className="modal-header">
                                        <h5 className="modal-title">Refund Service</h5>
                                        <button
                                             type="button"
                                             className="btn-close"
                                             onClick={() => setShowRefundModal(false)}
                                        />
                                   </div>
                                   <div className="modal-body">
                                        <div className="mb-3">
                                             <label htmlFor="refundReason" className="form-label">
                                                  Reason for Refund <span className="text-danger">*</span>
                                             </label>
                                             <select
                                                  id="refundReason"
                                                  className="form-select form-select-sm"
                                                  value={reasonType}
                                                  onChange={(e) => {
                                                       setReasonType(e.target.value);
                                                       setActionReason(e.target.value === 'Other' ? '' : e.target.value);
                                                  }}
                                             >
                                                  <option value="">-- Select a Reason --</option>
                                                  {refundReasons.map((reason) => (
                                                       <option key={reason} value={reason}>
                                                            {reason}
                                                       </option>
                                                  ))}
                                             </select>
                                        </div>
                                        {reasonType === 'Other' && (
                                             <div className="mb-3">
                                                  <label htmlFor="refundOtherReason" className="form-label">
                                                       Please Specify <span className="text-danger">*</span>
                                                  </label>
                                                  <textarea
                                                       id="refundOtherReason"
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
                                             onClick={() => setShowRefundModal(false)}
                                        >
                                             Cancel
                                        </button>
                                        <button
                                             type="button"
                                             className="btn btn-sm btn-outline-warning"
                                             onClick={confirmRefund}
                                             disabled={isLoading}
                                        >
                                             {isLoading ? 'Processing...' : 'Confirm Refund'}
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
