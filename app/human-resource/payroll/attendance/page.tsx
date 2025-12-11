'use client';

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
     attendance_date: string;
     clock_in: string | null;
     clock_out: string | null;
     total_hours: number | null;
     shift_type: string;
     work_location: string;
     status: 'present' | 'absent' | 'late' | 'half_day' | 'leave';
     late_minutes: number | null;
     overtime_hours: number | null;
     overtime_approved: boolean;
     remarks: string | null;
     employee_name: string;
     employee_role: string;
     email: string;
     branch_name: string;
     created_at: string;
}

interface AttendanceSummary {
     month: number;
     year: number;
     total_employees: number;
     present_days: number;
     absent_days: number;
     late_days: number;
     half_days: number;
     total_overtime_hours: number;
     average_attendance: number;
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

const COLOR_ACCENT = 'oklch(0.646 0.222 41.116)';

export default function AttendancePage() {
     const { applicationsettings } = useApplicationSettings();
     const { user } = applicationsettings || {};

     const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
     const [summary, setSummary] = useState<AttendanceSummary | null>(null);
     const [employees, setEmployees] = useState<Employee[]>([]);
     const [employeesLoading, setEmployeesLoading] = useState(true);
     const [loading, setLoading] = useState(true);
     const [error, setError] = useState<string | null>(null);

     // Filters
     const [searchTerm, setSearchTerm] = useState('');
     const [statusFilter, setStatusFilter] = useState('');
     const [monthFilter, setMonthFilter] = useState(new Date().getMonth() + 1);
     const [yearFilter, setYearFilter] = useState(new Date().getFullYear());
     const [employeeFilter, setEmployeeFilter] = useState('');

     const getStatusBadge = (status: string) => {
          const statusConfig = {
               present: { color: 'success', icon: RiCheckboxCircleLine, label: 'Present' },
               absent: { color: 'danger', icon: RiCloseCircleLine, label: 'Absent' },
               late: { color: 'warning', icon: RiClockwiseLine, label: 'Late' },
               half_day: { color: 'info', icon: RiTimeLine, label: 'Half Day' },
               leave: { color: 'secondary', icon: RiCalendarEventLine, label: 'Leave' }
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
          setLoading(true);
          setError(null);

          try {
               const params = new URLSearchParams({
                    month: monthFilter.toString(),
                    year: yearFilter.toString()
               });

               if (employeeFilter) params.append('employeeId', employeeFilter);

               const response = await customFetch(`payroll/attendance?${params}`);

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

     const fetchAttendanceSummary = async () => {
          try {
               const response = await customFetch(`payroll/attendance/summary?month=${monthFilter}&year=${yearFilter}`);

               if (response?.status === 'success' && response?.statusCode === 200) {
                    setSummary(response.result);
               }
          } catch (err) {
               console.error('Error fetching attendance summary:', err);
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
          fetchAttendanceSummary();
          fetchEmployees();
     }, []);

     useEffect(() => {
          fetchAttendanceRecords();
          fetchAttendanceSummary();
     }, [monthFilter, yearFilter, employeeFilter]);

     const filteredRecords = attendanceRecords.filter(record => {
          const matchesSearch = !searchTerm ||
               record.employee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
               record.employee_role.toLowerCase().includes(searchTerm.toLowerCase()) ||
               record.branch_name.toLowerCase().includes(searchTerm.toLowerCase());

          const matchesStatus = !statusFilter || record.status === statusFilter;

          return matchesSearch && matchesStatus;
     });

     const formatTime = (time: string | null) => {
          if (!time) return '-';
          return new Date(`1970-01-01T${time}`).toLocaleTimeString('en-GB', {
               hour: '2-digit',
               minute: '2-digit'
          });
     };

     const formatHours = (hours: number | null) => {
          if (hours === null) return '-';
          return `${hours.toFixed(1)}h`;
     };

     return (
          <div className="container-fluid px-4 py-3">
               {/* Header */}
               <div className="d-flex align-items-center justify-content-between mb-4">
                    <div className="d-flex align-items-center">
                         <RiCalendarEventLine size={28} style={{ color: COLOR_ACCENT }} className="me-2" />
                         <div>
                              <h1 className="h4 mb-0 fw-bold">Attendance Management</h1>
                              <p className="text-muted mb-0 small">Track and manage employee attendance records</p>
                         </div>
                    </div>
                    <Link href="/human-resource/payroll/attendance/create" className="btn btn-primary d-flex align-items-center">
                         <RiAddLine size={18} className="me-2" />
                         Record Attendance
                    </Link>
               </div>

               {/* Summary Cards */}
               {summary && (
                    <div className="row g-3 mb-4">
                         <div className="col-md-3">
                              <div className="border rounded p-3" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                                   <div className="d-flex align-items-center">
                                        <RiUserLine size={24} style={{ color: COLOR_ACCENT }} className="me-3" />
                                        <div>
                                             <div className="fw-semibold">{summary.total_employees}</div>
                                             <div className="small text-muted">Total Employees</div>
                                        </div>
                                   </div>
                              </div>
                         </div>
                         <div className="col-md-3">
                              <div className="border rounded p-3" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                                   <div className="d-flex align-items-center">
                                        <RiCheckboxCircleLine size={24} className="text-success me-3" />
                                        <div>
                                             <div className="fw-semibold">{summary.present_days}</div>
                                             <div className="small text-muted">Present Days</div>
                                        </div>
                                   </div>
                              </div>
                         </div>
                         <div className="col-md-3">
                              <div className="border rounded p-3" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                                   <div className="d-flex align-items-center">
                                        <RiCloseCircleLine size={24} className="text-danger me-3" />
                                        <div>
                                             <div className="fw-semibold">{summary.absent_days}</div>
                                             <div className="small text-muted">Absent Days</div>
                                        </div>
                                   </div>
                              </div>
                         </div>
                         <div className="col-md-3">
                              <div className="border rounded p-3" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                                   <div className="d-flex align-items-center">
                                        <RiTimeLine size={24} className="text-info me-3" />
                                        <div>
                                             <div className="fw-semibold">{summary.average_attendance.toFixed(1)}%</div>
                                             <div className="small text-muted">Avg Attendance</div>
                                        </div>
                                   </div>
                              </div>
                         </div>
                    </div>
               )}

               {/* Filters */}
               <div className="border rounded p-3 mb-4" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                    <div className="row g-3">
                         <div className="col-md-3">
                              <label className="form-label">Search</label>
                              <div className="input-group">
                                   <span className="input-group-text">
                                        <RiSearchLine size={16} />
                                   </span>
                                   <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Search by name, role, or branch..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                   />
                              </div>
                         </div>
                         <div className="col-md-2">
                              <label className="form-label">Status</label>
                              <select
                                   className="form-select"
                                   value={statusFilter}
                                   onChange={(e) => setStatusFilter(e.target.value)}
                              >
                                   <option value="">All Status</option>
                                   <option value="present">Present</option>
                                   <option value="absent">Absent</option>
                                   <option value="late">Late</option>
                                   <option value="half_day">Half Day</option>
                                   <option value="leave">Leave</option>
                              </select>
                         </div>
                         <div className="col-md-2">
                              <label className="form-label">Month</label>
                              <select
                                   className="form-select"
                                   value={monthFilter}
                                   onChange={(e) => setMonthFilter(parseInt(e.target.value))}
                              >
                                   {Array.from({ length: 12 }, (_, i) => (
                                        <option key={i + 1} value={i + 1}>
                                             {new Date(2024, i).toLocaleString('default', { month: 'long' })}
                                        </option>
                                   ))}
                              </select>
                         </div>
                         <div className="col-md-2">
                              <label className="form-label">Year</label>
                              <select
                                   className="form-select"
                                   value={yearFilter}
                                   onChange={(e) => setYearFilter(parseInt(e.target.value))}
                              >
                                   {Array.from({ length: 5 }, (_, i) => (
                                        <option key={2024 - i} value={2024 - i}>{2024 - i}</option>
                                   ))}
                              </select>
                         </div>
                         <div className="col-md-3">
                              <label className="form-label">Employee</label>
                              <select
                                   className="form-select"
                                   value={employeeFilter}
                                   onChange={(e) => setEmployeeFilter(e.target.value)}
                                   disabled={employeesLoading}
                              >
                                   <option value="">
                                        {employeesLoading ? 'Loading employees...' : 'All Employees'}
                                   </option>
                                   {employees.map((employee) => (
                                        <option key={employee.employeeid} value={employee.employeeid}>
                                             {employee.username} (ID: {employee.employeeid}) - {employee.role}
                                        </option>
                                   ))}
                              </select>
                         </div>
                    </div>
               </div>

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
                         <div className="table-responsive">
                              <table className="table table-hover table-striped mb-0">
                                   <thead className="table-light">
                                        <tr>
                                             <th className="border-0">Employee</th>
                                             <th className="border-0">Date</th>
                                             <th className="border-0">Clock In</th>
                                             <th className="border-0">Clock Out</th>
                                             <th className="border-0">Hours</th>
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
                                                            <div className="fw-semibold">{record.employee_name}</div>
                                                            <small className="text-muted">
                                                                 ID: {record.employeeid} • {record.employee_role}
                                                            </small>
                                                            <div className="small text-muted">{record.branch_name}</div>
                                                       </div>
                                                  </td>
                                                  <td>{formatDate(record.attendance_date)}</td>
                                                  <td>{formatTime(record.clock_in)}</td>
                                                  <td>{formatTime(record.clock_out)}</td>
                                                  <td>{formatHours(record.total_hours)}</td>
                                                  <td>{getStatusBadge(record.status)}</td>
                                                  <td>{record.late_minutes || '-'}</td>
                                                  <td>
                                                       {record.overtime_hours ? (
                                                            <span className={record.overtime_approved ? 'text-success' : 'text-warning'}>
                                                                 {record.overtime_hours.toFixed(1)}h
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