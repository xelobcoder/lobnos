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
     totalBillingTransactions: any[];
     expenseTransactions: any[];
     totalPayable: number;
     totalPaid: number;
     totalDiscount: number;
     totalOutstanding: number;
     totalCost: number;
     totalRefunded: number;
     totalbalance: number;
     totalExpense: number;
     expectedAmount: number;
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
}

export default function EndSessionModal({
     show,
     onHide,
     sessionId,
     openingAmount,
     onConfirm,
     isLoading,
     employeesList
}: EndSessionModalProps) {
     const [handoverAmount, setHandoverAmount] = useState('');
     const [validatedBy, setValidatedBy] = useState('');
     const [reason, setReason] = useState('');
     const [showReason, setShowReason] = useState(false);
     const [saving, setSaving] = useState(false);
     const [sessionSummary, setSessionSummary] = useState<HandingOverDetailsRequestResponse | null>(null);
     const branchid = useApplication().branchid;

     useEffect(() => {
          if (show && sessionId) {
               const fetchSalesSummary = async () => {
                    try {
                         const response: { sessionid: number, result: HandingOverDetailsRequestResponse } = await customFetch(`billing/load/session/${sessionId}/summary`);
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
          <Modal show={show} onHide={onHide} centered size="xl">
               <Modal.Header closeButton>
                    <Modal.Title>
                         End Session #{sessionId}
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
                                   {sessionSummary && (
                                        <a
                                             href={`/billing/sales/branches/${branchid ? plsEncryption(branchid.toString()) : ''}?from=${moment(sessionSummary.sessionDate).format('YYYY-MM-DD')}&to=${moment(sessionSummary.sessionDate).format('YYYY-MM-DD')}`}
                                             target="_blank"
                                             rel="noopener noreferrer"
                                             className="btn btn-link px-0 mb-2"
                                        >
                                             View all transactions for this session
                                        </a>
                                   )}
                                   <h6 className="mb-3 text-secondary">Session Summary</h6>
                                   <div className="row g-3">
                                        {/* ...existing summary grid... */}
                                        <div className="col-lg-2 col-md-4 col-6">
                                             <div className="border rounded p-3 bg-light">
                                                  <div className="small text-muted mb-1">Total Cost</div>
                                                  <div className="fw-bold">{currencyFormatter.format(Number(sessionSummary.totalCost))}</div>
                                             </div>
                                        </div>
                                        <div className="col-lg-2 col-md-4 col-6">
                                             <div className="border rounded p-3 bg-light">
                                                  <div className="small text-muted mb-1">Total Paid</div>
                                                  <div className="fw-bold">{currencyFormatter.format(Number(sessionSummary.totalPaid))}</div>
                                             </div>
                                        </div>
                                        <div className="col-lg-2 col-md-4 col-6">
                                             <div className="border rounded p-3 bg-light">
                                                  <div className="small text-muted mb-1">Outstanding</div>
                                                  <div className="fw-bold">{currencyFormatter.format(Number(sessionSummary.totalOutstanding))}</div>
                                             </div>
                                        </div>
                                        <div className="col-lg-2 col-md-4 col-6">
                                             <div className="border rounded p-3 bg-light">
                                                  <div className="small text-muted mb-1">Total Expense</div>
                                                  <div className="fw-bold">{currencyFormatter.format(Number(sessionSummary.totalExpense))}</div>
                                             </div>
                                        </div>
                                        <div className="col-lg-2 col-md-4 col-6">
                                             <div className="border rounded p-3 bg-light">
                                                  <div className="small text-muted mb-1">Expected Amount</div>
                                                  <div className="fw-bold">{currencyFormatter.format(Number(sessionSummary.expectedAmount))}</div>
                                             </div>
                                        </div>
                                        <div className="col-lg-2 col-md-4 col-6">
                                             <div className="border rounded p-3 bg-light">
                                                  <div className="small text-muted mb-1">Balance</div>
                                                  <div className="fw-bold">{currencyFormatter.format(Number(sessionSummary.totalbalance))}</div>
                                             </div>
                                        </div>
                                   </div>
                              </div>
                              <div className="mb-4">
                                   <h6 className="mb-3 text-secondary">Expense Records</h6>
                                   {Array.isArray(sessionSummary.expenseTransactions) && sessionSummary.expenseTransactions.length > 0 ? (
                                        <table className={styles.table}>
                                             <thead>
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
                                                  {sessionSummary.expenseTransactions.map((exp, idx) => (
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
                                   ) : <div className="text-muted">No expense records found.</div>}
                              </div>
                         </>
                    )}

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
                                        Number(handoverAmount) !== Number(sessionSummary.totalPayable) &&
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
               </Modal.Body>
               <Modal.Footer>
                    <Button variant="secondary" onClick={onHide} disabled={isLoading}>
                         Cancel
                    </Button>
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
               </Modal.Footer>
          </Modal>
     );
}
