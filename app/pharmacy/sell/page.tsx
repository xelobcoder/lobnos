'use client';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
     RiSearchLine,
     RiShoppingCartLine,
     RiDeleteBinLine,
     RiAddLine,
     RiSubtractLine,
     RiPrinterLine,
     RiCheckLine,
     RiLoader4Line,
     RiMedicineBottleLine,
     RiCloseLine,
     RiCalculatorLine,
     RiFileListLine,
     RiTimeLine,
} from '@remixicon/react';
import { customPost, currencyFormatter } from '../../../components/Auth/customFetch';
import { useApplicationSettings } from '../../../components/Auth/useApplicationContext';
import { toast } from 'react-toastify';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Drug {
     id: number;
     name: string;
     genericName?: string;
     strength?: string;
     form: string;
     category?: string;
     sellingPrice: number;
     stockQty: number;
     unit: string;
}

interface CartItem {
     drug: Drug;
     quantity: number;
     unitPrice: number;
     lineTotal: number;
     instructions: string;
     dosageUnitsPerDose: number;
     dosageFreq: string;
     dosageDays: number;
}

interface GeneratedOrder {
     orderId: number;
     orderNumber: string;
     items: CartItem[];
     subtotal: number;
     total: number;
     timestamp: string;
     pharmacistName: string;
}

// ─── Dosage frequency options ─────────────────────────────────────────────────
const FREQ_OPTIONS = [
     { label: 'OD (Once daily)',    value: 'OD',   perDay: 1 },
     { label: 'BD (Twice daily)',   value: 'BD',   perDay: 2 },
     { label: 'TDS (Three times)', value: 'TDS',  perDay: 3 },
     { label: 'QDS (Four times)',  value: 'QDS',  perDay: 4 },
     { label: 'PRN (As needed)',   value: 'PRN',  perDay: 0 },
     { label: 'STAT (Immediately)',value: 'STAT', perDay: 0 },
     { label: 'OM (Every morning)','value': 'OM', perDay: 1 },
     { label: 'ON (Every night)',  value: 'ON',   perDay: 1 },
];

const FREQ_MAP: Record<string, number> = {
     OD: 1, BD: 2, TDS: 3, QDS: 4, PRN: 0, STAT: 0, OM: 1, ON: 1,
};

function calcDosageQty(unitsPerDose: number, freq: string, days: number): number {
     if (freq === 'PRN' || freq === 'STAT') return unitsPerDose;
     return unitsPerDose * (FREQ_MAP[freq] ?? 1) * days;
}

function buildInstructions(unitsPerDose: number, freq: string, days: number, unit: string): string {
     if (freq === 'STAT') return `${unitsPerDose} ${unit} STAT (immediately)`;
     if (freq === 'PRN')  return `${unitsPerDose} ${unit} when required`;
     return `${unitsPerDose} ${unit} ${freq} \u00d7 ${days} day${days !== 1 ? 's' : ''}`;
}

