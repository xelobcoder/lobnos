'use client';

import React, { useState, useEffect } from 'react';
import { RiTruckLine, RiAddLine, RiEditLine, RiDeleteBinLine, RiEyeLine, RiSearchLine, RiFilterLine, RiDownloadLine, RiUploadLine } from '@remixicon/react';
import PrimeTable from '../../../components/accessories/Datatables/PrimeTable';

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
     const [searchTerm, setSearchTerm] = useState('');
     const [loading, setLoading] = useState(false);

     // Form states
     const [supplierForm, setSupplierForm] = useState({
          name: '',
          contact: '',
          email: '',
          phone: ''
     });

     // Mock data for demonstration
     useEffect(() => {
          const mockSuppliers: Supplier[] = [
               { id: '1', name: 'LabCorp Supplies', contact: 'John Smith', email: 'orders@labcorp.com', phone: '+1-555-0101' },
               { id: '2', name: 'MediTech Inc', contact: 'Sarah Johnson', email: 'sales@meditech.com', phone: '+1-555-0102' },
               { id: '3', name: 'ChemSolutions Ltd', contact: 'Mike Davis', email: 'info@chemsolutions.com', phone: '+1-555-0103' },
               { id: '4', name: 'BioReagents Corp', contact: 'Lisa Chen', email: 'contact@bioreagents.com', phone: '+1-555-0104' },
               { id: '5', name: 'MedEquip Solutions', contact: 'David Wilson', email: 'orders@medequip.com', phone: '+1-555-0105' }
          ];

          setSuppliers(mockSuppliers);
     }, []);

     const filteredSuppliers = suppliers.filter(supplier =>
          supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          supplier.contact.toLowerCase().includes(searchTerm.toLowerCase()) ||
          supplier.email.toLowerCase().includes(searchTerm.toLowerCase())
     );

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

     const handleAddSupplier = () => {
          if (!supplierForm.name || !supplierForm.email) {
               alert('Please fill in name and email');
               return;
          }

          const newSupplier: Supplier = {
               id: Date.now().toString(),
               name: supplierForm.name,
               contact: supplierForm.contact,
               email: supplierForm.email,
               phone: supplierForm.phone
          };

          setSuppliers(prev => [...prev, newSupplier]);
          setShowAddModal(false);
          setSupplierForm({ name: '', contact: '', email: '', phone: '' });
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

     const handleUpdateSupplier = () => {
          if (!supplierForm.name || !supplierForm.email) {
               alert('Please fill in name and email');
               return;
          }

          if (!selectedSupplier) return;

          const updatedSupplier: Supplier = {
               ...selectedSupplier,
               name: supplierForm.name,
               contact: supplierForm.contact,
               email: supplierForm.email,
               phone: supplierForm.phone
          };

          setSuppliers(prev => prev.map(sup =>
               sup.id === selectedSupplier.id ? updatedSupplier : sup
          ));
          setShowAddModal(false);
          setSelectedSupplier(null);
          setSupplierForm({ name: '', contact: '', email: '', phone: '' });
     };

     const handleDeleteSupplier = (supplierId: string) => {
          if (confirm('Are you sure you want to delete this supplier?')) {
               setSuppliers(prev => prev.filter(sup => sup.id !== supplierId));
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

               {/* Search and Filter Bar */}
               <div className="card mb-4">
                    <div className="card-body">
                         <div className="row g-3">
                              <div className="col-md-6">
                                   <div className="input-group">
                                        <span className="input-group-text">
                                             <RiSearchLine />
                                        </span>
                                        <input
                                             type="text"
                                             className="form-control"
                                             placeholder="Search suppliers..."
                                             value={searchTerm}
                                             onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                   </div>
                              </div>
                              <div className="col-md-6">
                                   <div className="d-flex gap-2">
                                        <button className="btn btn-outline-secondary btn-sm">
                                             <RiFilterLine className="me-1" />
                                             Filter
                                        </button>
                                        <div className="ms-auto">
                                             <span className="text-muted">
                                                  Showing {filteredSuppliers.length} of {suppliers.length} suppliers
                                             </span>
                                        </div>
                                   </div>
                              </div>
                         </div>
                    </div>
               </div>

               {/* Suppliers Table */}
               <PrimeTable
                    column={supplierColumns}
                    data={filteredSuppliers}
                    filtering={true}
                    handleSeverSideProcessing={false}
                    serverSideFiltering={false}
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
                                                       <label className="form-label">Supplier Name</label>
                                                       <input
                                                            type="text"
                                                            className="form-control"
                                                            value={selectedSupplier.name}
                                                            readOnly
                                                       />
                                                  </div>
                                                  <div className="mb-3">
                                                       <label className="form-label">Contact Person</label>
                                                       <input
                                                            type="text"
                                                            className="form-control"
                                                            value={selectedSupplier.contact}
                                                            readOnly
                                                       />
                                                  </div>
                                             </div>
                                             <div className="col-md-6">
                                                  <div className="mb-3">
                                                       <label className="form-label">Email</label>
                                                       <input
                                                            type="email"
                                                            className="form-control"
                                                            value={selectedSupplier.email}
                                                            readOnly
                                                       />
                                                  </div>
                                                  <div className="mb-3">
                                                       <label className="form-label">Phone</label>
                                                       <input
                                                            type="tel"
                                                            className="form-control"
                                                            value={selectedSupplier.phone}
                                                            readOnly
                                                       />
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
                                        <button
                                             type="button"
                                             className="btn btn-primary btn-sm"
                                             onClick={() => {
                                                  setSelectedSupplier(null);
                                                  handleEditSupplier(selectedSupplier);
                                             }}
                                        >
                                             <RiEditLine size={14} className="me-1" />
                                             Edit Supplier
                                        </button>
                                   </div>
                              </div>
                         </div>
                    </div>
               )}
          </div>
     );
}