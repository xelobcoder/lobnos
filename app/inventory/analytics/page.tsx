'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { currencyFormatter, customFetch } from '../../../components/Auth/customFetch';
import { useApplicationSettings } from '../../../components/Auth/useApplicationContext';
import { RiBarChartBoxLine, RiStockLine, RiShoppingCartLine, RiMoneyDollarCircleLine, RiSettingsLine, RiRefreshLine, RiBox3Line, RiAlertLine, RiCheckLine, RiArrowRightLine, RiFileListLine, RiRecycleLine, RiStoreLine, RiTruckLine, RiPriceTagLine, RiTimeLine } from '@remixicon/react';

const COLOR_ACCENT = 'oklch(0.646 0.222 41.116)';
const COLOR_BORDER = 'var(--bs-border-color)';

interface InventoryAnalyticsSummary {
     total_items: number;
     active_items: number;
     low_stock_items: number;
     out_of_stock_items: number;
     total_stock_value: number;
     total_categories: number;
     total_suppliers: number;
     total_locations: number;
}

interface AnalyticsModule {
     title: string;
     description: string;
     path: string;
     icon: React.ReactNode;
     color: string;
     category: string;
}

export default function AnalyticsDashboard() {
     const { branchid, user } = useApplicationSettings().applicationsettings || {};
     const employeeid = user?.employeeid;
     const [summary, setSummary] = useState<InventoryAnalyticsSummary | null>(null);
     const [loading, setLoading] = useState(true);

     useEffect(() => {
          if (branchid && employeeid) {
               loadDashboardSummary();
          }
     }, [branchid, employeeid]);

     const loadDashboardSummary = async () => {
          try {
               const response = await customFetch(`inventory/analytics/dashboard?branchid=${branchid}&employeeid=${employeeid}`);
               if (response.success) {
                    setSummary(response.data);
               } else {
                    toast.error('Failed to load dashboard summary');
               }
          } catch (error) {
               console.error('Error loading dashboard summary:', error);
               toast.error('Error loading dashboard summary');
          } finally {
               setLoading(false);
          }
     };

     const analyticsModules: AnalyticsModule[] = [
          {
               title: 'Stock Status',
               description: 'Current stock distribution and status overview',
               path: '/inventory/analytics/stock-status',
               icon: <RiBarChartBoxLine size={32} />,
               color: "#2563eb",
               category: 'Core Analytics'
          },
          {
               title: 'Purchase Orders',
               description: 'Purchase order performance and trends',
               path: '/inventory/analytics/purchase-orders',
               icon: <RiShoppingCartLine size={32} />,
               color: "#16a34a",
               category: 'Procurement'
          },
          {
               title: 'Transactions',
               description: 'Inventory transaction patterns and trends',
               path: '/inventory/analytics/transactions',
               icon: <RiStockLine size={32} />,
               color: "#ea580c",
               category: 'Operations'
          },
          {
               title: 'Payments',
               description: 'Supplier payment tracking and analysis',
               path: '/inventory/analytics/payments',
               icon: <RiMoneyDollarCircleLine size={32} />,
               color: "#8b5cf6",
               category: 'Finance'
          },
          {
               title: 'Payment Time Analytics',
               description: 'Payment timing patterns and temporal analysis',
               path: '/inventory/analytics/payment-time',
               icon: <RiTimeLine size={32} />,
               color: "#ec4899",
               category: 'Finance'
          },
          {
               title: 'Stock Levels',
               description: 'Detailed stock monitoring with alerts',
               path: '/inventory/analytics/stock-levels',
               icon: <RiBox3Line size={32} />,
               color: "#06b6d4",
               category: 'Monitoring'
          },
          {
               title: 'Movement',
               description: 'Inventory movement patterns and velocity',
               path: '/inventory/analytics/movement',
               icon: <RiRecycleLine size={32} />,
               color: "#84cc16",
               category: 'Operations'
          },
          {
               title: 'Batch Expiry',
               description: 'Batch expiry monitoring and utilization',
               path: '/inventory/analytics/batch-expiry',
               icon: <RiAlertLine size={32} />,
               color: "#f59e0b",
               category: 'Quality'
          },
          {
               title: 'Procurement',
               description: 'Procurement performance analysis',
               path: '/inventory/analytics/procurement',
               icon: <RiTruckLine size={32} />,
               color: "#ef4444",
               category: 'Procurement'
          }
     ];

     const summaryMetrics = summary
          ? [
               { label: 'Total Items', value: summary.total_items.toLocaleString(), detail: 'Active inventory items', Icon: RiBox3Line, variant: 'primary' },
               { label: 'Total Value', value: currencyFormatter.format(summary.total_stock_value), detail: 'Current stock value', Icon: RiMoneyDollarCircleLine, variant: 'success' },
               { label: 'Low Stock Items', value: summary.low_stock_items.toLocaleString(), detail: 'Items needing reordering', Icon: RiAlertLine, variant: 'warning' },
               { label: 'Active Items', value: summary.active_items.toLocaleString(), detail: 'Items currently in stock', Icon: RiStoreLine, variant: 'info' },
          ]
          : [];

     if (loading) {
          return (
               <div className="container-fluid p-4">
                    <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
                         <div className="text-center">
                              <div className="spinner-border text-primary mb-3" role="status">
                                   <span className="visually-hidden">Loading...</span>
                              </div>
                              <h6 className="text-muted mb-2">LOADING INVENTORY ANALYTICS...</h6>
                              <p className="text-muted small mb-0">INITIALIZING BUSINESS INTELLIGENCE MODULES</p>
                         </div>
                    </div>
               </div>
          );
     }

     return (
          <div className="container-fluid p-4">
               {/* Header */}
               <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                         <h2 className="mb-1">
                              <RiBarChartBoxLine className="me-2" />
                              Inventory Analytics
                         </h2>
                         <p className="text-muted mb-0">Comprehensive business intelligence for strategic inventory management</p>
                    </div>
                    <div className="d-flex gap-2">
                         <button
                              className="btn btn-outline-secondary btn-sm"
                              onClick={loadDashboardSummary}
                              disabled={loading}
                         >
                              <RiRefreshLine className="me-1" />
                              Refresh Data
                         </button>
                    </div>
               </div>

               {/* Key Statistics */}
               {summary && (
                    <div className="row g-3 mb-4">
                         {summaryMetrics.map(({ label, value, detail, Icon, variant }) => (
                              <div className="col-md-3" key={label}>
                                   <div className={`card border-0 shadow-sm bg-${variant} bg-gradient text-white rounded-3 h-100`}>
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
                         ))}
                    </div>
               )}

               {/* System Health Overview */}
               <div className="row g-3 mb-4">
                    <div className="col-md-6">
                         <div className="border rounded p-4" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                              <h6 className="fw-bold mb-3 d-flex align-items-center">
                                   <RiCheckLine size={20} className="me-2 text-success" />
                                   Inventory Health
                              </h6>
                              {summary && (
                                   <>
                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                             <span className="small">Stock Coverage</span>
                                             <span className="badge bg-success">{Math.round((summary.active_items / summary.total_items) * 100)}%</span>
                                        </div>
                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                             <span className="small">Low Stock Alerts</span>
                                             <span className="badge bg-warning">{summary.low_stock_items}</span>
                                        </div>
                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                             <span className="small">Categories</span>
                                             <span className="badge bg-info">{summary.total_categories}</span>
                                        </div>
                                        <div className="d-flex justify-content-between align-items-center">
                                             <span className="small">Suppliers</span>
                                             <span className="badge bg-primary">{summary.total_suppliers}</span>
                                        </div>
                                   </>
                              )}
                         </div>
                    </div>
                    <div className="col-md-6">
                         <div className="border rounded p-4" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                              <h6 className="fw-bold mb-3 d-flex align-items-center">
                                   <RiBarChartBoxLine size={20} className="me-2 text-primary" />
                                   Analytics Overview
                              </h6>
                              <div className="small text-muted">
                                   <p className="mb-2">Access comprehensive inventory analytics and reporting tools to make data-driven decisions.</p>
                                   <p className="mb-0">Explore various modules to gain insights into stock performance, procurement efficiency, and financial metrics.</p>
                              </div>
                         </div>
                    </div>
               </div>

               {/* Analytics Modules Overview */}
               <div className="mb-4">
                    <h5 className="mb-3 fw-semibold">Analytics Modules</h5>
                    <div className="row g-3">
                         {analyticsModules.map((module, index) => (
                              <div key={index} className="col-md-6 col-lg-3">
                                   <div className="border rounded p-3 h-100" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                                        <div className="d-flex align-items-center mb-3">
                                             <div style={{ color: module.color }}>
                                                  {module.icon}
                                             </div>
                                             <div className="ms-3">
                                                  <h6 className="fw-bold mb-1">{module.title}</h6>
                                                  <p className="small text-muted mb-0">{module.description}</p>
                                             </div>
                                        </div>
                                        <div className="mb-3">
                                             <div className="small text-muted mb-1">
                                                  • {module.category}
                                             </div>
                                             <div className="small text-muted mb-1">
                                                  • Real-time insights
                                             </div>
                                        </div>
                                        <Link href={module.path} className="btn btn-sm w-100" style={{ backgroundColor: module.color, borderColor: module.color }}>
                                             View Analytics
                                        </Link>
                                   </div>
                              </div>
                         ))}
                    </div>
               </div>

               {/* Getting Started */}
               <div className="row g-4">
                    <div className="col-12">
                         <div className="border rounded p-4" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                              <h5 className="mb-3 fw-semibold">Analytics Modules</h5>
                              <p className="text-muted mb-3">Choose from the analytics modules below to explore different aspects of your inventory data and performance metrics.</p>
                              <div className="row g-3">
                                   {analyticsModules.slice(0, 3).map((module, index) => (
                                        <div key={index} className="col-md-4">
                                             <div className="d-flex align-items-start">
                                                  <div className="me-3 mt-1">
                                                       <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px', backgroundColor: module.color, color: 'white', fontSize: '14px', fontWeight: 'bold' }}>
                                                            {index + 1}
                                                       </div>
                                                  </div>
                                                  <div>
                                                       <h6 className="mb-1">{module.title}</h6>
                                                       <p className="small text-muted mb-2">{module.description}</p>
                                                       <Link href={module.path} className="small fw-medium" style={{ color: module.color }}>
                                                            Explore Module →
                                                       </Link>
                                                  </div>
                                             </div>
                                        </div>
                                   ))}
                              </div>
                         </div>
                    </div>
               </div>

               {/* Quick Actions */}
               <div className="row g-4 mt-2">
                    <div className="col-12">
                         <div className="border rounded p-4" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                              <h5 className="mb-3 fw-semibold">Quick Actions</h5>
                              <div className="row g-2">
                                   <div className="col-md-3">
                                        <Link href="/inventory/analytics/stock-status" className="btn btn-outline-primary w-100">
                                             <RiBarChartBoxLine className="me-1" />
                                             Stock Status
                                        </Link>
                                   </div>
                                   <div className="col-md-3">
                                        <Link href="/inventory/analytics/purchase-orders" className="btn btn-outline-success w-100">
                                             <RiShoppingCartLine className="me-1" />
                                             Purchase Orders
                                        </Link>
                                   </div>
                                   <div className="col-md-3">
                                        <Link href="/inventory/analytics/transactions" className="btn btn-outline-info w-100">
                                             <RiStockLine className="me-1" />
                                             Transactions
                                        </Link>
                                   </div>
                                   <div className="col-md-3">
                                        <Link href="/inventory/analytics/payments" className="btn btn-outline-warning w-100">
                                             <RiMoneyDollarCircleLine className="me-1" />
                                             Payments
                                        </Link>
                                   </div>
                              </div>
                         </div>
                    </div>
               </div>
          </div>
     );
}