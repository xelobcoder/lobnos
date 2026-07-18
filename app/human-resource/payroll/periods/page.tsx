'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { customFetch, customPost } from '../../../../components/Auth/customFetch';
import Loader from '../../../../components/isLoading';
import {
     RiCalendarLine,
     RiAddLine,
     RiEyeLine,
     RiCheckboxCircleLine,
     RiLockLine,
     RiBankCardLine,
     RiLoader4Line,
     RiErrorWarningLine,
     RiInbox2Line,
     RiDeleteBinLine
} from '@remixicon/react';

interface PayrollPeriod {
     id: number;
     period_name: string;
     period_year: number;
     period_month: number;
     period_start_date: string;
     period_end_date: string;
     status: 'draft' | 'calculated' | 'approved' | 'locked' | 'paid';
     total_gross_salary: number;
     total_deductions: number;
     total_net_salary: number;
     employee_count: number;
}

const COLOR_ACCENT = 'oklch(0.646 0.222 41.116)';
const COLOR_BORDER = 'var(--bs-border-color)';

const getStatusBadge = (status: string) => {
     const statusConfig = {
          draft: { label: 'Draft', class: 'bg-secondary text-white' },
          calculated: { label: 'Calculated', class: 'bg-info text-white' },
          approved: { label: 'Approved', class: 'bg-success text-white' },
          locked: { label: 'Locked', class: 'bg-warning text-dark' },
          paid: { label: 'Paid', class: 'bg-primary text-white' }
     };

     const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
     return <span className={`badge ${config.class}`}>{config.label}</span>;
};

const currencyFormatter = new Intl.NumberFormat('en-GH', {
     style: 'currency',
     currency: 'GHS'
});

