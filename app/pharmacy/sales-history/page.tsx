'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import { RiEyeLine, RiFileListLine, RiRefund2Line } from '@remixicon/react';
import PrimeTable from '../../../components/accessories/Datatables/PrimeTable';
import { customFetch, customFetchMutation } from '../../../components/Auth/customFetch';

type ReversalType = 'refund' | 'void' | 'cancel';

type SaleLine = {
     id: string;
     inventoryItemId: string;
     name: string;
     sku: string;
     quantity: number;
     unitPrice: number;
     lineTotal: number;
     unitCost: number;
     lineCost: number;
     grossProfit: number;
};

type Sale = {
     id: string;
     receiptNumber: string;
     customerName: string;
     paymentMethod: string;
     total: number;
     totalCost: number;
     grossProfit: number;
     status: string;
     completedAt: string | null;
     cashierId: number;
     reversalType: ReversalType | null;
     reversalReason: string | null;
     reversedAt: string | null;
};

type SaleDetail = Sale & {
     paymentReference: string | null;
     patientId: number | null;
     reversedBy: number | null;
     lines: SaleLine[];
};

const currency = new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS' });
const DEFAULT_PAGE_SIZE = 10;
const OTHER_REASON = 'Other (specify)';

const saleRowStyling = {
     type: 'custom',
     getRowClassName: (sale: Sale) => {
          if (sale.status === 'refunded') return 'table-warning';
          if (sale.status === 'voided') return 'table-danger';
          return '';
     },
     getRowStyle: (sale: Sale) => {
          if (sale.status === 'refunded') return { backgroundColor: '#fff3cd', color: '#664d03' };
          if (sale.status === 'voided') return { backgroundColor: '#f8d7da', color: '#842029' };
          return {};
     },
};

const SalesHistoryTable = PrimeTable as any;

const REVERSAL_OPTIONS: { value: ReversalType; label: string; help: string }[] = [
     { value: 'refund', label: 'Refund', help: 'Money is returned to the customer and the goods come back into stock.' },
     { value: 'void', label: 'Void', help: 'The sale was recorded in error and is nullified. Stock is returned.' },
     { value: 'cancel', label: 'Cancel', help: 'The sale is cancelled before the customer took the goods. Stock is returned.' },
];

const COMMON_REASONS: Record<ReversalType, string[]> = {
     refund: [
          'Customer returned the medicine',
          'Wrong item dispensed',
          'Wrong quantity dispensed',
          'Customer was overcharged',
          'Expired or damaged product',
     ],
     void: [
          'Duplicate transaction',
          'Wrong item billed',
          'Wrong quantity billed',
          'Wrong price applied',
          'Sale captured on the wrong customer',
     ],
     cancel: [
          'Customer changed their mind',
          'Payment was not completed',
          'Item out of stock at collection',
          'Prescription could not be verified',
     ],
};

