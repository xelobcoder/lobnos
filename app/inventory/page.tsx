'use client';

import React, { useState, useEffect, useRef } from 'react';
import { RiAddLine, RiEditLine, RiDeleteBinLine, RiEyeLine, RiDownloadLine, RiUploadLine, RiAlertLine, RiCheckLine, RiCloseLine, RiStoreLine, RiBox3Line, RiPriceTagLine, RiCameraLine } from '@remixicon/react';
import PrimeTable from '../../components/accessories/Datatables/PrimeTable';
import { customFetch, customPost } from '../../components/Auth/customFetch';
import { toast } from 'react-toastify';
import Link from 'next/link';

interface InventoryItem {
     id: string;
     name: string;
     category: string;
     supplier: string;
     sku: string;
     description: string;
     unit: string;
     currentStock: number;
     minStock: number;
     maxStock: number;
     unitPrice: number;
     totalValue: number;
     location: string;
     expiryDate?: string;
     lastUpdated: string;
     status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'expired';
}

interface InventoryCategory {
     id: string;
     name: string;
     description: string;
     itemCount: number;
}

interface Supplier {
     id: string;
     name: string;
     contact: string;
     email: string;
     phone: string;
}

const STATUS_BADGES = {
     in_stock: { label: 'In Stock', color: 'success' },
     low_stock: { label: 'Low Stock', color: 'warning' },
     out_of_stock: { label: 'Out of Stock', color: 'danger' },
     expired: { label: 'Expired', color: 'secondary' }
};

