'use client';
import screens from '../PayrollScreens.module.css';
import PayrollSummaryStrip from '../PayrollSummaryStrip';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import PrimeTable from '../../../../components/accessories/Datatables/PrimeTable';
import { customFetch, customPost } from '../../../../components/Auth/customFetch';
import { useApplicationSettings } from '../../../../components/Auth/useApplicationContext';
import {
     RiAddLine,
     RiArrowLeftLine,
     RiCalendarEventLine,
     RiCheckboxCircleLine,
     RiCloseLine,
     RiFileListLine,
     RiHistoryLine,
     RiLoader4Line,
     RiRefreshLine,
     RiSaveLine,
     RiUserLine,
} from '@remixicon/react';
import dayjs from 'dayjs';

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

interface LeaveRequest {
     id: number;
     employeeid: number;
     employee_name?: string | null;
     leave_type: string;
     start_date: string;
     end_date: string;
     total_days: number;
     status: string;
     applied_date: string;
     approved_by?: number | null;
     approved_date?: string | null;
     affects_salary: boolean;
     reason?: string | null;
     attachments?: string | null;
}

interface LeaveBalance {
     id: number;
     employeeid: number;
     leave_year: number;
     annual_leave_entitlement: number;
     sick_leave_entitlement: number;
     annual_leave_taken: number;
     annual_leave_balance: number;
     sick_leave_taken: number;
     sick_leave_balance: number;
}

interface LeaveSummary {
     total_annual_taken: number;
     total_sick_taken: number;
     total_unpaid_taken: number;
     total_other_taken: number;
}

type LeaveFormState = {
     employeeid: string;
     leave_type: string;
     start_date: string;
     end_date: string;
     total_days: string;
     applied_date: string;
     affects_salary: boolean;
     reason: string;
     attachments: string;
};

const COLOR_ACCENT = 'var(--pls-primary, #2e7d32)';
const LEAVE_TYPES = ['annual', 'sick', 'maternity', 'paternity', 'unpaid', 'study', 'compassionate'];
const YEAR_OPTIONS = ['all', ...Array.from({ length: 6 }, (_, index) => String(new Date().getFullYear() - index))];

const toDateInputValue = (value?: string | null) => {
     if (!value) return '';

     const exactDateMatch = value.match(/^\d{4}-\d{2}-\d{2}/);
     if (exactDateMatch) {
          return exactDateMatch[0];
     }

     const parsedDate = new Date(value);
     if (Number.isNaN(parsedDate.getTime())) {
          return '';
     }

     return parsedDate.toISOString().split('T')[0];
};

const defaultFormState = (): LeaveFormState => ({
     employeeid: '',
     leave_type: 'annual',
     start_date: '',
     end_date: '',
     total_days: '',
     applied_date: new Date().toISOString().split('T')[0],
     affects_salary: false,
     reason: '',
     attachments: '',
});

