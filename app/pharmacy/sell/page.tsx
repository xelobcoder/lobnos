'use client';

import jsPDF from 'jspdf';
import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from 'react';
import {
     RiAddLine,
     RiCloseLine,
     RiDeleteBinLine,
     RiErrorWarningLine,
     RiLoader4Line,
     RiMedicineBottleLine,
     RiSearchLine,
     RiShoppingCartLine,
     RiCheckboxCircleLine,
     RiArrowLeftLine,
} from '@remixicon/react';
import Link from 'next/link';
import { customFetch, customFetchMutation } from '../../../components/Auth/customFetch';
import { useApplication } from '../../../components/Auth/useApplicationContext';

type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock';
type Medicine = {
     inventoryItemId: string;
     name: string;
     unit: string;
     salePrice: number;
     availableStock: number;
     minimumStock: number;
     stockStatus: StockStatus;
};
type CartLine = Medicine & { quantity: number };

const STOCK_LABELS: Record<StockStatus, { text: string; badge: string }> = {
     in_stock: { text: 'In stock', badge: 'text-bg-success' },
     low_stock: { text: 'Low stock', badge: 'text-bg-warning' },
     out_of_stock: { text: 'Out of stock', badge: 'text-bg-danger' },
};

type Receipt = {
     receiptNumber: string;
     total: number;
     paymentMethod: string;
     customerName: string;
     lines: CartLine[];
     completedAt: string;
};

const currency = new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS' });

