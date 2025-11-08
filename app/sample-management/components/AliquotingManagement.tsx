'use client';

import React, { useState, useEffect } from 'react';
import { Button, Form, Modal, Row, Col, Card, Table, Badge, Alert, InputGroup } from 'react-bootstrap';
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
     RiLink,
     RiUnlink
} from '@remixicon/react';
import type { Sample, AliquotRequest, Aliquot, DUMMY_SAMPLES, DUMMY_ALIQUOTS } from '../types';

export default function AliquotingManagement() {
     const [samples, setSamples] = useState<Sample[]>([]);
     const [aliquots, setAliquots] = useState<Aliquot[]>([]);
     const [selectedSample, setSelectedSample] = useState<Sample | null>(null);
     const [showAliquotModal, setShowAliquotModal] = useState(false);
     const [showAliquotDetailsModal, setShowAliquotDetailsModal] = useState(false);
     const [loading, setLoading] = useState(true);
     const [searchTerm, setSearchTerm] = useState('');

     // Aliquot form state
     const [aliquotForm, setAliquotForm] = useState({
          parentSampleId: '',
          volume: 0,
          unit: 'mL',
          purpose: '',
          storageLocation: '',
          aliquotedBy: '',
          notes: '',
          numberOfAliquots: 1,
          aliquotVolume: 0
     });

     useEffect(() => {
          fetchSamples();
          fetchAliquots();
     }, []);

     const fetchSamples = async () => {
          try {
               // Use dummy data instead of API call
               setTimeout(() => {
                    // Filter samples that are processed (available for aliquoting)
                    const processedSamples = DUMMY_SAMPLES.filter(s => s.status === 'processed');
                    setSamples(processedSamples);
               }, 300); // Simulate API delay
          } catch (error) {
               console.error('Error fetching samples:', error);
          }
     };

     const fetchAliquots = async () => {
          try {
               setLoading(true);
               // Use dummy data instead of API call
               setTimeout(() => {
                    setAliquots(DUMMY_ALIQUOTS);
                    setLoading(false);
               }, 400); // Simulate API delay
          } catch (error) {
               console.error('Error fetching aliquots:', error);
               setAliquots([]);
               setLoading(false);
          }
     };

     const handleCreateAliquot = async () => {
          if (!selectedSample) {
               alert('Please select a parent sample');
               return;
          }

          if (aliquotForm.numberOfAliquots * aliquotForm.aliquotVolume > (selectedSample.volume || 0)) {
               alert('Total aliquot volume exceeds parent sample volume');
               return;
          }

          try {
               const aliquotData = {
                    ...aliquotForm,
                    parentSampleId: selectedSample.id,
                    barcode: generateAliquotBarcode(selectedSample.barcode),
                    status: 'active'
               };

               const response = await customPost('aliquots', aliquotData, 'POST');
               if (response) {
                    alert('Aliquot created successfully');
                    fetchAliquots();
                    fetchSamples(); // Refresh parent sample data
                    setShowAliquotModal(false);
                    resetAliquotForm();
               }
          } catch (error) {
               console.error('Error creating aliquot:', error);
               alert('Failed to create aliquot');
          }
     };

     const generateAliquotBarcode = (parentBarcode: string): string => {
          const timestamp = Date.now().toString().slice(-6);
          return `${parentBarcode}-A${timestamp}`;
     };

     const resetAliquotForm = () => {
          setAliquotForm({
               parentSampleId: '',
               volume: 0,
               unit: 'mL',
               purpose: '',
               storageLocation: '',
               aliquotedBy: '',
               notes: '',
               numberOfAliquots: 1,
               aliquotVolume: 0
          });
          setSelectedSample(null);
     };

     const getAliquotHierarchy = (parentId: string): Aliquot[] => {
          return aliquots.filter(a => a.parentSampleId === parentId);
     };

     const getParentSample = (aliquot: Aliquot): Sample | undefined => {
          return samples.find(s => s.id === aliquot.parentSampleId);
     };

     const filteredSamples = samples.filter(sample =>
          sample.barcode.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sample.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sample.testType.toLowerCase().includes(searchTerm.toLowerCase())
     );

     const formatDateTime = (date: string) => {
          return new Date(date).toLocaleString();
     };

     if (loading) {
          return (
               <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                         <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-2">Loading aliquoting data...</p>
               </div>
          );
     }

     return (
          <div className="container-fluid p-4">
               <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                         <h3 className="mb-1">Sample Aliquoting</h3>
                         <p className="text-muted mb-0">Create and manage sample aliquots with parent-child relationships</p>
                    </div>
                    <div className="d-flex gap-2">
                         <Button variant="outline-primary" onClick={fetchAliquots}>
                              <RiRefreshLine size={16} className="me-2" />
                              Refresh
                         </Button>
                         <Button variant="primary" onClick={() => setShowAliquotModal(true)}>
                              <RiAddLine size={16} className="me-2" />
                              Create Aliquot
                         </Button>
                    </div>
               </div>

               {/* Aliquoting Overview */}
               <Row className="g-4 mb-4">
                    <Col md={4}>
                         <Card className="text-center">
                              <Card.Body>
                                   <RiTestTubeLine size={32} className="text-primary mb-2" />
                                   <h4 className="text-primary">{samples.length}</h4>
                                   <p className="text-muted mb-0">Available Samples</p>
                              </Card.Body>
                         </Card>
                    </Col>
                    <Col md={4}>
                         <Card className="text-center">
                              <Card.Body>
                                   <RiUploadLine size={32} className="text-success mb-2" />
                                   <h4 className="text-success">{aliquots.length}</h4>
                                   <p className="text-muted mb-0">Total Aliquots</p>
                              </Card.Body>
                         </Card>
                    </Col>
                    <Col md={4}>
                         <Card className="text-center">
                              <Card.Body>
                                   <RiLink size={32} className="text-info mb-2" />
                                   <h4 className="text-info">
                                        {new Set(aliquots.map(a => a.parentSampleId)).size}
                                   </h4>
                                   <p className="text-muted mb-0">Parent Samples</p>
                              </Card.Body>
                         </Card>
                    </Col>
               </Row>

               {/* Aliquots Table */}
               <Card className="mb-4">
                    <Card.Header>
                         <h5 className="mb-0">Aliquot History</h5>
                    </Card.Header>
                    <Card.Body>
                         <div className="table-responsive">
                              <Table striped hover>
                                   <thead>
                                        <tr>
                                             <th>Aliquot Barcode</th>
                                             <th>Parent Sample</th>
                                             <th>Volume</th>
                                             <th>Purpose</th>
                                             <th>Created By</th>
                                             <th>Created Date</th>
                                             <th>Status</th>
                                             <th>Actions</th>
                                        </tr>
                                   </thead>
                                   <tbody>
                                        {aliquots.map((aliquot) => {
                                             const parentSample = getParentSample(aliquot);
                                             return (
                                                  <tr key={aliquot.id}>
                                                       <td>
                                                            <div className="d-flex align-items-center">
                                                                 <RiTestTubeLine size={16} className="me-2 text-primary" />
                                                                 {aliquot.barcode}
                                                            </div>
                                                       </td>
                                                       <td>
                                                            {parentSample ? (
                                                                 <div>
                                                                      <div className="fw-semibold">{parentSample.barcode}</div>
                                                                      <small className="text-muted">{parentSample.patientName}</small>
                                                                 </div>
                                                            ) : (
                                                                 <span className="text-muted">Unknown</span>
                                                            )}
                                                       </td>
                                                       <td>{aliquot.volume} {aliquot.unit}</td>
                                                       <td>{aliquot.purpose}</td>
                                                       <td>{aliquot.aliquotedBy}</td>
                                                       <td>{formatDateTime(aliquot.aliquotedAt)}</td>
                                                       <td>
                                                            <Badge bg={aliquot.status === 'used' ? 'success' : 'secondary'}>
                                                                 {aliquot.status}
                                                            </Badge>
                                                       </td>
                                                       <td>
                                                            <Button
                                                                 variant="outline-info"
                                                                 size="sm"
                                                                 onClick={() => {
                                                                      // Show aliquot details
                                                                      setShowAliquotDetailsModal(true);
                                                                 }}
                                                            >
                                                                 <RiEyeLine size={14} />
                                                            </Button>
                                                       </td>
                                                  </tr>
                                             );
                                        })}
                                   </tbody>
                              </Table>
                         </div>

                         {aliquots.length === 0 && (
                              <div className="text-center py-4">
                                   <RiTestTubeLine size={48} className="text-muted mb-3" />
                                   <h5 className="text-muted">No Aliquots</h5>
                                   <p className="text-muted">Create your first aliquot to get started.</p>
                              </div>
                         )}
                    </Card.Body>
               </Card>

               {/* Available Samples for Aliquoting */}
               <Card>
                    <Card.Header>
                         <div className="d-flex justify-content-between align-items-center">
                              <h5 className="mb-0">Available Samples for Aliquoting</h5>
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
                                             <th>Existing Aliquots</th>
                                             <th>Actions</th>
                                        </tr>
                                   </thead>
                                   <tbody>
                                        {filteredSamples.map((sample) => {
                                             const sampleAliquots = getAliquotHierarchy(sample.id);
                                             const totalAliquotVolume = sampleAliquots.reduce((sum, a) => sum + a.volume, 0);
                                             const remainingVolume = (sample.volume || 0) - totalAliquotVolume;

                                             return (
                                                  <tr key={sample.id}>
                                                       <td>
                                                            <div className="d-flex align-items-center">
                                                                 <RiTestTubeLine size={16} className="me-2 text-primary" />
                                                                 {sample.barcode}
                                                            </div>
                                                       </td>
                                                       <td>
                                                            <div>
                                                                 <div className="fw-semibold">{sample.patientName}</div>
                                                                 <small className="text-muted">ID: {sample.patientId}</small>
                                                            </div>
                                                       </td>
                                                       <td>{sample.testName}</td>
                                                       <td>
                                                            {sample.volume ? `${sample.volume} mL` : 'N/A'}
                                                            {remainingVolume > 0 && (
                                                                 <div>
                                                                      <small className="text-success">
                                                                           {remainingVolume} mL remaining
                                                                      </small>
                                                                 </div>
                                                            )}
                                                       </td>
                                                       <td>
                                                            <div className="d-flex align-items-center">
                                                                 <Badge bg="info" className="me-2">
                                                                      {sampleAliquots.length}
                                                                 </Badge>
                                                                 {sampleAliquots.length > 0 && (
                                                                      <Button
                                                                           variant="link"
                                                                           size="sm"
                                                                           className="p-0"
                                                                           onClick={() => {
                                                                                // Show aliquot hierarchy
                                                                           }}
                                                                      >
                                                                           <RiEyeLine size={14} />
                                                                      </Button>
                                                                 )}
                                                            </div>
                                                       </td>
                                                       <td>
                                                            <Button
                                                                 variant="outline-primary"
                                                                 size="sm"
                                                                 onClick={() => {
                                                                      setSelectedSample(sample);
                                                                      setAliquotForm(prev => ({ ...prev, parentSampleId: sample.id }));
                                                                      setShowAliquotModal(true);
                                                                 }}
                                                                 disabled={!sample.volume || remainingVolume <= 0}
                                                            >
                                                                 <RiUploadLine size={14} className="me-1" />
                                                                 Aliquot
                                                            </Button>
                                                       </td>
                                                  </tr>
                                             );
                                        })}
                                   </tbody>
                              </Table>
                         </div>

                         {filteredSamples.length === 0 && (
                              <div className="text-center py-4">
                                   <RiTestTubeLine size={48} className="text-muted mb-3" />
                                   <h5 className="text-muted">No Samples Available</h5>
                                   <p className="text-muted">Samples must be processed before they can be aliquoted.</p>
                              </div>
                         )}
                    </Card.Body>
               </Card>

               {/* Create Aliquot Modal */}
               <Modal show={showAliquotModal} onHide={() => setShowAliquotModal(false)} size="lg">
                    <Modal.Header closeButton>
                         <Modal.Title>Create Sample Aliquot</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                         {selectedSample && (
                              <Alert variant="info" className="mb-4">
                                   <div className="d-flex align-items-center">
                                        <RiTestTubeLine size={20} className="me-2" />
                                        <div>
                                             <strong>Parent Sample:</strong> {selectedSample.barcode}<br />
                                             <strong>Patient:</strong> {selectedSample.patientName}<br />
                                             <strong>Available Volume:</strong> {selectedSample.volume || 0} mL
                                        </div>
                                   </div>
                              </Alert>
                         )}

                         <Form>
                              <Row className="mb-3">
                                   <Col md={6}>
                                        <Form.Group>
                                             <Form.Label>Number of Aliquots</Form.Label>
                                             <Form.Control
                                                  type="number"
                                                  min="1"
                                                  value={aliquotForm.numberOfAliquots}
                                                  onChange={(e) => setAliquotForm(prev => ({
                                                       ...prev,
                                                       numberOfAliquots: parseInt(e.target.value) || 1
                                                  }))}
                                             />
                                        </Form.Group>
                                   </Col>
                                   <Col md={6}>
                                        <Form.Group>
                                             <Form.Label>Volume per Aliquot</Form.Label>
                                             <InputGroup>
                                                  <Form.Control
                                                       type="number"
                                                       step="0.1"
                                                       min="0"
                                                       value={aliquotForm.aliquotVolume}
                                                       onChange={(e) => setAliquotForm(prev => ({
                                                            ...prev,
                                                            aliquotVolume: parseFloat(e.target.value) || 0
                                                       }))}
                                                  />
                                                  <InputGroup.Text>mL</InputGroup.Text>
                                             </InputGroup>
                                        </Form.Group>
                                   </Col>
                              </Row>

                              <Alert variant="warning" className="mb-3">
                                   <strong>Total Volume:</strong> {aliquotForm.numberOfAliquots * aliquotForm.aliquotVolume} mL
                                   {selectedSample && aliquotForm.numberOfAliquots * aliquotForm.aliquotVolume > (selectedSample.volume || 0) && (
                                        <div className="text-danger mt-1">
                                             <RiAlertLine size={14} className="me-1" />
                                             Volume exceeds available sample volume!
                                        </div>
                                   )}
                              </Alert>

                              <Row className="mb-3">
                                   <Col md={6}>
                                        <Form.Group>
                                             <Form.Label>Purpose</Form.Label>
                                             <Form.Select
                                                  value={aliquotForm.purpose}
                                                  onChange={(e) => setAliquotForm(prev => ({ ...prev, purpose: e.target.value }))}
                                             >
                                                  <option value="">Select purpose...</option>
                                                  <option value="testing">Testing</option>
                                                  <option value="backup">Backup</option>
                                                  <option value="research">Research</option>
                                                  <option value="quality_control">Quality Control</option>
                                                  <option value="external_lab">External Lab</option>
                                                  <option value="other">Other</option>
                                             </Form.Select>
                                        </Form.Group>
                                   </Col>
                                   <Col md={6}>
                                        <Form.Group>
                                             <Form.Label>Storage Location</Form.Label>
                                             <Form.Control
                                                  type="text"
                                                  value={aliquotForm.storageLocation}
                                                  onChange={(e) => setAliquotForm(prev => ({ ...prev, storageLocation: e.target.value }))}
                                                  placeholder="e.g., Freezer A, Shelf 2"
                                             />
                                        </Form.Group>
                                   </Col>
                              </Row>

                              <Row className="mb-3">
                                   <Col md={6}>
                                        <Form.Group>
                                             <Form.Label>Aliquoted By</Form.Label>
                                             <Form.Control
                                                  type="text"
                                                  value={aliquotForm.aliquotedBy}
                                                  onChange={(e) => setAliquotForm(prev => ({ ...prev, aliquotedBy: e.target.value }))}
                                                  placeholder="Enter your name"
                                             />
                                        </Form.Group>
                                   </Col>
                              </Row>

                              <Form.Group className="mb-3">
                                   <Form.Label>Notes</Form.Label>
                                   <Form.Control
                                        as="textarea"
                                        rows={3}
                                        value={aliquotForm.notes}
                                        onChange={(e) => setAliquotForm(prev => ({ ...prev, notes: e.target.value }))}
                                        placeholder="Additional notes about the aliquoting process"
                                   />
                              </Form.Group>
                         </Form>
                    </Modal.Body>
                    <Modal.Footer>
                         <Button variant="secondary" onClick={() => setShowAliquotModal(false)}>
                              Cancel
                         </Button>
                         <Button
                              variant="primary"
                              onClick={handleCreateAliquot}
                              disabled={!selectedSample || aliquotForm.numberOfAliquots * aliquotForm.aliquotVolume > (selectedSample.volume || 0)}
                         >
                              Create Aliquot
                         </Button>
                    </Modal.Footer>
               </Modal>

               {/* Aliquot Details Modal */}
               <Modal show={showAliquotDetailsModal} onHide={() => setShowAliquotDetailsModal(false)}>
                    <Modal.Header closeButton>
                         <Modal.Title>Aliquot Details</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                         <div className="text-center py-4">
                              <RiTestTubeLine size={48} className="text-muted mb-3" />
                              <p className="text-muted">Aliquot details view coming soon.</p>
                         </div>
                    </Modal.Body>
                    <Modal.Footer>
                         <Button variant="secondary" onClick={() => setShowAliquotDetailsModal(false)}>
                              Close
                         </Button>
                    </Modal.Footer>
               </Modal>
          </div>
     );
}