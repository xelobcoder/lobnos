'use client';
import * as React from 'react';
import { useRouter } from 'next/navigation';
import { customFetch } from '../../../../../components/Auth/customFetch';

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
     const today = new Date();
     const [selectedDay, setSelectedDay] = React.useState<string>(today.toISOString().slice(0, 10));
     const [selectedStatus, setSelectedStatus] = React.useState<string>('pending');
     const [patientid, setPatientId] = React.useState<number | null>(null);
     const [billingid, setBillingId] = React.useState<number | null>(null);
     const [clients, setClients] = React.useState<ClientFolderItem[]>([]);
     const [loading, setLoading] = React.useState<boolean>(false);
     const [error, setError] = React.useState<string>('');
     const [query, setQuery] = React.useState('');

     const loadClients = async () => {
          if (selectedDay === 'all' && !patientid && !billingid) {
               setClients([]);
               setError('Please provide a Patient ID or Billing ID to search all records.');
               return;
          }
          setLoading(true);
          setError('');
          try {
               const response = await customFetch(`operations/overview/folder?date=${selectedDay}&status=${selectedStatus}&&billingid=${billingid || ''}&&patientid=${patientid || ''}`);

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

     const daysElapsed = today.getDate();
     const day = today.getDate();
     const month = today.toLocaleString('default', { month: 'long' });
     const year = today.getFullYear();
     const weekday = today.toLocaleString('default', { weekday: 'short' });

     // Current month days up to today (desc)
     const currMonthOptions: React.ReactElement[] = [];
     for (let i = daysElapsed; i >= 1; i--) {
          const date = new Date(today.getFullYear(), today.getMonth(), i);
          const dayNum = i;
          const monthName = date.toLocaleString('default', { month: 'long' });
          const yearNum = date.getFullYear();
          const weekday = date.toLocaleString('default', { weekday: 'short' });
          const isoDate = date.toISOString().slice(0, 10);
          currMonthOptions.push(
               <option key={`curr-${dayNum}`} value={isoDate}>{dayNum} - {monthName} {yearNum} [{weekday}]</option>
          );
     }
     // Previous month last 15 days (desc)
     const prevMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
     const prevMonthYear = prevMonth.getFullYear();
     const prevMonthNum = prevMonth.getMonth();
     const prevMonthDays = new Date(prevMonthYear, prevMonthNum + 1, 0).getDate();
     const prevMonthName = prevMonth.toLocaleString('default', { month: 'long' });
     const prevMonthOptions: React.ReactElement[] = [];
     for (let i = prevMonthDays; i >= Math.max(1, prevMonthDays - 14); i--) {
          const date = new Date(prevMonthYear, prevMonthNum, i);
          const dayNum = i;
          const yearNum = date.getFullYear();
          const weekday = date.toLocaleString('default', { weekday: 'short' });
          const isoDate = date.toISOString().slice(0, 10);
          prevMonthOptions.push(
               <option key={`prev-${dayNum}`} value={isoDate}>{dayNum} - {prevMonthName} {yearNum} [{weekday}]</option>
          );
     }



     React.useEffect(() => {
          if (selectedDay !== 'all') {
               loadClients();
          }
     }, [selectedDay, selectedStatus]);



     const openFolder = (patientid: number, billingid: number) => {
          if (!patientid || !billingid) return;
          router.push(`/operations/laboratory/main/dailyRequest/visit?patientid=${patientid}&billingid=${billingid}&&isOpenSideBarShow=false`);
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
                         <div className="d-flex flex-wrap align-items-end gap-3">
                              <div style={{ minWidth: 240 }}>
                                   <div className="fw-semibold mb-1" style={{ fontSize: '0.9rem' }}>Day</div>
                                   <select className="form-select form-select-sm" value={selectedDay} onChange={(e) => setSelectedDay(e.target.value)}>
                                      <option value="all" >All</option>
                                        <optgroup key="curr-month" label={`Current Month: ${today.toLocaleString('default', { month: 'long' })} ${today.getFullYear()}`}>
                                             {currMonthOptions}
                                        </optgroup>
                                        <optgroup key="prev-month" label={`Previous Month: ${prevMonthName} ${prevMonthYear}`}>
                                             {prevMonthOptions}
                                        </optgroup>
                                   </select>
                              </div>

                              <div style={{ minWidth: 240 }}>
                                   <div className="fw-semibold mb-1" style={{ fontSize: '0.9rem' }}>Payment Status</div>
                                   <select
                                        className="form-select form-select-sm"
                                        value={selectedStatus}
                                        onChange={(e) => setSelectedStatus(e.target.value)}
                                   >
                                        <option value="pending">Pending</option>
                                        <option value="partial">Partial</option>
                                        <option value="paid">Paid</option>
                                   </select>
                              </div>

                              <div style={{ minWidth: 260, flex: 1 }}>
                                   <div className="fw-semibold mb-1" style={{ fontSize: '0.9rem' }}>Patient ID {selectedDay === 'all' && <span className="text-danger">*</span>}</div>
                                   <input
                                        className="form-control form-control-sm"
                                        placeholder="Search patientId"
                                        value={patientid !== null ? patientid : ''}
                                        type='number'
                                        onChange={(ev) => { setPatientId(ev.target.value === '' ? null : parseInt(ev.target.value)) }}
                                   />
                              </div>
                              <div style={{ minWidth: 260, flex: 1 }}>
                                   <div className="fw-semibold mb-1" style={{ fontSize: '0.9rem' }}>Billing ID {selectedDay === 'all' && <span className="text-danger">*</span>}</div>
                                   <input type='number'
                                        className="form-control form-control-sm"
                                        placeholder="Search billingId"
                                        value={billingid !== null ? billingid : ''}
                                        onChange={(ev) => { setBillingId(ev.target.value === '' ? null : parseInt(ev.target.value)) }}
                                   />
                              </div>
                              {/* SE */}

                              <div className="ms-auto d-flex gap-2">
                                   <button className="btn btn-sm btn-outline-secondary" onClick={loadClients} disabled={loading}>
                                        Refresh
                                   </button>
                              </div>
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
