'use client';

import React, { useState, useEffect } from 'react';
import { RiMapPinLine, RiAddLine, RiEditLine, RiDeleteBinLine, RiEyeLine } from '@remixicon/react';
import PrimeTable from '../../../components/accessories/Datatables/PrimeTable';
import { customFetch, customPost } from '../../../components/Auth/customFetch';
import { useApplicationSettings } from '../../../components/Auth/useApplicationContext';
import { toast } from 'react-toastify';

interface StorageLocation {
     id: string;
     name: string;
     description: string;
     capacity?: number;
     temperature_controlled?: boolean;
     hazardous_materials?: boolean;
     is_active?: boolean;
     temperature_range?: string;
     current_items?: number;
     created_at: string;
     updated_at: string;
}

export default function StorageLocationsPage() {
     const { branchid, user } = useApplicationSettings().applicationsettings || {};
     const employeeid = user?.employeeid;
     const [locations, setLocations] = useState<StorageLocation[]>([]);
     const [showAddModal, setShowAddModal] = useState(false);
     const [selectedLocation, setSelectedLocation] = useState<StorageLocation | null>(null);
     const [loading, setLoading] = useState(false);

     // Form states
     const [locationForm, setLocationForm] = useState({
          name: '',
          description: '',
          capacity: 0,
          temperature_controlled: false,
          hazardous_materials: false,
          is_active: true,
          temperature_range: ''
     });

     // Load locations from API
     useEffect(() => {
          if (branchid && employeeid) {
               loadLocations();
          }
     }, [branchid, employeeid]);

     const loadLocations = async () => {
          try {
               setLoading(true);
               const response = await customFetch(`inventory/storage-locations?branchid=${branchid}&employeeid=${employeeid}`);
               const data = Array.isArray(response) ? response : (response?.data || response?.result || []);
               const mappedLocations = (data || []).map((loc: any) => ({
                    id: loc.id?.toString() || String(loc.id),
                    name: loc.name,
                    description: loc.description,
                    capacity: loc.capacity,
                    temperature_controlled: loc.temperature_controlled,
                    hazardous_materials: loc.hazardous_materials,
                    is_active: loc.is_active,
                    temperature_range: loc.temperature_range,
                    current_items: loc.current_items || 0,
                    created_at: loc.created_at,
                    updated_at: loc.updated_at
               }));
               setLocations(mappedLocations);
          } catch (error) {
               console.error('Error loading locations:', error);
          } finally {
               setLoading(false);
          }
     };

     const handleServerSideProcessing = async ({ page, count, sortby = 'ASC' }: { page: number; count: number; sortby?: string }) => {
          try {
               // Build query parameters for server-side filtering
               const params = new URLSearchParams({
                    page: page.toString(),
                    count: count.toString(),
                    branchid: branchid?.toString() || '',
                    employeeid: employeeid?.toString() || '',
               });

               if (sortby) {
                    params.append('sortby', sortby);
               }

               const endpoint = `inventory/storage-locations?${params.toString()}`;
               const response = await customFetch(endpoint);

               const data = Array.isArray(response) ? response : (response?.data || response?.result || []);
               const mappedLocations = (data || []).map((loc: any) => ({
                    id: loc.id?.toString() || String(loc.id),
                    name: loc.name,
                    description: loc.description,
                    capacity: loc.capacity,
                    temperature_controlled: loc.temperature_controlled,
                    hazardous_materials: loc.hazardous_materials,
                    is_active: loc.is_active,
                    temperature_range: loc.temperature_range,
                    current_items: loc.current_items || 0,
                    created_at: loc.created_at,
                    updated_at: loc.updated_at
               }));

               return { result: mappedLocations, error: false };
          } catch (error) {
               console.error('Error in server-side processing:', error);
               return { result: [], error: true };
          }
     };

     const locationColumns = [
          {
               Header: 'Location Name',
               accessor: 'name',
          },
          {
               Header: 'Type',
               accessor: 'temperature_controlled',
               Cell: ({ value }) => value ? '❄️ Temperature Controlled' : '🏢 Standard Storage'
          },
          {
               Header: 'Capacity',
               accessor: 'capacity',
               Cell: ({ value }) => value ? `${value} items` : 'Unlimited'
          },
          {
               Header: 'Current Items',
               accessor: 'current_items',
               Cell: ({ value }) => `${value} items`
          },
          {
               Header: 'Status',
               accessor: 'is_active',
               Cell: ({ value }) => value ? <span className="badge bg-success">Active</span> : <span className="badge bg-secondary">Inactive</span>
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

     const handleAddLocation = async () => {
          if (!locationForm.name) {
               toast.error('Please enter a location name');
               return;
          }

          try {
               setLoading(true);
               const locationData = {
                    name: locationForm.name,
                    description: locationForm.description,
                    capacity: locationForm.capacity || null,
                    temperature_controlled: locationForm.temperature_controlled,
                    hazardous_materials: locationForm.hazardous_materials,
                    is_active: locationForm.is_active,
                    temperature_range: locationForm.temperature_range,
                    branchid: branchid,
                    employeeid: employeeid
               };

               const resp = await customPost('inventory/storage-locations', 'POST', locationData);
               if (resp && (resp.success === true || resp.status === 'success' || resp.statusCode === 200)) {
                    toast.success(resp.message || 'Location added');
                    await loadLocations(); // Reload locations
                    setShowAddModal(false);
                    resetLocationForm();
               } else {
                    const errMsg = resp?.error?.message || resp?.message || 'Failed to add location';
                    toast.error(errMsg);
               }
          } catch (error) {
               console.error('Error adding location:', error);
               toast.error('Error adding location');
          } finally {
               setLoading(false);
          }
     };

     const handleEditLocation = (location: StorageLocation) => {
          setLocationForm({
               name: location.name,
               description: location.description,
               capacity: location.capacity || 0,
               temperature_controlled: location.temperature_controlled || false,
               hazardous_materials: location.hazardous_materials || false,
               is_active: location.is_active !== undefined ? location.is_active : true,
               temperature_range: location.temperature_range || ''
          });
          setSelectedLocation(location);
          setShowAddModal(true);
     };

     const handleUpdateLocation = async () => {
          if (!locationForm.name || !selectedLocation) {
               toast.error('Please enter a location name');
               return;
          }

          try {
               setLoading(true);
               const locationData = {
                    name: locationForm.name,
                    description: locationForm.description,
                    capacity: locationForm.capacity || null,
                    temperature_controlled: locationForm.temperature_controlled,
                    hazardous_materials: locationForm.hazardous_materials,
                    is_active: locationForm.is_active,
                    temperature_range: locationForm.temperature_range,
                    branchid: branchid,
                    employeeid: employeeid
               };

               const resp = await customPost(`inventory/storage-locations/${selectedLocation.id}`, 'PUT', locationData);
               if (resp && (resp.success === true || resp.status === 'success' || resp.statusCode === 200)) {
                    toast.success(resp.message || 'Location updated');
                    await loadLocations(); // Reload locations
                    setShowAddModal(false);
                    setSelectedLocation(null);
                    resetLocationForm();
               } else {
                    const errMsg = resp?.error?.message || resp?.message || 'Failed to update location';
                    toast.error(errMsg);
               }
          } catch (error) {
               console.error('Error updating location:', error);
               toast.error('Error updating location');
          } finally {
               setLoading(false);
          }
     };

     const handleDeleteLocation = async (locationId: string) => {
          if (!confirm('Are you sure you want to delete this storage location?')) return;

          try {
               setLoading(true);
               const resp = await customPost(`inventory/storage-locations/${locationId}`, 'DELETE', { branchid, employeeid });
               if (resp && (resp.success === true || resp.status === 'success' || resp.statusCode === 200)) {
                    toast.success(resp.message || 'Location deleted');
                    await loadLocations(); // Reload locations
               } else {
                    const errMsg = resp?.error?.message || resp?.message || 'Failed to delete location';
                    toast.error(errMsg);
               }
          } catch (error) {
               console.error('Error deleting location:', error);
               toast.error('Error deleting location');
          } finally {
               setLoading(false);
          }
     };

     const resetLocationForm = () => {
          setLocationForm({
               name: '',
               description: '',
               capacity: 0,
               temperature_controlled: false,
               hazardous_materials: false,
               is_active: true,
               temperature_range: ''
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
                    handleSeverSideProcessing={handleServerSideProcessing}
                    serverSideFiltering={true}
               />

               {/* Add Location Modal */}
               {showAddModal && (
                    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                         <div className="modal-dialog modal-lg">
                              <div className="modal-content">
                                   <div className="modal-header">
                                        <h5 className="modal-title">{selectedLocation ? 'Edit Storage Location' : 'Add Storage Location'}</h5>
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
                                                  <div className="mb-3">
                                                       <label className="form-label">Temperature Range</label>
                                                       <input
                                                            type="text"
                                                            className="form-control"
                                                            value={locationForm.temperature_range}
                                                            onChange={(e) => setLocationForm(prev => ({ ...prev, temperature_range: e.target.value }))}
                                                            placeholder="e.g., -20°C to 25°C"
                                                       />
                                                  </div>
                                                  <div className="mb-3">
                                                       <div className="form-check">
                                                            <input
                                                                 className="form-check-input"
                                                                 type="checkbox"
                                                                 id="temperature_controlled"
                                                                 checked={locationForm.temperature_controlled}
                                                                 onChange={(e) => setLocationForm(prev => ({ ...prev, temperature_controlled: e.target.checked }))}
                                                            />
                                                            <label className="form-check-label" htmlFor="temperature_controlled">
                                                                 Temperature Controlled
                                                            </label>
                                                       </div>
                                                  </div>
                                             </div>
                                             <div className="col-md-6">
                                                  <div className="mb-3">
                                                       <div className="form-check">
                                                            <input
                                                                 className="form-check-input"
                                                                 type="checkbox"
                                                                 id="hazardous_materials"
                                                                 checked={locationForm.hazardous_materials}
                                                                 onChange={(e) => setLocationForm(prev => ({ ...prev, hazardous_materials: e.target.checked }))}
                                                            />
                                                            <label className="form-check-label" htmlFor="hazardous_materials">
                                                                 Hazardous Materials Storage
                                                            </label>
                                                       </div>
                                                  </div>
                                                  <div className="mb-3">
                                                       <div className="form-check">
                                                            <input
                                                                 className="form-check-input"
                                                                 type="checkbox"
                                                                 id="is_active"
                                                                 checked={locationForm.is_active}
                                                                 onChange={(e) => setLocationForm(prev => ({ ...prev, is_active: e.target.checked }))}
                                                            />
                                                            <label className="form-check-label" htmlFor="is_active">
                                                                 Active
                                                            </label>
                                                       </div>
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
                                             onClick={() => {
                                                  setShowAddModal(false);
                                                  setSelectedLocation(null);
                                                  resetLocationForm();
                                             }}
                                        >
                                             Cancel
                                        </button>
                                        <button
                                             type="button"
                                             className="btn btn-success btn-sm"
                                             onClick={selectedLocation ? handleUpdateLocation : handleAddLocation}
                                             disabled={loading}
                                        >
                                             {loading ? 'Saving...' : selectedLocation ? 'Update Location' : 'Add Location'}
                                        </button>
                                   </div>
                              </div>
                         </div>
                    </div>
               )}

               {/* Location Details Modal */}
               {selectedLocation && !showAddModal && (
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
                                                       <p className="form-control-plaintext">
                                                            {selectedLocation.temperature_controlled ? '❄️ Temperature Controlled' : '🏢 Standard Storage'}
                                                       </p>
                                                  </div>
                                                  <div className="mb-3">
                                                       <label className="form-label fw-bold">Status</label>
                                                       <p className="form-control-plaintext">
                                                            {selectedLocation.is_active ? <span className="badge bg-success">Active</span> : <span className="badge bg-secondary">Inactive</span>}
                                                       </p>
                                                  </div>
                                             </div>
                                             <div className="col-md-6">
                                                  <div className="mb-3">
                                                       <label className="form-label fw-bold">Capacity</label>
                                                       <p className="form-control-plaintext">{selectedLocation.capacity ? `${selectedLocation.capacity} items` : 'Unlimited'}</p>
                                                  </div>
                                                  <div className="mb-3">
                                                       <label className="form-label fw-bold">Temperature Range</label>
                                                       <p className="form-control-plaintext">{selectedLocation.temperature_range || 'Not specified'}</p>
                                                  </div>
                                                  <div className="mb-3">
                                                       <label className="form-label fw-bold">Current Items</label>
                                                       <p className="form-control-plaintext">{selectedLocation.current_items} items</p>
                                                  </div>
                                                  <div className="mb-3">
                                                       <label className="form-label fw-bold">Hazardous Materials</label>
                                                       <p className="form-control-plaintext">{selectedLocation.hazardous_materials ? 'Yes' : 'No'}</p>
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
                                                       <p className="form-control-plaintext">{new Date(selectedLocation.created_at).toLocaleDateString()}</p>
                                                  </div>
                                             </div>
                                             <div className="col-md-6">
                                                  <div className="mb-3">
                                                       <label className="form-label fw-bold">Last Updated</label>
                                                       <p className="form-control-plaintext">{new Date(selectedLocation.updated_at).toLocaleDateString()}</p>
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