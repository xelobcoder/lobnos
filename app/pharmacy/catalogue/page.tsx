'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import { RiCloseLine, RiMedicineBottleLine, RiSearchLine, RiShoppingCartLine, RiTruckLine } from '@remixicon/react';
import Link from 'next/link';
import { customFetch } from '../../../components/Auth/customFetch';
import PrimeTable from '../../../components/accessories/Datatables/PrimeTable';
import styles from '../pharmacy.module.css';

type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock';
type SortField = 'name' | 'sku' | 'salePrice' | 'availableStock' | 'minimumStock';
type SortDirection = 'asc' | 'desc';

type CatalogueItem = {
     inventoryItemId: string;
     sku: string;
     name: string;
     unit: string;
     availableStock: number;
     minimumStock: number;
     salePrice: number;
     stockStatus: StockStatus;
};

const STATUS_META: Record<StockStatus, { label: string; badge: string }> = {
     in_stock: { label: 'In stock', badge: 'text-bg-success' },
     low_stock: { label: 'Low stock', badge: 'text-bg-warning' },
     out_of_stock: { label: 'Out of stock', badge: 'text-bg-danger' },
};

const currency = new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS' });
const DEFAULT_PAGE_SIZE = 10;

const SORT_FIELDS: { value: SortField; label: string }[] = [
     { value: 'name', label: 'Name' },
     { value: 'sku', label: 'SKU' },
     { value: 'salePrice', label: 'Unit price' },
     { value: 'availableStock', label: 'On hand' },
     { value: 'minimumStock', label: 'Reorder level' },
];

export default function PharmacyCataloguePage() {
     const [searchTerm, setSearchTerm] = useState('');
     const [appliedSearch, setAppliedSearch] = useState('');
     const [sortBy, setSortBy] = useState<SortField>('name');
     const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
     const [items, setItems] = useState<CatalogueItem[]>([]);
     const [total, setTotal] = useState(0);
     const [error, setError] = useState('');

     const loadCatalogue = useCallback(
          async (page = 1, count = DEFAULT_PAGE_SIZE, search = '', field: SortField = 'name', direction: SortDirection = 'asc') => {
               try {
                    setError('');
                    const response = await customFetch(
                         `pharmacy/catalogue?page=${page}&count=${count}&sortBy=${field}&sortDirection=${direction}&search=${encodeURIComponent(search)}`
                    );
                    if (response?.success) {
                         const currentItems: CatalogueItem[] = response.data.items || [];
                         setItems(currentItems);
                         setTotal(response.data.total || 0);
                         return { result: currentItems, error: false };
                    }
                    setError(response?.error?.message || 'Unable to load pharmacy items.');
               } catch {
                    setError('Unable to load pharmacy items.');
               }
               setItems([]);
               return { result: [], error: true };
          },
          []
     );

     useEffect(() => {
          loadCatalogue(1, DEFAULT_PAGE_SIZE, appliedSearch, sortBy, sortDirection);
     }, [loadCatalogue, appliedSearch, sortBy, sortDirection]);

     const submitSearch = (event: FormEvent) => {
          event.preventDefault();
          setAppliedSearch(searchTerm.trim());
     };

     const clearSearch = () => {
          setSearchTerm('');
          setAppliedSearch('');
     };

     const columns = [
          {
               Header: 'Item',
               accessor: 'name',
               Cell: ({ row }: { row: { original: CatalogueItem } }) => (
                    <div>
                         <div className="fw-semibold">{row.original.name}</div>
                         <small className="text-muted">{row.original.unit}</small>
                    </div>
               ),
          },
          { Header: 'SKU', accessor: 'sku', Cell: ({ value }: { value: string }) => <small className="text-muted">{value}</small> },
          { Header: 'Unit price', accessor: 'salePrice', Cell: ({ value }: { value: number }) => <span className="fw-bold text-success">{currency.format(value)}</span> },
          { Header: 'On hand', accessor: 'availableStock', Cell: ({ value }: { value: number }) => <span className="fw-semibold">{value}</span> },
          {
               Header: 'Status',
               accessor: 'stockStatus',
               Cell: ({ value }: { value: StockStatus }) => <span className={`badge ${STATUS_META[value].badge}`}>{STATUS_META[value].label}</span>,
          },
          {
               Header: 'Restock',
               accessor: 'inventoryItemId',
               Cell: ({ row }: { row: { original: CatalogueItem } }) => (
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
                              <RiMedicineBottleLine className="me-2" />
                              Pharmacy items
                         </h4>
                         <small className="text-muted">{total} item{total === 1 ? '' : 's'} in the Pharmacy category</small>
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
                                        placeholder="Search by name or SKU"
                                        aria-label="Search pharmacy items"
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
                         <select
                              className="form-select"
                              style={{ width: 'auto' }}
                              value={sortBy}
                              onChange={(event) => setSortBy(event.target.value as SortField)}
                              aria-label="Sort field"
                         >
                              {SORT_FIELDS.map((field) => (
                                   <option key={field.value} value={field.value}>
                                        Sort by {field.label}
                                   </option>
                              ))}
                         </select>
                         <select
                              className="form-select"
                              style={{ width: 'auto' }}
                              value={sortDirection}
                              onChange={(event) => setSortDirection(event.target.value as SortDirection)}
                              aria-label="Sort direction"
                         >
                              <option value="asc">Ascending</option>
                              <option value="desc">Descending</option>
                         </select>
                         <Link href="/pharmacy/sell" className="btn btn-success d-flex align-items-center gap-2">
                              <RiShoppingCartLine size={18} />
                              Sell
                         </Link>
                    </div>
               </div>

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
                    urlparams={{ search: appliedSearch, sortBy, sortDirection }}
                    handleSeverSideProcessing={({
                         page,
                         count,
                         search,
                         sortBy: field,
                         sortDirection: direction,
                    }: {
                         page: number;
                         count: number;
                         search?: string;
                         sortBy?: SortField;
                         sortDirection?: SortDirection;
                    }) => loadCatalogue(page, count, search ?? appliedSearch, field ?? sortBy, direction ?? sortDirection)}
               />
          </div>
     );
}
