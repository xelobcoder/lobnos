'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { customFetch } from '../../../../../components/Auth/customFetch';
import {
     CompensationTypeBadge
} from '../../../../../components/HR/Payroll/StatusBadges';
import {
     currencyFormatter,
     formatDate,
     getPaymentMethodLabel,
     getPaymentFrequencyLabel
} from '../../../../../components/HR/Payroll/utils';
import Loader from '../../../../../components/isLoading';
import {
     RiCheckboxCircleLine,
     RiAddLine,
     RiEyeLine,
     RiSearchLine,
     RiFilterLine
} from '@remixicon/react';

interface Compensation {
     id: number;
     employeeid: number;
     employee_name?: string;
     compensation_type: string;
     salary?: number;
     hourly_rate?: number;
     commission_rate?: number;
     payment_frequency: string;
     payment_method: string;
     bank_name?: string;
     account_number?: string;
     status: string;
     effective_from: string;
     effective_to?: string;
}

const COLOR_ACCENT = 'oklch(0.646 0.222 41.116)';

export default function ActiveCompensationPage() {
     const [compensations, setCompensations] = useState<Compensation[]>([]);
     const [filteredCompensations, setFilteredCompensations] = useState<Compensation[]>([]);
     const [loading, setLoading] = useState(true);
     const [searchTerm, setSearchTerm] = useState('');
     const [typeFilter, setTypeFilter] = useState<string>('all');
     const [sortBy, setSortBy] = useState<'employee' | 'salary' | 'date'>('employee');

     useEffect(() => {
          fetchActiveCompensations();
     }, []);

     useEffect(() => {
          applyFilters();
     }, [compensations, searchTerm, typeFilter, sortBy]);

     const fetchActiveCompensations = async () => {
          setLoading(true);
          try {
               const response = await customFetch('payroll/compensation/active');
               if (response?.status === 'success' && response?.statusCode === 200) {
                    setCompensations(response.result || []);
               }
          } finally {
               setLoading(false);
          }
     };

     const applyFilters = () => {
          let filtered = [...compensations];

          // Search filter
          if (searchTerm) {
               filtered = filtered.filter(comp =>
                    comp.employeeid.toString().includes(searchTerm) ||
                    comp.employee_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    comp.bank_name?.toLowerCase().includes(searchTerm.toLowerCase())
               );
          }

          // Type filter
          if (typeFilter !== 'all') {
               filtered = filtered.filter(comp => comp.compensation_type === typeFilter);
          }

          // Sorting
          filtered.sort((a, b) => {
               if (sortBy === 'employee') {
                    return (a.employee_name || '').localeCompare(b.employee_name || '');
               } else if (sortBy === 'salary') {
                    const valueA = a.salary || a.hourly_rate || a.commission_rate || 0;
                    const valueB = b.salary || b.hourly_rate || b.commission_rate || 0;
                    return valueB - valueA;
               } else if (sortBy === 'date') {
                    return new Date(b.effective_from).getTime() - new Date(a.effective_from).getTime();
               }
               return 0;
          });

          setFilteredCompensations(filtered);
     };

     const getCompensationValue = (comp: Compensation): string => {
          if (comp.compensation_type === 'salary') {
               return currencyFormatter.format(comp.salary || 0);
          } else if (comp.compensation_type === 'hourly') {
               return `${currencyFormatter.format(comp.hourly_rate || 0)}/hr`;
          } else if (comp.compensation_type === 'commission') {
               return `${(comp.commission_rate || 0).toFixed(1)}%`;
          } else if (comp.compensation_type === 'hybrid') {
               return `${currencyFormatter.format(comp.salary || 0)} + ${(comp.commission_rate || 0).toFixed(1)}%`;
          }
          return 'N/A';
     };

     // Calculate statistics
     const totalActive = compensations.length;
     const salaryBased = compensations.filter(c => c.compensation_type === 'salary' || c.compensation_type === 'hybrid').length;
     const totalMonthlyCost = compensations
          .filter(c => c.payment_frequency === 'monthly' && (c.salary || 0) > 0)
          .reduce((sum, c) => sum + (c.salary || 0), 0);

     if (loading) return <Loader />;

     return (
          <div className="container-fluid px-4 py-3">
               {/* Header */}
               <div className="d-flex justify-content-between align-items-center mb-4">
                    <div className="d-flex align-items-center">
                         <RiCheckboxCircleLine size={28} style={{ color: COLOR_ACCENT }} className="me-2" />
                         <div>
                              <h1 className="h4 mb-0 fw-bold">Active Compensations</h1>
                              <p className="text-muted mb-0 small">
                                   {filteredCompensations.length} of {totalActive} active compensation records
                              </p>
                         </div>
                    </div>
                    <Link href="/human-resource/payroll/compensation/create" className="btn btn-primary btn-sm" style={{ backgroundColor: COLOR_ACCENT, borderColor: COLOR_ACCENT }}>
                         <RiAddLine size={18} className="me-1" />
                         Add Compensation
                    </Link>
               </div>

               {/* Statistics Cards */}
               <div className="row g-3 mb-4">
                    <div className="col-md-4">
                         <div className="border rounded p-3" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                              <div className="d-flex align-items-center mb-2">
                                   <RiCheckboxCircleLine size={20} className="me-2 text-success" />
                                   <span className="fw-medium text-muted small">Total Active</span>
                              </div>
                              <div className="fs-4 fw-bold">{totalActive}</div>
                         </div>
                    </div>
                    <div className="col-md-4">
                         <div className="border rounded p-3" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                              <div className="d-flex align-items-center mb-2">
                                   <RiCheckboxCircleLine size={20} className="me-2 text-info" />
                                   <span className="fw-medium text-muted small">Salary-Based</span>
                              </div>
                              <div className="fs-4 fw-bold">{salaryBased}</div>
                         </div>
                    </div>
                    <div className="col-md-4">
                         <div className="border rounded p-3" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                              <div className="d-flex align-items-center mb-2">
                                   <RiCheckboxCircleLine size={20} className="me-2 text-warning" />
                                   <span className="fw-medium text-muted small">Monthly Payroll Cost</span>
                              </div>
                              <div className="fs-5 fw-bold">{currencyFormatter.format(totalMonthlyCost)}</div>
                         </div>
                    </div>
               </div>

               {/* Filters */}
               <div className="border rounded p-3 mb-4" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                    <div className="row g-3">
                         <div className="col-md-5">
                              <div className="input-group input-group-sm">
                                   <span className="input-group-text bg-transparent">
                                        <RiSearchLine size={16} />
                                   </span>
                                   <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Search by employee, bank..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                   />
                              </div>
                         </div>
                         <div className="col-md-3">
                              <select
                                   className="form-select form-select-sm"
                                   value={typeFilter}
                                   onChange={(e) => setTypeFilter(e.target.value)}
                              >
                                   <option value="all">All Types</option>
                                   <option value="salary">Salary</option>
                                   <option value="hourly">Hourly</option>
                                   <option value="commission">Commission</option>
                                   <option value="hybrid">Hybrid</option>
                              </select>
                         </div>
                         <div className="col-md-4">
                              <select
                                   className="form-select form-select-sm"
                                   value={sortBy}
                                   onChange={(e) => setSortBy(e.target.value as any)}
                              >
                                   <option value="employee">Sort by Employee</option>
                                   <option value="salary">Sort by Value</option>
                                   <option value="date">Sort by Date</option>
                              </select>
                         </div>
                    </div>
               </div>

               {/* Compensation List */}
               {filteredCompensations.length === 0 ? (
                    <div className="text-center py-5">
                         <RiCheckboxCircleLine size={48} className="text-muted mb-3" />
                         <h5 className="fw-medium mb-2">No Active Compensations Found</h5>
                         <p className="text-muted mb-3">
                              {searchTerm || typeFilter !== 'all'
                                   ? 'Try adjusting your filters'
                                   : 'No employees have active compensation records'}
                         </p>
                         <Link href="/human-resource/payroll/compensation/create" className="btn btn-primary" style={{ backgroundColor: COLOR_ACCENT, borderColor: COLOR_ACCENT }}>
                              <RiAddLine size={18} className="me-2" />
                              Add Compensation
                         </Link>
                    </div>
               ) : (
                    <div className="table-responsive">
                         <table className="table table-hover align-middle">
                              <thead className="table-light">
                                   <tr>
                                        <th>Employee ID</th>
                                        <th>Employee Name</th>
                                        <th>Type</th>
                                        <th>Value</th>
                                        <th>Frequency</th>
                                        <th>Payment Method</th>
                                        <th>Bank Details</th>
                                        <th>Effective From</th>
                                        <th>Effective To</th>
                                        <th className="text-end">Actions</th>
                                   </tr>
                              </thead>
                              <tbody>
                                   {filteredCompensations.map((comp) => (
                                        <tr key={comp.id}>
                                             <td className="fw-medium">{comp.employeeid}</td>
                                             <td>{comp.employee_name || 'N/A'}</td>
                                             <td>
                                                  <CompensationTypeBadge type={comp.compensation_type} />
                                             </td>
                                             <td className="fw-bold">{getCompensationValue(comp)}</td>
                                             <td>{getPaymentFrequencyLabel(comp.payment_frequency)}</td>
                                             <td>{getPaymentMethodLabel(comp.payment_method)}</td>
                                             <td>
                                                  {comp.payment_method === 'bank_transfer' ? (
                                                       <div className="small">
                                                            <div className="fw-medium">{comp.bank_name || 'N/A'}</div>
                                                            <div className="text-muted">{comp.account_number || 'N/A'}</div>
                                                       </div>
                                                  ) : (
                                                       <span className="text-muted">—</span>
                                                  )}
                                             </td>
                                             <td>{formatDate(comp.effective_from)}</td>
                                             <td>
                                                  {comp.effective_to ? (
                                                       formatDate(comp.effective_to)
                                                  ) : (
                                                       <span className="badge bg-success-subtle text-success">Ongoing</span>
                                                  )}
                                             </td>
                                             <td>
                                                  <div className="d-flex gap-1 justify-content-end">
                                                       <Link
                                                            href={`/human-resource/payroll/compensation/${comp.id}`}
                                                            className="btn btn-sm btn-outline-primary"
                                                            title="View Details"
                                                       >
                                                            <RiEyeLine size={16} />
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
     );
}
