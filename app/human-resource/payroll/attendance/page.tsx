'use client';
import screens from '../PayrollScreens.module.css';
import PayrollSummaryStrip from '../PayrollSummaryStrip';
import { attendanceHours } from '../../../../components/HR/Payroll/attendanceForm';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { customFetch } from '../../../../components/Auth/customFetch';
import { useApplicationSettings } from '../../../../components/Auth/useApplicationContext';
import { formatDate, getPaymentMethodLabel } from '../../../../components/HR/Payroll/utils';
import {
     RiCalendarEventLine,
     RiUserLine,
     RiTimeLine,
     RiSearchLine,
     RiFilterLine,
     RiAddLine,
     RiEyeLine,
     RiEditLine,
     RiLoader4Line,
     RiErrorWarningLine,
     RiCheckboxCircleLine,
     RiCloseCircleLine,
     RiClockwiseLine
} from '@remixicon/react';

interface AttendanceRecord {
     id: number;
     employeeid: number;
     attendance_date: string; // Full date string like "Mon Dec 15 2025 00:00:00 GMT+0000 (Coordinated Universal Time)"
     total_hours?: number;
     clock_in?: string; // Time string like "08:30:00" - optional field
     clock_out?: string; // Time string like "17:30:00" - optional field
     shift_type: string;
     work_location: string;
     status: 'present' | 'absent' | 'late' | 'half_day' | 'early_departure' | 'leave';
     late_minutes: number;
     overtime_hours: number; // Now a number instead of string
     overtime_approved: boolean; // Now boolean instead of number
     overtime_approved_by: number | null;
     remarks?: string; // Optional field
     created_at: string;
     updated_at: string;
     // Note: total_hours is not in the API response
}

interface AttendanceSummary {
     total_days: number;
     present_days: number;
     absent_days: number;
     half_days: number;
     late_days: number;
     total_hours: number;
     overtime_hours: number;
}

interface Employee {
     employeeid: number;
     username: string;
     role: string;
     email: string;
     branch: number;
     branchname: string;
     emailAuthenticated: string;
     activation: number;
}

const COLOR_ACCENT = 'var(--pls-primary, #2e7d32)';

