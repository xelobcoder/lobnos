'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { RiAlarmWarningLine, RiCloseLine, RiMedicineBottleLine, RiSearchLine, RiTruckLine } from '@remixicon/react';
import Link from 'next/link';
import PrimeTable from '../../../components/accessories/Datatables/PrimeTable';
import { customFetch } from '../../../components/Auth/customFetch';
import styles from '../pharmacy.module.css';

type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock';

type StockItem = {
     inventoryItemId: string;
     sku: string;
     name: string;
     unit: string;
     availableStock: number;
     minimumStock: number;
     salePrice: number;
     stockStatus: StockStatus;
};

type StockSummary = { totalItems: number; inStock: number; lowStock: number; outOfStock: number };

const STATUS_META: Record<StockStatus, { label: string; badge: string }> = {
     in_stock: { label: 'In stock', badge: 'text-bg-success' },
     low_stock: { label: 'Low stock', badge: 'text-bg-warning' },
     out_of_stock: { label: 'Out of stock', badge: 'text-bg-danger' },
};

const currency = new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS' });
const DEFAULT_PAGE_SIZE = 20;

export default function PharmacyStockPage() {
     const router = useRouter();
     const searchParams = useSearchParams();
     const lowStockOnly = searchParams.get('filter') === 'low';

     const [searchTerm, setSearchTerm] = useState('');
     const [appliedSearch, setAppliedSearch] = useState('');
     const [items, setItems] = useState<StockItem[]>([]);
     const [summary, setSummary] = useState<StockSummary>({ totalItems: 0, inStock: 0, lowStock: 0, outOfStock: 0 });
     const [error, setError] = useState('');
     const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

     const toggleSelected = (id: string) =>
          setSelectedIds((current) => {
               const next = new Set(current);
               if (next.has(id)) next.delete(id); else next.add(id);
               return next;
          });

     const allOnPageSelected = items.length > 0 && items.every((item) => selectedIds.has(item.inventoryItemId));
     const toggleSelectAllOnPage = () =>
          setSelectedIds((current) => {
               const next = new Set(current);
               if (allOnPageSelected) {
                    items.forEach((item) => next.delete(item.inventoryItemId));
               } else {
                    items.forEach((item) => next.add(item.inventoryItemId));
               }
               return next;
          });

     const restockSelected = () => {
          if (selectedIds.size === 0) return;
          router.push(`/inventory/orders?restockItemIds=${encodeURIComponent(Array.from(selectedIds).join(','))}`);
     };

     const loadStock = useCallback(
          async (page = 1, count = DEFAULT_PAGE_SIZE, search = '') => {
               try {
                    setError('');
                    const filter = lowStockOnly ? '&filter=low' : '';
                    const response = await customFetch(
                         `pharmacy/stock?page=${page}&count=${count}&search=${encodeURIComponent(search)}${filter}`
                    );
                    if (response?.success) {
                         const currentItems: StockItem[] = response.data.items || [];
                         setItems(currentItems);
                         setSummary(response.data.summary);
                         return { result: currentItems, error: false };
                    }
                    setError(response?.error?.message || 'Unable to load pharmacy stock levels.');
               } catch {
                    setError('Unable to load pharmacy stock levels.');
               }
               setItems([]);
               return { result: [], error: true };
          },
          [lowStockOnly]
     );

     useEffect(() => {
          loadStock(1, DEFAULT_PAGE_SIZE, appliedSearch);
     }, [loadStock, appliedSearch]);

     const submitSearch = (event: FormEvent) => {
          event.preventDefault();
          setAppliedSearch(searchTerm.trim());
     };

     const clearSearch = () => {
          setSearchTerm('');
          setAppliedSearch('');
     };

     const metrics = [
          { label: 'Tracked items', value: summary.totalItems, Icon: RiMedicineBottleLine },
          { label: 'Healthy stock', value: summary.inStock, Icon: RiMedicineBottleLine },
          { label: 'Low stock', value: summary.lowStock, Icon: RiAlarmWarningLine },
          { label: 'Out of stock', value: summary.outOfStock, Icon: RiAlarmWarningLine },
     ];

     const columns = [
          {
               Header: () => (
                    <input
                         type="checkbox"
                         className="form-check-input"
                         checked={allOnPageSelected}
                         onChange={toggleSelectAllOnPage}
                         aria-label="Select all items on this page"
                    />
               ),
               accessor: 'select',
               Cell: ({ row }: { row: { original: StockItem } }) => (
                    <input
                         type="checkbox"
                         className="form-check-input"
                         checked={selectedIds.has(row.original.inventoryItemId)}
                         onChange={() => toggleSelected(row.original.inventoryItemId)}
                         aria-label={`Select ${row.original.name}`}
                    />
               ),
          },
          {
               Header: 'Item',
               accessor: 'name',
               Cell: ({ row }: { row: { original: StockItem } }) => (
                    <div>
                         <div className="fw-semibold">{row.original.name}</div>
                         <small className="text-muted">{row.original.unit}</small>
                    </div>
               ),
          },
          { Header: 'SKU', accessor: 'sku', Cell: ({ value }: { value: string }) => <small className="text-muted">{value}</small> },
          { Header: 'On hand', accessor: 'availableStock', Cell: ({ value }: { value: number }) => <span className="fw-semibold">{value}</span> },
          { Header: 'Reorder level', accessor: 'minimumStock', Cell: ({ value }: { value: number }) => <span className="text-muted">{value}</span> },
          { Header: 'Unit price', accessor: 'salePrice', Cell: ({ value }: { value: number }) => currency.format(value) },
          {
               Header: 'Status',
               accessor: 'stockStatus',
               Cell: ({ value }: { value: StockStatus }) => <span className={`badge ${STATUS_META[value].badge}`}>{STATUS_META[value].label}</span>,
          },
          {
               Header: 'Restock',
               accessor: 'inventoryItemId',
               Cell: ({ row }: { row: { original: StockItem } }) => (
                    <Link
                         href={`/inventory/orders?restockItemId=${encodeURIComponent(row.original.inventoryItemId)}`}
                         className={`btn btn-sm d-inline-flex align-items-center gap-1 ${row.original.stockStatus === 'in_stock' ? 'btn-outline-secondary' : 'btn-outline-primary'
                              }`}
                         title={`Create a purchase order for ${row.original.name}`}
                    >
                         <RiTruckLine size={16} />
                         Restock
                    </Link>
               ),
          },
     ];

     return (
          <div className={styles.workspace}>
               <div className="d-flex flex-wrap justify-content-between align-items-end gap-3 mb-4">
                    <div>
                         <h4 className="fw-bold mb-1">
                              {lowStockOnly ? <RiAlarmWarningLine className="me-2" /> : <RiMedicineBottleLine className="me-2" />}
                              {lowStockOnly ? 'Low stock alerts' : 'Pharmacy stock levels'}
                         </h4>
                         <small className="text-muted">
                              {lowStockOnly
                                   ? 'Pharmacy items that have reached or fallen below their reorder level.'
                                   : 'Live stock position for every item in the Pharmacy category.'}
                         </small>
                    </div>
                    <button
                         type="button"
                         className="btn btn-primary d-flex align-items-center gap-2"
                         disabled={selectedIds.size === 0}
                         onClick={restockSelected}
                    >
                         <RiTruckLine size={18} />
                         Restock selected {selectedIds.size > 0 ? `(${selectedIds.size})` : ''}
                    </button>
                    <form className="d-flex gap-2" onSubmit={submitSearch} role="search">
                         <div className="input-group" style={{ minWidth: '280px' }}>
                              <span className="input-group-text bg-transparent border-end-0" style={{ borderColor: 'var(--bs-border-color)' }}>
                                   <RiSearchLine size={18} className="text-muted" />
                              </span>
                              <input
                                   type="search"
                                   className="form-control shadow-none border-start-0"
                                   style={{ borderColor: 'var(--bs-border-color)' }}
                                   value={searchTerm}
                                   onChange={(event) => setSearchTerm(event.target.value)}
                                   placeholder="Search by name or SKU"
                                   aria-label="Search pharmacy stock"
                              />
                         </div>
                         <button type="submit" className="btn btn-primary">
                              Search
                         </button>
                         {appliedSearch && (
                              <button type="button" className="btn btn-outline-secondary" onClick={clearSearch} aria-label="Clear search">
                                   <RiCloseLine size={18} />
                              </button>
                         )}
                    </form>
               </div>

               <section className="row g-3 mb-4" aria-label="Pharmacy stock summary">
                    {metrics.map(({ label, value, Icon }) => (
                         <div key={label} className="col-6 col-lg-3">
                              <div className="p-3 border rounded-2 h-100" style={{ backgroundColor: '#FFFFFF', borderColor: '#212529' }}>
                                   <div className="d-flex align-items-start gap-3">
                                        <div className="flex-shrink-0 p-2 rounded-2" style={{ border: '1px solid #212529' }}>
                                             <Icon size={24} style={{ color: '#212529' }} />
                                        </div>
                                        <div className="flex-grow-1">
                                             <small className="text-muted text-uppercase fw-semibold" style={{ fontSize: '0.75rem' }}>
                                                  {label}
                                             </small>
                                             <div className="fs-4 fw-bold mb-1 text-dark">
                                                  {value}
                                             </div>
                                        </div>
                                   </div>
                              </div>
                         </div>
                    ))}
               </section>

               {appliedSearch && (
                    <p className="text-muted small mb-2">
                         Showing results for <span className="fw-semibold">&quot;{appliedSearch}&quot;</span>
                    </p>
               )}

               {error && (
                    <div className="alert alert-danger" role="alert">
                         {error}
                    </div>
               )}

               <PrimeTable
                    column={columns}
                    data={items}
                    filtering={false}
                    serverSideFiltering={true}
                    urlparams={{ search: appliedSearch }}
                    handleSeverSideProcessing={({ page, count, search }: { page: number; count: number; search?: string }) =>
                         loadStock(page, count, search ?? appliedSearch)
                    }
               />
          </div>
     );
}
