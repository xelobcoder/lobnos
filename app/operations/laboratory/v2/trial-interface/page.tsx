'use client';
import * as React from 'react';
import { customFetch } from '../../../../../components/Auth/customFetch';

export default function LaboratoryClientList() {
     const [selectedDay, setSelectedDay] = React.useState(new Date().getDate().toString());
     const [selectedStatus, setSelectedStatus] = React.useState('');



     const loadClients = async () => {
          if (!selectedDay) {
               alert('Please select a day to load clients.');
               return;
          }


          const response = await customFetch(`operations/overview/folder?date=${selectedDay}&status=${selectedStatus}`);
          console.log('Loaded clients for', selectedDay, 'with status', selectedStatus, ':', response);
     }

     const today = new Date();
     const daysElapsed = today.getDate();
     const day = today.getDate();
     const month = today.toLocaleString('default', { month: 'long' });
     const year = today.getFullYear();
     const weekday = today.toLocaleString('default', { weekday: 'short' });

     // Current month days up to today (asc)
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

     return (
          <div>
               <h4>Request Client List</h4>
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

                    {/* Dummy clients table */}
                    <div className="mt-4">
                         <table className="table table-bordered table-striped align-middle">
                              <thead className="table-light">
                                   <tr>
                                        <th>Patient Details</th>
                                        <th>Tests</th>
                                        <th>Summary</th>
                                        <th>Control</th>
                                   </tr>
                              </thead>
                              <tbody>
                                   {Array.from({ length: 10 }).map((_, idx) => (
                                        <tr key={idx}>
                                             <td>
                                                  <div><b>Name:</b> Dummy Patient {idx + 1}</div>
                                                  <div><b>ID:</b> P00{idx + 1}</div>
                                                  <div><b>Age:</b> {20 + idx}</div>
                                             </td>
                                             <td>
                                                  <ul className="mb-0 ps-3">
                                                       <li>Test A</li>
                                                       <li>Test B</li>
                                                  </ul>
                                             </td>
                                             <td>
                                                  <div>Sample summary for patient {idx + 1}.</div>
                                             </td>
                                             <td>
                                                  <button className="btn btn-sm btn-outline-primary">Open Folder</button>
                                             </td>
                                        </tr>
                                   ))}
                              </tbody>
                         </table>
                    </div>
               </div>
          </div>
     );
}