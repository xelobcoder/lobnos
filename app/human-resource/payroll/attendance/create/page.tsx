'use client';
import EmployeeSearchSelect from '../../../../../components/HR/Payroll/EmployeeSearchSelect';
import PayrollFormFrame from '../../PayrollFormFrame';
import { attendancePayload, attendanceHours } from '../../../../../components/HR/Payroll/attendanceForm';
import screens from '../../PayrollScreens.module.css';
import { usePayrollFeedback } from '../../../../../components/HR/Payroll/usePayrollFeedback';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import {
     RiCalendarEventLine,
     RiArrowLeftLine,
     RiSaveLine,
     RiLoader4Line,
     RiUserLine,
     RiTimeLine,
     RiMapPinLine,
     RiFileTextLine,
     RiAddLine,
     RiDeleteBinLine
} from '@remixicon/react';

import { customPost, customFetch } from '../../../../../components/Auth/customFetch';
import { useApplicationSettings } from '../../../../../components/Auth/useApplicationContext';

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

interface AttendanceRecord {
     employeeid: number;
     attendance_date: string;
     clock_in: string;
     clock_out: string;
     shift_type: string;
     work_location: string;
     status: 'present' | 'absent' | 'late' | 'half_day' | 'early_departure';
     late_minutes: number;
     overtime_hours: number;
     overtime_approved: boolean;
     overtime_approved_by?: number;
     remarks: string;
}

const COLOR_ACCENT = 'var(--pls-primary, #2e7d32)';

