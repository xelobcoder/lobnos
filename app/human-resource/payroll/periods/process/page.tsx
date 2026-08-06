'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { customFetch, customPost } from '../../../../../components/Auth/customFetch';
import { useApplicationSettings } from '../../../../../components/Auth/useApplicationContext';
import { currencyFormatter } from '../../../../../components/HR/Payroll/utils';
import {
     RiCheckboxCircleLine,
     RiArrowLeftLine,
     RiLoader4Line,
     RiUserLine,
     RiMoneyDollarCircleLine,
     RiAlertLine,
     RiCalendarLine
} from '@remixicon/react';

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

interface PayrollPeriod {
     id: number;
     period_name: string;
     period_start_date: string;
     period_end_date: string;
     status: string;
}

const COLOR_ACCENT = 'oklch(0.646 0.222 41.116)';

export default function ProcessPayrollPage() {
     const router = useRouter();
     const searchParams = useSearchParams();
     const periodId = searchParams?.get('periodId');
     const { applicationsettings } = useApplicationSettings();
     const { user } = applicationsettings || {};

     const [period, setPeriod] = useState<PayrollPeriod | null>(null);
     const [availablePeriods, setAvailablePeriods] = useState<PayrollPeriod[]>([]);
     const [employees, setEmployees] = useState<Employee[]>([]);
     const [selectedEmployees, setSelectedEmployees] = useState<number[]>([]);
     const [loading, setLoading] = useState(true);
     const [loadingPeriods, setLoadingPeriods] = useState(false);
     const [processing, setProcessing] = useState(false);
     const [error, setError] = useState<string | null>(null);
     const [searchTerm, setSearchTerm] = useState('');

     useEffect(() => {
          fetchAvailablePeriods();
          if (periodId) {
               fetchPeriodDetails();
          }
          fetchEmployees();
     }, [periodId]);

     const fetchAvailablePeriods = async () => {
          setLoadingPeriods(true);
          try {
               const response = await customFetch('payroll/periods?status=open');
               if (response?.status === 'success' && response?.statusCode === 200) {
                    setAvailablePeriods(response.result || []);
               }
          } catch (err) {
               console.error('Error fetching periods:', err);
          } finally {
               setLoadingPeriods(false);
          }
     };

     const fetchPeriodDetails = async () => {
          try {
               const response = await customFetch(`payroll/periods/${periodId}`);
               if (response?.status === 'success') {
                    setPeriod(response.result);
               } else {
                    setError('Failed to load selected period');
               }
          } catch (err) {
               console.error('Error fetching period:', err);
               setError('Error loading period details');
          }
     };

     const fetchEmployees = async () => {
          setLoading(true);
          try {
               // Fetch all employees
               const employeesResponse = await customFetch('logins');
               if (employeesResponse?.status === 'success' && employeesResponse?.statusCode === 200) {
                    const allEmployees = employeesResponse.result || [];

                    // Fetch active compensations to filter employees with compensation
                    const compResponse = await customFetch('payroll/compensation?status=active');
                    if (compResponse?.status === 'success' && compResponse?.statusCode === 200) {
                         const compensations = compResponse.result || [];
                         const employeeIdsWithCompensation = new Set(compensations.map((comp: any) => comp.employeeid));

                         // Filter employees who have active compensation
                         const employeesWithCompensation = allEmployees.filter((emp: Employee) =>
                              employeeIdsWithCompensation.has(emp.employeeid)
                         );

                         setEmployees(employeesWithCompensation);
                    } else {
                         // If compensation fetch fails, show all employees
                         setEmployees(allEmployees);
                    }
               }
          } catch (err: any) {
               setError(err?.message || 'Error fetching employees');
          } finally {
               setLoading(false);
          }
     };

     const handleSelectAll = () => {
          if (selectedEmployees.length === filteredEmployees.length) {
               setSelectedEmployees([]);
          } else {
               setSelectedEmployees(filteredEmployees.map(emp => emp.employeeid));
          }
     };

     const handleSelectEmployee = (employeeId: number) => {
          setSelectedEmployees(prev =>
               prev.includes(employeeId)
                    ? prev.filter(id => id !== employeeId)
                    : [...prev, employeeId]
          );
     };

     const handleProcessPayroll = async () => {
          if (selectedEmployees.length === 0) {
               alert('Please select at least one employee');
               return;
          }

          if (!periodId) {
               alert('Period ID is required');
               return;
          }

          if (!user?.employeeid) {
               alert('User information not available');
               return;
          }

          setProcessing(true);
          setError(null);

          try {
               const response = await customPost(
                    `payroll/periods/${periodId}/process`,
                    'POST',
                    {
                         employeeIds: selectedEmployees,
                         calculated_by: user.employeeid
                    }
               );

               if (response?.status === 'success' && (!response?.result?.errors || response?.result?.errors.length === 0)) {
                    alert(`Payroll processed successfully for ${response.result.processed_count} employees`);
                    router.push(`/human-resource/payroll/periods/${periodId}`);
               } else if (response?.result?.errors && response.result.errors.length > 0) {
                    const errors = response.result.errors.map((err: any) => { return JSON.parse(err.error) })
                    const result = errors.map((err: any) => { return Array.isArray(err) ? err[0]?.message : null });
                    setError(result.join(","));
               } else {
                    setError(response?.message || 'Failed to process payroll');
               }
          } catch (err: any) {
               setError(err?.message || 'Error processing payroll');
          } finally {
               setProcessing(false);
          }
     };

     const handleSelectPeriod = (selectedPeriod: PayrollPeriod) => {
          setPeriod(selectedPeriod);
          // Update URL with selected period
          const newUrl = new URL(window.location.href);
          newUrl.searchParams.set('periodId', selectedPeriod.id.toString());
          window.history.replaceState({}, '', newUrl.toString());
     };

     const filteredEmployees = employees.filter(emp =>
          emp.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
          emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          emp.role.toLowerCase().includes(searchTerm.toLowerCase())
     );

     if (loading) {
          return (
               <div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '400px' }}>
                    <RiLoader4Line size={48} className="animate-spin mb-3" style={{ color: COLOR_ACCENT }} />
                    <p className="text-muted">Loading employees...</p>
               </div>
          );
     }

     return (
          <div className="container-fluid px-4 py-3">
               {/* Header */}
               <div className="d-flex align-items-center justify-content-between mb-4">
                    <div className="d-flex align-items-center">
                         <Link href="/human-resource/payroll/periods" className="btn btn-outline-secondary btn-sm me-3">
                              <RiArrowLeftLine size={18} />
                         </Link>
                         <div>
                              <h1 className="h4 mb-0 fw-bold">Process Payroll</h1>
                              {period && (
                                   <p className="text-muted mb-0 small">
                                        {period.period_name} ({new Date(period.period_start_date).toLocaleDateString()} to {new Date(period.period_end_date).toLocaleDateString()})
                                   </p>
                              )}
                         </div>
                    </div>
                    <div className="d-flex gap-2">
                         {period && availablePeriods.length > 1 && (
                              <div className='col-auto'>
                                   <select
                                        className="form-select form-select-sm"
                                        value={period.id}
                                        onChange={(e) => {
                                             const selectedId = parseInt(e.target.value);
                                             const selectedPeriod = availablePeriods.find(p => p.id === selectedId);
                                             if (selectedPeriod) {
                                                  handleSelectPeriod(selectedPeriod);
                                             }
                                        }}
                                   >
                                        {availablePeriods.map((availablePeriod) => (
                                             <option key={availablePeriod.id} value={availablePeriod.id}>
                                                  {availablePeriod.period_name}
                                             </option>
                                        ))}
                                   </select>
                              </div>
                         )}
                         <Link href="/human-resource/payroll/periods/create" className="btn btn-primary btn-sm d-flex align-items-center">
                              <RiCalendarLine size={16} className="me-1" />
                              Create Period
                         </Link>
                    </div>
               </div>

               {error && (
                    <div className="alert alert-danger alert-dismissible fade show" role="alert">
                         <RiAlertLine size={20} className="me-2" />
                         {error}
                         <button type="button" className="btn-close" onClick={() => setError(null)}></button>
                    </div>
               )}

               {/* Period Selection */}
               {!period && (
                    <div className="border rounded p-4 mb-4" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                         <h5 className="mb-3 fw-semibold d-flex align-items-center">
                              <RiCalendarLine size={20} className="me-2" />
                              Select Payroll Period
                         </h5>
                         {loadingPeriods ? (
                              <div className="d-flex align-items-center py-2">
                                   <RiLoader4Line size={16} className="animate-spin me-2" style={{ color: COLOR_ACCENT }} />
                                   <span className="text-muted">Loading periods...</span>
                              </div>
                         ) : availablePeriods.length === 0 ? (
                              <div className="text-center py-4">
                                   <p className="text-muted mb-3">No open payroll periods available</p>
                                   <Link href="/human-resource/payroll/periods/create" className="btn btn-primary d-flex align-items-center mx-auto" style={{ width: 'fit-content' }}>
                                        <RiCalendarLine size={16} className="me-2" />
                                        Create New Period
                                   </Link>
                              </div>
                         ) : (
                              <div className="row g-3 align-items-end">
                                   <div className="col-md-8">
                                        <label htmlFor="periodSelect" className="form-label fw-medium">Available Periods</label>
                                        <select
                                             id="periodSelect"
                                             className="form-select"
                                             onChange={(e) => {
                                                  const selectedId = parseInt(e.target.value);
                                                  const selectedPeriod = availablePeriods.find(p => p.id === selectedId);
                                                  if (selectedPeriod) {
                                                       handleSelectPeriod(selectedPeriod);
                                                  }
                                             }}
                                             value=""
                                        >
                                             <option value="" disabled>Select a payroll period...</option>
                                             {availablePeriods.map((availablePeriod) => (
                                                  <option key={availablePeriod.id} value={availablePeriod.id}>
                                                       {availablePeriod.period_name} ({new Date(availablePeriod.period_start_date).toLocaleDateString()} - {new Date(availablePeriod.period_end_date).toLocaleDateString()})
                                                  </option>
                                             ))}
                                        </select>
                                   </div>

                              </div>
                         )}
                    </div>
               )}

               {/* Only show employee selection if period is selected */}
               {period && (
                    <>
                         <div className="row g-3 mb-4">
                              <div className="col-md-4">
                                   <div className="border rounded p-3" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                                        <div className="d-flex align-items-center mb-2">
                                             <RiUserLine size={20} className="me-2 text-info" />
                                             <span className="fw-medium text-muted small">Total Employees</span>
                                        </div>
                                        <div className="fs-4 fw-bold">{employees.length}</div>
                                   </div>
                              </div>
                              <div className="col-md-4">
                                   <div className="border rounded p-3" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                                        <div className="d-flex align-items-center mb-2">
                                             <RiCheckboxCircleLine size={20} className="me-2 text-success" />
                                             <span className="fw-medium text-muted small">Selected</span>
                                        </div>
                                        <div className="fs-4 fw-bold">{selectedEmployees.length}</div>
                                   </div>
                              </div>
                              <div className="col-md-4">
                                   <div className="border rounded p-3" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                                        <div className="d-flex align-items-center mb-2">
                                             <RiMoneyDollarCircleLine size={20} className="me-2 text-warning" />
                                             <span className="fw-medium text-muted small">Est. Processing</span>
                                        </div>
                                        <div className="fs-6 fw-bold">{selectedEmployees.length} calculations</div>
                                   </div>
                              </div>
                         </div>

                         {/* Employee Selection */}
                         <div className="border rounded p-4 mb-4" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                              <div className="d-flex justify-content-between align-items-center mb-3">
                                   <h5 className="mb-0 fw-semibold">Select Employees</h5>
                                   <div className="d-flex gap-2">
                                        <input
                                             type="text"
                                             className="form-control form-control-sm"
                                             placeholder="Search employees..."
                                             value={searchTerm}
                                             onChange={(e) => setSearchTerm(e.target.value)}
                                             style={{ width: '250px' }}
                                        />
                                        <button
                                             className="btn btn-sm btn-outline-primary"
                                             onClick={handleSelectAll}
                                        >
                                             {selectedEmployees.length === filteredEmployees.length ? 'Deselect All' : 'Select All'}
                                        </button>
                                   </div>
                              </div>

                              {filteredEmployees.length === 0 ? (
                                   <div className="text-center py-5">
                                        <p className="text-muted">No employees with active compensation found</p>
                                        <Link href="/human-resource/payroll/compensation/create" className="btn btn-primary mt-2">
                                             Set Up Compensation
                                        </Link>
                                   </div>
                              ) : (
                                   <div className="table-responsive">
                                        <table className="table table-hover table-sm">
                                             <thead className="table-light">
                                                  <tr>
                                                       <th style={{ width: '50px' }}>
                                                            <input
                                                                 type="checkbox"
                                                                 className="form-check-input"
                                                                 checked={selectedEmployees.length === filteredEmployees.length}
                                                                 onChange={handleSelectAll}
                                                            />
                                                       </th>
                                                       <th>Employee ID</th>
                                                       <th>Name</th>
                                                       <th>Email</th>
                                                       <th>Role</th>
                                                       <th>Branch</th>
                                                  </tr>
                                             </thead>
                                             <tbody>
                                                  {filteredEmployees.map((employee) => (
                                                       <tr key={employee.employeeid}>
                                                            <td>
                                                                 <input
                                                                      type="checkbox"
                                                                      className="form-check-input"
                                                                      checked={selectedEmployees.includes(employee.employeeid)}
                                                                      onChange={() => handleSelectEmployee(employee.employeeid)}
                                                                 />
                                                            </td>
                                                            <td>{employee.employeeid}</td>
                                                            <td className="fw-medium">{employee.username}</td>
                                                            <td>{employee.email || 'N/A'}</td>
                                                            <td>{employee.role || 'N/A'}</td>
                                                            <td>{employee.branchname || 'N/A'}</td>
                                                       </tr>
                                                  ))}
                                             </tbody>
                                        </table>
                                   </div>
                              )}
                         </div>

                         {/* Action Buttons */}
                         <div className="d-flex justify-content-between align-items-center">
                              <Link
                                   href={periodId ? `/human-resource/payroll/periods/${periodId}` : '/human-resource/payroll/periods'}
                                   className="btn btn-outline-secondary"
                              >
                                   Cancel
                              </Link>
                              <button
                                   className="btn btn-primary d-flex align-items-center"
                                   onClick={handleProcessPayroll}
                                   disabled={processing || selectedEmployees.length === 0}
                                   style={{ backgroundColor: COLOR_ACCENT, borderColor: COLOR_ACCENT }}
                              >
                                   {processing ? (
                                        <>
                                             <RiLoader4Line size={18} className="me-2 animate-spin" />
                                             Processing Payroll...
                                        </>
                                   ) : (
                                        <>
                                             <RiCheckboxCircleLine size={18} className="me-2" />
                                             Process {selectedEmployees.length} Employee{selectedEmployees.length !== 1 ? 's' : ''}
                                        </>
                                   )}
                              </button>
                         </div>

                    </>
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
