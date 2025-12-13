'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { RiLoader4Line, RiArrowLeftLine, RiCalendarEventLine, RiErrorWarningLine, RiUserLine, RiTimeLine, RiFileTextLine, RiSaveLine } from '@remixicon/react';
import { customPost,customFetch } from '../../../../../../components/Auth/customFetch';
import { useApplicationSettings } from '../../../../../../components/Auth/useApplicationContext';


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

export default function EditAttendancePage() {
     const params = useParams();
     const router = useRouter();
     const { applicationsettings } = useApplicationSettings();
     const { user } = applicationsettings || {};

     const [attendanceRecord, setAttendanceRecord] = useState<AttendanceRecord | null>(null);
     const [loading, setLoading] = useState(true);
     const [saving, setSaving] = useState(false);
     const [error, setError] = useState<string | null>(null);

     const [formData, setFormData] = useState({
          attendance_date: '',
          clock_in: '',
          clock_out: '',
          shift_type: 'regular',
          work_location: 'on-site',
          status: 'present',
          late_minutes: '',
          overtime_hours: '',
          overtime_approved: false,
          remarks: ''
     });

     const attendanceId = params.id as string;

     const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
          const { name, value, type } = e.target;
          const checked = (e.target as HTMLInputElement).checked;

          setFormData(prev => ({
               ...prev,
               [name]: type === 'checkbox' ? checked : value
          }));
     };

     useEffect(() => {
          fetchAttendanceRecord();
     }, [attendanceId]);

     const fetchAttendanceRecord = async () => {
          setLoading(true);
          setError(null);

          try {
               // Note: This endpoint might need to be implemented in the backend
               const response = await customFetch(`payroll/attendance/${attendanceId}`);

               if (response?.status === 'success' && response?.statusCode === 200) {
                    const record = response.result;
                    setAttendanceRecord(record);

                    // Populate form with existing data
                    setFormData({
                         attendance_date: record.attendance_date,
                         clock_in: record.clock_in || '',
                         clock_out: record.clock_out || '',
                         shift_type: record.shift_type,
                         work_location: record.work_location,
                         status: record.status,
                         late_minutes: record.late_minutes?.toString() || '',
                         overtime_hours: record.overtime_hours?.toString() || '',
                         overtime_approved: record.overtime_approved,
                         remarks: record.remarks || ''
                    });
               } else {
                    setError(response?.message || 'Failed to fetch attendance record');
               }
          } catch (err: any) {
               setError(err?.message || 'Error fetching attendance record');
          } finally {
               setLoading(false);
          }
     };

     const handleSubmit = async (e: React.FormEvent) => {
          e.preventDefault();

          if (!user?.employeeid) {
               alert('User information not available');
               return;
          }

          setSaving(true);

          try {
               const payload = {
                    attendance_date: formData.attendance_date,
                    clock_in: formData.clock_in || null,
                    clock_out: formData.clock_out || null,
                    shift_type: formData.shift_type,
                    work_location: formData.work_location,
                    status: formData.status,
                    late_minutes: formData.late_minutes ? parseInt(formData.late_minutes) : null,
                    overtime_hours: formData.overtime_hours ? parseFloat(formData.overtime_hours) : null,
                    overtime_approved: formData.overtime_approved,
                    remarks: formData.remarks || null
               };

               const response = await customPost(`payroll/attendance/${attendanceId}`, 'PUT', payload);

               if (response?.status === 'success') {
                    alert('Attendance record updated successfully');
                    router.push(`/human-resource/payroll/attendance/${attendanceId}`);
               } else {
                    alert(response?.message || 'Failed to update attendance record');
               }
          } catch (err: any) {
               alert(err?.message || 'Error updating attendance record');
          } finally {
               setSaving(false);
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
                                   <h1 className="h4 mb-0 fw-bold">Edit Attendance</h1>
                                   <p className="text-muted mb-0 small">Update attendance record</p>
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
               <div className="d-flex align-items-center mb-4">
                    <Link href={`/human-resource/payroll/attendance/${attendanceId}`} className="btn btn-outline-secondary btn-sm me-3">
                         <RiArrowLeftLine size={18} />
                    </Link>
                    <div className="d-flex align-items-center">
                         <RiCalendarEventLine size={28} style={{ color: COLOR_ACCENT }} className="me-2" />
                         <div>
                              <h1 className="h4 mb-0 fw-bold">Edit Attendance</h1>
                              <p className="text-muted mb-0 small">Update attendance record for {attendanceRecord.employee_name}</p>
                         </div>
                    </div>
               </div>

               {/* Form */}
               <form onSubmit={handleSubmit}>
                    <div className="row">
                         <div className="col-lg-8">
                              {/* Employee Information (Read-only) */}
                              <div className="border rounded p-4 mb-4" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                                   <h5 className="fw-semibold mb-3 d-flex align-items-center">
                                        <RiUserLine size={20} className="me-2" />
                                        Employee Information
                                   </h5>
                                   <div className="row g-3">
                                        <div className="col-md-6">
                                             <label className="form-label">Employee Name</label>
                                             <input
                                                  type="text"
                                                  className="form-control"
                                                  value={attendanceRecord.employee_name}
                                                  readOnly
                                             />
                                        </div>
                                        <div className="col-md-6">
                                             <label className="form-label">Employee ID</label>
                                             <input
                                                  type="text"
                                                  className="form-control"
                                                  value={`#${attendanceRecord.employeeid}`}
                                                  readOnly
                                             />
                                        </div>
                                        <div className="col-md-6">
                                             <label className="form-label">Role</label>
                                             <input
                                                  type="text"
                                                  className="form-control"
                                                  value={attendanceRecord.employee_role}
                                                  readOnly
                                             />
                                        </div>
                                        <div className="col-md-6">
                                             <label className="form-label">Branch</label>
                                             <input
                                                  type="text"
                                                  className="form-control"
                                                  value={attendanceRecord.branch_name}
                                                  readOnly
                                             />
                                        </div>
                                   </div>
                              </div>

                              {/* Attendance Details */}
                              <div className="border rounded p-4 mb-4" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                                   <h5 className="fw-semibold mb-3 d-flex align-items-center">
                                        <RiTimeLine size={20} className="me-2" />
                                        Attendance Details
                                   </h5>
                                   <div className="row g-3">
                                        <div className="col-md-6">
                                             <label className="form-label">Attendance Date <span className="text-danger">*</span></label>
                                             <input
                                                  type="date"
                                                  className="form-control"
                                                  name="attendance_date"
                                                  value={formData.attendance_date}
                                                  onChange={handleChange}
                                                  required
                                             />
                                        </div>
                                        <div className="col-md-6">
                                             <label className="form-label">Status <span className="text-danger">*</span></label>
                                             <select
                                                  className="form-select"
                                                  name="status"
                                                  value={formData.status}
                                                  onChange={handleChange}
                                                  required
                                             >
                                                  <option value="present">Present</option>
                                                  <option value="absent">Absent</option>
                                                  <option value="late">Late</option>
                                                  <option value="half_day">Half Day</option>
                                                  <option value="leave">Leave</option>
                                             </select>
                                        </div>
                                        <div className="col-md-6">
                                             <label className="form-label">Clock In</label>
                                             <input
                                                  type="time"
                                                  className="form-control"
                                                  name="clock_in"
                                                  value={formData.clock_in}
                                                  onChange={handleChange}
                                             />
                                        </div>
                                        <div className="col-md-6">
                                             <label className="form-label">Clock Out</label>
                                             <input
                                                  type="time"
                                                  className="form-control"
                                                  name="clock_out"
                                                  value={formData.clock_out}
                                                  onChange={handleChange}
                                             />
                                        </div>
                                        <div className="col-md-6">
                                             <label className="form-label">Shift Type</label>
                                             <select
                                                  className="form-select"
                                                  name="shift_type"
                                                  value={formData.shift_type}
                                                  onChange={handleChange}
                                             >
                                                  <option value="regular">Regular</option>
                                                  <option value="night">Night Shift</option>
                                                  <option value="weekend">Weekend</option>
                                                  <option value="holiday">Holiday</option>
                                             </select>
                                        </div>
                                        <div className="col-md-6">
                                             <label className="form-label">Work Location</label>
                                             <select
                                                  className="form-select"
                                                  name="work_location"
                                                  value={formData.work_location}
                                                  onChange={handleChange}
                                             >
                                                  <option value="on-site">On-site</option>
                                                  <option value="remote">Remote</option>
                                                  <option value="hybrid">Hybrid</option>
                                                  <option value="field">Field Work</option>
                                             </select>
                                        </div>
                                        {(formData.status === 'late' || formData.status === 'present') && (
                                             <div className="col-md-6">
                                                  <label className="form-label">Late Minutes</label>
                                                  <input
                                                       type="number"
                                                       className="form-control"
                                                       name="late_minutes"
                                                       value={formData.late_minutes}
                                                       onChange={handleChange}
                                                       min="0"
                                                       placeholder="Minutes late"
                                                  />
                                             </div>
                                        )}
                                        <div className="col-md-6">
                                             <label className="form-label">Overtime Hours</label>
                                             <input
                                                  type="number"
                                                  step="0.5"
                                                  className="form-control"
                                                  name="overtime_hours"
                                                  value={formData.overtime_hours}
                                                  onChange={handleChange}
                                                  min="0"
                                                  placeholder="Overtime hours"
                                             />
                                        </div>
                                        <div className="col-md-6">
                                             <div className="form-check mt-4">
                                                  <input
                                                       className="form-check-input"
                                                       type="checkbox"
                                                       name="overtime_approved"
                                                       checked={formData.overtime_approved}
                                                       onChange={handleChange}
                                                       id="overtime_approved"
                                                  />
                                                  <label className="form-check-label" htmlFor="overtime_approved">
                                                       Overtime Approved
                                                  </label>
                                             </div>
                                        </div>
                                   </div>
                              </div>

                              {/* Remarks */}
                              <div className="border rounded p-4 mb-4" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                                   <h5 className="fw-semibold mb-3 d-flex align-items-center">
                                        <RiFileTextLine size={20} className="me-2" />
                                        Additional Information
                                   </h5>
                                   <div>
                                        <label className="form-label">Remarks</label>
                                        <textarea
                                             className="form-control"
                                             name="remarks"
                                             rows={3}
                                             value={formData.remarks}
                                             onChange={handleChange}
                                             placeholder="Any additional notes or remarks..."
                                        ></textarea>
                                   </div>
                              </div>
                         </div>

                         {/* Summary Sidebar */}
                         <div className="col-lg-4">
                              <div className="border rounded p-4 sticky-top" style={{ backgroundColor: 'var(--bs-tertiary-bg)', top: '20px' }}>
                                   <h5 className="fw-semibold mb-3">Summary</h5>
                                   <div className="mb-3">
                                        <div className="small text-muted mb-1">Employee</div>
                                        <div className="fw-medium">{attendanceRecord.employee_name}</div>
                                        <div className="small text-muted mt-1">
                                             ID: {attendanceRecord.employeeid} • {attendanceRecord.employee_role}
                                        </div>
                                   </div>
                                   <div className="mb-3">
                                        <div className="small text-muted mb-1">Date</div>
                                        <div className="fw-medium">{new Date(formData.attendance_date).toLocaleDateString()}</div>
                                   </div>
                                   <div className="mb-3">
                                        <div className="small text-muted mb-1">Status</div>
                                        <div className="fw-medium text-capitalize">{formData.status.replace('_', ' ')}</div>
                                   </div>
                                   <div className="mb-3">
                                        <div className="small text-muted mb-1">Shift</div>
                                        <div className="fw-medium text-capitalize">{formData.shift_type}</div>
                                   </div>
                                   <div className="mb-3">
                                        <div className="small text-muted mb-1">Location</div>
                                        <div className="fw-medium text-capitalize">{formData.work_location.replace('-', ' ')}</div>
                                   </div>
                                   <hr />
                                   <div className="d-grid gap-2">
                                        <button
                                             type="submit"
                                             className="btn btn-primary"
                                             disabled={saving}
                                             style={{ backgroundColor: COLOR_ACCENT, borderColor: COLOR_ACCENT }}
                                        >
                                             {saving ? (
                                                  <>
                                                       <RiLoader4Line size={18} className="me-2 animate-spin" />
                                                       Updating...
                                                  </>
                                             ) : (
                                                  <>
                                                       <RiSaveLine size={18} className="me-2" />
                                                       Update Attendance
                                                  </>
                                             )}
                                        </button>
                                        <Link href={`/human-resource/payroll/attendance/${attendanceId}`} className="btn btn-outline-secondary">
                                             Cancel
                                        </Link>
                                   </div>
                              </div>
                         </div>
                    </div>
               </form>

               <style jsx global>{`
                .animate-spin {
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
          </div>
     );
}