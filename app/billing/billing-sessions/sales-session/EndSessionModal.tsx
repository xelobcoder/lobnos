"use client";
import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Spinner, Table, Accordion } from 'react-bootstrap';
import { currencyFormatter, customFetch, customPost } from '../../../../components/Auth/customFetch';
import moment from 'moment';
import { toast } from 'react-toastify';
import { useApplication } from '../../../../components/Auth/useApplicationContext';
import { plsEncryption } from '../../../../lib/encryption';
import styles from '../../../../styles/SmsTemplateList.module.css'

interface HandingOverDetailsRequestResponse {
     sessionId: number;
     sessionDate: string;
     sessionStartTime: string;
     sessionEndTime: string | null;
     totalExpensesTransactions: number;
     totalExpensePaymentsMade: string;
     billingTransactions: BillingTransaction[];
     netRevenue: number;
     expectedAmount: number;
     openingAmount: string;
     accruedRevenue: string;
     expenseRecordsDuringSession: any[];
     expensePaymentsMadeRecords: any[];
}

interface BillingTransaction {
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
}

interface Employee {
     employeeid: number;
     username: string;
}

interface EndSessionModalProps {
     show: boolean;
     onHide: () => void;
     sessionId: number;
     onConfirm: () => void;
     openingAmount: string;
     isLoading: boolean;
     employeesList: Employee[];
     isSessionEnded?: boolean;
}

