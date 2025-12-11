'use client';

import {
     RiMoneyDollarCircleLine,
     RiArrowLeftLine,
     RiEditLine,
     RiDeleteBinLine,
     RiUserLine,
     RiBankLine,
     RiSmartphoneLine,
     RiCalendarLine,
     RiFileTextLine
} from '@remixicon/react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Loader from '../../../../../components/accessories/Loader';
import { customPost, currencyFormatter, customFetch } from '../../../../../components/Auth/customFetch';
import { CompensationTypeBadge, CompensationStatusBadge } from '../../../../../components/HR/Payroll/StatusBadges';
import { getPaymentFrequencyLabel, getPaymentMethodLabel } from '../../../../../components/HR/Payroll/utils';
import { formatDate } from '../../../../../components/operations/Laboratory/Lib';

interface Compensation {
     id: number;
     employeeid: number;
     employee_name?: string;
     compensation_type: 'salary' | 'hourly' | 'commission' | 'hybrid';
     basic_salary?: number;
     salary_grade?: string;
     salary_grade_id?: number;
     currency: string;
     hourly_rate?: number;
     overtime_rate_multiplier?: number;
     commission_percentage?: number;
     commission_target?: number;
     payment_frequency: 'monthly' | 'bi-weekly' | 'weekly';
     payment_method: 'bank_transfer' | 'cash' | 'cheque' | 'mobile_money';
     bank_name?: string;
     bank_account_number?: string;
     bank_branch?: string;
     mobile_money_number?: string;
     mobile_money_network?: string;
     is_active: boolean;
     effective_from: string;
     effective_to?: string;
     notes?: string;
     created_at: string;
     created_by?: number;
     updated_at?: string;
     updated_by?: number;
}

interface SalaryGrade {
     id: number;
     grade_name: string;
     grade_level: string;
     min_salary: number | null;
     max_salary: number | null;
     description: string | null;
     currency: string;
     is_active: boolean;
}

const COLOR_ACCENT = 'oklch(0.646 0.222 41.116)';

