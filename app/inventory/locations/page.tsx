'use client';

import React, { useState, useEffect } from 'react';
import { RiMapPinLine, RiAddLine, RiEditLine, RiDeleteBinLine, RiEyeLine } from '@remixicon/react';
import PrimeTable from '../../../components/accessories/Datatables/PrimeTable';

interface StorageLocation {
     id: string;
     name: string;
     description: string;
     type: 'room' | 'shelf' | 'cabinet' | 'freezer' | 'refrigerator' | 'other';
     temperature?: string;
     capacity?: number;
     currentItems: number;
     status: 'active' | 'maintenance' | 'inactive';
     createdDate: string;
     lastUpdated: string;
}

export default function StorageLocationsPage() {
     const [locations, setLocations] = useState<StorageLocation[]>([]);
     const [showAddModal, setShowAddModal] = useState(false);
     const [selectedLocation, setSelectedLocation] = useState<StorageLocation | null>(null);
     const [loading, setLoading] = useState(false);

     // Form states
     const [locationForm, setLocationForm] = useState({
          name: '',
          description: '',
          type: 'room' as 'room' | 'shelf' | 'cabinet' | 'freezer' | 'refrigerator' | 'other',
          temperature: '',
          capacity: 0
     });

     // Mock data for demonstration
     useEffect(() => {
          const mockLocations: StorageLocation[] = [
               {
                    id: '1',
                    name: 'Storage Room A',
                    description: 'Main storage room for general laboratory supplies',
                    type: 'room',
                    temperature: 'Room temperature (15-25°C)',
                    capacity: 500,
                    currentItems: 45,
                    status: 'active',
                    createdDate: '2025-01-15T10:00:00Z',
                    lastUpdated: '2025-11-09T10:00:00Z'
               },
               {
                    id: '2',
                    name: 'Chemical Storage',
                    description: 'Dedicated storage for chemicals and reagents',
                    type: 'cabinet',
                    temperature: 'Room temperature (15-25°C)',
                    capacity: 200,
                    currentItems: 23,
                    status: 'active',
                    createdDate: '2025-02-20T09:15:00Z',
                    lastUpdated: '2025-11-08T14:30:00Z'
               },
               {
                    id: '3',
                    name: 'Refrigerator Unit 1',
                    description: 'Temperature-controlled storage for sensitive materials',
                    type: 'refrigerator',
                    temperature: '2-8°C',
                    capacity: 100,
                    currentItems: 12,
                    status: 'active',
                    createdDate: '2025-03-10T11:45:00Z',
                    lastUpdated: '2025-11-07T16:20:00Z'
               },
               {
                    id: '4',
                    name: 'Freezer Unit A',
                    description: 'Ultra-low temperature storage for biological samples',
                    type: 'freezer',
                    temperature: '-80°C',
                    capacity: 150,
                    currentItems: 8,
                    status: 'maintenance',
                    createdDate: '2025-04-05T13:30:00Z',
                    lastUpdated: '2025-11-06T09:45:00Z'
               }
          ];

          setLocations(mockLocations);
     }, []);

     const locationColumns = [
          {
               Header: 'Location Name',
               accessor: 'name',
          },
          {
               Header: 'Type',
               accessor: 'type',
               Cell: ({ value }) => (
                    <span className="text-capitalize">
                         {value === 'room' && '🏢 '}
                         {value === 'shelf' && '📚 '}
                         {value === 'cabinet' && '🗄️ '}
                         {value === 'freezer' && '🧊 '}
                         {value === 'refrigerator' && '❄️ '}
                         {value === 'other' && '📦 '}
                         {value}
                    </span>
               )
          },
          {
               Header: 'Temperature',
               accessor: 'temperature',
               Cell: ({ value }) => value || 'Not specified'
          },
          {
               Header: 'Capacity',
               accessor: 'capacity',
               Cell: ({ value }) => value ? `${value} items` : 'Unlimited'
          },
          {
               Header: 'Current Items',
               accessor: 'currentItems',
               Cell: ({ value }) => `${value} items`
          },
          {
               Header: 'Status',
               accessor: 'status',
               Cell: ({ value }) => {
                    switch (value) {
                         case 'active':
                              return <span className="badge bg-success">Active</span>;
                         case 'maintenance':
                              return <span className="badge bg-warning">Maintenance</span>;
                         case 'inactive':
                              return <span className="badge bg-secondary">Inactive</span>;
                         default:
                              return <span className="badge bg-secondary">Unknown</span>;
                    }
               }
          },
          {
               Header: 'Description',
               accessor: 'description',
               Cell: ({ value }) => (
                    <div style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                         {value}
                    </div>
               )
          },
          {
               Header: 'Actions',
               accessor: 'id',
               Cell: ({ row }) => (
                    <div className="d-flex gap-1">
                         <button
                              className="btn btn-sm btn-outline-info"
                              title="View Details"
                              onClick={() => setSelectedLocation(row.original)}
                         >
                              <RiEyeLine size={14} />
                         </button>
                         <button
                              className="btn btn-sm btn-outline-primary"
                              title="Edit Location"
                              onClick={() => handleEditLocation(row.original)}
                         >
                              <RiEditLine size={14} />
                         </button>
                         <button
                              className="btn btn-sm btn-outline-danger"
                              title="Delete Location"
                              onClick={() => handleDeleteLocation(row.original.id)}
                         >
                              <RiDeleteBinLine size={14} />
                         </button>
                    </div>
               )
          }
     ];

     const handleAddLocation = () => {
          if (!locationForm.name) {
               alert('Please enter a location name');
               return;
          }

          const newLocation: StorageLocation = {
               id: Date.now().toString(),
               name: locationForm.name,
               description: locationForm.description,
               type: locationForm.type,
               temperature: locationForm.temperature || undefined,
               capacity: locationForm.capacity || undefined,
               currentItems: 0,
               status: 'active',
               createdDate: new Date().toISOString(),
               lastUpdated: new Date().toISOString()
          };

          setLocations(prev => [...prev, newLocation]);
          setShowAddModal(false);
          resetLocationForm();
     };

     const handleEditLocation = (location: StorageLocation) => {
          setLocationForm({
               name: location.name,
               description: location.description,
               type: location.type,
               temperature: location.temperature || '',
               capacity: location.capacity || 0
          });
          setShowAddModal(true);
     };

     const handleDeleteLocation = (locationId: string) => {
          if (confirm('Are you sure you want to delete this storage location?')) {
               setLocations(prev => prev.filter(location => location.id !== locationId));
          }
     };

     const resetLocationForm = () => {
          setLocationForm({
               name: '',
               description: '',
               type: 'room',
               temperature: '',
               capacity: 0
          });
     };

     return (
          <div className="container-fluid p-4">
               {/* Header */}
               <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                         <h2 className="mb-1">
                              <RiMapPinLine className="me-2" />
                              Storage Locations
                         </h2>
                         <p className="text-muted mb-0">Manage storage locations and facilities</p>
                    </div>
                    <div className="d-flex gap-2">
                         <button
                              className="btn btn-primary btn-sm"
                              onClick={() => setShowAddModal(true)}
                         >
                              <RiAddLine className="me-1" />
                              Add Location
                         </button>
                    </div>
               </div>

               {/* Locations Table */}
               <PrimeTable
                    column={locationColumns}
                    data={locations}
                    filtering={true}
                    handleSeverSideProcessing={false}
                    serverSideFiltering={false}
               />

               {/* Add Location Modal */}
               {showAddModal && (
                    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                         <div className="modal-dialog modal-lg">
                              <div className="modal-content">
                                   <div className="modal-header">
                                        <h5 className="modal-title">Add Storage Location</h5>
                                        <button
                                             type="button"
                                             className="btn-close"
                                             onClick={() => setShowAddModal(false)}
                                        ></button>
                                   </div>
                                   <div className="modal-body">
                                        <div className="row">
                                             <div className="col-md-6">
                                                  <div className="mb-3">
                                                       <label className="form-label">Location Name *</label>
                                                       <input
                                                            type="text"
                                                            className="form-control"
                                                            value={locationForm.name}
                                                            onChange={(e) => setLocationForm(prev => ({ ...prev, name: e.target.value }))}
                                                            placeholder="e.g., Storage Room A"
                                                       />
                                                  </div>
                                                  <div className="mb-3">
                                                       <label className="form-label">Type</label>
                                                       <select
                                                            className="form-select"
                                                            value={locationForm.type}
                                                            onChange={(e) => setLocationForm(prev => ({ ...prev, type: e.target.value as any }))}
                                                       >
                                                            <option value="room">Room</option>
                                                            <option value="shelf">Shelf</option>
                                                            <option value="cabinet">Cabinet</option>
                                                            <option value="freezer">Freezer</option>
                                                            <option value="refrigerator">Refrigerator</option>
                                                            <option value="other">Other</option>
                                                       </select>
                                                  </div>
                                                  <div className="mb-3">
                                                       <label className="form-label">Capacity (items)</label>
                                                       <input
                                                            type="number"
                                                            className="form-control"
                                                            value={locationForm.capacity}
                                                            onChange={(e) => setLocationForm(prev => ({ ...prev, capacity: parseInt(e.target.value) || 0 }))}
                                                            placeholder="Maximum capacity"
                                                            min="0"
                                                       />
                                                  </div>
                                             </div>
                                             <div className="col-md-6">
                                                  <div className="mb-3">
                                                       <label className="form-label">Temperature Range</label>
                                                       <input
                                                            type="text"
                                                            className="form-control"
                                                            value={locationForm.temperature}
                                                            onChange={(e) => setLocationForm(prev => ({ ...prev, temperature: e.target.value }))}
                                                            placeholder="e.g., Room temperature (15-25°C)"
                                                       />
                                                  </div>
                                             </div>
                                        </div>
                                        <div className="mb-3">
                                             <label className="form-label">Description</label>
                                             <textarea
                                                  className="form-control"
                                                  rows={3}
                                                  value={locationForm.description}
                                                  onChange={(e) => setLocationForm(prev => ({ ...prev, description: e.target.value }))}
                                                  placeholder="Location description..."
                                             />
                                        </div>
                                   </div>
                                   <div className="modal-footer">
                                        <button
                                             type="button"
                                             className="btn btn-secondary btn-sm"
                                             onClick={() => setShowAddModal(false)}
                                        >
                                             Cancel
                                        </button>
                                        <button
                                             type="button"
                                             className="btn btn-success btn-sm"
                                             onClick={handleAddLocation}
                                        >
                                             Add Location
                                        </button>
                                   </div>
                              </div>
                         </div>
                    </div>
               )}

               {/* Location Details Modal */}
               {selectedLocation && (
                    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                         <div className="modal-dialog modal-lg">
                              <div className="modal-content">
                                   <div className="modal-header">
                                        <h5 className="modal-title">
                                             <RiMapPinLine className="me-2" />
                                             Location Details
                                        </h5>
                                        <button
                                             type="button"
                                             className="btn-close"
                                             onClick={() => setSelectedLocation(null)}
                                        ></button>
                                   </div>
                                   <div className="modal-body">
                                        <div className="row">
                                             <div className="col-md-6">
                                                  <div className="mb-3">
                                                       <label className="form-label fw-bold">Location Name</label>
                                                       <p className="form-control-plaintext">{selectedLocation.name}</p>
                                                  </div>
                                                  <div className="mb-3">
                                                       <label className="form-label fw-bold">Type</label>
                                                       <p className="form-control-plaintext text-capitalize">
                                                            {selectedLocation.type === 'room' && '🏢 '}
                                                            {selectedLocation.type === 'shelf' && '📚 '}
                                                            {selectedLocation.type === 'cabinet' && '🗄️ '}
                                                            {selectedLocation.type === 'freezer' && '🧊 '}
                                                            {selectedLocation.type === 'refrigerator' && '❄️ '}
                                                            {selectedLocation.type === 'other' && '📦 '}
                                                            {selectedLocation.type}
                                                       </p>
                                                  </div>
                                                  <div className="mb-3">
                                                       <label className="form-label fw-bold">Status</label>
                                                       <p className="form-control-plaintext">
                                                            {selectedLocation.status === 'active' && <span className="badge bg-success">Active</span>}
                                                            {selectedLocation.status === 'maintenance' && <span className="badge bg-warning">Maintenance</span>}
                                                            {selectedLocation.status === 'inactive' && <span className="badge bg-secondary">Inactive</span>}
                                                       </p>
                                                  </div>
                                             </div>
                                             <div className="col-md-6">
                                                  <div className="mb-3">
                                                       <label className="form-label fw-bold">Temperature Range</label>
                                                       <p className="form-control-plaintext">{selectedLocation.temperature || 'Not specified'}</p>
                                                  </div>
                                                  <div className="mb-3">
                                                       <label className="form-label fw-bold">Capacity</label>
                                                       <p className="form-control-plaintext">{selectedLocation.capacity ? `${selectedLocation.capacity} items` : 'Unlimited'}</p>
                                                  </div>
                                                  <div className="mb-3">
                                                       <label className="form-label fw-bold">Current Items</label>
                                                       <p className="form-control-plaintext">{selectedLocation.currentItems} items</p>
                                                  </div>
                                             </div>
                                        </div>
                                        <div className="mb-3">
                                             <label className="form-label fw-bold">Description</label>
                                             <p className="form-control-plaintext">{selectedLocation.description || 'No description provided'}</p>
                                        </div>
                                        <hr />
                                        <div className="row">
                                             <div className="col-md-6">
                                                  <div className="mb-3">
                                                       <label className="form-label fw-bold">Created Date</label>
                                                       <p className="form-control-plaintext">{new Date(selectedLocation.createdDate).toLocaleDateString()}</p>
                                                  </div>
                                             </div>
                                             <div className="col-md-6">
                                                  <div className="mb-3">
                                                       <label className="form-label fw-bold">Last Updated</label>
                                                       <p className="form-control-plaintext">{new Date(selectedLocation.lastUpdated).toLocaleDateString()}</p>
                                                  </div>
                                             </div>
                                        </div>
                                   </div>
                                   <div className="modal-footer">
                                        <button
                                             type="button"
                                             className="btn btn-secondary btn-sm"
                                             onClick={() => setSelectedLocation(null)}
                                        >
                                             Close
                                        </button>
                                        <button
                                             type="button"
                                             className="btn btn-primary btn-sm"
                                             onClick={() => {
                                                  setSelectedLocation(null);
                                                  handleEditLocation(selectedLocation);
                                             }}
                                        >
                                             <RiEditLine className="me-1" />
                                             Edit Location
                                        </button>
                                   </div>
                              </div>
                         </div>
                    </div>
               )}
          </div>
     );
}