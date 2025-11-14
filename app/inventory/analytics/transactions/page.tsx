'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { Offcanvas } from 'react-bootstrap';
import { currencyFormatter, customFetch } from '../../../../components/Auth/customFetch';

interface TransactionAnalytics {
     total_transactions: number;
     additions: number;
     consumptions: number;
     adjustments: number;
     transaction_trends: Array<{
          date: string;
          additions: number;
          consumptions: number;
          adjustments: number;
     }>;
     top_consumed_items: Array<{
          item_id: string;
          item_name: string;
          total_consumed: number;
     }>;
}

export default function TransactionAnalyticsPage() {
     const [analytics, setAnalytics] = useState<TransactionAnalytics | null>(null);
     const [loading, setLoading] = useState(true);
     const [showFilters, setShowFilters] = useState(false);
     const [filters, setFilters] = useState({
          itemid: '',
          supplierid: '',
          start_date: '',
          end_date: ''
     });

     useEffect(() => {
          loadTransactionAnalytics();
     }, []);

     const loadTransactionAnalytics = async () => {
          try {
               const queryParams = new URLSearchParams();

               // Add filters to query params
               Object.entries(filters).forEach(([key, value]) => {
                    if (value && value !== '') {
                         queryParams.append(key, value);
                    }
               });

               const response = await customFetch(`inventory/analytics/transactions?${queryParams.toString()}`);
               if (response.success) {
                    setAnalytics(response.data);
               } else {
                    toast.error('Failed to load transaction analytics');
               }
          } catch (error) {
               console.error('Error loading transaction analytics:', error);
               toast.error('Error loading transaction analytics');
          } finally {
               setLoading(false);
          }
     };

     const getTransactionTypeColor = (type: string) => {
          switch (type) {
               case 'additions': return 'success';
               case 'consumptions': return 'warning';
               case 'adjustments': return 'info';
               default: return 'primary';
          }
     };

     const getTransactionTypeLabel = (type: string) => {
          switch (type) {
               case 'additions': return 'Additions';
               case 'consumptions': return 'Consumptions';
               case 'adjustments': return 'Adjustments';
               default: return type;
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
          <div className="container-fluid p-4">
               {/* Header */}
               <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                         <Link href="/inventory/analytics" className="text-decoration-none">
                              <span className="text-muted">← Back to Analytics Dashboard</span>
                         </Link>
                         <h2 className="mb-1">🔄 Transaction Analytics</h2>
                         <p className="text-muted mb-0">Inventory transaction patterns and trends</p>
                    </div>
                    <div className="btn-group">
                         <button
                              className="btn btn-outline-secondary"
                              onClick={() => setShowFilters(true)}
                         >
                              🔍 Filters
                         </button>
                         <button
                              className="btn btn-outline-primary"
                              onClick={loadTransactionAnalytics}
                         >
                              ↻ Refresh
                         </button>
                    </div>
               </div>

               {/* Transaction Summary Cards */}
               {analytics && (
                    <div className="row g-3 mb-4">
                         <div className="col-md-3">
                              <div className="card h-100">
                                   <div className="card-body text-center">
                                        <h3 className="text-primary">{analytics.total_transactions.toLocaleString()}</h3>
                                        <p className="text-muted mb-0">Total Transactions</p>
                                   </div>
                              </div>
                         </div>
                         <div className="col-md-3">
                              <div className="card h-100">
                                   <div className="card-body text-center">
                                        <h3 className="text-success">{analytics.additions.toLocaleString()}</h3>
                                        <p className="text-muted mb-0">Additions</p>
                                   </div>
                              </div>
                         </div>
                         <div className="col-md-3">
                              <div className="card h-100">
                                   <div className="card-body text-center">
                                        <h3 className="text-warning">{analytics.consumptions.toLocaleString()}</h3>
                                        <p className="text-muted mb-0">Consumptions</p>
                                   </div>
                              </div>
                         </div>
                         <div className="col-md-3">
                              <div className="card h-100">
                                   <div className="card-body text-center">
                                        <h3 className="text-info">{analytics.adjustments.toLocaleString()}</h3>
                                        <p className="text-muted mb-0">Adjustments</p>
                                   </div>
                              </div>
                         </div>
                    </div>
               )}

               {/* Transaction Trends and Top Consumed Items */}
               <div className="row g-3">
                    <div className="col-lg-8">
                         <div className="card">
                              <div className="card-header">
                                   <h5 className="mb-0">Transaction Trends</h5>
                              </div>
                              <div className="card-body">
                                   {analytics && analytics.transaction_trends.length > 0 ? (
                                        <div className="table-responsive">
                                             <table className="table table-striped">
                                                  <thead>
                                                       <tr>
                                                            <th>Date</th>
                                                            <th>Additions</th>
                                                            <th>Consumptions</th>
                                                            <th>Adjustments</th>
                                                            <th>Total</th>
                                                       </tr>
                                                  </thead>
                                                  <tbody>
                                                       {analytics.transaction_trends.map((trend, index) => (
                                                            <tr key={index}>
                                                                 <td>{new Date(trend.date).toLocaleDateString()}</td>
                                                                 <td className="text-success">{trend.additions.toLocaleString()}</td>
                                                                 <td className="text-warning">{trend.consumptions.toLocaleString()}</td>
                                                                 <td className="text-info">{trend.adjustments.toLocaleString()}</td>
                                                                 <td className="fw-bold">
                                                                      {(trend.additions + trend.consumptions + trend.adjustments).toLocaleString()}
                                                                 </td>
                                                            </tr>
                                                       ))}
                                                  </tbody>
                                             </table>
                                        </div>
                                   ) : (
                                        <div className="text-center py-4">
                                             <p className="text-muted">No transaction trend data available</p>
                                        </div>
                                   )}
                              </div>
                         </div>
                    </div>

                    <div className="col-lg-4">
                         <div className="card">
                              <div className="card-header">
                                   <h5 className="mb-0">Top Consumed Items</h5>
                              </div>
                              <div className="card-body">
                                   {analytics && analytics.top_consumed_items.length > 0 ? (
                                        <div className="d-flex flex-column gap-3">
                                             {analytics.top_consumed_items.slice(0, 10).map((item, index) => (
                                                  <div key={item.item_id} className="d-flex justify-content-between align-items-center">
                                                       <div>
                                                            <div className="fw-bold">{item.item_name}</div>
                                                            <small className="text-muted">#{index + 1}</small>
                                                       </div>
                                                       <div className="text-end">
                                                            <div className="fw-bold text-warning">{item.total_consumed.toLocaleString()}</div>
                                                            <small className="text-muted">consumed</small>
                                                       </div>
                                                  </div>
                                             ))}
                                        </div>
                                   ) : (
                                        <div className="text-center py-4">
                                             <p className="text-muted">No consumption data available</p>
                                        </div>
                                   )}
                              </div>
                         </div>
                    </div>
               </div>

               {/* Filters Offcanvas */}
               <Offcanvas
                    show={showFilters}
                    onHide={() => setShowFilters(false)}
                    placement="end"
               >
                    <Offcanvas.Header closeButton>
                         <Offcanvas.Title>
                              🔍 Transaction Filters
                         </Offcanvas.Title>
                    </Offcanvas.Header>
                    <Offcanvas.Body>
                         <div className="row g-3">
                              <div className="col-12">
                                   <label className="form-label">Item ID</label>
                                   <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Filter by specific item ID"
                                        value={filters.itemid}
                                        onChange={(e) => setFilters({ ...filters, itemid: e.target.value })}
                                   />
                              </div>
                              <div className="col-12">
                                   <label className="form-label">Supplier ID</label>
                                   <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Filter by supplier ID"
                                        value={filters.supplierid}
                                        onChange={(e) => setFilters({ ...filters, supplierid: e.target.value })}
                                   />
                              </div>
                              <div className="col-12">
                                   <label className="form-label">Start Date</label>
                                   <input
                                        type="date"
                                        className="form-control"
                                        value={filters.start_date}
                                        onChange={(e) => setFilters({ ...filters, start_date: e.target.value })}
                                   />
                              </div>
                              <div className="col-12">
                                   <label className="form-label">End Date</label>
                                   <input
                                        type="date"
                                        className="form-control"
                                        value={filters.end_date}
                                        onChange={(e) => setFilters({ ...filters, end_date: e.target.value })}
                                   />
                              </div>
                         </div>
                    </Offcanvas.Body>
                    <div className="offcanvas-footer p-3 border-top">
                         <div className="d-flex gap-2 w-100">
                              <button
                                   className="btn btn-primary flex-fill"
                                   onClick={() => {
                                        loadTransactionAnalytics();
                                        setShowFilters(false);
                                   }}
                              >
                                   Apply Filters
                              </button>
                              <button
                                   className="btn btn-outline-secondary flex-fill"
                                   onClick={() => {
                                        setFilters({
                                             itemid: '',
                                             supplierid: '',
                                             start_date: '',
                                             end_date: ''
                                        });
                                        loadTransactionAnalytics();
                                        setShowFilters(false);
                                   }}
                              >
                                   Clear
                              </button>
                         </div>
                    </div>
               </Offcanvas>
          </div>
     );
}