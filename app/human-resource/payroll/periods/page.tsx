'use client';
import { usePayrollFeedback } from '../../../../components/HR/Payroll/usePayrollFeedback';

import React, { useState, useEffect } from 'react';
import Modal from 'react-bootstrap/Modal';
import ui from '../PayrollDashboard.module.css';
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

const COLOR_ACCENT = 'var(--bs-primary)';
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
     const { notify, feedback } = usePayrollFeedback();
     const [periods, setPeriods] = useState<PayrollPeriod[]>([]);
     const [loading, setLoading] = useState(true);
     const [error, setError] = useState<string | null>(null);
     const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; period: PayrollPeriod | null }>({ show: false, period: null });
     const [deleting, setDeleting] = useState(false);
     const [creatingNext, setCreatingNext] = useState(false);
     const [search, setSearch] = useState('');
     const [statusFilter, setStatusFilter] = useState('all');

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
                    notify(response?.message || 'Next payroll period created successfully', 'success');
               } else {
                    notify(response?.message || 'Failed to create next payroll period');
               }
          } catch (err: any) {
               notify(err?.message || 'Error creating next payroll period');
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
                    setDeleteConfirm(previous=>({...previous,show:false}));
               } else {
                    notify('Failed to delete payroll period');
               }
          } catch (err: any) {
               notify(err?.message || 'Error deleting payroll period');
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
               {feedback}
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

     const visible = periods.filter(period => (statusFilter === 'all' || period.status === statusFilter) && `${period.period_name} ${period.id}`.toLowerCase().includes(search.toLowerCase()));
     const counts = [
          { title: 'Open periods', count: periods.filter(p => ['draft','calculated'].includes(p.status)).length, detail: 'Preparation and review' },
          { title: 'Awaiting approval', count: periods.filter(p => p.status === 'calculated').length, detail: 'Calculated payrolls' },
          { title: 'Ready for payment', count: periods.filter(p => p.status === 'locked').length, detail: 'Approved and locked' },
          { title: 'Paid periods', count: periods.filter(p => p.status === 'paid').length, detail: 'Completed payrolls' }
     ];
     return <main className={ui.page}>
          {feedback}
          <header className={ui.header}><div><span className={ui.eyebrow}>People & payroll</span><h1>Payroll Periods</h1><p>Follow each payroll from preparation to payment.</p></div><div className={ui.actions}>
               <button type="button" className={ui.button} onClick={handleCreateNextPeriod} disabled={creatingNext}><RiAddLine size={16}/>{creatingNext ? 'Creating…' : 'Create next period'}</button>
               <Link className={ui.primary} href="/human-resource/payroll/periods/create"><RiAddLine size={16}/>Create period</Link>
          </div></header>
          <section className={ui.stats} aria-label="Payroll period summary">{counts.map(item => <div className={ui.metric} key={item.title}><span>{item.title}</span><strong>{item.count}</strong><small>{item.detail}</small></div>)}</section>
          <section className={ui.panel} aria-label="Payroll periods">
               <div className={ui.toolbar}><input className={ui.search} type="search" aria-label="Search payroll periods" placeholder="Search period name or ID" value={search} onChange={e=>setSearch(e.target.value)}/><label className={ui.field}>Status<select className="form-select form-select-sm" aria-label="Filter payroll periods by status" value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}><option value="all">All statuses</option>{['draft','calculated','approved','locked','paid'].map(status=><option key={status} value={status}>{status.charAt(0).toUpperCase()+status.slice(1)}</option>)}</select></label></div>
               {visible.length===0 ? <div className={ui.empty}><RiInbox2Line size={30}/><strong>{periods.length ? 'No periods match your filters' : 'Create your first payroll period'}</strong><p>{periods.length ? 'Try another name, ID or status.' : 'Set the date range, then prepare and calculate employee pay.'}</p>{periods.length ? <button className={ui.button} onClick={()=>{setSearch('');setStatusFilter('all')}}>Clear filters</button> : <Link className={ui.primary} href="/human-resource/payroll/periods/create">Create period</Link>}</div> : <div className={ui.tableWrap}><table className={ui.table}><thead><tr><th>Payroll period</th><th>Status</th><th className={ui.number}>Employees</th><th className={ui.number}>Gross salary</th><th className={ui.number}>Deductions</th><th className={ui.number}>Net salary</th><th className={ui.number}>Actions</th></tr></thead><tbody>{visible.map(period=><tr key={period.id}><td><strong>{period.period_name}</strong><small>{new Date(period.period_start_date).toLocaleDateString('en-GB')} – {new Date(period.period_end_date).toLocaleDateString('en-GB')}</small></td><td><span className={ui.status} data-status={period.status}>{period.status}</span></td><td className={ui.number}>{Number(period.employee_count)||0}</td><td className={ui.number}>{currencyFormatter.format(Number(period.total_gross_salary)||0)}</td><td className={ui.number}>{currencyFormatter.format(Number(period.total_deductions)||0)}</td><td className={ui.number}><strong>{currencyFormatter.format(Number(period.total_net_salary)||0)}</strong></td><td><div className={ui.rowActions}><Link className={ui.button} href={`/human-resource/payroll/periods/${period.id}`} aria-label={`Review ${period.period_name}`}>Review</Link>{period.status==='draft'&&<button type="button" className="btn btn-sm btn-outline-danger" aria-label={`Delete draft ${period.period_name}`} title="Delete draft" onClick={()=>handleDeleteClick(period)} disabled={deleting}><RiDeleteBinLine size={16}/></button>}</div></td></tr>)}</tbody></table></div>}
               <footer className={ui.footer}>{visible.length} of {periods.length} payroll periods · Amounts in GHS</footer>
          </section>
          <Modal show={deleteConfirm.show} onHide={()=>!deleting&&setDeleteConfirm(previous=>({...previous,show:false}))} backdrop="static" keyboard={!deleting} centered aria-labelledby="delete-payroll-title">
               <Modal.Header><Modal.Title id="delete-payroll-title" className="h5">Delete draft payroll?</Modal.Title></Modal.Header><Modal.Body>{feedback}<p>Delete <strong>{deleteConfirm.period?.period_name}</strong>?</p><p className="text-muted small mb-0">Only draft periods can be deleted. This action cannot be undone.</p></Modal.Body><Modal.Footer><button type="button" className="btn btn-outline-secondary" disabled={deleting} onClick={()=>setDeleteConfirm(previous=>({...previous,show:false}))}>Cancel</button><button type="button" className="btn btn-danger" onClick={handleConfirmDelete} disabled={deleting}>{deleting?'Deleting…':'Delete draft'}</button></Modal.Footer>
          </Modal>
     </main>;
}