export default function PayrollLeavePage() {
     const router = useRouter();
     const { applicationsettings } = useApplicationSettings();
     const { user } = applicationsettings || {};

     const [employees, setEmployees] = useState<Employee[]>([]);
     const [employeesLoading, setEmployeesLoading] = useState(true);
     const [allRequests, setAllRequests] = useState<LeaveRequest[]>([]);
     const [requestsLoading, setRequestsLoading] = useState(true);
     const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
     const [requestYearFilter, setRequestYearFilter] = useState('all');
     const [balanceYear, setBalanceYear] = useState(String(new Date().getFullYear()));
     const [leaveBalance, setLeaveBalance] = useState<LeaveBalance | null>(null);
     const [leaveSummary, setLeaveSummary] = useState<LeaveSummary | null>(null);
     const [balanceLoading, setBalanceLoading] = useState(false);
     const [showNewRequestModal, setShowNewRequestModal] = useState(false);
     const [editingRequestId, setEditingRequestId] = useState<number | null>(null);
     const [editingRequest, setEditingRequest] = useState<LeaveRequest | null>(null);
     const [submitting, setSubmitting] = useState(false);
     const [actionLoadingKey, setActionLoadingKey] = useState<string | null>(null);
     const [tableVersion, setTableVersion] = useState(0);
     const [error, setError] = useState<string | null>(null);
     const [formData, setFormData] = useState<LeaveFormState>(defaultFormState());

     useEffect(() => {
          fetchEmployees();
          fetchAllRequests();
     }, []);

     useEffect(() => {
          if (selectedEmployeeId) {
               fetchEmployeeStats(selectedEmployeeId, balanceYear);
          } else {
               setLeaveBalance(null);
               setLeaveSummary(null);
          }
     }, [selectedEmployeeId, balanceYear]);

     const getEmployeeLabel = (employeeId: number) => {
          const employee = employees.find((item) => item.employeeid === employeeId);
          return employee ? `${employee.username} (${employee.role})` : String(employeeId);
     };

     const filteredRequests = useMemo(() => {
          return allRequests
               .filter((request) => {
                    if (requestYearFilter === 'all') return true;
                    return [request.applied_date, request.start_date, request.end_date].some((value) => value?.startsWith(`${requestYearFilter}-`));
               })
               .filter((request) => (selectedEmployeeId ? String(request.employeeid) === selectedEmployeeId : true))
               .sort((left, right) => new Date(right.applied_date || right.start_date).getTime() - new Date(left.applied_date || left.start_date).getTime())
               .map((request) => ({
                    ...request,
                    employee_name: request.employee_name || getEmployeeLabel(request.employeeid),
               }));
     }, [allRequests, employees, requestYearFilter, selectedEmployeeId]);

     const tableSeedData = useMemo(() => filteredRequests.slice(0, 10), [filteredRequests]);

     useEffect(() => {
          setTableVersion((previous) => previous + 1);
     }, [tableSeedData, requestYearFilter, selectedEmployeeId]);

     const summaryCounts = useMemo(() => ({
          total: filteredRequests.length,
          pending: filteredRequests.filter((request) => request.status === 'pending').length,
          approved: filteredRequests.filter((request) => request.status === 'approved').length,
          rejected: filteredRequests.filter((request) => request.status === 'rejected').length,
     }), [filteredRequests]);

     const selectedEmployee = employees.find((employee) => employee.employeeid.toString() === selectedEmployeeId);

     const fetchEmployees = async () => {
          setEmployeesLoading(true);
          try {
               const response = await customFetch('logins');
               if (response?.status === 'success' && response?.statusCode === 200) {
                    setEmployees(response.result || []);
               } else {
                    setEmployees([]);
               }
          } catch {
               setEmployees([]);
          } finally {
               setEmployeesLoading(false);
          }
     };

     const fetchAllRequests = async () => {
          setRequestsLoading(true);
          setError(null);
          try {
               const response = await customFetch('payroll/leave?startDate=1970-01-01&endDate=2100-12-31');
               if (response?.status === 'success' && response?.statusCode === 200) {
                    setAllRequests(response.result || []);
               } else {
                    setAllRequests([]);
               }
          } catch (err: any) {
               setError(err?.message || 'Failed to load leave requests');
               setAllRequests([]);
          } finally {
               setRequestsLoading(false);
          }
     };

     const fetchEmployeeStats = async (employeeId: string, year: string) => {
          setBalanceLoading(true);
          setError(null);
          try {
               const yearNumber = Number(year);
               const [balanceResponse, summaryResponse] = await Promise.all([
                    customFetch(`payroll/leave/balance/${employeeId}?year=${yearNumber}`),
                    customFetch(`payroll/leave/employee/${employeeId}/summary?year=${yearNumber}`),
               ]);

               if (balanceResponse?.status === 'success' && balanceResponse?.statusCode === 200) {
                    setLeaveBalance(balanceResponse.result || null);
               } else {
                    setLeaveBalance(null);
               }

               if (summaryResponse?.status === 'success' && summaryResponse?.statusCode === 200) {
                    setLeaveSummary(summaryResponse.result || null);
               } else {
                    setLeaveSummary(null);
               }
          } catch (err: any) {
               setError(err?.message || 'Failed to load employee leave summary');
               setLeaveBalance(null);
               setLeaveSummary(null);
          } finally {
               setBalanceLoading(false);
          }
     };

     const refreshAfterMutation = async () => {
          await fetchAllRequests();
          if (selectedEmployeeId) {
               await fetchEmployeeStats(selectedEmployeeId, balanceYear);
          }
     };

     const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
          const { name, value, type } = event.target;
          const checked = (event.target as HTMLInputElement).checked;
          setFormData((previous) => ({
               ...previous,
               [name]: type === 'checkbox' ? checked : value,
          }));
     };

     const openNewRequestModal = () => {
          setFormData((previous) => ({
               ...defaultFormState(),
               employeeid: selectedEmployeeId || previous.employeeid,
          }));
          setEditingRequestId(null);
          setEditingRequest(null);
          setShowNewRequestModal(true);
     };

     const openEditRequestModal = (request: LeaveRequest) => {
          const normalizedReason = request.reason ?? '';
          const normalizedAttachments = request.attachments ?? '';

          setFormData({
               employeeid: String(request.employeeid),
               leave_type: request.leave_type || 'annual',
               start_date: toDateInputValue(request.start_date),
               end_date: toDateInputValue(request.end_date),
               total_days: request.total_days ? String(request.total_days) : '',
               applied_date: toDateInputValue(request.applied_date) || new Date().toISOString().split('T')[0],
               affects_salary: Boolean(request.affects_salary),
               reason: normalizedReason,
               attachments: normalizedAttachments,
          });
          setEditingRequestId(request.id);
          setEditingRequest({
               ...request,
               reason: normalizedReason,
               attachments: normalizedAttachments,
          });
          setShowNewRequestModal(true);
     };

     const closeNewRequestModal = () => {
          setShowNewRequestModal(false);
          setEditingRequestId(null);
          setEditingRequest(null);
          setFormData(defaultFormState());
     };

     const handleSubmit = async (event: React.FormEvent) => {
          event.preventDefault();
          setSubmitting(true);
          setError(null);

          try {
               const employeeid = Number(formData.employeeid);
               const totalDays = Number(formData.total_days);

               if (!Number.isFinite(employeeid) || employeeid <= 0) {
                    throw new Error('Select a valid employee');
               }

               if (!Number.isFinite(totalDays) || totalDays <= 0) {
                    throw new Error('Total days must be greater than 0');
               }

               if (!formData.start_date || !formData.end_date) {
                    throw new Error('Start date and end date are required');
               }

               if (new Date(formData.end_date) < new Date(formData.start_date)) {
                    throw new Error('End date must be after or equal to start date');
               }

               const payload: Record<string, unknown> = {
                    employeeid,
                    leave_type: formData.leave_type,
                    start_date: formData.start_date,
                    end_date: formData.end_date,
                    total_days: totalDays,
                    applied_date: formData.applied_date,
                    affects_salary: formData.affects_salary,
               };

               if (editingRequestId) {
                    payload.reason = formData.reason.trim();
                    payload.attachments = formData.attachments.trim();
               } else {
                    payload.status = 'pending';

                    if (formData.reason.trim()) {
                         payload.reason = formData.reason.trim();
                    }

                    if (formData.attachments.trim()) {
                         payload.attachments = formData.attachments.trim();
                    }
               }

               const response = editingRequestId
                    ? await customPost(`payroll/leave/${editingRequestId}`, 'PUT', payload)
                    : await customPost('payroll/leave', 'POST', payload);

               if (response?.status === 'success') {
                    closeNewRequestModal();
                    await refreshAfterMutation();
               } else {
                    setError(response?.message || 'Failed to submit leave request');
               }
          } catch (err: any) {
               setError(err?.message || 'Error submitting leave request');
          } finally {
               setSubmitting(false);
          }
     };

     const handleApprove = async (leaveId: number) => {
          if (!user?.employeeid) return;
          setActionLoadingKey(`approve-${leaveId}`);
          setError(null);
          try {
               const response = await customPost(`payroll/leave/${leaveId}/approve`, 'POST', {
                    approved_by: user.employeeid,
               });

               if (response?.status === 'success') {
                    await refreshAfterMutation();
               } else {
                    setError(response?.message || 'Failed to approve leave');
               }
          } catch (err: any) {
               setError(err?.message || 'Error approving leave');
          } finally {
               setActionLoadingKey(null);
          }
     };

     const handleReject = async (leaveId: number) => {
          if (!user?.employeeid) return;
          setActionLoadingKey(`reject-${leaveId}`);
          setError(null);
          try {
               const response = await customPost(`payroll/leave/${leaveId}/reject`, 'POST', {
                    approved_by: user.employeeid,
               });

               if (response?.status === 'success') {
                    await refreshAfterMutation();
               } else {
                    setError(response?.message || 'Failed to reject leave');
               }
          } catch (err: any) {
               setError(err?.message || 'Error rejecting leave');
          } finally {
               setActionLoadingKey(null);
          }
     };

     const handleCancel = async (leaveId: number) => {
          setActionLoadingKey(`cancel-${leaveId}`);
          setError(null);
          try {
               const response = await customPost(`payroll/leave/${leaveId}/cancel`, 'POST', {});

               if (response?.status === 'success') {
                    await refreshAfterMutation();
               } else {
                    setError(response?.message || 'Failed to cancel leave');
               }
          } catch (err: any) {
               setError(err?.message || 'Error cancelling leave');
          } finally {
               setActionLoadingKey(null);
          }
     };

     const columns = useMemo(() => [
          {
               Header: 'Employee',
               accessor: 'employee_name',
               Cell: ({ value }: { value: string }) => <span className="fw-medium">{value || 'N/A'}</span>,
          },
          {
               Header: 'Applied',
               accessor: 'applied_date',
               Cell: ({ value }: { value: string }) => value ? dayjs(value).format("DD-MM-YYYY") : 'N/A'
          },
          {
               Header: 'Period',
               accessor: 'start_date',
               Cell: ({ row }: { row: { original: LeaveRequest } }) => `${dayjs(row.original.start_date).format('DD-MM-YYYY')} to ${dayjs(row.original.end_date).format('DD-MM-YYYY')}`,
          },
          {
               Header: 'Type',
               accessor: 'leave_type',
               Cell: ({ value }: { value: string }) => <span className="text-capitalize">{value}</span>,
          },
          {
               Header: 'Days',
               accessor: 'total_days',
               Cell: ({ value }: { value: number }) => <span className="text-end d-block">{value}</span>,
          },
          {
               Header: 'Status',
               accessor: 'status',
               Cell: ({ value }: { value: string }) => {
                    const statusClass = value === 'approved'
                         ? 'bg-success'
                         : value === 'rejected'
                              ? 'bg-danger'
                              : value === 'cancelled'
                                   ? 'bg-secondary'
                                   : 'bg-warning text-dark';

                    return <span className={`badge ${statusClass} text-uppercase`}>{value}</span>;
               },
          },
          {
               Header: 'Reason',
               accessor: 'reason',
               Cell: ({ value }: { value: string }) => <span>{value || 'N/A'}</span>,
          },
          {
               Header: 'Actions',
               accessor: 'id',
               Cell: ({ row }: { row: { original: LeaveRequest } }) => (
                    <div className="d-flex gap-2 flex-wrap">
                         <button
                              type="button"
                              className="btn btn-outline-primary btn-sm"
                              onClick={() => openEditRequestModal(row.original)}
                         >
                              Edit
                         </button>
                         {row.original.status === 'pending' && (
                              <>
                                   <button
                                        type="button"
                                        className="btn btn-outline-success btn-sm"
                                        onClick={() => handleApprove(row.original.id)}
                                        disabled={actionLoadingKey === `approve-${row.original.id}`}
                                   >
                                        {actionLoadingKey === `approve-${row.original.id}` ? '...' : 'Approve'}
                                   </button>
                                   <button
                                        type="button"
                                        className="btn btn-outline-danger btn-sm"
                                        onClick={() => handleReject(row.original.id)}
                                        disabled={actionLoadingKey === `reject-${row.original.id}`}
                                   >
                                        {actionLoadingKey === `reject-${row.original.id}` ? '...' : 'Reject'}
                                   </button>
                              </>
                         )}
                         {row.original.status === 'approved' && (
                              <button
                                   type="button"
                                   className="btn btn-outline-secondary btn-sm"
                                   onClick={() => handleCancel(row.original.id)}
                                   disabled={actionLoadingKey === `cancel-${row.original.id}`}
                              >
                                   {actionLoadingKey === `cancel-${row.original.id}` ? '...' : 'Cancel'}
                              </button>
                         )}
                    </div>
               ),
          },
     ], [actionLoadingKey]);

     const handleTableServerSide = async ({ page, count }: { page: number; count: number }) => {
          const pageSize = Math.max(Number(count) || 10, 1);
          const currentPage = Math.max(Number(page) || 1, 1);
          const startIndex = (currentPage - 1) * pageSize;
          const pageData = tableSeedData.slice(startIndex, startIndex + pageSize);
          return { result: pageData, error: false };
     };

     return (
          <div className={screens.page}>
               <div className={screens.header}>
                    <button type="button" onClick={() => router.push('/human-resource/payroll')} className="btn btn-outline-secondary btn-sm me-3">
                         <RiArrowLeftLine size={18} />
                    </button>
                    <div className="d-flex align-items-center">
                         <RiCalendarEventLine size={28} style={{ color: COLOR_ACCENT }} className="me-2" />
                         <div>
                              <span className={screens.eyebrow}>Payroll / Leave management</span>
<h1 className={screens.title}>Leave Management</h1>
                              <p className="text-muted mb-0 small">View all leave requests, filter by employee, and create new requests</p>
                         </div>
                    </div>
               </div>

               <PayrollSummaryStrip label="Leave requests in the current filters" items={[{label:'Total requests',value:summaryCounts.total},{label:'Pending review',value:summaryCounts.pending,tone:'warning'},{label:'Approved',value:summaryCounts.approved,tone:'success'},{label:'Rejected',value:summaryCounts.rejected,tone:'danger'}]}/>

               <div key={tableVersion} className={screens.panel} style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                    <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3">
                         <div className="d-flex flex-column flex-md-row align-items-md-center gap-2 flex-wrap">
                              <div className="d-flex align-items-center gap-2">
                                   <RiUserLine size={18} className="text-muted" />
                                   <label className="form-label mb-0 fw-medium">Employee</label>
                              </div>
                              <select
                                   className="form-select form-select-sm"
                                   style={{ minWidth: '260px' }}
                                   value={selectedEmployeeId}
                                   onChange={(event) => setSelectedEmployeeId(event.target.value)}
                                   disabled={employeesLoading}
                              >
                                   <option value="">All employees</option>
                                   {employees.map((employee) => (
                                        <option key={employee.employeeid} value={employee.employeeid}>
                                             {employee.username} - {employee.role}
                                        </option>
                                   ))}
                              </select>

                              <div className="d-flex align-items-center gap-2 ms-md-2">
                                   <RiFileListLine size={18} className="text-muted" />
                                   <label className="form-label mb-0 fw-medium">Year</label>
                              </div>
                              <select
                                   className="form-select form-select-sm"
                                   style={{ width: '120px' }}
                                   value={requestYearFilter}
                                   onChange={(event) => setRequestYearFilter(event.target.value)}
                              >
                                   {YEAR_OPTIONS.map((year) => (
                                        <option key={year} value={year}>
                                             {year === 'all' ? 'All' : year}
                                        </option>
                                   ))}
                              </select>

                              <button
                                   type="button"
                                   className="btn btn-outline-secondary btn-sm d-flex align-items-center"
                                   onClick={() => {
                                        setSelectedEmployeeId('');
                                        setRequestYearFilter('all');
                                   }}
                              >
                                   <RiRefreshLine size={16} className="me-1" /> Reset filters
                              </button>
                         </div>

                         <button
                              type="button"
                              className="btn btn-primary d-flex align-items-center"
                              onClick={openNewRequestModal}
                              style={{ backgroundColor: COLOR_ACCENT, borderColor: COLOR_ACCENT }}
                         >
                              <RiAddLine size={18} className="me-1" /> New Leave Request
                         </button>
                    </div>
                    <div className="mt-3 small text-muted">
                         {selectedEmployee ? `Showing requests for ${selectedEmployee.username}` : 'Showing all leave requests'}. The list is paginated with PrimeTable.
                    </div>
               </div>

               {error && <div role="alert" className="alert alert-danger">{error}</div>}

               <div className={screens.panel} style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                    <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2 mb-3">
                         <div>
                              <h5 className="fw-semibold mb-1">Leave Requests</h5>
                              <p className="text-muted mb-0 small">Paginated request history with employee and status filtering</p>
                         </div>
                         {(requestsLoading || employeesLoading) && <span className="text-muted small">Loading requests...</span>}
                    </div>

                    <PrimeTable
                         column={columns}
                         data={tableSeedData}
                         filtering={true}
                         serverSideFiltering={true}
                         handleSeverSideProcessing={handleTableServerSide}
                    />
               </div>

               <div className="row g-4 mb-4">
                    <div className="col-lg-6">
                         <div className={screens.panel} style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                              <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-3">
                                   <div>
                                        <h5 className="fw-semibold mb-1">Leave Balance Snapshot</h5>
                                        <p className="text-muted mb-0 small">Year: {balanceYear}</p>
                                   </div>
                                   <div className="d-flex align-items-center gap-2">
                                        <label className="form-label mb-0 small fw-medium">Balance year</label>
                                        <input aria-label="Balance year" type="number" className="form-control form-control-sm" value={balanceYear} onChange={(event) => setBalanceYear(event.target.value)} style={{ width: '110px' }} />
                                   </div>
                              </div>

                              {selectedEmployeeId ? (
                                   <div className="row g-3">
                                        <div className="col-6 col-md-4">
                                             <div className={screens.detailItem} style={{ backgroundColor: 'var(--bs-tertiary-bg)' }}>
                                                  <div className="small text-muted mb-1">Annual Balance</div>
                                                  <div className="fw-bold">{balanceLoading ? '...' : leaveBalance?.annual_leave_balance ?? 'N/A'}</div>
                                             </div>
                                        </div>
                                        <div className="col-6 col-md-4">
                                             <div className={screens.detailItem} style={{ backgroundColor: 'var(--bs-tertiary-bg)' }}>
                                                  <div className="small text-muted mb-1">Sick Balance</div>
                                                  <div className="fw-bold">{balanceLoading ? '...' : leaveBalance?.sick_leave_balance ?? 'N/A'}</div>
                                             </div>
                                        </div>
                                        <div className="col-12 col-md-4">
                                             <div className={screens.detailItem} style={{ backgroundColor: 'var(--bs-tertiary-bg)' }}>
                                                  <div className="small text-muted mb-1">Selected Employee</div>
                                                  <div className="fw-bold">{selectedEmployee?.username || selectedEmployeeId}</div>
                                             </div>
                                        </div>
                                   </div>
                              ) : (
                                   <div className="text-muted small">Select an employee to see their balance snapshot.</div>
                              )}
                         </div>
                    </div>

                    <div className="col-lg-6">
                         <div className={screens.panel} style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                              <h5 className="fw-semibold mb-3">Leave Summary</h5>
                              {selectedEmployeeId ? (
                                   leaveSummary ? (
                                        <div className="row g-3">
                                             <div className="col-6 col-md-3">
                                                  <div className={screens.detailItem} style={{ backgroundColor: 'var(--bs-tertiary-bg)' }}>
                                                       <div className="small text-muted mb-1">Annual</div>
                                                       <div className="fw-bold">{leaveSummary.total_annual_taken}</div>
                                                  </div>
                                             </div>
                                             <div className="col-6 col-md-3">
                                                  <div className={screens.detailItem} style={{ backgroundColor: 'var(--bs-tertiary-bg)' }}>
                                                       <div className="small text-muted mb-1">Sick</div>
                                                       <div className="fw-bold">{leaveSummary.total_sick_taken}</div>
                                                  </div>
                                             </div>
                                             <div className="col-6 col-md-3">
                                                  <div className={screens.detailItem} style={{ backgroundColor: 'var(--bs-tertiary-bg)' }}>
                                                       <div className="small text-muted mb-1">Unpaid</div>
                                                       <div className="fw-bold">{leaveSummary.total_unpaid_taken}</div>
                                                  </div>
                                             </div>
                                             <div className="col-6 col-md-3">
                                                  <div className={screens.detailItem} style={{ backgroundColor: 'var(--bs-tertiary-bg)' }}>
                                                       <div className="small text-muted mb-1">Other</div>
                                                       <div className="fw-bold">{leaveSummary.total_other_taken}</div>
                                                  </div>
                                             </div>
                                        </div>
                                   ) : (
                                        <div className="text-muted small">Loading summary...</div>
                                   )
                              ) : (
                                   <div className="text-muted small">Select an employee to see their leave summary.</div>
                              )}
                         </div>
                    </div>
               </div>

               {showNewRequestModal && (
                    <div className="position-fixed top-0 start-0 w-100 h-100" style={{ zIndex: 1060 }}>
                         <div className="position-absolute top-0 start-0 w-100 h-100 bg-dark bg-opacity-50" onClick={closeNewRequestModal} />
                         <div className="position-relative h-100 d-flex align-items-center justify-content-center p-3">
                              <div className="border rounded shadow-lg w-100" style={{ maxWidth: '760px', backgroundColor: 'var(--bs-body-bg)' }}>
                                   <div className="d-flex justify-content-between align-items-center px-4 py-3 border-bottom">
                                        <div>
                                             <h5 className="fw-semibold mb-1">{editingRequestId ? 'Update Leave Request' : 'New Leave Request'}</h5>
                                             <p className="text-muted mb-0 small">{editingRequestId ? 'Update the selected leave request' : 'Create a leave request for any employee'}</p>
                                        </div>
                                        <button type="button" className="btn btn-outline-secondary btn-sm" onClick={closeNewRequestModal}>
                                             <RiCloseLine size={16} />
                                        </button>
                                   </div>

                                   <form onSubmit={handleSubmit} className="p-4"><fieldset disabled={submitting} className={screens.formFields}>
                                        <div className="row g-3 mb-3">
                                             <div className="col-md-6">
                                                  <label className="form-label fw-medium">Employee <span className="text-danger" aria-hidden="true">*</span></label>
                                                  <select aria-label="Employee" className="form-select" name="employeeid" value={formData.employeeid} onChange={handleChange} disabled={employeesLoading} required>
                                                       <option value="">Select employee</option>
                                                       {employees.map((employee) => (
                                                            <option key={employee.employeeid} value={employee.employeeid}>
                                                                 {employee.username} - {employee.role}
                                                            </option>
                                                       ))}
                                                  </select>
                                             </div>
                                             <div className="col-md-6">
                                                  <label className="form-label fw-medium">Leave Type <span className="text-danger" aria-hidden="true">*</span></label>
                                                  <select aria-label="Leave Type" name="leave_type" className="form-select" value={formData.leave_type} onChange={handleChange} required>
                                                       {LEAVE_TYPES.map((type) => (
                                                            <option key={type} value={type}>
                                                                 {type.replace('_', ' ')}
                                                            </option>
                                                       ))}
                                                  </select>
                                             </div>
                                        </div>

                                        <div className="row g-3 mb-3">
                                             <div className="col-md-4">
                                                  <label className="form-label fw-medium">Start Date <span className="text-danger" aria-hidden="true">*</span></label>
                                                  <input aria-label="Start Date" type="date" name="start_date" className="form-control" value={formData.start_date} onChange={handleChange} required />
                                             </div>
                                             <div className="col-md-4">
                                                  <label className="form-label fw-medium">End Date <span className="text-danger" aria-hidden="true">*</span></label>
                                                  <input aria-label="End Date" type="date" name="end_date" className="form-control" value={formData.end_date} onChange={handleChange} min={formData.start_date} required />
                                             </div>
                                             <div className="col-md-4">
                                                  <label className="form-label fw-medium">Total Days <span className="text-danger" aria-hidden="true">*</span></label>
                                                  <input aria-label="Total Days" type="number" min="1" step="1" name="total_days" className="form-control" value={formData.total_days} onChange={handleChange} required />
                                             </div>
                                        </div>

                                        <div className="row g-3 mb-3">
                                             <div className="col-md-6">
                                                  <label className="form-label fw-medium">Applied Date <span className="text-danger" aria-hidden="true">*</span></label>
                                                  <input aria-label="Applied Date" type="date" name="applied_date" className="form-control" value={formData.applied_date} onChange={handleChange} required />
                                             </div>
                                             <div className="col-md-6 d-flex align-items-end">
                                                  <div className="form-check mb-0">
                                                       <input className="form-check-input" type="checkbox" id="affects_salary" name="affects_salary" checked={formData.affects_salary} onChange={handleChange} />
                                                       <label className="form-check-label" htmlFor="affects_salary">
                                                            Affects salary
                                                       </label>
                                                  </div>
                                             </div>
                                        </div>

                                        <div className="mb-3">
                                             <label className="form-label fw-medium">Reason</label>
                                             <textarea aria-label="Reason" name="reason" className="form-control" rows={3} value={formData.reason} onChange={handleChange} placeholder="Optional explanation for the request" />
                                        </div>

                                        <div className="mb-4">
                                             <label className="form-label fw-medium">Attachments</label>
                                             <input aria-label="Attachments" type="text" name="attachments" className="form-control" value={formData.attachments} onChange={handleChange} placeholder="Optional file path or upload reference" />
                                        </div>

                                        <div className="d-flex justify-content-end gap-2">
                                             <button type="button" className="btn btn-outline-secondary" onClick={closeNewRequestModal}>
                                                  Cancel
                                             </button>
                                             <button type="submit" className="btn btn-primary d-flex align-items-center" disabled={submitting} style={{ backgroundColor: COLOR_ACCENT, borderColor: COLOR_ACCENT }}>
                                                  {submitting ? (
                                                       <>
                                                            <RiLoader4Line size={18} className="me-1 animate-spin" />
                                                            {editingRequestId ? 'Updating...' : 'Saving...'}
                                                       </>
                                                  ) : (
                                                       <>
                                                            <RiSaveLine size={18} className="me-1" />
                                                            {editingRequestId ? 'Update Request' : 'Submit Request'}
                                                       </>
                                                  )}
                                             </button>
                                        </div>
                                   </fieldset></form>
                              </div>
                         </div>
                    </div>
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
