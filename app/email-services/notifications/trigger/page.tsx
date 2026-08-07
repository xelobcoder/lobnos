'use client';

import React, { useEffect, useState } from 'react';
import { Alert, Button, Card, Col, Form, Row, Spinner } from 'react-bootstrap';
import { RiSendPlane2Line } from '@remixicon/react';
import { toast } from 'react-toastify';
import PrimeToast from '../../../../components/accessories/PrimeToast';
import { useApplication } from '../../../../components/Auth/useApplicationContext';
import { EventCatalogItem, loadSingleEventCatalog, loadEvents, triggerByReference } from '../_lib';

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

     const loadEventCatalog = async (eventCode: string) => {
          const item = await loadSingleEventCatalog(eventCode);
          setCatalog(item);
          setReferences({});
     };

     const refresh = async () => {
          setLoading(true);
          try {
               const eventsRows = await loadEvents();
               setEvents(eventsRows);
               if (!selectedEventCode && eventsRows.length > 0) {
                    setSelectedEventCode(eventsRows[0].event_code);
                    await loadEventCatalog(eventsRows[0].event_code);
               }
          } catch (err: any) {
               toast.error(err?.message || 'Failed to load events');
          } finally {
               setLoading(false);
          }
     };

     useEffect(() => {
          refresh();
     }, []);

     useEffect(() => {
          if (!selectedEventCode) return;
          loadEventCatalog(selectedEventCode).catch((err: any) =>
               toast.error(err?.message || 'Failed to load event catalog'),
          );
     }, [selectedEventCode]);

     const triggerNotification = async () => {
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
          } catch (_err) {
               toast.error('Context overrides must be valid JSON');
               return;
          }

          const refsPayload: Record<string, any> = {};
          for (const [key, val] of Object.entries(references)) {
               if (val.trim()) refsPayload[key] = isNaN(Number(val)) ? val : Number(val);
          }

          const toList = to.split(',').map((item) => item.trim()).filter(Boolean);
          const ccList = cc.split(',').map((item) => item.trim()).filter(Boolean);
          const bccList = bcc.split(',').map((item) => item.trim()).filter(Boolean);

          setSubmitting(true);
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
               setSubmitting(false);
          }
     };

     const requiredRefs = catalog?.requiredReferences || [];

     return (
          <div className="container-fluid px-3 py-3">
               <PrimeToast />
               <Card className="border rounded">
                    <Card.Header className="bg-body-tertiary d-flex justify-content-between align-items-center">
                         <strong>Manual Notification Trigger</strong>
                         <Button size="sm" variant="primary" disabled={submitting || loading} onClick={triggerNotification}>
                              <RiSendPlane2Line size={14} className="me-1" />
                              {submitting ? 'Triggering...' : 'Trigger'}
                         </Button>
                    </Card.Header>
                    <Card.Body>
                         {loading ? (
                              <div className="d-flex align-items-center gap-2"><Spinner size="sm" /> Loading trigger setup...</div>
                         ) : (
                              <Row className="g-3">
                                   <Col md={4}>
                                        <Form.Group>
                                             <Form.Label>Event</Form.Label>
                                             <Form.Select value={selectedEventCode} onChange={(e) => setSelectedEventCode(e.target.value)}>
                                                  <option value="">Select event</option>
                                                  {events.map((item) => <option key={item.event_code} value={item.event_code}>{item.event_name || item.event_code}</option>)}
                                             </Form.Select>
                                        </Form.Group>
                                   </Col>
                                   <Col md={4}>
                                        <Form.Group>
                                             <Form.Label>Priority</Form.Label>
                                             <Form.Select value={priority} onChange={(e) => setPriority(e.target.value)}>
                                                  <option value="low">low</option>
                                                  <option value="normal">normal</option>
                                                  <option value="high">high</option>
                                             </Form.Select>
                                        </Form.Group>
                                   </Col>

                                   {requiredRefs.length > 0 && (
                                        <Col md={12}>
                                             <div className="border rounded p-3 bg-body-tertiary">
                                                  <div className="fw-semibold small mb-2">Required References</div>
                                                  <Row className="g-2">
                                                       {requiredRefs.map((ref) => (
                                                            <Col key={ref} md={4}>
                                                                 <Form.Group>
                                                                      <Form.Label className="small mb-1">
                                                                           {REFERENCE_LABELS[ref] || ref}
                                                                           <span className="text-danger ms-1">*</span>
                                                                      </Form.Label>
                                                                      <Form.Control
                                                                           size="sm"
                                                                           type="number"
                                                                           placeholder={`Enter ${REFERENCE_LABELS[ref] || ref}`}
                                                                           value={references[ref] || ''}
                                                                           onChange={(e) => setReferences((prev) => ({ ...prev, [ref]: e.target.value }))}
                                                                      />
                                                                 </Form.Group>
                                                            </Col>
                                                       ))}
                                                  </Row>
                                             </div>
                                        </Col>
                                   )}

                                   <Col md={12}>
                                        <Form.Group>
                                             <Form.Label>To (comma separated)</Form.Label>
                                             <Form.Control value={to} onChange={(e) => setTo(e.target.value)} placeholder="Optional recipient override" />
                                        </Form.Group>
                                   </Col>
                                   <Col md={6}><Form.Group><Form.Label>CC</Form.Label><Form.Control value={cc} onChange={(e) => setCc(e.target.value)} /></Form.Group></Col>
                                   <Col md={6}><Form.Group><Form.Label>BCC</Form.Label><Form.Control value={bcc} onChange={(e) => setBcc(e.target.value)} /></Form.Group></Col>
                                   <Col md={12}>
                                        <Form.Group>
                                             <Form.Label>Context Overrides (JSON, optional)</Form.Label>
                                             <Form.Control
                                                  as="textarea"
                                                  rows={5}
                                                  value={contextJson}
                                                  onChange={(e) => setContextJson(e.target.value)}
                                                  placeholder={'{\n  "custom_note": "..."\n}'}
                                             />
                                             <Form.Text className="text-muted">Additional variables beyond resolved references.</Form.Text>
                                        </Form.Group>
                                   </Col>

                                   {triggerResult ? (
                                        <Col md={12}>
                                             <Alert variant={triggerResult.queued ? 'success' : 'info'} className="mb-0">
                                                  <div><strong>Queued:</strong> {String(Boolean(triggerResult.queued))}</div>
                                                  {triggerResult.notificationQueueId ? <div><strong>Notification Queue ID:</strong> {triggerResult.notificationQueueId}</div> : null}
                                                  {triggerResult.emailQueueId ? <div><strong>Email Queue ID:</strong> {triggerResult.emailQueueId}</div> : null}
                                                  {triggerResult.reason ? <div><strong>Reason:</strong> {triggerResult.reason}</div> : null}
                                             </Alert>
                                        </Col>
                                   ) : null}
                              </Row>
                         )}
                    </Card.Body>
               </Card>
          </div>
     );
}
