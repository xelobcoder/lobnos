'use client';

import React, { useState, useEffect } from 'react';
import { Button, Modal, Card, Table, Badge, Alert, Form, Row, Col } from 'react-bootstrap';
import { customFetch, customPost } from '../../../components/Auth/customFetch';
import {
     RiTimeLine,
     RiUserLine,
     RiMapPinLine,
     RiThermometerLine,
     RiAddLine,
     RiCheckLine,
     RiAlertLine,
     RiEyeLine,
     RiDownloadLine,
     RiTestTubeLine,
     RiBarcodeLine
} from '@remixicon/react';
import type { Sample, ChainOfCustodyEntry, ChainOfCustodyAction, DUMMY_SAMPLES } from '../types';

interface ChainOfCustodyProps {
     sampleId?: string;
     sample?: Sample | null;
     show?: boolean;
     onHide?: () => void;
     embedded?: boolean;
}

export default function ChainOfCustody({ sampleId, sample, show = false, onHide, embedded = false }: ChainOfCustodyProps) {
     const [chainOfCustody, setChainOfCustody] = useState<ChainOfCustodyEntry[]>([]);
     const [showAddEntryModal, setShowAddEntryModal] = useState(false);
     const [loading, setLoading] = useState(true);
     const [currentSample, setCurrentSample] = useState<Sample | null>(sample || null);

     // Form state for new entry
     const [entryForm, setEntryForm] = useState({
          action: 'received' as ChainOfCustodyAction,
          performedBy: '',
          location: '',
          temperature: '',
          notes: '',
          attachments: [] as File[]
     });

     useEffect(() => {
          if (sampleId || sample) {
               fetchChainOfCustody();
          }
     }, [sampleId, sample]);

     const fetchChainOfCustody = async () => {
          try {
               setLoading(true);
               const id = sampleId || sample?.id;
               if (!id) return;

               // Use dummy data instead of API call
               setTimeout(() => {
                    const dummySample = DUMMY_SAMPLES.find(s => s.id === id);
                    if (dummySample) {
                         setChainOfCustody(dummySample.chainOfCustody.sort((a, b) =>
                              new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
                         ));
                         setCurrentSample(dummySample);
                    } else {
                         setChainOfCustody([]);
                    }
                    setLoading(false);
               }, 300); // Simulate API delay
          } catch (error) {
               console.error('Error fetching chain of custody:', error);
               setChainOfCustody([]);
               setLoading(false);
          }
     };

     const handleAddEntry = async () => {
          const id = sampleId || sample?.id;
          if (!id) {
               alert('No sample selected');
               return;
          }

          try {
               const entryData = {
                    ...entryForm,
                    sampleId: id,
                    timestamp: new Date().toISOString(),
                    temperature: entryForm.temperature ? parseFloat(entryForm.temperature) : null
               };

               const response = await customPost(`samples/${id}/chain-of-custody`, entryData, 'POST');
               if (response) {
                    alert('Chain of custody entry added successfully');
                    fetchChainOfCustody();
                    setShowAddEntryModal(false);
                    resetEntryForm();
               }
          } catch (error) {
               console.error('Error adding chain of custody entry:', error);
               alert('Failed to add entry');
          }
     };

     const resetEntryForm = () => {
          setEntryForm({
               action: 'received',
               performedBy: '',
               location: '',
               temperature: '',
               notes: '',
               attachments: []
          });
     };

     const getActionIcon = (action: ChainOfCustodyAction) => {
          switch (action) {
               case 'collected':
                    return <RiTestTubeLine size={16} className="text-primary" />;
               case 'received':
                    return <RiDownloadLine size={16} className="text-info" />;
               case 'processed':
                    return <RiCheckLine size={16} className="text-success" />;
               case 'stored':
                    return <RiEyeLine size={16} className="text-secondary" />;
               case 'retrieved':
                    return <RiTimeLine size={16} className="text-warning" />;
               case 'transferred':
                    return <RiDownloadLine size={16} className="text-primary" />;
               case 'tested':
                    return <RiTestTubeLine size={16} className="text-success" />;
               case 'rejected':
                    return <RiAlertLine size={16} className="text-danger" />;
               case 'disposed':
                    return <RiAlertLine size={16} className="text-dark" />;
               case 'aliquoted':
                    return <RiTestTubeLine size={16} className="text-info" />;
               default:
                    return <RiTimeLine size={16} className="text-muted" />;
          }
     };

     const getActionBadge = (action: ChainOfCustodyAction) => {
          const variants: Record<ChainOfCustodyAction, string> = {
               collected: 'primary',
               received: 'info',
               processed: 'success',
               stored: 'secondary',
               retrieved: 'warning',
               transferred: 'primary',
               tested: 'success',
               rejected: 'danger',
               disposed: 'dark',
               aliquoted: 'info'
          };

          return <Badge bg={variants[action]}>{action.replace('_', ' ').toUpperCase()}</Badge>;
     };

     const formatDateTime = (date: string) => {
          return new Date(date).toLocaleString();
     };

     const exportChainOfCustody = () => {
          if (!currentSample || chainOfCustody.length === 0) return;

          const csvContent = [
               ['Timestamp', 'Action', 'Performed By', 'Location', 'Temperature', 'Notes'],
               ...chainOfCustody.map(entry => [
                    entry.timestamp,
                    entry.action,
                    entry.performedByName || entry.performedBy,
                    entry.location || '',
                    entry.temperature ? `${entry.temperature}°C` : '',
                    entry.notes || ''
               ])
          ].map(row => row.join(',')).join('\n');

          const blob = new Blob([csvContent], { type: 'text/csv' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `chain-of-custody-${currentSample.barcode}.csv`;
          a.click();
          window.URL.revokeObjectURL(url);
     };

     const content = (
          <div className="container-fluid p-4">
               {currentSample && (
                    <div className="d-flex justify-content-between align-items-center mb-4">
                         <div>
                              <h4 className="mb-1">Chain of Custody</h4>
                              <p className="text-muted mb-0">
                                   <RiBarcodeLine size={16} className="me-2" />
                                   Sample: {currentSample.barcode} - {currentSample.patientName}
                              </p>
                         </div>
                         <div className="d-flex gap-2">
                              <Button variant="outline-success" onClick={exportChainOfCustody}>
                                   <RiDownloadLine size={16} className="me-2" />
                                   Export
                              </Button>
                              <Button variant="primary" onClick={() => setShowAddEntryModal(true)}>
                                   <RiAddLine size={16} className="me-2" />
                                   Add Entry
                              </Button>
                         </div>
                    </div>
               )}

               {/* Chain of Custody Timeline */}
               <Card>
                    <Card.Body>
                         {loading ? (
                              <div className="text-center py-4">
                                   <div className="spinner-border text-primary" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                   </div>
                                   <p className="mt-2">Loading chain of custody...</p>
                              </div>
                         ) : chainOfCustody.length > 0 ? (
                              <div className="timeline">
                                   {chainOfCustody.map((entry, index) => (
                                        <div key={entry.id} className="timeline-item">
                                             <div className="timeline-marker">
                                                  {getActionIcon(entry.action)}
                                             </div>
                                             <div className="timeline-content">
                                                  <div className="d-flex justify-content-between align-items-start mb-2">
                                                       <div>
                                                            <h6 className="mb-1">{getActionBadge(entry.action)}</h6>
                                                            <small className="text-muted">
                                                                 {formatDateTime(entry.timestamp)}
                                                            </small>
                                                       </div>
                                                       <div className="text-end">
                                                            <div className="d-flex align-items-center mb-1">
                                                                 <RiUserLine size={14} className="me-1" />
                                                                 <small>{entry.performedByName || entry.performedBy}</small>
                                                            </div>
                                                            {entry.location && (
                                                                 <div className="d-flex align-items-center">
                                                                      <RiMapPinLine size={14} className="me-1" />
                                                                      <small>{entry.location}</small>
                                                                 </div>
                                                            )}
                                                       </div>
                                                  </div>

                                                  {entry.temperature && (
                                                       <div className="d-flex align-items-center mb-2">
                                                            <RiThermometerLine size={14} className="me-1 text-info" />
                                                            <small className="text-muted">Temperature: {entry.temperature}°C</small>
                                                       </div>
                                                  )}

                                                  {entry.notes && (
                                                       <div className="mb-2">
                                                            <p className="mb-0 small">{entry.notes}</p>
                                                       </div>
                                                  )}

                                                  {entry.attachments && entry.attachments.length > 0 && (
                                                       <div className="mb-2">
                                                            <small className="text-muted">
                                                                 Attachments: {entry.attachments.length} file(s)
                                                            </small>
                                                       </div>
                                                  )}
                                             </div>
                                        </div>
                                   ))}
                              </div>
                         ) : (
                              <div className="text-center py-5">
                                   <RiTimeLine size={48} className="text-muted mb-3" />
                                   <h5 className="text-muted">No Chain of Custody Entries</h5>
                                   <p className="text-muted">Start tracking this sample by adding the first entry.</p>
                                   <Button variant="primary" onClick={() => setShowAddEntryModal(true)}>
                                        <RiAddLine size={16} className="me-2" />
                                        Add First Entry
                                   </Button>
                              </div>
                         )}
                    </Card.Body>
               </Card>

               {/* Add Entry Modal */}
               <Modal show={showAddEntryModal} onHide={() => setShowAddEntryModal(false)}>
                    <Modal.Header closeButton>
                         <Modal.Title>Add Chain of Custody Entry</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                         <Form>
                              <Form.Group className="mb-3">
                                   <Form.Label>Action</Form.Label>
                                   <Form.Select
                                        value={entryForm.action}
                                        onChange={(e) => setEntryForm(prev => ({
                                             ...prev,
                                             action: e.target.value as ChainOfCustodyAction
                                        }))}
                                   >
                                        <option value="collected">Collected</option>
                                        <option value="received">Received</option>
                                        <option value="processed">Processed</option>
                                        <option value="stored">Stored</option>
                                        <option value="retrieved">Retrieved</option>
                                        <option value="transferred">Transferred</option>
                                        <option value="tested">Tested</option>
                                        <option value="aliquoted">Aliquoted</option>
                                        <option value="rejected">Rejected</option>
                                        <option value="disposed">Disposed</option>
                                   </Form.Select>
                              </Form.Group>

                              <Form.Group className="mb-3">
                                   <Form.Label>Performed By</Form.Label>
                                   <Form.Control
                                        type="text"
                                        value={entryForm.performedBy}
                                        onChange={(e) => setEntryForm(prev => ({ ...prev, performedBy: e.target.value }))}
                                        placeholder="Enter your name or ID"
                                   />
                              </Form.Group>

                              <Row className="mb-3">
                                   <Col md={6}>
                                        <Form.Group>
                                             <Form.Label>Location</Form.Label>
                                             <Form.Control
                                                  type="text"
                                                  value={entryForm.location}
                                                  onChange={(e) => setEntryForm(prev => ({ ...prev, location: e.target.value }))}
                                                  placeholder="e.g., Lab Room 101, Freezer A"
                                             />
                                        </Form.Group>
                                   </Col>
                                   <Col md={6}>
                                        <Form.Group>
                                             <Form.Label>Temperature (°C)</Form.Label>
                                             <Form.Control
                                                  type="number"
                                                  step="0.1"
                                                  value={entryForm.temperature}
                                                  onChange={(e) => setEntryForm(prev => ({ ...prev, temperature: e.target.value }))}
                                                  placeholder="Optional"
                                             />
                                        </Form.Group>
                                   </Col>
                              </Row>

                              <Form.Group className="mb-3">
                                   <Form.Label>Notes</Form.Label>
                                   <Form.Control
                                        as="textarea"
                                        rows={3}
                                        value={entryForm.notes}
                                        onChange={(e) => setEntryForm(prev => ({ ...prev, notes: e.target.value }))}
                                        placeholder="Describe what happened to the sample..."
                                   />
                              </Form.Group>
                         </Form>
                    </Modal.Body>
                    <Modal.Footer>
                         <Button variant="secondary" onClick={() => setShowAddEntryModal(false)}>
                              Cancel
                         </Button>
                         <Button variant="primary" onClick={handleAddEntry}>
                              Add Entry
                         </Button>
                    </Modal.Footer>
               </Modal>
          </div>
     );

     if (embedded) {
          return content;
     }

     return (
          <Modal show={show} onHide={onHide} size="xl" backdrop="static">
               <Modal.Header closeButton>
                    <Modal.Title>Chain of Custody</Modal.Title>
               </Modal.Header>
               <Modal.Body className="p-0">
                    {content}
               </Modal.Body>
          </Modal>
     );
}