export default function PayrollPeriodsPage() {
     const [periods, setPeriods] = useState<PayrollPeriod[]>([]);
     const [loading, setLoading] = useState(true);
     const [error, setError] = useState<string | null>(null);
     const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; period: PayrollPeriod | null }>({ show: false, period: null });
     const [deleting, setDeleting] = useState(false);
     const [creatingNext, setCreatingNext] = useState(false);

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

     const handleDeleteClick = (period: PayrollPeriod) => {
          setDeleteConfirm({ show: true, period });
     };

     const handleCreateNextPeriod = async () => {
          setCreatingNext(true);
          try {
               const response = await customPost('payroll/periods/create-next', 'POST', {});
               if (response?.status === 'success' && response?.statusCode === 201 && response?.result?.id) {
                    await fetchPeriods();
                    alert(response?.message || 'Next payroll period created successfully');
               } else {
                    alert(response?.message || 'Failed to create next payroll period');
               }
          } catch (err: any) {
               alert(err?.message || 'Error creating next payroll period');
          } finally {
               setCreatingNext(false);
          }
     };

     const handleConfirmDelete = async () => {
          if (!deleteConfirm.period) return;

          setDeleting(true);
          try {
               const response = await customPost(`payroll/periods/${deleteConfirm.period.id}`, 'DELETE', {});
               if (response?.status === 'success' && response?.statusCode === 200) {
                    setPeriods(periods.filter(p => p.id !== deleteConfirm.period!.id));
                    setDeleteConfirm({ show: false, period: null });
               } else {
                    alert('Failed to delete payroll period');
               }
          } catch (err: any) {
               alert(err?.message || 'Error deleting payroll period');
          } finally {
               setDeleting(false);
          }
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
               <div className="container-fluid px-4 py-3">
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
          <div className="container-fluid px-4 py-3">
               {/* Page Header */}
               <div className="d-flex justify-content-between align-items-center mb-4">
                    <div className="d-flex align-items-center">
                         <RiCalendarLine size={28} style={{ color: COLOR_ACCENT }} className="me-2" />
                         <div>
                              <h1 className="h4 mb-0 fw-bold">Payroll Periods</h1>
                              <p className="text-muted mb-0 small">Manage monthly payroll cycles</p>
                         </div>
                    </div>
                    <div className="d-flex gap-2">
                         <button
                              type="button"
                              onClick={handleCreateNextPeriod}
                              className="btn btn-outline-primary d-flex align-items-center"
                              disabled={creatingNext}
                         >
                              {creatingNext ? (
                                   <>
                                        <RiLoader4Line size={16} className="animate-spin me-1" />
                                        Creating...
                                   </>
                              ) : (
                                   <>
                                        <RiAddLine size={18} className="me-1" />
                                        Create Next Period
                                   </>
                              )}
                         </button>
                         <Link href="/human-resource/payroll/periods/create" className="btn btn-primary d-flex align-items-center">
                              <RiAddLine size={18} className="me-1" />
                              Create Period
                         </Link>
                    </div>
               </div>

               {/* Periods List */}
               {periods.length === 0 ? (
                    <div className="d-flex flex-column justify-content-center align-items-center text-center" style={{ minHeight: '400px' }}>
                         <RiInbox2Line size={48} className="mb-3 text-muted" />
                         <h5 className="fw-medium mb-1">No Payroll Periods</h5>
                         <p className="text-muted px-3">Create your first payroll period to get started</p>
                         <Link href="/human-resource/payroll/periods/create" className="btn btn-primary mt-3">
                              <RiAddLine size={18} className="me-1" />
                              Create Period
                         </Link>
                    </div>
               ) : (
                    <div className="row g-3">
                         {periods.map((period) => (
                              <div key={period.id} className="col-12">
                                   <div className="border rounded p-4" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                                        <div className="row align-items-center">
                                             <div className="col-md-3">
                                                  <div className="d-flex align-items-center mb-2">
                                                       <RiCalendarLine size={20} style={{ color: COLOR_ACCENT }} className="me-2" />
                                                       <h6 className="mb-0 fw-bold">{period.period_name}</h6>
                                                  </div>
                                                  <div className="small text-muted">
                                                       {new Date(period.period_start_date).toLocaleDateString()} - {new Date(period.period_end_date).toLocaleDateString()}
                                                  </div>
                                                  <div className="mt-2">{getStatusBadge(period.status)}</div>
                                             </div>

                                             <div className="col-md-2 text-center">
                                                  <div className="small text-muted">Employees</div>
                                                  <div className="fs-5 fw-bold">{period.employee_count}</div>
                                             </div>

                                             <div className="col-md-2 text-center">
                                                  <div className="small text-muted">Gross Salary</div>
                                                  <div className="fs-6 fw-bold">{currencyFormatter.format(period.total_gross_salary)}</div>
                                             </div>

                                             <div className="col-md-2 text-center">
                                                  <div className="small text-muted">Deductions</div>
                                                  <div className="fs-6 fw-bold text-danger">{currencyFormatter.format(period.total_deductions)}</div>
                                             </div>

                                             <div className="col-md-2 text-center">
                                                  <div className="small text-muted">Net Salary</div>
                                                  <div className="fs-6 fw-bold text-success">{currencyFormatter.format(period.total_net_salary)}</div>
                                             </div>

                                             <div className="col-md-1 text-end">
                                                  <div className="d-flex gap-2 justify-content-end">
                                                       <Link
                                                            href={`/human-resource/payroll/periods/${period.id}`}
                                                            className="btn btn-sm btn-outline-primary"
                                                            title="View Details"
                                                       >
                                                            <RiEyeLine size={16} />
                                                       </Link>
                                                       {period.status === 'draft' && (
                                                            <button
                                                                 onClick={() => handleDeleteClick(period)}
                                                                 className="btn btn-sm btn-outline-danger"
                                                                 title="Delete Draft Payroll"
                                                                 disabled={deleting}
                                                            >
                                                                 <RiDeleteBinLine size={16} />
                                                            </button>
                                                       )}
                                                  </div>
                                             </div>
                                        </div>
                                   </div>
                              </div>
                         ))}
                    </div>
               )}

               {/* Delete Confirmation Modal */}
               {deleteConfirm.show && deleteConfirm.period && (
                    <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                         <div className="modal-dialog modal-dialog-centered">
                              <div className="modal-content">
                                   <div className="modal-header">
                                        <h5 className="modal-title fw-bold">Delete Payroll Period</h5>
                                        <button
                                             type="button"
                                             className="btn-close"
                                             onClick={() => setDeleteConfirm({ show: false, period: null })}
                                             disabled={deleting}
                                        ></button>
                                   </div>
                                   <div className="modal-body">
                                        <p className="mb-2">
                                             Are you sure you want to delete <strong>{deleteConfirm.period.period_name}</strong>?
                                        </p>
                                        <p className="text-muted small mb-0">
                                             This action cannot be undone. Only draft payroll periods can be deleted.
                                        </p>
                                   </div>
                                   <div className="modal-footer">
                                        <button
                                             type="button"
                                             className="btn btn-secondary"
                                             onClick={() => setDeleteConfirm({ show: false, period: null })}
                                             disabled={deleting}
                                        >
                                             Cancel
                                        </button>
                                        <button
                                             type="button"
                                             className="btn btn-danger"
                                             onClick={handleConfirmDelete}
                                             disabled={deleting}
                                        >
                                             {deleting ? (
                                                  <>
                                                       <RiLoader4Line size={16} className="animate-spin me-1" style={{ display: 'inline' }} />
                                                       Deleting...
                                                  </>
                                             ) : (
                                                  'Delete'
                                             )}
                                        </button>
                                   </div>
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
