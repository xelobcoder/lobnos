'use client';

import React, { useState } from 'react';
import { Button, Form, Modal, Alert } from 'react-bootstrap';
import { RiShieldCheckLine, RiSettings4Line, RiSaveLine } from '@remixicon/react';

export default function ResultAccessibleSettingsPage() {
     const [showModal, setShowModal] = useState(false);
     const [selectedTestType, setSelectedTestType] = useState('');
     const [accessWindowHours, setAccessWindowHours] = useState(24);
     const [requireReApproval, setRequireReApproval] = useState(true);

     const testTypes = [
          {
               id: 'routine',
               name: 'Routine Tests',
               description: 'Standard blood work, urinalysis, etc.',
               accessWindow: 48,
               requireReApproval: true,
               approverRole: 'supervisor'
          },
          {
               id: 'specialized',
               name: 'Specialized Tests',
               description: 'Genetic testing, biopsies, advanced diagnostics',
               accessWindow: 72,
               requireReApproval: true,
               approverRole: 'manager'
          },
          {
               id: 'urgent',
               name: 'Urgent Results',
               description: 'Critical values, emergency results',
               accessWindow: 12,
               requireReApproval: true,
               approverRole: 'supervisor'
          },
          {
               id: 'confidential',
               name: 'Confidential Tests',
               description: 'STI testing, mental health screenings',
               accessWindow: 24,
               requireReApproval: true,
               approverRole: 'admin'
          }
     ];

     const approverRoles = [
          { id: 'supervisor', name: 'Lab Supervisor', description: 'Department supervisor approval' },
          { id: 'manager', name: 'Lab Manager', description: 'Laboratory manager approval' },
          { id: 'admin', name: 'Administrator', description: 'System administrator approval' }
     ];

     const handleSaveSettings = () => {
          console.log('Saving staff access settings:', {
               selectedTestType,
               accessWindowHours,
               requireReApproval
          });
          setShowModal(false);
     };

     return (
          <div className="container-fluid p-4">
               <div className="d-flex align-items-center justify-content-between mb-4">
                    <div>
                         <h2 className="mb-1">Staff Result Access Permissions</h2>
                         <p className="text-muted mb-0">Control staff access windows after initial result entry and approval</p>
                    </div>
                    <Button variant="primary" onClick={() => setShowModal(true)} className="d-flex align-items-center gap-2">
                         <RiSettings4Line size={16} />
                         Configure Permissions
                    </Button>
               </div>

               <Alert variant="warning" className="mb-4">
                    <div className="d-flex align-items-start gap-3">
                         <RiShieldCheckLine size={20} className="text-warning mt-1" />
                         <div>
                              <strong>Quality Control:</strong> These settings ensure result integrity by limiting
                              unauthorized access after initial approval. Changes affect laboratory workflows and compliance.
                         </div>
                    </div>
               </Alert>

               <div className="border bg-white border-secondary-subtle mx-2 p-2">
                    <form className="mx-4">
                         <div className="mb-3">
                              <Form.Label className="small fw-semibold">Default Access Window</Form.Label>
                              <Form.Select defaultValue="24">
                                   <option value="1">1 hour</option>
                                   <option value="4">4 hours</option>
                                   <option value="8">8 hours</option>
                                   <option value="12">12 hours</option>
                                   <option value="24">24 hours</option>
                                   <option value="48">48 hours</option>
                                   <option value="72">72 hours</option>
                              </Form.Select>
                         </div>

                         <div className="mb-3">
                              <Form.Label className="small fw-semibold">Default Approver Role</Form.Label>
                              <Form.Select defaultValue="supervisor">
                                   <option value="supervisor">Lab Supervisor</option>
                                   <option value="manager">Lab Manager</option>
                                   <option value="admin">Administrator</option>
                              </Form.Select>
                         </div>

                         <div className="mb-3">
                              <Form.Check
                                   type="switch"
                                   id="audit-edits"
                                   label="Audit All Edits"
                                   defaultChecked={true}
                              />
                         </div>

                         <Button variant="outline-primary" size="sm">
                              <RiSaveLine size={14} className="me-1" />
                              Save Defaults
                         </Button>
                    </form>
               </div>

               <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                    <Modal.Header closeButton>
                         <Modal.Title>Configure Staff Access Permissions</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                         <Form>
                              <Form.Group className="mb-3">
                                   <Form.Label>Test Type</Form.Label>
                                   <Form.Select
                                        value={selectedTestType}
                                        onChange={(e) => setSelectedTestType(e.target.value)}
                                   >
                                        <option value="">Select test type...</option>
                                        {testTypes.map((test) => (
                                             <option key={test.id} value={test.id}>{test.name}</option>
                                        ))}
                                   </Form.Select>
                              </Form.Group>

                              <Form.Group className="mb-3">
                                   <Form.Label>Access Window (Hours)</Form.Label>
                                   <Form.Control
                                        type="number"
                                        value={accessWindowHours}
                                        onChange={(e) => setAccessWindowHours(Number(e.target.value))}
                                        min="1"
                                        max="168"
                                   />
                                   <Form.Text className="text-muted">
                                        Hours from the first approval that staff can access and edit the result before needing subsequent approval from admin or manager
                                   </Form.Text>
                              </Form.Group>

                              <Form.Group className="mb-3">
                                   <Form.Check
                                        type="switch"
                                        id="require-reapproval-modal"
                                        label="Require Re-Approval After Window"
                                        checked={requireReApproval}
                                        onChange={(e) => setRequireReApproval(e.target.checked)}
                                   />
                                   <Form.Text className="text-muted">
                                        After the access window expires, changes require admin or manager approval
                                   </Form.Text>
                              </Form.Group>

                              <Form.Group className="mb-3">
                                   <Form.Label>Approver Role</Form.Label>
                                   <Form.Select defaultValue="supervisor">
                                        {approverRoles.map((role) => (
                                             <option key={role.id} value={role.id}>{role.name}</option>
                                        ))}
                                   </Form.Select>
                              </Form.Group>
                         </Form>
                    </Modal.Body>
                    <Modal.Footer>
                         <Button variant="secondary" onClick={() => setShowModal(false)}>
                              Cancel
                         </Button>
                         <Button variant="primary" onClick={handleSaveSettings}>
                              <RiSaveLine size={14} className="me-1" />
                              Save Permissions
                         </Button>
                    </Modal.Footer>
               </Modal>
          </div>
     );
}
