import React, { useState, useEffect } from 'react';
import { Modal, Button, Badge, ListGroup } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { currencyFormatter, customPost } from '../../../../../components/Auth/customFetch';
import dayjs from 'dayjs';
import { useApplication } from '../../../../../components/Auth/useApplicationContext';
import { RiMoneyDollarCircleLine, RiWalletLine, RiCheckLine, RiCloseLine, RiFileList3Line, RiCalendarLine, RiArrowUpDownLine } from '@remixicon/react';

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
     batch_payment_id: number;
     serviceid: number;
     commission_due: string;
     amount_allocated: string;
     waived_amount: string;
     status: string;
     created_at: string;
     commission_percentage: string;
     type: string;
     recipient_id: number;
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
     useEffect(() => {
          if (paymentModes.length > 0) {
               setPaymentMode(paymentModes[0].KeyID);
          }
     }, [paymentModes]);

     useEffect(() => {
          if (commissionPayments.length > 0) {
               const outstanding = commissionPayments.reduce((sum, p) => sum + (Number(p.commission_due) - Number(p.amount_allocated)), 0);
               setAmountToPay(outstanding.toString());
               setAmountDue(outstanding.toString());
          } else if (selectedRecord) {
               const commissionAmount = selectedRecord.commission_earned || '0';
               setAmountToPay(commissionAmount);
               setAmountDue(commissionAmount);
          }
     }, [commissionPayments, selectedRecord]);

     const handlePaymentSubmit = async () => {
          if (!selectedRecord || !amountToPay || !paymentMode) {
               toast.error('Please fill in all payment details');
               return;
          }

          if ((role === 'admin' || role === 'super-admin') && !amountDue) {
               toast.error('Please enter the amount due');
               return;
          }

          if (paymentModes.length === 0) {
               toast.error('Payment modes not available. Please try again later.');
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

               if (response && (response.success || response.status === true || response.status === 'success')) {
                    toast.success(`Payment processed successfully! Amount Paid: ${currencyFormatter.format(Number(amountToPay))}`);
                    onPaymentSuccess?.();
                    onHide();
               } else {
                    toast.error(`Payment failed: ${response?.message || 'Unknown error'}`);
               }
          } catch (error) {
               console.error('Payment error:', error);
               toast.error(`Payment processing failed: ${error.message}`);
          } finally {
               setSubmittingPayment(false);
          }
     };

     const outstandingAmount = commissionPayments.reduce((sum, p) => sum + (Number(p.commission_due) - Number(p.amount_allocated)), 0);
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
                              {selectedRecord && (
                                   <div className="mb-3">
                                        <h6 className="fw-bold mb-2">
                                             <RiFileList3Line size={18} className="me-2" />
                                             Service Information
                                        </h6>
                                        <div className="p-2 bg-body-tertiary rounded">
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
                                                       <small className="text-muted">Total Payable:</small>{' '}
                                                       <span className="fw-bold">{currencyFormatter.format(Number(selectedRecord.total_payable))}</span>
                                                  </div>
                                                  <span className="text-muted">||</span>
                                                  <div>
                                                       <small className="text-muted">Total Paid:</small>{' '}
                                                       <span className="fw-bold">{currencyFormatter.format(Number(selectedRecord.total_paid))}</span>
                                                  </div>
                                                  <span className="text-muted">||</span>
                                                  <div>
                                                       <small className="text-muted">Commission Earned:</small>{' '}
                                                       <span className="fw-bold text-success">
                                                            {currencyFormatter.format(Number(selectedRecord.commission_earned))}
                                                       </span>
                                                  </div>
                                             </div>
                                        </div>
                                   </div>
                              )}

                              <hr className="my-3" />

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
                                                                           <small className="text-muted d-block">Batch Payment ID</small>
                                                                           <span className="fw-bold">#{payment.batch_payment_id}</span>
                                                                      </div>
                                                                      <div>
                                                                           <small className="text-muted d-block">Commission Due</small>
                                                                           <span className="fw-bold">{currencyFormatter.format(Number(payment.commission_due))}</span>
                                                                      </div>
                                                                      <div>
                                                                           <small className="text-muted d-block">Amount Allocated</small>
                                                                           <span className="fw-bold text-success">{currencyFormatter.format(Number(payment.amount_allocated))}</span>
                                                                      </div>
                                                                      <div>
                                                                           <small className="text-muted d-block">Waived Amount</small>
                                                                           <span className="fw-bold text-warning">{currencyFormatter.format(Number(payment.waived_amount))}</span>
                                                                      </div>
                                                                      <div>
                                                                           <small className="text-muted d-block">Commission %</small>
                                                                           <span className="fw-bold">{payment.commission_percentage}%</span>
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
                                                       </ListGroup.Item>
                                                  </React.Fragment>
                                             ))}
                                        </ListGroup>
                                   )}
                              </div>

                              <hr className="my-3" />

                              {commissionPayments.length > 0 && (
                                   <div className="mt-3 p-2 bg-body-tertiary rounded">
                                        <h6 className="fw-bold mb-2">Payment Summary</h6>
                                        <div className="d-flex flex-wrap align-items-center gap-2">
                                             <div>
                                                  <small className="text-muted">Total Due:</small>{' '}
                                                  <span className="fw-bold">
                                                       {currencyFormatter.format(
                                                            commissionPayments.reduce((sum, p) => sum + Number(p.commission_due), 0)
                                                       )}
                                                  </span>
                                             </div>
                                             <span className="text-muted">||</span>
                                             <div>
                                                  <small className="text-muted">Total Paid:</small>{' '}
                                                  <span className="fw-bold text-success">
                                                       {currencyFormatter.format(
                                                            commissionPayments.reduce((sum, p) => sum + Number(p.amount_allocated), 0)
                                                       )}
                                                  </span>
                                             </div>
                                             <span className="text-muted">||</span>
                                             <div>
                                                  <small className="text-muted">Outstanding:</small>{' '}
                                                  <span className="fw-bold text-warning">
                                                       {currencyFormatter.format(outstandingAmount)}
                                                  </span>
                                             </div>
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