// ─── Mock drug data (replace with API when backend is ready) ──────────────────
const MOCK_DRUGS: Drug[] = [
     { id: 1,  name: 'Paracetamol',   genericName: 'Acetaminophen',    strength: '500mg',  form: 'Tablet',    category: 'Analgesic',        sellingPrice: 0.80,  stockQty: 500, unit: 'tablet'  },
     { id: 2,  name: 'Amoxicillin',   strength: '250mg',               form: 'Capsule',    category: 'Antibiotic',       sellingPrice: 2.50,  stockQty: 200, unit: 'capsule' },
     { id: 3,  name: 'Ibuprofen',     strength: '400mg',               form: 'Tablet',     category: 'NSAID',            sellingPrice: 1.20,  stockQty: 300, unit: 'tablet'  },
     { id: 4,  name: 'Metronidazole', strength: '400mg',               form: 'Tablet',     category: 'Antibiotic',       sellingPrice: 1.50,  stockQty: 150, unit: 'tablet'  },
     { id: 5,  name: 'ORS Sachet',    genericName: 'Oral Rehydration', strength: '20.5g',  form: 'Sachet',    category: 'Rehydration',      sellingPrice: 3.00,  stockQty: 400, unit: 'sachet'  },
     { id: 6,  name: 'Chloroquine',   strength: '250mg',               form: 'Tablet',     category: 'Antimalarial',     sellingPrice: 2.00,  stockQty: 90,  unit: 'tablet'  },
     { id: 7,  name: 'Vitamin C',     genericName: 'Ascorbic Acid',    strength: '200mg',  form: 'Tablet',    category: 'Supplement',       sellingPrice: 0.50,  stockQty: 600, unit: 'tablet'  },
     { id: 8,  name: 'Coartem',       genericName: 'Artemether/Lum',   strength: '80/480', form: 'Tablet',    category: 'Antimalarial',     sellingPrice: 18.00, stockQty: 80,  unit: 'pack'    },
     { id: 9,  name: 'Omeprazole',    strength: '20mg',                form: 'Capsule',    category: 'Antacid',          sellingPrice: 3.50,  stockQty: 45,  unit: 'capsule' },
     { id: 10, name: 'Cough Syrup',   genericName: 'Dextromethorphan', strength: '100ml',  form: 'Syrup',     category: 'Respiratory',      sellingPrice: 12.00, stockQty: 60,  unit: 'bottle'  },
     { id: 11, name: 'Zinc Sulphate', strength: '20mg',                form: 'Tablet',     category: 'Supplement',       sellingPrice: 1.00,  stockQty: 8,   unit: 'tablet'  },
     { id: 12, name: 'Artesunate',    strength: '50mg',                form: 'Injection',  category: 'Antimalarial',     sellingPrice: 25.00, stockQty: 40,  unit: 'vial'    },
     { id: 13, name: 'Multivitamin',  strength: 'Standard',            form: 'Tablet',     category: 'Supplement',       sellingPrice: 0.60,  stockQty: 0,   unit: 'tablet'  },
     { id: 14, name: 'Metformin',     strength: '500mg',               form: 'Tablet',     category: 'Antidiabetic',     sellingPrice: 1.80,  stockQty: 220, unit: 'tablet'  },
     { id: 15, name: 'Amlodipine',    strength: '5mg',                 form: 'Tablet',     category: 'Antihypertensive', sellingPrice: 2.20,  stockQty: 180, unit: 'tablet'  },
];

const FORM_COLORS: Record<string, string> = {
     Tablet: '#1E88E5', Capsule: '#8E24AA', Syrup: '#43A047',
     Injection: '#E53935', Sachet: '#FB8C00', default: '#546E7A',
};

// ─── 80mm Thermal Order Slip (hidden, only visible on print) ─────────────────
function OrderSlipPrint({ order }: { order: GeneratedOrder }) {
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
               <div style={{ textAlign: 'center', borderBottom: '1px dashed #000', paddingBottom: 6, marginBottom: 6 }}>
                    <div style={{ fontWeight: 'bold', fontSize: '13pt' }}>PHARMACY ORDER SLIP</div>
                    <div style={{ fontWeight: 'bold', fontSize: '11pt', marginTop: 4 }}>
                         Order: {order.orderNumber}
                    </div>
                    <div style={{ fontSize: '9pt' }}>{order.timestamp}</div>
               </div>

               <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '9.5pt' }}>
                    <thead>
                         <tr style={{ borderBottom: '1px solid #000' }}>
                              <th style={{ textAlign: 'left', paddingBottom: 2 }}>Drug</th>
                              <th style={{ textAlign: 'right', paddingBottom: 2 }}>Qty</th>
                              <th style={{ textAlign: 'right', paddingBottom: 2 }}>GHS</th>
                         </tr>
                    </thead>
                    <tbody>
                         {order.items.map((item, i) => (
                              <React.Fragment key={i}>
                                   <tr>
                                        <td style={{ paddingTop: 3 }}>
                                             {item.drug.name}{item.drug.strength ? ` ${item.drug.strength}` : ''}
                                        </td>
                                        <td style={{ textAlign: 'right', paddingTop: 3 }}>{item.quantity}</td>
                                        <td style={{ textAlign: 'right', paddingTop: 3 }}>
                                             {item.lineTotal.toFixed(2)}
                                        </td>
                                   </tr>
                                   {item.instructions && (
                                        <tr>
                                             <td colSpan={3} style={{ fontSize: '8.5pt', paddingBottom: 3, paddingLeft: 6, color: '#333' }}>
                                                  Sig: {item.instructions}
                                             </td>
                                        </tr>
                                   )}
                              </React.Fragment>
                         ))}
                    </tbody>
               </table>

               <div style={{ borderTop: '1px dashed #000', marginTop: 6, paddingTop: 4 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '11pt' }}>
                         <span>TOTAL:</span>
                         <span>GHS {order.total.toFixed(2)}</span>
                    </div>
               </div>

               <div style={{ borderTop: '1px dashed #000', marginTop: 6, paddingTop: 4, textAlign: 'center', fontSize: '9pt' }}>
                    <div>Dispensed by: {order.pharmacistName}</div>
                    <div style={{ marginTop: 4, fontWeight: 'bold' }}>
                         Present this slip to the cashier for payment
                    </div>
                    <div style={{ marginTop: 6, borderTop: '1px dashed #000', paddingTop: 4 }}>
                         Thank you
                    </div>
               </div>
          </div>
     );
}

