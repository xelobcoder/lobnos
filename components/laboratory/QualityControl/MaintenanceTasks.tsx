'use client';

import React, { FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Button, Form, Modal, Spinner } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { customFetch, customFetchMutation } from '../../Auth/customFetch';
import PrimeTable from '../../accessories/Datatables/PrimeTable';
import styles from './InstrumentMaintenanceManager.module.css';
import { MaintenanceCheckDefinition, MaintenanceCheckInput, maintenanceCheckStatus, maintenanceCheckSummary } from './MaintenanceCheckInput';

type Device = { id: string; deviceName: string; model?: string; serialNumber?: string };
type Kind = MaintenanceCheckDefinition['kind'];
type Check = MaintenanceCheckDefinition;
type Plan = { id: number; device_id: string; deviceName: string; model?: string; title: string; activity_type: string; frequency: string; interval: number; next_due_date: string; assigned_to: number | null; instructions: string; active: boolean | number; checklist: Check[]; scheduling_conflict?: boolean };
type Draft = { checks: { index: number; value: string | number }[]; observations: string; failure_reason?: string; corrective_action?: string; failure_evidence?: { index: number; value: string | number }[] };
type Task = { id: number; plan_id: number; device_id: string; due_date: string; deviceName: string; model?: string; revision: number; draft: Draft | null; snapshot: Pick<Plan, 'title' | 'activity_type' | 'frequency' | 'interval' | 'assigned_to' | 'instructions' | 'checklist'> & { follow_up_of_task_id?: number } };
type FailureHistory = { task_id: number; run_state: string; deviceName: string; task_title: string; check_title: string; value: string | number; reported_by: number; reported_at: string; follow_up_of_task_id: number | null };
type Editor = Omit<Plan, 'id' | 'deviceName'>;

const blankCheck = (title = ''): Check => ({ title, instructions: '', kind: 'completion', required: true, min: null, max: null, unit: '' });
const emptyPlan = (): Editor => ({ device_id: '', title: '', activity_type: 'Preventive', frequency: 'daily', interval: 1, next_due_date: new Date().toISOString().slice(0, 10), assigned_to: null, instructions: '', active: true, checklist: [blankCheck()] });
const parse = (result: any) => {
     if (!result || typeof result !== 'object') throw new Error('No response from the maintenance service.');
     if (result?.status === 'error' || result?.success === false || result?.error || Number(result?.statusCode) >= 400)
          throw new Error(result?.message || result?.error || 'Maintenance request failed.');
     return result?.data ?? result;
};
const date = (value: string) => String(value).slice(0, 10);

