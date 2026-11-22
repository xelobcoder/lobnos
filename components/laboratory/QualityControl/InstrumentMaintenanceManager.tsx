'use client';

import React, { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Button, Form, Modal, Spinner, Table } from 'react-bootstrap';
import { RiAddLine, RiAlertLine, RiCheckLine, RiEyeLine, RiHistoryLine, RiRefreshLine, RiSearchLine, RiSettings3Line } from '@remixicon/react';
import { toast } from 'react-toastify';
import { customFetch, customFetchMutation } from '../../Auth/customFetch';
import { useApplicationSettings } from '../../Auth/useApplicationContext';
import { roleAllowed } from '../../Auth/roles';
import styles from './InstrumentMaintenanceManager.module.css';

type Device = { id: string; deviceName: string; model?: string; serialNumber?: string };
type ChecklistItem = { id: number; title: string; instructions?: string | null; active: boolean; sort_order: number };
type MaintenanceCheck = { checklist_item_id: number; result: '' | 'pass' | 'fail'; comment: string; corrective_action: string };
type Run = { id: number; device_id: string; deviceName: string; model?: string; status: string; performed_at: string; performed_by: number; scheduled_date?: string | null; reviewed_by?: number | null; review_comment?: string | null };
type Dashboard = { due: any[]; overdue: any[]; upcoming: any[]; history: Run[]; blocked: any[] };

const payloadOf = (response: any) => response?.data ?? response;
const assertResponseOk = (response: any) => {
     if (response?.status === 'error' || response?.success === false || response?.error || Number(response?.statusCode) >= 400) {
          throw new Error(response?.message || response?.error || 'The maintenance request could not be completed.');
     }
     return response;
};
const listOf = (response: any): any[] => {
     const payload = payloadOf(response);
     if (Array.isArray(payload)) return payload;
     if (Array.isArray(payload?.data)) return payload.data;
     return [];
};
const today = () => new Date().toISOString().slice(0, 10);
const emptyDashboard: Dashboard = { due: [], overdue: [], upcoming: [], history: [], blocked: [] };

