'use client';

import { RiArrowLeftLine, RiBarChartBoxLine, RiEyeLine, RiEyeOffLine, RiRefreshLine } from '@remixicon/react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { currencyFormatter, customFetch } from '../../../../components/Auth/customFetch';
import { useApplicationSettings } from '../../../../components/Auth/useApplicationContext';
import ExportPdfButton from '../../../../components/reports/ExportPdfButton';

interface CostValuationAnalytics {
     cost_trends: Array<{
          month: string;
          additions_cost: number;
          consumption_cost: number;
          write_off_cost: number;
          net_cost_change: number;
     }>;
     profitability_impact: {
          cost_of_goods_issued: number;
          expired_stock_value: number;
          near_expiry_value: number;
          average_cost_per_unit: number;
     };
}

export default function CostValuationAnalyticsPage() {
     const [analytics, setAnalytics] = useState<CostValuationAnalytics | null>(null);
     const [loading, setLoading] = useState(true);
     const { applicationsettings } = useApplicationSettings();
     const { branchid, user } = applicationsettings || {};
     const employeeid = user?.employeeid;

     useEffect(() => {
          if (branchid && employeeid) {
               loadCostValuationAnalytics();
          }
     }, [branchid, employeeid]);

     const loadCostValuationAnalytics = async () => {
          try {
               const response = await customFetch(`inventory/analytics/cost-valuation?branchid=${branchid}&employeeid=${employeeid}`);
               if (response.success) {
                    setAnalytics(response.data);
               } else {
                    toast.error('Failed to load cost valuation analytics');
               }
          } catch (error) {
               console.error('Error loading cost valuation analytics:', error);
               toast.error('Error loading cost valuation analytics');
          } finally {
               setLoading(false);
          }
     };

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
          <div className="container-fluid p-4" data-pdf-root>
               {/* Header */}
               <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                         <Link href="/inventory/analytics" className="text-decoration-none d-block mb-2">
                              <RiArrowLeftLine size={16} className="me-1" />
                              <span className="text-muted">Back to Analytics Dashboard</span>
                         </Link>
                         <h2 className="mb-1">
                              <RiBarChartBoxLine className="me-2" />
                              Cost Valuation Analytics
                         </h2>
                         <p className="text-muted mb-0">Inventory valuation using different costing methods</p>
                    </div>
                    <div className="d-flex gap-2">
                         <ExportPdfButton title="Cost Valuation Analytics" />
                         <button
                              className="btn btn-outline-primary btn-sm"
                              onClick={loadCostValuationAnalytics}
                         >
                              <RiRefreshLine size={16} className="me-1" />
                              Refresh
                         </button>
                    </div>
               </div>

               {/* Cost Impact Summary */}
               {analytics && (
                    <div className="row g-3 mb-4">
                         <div className="col-md-4">
                              <div className="border rounded p-3 h-100" style={{ backgroundColor: 'var(--bs-body-bg)', borderColor: 'var(--bs-primary-border-subtle)' }}>
                                   <div className="text-center">
                                        <div className="fs-4 fw-bold text-primary mb-2">{currencyFormatter.format(analytics.profitability_impact.cost_of_goods_issued)}</div>
                                        <p className="text-muted mb-1">Cost of Goods Issued</p>
                                        <small className="text-primary">Total COGS</small>
                                   </div>
                              </div>
                         </div>
                         <div className="col-md-4">
                              <div className="border rounded p-3 h-100" style={{ backgroundColor: 'var(--bs-body-bg)', borderColor: 'var(--bs-danger-border-subtle)' }}>
                                   <div className="text-center">
                                        <div className="fs-4 fw-bold text-danger mb-2">{currencyFormatter.format(analytics.profitability_impact.expired_stock_value)}</div>
                                        <p className="text-muted mb-1">Expired Stock Value</p>
                                        <small className="text-danger">Write-off Required</small>
                                   </div>
                              </div>
                         </div>
                         <div className="col-md-4">
                              <div className="border rounded p-3 h-100" style={{ backgroundColor: 'var(--bs-body-bg)', borderColor: 'var(--bs-warning-border-subtle)' }}>
                                   <div className="text-center">
                                        <div className="fs-4 fw-bold text-warning mb-2">{currencyFormatter.format(analytics.profitability_impact.near_expiry_value)}</div>
                                        <p className="text-muted mb-1">Near Expiry Value</p>
                                        <small className="text-warning">Monitor Closely</small>
                                   </div>
                              </div>
                         </div>
                    </div>
               )}

               {/* Cost Trends */}
               <div className="row g-3 mb-4">
                    <div className="col-12">
                         <div className="border rounded p-3 h-100" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                              <div className="d-flex justify-content-between align-items-center mb-3">
                                   <h5 className="mb-0 fw-semibold">
                                        📈 Monthly Cost Trends
                                   </h5>
                                   <small className="text-muted">{analytics?.cost_trends.length || 0} months</small>
                              </div>
                              {analytics && analytics.cost_trends.length > 0 ? (
                                   <div className="table-responsive">
                                        <table className="table table-sm table-hover table-striped small printable-table-with-borders">
                                             <thead className="sticky-top bg-body-tertiary">
                                                  <tr>
                                                       <th className="text-start">Month</th>
                                                       <th className="text-start">Additions Cost</th>
                                                       <th className="text-start">Consumption Cost</th>
                                                       <th className="text-start">Write-off Cost</th>
                                                       <th className="text-start">Net Cost Change</th>
                                                  </tr>
                                             </thead>
                                             <tbody>
                                                  {analytics.cost_trends.map((trend, index) => (
                                                       <tr key={index}>
                                                            <td className="text-start fw-bold">{trend.month}</td>
                                                            <td className="text-start text-success">{currencyFormatter.format(trend.additions_cost)}</td>
                                                            <td className="text-start text-primary">{currencyFormatter.format(trend.consumption_cost)}</td>
                                                            <td className="text-start text-danger">{currencyFormatter.format(trend.write_off_cost)}</td>
                                                            <td className={`text-start fw-bold ${trend.net_cost_change >= 0 ? 'text-success' : 'text-danger'}`}>
                                                                 {trend.net_cost_change >= 0 ? '+' : ''}{currencyFormatter.format(trend.net_cost_change)}
                                                            </td>
                                                       </tr>
                                                  ))}
                                             </tbody>
                                        </table>
                                   </div>
                              ) : (
                                   <div className="text-center py-4">
                                        <p className="text-muted">No cost trend data available</p>
                                   </div>
                              )}
                         </div>
                    </div>
               </div>

               {/* Profitability Impact */}
               <div className="row g-3">
                    <div className="col-12">
                         <div className="border rounded p-3 h-100" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                              <div className="d-flex justify-content-between align-items-center mb-3">
                                   <h5 className="mb-0 fw-semibold">
                                        💰 Profitability Metrics
                                   </h5>
                              </div>
                              {analytics && (
                                   <div className="row g-3">
                                        <div className="col-md-3">
                                             <div className="text-center">
                                                  <div className="fs-5 fw-bold text-primary mb-2">{currencyFormatter.format(analytics.profitability_impact.cost_of_goods_issued)}</div>
                                                  <p className="text-muted mb-1">Cost of Goods Issued</p>
                                                  <small className="text-primary">Total COGS</small>
                                             </div>
                                        </div>
                                        <div className="col-md-3">
                                             <div className="text-center">
                                                  <div className="fs-5 fw-bold text-danger mb-2">{currencyFormatter.format(analytics.profitability_impact.expired_stock_value)}</div>
                                                  <p className="text-muted mb-1">Expired Stock Value</p>
                                                  <small className="text-danger">Write-off Required</small>
                                             </div>
                                        </div>
                                        <div className="col-md-3">
                                             <div className="text-center">
                                                  <div className="fs-5 fw-bold text-warning mb-2">{currencyFormatter.format(analytics.profitability_impact.near_expiry_value)}</div>
                                                  <p className="text-muted mb-1">Near Expiry Value</p>
                                                  <small className="text-warning">Monitor Closely</small>
                                             </div>
                                        </div>
                                        <div className="col-md-3">
                                             <div className="text-center">
                                                  <div className="fs-5 fw-bold text-info mb-2">{currencyFormatter.format(analytics.profitability_impact.average_cost_per_unit)}</div>
                                                  <p className="text-muted mb-1">Average Cost per Unit</p>
                                                  <small className="text-info">Unit Cost Analysis</small>
                                             </div>
                                        </div>
                                   </div>
                              )}
                         </div>
                    </div>
               </div>
          </div>
     );
}