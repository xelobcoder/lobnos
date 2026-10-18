"use client";

import { FormEvent, useEffect, useRef, useState } from 'react';
import { customFetch, customFetchMutation } from '../../Auth/customFetch';
import { useApplicationSettings } from '../../Auth/useApplicationContext';
import { roleAllowed } from '../../Auth/roles';

interface StaffPinState {
     employeeid: number;
     username: string;
     role: string;
     failed_attempts: number | null;
     locked_at: string | null;
}

const endpoint = 'applicationsettings/pin-security';
const pageSize = 20;

export default function PinSecuritySettings() {
     const { applicationsettings } = useApplicationSettings();
     const isAdmin = roleAllowed(applicationsettings?.user?.role, ['admin', 'super_admin', 'super-admin']);
     const tenantId = applicationsettings?.tenantId;
     const employeeid = applicationsettings?.user?.employeeid;
     const generation = useRef(0);
     const [limit, setLimit] = useState('5');
     const [reason, setReason] = useState('');
     const [staff, setStaff] = useState<StaffPinState[]>([]);
     const [page, setPage] = useState(1);
     const [target, setTarget] = useState<StaffPinState | null>(null);
     const [resetReason, setResetReason] = useState('');
     const [busy, setBusy] = useState(true);
     const [ready, setReady] = useState(false);
     const [error, setError] = useState('');
     const [message, setMessage] = useState('');

     async function load(currentPage: number, version: number) {
          const [policy, users] = await Promise.all([
               customFetch(endpoint),
               customFetch(`${endpoint}/staff?page=${currentPage}&count=${pageSize}`),
          ]);
          if (policy?.status !== 'success' || users?.status !== 'success') {
               throw new Error(policy?.message || users?.message || 'Unable to load PIN security settings');
          }
          if (version !== generation.current) return;
          setLimit(String(policy.result.pinAttemptLimit));
          setStaff(users.result);
     }

     useEffect(() => {
          const version = ++generation.current;
          if (!isAdmin) return;
          let active = true;
          setBusy(true);
          setReady(false);
          setError('');
          setMessage('');
          setTarget(null);
          setResetReason('');
          setStaff([]);
          // Ignore stale responses when the page or authenticated context changes.
          Promise.all([customFetch(endpoint), customFetch(`${endpoint}/staff?page=${page}&count=${pageSize}`)])
               .then(([policy, users]) => {
                    if (!active) return;
                    if (policy?.status !== 'success' || users?.status !== 'success') {
                         throw new Error(policy?.message || users?.message || 'Unable to load PIN security settings');
                    }
                    setLimit(String(policy.result.pinAttemptLimit));
                    setStaff(users.result);
                    setReady(true);
               })
               .catch(err => { if (active) setError(err.message || 'Unable to load PIN security settings'); })
               .finally(() => { if (active) setBusy(false); });
          return () => { active = false; if (generation.current === version) generation.current++; };
     }, [isAdmin, page, tenantId, employeeid]);

     async function savePolicy(event: FormEvent) {
          event.preventDefault();
          const value = Number(limit);
          if (!/^\d+$/.test(limit) || !Number.isSafeInteger(value) || value < 1 || value > 20) {
               setError('Enter a whole number from 1 to 20.');
               return;
          }
          await mutate(endpoint, 'PUT', { pinAttemptLimit: value, reason }, 'PIN attempt limit saved. Existing lockouts remain locked.');
          setReason('');
     }

     async function mutate(url: string, method: string, body: object, success: string) {
          const version = generation.current;
          setBusy(true);
          setError('');
          setMessage('');
          try {
               const response = await customFetchMutation(url, method, body);
               if (version !== generation.current) return;
               if (response?.status !== 'success') throw new Error(response?.message || 'Unable to save PIN security settings');
               await load(page, version);
               if (version !== generation.current) return;
               setMessage(success);
               setTarget(null);
               setResetReason('');
          } catch (err) {
               if (version === generation.current) setError(err instanceof Error ? err.message : 'Unable to save PIN security settings');
          } finally { if (version === generation.current) setBusy(false); }
     }

     if (!isAdmin) return null;
     return (
          <section className="border rounded p-3 mb-4" aria-labelledby="pin-security-heading">
               <h5 id="pin-security-heading">Staff authorization PIN security</h5>
               <p className="text-muted">Failed PINs are counted per staff account, not per device. Exhausted attempts stay locked until an administrator resets them after the staff member contacts you. A reset does not change the PIN.</p>
               {error && <div className="alert alert-danger" role="alert">{error}</div>}
               {message && <div className="alert alert-success" role="status">{message}</div>}
               {busy && <p role="status">Loading or saving PIN security…</p>}
               <form onSubmit={savePolicy} className="row g-2 mb-3">
                    <div className="col-md-3">
                         <label className="form-label" htmlFor="pin-attempt-limit">Incorrect attempts allowed</label>
                         <input id="pin-attempt-limit" className="form-control" type="number" min={1} max={20} step={1} required value={limit} onChange={e => setLimit(e.target.value)} disabled={busy || !ready} />
                    </div>
                    <div className="col-md-6">
                         <label className="form-label" htmlFor="pin-policy-reason">Reason for policy change (no PINs)</label>
                         <input id="pin-policy-reason" className="form-control" required minLength={3} maxLength={255} value={reason} onChange={e => setReason(e.target.value)} disabled={busy || !ready} />
                    </div>
                    <div className="col-md-3 align-self-end">
                         <button className="btn btn-primary" disabled={busy || !ready}>Save PIN limit</button>
                    </div>
               </form>
               <div className="table-responsive">
                    <table className="table table-sm">
                         <caption>Staff PIN attempt counters — page {page}</caption>
                         <thead><tr><th>Staff</th><th>Role</th><th>Incorrect attempts</th><th>Status</th><th>Action</th></tr></thead>
                         <tbody>{staff.map(user => (
                              <tr key={user.employeeid}>
                                   <td>{user.username} (#{user.employeeid})</td><td>{user.role}</td>
                                   <td>{user.failed_attempts ?? 0}</td><td>{user.locked_at ? 'Locked — contact administrator' : 'Available'}</td>
                                   <td><button type="button" className="btn btn-sm btn-outline-danger" disabled={busy || !ready || !user.locked_at} onClick={() => { setTarget(user); setResetReason(''); }}>Reset attempts</button></td>
                              </tr>
                         ))}</tbody>
                    </table>
               </div>
               <div className="d-flex gap-2 mb-3">
                    <button type="button" className="btn btn-sm btn-outline-secondary" disabled={busy || page === 1} onClick={() => setPage(page - 1)}>Previous</button>
                    <button type="button" className="btn btn-sm btn-outline-secondary" disabled={busy || !ready || staff.length < pageSize} onClick={() => setPage(page + 1)}>Next</button>
               </div>
               {target && (
                    <form onSubmit={event => { event.preventDefault(); void mutate(`${endpoint}/staff/${target.employeeid}/reset`, 'POST', { reason: resetReason }, `PIN attempts reset for ${target.username}. Their PIN is unchanged.`); }} className="border rounded p-3">
                         <p>Confirm reset for <strong>{target.username} (#{target.employeeid})</strong> after verifying their identity through your facility’s support process.</p>
                         <label className="form-label" htmlFor="pin-reset-reason">Support reference / reason (do not enter a PIN)</label>
                         <input id="pin-reset-reason" className="form-control mb-2" required minLength={3} maxLength={255} value={resetReason} onChange={e => setResetReason(e.target.value)} disabled={busy} />
                         <button className="btn btn-danger me-2" disabled={busy}>Confirm audited reset</button>
                         <button type="button" className="btn btn-secondary" disabled={busy} onClick={() => setTarget(null)}>Cancel</button>
                    </form>
               )}
          </section>
     );
}
