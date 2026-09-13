'use client';

import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Modal, Form, Spinner, Badge, Nav, Tab } from 'react-bootstrap';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import {
     RiHandCoinLine,
     RiUserHeartLine,
     RiFileList3Line,
     RiGroupLine,
     RiCheckLine,
     RiCloseLine,
     RiHistoryLine,
     RiEditLine,
     RiSearchLine,
     RiRefreshLine
} from '@remixicon/react';
import { currencyFormatter, customFetch, customPost } from '../../../components/Auth/customFetch';
import { useApplication } from '../../../components/Auth/useApplicationContext';

export default function StaffFocManagementPage() {
     const user = useApplication()?.user;
     const router = useRouter();
     const employeeid = user?.employeeid;
     const normalizedRole = (user?.role || '').toLowerCase().trim().replace(/_/g, '-');
     const canAccess = ['admin', 'super-admin', 'superadmin', 'accountant'].includes(normalizedRole);
     const isAdmin = canAccess;

     useEffect(() => {
          if (user && !canAccess) router.replace('/unauthorized');
     }, [canAccess, router, user]);

     const [activeTab, setActiveTab] = useState('accounts');
     const [loading, setLoading] = useState(true);

     // Summary Report State
     const [summary, setSummary] = useState<any>({
          totalFocValue: 0,
          totalTransactions: 0,
          totalStaffBeneficiaries: 0,
          totalPatientsServed: 0,
     });

     // Accounts State
     const [accounts, setAccounts] = useState<any[]>([]);
     const [searchAccount, setSearchAccount] = useState('');
     const [editLimitModal, setEditLimitModal] = useState<{ show: boolean; staff: any | null }>({ show: false, staff: null });
     const [newLimitInput, setNewLimitInput] = useState('');
     const [isUpdatingLimit, setIsUpdatingLimit] = useState(false);

     // Transactions State
     const [transactions, setTransactions] = useState<any[]>([]);
     const [txStatusFilter, setTxStatusFilter] = useState('');
     const [actionLoading, setActionLoading] = useState<number | null>(null);

     const currentYear = new Date().getFullYear();

     const fetchFocSummary = async () => {
          try {
               const res = await customFetch(`foc/reports/summary?year=${currentYear}&requesterEmployeeid=${employeeid}`);
               if (res?.result) setSummary(res.result);
          } catch {
               // Ignore non-fatal
          }
     };

     const fetchAccounts = async () => {
          try {
               setLoading(true);
               const res = await customFetch(`foc/accounts?year=${currentYear}&search=${encodeURIComponent(searchAccount)}&count=50&employeeid=${employeeid}`);
               if (res?.result?.accounts) setAccounts(res.result.accounts);
          } catch {
               toast.error('Failed to load staff FOC accounts.');
          } finally {
               setLoading(false);
          }
     };

     const fetchTransactions = async () => {
          try {
               setLoading(true);
               const statusQuery = txStatusFilter ? `&status=${txStatusFilter}` : '';
               const res = await customFetch(`foc/transactions?year=${currentYear}${statusQuery}&count=50&requesterEmployeeid=${employeeid}`);
               if (res?.result?.transactions) setTransactions(res.result.transactions);
          } catch {
               toast.error('Failed to load FOC transactions.');
          } finally {
               setLoading(false);
          }
     };

     useEffect(() => {
          if (!canAccess || !employeeid) return;
          fetchFocSummary();
          if (activeTab === 'accounts') fetchAccounts();
          if (activeTab === 'transactions') fetchTransactions();
     }, [activeTab, canAccess, employeeid, txStatusFilter]);

     const handleUpdateLimit = async () => {
          if (!editLimitModal.staff || !newLimitInput) return;
          const limitVal = parseFloat(newLimitInput);
          if (isNaN(limitVal) || limitVal < 0) {
               toast.error('Please enter a valid limit amount.');
               return;
          }

          try {
               setIsUpdatingLimit(true);
               const res = await customPost(`foc/accounts/staff/${editLimitModal.staff.employeeid}/limit`, 'PUT', {
                    employeeid,
                    newLimit: limitVal,
                    year: currentYear
               });

               if (res?.status === 'success') {
                    toast.success(`FOC Limit updated for ${editLimitModal.staff.staff_name || 'Staff'}`);
                    setEditLimitModal({ show: false, staff: null });
                    fetchAccounts();
               } else {
                    toast.error(res?.message || 'Failed to update limit.');
               }
          } catch {
               toast.error('Error updating staff limit.');
          } finally {
               setIsUpdatingLimit(false);
          }
     };

     const handleApproveTx = async (txId: number) => {
          try {
               setActionLoading(txId);
               const res = await customPost(`foc/transactions/${txId}/approve`, 'POST', {
                    employeeid,
                    approverEmployeeId: employeeid
               });
               if (res?.status === 'success') {
                    toast.success('FOC transaction approved.');
                    fetchTransactions();
                    fetchFocSummary();
               } else {
                    toast.error(res?.message || 'Failed to approve FOC transaction.');
               }
          } catch {
               toast.error('Error approving FOC transaction.');
          } finally {
               setActionLoading(null);
          }
     };

     const handleReverseTx = async (txId: number) => {
          const reason = prompt('Enter reason for reversing this Staff FOC transaction:');
          if (!reason) return;

          try {
               setActionLoading(txId);
               const res = await customPost(`foc/transactions/${txId}/reverse`, 'POST', {
                    employeeid,
                    revokerEmployeeId: employeeid,
                    reason
               });
               if (res?.status === 'success') {
                    toast.success('FOC transaction reversed & balance restored.');
                    fetchTransactions();
                    fetchFocSummary();
               } else {
                    toast.error(res?.message || 'Failed to reverse transaction.');
               }
          } catch {
               toast.error('Error reversing transaction.');
          } finally {
               setActionLoading(null);
          }
     };

     if (!user || !canAccess) return null;

     return (
          <Container fluid className="p-3">
               {/* Header Title */}
               <div className="d-flex justify-content-between align-items-center mb-3">
                    <div>
                         <h4 className="fw-bold mb-1 d-flex align-items-center gap-2">
                              <RiHandCoinLine className="text-primary" size={28} /> Staff Free-of-Charge (FOC) Benefit Management
                         </h4>
                         <p className="text-muted text-xs mb-0">
                              Monitor staff medical allowances, approve FOC requests, adjust annual limits, and track usage ledgers.
                         </p>
                    </div>
                    <Button
                         variant="outline-secondary"
                         size="sm"
                         className="d-flex align-items-center gap-1"
                         onClick={() => {
                              fetchFocSummary();
                              if (activeTab === 'accounts') fetchAccounts();
                              if (activeTab === 'transactions') fetchTransactions();
                         }}
                    >
                         <RiRefreshLine size={16} /> Refresh
                    </Button>
               </div>

               {/* Executive Summary Analytics Cards */}
               <Row className="g-3 mb-4">
                    <Col md={3} sm={6}>
                         <Card className="border-0 shadow-sm bg-primary bg-gradient text-white rounded-3">
                              <Card.Body className="p-3">
                                   <div className="d-flex justify-content-between align-items-center mb-1">
                                        <span className="text-xs text-uppercase fw-semibold opacity-75">FOC Value ({currentYear})</span>
                                        <RiHandCoinLine size={22} className="opacity-75" />
                                   </div>
                                   <h3 className="fw-bold mb-0">₵{currencyFormatter.format(summary.totalFocValue)}</h3>
                                   <span className="text-xs opacity-75">Gross medical benefit disbursed</span>
                              </Card.Body>
                         </Card>
                    </Col>

                    <Col md={3} sm={6}>
                         <Card className="border-0 shadow-sm bg-success bg-gradient text-white rounded-3">
                              <Card.Body className="p-3">
                                   <div className="d-flex justify-content-between align-items-center mb-1">
                                        <span className="text-xs text-uppercase fw-semibold opacity-75">Total Transactions</span>
                                        <RiFileList3Line size={22} className="opacity-75" />
                                   </div>
                                   <h3 className="fw-bold mb-0">{summary.totalTransactions}</h3>
                                   <span className="text-xs opacity-75">FOC lab orders completed</span>
                              </Card.Body>
                         </Card>
                    </Col>

                    <Col md={3} sm={6}>
                         <Card className="border-0 shadow-sm bg-info bg-gradient text-white rounded-3">
                              <Card.Body className="p-3">
                                   <div className="d-flex justify-content-between align-items-center mb-1">
                                        <span className="text-xs text-uppercase fw-semibold opacity-75">Staff Beneficiaries</span>
                                        <RiGroupLine size={22} className="opacity-75" />
                                   </div>
                                   <h3 className="fw-bold mb-0">{summary.totalStaffBeneficiaries}</h3>
                                   <span className="text-xs opacity-75">Active staff using benefit</span>
                              </Card.Body>
                         </Card>
                    </Col>

                    <Col md={3} sm={6}>
                         <Card className="border-0 shadow-sm bg-secondary bg-gradient text-white rounded-3">
                              <Card.Body className="p-3">
                                   <div className="d-flex justify-content-between align-items-center mb-1">
                                        <span className="text-xs text-uppercase fw-semibold opacity-75">Patients Served</span>
                                        <RiUserHeartLine size={22} className="opacity-75" />
                                   </div>
                                   <h3 className="fw-bold mb-0">{summary.totalPatientsServed}</h3>
                                   <span className="text-xs opacity-75">Unique patients receiving FOC</span>
                              </Card.Body>
                         </Card>
                    </Col>
               </Row>

               {/* Navigation Tabs */}
               <Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k || 'accounts')}>
                    <Card className="border-0 shadow-sm rounded-3">
                         <Card.Header className="bg-white border-bottom-0 pt-3 px-3">
                              <Nav variant="tabs" className="border-bottom">
                                   <Nav.Item>
                                        <Nav.Link eventKey="accounts" className="fw-semibold d-flex align-items-center gap-1">
                                             <RiGroupLine size={18} /> Staff FOC Accounts
                                        </Nav.Link>
                                   </Nav.Item>
                                   <Nav.Item>
                                        <Nav.Link eventKey="transactions" className="fw-semibold d-flex align-items-center gap-1">
                                             <RiHistoryLine size={18} /> FOC Transaction Ledger
                                        </Nav.Link>
                                   </Nav.Item>
                              </Nav>
                         </Card.Header>

                         <Card.Body className="p-3">
                              <Tab.Content>
                                   {/* TAB 1: ACCOUNTS */}
                                   <Tab.Pane eventKey="accounts">
                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                             <div className="input-group" style={{ maxWidth: '320px' }}>
                                                  <span className="input-group-text bg-light text-muted">
                                                       <RiSearchLine size={16} />
                                                  </span>
                                                  <Form.Control
                                                       size="sm"
                                                       placeholder="Search staff name or email..."
                                                       value={searchAccount}
                                                       onChange={(e) => setSearchAccount(e.target.value)}
                                                       onKeyDown={(e) => {
                                                            if (e.key === 'Enter') fetchAccounts();
                                                       }}
                                                  />
                                             </div>
                                             <small className="text-muted">Showing current year ({currentYear}) FOC allowances</small>
                                        </div>

                                        {loading ? (
                                             <div className="text-center py-5">
                                                  <Spinner animation="border" variant="primary" />
                                             </div>
                                        ) : (
                                             <Table hover responsive className="align-middle text-sm mb-0">
                                                  <thead className="table-light text-uppercase text-xs">
                                                       <tr>
                                                            <th>Staff Member</th>
                                                            <th>Role</th>
                                                            <th>Annual Limit</th>
                                                            <th>Used Amount</th>
                                                            <th>Remaining Allowance</th>
                                                            <th>Status</th>
                                                            {isAdmin && <th className="text-end">Actions</th>}
                                                       </tr>
                                                  </thead>
                                                  <tbody>
                                                       {accounts.length > 0 ? (
                                                            accounts.map((acc) => {
                                                                 const limit = Number(acc.limit_amount || 0);
                                                                 const used = Number(acc.used_amount || 0);
                                                                 const remaining = Number(acc.remaining_amount || 0);
                                                                 const pctUsed = limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0;

                                                                 return (
                                                                      <tr key={acc.id}>
                                                                           <td className="fw-semibold text-dark">
                                                                                {acc.staff_name || `Staff #${acc.employeeid}`}
                                                                           </td>
                                                                           <td className="text-capitalize text-muted">{acc.staff_role || 'Staff'}</td>
                                                                           <td className="fw-semibold">₵{currencyFormatter.format(limit)}</td>
                                                                           <td className="text-danger">₵{currencyFormatter.format(used)} ({pctUsed}%)</td>
                                                                           <td className="fw-bold text-success">₵{currencyFormatter.format(remaining)}</td>
                                                                           <td>
                                                                                <Badge bg={acc.active ? 'success' : 'secondary'}>
                                                                                     {acc.active ? 'Active' : 'Disabled'}
                                                                                </Badge>
                                                                           </td>
                                                                           {isAdmin && (
                                                                                <td className="text-end">
                                                                                     <Button
                                                                                          variant="outline-primary"
                                                                                          size="sm"
                                                                                          onClick={() => {
                                                                                               setEditLimitModal({ show: true, staff: acc });
                                                                                               setNewLimitInput(String(acc.limit_amount));
                                                                                          }}
                                                                                     >
                                                                                          <RiEditLine size={14} className="me-1" /> Adjust Limit
                                                                                     </Button>
                                                                                </td>
                                                                           )}
                                                                      </tr>
                                                                 );
                                                            })
                                                       ) : (
                                                            <tr>
                                                                 <td colSpan={7} className="text-center py-4 text-muted">
                                                                      No staff FOC accounts found.
                                                                 </td>
                                                            </tr>
                                                       )}
                                                  </tbody>
                                             </Table>
                                        )}
                                   </Tab.Pane>

                                   {/* TAB 2: TRANSACTIONS */}
                                   <Tab.Pane eventKey="transactions">
                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                             <Form.Select
                                                  size="sm"
                                                  style={{ maxWidth: '200px' }}
                                                  value={txStatusFilter}
                                                  onChange={(e) => setTxStatusFilter(e.target.value)}
                                             >
                                                  <option value="">All Statuses</option>
                                                  <option value="approved">Approved</option>
                                                  <option value="pending">Pending Approval</option>
                                                  <option value="reversed">Reversed</option>
                                             </Form.Select>
                                        </div>

                                        {loading ? (
                                             <div className="text-center py-5">
                                                  <Spinner animation="border" variant="primary" />
                                             </div>
                                        ) : (
                                             <Table hover responsive className="align-middle text-sm mb-0">
                                                  <thead className="table-light text-uppercase text-xs">
                                                       <tr>
                                                            <th>TX ID</th>
                                                            <th>Staff Beneficiary</th>
                                                            <th>Patient</th>
                                                            <th>Invoice ID</th>
                                                            <th>Gross Amount</th>
                                                            <th>FOC Value</th>
                                                            <th>Payable</th>
                                                            <th>Status</th>
                                                            <th>Reversal Reason</th>
                                                            <th>Requested By</th>
                                                            <th>Date</th>
                                                            {isAdmin && <th className="text-end">Actions</th>}
                                                       </tr>
                                                  </thead>
                                                  <tbody>
                                                       {transactions.length > 0 ? (
                                                            transactions.map((tx) => (
                                                                 <tr key={tx.id}>
                                                                      <td>#{tx.id}</td>
                                                                      <td className="fw-semibold">{tx.staff_name || `Staff #${tx.employeeid}`}</td>
                                                                      <td>{tx.patient_name || `Patient #${tx.patientid}`}</td>
                                                                      <td>#{tx.billingid}</td>
                                                                      <td>₵{currencyFormatter.format(Number(tx.gross_amount))}</td>
                                                                      <td className="fw-bold text-success">₵{currencyFormatter.format(Number(tx.foc_amount))}</td>
                                                                      <td>₵{currencyFormatter.format(Number(tx.payable_amount))}</td>
                                                                      <td>
                                                                           <Badge
                                                                                bg={
                                                                                     tx.status === 'approved'
                                                                                          ? 'success'
                                                                                          : tx.status === 'pending'
                                                                                               ? 'warning'
                                                                                               : tx.status === 'reversed'
                                                                                                    ? 'danger'
                                                                                                    : 'secondary'
                                                                                }
                                                                           >
                                                                                {tx.status}
                                                                      <td className="text-muted small">
                                                                           {tx.status === 'reversed' ? (tx.reversal_reason || 'No reason recorded') : '-'}
                                                                      </td>
                                                                           </Badge>
                                                                      </td>
                                                                      <td>{tx.requested_by_name || `#${tx.requested_by}`}</td>
                                                                      <td className="text-xs text-muted">
                                                                           {tx.created_at ? new Date(tx.created_at).toLocaleDateString() : '-'}
                                                                      </td>
                                                                      {isAdmin && (
                                                                           <td className="text-end">
                                                                                {tx.status === 'pending' && (
                                                                                     <Button
                                                                                          variant="success"
                                                                                          size="sm"
                                                                                          className="me-1"
                                                                                          disabled={actionLoading === tx.id}
                                                                                          onClick={() => handleApproveTx(tx.id)}
                                                                                     >
                                                                                          <RiCheckLine size={14} /> Approve
                                                                                     </Button>
                                                                                )}
                                                                                {tx.status === 'approved' && (
                                                                                     <Button
                                                                                          variant="outline-danger"
                                                                                          size="sm"
                                                                                          disabled={actionLoading === tx.id}
                                                                                          onClick={() => handleReverseTx(tx.id)}
                                                                                     >
                                                                                          <RiCloseLine size={14} /> Reverse
                                                                                     </Button>
                                                                                )}
                                                                           </td>
                                                                      )}
                                                                 </tr>
                                                            ))
                                                       ) : (
                                                            <tr>
                                                                 <td colSpan={12} className="text-center py-4 text-muted">
                                                                      No FOC transactions found.
                                                                 </td>
                                                            </tr>
                                                       )}
                                                  </tbody>
                                             </Table>
                                        )}
                                   </Tab.Pane>
                              </Tab.Content>
                         </Card.Body>
                    </Card>
               </Tab.Container>

               {/* ADJUST LIMIT MODAL */}
               <Modal show={editLimitModal.show} onHide={() => setEditLimitModal({ show: false, staff: null })} centered>
                    <Modal.Header closeButton>
                         <Modal.Title className="fs-6 fw-bold">
                              Adjust Annual FOC Limit — {editLimitModal.staff?.staff_name || 'Staff'}
                         </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                         <Form.Group className="mb-3">
                              <Form.Label className="text-xs font-semibold text-uppercase text-muted">
                                   New Annual Limit (GHS)
                              </Form.Label>
                              <Form.Control
                                   type="number"
                                   step="0.01"
                                   value={newLimitInput}
                                   onChange={(e) => setNewLimitInput(e.target.value)}
                                   placeholder="e.g. 1500.00"
                              />
                         </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                         <Button variant="light" onClick={() => setEditLimitModal({ show: false, staff: null })}>
                              Cancel
                         </Button>
                         <Button variant="primary" disabled={isUpdatingLimit} onClick={handleUpdateLimit}>
                              {isUpdatingLimit ? <Spinner size="sm" /> : 'Save Limit'}
                         </Button>
                    </Modal.Footer>
               </Modal>
          </Container>
     );
}