export default function AttendancePage() {
     const { applicationsettings } = useApplicationSettings();
     const { user } = applicationsettings || {};

     const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
     const [employees, setEmployees] = useState<Employee[]>([]);
     const [employeesLoading, setEmployeesLoading] = useState(true);
     const [loading, setLoading] = useState(true);
     const [error, setError] = useState<string | null>(null);

     // Filters
     const [searchTerm, setSearchTerm] = useState('');
     const [statusFilter, setStatusFilter] = useState('');
     const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
     const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
     const [employeeFilter, setEmployeeFilter] = useState('');

     const getStatusBadge = (status: string) => {
          const statusConfig = {
               present: { color: 'success', icon: RiCheckboxCircleLine, label: 'Present' },
               absent: { color: 'danger', icon: RiCloseCircleLine, label: 'Absent' },
               late: { color: 'warning', icon: RiClockwiseLine, label: 'Late' },
               half_day: { color: 'info', icon: RiTimeLine, label: 'Half Day' },
               leave: { color: 'secondary', icon: RiCalendarEventLine, label: 'Leave' },
               early_departure: { color: 'warning', icon: RiTimeLine, label: 'Early departure' }
          };

          const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.present;
          const IconComponent = config.icon;

          return (
               <span className={`badge bg-${config.color} d-flex align-items-center gap-1`}>
                    <IconComponent size={12} />
                    {config.label}
               </span>
          );
     };

     const fetchAttendanceRecords = async () => {
          if (!startDate || !endDate || startDate > endDate) { setError('Choose a valid start and end date.'); return; }
          setLoading(true);
          setError(null);

          try {
               const params = new URLSearchParams({
                    startDate: startDate,
                    endDate: endDate
               });

               // Use employee-specific endpoint if employeeFilter is present
               const endpoint = employeeFilter
                    ? `payroll/attendance/employee/${employeeFilter}?${params}`
                    : `payroll/attendance?${params}`;

               const response = await customFetch(endpoint);

               if (response?.status === 'success' && response?.statusCode === 200) {
                    setAttendanceRecords(response.result || []);
               } else {
                    setError(response?.message || 'Failed to fetch attendance records');
                    setAttendanceRecords([]);
               }
          } catch (err: any) {
               setError(err?.message || 'Error fetching attendance records');
               setAttendanceRecords([]);
          } finally {
               setLoading(false);
          }
     };

     const fetchEmployees = async () => {
          setEmployeesLoading(true);
          try {
               const response = await customFetch('logins');
               if (response?.status === 'success' && response?.statusCode === 200) {
                    setEmployees(response.result || []);
               }
          } catch (error) {
               console.error('Error fetching employees:', error);
               setEmployees([]);
          } finally {
               setEmployeesLoading(false);
          }
     };

     useEffect(() => {
          fetchAttendanceRecords();
          fetchEmployees();
     }, []);

     const handleLoadData = () => { void fetchAttendanceRecords(); };

     const filteredRecords = attendanceRecords.filter(record => {
          const matchesSearch = !searchTerm ||
               record.employeeid.toString().includes(searchTerm.toLowerCase()) ||
               (employees.find(employee => employee.employeeid === record.employeeid)?.username || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
               record.shift_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
               record.work_location.toLowerCase().includes(searchTerm.toLowerCase()) ||
               (record.remarks && record.remarks.toLowerCase().includes(searchTerm.toLowerCase()));

          const matchesStatus = !statusFilter || record.status === statusFilter;

          return matchesSearch && matchesStatus;
     });

     const formatTime = (time?: string) => {
          if (!time) return '—';
          try {
               // Handle HH:MM:SS format
               return new Date(`1970-01-01T${time}`).toLocaleTimeString('en-GB', {
                    hour: '2-digit',
                    minute: '2-digit'
               });
          } catch {
               return time; // fallback to original value
          }
     };

     const formatHours = (hours: number | null) => {
          if (hours === null) return '-';
          return `${hours.toFixed(1)}h`;
     };

     const recordHours = (record: AttendanceRecord) => {
          if (record.total_hours != null && Number.isFinite(Number(record.total_hours))) return Number(record.total_hours);
          try { return attendanceHours(record.clock_in, record.clock_out, record.shift_type === 'night') ?? null; } catch { return null; }
     };
     const summary = { total_days: filteredRecords.length, present_days: filteredRecords.filter(row=>row.status==='present').length,
          absent_days: filteredRecords.filter(row=>row.status==='absent').length,
          overtime_hours: filteredRecords.reduce((sum,row)=>sum+(row.overtime_approved ? Number(row.overtime_hours)||0 : 0),0) };

     return (
          <div className={screens.page}>
               {/* Header */}
               <div className={screens.header}>
                    <div className="d-flex align-items-center">
                         <RiCalendarEventLine size={28} style={{ color: COLOR_ACCENT }} className="me-2" />
                         <div>
                              <span className={screens.eyebrow}>Payroll / Attendance</span>
<h1 className={screens.title}>Attendance Management</h1>
                              <p className="text-muted mb-0 small">Track and manage employee attendance records</p>
                         </div>
                    </div>
                    <Link href="/human-resource/payroll/attendance/create" className="btn btn-primary d-flex align-items-center">
                         <RiAddLine size={18} className="me-2" />
                         Record Attendance
                    </Link>
               </div>

               <PayrollSummaryStrip label="Attendance in the visible records" items={[{label:'Attendance records',value:summary.total_days},{label:'Present',value:summary.present_days,tone:'success'},{label:'Absent',value:summary.absent_days,tone:'danger'},{label:'Approved overtime',value:`${summary.overtime_hours.toFixed(1)}h`}]}/>

               <section className={screens.panel} aria-label="Attendance filters">
                    <div className={screens.attendanceFilters}>
                         <label className="form-label">Search<input type="search" className="form-control mt-2" aria-label="Search attendance" placeholder="Employee name, ID or notes" value={searchTerm} onChange={event=>setSearchTerm(event.target.value)}/></label>
                         <label className="form-label">Employee<select className="form-select mt-2" aria-label="Attendance employee" value={employeeFilter} onChange={event=>setEmployeeFilter(event.target.value)} disabled={employeesLoading}><option value="">All employees</option>{employees.map(employee=><option key={employee.employeeid} value={employee.employeeid}>{employee.username} · #{employee.employeeid}</option>)}</select></label>
                         <label className="form-label">Status<select className="form-select mt-2" aria-label="Attendance status" value={statusFilter} onChange={event=>setStatusFilter(event.target.value)}><option value="">All statuses</option><option value="present">Present</option><option value="absent">Absent</option><option value="late">Late</option><option value="half_day">Half day</option><option value="early_departure">Early departure</option><option value="leave">Leave (legacy records)</option></select></label>
                         <label className="form-label">From<input type="date" className="form-control mt-2" aria-label="Attendance start date" value={startDate} max={endDate} onChange={event=>setStartDate(event.target.value)}/></label>
                         <label className="form-label">To<input type="date" className="form-control mt-2" aria-label="Attendance end date" value={endDate} min={startDate} onChange={event=>setEndDate(event.target.value)}/></label>
                    </div>
                    <div className={screens.filterActions}><span className="small text-muted">Apply the date and employee selection to load records. Search and status filter the loaded records.</span><div className="d-flex gap-2"><button type="button" className="btn btn-outline-secondary" disabled={loading} onClick={()=>{const today=new Date().toISOString().split('T')[0];setStartDate(today);setEndDate(today);setEmployeeFilter('');setStatusFilter('');setSearchTerm('');}}>Reset filters</button><button type="button" className="btn btn-primary" onClick={handleLoadData} disabled={loading}>{loading ? 'Loading…' : 'Apply filters'}</button></div></div>
               </section>

               {/* Attendance Records Table */}
               <div className="border rounded" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                    <div className="p-3 border-bottom">
                         <h5 className="mb-0 fw-semibold">Attendance Records</h5>
                         <small className="text-muted">Showing {filteredRecords.length} records</small>
                    </div>

                    {loading ? (
                         <div className="d-flex justify-content-center align-items-center p-5">
                              <RiLoader4Line size={48} className="animate-spin me-3" style={{ color: COLOR_ACCENT }} />
                              <span>Loading attendance records...</span>
                         </div>
                    ) : error ? (
                         <div className="d-flex flex-column justify-content-center align-items-center p-5 text-center">
                              <RiErrorWarningLine size={48} className="text-danger mb-3" />
                              <h5 className="fw-medium mb-1">Error Loading Data</h5>
                              <p className="text-muted mb-0">{error}</p>
                         </div>
                    ) : filteredRecords.length === 0 ? (
                         <div className="d-flex flex-column justify-content-center align-items-center p-5 text-center">
                              <RiCalendarEventLine size={48} className="text-muted mb-3" />
                              <h5 className="fw-medium mb-1">No Attendance Records</h5>
                              <p className="text-muted mb-0">No attendance records found for the selected filters.</p>
                         </div>
                    ) : (
                         <div className={screens.tableWrap}>
                              <table className={screens.table}>
                                   <thead className="table-light">
                                        <tr>
                                             <th className="border-0">Employee</th>
                                             <th className="border-0">Date</th>
                                             <th className="border-0">Clock In</th>
                                             <th className="border-0">Clock Out</th>
                                             <th className="border-0">Total Hours</th>
                                             <th className="border-0">Status</th>
                                             <th className="border-0">Late (min)</th>
                                             <th className="border-0">Overtime</th>
                                             <th className="border-0">Actions</th>
                                        </tr>
                                   </thead>
                                   <tbody>
                                        {filteredRecords.map((record) => (
                                             <tr key={record.id}>
                                                  <td>
                                                       <div>
                                                            <div className="fw-semibold">{employees.find(employee => Number(employee.employeeid) === Number(record.employeeid))?.username || `Employee ${record.employeeid}`}</div>
                                                            <small className="text-muted">
                                                                 ID: {record.employeeid}
                                                            </small>
                                                            <div className="small text-muted">Location: {record.work_location}</div>
                                                       </div>
                                                  </td>
                                                  <td>{formatDate(record.attendance_date)}</td>
                                                  <td>{formatTime(record.clock_in)}</td>
                                                  <td>{formatTime(record.clock_out)}</td>
                                                  <td>{formatHours(recordHours(record))}</td>
                                                  <td>{getStatusBadge(record.status)}</td>
                                                  <td>{record.late_minutes || '-'}</td>
                                                  <td>
                                                       {record.overtime_hours > 0 ? (
                                                            <span className={record.overtime_approved ? 'text-success' : 'text-warning'}>
                                                                 {(Number(record.overtime_hours)||0).toFixed(1)}h
                                                                 {!record.overtime_approved && ' (Pending)'}
                                                            </span>
                                                       ) : '-'}
                                                  </td>
                                                  <td>
                                                       <div className="d-flex gap-1">
                                                            <Link
                                                                 href={`/human-resource/payroll/attendance/${record.id}`}
                                                                 className="btn btn-sm btn-outline-primary"
                                                                 title="View Details"
                                                            >
                                                                 <RiEyeLine size={14} />
                                                            </Link>
                                                            <Link
                                                                 href={`/human-resource/payroll/attendance/${record.id}/edit`}
                                                                 className="btn btn-sm btn-outline-secondary"
                                                                 title="Edit Record"
                                                            >
                                                                 <RiEditLine size={14} />
                                                            </Link>
                                                       </div>
                                                  </td>
                                             </tr>
                                        ))}
                                   </tbody>
                              </table>
                         </div>
                    )}
               </div>
          </div>
     );
}