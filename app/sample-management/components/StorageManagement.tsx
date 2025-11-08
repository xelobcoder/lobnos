'use client';

import React, { useState, useEffect } from 'react';
import { Button, Form, Modal, Row, Col, Card, Table, Badge, Alert, InputGroup, ProgressBar } from 'react-bootstrap';
import { customFetch, customPost } from '../../../components/Auth/customFetch';
import {
     RiAddLine,
     RiMapPinLine,
     RiThermometerLine,
     RiTimeLine,
     RiAlertLine,
     RiCheckLine,
     RiEditLine,
     RiDeleteBinLine,
     RiEyeLine,
     RiRefreshLine,
     RiArchiveLine,
     RiFridgeLine,
     RiSnowflakeLine
} from '@remixicon/react';
import type { StorageLocation, StorageUnit, TemperatureReading, DUMMY_STORAGE_UNITS } from '../types';

export default function StorageManagement() {
     const [storageUnits, setStorageUnits] = useState<StorageUnit[]>([]);
     const [selectedUnit, setSelectedUnit] = useState<StorageUnit | null>(null);
     const [showUnitModal, setShowUnitModal] = useState(false);
     const [showLocationModal, setShowLocationModal] = useState(false);
     const [showTemperatureModal, setShowTemperatureModal] = useState(false);
     const [loading, setLoading] = useState(true);

     // Form states
     const [unitForm, setUnitForm] = useState({
          id: '',
          name: '',
          type: 'freezer' as 'freezer' | 'refrigerator',
          temperature: -20,
          minTemperature: -25,
          maxTemperature: -15,
          capacity: 100,
          location: '',
          description: ''
     });

     const [locationForm, setLocationForm] = useState({
          unitId: '',
          position: '',
          shelf: '',
          rack: '',
          capacity: 1,
          occupied: false,
          sampleId: '',
          notes: ''
     });

     const [temperatureForm, setTemperatureForm] = useState({
          unitId: '',
          temperature: 0,
          recordedBy: '',
          notes: ''
     });

     useEffect(() => {
          fetchStorageUnits();
     }, []);

     const fetchStorageUnits = async () => {
          try {
               setLoading(true);
               // Use dummy data instead of API call
               setTimeout(() => {
                    setStorageUnits(DUMMY_STORAGE_UNITS);
                    setLoading(false);
               }, 500); // Simulate API delay
          } catch (error) {
               console.error('Error fetching storage units:', error);
               setStorageUnits([]);
               setLoading(false);
          }
     };

     const handleCreateUnit = async () => {
          try {
               const response = await customPost('storage/units', unitForm, 'POST');
               if (response) {
                    alert('Storage unit created successfully');
                    fetchStorageUnits();
                    setShowUnitModal(false);
                    resetUnitForm();
               }
          } catch (error) {
               console.error('Error creating storage unit:', error);
               alert('Failed to create storage unit');
          }
     };

     const handleCreateLocation = async () => {
          try {
               const response = await customPost('storage/locations', locationForm, 'POST');
               if (response) {
                    alert('Storage location created successfully');
                    fetchStorageUnits();
                    setShowLocationModal(false);
                    resetLocationForm();
               }
          } catch (error) {
               console.error('Error creating storage location:', error);
               alert('Failed to create storage location');
          }
     };

     const handleRecordTemperature = async () => {
          try {
               const response = await customPost('storage/temperature', temperatureForm, 'POST');
               if (response) {
                    alert('Temperature recorded successfully');
                    fetchStorageUnits();
                    setShowTemperatureModal(false);
                    resetTemperatureForm();
               }
          } catch (error) {
               console.error('Error recording temperature:', error);
               alert('Failed to record temperature');
          }
     };

     const resetUnitForm = () => {
          setUnitForm({
               id: '',
               name: '',
               type: 'freezer',
               temperature: -20,
               minTemperature: -25,
               maxTemperature: -15,
               capacity: 100,
               location: '',
               description: ''
          });
     };

     const resetLocationForm = () => {
          setLocationForm({
               unitId: '',
               position: '',
               shelf: '',
               rack: '',
               capacity: 1,
               occupied: false,
               sampleId: '',
               notes: ''
          });
     };

     const resetTemperatureForm = () => {
          setTemperatureForm({
               unitId: '',
               temperature: 0,
               recordedBy: '',
               notes: ''
          });
     };

     const getUnitTypeIcon = (type: string) => {
          switch (type) {
               case 'freezer':
                    return <RiSnowflakeLine size={20} className="text-info" />;
               case 'refrigerator':
                    return <RiFridgeLine size={20} className="text-primary" />;
               default:
                    return <RiArchiveLine size={20} className="text-secondary" />;
          }
     };

     const getTemperatureStatus = (unit: StorageUnit) => {
          const currentTemp = unit.currentTemperature || unit.temperature;
          const minTemp = unit.minTemperature;
          const maxTemp = unit.maxTemperature;

          if (currentTemp < minTemp || currentTemp > maxTemp) {
               return { status: 'danger', text: 'Out of Range' };
          } else if (currentTemp >= minTemp + 2 || currentTemp <= maxTemp - 2) {
               return { status: 'warning', text: 'Near Limit' };
          } else {
               return { status: 'success', text: 'Optimal' };
          }
     };

     const getCapacityPercentage = (unit: StorageUnit) => {
          const totalLocations = unit.locations?.length || 0;
          const occupiedLocations = unit.locations?.filter(loc => loc.occupied).length || 0;
          return totalLocations > 0 ? (occupiedLocations / totalLocations) * 100 : 0;
     };

     if (loading) {
          return (
               <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                         <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-2">Loading storage units...</p>
               </div>
          );
     }

     return (
          <div className="container-fluid p-4">
               <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                         <h3 className="mb-1">Storage Management</h3>
                         <p className="text-muted mb-0">Monitor and manage sample storage locations</p>
                    </div>
                    <div className="d-flex gap-2">
                         <Button variant="outline-primary" onClick={fetchStorageUnits}>
                              <RiRefreshLine size={16} className="me-2" />
                              Refresh
                         </Button>
                         <Button variant="primary" onClick={() => setShowUnitModal(true)}>
                              <RiAddLine size={16} className="me-2" />
                              Add Storage Unit
                         </Button>
                    </div>
               </div>

               {/* Storage Units Overview */}
               <Row className="g-4 mb-4">
                    {storageUnits.map((unit) => {
                         const tempStatus = getTemperatureStatus(unit);
                         const capacityPercent = getCapacityPercentage(unit);

                         return (
                              <Col md={6} lg={4} key={unit.id}>
                                   <Card className="h-100">
                                        <Card.Body>
                                             <div className="d-flex align-items-center justify-content-between mb-3">
                                                  <div className="d-flex align-items-center">
                                                       {getUnitTypeIcon(unit.type)}
                                                       <div className="ms-2">
                                                            <h6 className="mb-0">{unit.name}</h6>
                                                            <small className="text-muted text-capitalize">{unit.type}</small>
                                                       </div>
                                                  </div>
                                                  <Badge bg={tempStatus.status}>{tempStatus.text}</Badge>
                                             </div>

                                             <div className="mb-3">
                                                  <div className="d-flex justify-content-between align-items-center mb-1">
                                                       <small className="text-muted">Temperature</small>
                                                       <small className="fw-semibold">
                                                            {unit.currentTemperature || unit.temperature}°C
                                                       </small>
                                                  </div>
                                                  <div className="d-flex justify-content-between text-muted">
                                                       <small>{unit.minTemperature}°C</small>
                                                       <small>{unit.maxTemperature}°C</small>
                                                  </div>
                                             </div>

                                             <div className="mb-3">
                                                  <div className="d-flex justify-content-between align-items-center mb-1">
                                                       <small className="text-muted">Capacity</small>
                                                       <small className="fw-semibold">{Math.round(capacityPercent)}%</small>
                                                  </div>
                                                  <ProgressBar
                                                       now={capacityPercent}
                                                       variant={capacityPercent > 90 ? 'danger' : capacityPercent > 70 ? 'warning' : 'success'}
                                                       className="mb-2"
                                                       style={{ height: '6px' }}
                                                  />
                                                  <small className="text-muted">
                                                       {unit.locations?.filter(loc => loc.occupied).length || 0} / {unit.locations?.length || 0} positions
                                                  </small>
                                             </div>

                                             <div className="d-flex gap-1">
                                                  <Button
                                                       variant="outline-info"
                                                       size="sm"
                                                       onClick={() => setSelectedUnit(unit)}
                                                  >
                                                       <RiEyeLine size={14} />
                                                  </Button>
                                                  <Button
                                                       variant="outline-primary"
                                                       size="sm"
                                                       onClick={() => {
                                                            setTemperatureForm(prev => ({ ...prev, unitId: unit.id }));
                                                            setShowTemperatureModal(true);
                                                       }}
                                                  >
                                                       <RiThermometerLine size={14} />
                                                  </Button>
                                                  <Button
                                                       variant="outline-success"
                                                       size="sm"
                                                       onClick={() => {
                                                            setLocationForm(prev => ({ ...prev, unitId: unit.id }));
                                                            setShowLocationModal(true);
                                                       }}
                                                  >
                                                       <RiAddLine size={14} />
                                                  </Button>
                                             </div>
                                        </Card.Body>
                                   </Card>
                              </Col>
                         );
                    })}
               </Row>

               {storageUnits.length === 0 && (
                    <div className="text-center py-5">
                         <RiArchiveLine size={48} className="text-muted mb-3" />
                         <h5 className="text-muted">No Storage Units</h5>
                         <p className="text-muted">Add your first storage unit to start managing sample locations.</p>
                         <Button variant="primary" onClick={() => setShowUnitModal(true)}>
                              <RiAddLine size={16} className="me-2" />
                              Add Storage Unit
                         </Button>
                    </div>
               )}

               {/* Storage Unit Modal */}
               <Modal show={showUnitModal} onHide={() => setShowUnitModal(false)} size="lg">
                    <Modal.Header closeButton>
                         <Modal.Title>Add Storage Unit</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                         <Form>
                              <Row className="mb-3">
                                   <Col md={6}>
                                        <Form.Group>
                                             <Form.Label>Unit Name</Form.Label>
                                             <Form.Control
                                                  type="text"
                                                  value={unitForm.name}
                                                  onChange={(e) => setUnitForm(prev => ({ ...prev, name: e.target.value }))}
                                                  placeholder="e.g., Freezer A, Refrigerator 1"
                                             />
                                        </Form.Group>
                                   </Col>
                                   <Col md={6}>
                                        <Form.Group>
                                             <Form.Label>Unit Type</Form.Label>
                                             <Form.Select
                                                  value={unitForm.type}
                                                  onChange={(e) => setUnitForm(prev => ({ ...prev, type: e.target.value as 'freezer' | 'refrigerator' }))}
                                             >
                                                  <option value="freezer">Freezer</option>
                                                  <option value="refrigerator">Refrigerator</option>
                                             </Form.Select>
                                        </Form.Group>
                                   </Col>
                              </Row>

                              <Row className="mb-3">
                                   <Col md={4}>
                                        <Form.Group>
                                             <Form.Label>Target Temperature (°C)</Form.Label>
                                             <Form.Control
                                                  type="number"
                                                  step="0.1"
                                                  value={unitForm.temperature}
                                                  onChange={(e) => setUnitForm(prev => ({ ...prev, temperature: parseFloat(e.target.value) }))}
                                             />
                                        </Form.Group>
                                   </Col>
                                   <Col md={4}>
                                        <Form.Group>
                                             <Form.Label>Min Temperature (°C)</Form.Label>
                                             <Form.Control
                                                  type="number"
                                                  step="0.1"
                                                  value={unitForm.minTemperature}
                                                  onChange={(e) => setUnitForm(prev => ({ ...prev, minTemperature: parseFloat(e.target.value) }))}
                                             />
                                        </Form.Group>
                                   </Col>
                                   <Col md={4}>
                                        <Form.Group>
                                             <Form.Label>Max Temperature (°C)</Form.Label>
                                             <Form.Control
                                                  type="number"
                                                  step="0.1"
                                                  value={unitForm.maxTemperature}
                                                  onChange={(e) => setUnitForm(prev => ({ ...prev, maxTemperature: parseFloat(e.target.value) }))}
                                             />
                                        </Form.Group>
                                   </Col>
                              </Row>

                              <Row className="mb-3">
                                   <Col md={6}>
                                        <Form.Group>
                                             <Form.Label>Capacity (positions)</Form.Label>
                                             <Form.Control
                                                  type="number"
                                                  value={unitForm.capacity}
                                                  onChange={(e) => setUnitForm(prev => ({ ...prev, capacity: parseInt(e.target.value) }))}
                                             />
                                        </Form.Group>
                                   </Col>
                                   <Col md={6}>
                                        <Form.Group>
                                             <Form.Label>Physical Location</Form.Label>
                                             <Form.Control
                                                  type="text"
                                                  value={unitForm.location}
                                                  onChange={(e) => setUnitForm(prev => ({ ...prev, location: e.target.value }))}
                                                  placeholder="e.g., Lab Room 101"
                                             />
                                        </Form.Group>
                                   </Col>
                              </Row>

                              <Form.Group className="mb-3">
                                   <Form.Label>Description</Form.Label>
                                   <Form.Control
                                        as="textarea"
                                        rows={3}
                                        value={unitForm.description}
                                        onChange={(e) => setUnitForm(prev => ({ ...prev, description: e.target.value }))}
                                        placeholder="Additional notes about this storage unit"
                                   />
                              </Form.Group>
                         </Form>
                    </Modal.Body>
                    <Modal.Footer>
                         <Button variant="secondary" onClick={() => setShowUnitModal(false)}>
                              Cancel
                         </Button>
                         <Button variant="primary" onClick={handleCreateUnit}>
                              Create Unit
                         </Button>
                    </Modal.Footer>
               </Modal>

               {/* Storage Location Modal */}
               <Modal show={showLocationModal} onHide={() => setShowLocationModal(false)}>
                    <Modal.Header closeButton>
                         <Modal.Title>Add Storage Location</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                         <Form>
                              <Row className="mb-3">
                                   <Col md={6}>
                                        <Form.Group>
                                             <Form.Label>Storage Unit</Form.Label>
                                             <Form.Select
                                                  value={locationForm.unitId}
                                                  onChange={(e) => setLocationForm(prev => ({ ...prev, unitId: e.target.value }))}
                                             >
                                                  <option value="">Select unit...</option>
                                                  {storageUnits.map((unit) => (
                                                       <option key={unit.id} value={unit.id}>{unit.name}</option>
                                                  ))}
                                             </Form.Select>
                                        </Form.Group>
                                   </Col>
                                   <Col md={6}>
                                        <Form.Group>
                                             <Form.Label>Position</Form.Label>
                                             <Form.Control
                                                  type="text"
                                                  value={locationForm.position}
                                                  onChange={(e) => setLocationForm(prev => ({ ...prev, position: e.target.value }))}
                                                  placeholder="e.g., A1, B2, C3"
                                             />
                                        </Form.Group>
                                   </Col>
                              </Row>

                              <Row className="mb-3">
                                   <Col md={6}>
                                        <Form.Group>
                                             <Form.Label>Shelf</Form.Label>
                                             <Form.Control
                                                  type="text"
                                                  value={locationForm.shelf}
                                                  onChange={(e) => setLocationForm(prev => ({ ...prev, shelf: e.target.value }))}
                                                  placeholder="e.g., Shelf 1, Top Shelf"
                                             />
                                        </Form.Group>
                                   </Col>
                                   <Col md={6}>
                                        <Form.Group>
                                             <Form.Label>Rack</Form.Label>
                                             <Form.Control
                                                  type="text"
                                                  value={locationForm.rack}
                                                  onChange={(e) => setLocationForm(prev => ({ ...prev, rack: e.target.value }))}
                                                  placeholder="e.g., Rack A, Left Rack"
                                             />
                                        </Form.Group>
                                   </Col>
                              </Row>

                              <Form.Group className="mb-3">
                                   <Form.Label>Notes</Form.Label>
                                   <Form.Control
                                        as="textarea"
                                        rows={2}
                                        value={locationForm.notes}
                                        onChange={(e) => setLocationForm(prev => ({ ...prev, notes: e.target.value }))}
                                        placeholder="Additional notes about this location"
                                   />
                              </Form.Group>
                         </Form>
                    </Modal.Body>
                    <Modal.Footer>
                         <Button variant="secondary" onClick={() => setShowLocationModal(false)}>
                              Cancel
                         </Button>
                         <Button variant="primary" onClick={handleCreateLocation}>
                              Create Location
                         </Button>
                    </Modal.Footer>
               </Modal>

               {/* Temperature Recording Modal */}
               <Modal show={showTemperatureModal} onHide={() => setShowTemperatureModal(false)}>
                    <Modal.Header closeButton>
                         <Modal.Title>Record Temperature</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                         <Form>
                              <Form.Group className="mb-3">
                                   <Form.Label>Storage Unit</Form.Label>
                                   <Form.Select
                                        value={temperatureForm.unitId}
                                        onChange={(e) => setTemperatureForm(prev => ({ ...prev, unitId: e.target.value }))}
                                   >
                                        <option value="">Select unit...</option>
                                        {storageUnits.map((unit) => (
                                             <option key={unit.id} value={unit.id}>{unit.name}</option>
                                        ))}
                                   </Form.Select>
                              </Form.Group>

                              <Form.Group className="mb-3">
                                   <Form.Label>Temperature (°C)</Form.Label>
                                   <InputGroup>
                                        <Form.Control
                                             type="number"
                                             step="0.1"
                                             value={temperatureForm.temperature}
                                             onChange={(e) => setTemperatureForm(prev => ({ ...prev, temperature: parseFloat(e.target.value) }))}
                                        />
                                        <InputGroup.Text>°C</InputGroup.Text>
                                   </InputGroup>
                              </Form.Group>

                              <Form.Group className="mb-3">
                                   <Form.Label>Recorded By</Form.Label>
                                   <Form.Control
                                        type="text"
                                        value={temperatureForm.recordedBy}
                                        onChange={(e) => setTemperatureForm(prev => ({ ...prev, recordedBy: e.target.value }))}
                                        placeholder="Enter your name"
                                   />
                              </Form.Group>

                              <Form.Group className="mb-3">
                                   <Form.Label>Notes</Form.Label>
                                   <Form.Control
                                        as="textarea"
                                        rows={2}
                                        value={temperatureForm.notes}
                                        onChange={(e) => setTemperatureForm(prev => ({ ...prev, notes: e.target.value }))}
                                        placeholder="Additional notes about the reading"
                                   />
                              </Form.Group>
                         </Form>
                    </Modal.Body>
                    <Modal.Footer>
                         <Button variant="secondary" onClick={() => setShowTemperatureModal(false)}>
                              Cancel
                         </Button>
                         <Button variant="primary" onClick={handleRecordTemperature}>
                              Record Temperature
                         </Button>
                    </Modal.Footer>
               </Modal>
          </div>
     );
}