// ─── Main Pharmacist POS Page ─────────────────────────────────────────────────
export default function PharmacySellPage() {
     const { applicationsettings } = useApplicationSettings();
     const pharmacistName = applicationsettings?.user?.username ?? 'Pharmacist';

     const [query, setQuery]                     = useState('');
     const [filteredDrugs, setFilteredDrugs]     = useState<Drug[]>(MOCK_DRUGS);
     const [searching, setSearching]             = useState(false);
     const [cart, setCart]                       = useState<CartItem[]>([]);
     const [dosageOpen, setDosageOpen]           = useState<Set<number>>(new Set());
     const [dispensing, setDispensing]           = useState(false);
     const [generatedOrder, setGeneratedOrder]   = useState<GeneratedOrder | null>(null);
     const [showOrderModal, setShowOrderModal]   = useState(false);

     const searchRef  = useRef<HTMLInputElement>(null);
     const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

     // ── Drug search ────────────────────────────────────────────────────────
     useEffect(() => {
          if (debounceRef.current) clearTimeout(debounceRef.current);
          if (!query.trim()) {
               setFilteredDrugs(MOCK_DRUGS);
               return;
          }
          setSearching(true);
          debounceRef.current = setTimeout(async () => {
               try {
                    // TODO: swap mock with real API
                    // const res = await customFetch(`pharmacy/drugs?search=${encodeURIComponent(query)}`);
                    // if (res?.status === 'success') { setFilteredDrugs(res.result); return; }
                    const lower = query.toLowerCase();
                    setFilteredDrugs(
                         MOCK_DRUGS.filter(d =>
                              d.name.toLowerCase().includes(lower) ||
                              d.genericName?.toLowerCase().includes(lower) ||
                              d.category?.toLowerCase().includes(lower) ||
                              d.form.toLowerCase().includes(lower)
                         )
                    );
               } finally {
                    setSearching(false);
               }
          }, 280);
     }, [query]);

     // ── Cart helpers ───────────────────────────────────────────────────────
     const addToCart = useCallback((drug: Drug) => {
          if (drug.stockQty === 0) {
               toast.error(`${drug.name} is out of stock`);
               return;
          }
          setCart(prev => {
               if (prev.find(i => i.drug.id === drug.id)) return prev; // already in cart
               return [
                    ...prev,
                    {
                         drug,
                         quantity: 21,                // default: 1 tab TDS × 7 days
                         unitPrice: drug.sellingPrice,
                         lineTotal: 21 * drug.sellingPrice,
                         instructions: buildInstructions(1, 'TDS', 7, drug.unit),
                         dosageUnitsPerDose: 1,
                         dosageFreq: 'TDS',
                         dosageDays: 7,
                    },
               ];
          });
          // Auto-open dosage calculator
          setDosageOpen(prev => new Set([...prev, drug.id]));
     }, []);

     const removeFromCart = useCallback((drugId: number) => {
          setCart(prev => prev.filter(i => i.drug.id !== drugId));
          setDosageOpen(prev => { const s = new Set(prev); s.delete(drugId); return s; });
     }, []);

     const toggleDosage = (drugId: number) =>
          setDosageOpen(prev => {
               const s = new Set(prev);
               s.has(drugId) ? s.delete(drugId) : s.add(drugId);
               return s;
          });

     const updateDosage = (
          drugId: number,
          field: 'dosageUnitsPerDose' | 'dosageFreq' | 'dosageDays',
          value: number | string
     ) => {
          setCart(prev =>
               prev.map(item => {
                    if (item.drug.id !== drugId) return item;
                    const updated = { ...item, [field]: value };
                    const qty = calcDosageQty(
                         updated.dosageUnitsPerDose,
                         updated.dosageFreq,
                         updated.dosageDays
                    );
                    return {
                         ...updated,
                         quantity: Math.max(1, qty),
                         lineTotal: Math.max(1, qty) * item.unitPrice,
                         instructions: buildInstructions(
                              updated.dosageUnitsPerDose,
                              updated.dosageFreq,
                              updated.dosageDays,
                              item.drug.unit
                         ),
                    };
               })
          );
     };

     const manualQtyChange = (drugId: number, delta: number) =>
          setCart(prev =>
               prev.map(item => {
                    if (item.drug.id !== drugId) return item;
                    const newQty = Math.max(1, item.quantity + delta);
                    if (newQty > item.drug.stockQty) {
                         toast.warning(`Only ${item.drug.stockQty} in stock`);
                         return item;
                    }
                    return { ...item, quantity: newQty, lineTotal: newQty * item.unitPrice };
               })
          );

     const clearCart = () => { setCart([]); setDosageOpen(new Set()); };

     // ── Totals ─────────────────────────────────────────────────────────────
     const subtotal = cart.reduce((s, i) => s + i.lineTotal, 0);

     // ── Dispense & generate order ──────────────────────────────────────────
     const handleDispense = async () => {
          if (cart.length === 0) { toast.error('Cart is empty'); return; }
          setDispensing(true);
          try {
               const payload = {
                    items: cart.map(i => ({
                         drugId:       i.drug.id,
                         drugName:     i.drug.name,
                         quantity:     i.quantity,
                         unitPrice:    i.unitPrice,
                         lineTotal:    i.lineTotal,
                         instructions: i.instructions,
                    })),
                    subtotal,
                    discountType:   '%',
                    discountValue:  0,
                    discountAmount: 0,
                    total: subtotal,
               };

               let orderNumber: string;
               let orderId = 0;

               try {
                    const res = await customPost('pharmacy/orders', 'POST', payload);
                    if (res?.status === 'success' && res?.result?.orderNumber) {
                         orderNumber = res.result.orderNumber;
                         orderId     = res.result.orderId;
                    } else {
                         throw new Error('API unavailable');
                    }
               } catch {
                    // Offline fallback — generate order number locally
                    const now = new Date();
                    const ds  = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
                    const seq = String(Math.floor(Math.random() * 9000) + 1000);
                    orderNumber = `ORD-${ds}-${seq}`;
                    toast.info('Order generated offline — present slip to cashier', { autoClose: 5000 });
               }

               const order: GeneratedOrder = {
                    orderId,
                    orderNumber,
                    items: [...cart],
                    subtotal,
                    total: subtotal,
                    timestamp: new Date().toLocaleString(),
                    pharmacistName,
               };

               setGeneratedOrder(order);
               setShowOrderModal(true);
               clearCart();
          } catch {
               toast.error('Failed to generate order. Please try again.');
          } finally {
               setDispensing(false);
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
                                   <RiShoppingCartLine size={22} className="me-2" style={{ color: '#1E88E5' }} />
                                   Dispense Drugs
                              </h4>
                              <p className="text-muted mb-0 small">
                                   Add drugs to cart, set dosage, then generate an order number for the cashier
                              </p>
                         </div>
                         <span className="badge bg-primary-subtle text-primary py-2 px-3">
                              Pharmacist: {pharmacistName}
                         </span>
                    </div>

                    <div className="row g-3 align-items-start">
                         {/* ════ LEFT: Drug Search & Grid ════ */}
                         <div className="col-lg-8">
                              {/* Search bar */}
                              <div className="input-group mb-3">
                                   <span className="input-group-text bg-white border-end-0">
                                        {searching
                                             ? <RiLoader4Line size={17} className="text-muted" style={{ animation: 'spin 1s linear infinite' }} />
                                             : <RiSearchLine size={17} className="text-muted" />
                                        }
                                   </span>
                                   <input
                                        ref={searchRef}
                                        type="text"
                                        className="form-control border-start-0 shadow-none fs-6"
                                        placeholder="Search drug by name, generic name or category…"
                                        value={query}
                                        onChange={e => setQuery(e.target.value)}
                                        autoFocus
                                   />
                                   {query && (
                                        <button
                                             className="btn btn-outline-secondary border-start-0"
                                             onClick={() => setQuery('')}
                                        >
                                             <RiCloseLine size={16} />
                                        </button>
                                   )}
                              </div>

                              {/* Drug grid */}
                              {filteredDrugs.length === 0 ? (
                                   <div className="text-center text-muted py-5">
                                        <RiMedicineBottleLine size={48} className="mb-2 opacity-25" />
                                        <p className="mb-0">No drugs found for &ldquo;{query}&rdquo;</p>
                                   </div>
                              ) : (
                                   <div className="row g-2">
                                        {filteredDrugs.map(drug => {
                                             const formColor = FORM_COLORS[drug.form] ?? FORM_COLORS.default;
                                             const outOfStock = drug.stockQty === 0;
                                             const lowStock   = drug.stockQty > 0 && drug.stockQty < 10;
                                             const inCart     = !!cart.find(i => i.drug.id === drug.id);
                                             return (
                                                  <div key={drug.id} className="col-6 col-sm-4 col-xl-3">
                                                       <div
                                                            className={`card h-100 border ${outOfStock ? 'opacity-50' : ''}`}
                                                            style={{
                                                                 borderRadius: '8px',
                                                                 cursor: outOfStock ? 'not-allowed' : 'pointer',
                                                                 borderColor: inCart ? '#1E88E5' : undefined,
                                                                 boxShadow: inCart ? '0 0 0 2px #1E88E51A' : undefined,
                                                                 transition: 'box-shadow 0.15s, border-color 0.15s',
                                                            }}
                                                            onClick={() => !outOfStock && addToCart(drug)}
                                                       >
                                                            <div className="card-body p-2">
                                                                 <div className="d-flex justify-content-between align-items-center mb-1">
                                                                      <span
                                                                           className="badge"
                                                                           style={{ background: `${formColor}20`, color: formColor, fontSize: '0.68rem' }}
                                                                      >
                                                                           {drug.form}
                                                                      </span>
                                                                      {outOfStock ? (
                                                                           <span className="badge bg-danger-subtle text-danger" style={{ fontSize: '0.65rem' }}>Out</span>
                                                                      ) : lowStock ? (
                                                                           <span className="badge bg-warning-subtle text-warning" style={{ fontSize: '0.65rem' }}>Low</span>
                                                                      ) : (
                                                                           <span className="badge bg-success-subtle text-success" style={{ fontSize: '0.65rem' }}>{drug.stockQty}</span>
                                                                      )}
                                                                 </div>
                                                                 <p className="fw-semibold mb-0 lh-sm" style={{ fontSize: '0.8rem' }}>{drug.name}</p>
                                                                 {drug.strength && (
                                                                      <p className="text-muted mb-1" style={{ fontSize: '0.72rem' }}>
                                                                           {drug.strength}{drug.genericName ? ` \u00b7 ${drug.genericName}` : ''}
                                                                      </p>
                                                                 )}
                                                                 <div className="d-flex align-items-center justify-content-between mt-1">
                                                                      <span className="fw-bold text-primary" style={{ fontSize: '0.82rem' }}>
                                                                           {currencyFormatter.format(drug.sellingPrice)}
                                                                           <span className="text-muted fw-normal" style={{ fontSize: '0.68rem' }}>/{drug.unit}</span>
                                                                      </span>
                                                                      <button
                                                                           className="btn btn-sm p-0 d-flex align-items-center justify-content-center"
                                                                           style={{
                                                                                width: 26, height: 26, borderRadius: '50%',
                                                                                background: inCart ? '#1E88E5' : '#1E88E515',
                                                                                color: inCart ? '#fff' : '#1E88E5',
                                                                                border: 'none',
                                                                           }}
                                                                           onClick={e => { e.stopPropagation(); !outOfStock && addToCart(drug); }}
                                                                           disabled={outOfStock}
                                                                      >
                                                                           {inCart ? <RiCheckLine size={14} /> : <RiAddLine size={14} />}
                                                                      </button>
                                                                 </div>
                                                            </div>
                                                       </div>
                                                  </div>
                                             );
                                        })}
                                   </div>
                              )}
                         </div>

                         {/* ════ RIGHT: Dispensing Cart ════ */}
                         <div className="col-lg-4">
                              <div
                                   className="card border-0 shadow-sm"
                                   style={{ borderRadius: '10px', position: 'sticky', top: '80px' }}
                              >
                                   {/* Cart header */}
                                   <div
                                        className="card-header d-flex justify-content-between align-items-center py-2 px-3"
                                        style={{ borderRadius: '10px 10px 0 0', background: '#1E88E5', color: '#fff' }}
                                   >
                                        <span className="fw-semibold d-flex align-items-center gap-2">
                                             <RiShoppingCartLine size={18} />
                                             Dispensing Cart
                                             {cart.length > 0 && (
                                                  <span className="badge bg-white text-primary ms-1" style={{ fontSize: '0.75rem' }}>
                                                       {cart.length} drug{cart.length !== 1 ? 's' : ''}
                                                  </span>
                                             )}
                                        </span>
                                        {cart.length > 0 && (
                                             <button
                                                  className="btn btn-sm p-0 text-white opacity-75"
                                                  onClick={clearCart}
                                                  title="Clear cart"
                                             >
                                                  <RiDeleteBinLine size={16} />
                                             </button>
                                        )}
                                   </div>

                                   <div className="card-body p-0">
                                        {/* Empty state */}
                                        {cart.length === 0 ? (
                                             <div className="text-center text-muted py-4 px-3">
                                                  <RiMedicineBottleLine size={36} className="mb-2 opacity-25" />
                                                  <p className="mb-0 small">No drugs in cart.<br />Click a drug to add it.</p>
                                             </div>
                                        ) : (
                                             <div style={{ maxHeight: '520px', overflowY: 'auto' }}>
                                                  {cart.map(item => {
                                                       const isOpen = dosageOpen.has(item.drug.id);
                                                       return (
                                                            <div key={item.drug.id} className="border-bottom px-3 py-2">
                                                                 {/* Drug row */}
                                                                 <div className="d-flex align-items-center gap-2">
                                                                      <div className="flex-grow-1 min-w-0">
                                                                           <p className="mb-0 fw-semibold text-truncate" style={{ fontSize: '0.82rem' }}>
                                                                                {item.drug.name}
                                                                                {item.drug.strength && (
                                                                                     <span className="text-muted fw-normal"> {item.drug.strength}</span>
                                                                                )}
                                                                           </p>
                                                                           {item.instructions && (
                                                                                <p className="mb-0 text-muted" style={{ fontSize: '0.7rem' }}>
                                                                                     {item.instructions}
                                                                                </p>
                                                                           )}
                                                                      </div>
                                                                      {/* Manual qty stepper */}
                                                                      <div className="d-flex align-items-center gap-1">
                                                                           <button
                                                                                className="btn btn-sm p-0 d-flex align-items-center justify-content-center"
                                                                                style={{ width: 22, height: 22, borderRadius: '4px', background: '#f0f0f0', border: 'none' }}
                                                                                onClick={() => manualQtyChange(item.drug.id, -1)}
                                                                           >
                                                                                <RiSubtractLine size={13} />
                                                                           </button>
                                                                           <span style={{ minWidth: '28px', textAlign: 'center', fontSize: '0.82rem', fontWeight: 600 }}>
                                                                                {item.quantity}
                                                                           </span>
                                                                           <button
                                                                                className="btn btn-sm p-0 d-flex align-items-center justify-content-center"
                                                                                style={{ width: 22, height: 22, borderRadius: '4px', background: '#f0f0f0', border: 'none' }}
                                                                                onClick={() => manualQtyChange(item.drug.id, 1)}
                                                                           >
                                                                                <RiAddLine size={13} />
                                                                           </button>
                                                                      </div>
                                                                      {/* Line total */}
                                                                      <span className="fw-bold text-nowrap" style={{ fontSize: '0.8rem', minWidth: 56, textAlign: 'right' }}>
                                                                           {currencyFormatter.format(item.lineTotal)}
                                                                      </span>
                                                                      {/* Dosage calculator toggle */}
                                                                      <button
                                                                           className={`btn btn-sm p-0 d-flex align-items-center justify-content-center ${isOpen ? 'text-primary' : 'text-muted'}`}
                                                                           style={{ width: 22, height: 22 }}
                                                                           title="Dosage calculator"
                                                                           onClick={() => toggleDosage(item.drug.id)}
                                                                      >
                                                                           <RiCalculatorLine size={15} />
                                                                      </button>
                                                                      <button
                                                                           className="btn btn-sm p-0 text-danger"
                                                                           onClick={() => removeFromCart(item.drug.id)}
                                                                           title="Remove"
                                                                      >
                                                                           <RiCloseLine size={16} />
                                                                      </button>
                                                                 </div>

                                                                 {/* ── Dosage Calculator (expandable) ── */}
                                                                 {isOpen && (
                                                                      <div
                                                                           className="mt-2 p-2 rounded"
                                                                           style={{ background: '#f0f7ff', border: '1px solid #1E88E530' }}
                                                                      >
                                                                           <p className="text-muted mb-1" style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.03em' }}>
                                                                                DOSAGE CALCULATOR
                                                                           </p>
                                                                           <div className="row g-1 mb-1">
                                                                                <div className="col-4">
                                                                                     <label className="text-muted" style={{ fontSize: '0.68rem' }}>Units/dose</label>
                                                                                     <input
                                                                                          type="number"
                                                                                          min={1}
                                                                                          className="form-control form-control-sm shadow-none"
                                                                                          style={{ fontSize: '0.78rem' }}
                                                                                          value={item.dosageUnitsPerDose}
                                                                                          onChange={e =>
                                                                                               updateDosage(item.drug.id, 'dosageUnitsPerDose', Math.max(1, parseInt(e.target.value) || 1))
                                                                                          }
                                                                                     />
                                                                                </div>
                                                                                <div className="col-4">
                                                                                     <label className="text-muted" style={{ fontSize: '0.68rem' }}>Frequency</label>
                                                                                     <select
                                                                                          className="form-select form-select-sm shadow-none"
                                                                                          style={{ fontSize: '0.78rem' }}
                                                                                          value={item.dosageFreq}
                                                                                          onChange={e => updateDosage(item.drug.id, 'dosageFreq', e.target.value)}
                                                                                     >
                                                                                          {FREQ_OPTIONS.map(f => (
                                                                                               <option key={f.value} value={f.value}>{f.label}</option>
                                                                                          ))}
                                                                                     </select>
                                                                                </div>
                                                                                <div className="col-4">
                                                                                     <label className="text-muted" style={{ fontSize: '0.68rem' }}>Days</label>
                                                                                     <input
                                                                                          type="number"
                                                                                          min={1}
                                                                                          className="form-control form-control-sm shadow-none"
                                                                                          style={{ fontSize: '0.78rem' }}
                                                                                          value={item.dosageDays}
                                                                                          onChange={e =>
                                                                                               updateDosage(item.drug.id, 'dosageDays', Math.max(1, parseInt(e.target.value) || 1))
                                                                                          }
                                                                                          disabled={item.dosageFreq === 'PRN' || item.dosageFreq === 'STAT'}
                                                                                     />
                                                                                </div>
                                                                           </div>
                                                                           <div className="d-flex align-items-center gap-1" style={{ fontSize: '0.7rem', color: '#555' }}>
                                                                                <RiTimeLine size={11} />
                                                                                <span>
                                                                                     {item.instructions || 'Set dosage above'}
                                                                                     {' \u2192 '}
                                                                                     <strong>{item.quantity} {item.drug.unit}{item.quantity !== 1 ? 's' : ''}</strong>
                                                                                </span>
                                                                           </div>
                                                                      </div>
                                                                 )}
                                                            </div>
                                                       );
                                                  })}
                                             </div>
                                        )}

                                        {/* Subtotal + Dispense button */}
                                        <div className="px-3 pt-2 pb-3">
                                             <div
                                                  className="border rounded p-2 mb-3"
                                                  style={{ background: 'var(--bs-tertiary-bg)', fontSize: '0.82rem' }}
                                             >
                                                  <div className="d-flex justify-content-between fw-bold">
                                                       <span>Subtotal</span>
                                                       <span className="text-primary fs-6">{currencyFormatter.format(subtotal)}</span>
                                                  </div>
                                                  <div className="text-muted small mt-1">
                                                       Discount &amp; payment collected at cashier desk
                                                  </div>
                                             </div>
                                             <button
                                                  className="btn btn-success w-100 d-flex align-items-center justify-content-center gap-2"
                                                  style={{ borderRadius: '8px' }}
                                                  onClick={handleDispense}
                                                  disabled={cart.length === 0 || dispensing}
                                             >
                                                  {dispensing
                                                       ? <><RiLoader4Line size={18} style={{ animation: 'spin 1s linear infinite' }} /> Generating…</>
                                                       : <><RiFileListLine size={18} /> Dispense &amp; Generate Order</>
                                                  }
                                             </button>
                                        </div>
                                   </div>
                              </div>
                         </div>
                    </div>
               </div>

               {/* ════ Order Generated Modal ════ */}
               {showOrderModal && generatedOrder && (
                    <div
                         className="modal d-block"
                         tabIndex={-1}
                         style={{ background: 'rgba(0,0,0,0.65)' }}
                         onClick={e => { if (e.target === e.currentTarget) setShowOrderModal(false); }}
                    >
                         <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: 460 }}>
                              <div className="modal-content" style={{ borderRadius: '12px', overflow: 'hidden' }}>
                                   {/* Success header */}
                                   <div className="text-center p-4 pb-3" style={{ background: '#43A047', color: '#fff' }}>
                                        <RiCheckLine size={42} className="mb-2" />
                                        <h5 className="mb-1 fw-bold">Order Generated!</h5>
                                        <p className="mb-0 opacity-75 small">Give this order number to the patient</p>
                                   </div>

                                   <div className="modal-body p-4">
                                        {/* Big order number */}
                                        <div className="text-center mb-4">
                                             <p className="text-muted small mb-1">Order Number</p>
                                             <div
                                                  className="fw-bold"
                                                  style={{
                                                       fontSize: '2rem',
                                                       letterSpacing: '3px',
                                                       color: '#1E88E5',
                                                       fontFamily: "'Courier New', monospace",
                                                  }}
                                             >
                                                  {generatedOrder.orderNumber}
                                             </div>
                                             <p className="text-muted small mb-0">{generatedOrder.timestamp}</p>
                                        </div>

                                        {/* Items summary */}
                                        <table className="table table-sm small mb-3">
                                             <thead>
                                                  <tr className="text-muted">
                                                       <th className="text-start">Drug</th>
                                                       <th className="text-center">Qty</th>
                                                       <th className="text-end">Total</th>
                                                  </tr>
                                             </thead>
                                             <tbody>
                                                  {generatedOrder.items.map((item, idx) => (
                                                       <tr key={idx}>
                                                            <td className="text-start">
                                                                 {item.drug.name}
                                                                 {item.drug.strength && <span className="text-muted"> {item.drug.strength}</span>}
                                                                 {item.instructions && (
                                                                      <div className="text-muted" style={{ fontSize: '0.7rem' }}>
                                                                           Sig: {item.instructions}
                                                                      </div>
                                                                 )}
                                                            </td>
                                                            <td className="text-center">{item.quantity} {item.drug.unit}</td>
                                                            <td className="text-end">{currencyFormatter.format(item.lineTotal)}</td>
                                                       </tr>
                                                  ))}
                                             </tbody>
                                             <tfoot className="fw-bold border-top">
                                                  <tr>
                                                       <td className="text-start" colSpan={2}>Total</td>
                                                       <td className="text-end text-primary">{currencyFormatter.format(generatedOrder.total)}</td>
                                                  </tr>
                                             </tfoot>
                                        </table>

                                        <div className="alert alert-info py-2 px-3 small mb-0" role="alert">
                                             <strong>Instruct patient:</strong> Present order number{' '}
                                             <strong>{generatedOrder.orderNumber}</strong> at the cashier desk for payment.
                                        </div>
                                   </div>

                                   <div className="modal-footer justify-content-between border-top px-4 pb-3 pt-2">
                                        <button
                                             className="btn btn-outline-secondary btn-sm"
                                             onClick={() => setShowOrderModal(false)}
                                        >
                                             <RiCloseLine size={16} className="me-1" /> Close
                                        </button>
                                        <button
                                             className="btn btn-primary btn-sm"
                                             style={{ background: '#1E88E5', border: 'none' }}
                                             onClick={() => window.print()}
                                        >
                                             <RiPrinterLine size={16} className="me-1" /> Print Order Slip
                                        </button>
                                   </div>
                              </div>
                         </div>
                    </div>
               )}

               {/* Hidden 80mm thermal order slip — only visible when printing */}
               {generatedOrder && <OrderSlipPrint order={generatedOrder} />}

               {/* Animations + print isolation */}
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
