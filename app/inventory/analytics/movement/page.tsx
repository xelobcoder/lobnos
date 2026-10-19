'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'react-toastify';
import { currencyFormatter, customFetch } from '../../../../components/Auth/customFetch';
import { useApplicationSettings } from '../../../../components/Auth/useApplicationContext';
import ExportPdfButton from '../../../../components/reports/ExportPdfButton';
import { RiArrowLeftLine, RiRefreshLine, RiFilterLine, RiArrowDownLine, RiArrowUpLine, RiTimeLine, RiBox3Line, RiExchangeLine, RiDeleteBinLine, RiAlertLine, RiRecycleLine, RiBarChartLine, RiLoopLeftLine, RiFlashlightLine, RiCalendarLine } from '@remixicon/react';

const COLOR_ACCENT = 'oklch(0.646 0.222 41.116)';
const COLOR_BORDER = 'var(--bs-border-color)';

interface InventoryMovementAnalytics {
     movement_by_type: {
          total_received: number;
          total_issued: number;
          total_returned: number;
          internal_transfers_in: number;
          internal_transfers_out: number;
          write_offs: number;
          expired_quantity: number;
          wastage_quantity: number;
     };
     velocity_metrics: {
          item_turnover_rate: Array<{
               item_id: string;
               item_name: string;
               turnover_ratio: number;
               turnover_category: 'fast' | 'medium' | 'slow';
          }>;
          average_inventory_age: Array<{
               average_days_in_stock: number;
               last_movement_date: string;
          }>;
          fast_moving_items: Array<{
               item_id: string;
               item_name: string;
               monthly_movement: number;
               ranking: number;
          }>;
          slow_moving_items: Array<{
               item_id: string;
               item_name: string;
               days_since_last_movement: number;
               total_stock_value: number;
          }>;
     };
     movement_trends: Array<{
          month: string;
          received: number;
          issued: number;
          transfers: number;
          adjustments: number;
          net_movement: number;
     }>;
}

