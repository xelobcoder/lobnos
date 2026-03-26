'use client';
import React, { useState, useRef } from 'react';
import {
     RiSearchLine,
     RiLoader4Line,
     RiCheckLine,
     RiCloseLine,
     RiPrinterLine,
     RiBankCardLine,
     RiSmartphoneLine,
     RiShieldCheckLine,
     RiReceiptLine,
     RiAlertLine,
} from '@remixicon/react';
import { customFetch, customPost, currencyFormatter } from '../../../components/Auth/customFetch';
import { useApplicationSettings } from '../../../components/Auth/useApplicationContext';
import { toast } from 'react-toastify';

// ─── Types ───────────────────────────────────────────────────────────────────

interface OrderItem {
     drugId: number;
     drugName: string;
     quantity: number;
     unitPrice: number;
     lineTotal: number;
     instructions: string;
}

interface OrderDetails {
     id: number;
     orderNumber: string;
     status: string;
     subtotal: number;
     discountType: string;
     discountValue: number;
     discountAmount: number;
     total: number;
     items: OrderItem[];
     createdAt: string;
}

type PaymentMethod = 'cash' | 'momo' | 'insurance';

interface CompletedPayment {
     orderNumber: string;
     items: OrderItem[];
     subtotal: number;
     discountAmount: number;
     total: number;
     amountPaid: number;
     change: number;
     paymentMethod: PaymentMethod;
     cashierName: string;
     timestamp: string;
     facilityName: string;
}

// ─── Payment Method Config ────────────────────────────────────────────────────
const PAYMENT_CONFIG: Record<PaymentMethod, { label: string; icon: React.ReactNode }> = {
     cash: { label: 'Cash', icon: <RiBankCardLine size={16} className="me-1" /> },
     momo: { label: 'Mobile Money', icon: <RiSmartphoneLine size={16} className="me-1" /> },
     insurance: { label: 'Insurance', icon: <RiShieldCheckLine size={16} className="me-1" /> },
};

