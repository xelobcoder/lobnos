'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Button, Form, Modal, Spinner } from 'react-bootstrap';
import { RiEyeLine, RiHistoryLine, RiRefreshLine, RiSearchLine, RiSettings3Line } from '@remixicon/react';
import { toast } from 'react-toastify';
import { customFetch, customFetchMutation } from '../../Auth/customFetch';
import { useApplicationSettings } from '../../Auth/useApplicationContext';
import { roleAllowed } from '../../Auth/roles';
import PrimeTable from '../../accessories/Datatables/PrimeTable';
import styles from './InstrumentMaintenanceManager.module.css';
import MaintenanceTasks from './MaintenanceTasks';

type Device = { id: string; deviceName: string; model?: string; serialNumber?: string };
type Run = { id: number; device_id: string; deviceName: string; model?: string; activity_title?: string | null; activity_type?: string | null; status: string; performed_at: string; scheduled_date?: string | null; performed_by?: number | null; reviewed_by?: number | null; reviewed_at?: string | null };
type Blocked = { device_id: string; deviceName: string; unresolved_runs: number };
type Check = { id: number; title_snapshot: string; instructions_snapshot?: string | null; result: string; comment: string | null };
type CorrectiveAction = { id: number; check_id: number; description: string; status: string; completed_by?: number | null; completed_at?: string | null };
type RunDetails = Run & { observations?: string | null; review_comment?: string | null; checks: Check[]; correctiveActions: CorrectiveAction[]; task?: {
     id: number; status: string; snapshot: { title: string; activity_type: string; frequency: string; interval: number; assigned_to?: number | null; instructions?: string };
     failure_reason?: string | null; draft_by?: number | null; draft?: { failure_reason?: string; observations?: string; corrective_action?: string } | null;
} | null };
type HistoryPage = { data: Run[]; total: number; page: number; count: number };
const HISTORY_PAGE_SIZE = 20;

const payloadOf = (response: any) => response?.data ?? response;
const assertResponseOk = (response: any) => {
     if (response?.status === 'error' || response?.success === false || response?.error || Number(response?.statusCode) >= 400)
          throw new Error(response?.message || response?.error || 'The maintenance request could not be completed.');
     return response;
};
const formatDateTime = (value: string) => {
     const parsed = new Date(value);
     return Number.isNaN(parsed.getTime()) ? '—' : parsed.toLocaleString();
};
const employee = (id: number | null | undefined) => id == null ? 'Not recorded' : `Employee #${id}`;

export async function fetchMaintenanceHistory(page: number, search: string, status: string): Promise<HistoryPage> {
     const params = new URLSearchParams({ page: String(page), count: String(HISTORY_PAGE_SIZE) });
     if (search.trim()) params.set('search', search.trim());
     if (status !== 'all') params.set('status', status);
     const response = assertResponseOk(await customFetch(`instrument-maintenance/history?${params.toString()}`));
     // Unlike a single-record response, the history response itself has a data array.
     const result = Array.isArray(response?.data) ? response : response?.data;
     if (!Array.isArray(result?.data) || !Number.isSafeInteger(result.total) || result.total < 0 ||
          !Number.isSafeInteger(result.page) || result.page < 1 || !Number.isSafeInteger(result.count) || result.count < 1) {
          throw new Error('Invalid maintenance history response.');
     }
     return result;
}

