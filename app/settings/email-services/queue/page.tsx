'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Badge, Button, Card, Col, Form, Modal, Row, Spinner } from 'react-bootstrap';
import { RiEyeLine, RiPlayCircleLine, RiRefreshLine, RiSendPlane2Line } from '@remixicon/react';
import { toast } from 'react-toastify';
import PrimeTable from '../../../../components/accessories/Datatables/PrimeTable';
import PrimeToast from '../../../../components/accessories/PrimeToast';
import { useApplication } from '../../../../components/Auth/useApplicationContext';
import { EmailProvider, EmailTemplate, QueueItem, PRIORITIES, QUEUE_STATUSES, callGet, callMutate, defaultQueueForm, mapProviderFromApi, mapTemplateFromApi, parseJsonArray, parseJsonObject, parseList, statusBadge } from '../_lib';

export default function EmailQueuePage() {
     const app = useApplication();
     const employeeid = Number(app?.user?.employeeid || 0);

     const [loading, setLoading] = useState(false);
     const [templates, setTemplates] = useState<EmailTemplate[]>([]);
     const [providers, setProviders] = useState<EmailProvider[]>([]);
     const [queueItems, setQueueItems] = useState<QueueItem[]>([]);

     const [queueForm, setQueueForm] = useState(defaultQueueForm);
     const [selectedQueueStatus, setSelectedQueueStatus] = useState('all');
     const [queueLimit, setQueueLimit] = useState(50);
     const [queuePayloadViewer, setQueuePayloadViewer] = useState<any>(null);

     const loadTemplates = async () => {
          const response = await callGet('email/templates');
          setTemplates(parseList<EmailTemplate>(response).map(mapTemplateFromApi));
     };

     const loadProviders = async () => {
          const response = await callGet('email/providers');
          setProviders(parseList<EmailProvider>(response).map(mapProviderFromApi));
     };

     const loadQueue = async () => {
          const response = await callGet(`email/queue?limit=${queueLimit}`);
          setQueueItems(parseList<QueueItem>(response));
     };

     const loadAll = async () => {
          setLoading(true);
          try {
               await Promise.all([loadTemplates(), loadProviders(), loadQueue()]);
          } catch (err: any) {
               toast.error(err?.message || 'Failed to load queue data');
          } finally {
               setLoading(false);
          }
     };

     useEffect(() => {
          loadAll();
     }, [queueLimit]);

     const filteredQueueItems = useMemo(() => {
          if (selectedQueueStatus === 'all') return queueItems;
          return queueItems.filter((item) => (item.status || '').toLowerCase() === selectedQueueStatus);
     }, [queueItems, selectedQueueStatus]);

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

          const payload: any = {
               templateId: queueForm.templateId ? Number(queueForm.templateId) : undefined,
               providerId: queueForm.providerId ? Number(queueForm.providerId) : undefined,
               to,
               cc,
               bcc,
               subject: queueForm.subject || undefined,
               htmlBody: queueForm.htmlBody || undefined,
               plainTextBody: queueForm.plainTextBody || undefined,
               variables: parseJsonObject(queueForm.variablesJson),
               attachments: parseJsonArray(queueForm.attachmentsJson),
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

     const queueColumns = [
          { Header: 'Queue ID', accessor: 'id' },
          { Header: 'Status', accessor: 'status', Cell: ({ row }: any) => <Badge bg={statusBadge(row.original.status)}>{row.original.status}</Badge> },
          { Header: 'Priority', accessor: 'priority', Cell: ({ row }: any) => <span className="text-capitalize">{row.original.priority || '-'}</span> },
          { Header: 'Subject', accessor: 'subject' },
          { Header: 'Recipients', accessor: 'to_json', Cell: ({ row }: any) => (parseJsonArray(row.original.to_json) as any[]).length || 0 },
          { Header: 'Scheduled At', accessor: 'scheduled_at', Cell: ({ row }: any) => row.original.scheduled_at ? new Date(row.original.scheduled_at).toLocaleString() : '-' },
          { Header: 'Retry', accessor: 'retry_count', Cell: ({ row }: any) => row.original.retry_count || 0 },
          { Header: 'Created At', accessor: 'created_at', Cell: ({ row }: any) => row.original.created_at ? new Date(row.original.created_at).toLocaleString() : '-' },
          {
               Header: 'Actions',
               accessor: 'queueActions',
               Cell: ({ row }: any) => (
                    <div className="d-flex gap-1 flex-wrap">
                         <Button size="sm" variant="outline-primary" onClick={() => processQueueItem(row.original)}><RiPlayCircleLine size={14} /></Button>
                         <Button size="sm" variant="outline-warning" onClick={() => retryQueueItem(row.original)}><RiRefreshLine size={14} /></Button>
                         <Button size="sm" variant="outline-secondary" onClick={() => setQueuePayloadViewer(row.original)}><RiEyeLine size={14} /></Button>
                    </div>
               ),
          },
     ];

     return (
          <div className="container-fluid px-3 py-3 d-flex flex-column gap-3">
               <PrimeToast />

               <Card className="border rounded">
                    <Card.Header className="bg-body-tertiary d-flex align-items-center gap-2">
                         <RiSendPlane2Line size={18} /> <strong>Queue New Email</strong>
                    </Card.Header>
                    <Card.Body>
                         {loading ? (
                              <div className="d-flex align-items-center gap-2"><Spinner size="sm" /> Loading queue options...</div>
                         ) : (
                              <Row className="g-3">
                                   <Col md={4}><Form.Group><Form.Label>Template</Form.Label><Form.Select value={queueForm.templateId} onChange={(e) => setQueueForm((prev) => ({ ...prev, templateId: e.target.value }))}><option value="">No template (direct body)</option>{templates.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}</Form.Select></Form.Group></Col>
                                   <Col md={4}><Form.Group><Form.Label>Provider</Form.Label><Form.Select value={queueForm.providerId} onChange={(e) => setQueueForm((prev) => ({ ...prev, providerId: e.target.value }))}><option value="">Use default provider</option>{providers.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</Form.Select></Form.Group></Col>
                                   <Col md={4}><Form.Group><Form.Label>Priority</Form.Label><Form.Select value={queueForm.priority} onChange={(e) => setQueueForm((prev) => ({ ...prev, priority: e.target.value }))}>{PRIORITIES.map((priority) => <option key={priority} value={priority}>{priority}</option>)}</Form.Select></Form.Group></Col>
                                   <Col md={12}><Form.Group><Form.Label>To (comma separated)</Form.Label><Form.Control value={queueForm.to} onChange={(e) => setQueueForm((prev) => ({ ...prev, to: e.target.value }))} placeholder="patient@example.com, other@example.com" /></Form.Group></Col>
                                   <Col md={6}><Form.Group><Form.Label>CC</Form.Label><Form.Control value={queueForm.cc} onChange={(e) => setQueueForm((prev) => ({ ...prev, cc: e.target.value }))} /></Form.Group></Col>
                                   <Col md={6}><Form.Group><Form.Label>BCC</Form.Label><Form.Control value={queueForm.bcc} onChange={(e) => setQueueForm((prev) => ({ ...prev, bcc: e.target.value }))} /></Form.Group></Col>
                                   <Col md={12}><Form.Group><Form.Label>Subject</Form.Label><Form.Control value={queueForm.subject} onChange={(e) => setQueueForm((prev) => ({ ...prev, subject: e.target.value }))} /></Form.Group></Col>
                                   <Col md={12}><Form.Group><Form.Label>HTML Body</Form.Label><Form.Control as="textarea" rows={4} value={queueForm.htmlBody} onChange={(e) => setQueueForm((prev) => ({ ...prev, htmlBody: e.target.value }))} /></Form.Group></Col>
                                   <Col md={12}><Form.Group><Form.Label>Plain Text Body</Form.Label><Form.Control as="textarea" rows={3} value={queueForm.plainTextBody} onChange={(e) => setQueueForm((prev) => ({ ...prev, plainTextBody: e.target.value }))} /></Form.Group></Col>
                                   <Col md={6}><Form.Group><Form.Label>Variables JSON</Form.Label><Form.Control as="textarea" rows={4} value={queueForm.variablesJson} onChange={(e) => setQueueForm((prev) => ({ ...prev, variablesJson: e.target.value }))} /></Form.Group></Col>
                                   <Col md={6}><Form.Group><Form.Label>Attachments JSON Array</Form.Label><Form.Control as="textarea" rows={4} value={queueForm.attachmentsJson} onChange={(e) => setQueueForm((prev) => ({ ...prev, attachmentsJson: e.target.value }))} /></Form.Group></Col>
                                   <Col md={4}><Form.Group><Form.Label>Schedule At</Form.Label><Form.Control type="datetime-local" value={queueForm.scheduledAt} onChange={(e) => setQueueForm((prev) => ({ ...prev, scheduledAt: e.target.value }))} /></Form.Group></Col>
                                   <Col md={4}><Form.Group><Form.Label>Reference Type</Form.Label><Form.Control value={queueForm.referenceType} onChange={(e) => setQueueForm((prev) => ({ ...prev, referenceType: e.target.value }))} /></Form.Group></Col>
                                   <Col md={4}><Form.Group><Form.Label>Reference ID</Form.Label><Form.Control value={queueForm.referenceId} onChange={(e) => setQueueForm((prev) => ({ ...prev, referenceId: e.target.value }))} /></Form.Group></Col>
                                   <Col md={12}><Button variant="success" onClick={queueEmail}><RiSendPlane2Line size={14} className="me-1" />Queue Email</Button></Col>
                              </Row>
                         )}
                    </Card.Body>
               </Card>

               <Card className="border rounded">
                    <Card.Header className="bg-body-tertiary d-flex justify-content-between align-items-center flex-wrap gap-2">
                         <strong>Queue Monitor</strong>
                         <div className="d-flex gap-2 align-items-center flex-wrap">
                              <Form.Select style={{ width: 120 }} value={queueLimit} onChange={(e) => setQueueLimit(Number(e.target.value))}>{[20, 50, 100].map((opt) => <option key={opt} value={opt}>{opt}</option>)}</Form.Select>
                              <Button size="sm" variant="outline-secondary" onClick={() => loadQueue()}><RiRefreshLine size={14} /></Button>
                              <Button size="sm" variant="outline-primary" onClick={processQueueBatch}><RiPlayCircleLine size={14} className="me-1" />Process Pending Emails</Button>
                         </div>
                    </Card.Header>
                    <Card.Body>
                         <div className="d-flex gap-2 flex-wrap mb-3">
                              <Button size="sm" variant={selectedQueueStatus === 'all' ? 'dark' : 'outline-dark'} onClick={() => setSelectedQueueStatus('all')}>all</Button>
                              {QUEUE_STATUSES.map((status) => <Button key={status} size="sm" variant={selectedQueueStatus === status ? 'dark' : 'outline-dark'} onClick={() => setSelectedQueueStatus(status)} className="text-capitalize">{status}</Button>)}
                         </div>
                         <PrimeTable column={queueColumns} data={filteredQueueItems} filtering={true} handleSeverSideProcessing={() => { }} />
                    </Card.Body>
               </Card>

               <Modal show={Boolean(queuePayloadViewer)} onHide={() => setQueuePayloadViewer(null)} size="lg">
                    <Modal.Header closeButton><Modal.Title>Queue Payload Viewer #{queuePayloadViewer?.id}</Modal.Title></Modal.Header>
                    <Modal.Body>
                         <pre className="bg-body-tertiary border rounded p-2 mb-0" style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(queuePayloadViewer || {}, null, 2)}</pre>
                    </Modal.Body>
               </Modal>
          </div>
     );
}
