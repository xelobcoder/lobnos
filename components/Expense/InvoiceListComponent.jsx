import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { currencyFormatter, customFetch, customFetchMutation, customPost } from '../../components/Auth/customFetch';
import { RiMoneyDollarCircleLine, RiFileList2Line, RiInboxArchiveLine, RiCalendarEventLine, RiFilter3Line, RiRefreshLine, RiSearchLine, RiEyeLine, RiMoneyDollarBoxLine } from '@remixicon/react';
import styles from './InvoiceWorkspace.module.css';
import { Button, Modal } from 'react-bootstrap';

const statusMap = {
     'Pending': { label: 'Pending', color: 'warning' },
     'Paid': { label: 'Paid', color: 'success' },
     'Overdue': { label: 'Overdue', color: 'danger' },
     'Cancelled': { label: 'Cancelled', color: 'secondary' },
};

const formatDate = value => value && !Number.isNaN(new Date(value).getTime()) ? new Date(value).toLocaleDateString('en-GB', {day:'numeric',month:'short',year:'numeric'}) : 'Not set';
/** @param {{branchid: number, employeeid: number, heading?: string, extraActions?: import("react").ReactNode}} props */
const InvoiceList = ({ branchid, employeeid, heading = "Invoices & payments", extraActions = null }) => {
     const router = useRouter();
     const searchParams = useSearchParams();
     const payInvoiceId = Number(searchParams.get('payInvoice') || 0);
     const payExpenseId = Number(searchParams.get('payExpense') || 0);
     const [invoices, setInvoices] = useState([]);
     const [loading, setLoading] = useState(true);
     const [page,setPage]=useState(1),[total,setTotal]=useState(0),[loadError,setLoadError]=useState(''),[appliedFilter,setAppliedFilter]=useState({from:'',to:'',status:''});
     const request=React.useRef(0);
     const [localFilter, setLocalFilter] = useState({ from: '', to: '', status: '' });
          const [selectedInvoice, setSelectedInvoice] = useState(null);
     const [showDetailModal, setShowDetailModal] = useState(false);
     const [invoiceExpenses, setInvoiceExpenses] = useState([]);
     const [loadingExpenses, setLoadingExpenses] = useState(false);
     const [selectedInvoicesArray, setSelectedInvoicesArray] = useState([])
     const [invoicePayments, setInvoicePayments] = useState([]);
     const [loadingPayments, setLoadingPayments] = useState(false);
     const [showPaymentModal, setShowPaymentModal] = useState(false);
     const [paymentAccounts, setPaymentAccounts] = useState([]);
     const [paymentFeedback, setPaymentFeedback] = useState(null);
     const [paymentData, setPaymentData] = useState({
          payment_date: '',
          amount: '',
          method: '',
          payment_account_id: '',
          payment_reference: ''
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
     const autoPayHandled = React.useRef(false);
     const paymentAttempt = React.useRef(null);

     useEffect(() => {
          if (employeeid && branchid) {
               getInvoiceData();
          }
     }, [employeeid, branchid, payInvoiceId, payExpenseId, page, appliedFilter]);

     const getInvoiceData = async () => {
          const token=++request.current;setLoading(true);setLoadError('');
          try {
               const query=new URLSearchParams({employeeid:String(employeeid),branchid:String(branchid),count:'10',page:String(page),from:appliedFilter.from,to:appliedFilter.to,status:appliedFilter.status});
               if(payInvoiceId)query.set('invoiceId',String(payInvoiceId));if(payExpenseId)query.set('expenseId',String(payExpenseId));
               const response=await customFetch('expenses/invoices?'+query.toString());
               if(token!==request.current)return;
               const data=Array.isArray(response?.data)?response.data:Array.isArray(response)?response:null;
               if(!data)throw new Error(response?.message||'Unable to load invoices.');
               setInvoices(data);setTotal(Number(response?.total??data.length));
          }catch(error){if(token===request.current){setLoadError(error.message||'Unable to load invoices.');setInvoices([]);}}
          finally{if(token===request.current)setLoading(false);}
     };

     const handleInputChange = (e) => {
          const { name, value } = e.target;
          setLocalFilter((prev) => ({ ...prev, [name]: value }));
     };

     const handleStatusChange = (e) => {
          setLocalFilter((prev) => ({ ...prev, status: e.target.value }));
     };

     const handleSearch = () => {
          if(localFilter.from&&localFilter.to&&localFilter.from>localFilter.to){setLoadError('Choose an end date on or after the start date.');return;}
          setPage(1);setAppliedFilter({...localFilter,status:localFilter.status==='all'?'':localFilter.status});
     };
     const handleClear = () => {const cleared={from:'',to:'',status:''};setLocalFilter(cleared);setAppliedFilter(cleared);setPage(1);};

     const handleAllPendingInvoiceSelection = (ev) => {
          const allPending = invoices.filter((item) => item.status == "Pending");
          setSelectedInvoicesArray(allPending.map((item) => item.id));
     }

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

     const handleMakePayment = React.useCallback(async (invoice, targetExpenseId = null) => {
          setSelectedInvoice(invoice);
          setPaymentFeedback(null);
          setLoadingPayments(true);

          try {
               let targetExpense = null;
               if (targetExpenseId) {
                    if (!invoice.groupId) throw new Error('Expense group details are unavailable for this invoice.');
                    const expensesResponse = await customFetch(`expenses/group/${invoice.groupId}?employeeid=${employeeid}&branchid=${branchid}`);
                    targetExpense = (expensesResponse?.expenses || []).find((expense) => Number(expense.id) === Number(targetExpenseId));
                    if (!targetExpense) throw new Error('The approved expense could not be loaded for payment.');
               }
               const [paymentsResponse, accountsResponse] = await Promise.all([
                    customFetch(`expenses/payments?employeeid=${employeeid}&branchid=${branchid}&${targetExpenseId ? `expense_id=${targetExpenseId}` : `invoice_id=${invoice.id}`}`),
                    customFetch('expenses/payment-accounts?capability=pay'),
               ]);
               setPaymentAccounts(accountsResponse?.success ? accountsResponse.data || [] : []);
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

               const totalPaid = payments.filter((payment) => payment.status === 'Paid' && !payment.is_reversed).reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
               setPaymentData({
                    payment_date: new Date().toISOString().slice(0, 16),
                    amount: Math.max(0, Number(targetExpense?.amount ?? invoice.total_amount ?? 0) - totalPaid).toFixed(2),
                    method: '',
                    payment_account_id: '',
                    payment_reference: ''
               });
          } catch (error) {
               setInvoicePayments([]);
               if (targetExpenseId) {
                    setPaymentFeedback({ type: 'danger', message: error?.message || 'Unable to load the approved expense payment details.' });
                    setPaymentData({
                         payment_date: new Date().toISOString().slice(0, 16),
                         amount: '',
                         method: '',
                         payment_account_id: '',
                         payment_reference: ''
                    });
               } else {
                    setPaymentData({
                         payment_date: new Date().toISOString().slice(0, 16),
                         amount: invoice.total_amount.toString(),
                         method: '',
                         payment_account_id: '',
                         payment_reference: ''
                    });
               }
          } finally {
               setLoadingPayments(false);
          }

          setShowPaymentModal(true);
     }, [branchid, employeeid]);

     useEffect(() => {
          if (!payExpenseId || loading || autoPayHandled.current) return;
          const invoice = payInvoiceId ? invoices.find((item) => Number(item.id) === payInvoiceId) : invoices[0];
          if (!invoice) return;
          autoPayHandled.current = true;
          router.replace('/billing/expenses/invoices');
          if (invoice.status === 'Paid') {
               setPaymentFeedback({ type: 'info', message: 'This invoice is already fully paid.' });
               return;
          }
          void handleMakePayment(invoice, payExpenseId);
     }, [invoices, loading, payInvoiceId, payExpenseId, router, handleMakePayment]);

     const handlePaymentSubmit = async (e) => {
          e.preventDefault();
          if (!selectedInvoice || submittingPayment) return;

          setSubmittingPayment(true);
          try {
               const payload = {
                    expense_id: selectedInvoice.expense_id,
                    invoice_id: selectedInvoice.id,
                    payment_date: paymentData.payment_date,
                    amount: parseFloat(paymentData.amount),
                    method: paymentData.method,
                    payment_account_id: Number(paymentData.payment_account_id),
                    payment_reference: paymentData.payment_reference,
                    idempotency_key: ''
               };

               const fingerprint = JSON.stringify(payload);
               if (!paymentAttempt.current || paymentAttempt.current.fingerprint !== fingerprint) paymentAttempt.current = { fingerprint, key: crypto.randomUUID() };
               payload.idempotency_key = paymentAttempt.current.key;
               const response = await customFetchMutation('expenses/payment', 'POST', payload);

               if (response?.success && response?.data?.paymentId) {
                    paymentAttempt.current = null;
                    setPaymentFeedback({ type: 'success', message: 'Payment submitted successfully.' });
                    setShowPaymentModal(false);
                    setPaymentData({
                         payment_date: '',
                         amount: '',
                         method: '',
                         payment_account_id: '',
                         payment_reference: ''
                    });
                    setSelectedInvoice(null);
                    getInvoiceData();
               } else {
                    const message = response?.message || response?.error?.message || 'Payment submission failed';
                    setPaymentFeedback({
                         type: 'danger', message,
                         requiresAuthority: /delegated authority|expense pay/i.test(message),
                    });
               }
          } catch (error) {
               console.error('Error submitting payment:', error);
               setPaymentFeedback({ type: 'danger', message: error?.message || 'Failed to submit payment. Please try again.' });
          } finally {
               setSubmittingPayment(false);
          }
     };

     const handlePaymentInputChange = (e) => {
          const { name, value } = e.target;
          setPaymentFeedback(null);
          if (name === 'payment_account_id') {
               const account = paymentAccounts.find((candidate) => Number(candidate.id) === Number(value));
               const method = account?.account_type === 'cash' ? 'cash' : account?.account_type === 'bank' ? 'bank_transfer' : account?.account_type === 'mobile_money' ? 'mobile_money' : 'other';
               setPaymentData(prev => ({ ...prev, payment_account_id: value, method }));
               return;
          }
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

     const pageAmount=invoices.reduce((sum,invoice)=>sum+Number(invoice.total_amount||0),0);
     const paidCount=invoices.filter(invoice=>invoice.status==='Paid').length;
     const pendingCount=invoices.filter(invoice=>invoice.status!=='Paid'&&invoice.status!=='Rejected').length;

     return (
          <main className={styles.workspace}>
               <header className={styles.header}><div><span className={styles.eyebrow}>EXPENSES / INVOICES</span><h1>{heading}</h1><p>Review supplier invoices, record payments and follow their history.</p></div><div className={styles.headerActions}>{extraActions}<Link className="btn btn-outline-secondary" href="/billing/expenses">View expenses</Link><Button variant="primary" disabled={loading} onClick={getInvoiceData}><RiRefreshLine size={16} aria-hidden="true"/> Refresh</Button></div></header>
               <section className={styles.summary} aria-label="Current page invoice summary"><article><span>Matching invoices</span><strong>{loading?'—':total}</strong><small>For the applied filters</small></article><article><span>Invoice value</span><strong>{loading?'—':currencyFormatter.format(pageAmount)}</strong><small>On this page</small></article><article><span>Open invoices</span><strong>{loading?'—':pendingCount}</strong><small>On this page · {paidCount} paid</small></article></section>
               <section className={styles.panel}><div className={styles.panelHeading}><div><h2>Invoice register</h2><p>Filter by invoice date and status to find the records you need.</p></div></div>
               <form className={styles.filters} onSubmit={event=>{event.preventDefault();handleSearch();}}><label htmlFor="invoice-from">From date<input id="invoice-from" name="from" type="date" className="form-control" value={localFilter.from} onChange={handleInputChange}/></label><label htmlFor="invoice-to">To date<input id="invoice-to" name="to" type="date" min={localFilter.from||undefined} className="form-control" value={localFilter.to} onChange={handleInputChange}/></label><label htmlFor="invoice-status">Invoice status<select id="invoice-status" className="form-select" value={localFilter.status} onChange={handleStatusChange}><option value="">All statuses</option><option value="Pending">Pending</option><option value="Approved">Approved</option><option value="Paid">Paid</option><option value="Rejected">Rejected</option></select></label><Button type="submit" variant="primary" disabled={loading}><RiSearchLine size={16} aria-hidden="true"/> Apply filters</Button><Button type="button" variant="outline-secondary" disabled={loading} onClick={handleClear}>Reset</Button></form>
               {loadError&&<div role="alert" className="alert alert-danger">{loadError}<button type="button" className="btn btn-link" onClick={getInvoiceData}>Retry</button></div>}
               {paymentFeedback&&!showPaymentModal&&<div role="status" className={'alert alert-'+paymentFeedback.type}>{paymentFeedback.message}</div>}
               {loading?<div className={styles.empty} role="status"><span className="spinner-border spinner-border-sm me-2" aria-hidden="true"/>Loading invoices…</div>:!loadError&&<><div className={styles.tableWrap}><table className={styles.table}><thead><tr><th>Invoice / merchant</th><th>Invoice date</th><th>Due date</th><th className={styles.numeric}>Amount</th><th>Status</th><th>Payment</th><th>Actions</th></tr></thead><tbody>{invoices.map(invoice=><tr key={invoice.id}><td><button type="button" className={styles.invoiceLink} onClick={()=>handleViewInvoice(invoice)}>{invoice.invoice_number}</button><small>{invoice.merchant_name||'Merchant not recorded'}</small><span className={styles.expenseCount}>{invoice.expense_count||0} expense{Number(invoice.expense_count)===1?'':'s'}</span></td><td>{formatDate(invoice.invoice_date)}</td><td>{formatDate(invoice.due_date)}</td><td className={styles.numeric}><strong>{currencyFormatter.format(Number(invoice.total_amount||0))}</strong>{Number(invoice.tax_amount)>0&&<small>Tax {currencyFormatter.format(Number(invoice.tax_amount))}</small>}</td><td><span className={styles.badge} data-tone={invoice.status==='Paid'?'success':invoice.status==='Rejected'?'danger':'warning'}>{invoice.status||'Pending'}</span></td><td><span className={styles.badge} data-tone={Number(invoice.is_reversed)===1?'danger':invoice.final_payment_status==='Paid'?'success':'neutral'}>{Number(invoice.is_reversed)===1?'Reversed':invoice.final_payment_status||'Not recorded'}</span>{Number(invoice.is_reversed)===1&&<button type="button" className={styles.historyLink} onClick={()=>{setSelectedReversalInfo(invoice);setShowReversalInfoModal(true);}}>Reversal details</button>}</td><td><div className={styles.rowActions}><Button variant="outline-secondary" size="sm" onClick={()=>handleViewInvoice(invoice)}><RiEyeLine size={15} aria-hidden="true"/> Details</Button>{invoice.status!=='Paid'&&invoice.status!=='Rejected'&&<Button variant="outline-primary" size="sm" onClick={()=>handleMakePayment(invoice)}><RiMoneyDollarBoxLine size={15} aria-hidden="true"/> Record payment</Button>}</div></td></tr>)}</tbody></table></div>{!invoices.length&&<div className={styles.empty}><RiInboxArchiveLine size={32} aria-hidden="true"/><h3>No invoices found</h3><p>Try another date range or reset the filters.</p><Button variant="outline-primary" onClick={handleClear}>Reset filters</Button></div>}<footer className={styles.pagination}><span>{total?((page-1)*10+1):0}–{Math.min(page*10,total)} of {total} invoices</span><div><Button variant="outline-secondary" size="sm" disabled={page===1} onClick={()=>setPage(page-1)}>Previous</Button><span>Page {page}</span><Button variant="outline-secondary" size="sm" disabled={page*10>=total} onClick={()=>setPage(page+1)}>Next</Button></div></footer></>}
               </section>

               {/* Invoice Detail Modal */}
               <Modal fullscreen="sm-down" scrollable data-expense-dialog="true" className={styles.dialog} show={showDetailModal} onHide={() => { setShowDetailModal(false); setSelectedInvoice(null); setInvoiceExpenses([]); setLoadingExpenses(false); setInvoicePayments([]); setLoadingPayments(false); }} size="lg">
                    <Modal.Header closeButton>
                         <Modal.Title>Invoice details</Modal.Title>
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
               <Modal fullscreen="sm-down" scrollable data-expense-dialog="true" className={styles.dialog} show={showPaymentModal} onHide={() => { setShowPaymentModal(false); setSelectedInvoice(null); setInvoicePayments([]); setPaymentFeedback(null); }} size="md" animation={false}>
                    <Modal.Header closeButton>
                         <Modal.Title>Record payment</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                         {paymentFeedback && <div className={`alert alert-${paymentFeedback.type}`} role="alert">
                              {paymentFeedback.message}
                              {paymentFeedback.requiresAuthority && <div className="mt-2">
                                   Ask an administrator to grant Pay expenses authority with an appropriate amount ceiling for this user. Payment-account access is required separately.
                                   <div className="mt-2"><Link href="/accounting/delegations" className="btn btn-sm btn-outline-primary">View delegated authority</Link></div>
                              </div>}
                         </div>}
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
                                             {Number(paymentData.amount || 0) > 0 && (
                                                  <button type="button" className="btn btn-outline-success mt-3" onClick={() => setInvoicePayments([])}>
                                                       Record another payment ({currencyFormatter.format(Number(paymentData.amount))} outstanding)
                                                  </button>
                                             )}
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
                                             {paymentAccounts.length === 0 && <div className="alert alert-warning"><strong>You do not have payment access to any active payment account.</strong><div className="mt-2">An administrator must assign this user <strong>Can pay</strong> on a payment source, and grant <strong>Pay expenses</strong> authority with an amount ceiling.</div><div className="d-flex flex-wrap gap-2 mt-3"><Link className="btn btn-sm btn-outline-primary" href="/accounting/payment-accounts">Manage payment accounts</Link><Link className="btn btn-sm btn-outline-secondary" href="/accounting/delegations">Manage delegated authority</Link></div></div>}
                                             <div className="mb-3">
                                                  <label className="form-label">Amount (GHS)</label>
                                                  <input
                                                       type="number"
                                                       name="amount"
                                                       className="form-control"
                                                       value={paymentData.amount}
                                                       min="0.01"
                                                       step="0.01"
                                                       onChange={handlePaymentInputChange}
                                                       required
                                                  />
                                             </div>
                                             <div className="mb-3">
                                                  <label className="form-label">Payment Source</label>
                                                  <select
                                                       name="payment_account_id"
                                                       className="form-select"
                                                       value={paymentData.payment_account_id}
                                                       onChange={handlePaymentInputChange}
                                                       required
                                                  >
                                                       <option value="">Select authorized account</option>
                                                       {paymentAccounts.map((account) => <option key={account.id} value={account.id}>{account.name} ({account.account_type.replace('_', ' ')})</option>)}
                                                  </select>
                                             </div>
                                             <div className="mb-3">
                                                  <label className="form-label">Payment Method</label>
                                                  <input
                                                       type="text"
                                                       className="form-control"
                                                       value={paymentData.method ? paymentData.method.replace('_', ' ') : ''}
                                                       readOnly
                                                  />
                                             </div>
                                             <div className="mb-3"><label className="form-label">Payment Reference</label><input type="text" name="payment_reference" className="form-control" value={paymentData.payment_reference} onChange={handlePaymentInputChange} placeholder="Transaction, cheque, or receipt reference" /></div>
                                        </form>
                                   )}
                              </div>
                         )}
                    </Modal.Body>
                    <Modal.Footer>
                         <Button variant="secondary" onClick={() => { setShowPaymentModal(false); setSelectedInvoice(null); setInvoicePayments([]); setPaymentFeedback(null); }}>
                              Close
                         </Button>
                         {invoicePayments.length === 0 && !loadingPayments && (
                              <Button
                                   variant="success"
                                   onClick={handlePaymentSubmit}
                                   disabled={submittingPayment || !paymentData.payment_account_id || !paymentData.method || Number(paymentData.amount) <= 0}
                              >
                                   {submittingPayment ? (
                                        <>
                                             <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                             Processing...
                                        </>
                                   ) : (
                                        'Record payment'
                                   )}
                              </Button>
                         )}
                    </Modal.Footer>
               </Modal>

               {/* Reverse Payment Modal */}
               <Modal fullscreen="sm-down" scrollable data-expense-dialog="true" className={styles.dialog} show={showReversePaymentModal} onHide={() => { setShowReversePaymentModal(false); setSelectedPayment(null); setReversePaymentData({ paymentId: '', reversalReason: '' }); }} size="md">
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

               {/* Reversal Info Modal */}
               <Modal fullscreen="sm-down" scrollable data-expense-dialog="true" className={styles.dialog} show={showReversalInfoModal} onHide={() => setShowReversalInfoModal(false)} size="lg">
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
          </main>
     );
};

export default InvoiceList;