export default function EndSessionModal({
     show,
     onHide,
     sessionId,
     openingAmount,
     onConfirm,
     isLoading,
     employeesList,
     isSessionEnded = false
}: EndSessionModalProps) {
     const [handoverAmount, setHandoverAmount] = useState('');
     const [validatedBy, setValidatedBy] = useState('');
     const [reason, setReason] = useState('');
     const [showReason, setShowReason] = useState(false);
     const [saving, setSaving] = useState(false);
     const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
     const [transactionServices, setTransactionServices] = useState<{ [key: number]: any[] }>({});
     const [loadingServices, setLoadingServices] = useState<Set<number>>(new Set());
     const [sessionSummary, setSessionSummary] = useState<HandingOverDetailsRequestResponse | null>(null);
     const employeeid = useApplication()?.user?.employeeid;
     const branchid = useApplication()?.branchid;

     const toggleRowExpansion = async (billingid: number) => {
          const isExpanded = expandedRows.has(billingid);
          if (!isExpanded && !transactionServices[billingid]) {
               // Fetch services if not already loaded
               setLoadingServices(prev => new Set(prev).add(billingid));
               const services = await loadTransactionsServices(billingid);
               if (services && services.result) {
                    setTransactionServices(prev => ({ ...prev, [billingid]: services.result }));
               }
               setLoadingServices(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(billingid);
                    return newSet;
               });
          }
          setExpandedRows(prev => {
               const newSet = new Set(prev);
               if (newSet.has(billingid)) {
                    newSet.delete(billingid);
               } else {
                    newSet.add(billingid);
               }
               return newSet;
          });
     };


     const loadTransactionsServices = async (billingid: number) => {
          try {
               if (!billingid) return;
               const url = `billing/information/single?billingid=${billingid}&employeeid=${employeeid}&branchid=${branchid}`;
               const response = await customFetch(url);
               return response;
          } catch (err) {
               console.error('Failed to load transaction breakdown:', err);
          }
     }
     useEffect(() => {
          if (show && sessionId) {
               const fetchSalesSummary = async () => {
                    try {
                         const response: { sessionid: number, result: HandingOverDetailsRequestResponse } = await customFetch(`billing/load/session/${sessionId}/summary?branchid=${branchid}&&employeeid=${employeeid}`);
                         if (response.sessionid && response.result) {
                              setSessionSummary(response.result);
                         }
                    } catch (err) {
                         console.error('Failed to fetch sales summary:', err);
                    }
               };
               fetchSalesSummary();
          }
     }, [show, sessionId]);

     const handleSubmit = async () => {
          setSaving(true);
          try {
               const amount = parseFloat(handoverAmount);
               const validator = parseInt(validatedBy, 10);
               if (!isNaN(amount) && !isNaN(validator)) {
                    if (
                         sessionSummary &&
                         Number(amount) !== Number(sessionSummary.expectedAmount) &&
                         reason.trim() === ''
                    ) {
                         setShowReason(true);
                         toast.error('Please provide a reason for the difference in amount.');
                         setSaving(false);
                         return;
                    }
                    setShowReason(false);
                    onConfirm();
               }

               const responseEndSession = await customPost(`billing/sales/session/endsession`, 'PUT',
                    { handingoveramount: amount, validatedby: validator, sessionId, reason })

               if (responseEndSession && responseEndSession.status) {
                    toast.success("Session Ended Successfully")
               } else {
                    toast.error('Ending Session Failed')
               }
          } catch (err) {
               toast.error('Something wrong occurred');
          } finally {
               setSaving(false);
          }
     };

     return (
          <Modal show={show} onHide={onHide} centered fullscreen>
               <Modal.Header closeButton>
                    <Modal.Title>
                         {isSessionEnded ? 'Session Details' : 'End Session'} #{sessionId}
                         {sessionSummary && (
                              <span className="ms-3 small text-muted">
                                   ||
                                   Start: {moment(sessionSummary.sessionStartTime, 'HH:mm:ss').format('hh:mm A')} |
                                   Date: {moment(sessionSummary.sessionDate).format('ll')}
                                   ||
                                   Opening Amount: {currencyFormatter.format(Number(openingAmount || 0))}
                              </span>
                         )}
                    </Modal.Title>
               </Modal.Header>
               <Modal.Body>
                    {sessionSummary && (
                         <>
                              <div className="mb-4">
                                   <h6 className="mb-3 text-secondary">Session Summary</h6>
                                   <div className="row g-3">
                                        <div className="col-lg-2 col-md-4 col-6">
                                             <div className="border rounded p-3 bg-light">
                                                  <div className="small text-muted mb-1">Opening Amount</div>
                                                  <div className="fw-bold">{currencyFormatter.format(Number(sessionSummary.openingAmount))}</div>
                                             </div>
                                        </div>
                                        <div className="col-lg-2 col-md-4 col-6">
                                             <div className="border rounded p-3 bg-light">
                                                  <div className="small text-muted mb-1">Accrued Revenue</div>
                                                  <div className="fw-bold">{currencyFormatter.format(Number(sessionSummary.accruedRevenue))}</div>
                                             </div>
                                        </div>
                                        <div className="col-lg-2 col-md-4 col-6">
                                             <div className="border rounded p-3 bg-light">
                                                  <div className="small text-muted mb-1">Net Revenue</div>
                                                  <div className="fw-bold">{currencyFormatter.format(Number(sessionSummary.netRevenue))}</div>
                                             </div>
                                        </div>
                                        <div className="col-lg-2 col-md-4 col-6">
                                             <div className="border rounded p-3 bg-light">
                                                  <div className="small text-muted mb-1">Total Expenses</div>
                                                  <div className="fw-bold">{currencyFormatter.format(Number(sessionSummary.totalExpensesTransactions))}</div>
                                             </div>
                                        </div>
                                        <div className="col-lg-2 col-md-4 col-6">
                                             <div className="border rounded p-3 bg-light">
                                                  <div className="small text-muted mb-1">Expense Payments</div>
                                                  <div className="fw-bold">{currencyFormatter.format(Number(sessionSummary.totalExpensePaymentsMade))}</div>
                                             </div>
                                        </div>
                                        <div className="col-lg-2 col-md-4 col-6">
                                             <div className="border rounded p-3 bg-light">
                                                  <div className="small text-muted mb-1">Expected Amount</div>
                                                  <div className="fw-bold">{currencyFormatter.format(Number(sessionSummary.expectedAmount))}</div>
                                             </div>
                                        </div>
                                   </div>
                              </div>
                              <div className="mb-4">
                                   <h6 className="mb-3 text-secondary">Billing Transactions</h6>
                                   {Array.isArray(sessionSummary.billingTransactions) && sessionSummary.billingTransactions.length > 0 ? (
                                        <div className="table-responsive">
                                             <table className={`table table-sm table-hover ${styles.table}`}>
                                                  <thead className="table-light">
                                                       <tr>
                                                            <th>Billing ID</th>
                                                            <th>Total Cost</th>
                                                            <th>Paid</th>
                                                            <th>Outstanding</th>
                                                            <th>Discount</th>
                                                            <th>Refunded</th>
                                                            <th>Balance</th>
                                                            <th>Payable</th>
                                                            <th>Tax Incurred</th>
                                                            <th>Billed On</th>
                                                            <th>Status</th>
                                                            <th>Actions</th>
                                                       </tr>
                                                  </thead>
                                                  <tbody>
                                                       {sessionSummary.billingTransactions.map((tx, idx) => (
                                                            <React.Fragment key={idx}>
                                                                 <tr>
                                                                      <td>{tx.billingid}</td>
                                                                      <td>{currencyFormatter.format(Number(tx.totalTransactionCost))}</td>
                                                                      <td>{currencyFormatter.format(Number(tx.paid))}</td>
                                                                      <td>{currencyFormatter.format(Number(tx.outstanding))}</td>
                                                                      <td>{currencyFormatter.format(Number(tx.discount))}</td>
                                                                      <td>{currencyFormatter.format(Number(tx.totalrefunded))}</td>
                                                                      <td>{currencyFormatter.format(Number(tx.balance))}</td>
                                                                      <td>{currencyFormatter.format(Number(tx.payable))}</td>
                                                                      <td>{currencyFormatter.format(Number(tx.amountIncurredDueTax))}</td>
                                                                      <td>{moment(tx.billedon).format('ll HH:mm')}</td>
                                                                      <td>{tx.status}</td>
                                                                      <td>
                                                                           <Button
                                                                                variant="outline-primary"
                                                                                size="sm"
                                                                                onClick={() => toggleRowExpansion(tx.billingid)}
                                                                           >
                                                                                {expandedRows.has(tx.billingid) ? 'Hide' : 'View'} Breakdown
                                                                           </Button>
                                                                      </td>
                                                                 </tr>
                                                                 {expandedRows.has(tx.billingid) && (
                                                                      <tr>
                                                                           <td colSpan={12} className='bg-secondary-subtle border-light-subtle'>
                                                                                <div className="p-3">
                                                                                     <h6 className="mb-3">Transaction Breakdown for Billing ID: {tx.billingid}</h6>
                                                                                     <div className="row g-3">
                                                                                          <div className="col-md-4">
                                                                                               <strong>Patient ID:</strong> {tx.patientid}
                                                                                          </div>
                                                                                          <div className="col-md-4">
                                                                                               <strong>Year/Month/Day:</strong> {tx.year}/{tx.month}/{tx.day}
                                                                                          </div>
                                                                                          <div className="col-md-4">
                                                                                               <strong>Branch ID:</strong> {tx.branchid}
                                                                                          </div>
                                                                                          <div className="col-md-4">
                                                                                               <strong>Is Promo:</strong> {tx.isPromo ? 'Yes' : 'No'}
                                                                                          </div>
                                                                                          <div className="col-md-4">
                                                                                               <strong>Promo Value:</strong> {currencyFormatter.format(Number(tx.promoValue))}
                                                                                          </div>
                                                                                          <div className="col-md-4">
                                                                                               <strong>Promo Method:</strong> {tx.promoMethod || 'N/A'}
                                                                                          </div>
                                                                                          <div className="col-md-4">
                                                                                               <strong>Promo Code ID:</strong> {tx.promoCodeId || 'N/A'}
                                                                                          </div>
                                                                                          <div className="col-md-4">
                                                                                               <strong>Is Adjustment:</strong> {tx.isAdjustment ? 'Yes' : 'No'}
                                                                                          </div>
                                                                                          <div className="col-md-4">
                                                                                               <strong>Adjusted By:</strong> {tx.adjustedBy || 'N/A'}
                                                                                          </div>
                                                                                          <div className="col-md-4">
                                                                                               <strong>Adjustment Reason:</strong> {tx.adjustmentReason || 'N/A'}
                                                                                          </div>
                                                                                          <div className="col-md-4">
                                                                                               <strong>Adjustment Type:</strong> {tx.adjustmentType || 'N/A'}
                                                                                          </div>
                                                                                          <div className="col-md-4">
                                                                                               <strong>Is Locked:</strong> {tx.islocked ? 'Yes' : 'No'}
                                                                                          </div>
                                                                                          <div className="col-md-4">
                                                                                               <strong>Adjustment Date:</strong> {tx.adjustmentdate ? moment(tx.adjustmentdate).format('ll HH:mm') : 'N/A'}
                                                                                          </div>
                                                                                          <div className="col-md-4">
                                                                                               <strong>Adjustment Amount:</strong> {tx.adjustmentamount ? currencyFormatter.format(Number(tx.adjustmentamount)) : 'N/A'}
                                                                                          </div>
                                                                                          <div className="col-md-4">
                                                                                               <strong>Write-off:</strong> {currencyFormatter.format(Number(tx.writeoff))}
                                                                                          </div>
                                                                                          <div className="col-md-4">
                                                                                               <strong>Last Updated:</strong> {moment(tx.lastupdated).format('ll HH:mm')}
                                                                                          </div>
                                                                                          <div className="col-md-4">
                                                                                               <strong>Additional Info:</strong> {tx.additionalinformation || 'N/A'}
                                                                                          </div>
                                                                                     </div>
                                                                                     {loadingServices.has(tx.billingid) ? (
                                                                                          <div className="d-flex justify-content-center align-items-center mt-3">
                                                                                               <Spinner animation="border" size="sm" className="me-2" />
                                                                                               <span>Loading services...</span>
                                                                                          </div>
                                                                                     ) : transactionServices[tx.billingid] && transactionServices[tx.billingid].length > 0 ? (
                                                                                          <>
                                                                                               <hr />
                                                                                               <h6 className="mb-3">Services Breakdown</h6>
                                                                                               <div className="table-responsive">
                                                                                                    <table className="table table-sm table-borderless">
                                                                                                         <thead>
                                                                                                              <tr>
                                                                                                                   <th>Service Name</th>
                                                                                                                   <th>Service Added On</th>
                                                                                                                   <th>Cost</th>
                                                                                                                   <th>Total Cost</th>
                                                                                                                   <th>Total Payable</th>
                                                                                                                   <th>Tax</th>
                                                                                                                   <th>Discount</th>
                                                                                                                   <th>Status</th>
                                                                                                                   <th>Amount Refunded</th>
                                                                                                                   <th>Outstanding</th>
                                                                                                                   <th>Time Based Adjustment</th>
                                                                                                              </tr>
                                                                                                         </thead>
                                                                                                         <tbody>
                                                                                                              {transactionServices[tx.billingid].map((service, idx) => (
                                                                                                                   <tr key={idx}>
                                                                                                                        <td>{service.name}</td>
                                                                                                                        <td>{service.serviceAddedOn ? moment(service.serviceAddedOn).format('ll HH:mm') : '-'}</td>
                                                                                                                        <td>{currencyFormatter.format(Number(service.cost))}</td>
                                                                                                                        <td>{currencyFormatter.format(Number(service.totalcost))}</td>
                                                                                                                        <td>{currencyFormatter.format(Number(service.totalpayable))}</td>
                                                                                                                        <td>{currencyFormatter.format(Number(service.taxValue))}</td>
                                                                                                                        <td>{currencyFormatter.format(Number(service.discount))}</td>
                                                                                                                        <td>
                                                                                                                             <span className={`badge ${service.status === 'active' ? 'bg-success' : 'bg-secondary'}`}>
                                                                                                                                  {service.status}
                                                                                                                             </span>
                                                                                                                        </td>
                                                                                                                        <td>{currencyFormatter.format(Number(service.amountRefunded))}</td>
                                                                                                                        <td>{currencyFormatter.format(Number(service.outstanding))}</td>
                                                                                                                        <td>
                                                                                                                             {service.hasNightAdjustment ?
                                                                                                                                  `${currencyFormatter.format(Number(service.nightAdjustmentValue))} (${service.nightAdjustmentMode})`
                                                                                                                                  : 'No'
                                                                                                                             }
                                                                                                                        </td>
                                                                                                                   </tr>
                                                                                                              ))}
                                                                                                         </tbody>
                                                                                                    </table>
                                                                                               </div>
                                                                                          </>
                                                                                     ) : null}
                                                                                </div>
                                                                           </td>
                                                                      </tr>
                                                                 )}
                                                            </React.Fragment>
                                                       ))}
                                                  </tbody>
                                             </table>
                                        </div>
                                   ) : <div className="text-muted">No billing transactions found.</div>}
                              </div>
                              <div className="mb-4">
                                   <h6 className="mb-3 text-secondary">Expense Records</h6>
                                   {Array.isArray(sessionSummary.expenseRecordsDuringSession) && sessionSummary.expenseRecordsDuringSession.length > 0 ? (
                                        <div className="table-responsive">
                                             <table className={`table table-sm table-hover ${styles.table}`}>
                                                  <thead className="table-light">
                                                       <tr>
                                                            <th>ID</th>
                                                            <th>Name</th>
                                                            <th>Amount</th>
                                                            <th>Merchant</th>
                                                            <th>Date</th>
                                                            <th>Description</th>
                                                       </tr>
                                                  </thead>
                                                  <tbody>
                                                       {sessionSummary.expenseRecordsDuringSession.map((exp, idx) => (
                                                            <tr key={idx}>
                                                                 <td>{exp.id}</td>
                                                                 <td>{exp.name}</td>
                                                                 <td>{currencyFormatter.format(Number(exp.amount))}</td>
                                                                 <td>{exp.merchant}</td>
                                                                 <td>{exp.date ? moment(exp.date).format('ll HH:mm') : '-'}</td>
                                                                 <td>{exp.description}</td>
                                                            </tr>
                                                       ))}
                                                  </tbody>
                                             </table>
                                        </div>
                                   ) : <div className="text-muted">No expense records found.</div>}
                              </div>
                              <div className="mb-4">
                                   <h6 className="mb-3 text-secondary">Expense Payments Made</h6>
                                   {Array.isArray(sessionSummary.expensePaymentsMadeRecords) && sessionSummary.expensePaymentsMadeRecords.length > 0 ? (
                                        <div className="table-responsive">
                                             <table className={`table table-sm table-hover ${styles.table}`}>
                                                  <thead className="table-light">
                                                       <tr>
                                                            <th>ID</th>
                                                            <th>Name</th>
                                                            <th>description</th>
                                                            <th>Amount</th>
                                                            <th>Merchant Name</th>
                                                            <th>Paid By</th>
                                                            <th>Date</th>
                                                            <th>Method</th>
                                                       </tr>
                                                  </thead>
                                                  <tbody>
                                                       {sessionSummary.expensePaymentsMadeRecords.map((exp, idx) => (
                                                            <tr key={idx}>
                                                                 <td>{exp.id}</td>
                                                                 <td>{exp.name}</td>
                                                                 <td>{exp.description}</td>
                                                                 <td>{currencyFormatter.format(Number(exp.amount))}</td>
                                                                 <td>{exp.name}</td>
                                                                 <td>{exp.paid_by}</td>
                                                                 <td>{exp.payment_date ? moment(exp.payment_date).format('ll HH:mm') : '-'}</td>
                                                                 <td>{exp.method}</td>
                                                            </tr>
                                                       ))}
                                                  </tbody>
                                             </table>
                                        </div>
                                   ) : <div className="text-muted">No expense payments found.</div>}
                              </div>
                         </>
                    )}

                    {!isSessionEnded && (
                         <div className="row">
                              <div className="col-md-6">
                                   <div className="border rounded p-3">
                                        <h6 className="mb-3 text-secondary">Handover Details</h6>
                                        <Form.Group className="mb-3">
                                             <Form.Label>Handover Amount</Form.Label>
                                             <Form.Control
                                                  type="number"
                                                  value={handoverAmount}
                                                  onChange={(e) => setHandoverAmount(e.target.value)}
                                                  placeholder="Enter actual amount"
                                                  required
                                             />
                                        </Form.Group>

                                        <Form.Group className="mb-3">
                                             <Form.Label>Validated By</Form.Label>
                                             <Form.Select
                                                  value={validatedBy}
                                                  onChange={(e) => setValidatedBy(e.target.value)}
                                                  required
                                             >
                                                  <option value="">Select Employee</option>
                                                  {Array.isArray(employeesList) && employeesList.map((emp) => (
                                                       <option key={emp.employeeid} value={emp.employeeid}>
                                                            {emp.username}
                                                       </option>
                                                  ))}
                                             </Form.Select>
                                        </Form.Group>

                                        {sessionSummary &&
                                             handoverAmount !== '' &&
                                             !isNaN(Number(handoverAmount)) &&
                                             Number(handoverAmount) !== Number(sessionSummary.expectedAmount) &&
                                             showReason && (
                                                  <Form.Group className="mb-0">
                                                       <Form.Label className="text-danger fw-semibold">
                                                            Reason for difference (required):
                                                       </Form.Label>
                                                       <Form.Control
                                                            as="textarea"
                                                            rows={2}
                                                            value={reason}
                                                            onChange={e => setReason(e.target.value)}
                                                            required
                                                       />
                                                  </Form.Group>
                                             )}
                                   </div>
                              </div>
                         </div>
                    )}
               </Modal.Body>
               <Modal.Footer>
                    <Button variant="secondary" onClick={onHide} disabled={isLoading}>
                         {isSessionEnded ? 'Close' : 'Cancel'}
                    </Button>
                    {!isSessionEnded && (
                         <Button
                              variant="primary"
                              onClick={handleSubmit}
                              disabled={saving || isLoading || !handoverAmount || !validatedBy}
                         >
                              {saving ? (
                                   <>
                                        <Spinner
                                             as="span"
                                             animation="border"
                                             size="sm"
                                             role="status"
                                             className="me-2"
                                        />
                                        Saving...
                                   </>
                              ) : (
                                   'Confirm & End Session'
                              )}
                         </Button>
                    )}
               </Modal.Footer>
          </Modal>
     );
}
