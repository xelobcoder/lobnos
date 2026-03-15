import React, { useState, useEffect } from 'react';
import { currencyFormatter, customFetch, customPost } from '../../components/Auth/customFetch';
import { RiMoneyDollarCircleLine, RiFileList2Line, RiInboxArchiveLine, RiCalendarEventLine, RiFilter3Line, RiRefreshLine, RiSearchLine, RiEyeLine, RiMoneyDollarBoxLine } from '@remixicon/react';
import PrimeTable from '../accessories/Datatables/PrimeTable';
import { Offcanvas, Button, Modal } from 'react-bootstrap';

const statusMap = {
     'Pending': { label: 'Pending', color: 'warning' },
     'Paid': { label: 'Paid', color: 'success' },
     'Overdue': { label: 'Overdue', color: 'danger' },
     'Cancelled': { label: 'Cancelled', color: 'secondary' },
};

const InvoiceList = ({ branchid, employeeid }) => {
     const [invoices, setInvoices] = useState([]);
     const [loading, setLoading] = useState(false);
     const [localFilter, setLocalFilter] = useState({ from: '', to: '', status: '' });
     const [showOffcanvas, setShowOffcanvas] = useState(false);
     const [selectedInvoice, setSelectedInvoice] = useState(null);
     const [showDetailModal, setShowDetailModal] = useState(false);
     const [invoiceExpenses, setInvoiceExpenses] = useState([]);
     const [loadingExpenses, setLoadingExpenses] = useState(false);
     const [invoicePayments, setInvoicePayments] = useState([]);
     const [loadingPayments, setLoadingPayments] = useState(false);
     const [showPaymentModal, setShowPaymentModal] = useState(false);
     const [paymentData, setPaymentData] = useState({
          payment_date: '',
          amount: '',
          method: '',
          status: 'Paid'
     });
     const [submittingPayment, setSubmittingPayment] = useState(false);
     const [showReversePaymentModal, setShowReversePaymentModal] = useState(false);
     const [selectedPayment, setSelectedPayment] = useState(null);
     const [reversePaymentData, setReversePaymentData] = useState({
          paymentId: '',
          reversalReason: ''
     });
     const [submittingReversal, setSubmittingReversal] = useState(false);
     const [reversalReasonSelect, setReversalReasonSelect] = useState('');
     const [showReversalInfoModal, setShowReversalInfoModal] = useState(false);
     const [selectedReversalInfo, setSelectedReversalInfo] = useState(null);

     useEffect(() => {
          if (employeeid && branchid) {
               getInvoiceData();
          }
     }, [employeeid, branchid]);

     const getInvoiceData = async () => {
          setLoading(true);
          try {
               const response = await customFetch(`expenses/invoices?employeeid=${employeeid}&branchid=${branchid}&count=10&page=1`);
               if (response && response.data && Array.isArray(response.data)) {
                    setInvoices(response.data);
               } else if (response && Array.isArray(response)) {
                    setInvoices(response);
               } else {
                    setInvoices([]);
               }
          } catch (error) {
               console.log("Error fetching invoices:", error);
               setInvoices([]);
          } finally {
               setLoading(false);
          }
     };

     const handleInputChange = (e) => {
          const { name, value } = e.target;
          setLocalFilter((prev) => ({ ...prev, [name]: value }));
     };

     const handleStatusChange = (e) => {
          setLocalFilter((prev) => ({ ...prev, status: e.target.value }));
     };

     const handleSearch = () => {
          setShowOffcanvas(false);
          getInvoiceData();
     };

     const handleClear = () => {
          const cleared = { from: '', to: '', status: '' };
          setLocalFilter(cleared);
          setShowOffcanvas(false);
          getInvoiceData();
     };

     const handleViewInvoice = async (invoice) => {
          setSelectedInvoice(invoice);
          setShowDetailModal(true);
          setLoadingExpenses(true);
          setLoadingPayments(true);

          try {
               // Fetch expenses
               const expensesResponse = await customFetch(`expenses/group/${invoice.groupId}?employeeid=${employeeid}&branchid=${branchid}`);
               if (expensesResponse && expensesResponse.expenses && Array.isArray(expensesResponse.expenses)) {
                    setInvoiceExpenses(expensesResponse.expenses);
               } else {
                    setInvoiceExpenses([]);
               }
          } catch (error) {
               console.log("Error fetching invoice expenses:", error);
               setInvoiceExpenses([]);
          } finally {
               setLoadingExpenses(false);
          }

          try {
               // Fetch payments
               const paymentsResponse = await customFetch(`expenses/payments?employeeid=${employeeid}&branchid=${branchid}&invoice_id=${invoice.id}`);
               if (paymentsResponse && paymentsResponse.data && Array.isArray(paymentsResponse.data)) {
                    setInvoicePayments(paymentsResponse.data);
               } else if (paymentsResponse && Array.isArray(paymentsResponse)) {
                    setInvoicePayments(paymentsResponse);
               } else {
                    setInvoicePayments([]);
               }
          } catch (error) {
               setInvoicePayments([]);
          } finally {
               setLoadingPayments(false);
          }
     };

     const handleMakePayment = async (invoice) => {
          setSelectedInvoice(invoice);
          setLoadingPayments(true);

          try {
               // Check if payments already exist for this invoice
               const paymentsResponse = await customFetch(`expenses/payments?employeeid=${employeeid}&branchid=${branchid}&invoice_id=${invoice.id}`);
               let payments = [];
               if (paymentsResponse && paymentsResponse.data && Array.isArray(paymentsResponse.data)) {
                    payments = paymentsResponse.data;
                    setInvoicePayments(payments);
               } else if (paymentsResponse && Array.isArray(paymentsResponse)) {
                    payments = paymentsResponse;
                    setInvoicePayments(payments);
               } else {
                    setInvoicePayments([]);
               }

               // Initialize payment data only if no payments exist
               if (payments.length === 0) {
                    setPaymentData({
                         payment_date: new Date().toISOString().slice(0, 16), // Current date/time
                         amount: invoice.total_amount.toString(),
                         method: '',
                         status: 'Paid'
                    });
               }
          } catch (error) {
               setInvoicePayments([]);
               setPaymentData({
                    payment_date: new Date().toISOString().slice(0, 16), 
                    amount: invoice.total_amount.toString(),
                    method: '',
                    status: 'Paid'
               });
          } finally {
               setLoadingPayments(false);
          }

          setShowPaymentModal(true);
     };

     const handlePaymentSubmit = async (e) => {
          e.preventDefault();
          if (!selectedInvoice) return;

          setSubmittingPayment(true);
          try {
               console.log(selectedInvoice)
               const payload = {
                    expense_id: selectedInvoice.expense_id,
                    invoice_id: selectedInvoice.id,
                    payment_date: paymentData.payment_date,
                    amount: parseFloat(paymentData.amount),
                    method: paymentData.method,
                    status: paymentData.status
               };

               const response = await customPost(`expenses/payment?employeeid=${employeeid}&branchid=${branchid}`, "POST", payload);

               if (response && response.status && response.status.paymentId) {
                    alert('Payment submitted successfully!');
                    setShowPaymentModal(false);
                    setPaymentData({
                         payment_date: '',
                         amount: '',
                         method: '',
                         status: 'Paid'
                    });
                    setSelectedInvoice(null);
                    getInvoiceData();
               } else {
                    throw new Error('Payment submission failed');
               }
          } catch (error) {
               console.error('Error submitting payment:', error);
               alert('Failed to submit payment. Please try again.');
          } finally {
               setSubmittingPayment(false);
          }
     };

     const handlePaymentInputChange = (e) => {
          const { name, value } = e.target;
          setPaymentData(prev => ({ ...prev, [name]: value }));
     };

     const handleReversePaymentClick = (payment) => {
          setSelectedPayment(payment);
          setReversePaymentData({
               paymentId: payment.id,
               reversalReason: ''
          });
          setShowReversePaymentModal(true);
     };

     const handleReversePaymentInputChange = (e) => {
          const { name, value } = e.target;
          setReversePaymentData(prev => ({ ...prev, [name]: value }));
     };

     const handleReversePaymentFromList = async (invoice) => {
          try {
               const paymentsResponse = await customFetch(`expenses/payments?employeeid=${employeeid}&branchid=${branchid}&invoice_id=${invoice.id}`);
               let payments = [];
               if (paymentsResponse && paymentsResponse.data && Array.isArray(paymentsResponse.data)) {
                    payments = paymentsResponse.data;
               } else if (paymentsResponse && Array.isArray(paymentsResponse)) {
                    payments = paymentsResponse;
               }

               if (payments.length === 0) {
                    alert('No payments found for this invoice.');
               } else if (payments.length === 1) {
                    handleReversePaymentClick(payments[0]);
               } else {
                    alert('This invoice has multiple payments. Please use the "Pay" button to reverse a specific payment.');
               }
          } catch (error) {
               console.error('Error fetching payments:', error);
               alert('Failed to fetch payment details.');
          }
     };

     const handleReversePaymentSubmit = async (e) => {
          e.preventDefault();
          if (!reversePaymentData.paymentId) return;

          setSubmittingReversal(true);
          try {
               const payload = {
                    paymentId: parseInt(reversePaymentData.paymentId),
                    reversalReason: reversePaymentData.reversalReason || undefined
               };

               const response = await customPost(`expenses/payment/reverse?employeeid=${employeeid}&branchid=${branchid}`, "POST", payload);

               if (response && response.status === 'success' && response.data && response.data.success) {
                    alert('Payment reversed successfully!');
                    setShowReversePaymentModal(false);
                    setReversePaymentData({ paymentId: '', reversalReason: '' });
                    setSelectedPayment(null);
                    window.location.reload();
               } else {
                    throw new Error(response?.message || 'Payment reversal failed');
               }
          } catch (error) {
               console.error('Error reversing payment:', error);
               alert(`Failed to reverse payment: ${error.message}`);
          } finally {
               setSubmittingReversal(false);
          }
     };

     const handleServerSideProcessingForInvoices = async (pagination) => {
          const { count, page, sortby = 'DESC', status, from, to } = pagination;
          // Use localFilter values if not provided in pagination
          const filterStatus = status || localFilter.status;
          const filterFrom = from || localFilter.from;
          const filterTo = to || localFilter.to;

          const urlString = `expenses/invoices?employeeid=${employeeid}&branchid=${branchid}&count=${count}&page=${page}&from=${filterFrom}&to=${filterTo}&status=${filterStatus}&&sortby=${sortby}`;
          try {
               const response = await customFetch(urlString);
               let data = [];
               if (response && response.data && Array.isArray(response.data)) {
                    data = response.data;
               } else if (response && Array.isArray(response)) {
                    data = response;
               }
               return {
                    result: data,
                    error: false,
                    pagination: response.pagination || {}
               }
          } catch (error) {
               console.log("Error fetching invoices:", error);
               return { result: [], error: true }
          }
     }

     const columns = [
          {
               Header: 'Invoice Number',
               accessor: 'invoice_number',
               Cell: ({ cell: { value }, row }) => (
                    <span className="fw-bold">
                         {value}
                    </span>
               )
          },
          {
               Header: 'Merchant',
               accessor: 'merchant_name',
               Cell: ({ cell: { value }, row }) => (
                    <span className="text-capitalize">
                         {value}
                    </span>
               )
          },
          {
               Header: 'Total Amount',
               accessor: 'total_amount',
               Cell: ({ cell: { value }, row }) => (
                    <span className="d-flex  text-black fw-semibold">
                         <RiMoneyDollarCircleLine className="me-1 text-success" />
                         {currencyFormatter.format(value)}
                    </span>
               )
          },
          {
               Header: 'Tax Amount',
               accessor: 'tax_amount',
               Cell: ({ cell: { value }, row }) => (
                    <span className="text-muted">
                         {currencyFormatter.format(value)}
                    </span>
               )
          },
          {
               Header: 'Payment Status',
               accessor: 'final_payment_status',
               Cell: ({ cell: { value }, row }) => (
                    <span className="text-capitalize">{value}</span>
               )
          },
          {
               Header: 'Invoice Date',
               accessor: 'invoice_date',
               Cell: ({ cell: { value }, row }) => (
                    <div>
                         <div className="fw-medium">{new Date(value).toLocaleDateString()}</div>
                    </div>
               )
          },
          {
               Header: 'Due Date',
               accessor: 'due_date',
               Cell: ({ cell: { value }, row }) => (
                    <div>
                         <div className="fw-medium">{value ? new Date(value).toLocaleDateString() : 'N/A'}</div>
                    </div>
               )
          },
          {
               Header: 'Expenses Count',
               accessor: 'expense_count',
               Cell: ({ cell: { value }, row }) => (
                    <span className="badge bg-info text-white">
                         {value}
                    </span>
               )
          },
          {
               Header: 'Reversal Info',
               accessor: 'is_reversed',
               Cell: ({ cell: { value }, row }) => {
                    if (value === 1) {
                         return (
                              <div className='text-start'>
                                   <Button
                                        variant="outline-danger"
                                        size="sm"
                                        onClick={() => {
                                             setSelectedReversalInfo(row.original);
                                             setShowReversalInfoModal(true);
                                        }}
                                        
                                   >
                                        Details
                                   </Button>
                              </div>
                         );
                    }
                    return <span className="text-muted">-</span>;
               }
          },
          {
               Header: 'Actions',
               accessor: 'actions',
               Cell: ({ row }) => (
                    <div className="d-flex gap-1">
                         <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => handleViewInvoice(row.original)}
                              className="d-flex align-items-center"
                         >
                              <RiEyeLine className="me-1" size={14} />
                              View
                         </Button>
                         <Button
                              variant="outline-success"
                              size="sm"
                              onClick={() => handleMakePayment(row.original)}
                              disabled={row.original.status === 'Paid'}
                              className="d-flex align-items-center"
                         >
                              <RiMoneyDollarBoxLine className="me-1" size={14} />
                              Pay
                         </Button>
                         <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => handleReversePaymentFromList(row.original)}
                              disabled={row.original.is_reversed === 1 || row.original.final_payment_status !== 'Paid'}
                              className="d-flex align-items-center"
                              title={row.original.is_reversed === 1 ? 'Payment already reversed' : 'Reverse this payment'}
                         >
                              Reverse
                         </Button>
                    </div>
               )
          },
     ];

     return (
          <div>
               {/* Header */}
               <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="mb-0 fw-semibold text-body">Invoice Management</h5>
               </div>

               {/* Filter Button */}
               <div className="mb-3">
                    <Button
                         variant="outline-secondary"
                         size="sm"
                         onClick={() => setShowOffcanvas(true)}
                         className="d-flex align-items-center"
                    >
                         <RiFilter3Line className="me-2" size={16} />
                         Open Filters
                    </Button>
               </div>

               {/* Offcanvas Filters */}
               <Offcanvas show={showOffcanvas} onHide={() => setShowOffcanvas(false)} placement="end">
                    <Offcanvas.Header closeButton>
                         <Offcanvas.Title className="d-flex align-items-center">
                              <RiFilter3Line className="me-2 text-primary" size={20} />
                              Filter Invoices
                         </Offcanvas.Title>
                    </Offcanvas.Header>
                    <Offcanvas.Body>
                         <div className="row g-3">
                              <div className="col-12">
                                   <label htmlFor="from-date" className="form-label mb-1" style={{ fontSize: '0.75rem', fontWeight: '500' }}>
                                        <RiCalendarEventLine size={14} className="me-1" />From
                                   </label>
                                   <input
                                        id="from-date"
                                        name="from"
                                        value={localFilter.from}
                                        onChange={handleInputChange}
                                        type="date"
                                        className="form-control form-control-sm"
                                        style={{ fontSize: '0.8rem' }}
                                   />
                              </div>
                              <div className="col-12">
                                   <label htmlFor="to-date" className="form-label mb-1" style={{ fontSize: '0.75rem', fontWeight: '500' }}>
                                        <RiCalendarEventLine size={14} className="me-1" />To
                                   </label>
                                   <input
                                        id="to-date"
                                        name="to"
                                        value={localFilter.to}
                                        onChange={handleInputChange}
                                        type="date"
                                        className="form-control form-control-sm"
                                        style={{ fontSize: '0.8rem' }}
                                   />
                              </div>
                              <div className="col-12">
                                   <label htmlFor="status-select" className="form-label mb-1" style={{ fontSize: '0.75rem', fontWeight: '500' }}>Status</label>
                                   <select
                                        id="status-select"
                                        className="form-select form-select-sm"
                                        onChange={handleStatusChange}
                                        value={localFilter.status || 'all'}
                                        style={{ fontSize: '0.8rem' }}
                                   >
                                        <option value="all">All</option>
                                        <option value="Pending">Pending</option>
                                        <option value="Paid">Paid</option>
                                        <option value="Overdue">Overdue</option>
                                        <option value="Cancelled">Cancelled</option>
                                   </select>
                              </div>
                              <div className="col-12 d-flex gap-2">
                                   <button
                                        type="button"
                                        onClick={handleSearch}
                                        className="btn btn-primary btn-sm flex-fill d-flex align-items-center justify-content-center"
                                        style={{ fontSize: '0.8rem', padding: '0.375rem 0.5rem' }}
                                   >
                                        <RiSearchLine size={14} className="me-1" /> Search
                                   </button>
                                   <button
                                        onClick={handleClear}
                                        className="btn btn-outline-secondary btn-sm flex-fill d-flex align-items-center justify-content-center"
                                        type="button"
                                        style={{ fontSize: '0.8rem', padding: '0.375rem 0.5rem' }}
                                   >
                                        <RiRefreshLine size={14} className="me-1" /> Clear
                                   </button>
                              </div>
                         </div>
                    </Offcanvas.Body>
               </Offcanvas>

               {/* Invoice Detail Modal */}
               <Modal show={showDetailModal} onHide={() => { setShowDetailModal(false); setSelectedInvoice(null); setInvoiceExpenses([]); setLoadingExpenses(false); setInvoicePayments([]); setLoadingPayments(false); }} size="lg">
                    <Modal.Header closeButton>
                         <Modal.Title>Invoice Details</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                         {selectedInvoice && (
                              <div className="row g-3">
                                   <div className="col-md-6">
                                        <div className="border rounded p-3 bg-body-tertiary">
                                             <h6 className="fw-semibold mb-3">Invoice Information</h6>
                                             <div className="mb-2">
                                                  <strong>Invoice Number:</strong> {selectedInvoice.invoice_number}
                                             </div>
                                             <div className="mb-2">
                                                  <strong>Merchant:</strong> {selectedInvoice.merchant_name}
                                             </div>
                                             <div className="mb-2">
                                                  <strong>Status:</strong>
                                                  <span className={`ms-2 fw-semibold border rounded px-2 py-1 pls-${statusMap[selectedInvoice.status]?.color || 'secondary'}-bg pls-${statusMap[selectedInvoice.status]?.color || 'secondary'}-color`}>
                                                       {selectedInvoice.status}
                                                  </span>
                                             </div>
                                             <div className="mb-2">
                                                  <strong>Expenses Count:</strong> {selectedInvoice.expense_count}
                                             </div>
                                             <div className="mb-2">
                                                  <strong>Created On:</strong> {new Date(selectedInvoice.created_on).toLocaleString()}
                                             </div>
                                        </div>
                                   </div>
                                   <div className="col-md-6">
                                        <div className="border rounded p-3 bg-body-tertiary">
                                             <h6 className="fw-semibold mb-3">Financial Details</h6>
                                             <div className="mb-2">
                                                  <strong>Total Amount:</strong> {currencyFormatter.format(selectedInvoice.total_amount)}
                                             </div>
                                             <div className="mb-2">
                                                  <strong>Tax Amount:</strong> {currencyFormatter.format(selectedInvoice.tax_amount)}
                                             </div>
                                             <div className="mb-2">
                                                  <strong>Invoice Date:</strong> {new Date(selectedInvoice.invoice_date).toLocaleDateString()}
                                             </div>
                                             <div className="mb-2">
                                                  <strong>Due Date:</strong> {selectedInvoice.due_date ? new Date(selectedInvoice.due_date).toLocaleDateString() : 'N/A'}
                                             </div>
                                        </div>
                                   </div>
                                   <div className="col-12">
                                        <div className="border rounded p-3 bg-body-tertiary">
                                             <h6 className="fw-semibold mb-3">Related Expenses</h6>
                                             {loadingExpenses ? (
                                                  <div className="text-center py-3">
                                                       <div className="spinner-border spinner-border-sm" role="status">
                                                            <span className="visually-hidden">Loading...</span>
                                                       </div>
                                                       <div className="mt-2">Loading expenses...</div>
                                                  </div>
                                             ) : invoiceExpenses.length > 0 ? (
                                                  <div className="table-responsive">
                                                       <table className="table table-sm table-hover">
                                                            <thead>
                                                                 <tr>
                                                                      <th>Expense Name</th>
                                                                      <th>Amount</th>
                                                                      <th>Date</th>
                                                                      <th>Status</th>
                                                                 </tr>
                                                            </thead>
                                                            <tbody>
                                                                 {invoiceExpenses.map((expense) => (
                                                                      <tr key={expense.id}>
                                                                           <td className="fw-semibold">{expense.name}</td>
                                                                           <td>{currencyFormatter.format(expense.amount)}</td>
                                                                           <td>{new Date(expense.date).toLocaleDateString()}</td>
                                                                           <td>
                                                                                <span className={`badge ${expense.approved === 1 ? 'bg-success' : expense.approved === 2 ? 'bg-danger' : 'bg-warning'}`}>
                                                                                     {expense.approved === 1 ? 'Approved' : expense.approved === 2 ? 'Rejected' : 'Pending'}
                                                                                </span>
                                                                           </td>
                                                                      </tr>
                                                                 ))}
                                                            </tbody>
                                                       </table>
                                                  </div>
                                             ) : (
                                                  <div className="text-center py-3 text-muted">
                                                       No expenses found for this invoice.
                                                  </div>
                                             )}
                                        </div>
                                   </div>
                                   <div className="col-12">
                                        <div className="border rounded p-3 bg-body-tertiary">
                                             <h6 className="fw-semibold mb-3">Payment & Reversal Details</h6>
                                             {selectedInvoice.is_reversed === 1 && (
                                                  <div className="alert alert-danger mb-3" role="alert">
                                                       <strong>Payment Reversed</strong><br />
                                                       <div className="small mt-2">
                                                            <div><strong>Reversal ID:</strong> {selectedInvoice.reversal_id}</div>
                                                            <div><strong>Amount Reversed:</strong> {currencyFormatter.format(selectedInvoice.reversed_amount)}</div>
                                                            <div><strong>Reversed By:</strong> {selectedInvoice.reversed_by_name}</div>
                                                            <div><strong>Reversed On:</strong> {new Date(selectedInvoice.reversed_on).toLocaleString()}</div>
                                                            {selectedInvoice.reversal_reason && <div><strong>Reason:</strong> {selectedInvoice.reversal_reason}</div>}
                                                       </div>
                                                  </div>
                                             )}
                                             {loadingPayments ? (
                                                  <div className="text-center py-3">
                                                       <div className="spinner-border spinner-border-sm" role="status">
                                                            <span className="visually-hidden">Loading...</span>
                                                       </div>
                                                       <div className="mt-2">Loading payments...</div>
                                                  </div>
                                             ) : invoicePayments.length > 0 ? (
                                                  <div className="table-responsive">
                                                       <table className="table table-sm table-hover">
                                                            <thead>
                                                                 <tr>
                                                                      <th>Payment Date</th>
                                                                      <th>Amount</th>
                                                                      <th>Method</th>
                                                                      <th>Status</th>
                                                                      {selectedInvoice.is_reversed === 0 && <th>Actions</th>}
                                                                 </tr>
                                                            </thead>
                                                            <tbody>
                                                                 {invoicePayments.map((payment) => (
                                                                      <tr key={payment.id}>
                                                                           <td>{new Date(payment.payment_date).toLocaleDateString()}</td>
                                                                           <td>{currencyFormatter.format(payment.amount)}</td>
                                                                           <td>{payment.method}</td>
                                                                           <td>
                                                                                <span className={`badge ${payment.status === 'Paid' ? 'bg-success' : payment.status === 'Pending' ? 'bg-warning' : 'bg-danger'}`}>
                                                                                     {payment.status}
                                                                                </span>
                                                                           </td>
                                                                           {selectedInvoice.is_reversed === 0 && (
                                                                                <td>
                                                                                     <button
                                                                                          type="button"
                                                                                          className="btn btn-sm btn-outline-danger"
                                                                                          onClick={() => handleReversePaymentClick(payment)}
                                                                                     >
                                                                                          Reverse
                                                                                     </button>
                                                                                </td>
                                                                           )}
                                                                      </tr>
                                                                 ))}
                                                            </tbody>
                                                       </table>
                                                  </div>
                                             ) : (
                                                  <div className="text-center py-3 text-muted">
                                                       No payments found for this invoice.
                                                  </div>
                                             )}
                                        </div>
                                   </div>
                              </div>
                         )}
                    </Modal.Body>
                    <Modal.Footer>
                         <Button variant="secondary" onClick={() => { setShowDetailModal(false); setSelectedInvoice(null); setInvoiceExpenses([]); setLoadingExpenses(false); setInvoicePayments([]); setLoadingPayments(false); }}>
                              Close
                         </Button>
                    </Modal.Footer>
               </Modal>

               {/* Payment Modal */}
               <Modal show={showPaymentModal} onHide={() => { setShowPaymentModal(false); setSelectedInvoice(null); setInvoicePayments([]); }} size="md">
                    <Modal.Header closeButton>
                         <Modal.Title>Make Payment</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                         {selectedInvoice && (
                              <div>
                                   <div className="mb-3">
                                        <label className="form-label">Invoice Number</label>
                                        <input
                                             type="text"
                                             className="form-control"
                                             value={selectedInvoice.invoice_number}
                                             readOnly
                                        />
                                   </div>
                                   <div className="mb-3">
                                        <label className="form-label">Merchant</label>
                                        <input
                                             type="text"
                                             className="form-control"
                                             value={selectedInvoice.merchant_name}
                                             readOnly
                                        />
                                   </div>

                                   {loadingPayments ? (
                                        <div className="text-center py-3">
                                             <div className="spinner-border spinner-border-sm" role="status">
                                                  <span className="visually-hidden">Loading...</span>
                                             </div>
                                             <div className="mt-2">Checking payment status...</div>
                                        </div>
                                   ) : invoicePayments.length > 0 ? (
                                        // Show payment history if payments exist
                                        <div>
                                             <div className="alert alert-success" role="alert">
                                                  <strong>Payment Made</strong> - This invoice has already been paid.
                                             </div>
                                             <h6 className="fw-semibold mb-3">Payment History</h6>
                                             <div className="table-responsive">
                                                  <table className="table table-sm table-hover">
                                                       <thead>
                                                            <tr>
                                                                 <th>Payment Date</th>
                                                                 <th>Amount</th>
                                                                 <th>Method</th>
                                                                 <th>Status</th>
                                                                 <th>Actions</th>
                                                            </tr>
                                                       </thead>
                                                       <tbody>
                                                            {invoicePayments.map((payment) => (
                                                                 <tr key={payment.id}>
                                                                      <td>{new Date(payment.payment_date).toLocaleDateString()}</td>
                                                                      <td>{currencyFormatter.format(payment.amount)}</td>
                                                                      <td>{payment.method}</td>
                                                                      <td>
                                                                           <span className={`badge ${payment.status === 'Paid' ? 'bg-success' : payment.status === 'Pending' ? 'bg-warning' : 'bg-danger'}`}>
                                                                                {payment.status}
                                                                           </span>
                                                                      </td>
                                                                      <td>
                                                                           <button
                                                                                type="button"
                                                                                className="btn btn-sm btn-outline-danger"
                                                                                onClick={() => handleReversePaymentClick(payment)}
                                                                           >
                                                                                Reverse
                                                                           </button>
                                                                      </td>
                                                                 </tr>
                                                            ))}
                                                       </tbody>
                                                  </table>
                                             </div>
                                        </div>
                                   ) : (
                                        // Show payment form if no payments exist
                                        <form onSubmit={handlePaymentSubmit}>
                                             <div className="mb-3">
                                                  <label className="form-label">Payment Date & Time</label>
                                                  <input
                                                       type="datetime-local"
                                                       name="payment_date"
                                                       className="form-control"
                                                       value={paymentData.payment_date}
                                                       onChange={handlePaymentInputChange}
                                                       required
                                                  />
                                             </div>
                                             <div className="mb-3">
                                                  <label className="form-label">Amount (GHC)</label>
                                                  <input
                                                       type="number"
                                                       name="amount"
                                                       className="form-control"
                                                       value={paymentData.amount}
                                                       readOnly
                                                  />
                                             </div>
                                             <div className="mb-3">
                                                  <label className="form-label">Payment Method</label>
                                                  <select
                                                       name="method"
                                                       className="form-select"
                                                       value={paymentData.method}
                                                       onChange={handlePaymentInputChange}
                                                       required
                                                  >
                                                       <option value="">Select payment method</option>
                                                       <option value="Cash">Cash</option>
                                                       <option value="Bank Transfer">Bank Transfer</option>
                                                       <option value="Credit Card">Credit Card</option>
                                                       <option value="Debit Card">Debit Card</option>
                                                       <option value="Cheque">Cheque</option>
                                                       <option value="Mobile Money">Mobile Money</option>
                                                  </select>
                                             </div>
                                             <div className="mb-3">
                                                  <label className="form-label">Status</label>
                                                  <input
                                                       type="text"
                                                       className="form-control"
                                                       value={paymentData.status}
                                                       readOnly
                                                  />
                                             </div>
                                        </form>
                                   )}
                              </div>
                         )}
                    </Modal.Body>
                    <Modal.Footer>
                         <Button variant="secondary" onClick={() => { setShowPaymentModal(false); setSelectedInvoice(null); setInvoicePayments([]); }}>
                              Close
                         </Button>
                         {invoicePayments.length === 0 && !loadingPayments && (
                              <Button
                                   variant="success"
                                   onClick={handlePaymentSubmit}
                                   disabled={submittingPayment}
                              >
                                   {submittingPayment ? (
                                        <>
                                             <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                             Processing...
                                        </>
                                   ) : (
                                        'Submit Payment'
                                   )}
                              </Button>
                         )}
                    </Modal.Footer>
               </Modal>

               {/* Reverse Payment Modal */}
               <Modal show={showReversePaymentModal} onHide={() => { setShowReversePaymentModal(false); setSelectedPayment(null); setReversePaymentData({ paymentId: '', reversalReason: '' }); }} size="md">
                    <Modal.Header closeButton>
                         <Modal.Title>Reverse Payment</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                         {selectedPayment && (
                              <form onSubmit={handleReversePaymentSubmit}>
                                   <div className="alert alert-warning" role="alert">
                                        <strong>Warning:</strong> This action will reverse the payment. The payment amount will be credited back.
                                   </div>

                                   <div className="mb-3">
                                        <label className="form-label">Payment ID</label>
                                        <input
                                             type="text"
                                             className="form-control"
                                             value={selectedPayment.id}
                                             readOnly
                                        />
                                   </div>

                                   <div className="mb-3">
                                        <label className="form-label">Payment Amount</label>
                                        <input
                                             type="text"
                                             className="form-control"
                                             value={currencyFormatter.format(selectedPayment.amount)}
                                             readOnly
                                        />
                                   </div>

                                   <div className="mb-3">
                                        <label className="form-label">Payment Date</label>
                                        <input
                                             type="text"
                                             className="form-control"
                                             value={new Date(selectedPayment.payment_date).toLocaleString()}
                                             readOnly
                                        />
                                   </div>

                                   <div className="mb-3">
                                        <label htmlFor="reversal-reason-select" className="form-label">Reversal Reason <small className="text-muted">(Optional)</small></label>
                                        <select
                                             id="reversal-reason-select"
                                             className="form-select"
                                             value={reversalReasonSelect}
                                             onChange={(e) => {
                                                  setReversalReasonSelect(e.target.value);
                                                  if (e.target.value !== 'other') {
                                                       setReversePaymentData({ ...reversePaymentData, reversalReason: e.target.value });
                                                  } else {
                                                       setReversePaymentData({ ...reversePaymentData, reversalReason: '' });
                                                  }
                                             }}
                                        >
                                             <option value="">-- Select a reason --</option>
                                             <option value="Duplicate Payment">Duplicate Payment</option>
                                             <option value="Wrong Amount">Wrong Amount</option>
                                             <option value="Cancelled Invoice">Cancelled Invoice</option>
                                             <option value="Customer Request">Customer Request</option>
                                             <option value="System Error">System Error</option>
                                             <option value="Incorrect Recipient">Incorrect Recipient</option>
                                             <option value="Overpayment">Overpayment</option>
                                             <option value="Partial Reversal">Partial Reversal</option>
                                             <option value="Invoice Not Approved">Invoice Not Approved</option>
                                             <option value="Payment Dispute">Payment Dispute</option>
                                             <option value="Fraudulent Transaction">Fraudulent Transaction</option>
                                             <option value="Service Not Rendered">Service Not Rendered</option>
                                             <option value="Quality Issues">Quality Issues</option>
                                             <option value="Pricing Error">Pricing Error</option>
                                             <option value="Tax Calculation Error">Tax Calculation Error</option>
                                             <option value="Early Payment Discount Reversal">Early Payment Discount Reversal</option>
                                             <option value="Account Reconciliation">Account Reconciliation</option>
                                             <option value="Policy Violation">Policy Violation</option>
                                             <option value="Unauthorized Payment">Unauthorized Payment</option>
                                             <option value="Date Entry Error">Date Entry Error</option>
                                             <option value="Bank Error">Bank Error</option>
                                             <option value="Vendor Return">Vendor Return</option>
                                             <option value="Credit Memo Issued">Credit Memo Issued</option>
                                             <option value="other">Other</option>
                                        </select>
                                   </div>
                                   {reversalReasonSelect === 'other' && (
                                        <div className="mb-3">
                                             <label htmlFor="custom-reason" className="form-label">Enter Custom Reason</label>
                                             <textarea
                                                  id="custom-reason"
                                                  name="reversalReason"
                                                  className="form-control"
                                                  rows={3}
                                                  value={reversePaymentData.reversalReason}
                                                  onChange={handleReversePaymentInputChange}
                                                  placeholder="Please specify the reason for reversing this payment"
                                             />
                                        </div>
                                   )}
                              </form>
                         )}
                    </Modal.Body>
                    <Modal.Footer>
                         <Button variant="secondary" onClick={() => { setShowReversePaymentModal(false); setSelectedPayment(null); setReversePaymentData({ paymentId: '', reversalReason: '' }); }}>
                              Cancel
                         </Button>
                         <Button
                              variant="danger"
                              onClick={handleReversePaymentSubmit}
                              disabled={submittingReversal}
                         >
                              {submittingReversal ? (
                                   <>
                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                        Processing...
                                   </>
                              ) : (
                                   'Reverse Payment'
                              )}
                         </Button>
                    </Modal.Footer>
               </Modal>

               {/* Invoice Table */}
               <div>
                    {loading ? (
                         <div className="text-center py-5">
                              <div className="spinner-border spinner-border-lg text-primary" role="status">
                                   <span className="visually-hidden">Loading...</span>
                              </div>
                              <div className="mt-3">
                                   <h6 className="text-muted">Loading invoices...</h6>
                              </div>
                         </div>
                    ) : (
                         <PrimeTable
                              column={columns}
                              data={invoices}
                              urlparams={localFilter}
                              filtering={true}
                              serverSideFiltering={true}
                              handleSeverSideProcessing={handleServerSideProcessingForInvoices}
                              rowStyling={{
                                   type: "custom",
                                   getRowStyle: (rowData) => {
                                        const status = rowData?.final_payment_status?.toLowerCase();
                                        if (status === "reversed") {
                                             return { backgroundColor: "#f8d7da", color: "#842029"};
                                        }
                                        return {};
                                   }
                              }}
                         />
                    )}
               </div>

               {/* Reversal Info Modal */}
               <Modal show={showReversalInfoModal} onHide={() => setShowReversalInfoModal(false)} size="lg">
                    <Modal.Header closeButton>
                         <Modal.Title className="fw-bold">Reversal Information</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                         {selectedReversalInfo && (
                              <div>
                                   <div>
                                        <div className="row">
                                             <div className="col-md-6">
                                                  <div className="mb-3">
                                                       <strong>Reversal ID:</strong>
                                                       <p className="text-muted">{selectedReversalInfo.reversal_id}</p>
                                                  </div>
                                                  <div className="mb-3">
                                                       <strong>Reversed Amount:</strong>
                                                       <p className="text-danger fw-bold">{currencyFormatter.format(selectedReversalInfo.reversed_amount)}</p>
                                                  </div>
                                                  <div className="mb-3">
                                                       <strong>Reversed By:</strong>
                                                       <p className="text-muted">{selectedReversalInfo.reversed_by_name}</p>
                                                  </div>
                                             </div>
                                             <div className="col-md-6">
                                                  <div className="mb-3">
                                                       <strong>Date:</strong>
                                                       <p className="text-muted">{new Date(selectedReversalInfo.reversed_on).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                                  </div>
                                                  <div className="mb-3">
                                                       <strong>Time:</strong>
                                                       <p className="text-muted">{new Date(selectedReversalInfo.reversed_on).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</p>
                                                  </div>
                                                  {selectedReversalInfo.reversal_reason && (
                                                       <div className="mb-3">
                                                            <strong>Reason:</strong>
                                                            <p className="text-muted">{selectedReversalInfo.reversal_reason}</p>
                                                       </div>
                                                  )}
                                             </div>
                                        </div>
                                   </div>
                              </div>
                         )}
                    </Modal.Body>
                    <Modal.Footer>
                         <Button variant="secondary" onClick={() => setShowReversalInfoModal(false)}>
                              Close
                         </Button>
                    </Modal.Footer>
               </Modal>
          </div>
     );
};

export default InvoiceList;