export function InstrumentMaintenanceManager() {
     const { applicationsettings } = useApplicationSettings();
     const user = applicationsettings?.user;
     const canSupervise = roleAllowed(user?.role, ['admin', 'manager']);
     const [dashboard, setDashboard] = useState<Dashboard>(emptyDashboard);
     const [devices, setDevices] = useState<Device[]>([]);
     const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
     const [loading, setLoading] = useState(true);
     const [error, setError] = useState('');
     const [scheduleDeviceId, setScheduleDeviceId] = useState('');
     const [frequency, setFrequency] = useState('monthly');
     const [interval, setInterval] = useState(1);
     const [nextDueDate, setNextDueDate] = useState(today());
     const [scheduleActive, setScheduleActive] = useState(true);
     const [savingSchedule, setSavingSchedule] = useState(false);
     const [checklistTitle, setChecklistTitle] = useState('');
     const [checklistInstructions, setChecklistInstructions] = useState('');
     const [editingChecklistId, setEditingChecklistId] = useState<number | null>(null);
     const [savingChecklist, setSavingChecklist] = useState(false);
     const [executionDevice, setExecutionDevice] = useState<Device | null>(null);
     const [executionChecks, setExecutionChecks] = useState<Record<number, MaintenanceCheck>>({});
     const [observations, setObservations] = useState('');
     const [savingExecution, setSavingExecution] = useState(false);
     const [selectedRun, setSelectedRun] = useState<any>(null);
     const [loadingRun, setLoadingRun] = useState(false);
     const [actionDescriptions, setActionDescriptions] = useState<Record<number, string>>({});
     const [reviewComment, setReviewComment] = useState('');
     const [savingRunAction, setSavingRunAction] = useState(false);
     const [section, setSection] = useState<'overview' | 'schedules' | 'checklist' | 'history'>('overview');
     const [scheduleQuery, setScheduleQuery] = useState('');
     const [scheduleFilter, setScheduleFilter] = useState('all');
     const [historyQuery, setHistoryQuery] = useState('');
     const [historyFilter, setHistoryFilter] = useState('all');
     const [showDevicePicker, setShowDevicePicker] = useState(false);

     const load = useCallback(async () => {
          setLoading(true);
          setError('');
          try {
               const [dashboardResponse, deviceResponse, checklistResponse] = (await Promise.all([
                    customFetch('instrument-maintenance/dashboard'),
                    customFetch('devices'),
                    customFetch('instrument-maintenance/checklist'),
               ])).map(assertResponseOk);
               const nextDashboard = payloadOf(dashboardResponse);
               const devicePayload = deviceResponse?.data?.data ?? deviceResponse?.data ?? deviceResponse;
               if (!Array.isArray(devicePayload) && !Array.isArray(devicePayload?.data)) throw new Error('Unable to load QC instruments.');
               setDashboard({
                    due: Array.isArray(nextDashboard?.due) ? nextDashboard.due : [],
                    overdue: Array.isArray(nextDashboard?.overdue) ? nextDashboard.overdue : [],
                    upcoming: Array.isArray(nextDashboard?.upcoming) ? nextDashboard.upcoming : [],
                    history: Array.isArray(nextDashboard?.history) ? nextDashboard.history : [],
                    blocked: Array.isArray(nextDashboard?.blocked) ? nextDashboard.blocked : [],
               });
               setDevices(Array.isArray(devicePayload) ? devicePayload : devicePayload.data);
               setChecklist(listOf(checklistResponse));
          } catch (loadError: any) {
               const message = loadError?.message || 'Unable to load instrument maintenance.';
               setError(message);
               toast.error(message);
          } finally {
               setLoading(false);
          }
     }, []);

     useEffect(() => { void Promise.resolve().then(load); }, [load]);

     const beginExecution = (device: Device) => {
          setShowDevicePicker(false);
          setExecutionDevice(device);
          setObservations('');
          setExecutionChecks(Object.fromEntries(checklist.filter(item => item.active).map(item => [
               item.id,
               { checklist_item_id: item.id, result: '', comment: '', corrective_action: '' },
          ])));
     };

     const submitSchedule = async (event: FormEvent) => {
          event.preventDefault();
          if (!scheduleDeviceId) return toast.error('Choose an instrument to schedule.');
          setSavingSchedule(true);
          try {
               assertResponseOk(await customFetchMutation(`instrument-maintenance/devices/${scheduleDeviceId}/schedule`, 'PUT', {
                    frequency, interval: Number(interval), next_due_date: nextDueDate, active: scheduleActive,
               }));
               toast.success('Maintenance schedule saved.');
               await load();
          } catch (saveError: any) {
               toast.error(saveError?.message || 'Unable to save the maintenance schedule.');
          } finally { setSavingSchedule(false); }
     };

     const saveChecklistItem = async (event: FormEvent) => {
          event.preventDefault();
          if (!checklistTitle.trim()) return toast.error('Enter a checklist item.');
          setSavingChecklist(true);
          try {
               assertResponseOk(await customFetchMutation(
                    editingChecklistId ? `instrument-maintenance/checklist/${editingChecklistId}` : 'instrument-maintenance/checklist',
                    editingChecklistId ? 'PUT' : 'POST',
                    { title: checklistTitle.trim(), instructions: checklistInstructions.trim(), active: true, sort_order: checklist.length },
               ));
               setChecklistTitle('');
               setChecklistInstructions('');
               setEditingChecklistId(null);
               toast.success('Checklist saved.');
               await load();
          } catch (saveError: any) {
               toast.error(saveError?.message || 'Unable to save the checklist item.');
          } finally { setSavingChecklist(false); }
     };

     const submitExecution = async (event: FormEvent) => {
          event.preventDefault();
          if (!executionDevice) return;
          const checks = checklist.filter(item => item.active).map(item => executionChecks[item.id]);
          if (!checks.length || checks.some(check => !check?.result)) return toast.error('Record a pass or fail result for every checklist item.');
          if (checks.some(check => check.result === 'fail' && !check.corrective_action.trim() && !check.comment.trim())) {
               return toast.error('Add corrective action details for every failed check.');
          }
          setSavingExecution(true);
          try {
               assertResponseOk(await customFetchMutation(`instrument-maintenance/devices/${executionDevice.id}/executions`, 'POST', { checks, observations }));
               toast.success('Maintenance execution recorded.');
               setExecutionDevice(null);
               await load();
          } catch (saveError: any) {
               toast.error(saveError?.message || 'Unable to record maintenance.');
          } finally { setSavingExecution(false); }
     };

     const openRun = async (runId: number) => {
          setLoadingRun(true);
          setSelectedRun(null);
          setActionDescriptions({});
          setReviewComment('');
          try {
               setSelectedRun(payloadOf(assertResponseOk(await customFetch(`instrument-maintenance/runs/${runId}`))));
          } catch (loadError: any) {
               toast.error(loadError?.message || 'Unable to load maintenance history.');
          } finally { setLoadingRun(false); }
     };

     const completeAction = async (actionId: number) => {
          const description = actionDescriptions[actionId]?.trim();
          if (!description) return toast.error('Describe the corrective work completed.');
          setSavingRunAction(true);
          try {
               assertResponseOk(await customFetchMutation(`instrument-maintenance/actions/${actionId}/complete`, 'POST', { description }));
               toast.success('Corrective action recorded.');
               await openRun(selectedRun.id);
               await load();
          } catch (saveError: any) {
               toast.error(saveError?.message || 'Unable to record corrective work.');
          } finally { setSavingRunAction(false); }
     };

     const reviewRun = async () => {
          if (!selectedRun) return;
          setSavingRunAction(true);
          try {
               assertResponseOk(await customFetchMutation(`instrument-maintenance/runs/${selectedRun.id}/supervisor-review`, 'POST', { comment: reviewComment }));
               toast.success('Supervisor review recorded; instrument clearance updated.');
               await openRun(selectedRun.id);
               await load();
          } catch (saveError: any) {
               toast.error(saveError?.message || 'Unable to review this maintenance run.');
          } finally { setSavingRunAction(false); }
     };

     const deviceById = useMemo(() => new Map(devices.map(device => [device.id, device])), [devices]);
     const scheduleRows = useMemo(
          () => [...(dashboard.due || []), ...(dashboard.upcoming || [])],
          [dashboard],
     );
     const filteredSchedules = useMemo(() => scheduleRows.filter(item => {
          const query = scheduleQuery.trim().toLowerCase();
          const matchesQuery = !query || `${item.deviceName || ''} ${item.model || ''} ${item.serialNumber || ''}`.toLowerCase().includes(query);
          const matchesStatus = scheduleFilter === 'all' || (item.dueStatus || 'upcoming') === scheduleFilter;
          return matchesQuery && matchesStatus;
     }), [scheduleRows, scheduleQuery, scheduleFilter]);
     const filteredHistory = useMemo(() => (dashboard.history || []).filter(run => {
          const query = historyQuery.trim().toLowerCase();
          const matchesQuery = !query || `${run.deviceName || ''} ${run.model || ''} ${run.id}`.toLowerCase().includes(query);
          const matchesStatus = historyFilter === 'all' || run.status === historyFilter;
          return matchesQuery && matchesStatus;
     }), [dashboard.history, historyQuery, historyFilter]);
     const statusBadge = (status: string) => {
          const tone = status === 'cleared' ? styles.successBadge
               : status === 'awaiting_corrective_action' ? styles.dangerBadge
                    : status === 'awaiting_supervisor_review' ? styles.warningBadge : styles.neutralBadge;
          return <span className={`${styles.badge} ${tone}`}><span aria-hidden="true" className={styles.badgeDot} />{status.replace(/_/g, ' ')}</span>;
     };
     const dueBadge = (status: string) => {
          const tone = status === 'overdue' ? styles.dangerBadge : status === 'due' ? styles.warningBadge : styles.neutralBadge;
          return <span className={`${styles.badge} ${tone}`}><span aria-hidden="true" className={styles.badgeDot} />{status}</span>;
     };
     const checkBadge = (result: string) => {
          const tone = result === 'pass' ? styles.successBadge : styles.dangerBadge;
          return <span className={`${styles.badge} ${tone}`}><span aria-hidden="true" className={styles.badgeDot} />{result}</span>;
     };
     const formatDateTime = (value: string) => {
          const date = new Date(value);
          return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString();
     };
     const openDevicePicker = () => {
          if (!checklist.some(item => item.active)) return toast.error('Add an active checklist before recording maintenance.');
          setShowDevicePicker(true);
     };
     const sectionTabs: { id: typeof section; label: string; count: number }[] = [
          { id: 'overview', label: 'Overview', count: dashboard.due.length + dashboard.blocked.length },
          { id: 'schedules', label: 'Schedules', count: scheduleRows.length },
          { id: 'checklist', label: 'Checklist', count: checklist.length },
          { id: 'history', label: 'History', count: dashboard.history.length },
     ];

     return (
          <main className={styles.workspace}>
               <header className={styles.header}>
                    <div className={styles.heading}>
                         <span className={styles.icon} aria-hidden="true"><RiSettings3Line size={24} /></span>
                         <div>
                              <span className={styles.eyebrow}>Laboratory operations</span>
                              <h1>Instrument maintenance</h1>
                              <p>Plan recurring checks, record work and keep instrument clearance visible.</p>
                         </div>
                    </div>
                    <div className={styles.actions}>
                         <button type="button" className={styles.secondary} onClick={() => void load()} disabled={loading}>
                              <RiRefreshLine size={18} aria-hidden="true" /> Refresh
                         </button>
                         <button type="button" className={styles.primary} onClick={openDevicePicker} disabled={loading || !checklist.some(item => item.active)}>
                              <RiAddLine size={19} aria-hidden="true" /> Record maintenance
                         </button>
                    </div>
               </header>

               <section className={styles.stats} aria-label="Maintenance overview">
                    {[
                         { label: 'Due today', count: dashboard.due?.filter(item => item.dueStatus === 'due').length || 0, tone: styles.statPrimary },
                         { label: 'Overdue', count: dashboard.overdue?.length || 0, tone: styles.statDanger },
                         { label: 'Instruments on hold', count: dashboard.blocked?.length || 0, tone: styles.statWarning },
                         { label: 'Upcoming', count: dashboard.upcoming?.length || 0, tone: styles.statNeutral },
                    ].map(({ label, count, tone }) => (
                         <article className={styles.stat} key={label}>
                              <strong className={tone}>{loading ? '—' : count}</strong>
                              <span>{label}</span>
                         </article>
                    ))}
               </section>

               {error && <div role="alert" className={styles.error}>
                    <span>{error}</span>
                    <button type="button" className={styles.secondary} onClick={() => void load()} disabled={loading}>Retry loading</button>
               </div>}

               <nav className={styles.sectionNav} aria-label="Maintenance sections">
                    {sectionTabs.map(item => (
                         <button
                              key={item.id}
                              type="button"
                              aria-pressed={section === item.id}
                              className={`${styles.sectionButton} ${section === item.id ? styles.sectionActive : ''}`}
                              onClick={() => setSection(item.id)}
                         >
                              {item.label}<span>{item.count}</span>
                         </button>
                    ))}
               </nav>

               {section === 'overview' && <div className={styles.content}>
                    {dashboard.blocked.length > 0 && <section className={`${styles.panel} ${styles.blockedPanel}`} aria-labelledby="maintenance-holds-heading">
                         <div className={styles.panelHeader}>
                              <div><h2 id="maintenance-holds-heading"><RiAlertLine size={19} aria-hidden="true" /> Instruments on hold</h2><p>Failed maintenance must be resolved and reviewed before results can proceed.</p></div>
                              <span className={`${styles.badge} ${styles.dangerBadge}`}>{dashboard.blocked.length} blocked</span>
                         </div>
                         <ul className={styles.blockedList}>
                              {dashboard.blocked.map((item, index) => <li key={item.device_id || item.id || index}>
                                   <div><strong>{item.deviceName || `Instrument ${item.device_id}`}</strong><span>{item.unresolved_runs || 1} unresolved maintenance record(s)</span></div>
                                   <button type="button" className={styles.textButton} onClick={() => { setHistoryQuery(item.deviceName || ''); setHistoryFilter('awaiting_corrective_action'); setSection('history'); }}>
                                        <RiEyeLine size={16} aria-hidden="true" /> View failed records
                                   </button>
                              </li>)}
                         </ul>
                    </section>}

                    <section className={styles.panel} aria-labelledby="maintenance-due-heading" aria-busy={loading}>
                         <div className={styles.panelHeader}>
                              <div><h2 id="maintenance-due-heading">Work due now</h2><p>Prioritize overdue checks, then complete today&apos;s scheduled maintenance.</p></div>
                              <button type="button" className={styles.textButton} onClick={() => setSection('schedules')}>View all schedules</button>
                         </div>
                         {loading ? <div className={styles.loading} role="status"><Spinner size="sm" animation="border" /> Loading maintenance work…</div>
                              : dashboard.due.length === 0 ? <div className={styles.empty}>
                                   <RiCheckLine size={30} aria-hidden="true" />
                                   <h3>Nothing is due right now</h3>
                                   <p>Upcoming schedules and completed work are available in their respective sections.</p>
                                   {canSupervise && <button type="button" className={styles.secondary} onClick={() => setSection('schedules')}>Manage schedules</button>}
                              </div>
                                   : <div className={styles.tableWrap} tabIndex={0} role="region" aria-label="Maintenance due now">
                                        <table className={styles.table}>
                                             <thead><tr><th scope="col">Instrument</th><th scope="col">Due date</th><th scope="col">Frequency</th><th scope="col">Status</th><th scope="col">Action</th></tr></thead>
                                             <tbody>{dashboard.due.slice(0, 8).map(item => <tr key={item.id}>
                                                  <td><strong>{item.deviceName}</strong><span>{item.model || item.serialNumber || 'Laboratory instrument'}</span></td>
                                                  <td>{String(item.next_due_date).slice(0, 10)}</td>
                                                  <td>{item.interval > 1 ? `Every ${item.interval} ${item.frequency}` : item.frequency}</td>
                                                  <td>{dueBadge(item.dueStatus)}</td>
                                                  <td><button type="button" className={styles.textButton} disabled={!checklist.some(check => check.active)} onClick={() => beginExecution(deviceById.get(String(item.device_id)) || { id: String(item.device_id), deviceName: item.deviceName })}>Record</button></td>
                                             </tr>)}</tbody>
                                        </table>
                                        {dashboard.due.length > 8 && <div className={styles.tableFooter}><span>{dashboard.due.length - 8} more due items</span><button type="button" className={styles.textButton} onClick={() => setSection('schedules')}>See all</button></div>}
                                   </div>}
                    </section>
               </div>}

               {section === 'schedules' && <div className={`${styles.content} ${canSupervise ? styles.editorGrid : ''}`}>
                    <section className={styles.panel} aria-labelledby="maintenance-schedules-heading" aria-busy={loading}>
                         <div className={styles.panelHeader}>
                              <div><h2 id="maintenance-schedules-heading">Maintenance schedules</h2><p>Review what&apos;s due, overdue or coming up next.</p></div>
                              <span className={styles.muted}>{scheduleRows.length} active schedules</span>
                         </div>
                         <div className={styles.toolbar}>
                              <div className={styles.field}>
                                   <label htmlFor="maintenance-schedule-search"><RiSearchLine size={15} aria-hidden="true" /> Search instruments</label>
                                   <input id="maintenance-schedule-search" type="search" placeholder="Name, model or serial number" value={scheduleQuery} onChange={event => setScheduleQuery(event.target.value)} />
                              </div>
                              <div className={styles.field}>
                                   <label htmlFor="maintenance-schedule-status">Schedule status</label>
                                   <select id="maintenance-schedule-status" value={scheduleFilter} onChange={event => setScheduleFilter(event.target.value)}>
                                        <option value="all">All schedules</option><option value="overdue">Overdue</option><option value="due">Due today</option><option value="upcoming">Upcoming</option>
                                   </select>
                              </div>
                         </div>
                         {loading ? <div className={styles.loading} role="status"><Spinner size="sm" animation="border" /> Loading schedules…</div>
                              : filteredSchedules.length === 0 ? <div className={styles.empty}>
                                   <RiSettings3Line size={28} aria-hidden="true" />
                                   <h3>{scheduleRows.length ? 'No matching schedules' : 'No active schedules yet'}</h3>
                                   <p>{scheduleRows.length ? 'Adjust your search or status filter.' : 'Create a schedule so each instrument has a clear maintenance cadence.'}</p>
                                   {scheduleRows.length > 0 && <button type="button" className={styles.secondary} onClick={() => { setScheduleQuery(''); setScheduleFilter('all'); }}>Clear filters</button>}
                              </div>
                                   : <div className={styles.tableWrap} tabIndex={0} role="region" aria-label="Maintenance schedules">
                                        <table className={styles.table}>
                                             <thead><tr><th scope="col">Instrument</th><th scope="col">Frequency</th><th scope="col">Next due</th><th scope="col">Status</th><th scope="col">Action</th></tr></thead>
                                             <tbody>{filteredSchedules.map(item => <tr key={item.id}>
                                                  <td><strong>{item.deviceName}</strong><span>{item.model || item.serialNumber || 'Laboratory instrument'}</span></td>
                                                  <td>{item.interval > 1 ? `Every ${item.interval} ${item.frequency}` : item.frequency}</td>
                                                  <td>{String(item.next_due_date).slice(0, 10)}</td>
                                                  <td>{dueBadge(item.dueStatus || 'upcoming')}</td>
                                                  <td><button type="button" className={styles.textButton} disabled={!checklist.some(check => check.active)} onClick={() => beginExecution(deviceById.get(String(item.device_id)) || { id: String(item.device_id), deviceName: item.deviceName })}>Record</button></td>
                                             </tr>)}</tbody>
                                        </table>
                                   </div>}
                    </section>
                    {canSupervise && <section className={styles.panel} aria-labelledby="schedule-editor-heading">
                         <div className={styles.panelHeader}><div><h2 id="schedule-editor-heading">Set a schedule</h2><p>Define how often this instrument is checked.</p></div></div>
                         <Form onSubmit={submitSchedule} className={styles.form}>
                              <Form.Group className={styles.field}><Form.Label>Instrument</Form.Label><Form.Select value={scheduleDeviceId} onChange={event => setScheduleDeviceId(event.target.value)} required><option value="">Select an instrument</option>{devices.map(device => <option key={device.id} value={device.id}>{device.deviceName}{device.model ? ` — ${device.model}` : ''}</option>)}</Form.Select></Form.Group>
                              <div className={styles.inlineFields}>
                                   <Form.Group className={styles.field}><Form.Label>Frequency</Form.Label><Form.Select value={frequency} onChange={event => setFrequency(event.target.value)}><option value="daily">Daily</option><option value="weekly">Weekly</option><option value="monthly">Monthly</option><option value="quarterly">Quarterly</option><option value="annual">Annually</option></Form.Select></Form.Group>
                                   <Form.Group className={styles.field}><Form.Label>Repeat every</Form.Label><Form.Control type="number" min={1} max={365} value={interval} onChange={event => setInterval(Number(event.target.value))} required /></Form.Group>
                              </div>
                              <Form.Group className={styles.field}><Form.Label>Next due date</Form.Label><Form.Control type="date" value={nextDueDate} onChange={event => setNextDueDate(event.target.value)} required /></Form.Group>
                              <label className={styles.switch}><input type="checkbox" checked={scheduleActive} onChange={event => setScheduleActive(event.target.checked)} /><span><strong>Schedule active</strong><small>Active schedules appear in due and upcoming work.</small></span></label>
                              <button type="submit" className={styles.primary} disabled={savingSchedule || loading}>{savingSchedule ? 'Saving schedule…' : 'Save schedule'}</button>
                         </Form>
                    </section>}
               </div>}

               {section === 'checklist' && <div className={`${styles.content} ${canSupervise ? styles.editorGrid : ''}`}>
                    <section className={styles.panel} aria-labelledby="checklist-items-heading">
                         <div className={styles.panelHeader}><div><h2 id="checklist-items-heading">Checklist items</h2><p>Standardize the checks technicians complete during maintenance.</p></div><span className={styles.muted}>{checklist.length} items</span></div>
                         {checklist.length === 0 ? <div className={styles.empty}><RiCheckLine size={28} aria-hidden="true" /><h3>No checklist items yet</h3><p>Add the required checks before recording maintenance.</p></div>
                              : <ul className={styles.checklist}>{checklist.map((item, index) => <li key={item.id}>
                                   <span className={styles.checkNumber}>{String(index + 1).padStart(2, '0')}</span>
                                   <div className={styles.checkText}><strong>{item.title}</strong>{item.instructions && <span>{item.instructions}</span>}</div>
                                   <span className={`${styles.badge} ${item.active ? styles.successBadge : styles.neutralBadge}`}>{item.active ? 'Active' : 'Inactive'}</span>
                                   {canSupervise && <button type="button" className={styles.textButton} onClick={() => { setChecklistTitle(item.title); setChecklistInstructions(item.instructions || ''); setEditingChecklistId(item.id); }}>Edit</button>}
                              </li>)}</ul>}
                    </section>
                    {canSupervise && <section className={styles.panel} aria-labelledby="checklist-editor-heading">
                         <div className={styles.panelHeader}><div><h2 id="checklist-editor-heading">{editingChecklistId ? 'Edit checklist item' : 'Add checklist item'}</h2><p>Keep instructions short and specific.</p></div></div>
                         <Form onSubmit={saveChecklistItem} className={styles.form}>
                              <Form.Group className={styles.field}><Form.Label>Check</Form.Label><Form.Control placeholder="e.g. Inspect tubing for wear" value={checklistTitle} onChange={event => setChecklistTitle(event.target.value)} required /></Form.Group>
                              <Form.Group className={styles.field}><Form.Label>Instructions <span className={styles.optional}>(optional)</span></Form.Label><Form.Control as="textarea" rows={4} placeholder="Describe how to perform this check." value={checklistInstructions} onChange={event => setChecklistInstructions(event.target.value)} /></Form.Group>
                              <div className={styles.formActions}>
                                   <button type="submit" className={styles.primary} disabled={savingChecklist}>{savingChecklist ? 'Saving item…' : editingChecklistId ? 'Save changes' : 'Add checklist item'}</button>
                                   {editingChecklistId && <button type="button" className={styles.secondary} onClick={() => { setEditingChecklistId(null); setChecklistTitle(''); setChecklistInstructions(''); }}>Cancel</button>}
                              </div>
                         </Form>
                    </section>}
               </div>}

               {section === 'history' && <section className={styles.panel} aria-labelledby="maintenance-history-heading" aria-busy={loading}>
                    <div className={styles.panelHeader}><div><h2 id="maintenance-history-heading">Maintenance history</h2><p>Review recorded checks, corrective actions and supervisor decisions.</p></div><span className={styles.muted}>{dashboard.history.length} records</span></div>
                    <div className={styles.toolbar}>
                         <div className={styles.field}><label htmlFor="maintenance-history-search"><RiSearchLine size={15} aria-hidden="true" /> Search history</label><input id="maintenance-history-search" type="search" placeholder="Instrument or record ID" value={historyQuery} onChange={event => setHistoryQuery(event.target.value)} /></div>
                         <div className={styles.field}><label htmlFor="maintenance-history-status">Outcome</label><select id="maintenance-history-status" value={historyFilter} onChange={event => setHistoryFilter(event.target.value)}><option value="all">All outcomes</option><option value="awaiting_corrective_action">Corrective action required</option><option value="awaiting_supervisor_review">Awaiting supervisor review</option><option value="cleared">Cleared</option></select></div>
                    </div>
                    {loading ? <div className={styles.loading} role="status"><Spinner size="sm" animation="border" /> Loading history…</div>
                         : filteredHistory.length === 0 ? <div className={styles.empty}><RiHistoryLine size={28} aria-hidden="true" /><h3>{dashboard.history.length ? 'No matching records' : 'No maintenance records yet'}</h3><p>{dashboard.history.length ? 'Try another instrument or outcome.' : 'Completed maintenance activity will appear here.'}</p>{dashboard.history.length > 0 && <button type="button" className={styles.secondary} onClick={() => { setHistoryQuery(''); setHistoryFilter('all'); }}>Clear filters</button>}</div>
                              : <div className={styles.tableWrap} tabIndex={0} role="region" aria-label="Maintenance history records">
                                   <table className={styles.table}>
                                        <thead><tr><th scope="col">Instrument</th><th scope="col">Performed</th><th scope="col">Schedule</th><th scope="col">Outcome</th><th scope="col">Supervisor</th><th scope="col">Action</th></tr></thead>
                                        <tbody>{filteredHistory.map(run => <tr key={run.id}>
                                             <td><strong>{run.deviceName}</strong><span>Record #{run.id}{run.model ? ` · ${run.model}` : ''}</span></td>
                                             <td>{formatDateTime(run.performed_at)}</td>
                                             <td>{run.scheduled_date ? String(run.scheduled_date).slice(0, 10) : 'Ad hoc'}</td>
                                             <td>{statusBadge(run.status)}</td>
                                             <td>{run.reviewed_by ? 'Reviewed' : 'Pending review'}</td>
                                             <td><button type="button" className={styles.textButton} onClick={() => void openRun(run.id)}><RiEyeLine size={16} aria-hidden="true" /> Details</button></td>
                                        </tr>)}</tbody>
                                   </table>
                              </div>}
               </section>}

               <Modal show={showDevicePicker} onHide={() => setShowDevicePicker(false)} centered>
                    <Modal.Header closeButton><Modal.Title>Select an instrument</Modal.Title></Modal.Header>
                    <Modal.Body>
                         <p className={styles.modalHelp}>Choose the instrument for this maintenance record.</p>
                         {devices.length === 0 ? <div className={styles.empty}><h3>No instruments available</h3><p>Add an instrument in the Devices section before recording maintenance.</p></div>
                              : <div className={styles.deviceOptions}>{devices.map(device => <button type="button" key={device.id} onClick={() => beginExecution(device)}><span><strong>{device.deviceName}</strong><small>{device.model || device.serialNumber || 'Laboratory instrument'}</small></span><RiAddLine size={18} aria-hidden="true" /></button>)}</div>}
                    </Modal.Body>
               </Modal>

               <Modal show={!!executionDevice} onHide={() => setExecutionDevice(null)} size="lg" centered>
                    <Form onSubmit={submitExecution}>
                         <Modal.Header closeButton><Modal.Title>Record maintenance — {executionDevice?.deviceName}</Modal.Title></Modal.Header>
                         <Modal.Body>
                              {!checklist.some(item => item.active) ? <Alert variant="warning">An active checklist is required before maintenance can be recorded.</Alert> : <>
                                   <Form.Group className="mb-3"><Form.Label>Observations and notes</Form.Label><Form.Control as="textarea" rows={2} value={observations} onChange={event => setObservations(event.target.value)} /></Form.Group>
                                   {checklist.filter(item => item.active).map((item, index) => <div className={styles.executionCheck} key={item.id}>
                                        <div className={styles.executionHeading}><span>{String(index + 1).padStart(2, '0')}</span><div><strong>{item.title}</strong>{item.instructions && <small>{item.instructions}</small>}</div></div>
                                        <div className="row g-2 mt-1">
                                             <Form.Group className="col-md-4"><Form.Label>Result</Form.Label><Form.Select value={executionChecks[item.id]?.result || ''} onChange={event => setExecutionChecks(current => ({ ...current, [item.id]: { ...current[item.id], result: event.target.value as MaintenanceCheck['result'] } }))} required><option value="">Choose result</option><option value="pass">Pass</option><option value="fail">Fail</option></Form.Select></Form.Group>
                                             <Form.Group className="col-md-8"><Form.Label>Comment</Form.Label><Form.Control value={executionChecks[item.id]?.comment || ''} onChange={event => setExecutionChecks(current => ({ ...current, [item.id]: { ...current[item.id], comment: event.target.value } }))} /></Form.Group>
                                             {executionChecks[item.id]?.result === 'fail' && <Form.Group><Form.Label>Corrective action taken or required</Form.Label><Form.Control value={executionChecks[item.id]?.corrective_action || ''} onChange={event => setExecutionChecks(current => ({ ...current, [item.id]: { ...current[item.id], corrective_action: event.target.value } }))} required /></Form.Group>}
                                        </div>
                                   </div>)}
                              </>}
                         </Modal.Body>
                         <Modal.Footer><Button variant="outline-secondary" onClick={() => setExecutionDevice(null)}>Cancel</Button><Button type="submit" disabled={savingExecution || checklist.filter(item => item.active).length === 0}>{savingExecution ? 'Saving…' : 'Save maintenance record'}</Button></Modal.Footer>
                    </Form>
               </Modal>

               <Modal show={loadingRun || !!selectedRun} onHide={() => setSelectedRun(null)} size="lg" centered>
                    <Modal.Header closeButton><Modal.Title>Maintenance record</Modal.Title></Modal.Header>
                    <Modal.Body>
                         {loadingRun ? <div className={styles.loading} role="status"><Spinner animation="border" /></div> : selectedRun && <>
                              <div className={styles.recordSummary}><div><strong>{devices.find(device => device.id === selectedRun.device_id)?.deviceName || `Instrument ${selectedRun.device_id}`}</strong><span>{formatDateTime(selectedRun.performed_at)}</span></div>{statusBadge(selectedRun.status)}</div>
                              {selectedRun.observations && <p className={styles.modalHelp}>{selectedRun.observations}</p>}
                              <Table bordered responsive size="sm">
                                   <thead>
                                        <tr><th>Checklist</th><th>Result</th><th>Comment</th></tr>
                                   </thead>
                                   <tbody>
                                        {selectedRun.checks?.map((check: any) => (
                                             <tr key={check.id}>
                                                  <td>{check.title_snapshot}</td>
                                                  <td>{checkBadge(check.result)}</td>
                                                  <td>{check.comment || '—'}</td>
                                             </tr>
                                        ))}
                                   </tbody>
                              </Table>
                              {selectedRun.correctiveActions?.map((action: any) => <div className={styles.actionCard} key={action.id}><div className={styles.panelHeader}><strong>Corrective action</strong>{statusBadge(action.status)}</div><p>{action.description}</p>{action.status === 'open' && <div className={styles.actionForm}><Form.Control aria-label="Corrective work completed" placeholder="Describe the corrective work completed" value={actionDescriptions[action.id] || ''} onChange={event => setActionDescriptions(current => ({ ...current, [action.id]: event.target.value }))} /><Button size="sm" disabled={savingRunAction} onClick={() => void completeAction(action.id)}>Complete</Button></div>}</div>)}
                              {canSupervise && selectedRun.status !== 'cleared' && <div className={styles.reviewBox}><Form.Group className="mb-2"><Form.Label>Supervisor review comment</Form.Label><Form.Control as="textarea" rows={2} value={reviewComment} onChange={event => setReviewComment(event.target.value)} /></Form.Group><Button disabled={savingRunAction} onClick={() => void reviewRun()}>Review and clear instrument</Button></div>}
                              {selectedRun.review_comment && <p className={styles.modalHelp}>Supervisor review: {selectedRun.review_comment}</p>}
                         </>}
                    </Modal.Body>
               </Modal>
          </main>
     );
}
