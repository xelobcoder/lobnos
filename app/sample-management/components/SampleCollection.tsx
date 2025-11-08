'use client';

import React, { useState, useEffect } from 'react';
import { Button, Form, Modal, Row, Col, Card, Table, Badge, Alert, InputGroup, ListGroup } from 'react-bootstrap';
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
     RiBarcodeLine,
     RiUserSearchLine,
     RiCalendarLine,
     RiMapPinLine,
     RiThermometerLine,
     RiFlaskLine,
     RiFileTextLine,
     RiPrinterLine
} from '@remixicon/react';
import type { Sample, Patient, TestType, CollectionRequest, DUMMY_SAMPLES, DUMMY_PATIENTS, DUMMY_TEST_TYPES } from '../types';

export default function SampleCollection() {
     const [samples, setSamples] = useState<Sample[]>([]);
     const [patients, setPatients] = useState<Patient[]>([]);
     const [testTypes, setTestTypes] = useState<TestType[]>([]);
     const [collectionRequests, setCollectionRequests] = useState<CollectionRequest[]>([]);
     const [showCollectionModal, setShowCollectionModal] = useState(false);
     const [showPatientSearchModal, setShowPatientSearchModal] = useState(false);
     const [loading, setLoading] = useState(true);
     const [searchTerm, setSearchTerm] = useState('');
     const [patientSearchTerm, setPatientSearchTerm] = useState('');

     // Collection form state
     const [collectionForm, setCollectionForm] = useState({
          patientId: '',
          patientName: '',
          testType: '',
          testName: '',
          volume: 5,
          unit: 'mL',
          collectionMethod: 'venipuncture',
          collectionSite: '',
          collectedBy: '',
          collectedAt: '',
          temperature: '',
          condition: 'good',
          notes: '',
          priority: 'routine',
          requiresSpecialHandling: false,
          specialInstructions: ''
     });

     useEffect(() => {
          fetchData();
     }, []);

     const fetchData = async () => {
          try {
               setLoading(true);
               await Promise.all([
                    fetchSamples(),
                    fetchPatients(),
                    fetchTestTypes(),
                    fetchCollectionRequests()
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

     const fetchPatients = async () => {
          try {
               // Use dummy data instead of API call
               setTimeout(() => {
                    setPatients(DUMMY_PATIENTS);
               }, 200); // Simulate API delay
          } catch (error) {
               console.error('Error fetching patients:', error);
          }
     };

     const fetchTestTypes = async () => {
          try {
               // Use dummy data instead of API call
               setTimeout(() => {
                    setTestTypes(DUMMY_TEST_TYPES);
               }, 250); // Simulate API delay
          } catch (error) {
               console.error('Error fetching test types:', error);
               setTestTypes(DUMMY_TEST_TYPES);
          }
     };

     const fetchCollectionRequests = async () => {
          try {
               // Use dummy data instead of API call - start with empty array
               setTimeout(() => {
                    setCollectionRequests([]);
               }, 200); // Simulate API delay
          } catch (error) {
               console.error('Error fetching collection requests:', error);
               setCollectionRequests([]);
          }
     };

     const generateBarcode = (): string => {
          const timestamp = Date.now().toString().slice(-8);
          const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
          return `S${timestamp}${random}`;
     };

     const handleCollectSample = async () => {
          if (!collectionForm.patientId || !collectionForm.testType) {
               alert('Please select a patient and test type');
               return;
          }

          try {
               const sampleData = {
                    ...collectionForm,
                    barcode: generateBarcode(),
                    status: 'collected',
                    collectedAt: collectionForm.collectedAt || new Date().toISOString(),
                    chainOfCustody: [{
                         id: `coc-${Date.now()}`,
                         action: 'collected',
                         timestamp: new Date().toISOString(),
                         performedBy: collectionForm.collectedBy,
                         location: 'Collection Room',
                         notes: `Sample collected via ${collectionForm.collectionMethod}`
                    }]
               };

               const response = await customPost('samples', sampleData, 'POST');
               if (response) {
                    alert('Sample collected successfully');
                    fetchSamples();
                    setShowCollectionModal(false);
                    resetCollectionForm();
               }
          } catch (error) {
               console.error('Error collecting sample:', error);
               alert('Failed to collect sample');
          }
     };

     const resetCollectionForm = () => {
          setCollectionForm({
               patientId: '',
               patientName: '',
               testType: '',
               testName: '',
               volume: 5,
               unit: 'mL',
               collectionMethod: 'venipuncture',
               collectionSite: '',
               collectedBy: '',
               collectedAt: '',
               temperature: '',
               condition: 'good',
               notes: '',
               priority: 'routine',
               requiresSpecialHandling: false,
               specialInstructions: ''
          });
     };

     const handlePatientSelect = (patient: Patient) => {
          setCollectionForm(prev => ({
               ...prev,
               patientId: patient.id,
               patientName: patient.name
          }));
          setShowPatientSearchModal(false);
          setPatientSearchTerm('');
     };

     const handleTestTypeSelect = (testType: TestType) => {
          setCollectionForm(prev => ({
               ...prev,
               testType: testType.id,
               testName: testType.name,
               requiresSpecialHandling: testType.requiresFasting || false,
               specialInstructions: testType.requiresFasting ? 'Patient must fast for 12 hours prior to collection' : ''
          }));
     };

     const filteredPatients = patients.filter(patient =>
          patient.name.toLowerCase().includes(patientSearchTerm.toLowerCase()) ||
          patient.id.toLowerCase().includes(patientSearchTerm.toLowerCase()) ||
          (patient.email && patient.email.toLowerCase().includes(patientSearchTerm.toLowerCase()))
     );

     const filteredSamples = samples.filter(sample =>
          sample.barcode.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sample.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sample.testName.toLowerCase().includes(searchTerm.toLowerCase())
     );

     const formatDateTime = (date: string) => {
          return new Date(date).toLocaleString();
     };

     const getConditionBadgeVariant = (condition: string) => {
          switch (condition) {
               case 'excellent': return 'success';
               case 'good': return 'success';
               case 'fair': return 'warning';
               case 'poor': return 'danger';
               case 'rejected': return 'danger';
               default: return 'secondary';
          }
     };

     const getPriorityBadgeVariant = (priority: string) => {
          switch (priority) {
               case 'stat': return 'danger';
               case 'urgent': return 'warning';
               case 'routine': return 'info';
               default: return 'secondary';
          }
     };

     if (loading) {
          return (
               <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                         <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-2">Loading sample collection data...</p>
               </div>
          );
     }

     return (
          <div className="container-fluid p-4">
               <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                         <h3 className="mb-1">Sample Collection</h3>
                         <p className="text-muted mb-0">Collect and register new samples with barcode generation</p>
                    </div>
                    <div className="d-flex gap-2">
                         <Button variant="outline-primary" onClick={fetchData}>
                              <RiRefreshLine size={16} className="me-2" />
                              Refresh
                         </Button>
                         <Button variant="primary" onClick={() => setShowCollectionModal(true)}>
                              <RiAddLine size={16} className="me-2" />
                              Collect Sample
                         </Button>
                    </div>
               </div>

               {/* Collection Overview */}
               <Row className="g-4 mb-4">
                    <Col md={3}>
                         <Card className="text-center">
                              <Card.Body>
                                   <RiTestTubeLine size={32} className="text-primary mb-2" />
                                   <h4 className="text-primary">{samples.length}</h4>
                                   <p className="text-muted mb-0">Total Samples</p>
                              </Card.Body>
                         </Card>
                    </Col>
                    <Col md={3}>
                         <Card className="text-center">
                              <Card.Body>
                                   <RiCheckLine size={32} className="text-success mb-2" />
                                   <h4 className="text-success">
                                        {samples.filter(s => s.status === 'collected').length}
                                   </h4>
                                   <p className="text-muted mb-0">Collected Today</p>
                              </Card.Body>
                         </Card>
                    </Col>
                    <Col md={3}>
                         <Card className="text-center">
                              <Card.Body>
                                   <RiAlertLine size={32} className="text-warning mb-2" />
                                   <h4 className="text-warning">
                                        {samples.filter(s => s.condition === 'poor' || s.condition === 'rejected').length}
                                   </h4>
                                   <p className="text-muted mb-0">Quality Issues</p>
                              </Card.Body>
                         </Card>
                    </Col>
                    <Col md={3}>
                         <Card className="text-center">
                              <Card.Body>
                                   <RiBarcodeLine size={32} className="text-info mb-2" />
                                   <h4 className="text-info">
                                        {samples.filter(s => s.barcode).length}
                                   </h4>
                                   <p className="text-muted mb-0">Barcoded Samples</p>
                              </Card.Body>
                         </Card>
                    </Col>
               </Row>

               {/* Recent Collections */}
               <Card className="mb-4">
                    <Card.Header>
                         <div className="d-flex justify-content-between align-items-center">
                              <h5 className="mb-0">Recent Sample Collections</h5>
                              <Form.Control
                                   type="text"
                                   placeholder="Search samples..."
                                   value={searchTerm}
                                   onChange={(e) => setSearchTerm(e.target.value)}
                                   style={{ width: '250px' }}
                              />
                         </div>
                    </Card.Header>
                    <Card.Body>
                         <div className="table-responsive">
                              <Table striped hover>
                                   <thead>
                                        <tr>
                                             <th>Barcode</th>
                                             <th>Patient</th>
                                             <th>Test Type</th>
                                             <th>Volume</th>
                                             <th>Condition</th>
                                             <th>Priority</th>
                                             <th>Collected By</th>
                                             <th>Collection Time</th>
                                             <th>Actions</th>
                                        </tr>
                                   </thead>
                                   <tbody>
                                        {filteredSamples.slice(0, 50).map((sample) => (
                                             <tr key={sample.id}>
                                                  <td>
                                                       <div className="d-flex align-items-center">
                                                            <RiBarcodeLine size={16} className="me-2 text-primary" />
                                                            <strong>{sample.barcode}</strong>
                                                       </div>
                                                  </td>
                                                  <td>
                                                       <div>
                                                            <div className="fw-semibold">{sample.patientName}</div>
                                                            <small className="text-muted">ID: {sample.patientId}</small>
                                                       </div>
                                                  </td>
                                                  <td>{sample.testName}</td>
                                                  <td>{sample.volume} {sample.unit}</td>
                                                  <td>
                                                       <Badge bg={getConditionBadgeVariant(sample.condition || 'good')}>
                                                            {sample.condition || 'good'}
                                                       </Badge>
                                                  </td>
                                                  <td>
                                                       <Badge bg={getPriorityBadgeVariant(sample.priority || 'routine')}>
                                                            {sample.priority || 'routine'}
                                                       </Badge>
                                                  </td>
                                                  <td>{sample.collectedBy}</td>
                                                  <td>{sample.collectedAt ? formatDateTime(sample.collectedAt) : 'N/A'}</td>
                                                  <td>
                                                       <div className="d-flex gap-1">
                                                            <Button variant="outline-info" size="sm">
                                                                 <RiEyeLine size={14} />
                                                            </Button>
                                                            <Button variant="outline-primary" size="sm">
                                                                 <RiPrinterLine size={14} />
                                                            </Button>
                                                       </div>
                                                  </td>
                                             </tr>
                                        ))}
                                   </tbody>
                              </Table>
                         </div>

                         {filteredSamples.length === 0 && (
                              <div className="text-center py-4">
                                   <RiTestTubeLine size={48} className="text-muted mb-3" />
                                   <h5 className="text-muted">No Samples Collected</h5>
                                   <p className="text-muted">Start by collecting your first sample.</p>
                              </div>
                         )}
                    </Card.Body>
               </Card>

               {/* Collection Requests */}
               {collectionRequests.length > 0 && (
                    <Card>
                         <Card.Header>
                              <h5 className="mb-0">Pending Collection Requests</h5>
                         </Card.Header>
                         <Card.Body>
                              <ListGroup variant="flush">
                                   {collectionRequests.slice(0, 10).map((request) => (
                                        <ListGroup.Item key={request.id} className="d-flex justify-content-between align-items-center">
                                             <div>
                                                  <strong>{request.patientName}</strong> - {request.testType}
                                                  <br />
                                                  <small className="text-muted">
                                                       Requested: {formatDateTime(request.requestedAt)} |
                                                       Priority: <Badge bg={getPriorityBadgeVariant(request.priority)}>{request.priority}</Badge>
                                                  </small>
                                             </div>
                                             <Button variant="outline-primary" size="sm">
                                                  Collect Now
                                             </Button>
                                        </ListGroup.Item>
                                   ))}
                              </ListGroup>
                         </Card.Body>
                    </Card>
               )}

               {/* Collect Sample Modal */}
               <Modal show={showCollectionModal} onHide={() => setShowCollectionModal(false)} size="xl">
                    <Modal.Header closeButton>
                         <Modal.Title>Collect New Sample</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                         <Form>
                              {/* Patient Selection */}
                              <Card className="mb-4">
                                   <Card.Header>
                                        <h6 className="mb-0">Patient Information</h6>
                                   </Card.Header>
                                   <Card.Body>
                                        <Row className="mb-3">
                                             <Col md={8}>
                                                  <Form.Group>
                                                       <Form.Label>Patient</Form.Label>
                                                       <InputGroup>
                                                            <Form.Control
                                                                 type="text"
                                                                 value={collectionForm.patientName}
                                                                 readOnly
                                                                 placeholder="Select patient..."
                                                            />
                                                            <Button
                                                                 variant="outline-secondary"
                                                                 onClick={() => setShowPatientSearchModal(true)}
                                                            >
                                                                 <RiUserSearchLine size={16} />
                                                            </Button>
                                                       </InputGroup>
                                                  </Form.Group>
                                             </Col>
                                             <Col md={4}>
                                                  <Form.Group>
                                                       <Form.Label>Patient ID</Form.Label>
                                                       <Form.Control
                                                            type="text"
                                                            value={collectionForm.patientId}
                                                            readOnly
                                                       />
                                                  </Form.Group>
                                             </Col>
                                        </Row>
                                   </Card.Body>
                              </Card>

                              {/* Test Information */}
                              <Card className="mb-4">
                                   <Card.Header>
                                        <h6 className="mb-0">Test Information</h6>
                                   </Card.Header>
                                   <Card.Body>
                                        <Row className="mb-3">
                                             <Col md={6}>
                                                  <Form.Group>
                                                       <Form.Label>Test Type</Form.Label>
                                                       <Form.Select
                                                            value={collectionForm.testType}
                                                            onChange={(e) => {
                                                                 const selectedTest = testTypes.find(t => t.id === e.target.value);
                                                                 if (selectedTest) {
                                                                      handleTestTypeSelect(selectedTest);
                                                                 }
                                                            }}
                                                       >
                                                            <option value="">Select test type...</option>
                                                            {testTypes.map((test) => (
                                                                 <option key={test.id} value={test.id}>
                                                                      {test.name} ({test.category})
                                                                 </option>
                                                            ))}
                                                       </Form.Select>
                                                  </Form.Group>
                                             </Col>
                                             <Col md={6}>
                                                  <Form.Group>
                                                       <Form.Label>Priority</Form.Label>
                                                       <Form.Select
                                                            value={collectionForm.priority}
                                                            onChange={(e) => setCollectionForm(prev => ({ ...prev, priority: e.target.value }))}
                                                       >
                                                            <option value="routine">Routine</option>
                                                            <option value="urgent">Urgent</option>
                                                            <option value="stat">STAT</option>
                                                       </Form.Select>
                                                  </Form.Group>
                                             </Col>
                                        </Row>

                                        {collectionForm.requiresSpecialHandling && (
                                             <Alert variant="warning" className="mb-3">
                                                  <RiAlertLine size={16} className="me-2" />
                                                  <strong>Special Handling Required:</strong> {collectionForm.specialInstructions}
                                             </Alert>
                                        )}
                                   </Card.Body>
                              </Card>

                              {/* Collection Details */}
                              <Card className="mb-4">
                                   <Card.Header>
                                        <h6 className="mb-0">Collection Details</h6>
                                   </Card.Header>
                                   <Card.Body>
                                        <Row className="mb-3">
                                             <Col md={4}>
                                                  <Form.Group>
                                                       <Form.Label>Volume</Form.Label>
                                                       <InputGroup>
                                                            <Form.Control
                                                                 type="number"
                                                                 step="0.1"
                                                                 min="0"
                                                                 value={collectionForm.volume}
                                                                 onChange={(e) => setCollectionForm(prev => ({
                                                                      ...prev,
                                                                      volume: parseFloat(e.target.value) || 0
                                                                 }))}
                                                            />
                                                            <InputGroup.Text>mL</InputGroup.Text>
                                                       </InputGroup>
                                                  </Form.Group>
                                             </Col>
                                             <Col md={4}>
                                                  <Form.Group>
                                                       <Form.Label>Collection Method</Form.Label>
                                                       <Form.Select
                                                            value={collectionForm.collectionMethod}
                                                            onChange={(e) => setCollectionForm(prev => ({ ...prev, collectionMethod: e.target.value }))}
                                                       >
                                                            <option value="venipuncture">Venipuncture</option>
                                                            <option value="fingerstick">Fingerstick</option>
                                                            <option value="heelstick">Heelstick</option>
                                                            <option value="urine">Urine Collection</option>
                                                            <option value="stool">Stool Collection</option>
                                                            <option value="swab">Swab</option>
                                                            <option value="other">Other</option>
                                                       </Form.Select>
                                                  </Form.Group>
                                             </Col>
                                             <Col md={4}>
                                                  <Form.Group>
                                                       <Form.Label>Collection Site</Form.Label>
                                                       <Form.Control
                                                            type="text"
                                                            value={collectionForm.collectionSite}
                                                            onChange={(e) => setCollectionForm(prev => ({ ...prev, collectionSite: e.target.value }))}
                                                            placeholder="e.g., Left arm, antecubital"
                                                       />
                                                  </Form.Group>
                                             </Col>
                                        </Row>

                                        <Row className="mb-3">
                                             <Col md={4}>
                                                  <Form.Group>
                                                       <Form.Label>Collected By</Form.Label>
                                                       <Form.Control
                                                            type="text"
                                                            value={collectionForm.collectedBy}
                                                            onChange={(e) => setCollectionForm(prev => ({ ...prev, collectedBy: e.target.value }))}
                                                            placeholder="Enter your name"
                                                       />
                                                  </Form.Group>
                                             </Col>
                                             <Col md={4}>
                                                  <Form.Group>
                                                       <Form.Label>Collection Date/Time</Form.Label>
                                                       <Form.Control
                                                            type="datetime-local"
                                                            value={collectionForm.collectedAt}
                                                            onChange={(e) => setCollectionForm(prev => ({ ...prev, collectedAt: e.target.value }))}
                                                       />
                                                  </Form.Group>
                                             </Col>
                                             <Col md={4}>
                                                  <Form.Group>
                                                       <Form.Label>Sample Condition</Form.Label>
                                                       <Form.Select
                                                            value={collectionForm.condition}
                                                            onChange={(e) => setCollectionForm(prev => ({ ...prev, condition: e.target.value }))}
                                                       >
                                                            <option value="excellent">Excellent</option>
                                                            <option value="good">Good</option>
                                                            <option value="fair">Fair</option>
                                                            <option value="poor">Poor</option>
                                                       </Form.Select>
                                                  </Form.Group>
                                             </Col>
                                        </Row>

                                        <Form.Group className="mb-3">
                                             <Form.Label>Notes</Form.Label>
                                             <Form.Control
                                                  as="textarea"
                                                  rows={2}
                                                  value={collectionForm.notes}
                                                  onChange={(e) => setCollectionForm(prev => ({ ...prev, notes: e.target.value }))}
                                                  placeholder="Additional notes about the collection"
                                             />
                                        </Form.Group>
                                   </Card.Body>
                              </Card>
                         </Form>
                    </Modal.Body>
                    <Modal.Footer>
                         <Button variant="secondary" onClick={() => setShowCollectionModal(false)}>
                              Cancel
                         </Button>
                         <Button
                              variant="primary"
                              onClick={handleCollectSample}
                              disabled={!collectionForm.patientId || !collectionForm.testType}
                         >
                              <RiTestTubeLine size={16} className="me-2" />
                              Collect Sample
                         </Button>
                    </Modal.Footer>
               </Modal>

               {/* Patient Search Modal */}
               <Modal show={showPatientSearchModal} onHide={() => setShowPatientSearchModal(false)} size="lg">
                    <Modal.Header closeButton>
                         <Modal.Title>Select Patient</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                         <Form.Group className="mb-3">
                              <Form.Label>Search Patients</Form.Label>
                              <Form.Control
                                   type="text"
                                   placeholder="Search by name, ID, or email..."
                                   value={patientSearchTerm}
                                   onChange={(e) => setPatientSearchTerm(e.target.value)}
                              />
                         </Form.Group>

                         <div className="table-responsive" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                              <Table striped hover>
                                   <thead>
                                        <tr>
                                             <th>ID</th>
                                             <th>Name</th>
                                             <th>Date of Birth</th>
                                             <th>Phone</th>
                                             <th>Actions</th>
                                        </tr>
                                   </thead>
                                   <tbody>
                                        {filteredPatients.map((patient) => (
                                             <tr key={patient.id}>
                                                  <td>{patient.id}</td>
                                                  <td>{patient.name}</td>
                                                  <td>{patient.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString() : 'N/A'}</td>
                                                  <td>{patient.phone || 'N/A'}</td>
                                                  <td>
                                                       <Button
                                                            variant="outline-primary"
                                                            size="sm"
                                                            onClick={() => handlePatientSelect(patient)}
                                                       >
                                                            Select
                                                       </Button>
                                                  </td>
                                             </tr>
                                        ))}
                                   </tbody>
                              </Table>
                         </div>

                         {filteredPatients.length === 0 && (
                              <div className="text-center py-4">
                                   <RiUserSearchLine size={48} className="text-muted mb-3" />
                                   <h5 className="text-muted">No Patients Found</h5>
                                   <p className="text-muted">Try adjusting your search terms.</p>
                              </div>
                         )}
                    </Modal.Body>
                    <Modal.Footer>
                         <Button variant="secondary" onClick={() => setShowPatientSearchModal(false)}>
                              Cancel
                         </Button>
                    </Modal.Footer>
               </Modal>
          </div>
     );
}