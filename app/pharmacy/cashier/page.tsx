'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { RiBankCardLine, RiErrorWarningLine, RiLoader4Line, RiShoppingCartLine } from '@remixicon/react';
import { customFetch } from '../../../components/Auth/customFetch';

type Sale = {
     id: string;
     receiptNumber: string;
     customerName: string;
     paymentMethod: string;
     total: number;
     completedAt: string | null;
};

type Dashboard = {
     todaySales: number;
     completedSales: number;
};

const currency = new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS' });

export default function PharmacyCashierPage() {
     const [dashboard, setDashboard] = useState<Dashboard | null>(null);
     const [sales, setSales] = useState<Sale[]>([]);
     const [error, setError] = useState('');
     const [loading, setLoading] = useState(true);

     const loadCashierData = async () => {
          setLoading(true);
          setError('');
          try {
               const [dashboardResponse, historyResponse] = await Promise.all([
                    customFetch('pharmacy/dashboard'),
                    customFetch('pharmacy/sales-history?page=1&count=100'),
               ]);

               if (!dashboardResponse?.success || !historyResponse?.success) {
                    throw new Error(dashboardResponse?.error?.message || historyResponse?.error?.message || 'Unable to load cashier activity.');
               }

               setDashboard(dashboardResponse.data);
               setSales(historyResponse.data.sales || []);
          } catch (loadError) {
               setError(loadError instanceof Error ? loadError.message : 'Unable to load cashier activity.');
          } finally {
               setLoading(false);
          }
     };

     useEffect(() => {
          loadCashierData();
     }, []);

     const paymentTotals = sales.reduce<Record<string, number>>((totals, sale) => {
          const method = sale.paymentMethod.replace('_', ' ');
          totals[method] = (totals[method] || 0) + sale.total;
          return totals;
     }, {});

     return (
          <main className="container-fluid px-4 py-3" style={{ minHeight: '100vh', backgroundColor: '#FAFBFC' }}>
               <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
                    <div>
                         <span className="text-muted small text-uppercase fw-semibold">Pharmacy cashier</span>
                         <h1 className="fs-3 fw-bold mb-1">Cashier shift</h1>
                         <p className="text-muted mb-0">Review today&apos;s pharmacy takings and payment methods.</p>
                    </div>
                    <Link href="/pharmacy/sell" className="btn d-flex align-items-center gap-2" style={{ backgroundColor: '#087F73', color: '#FFFFFF' }}>
                         <RiShoppingCartLine size={18} />
                         Start a sale
                    </Link>
               </div>

               {error && (
                    <div className="alert d-flex align-items-start gap-3" role="alert" style={{ backgroundColor: '#FEF2F2', borderColor: '#B42318', borderWidth: '1px' }}>
                         <RiErrorWarningLine size={22} style={{ color: '#B42318', flexShrink: 0 }} />
                         <div className="flex-grow-1">{error}</div>
                         <button type="button" className="btn btn-sm btn-outline-danger" onClick={loadCashierData}>Retry</button>
                    </div>
               )}

               {loading ? (
                    <div className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '320px' }}>
                         <RiLoader4Line size={40} className="mb-3" style={{ color: '#087F73', animation: 'spin 1s linear infinite' }} />
                         <p className="text-muted mb-0">Loading cashier activity...</p>
                    </div>
               ) : (
                    <>
                         <div className="row g-3 mb-4">
                              <div className="col-md-6">
                                   <div className="border h-100 p-3" style={{ borderRadius: '6px', backgroundColor: '#F0FFFE', borderColor: '#BDE9E4' }}>
                                        <div className="d-flex align-items-center gap-3">
                                             <RiBankCardLine size={26} style={{ color: '#087F73' }} />
                                             <div>
                                                  <span className="text-muted small">Today&apos;s takings</span>
                                                  <div className="fs-3 fw-bold" style={{ color: '#087F73' }}>{currency.format(dashboard?.todaySales || 0)}</div>
                                             </div>
                                        </div>
                                   </div>
                              </div>
                              <div className="col-md-6">
                                   <div className="border h-100 p-3" style={{ borderRadius: '6px', backgroundColor: '#FFFBF0', borderColor: '#F2D9A6' }}>
                                        <span className="text-muted small">Completed sales</span>
                                        <div className="fs-3 fw-bold" style={{ color: '#B66A09' }}>{dashboard?.completedSales || 0}</div>
                                   </div>
                              </div>
                         </div>

                         <div className="border bg-white" style={{ borderRadius: '6px', borderColor: '#E5E7EB' }}>
                              <div className="p-3 border-bottom" style={{ borderColor: '#E5E7EB' }}>
                                   <h2 className="fs-5 fw-bold mb-0">Payment summary</h2>
                              </div>
                              <div className="p-3">
                                   {Object.keys(paymentTotals).length ? (
                                        <div className="row g-3">
                                             {Object.entries(paymentTotals).map(([method, total]) => (
                                                  <div key={method} className="col-sm-4">
                                                       <div className="p-3 h-100" style={{ backgroundColor: '#F4F7F6', borderRadius: '6px' }}>
                                                            <span className="text-muted small text-capitalize">{method}</span>
                                                            <div className="fs-5 fw-bold">{currency.format(total)}</div>
                                                       </div>
                                                  </div>
                                             ))}
                                        </div>
                                   ) : (
                                        <p className="text-muted mb-0">No completed pharmacy sales have been recorded yet.</p>
                                   )}
                              </div>
                         </div>
                    </>
               )}

               <style jsx>{`
                    @keyframes spin {
                         from { transform: rotate(0deg); }
                         to { transform: rotate(360deg); }
                    }
               `}</style>
          </main>
     );
}