export default function PharmacySalesHistoryPage() {
     const [sales, setSales] = useState<Sale[]>([]);
     const [error, setError] = useState<string | null>(null);
     const [notice, setNotice] = useState<string | null>(null);
     const [lastQuery, setLastQuery] = useState({ page: 1, count: DEFAULT_PAGE_SIZE });

     const [target, setTarget] = useState<Sale | null>(null);
     const [reversalType, setReversalType] = useState<ReversalType>('refund');
     const [selectedReason, setSelectedReason] = useState('');
     const [customReason, setCustomReason] = useState('');
     const [submitting, setSubmitting] = useState(false);
     const [modalError, setModalError] = useState('');

     const [detail, setDetail] = useState<SaleDetail | null>(null);
     const [detailLoading, setDetailLoading] = useState(false);
     const [detailError, setDetailError] = useState('');

     const effectiveReason = selectedReason === OTHER_REASON || !selectedReason ? customReason.trim() : selectedReason;

     const loadSales = useCallback(async (page = 1, count = DEFAULT_PAGE_SIZE) => {
          try {
               setError(null);
               setLastQuery({ page, count });
               const response = await customFetch(`pharmacy/sales-history?page=${page}&count=${count}`);
               if (response?.success) {
                    const currentSales: Sale[] = response.data.sales || [];
                    setSales(currentSales);
                    return { result: currentSales, error: false };
               }
               setError(response?.error?.message || 'Unable to load pharmacy sales history.');
          } catch {
               setError('Unable to load pharmacy sales history.');
          }
          return { result: [], error: true };
     }, []);


     const handleServerProcessing = async (pagination: { page: number, count: number }) => {
          try {
               const { page, count } = pagination;
               const response = await customFetch(`pharmacy/sales-history?page=${page}&count=${count}`);
               if (response?.success && response.data.sales && Array.isArray(response.data.sales)) {
                    const currentSales: Sale[] = response.data.sales || [];
                    return { result: currentSales, error: false };
               } else {
                    return { result: [], error: true }
               }
          } catch (err) {
               return { result: [], error: true }
          }
     };

     useEffect(() => { loadSales(); }, [loadSales]);

     const openReversal = (sale: Sale) => {
          setTarget(sale);
          setReversalType('refund');
          setSelectedReason('');
          setCustomReason('');
          setModalError('');
     };

     const chooseReversalType = (type: ReversalType) => {
          setReversalType(type);
          setSelectedReason('');
     };

     const closeDetail = () => {
          setDetail(null);
          setDetailError('');
          setDetailLoading(false);
     };

     const openDetail = async (sale: Sale) => {
          setDetail(null);
          setDetailError('');
          setDetailLoading(true);
          try {
               const response = await customFetch(`pharmacy/sales/${sale.id}`);
               if (response?.success) setDetail(response.data);
               else setDetailError(response?.error?.message || 'Unable to load this transaction.');
          } catch {
               setDetailError('Unable to load this transaction.');
          } finally {
               setDetailLoading(false);
          }
     };

     const submitReversal = async (event: FormEvent) => {
          event.preventDefault();
          if (!target) return;
          setSubmitting(true);
          setModalError('');
          try {
               const response = await customFetchMutation(`pharmacy/sales/${target.id}/reverse`, 'POST', { type: reversalType, reason: effectiveReason });
               if (response?.success) {
                    setNotice(`Receipt ${target.receiptNumber} was ${response.data.status}. ${response.data.restockedItems.length} item(s) returned to stock.`);
                    setTarget(null);
                    await loadSales(lastQuery.page, lastQuery.count);
                    return;
               }
               setModalError(response?.error?.message || 'Unable to reverse this sale.');
          } catch {
               setModalError('Unable to reverse this sale.');
          } finally {
               setSubmitting(false);
          }
     };

     const columns = [
          {
               Header: 'Receipt',
               accessor: 'receiptNumber',
               Cell: ({ row }: { row: { original: Sale } }) => (
                    <button type="button" className="btn btn-link p-0 fw-semibold text-decoration-none" onClick={() => openDetail(row.original)}>
                         {row.original.receiptNumber}
                    </button>
               ),
          },
          { Header: 'Customer', accessor: 'customerName' },
          { Header: 'Payment', accessor: 'paymentMethod', Cell: ({ value }: { value: string }) => value.replace('_', ' ') },
          { Header: 'Total', accessor: 'total', Cell: ({ value }: { value: number }) => <span className="fw-bold">{currency.format(value)}</span> },
          { Header: 'Cost', accessor: 'totalCost', Cell: ({ value }: { value: number }) => currency.format(value) },
          { Header: 'Profit', accessor: 'grossProfit', Cell: ({ value }: { value: number }) => <span className={value >= 0 ? 'text-success fw-bold' : 'text-danger fw-bold'}>{currency.format(value)}</span> },
          { Header: 'Completed', accessor: 'completedAt', Cell: ({ value }: { value: string | null }) => value ? new Date(value).toLocaleString() : '-' },
          {
               Header: 'Status',
               accessor: 'status',
               Cell: ({ row }: { row: { original: Sale } }) => (
                    <div>
                         <span className="text-capitalize">{row.original.status}</span>
                         {row.original.reversalReason && (
                              <div className="small text-muted mt-1" title={row.original.reversalReason}>{row.original.reversalReason}</div>
                         )}
                    </div>
               ),
          },
          {
               Header: 'Action',
               accessor: 'id',
               Cell: ({ row }: { row: { original: Sale } }) => (
                    <div className="d-flex gap-2">
                         <button type="button" className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1" onClick={() => openDetail(row.original)}>
                              <RiEyeLine size={16} />
                              View
                         </button>
                         {row.original.status === 'completed' && (
                              <button type="button" className="btn btn-sm btn-outline-danger d-inline-flex align-items-center gap-1" onClick={() => openReversal(row.original)}>
                                   <RiRefund2Line size={16} />
                                   Reverse
                              </button>
                         )}
                    </div>
               ),
          },
     ];

     return (
          <div className="container-fluid p-4">
               <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
                    <div>
                         <h2 className="mb-1"><RiFileListLine className="me-2" />Pharmacy Sales History</h2>
                         <p className="text-muted mb-0">Completed pharmacy sales and receipts</p>
                    </div>
               </div>

               {error && <div className="alert alert-danger" role="alert">{error}</div>}
               {notice && (
                    <div className="alert alert-success alert-dismissible" role="alert">
                         {notice}
                         <button type="button" className="btn-close" onClick={() => setNotice(null)} aria-label="Dismiss" />
                    </div>
               )}

               <SalesHistoryTable
                    column={columns}
                    data={sales}
                    filtering={true}
                    serverSideFiltering={true}
                    rowStyling={saleRowStyling}
                    handleSeverSideProcessing={handleServerProcessing}
               />

               {target && (
                    <>
                         <div className="modal d-block" tabIndex={-1} role="dialog">
                              <div className="modal-dialog mt-3">
                                   <form className="modal-content" onSubmit={submitReversal}>
                                        <div className="modal-header">
                                             <h5 className="modal-title">Reverse receipt {target.receiptNumber}</h5>
                                             <button type="button" className="btn-close" onClick={() => setTarget(null)} aria-label="Close" />
                                        </div>
                                        <div className="modal-body">
                                             <p className="text-muted small">
                                                  {target.customerName} &middot; {currency.format(target.total)}. Every item on this receipt returns to stock.
                                             </p>

                                             {REVERSAL_OPTIONS.map((option) => (
                                                  <div className="form-check mb-2" key={option.value}>
                                                       <input
                                                            className="form-check-input"
                                                            type="radio"
                                                            name="reversalType"
                                                            id={`reversal-${option.value}`}
                                                            value={option.value}
                                                            checked={reversalType === option.value}
                                                            onChange={() => chooseReversalType(option.value)}
                                                       />
                                                       <label className="form-check-label" htmlFor={`reversal-${option.value}`}>
                                                            <span className="fw-semibold">{option.label}</span>
                                                            <small className="d-block text-muted">{option.help}</small>
                                                       </label>
                                                  </div>
                                             ))}

                                             <label className="form-label mt-3" htmlFor="reversal-reason-select">Reason</label>
                                             <select
                                                  id="reversal-reason-select"
                                                  className="form-select"
                                                  value={selectedReason}
                                                  onChange={(event) => setSelectedReason(event.target.value)}
                                             >
                                                  <option value="">Select a reason...</option>
                                                  {COMMON_REASONS[reversalType].map((option) => (
                                                       <option key={option} value={option}>{option}</option>
                                                  ))}
                                                  <option value={OTHER_REASON}>{OTHER_REASON}</option>
                                             </select>

                                             {(selectedReason === OTHER_REASON || !selectedReason) && (
                                                  <textarea
                                                       className="form-control mt-2"
                                                       rows={3}
                                                       value={customReason}
                                                       onChange={(event) => setCustomReason(event.target.value)}
                                                       placeholder="Type the reason if it is not in the list"
                                                       maxLength={500}
                                                       aria-label="Custom reversal reason"
                                                  />
                                             )}
                                             <small className="text-muted">Recorded against your name for audit.</small>

                                             {modalError && <div className="alert alert-danger mt-3 mb-0 py-2">{modalError}</div>}
                                        </div>
                                        <div className="modal-footer">
                                             <button type="button" className="btn btn-outline-secondary" onClick={() => setTarget(null)} disabled={submitting}>
                                                  Cancel
                                             </button>
                                             <button type="submit" className="btn btn-danger" disabled={submitting || effectiveReason.length < 5}>
                                                  {submitting ? 'Reversing...' : `Confirm ${reversalType}`}
                                             </button>
                                        </div>
                                   </form>
                              </div>
                         </div>
                         <div className="modal-backdrop fade show" />
                    </>
               )}

               {(detail || detailLoading || detailError) && (
                    <>
                         <div className="modal d-block" tabIndex={-1} role="dialog">
                              <div className="modal-dialog modal-lg mt-3">
                                   <div className="modal-content">
                                        <div className="modal-header">
                                             <h5 className="modal-title">
                                                  {detail ? `Receipt ${detail.receiptNumber}` : 'Transaction'}
                                             </h5>
                                             <button type="button" className="btn-close" onClick={closeDetail} aria-label="Close" />
                                        </div>
                                        <div className="modal-body">
                                             {detailLoading && <p className="text-muted mb-0">Loading transaction...</p>}
                                             {detailError && <div className="alert alert-danger mb-0">{detailError}</div>}

                                             {detail && (
                                                  <>
                                                       <div className="row g-3 mb-3">
                                                            <div className="col-sm-6">
                                                                 <small className="text-muted d-block">Customer</small>
                                                                 <span className="fw-semibold">{detail.customerName}</span>
                                                            </div>
                                                            <div className="col-sm-6">
                                                                 <small className="text-muted d-block">Completed</small>
                                                                 <span className="fw-semibold">{detail.completedAt ? new Date(detail.completedAt).toLocaleString() : '-'}</span>
                                                            </div>
                                                            <div className="col-sm-6">
                                                                 <small className="text-muted d-block">Payment</small>
                                                                 <span className="fw-semibold text-capitalize">{detail.paymentMethod.replace('_', ' ')}</span>
                                                                 {detail.paymentReference && <small className="text-muted d-block">Ref: {detail.paymentReference}</small>}
                                                            </div>
                                                            <div className="col-sm-6">
                                                                 <small className="text-muted d-block">Status</small>
                                                                 <span className="text-capitalize">{detail.status}</span>
                                                            </div>
                                                       </div>

                                                       {detail.reversalReason && (
                                                            <div className="alert alert-warning py-2">
                                                                 <span className="fw-semibold text-capitalize">{detail.reversalType}</span>
                                                                 {detail.reversedAt && <span className="text-muted"> on {new Date(detail.reversedAt).toLocaleString()}</span>}
                                                                 <div>{detail.reversalReason}</div>
                                                            </div>
                                                       )}

                                                       <div className="table-responsive">
                                                            <table className="table table-sm align-middle mb-0">
                                                                 <thead style={{ backgroundColor: 'var(--bs-tertiary-bg)' }}>
                                                                      <tr>
                                                                           <th>Item</th>
                                                                           <th className="text-end">Qty</th>
                                                                           <th className="text-end">Unit price</th>
                                                                           <th className="text-end">Unit cost</th>
                                                                           <th className="text-end">Line total</th>
                                                                           <th className="text-end">Profit</th>
                                                                      </tr>
                                                                 </thead>
                                                                 <tbody>
                                                                      {detail.lines.map((line) => (
                                                                           <tr key={line.id}>
                                                                                <td>
                                                                                     <div className="fw-semibold">{line.name}</div>
                                                                                     <small className="text-muted">{line.sku}</small>
                                                                                </td>
                                                                                <td className="text-end">{line.quantity}</td>
                                                                                <td className="text-end">{currency.format(line.unitPrice)}</td>
                                                                                <td className="text-end">{currency.format(line.unitCost)}</td>
                                                                                <td className="text-end fw-semibold">{currency.format(line.lineTotal)}</td>
                                                                                <td className={`text-end fw-semibold ${line.grossProfit >= 0 ? 'text-success' : 'text-danger'}`}>{currency.format(line.grossProfit)}</td>
                                                                           </tr>
                                                                      ))}
                                                                 </tbody>
                                                                 <tfoot>
                                                                      <tr>
                                                                           <th colSpan={3} className="text-end">Totals</th>
                                                                           <th className="text-end">{currency.format(detail.totalCost)}</th>
                                                                           <th className="text-end">{currency.format(detail.total)}</th>
                                                                           <th className={`text-end ${detail.grossProfit >= 0 ? 'text-success' : 'text-danger'}`}>{currency.format(detail.grossProfit)}</th>
                                                                      </tr>
                                                                 </tfoot>
                                                            </table>
                                                       </div>
                                                  </>
                                             )}
                                        </div>
                                        <div className="modal-footer">
                                             {detail?.status === 'completed' && (
                                                  <button
                                                       type="button"
                                                       className="btn btn-outline-danger d-inline-flex align-items-center gap-1"
                                                       onClick={() => { const sale = detail; closeDetail(); openReversal(sale); }}
                                                  >
                                                       <RiRefund2Line size={16} />
                                                       Reverse
                                                  </button>
                                             )}
                                             <button type="button" className="btn btn-outline-secondary" onClick={closeDetail}>Close</button>
                                        </div>
                                   </div>
                              </div>
                         </div>
                         <div className="modal-backdrop fade show" />
                    </>
               )}
          </div>
     );
}