export default function InventoryMovementAnalyticsPage() {
     const router = useRouter();
     const searchParams = useSearchParams();
     const [analytics, setAnalytics] = useState<InventoryMovementAnalytics | null>(null);
     const [loading, setLoading] = useState(true);
     const [showFilters, setShowFilters] = useState(false);
     const { branchid, user } = useApplicationSettings().applicationsettings || {};
     const employeeid = user?.employeeid;

     const [filters, setFilters] = useState({
          dateRange: {
               start: '',
               end: ''
          },
          page: 1,
          count: 50
     });
     const [tempFilters, setTempFilters] = useState({
          dateRange: {
               start: '',
               end: ''
          },
          page: 1,
          count: 50
     });

     // Initialize filters from URL parameters
     const initializeFiltersFromURL = () => {
          const urlFilters = {
               dateRange: {
                    start: searchParams?.get('start_date') || '',
                    end: searchParams?.get('end_date') || ''
               },
               page: parseInt(searchParams?.get('page') || '1'),
               count: parseInt(searchParams?.get('count') || '50')
          };
          setFilters(urlFilters);
          setTempFilters(urlFilters);
          return urlFilters;
     };

     // Apply filters when filter button is clicked
     const applyFilters = () => {
          setFilters(tempFilters);
          updateURLWithFilters(tempFilters);
          loadInventoryMovementAnalytics(tempFilters);
          setShowFilters(false);
          toast.success('Filters applied');
     };

     // Update URL parameters with current filters
     const updateURLWithFilters = (filterState: typeof filters) => {
          const params = new URLSearchParams();

          if (filterState.dateRange.start) params.set('start_date', filterState.dateRange.start);
          if (filterState.dateRange.end) params.set('end_date', filterState.dateRange.end);
          if (filterState.page !== 1) params.set('page', filterState.page.toString());
          if (filterState.count !== 50) params.set('count', filterState.count.toString());

          const queryString = params.toString();
          const newUrl = queryString ? `?${queryString}` : '';
          router.replace(`/inventory/analytics/movement${newUrl}&&employeeid=${employeeid}&&branchid=${branchid}`, { scroll: false });
     };

     useEffect(() => {
          if (branchid && employeeid) {
               const urlFilters = initializeFiltersFromURL();
               loadInventoryMovementAnalytics(urlFilters);
          }
     }, [branchid, employeeid]);

     const loadInventoryMovementAnalytics = async (filterParams?: typeof filters) => {
          try {
               let url = 'inventory/analytics/movement';
               const params = new URLSearchParams();

               if (filterParams) {
                    params.set('branchid', branchid?.toString() || '');
                    params.set('employeeid', employeeid?.toString() || '');
                    if (filterParams.dateRange.start) params.set('start_date', filterParams.dateRange.start);
                    if (filterParams.dateRange.end) params.set('end_date', filterParams.dateRange.end);
                    if (filterParams.page !== 1) params.set('page', filterParams.page.toString());
                    if (filterParams.count !== 50) params.set('count', filterParams.count.toString());
               }

               if (params.toString()) {
                    url += `?${params.toString()}`;
               }

               const response = await customFetch(url);
               if (response.success) {
                    setAnalytics(response.data);
               } else {
                    toast.error('Failed to load inventory movement analytics');
               }
          } catch (error) {
               console.error('Error loading inventory movement analytics:', error);
               toast.error('Error loading inventory movement analytics');
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
          <>
               <div className="container-fluid p-4" data-pdf-root>
                    {/* Header */}
                    <div className="d-flex justify-content-between align-items-center mb-4">
                         <div>
                              <Link href="/inventory/analytics" className="text-decoration-none d-block mb-2">
                                   <RiArrowLeftLine size={16} className="me-1" />
                                   <span className="text-muted">Back to Analytics Dashboard</span>
                              </Link>
                              <h2 className="mb-1">
                                   <RiBarChartLine className="me-2" />
                                   Inventory Movement Analytics
                              </h2>
                              <p className="text-muted mb-0">Track inventory movement patterns and velocity</p>
                         </div>
                         <div className="d-flex gap-2">
                              <ExportPdfButton
                                   title="Inventory Movement Analytics"
                                   period={filters.dateRange.start || filters.dateRange.end ? `${filters.dateRange.start || 'Beginning'} to ${filters.dateRange.end || 'Today'}` : undefined}
                                   filters={[`Page: ${filters.page}`, `Count per page: ${filters.count}`]}
                              />
                              <button
                                   className="btn btn-outline-secondary btn-sm"
                                   onClick={() => {
                                        setTempFilters(filters); // Sync temp filters with current filters
                                        setShowFilters(true);
                                   }}
                              >
                                   <RiFilterLine size={16} className="me-1" />
                                   Filters
                              </button>
                              <button
                                   className="btn btn-outline-primary btn-sm"
                                   onClick={() => loadInventoryMovementAnalytics(filters)}
                              >
                                   <RiRefreshLine size={16} className="me-1" />
                                   Refresh
                              </button>
                         </div>
                    </div>

                    {/* Movement by Type Overview */}
                    {analytics && (
                         <div className="row g-3 mb-4">
                              <div className="col-lg-2 col-md-4 col-sm-6">
                                   <div className="border rounded p-3 h-100" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                                        <div className="d-flex align-items-center mb-2">
                                             <RiArrowDownLine size={20} className="me-2 text-success" />
                                             <span className="fw-medium text-muted small">Total Received</span>
                                        </div>
                                        <div className="fs-4 fw-bold text-success">{analytics.movement_by_type.total_received.toLocaleString()}</div>
                                        <div className="small text-muted">Items received</div>
                                   </div>
                              </div>
                              <div className="col-lg-2 col-md-4 col-sm-6">
                                   <div className="border rounded p-3 h-100" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                                        <div className="d-flex align-items-center mb-2">
                                             <RiArrowUpLine size={20} className="me-2 text-primary" />
                                             <span className="fw-medium text-muted small">Total Issued</span>
                                        </div>
                                        <div className="fs-4 fw-bold text-primary">{analytics.movement_by_type.total_issued.toLocaleString()}</div>
                                        <div className="small text-muted">Items issued</div>
                                   </div>
                              </div>
                              <div className="col-lg-2 col-md-4 col-sm-6">
                                   <div className="border rounded p-3 h-100" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                                        <div className="d-flex align-items-center mb-2">
                                             <RiExchangeLine size={20} className="me-2 text-info" />
                                             <span className="fw-medium text-muted small">Internal Transfers</span>
                                        </div>
                                        <div className="fs-4 fw-bold text-info">{analytics.movement_by_type.internal_transfers_in.toLocaleString()}</div>
                                        <div className="small text-muted">Transfer movements</div>
                                   </div>
                              </div>
                              <div className="col-lg-2 col-md-4 col-sm-6">
                                   <div className="border rounded p-3 h-100" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                                        <div className="d-flex align-items-center mb-2">
                                             <RiDeleteBinLine size={20} className="me-2 text-warning" />
                                             <span className="fw-medium text-muted small">Write-offs</span>
                                        </div>
                                        <div className="fs-4 fw-bold text-warning">{analytics.movement_by_type.write_offs.toLocaleString()}</div>
                                        <div className="small text-muted">Items written off</div>
                                   </div>
                              </div>
                              <div className="col-lg-2 col-md-4 col-sm-6">
                                   <div className="border rounded p-3 h-100" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                                        <div className="d-flex align-items-center mb-2">
                                             <RiAlertLine size={20} className="me-2 text-danger" />
                                             <span className="fw-medium text-muted small">Expired Quantity</span>
                                        </div>
                                        <div className="fs-4 fw-bold text-danger">{analytics.movement_by_type.expired_quantity.toLocaleString()}</div>
                                        <div className="small text-muted">Expired items</div>
                                   </div>
                              </div>
                              <div className="col-lg-2 col-md-4 col-sm-6">
                                   <div className="border rounded p-3 h-100" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                                        <div className="d-flex align-items-center mb-2">
                                             <RiRecycleLine size={20} className="me-2 text-secondary" />
                                             <span className="fw-medium text-muted small">Wastage Quantity</span>
                                        </div>
                                        <div className="fs-4 fw-bold text-secondary">{analytics.movement_by_type.wastage_quantity.toLocaleString()}</div>
                                        <div className="small text-muted">Wasted items</div>
                                   </div>
                              </div>
                         </div>
                    )}

                    {/* Movement Trends */}
                    <div className="row g-3 mb-4">
                         <div className="col-12">
                              <div className="border rounded p-3" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                                   <h6 className="fw-bold mb-3 d-flex align-items-center">
                                        <RiBarChartLine size={20} className="me-2 text-primary" />
                                        Movement Trends by Month
                                   </h6>
                                   <div className="p-2">
                                        {analytics && analytics.movement_trends.length > 0 ? (
                                             <div className="table-responsive">
                                                  <table className="table table-striped">
                                                       <thead>
                                                            <tr>
                                                                 <th className="text-start">Month</th>
                                                                 <th className="text-start">Received</th>
                                                                 <th className="text-start">Issued</th>
                                                                 <th className="text-start">Transfers</th>
                                                                 <th className="text-start">Adjustments</th>
                                                                 <th className="text-start">Net Movement</th>
                                                            </tr>
                                                       </thead>
                                                       <tbody>
                                                            {analytics.movement_trends.map((trend, index) => (
                                                                 <tr key={index}>
                                                                      <td className="text-start fw-bold">{trend.month}</td>
                                                                      <td className="text-start text-success">{trend.received.toLocaleString()}</td>
                                                                      <td className="text-start text-primary">{trend.issued.toLocaleString()}</td>
                                                                      <td className="text-start text-info">{trend.transfers.toLocaleString()}</td>
                                                                      <td className="text-start text-warning">{trend.adjustments.toLocaleString()}</td>
                                                                      <td className={`text-start fw-bold ${trend.net_movement >= 0 ? 'text-success' : 'text-danger'}`}>
                                                                           {trend.net_movement >= 0 ? '+' : ''}{trend.net_movement.toLocaleString()}
                                                                      </td>
                                                                 </tr>
                                                            ))}
                                                       </tbody>
                                                  </table>
                                             </div>
                                        ) : (
                                             <div className="text-start py-4">
                                                  <p className="text-muted">No movement trend data available</p>
                                             </div>
                                        )}
                                   </div>
                              </div>
                         </div>
                    </div>

                    {/* Velocity Metrics */}
                    <div className="row g-3">
                         {/* Item Turnover Rate */}
                         <div className="col-lg-6">
                              <div className="border rounded p-3" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                                   <h6 className="fw-bold mb-3 d-flex align-items-center">
                                        <RiLoopLeftLine size={20} className="me-2 text-primary" />
                                        Item Turnover Rate
                                   </h6>
                                   <div className="p-2">
                                        {analytics && analytics.velocity_metrics.item_turnover_rate.length > 0 ? (
                                             <div className="table-responsive">
                                                  <table className="table table-striped">
                                                       <thead>
                                                            <tr>
                                                                 <th className="text-start">Item</th>
                                                                 <th className="text-start">Turnover Ratio</th>
                                                                 <th className="text-start">Category</th>
                                                            </tr>
                                                       </thead>
                                                       <tbody>
                                                            {analytics.velocity_metrics.item_turnover_rate.slice(0, 10).map((item, index) => (
                                                                 <tr key={index}>
                                                                      <td className="text-start fw-bold">{item.item_name}</td>
                                                                      <td className="text-start fw-bold">{item.turnover_ratio.toFixed(2)}</td>
                                                                      <td className="text-start">
                                                                           <span className={`fw-medium ${item.turnover_category === 'fast' ? 'text-success' : item.turnover_category === 'medium' ? 'text-warning' : 'text-danger'}`}>
                                                                                {item.turnover_category}
                                                                           </span>
                                                                      </td>
                                                                 </tr>
                                                            ))}
                                                       </tbody>
                                                  </table>
                                             </div>
                                        ) : (
                                             <div className="text-start py-4">
                                                  <p className="text-muted">No turnover rate data available</p>
                                             </div>
                                        )}
                                   </div>
                              </div>
                         </div>

                         {/* Fast Moving Items */}
                         <div className="col-lg-6">
                              <div className="border rounded p-3" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                                   <h6 className="fw-bold mb-3 d-flex align-items-center">
                                        <RiFlashlightLine size={20} className="me-2 text-warning" />
                                        Fast Moving Items
                                   </h6>
                                   <div className="p-2">
                                        {analytics && analytics.velocity_metrics.fast_moving_items.length > 0 ? (
                                             <div className="d-flex flex-column gap-3">
                                                  {analytics.velocity_metrics.fast_moving_items.slice(0, 10).map((item, index) => (
                                                       <div key={item.item_id} className="d-flex justify-content-between align-items-center">
                                                            <div>
                                                                 <div className="fw-bold">#{item.ranking} {item.item_name}</div>
                                                            </div>
                                                            <div className="text-start">
                                                                 <div className="fw-bold text-success">{item.monthly_movement.toLocaleString()}</div>
                                                                 <small className="text-muted">monthly movement</small>
                                                            </div>
                                                       </div>
                                                  ))}
                                             </div>
                                        ) : (
                                             <div className="text-start py-4">
                                                  <p className="text-muted">No fast moving items data available</p>
                                             </div>
                                        )}
                                   </div>
                              </div>
                         </div>
                    </div>

                    {/* Slow Moving Items and Inventory Age */}
                    <div className="row g-3 mt-3">
                         <div className="col-lg-6">
                              <div className="border rounded p-3" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                                   <h6 className="fw-bold mb-3 d-flex align-items-center">
                                        <RiTimeLine size={20} className="me-2 text-secondary" />
                                        Slow Moving Items
                                   </h6>
                                   <div className="p-2">
                                        {analytics && analytics.velocity_metrics.slow_moving_items.length > 0 ? (
                                             <div className="table-responsive">
                                                  <table className="table table-striped">
                                                       <thead>
                                                            <tr>
                                                                 <th className="text-start">Item</th>
                                                                 <th className="text-start">Days Since Movement</th>
                                                                 <th className="text-start">Stock Value</th>
                                                            </tr>
                                                       </thead>
                                                       <tbody>
                                                            {analytics.velocity_metrics.slow_moving_items.slice(0, 10).map((item, index) => (
                                                                 <tr key={index}>
                                                                      <td className="text-start fw-bold">{item.item_name}</td>
                                                                      <td className={`text-start fw-bold ${item.days_since_last_movement > 90 ? 'text-danger' : item.days_since_last_movement > 30 ? 'text-warning' : 'text-success'}`}>
                                                                           {item.days_since_last_movement} days
                                                                      </td>
                                                                      <td className="text-start text-primary">{currencyFormatter.format(item.total_stock_value)}</td>
                                                                 </tr>
                                                            ))}
                                                       </tbody>
                                                  </table>
                                             </div>
                                        ) : (
                                             <div className="text-start py-4">
                                                  <p className="text-muted">No slow moving items data available</p>
                                             </div>
                                        )}
                                   </div>
                              </div>
                         </div>

                         <div className="col-lg-6">
                              <div className="border rounded p-3" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                                   <h6 className="fw-bold mb-3 d-flex align-items-center">
                                        <RiCalendarLine size={20} className="me-2 text-info" />
                                        Average Inventory Age
                                   </h6>
                                   <div className="p-2">
                                        {analytics && analytics.velocity_metrics.average_inventory_age.length > 0 ? (
                                             <div className="row g-3">
                                                  {analytics.velocity_metrics.average_inventory_age.map((age, index) => (
                                                       <div key={index} className="col-md-6">
                                                            <div className="border rounded p-3 h-100" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                                                                 <div className="text-start mb-2">
                                                                      <span className="fw-medium text-muted small">Average Days in Stock</span>
                                                                 </div>
                                                                 <div className={`fs-4 fw-bold mb-1 ${age.average_days_in_stock > 90 ? 'text-danger' : age.average_days_in_stock > 30 ? 'text-warning' : 'text-success'}`}>
                                                                      {age.average_days_in_stock.toFixed(1)}
                                                                 </div>
                                                                 <div className="text-start small text-muted">
                                                                      Last Movement: {age.last_movement_date ? new Date(age.last_movement_date).toLocaleDateString() : 'N/A'}
                                                                 </div>
                                                            </div>
                                                       </div>
                                                  ))}
                                             </div>
                                        ) : (
                                             <div className="text-start py-4">
                                                  <p className="text-muted">No inventory age data available</p>
                                             </div>
                                        )}
                                   </div>
                              </div>
                         </div>
                    </div>
               </div>

               {/* Filters Offcanvas */}
               <div className={`offcanvas offcanvas-end ${showFilters ? 'show' : ''}`} tabIndex={-1} id="filtersOffcanvas" style={{ visibility: showFilters ? 'visible' : 'hidden' }}>
                    <div className="offcanvas-header">
                         <h5 className="offcanvas-title">🔍 Filter Analytics</h5>
                         <button type="button" className="btn-close" onClick={() => setShowFilters(false)}></button>
                    </div>
                    <div className="offcanvas-body">
                         <div className="mb-4">
                              <h6 className="mb-3">📅 Date Range</h6>
                              <div className="row g-2">
                                   <div className="col-6">
                                        <label className="form-label small">Start Date</label>
                                        <input
                                             type="date"
                                             className="form-control form-control-sm"
                                             value={tempFilters.dateRange.start}
                                             onChange={(e) => setTempFilters({
                                                  ...tempFilters,
                                                  dateRange: { ...tempFilters.dateRange, start: e.target.value }
                                             })}
                                        />
                                   </div>
                                   <div className="col-6">
                                        <label className="form-label small">End Date</label>
                                        <input
                                             type="date"
                                             className="form-control form-control-sm"
                                             value={tempFilters.dateRange.end}
                                             onChange={(e) => setTempFilters({
                                                  ...tempFilters,
                                                  dateRange: { ...tempFilters.dateRange, end: e.target.value }
                                             })}
                                        />
                                   </div>
                              </div>
                         </div>

                         <div className="mb-4">
                              <h6 className="mb-3">📄 Count per page</h6>
                              <div className="row g-2">
                                   <div className="col-6">
                                        <label className="form-label small">Select Count</label>
                                        <select
                                             className="form-select form-select-sm"
                                             value={tempFilters.count.toString()}
                                             onChange={(e) => setTempFilters({
                                                  ...tempFilters,
                                                  count: parseInt(e.target.value) || tempFilters.count
                                             })}
                                        >
                                             <option value="10">10</option>
                                             <option value="50">50</option>
                                             <option value="100">100</option>
                                             <option value="1000">1000</option>
                                        </select>
                                   </div>
                                   <div className="col-6">
                                        <label className="form-label small">Custom Count</label>
                                        <input
                                             type="number"
                                             className="form-control form-control-sm"
                                             min="1"
                                             placeholder="Enter count"
                                             onChange={(e) => {
                                                  const value = parseInt(e.target.value);
                                                  if (value > 0) {
                                                       setTempFilters({
                                                            ...tempFilters,
                                                            count: value
                                                       });
                                                  }
                                             }}
                                        />
                                   </div>
                              </div>
                         </div>

                         <div className="mb-4">
                              <h6 className="mb-3">📄 Pagination</h6>
                              <div className="d-flex justify-content-center align-items-center gap-2">
                                   <button
                                        className="btn btn-outline-primary btn-sm"
                                        onClick={() => {
                                             if (tempFilters.page > 1) {
                                                  setTempFilters({
                                                       ...tempFilters,
                                                       page: tempFilters.page - 1
                                                  });
                                             }
                                        }}
                                        disabled={tempFilters.page <= 1}
                                   >
                                        ← Previous
                                   </button>
                                   <span className="text-muted small">Page {tempFilters.page}</span>
                                   <button
                                        className="btn btn-outline-primary btn-sm"
                                        onClick={() => {
                                             setTempFilters({
                                                  ...tempFilters,
                                                  page: tempFilters.page + 1
                                             });
                                        }}
                                   >
                                        Next →
                                   </button>
                              </div>
                         </div>

                         <div className="d-grid gap-2">
                              <button
                                   className="btn btn-primary"
                                   onClick={applyFilters}
                              >
                                   Apply Filters
                              </button>
                              <button
                                   className="btn btn-outline-secondary"
                                   onClick={() => {
                                        const resetFilters = {
                                             dateRange: { start: '', end: '' },
                                             page: 1,
                                             count: 50
                                        };
                                        setTempFilters(resetFilters);
                                        setFilters(resetFilters);
                                        updateURLWithFilters(resetFilters);
                                        loadInventoryMovementAnalytics(resetFilters);
                                        setShowFilters(false);
                                        toast.info('Filters reset');
                                   }}
                              >
                                   Reset Filters
                              </button>
                         </div>
                    </div>
               </div>

               {/* Offcanvas Backdrop */}
               {showFilters && <div className="offcanvas-backdrop show" onClick={() => setShowFilters(false)}></div>}
          </>
     );
}