'use client';
import React, { useState, useEffect } from 'react';
import {
     RiFileListLine,
     RiCalendarEventLine,
     RiRefreshLine,
     RiSearchLine,
     RiPrinterLine,
     RiArrowDownSLine,
     RiArrowUpSLine,
     RiLoader4Line,
     RiBankCardLine,
     RiSmartphoneLine,
     RiShieldCheckLine,
} from '@remixicon/react';
import { currencyFormatter } from '../../../components/Auth/customFetch';

// ─── Types ───────────────────────────────────────────────────────────────────

interface SaleItem {
     drugName: string;
     strength?: string;
     quantity: number;
     unit: string;
     unitPrice: number;
     lineTotal: number;
}

interface PharmacySale {
     saleId: string;
     timestamp: string;
     patientName: string;
     items: SaleItem[];
     subtotal: number;
     discount: number;
     total: number;
     paymentMethod: 'cash' | 'momo' | 'insurance';
     cashierName: string;
}

// ─── Mock data ───────────────────────────────────────────────────────────────

const TODAY = new Date();
const daysAgo = (n: number) => {
     const d = new Date(TODAY);
     d.setDate(d.getDate() - n);
     return d.toISOString();
};

const MOCK_SALES: PharmacySale[] = [
     {
          saleId: 'PH-20260325001', timestamp: daysAgo(0),
          patientName: 'Akosua Mensah', paymentMethod: 'cash', cashierName: 'Josephine',
          items: [
               { drugName: 'Paracetamol', strength: '500mg', quantity: 6, unit: 'tablet', unitPrice: 0.80, lineTotal: 4.80 },
               { drugName: 'ORS Sachet', strength: '20.5g', quantity: 2, unit: 'sachet', unitPrice: 3.00, lineTotal: 6.00 },
          ],
          subtotal: 10.80, discount: 0, total: 10.80,
     },
     {
          saleId: 'PH-20260325002', timestamp: daysAgo(0),
          patientName: 'Walk-in Customer', paymentMethod: 'momo', cashierName: 'Josephine',
          items: [
               { drugName: 'Coartem', strength: '80/480mg', quantity: 1, unit: 'pack', unitPrice: 18.00, lineTotal: 18.00 },
               { drugName: 'Paracetamol', strength: '500mg', quantity: 4, unit: 'tablet', unitPrice: 0.80, lineTotal: 3.20 },
          ],
          subtotal: 21.20, discount: 1.20, total: 20.00,
     },
     {
          saleId: 'PH-20260324001', timestamp: daysAgo(1),
          patientName: 'Kofi Agyeman', paymentMethod: 'insurance', cashierName: 'Bright',
          items: [
               { drugName: 'Metformin', strength: '500mg', quantity: 30, unit: 'tablet', unitPrice: 1.80, lineTotal: 54.00 },
               { drugName: 'Amlodipine', strength: '5mg', quantity: 30, unit: 'tablet', unitPrice: 2.20, lineTotal: 66.00 },
          ],
          subtotal: 120.00, discount: 24.00, total: 96.00,
     },
     {
          saleId: 'PH-20260324002', timestamp: daysAgo(1),
          patientName: 'Abena Osei', paymentMethod: 'cash', cashierName: 'Josephine',
          items: [
               { drugName: 'Amoxicillin', strength: '250mg', quantity: 10, unit: 'capsule', unitPrice: 2.50, lineTotal: 25.00 },
               { drugName: 'Ibuprofen', strength: '400mg', quantity: 6, unit: 'tablet', unitPrice: 1.20, lineTotal: 7.20 },
               { drugName: 'Omeprazole', strength: '20mg', quantity: 5, unit: 'capsule', unitPrice: 3.50, lineTotal: 17.50 },
          ],
          subtotal: 49.70, discount: 0, total: 49.70,
     },
     {
          saleId: 'PH-20260323001', timestamp: daysAgo(2),
          patientName: 'Emmanuel Boateng', paymentMethod: 'momo', cashierName: 'Bright',
          items: [
               { drugName: 'Cough Syrup', strength: '100ml', quantity: 1, unit: 'bottle', unitPrice: 12.00, lineTotal: 12.00 },
               { drugName: 'Vitamin C', strength: '200mg', quantity: 10, unit: 'tablet', unitPrice: 0.50, lineTotal: 5.00 },
          ],
          subtotal: 17.00, discount: 0, total: 17.00,
     },
     {
          saleId: 'PH-20260322001', timestamp: daysAgo(3),
          patientName: 'Adwoa Poku', paymentMethod: 'cash', cashierName: 'Josephine',
          items: [
               { drugName: 'Metronidazole', strength: '400mg', quantity: 15, unit: 'tablet', unitPrice: 1.50, lineTotal: 22.50 },
          ],
          subtotal: 22.50, discount: 2.50, total: 20.00,
     },
];

const PAYMENT_ICON: Record<string, React.ReactNode> = {
     cash: <RiBankCardLine size={14} className="me-1" />,
     momo: <RiSmartphoneLine size={14} className="me-1" />,
     insurance: <RiShieldCheckLine size={14} className="me-1" />,
};
const PAYMENT_COLOR: Record<string, string> = {
     cash: 'bg-success-subtle text-success',
     momo: 'bg-primary-subtle text-primary',
     insurance: 'bg-info-subtle text-info',
};

