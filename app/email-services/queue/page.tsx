'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import ui from "../../../components/Billing/billing-strategy/StrategyWorkspace.module.css";
import { Modal } from 'react-bootstrap';
import { RiEyeLine, RiPlayCircleLine, RiRefreshLine, RiSendPlane2Line } from '@remixicon/react';
import { toast } from 'react-toastify';
import { EmailProvider, EmailTemplate, QueueItem, PRIORITIES, QUEUE_STATUSES, callGet, callMutate, defaultQueueForm, mapProviderFromApi, mapTemplateFromApi, parseJsonArray, parseList } from '../_lib';

import PrimeToast from '../../../components/accessories/PrimeToast';
import { useApplication } from '../../../components/Auth/useApplicationContext';
import styles from './EmailQueueWorkspace.module.css';


export default function EmailQueuePage() {
     const app = useApplication();
     const employeeid = Number(app?.user?.employeeid || 0);

     const [loading, setLoading] = useState(true);
     const [busy, setBusy] = useState('');
     const [error, setError] = useState('');
     const [query, setQuery] = useState('');
     const [page, setPage] = useState(1);
     const actionLock = useRef(false);
     const requestId = useRef(0);
     const [templates, setTemplates] = useState<EmailTemplate[]>([]);
     const [providers, setProviders] = useState<EmailProvider[]>([]);
     const [queueItems, setQueueItems] = useState<QueueItem[]>([]);

     const [queueForm, setQueueForm] = useState(defaultQueueForm);
     const [selectedQueueStatus, setSelectedQueueStatus] = useState('all');
     const [queueLimit, setQueueLimit] = useState(50);
     const [queuePayloadViewer, setQueuePayloadViewer] = useState<any>(null);

     const loadQueue = async () => {
          const id = ++requestId.current;
          setLoading(true); setError('');
          try {
               const response = await callGet('email/queue?limit=' + queueLimit);
               if (id === requestId.current) setQueueItems(parseList<QueueItem>(response));
          } catch (err) {
               if (id === requestId.current) setError(err instanceof Error ? err.message : 'Unable to load email queue.');
          } finally { if (id === requestId.current) setLoading(false); }
     };
     useEffect(() => {
          let live = true;
          Promise.all([callGet('email/templates'), callGet('email/providers')]).then(([templatesResponse, providersResponse]) => {
               if (!live) return;
               setTemplates(parseList<EmailTemplate>(templatesResponse).map(mapTemplateFromApi));
               setProviders(parseList<EmailProvider>(providersResponse).map(mapProviderFromApi));
          }).catch((err) => { if (live) toast.error(err?.message || 'Unable to load templates and providers.'); });
          return () => { live = false; };
     }, []);
     useEffect(() => {
          void loadQueue();
          return () => { requestId.current++; };
     }, [queueLimit]);
     const filteredQueueItems = useMemo(() => queueItems.filter(item =>
          (selectedQueueStatus === 'all' || item.status?.toLowerCase() === selectedQueueStatus) &&
          (!query.trim() || [item.id, item.subject, item.to_json, item.status, item.priority].some(value => String(value || '').toLowerCase().includes(query.trim().toLowerCase())))
     ), [queueItems, selectedQueueStatus, query]);
     const maxPage = Math.max(1, Math.ceil(filteredQueueItems.length / 10));
     const currentPage = Math.min(page, maxPage);
     const displayed = filteredQueueItems.slice((currentPage - 1) * 10, currentPage * 10);
     async function runAction(label: string, action: () => Promise<void>) {
          if (actionLock.current) return;
          actionLock.current = true; setBusy(label);
          try { await action(); } finally { actionLock.current = false; setBusy(''); }
     }

     const queueEmail = async () => {
          const to = queueForm.to.split(',').map((x) => x.trim()).filter(Boolean);
          const cc = queueForm.cc.split(',').map((x) => x.trim()).filter(Boolean);
          const bcc = queueForm.bcc.split(',').map((x) => x.trim()).filter(Boolean);

          if (to.length === 0) {
               toast.error('At least one recipient in To is required');
               return;
          }

          if (!queueForm.templateId && (!queueForm.subject.trim() || !queueForm.htmlBody.trim())) {
               toast.error('Subject and HTML body are required when template is not selected');
               return;
          }

          let variables: Record<string, any>, attachments: any[];
          try {
               variables = JSON.parse(queueForm.variablesJson || '{}');
               attachments = JSON.parse(queueForm.attachmentsJson || '[]');
               if (!variables || Array.isArray(variables) || typeof variables !== 'object') throw new Error('Variables must be a JSON object.');
               if (!Array.isArray(attachments)) throw new Error('Attachments must be a JSON array.');
          } catch (err) { toast.error(err instanceof Error ? err.message : 'Check the JSON fields.'); return; }
          const payload: any = {
               templateId: queueForm.templateId ? Number(queueForm.templateId) : undefined,
               providerId: queueForm.providerId ? Number(queueForm.providerId) : undefined,
               to,
               cc,
               bcc,
               subject: queueForm.subject || undefined,
               htmlBody: queueForm.htmlBody || undefined,
               plainTextBody: queueForm.plainTextBody || undefined,
               variables,
               attachments,
               scheduledAt: queueForm.scheduledAt ? new Date(queueForm.scheduledAt).toISOString() : undefined,
               priority: queueForm.priority,
               referenceType: queueForm.referenceType || undefined,
               referenceId: queueForm.referenceId || undefined,
               createdBy: employeeid || undefined,
          };

          try {
               await callMutate('email/queue', 'POST', payload);
               toast.success('Email queued');
               setQueueForm(defaultQueueForm);
               await loadQueue();
          } catch (err: any) {
               toast.error(err?.message || 'Unable to queue email');
          }
     };

     const processQueueBatch = async () => {
          try {
               const response = await callMutate('email/queue/process?limit=20', 'POST', {});
               const items = parseList<any>(response);
               toast.success(`Processed ${items.length || 0} queued email(s)`);
               await loadQueue();
          } catch (err: any) {
               toast.error(err?.message || 'Unable to process queue');
          }
     };

     const processQueueItem = async (item: QueueItem) => {
          try {
               await callMutate(`email/queue/${item.id}/process`, 'POST', {});
               toast.success(`Queue #${item.id} processed`);
               await loadQueue();
          } catch (err: any) {
               toast.error(err?.message || 'Unable to process queue item');
          }
     };

     const retryQueueItem = async (item: QueueItem) => {
          try {
               await callMutate(`email/queue/${item.id}/retry`, 'POST', { forceImmediate: true });
               toast.success(`Queue #${item.id} retried`);
               await loadQueue();
          } catch (err: any) {
               toast.error(err?.message || 'Unable to retry queue item');
          }
     };

     function field(key: keyof typeof defaultQueueForm, label: string, options: { textarea?: boolean; type?: string; required?: boolean; placeholder?: string; wide?: boolean } = {}) {
          const props = { id: 'email-' + key, value: queueForm[key], required: options.required, placeholder: options.placeholder, onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setQueueForm(previous => ({ ...previous, [key]: event.target.value })) };
          return <div className={ui.field + (options.wide ? ' ' + ui.spanAll : '')}><label htmlFor={props.id}>{label}{options.required ? ' *' : ''}</label>{options.textarea ? <textarea {...props} rows={4} /> : <input {...props} type={options.type || 'text'} />}</div>;
     }
     function dateLabel(value?: string) {
          if (!value) return '-';
          const date = new Date(value);
          return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
     }
     return <main className={ui.workspace + ' ' + styles.workspace}>
          <PrimeToast />
          <header className={ui.header}><div className={ui.heading}><span className={ui.icon}><RiSendPlane2Line size={24} aria-hidden="true" /></span><div><span className={ui.eyebrow}>Email services</span><h1>Email queue</h1><p>Create outbound emails, monitor delivery, and manage processing.</p></div></div><div className={ui.actions}><button className={ui.secondary} disabled={loading || !!busy} onClick={() => void loadQueue()}><RiRefreshLine size={18} aria-hidden="true" />Refresh queue</button><a href="#compose-email" className={ui.primary}><RiSendPlane2Line size={18} aria-hidden="true" />New email</a></div></header>
          <div className={ui.stats} aria-label="Loaded email overview">{[['Loaded emails', queueItems.length], ['Pending / scheduled', queueItems.filter(item => ['pending', 'scheduled'].includes(item.status?.toLowerCase())).length], ['Failed emails', queueItems.filter(item => item.status?.toLowerCase() === 'failed').length]].map(([label, count]) => <div className={ui.stat} key={label}><span className={ui.icon}><RiSendPlane2Line size={21} aria-hidden="true" /></span><div><strong>{loading ? '-' : count}</strong><span>{label}</span></div></div>)}</div>
          <form id="compose-email" onSubmit={event => { event.preventDefault(); void runAction('queue', queueEmail); }}>
               <fieldset disabled={!!busy}>
                    <div className={ui.editorGrid}>
                         <div className={ui.formSections}>
                              <section className={ui.panel} aria-labelledby="compose-heading"><div className={ui.sectionTitle}><h2 id="compose-heading">1. Delivery & recipients</h2><span className={ui.badge}>New email</span></div><div className={ui.fields}>
                                   <div className={ui.field}><label htmlFor="email-template">Template</label><select id="email-template" value={queueForm.templateId} onChange={event => setQueueForm(previous => ({ ...previous, templateId: event.target.value }))}><option value="">No template (direct body)</option>{templates.map(template => <option key={template.id} value={template.id}>{template.name}</option>)}</select></div>
                                   <div className={ui.field}><label htmlFor="email-provider">Provider</label><select id="email-provider" value={queueForm.providerId} onChange={event => setQueueForm(previous => ({ ...previous, providerId: event.target.value }))}><option value="">Use default provider</option>{providers.map(provider => <option key={provider.id} value={provider.id}>{provider.name}</option>)}</select></div>
                                   {field('to', 'To', { required: true, wide: true, placeholder: 'patient@example.com, other@example.com' })}
                                   {field('cc', 'CC', { placeholder: 'Optional copy recipients' })}{field('bcc', 'BCC', { placeholder: 'Optional hidden copy recipients' })}
                              </div><p className={ui.help + ' ' + styles.help}>Separate multiple recipient addresses with commas.</p></section>
                              <section className={ui.panel} aria-labelledby="content-heading"><div className={ui.sectionTitle}><h2 id="content-heading">2. Email content</h2><span className={ui.badge}>{queueForm.templateId ? 'Template selected' : 'Direct message'}</span></div><p className={ui.help + ' ' + styles.intro}>{queueForm.templateId ? 'The selected template supplies the content. Add overrides below if needed.' : 'Provide a subject and HTML body for this email.'}</p><div className={ui.fields}>{field('subject', 'Subject', { required: !queueForm.templateId, wide: true })}{field('htmlBody', 'HTML body', { required: !queueForm.templateId, textarea: true, wide: true })}{field('plainTextBody', 'Plain text body (optional)', { textarea: true, wide: true })}</div></section>
                              <section className={ui.panel} aria-labelledby="options-heading"><div className={ui.sectionTitle}><h2 id="options-heading">3. Scheduling & options</h2><span className={ui.badge}>Optional</span></div><div className={ui.fields}>
                                   <div className={ui.field}><label htmlFor="email-priority">Priority</label><select id="email-priority" value={queueForm.priority} onChange={event => setQueueForm(previous => ({ ...previous, priority: event.target.value }))}>{PRIORITIES.map(priority => <option key={priority} value={priority}>{priority}</option>)}</select></div>
                                   {field('scheduledAt', 'Schedule at', { type: 'datetime-local' })}
                                   {field('referenceType', 'Reference type')}{field('referenceId', 'Reference ID')}
                              </div><details className={styles.advanced}><summary>Advanced: variables & attachments</summary><p className={ui.help}>Use a JSON object for template variables and a JSON array for attachments.</p><div className={ui.fields}>{field('variablesJson', 'Variables (JSON object)', { textarea: true })}{field('attachmentsJson', 'Attachments (JSON array)', { textarea: true })}</div></details></section>
                              <div className={ui.saveBar}><p className={ui.help}>Review recipients and content before queuing.</p><button type="submit" className={ui.primary} disabled={!!busy}><RiSendPlane2Line size={18} aria-hidden="true" />{busy === 'queue' ? 'Queuing email...' : 'Queue email'}</button></div>
                         </div>
                         <aside className={ui.panel + ' ' + ui.summary} aria-labelledby="email-summary"><h2 id="email-summary">Email summary</h2><dl><div><dt>Content</dt><dd>{templates.find(template => String(template.id) === queueForm.templateId)?.name || (queueForm.templateId ? 'Selected template' : 'Direct message')}</dd></div><div><dt>Provider</dt><dd>{providers.find(provider => String(provider.id) === queueForm.providerId)?.name || 'Default provider'}</dd></div><div><dt>Recipients (To)</dt><dd>{queueForm.to.split(',').filter(value => value.trim()).length}</dd></div><div><dt>Priority</dt><dd className={styles.capitalize}>{queueForm.priority}</dd></div><div><dt>Schedule</dt><dd>{queueForm.scheduledAt ? dateLabel(queueForm.scheduledAt) : 'No scheduled time'}</dd></div></dl><div className={ui.notice}><p className={ui.help}>Queuing creates a delivery job. Follow its progress in the monitor below.</p></div></aside>
                    </div>
               </fieldset>
          </form>
          {error && <div className={ui.error} role="alert">{error}<button className={ui.secondary} disabled={loading || !!busy} onClick={() => void loadQueue()}>Retry loading</button></div>}
          <section className={ui.panel + ' ' + styles.monitor} aria-labelledby="monitor-heading" aria-busy={loading}>
               <div className={styles.monitorHeading}><div><h2 id="monitor-heading">Queue monitor</h2><p className={ui.help}>Counts and filters apply to the loaded emails.</p></div><button className={ui.secondary} disabled={loading || !!busy} onClick={() => void runAction('batch', processQueueBatch)}><RiPlayCircleLine size={18} aria-hidden="true" />{busy === 'batch' ? 'Processing...' : 'Process pending emails (up to 20)'}</button></div>
               <div className={ui.toolbar}>
                    <div className={ui.field}><label htmlFor="email-queue-search">Search emails</label><input id="email-queue-search" type="search" placeholder="Subject, recipient or queue ID" value={query} onChange={event => { setQuery(event.target.value); setPage(1); }} /></div>
                    <div className={ui.field}><label htmlFor="email-queue-status">Status</label><select id="email-queue-status" value={selectedQueueStatus} onChange={event => { setSelectedQueueStatus(event.target.value); setPage(1); }}><option value="all">All statuses</option>{QUEUE_STATUSES.map(status => <option key={status} value={status}>{status}</option>)}</select></div>
                    <div className={ui.field}><label htmlFor="email-queue-limit">Load limit</label><select id="email-queue-limit" value={queueLimit} disabled={!!busy} onChange={event => { setQueueLimit(Number(event.target.value)); setPage(1); }}>{[20, 50, 100].map(limit => <option key={limit} value={limit}>{limit} emails</option>)}</select></div>
                    <button className={ui.secondary + ' ' + styles.refresh} disabled={loading || !!busy} onClick={() => void loadQueue()}><RiRefreshLine size={18} aria-hidden="true" />Refresh</button>
               </div>
               {loading ? <div className={ui.empty} role="status">Loading email queue...</div> : !filteredQueueItems.length ? <div className={ui.empty}><RiSendPlane2Line size={32} aria-hidden="true" /><h3>{queueItems.length ? 'No matching emails' : error ? 'Email queue unavailable' : 'No queued emails'}</h3><p>{queueItems.length ? 'Try a different search or clear the filters.' : error ? 'Retry loading to view queued emails.' : 'Create an email above to add a delivery job.'}</p>{queueItems.length > 0 && <button className={ui.secondary} onClick={() => { setQuery(''); setSelectedQueueStatus('all'); setPage(1); }}>Clear filters</button>}</div> : <>
                    <div className={ui.tableWrap} tabIndex={0} role="region" aria-label="Email queue table"><table className={ui.table}><thead><tr><th scope="col">Email</th><th scope="col">Status / priority</th><th scope="col">Recipients</th><th scope="col">Scheduled</th><th scope="col">Retries</th><th scope="col">Created</th><th scope="col">Actions</th></tr></thead><tbody>{displayed.map(item => <tr key={item.id}><td><strong>{item.subject || 'No subject'}</strong><p>Queue #{item.id}</p></td><td><span className={ui.badge + ' ' + (item.status === 'sent' ? ui.active : item.status === 'failed' ? ui.expired : '')}>{item.status || 'Unknown'}</span><p className={styles.capitalize}>{item.priority || '-'}</p></td><td>{parseJsonArray(item.to_json).length}</td><td>{dateLabel(item.scheduled_at)}</td><td>{item.retry_count || 0}</td><td>{dateLabel(item.created_at)}</td><td><div className={ui.actions}><button className={ui.textButton} disabled={!!busy} aria-label={'Process email ' + item.id} onClick={() => void runAction('process-' + item.id, () => processQueueItem(item))}><RiPlayCircleLine size={16} aria-hidden="true" />Process</button><button className={ui.textButton} disabled={!!busy} aria-label={'Retry email ' + item.id} onClick={() => void runAction('retry-' + item.id, () => retryQueueItem(item))}><RiRefreshLine size={16} aria-hidden="true" />Retry</button><button className={ui.textButton} aria-label={'View payload for email ' + item.id} onClick={() => setQueuePayloadViewer(item)}><RiEyeLine size={16} aria-hidden="true" />View</button></div></td></tr>)}</tbody></table></div>
                    <footer className={ui.footer}><span className={ui.muted} aria-live="polite">{(currentPage - 1) * 10 + 1}-{Math.min(currentPage * 10, filteredQueueItems.length)} of {filteredQueueItems.length} emails</span><nav className={ui.pager} aria-label="Email queue pages"><button className={ui.secondary} disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}>Previous</button><span>Page {currentPage} of {maxPage}</span><button className={ui.secondary} disabled={currentPage === maxPage} onClick={() => setPage(currentPage + 1)}>Next</button></nav></footer>
               </>}
          </section>
          <Modal show={Boolean(queuePayloadViewer)} onHide={() => setQueuePayloadViewer(null)} size="lg"><Modal.Header closeButton><Modal.Title>Email payload #{queuePayloadViewer?.id}</Modal.Title></Modal.Header><Modal.Body><pre className={styles.payload}>{JSON.stringify(queuePayloadViewer || {}, null, 2)}</pre></Modal.Body></Modal>
     </main>;
}