export default function PharmacySellPage() {
     const application = useApplication();
     const company = application?.company;
     const companyName = typeof company === 'string' ? company : company?.name || 'LOBNOS PHARMACY';
     const soldBy = application?.user?.username || 'Pharmacy staff';
     const companyLogoUrl = process.env.NODE_ENV === 'development'
          ? `${process.env.DEVELOPMENT_BASEURL}settings/companyprofile/images`
          : `${process.env.PRODUCTION_BASEURL}settings/companyprofile/images`;

     const [query, setQuery] = useState('');
     const [loading, setLoading] = useState(false);
     const [cart, setCart] = useState<CartLine[]>([]);
     // Local cache of the catalogue loaded on mount (and grown by backend fallback searches), filtered client-side as the user types.
     const [catalogueCache, setCatalogueCache] = useState<Medicine[]>([]);
     const [catalogue, setCatalogue] = useState<Medicine[]>([]);
     const [customerName, setCustomerName] = useState('');
     const [paymentMethod, setPaymentMethod] = useState('cash');
     const [receipt, setReceipt] = useState<Receipt | null>(null);
     const [error, setError] = useState('');
     const [submitting, setSubmitting] = useState(false);
     const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);
     const searchInputRef = useRef<HTMLInputElement>(null);

     const subtotal = cart.reduce((total, line) => total + line.salePrice * line.quantity, 0);
     const totalUnits = cart.reduce((total, line) => total + line.quantity, 0);

     const matchesQuery = (medicine: Medicine, needle: string) =>
          medicine.name.toLowerCase().includes(needle);

     // Load a sizeable batch of the catalogue once on mount so most searches can be answered locally.
     useEffect(() => {
          let active = true;
          (async () => {
               setLoading(true);
               setError('');
               try {
                    const response = await customFetch('pharmacy/catalogue?count=300');
                    if (!active) return;
                    if (response?.success) {
                         const items: Medicine[] = response.data.items || [];
                         setCatalogueCache(items);
                         setCatalogue(items.slice(0, 50));
                    } else {
                         setError(response?.error?.message || 'Unable to load the pharmacy catalogue.');
                    }
               } catch {
                    if (active) setError('Unable to load the pharmacy catalogue.');
               } finally {
                    if (active) setLoading(false);
               }
          })();
          return () => {
               active = false;
          };
     }, []);

     // Filter the local cache first; only fall back to the backend (debounced) when nothing matches locally.
     useEffect(() => {
          const term = query.trim().toLowerCase();

          if (!term) {
               setCatalogue(catalogueCache.slice(0, 50));
               return;
          }

          const localMatches = catalogueCache.filter((medicine) => matchesQuery(medicine, term));
          if (localMatches.length > 0) {
               setCatalogue(localMatches);
               return;
          }

          let active = true;
          const timer = window.setTimeout(async () => {
               setLoading(true);
               setError('');
               try {
                    const response = await customFetch(`pharmacy/catalogue?count=50&search=${encodeURIComponent(term)}`);
                    if (!active) return;
                    if (response?.success) {
                         const items: Medicine[] = response.data.items || [];
                         setCatalogue(items);
                         // Merge newly discovered items into the cache so future keystrokes can find them locally.
                         setCatalogueCache((current) => {
                              const existingIds = new Set(current.map((item) => item.inventoryItemId));
                              const additions = items.filter((item) => !existingIds.has(item.inventoryItemId));
                              return additions.length ? [...current, ...additions] : current;
                         });
                    } else {
                         setError(response?.error?.message || 'Unable to load the pharmacy catalogue.');
                         setCatalogue([]);
                    }
               } catch {
                    if (active) {
                         setError('Unable to load the pharmacy catalogue.');
                         setCatalogue([]);
                    }
               } finally {
                    if (active) setLoading(false);
               }
          }, 250);

          return () => {
               active = false;
               window.clearTimeout(timer);
          };
     }, [query, catalogueCache]);

     const addMedicine = (medicine: Medicine) => {
          setReceipt(null);
          setCart((current) => {
               const existing = current.find((line) => line.inventoryItemId === medicine.inventoryItemId);
               if (!existing) return [...current, { ...medicine, quantity: 1 }];
               if (existing.quantity >= medicine.availableStock) return current;
               return current.map((line) =>
                    line.inventoryItemId === medicine.inventoryItemId ? { ...line, quantity: line.quantity + 1 } : line
               );
          });
          searchInputRef.current?.focus();
     };

     const updateQuantity = (inventoryItemId: string, quantity: number) =>
          setCart((current) =>
               current.flatMap((line) =>
                    quantity < 1 ? [] : line.inventoryItemId === inventoryItemId ? [{ ...line, quantity: Math.min(quantity, line.availableStock) }] : [line]
               )
          );

     const addFirstSearchResult = (event: KeyboardEvent<HTMLInputElement>) => {
          if (event.key !== 'Enter') return;
          event.preventDefault();
          const medicine = catalogue.find((item) => item.availableStock > 0);
          if (medicine) {
               addMedicine(medicine);
               setQuery('');
          }
     };

     const printThermalReceipt = async () => {
          if (!receipt) return;

          const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: [80, 297] });
          const pageWidth = pdf.internal.pageSize.getWidth();
          const leftMargin = 6;
          const rightMargin = pageWidth - 6;
          const divider = '----------------------------------------------------------------';
          let yPosition = 8;
          const formatAmount = (amount: number) => `GHS ${amount.toFixed(2)}`;
          const addDivider = () => {
               pdf.text(divider, pageWidth / 2, yPosition, { align: 'center' });
               yPosition += 4;
          };

          try {
               const logoResponse = await fetch(companyLogoUrl);
               if (logoResponse.ok) {
                    const logoBlob = await logoResponse.blob();
                    const logoDataUrl = await new Promise<string>((resolve, reject) => {
                         const reader = new FileReader();
                         reader.onload = () => resolve(reader.result as string);
                         reader.onerror = () => reject(new Error('Unable to read company logo.'));
                         reader.readAsDataURL(logoBlob);
                    });
                    pdf.addImage(logoDataUrl, 'JPEG', pageWidth / 2 - 8, yPosition, 16, 16);
                    yPosition += 20;
               }
          } catch {
               // Proceed without logo if fetch fails
          }

          pdf.setFont('courier', 'bold');
          pdf.setFontSize(11);
          pdf.text(companyName.toUpperCase(), pageWidth / 2, yPosition, { align: 'center', maxWidth: pageWidth - 12 });
          yPosition += 5;
          pdf.setFont('courier', 'normal');
          pdf.setFontSize(8);
          pdf.text('SALES RECEIPT', pageWidth / 2, yPosition, { align: 'center' });
          yPosition += 5;
          addDivider();

          pdf.text(`Receipt: ${receipt.receiptNumber}`, leftMargin, yPosition);
          yPosition += 4;
          pdf.text(`Date: ${new Date(receipt.completedAt).toLocaleString('en-GH')}`, leftMargin, yPosition);
          yPosition += 4;
          pdf.text(`Customer: ${receipt.customerName}`, leftMargin, yPosition);
          yPosition += 4;
          pdf.text(`Payment: ${receipt.paymentMethod.replace('_', ' ').toUpperCase()}`, leftMargin, yPosition);
          yPosition += 4;
          pdf.text(`Sold by: ${soldBy}`, leftMargin, yPosition);
          yPosition += 4;
          addDivider();

          pdf.setFont('courier', 'bold');
          pdf.text('ITEM', leftMargin, yPosition);
          pdf.text('AMOUNT', rightMargin, yPosition, { align: 'right' });
          yPosition += 4;
          addDivider();
          pdf.setFont('courier', 'normal');

          receipt.lines.forEach((line) => {
               const displayName = line.name.toUpperCase();
               const name = displayName.length > 27 ? `${displayName.slice(0, 24)}...` : displayName;
               pdf.text(name, leftMargin, yPosition);
               yPosition += 4;
               pdf.text(`${line.quantity} x ${formatAmount(line.salePrice)}`, leftMargin, yPosition);
               pdf.text(formatAmount(line.quantity * line.salePrice), rightMargin, yPosition, { align: 'right' });
               yPosition += 5;
          });

          addDivider();
          pdf.setFont('courier', 'bold');
          pdf.setFontSize(10);
          pdf.text('TOTAL', leftMargin, yPosition);
          pdf.text(formatAmount(receipt.total), rightMargin, yPosition, { align: 'right' });
          yPosition += 6;
          addDivider();
          pdf.setFontSize(8);
          pdf.text('Thank you for your purchase!', pageWidth / 2, yPosition, { align: 'center' });
          yPosition += 4;
          pdf.setFont('courier', 'normal');
          pdf.setFontSize(7);
          pdf.text('Please retain this receipt for your records.', pageWidth / 2, yPosition, { align: 'center' });

          pdf.autoPrint();
          const receiptUrl = URL.createObjectURL(pdf.output('blob'));
          const printWindow = window.open(receiptUrl, '_blank');
          window.setTimeout(() => URL.revokeObjectURL(receiptUrl), 30000);
          if (!printWindow) setError('Popups are blocked. Please allow popups to print receipts.');
     };

     const completeSale = async (event: FormEvent) => {
          event.preventDefault();
          if (!cart.length || submitting) return;
          setSubmitting(true);
          setError('');
          const response = await customFetchMutation('pharmacy/sales', 'POST', {
               idempotencyKey: crypto.randomUUID(),
               customerName: customerName || 'Walk-in customer',
               paymentMethod,
               lines: cart.map((line) => ({ inventoryItemId: line.inventoryItemId, quantity: line.quantity })),
          });
          setSubmitting(false);
          if (response?.success) {
               setReceipt({
                    ...response.data,
                    customerName: customerName || 'Walk-in customer',
                    lines: cart,
                    completedAt: new Date().toISOString(),
               });
               setCart([]);
               setCustomerName('');
               setIsMobileCartOpen(false);
          } else {
               setError(response?.error?.message || 'Sale could not be completed.');
          }
     };

     const cartHtmlContent = (
          <div className="d-flex flex-column h-100 bg-white" style={{ fontFamily: 'inherit' }}>
               {/* Cart Header */}
               <div className="p-3 border-bottom d-flex align-items-center justify-content-between bg-light">
                    <div>
                         <h5 className="fw-bold mb-0 text-dark">Checkout cart</h5>
                         <small className="text-muted">
                              {cart.length} line{cart.length !== 1 ? 's' : ''} · {totalUnits} unit{totalUnits !== 1 ? 's' : ''}
                         </small>
                    </div>
                    {/* Only show mobile close button when isMobileCartOpen is explicitly used */}
                    <button
                         type="button"
                         className="btn-close d-lg-none"
                         onClick={() => setIsMobileCartOpen(false)}
                         aria-label="Close cart"
                    />
               </div>

               {/* Customer Input */}
               <div className="p-3 border-bottom">
                    <label className="form-label small text-uppercase fw-semibold text-muted mb-1">Customer name</label>
                    <input
                         type="text"
                         className="form-control form-control-sm"
                         style={{ borderColor: '#212529', borderRadius: '4px' }}
                         value={customerName}
                         onChange={(event) => setCustomerName(event.target.value)}
                         placeholder="Walk-in customer"
                    />
               </div>

               {/* Cart Items Area */}
               <div className="flex-grow-1 overflow-auto px-3 py-2">
                    {cart.length === 0 ? (
                         <div className="text-center py-5">
                              <RiShoppingCartLine size={32} className="text-muted mb-2 opacity-50" />
                              <p className="text-muted small mb-0">No medications selected yet.</p>
                         </div>
                    ) : (
                         cart.map((line) => (
                              <div
                                   key={line.inventoryItemId}
                                   className="d-flex align-items-center gap-2 py-2 border-bottom"
                                   style={{ borderColor: '#E5E7EB' }}
                              >
                                   <div className="flex-grow-1 overflow-hidden">
                                        <h6 className="fw-bold mb-0 text-truncate text-dark" style={{ fontSize: '0.85rem' }}>
                                             {line.name.toUpperCase()}
                                        </h6>
                                        <small className="text-muted small">{currency.format(line.salePrice)}</small>
                                   </div>

                                   {/* Rapid Qty Controls */}
                                   <div className="input-group input-group-sm flex-nowrap" style={{ width: '100px' }}>
                                        <button
                                             type="button"
                                             className="btn btn-outline-dark px-2"
                                             onClick={() => updateQuantity(line.inventoryItemId, line.quantity - 1)}
                                             aria-label="Decrease quantity"
                                        >
                                             −
                                        </button>
                                        <input
                                             type="number"
                                             className="form-control text-center px-1 border-dark"
                                             value={line.quantity}
                                             min={1}
                                             max={line.availableStock}
                                             inputMode="numeric"
                                             onFocus={(e) => e.target.select()}
                                             onChange={(e) => updateQuantity(line.inventoryItemId, Number(e.target.value))}
                                             aria-label="Select quantity"
                                        />
                                        <button
                                             type="button"
                                             className="btn btn-outline-dark px-2"
                                             onClick={() => updateQuantity(line.inventoryItemId, line.quantity + 1)}
                                             aria-label="Increase quantity"
                                        >
                                             +
                                        </button>
                                   </div>

                                   {/* Subtotal line */}
                                   <div className="fw-bold text-dark text-end" style={{ minWidth: '70px', fontSize: '0.85rem' }}>
                                        {currency.format(line.salePrice * line.quantity)}
                                   </div>

                                   {/* Delete line */}
                                   <button
                                        type="button"
                                        className="btn btn-link p-0 text-danger"
                                        onClick={() => updateQuantity(line.inventoryItemId, 0)}
                                        aria-label="Remove item"
                                   >
                                        <RiDeleteBinLine size={16} />
                                   </button>
                              </div>
                         ))
                    )}
               </div>

               {/* Cart Footer */}
               <div className="p-3 border-top bg-light">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                         <span className="fw-bold text-muted small text-uppercase">Total</span>
                         <strong className="fs-5 text-dark fw-bold">{currency.format(subtotal)}</strong>
                    </div>

                    {/* Payment methods list */}
                    <div className="mb-3">
                         <label className="form-label small text-uppercase fw-semibold text-muted mb-2 d-block">
                              Payment type
                         </label>
                         <div className="d-flex flex-wrap gap-3">
                              {[
                                   ['cash', 'Cash'],
                                   ['mobile_money', 'Mobile money'],
                                   ['card', 'Card'],
                              ].map(([value, label]) => (
                                   <label key={value} className="form-check form-check-inline m-0">
                                        <input
                                             type="radio"
                                             name="payment"
                                             value={value}
                                             checked={paymentMethod === value}
                                             onChange={() => setPaymentMethod(value)}
                                             className="form-check-input"
                                        />
                                        <span className="form-check-label text-dark" style={{ fontSize: '0.85rem' }}>{label}</span>
                                   </label>
                              ))}
                         </div>
                    </div>

                    <button
                         className="btn btn-success btn-lg w-100 py-2 fw-semibold"
                         type="submit"
                         disabled={cart.length === 0 || submitting}
                    >
                         {submitting ? (
                              <>
                                   <RiLoader4Line size={18} className="me-2 animate-spin d-inline-block" />
                                   Processing...
                              </>
                         ) : (
                              <>
                                   Complete sale • {currency.format(subtotal)}
                              </>
                         )}
                    </button>
               </div>
          </div>
     );

     return (
          <main className="container-fluid px-4 py-3" style={{ minHeight: '100vh', backgroundColor: 'var(--bs-body-bg)' }}>
               {/* Print Request Modal */}
               {receipt && (
                    <div
                         className="modal d-block animate-fade-in"
                         // role="dialog"
                         aria-modal="true"
                         style={{ backgroundColor: 'rgba(23, 33, 38, 0.5)', zIndex: 1060 }}
                    >
                         <div className="modal-dialog mt-3">
                              <div className="modal-content border" style={{ borderRadius: '6px', borderColor: '#212529' }}>
                                   <div className="modal-body p-4 text-center">
                                        <RiCheckboxCircleLine size={44} className="mb-3 text-success" />
                                        <h2 className="fs-5 fw-bold mb-2">Pharmacy transaction completed</h2>
                                        <p className="text-muted small mb-3">
                                             Receipt {receipt.receiptNumber} has been successfully recorded.
                                        </p>
                                        <p className="fw-semibold mb-0">Print terminal receipt now?</p>
                                   </div>
                                   <div className="modal-footer border-top-0 pt-0 px-4 pb-4 d-flex gap-2">
                                        <button
                                             type="button"
                                             className="btn btn-outline-secondary flex-grow-1"
                                             onClick={() => setReceipt(null)}
                                        >
                                             Dismiss
                                        </button>
                                        <button
                                             type="button"
                                             className="btn btn-success flex-grow-1"
                                             onClick={async () => {
                                                  await printThermalReceipt();
                                                  setReceipt(null);
                                             }}
                                        >
                                             Print receipt
                                        </button>
                                   </div>
                              </div>
                         </div>
                    </div>
               )}

               {/* Error Alert Overlay */}
               {error && (
                    <div className="alert alert-danger d-flex align-items-start gap-3 p-3 mb-4" role="alert" style={{ borderColor: 'var(--bs-danger)' }}>
                         <RiErrorWarningLine size={24} className="text-danger flex-shrink-0 mt-1" />
                         <div className="flex-grow-1">
                              <h6 className="fw-bold mb-1">Transaction issue</h6>
                              <p className="mb-0 small">{error}</p>
                         </div>
                         <button
                              type="button"
                              className="btn-close shadow-none"
                              onClick={() => setError('')}
                              aria-label="Dismiss alert"
                         />
                    </div>
               )}

               <form onSubmit={completeSale} className="mb-0 h-100">
                    {/* Header */}
                    <div className="d-flex justify-content-between align-items-center mb-3">
                         <div>
                              <h1 className="fs-4 fw-bold mb-0">POS Terminal</h1>
                              <p className="text-muted small mb-0">Medication lookup, quantity entry, and hot-receipt printing.</p>
                         </div>

                         <div className="d-flex align-items-center gap-2">
                              <div className="text-end d-none d-md-block me-2">
                                   <small className="text-muted small d-block">Operator ID</small>
                                   <strong>{soldBy}</strong>
                              </div>
                              <Link href="/pharmacy" className="btn btn-sm btn-outline-dark d-flex align-items-center gap-2">
                                   <RiArrowLeftLine size={16} /> Exit POS
                              </Link>
                         </div>
                    </div>

                    <div className="row g-3">
                         {/* Catalogue Panel */}
                         <div className="col-lg-8">
                              {/* Search actions */}
                              <div className="card border mb-3" style={{ borderRadius: '6px', borderColor: '#212529' }}>
                                   <div className="card-body p-3 d-flex flex-wrap align-items-center justify-content-between gap-3 bg-white" style={{ borderRadius: '6px' }}>
                                        <div className="input-group" style={{ flex: '1 1 320px' }}>
                                             <span className="input-group-text bg-transparent border-end-0" style={{ borderColor: '#212529' }}>
                                                  <RiSearchLine size={18} className="text-muted" />
                                             </span>
                                             <input
                                                  ref={searchInputRef}
                                                  type="text"
                                                  className="form-control border-start-0 shadow-none"
                                                  style={{ borderColor: '#212529' }}
                                                  value={query}
                                                  onChange={(e) => setQuery(e.target.value)}
                                                  onKeyDown={addFirstSearchResult}
                                                  placeholder="Search generic, brand, or barcode..."
                                                  aria-label="Catalogue search"
                                                  autoFocus
                                             />
                                             {query && (
                                                  <button type="button" className="btn btn-outline-secondary" onClick={() => setQuery('')} aria-label="Clear term">
                                                       <RiCloseLine size={18} />
                                                  </button>
                                             )}
                                        </div>

                                        {/* Mobile-only open cart button */}
                                        <button
                                             type="button"
                                             className="btn btn-success d-lg-none d-flex align-items-center gap-2"
                                             onClick={() => setIsMobileCartOpen(true)}
                                        >
                                             <RiShoppingCartLine size={18} />
                                             <span className="badge text-bg-light text-dark ms-1">
                                                  {cart.length} ({currency.format(subtotal)})
                                             </span>
                                        </button>
                                   </div>
                              </div>

                              {/* Live Catalogue table */}
                              <div className="card border" style={{ borderRadius: '6px', borderColor: '#212529' }}>
                                   <div className="card-header bg-white py-2 px-3 border-bottom d-flex justify-content-between align-items-center">
                                        <span className="fw-bold small text-muted text-uppercase">Inventory inventory list</span>
                                        <small className="text-muted">Double-click row to add</small>
                                   </div>

                                   <div className="card-body p-0 d-flex flex-column" style={{ minHeight: '350px' }}>
                                        {loading && (
                                             <div className="text-center my-auto py-5">
                                                  <RiLoader4Line size={40} className="text-muted mb-3 animate-spin" />
                                                  <p className="text-muted small">Filtering medicine catalogue...</p>
                                             </div>
                                        )}

                                        {!loading && catalogue.length === 0 && (
                                             <div className="text-center my-auto py-5 text-muted">
                                                  <RiMedicineBottleLine size={44} className="mb-2 opacity-50" />
                                                  <p className="fw-semibold mb-1">No medicines match search</p>
                                                  <small>Ensure the item is marked as Pharmacy category inside inventory details.</small>
                                             </div>
                                        )}

                                        {!loading && catalogue.length > 0 && (
                                             <div className="table-responsive" style={{ maxHeight: 'calc(100vh - 280px)', overflowY: 'auto' }}>
                                                  <table className="table table-sm table-hover align-middle mb-0" style={{ fontSize: '0.85rem' }}>
                                                       <thead className="sticky-top bg-white" style={{ zIndex: 1, borderBottom: '2px solid #212529' }}>
                                                            <tr>
                                                                 <th className="px-3 py-2">Medication Name</th>
                                                                 <th className="py-2">Pack unit</th>
                                                                 <th className="text-end py-2">Price</th>
                                                                 <th className="text-end py-2">On hand</th>
                                                                 <th style={{ width: '46px' }} className="py-2" />
                                                            </tr>
                                                       </thead>
                                                       <tbody>
                                                            {catalogue.map((medicine) => {
                                                                 const isOut = medicine.availableStock === 0;
                                                                 return (
                                                                      <tr
                                                                           key={medicine.inventoryItemId}
                                                                           style={isOut
                                                                                ? {
                                                                                     '--bs-table-bg': 'var(--bs-danger-bg-subtle)',
                                                                                     '--bs-table-hover-bg': 'var(--bs-danger-bg-subtle)',
                                                                                     opacity: 0.75,
                                                                                     cursor: 'not-allowed',
                                                                                } as React.CSSProperties
                                                                                : { cursor: 'pointer' }}
                                                                           onDoubleClick={() => !isOut && addMedicine(medicine)}
                                                                      >
                                                                           <td className="px-3 py-2 fw-semibold text-dark">
                                                                                {medicine.name.toUpperCase()}
                                                                           </td>
                                                                           <td className="text-muted py-2">{medicine.unit}</td>
                                                                           <td className="text-end fw-bold py-2">{currency.format(medicine.salePrice)}</td>
                                                                           <td className="text-end py-2">
                                                                                <span
                                                                                     className={`badge ${isOut ? 'text-bg-light border' : 'badge-outline-dark'}`}
                                                                                     style={{
                                                                                          color: '#212529',
                                                                                          border: isOut ? '1px dashed #B42318' : '1px solid #212529',
                                                                                          backgroundColor: isOut ? '#FEF2F2' : '#FFFFFF',
                                                                                     }}
                                                                                >
                                                                                     {isOut ? 'Out of stock' : `${medicine.availableStock} units`}
                                                                                </span>
                                                                           </td>
                                                                           <td className="text-center py-2">
                                                                                <button
                                                                                     type="button"
                                                                                     className="btn btn-sm btn-outline-dark p-1"
                                                                                     disabled={isOut}
                                                                                     onClick={() => addMedicine(medicine)}
                                                                                     aria-label="Add medicine"
                                                                                >
                                                                                     <RiAddLine size={16} />
                                                                                </button>
                                                                           </td>
                                                                      </tr>
                                                                 );
                                                            })}
                                                       </tbody>
                                                  </table>
                                             </div>
                                        )}
                                   </div>
                              </div>
                         </div>

                         {/* Desktop Static Sidebar (Cart Panel) */}
                         <div className="col-lg-4 d-none d-lg-block">
                              <div
                                   className="card border h-100"
                                   style={{ borderRadius: '6px', borderColor: '#212529', minHeight: 'calc(100vh - 150px)' }}
                              >
                                   {cartHtmlContent}
                              </div>
                         </div>
                    </div>

                    {/* Responsive Sliding Mobile Cart Offcanvas */}
                    {isMobileCartOpen && (
                         <>
                              <div className="offcanvas-backdrop fade show" onClick={() => setIsMobileCartOpen(false)} style={{ zIndex: 1040 }} />
                              <aside
                                   className="offcanvas offcanvas-end show border-start"
                                   role="dialog"
                                   aria-modal="true"
                                   style={{
                                        display: 'block',
                                        zIndex: 1045,
                                        width: '100vw',
                                        maxWidth: '440px',
                                        backgroundColor: '#FFFFFF',
                                   }}
                              >
                                   {cartHtmlContent}
                              </aside>
                         </>
                    )}
               </form>

               <style jsx>{`
                    .animate-spin {
                         animation: spin 1s linear infinite;
                    }
                    @keyframes spin {
                         from { transform: rotate(0deg); }
                         to { transform: rotate(360deg); }
                    }
                    .animate-fade-in {
                         animation: selectFade 0.2s ease-out;
                    }
                    @keyframes selectFade {
                         from { opacity: 0; }
                         to { opacity: 1; }
                    }
               `}</style>
          </main>
     );
}