export default function SalesHistoryPage() {
     const today = TODAY.toISOString().split('T')[0];
     const sevenDaysAgo = new Date(TODAY.getTime() - 7 * 86400000).toISOString().split('T')[0];

     const [startDate, setStartDate] = useState(sevenDaysAgo);
     const [endDate, setEndDate] = useState(today);
     const [searchQuery, setSearchQuery] = useState('');
     const [loading, setLoading] = useState(false);
     const [sales, setSales] = useState<PharmacySale[]>(MOCK_SALES);
     const [expandedId, setExpandedId] = useState<string | null>(null);

     const fetchSales = async () => {
          setLoading(true);
          try {
               // Replace with: const res = await customFetch(`pharmacy/sales?startDate=${startDate}&endDate=${endDate}`);
               await new Promise(r => setTimeout(r, 400));
               setSales(MOCK_SALES);
          } finally {
               setLoading(false);
          }
     };

     useEffect(() => { fetchSales(); }, [startDate, endDate]);

     const filtered = sales.filter(s => {
          if (!searchQuery.trim()) return true;
          const q = searchQuery.toLowerCase();
          return (
               s.patientName.toLowerCase().includes(q) ||
               s.saleId.toLowerCase().includes(q) ||
               s.cashierName.toLowerCase().includes(q) ||
               s.paymentMethod.includes(q)
          );
     });

     const grandTotal = filtered.reduce((s, sale) => s + sale.total, 0);

     const formatDateTime = (iso: string) =>
          new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });

     return (
          <div className="py-2">
               {/* Header */}
               <div className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom">
                    <div>
                         <h4 className="mb-0 fw-bold" style={{ color: '#43A047' }}>
                              <RiFileListLine size={22} className="me-2" style={{ color: '#43A047' }} />
                              Sales History
                         </h4>
                         <p className="text-muted mb-0 small">All pharmacy dispensing records</p>
                    </div>
                    <button className="btn btn-sm btn-outline-secondary" onClick={() => window.print()}>
                         <RiPrinterLine size={15} className="me-1" /> Print
                    </button>
               </div>

               {/* Filters */}
               <div className="card border-0 shadow-sm mb-3" style={{ borderRadius: '8px' }}>
                    <div className="card-body py-2 px-3">
                         <div className="row g-2 align-items-center">
                              <div className="col-12 col-sm-auto">
                                   <div className="input-group input-group-sm" style={{ minWidth: 155 }}>
                                        <span className="input-group-text bg-transparent border-end-0">
                                             <RiCalendarEventLine size={15} className="text-muted" />
                                        </span>
                                        <input
                                             type="date"
                                             className="form-control border-start-0 shadow-none"
                                             value={startDate}
                                             onChange={e => setStartDate(e.target.value)}
                                        />
                                   </div>
                              </div>
                              <div className="col-12 col-sm-auto">
                                   <div className="input-group input-group-sm" style={{ minWidth: 155 }}>
                                        <span className="input-group-text bg-transparent border-end-0">
                                             <RiCalendarEventLine size={15} className="text-muted" />
                                        </span>
                                        <input
                                             type="date"
                                             className="form-control border-start-0 shadow-none"
                                             value={endDate}
                                             min={startDate}
                                             onChange={e => setEndDate(e.target.value)}
                                        />
                                   </div>
                              </div>
                              <div className="col-12 col-sm">
                                   <div className="input-group input-group-sm">
                                        <span className="input-group-text bg-transparent border-end-0">
                                             <RiSearchLine size={15} className="text-muted" />
                                        </span>
                                        <input
                                             type="text"
                                             className="form-control border-start-0 shadow-none"
                                             placeholder="Search customer, sale ID, cashier…"
                                             value={searchQuery}
                                             onChange={e => setSearchQuery(e.target.value)}
                                        />
                                   </div>
                              </div>
                              <div className="col-auto">
                                   <button className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1" onClick={fetchSales}>
                                        <RiRefreshLine size={15} /> Refresh
                                   </button>
                              </div>
                         </div>
                    </div>
               </div>

               {/* Summary row */}
               <div className="row g-2 mb-3">
                    {[
                         { label: 'Total Sales', value: filtered.length, color: '#1E88E5', suffix: 'transactions' },
                         { label: 'Revenue', value: currencyFormatter.format(grandTotal), color: '#43A047', suffix: '' },
                         { label: 'Cash Sales', value: filtered.filter(s => s.paymentMethod === 'cash').length, color: '#FB8C00', suffix: 'transactions' },
                         { label: 'MoMo Sales', value: filtered.filter(s => s.paymentMethod === 'momo').length, color: '#8E24AA', suffix: 'transactions' },
                    ].map((m, i) => (
                         <div key={i} className="col-6 col-md-3">
                              <div className="border rounded p-2 h-100">
                                   <p className="text-muted small mb-1">{m.label}</p>
                                   <p className="fw-bold mb-0 fs-6" style={{ color: m.color }}>{m.value}</p>
                                   {m.suffix && <p className="text-muted mb-0" style={{ fontSize: '0.7rem' }}>{m.suffix}</p>}
                              </div>
                         </div>
                    ))}
               </div>

               {/* Table */}
               {loading ? (
                    <div className="text-center py-5 text-muted">
                         <RiLoader4Line size={36} className="mb-2" style={{ animation: 'spin 1s linear infinite', color: '#43A047' }} />
                         <p>Loading sales…</p>
                    </div>
               ) : filtered.length === 0 ? (
                    <div className="text-center py-5 text-muted">
                         <RiFileListLine size={48} className="mb-2 opacity-25" />
                         <p>No sales records found.</p>
                    </div>
               ) : (
                    <div className="card border-0 shadow-sm" style={{ borderRadius: '8px' }}>
                         <div className="table-responsive">
                              <table className="table table-sm table-hover small mb-0 text-start">
                                   <thead className="sticky-top" style={{ background: 'var(--bs-tertiary-bg)' }}>
                                        <tr>
                                             <th className="ps-3">Sale ID</th>
                                             <th>Date &amp; Time</th>
                                             <th>Customer</th>
                                             <th className="text-center">Items</th>
                                             <th>Payment</th>
                                             <th>Cashier</th>
                                             <th className="text-end">Discount</th>
                                             <th className="text-end pe-3">Total</th>
                                             <th></th>
                                        </tr>
                                   </thead>
                                   <tbody>
                                        {filtered.map(sale => (
                                             <React.Fragment key={sale.saleId}>
                                                  <tr>
                                                       <td className="ps-3 text-muted">{sale.saleId}</td>
                                                       <td className="text-nowrap">{formatDateTime(sale.timestamp)}</td>
                                                       <td className="fw-medium">{sale.patientName}</td>
                                                       <td className="text-center">
                                                            <span className="badge bg-secondary-subtle text-secondary">
                                                                 {sale.items.reduce((s, i) => s + i.quantity, 0)} units
                                                            </span>
                                                       </td>
                                                       <td>
                                                            <span className={`badge d-inline-flex align-items-center ${PAYMENT_COLOR[sale.paymentMethod]}`}>
                                                                 {PAYMENT_ICON[sale.paymentMethod]}
                                                                 {sale.paymentMethod === 'momo' ? 'MoMo' : sale.paymentMethod.charAt(0).toUpperCase() + sale.paymentMethod.slice(1)}
                                                            </span>
                                                       </td>
                                                       <td>{sale.cashierName}</td>
                                                       <td className="text-end text-muted">
                                                            {sale.discount > 0 ? `− ${currencyFormatter.format(sale.discount)}` : '—'}
                                                       </td>
                                                       <td className="text-end pe-3 fw-bold">{currencyFormatter.format(sale.total)}</td>
                                                       <td>
                                                            <button
                                                                 className="btn btn-sm p-0 text-muted"
                                                                 onClick={() => setExpandedId(expandedId === sale.saleId ? null : sale.saleId)}
                                                                 title="View items"
                                                            >
                                                                 {expandedId === sale.saleId
                                                                      ? <RiArrowUpSLine size={18} />
                                                                      : <RiArrowDownSLine size={18} />}
                                                            </button>
                                                       </td>
                                                  </tr>
                                                  {expandedId === sale.saleId && (
                                                       <tr>
                                                            <td colSpan={9} className="p-0">
                                                                 <div className="px-4 py-2" style={{ background: 'var(--bs-tertiary-bg)' }}>
                                                                      <table className="table table-sm small mb-0">
                                                                           <thead>
                                                                                <tr className="text-muted">
                                                                                     <th>Drug</th>
                                                                                     <th className="text-center">Qty</th>
                                                                                     <th className="text-end">Unit Price</th>
                                                                                     <th className="text-end">Line Total</th>
                                                                                </tr>
                                                                           </thead>
                                                                           <tbody>
                                                                                {sale.items.map((item, idx) => (
                                                                                     <tr key={idx}>
                                                                                          <td>
                                                                                               {item.drugName}
                                                                                               {item.strength && <span className="text-muted"> ({item.strength})</span>}
                                                                                          </td>
                                                                                          <td className="text-center">{item.quantity} {item.unit}</td>
                                                                                          <td className="text-end">{currencyFormatter.format(item.unitPrice)}</td>
                                                                                          <td className="text-end fw-medium">{currencyFormatter.format(item.lineTotal)}</td>
                                                                                     </tr>
                                                                                ))}
                                                                           </tbody>
                                                                      </table>
                                                                 </div>
                                                            </td>
                                                       </tr>
                                                  )}
                                             </React.Fragment>
                                        ))}
                                        {/* Grand total row */}
                                        <tr className="border-top fw-bold">
                                             <td colSpan={7} className="ps-3 text-end">Grand Total</td>
                                             <td className="text-end pe-3">{currencyFormatter.format(grandTotal)}</td>
                                             <td></td>
                                        </tr>
                                   </tbody>
                              </table>
                         </div>
                    </div>
               )}

               <style>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
          </div>
     );
}
