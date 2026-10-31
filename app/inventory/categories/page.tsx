'use client';

import React, { useState, useEffect } from 'react';
import { RiPriceTagLine, RiAddLine, RiEditLine, RiDeleteBinLine, RiEyeLine } from '@remixicon/react';
import PrimeTable from '../../../components/accessories/Datatables/PrimeTable';
import { customFetch, customPost } from '../../../components/Auth/customFetch';
import { useApplicationSettings } from '../../../components/Auth/useApplicationContext';
import { toast } from 'react-toastify';


interface InventoryCategory {
     id: string;
     name: string;
     description: string;
     itemCount: number;
}

export default function InventoryCategoriesPage() {
     const { branchid, user } = useApplicationSettings().applicationsettings || {};
     const employeeid = user?.employeeid;
     const [categories, setCategories] = useState<InventoryCategory[]>([]);
     const [showAddModal, setShowAddModal] = useState(false);
     const [selectedCategory, setSelectedCategory] = useState<InventoryCategory | null>(null);
     const [loading, setLoading] = useState(false);
     const [loadError, setLoadError] = useState('');

     // Form states
     const [categoryForm, setCategoryForm] = useState({
          name: '',
          description: ''
     });

     // Load categories from API
     useEffect(() => {
          if (branchid && employeeid) {
               loadCategories();
          }
     }, [branchid, employeeid]);

     const loadCategories = async () => {
          try {
               setLoading(true);
               setLoadError('');
               const response = await customFetch(`inventory/categories?branchid=${branchid}&employeeid=${employeeid}`);
               const data = Array.isArray(response) ? response : (response?.data || response?.result || []);
               const mappedCategories = (data || []).map((cat: any) => ({
                    id: cat.id?.toString() || String(cat.id),
                    name: cat.name,
                    description: cat.description,
                    itemCount: cat.item_count || cat.itemCount || 0
               }));
               setCategories(mappedCategories);
          } catch (error) {
               setLoadError('Unable to load categories. Please retry.');
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

               const endpoint = `inventory/categories?${params.toString()}`;
               const response = await customFetch(endpoint);

               const data = Array.isArray(response) ? response : (response?.data || response?.result || []);
               const mappedCategories = (data || []).map((cat: any) => ({
                    id: cat.id?.toString() || String(cat.id),
                    name: cat.name,
                    description: cat.description,
                    itemCount: cat.item_count || cat.itemCount || 0
               }));

               return { result: mappedCategories, error: false };
          } catch (error) {
               console.error('Error in server-side processing:', error);
               return { result: [], error: true };
          }
     };

     const categoryColumns = [
          {
               Header: 'Category Name',
               accessor: 'name',
          },
          {
               Header: 'Description',
               accessor: 'description',
               Cell: ({ value }) => (
                    <div style={{ maxWidth: '360px', whiteSpace: 'normal', overflowWrap: 'anywhere' }}>
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

     const handleAddCategory = async () => {
          if (!categoryForm.name) {
               toast.error('Please enter a category name');
               return;
          }

          try {
               setLoading(true);
               const categoryData = {
                    name: categoryForm.name,
                    description: categoryForm.description,
                    branchid: branchid,
                    employeeid: employeeid
               };

               const resp = await customPost('inventory/categories', 'POST', categoryData);
               if (resp && (resp.success === true || resp.status === 'success' || resp.statusCode === 200)) {
                    toast.success(resp.message || 'Category added');
                    await loadCategories(); // Reload categories
                    setShowAddModal(false);
                    setCategoryForm({ name: '', description: '' });
               } else {
                    const errMsg = resp?.error?.message || resp?.message || 'Failed to add category';
                    toast.error(errMsg);
               }
          } catch (error) {
               console.error('Error adding category:', error);
               toast.error('Error adding category');
          } finally {
               setLoading(false);
          }
     };

     const handleEditCategory = (category: InventoryCategory) => {
          setCategoryForm({
               name: category.name,
               description: category.description
          });
          setSelectedCategory(category);
          setShowAddModal(true);
     };

     const handleUpdateCategory = async () => {
          if (!categoryForm.name || !selectedCategory) {
               toast.error('Please enter a category name');
               return;
          }

          try {
               setLoading(true);
               const categoryData = {
                    name: categoryForm.name,
                    description: categoryForm.description,
                    branchid: branchid,
                    employeeid: employeeid
               };

               const resp = await customPost(`inventory/categories/${selectedCategory.id}`, 'PUT', categoryData);
               if (resp && (resp.success === true || resp.status === 'success' || resp.statusCode === 200)) {
                    toast.success(resp.message || 'Category updated');
                    await loadCategories(); // Reload categories
                    setShowAddModal(false);
                    setSelectedCategory(null);
                    setCategoryForm({ name: '', description: '' });
               } else {
                    const errMsg = resp?.error?.message || resp?.message || 'Failed to update category';
                    toast.error(errMsg);
               }
          } catch (error) {
               console.error('Error updating category:', error);
               toast.error('Error updating category');
          } finally {
               setLoading(false);
          }
     };

     const handleDeleteCategory = async (categoryId: string) => {
          if (!confirm('Are you sure you want to delete this category?')) return;

          try {
               setLoading(true);
               const resp = await customPost(`inventory/categories/${categoryId}`, 'DELETE', { branchid, employeeid });
               if (resp && (resp.success === true || resp.status === 'success' || resp.statusCode === 200)) {
                    toast.success(resp.message || 'Category deleted');
                    await loadCategories(); // Reload categories
               } else {
                    const errMsg = resp?.error?.message || resp?.message || 'Failed to delete category';
                    toast.error(errMsg);
               }
          } catch (error) {
               console.error('Error deleting category:', error);
               toast.error('Error deleting category');
          } finally {
               setLoading(false);
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

               {loadError && <div className="alert alert-danger d-flex align-items-center justify-content-between gap-2" role="alert"><span>{loadError}</span><button type="button" className="btn btn-outline-danger btn-sm" disabled={loading} onClick={loadCategories}>Retry loading</button></div>}
               {/* Categories Table */}
               <PrimeTable
                    pdfExport
                    pdfTitle="Inventory Categories"
                    column={categoryColumns}
                    data={categories}
                    filtering={true}
                    handleSeverSideProcessing={handleServerSideProcessing}
                    serverSideFiltering={true}
               />

               {/* Add Category Modal */}
               {showAddModal && (
                    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                         <div className="modal-dialog">
                              <div className="modal-content">
                                   <div className="modal-header">
                                        <h5 className="modal-title">{selectedCategory ? 'Edit Category' : 'Add Category'}</h5>
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
                                             onClick={() => {
                                                  setShowAddModal(false);
                                                  setSelectedCategory(null);
                                                  setCategoryForm({ name: '', description: '' });
                                             }}
                                        >
                                             Cancel
                                        </button>
                                        <button
                                             type="button"
                                             className="btn btn-success btn-sm"
                                             onClick={selectedCategory ? handleUpdateCategory : handleAddCategory}
                                             disabled={loading}
                                        >
                                             {loading ? 'Saving...' : selectedCategory ? 'Update Category' : 'Add Category'}
                                        </button>
                                   </div>
                              </div>
                         </div>
                    </div>
               )}

               {/* Category Details Modal */}
               {selectedCategory && !showAddModal && (
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