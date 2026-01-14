'use client';

import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import { currencyFormatter, customFetch } from '../../../../components/Auth/customFetch';
import { RiMoneyDollarCircleLine, RiCalendarEventLine, RiEyeLine, RiRefreshLine, RiFilter3Line } from '@remixicon/react';
import { Offcanvas, Button, Modal, Pagination } from 'react-bootstrap';
import Loader from '../../../../components/isLoading';
import { useApplicationSettings } from '../../../../components/Auth/useApplicationContext';

const ReversedPaymentsPage = () => {
     const [reversals, setReversals] = useState<any[]>([]);
     const [loading, setLoading] = useState(false);
     const [localFilter, setLocalFilter] = useState({ from: '', to: '' });
     const [showOffcanvas, setShowOffcanvas] = useState(false);
     const [showDetailModal, setShowDetailModal] = useState(false);
     const [selectedReversal, setSelectedReversal] = useState<any>(null);
     const [currentPage, setCurrentPage] = useState(1);
     const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
     const { applicationsettings } = useApplicationSettings();
     const { user } = applicationsettings || {};
     const employeeid = user?.employeeid;
     const branchid = applicationsettings?.branchid;

     useEffect(() => {
          if (employeeid && branchid) {
               getReversedPaymentsData(1);
          }
     }, [employeeid, branchid]);

     const getReversedPaymentsData = async (page = 1) => {
          setLoading(true);
          try {
               const response = await customFetch(`expenses/payments/reversed?employeeid=${employeeid}&branchid=${branchid}&count=10&page=${page}`);
               if (response && response.data && Array.isArray(response.data)) {
                    setReversals(response.data);
                    if (response.pagination) {
                         setPagination(response.pagination);
                         setCurrentPage(page);
                    }
               } else {
                    setReversals([]);
               }
          } catch (error) {
               console.log("Error fetching reversed payments:", error);
               setReversals([]);
          } finally {
               setLoading(false);
          }
     };

     const handleInputChange = (e) => {
          const { name, value } = e.target;
          setLocalFilter((prev) => ({ ...prev, [name]: value }));
     };

     const handleSearch = () => {
          setShowOffcanvas(false);
          getReversedPaymentsData(1);
     };

     const handleClear = () => {
          const cleared = { from: '', to: '' };
          setLocalFilter(cleared);
          setShowOffcanvas(false);
          getReversedPaymentsData(1);
     };

     const handleViewDetails = (reversal) => {
          setSelectedReversal(reversal);
          setShowDetailModal(true);
     };

     const handlePageChange = (page) => {
          getReversedPaymentsData(page);
     };

     return (
          <div className="container-fluid px-4 py-3">
               {/* Header */}
               <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                         <h2 className="d-flex align-items-center fw-bold">
                              <RiMoneyDollarCircleLine className="me-2" size={28} />
                              Reversed Payments
                         </h2>
                         <p className="text-muted small">Track all payment reversals and reversals history</p>
                    </div>
                    <div className="d-flex gap-2">
                         <Button
                              variant="outline-secondary"
                              size="sm"
                              onClick={() => setShowOffcanvas(true)}
                              className="d-flex align-items-center"
                         >
                              <RiFilter3Line className="me-1" size={16} />
                              Filter
                         </Button>
                         <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => getReversedPaymentsData(1)}
                              className="d-flex align-items-center"
                         >
                              <RiRefreshLine className="me-1" size={16} />
                              Refresh
                         </Button>
                    </div>
               </div>

               {/* Filter Offcanvas */}
               <Offcanvas show={showOffcanvas} onHide={() => setShowOffcanvas(false)} placement="end">
                    <Offcanvas.Header closeButton>
                         <Offcanvas.Title>Filter Reversed Payments</Offcanvas.Title>
                    </Offcanvas.Header>
                    <Offcanvas.Body>
                         <div className="mb-3">
                              <label className="form-label">From Date</label>
                              <input
                                   type="date"
                                   className="form-control"
                                   name="from"
                                   value={localFilter.from}
                                   onChange={handleInputChange}
                              />
                         </div>
                         <div className="mb-3">
                              <label className="form-label">To Date</label>
                              <input
                                   type="date"
                                   className="form-control"
                                   name="to"
                                   value={localFilter.to}
                                   onChange={handleInputChange}
                                   min={localFilter.from}
                              />
                         </div>
                         <div className="d-flex gap-2">
                              <Button variant="primary" onClick={handleSearch} className="flex-grow-1">
                                   Search
                              </Button>
                              <Button variant="outline-secondary" onClick={handleClear} className="flex-grow-1">
                                   Clear
                              </Button>
                         </div>
                    </Offcanvas.Body>
               </Offcanvas>

               {/* Table */}
               {loading ? (
                    <Loader />
               ) : reversals.length === 0 ? (
                    <div className="text-center py-5">
                         <RiMoneyDollarCircleLine size={48} className="text-muted mb-3" />
                         <h5 className="text-muted">No Reversed Payments Found</h5>
                         <p className="text-muted small">There are no reversed payments to display.</p>
                    </div>
               ) : (
                    <div className="card">
                         <div className="card-body">
                              <div className="table-responsive">
                                   <table className="table table-hover table-striped">
                                        <thead className="sticky-top bg-body-tertiary">
                                             <tr>
                                                  <th>Reversal ID</th>
                                                  <th>Invoice</th>
                                                  <th>Expense</th>
                                                  <th>Original Amount</th>
                                                  <th>Reversed Amount</th>
                                                  <th>Reason</th>
                                                  <th>Reversed By</th>
                                                  <th>Reversed On</th>
                                                  <th>Payment Method</th>
                                                  <th>Action</th>
                                             </tr>
                                        </thead>
                                        <tbody>
                                             {Array.isArray(reversals) && reversals.map((reversal) => (
                                                  <tr key={reversal.reversal_id}>
                                                       <td>
                                                            <strong>{reversal.reversal_id}</strong>
                                                       </td>
                                                       <td>
                                                            <strong>{reversal.invoice_number}</strong>
                                                       </td>
                                                       <td>{reversal.expense_name}</td>
                                                       <td>{currencyFormatter.format(reversal.original_amount)}</td>
                                                       <td className="text-danger fw-bold">{currencyFormatter.format(reversal.reversed_amount)}</td>
                                                       <td>{reversal.reversal_reason}</td>
                                                       <td>{reversal.reversed_by_name}</td>
                                                       <td>
                                                            {dayjs(reversal.reversed_on).format('DD-MM-YYYY HH:mm:ss')}
                                                       </td>
                                                       <td>{reversal.payment_method}</td>
                                                       <td>
                                                            <Button
                                                                 variant="outline-primary"
                                                                 size="sm"
                                                                 onClick={() => handleViewDetails(reversal)}
                                                                 className="d-flex align-items-center"
                                                            >
                                                                 <RiEyeLine className="me-1" size={14} />
                                                                 View
                                                            </Button>
                                                       </td>
                                                  </tr>
                                             ))}
                                        </tbody>
                                   </table>
                              </div>
                         </div>

                         {/* Pagination */}
                         {pagination.totalPages > 1 && (
                              <div className="d-flex justify-content-between align-items-center p-3 bg-body-tertiary">
                                   <span className="text-muted small">
                                        Showing {(currentPage - 1) * pagination.limit + 1} to {Math.min(currentPage * pagination.limit, pagination.total)} of {pagination.total} reversals
                                   </span>
                                   <Pagination className="mb-0">
                                        <Pagination.First
                                             onClick={() => handlePageChange(1)}
                                             disabled={currentPage === 1}
                                        />
                                        <Pagination.Prev
                                             onClick={() => handlePageChange(currentPage - 1)}
                                             disabled={currentPage === 1}
                                        />
                                        {Array.from({ length: pagination.totalPages }).map((_, idx) => (
                                             <Pagination.Item
                                                  key={idx + 1}
                                                  active={currentPage === idx + 1}
                                                  onClick={() => handlePageChange(idx + 1)}
                                             >
                                                  {idx + 1}
                                             </Pagination.Item>
                                        ))}
                                        <Pagination.Next
                                             onClick={() => handlePageChange(currentPage + 1)}
                                             disabled={currentPage === pagination.totalPages}
                                        />
                                        <Pagination.Last
                                             onClick={() => handlePageChange(pagination.totalPages)}
                                             disabled={currentPage === pagination.totalPages}
                                        />
                                   </Pagination>
                              </div>
                         )}
                    </div>
               )}

               {/* Detail Modal */}
               <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)} size="lg">
                    <Modal.Header closeButton>
                         <Modal.Title className="fw-bold">Reversal Details</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                         {selectedReversal && (
                              <div>
                                   <div className="row mb-3">
                                        <div className="col-md-6">
                                             <div className="mb-3">
                                                  <strong>Reversal ID:</strong>
                                                  <p className="text-muted mb-0">{selectedReversal.reversal_id}</p>
                                             </div>
                                        </div>
                                        <div className="col-md-6">
                                             <div className="mb-3">
                                                  <strong>Payment ID:</strong>
                                                  <p className="text-muted mb-0">{selectedReversal.payment_id}</p>
                                             </div>
                                        </div>
                                   </div>

                                   <div className="row mb-3">
                                        <div className="col-md-6">
                                             <div className="mb-3">
                                                  <strong>Invoice Number:</strong>
                                                  <p className="text-muted mb-0">{selectedReversal.invoice_number}</p>
                                             </div>
                                        </div>
                                        <div className="col-md-6">
                                             <div className="mb-3">
                                                  <strong>Invoice Status:</strong>
                                                  <p className="text-muted mb-0">{selectedReversal.invoice_status}</p>
                                             </div>
                                        </div>
                                   </div>

                                   <div className="row mb-3">
                                        <div className="col-md-6">
                                             <div className="mb-3">
                                                  <strong>Expense Name:</strong>
                                                  <p className="text-muted mb-0">{selectedReversal.expense_name}</p>
                                             </div>
                                        </div>
                                        <div className="col-md-6">
                                             <div className="mb-3">
                                                  <strong>Expense Amount:</strong>
                                                  <p className="text-muted mb-0">{currencyFormatter.format(selectedReversal.expense_amount)}</p>
                                             </div>
                                        </div>
                                   </div>

                                   <hr className="my-3" />

                                   <div className="row mb-3">
                                        <div className="col-md-6">
                                             <div className="mb-3">
                                                  <strong>Original Amount:</strong>
                                                  <p className="text-muted mb-0">{currencyFormatter.format(selectedReversal.original_amount)}</p>
                                             </div>
                                        </div>
                                        <div className="col-md-6">
                                             <div className="mb-3">
                                                  <strong>Reversed Amount:</strong>
                                                  <p className="text-danger fw-bold mb-0">{currencyFormatter.format(selectedReversal.reversed_amount)}</p>
                                             </div>
                                        </div>
                                   </div>

                                   <div className="row mb-3">
                                        <div className="col-md-6">
                                             <div className="mb-3">
                                                  <strong>Payment Method:</strong>
                                                  <p className="text-muted mb-0">{selectedReversal.payment_method}</p>
                                             </div>
                                        </div>
                                        <div className="col-md-6">
                                             <div className="mb-3">
                                                  <strong>Reversal Method:</strong>
                                                  <p className="text-muted mb-0">{selectedReversal.reversal_method}</p>
                                             </div>
                                        </div>
                                   </div>

                                   <div className="row mb-3">
                                        <div className="col-md-6">
                                             <div className="mb-3">
                                                  <strong>Original Payment Date:</strong>
                                                  <p className="text-muted mb-0">{dayjs(selectedReversal.payment_date).format('DD-MM-YYYY HH:mm:ss')}</p>
                                             </div>
                                        </div>
                                        <div className="col-md-6">
                                             <div className="mb-3">
                                                  <strong>Reversed On:</strong>
                                                  <p className="text-muted mb-0">{dayjs(selectedReversal.reversed_on).format('DD-MM-YYYY HH:mm:ss')}</p>
                                             </div>
                                        </div>
                                   </div>

                                   <hr className="my-3" />

                                   <div className="mb-3">
                                        <strong>Reversed By:</strong>
                                        <p className="text-muted mb-0">{selectedReversal.reversed_by_name}</p>
                                   </div>

                                   <div className="mb-3">
                                        <strong>Reversal Reason:</strong>
                                        <p className="text-muted mb-0">{selectedReversal.reversal_reason}</p>
                                   </div>

                                   <div className="mb-3">
                                        <strong>Original Status:</strong>
                                        <p className="text-muted mb-0">{selectedReversal.original_status}</p>
                                   </div>
                              </div>
                         )}
                    </Modal.Body>
                    <Modal.Footer>
                         <Button variant="secondary" onClick={() => setShowDetailModal(false)}>
                              Close
                         </Button>
                    </Modal.Footer>
               </Modal>
          </div>
     );
};

export default ReversedPaymentsPage;