export function InstrumentMaintenanceManager() {
     const { applicationsettings } = useApplicationSettings();
     const canSupervise = roleAllowed(applicationsettings?.user?.role, ['admin', 'manager']);
     const [history, setHistory] = useState<Run[]>([]);
     const [blocked, setBlocked] = useState<Blocked[]>([]);
     const [devices, setDevices] = useState<Device[]>([]);
     const [loading, setLoading] = useState(true);
     const [error, setError] = useState('');
     const [section, setSection] = useState<'tasks' | 'plans' | 'history'>('tasks');
     const [historyQuery, setHistoryQuery] = useState('');
     const [historyFilter, setHistoryFilter] = useState('all');
     const [historyPage, setHistoryPage] = useState(1);
     const [historyTotal, setHistoryTotal] = useState(0);
     const [historyLoading, setHistoryLoading] = useState(false);
     const [historyError, setHistoryError] = useState('');
     const [historyRefresh, setHistoryRefresh] = useState(0);
     const [selectedRun, setSelectedRun] = useState<RunDetails | null>(null);
     const [loadingRun, setLoadingRun] = useState(false);
     const [runError, setRunError] = useState('');
     const [actionDescriptions, setActionDescriptions] = useState<Record<number, string>>({});
     const [reviewComment, setReviewComment] = useState('');
     const [savingRunAction, setSavingRunAction] = useState(false);

     const load = useCallback(async () => {
          setLoading(true);
          setError('');
          try {
               const [dashboardResponse, deviceResponse] = (await Promise.all([
                    customFetch('instrument-maintenance/dashboard'),
                    customFetch('devices'),
               ])).map(assertResponseOk);
               const dashboard = payloadOf(dashboardResponse);
               const devicePayload = deviceResponse?.data?.data ?? deviceResponse?.data ?? deviceResponse;
               if (!Array.isArray(devicePayload) && !Array.isArray(devicePayload?.data)) throw new Error('Unable to load instruments.');
               if (!Array.isArray(dashboard?.blocked)) throw new Error('Invalid maintenance dashboard response.');
               setBlocked(dashboard.blocked);
               setDevices(Array.isArray(devicePayload) ? devicePayload : devicePayload.data);
          } catch (loadError: any) {
               const message = loadError?.message || 'Unable to load instrument maintenance.';
               setError(message);
               toast.error(message);
          } finally {
               setLoading(false);
          }
     }, []);
     useEffect(() => { void Promise.resolve().then(load); }, [load]);
     useEffect(() => {
          if (section !== 'history') return;
          let active = true;
          const timer = setTimeout(() => {
               setHistoryLoading(true);
               setHistoryError('');
               void fetchMaintenanceHistory(historyPage, historyQuery, historyFilter).then(result => {
                    if (!active) return;
                    const lastPage = Math.max(1, Math.ceil(result.total / HISTORY_PAGE_SIZE));
                    if (historyPage > lastPage) {
                         setHistoryPage(lastPage);
                         return;
                    }
                    setHistory(result.data);
                    setHistoryTotal(result.total);
               }).catch((loadError: unknown) => {
                    if (!active) return;
                    setHistory([]);
                    setHistoryError(loadError instanceof Error ? loadError.message : 'Unable to load maintenance history.');
               }).finally(() => { if (active) setHistoryLoading(false); });
          }, 300);
          return () => { active = false; clearTimeout(timer); };
     }, [section, historyPage, historyQuery, historyFilter, historyRefresh]);

     const refresh = () => {
          void load();
          setHistoryRefresh(current => current + 1);
     };

     const openRun = async (runId: number) => {
          setLoadingRun(true);
          setRunError('');
          setSelectedRun(null);
          setActionDescriptions({});
          setReviewComment('');
          try {
               const details = payloadOf(assertResponseOk(await customFetch(`instrument-maintenance/runs/${runId}`)));
               if (!details || !Array.isArray(details.checks) || !Array.isArray(details.correctiveActions)) throw new Error('Invalid maintenance record response.');
               setSelectedRun({ ...history.find(run => run.id === runId), ...details });
          } catch (loadError: any) {
               setRunError(loadError?.message || 'Unable to load maintenance record.');
          } finally { setLoadingRun(false); }
     };
     const completeAction = async (actionId: number) => {
          const description = actionDescriptions[actionId]?.trim();
          if (!description || !selectedRun) return toast.error('Describe the corrective work completed.');
          setSavingRunAction(true);
          try {
               assertResponseOk(await customFetchMutation(`instrument-maintenance/actions/${actionId}/complete`, 'POST', { description }));
               toast.success('Corrective action recorded.');
               await openRun(selectedRun.id);
               await load();
               setHistoryRefresh(current => current + 1);
          } catch (saveError: any) {
               toast.error(saveError?.message || 'Unable to record corrective work.');
          } finally { setSavingRunAction(false); }
     };
     const reviewRun = async () => {
          if (!selectedRun) return;
          if (selectedRun.status === 'awaiting_corrective_action' && !reviewComment.trim()) return toast.error('Describe how the instrument was verified.');
          setSavingRunAction(true);
          try {
               assertResponseOk(await customFetchMutation(`instrument-maintenance/runs/${selectedRun.id}/supervisor-review`, 'POST', { comment: reviewComment }));
               toast.success('Supervisor review recorded; instrument clearance updated.');
               await openRun(selectedRun.id);
               await load();
               setHistoryRefresh(current => current + 1);
          } catch (saveError: any) {
               toast.error(saveError?.message || 'Unable to review this maintenance run.');
          } finally { setSavingRunAction(false); }
     };
     const statusBadge = (status: string) => {
          const tone = status === 'cleared' || status === 'completed' ? styles.successBadge
               : status === 'awaiting_corrective_action' ? styles.dangerBadge
                    : status === 'awaiting_supervisor_review' ? styles.warningBadge : styles.neutralBadge;
          return <span className={`${styles.badge} ${tone}`}><span aria-hidden="true" className={styles.badgeDot} />{status.replace(/_/g, ' ')}</span>;
     };
     const historyColumns = [
          { Header: 'Instrument', accessor: 'deviceName', Cell: ({ row }: { row: { original: Run } }) => <><strong>{row.original.deviceName}</strong><div>Record #{row.original.id}{row.original.model ? ` · ${row.original.model}` : ''}</div></> },
          { Header: 'Activity', accessor: 'activity_title', Cell: ({ row }: { row: { original: Run } }) => <><strong>{row.original.activity_title || 'Not recorded'}</strong><div>{row.original.activity_type || 'Type not recorded'}</div></> },
          { Header: 'Performed', accessor: 'performed_at', Cell: ({ value }: { value: string }) => formatDateTime(value) },
          { Header: 'Due date', accessor: 'scheduled_date', Cell: ({ value }: { value: string | null }) => value ? String(value).slice(0, 10) : 'Not scheduled' },
          { Header: 'Performer', accessor: 'performed_by', Cell: ({ value }: { value: number | null }) => employee(value) },
          { Header: 'Outcome', accessor: 'status', Cell: ({ value }: { value: string }) => statusBadge(value) },
          { Header: 'Reviewer', accessor: 'reviewed_by', Cell: ({ value }: { value: number | null }) => value == null ? 'Pending review' : employee(value) },
          { Header: 'Action', id: 'action', Cell: ({ row }: { row: { original: Run } }) => <button type="button" className={styles.textButton} onClick={() => void openRun(row.original.id)}><RiEyeLine size={16} aria-hidden="true" /> Details</button> },
     ];
     const checkColumns = [
          { Header: 'Checklist', accessor: 'title_snapshot' },
          { Header: 'Instructions', accessor: 'instructions_snapshot', Cell: ({ value }: { value: string | null }) => value || '—' },
          { Header: 'Result', accessor: 'result', Cell: ({ value }: { value: string }) => <span className={`${styles.badge} ${value === 'pass' ? styles.successBadge : styles.dangerBadge}`}>{value}</span> },
          { Header: 'Comment', accessor: 'comment', Cell: ({ value }: { value: string | null }) => value || '—' },
     ];
     const tabs: { id: typeof section; label: string }[] = [
          { id: 'tasks', label: 'Maintenance tasks' },
          { id: 'plans', label: 'Maintenance schedules' },
          { id: 'history', label: 'Maintenance history' },
     ];
     return <main className={styles.workspace}>
          <header className={styles.header}>
               <div className={styles.heading}><span className={styles.icon} aria-hidden="true"><RiSettings3Line size={24} /></span><div><span className={styles.eyebrow}>Laboratory operations</span><h1>Instrument maintenance</h1><p>Plan recurring checks, record work and keep instrument clearance visible.</p></div></div>
               <button type="button" className={styles.secondary} onClick={refresh} disabled={loading}><RiRefreshLine size={18} aria-hidden="true" /> Refresh</button>
          </header>
          {error && <div role="alert" className={styles.error}><span>{error}</span><button type="button" className={styles.secondary} onClick={() => void load()} disabled={loading}>Retry loading</button></div>}
          <nav className={styles.sectionNav} aria-label="Maintenance sections">{tabs.map(item => <button key={item.id} type="button" aria-pressed={section === item.id} className={`${styles.sectionButton} ${section === item.id ? styles.sectionActive : ''}`} onClick={() => { if (item.id === 'history' && section !== 'history') setHistoryLoading(true); setSection(item.id); }}>{item.label}</button>)}</nav>
          {(section === 'tasks' || section === 'plans') && <MaintenanceTasks view={section} devices={devices} canSupervise={canSupervise} onChanged={load} blocked={blocked} />}
          {section === 'history' && <section className={styles.panel} aria-labelledby="maintenance-history-heading" aria-busy={historyLoading}>
               <div className={styles.panelHeader}><div><h2 id="maintenance-history-heading">Maintenance history</h2><p>Review recorded checks, corrective actions and supervisor decisions.</p></div><span className={styles.muted}>{historyTotal} records</span></div>
               <div className={styles.toolbar}>
                    <div className={styles.field}><label htmlFor="maintenance-history-search"><RiSearchLine size={15} aria-hidden="true" /> Search history</label><input id="maintenance-history-search" type="search" placeholder="Instrument or record ID" value={historyQuery} onChange={event => { setHistoryLoading(true); setHistoryPage(1); setHistoryQuery(event.target.value); }} /></div>
                    <div className={styles.field}><label htmlFor="maintenance-history-status">Outcome</label><select id="maintenance-history-status" value={historyFilter} onChange={event => { setHistoryLoading(true); setHistoryPage(1); setHistoryFilter(event.target.value); }}><option value="all">All outcomes</option><option value="awaiting_corrective_action">Corrective action required</option><option value="awaiting_supervisor_review">Awaiting supervisor review</option><option value="cleared">Cleared</option></select></div>
               </div>
               {historyError ? <div role="alert" className={styles.error}><span>{historyError}</span><button type="button" className={styles.secondary} onClick={() => setHistoryRefresh(current => current + 1)}>Retry history</button></div>
                    : historyLoading ? <div className={styles.loading} role="status"><Spinner size="sm" animation="border" /> Loading history…</div>
                         : history.length === 0 ? <div className={styles.empty}><RiHistoryLine size={28} aria-hidden="true" /><h3>{historyQuery || historyFilter !== 'all' ? 'No matching records' : 'No maintenance records yet'}</h3><p>{historyQuery || historyFilter !== 'all' ? 'Try another instrument or outcome.' : 'Completed maintenance activity will appear here.'}</p>{(historyQuery || historyFilter !== 'all') && <button type="button" className={styles.secondary} onClick={() => { setHistoryLoading(true); setHistoryPage(1); setHistoryQuery(''); setHistoryFilter('all'); }}>Clear filters</button>}</div>
                              : <PrimeTable column={historyColumns} data={history} filtering={false} handleSeverSideProcessing={undefined} />}
               {!historyError && <nav className={styles.historyPagination} aria-label="Maintenance history pages">
                    <button type="button" className={styles.secondary} disabled={historyLoading || historyPage <= 1} onClick={() => { setHistoryLoading(true); setHistoryPage(page => page - 1); }}>Previous</button>
                    <span aria-live="polite">Page {historyPage} of {Math.max(1, Math.ceil(historyTotal / HISTORY_PAGE_SIZE))}</span>
                    <button type="button" className={styles.secondary} disabled={historyLoading || historyPage * HISTORY_PAGE_SIZE >= historyTotal} onClick={() => { setHistoryLoading(true); setHistoryPage(page => page + 1); }}>Next</button>
               </nav>}
          </section>}
          <Modal show={loadingRun || !!selectedRun || !!runError} onHide={() => { setSelectedRun(null); setRunError(''); }} size="lg" centered>
               <Modal.Header closeButton><Modal.Title>Maintenance record</Modal.Title></Modal.Header>
               <Modal.Body>
                    {loadingRun ? <div className={styles.loading} role="status"><Spinner animation="border" /></div> : runError ? <div role="alert" className={styles.error}>{runError}</div> : selectedRun && <>
                         <div className={styles.recordSummary}><div><strong>{devices.find(device => device.id === selectedRun.device_id)?.deviceName || `Instrument ${selectedRun.device_id}`}</strong><span>{formatDateTime(selectedRun.performed_at)}</span></div>{statusBadge(selectedRun.status)}</div>
                         <p>Activity: {selectedRun.activity_title || 'Not recorded'} ({selectedRun.activity_type || 'type not recorded'})<br />Due date: {selectedRun.scheduled_date ? String(selectedRun.scheduled_date).slice(0, 10) : 'Not scheduled'}<br />Performed by: {employee(selectedRun.performed_by)}<br />Reviewed by: {selectedRun.reviewed_by == null ? 'Pending review' : employee(selectedRun.reviewed_by)}{selectedRun.reviewed_at && ` on ${formatDateTime(selectedRun.reviewed_at)}`}</p>
                         {selectedRun.task && <div className={styles.actionCard}><strong>Scheduled task #{selectedRun.task.id}</strong><p>Task status: {selectedRun.task.status}<br />Assigned to: {employee(selectedRun.task.snapshot.assigned_to)}<br />Frequency: every {selectedRun.task.snapshot.interval} {selectedRun.task.snapshot.frequency}</p>{selectedRun.task.snapshot.instructions && <p className={styles.recordText}><strong>Instructions:</strong> {selectedRun.task.snapshot.instructions}</p>}{(selectedRun.task.failure_reason || selectedRun.task.draft?.failure_reason) && <p className={styles.recordText}><strong>Failure reason:</strong> {selectedRun.task.failure_reason || selectedRun.task.draft?.failure_reason}</p>}{selectedRun.task.draft && <><p>Draft recorded by: {employee(selectedRun.task.draft_by)}</p>{selectedRun.task.draft.observations && <p className={styles.recordText}><strong>Draft observation:</strong> {selectedRun.task.draft.observations}</p>}{selectedRun.task.draft.corrective_action && <p className={styles.recordText}><strong>Draft corrective action:</strong> {selectedRun.task.draft.corrective_action}</p>}</>}</div>}
                         <p className={styles.recordText}><strong>Observations:</strong> {selectedRun.observations || 'None recorded'}</p>
                         <PrimeTable column={checkColumns} data={selectedRun.checks || []} filtering={false} handleSeverSideProcessing={undefined} />
                         {selectedRun.correctiveActions?.map(action => <div className={styles.actionCard} key={action.id}><div className={styles.panelHeader}><strong>Corrective action · {selectedRun.checks.find(check => check.id === action.check_id)?.title_snapshot || `Check #${action.check_id}`}</strong>{statusBadge(action.status)}</div><p className={styles.recordText}>{action.description}</p>{action.status === 'completed' && <p>Completed by: {employee(action.completed_by)}{action.completed_at && ` on ${formatDateTime(action.completed_at)}`}</p>}{action.status === 'open' && <div className={styles.actionForm}><Form.Control aria-label="Corrective work completed" placeholder="Describe the corrective work completed" value={actionDescriptions[action.id] || ''} onChange={event => setActionDescriptions(current => ({ ...current, [action.id]: event.target.value }))} /><Button size="sm" disabled={savingRunAction} onClick={() => void completeAction(action.id)}>Complete</Button></div>}</div>)}
                         {canSupervise && selectedRun.status !== 'cleared' && <div className={styles.reviewBox}><Form.Group className="mb-2"><Form.Label>Supervisor verification details{selectedRun.status === 'awaiting_corrective_action' ? ' (required)' : ''}</Form.Label><Form.Control as="textarea" rows={2} value={reviewComment} onChange={event => setReviewComment(event.target.value)} /></Form.Group><Button disabled={savingRunAction} onClick={() => void reviewRun()}>Review and clear instrument</Button></div>}
                         <p className={styles.recordText}><strong>Supervisor verification:</strong> {selectedRun.review_comment || 'None recorded'}</p>
                    </>}
               </Modal.Body>
          </Modal>
     </main>;
}
