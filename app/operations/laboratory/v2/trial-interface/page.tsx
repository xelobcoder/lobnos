'use client';
import * as React from 'react';
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
     const today = new Date();
     const [selectedDay, setSelectedDay] = React.useState<string>(today.toISOString().slice(0, 10));
     const [selectedStatus, setSelectedStatus] = React.useState<string>('pending');
     const [clients, setClients] = React.useState<ClientFolderItem[]>([]);
     const [loading, setLoading] = React.useState<boolean>(false);
     const [error, setError] = React.useState<string>('');

     const loadClients = async () => {
          if (!selectedDay) {
               alert('Please select a day to load clients.');
               return;
          }

          setLoading(true);
          setError('');

          try {
               const response = await customFetch(`operations/overview/folder?date=${selectedDay}&status=${selectedStatus}`);

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

     const getStatusBadgeClass = (stage: string) => {
          const normalized = stage.trim().toLowerCase();
          if (normalized.includes('pending')) return 'badge bg-warning text-dark';
          if (normalized.includes('paid') || normalized.includes('completed') || normalized.includes('done')) return 'badge bg-success';
          if (normalized.includes('partial')) return 'badge bg-info text-dark';
          if (normalized.includes('cancel') || normalized.includes('rejected') || normalized.includes('failed')) return 'badge bg-danger';
          return 'badge bg-secondary';
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
     currMonthOptions.reverse();
     // Previous month last 15 days (asc)
     const prevMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
     const prevMonthYear = prevMonth.getFullYear();
     const prevMonthNum = prevMonth.getMonth();
     const prevMonthDays = new Date(prevMonthYear, prevMonthNum + 1, 0).getDate();
     const prevMonthName = prevMonth.toLocaleString('default', { month: 'long' });
     const prevMonthOptions: React.ReactElement[] = [];
     for (let i = prevMonthDays - 14; i <= prevMonthDays; i++) {
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
          loadClients();
     }, [selectedDay, selectedStatus]);



     const openFolder = (patientid: number, billingid: number) => {
          if (!patientid || !billingid) return;
          window.open(`/operations/laboratory/v2/trial-interface/visit?patientid=${patientid}&billingid=${billingid}&&isOpenSideBarShow=false`, '_blank');
     }
     return (
          <div>
               <div className="d-flex align-items-center justify-content-between mb-2">
                    <h3 style={{ fontWeight: 700, fontSize: '1.5rem', margin: 0 }}>Request Client List</h3>
                    <div style={{ fontWeight: 700, fontSize: '1.25rem' }}>
                         Requests: {clients.length}
                    </div>
               </div>
               <div>
                    <strong>Today &rarr; {day} {month} {year} [{weekday}]</strong> <span style={{ marginLeft: 8 }}>(<b>{daysElapsed}</b> day{daysElapsed > 1 ? 's' : ''} elapsed)</span>
                    <div className="mt-2 d-flex align-items-center gap-3">
                         <div className="d-flex align-items-center">
                              <label className="me-2 mb-0">Day :</label>
                              <select value={selectedDay} onChange={(e) => setSelectedDay(e.target.value)}>
                                   <optgroup key="curr-month" label={`Current Month: ${today.toLocaleString('default', { month: 'long' })} ${today.getFullYear()}`}>
                                        {currMonthOptions}
                                   </optgroup>
                                   <optgroup key="prev-month" label={`Previous Month: ${prevMonthName} ${prevMonthYear}`}>
                                        {prevMonthOptions}
                                   </optgroup>
                              </select>
                         </div>
                         <div className="d-flex align-items-center">
                              <label className="me-2 mb-0">Status :</label>
                              <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
                                   <option value="pending">Pending</option>
                                   <option value="paid">Paid</option>
                                   <option value="partial">Partial</option>
                              </select>
                         </div>
                    </div>

                    <div className="mt-2 mb-2" style={{ fontWeight: 700, fontSize: '1.1rem' }}>
                         Date: {selectedDay} | Total Requests: {clients.length}
                    </div>
                    <div className="mt-4">
                         {loading ? (
                              <div className="text-center py-5">
                                   <div className="spinner-border text-primary" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                   </div>
                                   <p className="mt-2 mb-0">Loading client folder list...</p>
                              </div>
                         ) : error ? (
                              <div className="alert alert-danger" role="alert">
                                   {error}
                              </div>
                         ) : clients.length === 0 ? (
                              <div className="alert alert-secondary" role="alert">
                                   No records found for selected date and status.
                              </div>
                         ) : (
                              <table className="table table-bordered table-striped align-middle">
                                   <thead className="table-secondary">
                                        <tr>
                                             <th>Patient Details</th>
                                             <th>Request Time</th>
                                             <th>Tests</th>
                                             <th>Control</th>
                                        </tr>
                                   </thead>
                                   <tbody>
                                        {clients.map((client) => (
                                             <tr key={`${client.patientid}-${client.billingid}`}
                                                  className={client.payment_status && client.payment_status.toLowerCase() === 'pending' ? 'table-danger' : ''}>
                                                  <td style={{ minWidth: 240 }}>
                                                       <div><strong>{client.patient_details}</strong></div>
                                                       <div>ID: {client.patientid}</div>
                                                       <div>Billing: {client.billingid}</div>
                                                       <div>Billed: {new Date(client.billedon).toLocaleString()}</div>
                                                  </td>
                                                  <td>
                                                       <div>
                                                            <div>{new Date(client.ascension_date).toLocaleString()}</div>
                                                            <div style={{ fontWeight: 700, marginTop: 4 }}>{formatElapsed(client.ascension_date)}</div>
                                                       </div>
                                                  </td>
                                                  <td style={{ fontSize: '1rem', whiteSpace: 'pre-wrap', minWidth: 220 }}>
                                                       <div style={{ fontWeight: 700, marginBottom: 4 }}>Total tests: {client.total_tests}</div>
                                                       {client.tests_with_stage
                                                            .split(',')
                                                            .map((test) => test.trim())
                                                            .filter(Boolean)
                                                            .map((test, i) => {
                                                                 const match = test.match(/^(.*)\s*\((.*)\)$/);
                                                                 const name = match ? match[1] : test;
                                                                 const stage = match ? match[2] : 'unknown';
                                                                 const normalizedStage = stage.toLowerCase();
                                                                 let bgColor = '#f8f9fa';
                                                                 if (normalizedStage.includes('pending')) bgColor = '#fff3cd';
                                                                 else if (normalizedStage.includes('completed') || normalizedStage.includes('done') || normalizedStage.includes('paid')) bgColor = '#d1e7dd';
                                                                 else if (normalizedStage.includes('failed') || normalizedStage.includes('reject') || normalizedStage.includes('cancel')) bgColor = '#f8d7da';
                                                                 else if (normalizedStage.includes('partial')) bgColor = '#cff4fc';
                                                                 return (
                                                                      <div key={i} style={{ backgroundColor: bgColor, borderRadius: 4, padding: '4px 6px', marginBottom: 4, display: 'block', width: '100%' }}>
                                                                           <span style={{ fontWeight: 500 }}>{name}</span>
                                                                           <span style={{ fontWeight: 700, marginLeft: 6 }}>({stage})</span>
                                                                      </div>
                                                                 );
                                                            })}
                                                  </td>
                                                  <td>
                                                       <button onClick={(ev) => openFolder(client.patientid, client.billingid)} className="btn btn-sm btn-outline-primary">Open Folder</button>
                                                  </td>
                                             </tr>
                                        ))}
                                   </tbody>
                              </table>
                         )}
                    </div>
               </div>
          </div>
     );
}