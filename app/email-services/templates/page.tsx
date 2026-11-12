'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import ui from "../../../components/Billing/billing-strategy/StrategyWorkspace.module.css";
import { Alert, Badge, Button, Card, Col, Form, Modal, Row, Spinner } from 'react-bootstrap';
import { RiAddLine, RiDeleteBinLine, RiEyeLine, RiFileCopyLine, RiMailLine, RiRefreshLine, RiSaveLine } from '@remixicon/react';
import { toast } from 'react-toastify';

import { EmailTemplate, STATUS_OPTIONS, TEMPLATE_CATEGORIES, VARIABLE_CHIPS, callGet, callMutate, defaultTemplateForm, mapTemplateFromApi, parseList, statusBadge } from '../_lib';
import styles from '../email-standard.module.css';
import EmailPageHero from '../_components/EmailPageHero';
import PrimeTable from '../../../components/accessories/Datatables/PrimeTable';
import PrimeToast from '../../../components/accessories/PrimeToast';
import { useApplication } from '../../../components/Auth/useApplicationContext';

export default function EmailTemplatesPage() {
     const app = useApplication();
     const employeeid = Number(app?.user?.employeeid || 0);

     const [loading, setLoading] = useState(false);
     const [saving, setSaving] = useState(false);
     const saveLock = useRef(false);
     const [templates, setTemplates] = useState<EmailTemplate[]>([]);

     const [templateModalOpen, setTemplateModalOpen] = useState(false);
     const [templateModalMode, setTemplateModalMode] = useState<'create' | 'edit' | 'view'>('create');
     const [templateForm, setTemplateForm] = useState<EmailTemplate>(defaultTemplateForm);
     const [templateInitialSnapshot, setTemplateInitialSnapshot] = useState('');
     const [templatePreview, setTemplatePreview] = useState<any>(null);
     const [focusedField, setFocusedField] = useState<'subject' | 'htmlBody' | 'plainTextBody'>('subject');

     const isTemplateEditChanged = useMemo(() => {
          if (templateModalMode !== 'edit') return true;
          return JSON.stringify(templateForm) !== templateInitialSnapshot;
     }, [templateForm, templateInitialSnapshot, templateModalMode]);

     const loadTemplates = async () => {
          setLoading(true);
          try {
               const response = await callGet('email/templates');
               setTemplates(parseList<EmailTemplate>(response).map(mapTemplateFromApi));
          } catch (err: any) {
               toast.error(err?.message || 'Failed to load templates');
          } finally {
               setLoading(false);
          }
     };

     useEffect(() => {
          loadTemplates();
     }, []);

     const openTemplateModal = (mode: 'create' | 'edit' | 'view', item?: EmailTemplate) => {
          setTemplateModalMode(mode);
          setTemplatePreview(null);

          if (!item) {
               setTemplateForm({ ...defaultTemplateForm });
               setTemplateInitialSnapshot(JSON.stringify(defaultTemplateForm));
          } else {
               const mapped = mapTemplateFromApi(item);
               setTemplateForm({ ...mapped, variables: mapped.variables || [] });
               setTemplateInitialSnapshot(JSON.stringify({ ...mapped, variables: mapped.variables || [] }));
          }

          setTemplateModalOpen(true);
     };

     const openTemplateDuplicate = (item: EmailTemplate) => {
          const mapped = mapTemplateFromApi(item);
          const next = { ...mapped, id: undefined, name: `${mapped.name} (Copy)` } as EmailTemplate;
          setTemplateModalMode('create');
          setTemplateForm(next);
          setTemplateInitialSnapshot(JSON.stringify(next));
          setTemplatePreview(null);
          setTemplateModalOpen(true);
     };

     const saveTemplate = async () => {
          if (saveLock.current) return;
          if (!templateForm.name?.trim() || !templateForm.subject?.trim() || !templateForm.htmlBody?.trim()) {
               toast.error('Name, subject and HTML body are required');
               return;
          }

          const payload = {
               name: templateForm.name.trim(),
               category: templateForm.category,
               subject: templateForm.subject,
               htmlBody: templateForm.htmlBody,
               plainTextBody: templateForm.plainTextBody || '',
               variables: (templateForm.variables || []).filter(Boolean),
               status: templateForm.status || 'active',
               createdBy: employeeid || undefined,
               updatedBy: employeeid || undefined,
          };

          saveLock.current = true;
          setSaving(true);
          try {
               if (templateModalMode === 'create') {
                    await callMutate('email/templates', 'POST', payload);
                    toast.success('Template created');
               } else if (templateModalMode === 'edit' && templateForm.id) {
                    await callMutate(`email/templates/${templateForm.id}`, 'PUT', payload);
                    toast.success('Template updated');
               }
               setTemplateModalOpen(false);
               await loadTemplates();
          } catch (err: any) {
               toast.error(err?.message || 'Unable to save template');
          } finally {
               saveLock.current = false;
               setSaving(false);
          }
     };

     const deleteTemplate = async (item: EmailTemplate) => {
          if (!item.id) return;
          if (!window.confirm(`Delete template "${item.name}"?`)) return;
          try {
               await callMutate(`email/templates/${item.id}`, 'DELETE', {});
               toast.success('Template deleted');
               await loadTemplates();
          } catch (err: any) {
               toast.error(err?.message || 'Unable to delete template');
          }
     };

     const previewTemplate = async (item: EmailTemplate) => {
          if (!item.id) return;
          try {
               const response = await callMutate(`email/templates/${item.id}/preview`, 'POST', {
                    variables: { PatientName: 'John Doe', InvoiceNumber: 'INV-0092' },
               });
               if (!templateModalOpen) openTemplateModal('view', item);
               setTemplatePreview(response?.result || null);
          } catch (err: any) {
               toast.error(err?.message || 'Preview failed');
          }
     };

     const templateColumns = [
          { Header: 'Name', accessor: 'name' },
          { Header: 'Category', accessor: 'category', Cell: ({ row }: any) => <span className="text-capitalize">{row.original.category}</span> },
          { Header: 'Subject', accessor: 'subject' },
          { Header: 'Status', accessor: 'status', Cell: ({ row }: any) => <Badge bg={statusBadge(row.original.status)}>{row.original.status || 'unknown'}</Badge> },
          { Header: 'Created At', accessor: 'created_at', Cell: ({ row }: any) => row.original.created_at ? new Date(row.original.created_at).toLocaleString() : '-' },
          { Header: 'Updated At', accessor: 'updated_at', Cell: ({ row }: any) => row.original.updated_at ? new Date(row.original.updated_at).toLocaleString() : '-' },
          {
               Header: 'Actions',
               accessor: 'templateActions',
               Cell: ({ row }: any) => (
                    <div className="d-flex gap-1 flex-wrap">
                         <Button aria-label="View template" title="View template" size="sm" variant="outline-secondary" onClick={() => openTemplateModal('view', row.original)}><RiEyeLine size={14} /></Button>
                         <Button aria-label="Edit template" title="Edit template" size="sm" variant="outline-primary" onClick={() => openTemplateModal('edit', row.original)}><RiSaveLine size={14} /></Button>
                         <Button aria-label="Preview template" title="Preview template" size="sm" variant="outline-info" onClick={() => previewTemplate(row.original)}><RiMailLine size={14} /></Button>
                         <Button aria-label="Duplicate template" title="Duplicate template" size="sm" variant="outline-dark" onClick={() => openTemplateDuplicate(row.original)}><RiFileCopyLine size={14} /></Button>
                         <Button aria-label="Delete template" title="Delete template" size="sm" variant="outline-danger" onClick={() => deleteTemplate(row.original)}><RiDeleteBinLine size={14} /></Button>
                    </div>
               ),
          },
     ];

     return (
          <div className={`${ui.workspace} ${styles.pageRoot}`}>
               <PrimeToast />
               <EmailPageHero
                    title="Email Templates"
                    subtitle="Design reusable email content blocks with variable chips, previews, and controlled activation status."
                    icon={<RiMailLine size={16} />}
                    badge="Template Studio"
                    stats={[
                         { label: 'Templates', value: templates.length },
                         { label: 'Categories', value: TEMPLATE_CATEGORIES.length },
                         { label: 'Variables', value: VARIABLE_CHIPS.length },
                    ]}
               />
               <p>For automatic messages, open <a href="/email-services/notifications/templates">Notification templates</a>.</p>
               <Card className={styles.surfaceCard}>
                    <Card.Header className={`${styles.surfaceHeader} d-flex justify-content-between align-items-center`}>
                         <strong className={styles.surfaceTitle}>Reusable email templates</strong>
                         <div className={styles.headerActions}>
                              <Button size="sm" variant="outline-secondary" onClick={() => loadTemplates()}><RiRefreshLine size={14} /></Button>
                              <Button size="sm" variant="success" onClick={() => openTemplateModal('create')}><RiAddLine size={14} className="me-1" />New Template</Button>
                         </div>
                    </Card.Header>
                    <Card.Body>
                         {loading ? (
                              <div className="d-flex align-items-center gap-2"><Spinner size="sm" /> Loading templates...</div>
                         ) : (
                              <PrimeTable column={templateColumns} data={templates} filtering={true} handleSeverSideProcessing={() => { }} />
                         )}
                    </Card.Body>
               </Card>

               <Modal className={styles.dialog} show={templateModalOpen} onHide={() => { if (!saving) setTemplateModalOpen(false); }} size="xl" centered>
                    <Modal.Header closeButton={!saving}>
                         <Modal.Title className="text-capitalize">{templateModalMode} Template</Modal.Title>
                    </Modal.Header>
                    <Modal.Body><fieldset disabled={saving}>
                         <Row className="g-3">
                              <Col md={7}>
                                   <Form.Group className="mb-2">
                                        <Form.Label htmlFor="templates-setting-name">Name</Form.Label>
                                        <Form.Control id="templates-setting-name" disabled={templateModalMode === 'view'} value={templateForm.name || ''} onChange={(e) => setTemplateForm((prev) => ({ ...prev, name: e.target.value }))} maxLength={150} />
                                   </Form.Group>
                                   <Row className="g-2 mb-2">
                                        <Col md={6}>
                                             <Form.Group>
                                                  <Form.Label htmlFor="templates-setting-category">Category</Form.Label>
                                                  <Form.Select id="templates-setting-category" disabled={templateModalMode === 'view'} value={templateForm.category || ''} onChange={(e) => setTemplateForm((prev) => ({ ...prev, category: e.target.value }))}>
                                                       {TEMPLATE_CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                                                  </Form.Select>
                                             </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                             <Form.Group>
                                                  <Form.Label htmlFor="templates-setting-status">Status</Form.Label>
                                                  <Form.Select id="templates-setting-status" disabled={templateModalMode === 'view'} value={templateForm.status || 'active'} onChange={(e) => setTemplateForm((prev) => ({ ...prev, status: e.target.value }))}>
                                                       {STATUS_OPTIONS.map((status) => <option key={status} value={status}>{status}</option>)}
                                                  </Form.Select>
                                             </Form.Group>
                                        </Col>
                                   </Row>
                                   <Form.Group className="mb-2">
                                        <Form.Label htmlFor="templates-setting-subject">Subject</Form.Label>
                                        <Form.Control id="templates-setting-subject" disabled={templateModalMode === 'view'} value={templateForm.subject || ''} maxLength={255} onFocus={() => setFocusedField('subject')} onChange={(e) => setTemplateForm((prev) => ({ ...prev, subject: e.target.value }))} />
                                   </Form.Group>
                                   <Form.Group className="mb-2">
                                        <Form.Label htmlFor="templates-setting-html-body">HTML Body</Form.Label>
                                        <Form.Control id="templates-setting-html-body" disabled={templateModalMode === 'view'} as="textarea" rows={8} value={templateForm.htmlBody || ''} onFocus={() => setFocusedField('htmlBody')} onChange={(e) => setTemplateForm((prev) => ({ ...prev, htmlBody: e.target.value }))} />
                                   </Form.Group>
                                   <Form.Group className="mb-2">
                                        <Form.Label htmlFor="templates-setting-plain-text-body">Plain Text Body</Form.Label>
                                        <Form.Control id="templates-setting-plain-text-body" disabled={templateModalMode === 'view'} as="textarea" rows={4} value={templateForm.plainTextBody || ''} onFocus={() => setFocusedField('plainTextBody')} onChange={(e) => setTemplateForm((prev) => ({ ...prev, plainTextBody: e.target.value }))} />
                                   </Form.Group>
                                   <Form.Group>
                                        <Form.Label htmlFor="templates-setting-variables-comma-separated-">Variables (comma separated)</Form.Label>
                                        <Form.Control id="templates-setting-variables-comma-separated-" disabled={templateModalMode === 'view'} value={(templateForm.variables || []).join(', ')} onChange={(e) => setTemplateForm((prev) => ({ ...prev, variables: e.target.value.split(',').map((x) => x.trim()).filter(Boolean) }))} />
                                   </Form.Group>
                              </Col>
                              <Col md={5}>
                                   <Card className="border rounded h-100">
                                        <Card.Header className="bg-body-tertiary d-flex justify-content-between align-items-center">
                                             <strong>Preview & Variable Helper</strong>
                                             {templateForm.id ? <Button size="sm" variant="outline-secondary" onClick={() => previewTemplate(templateForm)}>Load API Preview</Button> : null}
                                        </Card.Header>
                                        <Card.Body>
                                             <p className="text-muted small mb-2">Click to insert into {focusedField}:</p>
                                             <div className="d-flex flex-wrap gap-2 mb-3">
                                                  {VARIABLE_CHIPS.map((chip) => (
                                                       <Button key={chip} size="sm" variant="outline-primary" onClick={() => setTemplateForm((prev) => ({ ...prev, [focusedField]: `${String(prev[focusedField] || '')}${chip}` }))}>
                                                            {chip}
                                                       </Button>
                                                  ))}
                                             </div>
                                             {templatePreview ? (
                                                  <>
                                                       <Alert variant="success" className="mb-2">Rendered Preview</Alert>
                                                       <div className="mb-2"><strong>Subject:</strong> {templatePreview.subject}</div>
                                                       <iframe title="Rendered email preview" sandbox="" referrerPolicy="no-referrer" className="w-100 border rounded mb-2" style={{height:300}} srcDoc={templatePreview.htmlBody || ''} />
                                                       <div className="border rounded p-2 bg-body-tertiary" style={{ whiteSpace: 'pre-wrap' }}>{templatePreview.plainTextBody || ''}</div>
                                                  </>
                                             ) : (
                                                  <>
                                                       <Alert variant="info" className="mb-2">Live Draft Preview</Alert>
                                                       <div className="mb-2"><strong>Subject:</strong> {templateForm.subject || '-'}</div>
                                                       <iframe title="Draft email preview" sandbox="" referrerPolicy="no-referrer" className="w-100 border rounded mb-2" style={{height:300}} srcDoc={templateForm.htmlBody || ''} />
                                                       <div className="border rounded p-2 bg-body-tertiary" style={{ whiteSpace: 'pre-wrap' }}>{templateForm.plainTextBody || '-'}</div>
                                                  </>
                                             )}
                                        </Card.Body>
                                   </Card>
                              </Col>
                         </Row>
                    </fieldset></Modal.Body>
                    <Modal.Footer>
                         <Button variant="secondary" disabled={saving} onClick={() => setTemplateModalOpen(false)}>Close</Button>
                         {templateModalMode !== 'view' && <Button variant="success" disabled={saving || !isTemplateEditChanged} onClick={saveTemplate}><RiSaveLine size={14} className="me-1" />Save</Button>}
                    </Modal.Footer>
               </Modal>
          </div>
     );
}
