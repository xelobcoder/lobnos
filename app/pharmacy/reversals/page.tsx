'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import { RiCloseLine, RiRefund2Line, RiSearchLine } from '@remixicon/react';
import PrimeTable from '../../../components/accessories/Datatables/PrimeTable';
import { customFetch } from '../../../components/Auth/customFetch';

type ReversalType = 'refund' | 'void' | 'cancel';

type ReversedSale = {
     id: string;
     receiptNumber: string;
     customerName: string;
     paymentMethod: string;
     total: number;
     status: string;
     completedAt: string | null;
     cashierId: number;
     reversalType: ReversalType | null;
     reversalReason: string | null;
     reversedAt: string | null;
};

type SaleLine = {
     id: string;
     inventoryItemId: string;
     name: string;
     sku: string;
     quantity: number;
     unitPrice: number;
     lineTotal: number;
};

type SaleDetail = ReversedSale & {
     paymentReference: string | null;
     patientId: number | null;
     reversedBy: number | null;
     lines: SaleLine[];
};

const currency = new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS' });
const DEFAULT_PAGE_SIZE = 10;

const STATUS_BADGES: Record<string, string> = {
     refunded: 'text-bg-warning',
     voided: 'text-bg-danger',
     cancelled: 'text-bg-secondary',
};

const TYPE_FILTERS: { value: '' | ReversalType; label: string }[] = [
     { value: '', label: 'All reversals' },
     { value: 'refund', label: 'Refunded' },
     { value: 'void', label: 'Voided' },
     { value: 'cancel', label: 'Cancelled' },
];

