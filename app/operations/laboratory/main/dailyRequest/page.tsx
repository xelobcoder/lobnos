'use client';
import * as React from 'react';
import { useRouter } from 'next/navigation';
import { customFetch } from '../../../../../components/Auth/customFetch';
import DateFilterReusable from '../../../../../components/operations/Laboratory/ResuableFilter/DateFilterReusable';

interface ClientFolderItem {
     patientid: number;
     patient_details: string;
     billingid: number;
     billedon: string;
     ascension_date: string;
     total_tests: number;
     tests_with_stage: string;
     payment_status?: string;
}

export default function LaboratoryClientList() {
     const router = useRouter();
     const todayDate = new Date().toISOString().slice(0, 10);
     const [selectedStatus, setSelectedStatus] = React.useState<string>('pending');
     const [dateFilter, setDateFilter] = React.useState<string>('Today');
     const [dateFrom, setDateFrom] = React.useState<string>(todayDate);
     const [dateTo, setDateTo] = React.useState<string>(todayDate);
     const [filterCategory, setFilterCategory] = React.useState<{ section: string; value: string }>({ section: '', value: '' });
     const [clients, setClients] = React.useState<ClientFolderItem[]>([]);
     const [loading, setLoading] = React.useState<boolean>(false);
     const [error, setError] = React.useState<string>('');
     const [query, setQuery] = React.useState('');

     const loadClients = async () => {
          if (!dateFrom && !dateTo && !filterCategory.value) {
               setClients([]);
               setError('Please provide date range or filter criteria to search records.');
               return;
          }
          setLoading(true);
          setError('');
          try {
               let url = `operations/overview/folder?status=${selectedStatus}`;

               if (dateFrom) url += `&_dateFrom=${dateFrom}`;
               if (dateTo) url += `&_dateEnd=${dateTo}`;

               if (filterCategory.section && filterCategory.value) {
                    url += `&${filterCategory.section}=${filterCategory.value}`;
               }

               const response = await customFetch(url);

               if (response?.statusCode === 200 && Array.isArray(response.result)) {
                    setClients(response.result);
               } else if (response?.result && Array.isArray(response.result)) {
                    setClients(response.result);
               } else {
                    setClients([]);
                    setError('No data returned for the selected criteria.');
               }
          } catch (err) {
               setClients([]);
               setError('Could not load clients. Please try again.');
               console.error('loadClients error:', err);
          } finally {
               setLoading(false);
          }
     };

     const updateDateValues = (values: [string, string]) => {
          const [start, end] = values;
          setDateFrom(start);
          setDateTo(end);
     };

     const handleSettingCategory = (section: string, value: string) => {
          setFilterCategory({ section, value });
     };

     const handleResetFilters = () => {
          setDateFilter('');
          setDateFrom('');
          setDateTo('');
          setFilterCategory({ section: '', value: '' });
          setSelectedStatus('pending');
          setClients([]);
          setQuery('');
          setError('');
     };

     const handleFilterByLabTest = () => {
          const popup = window.open(
               `/labtestfilter?employeeid=0&&branchid=0`,
               "LabTestFilter",
               "width=600,height=450,resizable=no,scrollbars=yes"
          );

          if (popup) {
               popup.focus();
          }
     };

     React.useEffect(() => {
          const listener = (event: MessageEvent) => {
               if (event.data?.type === "TEST_PANEL_SELECTED") {
                    if (event.data.payload && event.data.payload.id) {
                         handleSettingCategory("testname", event.data.payload.id);
                    }
               }
          };

          window.addEventListener("message", listener);
          return () => window.removeEventListener("message", listener);
     }, []);

     React.useEffect(() => {
          const handleKeyDown = (event: KeyboardEvent) => {
               if (event.key === 'Enter') {
                    event.preventDefault();
                    loadClients();
               }
          };

          window.addEventListener("keydown", handleKeyDown);
          return () => window.removeEventListener("keydown", handleKeyDown);
     }, [dateFrom, dateTo, filterCategory, selectedStatus]);

     React.useEffect(() => {
          loadClients();
     }, []);

     const getStageTextClass = (stage: string) => {
          const normalized = (stage || '').trim().toLowerCase();
          if (normalized.includes('pending')) return 'text-warning';
          if (normalized.includes('paid') || normalized.includes('completed') || normalized.includes('done')) return 'text-success';
          if (normalized.includes('partial')) return 'text-info';
          if (normalized.includes('cancel') || normalized.includes('rejected') || normalized.includes('failed')) return 'text-danger';
          return 'text-muted';
     };

     const formatElapsed = (ascensionDateStr: string) => {
          if (!ascensionDateStr) return 'N/A';
          const ascensionDate = new Date(ascensionDateStr);
          if (Number.isNaN(ascensionDate.getTime())) return 'Invalid date';

          const diffMs = Date.now() - ascensionDate.getTime();
          if (diffMs < 0) return '0m';

          const minutes = Math.floor(diffMs / 60000); // 60,000ms
          const hours = Math.floor(minutes / 60);
          const days = Math.floor(hours / 24);
          const leftoverMinutes = minutes % 60;
          const leftoverHours = hours % 24;

          let out = '';
          if (days > 0) out += `${days}d `;
          if (leftoverHours > 0 || days > 0) out += `${leftoverHours}h `;
          out += `${leftoverMinutes}m`;
          return out;
     };

     const parseBreakdown = (testsWithStage: string) => {
          const counts = { processing: 0, completed: 0, collected: 0, validated: 0, other: 0 };
          if (!testsWithStage) return counts;

          testsWithStage
               .split(',')
               .map((item) => item.trim())
               .filter(Boolean)
               .forEach((item) => {
                    const match = item.match(/\(([^)]+)\)$/);
                    const stage = (match?.[1] || '').trim().toLowerCase();
                    if (stage.includes('processing') || stage.includes('processed')) counts.processing += 1;
                    else if (stage.includes('collected')) counts.collected += 1;
                    else if (stage.includes('validated') || stage.includes('approved')) counts.validated += 1;
                    else if (stage.includes('completed') || stage.includes('done')) counts.completed += 1;
                    else counts.other += 1;
               });

          return counts;
     };

     const today = new Date();
     const day = today.getDate();
     const month = today.toLocaleString('default', { month: 'long' });
     const year = today.getFullYear();
     const weekday = today.toLocaleString('default', { weekday: 'short' });

     const openFolder = (patientid: number, billingid: number) => {
          if (!patientid || !billingid) return;
          window.open(`/operations/laboratory/main/dailyRequest/visit?patientid=${patientid}&billingid=${billingid}&&isOpenSideBarShow=false`, '_blank');
     }

     const filteredClients = React.useMemo(() => {
          const q = query.trim().toLowerCase();
          if (!q) return clients;
          return clients.filter(c =>
               (c.patient_details || '').toLowerCase().includes(q) ||
               String(c.patientid).includes(q) ||
               String(c.billingid).includes(q)
          );
     }, [clients, query]);

     const stats = React.useMemo(() => {
          const pendingPayment = clients.filter(c => (c.payment_status || '').toLowerCase() === 'pending').length;
          const paid = clients.filter(c => (c.payment_status || '').toLowerCase() === 'paid').length;
          const partial = clients.filter(c => (c.payment_status || '').toLowerCase() === 'partial').length;
          const totalTests = clients.reduce((acc, c) => acc + (c.total_tests || 0), 0);
          return { pendingPayment, paid, partial, totalTests };
     }, [clients]);

     return (
          <div>
               <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-2">
                    <div>
                         <h3 style={{ fontWeight: 700, fontSize: '1.5rem', margin: 0 }}>Daily Requests</h3>
                         <div className="text-muted" style={{ fontSize: '0.9rem' }}>
                              Today: {day} {month} {year} [{weekday}]
                         </div>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                         <span className="badge bg-primary">Requests: {filteredClients.length}</span>
                         <span className="badge bg-secondary">Tests: {stats.totalTests}</span>
                         {stats.pendingPayment > 0 ? <span className="badge bg-danger">Payment Pending: {stats.pendingPayment}</span> : null}
                    </div>
               </div>

               <div className="card">
                    <div className="card-body">
                         <div className="d-flex align-items-center gap-2 flex-nowrap" style={{ overflowX: 'auto', paddingBottom: '0.25rem' }}>
                              <div style={{ minWidth: 200, flex: '0 0 auto' }}>
                                   <select
                                        onChange={(ev) => {
                                             if (ev.target.value === "none") {
                                                  handleSettingCategory("none", "");
                                             } else {
                                                  handleSettingCategory(ev.target.value, '');
                                                  if (ev.target.value === "testname") {
                                                       handleFilterByLabTest();
                                                  }
                                             }
                                        }}
                                        className="form-select"
                                        value={filterCategory.section}
                                        style={{ padding: '0.5rem 0.75rem' }}
                                   >
                                        <option value="none">Filter By</option>
                                        <option value="patientname">Patient Name</option>
                                        <option value="patientid">Patient ID</option>
                                        <option value="billingid">Billing ID</option>
                                        <option value="testname">Laboratory Test</option>
                                   </select>
                              </div>

                              <div style={{ minWidth: 220, flex: '0 0 auto' }}>
                                   <input
                                        className="form-control"
                                        value={filterCategory.value}
                                        onChange={(ev) => handleSettingCategory(filterCategory.section, ev.target.value)}
                                        placeholder="Enter value"
                                        style={{ padding: '0.5rem 0.75rem' }}
                                   />
                              </div>

                              <div style={{ minWidth: 220, flex: '0 0 auto' }}>
                                   <DateFilterReusable
                                        value={dateFilter}
                                        onChange={setDateFilter}
                                        onDateRangeChange={(startDate, endDate) => {
                                             setDateFrom(startDate);
                                             setDateTo(endDate);
                                        }}
                                        label="Date Range"
                                        className=""
                                   />
                              </div>

                              <div style={{ minWidth: 220, flex: '0 0 auto' }}>
                                   <select
                                        className="form-select"
                                        value={selectedStatus}
                                        onChange={(ev) => setSelectedStatus(ev.target.value)}
                                        style={{ padding: '0.5rem 0.75rem' }}
                                   >
                                        <option value="pending">Pending</option>
                                        <option value="partial">Partial</option>
                                        <option value="paid">Paid</option>
                                   </select>
                              </div>

                              <div style={{ flex: '1 1 auto' }} />

                              <button
                                   onClick={loadClients}
                                   className="btn btn-primary d-flex align-items-center gap-2"
                                   disabled={loading}
                                   title="Load"
                                   style={{ flex: '0 0 auto', padding: '0.5rem 1rem', whiteSpace: 'nowrap' }}
                              >
                                   <span>⚙️</span>
                                   {loading ? 'Loading...' : 'Load'}
                              </button>

                              <button
                                   onClick={handleResetFilters}
                                   className="btn btn-outline-secondary d-flex align-items-center gap-2"
                                   title="Reset"
                                   style={{ flex: '0 0 auto', padding: '0.5rem 1rem', whiteSpace: 'nowrap' }}
                              >
                                   <span>🔄</span>
                                   Reset
                              </button>
                         </div>

                         <div className="mt-2">
                              <small className="text-muted">
                                   <span className="badge bg-info">💡 Tip:</span> Press <kbd>Enter</kbd> key anywhere on this page to load data with your filters
                              </small>
                         </div>
                    </div>
               </div>

               <div className="mt-3">
                    {loading ? (
                         <div className="text-center py-5">
                              <div className="spinner-border text-primary" role="status">
                                   <span className="visually-hidden">Loading...</span>
                              </div>
                              <p className="mt-2 mb-0">Loading requests...</p>
                         </div>
                    ) : error ? (
                         <div className="alert alert-danger" role="alert">
                              {error}
                         </div>
                    ) : clients.length === 0 ? (
                         <div className="alert alert-secondary" role="alert">
                              No records found for selected date and status.
                         </div>
                    ) : filteredClients.length === 0 ? (
                         <div className="alert alert-secondary" role="alert">
                              No matches for your search.
                         </div>
                    ) : (
                         <div className="table-responsive">
                              <table className="table table-bordered table-striped align-middle">
                                   <thead className="table-light">
                                        <tr>
                                             <th style={{ minWidth: 260 }}>Patient</th>
                                             <th style={{ minWidth: 160 }}>Request</th>
                                             <th style={{ minWidth: 260 }}>Progress</th>
                                             <th style={{ width: 140 }}>Action</th>
                                        </tr>
                                   </thead>
                                   <tbody>
                                        {filteredClients.map((client) => {
                                             const breakdown = parseBreakdown(client.tests_with_stage);
                                             const isPaymentPending = (client.payment_status || '').toLowerCase() === 'pending';
                                             const paymentStatus = (client.payment_status || selectedStatus || '').toString();
                                             return (
                                                  <tr
                                                       key={`${client.patientid}-${client.billingid}`}
                                                       className={isPaymentPending ? 'bg-danger-subtle border-start border-4 border-danger' : ''}
                                                  >
                                                       <td>
                                                            <div className="fw-semibold">{client.patient_details}</div>
                                                            <div className="text-muted" style={{ fontSize: '0.85rem' }}>
                                                                 ID: {client.patientid} • Billing: {client.billingid}
                                                            </div>
                                                            <div className="text-muted" style={{ fontSize: '0.85rem' }}>
                                                                 Billed: {client.billedon ? new Date(client.billedon).toLocaleString() : 'N/A'}
                                                            </div>
                                                       </td>
                                                       <td>
                                                            <div>{client.ascension_date ? new Date(client.ascension_date).toLocaleString() : 'N/A'}</div>
                                                            <div className="fw-semibold mt-1">{formatElapsed(client.ascension_date)}</div>
                                                            <div className={`mt-1 text-capitalize ${getStageTextClass(paymentStatus)}`}>{paymentStatus}</div>
                                                       </td>
                                                       <td>
                                                            <div className="fw-semibold mb-2">Total: {client.total_tests}</div>
                                                            <div className="text-muted mb-2" style={{ fontSize: '0.85rem' }}>
                                                                 Collected: {breakdown.collected} | Validated: {breakdown.validated} | Processing: {breakdown.processing} | Completed: {breakdown.completed} | Other: {breakdown.other}
                                                            </div>
                                                            <div className="mt-2">
                                                                 {(client.tests_with_stage || '')
                                                                      .split(',')
                                                                      .map((t) => t.trim())
                                                                      .filter(Boolean)
                                                                      .map((t, i) => {
                                                                           const match = t.match(/^(.*)\s*\((.*)\)$/);
                                                                           const name = match ? match[1] : t;
                                                                           const stage = match ? match[2] : 'unknown';
                                                                           return (
                                                                                <div key={i} className="d-flex justify-content-between align-items-center py-1 border-bottom">
                                                                                     <div style={{ minWidth: 0 }} className="text-truncate">{name}</div>
                                                                                     <div className={`text-capitalize ms-2 ${getStageTextClass(stage)}`} style={{ fontSize: '0.85rem' }}>{stage}</div>
                                                                                </div>
                                                                           );
                                                                      })}
                                                            </div>
                                                       </td>
                                                       <td>
                                                            <button
                                                                 onClick={() => openFolder(client.patientid, client.billingid)}
                                                                 className={`btn btn-sm ${isPaymentPending ? 'btn-primary' : 'btn-outline-primary'} w-100`}
                                                            >
                                                                 Open
                                                            </button>
                                                       </td>
                                                  </tr>
                                             );
                                        })}
                                   </tbody>
                              </table>
                         </div>
                    )}
               </div>
          </div>
     );
}
