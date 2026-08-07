'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Badge, Button, Card, Col, Form, Modal, Row, Spinner } from 'react-bootstrap';
import { RiEyeLine, RiFileHistoryLine, RiSaveLine } from '@remixicon/react';
import { toast } from 'react-toastify';
import PrimeTable from '../../../../../components/accessories/Datatables/PrimeTable';
import PrimeToast from '../../../../../components/accessories/PrimeToast';
import { useApplication } from '../../../../../components/Auth/useApplicationContext';
import {
     callGet,
     callMutate,
     extractTemplateVariables,
     loadSingleEventCatalog,
     loadEvents,
     loadTemplates,
     parseList,
} from '../_lib';

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

     const [loading, setLoading] = useState(false);
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
               return code === selectedEventCode || (selectedEvent?.id && eventId === selectedEvent.id);
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
          setLoading(true);
          try {
               const [eventsRows, templatesRows] = await Promise.all([loadEvents(), loadTemplates()]);
               setEvents(eventsRows);
               setTemplates(templatesRows);
               const nextCode = selectedEventCode || eventsRows[0]?.event_code || '';
               setSelectedEventCode(nextCode);
               if (nextCode) {
                    const catalog = await loadSingleEventCatalog(nextCode);
                    setCatalogVariables(catalog?.variables || []);
                    catalogPrefillRef.current = catalog?.template || null;
               }
          } catch (err: any) {
               toast.error(err?.message || 'Failed to load templates module');
          } finally {
               setLoading(false);
          }
     };

     useEffect(() => {
          refresh();
     }, []);

     useEffect(() => {
          if (!selectedEventCode) return;
          loadSingleEventCatalog(selectedEventCode)
               .then((catalog) => {
                    setCatalogVariables(catalog?.variables || []);
                    catalogPrefillRef.current = catalog?.template || null;
               })
               .catch((err: any) => toast.error(err?.message || 'Failed to load variables'));
     }, [selectedEventCode]);

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

     const columns = [
          { Header: 'Name', accessor: 'templateName' },
          { Header: 'Event', accessor: 'eventCode' },
          { Header: 'Subject', accessor: 'subject' },
          { Header: 'Default', accessor: 'isDefault', Cell: ({ row }: any) => <Badge bg={row.original.isDefault ? 'success' : 'secondary'}>{row.original.isDefault ? 'Yes' : 'No'}</Badge> },
          { Header: 'Active', accessor: 'isActive', Cell: ({ row }: any) => <Badge bg={row.original.isActive ? 'success' : 'secondary'}>{row.original.isActive ? 'Yes' : 'No'}</Badge> },
          {
               Header: 'Actions',
               accessor: 'templateActions',
               Cell: ({ row }: any) => (
                    <div className="d-flex gap-1 flex-wrap">
                         <Button size="sm" variant="outline-primary" onClick={() => setTemplateForm({ ...row.original })}>Edit</Button>
                         <Button size="sm" variant="outline-secondary" onClick={() => previewTemplate(row.original.id)}><RiEyeLine size={14} /></Button>
                         <Button size="sm" variant="outline-dark" onClick={() => loadTemplateVersions(row.original.id)}><RiFileHistoryLine size={14} /></Button>
                         <Button size="sm" variant="outline-danger" onClick={() => deleteTemplate(row.original)}>Delete</Button>
                    </div>
               ),
          },
     ];

     return (
          <div className="container-fluid px-3 py-3 d-flex flex-column gap-3">
               <PrimeToast />

               <Card className="border rounded">
                    <Card.Header className="bg-body-tertiary d-flex justify-content-between align-items-center flex-wrap gap-2">
                         <strong>Notification Templates</strong>
                         <div className="d-flex gap-2">
                              <Button size="sm" variant="outline-secondary" onClick={resetTemplateForm}>New</Button>
                              <Button size="sm" variant="outline-primary" onClick={() => previewTemplate()}><RiEyeLine size={14} className="me-1" />Preview</Button>
                              <Button size="sm" variant="success" onClick={saveTemplate}><RiSaveLine size={14} className="me-1" />Save Template</Button>
                         </div>
                    </Card.Header>
                    <Card.Body>
                         {loading ? (
                              <div className="d-flex align-items-center gap-2"><Spinner size="sm" /> Loading templates...</div>
                         ) : (
                              <Row className="g-3">
                                   <Col lg={7}>
                                        <Row className="g-2">
                                             <Col md={4}><Form.Group><Form.Label>Event</Form.Label><Form.Select value={selectedEventCode} onChange={(e) => setSelectedEventCode(e.target.value)}><option value="">Select event</option>{events.map((item) => <option key={item.event_code} value={item.event_code}>{item.event_name || item.event_code}</option>)}</Form.Select></Form.Group></Col>
                                             <Col md={8}><Form.Group><Form.Label>Template Name</Form.Label><Form.Control value={templateForm.templateName} onChange={(e) => setTemplateForm((prev) => ({ ...prev, templateName: e.target.value }))} /></Form.Group></Col>
                                             <Col md={12}><Form.Group><Form.Label>Subject</Form.Label><Form.Control value={templateForm.subject} onChange={(e) => setTemplateForm((prev) => ({ ...prev, subject: e.target.value }))} /></Form.Group></Col>
                                             <Col md={12}><Form.Group><Form.Label>HTML Body</Form.Label><Form.Control as="textarea" rows={6} value={templateForm.htmlBody} onChange={(e) => setTemplateForm((prev) => ({ ...prev, htmlBody: e.target.value }))} /></Form.Group></Col>
                                             <Col md={12}><Form.Group><Form.Label>Plain Body</Form.Label><Form.Control as="textarea" rows={4} value={templateForm.plainBody} onChange={(e) => setTemplateForm((prev) => ({ ...prev, plainBody: e.target.value }))} /></Form.Group></Col>
                                             <Col md={12}><div className="d-flex gap-3"><Form.Check type="switch" id="templateIsDefault" label="Default" checked={templateForm.isDefault} onChange={(e) => setTemplateForm((prev) => ({ ...prev, isDefault: e.target.checked }))} /><Form.Check type="switch" id="templateIsActive" label="Active" checked={templateForm.isActive} onChange={(e) => setTemplateForm((prev) => ({ ...prev, isActive: e.target.checked }))} /></div></Col>
                                        </Row>

                                        {variableWarnings.unknown.length > 0 && (
                                             <Alert variant="danger" className="mt-2 mb-0 py-2">
                                                  Unknown placeholders (not in catalog): {variableWarnings.unknown.map((v) => `{{${v}}}`).join(', ')}
                                             </Alert>
                                        )}
                                        {(variableWarnings.missingSystem.length > 0 || variableWarnings.missingRequired.length > 0) && (
                                             <Alert variant="warning" className="mt-2 mb-0 py-2">
                                                  Required placeholders missing:{' '}
                                                  {[...variableWarnings.missingSystem, ...variableWarnings.missingRequired]
                                                       .map((v) => `{{${v}}}`)
                                                       .join(', ')}
                                                  {' \u2014 you will be prompted to confirm before saving.'}
                                             </Alert>
                                        )}
                                        {variableWarnings.missingOptional.length > 0 && (
                                             <Alert variant="info" className="mt-2 mb-0 py-2 small">
                                                  Optional event variables not used: {variableWarnings.missingOptional.map((v) => `{{${v}}}`).join(', ')}
                                             </Alert>
                                        )}
                                   </Col>

                                   <Col lg={5}>
                                        <Card className="border rounded">
                                             <Card.Header className="bg-body-tertiary"><strong>Preview</strong></Card.Header>
                                             <Card.Body>
                                                  {templatePreview ? (
                                                       <>
                                                            <div className="mb-2"><strong>Template ID:</strong> {previewFromTemplateId}</div>
                                                            <div className="mb-2"><strong>Subject:</strong> {templatePreview.subject || '-'}</div>
                                                            <div className="border rounded p-2 mb-2" dangerouslySetInnerHTML={{ __html: templatePreview.htmlBody || templatePreview.html_body || '' }} />
                                                            <pre className="border rounded p-2 bg-body-tertiary mb-0" style={{ whiteSpace: 'pre-wrap' }}>{templatePreview.plainBody || templatePreview.plain_body || '-'}</pre>
                                                       </>
                                                  ) : <span className="text-muted small">Use Preview to render with sample variable values.</span>}
                                             </Card.Body>
                                        </Card>

                                        {catalogVariables.length > 0 && (
                                             <div className="border rounded p-2 bg-body-tertiary mt-3">
                                                  <div className="small fw-bold mb-2">Available Variables</div>
                                                  <div className="d-flex flex-wrap gap-1">
                                                       {catalogVariables.map((v) => (
                                                            <Badge
                                                                 key={v.variable_name}
                                                                 bg={v.is_required ? 'primary' : 'secondary'}
                                                                 title={v.description || ''}
                                                                 style={{ cursor: 'pointer' }}
                                                                 onClick={() => setTemplateForm((prev) => ({ ...prev, htmlBody: prev.htmlBody + `{{${v.variable_name}}}` }))}
                                                            >
                                                                 {`{{${v.variable_name}}}`}{v.is_required ? ' *' : ''}
                                                            </Badge>
                                                       ))}
                                                  </div>
                                                  <div className="text-muted small mt-1">* = required · click to insert into HTML body</div>
                                             </div>
                                        )}

                                        <div className="border rounded p-2 mt-3" style={{ borderColor: 'var(--bs-warning-border-subtle)', backgroundColor: 'var(--bs-warning-bg-subtle)' }}>
                                             <div className="small fw-bold mb-1" style={{ color: 'var(--bs-warning-text-emphasis)' }}>Enterprise Layout Blocks</div>
                                             <div className="small" style={{ color: 'var(--bs-warning-text-emphasis)' }}>
                                                  <div className="mb-1">&#9679; <strong>Header</strong> — LABORATORY NOTIFICATION label &amp; branch name</div>
                                                  <div className="mb-1">&#9679; <strong>Details</strong> — event-specific data in list format</div>
                                                  <div>&#9679; <strong>Footer</strong> — <code>{'{{event_code}}'}</code> and <code>{'{{triggered_at}}'}</code> (required)</div>
                                             </div>
                                        </div>
                                   </Col>

                                   <Col md={12}><PrimeTable column={columns} data={visibleTemplates} filtering={true} handleSeverSideProcessing={() => { }} /></Col>
                              </Row>
                         )}
                    </Card.Body>
               </Card>

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
          </div>
     );
}