export default function CompensationDetailPage() {
     const params = useParams();
     const router = useRouter();
     const compensationId = params.id as string;

     const [compensation, setCompensation] = useState<Compensation | null>(null);
     const [salaryGrade, setSalaryGrade] = useState<SalaryGrade | null>(null);
     const [loading, setLoading] = useState(true);
     const [deleting, setDeleting] = useState(false);

     useEffect(() => {
          fetchCompensationDetails();
     }, [compensationId]);

     const fetchCompensationDetails = async () => {
          setLoading(true);
          try {
               // Fetch compensation details
               const response = await customFetch(`payroll/compensation/${compensationId}`);
               if (response?.status === 'success' && response?.statusCode === 200) {
                    const compData = response.result;
                    setCompensation(compData);

                    // If compensation has a salary grade ID, fetch the grade details
                    if (compData.salary_grade_id) {
                         try {
                              const gradeResponse = await customFetch(`payroll/salary-grades/${compData.salary_grade_id}`);
                              if (gradeResponse?.status === 'success' && gradeResponse?.statusCode === 200) {
                                   setSalaryGrade(gradeResponse.result);
                              }
                         } catch (gradeError) {
                              console.error('Error fetching salary grade:', gradeError);
                         }
                    }
               }
          } finally {
               setLoading(false);
          }
     };

     const handleDelete = async () => {
          if (!confirm('Are you sure you want to delete this compensation record? This action cannot be undone.')) {
               return;
          }

          setDeleting(true);
          try {
               const response = await customPost(`payroll/compensation/${compensationId}`, 'DELETE', {});
               if (response?.status === 'success') {
                    alert('Compensation deleted successfully');
                    router.push('/human-resource/payroll/compensation');
               }
          } catch (err) {
               alert('Error deleting compensation');
          } finally {
               setDeleting(false);
          }
     };

     const getCompensationValue = (): string => {
          if (!compensation) return 'N/A';

          if (compensation.compensation_type === 'salary') {
               return `${compensation.currency} ${currencyFormatter.format(compensation.basic_salary || 0)}`;
          } else if (compensation.compensation_type === 'hourly') {
               return `${compensation.currency} ${currencyFormatter.format(compensation.hourly_rate || 0)}/hr`;
          } else if (compensation.compensation_type === 'commission') {
               return `${(Number(compensation.commission_percentage) || 0).toFixed(1)}%`;
          } else if (compensation.compensation_type === 'hybrid') {
               return `${compensation.currency} ${currencyFormatter.format(compensation.basic_salary || 0)} + ${(Number(compensation.commission_percentage) || 0).toFixed(1)}%`;
          }
          return 'N/A';
     };

     if (loading) return <Loader />;
     if (!compensation) {
          return (
               <div className="container-fluid px-4 py-3">
                    <div className="text-center py-5">
                         <h5 className="fw-medium mb-2">Compensation Not Found</h5>
                         <Link href="/human-resource/payroll/compensation" className="btn btn-primary">
                              Back to Compensation List
                         </Link>
                    </div>
               </div>
          );
     }

     return (
          <div className="container-fluid px-4 py-3">
               {/* Header */}
               <div className="d-flex justify-content-between align-items-start mb-4">
                    <div className="d-flex align-items-center">
                         <Link href="/human-resource/payroll/compensation" className="btn btn-outline-secondary btn-sm me-3">
                              <RiArrowLeftLine size={18} />
                         </Link>
                         <div>
                              <div className="d-flex align-items-center mb-1">
                                   <RiMoneyDollarCircleLine size={28} style={{ color: COLOR_ACCENT }} className="me-2" />
                                   <h1 className="h4 mb-0 fw-bold">Compensation Details</h1>
                              </div>
                              <p className="text-muted mb-0 small">Compensation ID: {compensation.id}</p>
                         </div>
                    </div>
                    <div className="d-flex gap-2">
                         <Link
                              href={`/human-resource/payroll/compensation/${compensation.id}/edit`}
                              className="btn btn-outline-primary btn-sm"
                         >
                              <RiEditLine size={18} className="me-1" />
                              Edit
                         </Link>
                         <button
                              className="btn btn-outline-danger btn-sm"
                              onClick={handleDelete}
                              disabled={deleting}
                         >
                              <RiDeleteBinLine size={18} className="me-1" />
                              {deleting ? 'Deleting...' : 'Delete'}
                         </button>
                    </div>
               </div>

               <div className="row">
                    <div className="col-lg-8">
                         {/* Employee Information */}
                         <div className="border rounded p-4 mb-4" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                              <div className="d-flex align-items-center mb-3">
                                   <RiUserLine size={20} className="me-2 text-primary" />
                                   <h5 className="mb-0 fw-semibold">Employee Information</h5>
                              </div>
                              <div className="row g-3">
                                   <div className="col-md-6">
                                        <div className="small text-muted mb-1">Employee ID</div>
                                        <div className="fw-medium">{compensation.employeeid}</div>
                                   </div>
                                   <div className="col-md-6">
                                        <div className="small text-muted mb-1">Employee Name</div>
                                        <div className="fw-medium">{compensation.employee_name || 'N/A'}</div>
                                   </div>
                              </div>
                         </div>

                         {/* Compensation Details */}
                         <div className="border rounded p-4 mb-4" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                              <div className="d-flex align-items-center mb-3">
                                   <RiMoneyDollarCircleLine size={20} className="me-2 text-success" />
                                   <h5 className="mb-0 fw-semibold">Compensation Details</h5>
                              </div>
                              <div className="row g-3">
                                   <div className="col-md-6">
                                        <div className="small text-muted mb-1">Compensation Type</div>
                                        <div><CompensationTypeBadge type={compensation.compensation_type} /></div>
                                   </div>
                                   <div className="col-md-6">
                                        <div className="small text-muted mb-1">Status</div>
                                        <div><CompensationStatusBadge isActive={compensation.is_active} /></div>
                                   </div>
                                   <div className="col-md-6">
                                        <div className="small text-muted mb-1">Value</div>
                                        <div className="fw-bold fs-5" style={{ color: COLOR_ACCENT }}>
                                             {getCompensationValue()}
                                        </div>
                                   </div>
                                   <div className="col-md-6">
                                        <div className="small text-muted mb-1">Payment Frequency</div>
                                        <div className="fw-medium">{getPaymentFrequencyLabel(compensation.payment_frequency)}</div>
                                   </div>

                                   {/* Show individual compensation components */}
                                   {compensation.basic_salary && (
                                        <div className="col-md-6">
                                             <div className="small text-muted mb-1">Base Salary</div>
                                             <div className="fw-medium">{compensation.currency} {currencyFormatter.format(compensation.basic_salary)}</div>
                                        </div>
                                   )}
                                   {compensation.salary_grade && (
                                        <div className="col-md-6">
                                             <div className="small text-muted mb-1">Salary Grade</div>
                                             <div className="fw-medium">
                                                  <span className="badge bg-info-subtle text-info me-2">
                                                       {compensation.salary_grade}
                                                  </span>
                                                  {salaryGrade && (
                                                       <small className="text-muted">
                                                            ({salaryGrade.grade_level})
                                                       </small>
                                                  )}
                                             </div>
                                             {salaryGrade && (
                                                  <div className="mt-2 small">
                                                       {salaryGrade.min_salary && salaryGrade.max_salary && (
                                                            <div className="text-muted">
                                                                 Range: {salaryGrade.currency} {currencyFormatter.format(salaryGrade.min_salary)} - {currencyFormatter.format(salaryGrade.max_salary)}
                                                            </div>
                                                       )}
                                                       {salaryGrade.description && (
                                                            <div className="text-muted mt-1">
                                                                 {salaryGrade.description}
                                                            </div>
                                                       )}
                                                  </div>
                                             )}
                                        </div>
                                   )}
                                   {compensation.hourly_rate && (
                                        <div className="col-md-6">
                                             <div className="small text-muted mb-1">Hourly Rate</div>
                                             <div className="fw-medium">{compensation.currency} {currencyFormatter.format(compensation.hourly_rate)}/hr</div>
                                        </div>
                                   )}
                                   {compensation.overtime_rate_multiplier && (
                                        <div className="col-md-6">
                                             <div className="small text-muted mb-1">Overtime Multiplier</div>
                                             <div className="fw-medium">{compensation.overtime_rate_multiplier}x</div>
                                        </div>
                                   )}
                                   {compensation.commission_percentage && (
                                        <div className="col-md-6">
                                             <div className="small text-muted mb-1">Commission Rate</div>
                                             <div className="fw-medium">{compensation.commission_percentage.toFixed(1)}%</div>
                                        </div>
                                   )}
                                   {compensation.commission_target && (
                                        <div className="col-md-6">
                                             <div className="small text-muted mb-1">Commission Target</div>
                                             <div className="fw-medium">{compensation.currency} {currencyFormatter.format(compensation.commission_target)}</div>
                                        </div>
                                   )}
                              </div>
                         </div>

                         {/* Payment Details */}
                         <div className="border rounded p-4 mb-4" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                              <div className="d-flex align-items-center mb-3">
                                   {compensation.payment_method === 'bank_transfer' ? (
                                        <RiBankLine size={20} className="me-2 text-info" />
                                   ) : (
                                        <RiSmartphoneLine size={20} className="me-2 text-info" />
                                   )}
                                   <h5 className="mb-0 fw-semibold">Payment Details</h5>
                              </div>
                              <div className="row g-3">
                                   <div className="col-12">
                                        <div className="small text-muted mb-1">Payment Method</div>
                                        <div className="fw-medium">{getPaymentMethodLabel(compensation.payment_method)}</div>
                                   </div>

                                   {compensation.payment_method === 'bank_transfer' && (
                                        <>
                                             <div className="col-md-6">
                                                  <div className="small text-muted mb-1">Bank Name</div>
                                                  <div className="fw-medium">{compensation.bank_name || 'N/A'}</div>
                                             </div>
                                             <div className="col-md-6">
                                                  <div className="small text-muted mb-1">Account Number</div>
                                                  <div className="fw-medium font-monospace">{compensation.bank_account_number || 'N/A'}</div>
                                             </div>
                                             {compensation.bank_branch && (
                                                  <div className="col-md-6">
                                                       <div className="small text-muted mb-1">Bank Branch</div>
                                                       <div className="fw-medium">{compensation.bank_branch}</div>
                                                  </div>
                                             )}
                                        </>
                                   )}

                                   {compensation.payment_method === 'mobile_money' && (
                                        <>
                                             <div className="col-md-6">
                                                  <div className="small text-muted mb-1">Mobile Money Number</div>
                                                  <div className="fw-medium font-monospace">{compensation.mobile_money_number || 'N/A'}</div>
                                             </div>
                                             <div className="col-md-6">
                                                  <div className="small text-muted mb-1">Network</div>
                                                  <div className="fw-medium">{compensation.mobile_money_network || 'N/A'}</div>
                                             </div>
                                        </>
                                   )}
                              </div>
                         </div>

                         {/* Notes */}
                         {compensation.notes && (
                              <div className="border rounded p-4 mb-4" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                                   <div className="d-flex align-items-center mb-3">
                                        <RiFileTextLine size={20} className="me-2 text-secondary" />
                                        <h5 className="mb-0 fw-semibold">Notes</h5>
                                   </div>
                                   <p className="mb-0 text-muted">{compensation.notes}</p>
                              </div>
                         )}
                    </div>

                    {/* Sidebar */}
                    <div className="col-lg-4">
                         {/* Effective Dates */}
                         <div className="border rounded p-4 mb-4" style={{ backgroundColor: 'var(--bs-tertiary-bg)' }}>
                              <div className="d-flex align-items-center mb-3">
                                   <RiCalendarLine size={20} className="me-2 text-warning" />
                                   <h5 className="mb-0 fw-semibold">Effective Period</h5>
                              </div>
                              <div className="mb-3">
                                   <div className="small text-muted mb-1">Effective From</div>
                                   <div className="fw-medium">{formatDate(compensation.effective_from)}</div>
                              </div>
                              <div>
                                   <div className="small text-muted mb-1">Effective To</div>
                                   <div className="fw-medium">
                                        {compensation.effective_to ? formatDate(compensation.effective_to) : 'Ongoing'}
                                   </div>
                              </div>
                         </div>

                         {/* Audit Information */}
                         <div className="border rounded p-4" style={{ backgroundColor: 'var(--bs-tertiary-bg)' }}>
                              <h5 className="mb-3 fw-semibold">Audit Information</h5>
                              <div className="mb-3">
                                   <div className="small text-muted mb-1">Created</div>
                                   <div className="fw-medium small">{formatDate(compensation.created_at)}</div>
                                   {compensation.created_by && (
                                        <div className="small text-muted">By User ID: {compensation.created_by}</div>
                                   )}
                              </div>
                              {compensation.updated_at && (
                                   <div>
                                        <div className="small text-muted mb-1">Last Updated</div>
                                        <div className="fw-medium small">{formatDate(compensation.updated_at)}</div>
                                        {compensation.updated_by && (
                                             <div className="small text-muted">By User ID: {compensation.updated_by}</div>
                                        )}
                                   </div>
                              )}
                         </div>
                    </div>
               </div>
          </div>
     );
}
