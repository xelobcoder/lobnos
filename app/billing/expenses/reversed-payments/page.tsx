'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import styles from '../../../../components/Expense/InvoiceWorkspace.module.css';
import dayjs from 'dayjs';
import { currencyFormatter, customFetch } from '../../../../components/Auth/customFetch';
import { RiMoneyDollarCircleLine, RiEyeLine, RiRefreshLine, RiFilter3Line } from '@remixicon/react';
import { Button, Modal } from 'react-bootstrap';
import { useApplicationSettings } from '../../../../components/Auth/useApplicationContext';

const ReversedPaymentsPage = () => {
     const [reversals, setReversals] = useState<any[]>([]);
     const [loading, setLoading] = useState(true);
     const [localFilter, setLocalFilter] = useState({ from: '', to: '' });
     const [appliedFilter, setAppliedFilter] = useState({ from: '', to: '' });
     const [error, setError] = useState('');
     const request = useRef(0);
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
          return () => { request.current++; };
     }, [employeeid, branchid]);

     const getReversedPaymentsData = async (page = 1, filter = appliedFilter) => {
          if (!employeeid || !branchid) return;
          const generation = ++request.current;
          setLoading(true); setError('');
          try {
               const params = new URLSearchParams({ employeeid: String(employeeid), branchid: String(branchid), count: '10', page: String(page) });
               if (filter.from) params.set('from', filter.from);
               if (filter.to) params.set('to', filter.to);
               const response = await customFetch(`expenses/payments/reversed?${params}`);
               if (generation !== request.current) return;
               if (!Array.isArray(response?.data)) throw new Error(response?.message || 'Unable to load reversed payments.');
               setReversals(response.data);
               setPagination(response.pagination || { page, limit: 10, total: response.data.length, totalPages: 1 });
               setCurrentPage(page);
          } catch (error: any) {
               if (generation === request.current) setError(error?.message || 'Unable to load reversed payments. Please try again.');
          } finally {
               if (generation === request.current) setLoading(false);
          }
     };
     const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
          const { name, value } = event.target;
          setLocalFilter(previous => ({ ...previous, [name]: value }));
     };
     const handleSearch = () => {
          if (localFilter.from && localFilter.to && localFilter.from > localFilter.to) { setError('The end date must be on or after the start date.'); return; }
          setAppliedFilter({ ...localFilter });
          void getReversedPaymentsData(1, localFilter);
     };
     const handleClear = () => {
          const cleared = { from: '', to: '' };
          setLocalFilter(cleared); setAppliedFilter(cleared);
          void getReversedPaymentsData(1, cleared);
     };
     const handleViewDetails = (reversal: any) => { setSelectedReversal(reversal); setShowDetailModal(true); };
     const handlePageChange = (page: number) => { void getReversedPaymentsData(page); };

     const reversedOnPage = reversals.reduce((sum, row) => sum + (Number(row.reversed_amount) || 0), 0);
     const dateLabel = (date: string) => date && dayjs(date).isValid() ? dayjs(date).format('DD MMM YYYY, HH:mm') : 'Not recorded';
     const totalPages = Math.max(1, Number(pagination.totalPages) || 1);

     return (
          <main className={styles.workspace}>
               <Link href="/billing/expenses/invoices" className="d-inline-block mb-3">← Invoices & payments</Link>
               <header className={styles.header}>
                    <div><span className={styles.eyebrow}>EXPENSE PAYMENT HISTORY</span><h1>Reversed payments</h1><p>Review returned payments, the reason for each reversal, and who recorded it.</p></div>
                    <div className={styles.headerActions}><Button variant="outline-secondary" disabled={loading || !employeeid || !branchid} onClick={() => getReversedPaymentsData(currentPage)}><RiRefreshLine size={16} aria-hidden="true" /> {loading ? 'Refreshing…' : 'Refresh'}</Button></div>
               </header>
               <section className={styles.summary} aria-label="Reversal summary">
                    <article><span>Matching reversals</span><strong>{Number(pagination.total).toLocaleString()}</strong><small>{appliedFilter.from || appliedFilter.to ? 'Within the applied date range' : 'Across all dates'}</small></article>
                    <article><span>Reversed amount · this page</span><strong>{currencyFormatter.format(reversedOnPage)}</strong><small>{reversals.length} records on page {currentPage}</small></article>
                    <article><span>Invoices · this page</span><strong>{new Set(reversals.map(row => row.invoice_number).filter(Boolean)).size}</strong><small>Distinct invoice numbers shown below</small></article>
               </section>
               <section className={styles.panel} aria-label="Reversal history" aria-busy={loading}>
                    <div className={styles.panelHeading}><h2>Reversal history</h2><p>Filter by date, then open a record to see the original payment and full reversal details.</p></div>
                    <form className={styles.filters} onSubmit={event => { event.preventDefault(); handleSearch(); }}>
                         <label htmlFor="reversed-from">From date<input id="reversed-from" type="date" className="form-control" name="from" value={localFilter.from} onChange={handleInputChange} disabled={loading} /></label>
                         <label htmlFor="reversed-to">To date<input id="reversed-to" type="date" className="form-control" name="to" min={localFilter.from || undefined} value={localFilter.to} onChange={handleInputChange} disabled={loading} /></label>
                         <Button type="submit" disabled={loading || !employeeid || !branchid}><RiFilter3Line size={16} aria-hidden="true" /> Apply filters</Button>
                         <Button variant="outline-secondary" onClick={handleClear} disabled={loading}>Clear filters</Button>
                    </form>
                    {error && <div className="alert alert-danger m-3" role="alert">{error}<button className="btn btn-link" type="button" disabled={loading} onClick={() => getReversedPaymentsData(currentPage)}>Retry</button></div>}
                    {loading ? <div className={styles.empty} role="status"><span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />Loading reversal history…</div> : !error && reversals.length === 0 ? <div className={styles.empty}><RiMoneyDollarCircleLine size={36} aria-hidden="true" /><h3>No reversals found</h3><p>{appliedFilter.from || appliedFilter.to ? 'Try a wider date range or clear the filters.' : 'Reversed expense payments will appear here when recorded.'}</p>{(appliedFilter.from || appliedFilter.to) && <Button variant="outline-secondary" onClick={handleClear}>Clear date filters</Button>}</div> : !error && <>
                         <div className={styles.tableWrap} tabIndex={0} role="region" aria-label="Payment reversals table; scroll horizontally for more columns">
                              <table className={styles.table}>
                                   <thead><tr><th scope="col">Reversal / invoice</th><th scope="col">Expense & reason</th><th scope="col" className={styles.numeric}>Original payment</th><th scope="col" className={styles.numeric}>Reversed amount</th><th scope="col">Recorded by</th><th scope="col">Reversed on</th><th scope="col">Details</th></tr></thead>
                                   <tbody>{reversals.map(row => <tr key={row.reversal_id}>
                                        <td><strong>#{row.reversal_id}</strong><small>Invoice {row.invoice_number || 'not recorded'}</small><span className={styles.badge}>{row.payment_method || 'Method not recorded'}</span></td>
                                        <td style={{ whiteSpace: 'normal', minWidth: 200, maxWidth: 320 }}><strong>{row.expense_name || 'Expense not recorded'}</strong><small style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{row.reversal_reason || 'No reason recorded'}</small></td>
                                        <td className={styles.numeric}>{currencyFormatter.format(Number(row.original_amount) || 0)}</td>
                                        <td className={`${styles.numeric} text-danger fw-semibold`}>{currencyFormatter.format(Number(row.reversed_amount) || 0)}</td>
                                        <td>{row.reversed_by_name || 'Not recorded'}</td><td>{dateLabel(row.reversed_on)}</td>
                                        <td><Button variant="outline-primary" size="sm" aria-label={`View reversal ${row.reversal_id}`} onClick={() => handleViewDetails(row)}><RiEyeLine size={16} aria-hidden="true" /> View details</Button></td>
                                   </tr>)}</tbody>
                              </table>
                         </div>
                         <footer className={styles.pagination}>
                              <span>Showing {reversals.length ? (currentPage - 1) * pagination.limit + 1 : 0}–{Math.min(currentPage * pagination.limit, pagination.total)} of {pagination.total} reversals</span>
                              <div><Button variant="outline-secondary" size="sm" disabled={currentPage <= 1 || loading} onClick={() => handlePageChange(currentPage - 1)}>Previous</Button><span aria-live="polite">Page {currentPage} of {totalPages}</span><Button variant="outline-secondary" size="sm" disabled={currentPage >= totalPages || loading} onClick={() => handlePageChange(currentPage + 1)}>Next</Button></div>
                         </footer>
                    </>}
               </section>

               {/* Detail Modal */}
               <Modal fullscreen="sm-down" scrollable data-expense-dialog="true" className={styles.dialog} show={showDetailModal} onHide={() => setShowDetailModal(false)} size="lg">
                    <Modal.Header closeButton>
                         <Modal.Title className="fw-bold">Reversal #{selectedReversal?.reversal_id}</Modal.Title>
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
                                                  <p className="text-muted mb-0">{dateLabel(selectedReversal.payment_date)}</p>
                                             </div>
                                        </div>
                                        <div className="col-md-6">
                                             <div className="mb-3">
                                                  <strong>Reversed On:</strong>
                                                  <p className="text-muted mb-0">{dateLabel(selectedReversal.reversed_on)}</p>
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
          </main>
     );
};

export default ReversedPaymentsPage;
