'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { RiCloseCircleLine, RiClockwiseLine, RiTimeLine, RiCalendarEventLine, RiLoader4Line, RiArrowLeftLine, RiErrorWarningLine, RiEditLine, RiMapPinLine, RiFileTextLine, RiInformationLine, RiUserLine, RiCheckLine } from '@remixicon/react';
import { useApplicationSettings } from '../../../../../components/Auth/useApplicationContext';
import { formatDate } from '../../../../../components/operations/Laboratory/Lib';
import { customFetch } from '../../../../../components/Auth/customFetch';


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

const COLOR_ACCENT = 'oklch(0.646 0.222 41.116)';

export default function AttendanceDetailPage() {
     const params = useParams();
     const router = useRouter();
     const { applicationsettings } = useApplicationSettings();
     const { user } = applicationsettings || {};

     const [attendanceRecord, setAttendanceRecord] = useState<AttendanceRecord | null>(null);
     const [loading, setLoading] = useState(true);
     const [error, setError] = useState<string | null>(null);

     const attendanceId = params.id as string;

     const getStatusBadge = (status: string) => {
          const statusConfig = {
               present: { color: 'success', icon: RiCheckLine, label: 'Present' },
               absent: { color: 'danger', icon: RiCloseCircleLine, label: 'Absent' },
               late: { color: 'warning', icon: RiClockwiseLine, label: 'Late' },
               half_day: { color: 'info', icon: RiTimeLine, label: 'Half Day' },
               leave: { color: 'secondary', icon: RiCalendarEventLine, label: 'Leave' }
          };

          const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.present;
          const IconComponent = config.icon;

          return (
               <span className={`badge bg-${config.color} d-flex align-items-center gap-1 fs-6 px-3 py-2`}>
                    <IconComponent size={16} />
                    {config.label}
               </span>
          );
     };

     const formatTime = (time: string | null) => {
          if (!time) return 'Not recorded';
          return new Date(`1970-01-01T${time}`).toLocaleTimeString('en-GB', {
               hour: '2-digit',
               minute: '2-digit'
          });
     };

     const formatHours = (hours: number | null) => {
          if (hours === null) return 'Not calculated';
          return `${hours.toFixed(1)} hours`;
     };

     useEffect(() => {
          fetchAttendanceRecord();
     }, [attendanceId]);

     const fetchAttendanceRecord = async () => {
          setLoading(true);
          setError(null);

          try {
               // Note: This endpoint might need to be implemented in the backend
               // For now, we'll use a placeholder approach
               const response = await customFetch(`payroll/attendance/${attendanceId}`);

               if (response?.status === 'success' && response?.statusCode === 200) {
                    setAttendanceRecord(response.result);
               } else {
                    setError(response?.message || 'Failed to fetch attendance record');
               }
          } catch (err: any) {
               setError(err?.message || 'Error fetching attendance record');
          } finally {
               setLoading(false);
          }
     };

     if (loading) {
          return (
               <div className="container-fluid px-4 py-3">
                    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
                         <RiLoader4Line size={48} className="animate-spin me-3" style={{ color: COLOR_ACCENT }} />
                         <span>Loading attendance record...</span>
                    </div>
               </div>
          );
     }

     if (error || !attendanceRecord) {
          return (
               <div className="container-fluid px-4 py-3">
                    <div className="d-flex align-items-center mb-4">
                         <Link href="/human-resource/payroll/attendance" className="btn btn-outline-secondary btn-sm me-3">
                              <RiArrowLeftLine size={18} />
                         </Link>
                         <div className="d-flex align-items-center">
                              <RiCalendarEventLine size={28} style={{ color: COLOR_ACCENT }} className="me-2" />
                              <div>
                                   <h1 className="h4 mb-0 fw-bold">Attendance Details</h1>
                                   <p className="text-muted mb-0 small">View attendance record details</p>
                              </div>
                         </div>
                    </div>

                    <div className="d-flex flex-column justify-content-center align-items-center p-5 text-center">
                         <RiErrorWarningLine size={48} className="text-danger mb-3" />
                         <h5 className="fw-medium mb-1">Error Loading Attendance Record</h5>
                         <p className="text-muted mb-3">{error || 'Attendance record not found'}</p>
                         <Link href="/human-resource/payroll/attendance" className="btn btn-primary">
                              Back to Attendance List
                         </Link>
                    </div>
               </div>
          );
     }

     return (
          <div className="container-fluid px-4 py-3">
               {/* Header */}
               <div className="d-flex align-items-center justify-content-between mb-4">
                    <div className="d-flex align-items-center">
                         <Link href="/human-resource/payroll/attendance" className="btn btn-outline-secondary btn-sm me-3">
                              <RiArrowLeftLine size={18} />
                         </Link>
                         <div className="d-flex align-items-center">
                              <RiCalendarEventLine size={28} style={{ color: COLOR_ACCENT }} className="me-2" />
                              <div>
                                   <h1 className="h4 mb-0 fw-bold">Attendance Details</h1>
                                   <p className="text-muted mb-0 small">Record ID: {attendanceRecord.id}</p>
                              </div>
                         </div>
                    </div>
                    <Link
                         href={`/human-resource/payroll/attendance/${attendanceRecord.id}/edit`}
                         className="btn btn-primary d-flex align-items-center"
                    >
                         <RiEditLine size={18} className="me-2" />
                         Edit Record
                    </Link>
               </div>

               <div className="row">
                    <div className="col-lg-8">
                         {/* Attendance Status */}
                         <div className="border rounded p-4 mb-4" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                              <div className="d-flex justify-content-between align-items-start mb-3">
                                   <h5 className="fw-semibold mb-0">Attendance Status</h5>
                                   {getStatusBadge(attendanceRecord.status)}
                              </div>
                              <div className="row g-3">
                                   <div className="col-md-6">
                                        <div className="p-3 border rounded">
                                             <div className="small text-muted mb-1">Attendance Date</div>
                                             <div className="fw-semibold fs-5">{formatDate(attendanceRecord.attendance_date)}</div>
                                        </div>
                                   </div>
                                   <div className="col-md-6">
                                        <div className="p-3 border rounded">
                                             <div className="small text-muted mb-1">Total Hours</div>
                                             <div className="fw-semibold fs-5">{formatHours(attendanceRecord.total_hours)}</div>
                                        </div>
                                   </div>
                              </div>
                         </div>

                         {/* Time Tracking */}
                         <div className="border rounded p-4 mb-4" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                              <h5 className="fw-semibold mb-3 d-flex align-items-center">
                                   <RiTimeLine size={20} className="me-2" />
                                   Time Tracking
                              </h5>
                              <div className="row g-3">
                                   <div className="col-md-6">
                                        <div className="p-3 border rounded">
                                             <div className="small text-muted mb-1">Clock In</div>
                                             <div className="fw-semibold fs-5">{formatTime(attendanceRecord.clock_in)}</div>
                                        </div>
                                   </div>
                                   <div className="col-md-6">
                                        <div className="p-3 border rounded">
                                             <div className="small text-muted mb-1">Clock Out</div>
                                             <div className="fw-semibold fs-5">{formatTime(attendanceRecord.clock_out)}</div>
                                        </div>
                                   </div>
                                   {attendanceRecord.late_minutes && attendanceRecord.late_minutes > 0 && (
                                        <div className="col-md-6">
                                             <div className="p-3 border rounded">
                                                  <div className="small text-muted mb-1">Late Minutes</div>
                                                  <div className="fw-semibold fs-5 text-warning">{attendanceRecord.late_minutes} minutes</div>
                                             </div>
                                        </div>
                                   )}
                                   {attendanceRecord.overtime_hours && attendanceRecord.overtime_hours > 0 && (
                                        <div className="col-md-6">
                                             <div className="p-3 border rounded">
                                                  <div className="small text-muted mb-1">Overtime Hours</div>
                                                  <div className={`fw-semibold fs-5 ${attendanceRecord.overtime_approved ? 'text-success' : 'text-warning'}`}>
                                                       {attendanceRecord.overtime_hours.toFixed(1)} hours
                                                       {!attendanceRecord.overtime_approved && ' (Pending Approval)'}
                                                  </div>
                                             </div>
                                        </div>
                                   )}
                              </div>
                         </div>

                         {/* Work Details */}
                         <div className="border rounded p-4 mb-4" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                              <h5 className="fw-semibold mb-3 d-flex align-items-center">
                                   <RiMapPinLine size={20} className="me-2" />
                                   Work Details
                              </h5>
                              <div className="row g-3">
                                   <div className="col-md-6">
                                        <div className="p-3 border rounded">
                                             <div className="small text-muted mb-1">Shift Type</div>
                                             <div className="fw-semibold text-capitalize">{attendanceRecord.shift_type}</div>
                                        </div>
                                   </div>
                                   <div className="col-md-6">
                                        <div className="p-3 border rounded">
                                             <div className="small text-muted mb-1">Work Location</div>
                                             <div className="fw-semibold text-capitalize">{attendanceRecord.work_location.replace('-', ' ')}</div>
                                        </div>
                                   </div>
                              </div>
                         </div>

                         {/* Remarks */}
                         {attendanceRecord.remarks && (
                              <div className="border rounded p-4 mb-4" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                                   <h5 className="fw-semibold mb-3 d-flex align-items-center">
                                        <RiFileTextLine size={20} className="me-2" />
                                        Remarks
                                   </h5>
                                   <div className="p-3 border rounded bg-light">
                                        <p className="mb-0">{attendanceRecord.remarks}</p>
                                   </div>
                              </div>
                         )}

                         {/* Record Information */}
                         <div className="border rounded p-4 mb-4" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                              <h5 className="fw-semibold mb-3 d-flex align-items-center">
                                   <RiInformationLine size={20} className="me-2" />
                                   Record Information
                              </h5>
                              <div className="row g-3">
                                   <div className="col-md-6">
                                        <div className="p-3 border rounded">
                                             <div className="small text-muted mb-1">Record ID</div>
                                             <div className="fw-semibold">#{attendanceRecord.id}</div>
                                        </div>
                                   </div>
                                   <div className="col-md-6">
                                        <div className="p-3 border rounded">
                                             <div className="small text-muted mb-1">Created At</div>
                                             <div className="fw-semibold">{new Date(attendanceRecord.created_at).toLocaleString()}</div>
                                        </div>
                                   </div>
                              </div>
                         </div>
                    </div>

                    {/* Employee Summary Sidebar */}
                    <div className="col-lg-4">
                         <div className="border rounded p-4 sticky-top" style={{ backgroundColor: 'var(--bs-tertiary-bg)', top: '20px' }}>
                              <h5 className="fw-semibold mb-3 d-flex align-items-center">
                                   <RiUserLine size={20} className="me-2" />
                                   Employee Information
                              </h5>
                              <div className="mb-3">
                                   <div className="small text-muted mb-1">Employee Name</div>
                                   <div className="fw-semibold fs-5">{attendanceRecord.employee_name}</div>
                              </div>
                              <div className="mb-3">
                                   <div className="small text-muted mb-1">Employee ID</div>
                                   <div className="fw-medium">#{attendanceRecord.employeeid}</div>
                              </div>
                              <div className="mb-3">
                                   <div className="small text-muted mb-1">Role</div>
                                   <div className="fw-medium">{attendanceRecord.employee_role}</div>
                              </div>
                              <div className="mb-3">
                                   <div className="small text-muted mb-1">Email</div>
                                   <div className="fw-medium">{attendanceRecord.email}</div>
                              </div>
                              <div className="mb-3">
                                   <div className="small text-muted mb-1">Branch</div>
                                   <div className="fw-medium">{attendanceRecord.branch_name}</div>
                              </div>
                              <hr />
                              <div className="d-grid gap-2">
                                   <Link
                                        href={`/human-resource/payroll/attendance/${attendanceRecord.id}/edit`}
                                        className="btn btn-primary"
                                   >
                                        <RiEditLine size={18} className="me-2" />
                                        Edit Record
                                   </Link>
                                   <Link
                                        href={`/human-resource/payroll/employee/${attendanceRecord.employeeid}`}
                                        className="btn btn-outline-secondary"
                                   >
                                        View Employee Profile
                                   </Link>
                              </div>
                         </div>
                    </div>
               </div>
          </div>
     );
}