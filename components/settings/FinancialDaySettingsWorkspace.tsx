'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import Link from 'next/link';
import ui from './SettingsWorkspace.module.css';
import styles from './FinancialDaySettingsWorkspace.module.css';
import {
     defaultMigrationRange, financialDaySettingsApi, historicalRangeError, policyError,
     previewResult, reasonError, serverYesterday, settingsResult,
     type FinancialDaySettings, type HistoricalDateRange, type HistoricalLockPreview,
} from '../../lib/accounting/financialDaySettings';

interface PreviewState {
     range: HistoricalDateRange;
     counts: HistoricalLockPreview;
}

const errorMessage = (error: unknown): string => error instanceof Error ? error.message : 'The request failed. Refresh and try again.';

export default function FinancialDaySettingsWorkspace() {
     const [settings, setSettings] = useState<FinancialDaySettings | null>(null);
     const [enabled, setEnabled] = useState(false);
     const [hours, setHours] = useState('48');
     const [customHours, setCustomHours] = useState(false);
     const [policyReason, setPolicyReason] = useState('');
     const [range, setRange] = useState<HistoricalDateRange>({ startDate: '', endDate: '' });
     const [lockReason, setLockReason] = useState('');
     const [preview, setPreview] = useState<PreviewState | null>(null);
     const [confirmed, setConfirmed] = useState(false);
     const [busy, setBusy] = useState(false);
     const [error, setError] = useState('');
     const [notice, setNotice] = useState('');
     const [reload, setReload] = useState(0);
     const active = useRef(false);
     const inFlight = useRef(false);
     const previewHeading = useRef<HTMLHeadingElement>(null);

     // Move keyboard/screen-reader attention to the newly requested review, not on draft edits.
     useEffect(() => {
          if (preview) previewHeading.current?.focus();
     }, [preview]);

     useEffect(() => {
          active.current = true;
          let cancelled = false;
          setBusy(true);
          setError('');
          setNotice('');
          setSettings(null);
          setPreview(null);
          setConfirmed(false);
          financialDaySettingsApi.get().then(response => {
               const result = settingsResult(response);
               if (cancelled) return;
               setSettings(result);
               setEnabled(result.policy.enabled);
               setHours(String(result.policy.graceHours));
               setCustomHours(!['24', '48', '168'].includes(String(result.policy.graceHours)));
               setPolicyReason('');
               setRange(defaultMigrationRange(result.bounds));
               setLockReason('');
          }).catch(error => { if (!cancelled) setError(errorMessage(error)); })
               .finally(() => { if (!cancelled) setBusy(false); });
          return () => { cancelled = true; active.current = false; };
     }, [reload]);

     function changeRange(field: keyof HistoricalDateRange, value: string) {
          setRange(previous => ({ ...previous, [field]: value }));
          setPreview(null);
          setConfirmed(false);
          setNotice('');
     }

     async function run(action: () => Promise<void>) {
          if (inFlight.current) return;
          inFlight.current = true;
          setBusy(true);
          setError('');
          setNotice('');
          try { await action(); }
          catch (error) { if (active.current) setError(errorMessage(error)); }
          finally {
               inFlight.current = false;
               if (active.current) setBusy(false);
          }
     }

     function savePolicy(event: FormEvent<HTMLFormElement>) {
          event.preventDefault();
          if (!settings || busy) return;
          const invalid = policyError(hours, policyReason);
          if (invalid) { setError(invalid); return; }
          void run(async () => {
               const result = settingsResult(await financialDaySettingsApi.savePolicy({ enabled, graceHours: Number(hours), reason: policyReason.trim() }));
               if (!active.current) return;
               setSettings(result);
               setEnabled(result.policy.enabled);
               setHours(String(result.policy.graceHours));
               setCustomHours(!['24', '48', '168'].includes(String(result.policy.graceHours)));
               setPolicyReason('');
               setPreview(null);
               setConfirmed(false);
               setNotice('Financial closing policy saved. Existing historical locks are unchanged.');
          });
     }

     function requestPreview(event: FormEvent<HTMLFormElement>) {
          event.preventDefault();
          if (!settings || busy) return;
          setPreview(null);
          setConfirmed(false);
          const invalid = historicalRangeError(range, settings.bounds.currentDate) || reasonError(lockReason);
          if (invalid) { setError(invalid); return; }
          const snapshot = { ...range };
          void run(async () => {
               const counts = previewResult(await financialDaySettingsApi.preview(snapshot));
               if (active.current) setPreview({ range: snapshot, counts });
          });
     }

     function lockHistory() {
          if (!settings || busy || !preview || !confirmed) return;
          const invalid = historicalRangeError(range, settings.bounds.currentDate) || reasonError(lockReason);
          if (invalid || preview.range.startDate !== range.startDate || preview.range.endDate !== range.endDate) {
               setError(invalid || 'The dates changed. Preview the range again.');
               setPreview(null);
               setConfirmed(false);
               return;
          }
          const snapshot = preview.range;
          setPreview(null);
          setConfirmed(false);
          void run(async () => {
               // No policy fields are sent: migration must never activate enforcement.
               const result = settingsResult(await financialDaySettingsApi.lock({ ...snapshot, reason: lockReason.trim(), confirm: true }));
               if (!active.current) return;
               setSettings(result);
               setPreview(null);
               setConfirmed(false);
               setLockReason('');
               setNotice('Historical range locked. No activation was requested; policy drafts are not saved by migration.');
          });
     }

     const policyDirty = !!settings && (enabled !== settings.policy.enabled || hours !== String(settings.policy.graceHours) || !!policyReason);

     return <main className={`${ui.workspace} ${styles.workspace}`} aria-busy={busy}>
          <header className={styles.header}>
               <div>
                    <nav aria-label="Breadcrumb" className={ui.eyebrow}><Link href="/settings/applicationsettings">Application settings</Link><span aria-hidden="true"> / </span>Financial days</nav>
                    <h1>Financial day settings</h1>
                    <p className={ui.description}>Manage closing enforcement and historical migration separately for the active authenticated branch.</p>
               </div>
               <div className={styles.refresh}>
                    <button type="button" className="btn btn-outline-secondary" disabled={busy} aria-describedby="refresh-help" onClick={() => setReload(value => value + 1)}>Refresh settings</button>
                    <small id="refresh-help" className="text-muted">Refresh discards unsaved drafts.</small>
               </div>
          </header>
          <p className={`${ui.description} ${styles.scope}`}>Lab / facility policy includes pharmacy transactions that share the lab ledger. Independent pharmacy own-day policy is unchanged.</p>
          {error && <div className="alert alert-danger" role="alert">{error}</div>}
          {error && settings && <p>After a failed save or lock request, refresh settings to verify the saved state before retrying. Refresh discards unsaved drafts.</p>}
          {notice && <div className="alert alert-success" role="status">{notice}</div>}
          {busy && settings && <p role="status">Processing financial-day request...</p>}
          {!settings && <p role="status">{busy ? 'Loading financial-day settings...' : 'Settings unavailable. Use Refresh settings to retry.'}</p>}
          {settings && <>
               <section className={`card ${styles.panel}`} aria-labelledby="financial-bounds">
                    <div className={styles.sectionHeading}><h2 id="financial-bounds" className="h5 mb-0">Server financial dates</h2><span className={styles.status}>Saved enforcement: <strong>{settings.policy.enabled ? 'On' : 'Off'}</strong></span></div>
                    <dl className={styles.bounds}>
                         <div><dt>Earliest financial date</dt><dd>{settings.bounds.earliestDate ?? 'No financial activity'}</dd></div>
                         <div><dt>Latest financial date</dt><dd>{settings.bounds.latestDate ?? 'No financial activity'}</dd></div>
                         <div><dt>Current server date</dt><dd><time dateTime={settings.bounds.currentDate}>{settings.bounds.currentDate}</time></dd></div>
                         <div><dt>Last eligible historical date</dt><dd><time dateTime={serverYesterday(settings.bounds.currentDate)}>{serverYesterday(settings.bounds.currentDate)}</time></dd></div>
                    </dl>
                    <p className="small text-muted mb-0">Saved closing interval: <strong>{settings.policy.graceHours} hours</strong>. Historical locks must end before the current server date, not your device date.</p>
               </section>
               <nav aria-label="Financial settings workflows" className={styles.workflows}>
                    <a href="#closing-policy"><strong>Closing enforcement</strong><span>Optional policy · save independently</span></a>
                    <a href="#historical-locking"><strong>Historical migration</strong><span>Permanent lock · preview, review, confirm</span></a>
                    <a href="#locked-ranges"><strong>Lock history</strong><span>View immutable recorded ranges</span></a>
               </nav>
               <div className={styles.workflowGrid}>
               <section className={`card ${styles.panel}`} aria-labelledby="closing-policy">
                    <div className={styles.sectionHeading}><span className={ui.eyebrow}>OPTIONAL ENFORCEMENT</span><span className={styles.status}>{policyDirty ? 'Unsaved changes' : 'Matches saved policy'}</span></div>
                    <h2 id="closing-policy" tabIndex={-1} className="h4">Overdue closing policy</h2>
                    <p id="policy-help" className={ui.description}>Existing installations default to enforcement off and 48 hours. Activation is optional and only happens when you save this policy. Review overdue days before enabling enforcement.</p>
                    <form onSubmit={savePolicy} aria-describedby="policy-help" className="mt-3">
                         <fieldset disabled={busy}>
                              <legend className="visually-hidden">Optional overdue closing enforcement</legend>
                              <div className={`form-check ${styles.toggle}`}><input id="closing-enabled" className="form-check-input" type="checkbox" aria-describedby="enforcement-help" checked={enabled} onChange={event => setEnabled(event.target.checked)} /><label className="form-check-label" htmlFor="closing-enabled">Enable overdue financial-day transaction blocking</label></div>
                              <p id="enforcement-help" className="small text-muted">When off, overdue enforcement is disabled. Existing historical locks still apply.</p>
                              <label htmlFor="closing-preset" className="form-label">Closing interval</label>
                              <select id="closing-preset" className="form-select mb-2" value={customHours ? 'custom' : hours} onChange={event => { setCustomHours(event.target.value === 'custom'); setHours(event.target.value === 'custom' ? '' : event.target.value); }}>
                                   <option value="24">24 hours (1 day)</option><option value="48">48 hours (2 days)</option><option value="168">168 hours (7 days)</option><option value="custom">Custom hours</option>
                              </select>
                              <label htmlFor="closing-hours" className="form-label">Hours (1–8760)</label>
                              <input id="closing-hours" className="form-control" type="number" min={1} max={8760} step={1} required readOnly={!customHours} aria-describedby="hours-help" value={hours} onChange={event => setHours(event.target.value)} />
                              <p id="hours-help" className="small text-muted mt-1 mb-3">Choose a preset or select Custom hours to enter a whole number from 1 to 8760.</p>
                              <label htmlFor="policy-reason" className="form-label">Policy change reason (required)</label>
                              <textarea id="policy-reason" className="form-control" rows={3} required maxLength={1000} aria-describedby="policy-reason-help" value={policyReason} onChange={event => setPolicyReason(event.target.value)} />
                              <p id="policy-reason-help" className="small text-muted mt-1">Explain this change for the audit record. Up to 1000 characters.</p>
                              <div className={styles.actions}><button type="submit" className="btn btn-primary">Save policy</button><small className="text-muted">Does not lock historical dates.</small></div>
                         </fieldset>
                    </form>
               </section>
               <section className={`card ${styles.panel}`} aria-labelledby="historical-locking">
                    <div className={styles.sectionHeading}><span className={ui.eyebrow}>HISTORICAL MIGRATION</span><span className={styles.status}>Permanent · separate from policy</span></div>
                    <h2 id="historical-locking" tabIndex={-1} className="h4">Lock historical dates for migration</h2>
                    <ol className={styles.steps} aria-label="Historical locking steps"><li>Choose dates &amp; reason</li><li>Preview impact</li><li>Confirm permanent lock</li></ol>
                    <div className="alert alert-warning" id="lock-warning">Locks include both start and end dates and are irreversible through this UI. They do not reconcile or finalize financial days. Locked ranges remain immutable even when enforcement is off. Locking history does not activate overdue enforcement.</div>
                    <p className="text-danger" id="lock-source-warning"><strong>Review outstanding balances and pending refunds before locking.</strong> Historical locks freeze source financial records, including old bills. Existing immutability rules may prevent normal collections or refunds that mutate those bills. Use the appropriate current-period linked corrections or opening balances instead; this lock does not assert reconciliation.</p>
                    <form onSubmit={requestPreview} aria-describedby="lock-warning lock-source-warning range-help">
                         <fieldset disabled={busy}>
                              <legend className="visually-hidden">Historical migration range and audit reason</legend>
                              <p id="range-help" className="small text-muted">Both dates are included. Latest allowed end date: <strong>{serverYesterday(settings.bounds.currentDate)}</strong> (server yesterday).</p>
                              <div className="row g-3 mb-3">
                                   <div className="col-sm-6"><label htmlFor="lock-start" className="form-label">Start date (inclusive)</label><input id="lock-start" type="date" className="form-control" required max={serverYesterday(settings.bounds.currentDate)} value={range.startDate} onChange={event => changeRange('startDate', event.target.value)} /></div>
                                   <div className="col-sm-6"><label htmlFor="lock-end" className="form-label">End date (inclusive)</label><input id="lock-end" type="date" className="form-control" required min={range.startDate || undefined} max={serverYesterday(settings.bounds.currentDate)} value={range.endDate} onChange={event => changeRange('endDate', event.target.value)} /></div>
                              </div>
                              <label htmlFor="lock-reason" className="form-label">Migration lock reason (required)</label>
                              <textarea id="lock-reason" className="form-control" rows={3} required maxLength={1000} aria-describedby="lock-reason-help" value={lockReason} onChange={event => { setLockReason(event.target.value); setConfirmed(false); }} />
                              <p id="lock-reason-help" className="small text-muted mt-1">Describe the migration for the audit record. Up to 1000 characters. Changing dates requires a new preview; changing the reason requires renewed confirmation.</p>
                              <div className={styles.actions}><button type="submit" className="btn btn-outline-primary">Preview historical lock</button><small className="text-muted">Preview only. No records are changed.</small></div>
                         </fieldset>
                    </form>
                    {preview && <section className={styles.preview} aria-labelledby="lock-preview">
                         <h3 id="lock-preview" ref={previewHeading} tabIndex={-1} className="h5">Preview: {preview.range.startDate} through {preview.range.endDate} (inclusive)</h3>
                         <dl className={styles.counts}><div><dt>Financial days</dt><dd>{preview.counts.financialDayCount}</dd></div><div><dt>Already locked days</dt><dd>{preview.counts.alreadyLockedDayCount}</dd></div><div><dt>Eligible days</dt><dd>{preview.counts.eligibleDayCount}</dd></div></dl>
                         <p>Counts describe financial-day records; the lock covers the entire inclusive date range. New transactions in that range will also be locked.</p>
                         <p className={styles.reason}><strong>Reason:</strong> {lockReason}</p>
                         <div className="form-check mb-3"><input id="lock-confirm" className="form-check-input" type="checkbox" disabled={busy} checked={confirmed} onChange={event => setConfirmed(event.target.checked)} /><label htmlFor="lock-confirm" className="form-check-label">I confirm this range and reason and have reviewed outstanding balances and pending refunds. I understand source records, including old bills, will be frozen and normal collections/refunds that mutate them may be prevented. Current-period linked corrections or opening balances are the appropriate path. This lock cannot be undone here and does not assert reconciliation or finalize these days.</label></div>
                         <button type="button" className="btn btn-danger" disabled={busy || !confirmed || !!reasonError(lockReason)} onClick={lockHistory}>Permanently lock historical range</button>
                    </section>}
               </section>
               </div>
               <section className={`card ${styles.panel}`} aria-labelledby="locked-ranges">
                    <div className={styles.sectionHeading}><h2 id="locked-ranges" tabIndex={-1} className="h4 mb-0">Immutable historical lock ranges</h2><span className={styles.status}>{settings.ranges.length} recorded ranges</span></div>
                    {!settings.ranges.length ? <div className={styles.empty}><strong>No historical lock ranges have been recorded.</strong><p className="text-muted mb-0 mt-1">Preview a historical migration range above when you are ready. Enforcement can remain off.</p></div> : <div className={`table-responsive ${styles.history}`} role="region" aria-label="Historical lock records" tabIndex={0}><table className="table mb-0"><caption>Historical locks remain in place regardless of enforcement activation. Dates are inclusive.</caption><thead><tr><th scope="col">ID</th><th scope="col">Start date</th><th scope="col">End date</th><th scope="col">Reason</th><th scope="col">Created by</th><th scope="col">Created at</th></tr></thead><tbody>{settings.ranges.map(item => <tr key={item.id}><td>{item.id}</td><td><time dateTime={item.startDate}>{item.startDate}</time></td><td><time dateTime={item.endDate}>{item.endDate}</time></td><td className={styles.reason}>{item.reason}</td><td>{item.createdBy}</td><td><time dateTime={item.createdAt}>{new Date(item.createdAt).toLocaleString()}</time></td></tr>)}</tbody></table></div>}
               </section>
          </>}
     </main>;
}
