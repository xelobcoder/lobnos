'use client';

import EventSelector from '../_components/EventSelector';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { RiSendPlane2Line } from '@remixicon/react';
import { toast } from 'react-toastify';
import PrimeToast from '../../../../components/accessories/PrimeToast';
import { useApplication } from '../../../../components/Auth/useApplicationContext';
import { EventCatalogItem, loadSingleEventCatalog, loadEvents, triggerByReference } from '../_lib';
import s from '../../../../components/Billing/billing-strategy/StrategyWorkspace.module.css';
import styles from './TriggerWorkspace.module.css';


const REFERENCE_LABELS: Record<string, string> = {
     patientId: 'Patient ID',
     appointmentId: 'Appointment ID',
     ascensionId: 'Ascension ID',
     billingId: 'Billing ID',
     userId: 'User ID',
};

export default function NotificationTriggerPage() {
     const app = useApplication();
     const employeeid = Number(app?.user?.employeeid || 0);

     const [loading, setLoading] = useState(false);
     const [submitting, setSubmitting] = useState(false);

     const [events, setEvents] = useState<any[]>([]);
     const [selectedEventCode, setSelectedEventCode] = useState('');
     const [catalog, setCatalog] = useState<EventCatalogItem | null>(null);
     const [priority, setPriority] = useState('normal');

     const [references, setReferences] = useState<Record<string, string>>({});
     const [contextJson, setContextJson] = useState('{}');
     const [to, setTo] = useState('');
     const [cc, setCc] = useState('');
     const [bcc, setBcc] = useState('');

     const [triggerResult, setTriggerResult] = useState<any>(null);

     const [catalogLoading, setCatalogLoading] = useState(false);
     const [loadError, setLoadError] = useState('');
     const [catalogError, setCatalogError] = useState('');
     const [retry, setRetry] = useState(0);
     const submitLock = useRef(false);
     useEffect(() => {
          let live = true;
          setLoading(true); setLoadError('');
          loadEvents().then((rows) => {
               if (live) { setEvents(rows); setSelectedEventCode((previous) => previous || rows[0]?.event_code || ''); }
          }).catch((error) => { if (live) setLoadError(error?.message || 'Unable to load events.'); })
          .finally(() => { if (live) setLoading(false); });
          return () => { live = false; };
     }, [retry]);
     useEffect(() => {
          let live = true;
          setCatalog(null); setReferences({}); setCatalogError('');
          if (!selectedEventCode) { setCatalogLoading(false); return; }
          setCatalogLoading(true);
          loadSingleEventCatalog(selectedEventCode).then((item) => {
               if (!live) return;
               setCatalog(item);
               if (!item) setCatalogError('Unable to load event references. Please try again.');
          }).catch(() => { if (live) setCatalogError('Unable to load event references. Please try again.'); })
          .finally(() => { if (live) setCatalogLoading(false); });
          return () => { live = false; };
     }, [selectedEventCode, retry]);

     const triggerNotification = async () => {
          if (submitLock.current || loading || catalogLoading || !catalog) return;
          if (!selectedEventCode) {
               toast.error('Select an event');
               return;
          }

          const requiredRefs = catalog?.requiredReferences || [];
          const missingRefs = requiredRefs.filter((ref) => !references[ref]?.toString().trim());
          if (missingRefs.length) {
               toast.error(`Required references missing: ${missingRefs.join(', ')}`);
               return;
          }

          let parsedContext: Record<string, any> = {};
          try {
               parsedContext = JSON.parse(contextJson || '{}');
               if (!parsedContext || Array.isArray(parsedContext) || typeof parsedContext !== 'object') throw new Error('Invalid context');
          } catch (_err) {
               toast.error('Context overrides must be a valid JSON object');
               return;
          }

          const refsPayload: Record<string, any> = {};
          for (const [key, val] of Object.entries(references)) {
               if (val.trim()) refsPayload[key] = isNaN(Number(val)) ? val : Number(val);
          }

          const toList = to.split(',').map((item) => item.trim()).filter(Boolean);
          const ccList = cc.split(',').map((item) => item.trim()).filter(Boolean);
          const bccList = bcc.split(',').map((item) => item.trim()).filter(Boolean);

          submitLock.current = true;
          setSubmitting(true);
          setTriggerResult(null);
          try {
               const response = await triggerByReference({
                    eventCode: selectedEventCode,
                    references: refsPayload,
                    context: Object.keys(parsedContext).length ? parsedContext : undefined,
                    priority,
                    createdBy: employeeid || undefined,
                    recipients: { to: toList, cc: ccList, bcc: bccList },
               });
               const result = response?.result || {};
               setTriggerResult(result);
               if (result.queued) {
                    toast.success(`Queued notification #${result.notificationQueueId || '-'} and email #${result.emailQueueId || '-'}`);
               } else {
                    toast.info(result.reason || 'Notification was not queued');
               }
          } catch (err: any) {
               toast.error(err?.message || 'Trigger failed');
          } finally {
               submitLock.current = false;
               setSubmitting(false);
          }
     };

     const requiredRefs = catalog?.requiredReferences || [];

     const ready = !loading && !catalogLoading && !!catalog && !submitting;
     const selectedEvent = events.find((event) => event.event_code === selectedEventCode);
     return (
          <main className={s.workspace + ' ' + styles.workspace}>
               <PrimeToast />
               <header className={s.header}>
                    <div className={s.heading}><span className={s.icon}><RiSendPlane2Line size={23} aria-hidden="true" /></span><div><span className={s.eyebrow}>Notifications</span><h1>Manual notification trigger</h1><p>Choose an event, add its references, and queue a notification.</p></div></div>
                    <Link href="/email-services/notifications/queue" className={s.secondary}>View notification queue &rarr;</Link>
               </header>
               {loadError && <div className={s.error} role="alert">{loadError}<button className={s.secondary} onClick={() => setRetry((value) => value + 1)}>Try again</button></div>}
               <form onSubmit={(event) => { event.preventDefault(); void triggerNotification(); }}>
                    <fieldset disabled={submitting}>
                         <div className={s.editorGrid}>
                              <div className={s.formSections}>
                                   <section className={s.panel} aria-labelledby="event-heading" aria-busy={loading || catalogLoading}>
                                        <div className={s.sectionTitle}><h2 id="event-heading">1. Event & references</h2><span className={s.badge}>{loading ? 'Loading...' : events.length + ' events'}</span></div>
                                        <div className={s.fields}>
                                             <EventSelector id="trigger-event" events={events} value={selectedEventCode} disabled={loading} onChange={code => { setCatalog(null); setSelectedEventCode(code); setTriggerResult(null); }} />
                                             <div className={s.field}><label htmlFor="trigger-priority">Priority</label><select id="trigger-priority" value={priority} onChange={(event) => setPriority(event.target.value)}><option value="low">Low</option><option value="normal">Normal</option><option value="high">High</option></select></div>
                                        </div>
                                        <div className={styles.references}>
                                             <h3>Required references</h3>
                                             {catalogLoading || loading ? <p className={s.help} role="status">Loading event references...</p> : catalogError ? <div className={s.error} role="alert">{catalogError}<button type="button" className={s.secondary} onClick={() => setRetry((value) => value + 1)}>Try again</button></div> : catalog ? <>
                                                  <p className={s.help}>Use the record IDs that belong to this event.</p>
                                                  {requiredRefs.length ? <div className={s.fields}>{requiredRefs.map((ref) => <div className={s.field} key={ref}><label htmlFor={'reference-' + ref}>{REFERENCE_LABELS[ref] || ref} *</label><input id={'reference-' + ref} type="number" required placeholder={'Enter ' + (REFERENCE_LABELS[ref] || ref)} value={references[ref] || ''} onChange={(event) => setReferences((previous) => ({ ...previous, [ref]: event.target.value }))} /></div>)}</div> : <p className={s.help}>This event does not require reference IDs.</p>}
                                             </> : <p className={s.help}>Select an event to see its required references.</p>}
                                        </div>
                                        {!loading && !loadError && !events.length && <div className={s.notice}>No notification events are available.<Link href="/email-services/notifications/events" className={s.textButton}>Manage events &rarr;</Link></div>}
                                   </section>
                                   <section className={s.panel} aria-labelledby="recipients-heading">
                                        <div className={s.sectionTitle}><h2 id="recipients-heading">2. Recipient overrides</h2><span className={s.badge}>Optional</span></div>
                                        <p className={s.help + ' ' + styles.intro}>Leave blank to use the event's resolved recipients. Separate multiple addresses with commas.</p>
                                        <div className={s.fields}>
                                             <div className={s.field + ' ' + s.spanAll}><label htmlFor="trigger-to">To</label><input id="trigger-to" value={to} onChange={(event) => setTo(event.target.value)} placeholder="name@example.com, another@example.com" /></div>
                                             <div className={s.field}><label htmlFor="trigger-cc">CC</label><input id="trigger-cc" value={cc} onChange={(event) => setCc(event.target.value)} placeholder="Copy recipients" /></div>
                                             <div className={s.field}><label htmlFor="trigger-bcc">BCC</label><input id="trigger-bcc" value={bcc} onChange={(event) => setBcc(event.target.value)} placeholder="Hidden copy recipients" /></div>
                                        </div>
                                   </section>
                                   <section className={s.panel} aria-labelledby="context-heading">
                                        <div className={s.sectionTitle}><h2 id="context-heading">3. Context overrides</h2><span className={s.badge}>Optional</span></div>
                                        <div className={s.field}><label htmlFor="trigger-context">Additional variables (JSON)</label><textarea id="trigger-context" className={styles.code} rows={5} value={contextJson} onChange={(event) => setContextJson(event.target.value)} spellCheck={false} aria-describedby="context-help" /><p id="context-help" className={s.help}>Enter a JSON object with additional variables. Leave {'{}'} to use the resolved context.</p></div>
                                   </section>
                                   {triggerResult && <section className={triggerResult.queued ? s.success : s.notice} role="status"><div><strong>{triggerResult.queued ? 'Notification queued' : 'Notification was not queued'}</strong>{triggerResult.notificationQueueId && <p>Notification queue ID: {triggerResult.notificationQueueId}</p>}{triggerResult.emailQueueId && <p>Email queue ID: {triggerResult.emailQueueId}</p>}{triggerResult.reason && <p>{triggerResult.reason}</p>}</div>{triggerResult.queued && <Link className={s.secondary} href="/email-services/notifications/queue">View queue &rarr;</Link>}</section>}
                                   <div className={s.saveBar}><p className={s.help}>Review the event and references before queuing.</p><button type="submit" className={s.primary} disabled={!ready}><RiSendPlane2Line size={18} aria-hidden="true" />{submitting ? 'Queuing notification...' : 'Queue notification'}</button></div>
                              </div>
                              <aside className={s.panel + ' ' + s.summary} aria-labelledby="review-heading">
                                   <h2 id="review-heading">Trigger summary</h2>
                                   <dl><div><dt>Event</dt><dd>{selectedEvent?.event_name || selectedEventCode || 'No event selected'}</dd></div><div><dt>Priority</dt><dd className={styles.capitalize}>{priority}</dd></div><div><dt>Required references</dt><dd>{catalogLoading ? 'Loading...' : catalog ? requiredRefs.filter((ref) => references[ref]?.trim()).length + ' of ' + requiredRefs.length + ' provided' : 'Select an event'}</dd></div><div><dt>Recipients</dt><dd>{to.trim() || cc.trim() || bcc.trim() ? 'Overrides provided' : 'Resolved from event'}</dd></div></dl>
                                   <div className={s.notice}><p className={s.help}>Queuing adds the notification for processing. Check the queue to follow its delivery status.</p></div>
                              </aside>
                         </div>
                    </fieldset>
               </form>
          </main>
     );
}
