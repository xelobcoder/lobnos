'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Button, Modal, Table } from 'react-bootstrap';
import Link from 'next/link';
import { RiRefreshLine, RiSaveLine, RiSettings4Line } from '@remixicon/react';
import { toast } from 'react-toastify';
import PrimeToast from '../../../../components/accessories/PrimeToast';
import { EventCatalogItem, EventSetting, defaultEventSettings, loadEvents, loadTemplates, loadSingleEventCatalog, loadEventSettings, syncDefinitions, callMutate } from '../_lib';
import ui from '../../../../components/Billing/billing-strategy/StrategyWorkspace.module.css';
import styles from './EventWorkspace.module.css';
import EventSelector from '../_components/EventSelector';


export default function NotificationEventsPage() {
     const [loading, setLoading] = useState(true);
     const [detailsLoading, setDetailsLoading] = useState(false);
     const [error, setError] = useState('');
     const [detailsError, setDetailsError] = useState('');
     const [detailsRetry, setDetailsRetry] = useState(0);
     const [saved, setSaved] = useState(false);
     const requestId = useRef(0);
     const mutationLock = useRef(false);
     const [savingSettings, setSavingSettings] = useState(false);
     const [syncing, setSyncing] = useState(false);
     const [syncResults, setSyncResults] = useState<any[]>([]);
     const [showSyncModal, setShowSyncModal] = useState(false);
     const [events, setEvents] = useState<any[]>([]);
     const [templates, setTemplates] = useState<any[]>([]);
     const [selectedEventCode, setSelectedEventCode] = useState('');
     const [catalogItem, setCatalogItem] = useState<EventCatalogItem | null>(null);
     const [eventSettings, setEventSettings] = useState<EventSetting>(defaultEventSettings);

     const selectedEvent = useMemo(
          () => events.find((item) => item.event_code === selectedEventCode),
          [events, selectedEventCode],
     );

     const visibleTemplates = useMemo(() => {
          return templates.filter((item) => {
               const code = item.eventCode || item.event_code || '';
               const eventId = Number(item.eventId || item.event_id || 0);
               return code === selectedEventCode || (selectedEvent?.id && eventId === Number(selectedEvent.id));
          });
     }, [templates, selectedEventCode, selectedEvent]);

     const loadAll = async () => {
          const id = ++requestId.current;
          setLoading(true); setError('');
          try {
               const [eventsRows, templateRows] = await Promise.all([loadEvents(), loadTemplates()]);
               if (id !== requestId.current) return;
               setEvents(eventsRows); setTemplates(templateRows);
               setSelectedEventCode(previous => eventsRows.some(item => item.event_code === previous) ? previous : eventsRows[0]?.event_code || '');
               setDetailsRetry(value => value + 1);
          } catch (err) {
               if (id === requestId.current) setError(err instanceof Error ? err.message : 'Unable to load notification events.');
          } finally { if (id === requestId.current) setLoading(false); }
     };
     useEffect(() => {
          void loadAll();
          return () => { requestId.current++; };
     }, []);
     useEffect(() => {
          let live = true;
          setCatalogItem(null); setEventSettings(defaultEventSettings); setDetailsError(''); setSaved(false);
          if (!selectedEventCode) { setDetailsLoading(false); return; }
          setDetailsLoading(true);
          Promise.all([loadSingleEventCatalog(selectedEventCode), loadEventSettings(selectedEventCode)])
               .then(([catalog, settingsRow]) => {
                    if (!live) return;
                    if (!catalog) throw new Error('Unable to load this event catalog.');
                    setCatalogItem(catalog); setEventSettings(settingsRow);
               }).catch((err) => { if (live) setDetailsError(err?.message || 'Unable to load event settings.'); })
               .finally(() => { if (live) setDetailsLoading(false); });
          return () => { live = false; };
     }, [selectedEventCode, detailsRetry]);
     async function runSync() {
          if (mutationLock.current) return;
          mutationLock.current = true; setSyncing(true);
          try {
               const results = await syncDefinitions();
               setSyncResults(results); setShowSyncModal(true);
               toast.success('Sync completed');
               await loadAll();
          } catch (err) { toast.error(err instanceof Error ? err.message : 'Sync failed'); }
          finally { mutationLock.current = false; setSyncing(false); }
     }
     async function saveSettings() {
          if (!selectedEventCode || loading || detailsLoading || detailsError || !catalogItem || mutationLock.current) return;
          mutationLock.current = true; setSavingSettings(true); setSaved(false);
          try {
               await callMutate('notifications/settings/' + encodeURIComponent(selectedEventCode), 'PUT', { ...eventSettings });
               const persisted = await loadEventSettings(selectedEventCode);
               setEventSettings(persisted);
               toast.success('Event settings updated'); setSaved(true);
          } catch (err) { toast.error(err instanceof Error ? err.message : 'Unable to update settings'); }
          finally { mutationLock.current = false; setSavingSettings(false); }
     }
     const channels = [
          { key: 'emailEnabled' as const, label: 'Email', description: 'Send email notifications for this event.' },
          { key: 'smsEnabled' as const, label: 'SMS', description: 'Send text message notifications.' },
          { key: 'whatsappEnabled' as const, label: 'WhatsApp', description: 'Send notifications through WhatsApp.' },
          { key: 'inAppEnabled' as const, label: 'In-app', description: 'Show notifications inside the application.' },
     ];
     const busy = syncing || savingSettings;
     const disabled = busy || loading || detailsLoading || !!detailsError || !selectedEventCode || !catalogItem;
     const selectedTemplate = visibleTemplates.find(item => Number(item.id) === eventSettings.defaultTemplateId);
     function updateSetting<K extends keyof EventSetting>(key: K, value: EventSetting[K]) {
          setEventSettings(previous => ({ ...previous, [key]: value })); setSaved(false);
     }
     return <main className={ui.workspace + ' ' + styles.workspace}>
          <PrimeToast />
          <header className={ui.header}><div className={ui.heading}><span className={ui.icon}><RiSettings4Line size={24} aria-hidden="true" /></span><div><span className={ui.eyebrow}>Notifications</span><h1>Notification events</h1><p>Choose delivery channels and a default template for each event.</p></div></div><div className={ui.actions}><button className={ui.secondary} disabled={loading || busy} onClick={() => void loadAll()}><RiRefreshLine size={18} aria-hidden="true" />Refresh</button><button className={ui.primary} disabled={loading || busy} onClick={() => void runSync()}><RiRefreshLine size={18} aria-hidden="true" />{syncing ? 'Syncing definitions...' : 'Sync definitions'}</button></div></header>
          <div className={ui.stats} aria-label="Event overview">{[['Notification events', events.length], ['Available templates', templates.length], ['Channels enabled for selected event', channels.filter(channel => eventSettings[channel.key]).length]].map(([label, count], index) => <div className={ui.stat} key={label}><span className={ui.icon}><RiSettings4Line size={21} aria-hidden="true" /></span><div><strong>{loading || (index === 2 && (detailsLoading || !catalogItem)) ? '-' : count}</strong><span>{label}</span></div></div>)}</div>
          {error && <div className={ui.error} role="alert">{error}<button className={ui.secondary} disabled={loading || busy} onClick={() => void loadAll()}>Retry loading</button></div>}
          <section className={ui.panel} aria-labelledby="event-selection"><div className={ui.sectionTitle}><h2 id="event-selection">Choose an event</h2>{selectedEvent?.module && <span className={ui.badge}>{selectedEvent.module}</span>}</div><EventSelector id="notification-event" events={events} value={selectedEventCode} disabled={loading || busy} onChange={code => { setSelectedEventCode(code); setCatalogItem(null); setDetailsLoading(true); setSaved(false); }} />{!loading && !events.length && <div className={ui.notice + ' ' + styles.notice}>No notification events are available. Sync definitions to load the event catalog.</div>}</section>
          {detailsError && <div className={ui.error} role="alert">{detailsError}<button className={ui.secondary} disabled={busy || detailsLoading} onClick={() => setDetailsRetry(value => value + 1)}>Retry event details</button></div>}
          {(loading || detailsLoading) && <div className={ui.notice} role="status">Loading event settings...</div>}
          {saved && <div className={ui.success} role="status">Settings saved for {selectedEvent?.event_name || selectedEventCode}.</div>}
          <div className={ui.editorGrid}>
               <form className={ui.formSections} onSubmit={event => { event.preventDefault(); if (!disabled) void saveSettings(); }}>
                    <fieldset disabled={disabled} className={ui.formSections}>
                         <section className={ui.panel} aria-labelledby="channels-heading"><div className={ui.sectionTitle}><h2 id="channels-heading">Delivery channels</h2><span className={ui.badge}>{selectedEventCode || 'No event selected'}</span></div><p className={ui.help}>Enable the channels this event should use.</p><div className={ui.choices}>{channels.map(channel => <label className={ui.choice} key={channel.key}><input type="checkbox" checked={eventSettings[channel.key]} onChange={event => updateSetting(channel.key, event.target.checked)} /><div><strong>{channel.label}</strong><span>{channel.description}</span></div></label>)}</div></section>
                         <section className={ui.panel} aria-labelledby="template-heading"><div className={ui.sectionTitle}><h2 id="template-heading">Default template</h2><span className={ui.badge}>{visibleTemplates.length} available</span></div><div className={ui.field}><label htmlFor="event-default-template">Template for this event</label><select id="event-default-template" value={eventSettings.defaultTemplateId ?? ''} onChange={event => updateSetting('defaultTemplateId', event.target.value ? Number(event.target.value) : null)}><option value="">No template selected</option>{eventSettings.defaultTemplateId && !selectedTemplate && <option value={eventSettings.defaultTemplateId}>Current template #{eventSettings.defaultTemplateId} (unavailable)</option>}{visibleTemplates.map(item => <option key={item.id} value={item.id}>{item.templateName}{item.isActive ? '' : ' (inactive)'}</option>)}</select><p className={ui.help}>Choose from templates associated with this event.</p></div>{!loading && !detailsLoading && selectedEventCode && !visibleTemplates.length && <p className={ui.help + ' ' + styles.notice}>No templates are available for this event. Create one in Notification Templates.</p>}</section>
                         <div className={ui.saveBar}><p className={ui.help}>Review the selected event before saving.</p><button type="submit" className={ui.primary} disabled={disabled}><RiSaveLine size={18} aria-hidden="true" />{savingSettings ? 'Saving settings...' : 'Save event settings'}</button></div>
                    </fieldset>
               </form>
               <aside className={ui.formSections}>
                    <section className={ui.panel + ' ' + ui.summary} aria-labelledby="summary-heading"><h2 id="summary-heading">Event summary</h2><dl><div><dt>Event</dt><dd>{selectedEvent?.event_name || selectedEventCode || 'No event selected'}</dd></div><div><dt>Enabled channels</dt><dd>{detailsLoading || !catalogItem ? '-' : channels.filter(channel => eventSettings[channel.key]).map(channel => channel.label).join(', ') || 'None'}</dd></div><div><dt>Default template</dt><dd>{detailsLoading || !catalogItem ? '-' : selectedTemplate?.templateName || (eventSettings.defaultTemplateId ? '#' + eventSettings.defaultTemplateId : 'None selected')}</dd></div></dl><Link className={ui.secondary} href="/email-services/notifications/templates">Manage templates &rarr;</Link></section>
                    <section className={ui.panel} aria-labelledby="references-heading"><h2 id="references-heading">Required references</h2><p className={ui.help + ' ' + styles.notice}>Provide these record IDs when triggering this event.</p><div className={styles.chips}>{catalogItem?.requiredReferences?.map(reference => <span key={reference} className={ui.badge}>{reference}</span>)}</div>{!detailsLoading && catalogItem && !catalogItem.requiredReferences?.length && <p className={ui.help}>No reference IDs are required.</p>}</section>
               </aside>
          </div>
          <section className={ui.panel} aria-labelledby="variables-heading" aria-busy={detailsLoading}><div className={ui.sectionTitle}><h2 id="variables-heading">Event variables</h2><span className={ui.badge}>{catalogItem?.variables?.length || 0} variables</span></div><p className={ui.help}>Use these placeholders in templates. Required variables are marked below.</p>{detailsLoading ? <div className={ui.empty} role="status">Loading variables...</div> : catalogItem?.variables?.length ? <div className={ui.tableWrap + ' ' + styles.variables}><table className={ui.table}><thead><tr><th scope="col">Placeholder</th><th scope="col">Type</th><th scope="col">Requirement</th><th scope="col">Description</th></tr></thead><tbody>{catalogItem.variables.map(variable => <tr key={variable.variable_name}><td><code>{'{{' + variable.variable_name + '}}'}</code></td><td>{variable.variable_type || '-'}</td><td><span className={ui.badge + (variable.is_required ? ' ' + ui.active : '')}>{variable.is_required ? 'Required' : 'Optional'}</span></td><td>{variable.description || '-'}</td></tr>)}</tbody></table></div> : <div className={ui.empty}><p>{detailsError ? 'Retry event details to view variables.' : selectedEventCode ? 'No variables in this event catalog.' : 'Select an event to view its variables.'}</p></div>}</section>
               <Modal show={showSyncModal} onHide={() => setShowSyncModal(false)} size="lg">
                    <Modal.Header closeButton>
                         <Modal.Title className="fs-6 fw-bold">Sync Definitions Result</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                         {syncResults.length === 0 ? (
                              <p className="text-muted mb-0">No changes were made. Definitions are already up to date.</p>
                         ) : (
                              <Table responsive size="sm" bordered className="small mb-0">
                                   <thead className="table-light">
                                        <tr>
                                             <th>Event Code</th>
                                             <th>Variables Inserted</th>
                                             <th>Template Created</th>
                                        </tr>
                                   </thead>
                                   <tbody>
                                        {syncResults.map((row: any, idx: number) => (
                                             <tr key={idx}>
                                                  <td>{row.eventCode || row.event_code || '-'}</td>
                                                  <td>{row.variablesInserted ?? row.variables_inserted ?? '-'}</td>
                                                  <td>{row.templateCreated || row.template_created ? 'Yes' : 'No'}</td>
                                             </tr>
                                        ))}
                                   </tbody>
                              </Table>
                         )}
                    </Modal.Body>
                    <Modal.Footer>
                         <Button size="sm" variant="secondary" onClick={() => setShowSyncModal(false)}>Close</Button>
                    </Modal.Footer>
               </Modal>
     </main>;
}
