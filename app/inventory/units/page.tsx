'use client';

import React, { useState, useEffect } from 'react';
import { RiRulerLine, RiAddLine, RiEditLine, RiDeleteBinLine, RiEyeLine, RiCheckLine, RiCloseLine } from '@remixicon/react';
import PrimeTable from '../../../components/accessories/Datatables/PrimeTable';
import { customFetch, customPost } from '../../../components/Auth/customFetch';
import { useApplicationSettings } from '../../../components/Auth/useApplicationContext';
import { toast } from 'react-toastify';

interface Unit {
     id: string;
     name: string;
     description: string;
     is_standard: number;
     created_at?: string;
     updated_at?: string;
}

export default function UnitsPage() {
     const { branchid, user } = useApplicationSettings().applicationsettings || {};
     const employeeid = user?.employeeid;

     const [units, setUnits] = useState<Unit[]>([]);
     const [loading, setLoading] = useState(false);
     const [showAddModal, setShowAddModal] = useState(false);
     const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
     const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);

     // Form state
     const [unitForm, setUnitForm] = useState({
          name: '',
          description: ''
     });

     // Load units
     const loadUnits = async () => {
          try {
               setLoading(true);
               const response = await customFetch(`inventory/units?branchid=${branchid}&employeeid=${employeeid}`);

               if (response.success) {
                    setUnits(response.data?.units || []);
               } else {
                    toast.error('Failed to load units');
               }
          } catch (err) {
               console.error('Error loading units:', err);
               toast.error('Failed to load units');
          } finally {
               setLoading(false);
          }
     };

     useEffect(() => {
          if (branchid && employeeid) {
               loadUnits();
          }
     }, [branchid, employeeid]);

     const handleServerSideProcessing = async ({ page, count, sortby = 'ASC' }: { page: number; count: number; sortby?: string }) => {
          try {
               const params = new URLSearchParams({
                    page: page.toString(),
                    count: count.toString(),
               });

               if (sortby) {
                    params.append('sortby', sortby);
               }

               const endpoint = `inventory/units?${params.toString()}`;
               const response = await customFetch(endpoint);

               if (response.success) {
                    return { result: response.data?.units || [], error: false };
               } else {
                    return { result: [], error: false };
               }
          } catch (error) {
               console.error('Error in server-side processing:', error);
               return { result: [], error: true };
          }
     };

     const unitColumns = [
          {
               Header: 'Unit Name',
               accessor: 'name',
               Cell: ({ row }) => (
                    <div>
                         <span className="fw-bold">{row.original.name}</span>
                         {row.original.is_standard === 1 && (
                              <span className="text-muted ms-2">(Standard)</span>
                         )}
                    </div>
               )
          },
          {
               Header: 'Description',
               accessor: 'description',
               Cell: ({ value }) => (
                    <div style={{ maxWidth: '400px' }} className="text-truncate" title={value}>
                         {value || 'No description'}
                    </div>
               )
          },
          {
               Header: 'Type',
               accessor: 'is_standard',
               Cell: ({ value }) => (
                    <span className={value === 1 ? 'text-primary' : 'text-success'}>
                         {value === 1 ? 'Standard' : 'Custom'}
                    </span>
               )
          },
          {
               Header: 'Actions',
               accessor: 'id',
               Cell: ({ row }) => (
                    <div className="d-flex gap-1">
                         {row.original.is_standard !== 1 && (
                              <>
                                   <button
                                        className="btn btn-sm btn-outline-primary"
                                        title="Edit Unit"
                                        onClick={() => handleEditUnit(row.original)}
                                   >
                                        <RiEditLine size={14} className="me-1" /> Edit
                                   </button>
                                   <button
                                        className="btn btn-sm btn-outline-danger"
                                        title="Delete Unit"
                                        onClick={() => handleDeleteUnit(row.original.id)}
                                   >
                                        <RiDeleteBinLine size={14} className="me-1" /> Delete
                                   </button>
                              </>
                         )}
                    </div>
               )
          }
     ];

     const handleAddUnit = async () => {
          if (!unitForm.name.trim()) {
               toast.error('Please enter a unit name');
               return;
          }

          try {
               setLoading(true);
               const unitData = {
                    name: unitForm.name.trim(),
                    description: unitForm.description.trim()
               };

               const response = await customPost('inventory/units', 'POST', unitData);

               if (response.success) {
                    setUnits(prev => [response.data, ...prev]);
                    setShowAddModal(false);
                    resetUnitForm();
                    toast.success('Unit created successfully!');
               } else {
                    toast.error(response.error?.message || 'Failed to create unit');
               }
          } catch (err) {
               console.error('Error creating unit:', err);
               toast.error('Failed to create unit');
          } finally {
               setLoading(false);
          }
     };

     const handleUpdateUnit = async () => {
          if (!editingUnit || !unitForm.name.trim()) {
               toast.error('Please enter a unit name');
               return;
          }

          try {
               setLoading(true);
               const unitData = {
                    name: unitForm.name.trim(),
                    description: unitForm.description.trim()
               };

               const response = await customPost(`inventory/units/${editingUnit.id}`, 'PUT', unitData);

               if (response.success) {
                    setUnits(prev => prev.map(unit =>
                         unit.id === editingUnit.id ? response.data : unit
                    ));
                    setShowAddModal(false);
                    setEditingUnit(null);
                    resetUnitForm();
                    toast.success('Unit updated successfully!');
               } else {
                    toast.error(response.error?.message || 'Failed to update unit');
               }
          } catch (err) {
               console.error('Error updating unit:', err);
               toast.error('Failed to update unit');
          } finally {
               setLoading(false);
          }
     };

     const handleDeleteUnit = async (unitId: string) => {
          if (!confirm('Are you sure you want to delete this unit? This action cannot be undone.')) return;

          try {
               setLoading(true);
               const response = await customPost(`inventory/units/${unitId}`, 'DELETE', {});

               if (response.success) {
                    setUnits(prev => prev.filter(unit => unit.id !== unitId));
                    toast.success('Unit deleted successfully!');
               } else {
                    toast.error(response.error?.message || 'Failed to delete unit');
               }
          } catch (err) {
               console.error('Error deleting unit:', err);
               toast.error('Failed to delete unit');
          } finally {
               setLoading(false);
          }
     };

     const handleEditUnit = (unit: Unit) => {
          setUnitForm({
               name: unit.name,
               description: unit.description || ''
          });
          setEditingUnit(unit);
          setShowAddModal(true);
     };

     const handleViewUnit = (unit: Unit) => {
          setSelectedUnit(unit);
     };

     const resetUnitForm = () => {
          setUnitForm({
               name: '',
               description: ''
          });
     };

     const standardUnits = units.filter(unit => unit.is_standard);

     return (
          <div className="container-fluid p-4">
               {/* Header */}
               <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                         <h2 className="mb-1">
                              <RiRulerLine className="me-2" />
                              Unit Management
                         </h2>
                         <p className="text-muted mb-0">Manage measurement units for inventory items</p>
                    </div>
                    <div className="d-flex gap-2">
                         <button
                              className="btn btn-outline-primary btn-sm"
                              onClick={() => {
                                   setEditingUnit(null);
                                   setShowAddModal(true);
                              }}
                         >
                              <RiAddLine className="me-1" />
                              Add Custom Unit
                         </button>
                    </div>
               </div>

               {/* Summary Cards */}
               <div className="row g-3 mb-4">
                    <div className="col-md-6">
                         <div className="border rounded h-100">
                              <div className="p-3">
                                   <div className="d-flex align-items-center justify-content-between">
                                        <div>
                                             <p className="text-muted mb-1 small">Total Units</p>
                                             <h3 className="mb-0">{units.length}</h3>
                                        </div>
                                        <div className="bg-primary bg-opacity-10 p-3 rounded">
                                             <RiRulerLine size={24} className="text-primary" />
                                        </div>
                                   </div>
                              </div>
                         </div>
                    </div>
                    <div className="col-md-6">
                         <div className="border rounded h-100">
                              <div className="p-3">
                                   <div className="d-flex align-items-center justify-content-between">
                                        <div>
                                             <p className="text-muted mb-1 small">Standard Units</p>
                                             <h3 className="mb-0">{standardUnits.length}</h3>
                                        </div>
                                        <div className="bg-success bg-opacity-10 p-3 rounded">
                                             <RiCheckLine size={24} className="text-success" />
                                        </div>
                                   </div>
                              </div>
                         </div>
                    </div>
               </div>

               {/* Units Table */}
               <PrimeTable
                    column={unitColumns}
                    data={units}
                    filtering={true}
                    handleSeverSideProcessing={handleServerSideProcessing}
                    serverSideFiltering={true}
               />

               {/* Add/Edit Unit Modal */}
               {showAddModal && (
                    <div className="modal show d-block">
                         <div className="modal-dialog modal-lg">
                              <div className="modal-content">
                                   <div className="modal-header">
                                        <h5 className="modal-title">
                                             {editingUnit ? `Edit Unit: ${editingUnit.name}` : 'Add Custom Unit'}
                                        </h5>
                                        <button
                                             type="button"
                                             className="btn-close"
                                             onClick={() => {
                                                  setShowAddModal(false);
                                                  setEditingUnit(null);
                                                  resetUnitForm();
                                             }}
                                        ></button>
                                   </div>
                                   <div className="modal-body">
                                        <div className="row">
                                             <div className="col-md-6">
                                                  <div className="mb-3">
                                                       <label className="form-label">Unit Name *</label>
                                                       <input
                                                            type="text"
                                                            className="form-control"
                                                            value={unitForm.name}
                                                            onChange={(e) => setUnitForm(prev => ({ ...prev, name: e.target.value }))}
                                                            placeholder="Enter unit name"
                                                            maxLength={100}
                                                       />
                                                  </div>
                                             </div>
                                        </div>
                                        <div className="mb-3">
                                             <label className="form-label">Description</label>
                                             <textarea
                                                  className="form-control"
                                                  rows={3}
                                                  value={unitForm.description}
                                                  onChange={(e) => setUnitForm(prev => ({ ...prev, description: e.target.value }))}
                                                  placeholder="Unit description..."
                                                  maxLength={1000}
                                             />
                                        </div>
                                   </div>
                                   <div className="modal-footer">
                                        <button
                                             type="button"
                                             className="btn btn-outline-secondary btn-sm"
                                             onClick={() => {
                                                  setShowAddModal(false);
                                                  setEditingUnit(null);
                                                  resetUnitForm();
                                             }}
                                        >
                                             Cancel
                                        </button>
                                        <button
                                             type="button"
                                             className="btn btn-outline-primary btn-sm"
                                             onClick={editingUnit ? handleUpdateUnit : handleAddUnit}
                                             disabled={loading}
                                        >
                                             {loading ? 'Saving...' : (editingUnit ? 'Update Unit' : 'Create Unit')}
                                        </button>
                                   </div>
                              </div>
                         </div>
                    </div>
               )}

               {/* Unit Details Modal */}
               {selectedUnit && (
                    <div className="modal show d-block">
                         <div className="modal-dialog modal-lg">
                              <div className="modal-content">
                                   <div className="modal-header">
                                        <h5 className="modal-title">Unit Details - {selectedUnit.name}</h5>
                                        <button
                                             type="button"
                                             className="btn-close"
                                             onClick={() => setSelectedUnit(null)}
                                        ></button>
                                   </div>
                                   <div className="modal-body">
                                        <div className="row mb-3">
                                             <div className="col-md-6">
                                                  <div className="card bg-light">
                                                       <div className="card-body">
                                                            <h6 className="card-title">Unit Information</h6>
                                                            <p className="mb-1 small"><strong>Name:</strong> {selectedUnit.name}</p>
                                                            <p className="mb-1 small"><strong>Type:</strong>
                                                                 <span className={`${selectedUnit.is_standard === 1 ? 'text-primary' : 'text-success'} ms-2`}>
                                                                      {selectedUnit.is_standard === 1 ? 'Standard' : 'Custom'}
                                                                 </span>
                                                            </p>
                                                            {selectedUnit.created_at && (
                                                                 <p className="mb-0 small"><strong>Created:</strong> {new Date(selectedUnit.created_at).toLocaleDateString()}</p>
                                                            )}
                                                       </div>
                                                  </div>
                                             </div>
                                             <div className="col-md-6">
                                                  <div className="card bg-light">
                                                       <div className="card-body">
                                                            <h6 className="card-title">Description</h6>
                                                            <p className="mb-0 small">{selectedUnit.description || 'No description available'}</p>
                                                       </div>
                                                  </div>
                                             </div>
                                        </div>
                                   </div>
                                   <div className="modal-footer">
                                        <button
                                             type="button"
                                             className="btn btn-outline-secondary btn-sm"
                                             onClick={() => setSelectedUnit(null)}
                                        >
                                             Close
                                        </button>
                                   </div>
                              </div>
                         </div>
                    </div>
               )}
          </div>
     );
}