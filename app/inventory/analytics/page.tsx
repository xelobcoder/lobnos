'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { currencyFormatter, customFetch } from '../../../components/Auth/customFetch';
import { RiBarChartBoxLine, RiStockLine, RiShoppingCartLine, RiMoneyDollarCircleLine, RiSettingsLine, RiRefreshLine } from '@remixicon/react';

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
               icon: <RiBarChartBoxLine size={24} />,
               color: 'primary',
               category: 'Core Analytics'
          },
          {
               title: 'Purchase Orders',
               description: 'Purchase order performance and trends',
               path: '/inventory/analytics/purchase-orders',
               icon: <RiShoppingCartLine size={24} />,
               color: 'success',
               category: 'Procurement'
          },
          {
               title: 'Transactions',
               description: 'Inventory transaction patterns and trends',
               path: '/inventory/analytics/transactions',
               icon: <RiStockLine size={24} />,
               color: 'info',
               category: 'Operations'
          },
          {
               title: 'Payments',
               description: 'Supplier payment tracking and analysis',
               path: '/inventory/analytics/payments',
               icon: <RiMoneyDollarCircleLine size={24} />,
               color: 'warning',
               category: 'Finance'
          },
          {
               title: 'Costs',
               description: 'Inventory cost analysis and trends',
               path: '/inventory/analytics/costs',
               icon: <RiMoneyDollarCircleLine size={24} />,
               color: 'danger',
               category: 'Finance'
          },
          {
               title: 'Suppliers',
               description: 'Supplier performance metrics',
               path: '/inventory/analytics/suppliers',
               icon: <RiBarChartBoxLine size={24} />,
               color: 'secondary',
               category: 'Suppliers'
          },
          {
               title: 'Stock Levels',
               description: 'Detailed stock monitoring with alerts',
               path: '/inventory/analytics/stock-levels',
               icon: <RiStockLine size={24} />,
               color: 'primary',
               category: 'Monitoring'
          },
          {
               title: 'Movement',
               description: 'Inventory movement patterns and velocity',
               path: '/inventory/analytics/movement',
               icon: <RiBarChartBoxLine size={24} />,
               color: 'success',
               category: 'Operations'
          },
          {
               title: 'Batch Expiry',
               description: 'Batch expiry monitoring and utilization',
               path: '/inventory/analytics/batch-expiry',
               icon: <RiStockLine size={24} />,
               color: 'warning',
               category: 'Quality'
          },
          {
               title: 'Procurement',
               description: 'Procurement performance analysis',
               path: '/inventory/analytics/procurement',
               icon: <RiShoppingCartLine size={24} />,
               color: 'info',
               category: 'Procurement'
          },
          {
               title: 'Cost Valuation',
               description: 'Inventory valuation using different methods',
               path: '/inventory/analytics/cost-valuation',
               icon: <RiMoneyDollarCircleLine size={24} />,
               color: 'primary',
               category: 'Finance'
          },
          {
               title: 'Usage',
               description: 'Department-wise usage patterns',
               path: '/inventory/analytics/usage',
               icon: <RiBarChartBoxLine size={24} />,
               color: 'secondary',
               category: 'Operations'
          }
     ];

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
               {/* Header Section - Intelligence Style */}
               <div className="mb-3 bg-light p-2">
                    {/* Header */}
                    <div className="bg-light py-1 px-2 mb-2">
                         <h6 className="mb-0 text-uppercase text-dark" style={{ letterSpacing: '0.5px', fontSize: '0.9rem', fontWeight: '600' }}>
                              📊 INVENTORY ANALYTICS HUB | BUSINESS INTELLIGENCE
                         </h6>
                    </div>

                    {/* Classification Header */}
                    <div className="mb-2 pb-1 border-bottom border-light">
                         <div className="d-flex justify-content-between align-items-center">
                              <div>
                                   <span className="text-decoration-underline me-2" style={{ fontSize: '0.9rem' }}>SYSTEM: INVENTORY</span>
                                   <span className="text-decoration-underline" style={{ fontSize: '0.9rem' }}>MODULES: {analyticsSections.length}</span>
                              </div>
                         </div>
                    </div>

                    {/* Header Content */}
                    <div className="border-1 border br-5  p-4 bg-white p-3">
                         <div className="d-flex justify-content-between align-items-start">
                              <div>
                                   <div className="d-flex align-items-center mb-2">
                                        <RiBarChartBoxLine size={28} className="text-primary me-3" />
                                        <div>
                                             <h4 className="mb-1 fw-bold text-dark" style={{ fontSize: '1.2rem' }}>INVENTORY ANALYTICS HUB</h4>
                                             <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>Comprehensive business intelligence for strategic inventory management</p>
                                        </div>
                                   </div>
                              </div>
                              <div className="d-flex gap-2">
                                   <button
                                        className="btn btn-outline-secondary btn-sm"
                                        onClick={loadDashboardSummary}
                                        disabled={loading}
                                        style={{ fontSize: '0.9rem' }}
                                   >
                                        <RiRefreshLine size={14} className="me-2" />
                                        REFRESH
                                   </button>

                              </div>
                         </div>
                    </div>
               </div>

               {/* Executive Summary - Intelligence Style */}
               {summary && (
                    <div className="mb-3 bg-light p-2">
                         {/* Header */}
                         <div className="bg-light py-1 px-2 mb-2">
                              <h6 className="mb-0 text-uppercase text-dark" style={{ letterSpacing: '0.5px', fontSize: '0.9rem', fontWeight: '600' }}>
                                   EXECUTIVE SUMMARY | KEY METRICS OVERVIEW
                              </h6>
                         </div>

                         {/* Classification Header */}
                         <div className="mb-3 pb-1 border-bottom border-light">
                              <div className="d-flex justify-content-between align-items-center">
                                   <div>
                                        <span className="text-decoration-underline me-2" style={{ fontSize: '0.9rem' }}>PERIOD: CURRENT</span>
                                        <span className="text-decoration-underline" style={{ fontSize: '0.9rem' }}>STATUS: ACTIVE</span>
                                   </div>
                                   <small className="text-muted" style={{ fontSize: '0.9rem' }}>STRATEGIC INVENTORY ASSESSMENT</small>
                              </div>
                         </div>

                         {/* Key Metrics Row */}
                         <div className="row g-2 mb-3">
                              <div className="col-md-3">
                                   <div className="border-1 border br-5  p-4 bg-white p-2 rounded">
                                        <div className="text-dark fw-bold" style={{ fontSize: '1.5rem' }}>{summary.total_items.toLocaleString()}</div>
                                        <small className="text-muted" style={{ fontSize: '0.9rem' }}>TOTAL ITEMS</small>
                                   </div>
                              </div>
                              <div className="col-md-3">
                                   <div className="border-1 border br-5  p-4 bg-white p-2 rounded">
                                        <div className="text-dark fw-bold" style={{ fontSize: '1.5rem' }}>{summary.active_items.toLocaleString()}</div>
                                        <small className="text-muted" style={{ fontSize: '0.9rem' }}>ACTIVE ITEMS</small>
                                   </div>
                              </div>
                              <div className="col-md-3">
                                   <div className="border-1 border br-5  p-4 bg-white p-2 rounded">
                                        <div className="text-dark fw-bold" style={{ fontSize: '1.5rem' }}>{summary.low_stock_items.toLocaleString()}</div>
                                        <small className="text-muted" style={{ fontSize: '0.9rem' }}>LOW STOCK ITEMS</small>
                                   </div>
                              </div>
                              <div className="col-md-3">
                                   <div className="border-1 border br-5  p-4 bg-white p-2 rounded">
                                        <div className="text-dark fw-bold" style={{ fontSize: '1.5rem' }}>{summary.out_of_stock_items.toLocaleString()}</div>
                                        <small className="text-muted" style={{ fontSize: '0.9rem' }}>OUT OF STOCK</small>
                                   </div>
                              </div>
                         </div>

                         {/* Inventory Metrics Table */}
                         <div className="row g-2">
                              {/* Stock Metrics */}
                              <div className="col-md-6">
                                   <div className="border-1 border br-5  p-4 bg-white p-2 rounded">
                                        <h6 className="text-uppercase mb-2" style={{ fontSize: '0.9rem', fontWeight: '700', letterSpacing: '0.3px' }}>
                                             STOCK METRICS
                                        </h6>
                                        <table className="table table-sm table-borderless mb-0" style={{ fontSize: '0.9rem' }}>
                                             <tbody>
                                                  <tr>
                                                       <td className="text-muted py-1" style={{ width: '140px' }}>TOTAL VALUE:</td>
                                                       <td className="fw-bold py-1 text-dark">{currencyFormatter.format(summary.total_stock_value)}</td>
                                                  </tr>
                                                  <tr>
                                                       <td className="text-muted py-1">CATEGORIES:</td>
                                                       <td className="fw-bold py-1 text-dark">{summary.total_categories}</td>
                                                  </tr>
                                                  <tr>
                                                       <td className="text-muted py-1">LOCATIONS:</td>
                                                       <td className="fw-bold py-1 text-dark">{summary.total_locations}</td>
                                                  </tr>
                                             </tbody>
                                        </table>
                                   </div>
                              </div>

                              {/* Network Metrics */}
                              <div className="col-md-6">
                                   <div className="border-1 border br-5  p-4 bg-white p-2">
                                        <h6 className="text-uppercase mb-2" style={{ fontSize: '0.9rem', fontWeight: '700', letterSpacing: '0.3px' }}>
                                             NETWORK METRICS
                                        </h6>
                                        <table className="table table-sm table-borderless mb-0" style={{ fontSize: '0.9rem' }}>
                                             <tbody>
                                                  <tr>
                                                       <td className="text-muted py-1" style={{ width: '140px' }}>SUPPLIERS:</td>
                                                       <td className="fw-bold py-1 text-dark">{summary.total_suppliers}</td>
                                                  </tr>
                                                  <tr>
                                                       <td className="text-muted py-1">ACTIVE ITEMS:</td>
                                                       <td className="fw-bold py-1 text-dark">{summary.active_items.toLocaleString()}</td>
                                                  </tr>
                                                  <tr>
                                                       <td className="text-muted py-1">CRITICAL ITEMS:</td>
                                                       <td className="fw-bold py-1 text-dark">{summary.out_of_stock_items}</td>
                                                  </tr>
                                             </tbody>
                                        </table>
                                   </div>
                              </div>
                         </div>
                    </div>
               )}

               {/* Analytics Modules - Intelligence Style */}
               <div className="mb-3 bg-light p-2">
                    {/* Header */}
                    <div className="bg-light py-1 px-2 mb-3">
                         <h6 className="mb-0 text-uppercase text-dark" style={{ letterSpacing: '0.5px', fontSize: '0.9rem', fontWeight: '600' }}>
                              ANALYTICS MODULES | SPECIALIZED INSIGHTS
                         </h6>
                    </div>

                    {/* Classification Header */}
                    <div className="mb-3 pb-1 border-bottom border-light">
                         <div className="d-flex justify-content-between align-items-center">
                              <div>
                                   <span className="text-decoration-underline me-2" style={{ fontSize: '0.9rem' }}>CATEGORIES: 6</span>
                                   <span className="text-decoration-underline" style={{ fontSize: '0.9rem' }}>MODULES: {analyticsSections.length}</span>
                              </div>
                              <small className="text-muted" style={{ fontSize: '0.9rem' }}>COMPREHENSIVE BUSINESS INTELLIGENCE</small>
                         </div>
                    </div>

                    {/* Core Analytics Section */}
                    <div className="mb-4">
                         <div className="border-1 border br-5  p-4 bg-white p-3 rounded">
                              <div className="d-flex justify-content-between align-items-center mb-3">
                                   <h6 className="text-uppercase mb-0 fw-bold" style={{ fontSize: '0.9rem', letterSpacing: '0.3px' }}>
                                        CORE ANALYTICS | FOUNDATIONAL METRICS
                                   </h6>
                                   <span className="text-decoration-underline" style={{ fontSize: '0.9rem' }}>CORE</span>
                              </div>
                              <div className="row g-2">
                                   {analyticsSections.filter(section => section.category === 'Core Analytics').map((section, index) => (
                                        <div key={index} className="col-md-6">
                                             <Link href={section.path} className="text-decoration-none">
                                                  <div className="border-1 border br-5  p-4  p-2 rounded">
                                                       <table className="table table-sm table-borderless mb-0" style={{ fontSize: '0.9rem' }}>
                                                            <tbody>
                                                                 <tr>
                                                                      <td className="text-muted py-1" style={{ width: '80px' }}>MODULE:</td>
                                                                      <td className="fw-bold py-1 text-dark">{section.title}</td>
                                                                 </tr>
                                                                 <tr>
                                                                      <td className="text-muted py-1">TYPE:</td>
                                                                      <td className="py-1">
                                                                           <span className="text-decoration-underline" style={{ fontSize: '0.8rem' }}>{section.category.toUpperCase()}</span>
                                                                      </td>
                                                                 </tr>
                                                                 <tr>
                                                                      <td className="text-muted py-1">DESCRIPTION:</td>
                                                                      <td className="py-1 text-muted small">{section.description}</td>
                                                                 </tr>
                                                            </tbody>
                                                       </table>
                                                  </div>
                                             </Link>
                                        </div>
                                   ))}
                              </div>
                         </div>
                    </div>

                    {/* Operations Section */}
                    <div className="mb-4">
                         <div className="border-1 border br-5  p-4 bg-white p-3">
                              <div className="d-flex justify-content-between align-items-center mb-3">
                                   <h6 className="text-uppercase mb-0 fw-bold" style={{ fontSize: '0.9rem', letterSpacing: '0.3px' }}>
                                        OPERATIONS & MOVEMENT | PROCESS ANALYTICS
                                   </h6>
                                   <span className="text-decoration-underline" style={{ fontSize: '0.9rem' }}>OPS</span>
                              </div>
                              <div className="row g-2">
                                   {analyticsSections.filter(section => section.category === 'Operations').map((section, index) => (
                                        <div key={index} className="col-md-6">
                                             <Link href={section.path} className="text-decoration-none">
                                                  <div className="border-1 border br-5  p-4  p-2 rounded">
                                                       <table className="table table-sm table-borderless mb-0" style={{ fontSize: '0.9rem' }}>
                                                            <tbody>
                                                                 <tr>
                                                                      <td className="text-muted py-1" style={{ width: '80px' }}>MODULE:</td>
                                                                      <td className="fw-bold py-1 text-dark">{section.title}</td>
                                                                 </tr>
                                                                 <tr>
                                                                      <td className="text-muted py-1">TYPE:</td>
                                                                      <td className="py-1">
                                                                           <span className="text-decoration-underline" style={{ fontSize: '0.8rem' }}>{section.category.toUpperCase()}</span>
                                                                      </td>
                                                                 </tr>
                                                                 <tr>
                                                                      <td className="text-muted py-1">DESCRIPTION:</td>
                                                                      <td className="py-1 text-muted small">{section.description}</td>
                                                                 </tr>
                                                            </tbody>
                                                       </table>
                                                  </div>
                                             </Link>
                                        </div>
                                   ))}
                              </div>
                         </div>
                    </div>

                    {/* Finance Section */}
                    <div className="mb-4">
                         <div className="border-1 border br-5  p-4 bg-white p-3">
                              <div className="d-flex justify-content-between align-items-center mb-3">
                                   <h6 className="text-uppercase mb-0 fw-bold" style={{ fontSize: '0.9rem', letterSpacing: '0.3px' }}>
                                        FINANCIAL ANALYTICS | COST MANAGEMENT
                                   </h6>
                                   <span className="text-decoration-underline" style={{ fontSize: '0.9rem' }}>$</span>
                              </div>
                              <div className="row g-2">
                                   {analyticsSections.filter(section => section.category === 'Finance').map((section, index) => (
                                        <div key={index} className="col-md-6">
                                             <Link href={section.path} className="text-decoration-none">
                                                  <div className="border-1 border br-5  p-4 p-2 rounded">
                                                       <table className="table table-sm table-borderless mb-0" style={{ fontSize: '0.9rem' }}>
                                                            <tbody>
                                                                 <tr>
                                                                      <td className="text-muted py-1" style={{ width: '80px' }}>MODULE:</td>
                                                                      <td className="fw-bold py-1 text-dark">{section.title}</td>
                                                                 </tr>
                                                                 <tr>
                                                                      <td className="text-muted py-1">TYPE:</td>
                                                                      <td className="py-1">
                                                                           <span className="text-decoration-underline" style={{ fontSize: '0.8rem' }}>{section.category.toUpperCase()}</span>
                                                                      </td>
                                                                 </tr>
                                                                 <tr>
                                                                      <td className="text-muted py-1">DESCRIPTION:</td>
                                                                      <td className="py-1 text-muted small">{section.description}</td>
                                                                 </tr>
                                                            </tbody>
                                                       </table>
                                                  </div>
                                             </Link>
                                        </div>
                                   ))}
                              </div>
                         </div>
                    </div>

                    {/* Additional Analytics Section */}
                    <div>
                         <div className="border-1 border br-5  p-4 bg-white p-3">
                              <div className="d-flex justify-content-between align-items-center mb-3">
                                   <h6 className="text-uppercase mb-0 fw-bold" style={{ fontSize: '0.9rem', letterSpacing: '0.3px' }}>
                                        ADDITIONAL ANALYTICS | SPECIALIZED MODULES
                                   </h6>
                                   <span className="text-decoration-underline" style={{ fontSize: '0.9rem' }}>EXTENDED</span>
                              </div>
                              <div className="row g-2">
                                   {analyticsSections.filter(section => !['Core Analytics', 'Operations', 'Finance'].includes(section.category)).map((section, index) => (
                                        <div key={index} className="col-md-6">
                                             <Link href={section.path} className="text-decoration-none">
                                                  <div className="border-1 border br-5  p-4 p-2 rounded">
                                                       <table className="table table-sm table-borderless mb-0" style={{ fontSize: '0.9rem' }}>
                                                            <tbody>
                                                                 <tr>
                                                                      <td className="text-muted py-1" style={{ width: '80px' }}>MODULE:</td>
                                                                      <td className="fw-bold py-1 text-dark">{section.title}</td>
                                                                 </tr>
                                                                 <tr>
                                                                      <td className="text-muted py-1">TYPE:</td>
                                                                      <td className="py-1">
                                                                           <span className="text-decoration-underline" style={{ fontSize: '0.8rem' }}>
                                                                                {section.category.toUpperCase()}
                                                                           </span>
                                                                      </td>
                                                                 </tr>
                                                                 <tr>
                                                                      <td className="text-muted py-1">DESCRIPTION:</td>
                                                                      <td className="py-1 text-muted small">{section.description}</td>
                                                                 </tr>
                                                            </tbody>
                                                       </table>
                                                  </div>
                                             </Link>
                                        </div>
                                   ))}
                              </div>
                         </div>
                    </div>
               </div>
          </div>
     );
}