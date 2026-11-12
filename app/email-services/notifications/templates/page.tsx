'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Modal } from 'react-bootstrap';
import { RiEyeLine, RiFileHistoryLine, RiSaveLine, RiRefreshLine, RiAddLine } from '@remixicon/react';
import { toast } from 'react-toastify';

import PrimeToast from '../../../../components/accessories/PrimeToast';
import { useApplication } from '../../../../components/Auth/useApplicationContext';
import { extractTemplateVariables, loadEvents, loadTemplates, loadSingleEventCatalog, callMutate, callGet, parseList } from '../_lib';
import ui from '../../../../components/Billing/billing-strategy/StrategyWorkspace.module.css';
import styles from './TemplateWorkspace.module.css';



const emptyTemplateForm = {
     id: undefined as number | undefined,
     templateName: '',
     subject: '',
     htmlBody: '',
     plainBody: '',
     isDefault: false,
     isActive: true,
};

export default function NotificationTemplatesPage() {
     const app = useApplication();
     const employeeid = Number(app?.user?.employeeid || 0);

     const [loading, setLoading] = useState(true);
     const [busy, setBusy] = useState('');
     const [error, setError] = useState('');
     const [catalogLoading, setCatalogLoading] = useState(false);
     const [catalogError, setCatalogError] = useState('');
     const [catalogRetry, setCatalogRetry] = useState(0);
     const [query, setQuery] = useState('');
     const [status, setStatus] = useState('all');
     const [page, setPage] = useState(1);
     const actionLock = useRef(false);
     const requestId = useRef(0);
     const editor = useRef<HTMLDivElement>(null);
     async function runAction(label: string, action: () => Promise<void>) {
          if (actionLock.current) return;
          actionLock.current = true; setBusy(label);
          try { await action(); } finally { actionLock.current = false; setBusy(''); }
     }
     const [events, setEvents] = useState<any[]>([]);
     const [catalogVariables, setCatalogVariables] = useState<{ variable_name: string; is_required?: boolean; description?: string }[]>([]);
     const [templates, setTemplates] = useState<any[]>([]);
     const [selectedEventCode, setSelectedEventCode] = useState('');

     const [templateForm, setTemplateForm] = useState(emptyTemplateForm);
     const [templatePreview, setTemplatePreview] = useState<any>(null);
     const [previewFromTemplateId, setPreviewFromTemplateId] = useState<number | null>(null);

     const [showVersionsModal, setShowVersionsModal] = useState(false);
     const [templateVersions, setTemplateVersions] = useState<any[]>([]);

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

     const eventVariableNames = useMemo(() => catalogVariables.map((v) => v.variable_name), [catalogVariables]);

     const SYSTEM_REQUIRED = ['event_code', 'triggered_at'];

     const variableWarnings = useMemo(() => {
          const content = `${templateForm.subject}\n${templateForm.htmlBody}\n${templateForm.plainBody}`;
          const inTemplate = extractTemplateVariables(content);
          const allKnown = [...eventVariableNames, ...SYSTEM_REQUIRED];
          const unknown = inTemplate.filter((item) => !allKnown.includes(item));
          const missingSystem = SYSTEM_REQUIRED.filter((item) => !inTemplate.includes(item));
          const missingRequired = catalogVariables
               .filter((v) => v.is_required && !inTemplate.includes(v.variable_name))
               .map((v) => v.variable_name);
          const missingOptional = eventVariableNames.filter(
               (item) => !inTemplate.includes(item) && !missingRequired.includes(item),
          );
          return { unknown, missingSystem, missingRequired, missingOptional };
     }, [templateForm, eventVariableNames, catalogVariables]);

     const catalogPrefillRef = React.useRef<{ subject: string; htmlBody: string; plainBody: string } | null>(null);

     const resetTemplateForm = () => {
          const prefill = catalogPrefillRef.current || { subject: '', htmlBody: '', plainBody: '' };
          setTemplateForm({
               id: undefined,
               templateName: `${selectedEventCode || 'Event'} Template`,
               subject: prefill.subject,
               htmlBody: prefill.htmlBody,
               plainBody: prefill.plainBody,
               isDefault: false,
               isActive: true,
          });
          setTemplatePreview(null);
          setPreviewFromTemplateId(null);
     };

     const refresh = async () => {
          const id = ++requestId.current;
          setLoading(true); setError('');
          try {
               const [eventsRows, templatesRows] = await Promise.all([loadEvents(), loadTemplates(true)]);
               if (id !== requestId.current) return;
               setEvents(eventsRows); setTemplates(templatesRows);
               setSelectedEventCode(previous => previous || eventsRows.find(event => templatesRows.some(template => template.eventCode === event.event_code || Number(template.eventId) === Number(event.id)))?.event_code || eventsRows[0]?.event_code || '');
          } catch (err) {
               if (id === requestId.current) setError(err instanceof Error ? err.message : 'Unable to load notification templates.');
          } finally { if (id === requestId.current) setLoading(false); }
     };
     useEffect(() => {
          void refresh();
          return () => { requestId.current++; };
     }, []);
     useEffect(() => {
          let live = true;
          setCatalogVariables([]); catalogPrefillRef.current = null; setCatalogError('');
          if (!selectedEventCode) { setCatalogLoading(false); return; }
          setCatalogLoading(true);
          loadSingleEventCatalog(selectedEventCode).then(catalog => {
               if (!live) return;
               if (!catalog) { setCatalogError('Unable to load event variables. Try again before saving.'); return; }
               setCatalogVariables(catalog.variables || []);
               catalogPrefillRef.current = catalog.template || null;
          }).catch(() => { if (live) setCatalogError('Unable to load event variables. Try again before saving.'); })
          .finally(() => { if (live) setCatalogLoading(false); });
          return () => { live = false; };
     }, [selectedEventCode, catalogRetry]);

     const saveTemplate = async () => {
          if (!selectedEventCode) {
               toast.error('Select an event first');
               return;
          }
          if (!templateForm.templateName.trim() || !templateForm.subject.trim() || !templateForm.htmlBody.trim()) {
               toast.error('Template name, subject and HTML body are required');
               return;
          }
          if (!templateForm.plainBody.trim()) {
               toast.error('Plain body is required — keep both htmlBody and plainBody present');
               return;
          }
          if (variableWarnings.unknown.length) {
               toast.error(`Unknown variables: ${variableWarnings.unknown.join(', ')}`);
               return;
          }
          const requiredMissing = [...variableWarnings.missingSystem, ...variableWarnings.missingRequired];
          if (requiredMissing.length) {
               const proceed = window.confirm(
                    `Required placeholders are missing: ${requiredMissing.map((v) => `{{${v}}}`).join(', ')}\n\nSave anyway?`,
               );
               if (!proceed) return;
          }

          const payload = {
               eventCode: selectedEventCode,
               templateName: templateForm.templateName,
               subject: templateForm.subject,
               htmlBody: templateForm.htmlBody,
               plainBody: templateForm.plainBody,
               isDefault: templateForm.isDefault,
               isActive: templateForm.isActive,
               createdBy: employeeid || undefined,
               updatedBy: employeeid || undefined,
          };

          try {
               if (templateForm.id) {
                    await callMutate(`notifications/templates/${templateForm.id}`, 'PUT', payload);
                    toast.success('Template updated');
               } else {
                    await callMutate('notifications/templates', 'POST', payload);
                    toast.success('Template created');
               }
               await refresh();
               resetTemplateForm();
          } catch (err: any) {
               toast.error(err?.message || 'Unable to save template');
          }
     };

     const deleteTemplate = async (row: any) => {
          if (!row?.id) return;
          if (!window.confirm(`Delete template "${row.templateName}"?`)) return;
          try {
               await callMutate(`notifications/templates/${row.id}`, 'DELETE', {});
               toast.success('Template deleted');
               await refresh();
               if (templateForm.id === row.id) resetTemplateForm();
          } catch (err: any) {
               toast.error(err?.message || 'Unable to delete template');
          }
     };

     const previewTemplate = async (templateId?: number) => {
          const id = templateId || templateForm.id;
          if (!id) {
               toast.error('Select or save a template before preview');
               return;
          }

          const variablesPayload = eventVariableNames.reduce((acc: Record<string, string>, key) => {
               acc[key] = `Sample ${key}`;
               return acc;
          }, {});

          try {
               const response = await callMutate(`notifications/templates/${id}/preview`, 'POST', {
                    variables: variablesPayload,
               });
               setPreviewFromTemplateId(id);
               setTemplatePreview(response?.result || response || null);
          } catch (err: any) {
               toast.error(err?.message || 'Template preview failed');
          }
     };

     const loadTemplateVersions = async (templateId?: number) => {
          if (!templateId) return;
          try {
               const response = await callGet(`notifications/templates/${templateId}/versions`);
               setTemplateVersions(parseList<any>(response));
               setShowVersionsModal(true);
          } catch (err: any) {
               toast.error(err?.message || 'Unable to load version history');
          }
     };

     const filtered = visibleTemplates.filter(item => (!query.trim() || [item.templateName, item.subject, item.id].some(value => String(value || '').toLowerCase().includes(query.trim().toLowerCase()))) && (status === 'all' || (status === 'active' ? item.isActive : !item.isActive)));
     const maxPage = Math.max(1, Math.ceil(filtered.length / 10));
     const currentPage = Math.min(page, maxPage);
     const displayed = filtered.slice((currentPage - 1) * 10, currentPage * 10);
     const disabled = loading || catalogLoading || !!catalogError || !selectedEventCode || !!busy;
     function field(key: 'templateName' | 'subject' | 'htmlBody' | 'plainBody', label: string, rows?: number) {
          const props = { id: 'notification-' + key, value: templateForm[key], required: true, onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => { setTemplateForm(previous => ({ ...previous, [key]: event.target.value })); setTemplatePreview(null); } };
          return <div className={ui.field}><label htmlFor={props.id}>{label} *</label>{rows ? <textarea {...props} rows={rows} spellCheck={key !== 'htmlBody'} /> : <input {...props} />}</div>;
     }
     function editTemplate(item: any) {
          setTemplateForm({ ...emptyTemplateForm, ...item }); setTemplatePreview(null); setPreviewFromTemplateId(null);
          editor.current?.scrollIntoView({ behavior: 'auto', block: 'start' });
          document.getElementById('notification-templateName')?.focus({ preventScroll: true });
     }
     return <main className={ui.workspace + ' ' + styles.workspace}>
          <PrimeToast />
          <header className={ui.header}><div className={ui.heading}><span className={ui.icon}><RiFileHistoryLine size={24} aria-hidden="true" /></span><div><span className={ui.eyebrow}>Notifications</span><h1>Notification templates</h1><p>Compose event templates, check placeholders, and review saved versions.</p></div></div><div className={ui.actions}><button className={ui.secondary} disabled={loading || !!busy} onClick={() => void refresh()}><RiRefreshLine size={18} aria-hidden="true" />Refresh</button><button className={ui.primary} disabled={disabled} onClick={() => { resetTemplateForm(); editor.current?.scrollIntoView({ block: 'start' }); }}><RiAddLine size={18} aria-hidden="true" />New template</button></div></header>
          {error && <div className={ui.error} role="alert">{error}<button className={ui.secondary} disabled={loading || !!busy} onClick={() => void refresh()}>Retry loading</button></div>}
          <section className={ui.panel} aria-labelledby="event-heading"><div className={ui.sectionTitle}><h2 id="event-heading">Choose an event</h2><span className={ui.badge}>{loading ? 'Loading...' : events.length + ' events'}</span></div><div className={ui.field}><label htmlFor="template-event">Notification event</label><select id="template-event" value={selectedEventCode} disabled={loading || !!busy} onChange={event => { setSelectedEventCode(event.target.value); setTemplateForm(emptyTemplateForm); setTemplatePreview(null); setPreviewFromTemplateId(null); setQuery(''); setStatus('all'); setPage(1); setCatalogLoading(true); }}><option value="">Select an event</option>{events.map(item => <option key={item.event_code} value={item.event_code}>{item.event_name || item.event_code} — {templates.filter(template => template.eventCode === item.event_code || Number(template.eventId) === Number(item.id)).length} saved</option>)}</select><p className={ui.help}>Templates and available placeholders belong to the selected event.</p></div>{!loading && !events.length && <p className={ui.help}>No notification events are available.</p>}</section>
          <div className={ui.stats} aria-label="Selected event overview">{[['Templates', visibleTemplates.length], ['Active templates', visibleTemplates.filter(item => item.isActive).length], ['Event variables', catalogVariables.length]].map(([label, count]) => <div className={ui.stat} key={label}><span className={ui.icon}><RiFileHistoryLine size={21} aria-hidden="true" /></span><div><strong>{loading || catalogLoading ? '-' : count}</strong><span>{label}</span></div></div>)}</div>
          <div className={ui.editorGrid} ref={editor}>
               <form className={ui.formSections} onSubmit={event => { event.preventDefault(); if (!disabled) void runAction('save', saveTemplate); }}>
                    <fieldset disabled={disabled} className={ui.formSections}>
                         <section className={ui.panel} aria-labelledby="template-heading"><div className={ui.sectionTitle}><h2 id="template-heading">{templateForm.id ? 'Edit template #' + templateForm.id : 'Create template'}</h2><span className={ui.badge}>{selectedEvent?.event_name || selectedEventCode || 'Select an event'}</span></div><div className={styles.contentFields}>{field('templateName', 'Template name')}{field('subject', 'Subject')}{field('htmlBody', 'HTML body', 8)}{field('plainBody', 'Plain text body', 5)}</div><div className={ui.choices}><label className={ui.choice}><input type="checkbox" checked={templateForm.isDefault} onChange={event => setTemplateForm(previous => ({ ...previous, isDefault: event.target.checked }))} /><div><strong>Default template</strong><span>Use as the default for this event.</span></div></label><label className={ui.choice}><input type="checkbox" checked={templateForm.isActive} onChange={event => setTemplateForm(previous => ({ ...previous, isActive: event.target.checked }))} /><div><strong>Active</strong><span>Make this template available for use.</span></div></label></div></section>
                         {!catalogLoading && !catalogError && selectedEventCode && <>
                              {variableWarnings.unknown.length > 0 && <div className={ui.error} role="alert">Unknown placeholders: {variableWarnings.unknown.map(value => '{{' + value + '}}').join(', ')}</div>}
                              {(variableWarnings.missingSystem.length > 0 || variableWarnings.missingRequired.length > 0) && <div className={ui.notice}><p>Required placeholders missing: {[...variableWarnings.missingSystem, ...variableWarnings.missingRequired].map(value => '{{' + value + '}}').join(', ')}. You will be prompted before saving.</p></div>}
                              {variableWarnings.missingOptional.length > 0 && <details className={ui.panel}><summary>Optional variables not used ({variableWarnings.missingOptional.length})</summary><p className={ui.help}>{variableWarnings.missingOptional.map(value => '{{' + value + '}}').join(', ')}</p></details>}
                         </>}
                         <div className={ui.saveBar}><p className={ui.help}>Preview renders the saved version with sample values.</p><div className={ui.actions}><button type="button" className={ui.secondary} disabled={!templateForm.id || disabled} onClick={() => void runAction('preview', () => previewTemplate())}><RiEyeLine size={18} aria-hidden="true" />Preview saved</button><button type="submit" className={ui.primary} disabled={disabled}><RiSaveLine size={18} aria-hidden="true" />{busy === 'save' ? 'Saving...' : 'Save template'}</button></div></div>
                    </fieldset>
               </form>
               <aside className={ui.formSections}>
                    <section className={ui.panel} aria-labelledby="variables-heading"><div className={ui.sectionTitle}><h2 id="variables-heading">Available placeholders</h2></div>{catalogLoading ? <p className={ui.help} role="status">Loading event variables...</p> : catalogError ? <div className={ui.error} role="alert">{catalogError}<button className={ui.secondary} onClick={() => setCatalogRetry(value => value + 1)}>Try again</button></div> : <><p className={ui.help}>Select a placeholder to append it to the HTML body. * marks required variables.</p><div className={styles.chips}>{[...catalogVariables, ...SYSTEM_REQUIRED.filter(name => !eventVariableNames.includes(name)).map(variable_name => ({ variable_name, is_required: true, description: 'Required system variable' }))].map(variable => <button type="button" className={ui.badge} disabled={disabled} key={variable.variable_name} title={variable.description || variable.variable_name} onClick={() => { setTemplateForm(previous => ({ ...previous, htmlBody: previous.htmlBody + '{{' + variable.variable_name + '}}' })); setTemplatePreview(null); }}>{'{{' + variable.variable_name + '}}'}{variable.is_required ? ' *' : ''}</button>)}</div></>}</section>
                    <section className={ui.panel} aria-labelledby="preview-heading"><div className={ui.sectionTitle}><h2 id="preview-heading">Saved template preview</h2>{templatePreview && <span className={ui.badge}>#{previewFromTemplateId}</span>}</div>{templatePreview ? <div className={styles.contentFields}><strong>{templatePreview.subject || 'No subject'}</strong><iframe title={'Rendered template ' + previewFromTemplateId} sandbox="" referrerPolicy="no-referrer" className={styles.preview} srcDoc={templatePreview.htmlBody || templatePreview.html_body || ''} /><pre className={styles.plainPreview}>{templatePreview.plainBody || templatePreview.plain_body || '-'}</pre></div> : <div className={ui.empty}><RiEyeLine size={28} aria-hidden="true" /><p>Save a template, then preview its rendered content with sample variable values.</p></div>}</section>
                    <section className={ui.panel}><h3>Template layout</h3><p className={ui.help}>Include a laboratory notification header and branch name, event details, and a footer with {'{{event_code}}'} and {'{{triggered_at}}'}.</p></section>
               </aside>
          </div>
          <section className={ui.panel + ' ' + styles.catalogue} aria-labelledby="saved-heading" aria-busy={loading}>
               <div className={styles.catalogueHeading}><h2 id="saved-heading">Saved templates</h2><span className={ui.badge}>{visibleTemplates.length} for this event</span></div><div className={styles.toolbar}><div className={ui.field}><label htmlFor="template-search">Search templates</label><input type="search" id="template-search" placeholder="Name, subject or template ID" value={query} onChange={event => { setQuery(event.target.value); setPage(1); }} /></div><div className={ui.field}><label htmlFor="template-status">Status</label><select id="template-status" value={status} onChange={event => { setStatus(event.target.value); setPage(1); }}><option value="all">All statuses</option><option value="active">Active</option><option value="inactive">Inactive</option></select></div></div>
               {loading ? <div className={ui.empty} role="status">Loading templates...</div> : !filtered.length ? <div className={ui.empty}><RiFileHistoryLine size={30} aria-hidden="true" /><h3>{visibleTemplates.length ? 'No matching templates' : error ? 'Templates unavailable' : 'No templates for this event'}</h3><p>{visibleTemplates.length ? 'Try another search or clear the filters.' : 'Select an event and create a template above.'}</p>{visibleTemplates.length > 0 && <button className={ui.secondary} onClick={() => { setQuery(''); setStatus('all'); setPage(1); }}>Clear filters</button>}</div> : <><div className={ui.tableWrap} tabIndex={0} role="region" aria-label="Saved notification templates"><table className={ui.table}><thead><tr><th scope="col">Template</th><th scope="col">Subject</th><th scope="col">Default</th><th scope="col">Status</th><th scope="col">Actions</th></tr></thead><tbody>{displayed.map(item => <tr key={item.id}><td><strong>{item.templateName}</strong><p>#{item.id} / {item.eventCode || selectedEventCode}</p></td><td>{item.subject}</td><td><span className={ui.badge + (item.isDefault ? ' ' + ui.active : '')}>{item.isDefault ? 'Default' : 'No'}</span></td><td><span className={ui.badge + (item.isActive ? ' ' + ui.active : '')}>{item.isActive ? 'Active' : 'Inactive'}</span></td><td><div className={ui.actions}><button className={ui.textButton} disabled={disabled} onClick={() => editTemplate(item)} aria-label={'Edit ' + item.templateName}>Edit</button><button className={ui.textButton} disabled={disabled} onClick={() => void runAction('preview', () => previewTemplate(item.id))} aria-label={'Preview ' + item.templateName}><RiEyeLine size={16} aria-hidden="true" />Preview</button><button className={ui.textButton} disabled={!!busy} onClick={() => void runAction('versions', () => loadTemplateVersions(item.id))} aria-label={'Version history for ' + item.templateName}><RiFileHistoryLine size={16} aria-hidden="true" />History</button><button className={ui.textButton + ' ' + styles.delete} disabled={!!busy} onClick={() => void runAction('delete', () => deleteTemplate(item))} aria-label={'Delete ' + item.templateName}>Delete</button></div></td></tr>)}</tbody></table></div><footer className={ui.footer}><span className={ui.muted} aria-live="polite">{(currentPage - 1) * 10 + 1}-{Math.min(currentPage * 10, filtered.length)} of {filtered.length} templates</span><nav className={ui.pager} aria-label="Template pages"><button className={ui.secondary} disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}>Previous</button><span>Page {currentPage} of {maxPage}</span><button className={ui.secondary} disabled={currentPage === maxPage} onClick={() => setPage(currentPage + 1)}>Next</button></nav></footer></>}
          </section>
               <Modal show={showVersionsModal} onHide={() => setShowVersionsModal(false)} size="lg">
                    <Modal.Header closeButton>
                         <Modal.Title className="d-flex align-items-center gap-2"><RiFileHistoryLine size={18} /> Template Version History</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                         {templateVersions.length === 0 ? (
                              <span className="text-muted">No versions found.</span>
                         ) : (
                              <div className="d-flex flex-column gap-2">
                                   {templateVersions.map((item, idx) => (
                                        <div key={`v-${idx}`} className="border rounded p-2">
                                             <div className="d-flex justify-content-between">
                                                  <strong>Version #{item.version_no || item.versionNo || idx + 1}</strong>
                                                  <span className="text-muted small">{item.created_at ? new Date(item.created_at).toLocaleString() : '-'}</span>
                                             </div>
                                             <div className="small"><strong>Subject:</strong> {item.subject || '-'}</div>
                                        </div>
                                   ))}
                              </div>
                         )}
                    </Modal.Body>
               </Modal>
     </main>;
}
