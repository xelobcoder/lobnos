'use client';

import React, { useState, useEffect } from 'react';
import { RiPriceTagLine, RiAddLine, RiEditLine, RiDeleteBinLine, RiEyeLine } from '@remixicon/react';
import PrimeTable from '../../../components/accessories/Datatables/PrimeTable';


interface InventoryCategory {
     id: string;
     name: string;
     description: string;
     itemCount: number;
}

export default function InventoryCategoriesPage() {
     const [categories, setCategories] = useState<InventoryCategory[]>([]);
     const [showAddModal, setShowAddModal] = useState(false);
     const [selectedCategory, setSelectedCategory] = useState<InventoryCategory | null>(null);
     const [loading, setLoading] = useState(false);

     // Form states
     const [categoryForm, setCategoryForm] = useState({
          name: '',
          description: ''
     });

     // Mock data for demonstration
     useEffect(() => {
          const mockCategories: InventoryCategory[] = [
               { id: '1', name: 'Consumables', description: 'Disposable lab supplies', itemCount: 25 },
               { id: '2', name: 'Reagents & Chemicals', description: 'Chemical reagents and solutions', itemCount: 15 },
               { id: '3', name: 'Equipment', description: 'Lab equipment and instruments', itemCount: 8 },
               { id: '4', name: 'PPE', description: 'Personal protective equipment', itemCount: 12 }
          ];

          setCategories(mockCategories);
     }, []);

     const categoryColumns = [
          {
               Header: 'Category Name',
               accessor: 'name',
          },
          {
               Header: 'Description',
               accessor: 'description',
               Cell: ({ value }) => (
                    <div style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                         {value}
                    </div>
               )
          },
          {
               Header: 'Items Count',
               accessor: 'itemCount',
               Cell: ({ value }) => (
                    <span className="badge bg-primary">{value} items</span>
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
                              onClick={() => setSelectedCategory(row.original)}
                         >
                              <RiEyeLine size={14} />
                         </button>
                         <button
                              className="btn btn-sm btn-outline-primary"
                              title="Edit Category"
                              onClick={() => handleEditCategory(row.original)}
                         >
                              <RiEditLine size={14} />
                         </button>
                         <button
                              className="btn btn-sm btn-outline-danger"
                              title="Delete Category"
                              onClick={() => handleDeleteCategory(row.original.id)}
                         >
                              <RiDeleteBinLine size={14} />
                         </button>
                    </div>
               )
          }
     ];

     const handleAddCategory = () => {
          if (!categoryForm.name) {
               alert('Please enter a category name');
               return;
          }

          const newCategory: InventoryCategory = {
               id: Date.now().toString(),
               name: categoryForm.name,
               description: categoryForm.description,
               itemCount: 0
          };

          setCategories(prev => [...prev, newCategory]);
          setShowAddModal(false);
          setCategoryForm({ name: '', description: '' });
     };

     const handleEditCategory = (category: InventoryCategory) => {
          setCategoryForm({
               name: category.name,
               description: category.description
          });
          setShowAddModal(true);
     };

     const handleDeleteCategory = (categoryId: string) => {
          if (confirm('Are you sure you want to delete this category?')) {
               setCategories(prev => prev.filter(category => category.id !== categoryId));
          }
     };

     return (
          <div className="container-fluid p-4">
               {/* Header */}
               <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                         <h2 className="mb-1">
                              <RiPriceTagLine className="me-2" />
                              Inventory Categories
                         </h2>
                         <p className="text-muted mb-0">Organize and manage inventory categories</p>
                    </div>
                    <div className="d-flex gap-2">
                         <button
                              className="btn btn-primary btn-sm"
                              onClick={() => setShowAddModal(true)}
                         >
                              <RiAddLine className="me-1" />
                              Add Category
                         </button>
                    </div>
               </div>

               {/* Categories Table */}
               <PrimeTable
                    column={categoryColumns}
                    data={categories}
                    filtering={true}
                    handleSeverSideProcessing={false}
                    serverSideFiltering={false}
               />

               {/* Add Category Modal */}
               {showAddModal && (
                    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                         <div className="modal-dialog">
                              <div className="modal-content">
                                   <div className="modal-header">
                                        <h5 className="modal-title">Add Category</h5>
                                        <button
                                             type="button"
                                             className="btn-close"
                                             onClick={() => setShowAddModal(false)}
                                        ></button>
                                   </div>
                                   <div className="modal-body">
                                        <div className="mb-3">
                                             <label className="form-label">Category Name *</label>
                                             <input
                                                  type="text"
                                                  className="form-control"
                                                  value={categoryForm.name}
                                                  onChange={(e) => setCategoryForm(prev => ({ ...prev, name: e.target.value }))}
                                                  placeholder="e.g., Reagents & Chemicals"
                                             />
                                        </div>
                                        <div className="mb-3">
                                             <label className="form-label">Description</label>
                                             <textarea
                                                  className="form-control"
                                                  rows={3}
                                                  value={categoryForm.description}
                                                  onChange={(e) => setCategoryForm(prev => ({ ...prev, description: e.target.value }))}
                                                  placeholder="Category description..."
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
                                             onClick={handleAddCategory}
                                        >
                                             Add Category
                                        </button>
                                   </div>
                              </div>
                         </div>
                    </div>
               )}

               {/* Category Details Modal */}
               {selectedCategory && (
                    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                         <div className="modal-dialog">
                              <div className="modal-content">
                                   <div className="modal-header">
                                        <h5 className="modal-title">
                                             <RiPriceTagLine className="me-2" />
                                             Category Details
                                        </h5>
                                        <button
                                             type="button"
                                             className="btn-close"
                                             onClick={() => setSelectedCategory(null)}
                                        ></button>
                                   </div>
                                   <div className="modal-body">
                                        <div className="mb-3">
                                             <label className="form-label fw-bold">Category Name</label>
                                             <p className="form-control-plaintext">{selectedCategory.name}</p>
                                        </div>
                                        <div className="mb-3">
                                             <label className="form-label fw-bold">Description</label>
                                             <p className="form-control-plaintext">{selectedCategory.description || 'No description provided'}</p>
                                        </div>
                                        <div className="mb-3">
                                             <label className="form-label fw-bold">Items Count</label>
                                             <p className="form-control-plaintext">
                                                  <span className="badge bg-primary">{selectedCategory.itemCount} items</span>
                                             </p>
                                        </div>
                                   </div>
                                   <div className="modal-footer">
                                        <button
                                             type="button"
                                             className="btn btn-secondary btn-sm"
                                             onClick={() => setSelectedCategory(null)}
                                        >
                                             Close
                                        </button>
                                        <button
                                             type="button"
                                             className="btn btn-primary btn-sm"
                                             onClick={() => {
                                                  setSelectedCategory(null);
                                                  handleEditCategory(selectedCategory);
                                             }}
                                        >
                                             <RiEditLine className="me-1" />
                                             Edit Category
                                        </button>
                                   </div>
                              </div>
                         </div>
                    </div>
               )}
          </div>
     );
}