export default function PharmacyReversalsPage() {
     const [searchTerm, setSearchTerm] = useState('');
     const [appliedSearch, setAppliedSearch] = useState('');
     const [typeFilter, setTypeFilter] = useState<'' | ReversalType>('');
     const [sales, setSales] = useState<ReversedSale[]>([]);
     const [total, setTotal] = useState(0);
     const [error, setError] = useState('');

     const [detail, setDetail] = useState<SaleDetail | null>(null);
     const [detailLoading, setDetailLoading] = useState(false);
     const [detailError, setDetailError] = useState('');

     const loadReversals = useCallback(
          async (page = 1, count = DEFAULT_PAGE_SIZE, search = '', type: '' | ReversalType = '') => {
               try {
                    setError('');
                    const response = await customFetch(
                         `pharmacy/sales/reversals?page=${page}&count=${count}&search=${encodeURIComponent(search)}&type=${type}`
                    );
                    if (response?.success) {
                         const currentSales: ReversedSale[] = response.data.sales || [];
                         setSales(currentSales);
                         setTotal(response.data.total || 0);
                         return { result: currentSales, error: false };
                    }
                    setError(response?.error?.message || 'Unable to load reversed sales.');
               } catch {
                    setError('Unable to load reversed sales.');
               }
               setSales([]);
               return { result: [], error: true };
          },
          []
     );


     const handleSeverSideProcessing = async ({ page, count, search, type }: { page: number; count: number; search?: string; type?: '' | ReversalType }) => {
          try {
               const response = await customFetch(
                    `pharmacy/sales/reversals?page=${page}&count=${count}&search=${encodeURIComponent(search || '')}&type=${type}`
               );
               if (response?.success && Array.isArray(response.data?.sales) && response.data?.sales?.length > 0) {
                    const currentSales: ReversedSale[] = response.data.sales || [];
                    return { result: currentSales, error: false };
               }
               return { result: [], error: false };
          } catch {
               return { result: [], error: true };
          }
     };

     useEffect(() => {
          loadReversals(1, DEFAULT_PAGE_SIZE, appliedSearch, typeFilter);
     }, [loadReversals, appliedSearch, typeFilter]);

     const submitSearch = (event: FormEvent) => {
          event.preventDefault();
          setAppliedSearch(searchTerm.trim());
     };

     const clearSearch = () => {
          setSearchTerm('');
          setAppliedSearch('');
     };

     const openDetail = async (sale: ReversedSale) => {
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

     const closeDetail = () => {
          setDetail(null);
          setDetailError('');
          setDetailLoading(false);
     };

     const columns = [
          {
               Header: 'Receipt',
               accessor: 'receiptNumber',
               Cell: ({ row }: { row: { original: ReversedSale } }) => (
                    <button type="button" className="btn btn-link p-0 fw-semibold text-decoration-none" onClick={() => openDetail(row.original)}>
                         {row.original.receiptNumber}
                    </button>
               ),
          },
          { Header: 'Customer', accessor: 'customerName' },
          { Header: 'Amount', accessor: 'total', Cell: ({ value }: { value: number }) => <span className="fw-bold">{currency.format(value)}</span> },
          {
               Header: 'Outcome',
               accessor: 'status',
               Cell: ({ value }: { value: string }) => (
                    <span className={`badge text-capitalize ${STATUS_BADGES[value] || 'text-bg-secondary'}`}>{value}</span>
               ),
          },
          {
               Header: 'Reason',
               accessor: 'reversalReason',
               Cell: ({ value }: { value: string | null }) => <span className="small">{value || '-'}</span>,
          },
          {
               Header: 'Sold',
               accessor: 'completedAt',
               Cell: ({ value }: { value: string | null }) => <span className="small text-muted">{value ? new Date(value).toLocaleDateString() : '-'}</span>,
          },
          {
               Header: 'Reversed',
               accessor: 'reversedAt',
               Cell: ({ value }: { value: string | null }) => (value ? new Date(value).toLocaleString() : '-'),
          },
     ];

     return (
          <div className="container-fluid p-4">
               <div className="d-flex flex-wrap justify-content-between align-items-end gap-3 mb-4">
                    <div>
                         <h2 className="mb-1"><RiRefund2Line className="me-2" />Refunded &amp; Voided Sales</h2>
                         <p className="text-muted mb-0">{total} reversed transaction{total === 1 ? '' : 's'}. Stock for these receipts was returned to inventory.</p>
                    </div>
                    <div className="d-flex flex-wrap align-items-end gap-2">
                         <form className="d-flex gap-2" onSubmit={submitSearch} role="search">
                              <div className="input-group" style={{ minWidth: '260px' }}>
                                   <span className="input-group-text bg-transparent border-end-0" style={{ borderColor: 'var(--bs-border-color)' }}>
                                        <RiSearchLine size={18} className="text-muted" />
                                   </span>
                                   <input
                                        type="search"
                                        className="form-control shadow-none border-start-0"
                                        style={{ borderColor: 'var(--bs-border-color)' }}
                                        value={searchTerm}
                                        onChange={(event) => setSearchTerm(event.target.value)}
                                        placeholder="Search receipt or customer"
                                        aria-label="Search reversed sales"
                                   />
                              </div>
                              <button type="submit" className="btn btn-primary">Search</button>
                              {appliedSearch && (
                                   <button type="button" className="btn btn-outline-secondary" onClick={clearSearch} aria-label="Clear search">
                                        <RiCloseLine size={18} />
                                   </button>
                              )}
                         </form>
                         <select
                              className="form-select"
                              style={{ width: 'auto' }}
                              value={typeFilter}
                              onChange={(event) => setTypeFilter(event.target.value as '' | ReversalType)}
                              aria-label="Filter by reversal type"
                         >
                              {TYPE_FILTERS.map((option) => (
                                   <option key={option.label} value={option.value}>{option.label}</option>
                              ))}
                         </select>
                    </div>
               </div>

               {appliedSearch && (
                    <p className="text-muted small mb-2">
                         Showing results for <span className="fw-semibold">&quot;{appliedSearch}&quot;</span>
                    </p>
               )}

               {error && <div className="alert alert-danger" role="alert">{error}</div>}

               <PrimeTable
                    column={columns}
                    data={sales}
                    filtering={false}
                    serverSideFiltering={true}
                    urlparams={{ search: appliedSearch, type: typeFilter }}
                    handleSeverSideProcessing={handleSeverSideProcessing}
               />

               {(detail || detailLoading || detailError) && (
                    <>
                         <div className="modal d-block" tabIndex={-1} role="dialog">
                              <div className="modal-dialog modal-lg modal-dialog-centered">
                                   <div className="modal-content">
                                        <div className="modal-header">
                                             <h5 className="modal-title">{detail ? `Receipt ${detail.receiptNumber}` : 'Transaction'}</h5>
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
                                                                 <small className="text-muted d-block">Sold</small>
                                                                 <span className="fw-semibold">{detail.completedAt ? new Date(detail.completedAt).toLocaleString() : '-'}</span>
                                                            </div>
                                                       </div>

                                                       <div className="alert alert-warning py-2">
                                                            <span className="fw-semibold text-capitalize">{detail.reversalType}</span>
                                                            {detail.reversedAt && <span className="text-muted"> on {new Date(detail.reversedAt).toLocaleString()}</span>}
                                                            <div>{detail.reversalReason}</div>
                                                       </div>

                                                       <div className="table-responsive">
                                                            <table className="table table-sm align-middle mb-0">
                                                                 <thead style={{ backgroundColor: 'var(--bs-tertiary-bg)' }}>
                                                                      <tr>
                                                                           <th>Item returned to stock</th>
                                                                           <th className="text-end">Qty</th>
                                                                           <th className="text-end">Unit price</th>
                                                                           <th className="text-end">Line total</th>
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
                                                                                <td className="text-end fw-semibold">{currency.format(line.lineTotal)}</td>
                                                                           </tr>
                                                                      ))}
                                                                 </tbody>
                                                                 <tfoot>
                                                                      <tr>
                                                                           <th colSpan={3} className="text-end">Total</th>
                                                                           <th className="text-end">{currency.format(detail.total)}</th>
                                                                      </tr>
                                                                 </tfoot>
                                                            </table>
                                                       </div>
                                                  </>
                                             )}
                                        </div>
                                        <div className="modal-footer">
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