export default function MaintenanceTasks({ view, devices, canSupervise, onChanged, blocked }: { view: 'tasks' | 'plans'; devices: Device[]; canSupervise: boolean; onChanged: () => Promise<void>; blocked: { device_id: string; deviceName: string; unresolved_runs: number }[] }) {
     const [plans, setPlans] = useState<Plan[]>([]);
     const [tasks, setTasks] = useState<Task[]>([]);
     const [loading, setLoading] = useState(true);
     const [error, setError] = useState('');
     const [editor, setEditor] = useState<Editor | null>(null);
     const [editingId, setEditingId] = useState<number | null>(null);
     const [task, setTask] = useState<Task | null>(null);
     const [values, setValues] = useState<Record<number, string>>({});
     const [reason, setReason] = useState('');
     const [observation, setObservation] = useState('');
     const [corrective, setCorrective] = useState('');
     const [saving, setSaving] = useState(false);
     const [deviceFilter, setDeviceFilter] = useState('');
     const [dueFilter, setDueFilter] = useState('');
     const [staff, setStaff] = useState<{ employeeid: number; username: string }[]>([]);
     const [staffError, setStaffError] = useState('');
     const [holdError, setHoldError] = useState('');
     const [holdSaving, setHoldSaving] = useState(false);
     const [failureHistory, setFailureHistory] = useState<FailureHistory[]>([]);
     const [numericPending, setNumericPending] = useState<number | null>(null);
     const pendingFailure = useRef<{ task: Task; values: Record<number, string>; index: number } | null>(null);
     const pendingNumeric = useRef<{ index: number; value: string; values: Record<number, string> } | null>(null);
     const holdBusy = useRef(false);

     const load = useCallback(async () => {
          setLoading(true);
          setError('');
          try {
               const result = parse(await customFetch('instrument-maintenance/plans'));
               if (!Array.isArray(result?.plans) || !Array.isArray(result?.tasks)) throw new Error('Invalid maintenance schedules response.');
               setPlans(result.plans);
               setTasks(result.tasks);
               setFailureHistory(Array.isArray(result.failure_history) ? result.failure_history : []);
          } catch (e: any) { setError(e?.message || 'Unable to load maintenance tasks.'); }
          finally { setLoading(false); }
     }, []);
     useEffect(() => { void Promise.resolve().then(load); }, [load]);
     useEffect(() => {
          let active = true;
          customFetch('operations/laboratory/workbench/options').then(result => {
               const options = parse(result);
               if (!Array.isArray(options?.staff)) throw new Error('Invalid staff options response.');
               if (active) { setStaff(options.staff); setStaffError(''); }
          }).catch((e: any) => { if (active) setStaffError(e?.message || 'Unable to load staff options.'); });
          return () => { active = false; };
     }, []);
     useEffect(() => {
          const warn = (event: BeforeUnloadEvent) => { if (pendingFailure.current || pendingNumeric.current) { event.preventDefault(); event.returnValue = ''; } };
          window.addEventListener('beforeunload', warn);
          return () => window.removeEventListener('beforeunload', warn);
     }, []);
     const summary = maintenanceCheckSummary(task?.snapshot.checklist ?? [], values);
     const failed = summary.failedCount > 0;
     const invalid = summary.invalid;
     const setCheck = (index: number, patch: Partial<Check>) => setEditor(current => current && ({
          ...current, checklist: current.checklist.map((item, i) => i === index ? { ...item, ...patch } : item),
     }));
     const template = (name: string) => {
          if (!editor || !name) return;
          const daily = name === 'daily';
          setEditor({ ...editor, title: daily ? 'Daily maintenance' : 'Weekly preventive maintenance',
               activity_type: 'Preventive', frequency: daily ? 'daily' : 'weekly', interval: 1,
               checklist: (daily
                    ? ['Inspect instrument and surrounding area', 'Check supplies and consumables', 'Clean accessible surfaces', 'Check instrument readiness']
                    : ['Inspect instrument and components', 'Clean according to manufacturer instructions', 'Check supplies and consumables', 'Verify instrument operation']
               ).map(title => blankCheck(title)),
          });
     };
     const save = async (event: FormEvent) => {
          event.preventDefault();
          if (!editor) return;
          setSaving(true);
          try {
               parse(await customFetchMutation(editingId ? `instrument-maintenance/plans/${editingId}` : 'instrument-maintenance/plans', editingId ? 'PUT' : 'POST',
                    { ...editor, active: Boolean(editor.active) }));
               setEditor(null);
               toast.success('Maintenance schedule saved.');
               await Promise.all([load(), onChanged()]);
          } catch (e: any) { toast.error(e?.message || 'Unable to save schedule.'); }
          finally { setSaving(false); }
     };
     const begin = (item: Task) => {
          setTask(item);
          setValues(Object.fromEntries((item.draft?.checks || []).map(check => [check.index, String(check.value)])));
          setReason(item.draft?.failure_reason || ''); setObservation(item.draft?.observations || ''); setCorrective(item.draft?.corrective_action || '');
          pendingNumeric.current = null; setNumericPending(null);
          setHoldError('');
     };
     const persistFailure = async (item: Task, nextValues: Record<number, string>, index: number) => {
          if (holdBusy.current) return;
          holdBusy.current = true;
          pendingFailure.current = { task: item, values: nextValues, index };
          setHoldSaving(true); setHoldError('');
          try {
               const checks = [{ index, value: nextValues[index] }];
               const result = parse(await customFetchMutation(`instrument-maintenance/tasks/${item.id}/draft`, 'PUT', {
                    task_revision: item.revision, checks, failure_only: true,
               }));
               if (result.completed) {
                    pendingFailure.current = null;
                    setTask(null);
                    toast.warning('This failure was already recorded on the completed task. Reloading.');
                    await Promise.all([load(), onChanged()]);
                    return;
               }
               if (!result.hold || !result.draft || !Number.isSafeInteger(Number(result.revision))) throw new Error('Failure hold was not confirmed by the server.');
               const updated = { ...item, id: Number(result.id), revision: Number(result.revision), draft: result.draft,
                    snapshot: { ...item.snapshot, follow_up_of_task_id: result.follow_up_of_task_id || item.snapshot.follow_up_of_task_id } };
               setTask(updated);
               setValues(current => {
                    const merged = { ...current };
                    for (const check of result.draft.checks) {
                         if (maintenanceCheckStatus(item.snapshot.checklist[check.index], String(check.value)) === 'fail')
                              merged[check.index] = String(check.value);
                    }
                    return merged;
               });
               pendingFailure.current = null;
               if (result.merged_stale) toast.warning('The task changed; failure evidence was merged. Review the current draft before finalizing.');
               await onChanged().catch(() => toast.warning('Failure hold saved, but the instrument list could not be refreshed.'));
          } catch (e: any) {
               setHoldError(`${e?.message || 'Unable to record the failure.'} The hold is not confirmed. Retry now and keep the instrument out of service.`);
          } finally { holdBusy.current = false; setHoldSaving(false); }
     };
     const changeAnswer = (index: number, value: string) => {
          if (!task || holdBusy.current || pendingFailure.current || task.draft?.failure_evidence?.some(e => e.index === index)) return;
          const next = { ...values, [index]: value };
          setValues(next);
          if (task.snapshot.checklist[index].kind === 'numeric') {
               pendingNumeric.current = { index, value, values: next };
               setNumericPending(index);
               return;
          }
          if (maintenanceCheckStatus(task.snapshot.checklist[index], value) === 'fail') void persistFailure(task, next, index);
     };
     const commitNumeric = (index: number) => {
          const pending = pendingNumeric.current;
          if (!task || !pending || pending.index !== index) return;
          const status = maintenanceCheckStatus(task.snapshot.checklist[index], pending.value);
          if (status === 'invalid') return;
          pendingNumeric.current = null; setNumericPending(null);
          if (status === 'fail') void persistFailure(task, pending.values, index);
     };
     const saveDraft = async (discard = false) => {
          if (!task) return;
          if (pendingNumeric.current) return toast.error('Confirm the numeric value before saving.');
          if (discard && !window.confirm('Discard the saved draft?')) return;
          const checks = discard ? [] : task.snapshot.checklist.flatMap((_, index) => values[index] ? [{ index, value: values[index] }] : []);
          if (pendingFailure.current) return toast.error('Retry the unconfirmed failure hold first.');
          if (discard && task.draft?.failure_evidence?.length) return toast.error('Recorded failures cannot be discarded.');
          if (!discard && invalid) return toast.error('Correct invalid checklist responses.');
          setSaving(true);
          try {
               const result = parse(await customFetchMutation(`instrument-maintenance/tasks/${task.id}/draft`, 'PUT', {
                    task_revision: task.revision, checks, observations: discard ? '' : observation,
                    failure_reason: discard ? '' : reason, corrective_action: discard ? '' : corrective,
               }));
               if (!Number.isSafeInteger(Number(result.revision))) throw new Error('Draft save was not confirmed.');
               setTask(null);
               toast.success(discard ? 'Draft discarded.' : 'Draft saved.');
               await load();
          } catch (e: any) { toast.error(e?.message || 'Unable to save draft.'); }
          finally { setSaving(false); }
     };
     const complete = async (event: FormEvent) => {
          event.preventDefault();
          if (!task) return;
          if (pendingNumeric.current) return toast.error('Confirm the numeric value before finalizing.');
          if (pendingFailure.current || holdBusy.current) return toast.error('Confirm the failure hold before finalizing.');
          const checks = task.snapshot.checklist.flatMap((_, index) => values[index] ? [{ index, value: values[index] }] : []);
          if (invalid) return toast.error('Correct invalid checklist responses.');
          if (!checks.length) return toast.error('Record at least one checklist response.');
          if (!failed && task.snapshot.checklist.some((check, index) => check.required && !values[index]))
               return toast.error('Complete all required checks before recording a pass.');
          if (failed && (!reason.trim() || !observation.trim() || !corrective.trim()))
               return toast.error('Failure reason, observation and corrective action are required.');
          setSaving(true);
          try {
               const result = parse(await customFetchMutation(`instrument-maintenance/tasks/${task.id}/complete`, 'POST', {
                    task_revision: task.revision, checks, failure_reason: reason, observations: observation, corrective_action: corrective,
               }));
               setTask(null);
               toast.success(result.result === 'fail' ? 'Failure recorded. Instrument is on hold until corrective work and supervisor verification.' : 'Maintenance completed.');
               if (result.scheduling_conflict) toast.warning(result.scheduling_conflict, { autoClose: false });
               await Promise.all([load(), onChanged()]);
          } catch (e: any) { toast.error(e?.message || 'Unable to complete maintenance.'); }
          finally { setSaving(false); }
     };
     const today = new Date().toISOString().slice(0, 10);
     const filteredTasks = tasks.filter(item => (!deviceFilter || item.device_id === deviceFilter) && (!dueFilter || date(item.due_date) === dueFilter));
     const filteredPlans = plans.filter(item => !deviceFilter || item.device_id === deviceFilter);
     const dueTasks = filteredTasks.filter(item => date(item.due_date) <= today);
     const upcomingTasks = filteredTasks.filter(item => date(item.due_date) > today);
     const taskDevice = task && devices.find(device => device.id === task.device_id);
     const taskColumns = [
          { Header: 'Instrument', accessor: 'deviceName', Cell: ({ row }: { row: { original: Task } }) => <><strong>{row.original.deviceName}</strong>{row.original.model && <div>{row.original.model}</div>}</> },
          { Header: 'Maintenance', id: 'activity', Cell: ({ row }: { row: { original: Task } }) => <><strong>{row.original.snapshot.title}</strong><div>{row.original.snapshot.activity_type}</div></> },
          { Header: 'Frequency', id: 'frequency', Cell: ({ row }: { row: { original: Task } }) => `Every ${row.original.snapshot.interval} ${row.original.snapshot.frequency}` },
          { Header: 'Due date', accessor: 'due_date', Cell: ({ value }: { value: string }) => date(value) },
          { Header: 'Status', id: 'status', Cell: ({ row }: { row: { original: Task } }) => {
               const dueStatus = date(row.original.due_date) < today ? 'Overdue' : date(row.original.due_date) === today ? 'Due today' : 'Upcoming';
               return <span className={`${styles.badge} ${dueStatus === 'Overdue' ? styles.dangerBadge : dueStatus === 'Due today' ? styles.warningBadge : styles.neutralBadge}`}>{dueStatus}</span>;
          } },
          { Header: 'Action', id: 'action', Cell: ({ row }: { row: { original: Task } }) => <Button size="sm" onClick={() => begin(row.original)}>Perform</Button> },
     ];
     const planColumns = [
          { Header: 'Instrument', accessor: 'deviceName', Cell: ({ row }: { row: { original: Plan } }) => <><strong>{row.original.deviceName}</strong>{row.original.model && <div>{row.original.model}</div>}</> },
          { Header: 'Maintenance activity', accessor: 'title' },
          { Header: 'Type', accessor: 'activity_type' },
          { Header: 'Frequency', id: 'frequency', Cell: ({ row }: { row: { original: Plan } }) => `Every ${row.original.interval} ${row.original.frequency}` },
          { Header: 'Next due', accessor: 'next_due_date', Cell: ({ value }: { value: string }) => date(value) },
          { Header: 'Checklist', id: 'checklist', Cell: ({ row }: { row: { original: Plan } }) => `${row.original.checklist.length} items` },
          { Header: 'Status', id: 'status', Cell: ({ row }: { row: { original: Plan } }) => <>{row.original.active ? 'Active' : 'Inactive'}{row.original.scheduling_conflict && <div role="alert">Scheduling conflict: next occurrence already completed. Edit schedule.</div>}</> },
          ...(canSupervise ? [{ Header: 'Action', id: 'action', Cell: ({ row }: { row: { original: Plan } }) => <button type="button" className={styles.textButton} onClick={() => { const plan = row.original; setEditingId(plan.id); setEditor({ ...plan, active: Boolean(plan.active), next_due_date: date(plan.next_due_date) }); }}>Edit</button> }] : []),
     ];
     const renderTaskTable = (items: Task[], label: string) => items.length > 0 && <section aria-label={label}>
          <h3 className={styles.taskGroupHeading}>{label} ({items.length})</h3>
          <PrimeTable column={taskColumns} data={items} filtering={false} handleSeverSideProcessing={undefined} />
     </section>;
     return <div className={styles.content}>
          {error && <Alert variant="danger">{error} <Button size="sm" onClick={() => void load()}>Retry</Button></Alert>}
          {blocked.length > 0 && <Alert variant="danger"><strong>Out of service: </strong>{blocked.map(item => `${item.deviceName} (${item.unresolved_runs} unresolved)`).join(', ')}. Complete corrective work and supervisor review in Maintenance history.</Alert>}
          {view === 'tasks' && <>
               <section className={styles.stats} aria-label="Maintenance task summary">
                    {[{ label: 'Due today', count: tasks.filter(item => date(item.due_date) === today).length, tone: styles.statWarning },
                         { label: 'Overdue', count: tasks.filter(item => date(item.due_date) < today).length, tone: styles.statDanger },
                         { label: 'Upcoming', count: tasks.filter(item => date(item.due_date) > today).length, tone: styles.statPrimary },
                         { label: 'Instruments on hold', count: blocked.length, tone: styles.statDanger }].map(item =>
                              <article key={item.label} className={styles.stat}><strong className={item.tone}>{loading ? '—' : item.count}</strong><span>{item.label}</span></article>)}
               </section>
               <section className={styles.panel}>
                    <div className={styles.panelHeader}><div><h2>Maintenance tasks</h2><p>What needs to be done across the laboratory and what is coming up.</p></div></div>
                    <div className={styles.toolbar}>
                         <div className={styles.field}><label htmlFor="task-instrument">Instrument</label><select id="task-instrument" value={deviceFilter} onChange={event => setDeviceFilter(event.target.value)}><option value="">All instruments</option>{devices.map(device => <option key={device.id} value={device.id}>{device.deviceName}</option>)}</select></div>
                         <div className={styles.field}><label htmlFor="task-due-date">Due date</label><input id="task-due-date" type="date" value={dueFilter} onChange={event => setDueFilter(event.target.value)} /></div>
                    </div>
                    {loading ? <Spinner size="sm" /> : filteredTasks.length === 0 ? <p>{tasks.length ? 'No tasks match the selected filters.' : 'No pending maintenance tasks.'}</p> : <>{renderTaskTable(dueTasks, 'Due & overdue')}{renderTaskTable(upcomingTasks, 'Upcoming')}</>}
               </section>
               {failureHistory.length > 0 && <details className={styles.panel}><summary>Failure reporting history ({failureHistory.length})</summary>
                    <ul>{failureHistory.map((entry, index) => <li key={`${entry.task_id}-${index}`}>
                         {entry.deviceName} · {entry.task_title} · {entry.check_title}: {entry.value} — reported by {staff.find(person => Number(person.employeeid) === Number(entry.reported_by))?.username || 'Employee'} #{entry.reported_by} at {entry.reported_at} ({entry.run_state}{entry.follow_up_of_task_id ? `, follow-up to task #${entry.follow_up_of_task_id}` : ''})
                    </li>)}</ul>
               </details>}
          </>}
          {view === 'plans' && <section className={styles.panel}>
               <div className={styles.panelHeader}><div><h2>Maintenance schedules</h2><p>Recurring maintenance configured against existing instruments.</p></div>{canSupervise && <Button onClick={() => { setEditingId(null); setEditor(emptyPlan()); }}>Configure maintenance</Button>}</div>
               <div className={styles.toolbar}><div className={styles.field}><label htmlFor="plan-instrument">Instrument</label><select id="plan-instrument" value={deviceFilter} onChange={event => setDeviceFilter(event.target.value)}><option value="">All instruments</option>{devices.map(device => <option key={device.id} value={device.id}>{device.deviceName}</option>)}</select></div></div>
               {loading ? <Spinner size="sm" /> : filteredPlans.length === 0 ? <p>{plans.length ? 'No schedules match the selected instrument.' : 'No recurring schedules configured.'}</p> : <PrimeTable column={planColumns} data={filteredPlans} filtering={false} handleSeverSideProcessing={undefined} />}
          </section>}
          <Modal show={!!editor} onHide={() => setEditor(null)} size="lg" centered>
               {editor && <Form onSubmit={save}>
                    <Modal.Header closeButton><Modal.Title>{editingId ? 'Edit maintenance schedule' : 'Configure maintenance'}</Modal.Title></Modal.Header>
                    <Modal.Body>
                         <Form.Group className="mb-3"><Form.Label>Start from a template</Form.Label><Form.Select defaultValue="" onChange={event => template(event.target.value)}><option value="">Custom</option><option value="daily">Daily maintenance</option><option value="weekly">Weekly preventive maintenance</option></Form.Select><Form.Text>Review and edit every item for this instrument. Templates do not define clinical limits.</Form.Text></Form.Group>
                         <Form.Group className="mb-3"><Form.Label>Instrument</Form.Label><Form.Select required disabled={!!editingId} value={editor.device_id} onChange={event => setEditor({ ...editor, device_id: event.target.value })}><option value="">Select an instrument</option>{devices.map(device => <option key={device.id} value={device.id}>{device.deviceName}{device.model ? ` - ${device.model}` : ''}</option>)}</Form.Select></Form.Group>
                         <Form.Group className="mb-3"><Form.Label>Schedule name</Form.Label><Form.Control required maxLength={255} value={editor.title} onChange={event => setEditor({ ...editor, title: event.target.value })} /></Form.Group>
                         <Form.Group className="mb-3"><Form.Label>Activity type</Form.Label><Form.Control required maxLength={80} value={editor.activity_type} onChange={event => setEditor({ ...editor, activity_type: event.target.value })} /></Form.Group>
                         <div className="row g-2 mb-3"><Form.Group className="col-md-4"><Form.Label>Frequency</Form.Label><Form.Select value={editor.frequency} onChange={event => setEditor({ ...editor, frequency: event.target.value })}><option value="daily">Daily</option><option value="weekly">Weekly</option><option value="monthly">Monthly</option><option value="quarterly">Quarterly</option><option value="annual">Annual</option></Form.Select></Form.Group><Form.Group className="col-md-4"><Form.Label>Repeat every</Form.Label><Form.Control type="number" min="1" max="365" required value={editor.interval} onChange={event => setEditor({ ...editor, interval: Number(event.target.value) })} /></Form.Group><Form.Group className="col-md-4"><Form.Label>Next due date</Form.Label><Form.Control type="date" required value={editor.next_due_date} onChange={event => setEditor({ ...editor, next_due_date: event.target.value })} /></Form.Group></div>
                         <Form.Group className="mb-3"><Form.Label htmlFor="maintenance-assignee">Assigned staff (optional)</Form.Label><Form.Select id="maintenance-assignee" value={editor.assigned_to ?? ''} onChange={event => setEditor({ ...editor, assigned_to: event.target.value ? Number(event.target.value) : null })}><option value="">Unassigned</option>{editor.assigned_to && !staff.some(person => Number(person.employeeid) === Number(editor.assigned_to)) && <option value={editor.assigned_to}>Employee #{editor.assigned_to} (not in options)</option>}{staff.map(person => <option key={person.employeeid} value={person.employeeid}>{person.username || `Employee #${person.employeeid}`} · #{person.employeeid}</option>)}</Form.Select><Form.Text>Assignment is advisory and does not restrict who may perform maintenance.</Form.Text>{staffError && <div role="alert">Staff options unavailable: {staffError}</div>}</Form.Group>
                         <Form.Group className="mb-3"><Form.Label>Instructions</Form.Label><Form.Control as="textarea" maxLength={4000} value={editor.instructions || ''} onChange={event => setEditor({ ...editor, instructions: event.target.value })} /></Form.Group>
                         <Form.Check className="mb-3" label="Schedule active" checked={Boolean(editor.active)} onChange={event => setEditor({ ...editor, active: event.target.checked })} />
                         <h3>Checklist</h3>
                         {editor.checklist.map((check, index) => <div key={index} className={styles.executionCheck}>
                              <div className="row g-2"><Form.Group className="col-md-8"><Form.Label>Check {index + 1}</Form.Label><Form.Control required maxLength={255} value={check.title} onChange={event => setCheck(index, { title: event.target.value })} /></Form.Group><Form.Group className="col-md-4"><Form.Label>Response type</Form.Label><Form.Select value={check.kind} onChange={event => setCheck(index, { kind: event.target.value as Kind })}><option value="completion">Completed / not completed</option><option value="pass_fail">Pass / fail</option><option value="numeric">Numeric range</option></Form.Select></Form.Group>
                                   <Form.Group className="col-12"><Form.Label>Instructions</Form.Label><Form.Control value={check.instructions} maxLength={4000} onChange={event => setCheck(index, { instructions: event.target.value })} /></Form.Group>
                                   {check.kind === 'numeric' && <><Form.Group className="col-md-4"><Form.Label>Minimum (inclusive)</Form.Label><Form.Control type="number" step="any" required value={check.min ?? ''} onChange={event => setCheck(index, { min: event.target.value })} /></Form.Group><Form.Group className="col-md-4"><Form.Label>Maximum (inclusive)</Form.Label><Form.Control type="number" step="any" required value={check.max ?? ''} onChange={event => setCheck(index, { max: event.target.value })} /></Form.Group><Form.Group className="col-md-4"><Form.Label>Unit</Form.Label><Form.Control value={check.unit} maxLength={80} onChange={event => setCheck(index, { unit: event.target.value })} /></Form.Group></>}
                              </div>
                              <div className="d-flex justify-content-between mt-2"><Form.Check label="Required" checked={check.required} onChange={event => setCheck(index, { required: event.target.checked })} /><Button variant="outline-danger" size="sm" disabled={editor.checklist.length === 1} onClick={() => setEditor({ ...editor, checklist: editor.checklist.filter((_, i) => i !== index) })}>Remove</Button></div>
                         </div>)}
                         <Button variant="outline-secondary" onClick={() => setEditor({ ...editor, checklist: [...editor.checklist, blankCheck()] })}>Add checklist item</Button>
                    </Modal.Body>
                    <Modal.Footer><Button variant="outline-secondary" onClick={() => setEditor(null)}>Cancel</Button><Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save schedule'}</Button></Modal.Footer>
               </Form>}
          </Modal>
          <Modal show={!!task} onHide={() => { if (!pendingFailure.current && !pendingNumeric.current && !holdBusy.current && !saving) setTask(null); }} size="lg" centered>
               {task && <Form onSubmit={complete}>
                    <Modal.Header closeButton><Modal.Title>Perform maintenance <small className={styles.executionSubtitle}>{task.snapshot.title} — {task.deviceName}</small></Modal.Title></Modal.Header>
                    <Modal.Body className={styles.executionBody}>
                         <dl className={styles.executionSummary}>
                              <div><dt>Instrument</dt><dd>{task.deviceName}</dd></div>
                              <div><dt>Model</dt><dd>{task.model || taskDevice?.model || '—'}</dd></div>
                              <div><dt>Serial number</dt><dd>{taskDevice?.serialNumber || '—'}</dd></div>
                              <div><dt>Maintenance</dt><dd>{task.snapshot.title}</dd></div>
                              <div><dt>Type</dt><dd>{task.snapshot.activity_type}</dd></div>
                              <div><dt>Frequency</dt><dd>Every {task.snapshot.interval} {task.snapshot.frequency}</dd></div>
                              <div><dt>Due date</dt><dd>{date(task.due_date)}</dd></div>
                              <div><dt>Assigned staff (advisory)</dt><dd>{task.snapshot.assigned_to ? `${staff.find(person => Number(person.employeeid) === Number(task.snapshot.assigned_to))?.username || 'Employee'} #${task.snapshot.assigned_to}` : 'Unassigned'}</dd></div>
                         </dl>
                         {task.snapshot.instructions && <p className={styles.executionInstructions}>{task.snapshot.instructions}</p>}
                         {task.snapshot.follow_up_of_task_id && <Alert variant="warning">Late failure follow-up to completed task #{task.snapshot.follow_up_of_task_id}. The original record is unchanged.</Alert>}
                         {holdError && <Alert variant="danger" role="alert">{holdError} <Button size="sm" disabled={holdSaving} onClick={() => { const pending = pendingFailure.current; if (pending) void persistFailure(pending.task, pending.values, pending.index); }}>Retry failure hold</Button></Alert>}
                         {holdSaving && <Alert variant="warning" role="status">Recording failure and placing instrument on hold. Do not close this window.</Alert>}
                         <div className={styles.executionList}>{task.snapshot.checklist.map((check, index) => <fieldset key={index} disabled={saving || holdSaving || !!holdError || !!task.draft?.failure_evidence?.some(e => e.index === index)}
                              onBlur={() => { if (check.kind === 'numeric') commitNumeric(index); }}
                              onKeyDown={event => { if (check.kind === 'numeric' && event.key === 'Enter') { event.preventDefault(); commitNumeric(index); } }}>
                              <MaintenanceCheckInput check={check} index={index} taskId={task.id} value={values[index] || ''} onChange={value => changeAnswer(index, value)} />
                              {numericPending === index && <div role="status">Numeric entry is not confirmed. Press Enter or leave the field to confirm; an out-of-range value places an immediate hold.</div>}
                         </fieldset>)}</div>
                         <Alert variant={failed ? 'danger' : summary.result === 'Incomplete' ? 'light' : 'success'} aria-live="polite">
                              <strong>Overall result: {summary.result}</strong>
                              <div>{summary.recorded} of {task.snapshot.checklist.length} recorded{summary.failedCount ? ` · ${summary.failedCount} failed` : ''}{summary.requiredOutstanding ? ` · ${summary.requiredOutstanding} required outstanding` : ''}</div>
                              {failed && <div>{task.draft?.failure_evidence?.length ? 'Failure evidence recorded. The instrument remains on hold until documented corrective work and independent supervisor verification.' : 'Failure hold is not yet confirmed; keep the instrument out of service.'}</div>}
                         </Alert>
                         {failed && <Form.Group className="mb-3"><Form.Label>Failure reason</Form.Label><Form.Control required maxLength={1000} value={reason} onChange={event => setReason(event.target.value)} /></Form.Group>}
                         <Form.Group className="mb-3"><Form.Label>Observation{failed ? ' (required)' : ' (optional)'}</Form.Label><Form.Control as="textarea" required={failed} maxLength={4000} value={observation} onChange={event => setObservation(event.target.value)} /></Form.Group>
                         {failed && <Form.Group><Form.Label>Corrective action</Form.Label><Form.Control as="textarea" required maxLength={4000} value={corrective} onChange={event => setCorrective(event.target.value)} /></Form.Group>}
                    </Modal.Body>
                    <Modal.Footer>{task.draft && !task.draft.failure_evidence?.length && <Button variant="outline-danger" disabled={saving || holdSaving || !!holdError || numericPending !== null} onClick={() => void saveDraft(true)}>Discard draft</Button>}<Button variant="outline-secondary" disabled={saving || holdSaving || !!holdError || numericPending !== null} onClick={() => void saveDraft()}>Save draft</Button><Button variant="outline-secondary" disabled={saving || holdSaving || !!holdError || numericPending !== null} onClick={() => setTask(null)}>Close</Button><Button type="submit" variant={failed ? 'danger' : 'primary'} disabled={saving || holdSaving || !!holdError || numericPending !== null}>{saving ? 'Saving...' : failed ? 'Finalize documented failure' : 'Complete maintenance'}</Button></Modal.Footer>
               </Form>}
          </Modal>
     </div>;
}
