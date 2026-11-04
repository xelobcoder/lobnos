'use client';

import { useCallback, useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { Modal, Spinner } from 'react-bootstrap';
import { RiCalendarCheckLine, RiCheckboxCircleLine, RiCloseCircleLine, RiLockLine, RiRefreshLine, RiShieldCheckLine, RiTimeLine } from '@remixicon/react';
import { toast } from 'react-toastify';
import { useSearchParams } from 'next/navigation';
import DateFilterReusable from '../../../components/operations/Laboratory/ResuableFilter/DateFilterReusable';
import ExportPdfButton from '../../../components/reports/ExportPdfButton';
import { useApplication } from '../../../components/Auth/useApplicationContext';
import { roleAllowed } from '../../../components/Auth/roles';
import { accountingApi, FinancialDayClose, FinancialDayCloseDetail, FinancialDayCloseStatus } from '../../../lib/accounting/accountingApi';

const statusText = (status?: string) => ({
     accountant_submitted: 'Submitted for review',
     returned_to_accountant: 'Returned to preparer',
     manager_approved: 'Review approved',
}[String(status || '')] || String(status || '').replace(/_/g, ' '));
const formatWhen = (value?: string | null) => value ? dayjs(value).format('DD MMM YYYY, HH:mm') : 'Pending';
const variants: Record<FinancialDayCloseStatus, string> = { draft: 'secondary', accountant_submitted: 'primary', returned_to_accountant: 'warning', manager_approved: 'info', finalized: 'success' };

type ActionMode = 'submit' | 'manager_approve' | 'manager_reject' | 'finalize';

export default function DailyFinancialClosePage() {
     const application = useApplication();
     const branchId = Number(application?.branchid ?? application?.user?.branch ?? 0);
     const role = String(application?.user?.role || '').toLowerCase();
     const employeeId = Number(application?.user?.employeeid || 0);
     const today = dayjs().format('YYYY-MM-DD');
     const params = useSearchParams();
     const requestedDate = params?.get("financialDate") || "";
     const initialDate = /^\d{4}-\d{2}-\d{2}$/.test(requestedDate) && dayjs(requestedDate).format("YYYY-MM-DD") === requestedDate ? requestedDate : today;
     const requestedCloseId = Number(params?.get("closeId") || 0);
     const [rows, setRows] = useState<FinancialDayClose[]>([]);
     const [pagination, setPagination] = useState({ page: 1, count: 10, total: 0 });
     const [dateFilter, setDateFilter] = useState('This Month');
     const [dates, setDates] = useState({ from: requestedDate ? initialDate : dayjs().startOf('month').format('YYYY-MM-DD'), to: requestedDate ? initialDate : today });
     const [status, setStatus] = useState<FinancialDayCloseStatus | ''>('');
     const [loading, setLoading] = useState(false);
     const [selected, setSelected] = useState<FinancialDayCloseDetail | null>(null);
     const [detailLoading, setDetailLoading] = useState(false);
     const [actionMode, setActionMode] = useState<ActionMode | null>(null);
     const [actionTarget, setActionTarget] = useState<FinancialDayClose | null>(null);
     const [financialDate, setFinancialDate] = useState(initialDate);
     const [pin, setPin] = useState('');
     const [notes, setNotes] = useState('');
     const [busy, setBusy] = useState(false);
     const [administratorOverride, setAdministratorOverride] = useState(false);
     const [overrideReason, setOverrideReason] = useState('');

     const load = useCallback(async () => {
          if (!branchId) return;
          setLoading(true);
          try {
               const response = await accountingApi.dailyCloses({ branchId, from: dates.from, to: dates.to, status: status || undefined, page: pagination.page, count: pagination.count });
               if (response?.status === 'error') throw new Error(response.message || 'Unable to load daily closes');
               setRows(response.result?.data || []);
               setPagination((current) => ({ ...current, total: Number(response.result?.total || 0) }));
          } catch (error: any) { toast.error(error?.message || 'Unable to load daily closes'); }
          finally { setLoading(false); }
     }, [branchId, dates.from, dates.to, pagination.count, pagination.page, status]);

     useEffect(() => { load(); }, [load]);
     useEffect(() => {
          if (!Number.isSafeInteger(requestedCloseId) || requestedCloseId <= 0) return;
          let active = true;
          setDetailLoading(true);
          accountingApi.dailyClose(requestedCloseId).then(response => {
               if (response?.status !== "success" || !response.result?.closure) throw new Error(response?.message || "Unable to load sales closing evidence.");
               if (active) setSelected(response.result);
          }).catch(error => { if (active) toast.error(error instanceof Error ? error.message : "Unable to load sales closing evidence."); })
               .finally(() => { if (active) setDetailLoading(false); });
          return () => { active = false; };
     }, [requestedCloseId]);

     const openDetail = async (close: FinancialDayClose) => {
          setDetailLoading(true);
          try {
               const response = await accountingApi.dailyClose(close.id);
               if (response?.status === 'error') throw new Error(response.message || 'Unable to load close details');
               setSelected(response.result);
          } catch (error: any) { toast.error(error?.message || 'Unable to load close details'); }
          finally { setDetailLoading(false); }
     };

     const actionRestriction = (mode: ActionMode, target?: FinancialDayClose, override = false): string => {
          if (!Number.isSafeInteger(employeeId) || employeeId <= 0) return 'Your employee identity is unavailable. Sign in again before authorizing a financial day.';
          if (override && !roleAllowed(role, ['admin'])) return 'Only an administrator may authorize this override.';
          if (override && roleAllowed(role, ['admin'])) return '';
          if ((mode === 'manager_approve' || mode === 'manager_reject') && Number(target?.accountant_employeeid) === employeeId) return 'You prepared this day. A different employee with Finance Manager approval authority must approve or return it.';
          if (mode === 'finalize' && [target?.accountant_employeeid, target?.manager_employeeid].map(Number).includes(employeeId)) return 'You prepared or approved this day. A different authorized Facility Owner must finalize it.';
          return '';
     };

     const openAction = (mode: ActionMode, target?: FinancialDayClose, override = false) => {
          const restriction = actionRestriction(mode, target, override);
          if (restriction) return toast.error(restriction);
          setAdministratorOverride(override);
          setOverrideReason('');
          setActionMode(mode);
          setActionTarget(target || null);
          setFinancialDate(target?.financial_date ? dayjs(target.financial_date).format('YYYY-MM-DD') : initialDate);
          setPin('');
          setNotes('');
     };

     const submitAction = async () => {
          if (busy || !actionMode) return;
          const restriction = actionRestriction(actionMode, actionTarget || undefined, administratorOverride);
          if (restriction) return toast.error(restriction);
          if (administratorOverride && (overrideReason.trim().length < 10 || overrideReason.trim().length > 500)) return toast.error('Explain the administrator override in 10 to 500 characters.');
          if (!branchId) return toast.error('Your session has no branch.');
          if (!/^\d{4}$/.test(pin)) return toast.error('Enter your four-digit PIN.');
          setBusy(true);
          try {
               let response: any;
               const overrideInput = administratorOverride ? { overrideSegregationOfDuties: true, overrideReason: overrideReason.trim() } : {};
               if (actionMode === 'submit') response = await accountingApi.submitDailyClose(financialDate, { branchId, pin, timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC', notes, expectedVersion: actionTarget?.workflow_version });
               else if (actionMode === 'manager_approve' && actionTarget) response = await accountingApi.decideDailyClose(actionTarget.id, { decision: 'approve', pin, notes, expectedVersion: actionTarget.workflow_version, ...overrideInput });
               else if (actionMode === 'manager_reject' && actionTarget) response = await accountingApi.decideDailyClose(actionTarget.id, { decision: 'reject', pin, reason: notes, expectedVersion: actionTarget.workflow_version, ...overrideInput });
               else if (actionMode === 'finalize' && actionTarget) response = await accountingApi.finalizeDailyClose(actionTarget.id, { pin, notes, expectedVersion: actionTarget.workflow_version, ...overrideInput });
               if (!response || response.status === 'error') throw new Error(response?.message || 'Daily close action failed');
               toast.success(actionMode === 'finalize' ? 'Financial day finalized and locked.' : 'Financial day updated.');
               setActionMode(null); setPin(''); setNotes(''); await load();
               if (response.result) setSelected(response.result);
          } catch (error: any) { toast.error(error?.message || 'Daily close action failed'); }
          finally { setBusy(false); }
     };

     const latestSnapshot = selected?.snapshots?.[selected.snapshots.length - 1];
     const totals = latestSnapshot?.totals_json ? JSON.parse(latestSnapshot.totals_json) : {};
     const discrepancies = latestSnapshot?.discrepancies_json ? JSON.parse(latestSnapshot.discrepancies_json) : [];
     const totalPages = Math.max(1, Math.ceil(pagination.total / pagination.count));

     const getPdfSpec = async () => {
          const { fetchAllPages, EXPORT_MAX_ROWS } = await import('../../../components/reports/reportPdf');
          const { rows: all, truncated } = await fetchAllPages<FinancialDayClose>(async (page, count) => {
               const response = await accountingApi.dailyCloses({ branchId, from: dates.from, to: dates.to, status: status || undefined, page, count });
               if (response?.status === 'error') throw new Error(response.message || 'Unable to load daily closes');
               return response.result?.data || [];
          });
          return {
               filters: [`Status: ${status ? statusText(status) : 'All statuses'}`, `Branch: ${branchId}`],
               notes: truncated ? [`Export limited to the first ${EXPORT_MAX_ROWS.toLocaleString()} records.`] : [`${all.length.toLocaleString()} close record(s).`],
               tables: [{
                    head: ['Financial date', 'Branch', 'Status', 'Accountant submitted', 'Finance Manager', 'Facility Owner', 'Version', 'Return reason'],
                    body: all.map((close) => [
                         dayjs(close.financial_date).format('DD MMM YYYY'),
                         String(close.branchid ?? ''),
                         statusText(close.status),
                         formatWhen(close.accountant_submitted_at),
                         formatWhen(close.manager_decided_at),
                         formatWhen(close.finalized_at),
                         String(close.workflow_version ?? ''),
                         close.return_reason || '',
                    ]),
               }],
          };
     };

     return <div className="container-fluid px-3 py-3">
          <div className="border rounded-3 bg-body p-3 mb-3"><div className="d-flex flex-wrap justify-content-between align-items-start gap-3"><div className="d-flex align-items-start gap-3"><div className="bg-dark text-white rounded-3 d-flex align-items-center justify-content-center" style={{ width: 44, height: 44 }}><RiLockLine size={24} /></div><div><h1 className="h4 fw-bold mb-1">Daily Financial Close</h1><p className="text-muted mb-0">Preparation, independent Finance Manager review, and permanent Facility Owner finalization.</p></div></div><div className="d-flex gap-2"><ExportPdfButton title="Daily Financial Close" subtitle="Close history" period={`${dayjs(dates.from).format('D MMM YYYY')} to ${dayjs(dates.to).format('D MMM YYYY')}`} getSpec={getPdfSpec} /><button className="btn btn-primary" onClick={() => openAction('submit')} disabled={!branchId || Boolean(actionRestriction('submit'))}>Submit for review</button></div></div><div className="alert alert-info mt-3 mb-0">Independent preparation, review, and finalization are recommended. Submitting does not change your role or lock the day. An administrator may explicitly override employee separation with a secure PIN and a recorded reason; reconciliation and final locks still apply.</div></div>

          <div className="border rounded-3 bg-body p-3 mb-3"><div className="row g-3 align-items-end"><div className="col-12 col-md-4"><label className="form-label small fw-semibold mb-1">Financial date range</label><DateFilterReusable value={dateFilter} onChange={setDateFilter} onDateRangeChange={(from, to) => { setDates({ from, to }); setPagination((current) => ({ ...current, page: 1 })); }} label="Choose date range" className="w-100" /><div className="small text-muted mt-1">{dates.from} to {dates.to}</div></div><div className="col-7 col-md-3"><label className="form-label small fw-semibold">Status</label><select className="form-select" value={status} onChange={(event) => { setStatus(event.target.value as FinancialDayCloseStatus | ''); setPagination((current) => ({ ...current, page: 1 })); }}><option value="">All statuses</option><option value="draft">Draft</option><option value="accountant_submitted">Submitted for review</option><option value="returned_to_accountant">Returned to preparer</option><option value="manager_approved">Review approved</option><option value="finalized">Finalized</option></select></div><div className="col-5 col-md-auto"><button className="btn btn-outline-secondary w-100" onClick={load} title="Refresh"><RiRefreshLine size={18} /></button></div></div></div>

          <div className="border rounded-3 bg-body overflow-hidden">
               <div className="p-3 border-bottom d-flex justify-content-between"><h2 className="h6 fw-semibold mb-0">Close history</h2><span className="small text-muted">{pagination.total} records</span></div>
               <div className="table-responsive"><table className="table table-hover align-middle mb-0">
                    <thead className="table-light"><tr><th>Date</th><th>Status</th><th>Prepared by</th><th>Finance Manager</th><th>Facility Owner</th><th>Version</th><th>Actions</th></tr></thead>
                    <tbody>{loading ? <tr><td colSpan={7} className="text-center py-5"><Spinner animation="border" /></td></tr> : rows.length === 0 ? <tr><td colSpan={7} className="text-center text-muted py-5">No daily close records match these filters.</td></tr> : rows.map(close => <tr key={close.id}>
                         <td><strong>{dayjs(close.financial_date).format('DD MMM YYYY')}</strong><div className="small text-muted">Branch {close.branchid}</div></td>
                         <td><span className={`fw-semibold text-${variants[close.status]}`}>{statusText(close.status)}</span>{close.return_reason ? <div className="small text-danger">{close.return_reason}</div> : null}</td>
                         <td>{close.accountant_employeeid ? <div>Employee #{close.accountant_employeeid}{Number(close.accountant_employeeid) === employeeId ? ' (you)' : ''}</div> : null}{formatWhen(close.accountant_submitted_at)}</td>
                         <td>{formatWhen(close.manager_decided_at)}</td><td>{formatWhen(close.finalized_at)}</td><td>{close.workflow_version}</td>
                         <td><div className="d-flex flex-wrap gap-1">
                              <button className="btn btn-sm btn-outline-secondary" onClick={() => openDetail(close)} disabled={detailLoading}>Review</button>
                              {close.status === 'returned_to_accountant' && <button className="btn btn-sm btn-primary" disabled={Boolean(actionRestriction('submit', close))} onClick={() => openAction('submit', close)}>Resubmit</button>}
                              {close.status === 'accountant_submitted' && <>
                                   <button className="btn btn-sm btn-success" disabled={Boolean(actionRestriction('manager_approve', close))} onClick={() => openAction('manager_approve', close)}>Approve</button>
                                   <button className="btn btn-sm btn-outline-danger" disabled={Boolean(actionRestriction('manager_reject', close))} onClick={() => openAction('manager_reject', close)}>Return</button>
                                   {roleAllowed(role, ['admin']) && <button className="btn btn-sm btn-outline-warning" disabled={!employeeId} onClick={() => openAction('manager_approve', close, true)}>Override approval</button>}
                              </>}
                              {close.status === 'manager_approved' && roleAllowed(role, ['admin']) && <>
                                   <button className="btn btn-sm btn-dark" disabled={Boolean(actionRestriction('finalize', close))} onClick={() => openAction('finalize', close)}>Finalize</button>
                                   <button className="btn btn-sm btn-outline-warning" disabled={!employeeId} onClick={() => openAction('finalize', close, true)}>Override finalization</button>
                              </>}
                         </div>
                         {close.status === 'accountant_submitted' && actionRestriction('manager_approve', close) ? <div className="small text-muted mt-1">{actionRestriction('manager_approve', close)}</div> : null}
                         {close.status === 'manager_approved' && actionRestriction('finalize', close) ? <div className="small text-muted mt-1">{actionRestriction('finalize', close)}</div> : null}
                         </td>
                    </tr>)}</tbody>
               </table></div>
               <div className="p-3 border-top d-flex justify-content-between align-items-center">
                    <select className="form-select form-select-sm" style={{ width: 80 }} value={pagination.count} onChange={(event) => setPagination((current) => ({ ...current, page: 1, count: Number(event.target.value) }))}><option value={10}>10</option><option value={25}>25</option><option value={50}>50</option></select>
                    <div className="d-flex align-items-center gap-2"><button className="btn btn-sm btn-outline-secondary" disabled={pagination.page <= 1} onClick={() => setPagination((current) => ({ ...current, page: current.page - 1 }))}>Previous</button><span className="small fw-semibold">Page {pagination.page} of {totalPages}</span><button className="btn btn-sm btn-outline-secondary" disabled={pagination.page >= totalPages} onClick={() => setPagination((current) => ({ ...current, page: current.page + 1 }))}>Next</button></div>
               </div>
          </div>

          <Modal show={Boolean(selected)} onHide={() => setSelected(null)} size="xl" animation={false} dialogClassName="mt-3">
               <Modal.Header closeButton><Modal.Title className="h5">Financial Day Review{selected && <> #{selected.closure.id} - {dayjs(selected.closure.financial_date).format("DD MMM YYYY")} - Branch {selected.closure.branchid}</>}</Modal.Title></Modal.Header>
               <Modal.Body>{selected && <>
                    <div className="row g-3 mb-3">{[['Billing', totals.billingPayable, 'primary'], ['Payments', totals.paymentCredits, 'success'], ['Expenses', totals.expensesAccrued, 'danger'], ['Refunds', totals.refundsPaid, 'warning']].map(([label, value, variant]) => <div className="col-6 col-lg-3" key={String(label)}><div className={`card border-0 shadow-sm bg-${variant} bg-gradient text-white rounded-3 h-100`}><div className="card-body p-3"><div className="text-xs text-uppercase fw-semibold opacity-75">{label}</div><h3 className="fw-bold mb-0">{Number(value || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</h3><span className="text-xs opacity-75">Snapshot total</span></div></div></div>)}</div>
                    {discrepancies.length > 0 ? <div className="alert alert-danger"><strong>Reconciliation blockers</strong>{discrepancies.map((item: any) => <div key={item.code}>{item.message}</div>)}</div> : <div className="alert alert-success d-flex align-items-center gap-2"><RiCheckboxCircleLine size={18} /> Snapshot is reconciled.</div>}
                    <div className="row g-3"><div className="col-lg-6"><h2 className="h6">Authorization timeline</h2>{selected.actions.map((action) => <div className="border-start border-3 ps-3 py-2 mb-2" key={action.id}><div className="fw-semibold text-capitalize">{statusText(action.action)}</div><div className="small text-muted">{action.actor_role} #{action.actor_employeeid} · {formatWhen(action.action_at)}</div>{action.reason ? <div className="small">{action.reason}</div> : null}</div>)}</div><div className="col-lg-6"><h2 className="h6">Integrity</h2><div className="border rounded p-3"><div>Locked records: <strong>{selected.lockedRecords}</strong></div><div className="small text-muted text-break mt-2">Snapshot hash: {selected.closure.finalized_hash || selected.closure.latest_snapshot_hash || 'Not created'}</div></div></div></div>
               </>}</Modal.Body>
          </Modal>

          <Modal show={Boolean(actionMode)} onHide={() => { if (!busy) setActionMode(null); }} animation={false} backdrop="static" dialogClassName="mt-3">
               <Modal.Header closeButton={!busy}><Modal.Title className="h5">{administratorOverride ? 'Administrator Override - ' : ''}{actionMode === 'submit' ? 'Submit Financial Day' : actionMode === 'manager_approve' ? 'Approve Financial Day' : actionMode === 'manager_reject' ? 'Return Financial Day' : 'Finalize and Lock Financial Day'}</Modal.Title></Modal.Header>
               <Modal.Body>
                    {actionMode === 'submit' && <><label className="form-label fw-semibold">Financial date</label><input type="date" className="form-control mb-3" max={today} value={financialDate} disabled={Boolean(actionTarget)} onChange={(event) => setFinancialDate(event.target.value)} /></>}
                    {actionMode === 'finalize' && <div className="alert alert-danger"><RiLockLine size={18} className="me-1" /><strong>This action is permanent.</strong> Records cannot be edited, deleted, or ordinarily unlocked. Corrections require linked reversals.</div>}
                    {administratorOverride && <div className="alert alert-warning"><strong>You are authorizing an exception to independent review.</strong><div className="small mt-1">Your identity, reason, and affected preparation/review identities will be permanently recorded. Reconciliation, snapshot checks, and final locks are not bypassed.</div></div>}
                    {administratorOverride && <><label htmlFor="daily-close-override-reason" className="form-label fw-semibold">Administrator override reason</label><textarea id="daily-close-override-reason" className="form-control mb-3" rows={3} minLength={10} maxLength={500} value={overrideReason} disabled={busy} onChange={event => setOverrideReason(event.target.value)} /><p className="small text-muted">10-500 characters. Explain why independent staff review is unavailable.</p></>}
                    {actionMode === 'manager_reject' && <div className="alert alert-warning"><RiCloseCircleLine size={18} className="me-1" />Return the day to the preparer with a clear reason.</div>}
                    <label className="form-label fw-semibold">{actionMode === 'manager_reject' ? 'Return reason' : 'Notes (optional)'}</label><textarea className="form-control mb-3" rows={3} value={notes} disabled={busy} onChange={(event) => setNotes(event.target.value)} />
                    <label className="form-label fw-semibold">Secure PIN</label><input type="password" inputMode="numeric" maxLength={4} autoComplete="off" className="form-control" value={pin} disabled={busy} onChange={(event) => setPin(event.target.value.replace(/\D/g, '').slice(0, 4))} />
               </Modal.Body>
               <Modal.Footer><button className="btn btn-outline-secondary" disabled={busy} onClick={() => setActionMode(null)}>Cancel</button><button className={`btn ${actionMode === 'finalize' ? 'btn-danger' : actionMode === 'manager_reject' ? 'btn-warning' : 'btn-primary'}`} disabled={busy || pin.length !== 4 || (administratorOverride && overrideReason.trim().length < 10) || (actionMode === 'manager_reject' && notes.trim().length < 3)} onClick={submitAction}>{busy ? 'Authorizing...' : administratorOverride ? actionMode === 'finalize' ? 'Override and finalize permanently' : 'Confirm administrator override' : actionMode === 'finalize' ? 'Finalize permanently' : 'Authorize'}</button></Modal.Footer>
          </Modal>
     </div>;
}
