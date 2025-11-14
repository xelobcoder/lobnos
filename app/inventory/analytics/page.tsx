'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { currencyFormatter, customFetch } from '../../../components/Auth/customFetch';

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

export default function AnalyticsDashboard() {
     const [summary, setSummary] = useState<InventoryAnalyticsSummary | null>(null);
     const [loading, setLoading] = useState(true);

     useEffect(() => {
          loadDashboardSummary();
     }, []);

     const loadDashboardSummary = async () => {
          try {
               const response = await customFetch('inventory/analytics/dashboard');
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

     const analyticsSections = [
          {
               title: 'Stock Status',
               description: 'Current stock distribution and status overview',
               path: '/inventory/analytics/stock-status',
               icon: '📊'
          },
          {
               title: 'Purchase Orders',
               description: 'Purchase order performance and trends',
               path: '/inventory/analytics/purchase-orders',
               icon: '📋'
          },
          {
               title: 'Transactions',
               description: 'Inventory transaction patterns and trends',
               path: '/inventory/analytics/transactions',
               icon: '🔄'
          },
          {
               title: 'Payments',
               description: 'Supplier payment tracking and analysis',
               path: '/inventory/analytics/payments',
               icon: '💰'
          },
          {
               title: 'Costs',
               description: 'Inventory cost analysis and trends',
               path: '/inventory/analytics/costs',
               icon: '💵'
          },
          {
               title: 'Suppliers',
               description: 'Supplier performance metrics',
               path: '/inventory/analytics/suppliers',
               icon: '🏢'
          },
          {
               title: 'Stock Levels',
               description: 'Detailed stock monitoring with alerts',
               path: '/inventory/analytics/stock-levels',
               icon: '📈'
          },
          {
               title: 'Movement',
               description: 'Inventory movement patterns and velocity',
               path: '/inventory/analytics/movement',
               icon: '🚚'
          },
          {
               title: 'Batch Expiry',
               description: 'Batch expiry monitoring and utilization',
               path: '/inventory/analytics/batch-expiry',
               icon: '⏰'
          },
          {
               title: 'Procurement',
               description: 'Procurement performance analysis',
               path: '/inventory/analytics/procurement',
               icon: '🛒'
          },
          {
               title: 'Cost Valuation',
               description: 'Inventory valuation using different methods',
               path: '/inventory/analytics/cost-valuation',
               icon: '📊'
          },
          {
               title: 'Usage',
               description: 'Department-wise usage patterns',
               path: '/inventory/analytics/usage',
               icon: '📊'
          }
     ];

     if (loading) {
          return (
               <div className="container-fluid p-4">
                    <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
                         <div className="spinner-border text-primary" role="status">
                              <span className="visually-hidden">Loading...</span>
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
                         <h2 className="mb-1">📊 Inventory Analytics Dashboard</h2>
                         <p className="text-muted mb-0">Comprehensive business intelligence for inventory management</p>
                    </div>
                    <button
                         className="btn btn-outline-primary"
                         onClick={loadDashboardSummary}
                    >
                         ↻ Refresh
                    </button>
               </div>

               {/* Summary Cards */}
               {summary && (
                    <div className="row g-3 mb-4">
                         <div className="col-md-3">
                              <div className="card h-100">
                                   <div className="card-body text-center">
                                        <h3 className="text-primary">{summary.total_items.toLocaleString()}</h3>
                                        <p className="text-muted mb-0">Total Items</p>
                                   </div>
                              </div>
                         </div>
                         <div className="col-md-3">
                              <div className="card h-100">
                                   <div className="card-body text-center">
                                        <h3 className="text-success">{summary.active_items.toLocaleString()}</h3>
                                        <p className="text-muted mb-0">Active Items</p>
                                   </div>
                              </div>
                         </div>
                         <div className="col-md-3">
                              <div className="card h-100">
                                   <div className="card-body text-center">
                                        <h3 className="text-warning">{summary.low_stock_items.toLocaleString()}</h3>
                                        <p className="text-muted mb-0">Low Stock Items</p>
                                   </div>
                              </div>
                         </div>
                         <div className="col-md-3">
                              <div className="card h-100">
                                   <div className="card-body text-center">
                                        <h3 className="text-danger">{summary.out_of_stock_items.toLocaleString()}</h3>
                                        <p className="text-muted mb-0">Out of Stock</p>
                                   </div>
                              </div>
                         </div>
                         <div className="col-md-3">
                              <div className="card h-100">
                                   <div className="card-body text-center">
                                        <h3 className="text-info">{currencyFormatter.format(summary.total_stock_value)}</h3>
                                        <p className="text-muted mb-0">Total Stock Value</p>
                                   </div>
                              </div>
                         </div>
                         <div className="col-md-3">
                              <div className="card h-100">
                                   <div className="card-body text-center">
                                        <h3 className="text-secondary">{summary.total_categories.toLocaleString()}</h3>
                                        <p className="text-muted mb-0">Categories</p>
                                   </div>
                              </div>
                         </div>
                         <div className="col-md-3">
                              <div className="card h-100">
                                   <div className="card-body text-center">
                                        <h3 className="text-primary">{summary.total_suppliers.toLocaleString()}</h3>
                                        <p className="text-muted mb-0">Suppliers</p>
                                   </div>
                              </div>
                         </div>
                         <div className="col-md-3">
                              <div className="card h-100">
                                   <div className="card-body text-center">
                                        <h3 className="text-info">{summary.total_locations.toLocaleString()}</h3>
                                        <p className="text-muted mb-0">Locations</p>
                                   </div>
                              </div>
                         </div>
                    </div>
               )}

               {/* Analytics Sections */}
               <div className="row g-3">
                    {analyticsSections.map((section, index) => (
                         <div key={index} className="col-md-6 col-lg-4">
                              <Link href={section.path} className="text-decoration-none">
                                   <div className="card h-100 hover-shadow">
                                        <div className="card-body">
                                             <div className="d-flex align-items-center mb-3">
                                                  <span className="fs-2 me-3">{section.icon}</span>
                                                  <h5 className="card-title mb-0">{section.title}</h5>
                                             </div>
                                             <p className="card-text text-muted">{section.description}</p>
                                             <div className="text-end">
                                                  <span className="text-primary">View Details →</span>
                                             </div>
                                        </div>
                                   </div>
                              </Link>
                         </div>
                    ))}
               </div>
          </div>
     );
}