export default function CreateAttendancePage() {
     const { notify, feedback } = usePayrollFeedback();
     const router = useRouter();
     const { applicationsettings } = useApplicationSettings();
     const { user } = applicationsettings || {};

     const [loading, setLoading] = useState(false);
     const submitting = useRef(false);
     const [employeeError, setEmployeeError] = useState(false);
     const [employees, setEmployees] = useState<Employee[]>([]);
     const [employeesLoading, setEmployeesLoading] = useState(true);
     const [mode, setMode] = useState<'single' | 'bulk'>('single');

     // Single attendance form
     const [formData, setFormData] = useState({
          employeeid: '',
          attendance_date: new Date().toISOString().split('T')[0],
          clock_in: '08:30',
          clock_out: '17:30',
          shift_type: 'regular',
          work_location: 'on-site',
          status: 'present',
          late_minutes: '',
          overtime_hours: '',
          overtime_approved: false,
          overtime_approved_by: '',
          remarks: ''
     });

     // Bulk attendance form
     const [bulkRecords, setBulkRecords] = useState<AttendanceRecord[]>([]);

     const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
          const { name, value, type } = e.target;
          const checked = (e.target as HTMLInputElement).checked;

          setFormData(prev => ({
               ...prev,
               [name]: type === 'checkbox' ? checked : value
          }));
     };

     const addBulkRecord = () => {
          const newRecord: AttendanceRecord = {
               employeeid: 0,
               attendance_date: new Date().toISOString().split('T')[0],
               clock_in: '08:30',
               clock_out: '17:30',
               shift_type: 'regular',
               work_location: 'on-site',
               status: 'present',
               late_minutes: 0,
               overtime_hours: 0,
               overtime_approved: false,
               overtime_approved_by: undefined,
               remarks: ''
          };
          setBulkRecords([...bulkRecords, newRecord]);
     };

     const updateBulkRecord = (index: number, field: keyof AttendanceRecord, value: any) => {
          const updatedRecords = [...bulkRecords];
          updatedRecords[index] = { ...updatedRecords[index], [field]: value };
          setBulkRecords(updatedRecords);
     };

     const removeBulkRecord = (index: number) => {
          setBulkRecords(bulkRecords.filter((_, i) => i !== index));
     };

     useEffect(() => {
          fetchEmployees();
     }, []);

     const fetchEmployees = async () => {
          setEmployeesLoading(true);
          setEmployeeError(false);
          try {
               const response = await customFetch('logins');
               if (response?.status === 'success' && response?.statusCode === 200) {
                    setEmployees(response.result || []);
               } else {
                    setEmployeeError(true);
               }
          } catch (error) {
               setEmployeeError(true);
               setEmployees([]);
          } finally {
               setEmployeesLoading(false);
          }
     };

     const handleSingleSubmit = async (e: React.FormEvent) => {
          e.preventDefault();
          if (submitting.current || employeesLoading || employeeError) return;

          if (!user?.employeeid) {
               notify('User information not available');
               return;
          }

          submitting.current = true;
          setLoading(true);

          try {
               const payload = attendancePayload(formData);

               const response = await customPost('payroll/attendance', 'POST', payload);

               if (response?.status === 'success') {
                    notify('Attendance recorded successfully', 'success');
                    router.push('/human-resource/payroll/attendance');
               } else {
                    notify(response?.message || 'Failed to record attendance');
               }
          } catch (err: any) {
               notify(err?.message || 'Error recording attendance');
          } finally {
               submitting.current = false;
               setLoading(false);
          }
     };

     const handleBulkSubmit = async (e: React.FormEvent) => {
          e.preventDefault();
          if (submitting.current || employeesLoading || employeeError) return;

          if (bulkRecords.length === 0) {
               notify('Please add at least one attendance record');
               return;
          }

          // Validate all records
          for (let i = 0; i < bulkRecords.length; i++) {
               const record = bulkRecords[i];
               if (!record.employeeid) {
                    notify(`Record ${i + 1}: Please select an employee`);
                    return;
               }
               if (record.status !== 'absent' && record.overtime_approved && !record.overtime_approved_by) {
                    notify(`Record ${i + 1}: Please select an overtime approver when overtime is approved`);
                    return;
               }
          }

          submitting.current = true;
          setLoading(true);

          try {
               const payload = {
                    attendance_records: bulkRecords.map((record, index) => {
                         try { return attendancePayload(record); }
                         catch (error) { throw new Error(`Record ${index + 1}: ${error instanceof Error ? error.message : 'Review the attendance details.'}`); }
                    })
               };

               const response = await customPost('payroll/attendance/bulk', 'POST', payload);

               if (response?.status === 'success') {
                    notify(`Bulk attendance recorded successfully. Processed: ${response.result.processed}`);
                    router.push('/human-resource/payroll/attendance');
               } else {
                    notify(response?.message || 'Failed to record bulk attendance');
               }
          } catch (err: any) {
               notify(err?.message || 'Error recording bulk attendance');
          } finally {
               submitting.current = false;
               setLoading(false);
          }
     };

     const getSelectedEmployee = () => {
          return employees.find(emp => emp.employeeid.toString() === formData.employeeid);
     };

     const selectedEmployee = getSelectedEmployee();

     return (
          <PayrollFormFrame busy={loading} className={screens.page}>
               {feedback}
               {employeeError && <div className="alert alert-danger" role="alert">Unable to load employees. Your entries have been kept. <button type="button" className="btn btn-sm btn-outline-danger ms-2" onClick={fetchEmployees}>Retry loading employees</button></div>}
               {/* Header */}
               <div className={screens.header}>
                    <Link href="/human-resource/payroll/attendance" className="btn btn-outline-secondary btn-sm me-3">
                         <RiArrowLeftLine size={18} />
                    </Link>
                    <div className="d-flex align-items-center">
                         
                         <div>
                              <span className={screens.eyebrow}>Payroll / Attendance</span>
<h1 className={screens.title}>Record Attendance</h1>
                              <p className="text-muted mb-0 small">Record employee attendance</p>
                         </div>
                    </div>
               </div>

               <section className={screens.modeChoices} aria-label="Attendance recording mode"><div><h2>How are you recording attendance?</h2><p>Record one employee or enter several employees together.</p></div><div className={screens.modeButtons}><button type="button" aria-label="Single Employee" aria-pressed={mode==='single'} disabled={loading} onClick={()=>setMode('single')}><strong>Single employee</strong><small>One employee, with a detailed review</small></button><button type="button" aria-label="Bulk Recording" aria-pressed={mode==='bulk'} disabled={loading} onClick={()=>setMode('bulk')}><strong>Multiple employees</strong><small>Enter several attendance records at once</small></button></div></section>
               {mode === 'single' ? (
                    /* Single Employee Form */
                    <form onSubmit={handleSingleSubmit}>
<fieldset disabled={loading} className={screens.formFields}><p className={screens.formHint}>Fields marked * are required. Review the details before saving.</p>
                         <div className={screens.editorGrid}>
                              <div className={screens.editorMain}>
                                   {/* Employee Information */}
                                   <div className={screens.formSection} style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                                        <h5 className="fw-semibold mb-3 d-flex align-items-center">
                                             <RiUserLine size={20} className="me-2" />
                                             Employee Information
                                        </h5>
                                        <div className="row g-3">
                                             <div className="col-md-6">
                                                  <label className="form-label">Employee <span className="text-danger">*</span></label>
                                                  <EmployeeSearchSelect employees={employees} aria-label="Employee"
                                                       className="form-select"
                                                       name="employeeid"
                                                       value={formData.employeeid}
                                                       onChange={handleChange}
                                                       required
                                                       disabled={employeesLoading}
                                                  />
                                             </div>
                                             <div className="col-md-6">
                                                  <label className="form-label">Attendance Date <span className="text-danger">*</span></label>
                                                  <input aria-label="Attendance Date"
                                                       type="date"
                                                       className="form-control"
                                                       name="attendance_date"
                                                       value={formData.attendance_date}
                                                       onChange={handleChange}
                                                       required
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
                                                            disabled={employeesLoading}
                                                       >
                                                            <option value="">
                                                                 {employeesLoading ? 'Loading employees...' : 'Select approver'}
                                                            </option>
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
                                                  {selectedEmployee ? `${selectedEmployee.username} (ID: ${selectedEmployee.employeeid})` : 'Not selected'}
                                             </div>
                                             {selectedEmployee && (
                                                  <div className="small text-muted mt-1">
                                                       Role: {selectedEmployee.role} | Branch: {selectedEmployee.branchname}
                                                  </div>
                                             )}
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
                                        <div className="mb-3"><div className="small text-muted mb-1">Clocked hours</div><div className="fw-medium">{(() => { try { const hours = formData.status === 'absent' ? 0 : attendanceHours(formData.clock_in, formData.clock_out, formData.shift_type === 'night'); return hours == null ? 'Enter clock-out time' : `${hours.toFixed(2)} hours`; } catch { return 'Check clock times'; } })()}</div><small>Overtime is included in these hours, not added again.</small></div><hr />
                                        
                                   <button type="submit" className={`btn btn-primary ${screens.reviewSave}`} aria-label="Save attendance from review">Save attendance</button>
</div>
                              </div>
                         </div><footer className={screens.saveBar}><span className="small text-muted">Review the selected employee and values before saving.</span><div className="d-flex gap-2"><Link href="/human-resource/payroll/attendance" className="btn btn-outline-secondary">
                                                  Cancel
                                             </Link><button
                                                  type="submit"
                                                  className="btn btn-primary"
                                                  disabled={loading}
                                                  style={{ backgroundColor: COLOR_ACCENT, borderColor: COLOR_ACCENT }}
                                             >
                                                  {loading ? (
                                                       <>
                                                            <RiLoader4Line size={18} className="me-2 animate-spin" />
                                                            Recording...
                                                       </>
                                                  ) : (
                                                       <>
                                                            <RiSaveLine size={18} className="me-2" />
                                                            Record Attendance
                                                       </>
                                                  )}
                                             </button></div></footer>
                    </fieldset>
</form>
               ) : (
                    /* Bulk Recording Form */
                    <form onSubmit={handleBulkSubmit}>
<fieldset disabled={loading} className={screens.formFields}><p className={screens.formHint}>Fields marked * are required. Review the details before saving.</p>
                         <div className={screens.formSection} style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                              <div className="d-flex justify-content-between align-items-center mb-3">
                                   <h5 className="fw-semibold mb-0">Bulk Attendance Records</h5>
                                   <button
                                        type="button"
                                        className="btn btn-outline-primary btn-sm"
                                        onClick={addBulkRecord}
                                   >
                                        <RiAddLine size={16} className="me-2" />
                                        Add Record
                                   </button>
                              </div>

                              {bulkRecords.length === 0 ? (
                                   <div className="text-center py-4">
                                        <RiCalendarEventLine size={48} className="text-muted mb-3" />
                                        <p className="text-muted mb-3">No attendance records added yet</p>
                                        <button
                                             type="button"
                                             className="btn btn-primary"
                                             onClick={addBulkRecord}
                                        >
                                             <RiAddLine size={16} className="me-2" />
                                             Add First Record
                                        </button>
                                   </div>
                              ) : (
                                   <div className={screens.tableWrap}>
                                        <table className={screens.table}>
                                             <thead className="table-light">
                                                  <tr>
                                                       <th>Employee</th>
                                                       <th>Date</th>
                                                       <th>Clock In</th>
                                                       <th>Clock Out</th>
                                                       <th>Status</th>
                                                       <th>Late (min)</th>
                                                       <th>Overtime (hrs)</th>
                                                       <th>Approved</th>
                                                       <th>Approved By</th>
                                                       <th>Remarks</th>
                                                       <th>Actions</th>
                                                  </tr>
                                             </thead>
                                             <tbody>
                                                  {bulkRecords.map((record, index) => (
                                                       <tr key={index} aria-label={`Attendance record ${index + 1}`}>
                                                            <td>
                                                                 <select
                                                                      className="form-select form-select-sm"
                                                                      aria-label={`Record ${index + 1}: employee`}
                                                                      value={record.employeeid}
                                                                      onChange={(e) => updateBulkRecord(index, 'employeeid', parseInt(e.target.value))}
                                                                      required
                                                                 >
                                                                      <option value={0}>Select Employee</option>
                                                                      {employees.map((employee) => (
                                                                           <option key={employee.employeeid} value={employee.employeeid}>
                                                                                {employee.username} (ID: {employee.employeeid})
                                                                           </option>
                                                                      ))}
                                                                 </select>
                                                            </td>
                                                            <td>
                                                                 <input
                                                                      aria-label={`Record ${index + 1}: attendance date`}
type="date"
                                                                      className="form-control form-control-sm"
                                                                      value={record.attendance_date}
                                                                      onChange={(e) => updateBulkRecord(index, 'attendance_date', e.target.value)}
                                                                      required
                                                                 />
                                                            </td>
                                                            <td>
                                                                 <input
                                                                      aria-label={`Record ${index + 1}: clock in`}
type="time"
                                                                      className="form-control form-control-sm"
                                                                      value={record.clock_in}
                                                                      onChange={(e) => updateBulkRecord(index, 'clock_in', e.target.value)}
                                                                 />
                                                            </td>
                                                            <td>
                                                                 <input
                                                                      aria-label={`Record ${index + 1}: clock out`}
type="time"
                                                                      className="form-control form-control-sm"
                                                                      value={record.clock_out}
                                                                      onChange={(e) => updateBulkRecord(index, 'clock_out', e.target.value)}
                                                                 />
                                                            </td>
                                                            <td>
                                                                 <select
                                                                      aria-label={`Record ${index + 1}: status`}
className="form-select form-select-sm"
                                                                      value={record.status}
                                                                      onChange={(e) => updateBulkRecord(index, 'status', e.target.value)}
                                                                 >
                                                                      <option value="present">Present</option>
                                                                      <option value="absent">Absent</option>
                                                                      <option value="late">Late</option>
                                                                      <option value="half_day">Half Day</option>
                                                                      <option value="early_departure">Early departure</option>
                                                                 </select>
                                                            </td>
                                                            <td>
                                                                 <input
                                                                      aria-label={`Record ${index + 1}: late minutes`}
type="number"
                                                                      className="form-control form-control-sm"
                                                                      value={record.late_minutes}
                                                                      onChange={(e) => updateBulkRecord(index, 'late_minutes', parseInt(e.target.value) || 0)}
                                                                      min="0"
                                                                 />
                                                            </td>
                                                            <td>
                                                                 <input
                                                                      aria-label={`Record ${index + 1}: overtime hours`}
type="number"
                                                                      step="0.5"
                                                                      className="form-control form-control-sm"
                                                                      value={record.overtime_hours}
                                                                      onChange={(e) => updateBulkRecord(index, 'overtime_hours', parseFloat(e.target.value) || 0)}
                                                                      min="0"
                                                                 />
                                                            </td>
                                                            <td>
                                                                 <input
                                                                      aria-label={`Record ${index + 1}: overtime approved`}
type="checkbox"
                                                                      className="form-check-input"
                                                                      checked={record.overtime_approved}
                                                                      onChange={(e) => updateBulkRecord(index, 'overtime_approved', e.target.checked)}
                                                                 />
                                                            </td>
                                                            <td>
                                                                 {record.overtime_approved ? (
                                                                      <select
                                                                           aria-label={`Record ${index + 1}: overtime approved by`}
className="form-select form-select-sm"
                                                                           value={record.overtime_approved_by || ''}
                                                                           onChange={(e) => updateBulkRecord(index, 'overtime_approved_by', e.target.value ? parseInt(e.target.value) : undefined)}
                                                                           required={record.overtime_approved}
                                                                      >
                                                                           <option value="">Select Approver</option>
                                                                           {employees.map((employee) => (
                                                                                <option key={employee.employeeid} value={employee.employeeid}>
                                                                                     {employee.username}
                                                                                </option>
                                                                           ))}
                                                                      </select>
                                                                 ) : (
                                                                      <span className="text-muted">-</span>
                                                                 )}
                                                            </td>
                                                            <td>
                                                                 <input
                                                                      aria-label={`Record ${index + 1}: remarks`}
type="text"
                                                                      className="form-control form-control-sm"
                                                                      value={record.remarks}
                                                                      onChange={(e) => updateBulkRecord(index, 'remarks', e.target.value)}
                                                                      placeholder="Remarks"
                                                                 />
                                                            </td>
                                                            <td>
                                                                 <button
                                                                      type="button"
                                                                      className="btn btn-outline-danger btn-sm"
                                                                      aria-label={`Remove attendance record ${index + 1}`}
                                                                      onClick={() => removeBulkRecord(index)}
                                                                 >
                                                                      <RiDeleteBinLine size={14} />
                                                                 </button>
                                                            </td>
                                                       </tr>
                                                  ))}
                                             </tbody>
                                        </table>
                                   </div>
                              )}

                              {bulkRecords.length > 0 && (
                                   <div className="d-flex justify-content-end mt-3">
                                        <button
                                             type="submit"
                                             className="btn btn-primary"
                                             disabled={loading}
                                             style={{ backgroundColor: COLOR_ACCENT, borderColor: COLOR_ACCENT }}
                                        >
                                             {loading ? (
                                                  <>
                                                       <RiLoader4Line size={18} className="me-2 animate-spin" />
                                                       Recording Bulk Attendance...
                                                  </>
                                             ) : (
                                                  <>
                                                       <RiSaveLine size={18} className="me-2" />
                                                       Record {bulkRecords.length} Attendance Records
                                                  </>
                                             )}
                                        </button>
                                   </div>
                              )}
                         </div>
                    </fieldset>
</form>
               )}

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