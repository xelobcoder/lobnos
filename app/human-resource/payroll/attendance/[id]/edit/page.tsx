'use client';
import EmployeeSearchSelect from '../../../../../../components/HR/Payroll/EmployeeSearchSelect';
import PayrollFormFrame from '../../../PayrollFormFrame';
import { attendancePayload, attendanceHours } from '../../../../../../components/HR/Payroll/attendanceForm';
import screens from '../../../PayrollScreens.module.css';
import { usePayrollFeedback } from '../../../../../../components/HR/Payroll/usePayrollFeedback';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { RiLoader4Line, RiArrowLeftLine, RiCalendarEventLine, RiErrorWarningLine, RiUserLine, RiTimeLine, RiFileTextLine, RiSaveLine } from '@remixicon/react';
import { customPost, customFetch } from '../../../../../../components/Auth/customFetch';
import { useApplicationSettings } from '../../../../../../components/Auth/useApplicationContext';


interface AttendanceRecord {
     id: number;
     employeeid: number;
     attendance_date: string;
     clock_in?: string;
     clock_out?: string;
     shift_type: string;
     work_location: string;
     status: 'present' | 'absent' | 'late' | 'half_day' | 'early_departure';
     late_minutes: number;
     overtime_hours: number;
     overtime_approved: boolean;
     overtime_approved_by: number | null;
     remarks?: string;
     created_at: string;
     updated_at: string;
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

export default function EditAttendancePage() {
     const { notify, feedback } = usePayrollFeedback();
     const params = useParams();
     const router = useRouter();
     const { applicationsettings } = useApplicationSettings();
     const { user } = applicationsettings || {};

     const [attendanceRecord, setAttendanceRecord] = useState<AttendanceRecord | null>(null);
     const [employees, setEmployees] = useState<Employee[]>([]);
     const [employeesLoading, setEmployeesLoading] = useState(true);
     const [loading, setLoading] = useState(true);
     const [saving, setSaving] = useState(false);
     const [error, setError] = useState<string | null>(null);

     const [formData, setFormData] = useState({
          employeeid: '',
          attendance_date: '',
          clock_in: '',
          clock_out: '',
          shift_type: 'regular',
          work_location: 'on-site',
          status: 'present',
          late_minutes: '',
          overtime_hours: '',
          overtime_approved: false,
          overtime_approved_by: '',
          remarks: ''
     });

     const attendanceId = params?.id as string;

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
          fetchEmployees();
     }, [attendanceId]);

     const fetchAttendanceRecord = async () => {
          setLoading(true);
          setError(null);

          try {
               const response = await customFetch(`payroll/attendance/${attendanceId}`);

               if (response?.status === 'success' && response?.statusCode === 200) {
                    const record = response.result;
                    setAttendanceRecord(record);

                    // Populate form with existing data
                    setFormData({
                         employeeid: record.employeeid.toString(),
                         attendance_date: record.attendance_date ? new Date(record.attendance_date).toISOString().split('T')[0] : '',
                         clock_in: record.clock_in || '',
                         clock_out: record.clock_out || '',
                         shift_type: record.shift_type,
                         work_location: record.work_location,
                         status: record.status,
                         late_minutes: record.late_minutes?.toString() || '',
                         overtime_hours: record.overtime_hours?.toString() || '',
                         overtime_approved: record.overtime_approved,
                         overtime_approved_by: record.overtime_approved_by?.toString() || '',
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

     const handleSubmit = async (e: React.FormEvent) => {
          e.preventDefault();

          if (!user?.employeeid) {
               notify('User information not available');
               return;
          }

          if (formData.overtime_approved && !formData.overtime_approved_by) {
               notify('Please select an overtime approver when overtime is approved');
               return;
          }

          setSaving(true);

          try {
               const payload = attendancePayload(formData);

               const response = await customPost(`payroll/attendance/${attendanceId}`, 'PUT', payload);

               if (response?.status === 'success') {
                    notify('Attendance record updated successfully', 'success');
                    router.push(`/human-resource/payroll/attendance/${attendanceId}`);
               } else {
                    notify(response?.message || 'Failed to update attendance record');
               }
          } catch (err: any) {
               notify(err?.message || 'Error updating attendance record');
          } finally {
               setSaving(false);
          }
     };

     if (loading) {
          return (
               <div className={screens.page}>
               {feedback}
                    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
                         <RiLoader4Line size={48} className="animate-spin me-3" style={{ color: COLOR_ACCENT }} />
                         <span>Loading attendance record...</span>
                    </div>
               </div>
          );
     }

     if (error || !attendanceRecord) {
          return (
               <div className={screens.page}>
               {feedback}
                    <div className={screens.header}>
                         <Link href="/human-resource/payroll/attendance" className="btn btn-outline-secondary btn-sm me-3">
                              <RiArrowLeftLine size={18} />
                         </Link>
                         <div className="d-flex align-items-center">
                              
                              <div>
                                   <span className={screens.eyebrow}>Payroll / Attendance</span>
<h1 className={screens.title}>Edit Attendance</h1>
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
          <PayrollFormFrame busy={loading || saving} className={screens.page}>
               {feedback}
               {/* Header */}
               <div className={screens.header}>
                    <Link href={`/human-resource/payroll/attendance/${attendanceId}`} className="btn btn-outline-secondary btn-sm me-3">
                         <RiArrowLeftLine size={18} />
                    </Link>
                    <div className="d-flex align-items-center">
                         
                         <div>
                              <span className={screens.eyebrow}>Payroll / Attendance</span>
<h1 className={screens.title}>Edit Attendance</h1>
                              <p className="text-muted mb-0 small">Update attendance record</p>
                         </div>
                    </div>
               </div>

               {/* Form */}
               <form onSubmit={handleSubmit}>
<fieldset disabled={loading || saving} className={screens.formFields}><p className={screens.formHint}>Fields marked * are required. Review the details before saving.</p>
                    <div className={screens.editorGrid}>
                         <div className={screens.editorMain}>
                              {/* Employee Information */}
                              <div className={screens.formSection} style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                                   <h5 className="fw-semibold mb-3 d-flex align-items-center">
                                        <RiUserLine size={20} className="me-2" />
                                        Employee Information
                                   </h5>
                                   <div className="row g-3">
                                        <div className="col-md-12">
                                             <label className="form-label">Employee <span className="text-danger">*</span></label>
                                             <EmployeeSearchSelect employees={employees} aria-label="Employee"
                                                  className="form-select"
                                                  name="employeeid"
                                                  value={formData.employeeid}
                                                  onChange={handleChange}
                                                  required
                                                  disabled={employeesLoading || !!formData.employeeid}
                                             />
                                        </div>
                                   </div>
                              </div>

                              {/* Attendance Details */}
                              <div className={screens.formSection} style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                                   <h5 className="fw-semibold mb-3 d-flex align-items-center">
                                        <RiTimeLine size={20} className="me-2" />
                                        Attendance Details
                                   </h5>
                                   <div className="row g-3">
                                        <div className="col-md-6">
                                             <label className="form-label">Attendance Date <span className="text-danger">*</span></label>
                                             <input aria-label="Attendance Date"
                                                  type="date"
                                                  className="form-control"
                                                  name="attendance_date"
                                                  value={formData.attendance_date}
                                                  onChange={handleChange}
                                                  required
                                                  disabled={!!formData.attendance_date}
                                             />
                                        </div>
                                        <div className="col-md-6">
                                             <label className="form-label">Status <span className="text-danger">*</span></label>
                                             <select aria-label="Status"
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
                                                  <option value="early_departure">Early departure</option>
                                             </select>
                                        </div>
                                        <div className="col-md-6">
                                             <label className="form-label">Clock In</label>
                                             <input aria-label="Clock In"
                                                  type="time"
                                                  className="form-control"
                                                  name="clock_in" disabled={formData.status === 'absent'}
                                                  value={formData.clock_in}
                                                  onChange={handleChange}
                                             />
                                        </div>
                                        <div className="col-md-6">
                                             <label className="form-label">Clock Out</label>
                                             <input aria-label="Clock Out"
                                                  type="time"
                                                  className="form-control"
                                                  name="clock_out" disabled={formData.status === 'absent'}
                                                  value={formData.clock_out}
                                                  onChange={handleChange}
                                             />
                                        </div>
                                        <div className="col-md-6">
                                             <label className="form-label">Shift Type</label>
                                             <select aria-label="Shift Type"
                                                  className="form-select"
                                                  name="shift_type"
                                                  value={formData.shift_type}
                                                  onChange={handleChange}
                                             >
                                                  <option value="regular">Regular</option>
                                                  <option value="night">Night shift (can finish next day)</option>
                                                  <option value="weekend">Weekend</option>
                                                  <option value="holiday">Holiday</option>
                                             </select>
                                        </div>
                                        <div className="col-md-6">
                                             <label className="form-label">Work Location</label>
                                             <select aria-label="Work Location"
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
                                                  <input aria-label="Late Minutes"
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
                                             <input aria-label="Overtime Hours"
                                                  type="number"
                                                  step="0.5"
                                                  className="form-control"
                                                  name="overtime_hours" disabled={formData.status === 'absent'}
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
                                                       name="overtime_approved" disabled={formData.status === 'absent'}
                                                       checked={formData.overtime_approved}
                                                       onChange={handleChange}
                                                       id="overtime_approved"
                                                  />
                                                  <label className="form-check-label" htmlFor="overtime_approved">
                                                       Overtime Approved
                                                  </label>
                                             </div>
                                        </div>
                                        {formData.overtime_approved && formData.status !== 'absent' && (
                                             <div className="col-md-6">
                                                  <label className="form-label">Overtime Approved By <span className="text-danger">*</span></label>
                                                  <select aria-label="Overtime Approved By"
                                                       className="form-select"
                                                       name="overtime_approved_by"
                                                       value={formData.overtime_approved_by}
                                                       onChange={handleChange}
                                                       required={formData.overtime_approved}
                                                  >
                                                       <option value="">Select approver</option>
                                                       {employees.map((employee) => (
                                                            <option key={employee.employeeid} value={employee.employeeid}>
                                                                 {employee.username} (ID: {employee.employeeid}) - {employee.role}
                                                            </option>
                                                       ))}
                                                  </select>
                                             </div>
                                        )}
                                   </div>
                              </div>

                              {/* Remarks */}
                              <div className={screens.formSection} style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                                   <h5 className="fw-semibold mb-3 d-flex align-items-center">
                                        <RiFileTextLine size={20} className="me-2" />
                                        Additional Information
                                   </h5>
                                   <div>
                                        <label className="form-label">Remarks</label>
                                        <textarea aria-label="Remarks"
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
                         <div className={screens.formAside}>
                              <div className={screens.reviewPanel} style={{ backgroundColor: 'var(--bs-tertiary-bg)', top: '20px' }}>
                                   <h5 className="fw-semibold mb-3">Review before saving</h5>
                                   <div className="mb-3">
                                        <div className="small text-muted mb-1">Employee</div>
                                        <div className="fw-medium">
                                             {employees.find(emp => emp.employeeid.toString() === formData.employeeid)?.username || 'Not selected'}
                                        </div>
                                        <div className="small text-muted mt-1">
                                             ID: {formData.employeeid || 'N/A'} â€¢ {employees.find(emp => emp.employeeid.toString() === formData.employeeid)?.role || 'N/A'}
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
                                   {parseFloat(formData.overtime_hours) > 0 && (
                                        <div className="mb-3">
                                             <div className="small text-muted mb-1">Overtime</div>
                                             <div className="fw-medium">
                                                  {formData.overtime_hours}h {formData.overtime_approved ? '(Approved)' : '(Pending)'}
                                             </div>
                                             {formData.overtime_approved && formData.overtime_approved_by && (
                                                  <div className="small text-muted mt-1">
                                                       Approved by: {employees.find(emp => emp.employeeid.toString() === formData.overtime_approved_by)?.username || 'Unknown'}
                                                  </div>
                                             )}
                                        </div>
                                   )}
                                   <div className="mb-3"><div className="small text-muted mb-1">Clocked hours</div><div className="fw-medium">{(() => { try { const hours = formData.status === 'absent' ? 0 : attendanceHours(formData.clock_in, formData.clock_out, formData.shift_type === 'night'); return hours == null ? 'Enter clock-out time' : `${hours.toFixed(2)} hours`; } catch { return 'Check clock times'; } })()}</div><small>Overtime is included in these hours, not added again.</small></div><hr />
                                   
                              <button type="submit" className={`btn btn-primary ${screens.reviewSave}`} aria-label="Save attendance from review">Save attendance</button>
</div>
                         </div>
                    </div><footer className={screens.saveBar}><span className="small text-muted">Review the selected employee and values before saving.</span><div className="d-flex gap-2"><Link href={`/human-resource/payroll/attendance/${attendanceId}`} className="btn btn-outline-secondary">
                                             Cancel
                                        </Link><button
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
                                        </button></div></footer>
               </fieldset>
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
          </PayrollFormFrame>
     );
}