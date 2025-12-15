'use client';

import React, { useState, useEffect } from 'react';
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
     status: 'present' | 'absent' | 'late' | 'half_day' | 'leave';
     late_minutes: number;
     overtime_hours: number;
     overtime_approved: boolean;
     overtime_approved_by?: number;
     remarks: string;
}

const COLOR_ACCENT = 'oklch(0.646 0.222 41.116)';

export default function CreateAttendancePage() {
     const router = useRouter();
     const { applicationsettings } = useApplicationSettings();
     const { user } = applicationsettings || {};

     const [loading, setLoading] = useState(false);
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

     const handleSingleSubmit = async (e: React.FormEvent) => {
          e.preventDefault();

          if (!user?.employeeid) {
               alert('User information not available');
               return;
          }

          if (formData.overtime_approved && !formData.overtime_approved_by) {
               alert('Please select an overtime approver when overtime is approved');
               return;
          }

          setLoading(true);

          try {
               const payload = {
                    employeeid: parseInt(formData.employeeid),
                    attendance_date: formData.attendance_date,
                    clock_in: formData.clock_in || null,
                    clock_out: formData.clock_out || null,
                    shift_type: formData.shift_type,
                    work_location: formData.work_location,
                    status: formData.status,
                    late_minutes: formData.late_minutes ? parseInt(formData.late_minutes) : null,
                    overtime_hours: formData.overtime_hours ? parseFloat(formData.overtime_hours) : null,
                    overtime_approved: formData.overtime_approved,
                    overtime_approved_by: formData.overtime_approved_by ? parseInt(formData.overtime_approved_by) : null,
                    remarks: formData.remarks || null
               };

               const response = await customPost('payroll/attendance', 'POST', payload);

               if (response?.status === 'success') {
                    alert('Attendance recorded successfully');
                    router.push('/human-resource/payroll/attendance');
               } else {
                    alert(response?.message || 'Failed to record attendance');
               }
          } catch (err: any) {
               alert(err?.message || 'Error recording attendance');
          } finally {
               setLoading(false);
          }
     };

     const handleBulkSubmit = async (e: React.FormEvent) => {
          e.preventDefault();

          if (bulkRecords.length === 0) {
               alert('Please add at least one attendance record');
               return;
          }

          // Validate all records
          for (let i = 0; i < bulkRecords.length; i++) {
               const record = bulkRecords[i];
               if (!record.employeeid) {
                    alert(`Record ${i + 1}: Please select an employee`);
                    return;
               }
               if (record.overtime_approved && !record.overtime_approved_by) {
                    alert(`Record ${i + 1}: Please select an overtime approver when overtime is approved`);
                    return;
               }
          }

          setLoading(true);

          try {
               const payload = {
                    attendance_records: bulkRecords.map(record => ({
                         ...record,
                         late_minutes: record.late_minutes || 0,
                         overtime_hours: record.overtime_hours || 0
                    }))
               };

               const response = await customPost('payroll/attendance/bulk', 'POST', payload);

               if (response?.status === 'success') {
                    alert(`Bulk attendance recorded successfully. Processed: ${response.result.processed}`);
                    router.push('/human-resource/payroll/attendance');
               } else {
                    alert(response?.message || 'Failed to record bulk attendance');
               }
          } catch (err: any) {
               alert(err?.message || 'Error recording bulk attendance');
          } finally {
               setLoading(false);
          }
     };

     const getSelectedEmployee = () => {
          return employees.find(emp => emp.employeeid.toString() === formData.employeeid);
     };

     const selectedEmployee = getSelectedEmployee();

     return (
          <div className="container-fluid px-4 py-3">
               {/* Header */}
               <div className="d-flex align-items-center mb-4">
                    <Link href="/human-resource/payroll/attendance" className="btn btn-outline-secondary btn-sm me-3">
                         <RiArrowLeftLine size={18} />
                    </Link>
                    <div className="d-flex align-items-center">
                         <RiCalendarEventLine size={28} style={{ color: COLOR_ACCENT }} className="me-2" />
                         <div>
                              <h1 className="h4 mb-0 fw-bold">Record Attendance</h1>
                              <p className="text-muted mb-0 small">Record employee attendance</p>
                         </div>
                    </div>
               </div>

               {/* Mode Toggle */}
               <div className="border rounded p-3 mb-4" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                    <div className="d-flex align-items-center gap-3">
                         <label className="form-label mb-0 fw-semibold">Recording Mode:</label>
                         <div className="btn-group btn-group-sm" role="group">
                              <button
                                   type="button"
                                   className={`btn ${mode === 'single' ? 'btn-primary' : 'btn-outline-primary'}`}
                                   onClick={() => setMode('single')}
                              >
                                   Single Employee
                              </button>
                              <button
                                   type="button"
                                   className={`btn ${mode === 'bulk' ? 'btn-primary' : 'btn-outline-primary'}`}
                                   onClick={() => setMode('bulk')}
                              >
                                   Bulk Recording
                              </button>
                         </div>
                    </div>
               </div>

               {mode === 'single' ? (
                    /* Single Employee Form */
                    <form onSubmit={handleSingleSubmit}>
                         <div className="row">
                              <div className="col-lg-8">
                                   {/* Employee Information */}
                                   <div className="border rounded p-4 mb-4" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                                        <h5 className="fw-semibold mb-3 d-flex align-items-center">
                                             <RiUserLine size={20} className="me-2" />
                                             Employee Information
                                        </h5>
                                        <div className="row g-3">
                                             <div className="col-md-6">
                                                  <label className="form-label">Employee <span className="text-danger">*</span></label>
                                                  <select
                                                       className="form-select"
                                                       name="employeeid"
                                                       value={formData.employeeid}
                                                       onChange={handleChange}
                                                       required
                                                       disabled={employeesLoading}
                                                  >
                                                       <option value="">
                                                            {employeesLoading ? 'Loading employees...' : 'Select an employee'}
                                                       </option>
                                                       {employees.map((employee) => (
                                                            <option key={employee.employeeid} value={employee.employeeid}>
                                                                 {employee.username} (ID: {employee.employeeid}) - {employee.role}
                                                            </option>
                                                       ))}
                                                  </select>
                                             </div>
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
                                             {formData.overtime_approved && (
                                                  <div className="col-md-6">
                                                       <label className="form-label">Overtime Approved By <span className="text-danger">*</span></label>
                                                       <select
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
                                        <hr />
                                        <div className="d-grid gap-2">
                                             <button
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
                                             </button>
                                             <Link href="/human-resource/payroll/attendance" className="btn btn-outline-secondary">
                                                  Cancel
                                             </Link>
                                        </div>
                                   </div>
                              </div>
                         </div>
                    </form>
               ) : (
                    /* Bulk Recording Form */
                    <form onSubmit={handleBulkSubmit}>
                         <div className="border rounded p-4 mb-4" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
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
                                   <div className="table-responsive">
                                        <table className="table table-bordered">
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
                                                       <tr key={index}>
                                                            <td>
                                                                 <select
                                                                      className="form-select form-select-sm"
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
                                                                      type="date"
                                                                      className="form-control form-control-sm"
                                                                      value={record.attendance_date}
                                                                      onChange={(e) => updateBulkRecord(index, 'attendance_date', e.target.value)}
                                                                      required
                                                                 />
                                                            </td>
                                                            <td>
                                                                 <input
                                                                      type="time"
                                                                      className="form-control form-control-sm"
                                                                      value={record.clock_in}
                                                                      onChange={(e) => updateBulkRecord(index, 'clock_in', e.target.value)}
                                                                 />
                                                            </td>
                                                            <td>
                                                                 <input
                                                                      type="time"
                                                                      className="form-control form-control-sm"
                                                                      value={record.clock_out}
                                                                      onChange={(e) => updateBulkRecord(index, 'clock_out', e.target.value)}
                                                                 />
                                                            </td>
                                                            <td>
                                                                 <select
                                                                      className="form-select form-select-sm"
                                                                      value={record.status}
                                                                      onChange={(e) => updateBulkRecord(index, 'status', e.target.value)}
                                                                 >
                                                                      <option value="present">Present</option>
                                                                      <option value="absent">Absent</option>
                                                                      <option value="late">Late</option>
                                                                      <option value="half_day">Half Day</option>
                                                                      <option value="leave">Leave</option>
                                                                 </select>
                                                            </td>
                                                            <td>
                                                                 <input
                                                                      type="number"
                                                                      className="form-control form-control-sm"
                                                                      value={record.late_minutes}
                                                                      onChange={(e) => updateBulkRecord(index, 'late_minutes', parseInt(e.target.value) || 0)}
                                                                      min="0"
                                                                 />
                                                            </td>
                                                            <td>
                                                                 <input
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
                                                                      type="checkbox"
                                                                      className="form-check-input"
                                                                      checked={record.overtime_approved}
                                                                      onChange={(e) => updateBulkRecord(index, 'overtime_approved', e.target.checked)}
                                                                 />
                                                            </td>
                                                            <td>
                                                                 {record.overtime_approved ? (
                                                                      <select
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
          </div>
     );
}