export default function InventoryPage() {
     const [activeTab, setActiveTab] = useState<'overview' | 'items' | 'categories'>('overview');
     const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
     const [categories, setCategories] = useState<InventoryCategory[]>([]);
     const [suppliers, setSuppliers] = useState<Supplier[]>([]);
     const [showAddModal, setShowAddModal] = useState(false);
     const [showCategoryModal, setShowCategoryModal] = useState(false);
     const [showSupplierModal, setShowSupplierModal] = useState(false);
     const [showCameraModal, setShowCameraModal] = useState(false);
     const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
     const [loading, setLoading] = useState(false);
     const videoRef = useRef<HTMLVideoElement>(null);
     const canvasRef = useRef<HTMLCanvasElement>(null);

     // Form states
     const [itemForm, setItemForm] = useState({
          name: '',
          category: '',
          supplier: '',
          sku: '',
          description: '',
          unit: 'pieces',
          currentStock: 0,
          minStock: 0,
          maxStock: 0,
          unitPrice: 0,
          location: '',
          expiryDate: ''
     });

     const [categoryForm, setCategoryForm] = useState({
          name: '',
          description: ''
     });

     const [supplierForm, setSupplierForm] = useState({
          name: '',
          contact: '',
          email: '',
          phone: ''
     });

     // Load data from API
     useEffect(() => {
          loadInventoryItems();
          loadCategories();
          loadSuppliers();
     }, []);

     const loadInventoryItems = async () => {
          try {
               setLoading(true);
               const response = await customFetch('inventory/items');
               const data = Array.isArray(response) ? response : (response?.data || response?.result || []);
               const mappedItems = (data || []).map((item: any) => ({
                    id: item.id?.toString() || String(item.id),
                    name: item.name,
                    category: item.category_name || item.category,
                    supplier: item.supplier_name || item.supplier,
                    sku: item.sku,
                    description: item.description,
                    unit: item.unit,
                    currentStock: item.current_stock || item.currentStock || 0,
                    minStock: item.min_stock || item.minStock || 0,
                    maxStock: item.max_stock || item.maxStock || 0,
                    unitPrice: item.unit_price || item.unitPrice || 0,
                    totalValue: item.total_value || item.totalValue || 0,
                    location: item.location,
                    expiryDate: item.expiry_date,
                    lastUpdated: item.updated_at,
                    status: item.status
               }));
               setInventoryItems(mappedItems);
          } catch (error) {
               console.error('Error loading inventory items:', error);
          } finally {
               setLoading(false);
          }
     };

     const loadCategories = async () => {
          try {
               const response = await customFetch('inventory/categories');
               const data = Array.isArray(response) ? response : (response?.data || response?.result || []);
               const mappedCategories = (data || []).map((cat: any) => ({
                    id: cat.id?.toString() || String(cat.id),
                    name: cat.name,
                    description: cat.description,
                    itemCount: cat.item_count || cat.itemCount || 0
               }));
               setCategories(mappedCategories);
          } catch (error) {
               console.error('Error loading categories:', error);
          }
     };

     const loadSuppliers = async () => {
          try {
               const response = await customFetch('inventory/suppliers');
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
          }
     };

     const inventoryColumns = [
          {
               Header: 'Item Name',
               accessor: 'name',
          },
          {
               Header: 'Category',
               accessor: 'category',
          },
          {
               Header: 'SKU',
               accessor: 'sku',
          },
          {
               Header: 'Stock Level',
               accessor: 'currentStock',
               Cell: ({ row }) => (
                    <div>
                         <span className="fw-bold">{row.original.currentStock} {row.original.unit}</span>
                         <br />
                         <small className="text-muted">
                              Min: {row.original.minStock} | Max: {row.original.maxStock}
                         </small>
                    </div>
               )
          },
          {
               Header: 'Status',
               accessor: 'status',
               Cell: ({ value }) => (
                    <span className={`badge bg-${STATUS_BADGES[value].color}`}>
                         {STATUS_BADGES[value].label}
                    </span>
               )
          },
          {
               Header: 'Unit Price',
               accessor: 'unitPrice',
               Cell: ({ value }) => `$${value.toFixed(2)}`
          },
          {
               Header: 'Total Value',
               accessor: 'totalValue',
               Cell: ({ value }) => `$${value.toFixed(2)}`
          },
          {
               Header: 'Location',
               accessor: 'location',
          },
          {
               Header: 'Actions',
               accessor: 'id',
               Cell: ({ row }) => (
                    <div className="d-flex gap-1">
                         <button
                              className="btn btn-sm btn-outline-info"
                              title="View Details"
                              onClick={() => setSelectedItem(row.original)}
                         >
                              <RiEyeLine size={14} />
                         </button>
                         <button
                              className="btn btn-sm btn-outline-primary"
                              title="Edit Item"
                              onClick={() => handleEditItem(row.original)}
                         >
                              <RiEditLine size={14} />
                         </button>
                         <button
                              className="btn btn-sm btn-outline-danger"
                              title="Delete Item"
                              onClick={() => handleDeleteItem(row.original.id)}
                         >
                              <RiDeleteBinLine size={14} />
                         </button>
                    </div>
               )
          }
     ];

     const getInventoryStats = () => {
          const totalItems = inventoryItems.length;
          const totalValue = inventoryItems.reduce((sum, item) => sum + item.totalValue, 0);
          const lowStockItems = inventoryItems.filter(item => item.status === 'low_stock').length;
          const outOfStockItems = inventoryItems.filter(item => item.status === 'out_of_stock').length;
          const expiredItems = inventoryItems.filter(item => item.status === 'expired').length;

          return { totalItems, totalValue, lowStockItems, outOfStockItems, expiredItems };
     };

     const handleAddItem = async () => {
          if (!itemForm.name || !itemForm.category || !itemForm.sku) {
               alert('Please fill in all required fields');
               return;
          }

          try {
               setLoading(true);
               const itemData = {
                    name: itemForm.name,
                    category_name: itemForm.category,
                    supplier_name: itemForm.supplier,
                    sku: itemForm.sku,
                    description: itemForm.description,
                    unit: itemForm.unit,
                    current_stock: itemForm.currentStock,
                    min_stock: itemForm.minStock,
                    max_stock: itemForm.maxStock,
                    unit_price: itemForm.unitPrice,
                    location: itemForm.location,
                    expiry_date: itemForm.expiryDate || null
               };

               const resp = await customPost('inventory/items', 'POST', itemData);
               if (resp && (resp.success === true || resp.status === 'success' || resp.statusCode === 200)) {
                    toast.success(resp.message || 'Item added');
                    await loadInventoryItems(); // Reload items
                    setShowAddModal(false);
                    resetItemForm();
               } else {
                    const errMsg = resp?.error?.message || resp?.message || 'Failed to add item';
                    toast.error(errMsg);
               }
          } catch (error) {
               console.error('Error adding item:', error);
               alert('Error adding item');
          } finally {
               setLoading(false);
          }
     };

     const handleEditItem = (item: InventoryItem) => {
          setItemForm({
               name: item.name,
               category: item.category,
               supplier: item.supplier,
               sku: item.sku,
               description: item.description,
               unit: item.unit,
               currentStock: item.currentStock,
               minStock: item.minStock,
               maxStock: item.maxStock,
               unitPrice: item.unitPrice,
               location: item.location,
               expiryDate: item.expiryDate || ''
          });
          setSelectedItem(item);
          setShowAddModal(true);
     };

     const handleUpdateItem = async () => {
          if (!selectedItem || !itemForm.name || !itemForm.category || !itemForm.sku) {
               alert('Please fill in all required fields');
               return;
          }

          try {
               setLoading(true);
               const itemData = {
                    name: itemForm.name,
                    category_name: itemForm.category,
                    supplier_name: itemForm.supplier,
                    sku: itemForm.sku,
                    description: itemForm.description,
                    unit: itemForm.unit,
                    current_stock: itemForm.currentStock,
                    min_stock: itemForm.minStock,
                    max_stock: itemForm.maxStock,
                    unit_price: itemForm.unitPrice,
                    location: itemForm.location,
                    expiry_date: itemForm.expiryDate || null
               };

               const resp = await customPost(`inventory/items/${selectedItem.id}`, 'PUT', itemData);
               if (resp && (resp.success === true || resp.status === 'success' || resp.statusCode === 200)) {
                    toast.success(resp.message || 'Item updated');
                    await loadInventoryItems(); // Reload items
                    setShowAddModal(false);
                    setSelectedItem(null);
                    resetItemForm();
               } else {
                    const errMsg = resp?.error?.message || resp?.message || 'Failed to update item';
                    toast.error(errMsg);
               }
          } catch (error) {
               console.error('Error updating item:', error);
               alert('Error updating item');
          } finally {
               setLoading(false);
          }
     };

     const handleDeleteItem = async (itemId: string) => {
          if (!confirm('Are you sure you want to delete this item?')) return;

          try {
               setLoading(true);
               const resp = await customPost(`inventory/items/${itemId}`, 'DELETE', {});
               if (resp && (resp.success === true || resp.status === 'success' || resp.statusCode === 200)) {
                    toast.success(resp.message || 'Item deleted');
                    await loadInventoryItems(); // Reload items
               } else {
                    const errMsg = resp?.error?.message || resp?.message || 'Failed to delete item';
                    toast.error(errMsg);
               }
          } catch (error) {
               console.error('Error deleting item:', error);
               alert('Error deleting item');
          } finally {
               setLoading(false);
          }
     };

     const handleAddCategory = async () => {
          if (!categoryForm.name) {
               alert('Please enter a category name');
               return;
          }

          try {
               setLoading(true);
               const categoryData = {
                    name: categoryForm.name,
                    description: categoryForm.description
               };

               const resp = await customPost('inventory/categories', 'POST', categoryData);
               if (resp && (resp.success === true || resp.status === 'success' || resp.statusCode === 200)) {
                    toast.success(resp.message || 'Category added');
                    await loadCategories(); // Reload categories
                    setShowCategoryModal(false);
                    setCategoryForm({ name: '', description: '' });
               } else {
                    const errMsg = resp?.error?.message || resp?.message || 'Failed to add category';
                    toast.error(errMsg);
               }
          } catch (error) {
               console.error('Error adding category:', error);
               alert('Error adding category');
          } finally {
               setLoading(false);
          }
     };

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
               if (resp && (resp.success === true || resp.status === 'success' || resp.statusCode === 200)) {
                    toast.success(resp.message || 'Supplier added');
                    await loadSuppliers(); // Reload suppliers
                    setShowSupplierModal(false);
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

     const resetItemForm = () => {
          setItemForm({
               name: '',
               category: '',
               supplier: '',
               sku: '',
               description: '',
               unit: 'pieces',
               currentStock: 0,
               minStock: 0,
               maxStock: 0,
               unitPrice: 0,
               location: '',
               expiryDate: ''
          });
     };

     const handleCameraCapture = async () => {
          try {
               const stream = await navigator.mediaDevices.getUserMedia({ video: true });
               if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    setShowCameraModal(true);
               }
          } catch (error) {
               alert('Camera access denied or not available');
          }
     };

     const captureImage = () => {
          if (videoRef.current && canvasRef.current) {
               const context = canvasRef.current.getContext('2d');
               if (context) {
                    canvasRef.current.width = videoRef.current.videoWidth;
                    canvasRef.current.height = videoRef.current.videoHeight;
                    context.drawImage(videoRef.current, 0, 0);
                    const imageData = canvasRef.current.toDataURL('image/png');
                    // Note: Camera functionality removed - transaction recording moved to dedicated page
                    setShowCameraModal(false);

                    // Stop camera stream
                    const stream = videoRef.current.srcObject as MediaStream;
                    stream?.getTracks().forEach(track => track.stop());
               }
          }
     };

     const stats = getInventoryStats();

     return (
          <div className="container-fluid p-4">
               {/* Header */}
               <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                         <h2 className="mb-1">
                              <RiStoreLine className="me-2" />
                              Inventory Management
                         </h2>
                         <p className="text-muted mb-0">Manage laboratory supplies, equipment, and consumables</p>
                    </div>
                    <div className="d-flex gap-2">
                         <Link href="/inventory/analytics" className="btn btn-outline-success btn-sm">
                              <RiBarChartLine className="me-1" />
                              View Analytics
                         </Link>
                         <button className="btn btn-outline-primary btn-sm">
                              <RiDownloadLine className="me-1" />
                              Export Data
                         </button>
                         <button className="btn btn-outline-secondary btn-sm">
                              <RiUploadLine className="me-1" />
                              Import Data
                         </button>
                         <button className="btn btn-outline-info btn-sm">
                              <RiPriceTagLine className="me-1" />
                              Add Category
                         </button>
                         <button
                              className="btn btn-outline-dark btn-sm"
                              onClick={handleCameraCapture}
                         >
                              <RiCameraLine className="me-1" />
                              Camera
                         </button>
                         <button
                              className="btn btn-primary btn-sm"
                              onClick={() => setShowAddModal(true)}
                         >
                              <RiAddLine className="me-1" />
                              Add Item
                         </button>
                    </div>
               </div>

               {/* Navigation Tabs */}
               <ul className="nav nav-tabs mb-4">
                    <li className="nav-item">
                         <button
                              className={`nav-link ${activeTab === 'overview' ? 'active' : ''}`}
                              onClick={() => setActiveTab('overview')}
                         >
                              Overview
                         </button>
                    </li>
                    <li className="nav-item">
                         <button
                              className={`nav-link ${activeTab === 'items' ? 'active' : ''}`}
                              onClick={() => setActiveTab('items')}
                         >
                              Items ({inventoryItems.length})
                         </button>
                    </li>
                    <li className="nav-item">
                         <button
                              className={`nav-link ${activeTab === 'categories' ? 'active' : ''}`}
                              onClick={() => setActiveTab('categories')}
                         >
                              Categories ({categories.length})
                         </button>
                    </li>
               </ul>

               {/* Overview Tab */}
               {activeTab === 'overview' && (
                    <div className="row">
                         {/* Statistics Cards */}
                         <div className="col-md-3 mb-4">
                              <div className="card h-100">
                                   <div className="card-body text-center">
                                        <RiBox3Line size={48} className="text-primary mb-3" />
                                        <h3 className="card-title">{stats.totalItems}</h3>
                                        <p className="card-text text-muted">Total Items</p>
                                   </div>
                              </div>
                         </div>
                         <div className="col-md-3 mb-4">
                              <div className="card h-100">
                                   <div className="card-body text-center">
                                        <RiPriceTagLine size={48} className="text-success mb-3" />
                                        <h3 className="card-title">${stats.totalValue.toFixed(2)}</h3>
                                        <p className="card-text text-muted">Total Value</p>
                                   </div>
                              </div>
                         </div>
                         <div className="col-md-3 mb-4">
                              <div className="card h-100">
                                   <div className="card-body text-center">
                                        <RiAlertLine size={48} className="text-warning mb-3" />
                                        <h3 className="card-title">{stats.lowStockItems}</h3>
                                        <p className="card-text text-muted">Low Stock Items</p>
                                   </div>
                              </div>
                         </div>
                         <div className="col-md-3 mb-4">
                              <div className="card h-100">
                                   <div className="card-body text-center">
                                        <RiCloseLine size={48} className="text-danger mb-3" />
                                        <h3 className="card-title">{stats.outOfStockItems}</h3>
                                        <p className="card-text text-muted">Out of Stock</p>
                                   </div>
                              </div>
                         </div>

                         {/* Low Stock Alerts */}
                         <div className="col-12 mb-4">
                              <div className="card">
                                   <div className="card-header">
                                        <h5 className="mb-0">Low Stock Alerts</h5>
                                   </div>
                                   <div className="card-body">
                                        {inventoryItems.filter(item => item.status === 'low_stock').length > 0 ? (
                                             <div className="row">
                                                  {inventoryItems.filter(item => item.status === 'low_stock').map(item => (
                                                       <div key={item.id} className="col-md-6 mb-3">
                                                            <div className="alert alert-warning">
                                                                 <div className="d-flex justify-content-between align-items-start">
                                                                      <div>
                                                                           <h6 className="alert-heading mb-1">{item.name}</h6>
                                                                           <p className="mb-1">Current: {item.currentStock} {item.unit} | Min: {item.minStock} {item.unit}</p>
                                                                           <small className="text-muted">SKU: {item.sku}</small>
                                                                      </div>
                                                                      <button className="btn btn-sm btn-warning">Reorder</button>
                                                                 </div>
                                                            </div>
                                                       </div>
                                                  ))}
                                             </div>
                                        ) : (
                                             <div className="text-center py-4">
                                                  <RiCheckLine size={48} className="text-success mb-3" />
                                                  <h6 className="text-muted">All items are sufficiently stocked!</h6>
                                             </div>
                                        )}
                                   </div>
                              </div>
                         </div>
                    </div>
               )}

               {/* Items Tab */}
               {activeTab === 'items' && (
                    <div className="card">
                         <div className="card-header">
                              <h5 className="mb-0">Inventory Items</h5>
                         </div>
                         <div className="card-body p-0">
                              <PrimeTable
                                   column={inventoryColumns}
                                   data={inventoryItems}
                                   filtering={true}
                                   handleSeverSideProcessing={true}
                                   serverSideFiltering={true}
                              />
                         </div>
                    </div>
               )}

               {/* Categories Tab */}
               {activeTab === 'categories' && (
                    <div className="row">
                         {categories.map(category => (
                              <div key={category.id} className="col-md-6 col-lg-4 mb-4">
                                   <div className="card h-100">
                                        <div className="card-header d-flex justify-content-between align-items-center">
                                             <h6 className="mb-0">{category.name}</h6>
                                             <span className="badge bg-primary">{category.itemCount} items</span>
                                        </div>
                                        <div className="card-body">
                                             <p className="text-muted mb-3">{category.description}</p>
                                             <div className="d-flex gap-2">
                                                  <button className="btn btn-sm btn-outline-primary">Edit</button>
                                                  <button className="btn btn-sm btn-outline-info">View Items</button>
                                             </div>
                                        </div>
                                   </div>
                              </div>
                         ))}
                    </div>
               )}

               {/* Add Item Modal */}
               {showAddModal && (
                    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                         <div className="modal-dialog modal-lg">
                              <div className="modal-content">
                                   <div className="modal-header">
                                        <h5 className="modal-title">Add Inventory Item</h5>
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
                                                       <label className="form-label">Item Name *</label>
                                                       <input
                                                            type="text"
                                                            className="form-control"
                                                            value={itemForm.name}
                                                            onChange={(e) => setItemForm(prev => ({ ...prev, name: e.target.value }))}
                                                            placeholder="Enter item name"
                                                       />
                                                  </div>
                                                  <div className="mb-3">
                                                       <label className="form-label">SKU *</label>
                                                       <input
                                                            type="text"
                                                            className="form-control"
                                                            value={itemForm.sku}
                                                            onChange={(e) => setItemForm(prev => ({ ...prev, sku: e.target.value }))}
                                                            placeholder="Unique stock keeping unit"
                                                       />
                                                  </div>
                                                  <div className="mb-3">
                                                       <label className="form-label">Category *</label>
                                                       <select
                                                            className="form-select"
                                                            value={itemForm.category}
                                                            onChange={(e) => setItemForm(prev => ({ ...prev, category: e.target.value }))}
                                                       >
                                                            <option value="">Select category</option>
                                                            {categories.map(category => (
                                                                 <option key={category.id} value={category.name}>{category.name}</option>
                                                            ))}
                                                       </select>
                                                  </div>
                                                  <div className="mb-3">
                                                       <label className="form-label">Supplier</label>
                                                       <select
                                                            className="form-select"
                                                            value={itemForm.supplier}
                                                            onChange={(e) => setItemForm(prev => ({ ...prev, supplier: e.target.value }))}
                                                       >
                                                            <option value="">Select supplier</option>
                                                            {suppliers.map(supplier => (
                                                                 <option key={supplier.id} value={supplier.name}>{supplier.name}</option>
                                                            ))}
                                                       </select>
                                                  </div>
                                             </div>
                                             <div className="col-md-6">
                                                  <div className="mb-3">
                                                       <label className="form-label">Unit</label>
                                                       <select
                                                            className="form-select"
                                                            value={itemForm.unit}
                                                            onChange={(e) => setItemForm(prev => ({ ...prev, unit: e.target.value }))}
                                                       >
                                                            <option value="pieces">Pieces</option>
                                                            <option value="boxes">Boxes</option>
                                                            <option value="bottles">Bottles</option>
                                                            <option value="packs">Packs</option>
                                                            <option value="liters">Liters</option>
                                                            <option value="kg">Kilograms</option>
                                                       </select>
                                                  </div>
                                                  <div className="row">
                                                       <div className="col-4">
                                                            <div className="mb-3">
                                                                 <label className="form-label">Current Stock</label>
                                                                 <input
                                                                      type="number"
                                                                      className="form-control"
                                                                      value={itemForm.currentStock}
                                                                      onChange={(e) => setItemForm(prev => ({ ...prev, currentStock: parseInt(e.target.value) || 0 }))}
                                                                      min="0"
                                                                 />
                                                            </div>
                                                       </div>
                                                       <div className="col-4">
                                                            <div className="mb-3">
                                                                 <label className="form-label">Min Stock</label>
                                                                 <input
                                                                      type="number"
                                                                      className="form-control"
                                                                      value={itemForm.minStock}
                                                                      onChange={(e) => setItemForm(prev => ({ ...prev, minStock: parseInt(e.target.value) || 0 }))}
                                                                      min="0"
                                                                 />
                                                            </div>
                                                       </div>
                                                       <div className="col-4">
                                                            <div className="mb-3">
                                                                 <label className="form-label">Max Stock</label>
                                                                 <input
                                                                      type="number"
                                                                      className="form-control"
                                                                      value={itemForm.maxStock}
                                                                      onChange={(e) => setItemForm(prev => ({ ...prev, maxStock: parseInt(e.target.value) || 0 }))}
                                                                      min="0"
                                                                 />
                                                            </div>
                                                       </div>
                                                  </div>
                                                  <div className="mb-3">
                                                       <label className="form-label">Unit Price ($)</label>
                                                       <input
                                                            type="number"
                                                            className="form-control"
                                                            value={itemForm.unitPrice}
                                                            onChange={(e) => setItemForm(prev => ({ ...prev, unitPrice: parseFloat(e.target.value) || 0 }))}
                                                            step="0.01"
                                                            min="0"
                                                       />
                                                  </div>
                                             </div>
                                        </div>
                                        <div className="row">
                                             <div className="col-md-6">
                                                  <div className="mb-3">
                                                       <label className="form-label">Location</label>
                                                       <input
                                                            type="text"
                                                            className="form-control"
                                                            value={itemForm.location}
                                                            onChange={(e) => setItemForm(prev => ({ ...prev, location: e.target.value }))}
                                                            placeholder="Storage location"
                                                       />
                                                  </div>
                                             </div>
                                             <div className="col-md-6">
                                                  <div className="mb-3">
                                                       <label className="form-label">Expiry Date</label>
                                                       <input
                                                            type="date"
                                                            className="form-control"
                                                            value={itemForm.expiryDate}
                                                            onChange={(e) => setItemForm(prev => ({ ...prev, expiryDate: e.target.value }))}
                                                       />
                                                  </div>
                                             </div>
                                        </div>
                                        <div className="mb-3">
                                             <label className="form-label">Description</label>
                                             <textarea
                                                  className="form-control"
                                                  rows={3}
                                                  value={itemForm.description}
                                                  onChange={(e) => setItemForm(prev => ({ ...prev, description: e.target.value }))}
                                                  placeholder="Item description..."
                                             />
                                        </div>
                                   </div>
                                   <div className="modal-footer">
                                        <button
                                             type="button"
                                             className="btn btn-secondary btn-sm"
                                             onClick={() => {
                                                  setShowAddModal(false);
                                                  setSelectedItem(null);
                                                  resetItemForm();
                                             }}
                                        >
                                             Cancel
                                        </button>
                                        <button
                                             type="button"
                                             className="btn btn-primary btn-sm"
                                             onClick={selectedItem ? handleUpdateItem : handleAddItem}
                                             disabled={loading}
                                        >
                                             {loading ? 'Saving...' : selectedItem ? 'Update Item' : 'Add Item'}
                                        </button>
                                   </div>
                              </div>
                         </div>
                    </div>
               )}

               {/* Add Category Modal */}
               {showCategoryModal && (
                    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                         <div className="modal-dialog">
                              <div className="modal-content">
                                   <div className="modal-header">
                                        <h5 className="modal-title">Add Category</h5>
                                        <button
                                             type="button"
                                             className="btn-close"
                                             onClick={() => setShowCategoryModal(false)}
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
                                             onClick={() => setShowCategoryModal(false)}
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

               {/* Add Supplier Modal */}
               {showSupplierModal && (
                    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                         <div className="modal-dialog">
                              <div className="modal-content">
                                   <div className="modal-header">
                                        <h5 className="modal-title">Add Supplier</h5>
                                        <button
                                             type="button"
                                             className="btn-close"
                                             onClick={() => setShowSupplierModal(false)}
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
                                             onClick={() => setShowSupplierModal(false)}
                                        >
                                             Cancel
                                        </button>
                                        <button
                                             type="button"
                                             className="btn btn-success btn-sm"
                                             onClick={handleAddSupplier}
                                        >
                                             Add Supplier
                                        </button>
                                   </div>
                              </div>
                         </div>
                    </div>
               )}

               {/* Item Details Modal */}
               {selectedItem && (
                    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                         <div className="modal-dialog modal-lg">
                              <div className="modal-content">
                                   <div className="modal-header">
                                        <h5 className="modal-title">Item Details - {selectedItem.name}</h5>
                                        <button
                                             type="button"
                                             className="btn-close"
                                             onClick={() => setSelectedItem(null)}
                                        ></button>
                                   </div>
                                   <div className="modal-body">
                                        <div className="row">
                                             <div className="col-md-6">
                                                  <p><strong>SKU:</strong> {selectedItem.sku}</p>
                                                  <p><strong>Category:</strong> {selectedItem.category}</p>
                                                  <p><strong>Supplier:</strong> {selectedItem.supplier}</p>
                                                  <p><strong>Location:</strong> {selectedItem.location}</p>
                                                  <p><strong>Status:</strong>
                                                       <span className={`badge bg-${STATUS_BADGES[selectedItem.status].color} ms-2`}>
                                                            {STATUS_BADGES[selectedItem.status].label}
                                                       </span>
                                                  </p>
                                             </div>
                                             <div className="col-md-6">
                                                  <p><strong>Current Stock:</strong> {selectedItem.currentStock} {selectedItem.unit}</p>
                                                  <p><strong>Min/Max Stock:</strong> {selectedItem.minStock} / {selectedItem.maxStock} {selectedItem.unit}</p>
                                                  <p><strong>Unit Price:</strong> ${selectedItem.unitPrice.toFixed(2)}</p>
                                                  <p><strong>Total Value:</strong> ${selectedItem.totalValue.toFixed(2)}</p>
                                                  {selectedItem.expiryDate && (
                                                       <p><strong>Expiry Date:</strong> {new Date(selectedItem.expiryDate).toLocaleDateString()}</p>
                                                  )}
                                             </div>
                                        </div>
                                        {selectedItem.description && (
                                             <div className="mt-3">
                                                  <strong>Description:</strong>
                                                  <p className="mt-1">{selectedItem.description}</p>
                                             </div>
                                        )}
                                   </div>
                                   <div className="modal-footer">
                                        <button
                                             type="button"
                                             className="btn btn-secondary btn-sm"
                                             onClick={() => setSelectedItem(null)}
                                        >
                                             Close
                                        </button>
                                   </div>
                              </div>
                         </div>
                    </div>
               )}

               {/* Camera Modal */}
               {showCameraModal && (
                    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}>
                         <div className="modal-dialog modal-lg">
                              <div className="modal-content">
                                   <div className="modal-header">
                                        <h5 className="modal-title">Capture Image</h5>
                                        <button
                                             type="button"
                                             className="btn-close"
                                             onClick={() => {
                                                  setShowCameraModal(false);
                                                  const stream = videoRef.current?.srcObject as MediaStream;
                                                  stream?.getTracks().forEach(track => track.stop());
                                             }}
                                        ></button>
                                   </div>
                                   <div className="modal-body text-center">
                                        <video
                                             ref={videoRef}
                                             autoPlay
                                             className="w-100 rounded"
                                             style={{ maxHeight: '400px' }}
                                        />
                                        <canvas ref={canvasRef} style={{ display: 'none' }} />
                                   </div>
                                   <div className="modal-footer">
                                        <button
                                             type="button"
                                             className="btn btn-secondary"
                                             onClick={() => {
                                                  setShowCameraModal(false);
                                                  const stream = videoRef.current?.srcObject as MediaStream;
                                                  stream?.getTracks().forEach(track => track.stop());
                                             }}
                                        >
                                             Cancel
                                        </button>
                                        <button
                                             type="button"
                                             className="btn btn-primary"
                                             onClick={captureImage}
                                        >
                                             <RiCameraLine className="me-1" />
                                             Capture
                                        </button>
                                   </div>
                              </div>
                         </div>
                    </div>
               )}
          </div>
     );
}