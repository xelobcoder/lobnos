import React, { useState, useEffect } from 'react';
import { Modal, Button, Badge, ListGroup } from 'react-bootstrap';
import { currencyFormatter, customPost } from '../../../../../components/Auth/customFetch';
import dayjs from 'dayjs';
import { useApplication } from '../../../../../components/Auth/useApplicationContext';
import { RiMoneyDollarCircleLine, RiWalletLine, RiCheckLine, RiCloseLine, RiFileList3Line, RiCalendarLine } from '@remixicon/react';

interface CommissionPaymentTransaction {
     id: number;
     commission_payment_id: number;
     amount_paid: string;
     trackid: number;
     paymentmode: number;
     paid_by: number;
     notes: string | null;
     created_at: string;
     paid_by_name: string;
     payment_mode_description: string;
}

interface CommissionPayment {
     id: number;
     serviceid: number;
     commission_due: string;
     total_amount_paid: string;
     type: string;
     status: string;
     created_at: string;
     updated_at: string;
     transactions: CommissionPaymentTransaction[];
}

interface PaymentMode {
     KeyID: number;
     PaymentMode: string;
}

interface CommissionDetailsModalProps {
     show: boolean;
     onHide: () => void;
     commissionPayments: CommissionPayment[];
     selectedRecord: any;
     loading: boolean;
     clinicianId: string;
     paymentModes: PaymentMode[];
     onPaymentSuccess?: () => void;
}

