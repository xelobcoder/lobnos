'use client';
import screens from '../../PayrollScreens.module.css';


import {
     RiCalendarLine,
     RiArrowGoBackLine,
     RiLoader4Line,
     RiErrorWarningLine,
     RiInbox2Line,
     RiAlertLine,
     RiCloseLine,
     RiCheckLine,
     RiTimeLine
} from '@remixicon/react';
import { customFetch } from '../../../../../components/Auth/customFetch';
import { useState, useEffect } from 'react';
import { customPost } from '../../../../../components/Auth/customFetch';
import { useApplicationSettings } from '../../../../../components/Auth/useApplicationContext';

interface PayrollPeriod {
     id: number;
     period_name: string;
     period_year: number;
     period_month: number;
     period_start_date: string;
     period_end_date: string;
     status: 'draft' | 'calculated' | 'approved' | 'locked' | 'paid' | 'reversed';
     total_gross_salary: number;
     total_deductions: number;
     total_net_salary: number;
     employee_count: number;
     is_reversed?: boolean;
     reversed_at?: string;
     reversed_by?: number;
     reversal_reason?: string;
}

const COLOR_ACCENT = 'var(--pls-primary, #2e7d32)';
const COLOR_BORDER = 'var(--bs-border-color)';

const currencyFormatter = new Intl.NumberFormat('en-GH', {
     style: 'currency',
     currency: 'GHS'
});

const getStatusBadge = (status: string, isReversed?: boolean) => {
     if (isReversed) {
          return <span className="badge bg-danger text-white">Reversed</span>;
     }

     const statusConfig = {
          draft: { label: 'Draft', class: 'bg-secondary text-white' },
          calculated: { label: 'Calculated', class: 'bg-info text-white' },
          approved: { label: 'Approved', class: 'bg-success text-white' },
          locked: { label: 'Locked', class: 'bg-warning text-dark' },
          paid: { label: 'Paid', class: 'bg-primary text-white' },
          reversed: { label: 'Reversed', class: 'bg-danger text-white' }
     };

     const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
     return <span className={`badge ${config.class}`}>{config.label}</span>;
};

const getMonthName = (month: number) => {
     const months = [
          'January', 'February', 'March', 'April', 'May', 'June',
          'July', 'August', 'September', 'October', 'November', 'December'
     ];
     return months[month - 1] || '';
};

