'use client';

import React, { useState, useEffect } from 'react';
import { RiTruckLine, RiAddLine, RiEditLine, RiDeleteBinLine, RiEyeLine, RiSearchLine, RiFilterLine, RiDownloadLine, RiUploadLine } from '@remixicon/react';
import PrimeTable from '../../../components/accessories/Datatables/PrimeTable';
import { customFetch, customPost } from '../../../components/Auth/customFetch';
import { toast } from 'react-toastify';

interface Supplier {
     id: string;
     name: string;
     contact: string;
     email: string;
     phone: string;
}

export default function SuppliersPage() {
     const [suppliers, setSuppliers] = useState<Supplier[]>([]);
     const [showAddModal, setShowAddModal] = useState(false);
     const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
     const [loading, setLoading] = useState(false);

     // Form states
     const [supplierForm, setSupplierForm] = useState({
          name: '',
          contact: '',
          email: '',
          phone: ''
     });

     // Load suppliers from API
     useEffect(() => {
          loadSuppliers();
     }, []);

     const loadSuppliers = async () => {
          try {
               setLoading(true);
               const response = await customFetch('inventory/suppliers');
               // customFetch returns parsed JSON. Normalize possible shapes.
               const data = Array.isArray(response) ? response : (response?.data || response?.result || []);
               const mappedSuppliers = (data || []).map((sup: any) => ({
                    id: sup.id?.toString() || String(sup.id),
                    name: sup.name,
                    contact: sup.contact_person || sup.contact,
                    email: sup.email,
                    phone: sup.phone
               }));
               setSuppliers(mappedSuppliers);
          } catch (error) {
               console.error('Error loading suppliers:', error);
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
               });

               if (sortby) {
                    params.append('sortby', sortby);
               }

               const endpoint = `inventory/suppliers?${params.toString()}`;
               const response = await customFetch(endpoint);

               // Normalize response format
               const data = Array.isArray(response) ? response : (response?.data || response?.result || []);
               const mappedSuppliers = (data || []).map((sup: any) => ({
                    id: sup.id?.toString() || String(sup.id),
                    name: sup.name,
                    contact: sup.contact_person || sup.contact,
                    email: sup.email,
                    phone: sup.phone
               }));

               return { result: mappedSuppliers, error: false };
          } catch (error) {
               console.error('Error in server-side processing:', error);
               return { result: [], error: true };
          }
     };

     const supplierColumns = [
          {
               Header: 'Supplier Name',
               accessor: 'name',
          },
          {
               Header: 'Contact Person',
               accessor: 'contact',
          },
          {
               Header: 'Email',
               accessor: 'email',
               Cell: ({ value }) => (
                    <a href={`mailto:${value}`} className="text-decoration-none">
                         {value}
                    </a>
               )
          },
          {
               Header: 'Phone',
               accessor: 'phone',
               Cell: ({ value }) => (
                    <a href={`tel:${value}`} className="text-decoration-none">
                         {value}
                    </a>
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
                              onClick={() => setSelectedSupplier(row.original)}
                         >
                              <RiEyeLine size={14} />
                         </button>
                         <button
                              className="btn btn-sm btn-outline-primary"
                              title="Edit Supplier"
                              onClick={() => handleEditSupplier(row.original)}
                         >
                              <RiEditLine size={14} />
                         </button>
                         <button
                              className="btn btn-sm btn-outline-danger"
                              title="Delete Supplier"
                              onClick={() => handleDeleteSupplier(row.original.id)}
                         >
                              <RiDeleteBinLine size={14} />
                         </button>
                    </div>
               )
          }
     ];

     const handleAddSupplier = async () => {
          if (!supplierForm.name || !supplierForm.email) {
               alert('Please fill in name and email');
               return;
          }

          try {
               setLoading(true);
               const supplierData = {
                    name: supplierForm.name,
                    contact: supplierForm.contact,
                    email: supplierForm.email,
                    phone: supplierForm.phone
               };

               const resp = await customPost('inventory/suppliers', 'POST', supplierData);
               // API may return { success: boolean, error: { message } } or { status: 'success' }
               if (resp && (resp.success === true || resp.status === 'success' || resp.statusCode === 200)) {
                    toast.success(resp.message || 'Supplier added');
                    await loadSuppliers(); // Reload suppliers
                    setShowAddModal(false);
                    setSupplierForm({ name: '', contact: '', email: '', phone: '' });
               } else {
                    const errMsg = resp?.error?.message || resp?.message || 'Failed to add supplier';
                    toast.error(errMsg);
               }
          } catch (error) {
               console.error('Error adding supplier:', error);
               alert('Error adding supplier');
          } finally {
               setLoading(false);
          }
     };

     const handleEditSupplier = (supplier: Supplier) => {
          setSupplierForm({
               name: supplier.name,
               contact: supplier.contact,
               email: supplier.email,
               phone: supplier.phone
          });
          setSelectedSupplier(supplier);
          setShowAddModal(true);
     };

     const handleUpdateSupplier = async () => {
          if (!supplierForm.name || !supplierForm.email || !selectedSupplier) {
               alert('Please fill in all required fields');
               return;
          }

          try {
               setLoading(true);
               const supplierData = {
                    name: supplierForm.name,
                    contact: supplierForm.contact,
                    email: supplierForm.email,
                    phone: supplierForm.phone
               };

               const resp = await customPost(`inventory/suppliers/${selectedSupplier.id}`, 'PUT', supplierData);
               if (resp && (resp.success === true || resp.status === 'success' || resp.statusCode === 200)) {
                    toast.success(resp.message || 'Supplier updated');
                    await loadSuppliers(); // Reload suppliers
                    setShowAddModal(false);
                    setSelectedSupplier(null);
                    setSupplierForm({ name: '', contact: '', email: '', phone: '' });
               } else {
                    const errMsg = resp?.error?.message || resp?.message || 'Failed to update supplier';
                    toast.error(errMsg);
               }
          } catch (error) {
               console.error('Error updating supplier:', error);
               alert('Error updating supplier');
          } finally {
               setLoading(false);
          }
     };

     const handleDeleteSupplier = async (supplierId: string) => {
          if (!confirm('Are you sure you want to delete this supplier?')) return;

          try {
               setLoading(true);
               const resp = await customPost(`inventory/suppliers/${supplierId}`, 'DELETE', {});
               if (resp && (resp.success === true || resp.status === 'success' || resp.statusCode === 200)) {
                    toast.success(resp.message || 'Supplier deleted');
                    await loadSuppliers(); // Reload suppliers
               } else {
                    const errMsg = resp?.error?.message || resp?.message || 'Failed to delete supplier';
                    toast.error(errMsg);
               }
          } catch (error) {
               console.error('Error deleting supplier:', error);
               alert('Error deleting supplier');
          } finally {
               setLoading(false);
          }
     };

     const resetForm = () => {
          setSupplierForm({ name: '', contact: '', email: '', phone: '' });
          setSelectedSupplier(null);
     };

     return (
          <div className="container-fluid p-4">
               {/* Header */}
               <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                         <h2 className="mb-1">
                              <RiTruckLine className="me-2" />
                              Suppliers Management
                         </h2>
                         <p className="text-muted mb-0">Manage laboratory suppliers and vendor information</p>
                    </div>
                    <div className="d-flex gap-2">
                         <button className="btn btn-outline-primary btn-sm">
                              <RiDownloadLine className="me-1" />
                              Export Data
                         </button>
                         <button className="btn btn-outline-secondary btn-sm">
                              <RiUploadLine className="me-1" />
                              Import Data
                         </button>
                         <button
                              className="btn btn-primary btn-sm"
                              onClick={() => setShowAddModal(true)}
                         >
                              <RiAddLine className="me-1" />
                              Add Supplier
                         </button>
                    </div>
               </div>


               <PrimeTable
                    column={supplierColumns}
                    data={suppliers}
                    filtering={true}
                    handleSeverSideProcessing={handleServerSideProcessing}
                    serverSideFiltering={true}
               />

               {/* Empty State */}
               {suppliers.length === 0 && (
                    <div className="text-center py-5">
                         <RiTruckLine size={64} className="text-muted mb-3" />
                         <h5 className="text-muted">No suppliers found</h5>
                         <p className="text-muted">Add your first supplier to get started</p>
                         <button
                              className="btn btn-primary"
                              onClick={() => setShowAddModal(true)}
                         >
                              <RiAddLine className="me-1" />
                              Add Supplier
                         </button>
                    </div>
               )}

               {/* Add/Edit Supplier Modal */}
               {showAddModal && (
                    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                         <div className="modal-dialog">
                              <div className="modal-content">
                                   <div className="modal-header">
                                        <h5 className="modal-title">
                                             {selectedSupplier ? 'Edit Supplier' : 'Add Supplier'}
                                        </h5>
                                        <button
                                             type="button"
                                             className="btn-close"
                                             onClick={() => {
                                                  setShowAddModal(false);
                                                  resetForm();
                                             }}
                                        ></button>
                                   </div>
                                   <div className="modal-body">
                                        <div className="mb-3">
                                             <label className="form-label">Supplier Name *</label>
                                             <input
                                                  type="text"
                                                  className="form-control"
                                                  value={supplierForm.name}
                                                  onChange={(e) => setSupplierForm(prev => ({ ...prev, name: e.target.value }))}
                                                  placeholder="Company name"
                                             />
                                        </div>
                                        <div className="mb-3">
                                             <label className="form-label">Contact Person</label>
                                             <input
                                                  type="text"
                                                  className="form-control"
                                                  value={supplierForm.contact}
                                                  onChange={(e) => setSupplierForm(prev => ({ ...prev, contact: e.target.value }))}
                                                  placeholder="Primary contact name"
                                             />
                                        </div>
                                        <div className="row">
                                             <div className="col-md-6">
                                                  <div className="mb-3">
                                                       <label className="form-label">Email *</label>
                                                       <input
                                                            type="email"
                                                            className="form-control"
                                                            value={supplierForm.email}
                                                            onChange={(e) => setSupplierForm(prev => ({ ...prev, email: e.target.value }))}
                                                            placeholder="contact@company.com"
                                                       />
                                                  </div>
                                             </div>
                                             <div className="col-md-6">
                                                  <div className="mb-3">
                                                       <label className="form-label">Phone</label>
                                                       <input
                                                            type="tel"
                                                            className="form-control"
                                                            value={supplierForm.phone}
                                                            onChange={(e) => setSupplierForm(prev => ({ ...prev, phone: e.target.value }))}
                                                            placeholder="+1-555-0123"
                                                       />
                                                  </div>
                                             </div>
                                        </div>
                                   </div>
                                   <div className="modal-footer">
                                        <button
                                             type="button"
                                             className="btn btn-secondary btn-sm"
                                             onClick={() => {
                                                  setShowAddModal(false);
                                                  resetForm();
                                             }}
                                        >
                                             Cancel
                                        </button>
                                        <button
                                             type="button"
                                             className="btn btn-primary btn-sm"
                                             onClick={selectedSupplier ? handleUpdateSupplier : handleAddSupplier}
                                        >
                                             {selectedSupplier ? 'Update Supplier' : 'Add Supplier'}
                                        </button>
                                   </div>
                              </div>
                         </div>
                    </div>
               )}

               {/* Supplier Details Modal */}
               {selectedSupplier && !showAddModal && (
                    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                         <div className="modal-dialog modal-lg">
                              <div className="modal-content">
                                   <div className="modal-header">
                                        <h5 className="modal-title">Supplier Details - {selectedSupplier.name}</h5>
                                        <button
                                             type="button"
                                             className="btn-close"
                                             onClick={() => setSelectedSupplier(null)}
                                        ></button>
                                   </div>
                                   <div className="modal-body">
                                        <div className="row">
                                             <div className="col-md-6">
                                                  <div className="mb-3">
                                                       <label className="form-label fw-bold small">Supplier Name</label>
                                                       <p className="mb-0 small text-muted">{selectedSupplier.name}</p>
                                                  </div>
                                                  <div className="mb-3">
                                                       <label className="form-label fw-bold small">Contact Person</label>
                                                       <p className="mb-0 small text-muted">{selectedSupplier.contact || 'Not specified'}</p>
                                                  </div>
                                             </div>
                                             <div className="col-md-6">
                                                  <div className="mb-3">
                                                       <label className="form-label fw-bold small">Email</label>
                                                       <p className="mb-0 small text-muted">{selectedSupplier.email}</p>
                                                  </div>
                                                  <div className="mb-3">
                                                       <label className="form-label fw-bold small">Phone</label>
                                                       <p className="mb-0 small text-muted">{selectedSupplier.phone || 'Not specified'}</p>
                                                  </div>
                                             </div>
                                        </div>

                                        {/* Additional supplier information could go here */}
                                        <div className="row mt-4">
                                             <div className="col-12">
                                                  <h6>Recent Activity</h6>
                                                  <div className="border rounded p-3">
                                                       <p className="text-muted mb-0">No recent activity to display</p>
                                                  </div>
                                             </div>
                                        </div>
                                   </div>
                                   <div className="modal-footer">
                                        <button
                                             type="button"
                                             className="btn btn-secondary btn-sm"
                                             onClick={() => setSelectedSupplier(null)}
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