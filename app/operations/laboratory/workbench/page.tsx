'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Modal, Offcanvas } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { customFetch, customPost } from '../../../../components/Auth/customFetch';
import { useApplicationSettings } from '../../../../components/Auth/useApplicationContext';

const base = 'operations/laboratory/workbench';
const displayDate = (value: any) => value ? new Date(value).toLocaleString() : 'Not configured';
const localDate = (value: any) => value ? new Date(new Date(value).getTime() - new Date(value).getTimezoneOffset() * 60000).toISOString().slice(0, 16) : '';
const stage = (row: any) => row.resultEntryEnd ? Number(row.isapproved) === 1 ? 'Finalized' : 'Awaiting validation' : row.workflow?.canEnterResults ? 'Ready for results' : row.processingStartDate ? 'Processing' : row.workflow?.blockedReason || 'Ready to process';
export default function LaboratoryWorkbench() {
     const urlSearch = useSearchParams().get('search') || '';
     const { applicationsettings } = useApplicationSettings();
     const employeeid = Number(applicationsettings?.user?.employeeid);
     const [rows, setRows] = useState<any[]>([]), [options, setOptions] = useState<any>({ staff: [], devices: [], supervisor: false });
     const [view, setView] = useState('all'), [includeCompleted, setIncludeCompleted] = useState(false);
     const [searchInput, setSearchInput] = useState(urlSearch), [search, setSearch] = useState(urlSearch), [page, setPage] = useState(1), [total, setTotal] = useState(0);
     const [loading, setLoading] = useState(false), [error, setError] = useState(''), [saving, setSaving] = useState(false);
     const [selected, setSelected] = useState<any>(null), [edit, setEdit] = useState<any>({}), [history, setHistory] = useState<any[]>([]);
     const [targets, setTargets] = useState<any>({ routine: '', urgent: '', stat: '' });
     const [materialRow, setMaterialRow] = useState<any>(null), [plan, setPlan] = useState<any>(null), [quantities, setQuantities] = useState<Record<string, string>>({});
     const [retryKey, setRetryKey] = useState(''), [planLoading, setPlanLoading] = useState(false);
     const generation = useRef(0);
     useEffect(() => {
          setSearchInput(urlSearch); setSearch(urlSearch); setPage(1);
     }, [urlSearch]);
     async function load() {
          const current = ++generation.current;
          try {
               setLoading(true);
               const params = new URLSearchParams({ view, page: String(page), count: '20', search, include_completed: String(includeCompleted) });
               const result = await customFetch(`${base}?${params}`);
               if (current !== generation.current) return;
               if (!result?.success) throw new Error(result?.message || 'Unable to load laboratory work');
               setRows(result.data.data || []); setTotal(result.data.total || 0); setError('');
          } catch (error: any) { if (current === generation.current) setError(error.message); }
          finally { if (current === generation.current) setLoading(false); }
     }
     useEffect(() => {
          if (!employeeid) return;
          void load();
          const timer = setInterval(() => { if (document.visibilityState === 'visible') void load(); }, 30000);
          return () => { clearInterval(timer); generation.current++; };
     }, [employeeid, view, page, search, includeCompleted]);
     useEffect(() => {
          if (!employeeid) return;
          let active = true;
          customFetch(`${base}/options`).then(result => {
               if (!active) return;
               if (result?.success) setOptions(result.data);
               else toast.error(result?.message || 'Unable to load work assignment options');
          });
          return () => { active = false; };
     }, [employeeid]);
     async function openWork(row: any) {
          setSelected(row); setHistory([]);
          setEdit({ assigned_employeeid: row.assigned_employeeid ? String(row.assigned_employeeid) : options.supervisor ? '' : String(employeeid),
               priority: row.priority, device_id: row.device_id || '', due_at: localDate(row.deadline_override), reset_deadline: !row.deadline_override, reason: '' });
          setTargets({ routine: row.lab_routine_tat_minutes || '', urgent: row.lab_urgent_tat_minutes || '', stat: row.lab_stat_tat_minutes || '' });
          const result = await customFetch(`${base}/${row.ascensionid}/history`);
          if (result?.success) setHistory(result.data || []);
     }
     async function updateWork(action = 'update') {
          if (!selected) return;
          const payload: any = { version: Number(selected.version), action, reason: edit.reason };
          if (action === 'update') {
               Object.assign(payload, { assigned_employeeid: edit.assigned_employeeid ? Number(edit.assigned_employeeid) : null,
                    priority: edit.priority, device_id: edit.device_id || null });
               if (options.supervisor && edit.reset_deadline) payload.due_at = null;
               else if (options.supervisor && edit.due_at) payload.due_at = new Date(edit.due_at).toISOString();
          }
          try {
               setSaving(true);
               const result = await customPost(`${base}/${selected.ascensionid}`, 'PATCH', payload);
               if (!result?.success) throw new Error(result?.message || 'Unable to update work');
               toast.success(action === 'update' ? 'Assignment updated' : action === 'escalate' ? 'Work escalated' : 'Escalation acknowledged');
               setSelected(null); await load();
          } catch (error: any) { toast.error(error.message); }
          finally { setSaving(false); }
     }
     async function saveTargets() {
          try {
               setSaving(true);
               const result = await customPost(`${base}/tests/${selected.testid}/targets`, 'PUT', {
                    routine_minutes: targets.routine === '' ? null : Number(targets.routine), urgent_minutes: targets.urgent === '' ? null : Number(targets.urgent), stat_minutes: targets.stat === '' ? null : Number(targets.stat),
               });
               if (!result?.success) throw new Error(result?.message || 'Unable to save targets');
               toast.success('Test turnaround targets saved'); await load();
          } catch (error: any) { toast.error(error.message); } finally { setSaving(false); }
     }
     async function revokeQC() {
          if (!edit.reason?.trim()) { toast.error('Enter the reason for revoking QC clearance'); return; }
          try {
               setSaving(true);
               const result = await customPost(`qc-sessions/${selected.qc.sessionId}/revoke-for-results`, 'POST', { reason: edit.reason });
               if (!result?.status) throw new Error(result?.error || result?.message || 'Unable to revoke QC');
               toast.success('QC clearance revoked'); setSelected(null); await load();
          } catch (error: any) { toast.error(error.message); } finally { setSaving(false); }
     }
     async function loadPlan(row: any, templateId?: number) {
          setPlanLoading(true); setPlan(null);
          try {
               const result = await customFetch(`${base}/${row.ascensionid}/consumption${templateId ? `?template_id=${templateId}` : ''}`);
               if (!result?.success) throw new Error(result?.message || 'Unable to load material usage');
               setPlan(result.data);
               setQuantities(Object.fromEntries((result.data.items || []).map((item: any) => [item.item_id, String(item.remaining)])));
               setRetryKey(crypto.randomUUID());
          } catch (error: any) { toast.error(error.message); } finally { setPlanLoading(false); }
     }
     async function recordMaterials() {
          const lines = Object.entries(quantities).map(([item_id, quantity]) => ({ item_id, quantity: Number(quantity) })).filter(line => line.quantity > 0);
          if (!lines.length) { toast.error('Enter the actual quantities used'); return; }
          try {
               setSaving(true);
               const result = await customPost(`${base}/${materialRow.ascensionid}/consumption`, 'POST', { idempotency_key: retryKey, template_id: plan.template_id, lines });
               if (!result?.success) throw new Error(result?.message || 'Unable to record material usage');
               toast.success(result.data.retried ? 'This material usage was already recorded' : 'Material usage and accounting recorded');
               setMaterialRow(null); await load();
          } catch (error: any) { toast.error(error.message); } finally { setSaving(false); }
     }
     const canManage = (row: any) => options.supervisor || !row.assigned_employeeid || Number(row.assigned_employeeid) === employeeid;
     return <div className="container-fluid py-3">
          <div className="d-flex flex-wrap justify-content-between gap-2 mb-3"><div><h1 className="h4">Laboratory workbench</h1><p className="text-muted mb-0">Assign work, monitor deadlines and QC, and record materials actually used.</p></div><button className="btn btn-outline-primary" disabled={loading} onClick={load}>Refresh</button></div>
          <form className="d-flex flex-wrap gap-2 mb-3" onSubmit={event => { event.preventDefault(); setPage(1); setSearch(searchInput); }}>
               <select aria-label="Laboratory work view" className="form-select w-auto" value={view} onChange={event => { setView(event.target.value); setPage(1); }}>
                    <option value="all">All open work</option><option value="mine">Assigned to me</option><option value="unassigned">Unassigned</option><option value="overdue">Overdue by configured target</option><option value="urgent">Urgent / STAT</option>
               </select>
               <input aria-label="Search laboratory work" className="form-control w-auto" value={searchInput} onChange={event => setSearchInput(event.target.value)} placeholder="Ascension ID, patient number, name or test" />
               <button className="btn btn-outline-secondary" type="submit">Search</button>
               <label className="form-check-label align-self-center"><input type="checkbox" className="form-check-input me-2" checked={includeCompleted} onChange={event => { setIncludeCompleted(event.target.checked); setPage(1); }} />Include finalized results</label>
          </form>
          <div className="d-flex flex-wrap gap-3 small mb-3"><Link href="/operations/laboratory/processing">Processing</Link><Link href="/operations/laboratory/validation">Result validation</Link><Link href="/operations/laboratory/quality-control">Quality control</Link><Link href="/operations/laboratory/undelivered">Pending delivery</Link></div>
          {error && <div className="alert alert-danger" role="alert">{error}</div>}
          <div className="table-responsive"><table className="table table-hover align-middle"><thead><tr><th>Patient / test</th><th>Stage</th><th>Assigned to</th><th>Priority / deadline</th><th>Quality control</th><th>Materials</th><th>Escalation</th><th>Actions</th></tr></thead>
               <tbody>{rows.map(row => <tr key={row.ascensionid}>
                    <td><strong>{row.patient_name}</strong><div className="small text-muted">{row.fullpatientid} · Request #{row.ascensionid}</div>{row.test_name}</td>
                    <td><span>{stage(row)}</span>{row.workflow?.blockedReason && !row.resultEntryEnd && <div className="small text-danger">{row.workflow.blockedReason}</div>}</td>
                    <td>{row.assigned_name || 'Unassigned'}</td>
                    <td><span className={`badge bg-${row.priority === 'stat' ? 'danger' : row.priority === 'urgent' ? 'warning text-dark' : 'secondary'}`}>{row.priority.toUpperCase()}</span><div className={Number(row.overdue) ? 'text-danger small' : 'small'}>{displayDate(row.due_at)}</div>{Number(row.overdue) === 1 && <strong className="small text-danger">Overdue</strong>}</td>
                    <td><div className="small text-muted">Branch #{row.branchid} ? {options.devices.find((device: any) => device.id === row.device_id)?.deviceName || 'Manual'}</div>{!row.qc.required ? 'Not required' : <><span className={row.qc.allowed ? 'text-success' : 'text-danger'}>{row.qc.allowed ? `Cleared (${row.qc.decision})` : 'Blocked'}</span><div className="small">{row.qc.reason}</div>{row.qc.sessionId && <Link className="small" href={`/operations/laboratory/quality-control/qc-recording/${row.qc.sessionId}`}>Review QC session</Link>}</>}</td>
                    <td>{String(row.consumption_status).replaceAll('_', ' ')}</td>
                    <td>{!row.escalated_at ? 'None' : row.acknowledged_at ? 'Acknowledged' : <span className="text-danger">Needs attention</span>}</td>
                    <td><div className="d-flex flex-column gap-1"><button className="btn btn-sm btn-outline-primary" onClick={() => openWork(row)}>Manage / history</button><button className="btn btn-sm btn-outline-secondary" onClick={() => { setMaterialRow(row); void loadPlan(row); }}>Material usage</button></div></td>
               </tr>)}</tbody></table></div>
          {!loading && !rows.length && <p className="text-muted">No tests match this view.</p>}
          <div className="d-flex align-items-center gap-3"><button className="btn btn-sm btn-outline-secondary" disabled={page <= 1 || loading} onClick={() => setPage(page - 1)}>Previous</button><span>Page {page} · {total} tests {loading ? '· Updating...' : ''}</span><button className="btn btn-sm btn-outline-secondary" disabled={page * 20 >= total || loading} onClick={() => setPage(page + 1)}>Next</button></div>
          <Offcanvas show={!!selected} onHide={() => { if (!saving) setSelected(null); }} placement="end" style={{ width: 520 }}><Offcanvas.Header closeButton={!saving}><Offcanvas.Title>Manage laboratory work</Offcanvas.Title></Offcanvas.Header><Offcanvas.Body>
               {selected && <><h2 className="h6">{selected.test_name} · {selected.patient_name}</h2><p className="small text-muted">Current deadline: {displayDate(selected.due_at)}</p>
                    <fieldset disabled={saving || !canManage(selected)}>
                         <label className="form-label">Assigned staff</label><select className="form-select mb-3" value={edit.assigned_employeeid} disabled={!options.supervisor} onChange={event => setEdit({ ...edit, assigned_employeeid: event.target.value })}><option value="">Unassigned</option>{options.staff.map((staff: any) => <option key={staff.employeeid} value={staff.employeeid}>{staff.username}</option>)}</select>
                         <label className="form-label">Priority</label><select className="form-select mb-3" disabled={!options.supervisor} value={edit.priority} onChange={event => setEdit({ ...edit, priority: event.target.value })}><option value="routine">Routine</option><option value="urgent">Urgent</option><option value="stat">STAT</option></select>
                         <label className="form-label">Analyzer used for QC clearance</label><select className="form-select mb-3" value={edit.device_id} onChange={event => setEdit({ ...edit, device_id: event.target.value })}><option value="">Manual / no analyzer</option>{options.devices.map((device: any) => <option key={device.id} value={device.id}>{device.deviceName}</option>)}</select>
                         {options.supervisor && <><label className="form-check-label d-block mb-2"><input type="checkbox" className="form-check-input me-2" checked={!!edit.reset_deadline} onChange={event => setEdit({ ...edit, reset_deadline: event.target.checked })} />Use the test default target</label><label className="form-label">Override deadline</label><input className="form-control mb-3" type="datetime-local" disabled={edit.reset_deadline} value={edit.due_at} onChange={event => setEdit({ ...edit, due_at: event.target.value })} /><div className="form-text mb-3">Turn off the default target to enter a deadline for this request.</div></>}
                         <button className="btn btn-primary mb-3" onClick={() => updateWork()}>{saving ? 'Saving...' : options.supervisor ? 'Save assignment' : 'Claim / update my work'}</button>
                    </fieldset>
                    <label className="form-label">Handover / escalation / QC reason</label><textarea className="form-control mb-3" value={edit.reason || ''} onChange={event => setEdit({ ...edit, reason: event.target.value })} maxLength={2000} />
                    <div className="d-flex flex-wrap gap-2 mb-3"><button className="btn btn-outline-danger" disabled={saving || !edit.reason?.trim()} onClick={() => updateWork('escalate')}>Escalate</button>{selected.escalated_at && canManage(selected) && <button className="btn btn-outline-primary" disabled={saving || !edit.reason?.trim()} onClick={() => updateWork('acknowledge')}>Acknowledge</button>}{selected.qc?.sessionId && <button className="btn btn-outline-warning" disabled={saving || !edit.reason?.trim()} onClick={revokeQC}>Revoke QC clearance</button>}</div>
                    {options.supervisor && <details className="border rounded p-3 mb-3"><summary>Configure this test&apos;s turnaround targets</summary><p className="small text-muted mt-2">Targets are in minutes and apply to this test throughout the facility. Unset urgent/STAT targets use the routine target.</p>{['routine', 'urgent', 'stat'].map(kind => <label className="form-label d-block" key={kind}>{kind.toUpperCase()} minutes<input className="form-control" type="number" min="1" step="1" value={targets[kind]} onChange={event => setTargets({ ...targets, [kind]: event.target.value })} /></label>)}<button className="btn btn-outline-primary" disabled={saving} onClick={saveTargets}>Save test targets</button></details>}
                    <h3 className="h6 mt-4">Work history</h3>{!history.length && <p className="small text-muted">No work actions recorded yet.</p>}{history.map(item => <div key={item.id} className="border-bottom py-2 small"><strong>{item.action.replaceAll('_', ' ')}</strong> · {item.username || `Staff #${item.employeeid}`}<div>{displayDate(item.created_at)}</div>{item.reason && <div>{item.reason}</div>}</div>)}
               </>}
          </Offcanvas.Body></Offcanvas>
          <Modal show={!!materialRow} onHide={() => { if (!saving) setMaterialRow(null); }} size="lg" backdrop="static"><Modal.Header closeButton={!saving}><Modal.Title>Actual material usage</Modal.Title></Modal.Header><Modal.Body>
               <p>{materialRow?.test_name} · {materialRow?.patient_name}</p><p className="small text-muted">Confirm what was actually used. Stock is deducted only when you record usage below. Unexpired batches are used in expiry order.</p>
               {planLoading && <p>Loading materials...</p>}
               {plan && <><label className="form-label">Inventory template</label><select className="form-select mb-3" disabled={saving} value={plan.template_id || ''} onChange={event => loadPlan(materialRow, Number(event.target.value))}><option value="">Select a template</option>{plan.templates.map((template: any) => <option key={template.id} value={template.id}>{template.name}</option>)}</select>
                    {['missing_template', 'empty_template'].includes(plan.status) && <div className="alert alert-warning">This test has no usable material template. Configure its materials in <Link href="/inventory/templates">Inventory templates</Link> before recording usage.</div>}
                    {!!plan.items.length && <div className="table-responsive"><table className="table"><thead><tr><th>Material</th><th>Expected</th><th>Already recorded</th><th>Actual quantity to record now</th></tr></thead><tbody>{plan.items.map((item: any) => <tr key={item.item_id}><td>{item.name}{Number(item.cost_price) === 0 && <div className="small text-warning">No unit cost recorded</div>}</td><td>{item.expected}</td><td>{item.recorded}</td><td><input aria-label={`Actual usage of ${item.name}`} className="form-control" type="number" min="0" step="any" disabled={saving} value={quantities[item.item_id] || ''} onChange={event => { setQuantities({ ...quantities, [item.item_id]: event.target.value }); setRetryKey(crypto.randomUUID()); }} /></td></tr>)}</tbody></table></div>}
               </>}
          </Modal.Body><Modal.Footer><button className="btn btn-secondary" disabled={saving} onClick={() => setMaterialRow(null)}>Close</button><button className="btn btn-primary" disabled={saving || planLoading || !plan?.items?.length} onClick={recordMaterials}>{saving ? 'Recording...' : 'Record actual usage'}</button></Modal.Footer></Modal>
     </div>;
}
