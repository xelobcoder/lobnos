'use client';

import React, { useState } from 'react';
import { Card, Row, Col, Button, Form, Table, Badge, Modal, Alert } from 'react-bootstrap';
import { RiFileListLine, RiSettings4Line, RiDeleteBinLine, RiEditLine, RiAddLine, RiSaveLine, RiCloseLine, RiArchiveLine } from '@remixicon/react';

export default function RecordsSettingsPage() {
     const [showModal, setShowModal] = useState(false);
     const [selectedRecordType, setSelectedRecordType] = useState('');
     const [retentionPeriod, setRetentionPeriod] = useState(365);
     const [autoArchive, setAutoArchive] = useState(true);

     const recordTypes = [
          { id: 'patient', name: 'Patient Records', description: 'Patient information and medical history', retention: 2555, autoArchive: true },
          { id: 'test_results', name: 'Test Results', description: 'Laboratory test results and reports', retention: 1825, autoArchive: true },
          { id: 'billing', name: 'Billing Records', description: 'Invoices, payments, and financial data', retention: 2555, autoArchive: true },
          { id: 'appointments', name: 'Appointments', description: 'Appointment scheduling and history', retention: 1095, autoArchive: true },
          { id: 'audit_logs', name: 'Audit Logs', description: 'System activity and user actions', retention: 365, autoArchive: false }
     ];

     const handleSaveSettings = () => {
          // Handle saving settings
          console.log('Saving settings:', { selectedRecordType, retentionPeriod, autoArchive });
          setShowModal(false);
     };

     return (
          <div className="container-fluid p-4">
               <div className="d-flex align-items-center justify-content-between mb-4">
                    <div>
                         <h2 className="mb-1">Records Settings</h2>
                         <p className="text-muted mb-0">Manage data retention, archiving, and record lifecycle settings</p>
                    </div>
                    <Button variant="primary" onClick={() => setShowModal(true)} className="d-flex align-items-center gap-2">
                         <RiAddLine size={16} />
                         Configure Settings
                    </Button>
               </div>

               <Row className="g-4">
                    <Col lg={8}>
                         <Card className="shadow-sm">
                              <Card.Header className="bg-white">
                                   <div className="d-flex align-items-center gap-2">
                                        <RiFileListLine size={20} className="text-primary" />
                                        <h5 className="mb-0">Record Types & Retention</h5>
                                   </div>
                              </Card.Header>
                              <Card.Body>
                                   <div className="table-responsive">
                                        <Table hover className="mb-0">
                                             <thead className="table-light">
                                                  <tr>
                                                       <th>Record Type</th>
                                                       <th>Description</th>
                                                       <th>Retention (Days)</th>
                                                       <th>Auto Archive</th>
                                                       <th>Actions</th>
                                                  </tr>
                                             </thead>
                                             <tbody>
                                                  {recordTypes.map((record) => (
                                                       <tr key={record.id}>
                                                            <td>
                                                                 <div className="fw-semibold">{record.name}</div>
                                                            </td>
                                                            <td className="text-muted small">{record.description}</td>
                                                            <td>
                                                                 <Badge bg="info" className="fs-6">{record.retention} days</Badge>
                                                            </td>
                                                            <td>
                                                                 <Badge bg={record.autoArchive ? 'success' : 'secondary'}>
                                                                      {record.autoArchive ? 'Enabled' : 'Disabled'}
                                                                 </Badge>
                                                            </td>
                                                            <td>
                                                                 <div className="d-flex gap-1">
                                                                      <Button
                                                                           variant="outline-primary"
                                                                           size="sm"
                                                                           onClick={() => {
                                                                                setSelectedRecordType(record.id);
                                                                                setRetentionPeriod(record.retention);
                                                                                setAutoArchive(record.autoArchive);
                                                                                setShowModal(true);
                                                                           }}
                                                                      >
                                                                           <RiEditLine size={14} />
                                                                      </Button>
                                                                 </div>
                                                            </td>
                                                       </tr>
                                                  ))}
                                             </tbody>
                                        </Table>
                                   </div>
                              </Card.Body>
                         </Card>
                    </Col>

                    <Col lg={4}>
                         <Card className="shadow-sm mb-4">
                              <Card.Header className="bg-white">
                                   <div className="d-flex align-items-center gap-2">
                                        <RiSettings4Line size={20} className="text-warning" />
                                        <h6 className="mb-0">Global Settings</h6>
                                   </div>
                              </Card.Header>
                              <Card.Body>
                                   <div className="mb-3">
                                        <Form.Label className="small fw-semibold">Default Retention Period</Form.Label>
                                        <Form.Select defaultValue="2555">
                                             <option value="365">1 Year (365 days)</option>
                                             <option value="1095">3 Years (1,095 days)</option>
                                             <option value="1825">5 Years (1,825 days)</option>
                                             <option value="2555">7 Years (2,555 days)</option>
                                             <option value="3650">10 Years (3,650 days)</option>
                                        </Form.Select>
                                   </div>

                                   <div className="mb-3">
                                        <Form.Check
                                             type="switch"
                                             id="auto-archive"
                                             label="Enable Auto Archiving"
                                             defaultChecked={true}
                                        />
                                   </div>

                                   <div className="mb-3">
                                        <Form.Check
                                             type="switch"
                                             id="audit-enabled"
                                             label="Enable Audit Logging"
                                             defaultChecked={true}
                                        />
                                   </div>

                                   <Button variant="outline-primary" size="sm" className="w-100">
                                        <RiSaveLine size={14} className="me-1" />
                                        Save Global Settings
                                   </Button>
                              </Card.Body>
                         </Card>

                         <Card className="shadow-sm">
                              <Card.Header className="bg-white">
                                   <div className="d-flex align-items-center gap-2">
                                        <RiArchiveLine size={20} className="text-info" />
                                        <h6 className="mb-0">Storage Information</h6>
                                   </div>
                              </Card.Header>
                              <Card.Body>
                                   <div className="text-center">
                                        <div className="mb-2">
                                             <span className="h4 text-primary mb-0">2.4 GB</span>
                                             <small className="text-muted d-block">Used Storage</small>
                                        </div>
                                        <div className="progress mb-2" style={{ height: '6px' }}>
                                             <div className="progress-bar bg-primary" style={{ width: '45%' }}></div>
                                        </div>
                                        <small className="text-muted">45% of 5 GB limit</small>
                                   </div>

                                   <hr />

                                   <div className="d-flex justify-content-between small">
                                        <span>Active Records:</span>
                                        <span className="fw-semibold">15,420</span>
                                   </div>
                                   <div className="d-flex justify-content-between small">
                                        <span>Archived Records:</span>
                                        <span className="fw-semibold">8,650</span>
                                   </div>
                                   <div className="d-flex justify-content-between small">
                                        <span>Deleted Records:</span>
                                        <span className="fw-semibold">2,180</span>
                                   </div>
                              </Card.Body>
                         </Card>
                    </Col>
               </Row>

               <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                    <Modal.Header closeButton>
                         <Modal.Title>Configure Record Settings</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                         <Form>
                              <Form.Group className="mb-3">
                                   <Form.Label>Record Type</Form.Label>
                                   <Form.Select
                                        value={selectedRecordType}
                                        onChange={(e) => setSelectedRecordType(e.target.value)}
                                   >
                                        <option value="">Select record type...</option>
                                        {recordTypes.map((record) => (
                                             <option key={record.id} value={record.id}>{record.name}</option>
                                        ))}
                                   </Form.Select>
                              </Form.Group>

                              <Form.Group className="mb-3">
                                   <Form.Label>Retention Period (Days)</Form.Label>
                                   <Form.Control
                                        type="number"
                                        value={retentionPeriod}
                                        onChange={(e) => setRetentionPeriod(Number(e.target.value))}
                                        min="30"
                                        max="3650"
                                   />
                                   <Form.Text className="text-muted">
                                        Records older than this period will be automatically archived
                                   </Form.Text>
                              </Form.Group>

                              <Form.Group className="mb-3">
                                   <Form.Check
                                        type="switch"
                                        id="auto-archive-modal"
                                        label="Enable Auto Archiving"
                                        checked={autoArchive}
                                        onChange={(e) => setAutoArchive(e.target.checked)}
                                   />
                              </Form.Group>
                         </Form>
                    </Modal.Body>
                    <Modal.Footer>
                         <Button variant="secondary" onClick={() => setShowModal(false)}>
                              <RiCloseLine size={14} className="me-1" />
                              Cancel
                         </Button>
                         <Button variant="primary" onClick={handleSaveSettings}>
                              <RiSaveLine size={14} className="me-1" />
                              Save Settings
                         </Button>
                    </Modal.Footer>
               </Modal>
          </div>
     );
}