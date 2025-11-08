'use client';

import React, { useState, useEffect } from 'react';
import { Button, Form, Modal, Row, Col, Card, Table, Badge, Alert, Tabs, Tab, InputGroup, ListGroup } from 'react-bootstrap';
import { customFetch, customPost } from '../../../components/Auth/customFetch';
import {
     RiAddLine,
     RiUploadLine,
     RiDownloadLine,
     RiTestTubeLine,
     RiTimeLine,
     RiUserLine,
     RiAlertLine,
     RiCheckLine,
     RiEditLine,
     RiDeleteBinLine,
     RiEyeLine,
     RiRefreshLine,
     RiNotificationLine,
     RiShieldCheckLine,
     RiCloseCircleLine,
     RiMailLine,
     RiPhoneLine
} from '@remixicon/react';
import type { Sample, Rejection, Recall, QualityControlIssue, DUMMY_SAMPLES, DUMMY_REJECTIONS, DUMMY_RECALLS } from '../types';

export default function QualityControl() {
     const [samples, setSamples] = useState<Sample[]>([]);
     const [rejections, setRejections] = useState<Rejection[]>([]);
     const [recalls, setRecalls] = useState<Recall[]>([]);
     const [qualityIssues, setQualityIssues] = useState<QualityControlIssue[]>([]);
     const [showRejectionModal, setShowRejectionModal] = useState(false);
     const [showRecallModal, setShowRecallModal] = useState(false);
     const [showIssueModal, setShowIssueModal] = useState(false);
     const [loading, setLoading] = useState(true);
     const [searchTerm, setSearchTerm] = useState('');

     // Rejection form state
     const [rejectionForm, setRejectionForm] = useState({
          sampleId: '',
          reason: '',
          severity: 'minor',
          reportedBy: '',
          correctiveAction: '',
          notes: '',
          requiresRecall: false
     });

     // Recall form state
     const [recallForm, setRecallForm] = useState({
          sampleId: '',
          reason: '',
          severity: 'moderate',
          affectedSamples: [] as string[],
          initiatedBy: '',
          correctiveAction: '',
          communicationPlan: '',
          status: 'initiated'
     });

     // Quality issue form state
     const [issueForm, setIssueForm] = useState({
          sampleId: '',
          issueType: '',
          description: '',
          severity: 'low',
          reportedBy: '',
          assignedTo: '',
          status: 'open',
          dueDate: ''
     });

     useEffect(() => {
          fetchData();
     }, []);

     const fetchData = async () => {
          try {
               setLoading(true);
               await Promise.all([
                    fetchSamples(),
                    fetchRejections(),
                    fetchRecalls(),
                    fetchQualityIssues()
               ]);
          } catch (error) {
               console.error('Error fetching data:', error);
          } finally {
               setLoading(false);
          }
     };

     const fetchSamples = async () => {
          try {
               // Use dummy data instead of API call
               setTimeout(() => {
                    setSamples(DUMMY_SAMPLES);
               }, 300); // Simulate API delay
          } catch (error) {
               console.error('Error fetching samples:', error);
          }
     };

     const fetchRejections = async () => {
          try {
               // Use dummy data instead of API call
               setTimeout(() => {
                    setRejections(DUMMY_REJECTIONS);
               }, 200); // Simulate API delay
          } catch (error) {
               console.error('Error fetching rejections:', error);
               setRejections([]);
          }
     };

     const fetchRecalls = async () => {
          try {
               // Use dummy data instead of API call
               setTimeout(() => {
                    setRecalls(DUMMY_RECALLS);
               }, 250); // Simulate API delay
          } catch (error) {
               console.error('Error fetching recalls:', error);
               setRecalls([]);
          }
     };

     const fetchQualityIssues = async () => {
          try {
               // Use dummy data instead of API call - start with empty array since we don't have dummy quality issues
               setTimeout(() => {
                    setQualityIssues([]);
               }, 200); // Simulate API delay
          } catch (error) {
               console.error('Error fetching quality issues:', error);
               setQualityIssues([]);
          }
     };

     const handleCreateRejection = async () => {
          try {
               const rejectionData = {
                    ...rejectionForm,
                    timestamp: new Date().toISOString(),
                    status: 'active'
               };

               const response = await customPost('rejections', rejectionData, 'POST');
               if (response) {
                    alert('Sample rejection recorded successfully');
                    fetchRejections();
                    fetchSamples();
                    setShowRejectionModal(false);
                    resetRejectionForm();

                    // If recall is required, show recall modal
                    if (rejectionForm.requiresRecall) {
                         setRecallForm(prev => ({
                              ...prev,
                              sampleId: rejectionForm.sampleId,
                              reason: `Follow-up to rejection: ${rejectionForm.reason}`
                         }));
                         setShowRecallModal(true);
                    }
               }
          } catch (error) {
               console.error('Error creating rejection:', error);
               alert('Failed to record rejection');
          }
     };

     const handleCreateRecall = async () => {
          try {
               const recallData = {
                    ...recallForm,
                    initiatedAt: new Date().toISOString(),
                    status: 'initiated'
               };

               const response = await customPost('recalls', recallData, 'POST');
               if (response) {
                    alert('Recall initiated successfully');
                    fetchRecalls();
                    setShowRecallModal(false);
                    resetRecallForm();
               }
          } catch (error) {
               console.error('Error creating recall:', error);
               alert('Failed to initiate recall');
          }
     };

     const handleCreateIssue = async () => {
          try {
               const issueData = {
                    ...issueForm,
                    reportedAt: new Date().toISOString(),
                    status: 'open'
               };

               const response = await customPost('quality-issues', issueData, 'POST');
               if (response) {
                    alert('Quality issue reported successfully');
                    fetchQualityIssues();
                    setShowIssueModal(false);
                    resetIssueForm();
               }
          } catch (error) {
               console.error('Error creating quality issue:', error);
               alert('Failed to report quality issue');
          }
     };

     const resetRejectionForm = () => {
          setRejectionForm({
               sampleId: '',
               reason: '',
               severity: 'minor',
               reportedBy: '',
               correctiveAction: '',
               notes: '',
               requiresRecall: false
          });
     };

     const resetRecallForm = () => {
          setRecallForm({
               sampleId: '',
               reason: '',
               severity: 'moderate',
               affectedSamples: [],
               initiatedBy: '',
               correctiveAction: '',
               communicationPlan: '',
               status: 'initiated'
          });
     };

     const resetIssueForm = () => {
          setIssueForm({
               sampleId: '',
               issueType: '',
               description: '',
               severity: 'low',
               reportedBy: '',
               assignedTo: '',
               status: 'open',
               dueDate: ''
          });
     };

     const getSampleById = (id: string): Sample | undefined => {
          return samples.find(s => s.id === id);
     };

     const getSeverityBadgeVariant = (severity: string) => {
          switch (severity) {
               case 'critical': return 'danger';
               case 'high': return 'warning';
               case 'moderate': return 'info';
               case 'minor': return 'secondary';
               case 'low': return 'light';
               default: return 'secondary';
          }
     };

     const getStatusBadgeVariant = (status: string) => {
          switch (status) {
               case 'completed': return 'success';
               case 'in_progress': return 'primary';
               case 'initiated': return 'info';
               case 'cancelled': return 'secondary';
               case 'open': return 'warning';
               case 'closed': return 'success';
               default: return 'secondary';
          }
     };

     const formatDateTime = (date: string) => {
          return new Date(date).toLocaleString();
     };

     if (loading) {
          return (
               <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                         <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-2">Loading quality control data...</p>
               </div>
          );
     }

     return (
          <div className="container-fluid p-4">
               <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                         <h3 className="mb-1">Quality Control</h3>
                         <p className="text-muted mb-0">Manage sample rejections, recalls, and quality issues</p>
                    </div>
                    <div className="d-flex gap-2">
                         <Button variant="outline-primary" onClick={fetchData}>
                              <RiRefreshLine size={16} className="me-2" />
                              Refresh
                         </Button>
                         <Button variant="outline-warning" onClick={() => setShowIssueModal(true)}>
                              <RiAlertLine size={16} className="me-2" />
                              Report Issue
                         </Button>
                    </div>
               </div>

               {/* Quality Control Overview */}
               <Row className="g-4 mb-4">
                    <Col md={3}>
                         <Card className="text-center">
                              <Card.Body>
                                   <RiCloseCircleLine size={32} className="text-danger mb-2" />
                                   <h4 className="text-danger">{rejections.length}</h4>
                                   <p className="text-muted mb-0">Sample Rejections</p>
                              </Card.Body>
                         </Card>
                    </Col>
                    <Col md={3}>
                         <Card className="text-center">
                              <Card.Body>
                                   <RiNotificationLine size={32} className="text-warning mb-2" />
                                   <h4 className="text-warning">{recalls.length}</h4>
                                   <p className="text-muted mb-0">Active Recalls</p>
                              </Card.Body>
                         </Card>
                    </Col>
                    <Col md={3}>
                         <Card className="text-center">
                              <Card.Body>
                                   <RiAlertLine size={32} className="text-info mb-2" />
                                   <h4 className="text-info">{qualityIssues.length}</h4>
                                   <p className="text-muted mb-0">Quality Issues</p>
                              </Card.Body>
                         </Card>
                    </Col>
                    <Col md={3}>
                         <Card className="text-center">
                              <Card.Body>
                                   <RiShieldCheckLine size={32} className="text-success mb-2" />
                                   <h4 className="text-success">
                                        {qualityIssues.filter(i => i.status === 'closed').length}
                                   </h4>
                                   <p className="text-muted mb-0">Resolved Issues</p>
                              </Card.Body>
                         </Card>
                    </Col>
               </Row>

               {/* Quality Control Tabs */}
               <Tabs defaultActiveKey="rejections" className="mb-4">
                    <Tab eventKey="rejections" title="Sample Rejections">
                         <Card>
                              <Card.Header>
                                   <div className="d-flex justify-content-between align-items-center">
                                        <h5 className="mb-0">Sample Rejections</h5>
                                        <Button variant="outline-danger" onClick={() => setShowRejectionModal(true)}>
                                             <RiAddLine size={16} className="me-2" />
                                             Record Rejection
                                        </Button>
                                   </div>
                              </Card.Header>
                              <Card.Body>
                                   <div className="table-responsive">
                                        <Table striped hover>
                                             <thead>
                                                  <tr>
                                                       <th>Sample</th>
                                                       <th>Reason</th>
                                                       <th>Severity</th>
                                                       <th>Reported By</th>
                                                       <th>Date</th>
                                                       <th>Status</th>
                                                       <th>Actions</th>
                                                  </tr>
                                             </thead>
                                             <tbody>
                                                  {rejections.map((rejection) => {
                                                       const sample = getSampleById(rejection.sampleId);
                                                       return (
                                                            <tr key={rejection.id}>
                                                                 <td>
                                                                      {sample ? (
                                                                           <div>
                                                                                <div className="fw-semibold">{sample.barcode}</div>
                                                                                <small className="text-muted">{sample.patientName}</small>
                                                                           </div>
                                                                      ) : (
                                                                           <span className="text-muted">Unknown Sample</span>
                                                                      )}
                                                                 </td>
                                                                 <td>{rejection.reason}</td>
                                                                 <td>
                                                                      <Badge bg={getSeverityBadgeVariant(rejection.severity)}>
                                                                           {rejection.severity}
                                                                      </Badge>
                                                                 </td>
                                                                 <td>{rejection.reportedBy}</td>
                                                                 <td>{formatDateTime(rejection.timestamp)}</td>
                                                                 <td>
                                                                      <Badge bg={getStatusBadgeVariant(rejection.status)}>
                                                                           {rejection.status}
                                                                      </Badge>
                                                                 </td>
                                                                 <td>
                                                                      <Button variant="outline-info" size="sm">
                                                                           <RiEyeLine size={14} />
                                                                      </Button>
                                                                 </td>
                                                            </tr>
                                                       );
                                                  })}
                                             </tbody>
                                        </Table>
                                   </div>

                                   {rejections.length === 0 && (
                                        <div className="text-center py-4">
                                             <RiCloseCircleLine size={48} className="text-muted mb-3" />
                                             <h5 className="text-muted">No Rejections</h5>
                                             <p className="text-muted">No sample rejections have been recorded.</p>
                                        </div>
                                   )}
                              </Card.Body>
                         </Card>
                    </Tab>

                    <Tab eventKey="recalls" title="Recalls">
                         <Card>
                              <Card.Header>
                                   <div className="d-flex justify-content-between align-items-center">
                                        <h5 className="mb-0">Sample Recalls</h5>
                                        <Button variant="outline-warning" onClick={() => setShowRecallModal(true)}>
                                             <RiAddLine size={16} className="me-2" />
                                             Initiate Recall
                                        </Button>
                                   </div>
                              </Card.Header>
                              <Card.Body>
                                   <div className="table-responsive">
                                        <Table striped hover>
                                             <thead>
                                                  <tr>
                                                       <th>Reason</th>
                                                       <th>Severity</th>
                                                       <th>Affected Samples</th>
                                                       <th>Initiated By</th>
                                                       <th>Date</th>
                                                       <th>Status</th>
                                                       <th>Actions</th>
                                                  </tr>
                                             </thead>
                                             <tbody>
                                                  {recalls.map((recall) => (
                                                       <tr key={recall.id}>
                                                            <td>{recall.reason}</td>
                                                            <td>
                                                                 <Badge bg={getSeverityBadgeVariant(recall.severity)}>
                                                                      {recall.severity}
                                                                 </Badge>
                                                            </td>
                                                            <td>{recall.affectedSamples.length} samples</td>
                                                            <td>{recall.initiatedBy}</td>
                                                            <td>{formatDateTime(recall.initiatedAt)}</td>
                                                            <td>
                                                                 <Badge bg={getStatusBadgeVariant(recall.status)}>
                                                                      {recall.status}
                                                                 </Badge>
                                                            </td>
                                                            <td>
                                                                 <Button variant="outline-info" size="sm">
                                                                      <RiEyeLine size={14} />
                                                                 </Button>
                                                            </td>
                                                       </tr>
                                                  ))}
                                             </tbody>
                                        </Table>
                                   </div>

                                   {recalls.length === 0 && (
                                        <div className="text-center py-4">
                                             <RiNotificationLine size={48} className="text-muted mb-3" />
                                             <h5 className="text-muted">No Recalls</h5>
                                             <p className="text-muted">No recalls have been initiated.</p>
                                        </div>
                                   )}
                              </Card.Body>
                         </Card>
                    </Tab>

                    <Tab eventKey="issues" title="Quality Issues">
                         <Card>
                              <Card.Header>
                                   <div className="d-flex justify-content-between align-items-center">
                                        <h5 className="mb-0">Quality Issues</h5>
                                        <Button variant="outline-info" onClick={() => setShowIssueModal(true)}>
                                             <RiAddLine size={16} className="me-2" />
                                             Report Issue
                                        </Button>
                                   </div>
                              </Card.Header>
                              <Card.Body>
                                   <div className="table-responsive">
                                        <Table striped hover>
                                             <thead>
                                                  <tr>
                                                       <th>Issue Type</th>
                                                       <th>Description</th>
                                                       <th>Sample</th>
                                                       <th>Severity</th>
                                                       <th>Status</th>
                                                       <th>Assigned To</th>
                                                       <th>Due Date</th>
                                                       <th>Actions</th>
                                                  </tr>
                                             </thead>
                                             <tbody>
                                                  {qualityIssues.map((issue) => {
                                                       const sample = getSampleById(issue.sampleId);
                                                       return (
                                                            <tr key={issue.id}>
                                                                 <td>{issue.issueType}</td>
                                                                 <td>{issue.description}</td>
                                                                 <td>
                                                                      {sample ? (
                                                                           <div>
                                                                                <div className="fw-semibold">{sample.barcode}</div>
                                                                                <small className="text-muted">{sample.patientName}</small>
                                                                           </div>
                                                                      ) : (
                                                                           <span className="text-muted">N/A</span>
                                                                      )}
                                                                 </td>
                                                                 <td>
                                                                      <Badge bg={getSeverityBadgeVariant(issue.severity)}>
                                                                           {issue.severity}
                                                                      </Badge>
                                                                 </td>
                                                                 <td>
                                                                      <Badge bg={getStatusBadgeVariant(issue.status)}>
                                                                           {issue.status}
                                                                      </Badge>
                                                                 </td>
                                                                 <td>{issue.assignedTo}</td>
                                                                 <td>{issue.dueDate ? new Date(issue.dueDate).toLocaleDateString() : 'N/A'}</td>
                                                                 <td>
                                                                      <Button variant="outline-info" size="sm">
                                                                           <RiEyeLine size={14} />
                                                                      </Button>
                                                                 </td>
                                                            </tr>
                                                       );
                                                  })}
                                             </tbody>
                                        </Table>
                                   </div>

                                   {qualityIssues.length === 0 && (
                                        <div className="text-center py-4">
                                             <RiAlertLine size={48} className="text-muted mb-3" />
                                             <h5 className="text-muted">No Quality Issues</h5>
                                             <p className="text-muted">No quality issues have been reported.</p>
                                        </div>
                                   )}
                              </Card.Body>
                         </Card>
                    </Tab>
               </Tabs>

               {/* Record Rejection Modal */}
               <Modal show={showRejectionModal} onHide={() => setShowRejectionModal(false)} size="lg">
                    <Modal.Header closeButton>
                         <Modal.Title>Record Sample Rejection</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                         <Form>
                              <Row className="mb-3">
                                   <Col md={6}>
                                        <Form.Group>
                                             <Form.Label>Sample</Form.Label>
                                             <Form.Select
                                                  value={rejectionForm.sampleId}
                                                  onChange={(e) => setRejectionForm(prev => ({ ...prev, sampleId: e.target.value }))}
                                             >
                                                  <option value="">Select sample...</option>
                                                  {samples.map((sample) => (
                                                       <option key={sample.id} value={sample.id}>
                                                            {sample.barcode} - {sample.patientName}
                                                       </option>
                                                  ))}
                                             </Form.Select>
                                        </Form.Group>
                                   </Col>
                                   <Col md={6}>
                                        <Form.Group>
                                             <Form.Label>Severity</Form.Label>
                                             <Form.Select
                                                  value={rejectionForm.severity}
                                                  onChange={(e) => setRejectionForm(prev => ({ ...prev, severity: e.target.value }))}
                                             >
                                                  <option value="minor">Minor</option>
                                                  <option value="moderate">Moderate</option>
                                                  <option value="high">High</option>
                                                  <option value="critical">Critical</option>
                                             </Form.Select>
                                        </Form.Group>
                                   </Col>
                              </Row>

                              <Form.Group className="mb-3">
                                   <Form.Label>Reason for Rejection</Form.Label>
                                   <Form.Control
                                        as="textarea"
                                        rows={3}
                                        value={rejectionForm.reason}
                                        onChange={(e) => setRejectionForm(prev => ({ ...prev, reason: e.target.value }))}
                                        placeholder="Describe the reason for rejecting this sample"
                                   />
                              </Form.Group>

                              <Row className="mb-3">
                                   <Col md={6}>
                                        <Form.Group>
                                             <Form.Label>Reported By</Form.Label>
                                             <Form.Control
                                                  type="text"
                                                  value={rejectionForm.reportedBy}
                                                  onChange={(e) => setRejectionForm(prev => ({ ...prev, reportedBy: e.target.value }))}
                                                  placeholder="Enter your name"
                                             />
                                        </Form.Group>
                                   </Col>
                              </Row>

                              <Form.Group className="mb-3">
                                   <Form.Label>Corrective Action</Form.Label>
                                   <Form.Control
                                        as="textarea"
                                        rows={2}
                                        value={rejectionForm.correctiveAction}
                                        onChange={(e) => setRejectionForm(prev => ({ ...prev, correctiveAction: e.target.value }))}
                                        placeholder="Describe the corrective action taken"
                                   />
                              </Form.Group>

                              <Form.Group className="mb-3">
                                   <Form.Label>Additional Notes</Form.Label>
                                   <Form.Control
                                        as="textarea"
                                        rows={2}
                                        value={rejectionForm.notes}
                                        onChange={(e) => setRejectionForm(prev => ({ ...prev, notes: e.target.value }))}
                                        placeholder="Any additional notes"
                                   />
                              </Form.Group>

                              <Form.Check
                                   type="checkbox"
                                   label="This rejection requires a recall"
                                   checked={rejectionForm.requiresRecall}
                                   onChange={(e) => setRejectionForm(prev => ({ ...prev, requiresRecall: e.target.checked }))}
                              />
                         </Form>
                    </Modal.Body>
                    <Modal.Footer>
                         <Button variant="secondary" onClick={() => setShowRejectionModal(false)}>
                              Cancel
                         </Button>
                         <Button variant="danger" onClick={handleCreateRejection}>
                              Record Rejection
                         </Button>
                    </Modal.Footer>
               </Modal>

               {/* Initiate Recall Modal */}
               <Modal show={showRecallModal} onHide={() => setShowRecallModal(false)} size="lg">
                    <Modal.Header closeButton>
                         <Modal.Title>Initiate Sample Recall</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                         <Form>
                              <Row className="mb-3">
                                   <Col md={6}>
                                        <Form.Group>
                                             <Form.Label>Primary Sample</Form.Label>
                                             <Form.Select
                                                  value={recallForm.sampleId}
                                                  onChange={(e) => setRecallForm(prev => ({ ...prev, sampleId: e.target.value }))}
                                             >
                                                  <option value="">Select sample...</option>
                                                  {samples.map((sample) => (
                                                       <option key={sample.id} value={sample.id}>
                                                            {sample.barcode} - {sample.patientName}
                                                       </option>
                                                  ))}
                                             </Form.Select>
                                        </Form.Group>
                                   </Col>
                                   <Col md={6}>
                                        <Form.Group>
                                             <Form.Label>Severity</Form.Label>
                                             <Form.Select
                                                  value={recallForm.severity}
                                                  onChange={(e) => setRecallForm(prev => ({ ...prev, severity: e.target.value }))}
                                             >
                                                  <option value="moderate">Moderate</option>
                                                  <option value="high">High</option>
                                                  <option value="critical">Critical</option>
                                             </Form.Select>
                                        </Form.Group>
                                   </Col>
                              </Row>

                              <Form.Group className="mb-3">
                                   <Form.Label>Reason for Recall</Form.Label>
                                   <Form.Control
                                        as="textarea"
                                        rows={3}
                                        value={recallForm.reason}
                                        onChange={(e) => setRecallForm(prev => ({ ...prev, reason: e.target.value }))}
                                        placeholder="Describe the reason for this recall"
                                   />
                              </Form.Group>

                              <Form.Group className="mb-3">
                                   <Form.Label>Affected Samples</Form.Label>
                                   <Form.Control
                                        as="textarea"
                                        rows={2}
                                        value={recallForm.affectedSamples.join(', ')}
                                        onChange={(e) => setRecallForm(prev => ({
                                             ...prev,
                                             affectedSamples: e.target.value.split(',').map(s => s.trim()).filter(s => s)
                                        }))}
                                        placeholder="Enter sample barcodes separated by commas"
                                   />
                              </Form.Group>

                              <Row className="mb-3">
                                   <Col md={6}>
                                        <Form.Group>
                                             <Form.Label>Initiated By</Form.Label>
                                             <Form.Control
                                                  type="text"
                                                  value={recallForm.initiatedBy}
                                                  onChange={(e) => setRecallForm(prev => ({ ...prev, initiatedBy: e.target.value }))}
                                                  placeholder="Enter your name"
                                             />
                                        </Form.Group>
                                   </Col>
                              </Row>

                              <Form.Group className="mb-3">
                                   <Form.Label>Corrective Action Plan</Form.Label>
                                   <Form.Control
                                        as="textarea"
                                        rows={3}
                                        value={recallForm.correctiveAction}
                                        onChange={(e) => setRecallForm(prev => ({ ...prev, correctiveAction: e.target.value }))}
                                        placeholder="Describe the corrective action plan"
                                   />
                              </Form.Group>

                              <Form.Group className="mb-3">
                                   <Form.Label>Communication Plan</Form.Label>
                                   <Form.Control
                                        as="textarea"
                                        rows={3}
                                        value={recallForm.communicationPlan}
                                        onChange={(e) => setRecallForm(prev => ({ ...prev, communicationPlan: e.target.value }))}
                                        placeholder="Describe how affected parties will be notified"
                                   />
                              </Form.Group>
                         </Form>
                    </Modal.Body>
                    <Modal.Footer>
                         <Button variant="secondary" onClick={() => setShowRecallModal(false)}>
                              Cancel
                         </Button>
                         <Button variant="warning" onClick={handleCreateRecall}>
                              Initiate Recall
                         </Button>
                    </Modal.Footer>
               </Modal>

               {/* Report Quality Issue Modal */}
               <Modal show={showIssueModal} onHide={() => setShowIssueModal(false)} size="lg">
                    <Modal.Header closeButton>
                         <Modal.Title>Report Quality Issue</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                         <Form>
                              <Row className="mb-3">
                                   <Col md={6}>
                                        <Form.Group>
                                             <Form.Label>Sample</Form.Label>
                                             <Form.Select
                                                  value={issueForm.sampleId}
                                                  onChange={(e) => setIssueForm(prev => ({ ...prev, sampleId: e.target.value }))}
                                             >
                                                  <option value="">Select sample...</option>
                                                  {samples.map((sample) => (
                                                       <option key={sample.id} value={sample.id}>
                                                            {sample.barcode} - {sample.patientName}
                                                       </option>
                                                  ))}
                                             </Form.Select>
                                        </Form.Group>
                                   </Col>
                                   <Col md={6}>
                                        <Form.Group>
                                             <Form.Label>Issue Type</Form.Label>
                                             <Form.Select
                                                  value={issueForm.issueType}
                                                  onChange={(e) => setIssueForm(prev => ({ ...prev, issueType: e.target.value }))}
                                             >
                                                  <option value="">Select type...</option>
                                                  <option value="contamination">Contamination</option>
                                                  <option value="hemolysis">Hemolysis</option>
                                                  <option value="clotting">Clotting</option>
                                                  <option value="labeling_error">Labeling Error</option>
                                                  <option value="collection_error">Collection Error</option>
                                                  <option value="storage_issue">Storage Issue</option>
                                                  <option value="transport_issue">Transport Issue</option>
                                                  <option value="other">Other</option>
                                             </Form.Select>
                                        </Form.Group>
                                   </Col>
                              </Row>

                              <Form.Group className="mb-3">
                                   <Form.Label>Description</Form.Label>
                                   <Form.Control
                                        as="textarea"
                                        rows={3}
                                        value={issueForm.description}
                                        onChange={(e) => setIssueForm(prev => ({ ...prev, description: e.target.value }))}
                                        placeholder="Describe the quality issue in detail"
                                   />
                              </Form.Group>

                              <Row className="mb-3">
                                   <Col md={4}>
                                        <Form.Group>
                                             <Form.Label>Severity</Form.Label>
                                             <Form.Select
                                                  value={issueForm.severity}
                                                  onChange={(e) => setIssueForm(prev => ({ ...prev, severity: e.target.value }))}
                                             >
                                                  <option value="low">Low</option>
                                                  <option value="moderate">Moderate</option>
                                                  <option value="high">High</option>
                                                  <option value="critical">Critical</option>
                                             </Form.Select>
                                        </Form.Group>
                                   </Col>
                                   <Col md={4}>
                                        <Form.Group>
                                             <Form.Label>Reported By</Form.Label>
                                             <Form.Control
                                                  type="text"
                                                  value={issueForm.reportedBy}
                                                  onChange={(e) => setIssueForm(prev => ({ ...prev, reportedBy: e.target.value }))}
                                                  placeholder="Enter your name"
                                             />
                                        </Form.Group>
                                   </Col>
                                   <Col md={4}>
                                        <Form.Group>
                                             <Form.Label>Assigned To</Form.Label>
                                             <Form.Control
                                                  type="text"
                                                  value={issueForm.assignedTo}
                                                  onChange={(e) => setIssueForm(prev => ({ ...prev, assignedTo: e.target.value }))}
                                                  placeholder="Assign to team member"
                                             />
                                        </Form.Group>
                                   </Col>
                              </Row>

                              <Form.Group className="mb-3">
                                   <Form.Label>Due Date</Form.Label>
                                   <Form.Control
                                        type="date"
                                        value={issueForm.dueDate}
                                        onChange={(e) => setIssueForm(prev => ({ ...prev, dueDate: e.target.value }))}
                                   />
                              </Form.Group>
                         </Form>
                    </Modal.Body>
                    <Modal.Footer>
                         <Button variant="secondary" onClick={() => setShowIssueModal(false)}>
                              Cancel
                         </Button>
                         <Button variant="info" onClick={handleCreateIssue}>
                              Report Issue
                         </Button>
                    </Modal.Footer>
               </Modal>
          </div>
     );
}