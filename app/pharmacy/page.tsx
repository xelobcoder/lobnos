'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { RiAlertLine, RiArrowRightLine, RiBankCardLine, RiCheckLine, RiErrorWarningLine, RiLoader4Line, RiMedicineBottleLine, RiRefreshLine, RiShoppingCartLine } from '@remixicon/react';
import { customFetch } from '../../components/Auth/customFetch';
import PrimeTable from '../../components/accessories/Datatables/PrimeTable';
import styles from './pharmacy.module.css';

type Dashboard = {
     todaySales: number;
     completedSales: number;
     lowStockItems: number;
     recentSales: Array<{
          receiptNumber: string;
          customerName: string;
          paymentMethod: string;
          total: number;
          completedAt: string
     }>
};

const currency = new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS' });

export default function PharmacyOverviewPage() {
     const [dashboard, setDashboard] = useState<Dashboard | null>(null);
     const [loading, setLoading] = useState(true);
     const [error, setError] = useState('');

     const loadDashboard = () => {
          setLoading(true);
          setError('');
          customFetch('pharmacy/dashboard')
               .then((response) => {
                    if (response?.success) {
                         setDashboard(response.data);
                         setError('');
                    } else {
                         setError(response?.error?.message || 'Unable to load pharmacy activity.');
                    }
               })
               .catch(() => setError('Failed to load pharmacy dashboard. Please check your connection.'))
               .finally(() => setLoading(false));
     };

     useEffect(() => {
          loadDashboard();
     }, []);

     const columns = [
          {
               Header: 'Receipt',
               accessor: 'receiptNumber',
          },
          {
               Header: 'Customer',
               accessor: 'customerName',
          },
          {
               Header: 'Payment',
               accessor: 'paymentMethod',
               Cell: ({ value }: { value: string }) => value.replace('_', ' '),
          },
          {
               Header: 'Total',
               accessor: 'total',
               Cell: ({ value }: { value: number }) => <span className="fw-bold text-success">{currency.format(value)}</span>,
          },
          {
               Header: 'Status',
               accessor: 'status',
               Cell: () => (
                    <span
                         className="badge px-2 py-1"
                         style={{
                              backgroundColor: '#D1FAE5',
                              color: '#2D7A46',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                         }}
                    >
                         <RiCheckLine size={12} className="me-1" />
                         Completed
                    </span>
               ),
          },
     ];

     const metrics = dashboard
          ? [
               {
                    label: "Today's sales",
                    value: currency.format(dashboard.todaySales),
                    detail: `${dashboard.completedSales} completed sales`,
                    Icon: RiBankCardLine,
                    variant: 'primary',
               },
               {
                    label: 'Recent receipts',
                    value: String(dashboard.recentSales.length).padStart(2, '0'),
                    detail: 'Latest completed sales',
                    Icon: RiShoppingCartLine,
                    variant: 'info',
               },
               {
                    label: 'Prescription queue',
                    value: '--',
                    detail: 'Available when dispensing is enabled',
                    Icon: RiMedicineBottleLine,
                    variant: 'success',
               },
               {
                    label: 'Stock attention',
                    value: String(dashboard.lowStockItems).padStart(2, '0'),
                    detail: 'Items below reorder point',
                    Icon: RiAlertLine,
                    variant: 'danger',
               },
          ]
          : [];

     return (
          <main className="container-fluid px-4 py-3">
               {/* Header Section */}
               <div className="d-flex justify-content-between align-items-start mb-4">
                    <div>
                         <span className="text-muted fs-6 text-uppercase fw-semibold">Pharmacy operations</span>
                         <h1 className="fs-3 fw-bold mb-1">Pharmacy desk</h1>
                         <p className="text-muted mb-0">Sales, dispensing, and stock activity for Main Branch.</p>
                    </div>
                    <Link
                         className="btn btn-primary d-flex align-items-center gap-2"
                         href="/pharmacy/sell?isOpenSideBarShow=false"
                    >
                         <RiShoppingCartLine size={18} />
                         <span>New sale</span>
                    </Link>
               </div>

               {/* Error Alert */}
               {error && (
                    <div
                         className="alert alert-danger d-flex align-items-start gap-3 mb-4"
                         role="alert"
                    >
                         <RiErrorWarningLine size={20} className="flex-shrink-0 mt-1" />
                         <div className="flex-grow-1">
                              <strong>Error</strong>
                              <p className="mb-2">{error}</p>
                              <button
                                   className="btn btn-sm"
                                   onClick={loadDashboard}
                              >
                                   <RiRefreshLine size={16} className="me-1" />
                                   Retry
                              </button>
                         </div>
                    </div>
               )}

               {/* Metrics Grid */}
               <section className="row g-3 mb-4" aria-label="Pharmacy summary">
                    {loading ? (
                         <>
                              {[...Array(4)].map((_, i) => (
                                   <div key={i} className="col-md-3 col-sm-6">
                                        <div className="p-3 border rounded-2 bg-body-tertiary" style={{ minHeight: '140px' }}>
                                             <div
                                                  style={{
                                                       height: '24px',
                                                       backgroundColor: 'var(--bs-secondary-bg)',
                                                       borderRadius: '4px',
                                                       marginBottom: '12px',
                                                       width: '80%',
                                                  }}
                                             />
                                             <div
                                                  style={{
                                                       height: '32px',
                                                       backgroundColor: 'var(--bs-secondary-bg)',
                                                       borderRadius: '4px',
                                                       marginBottom: '12px',
                                                       width: '60%',
                                                  }}
                                             />
                                             <div
                                                  style={{
                                                       height: '14px',
                                                       backgroundColor: 'var(--bs-secondary-bg)',
                                                       borderRadius: '4px',
                                                       width: '70%',
                                                  }}
                                             />
                                        </div>
                                   </div>
                              ))}
                         </>
                    ) : (
                         metrics.map(({ label, value, detail, Icon, variant }) => {
                              return (
                                   <div key={label} className="col-md-3 col-sm-6">
                                        <div
                                             className={`card border-0 shadow-sm bg-${variant} bg-gradient text-white rounded-3 h-100`}
                                        >
                                             <div className="card-body p-3">
                                                  <div className="d-flex justify-content-between align-items-center mb-1">
                                                       <span className="text-xs text-uppercase fw-semibold opacity-75">{label}</span>
                                                       <Icon size={22} className="opacity-75" />
                                                  </div>
                                                  <h3 className="fw-bold mb-0">{value}</h3>
                                                  <span className="text-xs opacity-75">{detail}</span>
                                             </div>
                                        </div>
                                   </div>
                              );
                         })
                    )}
               </section>

               {/* Main Content Grid */}
               <div className="row g-3">
                    {/* Recent Sales Panel */}
                    <div className="col-lg-8">
                         <div className="card border-0 shadow-sm" style={{ borderRadius: '6px' }}>
                              {/* Card Header */}
                              <div
                                   className="card-header border-0 d-flex justify-content-between align-items-center"
                                   style={{ borderRadius: '6px 6px 0 0' }}
                              >
                                   <div>
                                        <span className="text-muted fs-6 text-uppercase fw-semibold">Shift activity</span>
                                        <h2 className="fs-6 fw-bold mb-0">Recent sales</h2>
                                   </div>
                                   <Link
                                        href="/pharmacy/sales-history"
                                        className="btn btn-link text-decoration-none p-0"
                                        style={{ color: '#087F73', fontSize: '0.875rem' }}
                                   >
                                        View sales <RiArrowRightLine size={14} className="ms-1" />
                                   </Link>
                              </div>

                              {/* Card Body */}
                              <div className="card-body p-0">
                                   {loading ? (
                                        <div className="d-flex justify-content-center align-items-center py-5">
                                             <RiLoader4Line size={32} className="text-muted" style={{ animation: 'spin 1s linear infinite' }} />
                                        </div>
                                   ) : dashboard && dashboard.recentSales.length > 0 ? (
                                        <PrimeTable
                                             column={columns}
                                             data={dashboard.recentSales.map((sale) => ({
                                                  ...sale,
                                                  status: 'Completed',
                                             }))}
                                             filtering={false}
                                             handleSeverSideProcessing={true}
                                        />
                                   ) : (
                                        <div className="text-center py-5">
                                             <RiShoppingCartLine size={48} className="text-muted mb-3" style={{ opacity: 0.3 }} />
                                             <h5 className="fw-semibold mb-1">No sales yet</h5>
                                             <p className="text-muted small mb-3">Start a new sale to see activity here.</p>
                                             <Link
                                                  href="/pharmacy/sell?isOpenSideBarShow=false"
                                                  className="btn btn-sm"
                                                  style={{ backgroundColor: '#087F73', color: 'white', borderColor: '#087F73' }}
                                             >
                                                  <RiShoppingCartLine size={14} className="me-1" />
                                                  Start a sale
                                             </Link>
                                        </div>
                                   )}
                              </div>
                         </div>
                    </div>

                    {/* Action Panel */}
                    <div className="col-lg-4">
                         <div className="card border-0 shadow-sm" style={{ borderRadius: '6px' }}>
                              <div className="card-body">
                                   <span className="text-muted fs-6 text-uppercase fw-semibold d-block mb-3">Next actions</span>

                                   <div className="d-flex flex-column gap-2">
                                        {[
                                             {
                                                  href: '/pharmacy/sell?isOpenSideBarShow=false',
                                                  icon: RiShoppingCartLine,
                                                  title: 'Start a sale',
                                                  subtitle: 'Sell over the counter or against a prescription',
                                             },
                                             {
                                                  href: '/pharmacy/cashier',
                                                  icon: RiBankCardLine,
                                                  title: 'Cashier shift',
                                                  subtitle: 'Review float and reconciliation',
                                             },
                                             {
                                                  href: '/pharmacy/stock?filter=low',
                                                  icon: RiAlertLine,
                                                  title: 'Stock attention',
                                                  subtitle: 'Review low and near-expiry items',
                                             },
                                        ].map(({ href, icon: ActionIcon, title, subtitle }) => (
                                             <Link
                                                  key={href}
                                                  href={href}
                                                  className="d-flex align-items-center gap-3 p-3 rounded-2 text-decoration-none border"
                                                  style={{
                                                       backgroundColor: 'var(--bs-body-bg)',
                                                       borderColor: 'var(--bs-border-color)',
                                                       color: 'var(--bs-body-color)',
                                                       transition: 'all 0.2s',
                                                  }}
                                                  onMouseEnter={(e) => {
                                                       e.currentTarget.style.backgroundColor = 'var(--bs-tertiary-bg)';
                                                       e.currentTarget.style.borderColor = 'var(--bs-primary)';
                                                  }}
                                                  onMouseLeave={(e) => {
                                                       e.currentTarget.style.backgroundColor = 'var(--bs-body-bg)';
                                                       e.currentTarget.style.borderColor = 'var(--bs-border-color)';
                                                  }}
                                             >
                                                  <div
                                                       className="flex-shrink-0 p-2 rounded-2"
                                                       style={{ backgroundColor: 'var(--bs-tertiary-bg)' }}
                                                  >
                                                       <ActionIcon size={20} className="text-success" />
                                                  </div>
                                                  <div className="flex-grow-1 text-start">
                                                       <div className="fw-semibold" style={{ fontSize: '0.95rem' }}>
                                                            {title}
                                                       </div>
                                                       <small className="text-muted">{subtitle}</small>
                                                  </div>
                                                  <RiArrowRightLine size={16} className="text-muted flex-shrink-0" />
                                             </Link>
                                        ))}
                                   </div>
                              </div>
                         </div>
                    </div>
               </div>

               <style jsx>{`
                              @keyframes spin {
                                   from {
                                   transform: rotate(0deg);
                                   }
                                   to {
                                   transform: rotate(360deg);
                                   }
                              }
      `}</style>
          </main>
     );
}