export default function CommissionDetailsModal({
     show,
     onHide,
     commissionPayments,
     selectedRecord,
     loading,
     clinicianId,
     paymentModes,
     onPaymentSuccess
}: CommissionDetailsModalProps) {
     const [paymentMode, setPaymentMode] = useState<number>(1);
     const [amountToPay, setAmountToPay] = useState('');
     const [amountDue, setAmountDue] = useState('');
     const [submittingPayment, setSubmittingPayment] = useState(false);
     const employeeid = useApplication()?.user?.employeeid;
     const role = useApplication()?.user?.role;

     // Set default payment mode when payment modes change
     useEffect(() => {
          if (paymentModes.length > 0) {
               setPaymentMode(paymentModes[0].KeyID);
          }
     }, [paymentModes]);

     // Set default amount to pay when commission payments change
     useEffect(() => {
          if (commissionPayments.length > 0) {
               const outstanding = commissionPayments.reduce((sum, p) => sum + (Number(p.commission_due) - Number(p.total_amount_paid)), 0);
               setAmountToPay(outstanding.toString());
               setAmountDue(outstanding.toString());
          } else if (selectedRecord) {
               // No payment records exist, set amount to full commission
               const commissionAmount = selectedRecord.commission_earned_by_paid_amount || '0';
               setAmountToPay(commissionAmount);
               setAmountDue(commissionAmount);
          }
     }, [commissionPayments, selectedRecord]);

     const handlePaymentSubmit = async () => {
          if (!selectedRecord || !amountToPay || !paymentMode) {
               alert('Please fill in all payment details');
               return;
          }

          if ((role === 'admin' || role === 'super-admin') && !amountDue) {
               alert('Please enter the amount due');
               return;
          }

          if (paymentModes.length === 0) {
               alert('Payment modes not available. Please try again later.');
               return;
          }

          setSubmittingPayment(true);
          try {

               const payload = {
                    serviceid: selectedRecord.serviceid,
                    commission_due: Number(amountDue),
                    amount_paid: Number(amountToPay),
                    type: "clinician",
                    trackid: clinicianId,
                    paymentmode: paymentMode,
                    paid_by: employeeid,
                    clinician_id: clinicianId
               };

               const url = `commission-payments`;
               const response = await customPost(url, 'POST', payload);

               if (response.status) {
                    alert(`Payment processed successfully!\nAmount Paid: ${currencyFormatter.format(Number(amountToPay))}\nPayment ID: ${response.data?.paymentId}`);
                    onPaymentSuccess?.();
                    onHide();
               } else {
                    alert(`Payment failed: ${response.message || 'Unknown error'}`);
               }
          } catch (error) {
               console.error('Payment error:', error);
               alert(`Payment processing failed: ${error.message}`);
          } finally {
               setSubmittingPayment(false);
          }
     };

     // Calculate outstanding amount
     const outstandingAmount = commissionPayments.reduce((sum, p) => sum + (Number(p.commission_due) - Number(p.total_amount_paid)), 0);
     const shouldShowPaymentForm = commissionPayments.length === 0 || outstandingAmount > 0;
     return (
          <Modal show={show} onHide={onHide} size="lg" backdrop="static">
               <Modal.Header closeButton>
                    <Modal.Title>
                         <RiMoneyDollarCircleLine size={20} className="me-2" />
                         Commission Payment Details
                    </Modal.Title>
               </Modal.Header>
               <Modal.Body>
                    {loading ? (
                         <div className="text-center py-4">
                              <div className="spinner-border text-primary" role="status">
                                   <span className="visually-hidden">Loading...</span>
                              </div>
                              <p className="mt-2">Loading commission details...</p>
                         </div>
                    ) : (
                         <>
                              {/* Service Summary */}
                              {selectedRecord && (
                                   <div className="mb-3">
                                        <h6 className="fw-bold mb-2">
                                             <RiFileList3Line size={18} className="me-2" />
                                             Service Information
                                        </h6>
                                        <div className="p-2 bg-light rounded">
                                             <div className="d-flex flex-wrap align-items-center gap-2">
                                                  <div>
                                                       <small className="text-muted">Service Date:</small>{' '}
                                                       <span className="fw-bold">{dayjs(selectedRecord.service_date).format('DD/MM/YYYY')}</span>
                                                  </div>
                                                  <span className="text-muted">||</span>
                                                  <div>
                                                       <small className="text-muted">Total Services:</small>{' '}
                                                       <span className="fw-bold">{selectedRecord.total_services}</span>
                                                  </div>
                                                  <span className="text-muted">||</span>
                                                  <div>
                                                       <small className="text-muted">Commission Earned:</small>{' '}
                                                       <span className="fw-bold text-success">
                                                            {currencyFormatter.format(Number(selectedRecord.commission_earned_by_paid_amount))}
                                                       </span>
                                                  </div>
                                                  <span className="text-muted">||</span>
                                                  <div>
                                                       <small className="text-muted">Commission Rate:</small>{' '}
                                                       <span className="fw-bold">{selectedRecord.commission_percent}%</span>
                                                  </div>
                                             </div>
                                        </div>
                                   </div>
                              )}

                              {/* Commission Payments */}
                              <div>
                                   <h6 className="fw-bold mb-2">
                                        <RiCalendarLine size={18} className="me-2" />
                                        Payment History
                                   </h6>
                                   {commissionPayments.length === 0 ? (
                                        <div className="text-center py-3 text-muted">
                                             <p className="mb-0">No payment records found for this service.</p>
                                        </div>
                                   ) : (
                                        <ListGroup variant="flush">
                                             {commissionPayments.map((payment) => (
                                                  <React.Fragment key={payment.id}>
                                                       <ListGroup.Item className="px-0 py-2">
                                                            <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
                                                                 <div className="d-flex flex-wrap gap-3">
                                                                      <div>
                                                                           <small className="text-muted d-block">Payment ID</small>
                                                                           <span className="fw-bold">#{payment.id}</span>
                                                                      </div>
                                                                      <div>
                                                                           <small className="text-muted d-block">Commission Due</small>
                                                                           <span className="fw-bold">{currencyFormatter.format(Number(payment.commission_due))}</span>
                                                                      </div>
                                                                      <div>
                                                                           <small className="text-muted d-block">Amount Paid As Commission</small>
                                                                           <span className="fw-bold text-success">{currencyFormatter.format(Number(payment.total_amount_paid))}</span>
                                                                      </div>
                                                                      <div>
                                                                           <small className="text-muted d-block">Type</small>
                                                                           <span className="text-capitalize">{payment.type}</span>
                                                                      </div>
                                                                      <div>
                                                                           <small className="text-muted d-block">Created</small>
                                                                           <span>{dayjs(payment.created_at).format('DD/MM/YYYY HH:mm')}</span>
                                                                      </div>
                                                                 </div>
                                                                 <div>
                                                                      <Badge
                                                                           bg={
                                                                                payment.status === 'paid' ? 'success' :
                                                                                     payment.status === 'pending' ? 'warning' :
                                                                                          payment.status === 'partial' ? 'info' : 'secondary'
                                                                           }
                                                                      >
                                                                           {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                                                                      </Badge>
                                                                 </div>
                                                            </div>

                                                            {/* Transactions */}
                                                            {Array.isArray(payment.transactions) && payment.transactions.length > 0 && (
                                                                 <div className="mt-2 pt-2 border-top">
                                                                      <small className="fw-bold text-muted">Transactions</small>
                                                                      <ListGroup variant="flush" className="mt-1">
                                                                           {payment.transactions.map((transaction) => (
                                                                                <ListGroup.Item key={transaction.id} className="px-0 py-1">
                                                                                     <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                                                                                          <div className="d-flex flex-wrap gap-3 small">
                                                                                               <div>
                                                                                                    <small className="text-muted">ID:</small> <span className="fw-bold">#{transaction.id}</span>
                                                                                               </div>
                                                                                               <div>
                                                                                                    <small className="text-muted">Date:</small> {dayjs(transaction.created_at).format('DD MMM YYYY, HH:mm')}
                                                                                               </div>
                                                                                               <div>
                                                                                                    <small className="text-muted">Amount:</small> <span className="fw-bold text-success">{currencyFormatter.format(Number(transaction.amount_paid))}</span>
                                                                                               </div>
                                                                                               <div>
                                                                                                    <small className="text-muted">Mode:</small> {transaction.payment_mode_description}
                                                                                               </div>
                                                                                               <div>
                                                                                                    <small className="text-muted">By:</small> {transaction.paid_by_name}
                                                                                               </div>
                                                                                               {transaction.notes && (
                                                                                                    <div>
                                                                                                         <small className="text-muted">Notes:</small> <span className="fst-italic">{transaction.notes}</span>
                                                                                                    </div>
                                                                                               )}
                                                                                          </div>
                                                                                     </div>
                                                                                </ListGroup.Item>
                                                                           ))}
                                                                      </ListGroup>
                                                                 </div>
                                                            )}
                                                       </ListGroup.Item>
                                                  </React.Fragment>
                                             ))}
                                        </ListGroup>
                                   )}
                              </div>

                              {/* Payment Summary */}
                              {commissionPayments.length > 0 && (
                                   <div className="mt-4 p-3 bg-light rounded">
                                        <h6 className="fw-bold mb-2">Payment Summary</h6>
                                        <div className="row g-3">
                                             <div className="col-md-4">
                                                  <small className="text-muted">Total Due</small>
                                                  <div className="fw-bold">
                                                       {currencyFormatter.format(
                                                            commissionPayments.reduce((sum, p) => sum + Number(p.commission_due), 0)
                                                       )}
                                                  </div>
                                             </div>
                                             <div className="col-md-4">
                                                  <small className="text-muted">Total Paid</small>
                                                  <div className="fw-bold text-success">
                                                       {currencyFormatter.format(
                                                            commissionPayments.reduce((sum, p) => sum + Number(p.total_amount_paid), 0)
                                                       )}
                                                  </div>
                                             </div>
                                             <div className="col-md-4">
                                                  <small className="text-muted">Outstanding</small>
                                                  <div className="fw-bold text-warning">
                                                       {currencyFormatter.format(outstandingAmount)}
                                                  </div>
                                             </div>
                                        </div>
                                   </div>
                              )}

                              {/* Payment Form - Show when no payments exist or there are outstanding payments */}
                              {shouldShowPaymentForm && (
                                   <div className="mt-3 border rounded p-2">
                                        <h6 className="fw-bold mb-2 text-primary" style={{ fontSize: '0.9rem' }}>
                                             <RiWalletLine size={18} className="me-2" />
                                             Make Payment
                                        </h6>
                                        <div className="d-flex justify-content-between align-items-center mt-2" style={{ gap: '0.5rem' }}>
                                             <label className="pls-label mb-0" style={{ fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                                                  <RiWalletLine size={16} className="me-1" />
                                                  Payment Mode
                                             </label>
                                             <select
                                                  value={paymentMode}
                                                  onChange={(e) => setPaymentMode(Number(e.target.value))}
                                                  disabled={paymentModes.length === 0}
                                                  className="form-select form-select-sm"
                                                  style={{ maxWidth: '300px', fontSize: '0.85rem' }}
                                             >
                                                  {paymentModes.length === 0 ? (
                                                       <option>Loading payment modes...</option>
                                                  ) : (
                                                       <>
                                                            <option value="">Select Payment Mode</option>
                                                            {paymentModes.map(mode => (
                                                                 <option key={mode.KeyID} value={mode.KeyID}>
                                                                      {mode.PaymentMode}
                                                                 </option>
                                                            ))}
                                                       </>
                                                  )}
                                             </select>
                                        </div>
                                        {(role === 'admin' || role === 'super-admin') && (
                                             <div className="d-flex justify-content-between align-items-center mt-2" style={{ gap: '0.5rem' }}>
                                                  <label className="pls-label mb-0" style={{ fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                                                       <RiMoneyDollarCircleLine size={16} className="me-1" />
                                                       Amount Due
                                                  </label>
                                                  <input
                                                       type="number"
                                                       value={amountDue}
                                                       onChange={(e) => setAmountDue(e.target.value)}
                                                       min="0"
                                                       step="0.01"
                                                       placeholder="Enter amount due"
                                                       className="form-control form-control-sm"
                                                       style={{ maxWidth: '300px', fontSize: '0.85rem' }}
                                                  />
                                             </div>
                                        )}
                                        <div className="d-flex justify-content-between align-items-center mt-2" style={{ gap: '0.5rem' }}>
                                             <label className="pls-label mb-0" style={{ fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                                                  <RiMoneyDollarCircleLine size={16} className="me-1" />
                                                  Amount to Pay {(role !== 'admin' && role !== 'super-admin') && <small className="text-muted">(Auto)</small>}
                                             </label>
                                             <input
                                                  type="number"
                                                  value={amountToPay}
                                                  onChange={(e) => setAmountToPay(e.target.value)}
                                                  min="0"
                                                  step="0.01"
                                                  placeholder="Enter amount"
                                                  readOnly={role !== 'admin' && role !== 'super-admin'}
                                                  className="form-control form-control-sm"
                                                  style={{ maxWidth: '300px', fontSize: '0.85rem' }}
                                             />
                                        </div>
                                        <div className="mt-2 d-flex justify-content-end">
                                             <Button
                                                  variant="outline-primary"
                                                  size="sm"
                                                  onClick={handlePaymentSubmit}
                                                  disabled={submittingPayment || !amountToPay || !paymentMode}
                                                  style={{ fontSize: '0.85rem' }}
                                             >
                                                  <RiCheckLine size={16} className="me-1" />
                                                  {submittingPayment ? 'Processing...' : 'Submit Payment'}
                                             </Button>
                                        </div>
                                   </div>
                              )}
                         </>
                    )}
               </Modal.Body>
               <Modal.Footer>
                    <Button variant="outline-danger" size="sm" onClick={onHide}>
                         <RiCloseLine size={16} className="me-1" />
                         Close
                    </Button>
               </Modal.Footer>
          </Modal>
     );
}