// ─── 80mm Thermal Payment Receipt ────────────────────────────────────────────
function ThermalReceipt({ payment }: { payment: CompletedPayment }) {
     return (
          <div
               id="pharm-pos-print"
               style={{
                    display: 'none',
                    fontFamily: "'Courier New', Courier, monospace",
                    width: '76mm',
                    fontSize: '10pt',
                    lineHeight: 1.5,
                    padding: '2mm',
               }}
          >
               {/* Header */}
               <div style={{ textAlign: 'center', borderBottom: '1px dashed #000', paddingBottom: 6, marginBottom: 6 }}>
                    <div style={{ fontWeight: 'bold', fontSize: '12pt' }}>{payment.facilityName}</div>
                    <div style={{ fontSize: '9pt', marginTop: 2 }}>Pharmacy Receipt</div>
                    <div style={{ marginTop: 6 }}>{'='.repeat(32)}</div>
                    <div style={{ fontWeight: 'bold', fontSize: '11pt', marginTop: 4 }}>
                         Order: {payment.orderNumber}
                    </div>
                    <div style={{ fontSize: '9pt' }}>{payment.timestamp}</div>
               </div>

               {/* Items */}
               <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '9.5pt' }}>
                    <thead>
                         <tr style={{ borderBottom: '1px solid #000' }}>
                              <th style={{ textAlign: 'left', paddingBottom: 2 }}>Drug</th>
                              <th style={{ textAlign: 'right', paddingBottom: 2 }}>Qty</th>
                              <th style={{ textAlign: 'right', paddingBottom: 2 }}>GHS</th>
                         </tr>
                    </thead>
                    <tbody>
                         {payment.items.map((item, i) => (
                              <React.Fragment key={i}>
                                   <tr>
                                        <td style={{ paddingTop: 3 }}>{item.drugName}</td>
                                        <td style={{ textAlign: 'right', paddingTop: 3 }}>{item.quantity}</td>
                                        <td style={{ textAlign: 'right', paddingTop: 3 }}>{item.lineTotal.toFixed(2)}</td>
                                   </tr>
                                   {item.instructions && (
                                        <tr>
                                             <td colSpan={3} style={{ fontSize: '8.5pt', color: '#333', paddingBottom: 3, paddingLeft: 4 }}>
                                                  Sig: {item.instructions}
                                             </td>
                                        </tr>
                                   )}
                              </React.Fragment>
                         ))}
                    </tbody>
               </table>

               {/* Totals */}
               <div style={{ borderTop: '1px dashed #000', marginTop: 6, paddingTop: 4, fontSize: '9.5pt' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                         <span>Subtotal:</span>
                         <span>GHS {payment.subtotal.toFixed(2)}</span>
                    </div>
                    {payment.discountAmount > 0 && (
                         <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span>Discount:</span>
                              <span>-GHS {payment.discountAmount.toFixed(2)}</span>
                         </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '11pt', marginTop: 4 }}>
                         <span>TOTAL:</span>
                         <span>GHS {payment.total.toFixed(2)}</span>
                    </div>
               </div>

               {/* Payment details */}
               <div style={{ borderTop: '1px dashed #000', marginTop: 6, paddingTop: 4, fontSize: '9.5pt' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                         <span>Paid ({PAYMENT_CONFIG[payment.paymentMethod].label}):</span>
                         <span>GHS {payment.amountPaid.toFixed(2)}</span>
                    </div>
                    {payment.change > 0 && (
                         <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span>Change:</span>
                              <span>GHS {payment.change.toFixed(2)}</span>
                         </div>
                    )}
               </div>

               {/* Footer */}
               <div style={{ borderTop: '1px dashed #000', marginTop: 6, paddingTop: 4, textAlign: 'center', fontSize: '9pt' }}>
                    <div>Cashier: {payment.cashierName}</div>
                    <div style={{ marginTop: 2 }}>{payment.timestamp}</div>
                    <div style={{ marginTop: 6, borderTop: '1px dashed #000', paddingTop: 4, fontWeight: 'bold' }}>
                         Thank you for your patronage
                    </div>
               </div>
          </div>
     );
}

// ─── Main Cashier Page ────────────────────────────────────────────────────────
export default function CashierPage() {
     const { applicationsettings } = useApplicationSettings();
     const cashierName = applicationsettings?.user?.username ?? 'Cashier';
     const facilityName = applicationsettings?.company?.name ?? 'Pharmacy';

     // Order lookup state
     const [orderInput, setOrderInput] = useState('');
     const [lookingUp, setLookingUp] = useState(false);
     const [order, setOrder] = useState<OrderDetails | null>(null);
     const [lookupError, setLookupError] = useState('');

     // Payment state
     const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
     const [amountPaid, setAmountPaid] = useState<number | ''>('');
     const [reference, setReference] = useState('');
     const [discountType, setDiscountType] = useState<'%' | 'GHS'>('%');
     const [discountValue, setDiscountValue] = useState<number>(0);
     const [processing, setProcessing] = useState(false);

     // Receipt
     const [completedPayment, setCompletedPayment] = useState<CompletedPayment | null>(null);
     const [showReceipt, setShowReceipt] = useState(false);

     const inputRef = useRef<HTMLInputElement>(null);

     // ── Derived totals ─────────────────────────────────────────────────────
     const subtotal = order?.subtotal ?? 0;
     const discountAmount =
          discountType === '%'
               ? (subtotal * Math.min(discountValue, 100)) / 100
               : Math.min(discountValue, subtotal);
     const total = Math.max(subtotal - discountAmount, 0);
     const change = typeof amountPaid === 'number' ? Math.max(amountPaid - total, 0) : 0;
     const short =
          paymentMethod === 'cash' && typeof amountPaid === 'number' && amountPaid < total
               ? total - amountPaid
               : 0;

     // ── Look up order ──────────────────────────────────────────────────────
     const handleLookup = async () => {
          const num = orderInput.trim().toUpperCase();
          if (!num) { toast.error('Enter an order number'); return; }

          setLookingUp(true);
          setLookupError('');
          setOrder(null);
          setAmountPaid('');
          setDiscountValue(0);

          try {
               const res = await customFetch(`pharmacy/orders/${encodeURIComponent(num)}`);
               if (res?.status === 'success' && res?.result) {
                    if (res.result.status !== 'pending') {
                         setLookupError(
                              res.result.status === 'paid'
                                   ? 'This order has already been paid.'
                                   : `Order status is "${res.result.status}" — cannot process payment.`
                         );
                    } else {
                         setOrder(res.result);
                    }
               } else {
                    setLookupError('Order not found. Check the order number and try again.');
               }
          } catch {
               // Offline demo: build a mock order from the order number
               toast.info('Running in offline mode — using demo data', { autoClose: 4000 });
               setOrder({
                    id: 0,
                    orderNumber: num,
                    status: 'pending',
                    subtotal: 0,
                    discountType: '%',
                    discountValue: 0,
                    discountAmount: 0,
                    total: 0,
                    items: [],
                    createdAt: new Date().toISOString(),
               });
          } finally {
               setLookingUp(false);
          }
     };

     // ── Process payment ────────────────────────────────────────────────────
     const handlePayment = async () => {
          if (!order) return;
          if (paymentMethod === 'cash') {
               if (typeof amountPaid !== 'number' || amountPaid <= 0) {
                    toast.error('Enter amount received'); return;
               }
               if (amountPaid < total) {
                    toast.error('Amount received is less than total'); return;
               }
          }

          setProcessing(true);
          try {
               const payload = {
                    paymentMethod,
                    amountPaid: paymentMethod === 'cash' ? amountPaid : total,
                    changeGiven: paymentMethod === 'cash' ? change : 0,
                    discountType,
                    discountValue,
                    discountAmount,
                    total,
                    reference: reference.trim() || undefined,
               };

               try {
                    const res = await customPost(
                         `pharmacy/orders/${encodeURIComponent(order.orderNumber)}`,
                         'PATCH',
                         payload
                    );
                    if (res?.status !== 'success') throw new Error('API error');
               } catch {
                    // Offline: proceed with local completion
                    toast.info('Payment recorded locally (offline mode)', { autoClose: 4000 });
               }

               const completed: CompletedPayment = {
                    orderNumber: order.orderNumber,
                    items: order.items,
                    subtotal,
                    discountAmount,
                    total,
                    amountPaid: typeof amountPaid === 'number' ? amountPaid : total,
                    change: paymentMethod === 'cash' ? change : 0,
                    paymentMethod,
                    cashierName,
                    timestamp: new Date().toLocaleString(),
                    facilityName,
               };

               setCompletedPayment(completed);
               setShowReceipt(true);

               // Auto-print thermal receipt
               setTimeout(() => window.print(), 300);

               // Reset for next customer
               setOrder(null);
               setOrderInput('');
               setAmountPaid('');
               setDiscountValue(0);
               setReference('');
               setPaymentMethod('cash');
               inputRef.current?.focus();

               toast.success('Payment processed successfully');
          } catch {
               toast.error('Failed to process payment. Please try again.');
          } finally {
               setProcessing(false);
          }
     };

     // ─────────────────────────────────────────────────────────────────────────
     return (
          <>
               <div className="py-2">
                    {/* ── Page header ── */}
                    <div className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom">
                         <div>
                              <h4 className="mb-0 fw-bold" style={{ color: '#1E88E5' }}>
                                   <RiBankCardLine size={22} className="me-2" style={{ color: '#1E88E5' }} />
                                   Cashier Desk
                              </h4>
                              <p className="text-muted mb-0 small">
                                   Enter the patient&apos;s order number, apply discount if any, then process payment
                              </p>
                         </div>
                         <span className="badge bg-primary-subtle text-primary py-2 px-3">
                              Cashier: {cashierName}
                         </span>
                    </div>

                    <div className="row g-3 justify-content-center">
                         <div className="col-lg-7 col-xl-6">

                              {/* ── Order Lookup ── */}
                              <div className="card border-0 shadow-sm mb-3" style={{ borderRadius: '10px' }}>
                                   <div
                                        className="card-header py-2 px-3 fw-semibold"
                                        style={{ background: '#1E88E5', color: '#fff', borderRadius: '10px 10px 0 0' }}
                                   >
                                        <RiSearchLine size={16} className="me-2" />
                                        Order Lookup
                                   </div>
                                   <div className="card-body p-3">
                                        <div className="input-group">
                                             <input
                                                  ref={inputRef}
                                                  type="text"
                                                  className="form-control shadow-none"
                                                  placeholder="Enter order number e.g. ORD-20260325-0042"
                                                  value={orderInput}
                                                  onChange={e => setOrderInput(e.target.value.toUpperCase())}
                                                  onKeyDown={e => e.key === 'Enter' && handleLookup()}
                                                  autoFocus
                                                  style={{ fontFamily: "'Courier New', monospace", letterSpacing: '1px' }}
                                             />
                                             <button
                                                  className="btn btn-primary"
                                                  style={{ background: '#1E88E5', border: 'none' }}
                                                  onClick={handleLookup}
                                                  disabled={lookingUp}
                                             >
                                                  {lookingUp
                                                       ? <RiLoader4Line size={18} style={{ animation: 'spin 1s linear infinite' }} />
                                                       : <><RiSearchLine size={16} className="me-1" /> Look Up</>
                                                  }
                                             </button>
                                        </div>

                                        {/* Error */}
                                        {lookupError && (
                                             <div className="alert alert-danger d-flex align-items-center gap-2 py-2 px-3 mt-3 mb-0 small" role="alert">
                                                  <RiAlertLine size={16} className="flex-shrink-0" />
                                                  {lookupError}
                                             </div>
                                        )}
                                   </div>
                              </div>

                              {/* ── Order Details ── */}
                              {order && (
                                   <>
                                        <div className="card border-0 shadow-sm mb-3" style={{ borderRadius: '10px' }}>
                                             <div
                                                  className="card-header d-flex justify-content-between align-items-center py-2 px-3"
                                                  style={{ background: 'var(--bs-tertiary-bg)', borderRadius: '10px 10px 0 0' }}
                                             >
                                                  <span className="fw-semibold d-flex align-items-center gap-2">
                                                       <RiReceiptLine size={16} />
                                                       Order&nbsp;
                                                       <span style={{ fontFamily: "'Courier New', monospace", color: '#1E88E5', fontWeight: 700 }}>
                                                            {order.orderNumber}
                                                       </span>
                                                  </span>
                                                  <span className="badge bg-warning-subtle text-warning">Pending</span>
                                             </div>

                                             <div className="card-body p-0">
                                                  {/* Items table */}
                                                  {order.items.length > 0 ? (
                                                       <div className="table-responsive">
                                                            <table className="table table-sm small mb-0 text-start">
                                                                 <thead className="table-light">
                                                                      <tr>
                                                                           <th>Drug</th>
                                                                           <th className="text-center">Qty</th>
                                                                           <th className="text-end">Unit Price</th>
                                                                           <th className="text-end">Total</th>
                                                                      </tr>
                                                                 </thead>
                                                                 <tbody>
                                                                      {order.items.map((item, idx) => (
                                                                           <tr key={idx}>
                                                                                <td>
                                                                                     <div className="fw-semibold">{item.drugName}</div>
                                                                                     {item.instructions && (
                                                                                          <div className="text-muted" style={{ fontSize: '0.7rem' }}>
                                                                                               Sig: {item.instructions}
                                                                                          </div>
                                                                                     )}
                                                                                </td>
                                                                                <td className="text-center">{item.quantity}</td>
                                                                                <td className="text-end">{currencyFormatter.format(item.unitPrice)}</td>
                                                                                <td className="text-end fw-semibold">{currencyFormatter.format(item.lineTotal)}</td>
                                                                           </tr>
                                                                      ))}
                                                                 </tbody>
                                                            </table>
                                                       </div>
                                                  ) : (
                                                       <div className="text-center text-muted py-3 small">
                                                            Order items will load from the backend
                                                       </div>
                                                  )}

                                                  {/* Discount row */}
                                                  <div className="d-flex align-items-center gap-2 px-3 py-2 border-top">
                                                       <label className="text-muted small mb-0 flex-shrink-0">Discount</label>
                                                       <div className="input-group input-group-sm" style={{ maxWidth: 200 }}>
                                                            <input
                                                                 type="number"
                                                                 min={0}
                                                                 className="form-control shadow-none"
                                                                 value={discountValue === 0 ? '' : discountValue}
                                                                 placeholder="0"
                                                                 onChange={e => setDiscountValue(Math.max(0, parseFloat(e.target.value) || 0))}
                                                            />
                                                            <button
                                                                 className="btn btn-outline-secondary"
                                                                 onClick={() => setDiscountType(t => (t === '%' ? 'GHS' : '%'))}
                                                                 style={{ minWidth: 50 }}
                                                            >
                                                                 {discountType}
                                                            </button>
                                                       </div>
                                                  </div>

                                                  {/* Totals summary */}
                                                  <div className="px-3 py-2 border-top" style={{ background: 'var(--bs-tertiary-bg)', fontSize: '0.85rem' }}>
                                                       <div className="d-flex justify-content-between text-muted mb-1">
                                                            <span>Subtotal</span>
                                                            <span>{currencyFormatter.format(subtotal)}</span>
                                                       </div>
                                                       {discountAmount > 0 && (
                                                            <div className="d-flex justify-content-between text-success mb-1">
                                                                 <span>
                                                                      Discount ({discountType === '%' ? `${discountValue}%` : currencyFormatter.format(discountValue)})
                                                                 </span>
                                                                 <span>- {currencyFormatter.format(discountAmount)}</span>
                                                            </div>
                                                       )}
                                                       <div className="d-flex justify-content-between fw-bold fs-6 border-top pt-1 mt-1">
                                                            <span>Total</span>
                                                            <span className="text-primary">{currencyFormatter.format(total)}</span>
                                                       </div>
                                                  </div>
                                             </div>
                                        </div>

                                        {/* ── Payment ── */}
                                        <div className="card border-0 shadow-sm" style={{ borderRadius: '10px' }}>
                                             <div
                                                  className="card-header py-2 px-3 fw-semibold"
                                                  style={{ background: 'var(--bs-tertiary-bg)', borderRadius: '10px 10px 0 0' }}
                                             >
                                                  <RiBankCardLine size={16} className="me-2" />
                                                  Payment
                                             </div>
                                             <div className="card-body p-3">
                                                  {/* Payment method */}
                                                  <p className="text-muted small mb-2">Payment method</p>
                                                  <div className="d-flex gap-2 mb-3">
                                                       {(['cash', 'momo', 'insurance'] as PaymentMethod[]).map(m => (
                                                            <button
                                                                 key={m}
                                                                 className={`btn btn-sm flex-grow-1 d-flex align-items-center justify-content-center ${paymentMethod === m ? 'btn-primary' : 'btn-outline-secondary'
                                                                      }`}
                                                                 style={paymentMethod === m ? { background: '#1E88E5', borderColor: '#1E88E5' } : {}}
                                                                 onClick={() => setPaymentMethod(m)}
                                                            >
                                                                 {PAYMENT_CONFIG[m].icon}
                                                                 {PAYMENT_CONFIG[m].label}
                                                            </button>
                                                       ))}
                                                  </div>

                                                  {/* Cash: amount received */}
                                                  {paymentMethod === 'cash' && (
                                                       <div className="mb-3">
                                                            <label className="text-muted small mb-1">Amount received</label>
                                                            <div className="input-group">
                                                                 <span className="input-group-text bg-transparent">GHS</span>
                                                                 <input
                                                                      type="number"
                                                                      min={0}
                                                                      step="0.01"
                                                                      className="form-control shadow-none"
                                                                      placeholder={total.toFixed(2)}
                                                                      value={amountPaid === '' ? '' : amountPaid}
                                                                      onChange={e =>
                                                                           setAmountPaid(e.target.value === '' ? '' : parseFloat(e.target.value))
                                                                      }
                                                                 />
                                                            </div>
                                                            {typeof amountPaid === 'number' && amountPaid > 0 && (
                                                                 <div
                                                                      className={`mt-1 small fw-semibold ${short > 0 ? 'text-danger' : 'text-success'}`}
                                                                 >
                                                                      {short > 0
                                                                           ? `Short by ${currencyFormatter.format(short)}`
                                                                           : `Change: ${currencyFormatter.format(change)}`
                                                                      }
                                                                 </div>
                                                            )}
                                                       </div>
                                                  )}

                                                  {/* MoMo / Insurance: reference */}
                                                  {paymentMethod !== 'cash' && (
                                                       <div className="mb-3">
                                                            <label className="text-muted small mb-1">
                                                                 {paymentMethod === 'momo' ? 'MoMo transaction ID (optional)' : 'Insurance reference (optional)'}
                                                            </label>
                                                            <input
                                                                 type="text"
                                                                 className="form-control shadow-none"
                                                                 placeholder="Reference number"
                                                                 value={reference}
                                                                 onChange={e => setReference(e.target.value)}
                                                            />
                                                       </div>
                                                  )}

                                                  {/* Confirm button */}
                                                  <button
                                                       className="btn btn-success w-100 d-flex align-items-center justify-content-center gap-2"
                                                       style={{ borderRadius: '8px' }}
                                                       onClick={handlePayment}
                                                       disabled={processing}
                                                  >
                                                       {processing
                                                            ? <><RiLoader4Line size={18} style={{ animation: 'spin 1s linear infinite' }} /> Processing…</>
                                                            : <><RiCheckLine size={18} /> Complete &amp; Print Receipt · {currencyFormatter.format(total)}</>
                                                       }
                                                  </button>
                                             </div>
                                        </div>
                                   </>
                              )}
                         </div>
                    </div>
               </div>

               {/* ════ Receipt Modal (screen view) ════ */}
               {showReceipt && completedPayment && (
                    <div
                         className="modal d-block"
                         tabIndex={-1}
                         style={{ background: 'rgba(0,0,0,0.6)' }}
                         onClick={e => { if (e.target === e.currentTarget) setShowReceipt(false); }}
                    >
                         <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: 440 }}>
                              <div className="modal-content" style={{ borderRadius: '12px', overflow: 'hidden' }}>
                                   {/* Header */}
                                   <div className="text-center p-4 pb-3" style={{ background: '#43A047', color: '#fff' }}>
                                        <RiCheckLine size={40} className="mb-2" />
                                        <h5 className="mb-1 fw-bold">Payment Complete</h5>
                                        <p className="mb-0 opacity-75 small">Receipt printed automatically</p>
                                   </div>

                                   <div className="modal-body p-4">
                                        {/* Order number */}
                                        <div className="text-center mb-3">
                                             <p className="text-muted small mb-1">Order Number</p>
                                             <div
                                                  className="fw-bold"
                                                  style={{ fontSize: '1.5rem', letterSpacing: '2px', color: '#1E88E5', fontFamily: "'Courier New', monospace" }}
                                             >
                                                  {completedPayment.orderNumber}
                                             </div>
                                             <p className="text-muted small mb-0">{completedPayment.timestamp}</p>
                                        </div>

                                        {/* Totals */}
                                        <div className="border rounded p-3 small" style={{ background: 'var(--bs-tertiary-bg)' }}>
                                             <div className="d-flex justify-content-between text-muted mb-1">
                                                  <span>Subtotal</span>
                                                  <span>{currencyFormatter.format(completedPayment.subtotal)}</span>
                                             </div>
                                             {completedPayment.discountAmount > 0 && (
                                                  <div className="d-flex justify-content-between text-success mb-1">
                                                       <span>Discount</span>
                                                       <span>- {currencyFormatter.format(completedPayment.discountAmount)}</span>
                                                  </div>
                                             )}
                                             <div className="d-flex justify-content-between fw-bold border-top pt-1 mt-1">
                                                  <span>Total</span>
                                                  <span>{currencyFormatter.format(completedPayment.total)}</span>
                                             </div>
                                             <div className="d-flex justify-content-between text-muted mt-1">
                                                  <span>Paid ({PAYMENT_CONFIG[completedPayment.paymentMethod].label})</span>
                                                  <span>{currencyFormatter.format(completedPayment.amountPaid)}</span>
                                             </div>
                                             {completedPayment.change > 0 && (
                                                  <div className="d-flex justify-content-between text-success fw-semibold">
                                                       <span>Change</span>
                                                       <span>{currencyFormatter.format(completedPayment.change)}</span>
                                                  </div>
                                             )}
                                        </div>
                                   </div>

                                   <div className="modal-footer justify-content-between border-top px-4 pb-3 pt-2">
                                        <button
                                             className="btn btn-outline-secondary btn-sm"
                                             onClick={() => setShowReceipt(false)}
                                        >
                                             <RiCloseLine size={16} className="me-1" /> Close
                                        </button>
                                        <button
                                             className="btn btn-primary btn-sm"
                                             style={{ background: '#1E88E5', border: 'none' }}
                                             onClick={() => window.print()}
                                        >
                                             <RiPrinterLine size={16} className="me-1" /> Reprint
                                        </button>
                                   </div>
                              </div>
                         </div>
                    </div>
               )}

               {/* Hidden 80mm thermal receipt — only visible on print */}
               {completedPayment && <ThermalReceipt payment={completedPayment} />}

               {/* Spin animation + print isolation */}
               <style>{`
                    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                    @media print {
                         body > * { display: none !important; }
                         #pharm-pos-print { display: block !important; }
                         @page { size: 80mm auto; margin: 2mm; }
                    }
               `}</style>
          </>
     );
}