export default function ReversePayrollPaymentsPage() {
     const [periods, setPeriods] = useState<PayrollPeriod[]>([]);
     const [loading, setLoading] = useState(true);
     const [error, setError] = useState<string | null>(null);
     const [showConfirmDialog, setShowConfirmDialog] = useState(false);
     const [selectedPeriod, setSelectedPeriod] = useState<PayrollPeriod | null>(null);
     const [reason, setReason] = useState('');
     const [reversing, setReversing] = useState(false);
     const [reverseError, setReverseError] = useState<string | null>(null);
     const [reverseSuccess, setReverseSuccess] = useState<string | null>(null);

     const { applicationsettings } = useApplicationSettings();
     const { user, company, branchid } = applicationsettings;
     const { employeeid } = user || {};

     useEffect(() => {
          fetchPeriods();
     }, []);

     const fetchPeriods = async () => {
          setLoading(true);
          setError(null);
          try {
               const response = await customFetch('payroll/periods');
               if (response?.status === 'success' && response?.statusCode === 200) {
                    setPeriods(response.result || []);
               } else {
                    setError('Failed to load payroll periods');
               }
          } catch (err: any) {
               setError(err?.message || 'Error fetching payroll periods');
          } finally {
               setLoading(false);
          }
     };

     const handleReverseClick = (period: PayrollPeriod) => {
          setSelectedPeriod(period);
          setShowConfirmDialog(true);
          setReason('');
          setReverseError(null);
          setReverseSuccess(null);
     };

     const handleConfirmReverse = async () => {
          if (!selectedPeriod || !employeeid || !branchid) {
               setReverseError('Missing required user information');
               return;
          }

          setReversing(true);
          setReverseError(null);
          setReverseSuccess(null);

          try {
               const payload = {
                    payroll_period_id: selectedPeriod.id,
                    reversed_by: employeeid,
                    branchid: branchid,
                    reason: reason || undefined
               };

               const response = await customPost(
                    `payroll/periods/${selectedPeriod.id}/reverse`,
                    'POST',
                    payload
               );

               if (response?.status === 'success' && response?.statusCode === 200) {
                    setReverseSuccess('Payroll reversed successfully');
                    setShowConfirmDialog(false);
                    fetchPeriods();
               } else {
                    setReverseError(response?.message || 'Failed to reverse payroll');
               }
          } catch (err: any) {
               setReverseError(err?.message || 'Error reversing payroll');
          } finally {
               setReversing(false);
          }
     };

     const handleCancelReverse = () => {
          setShowConfirmDialog(false);
          setSelectedPeriod(null);
          setReason('');
          setReverseError(null);
     };

     if (loading) {
          return (
               <div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '400px' }}>
                    <RiLoader4Line size={48} className="animate-spin mb-3" style={{ color: COLOR_ACCENT }} />
                    <p className="text-muted">Loading payroll periods...</p>
               </div>
          );
     }

     if (error) {
          return (
               <div className={screens.page}>
                    <div className="d-flex flex-column justify-content-center align-items-center text-center" style={{ minHeight: '400px' }}>
                         <RiErrorWarningLine size={48} className="mb-3 text-danger" />
                         <h5 className="fw-medium mb-1">Error Loading Data</h5>
                         <p className="text-muted px-3">{error}</p>
                         <button onClick={fetchPeriods} className="btn btn-primary mt-3">
                              Retry
                         </button>
                    </div>
               </div>
          );
     }

     return (
          <div className={screens.page}>
               {/* Page Header */}
               <div className={screens.header}>
                    <div className="d-flex align-items-center">
                         <RiArrowGoBackLine size={28} style={{ color: COLOR_ACCENT }} className="me-2" />
                         <div>
                              <span className={screens.eyebrow}>Payroll / Payroll operations</span>
<h1 className={screens.title}>Reverse Payroll Payments</h1>
                              <p className="text-muted mb-0 small">Reverse processed payroll periods</p>
                         </div>
                    </div>
               </div>

               {/* Success Message */}
               {reverseSuccess && (
                    <div className="alert alert-success alert-dismissible fade show" role="alert">
                         <RiCheckLine size={20} className="me-2" />
                         {reverseSuccess}
                         <button type="button" className="btn-close" aria-label="Dismiss message" onClick={() => setReverseSuccess(null)}></button>
                    </div>
               )}

               {/* Periods List */}
               {periods.length === 0 ? (
                    <div className="d-flex flex-column justify-content-center align-items-center text-center" style={{ minHeight: '400px' }}>
                         <RiInbox2Line size={48} className="mb-3 text-muted" />
                         <h5 className="fw-medium mb-1">No Payroll Periods</h5>
                         <p className="text-muted px-3">No payroll periods found to reverse</p>
                    </div>
               ) : (
                    <div className="row g-3">
                         {periods.map((period) => (
                              <div key={period.id} className="col-12">
                                   <div className={screens.panel} style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                                        <div className="row align-items-center">
                                             <div className="col-md-3">
                                                  <div className="d-flex align-items-center mb-2">
                                                       <RiCalendarLine size={20} style={{ color: COLOR_ACCENT }} className="me-2" />
                                                       <h6 className="mb-0 fw-bold">{period.period_name}</h6>
                                                  </div>
                                                  <div className="small text-muted">
                                                       {getMonthName(period.period_month)} {period.period_year}
                                                  </div>
                                                  <div className="small text-muted mt-1">
                                                       {new Date(period.period_start_date).toLocaleDateString()} - {new Date(period.period_end_date).toLocaleDateString()}
                                                  </div>
                                                  <div className="mt-2">
                                                       {getStatusBadge(period.status, period.is_reversed)}
                                                  </div>
                                             </div>

                                             <div className="col-md-2 text-center">
                                                  <div className="small text-muted">Employees</div>
                                                  <div className="fw-bold">{period.employee_count || 0}</div>
                                             </div>

                                             <div className="col-md-2 text-center">
                                                  <div className="small text-muted">Gross Salary</div>
                                                  <div className="fw-bold">{currencyFormatter.format(period.total_gross_salary || 0)}</div>
                                             </div>

                                             <div className="col-md-2 text-center">
                                                  <div className="small text-muted">Deductions</div>
                                                  <div className="fw-bold">{currencyFormatter.format(period.total_deductions || 0)}</div>
                                             </div>

                                             <div className="col-md-2 text-center">
                                                  <div className="small text-muted">Net Salary</div>
                                                  <div className="fw-bold text-success">{currencyFormatter.format(period.total_net_salary || 0)}</div>
                                             </div>

                                             <div className="col-md-1 text-end">
                                                  {(period.status === 'paid' || period.status === 'locked') && !period.is_reversed ? (
                                                       <button
                                                            className="btn btn-outline-danger btn-sm d-flex align-items-center"
                                                            onClick={() => handleReverseClick(period)}
                                                       >
                                                            <RiArrowGoBackLine size={16} className="me-1" />
                                                            Reverse
                                                       </button>
                                                  ) : period.is_reversed ? (
                                                       <div className="text-muted small">
                                                            <RiTimeLine size={14} className="me-1" />
                                                            Reversed
                                                       </div>
                                                  ) : (
                                                       <span className="text-muted small">Cannot reverse</span>
                                                  )}
                                             </div>
                                        </div>

                                        {/* Reversal Info */}
                                        {period.is_reversed && (
                                             <div className="mt-3 pt-3 border-top">
                                                  <div className="row">
                                                       <div className="col-md-4">
                                                            <div className="small text-muted">Reversed At</div>
                                                            <div className="small">{period.reversed_at ? new Date(period.reversed_at).toLocaleString() : 'N/A'}</div>
                                                       </div>
                                                       <div className="col-md-8">
                                                            <div className="small text-muted">Reversal Reason</div>
                                                            <div className="small">{period.reversal_reason || 'No reason provided'}</div>
                                                       </div>
                                                  </div>
                                             </div>
                                        )}
                                   </div>
                              </div>
                         ))}
                    </div>
               )}

               {/* Confirmation Dialog */}
               {showConfirmDialog && (
                    <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                         <div className="modal-dialog modal-dialog-centered">
                              <div className="modal-content">
                                   <div className="modal-header">
                                        <h5 className="modal-title d-flex align-items-center">
                                             <RiAlertLine size={24} className="text-warning me-2" />
                                             Confirm Payroll Reversal
                                        </h5>
                                        <button type="button" className="btn-close" aria-label="Dismiss message" onClick={handleCancelReverse}></button>
                                   </div>
                                   <div className="modal-body">
                                        {selectedPeriod && (
                                             <>
                                                  <p className="mb-3">
                                                       Are you sure you want to reverse the payroll for <strong>{selectedPeriod.period_name}</strong>?
                                                  </p>
                                                  <div className="bg-light rounded p-3 mb-3">
                                                       <div className="row">
                                                            <div className="col-6">
                                                                 <div className="small text-muted">Period</div>
                                                                 <div className="fw-medium">{selectedPeriod.period_name}</div>
                                                            </div>
                                                            <div className="col-6">
                                                                 <div className="small text-muted">Net Salary</div>
                                                                 <div className="fw-medium">{currencyFormatter.format(selectedPeriod.total_net_salary || 0)}</div>
                                                            </div>
                                                       </div>
                                                  </div>
                                                  <div className="mb-3">
                                                       <label htmlFor="reversalReason" className="form-label">
                                                            Reason for Reversal <span className="text-muted">(Optional)</span>
                                                       </label>
                                                       <textarea
                                                            className="form-control"
                                                            id="reversalReason"
                                                            rows={3}
                                                            placeholder="Enter reason for reversing this payroll..."
                                                            value={reason}
                                                            onChange={(e) => setReason(e.target.value)}
                                                       ></textarea>
                                                  </div>
                                                  {reverseError && (
                                                       <div className="alert alert-danger py-2" role="alert">
                                                            {reverseError}
                                                       </div>
                                                  )}
                                             </>
                                        )}
                                   </div>
                                   <div className="modal-footer">
                                        <button
                                             type="button"
                                             className="btn btn-secondary"
                                             onClick={handleCancelReverse}
                                             disabled={reversing}
                                        >
                                             Cancel
                                        </button>
                                        <button
                                             type="button"
                                             className="btn btn-danger"
                                             onClick={handleConfirmReverse}
                                             disabled={reversing}
                                        >
                                             {reversing ? (
                                                  <>
                                                       <RiLoader4Line size={16} className="animate-spin me-2" />
                                                       Reversing...
                                                  </>
                                             ) : (
                                                  <>
                                                       <RiArrowGoBackLine size={16} className="me-2" />
                                                       Confirm Reverse
                                                  </>
                                             )}
                                        </button>
                                   </div>
                              </div>
                         </div>
                    </div>
               )}
          </div>
     );
}
