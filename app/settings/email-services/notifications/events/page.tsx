'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Badge, Button, Card, Col, Form, Modal, Row, Spinner, Table } from 'react-bootstrap';
import { RiRefreshLine, RiSaveLine, RiSettings4Line, RiSyncLine } from '@remixicon/react';
import { toast } from 'react-toastify';
import PrimeToast from '../../../../../components/accessories/PrimeToast';
import {
     EventCatalogItem,
     EventSetting,
     EventVariableMeta,
     defaultEventSettings,
     loadEventSettings,
     loadSingleEventCatalog,
     loadEvents,
     loadTemplates,
     syncDefinitions,
     callMutate,
} from '../_lib';

export default function NotificationEventsPage() {
     const [loading, setLoading] = useState(false);
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
               return code === selectedEventCode || (selectedEvent?.id && eventId === selectedEvent.id);
          });
     }, [templates, selectedEventCode, selectedEvent]);

     const loadAll = async () => {
          setLoading(true);
          try {
               const [eventsRows, templateRows] = await Promise.all([loadEvents(), loadTemplates()]);
               setEvents(eventsRows);
               setTemplates(templateRows);
               const nextCode = selectedEventCode || eventsRows[0]?.event_code || '';
               setSelectedEventCode(nextCode);
               if (nextCode) {
                    const [catalog, settingsRow] = await Promise.all([
                         loadSingleEventCatalog(nextCode),
                         loadEventSettings(nextCode),
                    ]);
                    setCatalogItem(catalog);
                    setEventSettings(settingsRow);
               }
          } catch (err: any) {
               toast.error(err?.message || 'Failed to load notification events');
          } finally {
               setLoading(false);
          }
     };

     useEffect(() => {
          loadAll();
     }, []);

     useEffect(() => {
          if (!selectedEventCode) return;
          Promise.all([loadSingleEventCatalog(selectedEventCode), loadEventSettings(selectedEventCode)])
               .then(([catalog, settingsRow]) => {
                    setCatalogItem(catalog);
                    setEventSettings(settingsRow);
               })
               .catch((err: any) => {
                    toast.error(err?.message || 'Failed to load event details');
               });
     }, [selectedEventCode]);

     const runSync = async () => {
          setSyncing(true);
          try {
               const results = await syncDefinitions();
               setSyncResults(results);
               setShowSyncModal(true);
               toast.success('Sync completed');
               await loadAll();
          } catch (err: any) {
               toast.error(err?.message || 'Sync failed');
          } finally {
               setSyncing(false);
          }
     };

     const saveSettings = async () => {
          if (!selectedEventCode) return;
          setSavingSettings(true);
          try {
               await callMutate(`notifications/settings/${encodeURIComponent(selectedEventCode)}`, 'PUT', {
                    ...eventSettings,
                    defaultTemplateId: eventSettings.defaultTemplateId,
               });
               toast.success('Event settings updated');
          } catch (err: any) {
               toast.error(err?.message || 'Unable to update settings');
          } finally {
               setSavingSettings(false);
          }
     };

     return (
          <div className="container-fluid px-3 py-3">
               <PrimeToast />
               <Card className="border rounded">
                    <Card.Header className="bg-body-tertiary d-flex justify-content-between align-items-center flex-wrap gap-2">
                         <strong>Notification Events & Channels</strong>
                         <div className="d-flex gap-2">
                              <Button size="sm" variant="outline-primary" disabled={syncing} onClick={runSync}>
                                   <RiSyncLine size={14} className="me-1" />
                                   {syncing ? 'Syncing...' : 'Sync Definitions'}
                              </Button>
                              <Button size="sm" variant="outline-secondary" onClick={loadAll}>
                                   <RiRefreshLine size={14} />
                              </Button>
                         </div>
                    </Card.Header>
                    <Card.Body>
                         {loading ? (
                              <div className="d-flex align-items-center gap-2"><Spinner size="sm" /> Loading notification events...</div>
                         ) : (
                              <Row className="g-3">
                                   <Col md={4}>
                                        <Form.Group>
                                             <Form.Label>Event</Form.Label>
                                             <Form.Select value={selectedEventCode} onChange={(e) => setSelectedEventCode(e.target.value)}>
                                                  <option value="">Select event</option>
                                                  {events.map((item) => (
                                                       <option key={item.event_code} value={item.event_code}>
                                                            {item.event_name || item.event_code}
                                                       </option>
                                                  ))}
                                             </Form.Select>
                                        </Form.Group>

                                        <div className="mt-3 border rounded p-2 bg-body-tertiary">
                                             <div className="small text-muted mb-1">Event Variables</div>
                                             {catalogItem?.variables?.length ? (
                                                  <div className="d-flex flex-wrap gap-1">
                                                       {catalogItem.variables.map((v) => (
                                                            <Badge
                                                                 key={v.variable_name}
                                                                 bg={v.is_required ? 'primary' : 'secondary'}
                                                                 title={v.description || v.variable_type || ''}
                                                            >
                                                                 {`{{${v.variable_name}}}`}
                                                                 {v.is_required ? ' *' : ''}
                                                            </Badge>
                                                       ))}
                                                  </div>
                                             ) : (
                                                  <span className="text-muted small">No variables in catalog</span>
                                             )}
                                        </div>

                                        {catalogItem?.requiredReferences?.length ? (
                                             <div className="mt-2 border rounded p-2 bg-body-tertiary">
                                                  <div className="small text-muted mb-1">Required References</div>
                                                  <div className="d-flex flex-wrap gap-1">
                                                       {catalogItem.requiredReferences.map((ref) => (
                                                            <Badge key={ref} bg="warning" text="dark">{ref}</Badge>
                                                       ))}
                                                  </div>
                                             </div>
                                        ) : null}
                                   </Col>

                                   <Col md={8}>
                                        <div className="border rounded p-3">
                                             <h6 className="fw-bold mb-2 d-flex align-items-center gap-2"><RiSettings4Line size={16} /> Channel Settings</h6>
                                             <Row className="g-2">
                                                  <Col md={3}><Form.Check type="switch" id="emailEnabled" label="Email" checked={eventSettings.emailEnabled} onChange={(e) => setEventSettings((prev) => ({ ...prev, emailEnabled: e.target.checked }))} /></Col>
                                                  <Col md={3}><Form.Check type="switch" id="smsEnabled" label="SMS" checked={eventSettings.smsEnabled} onChange={(e) => setEventSettings((prev) => ({ ...prev, smsEnabled: e.target.checked }))} /></Col>
                                                  <Col md={3}><Form.Check type="switch" id="whatsappEnabled" label="WhatsApp" checked={eventSettings.whatsappEnabled} onChange={(e) => setEventSettings((prev) => ({ ...prev, whatsappEnabled: e.target.checked }))} /></Col>
                                                  <Col md={3}><Form.Check type="switch" id="inAppEnabled" label="In-app" checked={eventSettings.inAppEnabled} onChange={(e) => setEventSettings((prev) => ({ ...prev, inAppEnabled: e.target.checked }))} /></Col>

                                                  <Col md={8}>
                                                       <Form.Group>
                                                            <Form.Label>Default Template</Form.Label>
                                                            <Form.Select value={eventSettings.defaultTemplateId ?? ''} onChange={(e) => setEventSettings((prev) => ({ ...prev, defaultTemplateId: e.target.value ? Number(e.target.value) : null }))}>
                                                                 <option value="">Select template</option>
                                                                 {visibleTemplates.map((item: any) => (
                                                                      <option key={item.id} value={item.id}>{item.templateName}</option>
                                                                 ))}
                                                            </Form.Select>
                                                       </Form.Group>
                                                  </Col>

                                                  <Col md={12} className="pt-2">
                                                       <Button size="sm" variant="success" disabled={savingSettings || !selectedEventCode} onClick={saveSettings}>
                                                            <RiSaveLine size={14} className="me-1" />
                                                            {savingSettings ? 'Saving...' : 'Save Event Settings'}
                                                       </Button>
                                                  </Col>
                                             </Row>
                                        </div>
                                   </Col>
                              </Row>
                         )}
                    </Card.Body>
               </Card>

               <Modal show={showSyncModal} onHide={() => setShowSyncModal(false)} size="lg">
                    <Modal.Header closeButton>
                         <Modal.Title className="fs-6 fw-bold">Sync Definitions Result</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                         {syncResults.length === 0 ? (
                              <p className="text-muted mb-0">No changes were made. Definitions are already up to date.</p>
                         ) : (
                              <Table size="sm" bordered className="small mb-0">
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
          </div>
     );
}
