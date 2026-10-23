'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import { RiCloseLine, RiMedicineBottleLine, RiSearchLine, RiShoppingCartLine, RiTruckLine } from '@remixicon/react';
import Link from 'next/link';
import { customFetch, customFetchMutation } from '../../../components/Auth/customFetch';
import { useApplicationSettings } from '../../../components/Auth/useApplicationContext';
import PrimeTable from '../../../components/accessories/Datatables/PrimeTable';
import PharmacyStockUpModal, { PharmacyStockUpItem } from '../components/PharmacyStockUpModal';
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
     dispensableStock?:number;
     requiresPrescription?:boolean;
     batchTracking?:boolean;
     minimumStock: number;
     wholesalePrice: number;
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
     const role=String(useApplicationSettings().applicationsettings?.user?.role||'').toLowerCase().replace(/[ _-]/g,'');
     const canConfigure=['superadmin','admin','manager','pharmacymanager'].includes(role);
     const [profile,setProfile]=useState<CatalogueItem|null>(null),[profileBusy,setProfileBusy]=useState(false);
     const employeeId = Number(useApplicationSettings().applicationsettings?.user?.employeeid || 0);
     const [searchTerm, setSearchTerm] = useState('');
     const [appliedSearch, setAppliedSearch] = useState('');
     const [sortBy, setSortBy] = useState<SortField>('name');
     const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
     const [items, setItems] = useState<CatalogueItem[]>([]);
     const [total, setTotal] = useState(0);
     const [error, setError] = useState('');
     const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
     const [stockUpItems, setStockUpItems] = useState<PharmacyStockUpItem[]>([]);

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
          setStockUpItems(items.filter((item) => selectedIds.has(item.inventoryItemId)));
     };

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

     const saveProfile=async()=>{
          if(!profile||profileBusy)return;setProfileBusy(true);
          try{const response=await customFetchMutation('pharmacy/catalogue/'+profile.inventoryItemId+'/profile','PUT',{requiresPrescription:!!profile.requiresPrescription,batchTracking:profile.batchTracking!==false});if(!response?.success)throw new Error(response?.error?.message||'Unable to update dispensing controls');setProfile(null);await loadCatalogue(1,DEFAULT_PAGE_SIZE,appliedSearch,sortBy,sortDirection);}catch(error){setError(error instanceof Error?error.message:'Unable to save');}finally{setProfileBusy(false);}
     };
     const columns = [
          {Header:"Dispensing controls",accessor:"controls",Cell:({row}:{row:{original:CatalogueItem}})=><div><div className="small">{row.original.requiresPrescription?"Prescription required":"Walk-in sale allowed"} · {row.original.batchTracking!==false?"Batch and expiry required":"General merchandise"}</div><div className="small text-muted">Dispensable: {row.original.dispensableStock||0}</div>{canConfigure&&<button className="btn btn-sm btn-outline-secondary mt-1" onClick={()=>setProfile({...row.original})}>Configure</button>}</div>},
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
               Cell: ({ row }: { row: { original: CatalogueItem } }) => (
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
                    <button
                         type="button"
                         className={`btn btn-sm d-inline-flex align-items-center gap-1 ${row.original.stockStatus === 'in_stock' ? 'btn-outline-secondary' : 'btn-outline-primary'
                              }`}
                         title={`Stock up ${row.original.name}`}
                         onClick={() => setStockUpItems([row.original])}
                    >
                         <RiTruckLine size={16} />
                         Restock
                    </button>
               ),
          },
     ];

     return (
          <div className={styles.workspace}>
               {stockUpItems.length > 0 && employeeId > 0 && <PharmacyStockUpModal items={stockUpItems} employeeId={employeeId} onClose={() => setStockUpItems([])} onCompleted={async () => { setSelectedIds(new Set()); await loadCatalogue(1, DEFAULT_PAGE_SIZE, appliedSearch, sortBy, sortDirection); }} />}
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
                         <Link href="/pharmacy/sell?isOpenSideBarShow=false" className="btn btn-success d-flex align-items-center gap-2">
                              <RiShoppingCartLine size={18} />
                              Sell
                         </Link>
                         <button
                              type="button"
                              className="btn btn-primary d-flex align-items-center gap-2"
                              disabled={selectedIds.size === 0}
                              onClick={restockSelected}
                         >
                              <RiTruckLine size={18} />
                              Restock selected {selectedIds.size > 0 ? `(${selectedIds.size})` : ''}
                         </button>
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

               {profile&&<div className="modal d-block" role="dialog" aria-modal="true" aria-label="Dispensing controls" style={{background:'rgba(0,0,0,.4)'}}><div className="modal-dialog"><div className="modal-content"><div className="modal-header"><h2 className="h5 mb-0">Dispensing controls · {profile.name}</h2><button className="btn-close" disabled={profileBusy} onClick={()=>setProfile(null)} aria-label="Close"/></div><div className="modal-body"><label className="form-check"><input className="form-check-input" type="checkbox" checked={!!profile.requiresPrescription} onChange={event=>setProfile({...profile,requiresPrescription:event.target.checked})}/>Prescription required</label><label className="form-check mt-3"><input className="form-check-input" type="checkbox" checked={profile.batchTracking!==false} onChange={event=>setProfile({...profile,batchTracking:event.target.checked})}/>Require manufacturer batch and expiry</label><p className="small text-muted mt-2">Keep batch and expiry tracking enabled for medicines. Disable it only for general merchandise that does not require expiry tracking. Changes are audited.</p></div><div className="modal-footer"><button className="btn btn-primary" disabled={profileBusy} onClick={saveProfile}>{profileBusy?'Saving…':'Save controls'}</button></div></div></div></div>}
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
