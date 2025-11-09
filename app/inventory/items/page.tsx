'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { RiBox3Line, RiAddLine, RiEditLine, RiDeleteBinLine, RiEyeLine, RiDownloadLine, RiUploadLine } from '@remixicon/react';
import PrimeTable from '../../../components/accessories/Datatables/PrimeTable';


interface InventoryItem {
     id: string;
     name: string;
     category: string;
     brand?: string; // Simple brand name
     supplier?: string;
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

interface Brand {
     id: string;
     name: string;
     createdDate: string;
     itemCount: number;
}

const STATUS_BADGES = {
     in_stock: { label: 'In Stock', color: 'success' },
     low_stock: { label: 'Low Stock', color: 'warning' },
     out_of_stock: { label: 'Out of Stock', color: 'danger' },
     expired: { label: 'Expired', color: 'secondary' }
};

const CATEGORIES = [
     'Reagents & Chemicals',
     'Consumables',
     'Equipment',
     'Glassware',
     'PPE',
     'Media & Buffers',
     'Standards & Controls',
     'Other'
];

export default function InventoryItemsPage() {
     const router = useRouter();
     const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
     const [categories, setCategories] = useState<InventoryCategory[]>([]);
     const [suppliers, setSuppliers] = useState<Supplier[]>([]);
     const [brands, setBrands] = useState<Brand[]>([]);
     const [showAddModal, setShowAddModal] = useState(false);
     const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
     const [showAddBrandModal, setShowAddBrandModal] = useState(false);
     const [loading, setLoading] = useState(false);

     // Form states
     const [itemForm, setItemForm] = useState({
          name: '',
          category: '',
          brand: '',
          sku: '',
          description: '',
          unit: 'pieces',
          currentStock: 0,
          minStock: 0,
          maxStock: 0,
          unitPrice: 0,
          location: ''
     });

     const [brandForm, setBrandForm] = useState({
          currentName: '',
          addedBrands: [] as string[]
     });

     // Mock data for demonstration
     useEffect(() => {
          const mockItems: InventoryItem[] = [
               {
                    id: '1',
                    name: 'Blood Collection Tubes (EDTA)',
                    category: 'Consumables',
                    brand: 'Vacuette',
                    supplier: 'LabCorp Supplies',
                    sku: 'BCT-001-EDTA',
                    description: '10mL EDTA blood collection tubes',
                    unit: 'boxes',
                    currentStock: 25,
                    minStock: 10,
                    maxStock: 100,
                    unitPrice: 45.50,
                    totalValue: 1142.50,
                    location: 'Storage Room A',
                    expiryDate: '2026-06-15',
                    lastUpdated: '2025-11-09T10:00:00Z',
                    status: 'in_stock'
               },
               {
                    id: '2',
                    name: 'Glucose Test Strips',
                    category: 'Consumables',
                    brand: 'Accu-Chek',
                    supplier: 'MediTech Inc',
                    sku: 'GTS-050',
                    description: 'Glucose test strips - 50 count',
                    unit: 'boxes',
                    currentStock: 5,
                    minStock: 15,
                    maxStock: 50,
                    unitPrice: 25.00,
                    totalValue: 125.00,
                    location: 'Storage Room B',
                    expiryDate: '2025-12-01',
                    lastUpdated: '2025-11-08T14:30:00Z',
                    status: 'low_stock'
               },
               {
                    id: '3',
                    name: 'Sodium Chloride 0.9%',
                    category: 'Reagents & Chemicals',
                    brand: 'Baxter',
                    supplier: 'ChemSolutions Ltd',
                    sku: 'NaCl-09-500',
                    description: '500mL bottles of 0.9% NaCl solution',
                    unit: 'bottles',
                    currentStock: 0,
                    minStock: 20,
                    maxStock: 200,
                    unitPrice: 8.75,
                    totalValue: 0,
                    location: 'Chemical Storage',
                    expiryDate: '2026-03-20',
                    lastUpdated: '2025-11-07T09:15:00Z',
                    status: 'out_of_stock'
               },
               {
                    id: '4',
                    name: 'Microcentrifuge Tubes',
                    category: 'Consumables',
                    brand: 'Eppendorf',
                    supplier: 'LabEssentials',
                    sku: 'MCT-15-500',
                    description: '1.5mL microcentrifuge tubes, 500 pack',
                    unit: 'packs',
                    currentStock: 8,
                    minStock: 5,
                    maxStock: 30,
                    unitPrice: 12.50,
                    totalValue: 100.00,
                    location: 'Storage Room A',
                    lastUpdated: '2025-11-06T16:45:00Z',
                    status: 'in_stock'
               }
          ];

          const mockCategories: InventoryCategory[] = [
               { id: '1', name: 'Consumables', description: 'Disposable lab supplies', itemCount: 25 },
               { id: '2', name: 'Reagents & Chemicals', description: 'Chemical reagents and solutions', itemCount: 15 },
               { id: '3', name: 'Equipment', description: 'Lab equipment and instruments', itemCount: 8 },
               { id: '4', name: 'PPE', description: 'Personal protective equipment', itemCount: 12 }
          ];

          const mockSuppliers: Supplier[] = [
               { id: '1', name: 'LabCorp Supplies', contact: 'John Smith', email: 'orders@labcorp.com', phone: '+1-555-0101' },
               { id: '2', name: 'MediTech Inc', contact: 'Sarah Johnson', email: 'sales@meditech.com', phone: '+1-555-0102' },
               { id: '3', name: 'ChemSolutions Ltd', contact: 'Mike Davis', email: 'info@chemsolutions.com', phone: '+1-555-0103' }
          ];

          const mockBrands: Brand[] = [
               { id: '1', name: 'Vacuette', createdDate: '2025-01-15', itemCount: 5 },
               { id: '2', name: 'Accu-Chek', createdDate: '2025-02-20', itemCount: 3 },
               { id: '3', name: 'Baxter', createdDate: '2025-03-10', itemCount: 8 },
               { id: '4', name: 'Eppendorf', createdDate: '2025-04-05', itemCount: 12 },
               { id: '5', name: 'BD Biosciences', createdDate: '2025-05-12', itemCount: 6 },
               { id: '6', name: 'Thermo Fisher', createdDate: '2025-06-18', itemCount: 15 }
          ];

          setInventoryItems(mockItems);
          setCategories(mockCategories);
          setSuppliers(mockSuppliers);
          setBrands(mockBrands);
     }, []);

     const inventoryColumns = [
          {
               Header: 'Item Name',
               accessor: 'name',
          },
          {
               Header: 'Brand',
               accessor: 'brand',
               Cell: ({ value }) => value || 'Not specified'
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
                              className="btn btn-sm btn-outline-success"
                              title="Add Brand"
                              onClick={handleAddBrand}
                         >
                              <RiAddLine size={14} />
                         </button>
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

     const handleAddItem = () => {
          if (!itemForm.name || !itemForm.category || !itemForm.sku) {
               alert('Please fill in all required fields');
               return;
          }

          const newItem: InventoryItem = {
               id: Date.now().toString(),
               name: itemForm.name,
               category: itemForm.category,
               brand: itemForm.brand || undefined,
               sku: itemForm.sku,
               description: itemForm.description,
               unit: itemForm.unit,
               currentStock: itemForm.currentStock,
               minStock: itemForm.minStock,
               maxStock: itemForm.maxStock,
               unitPrice: itemForm.unitPrice,
               totalValue: itemForm.currentStock * itemForm.unitPrice,
               location: itemForm.location,
               lastUpdated: new Date().toISOString(),
               status: itemForm.currentStock === 0 ? 'out_of_stock' :
                    itemForm.currentStock <= itemForm.minStock ? 'low_stock' : 'in_stock'
          };

          setInventoryItems(prev => [...prev, newItem]);
          setShowAddModal(false);
          resetItemForm();
     };

     const handleEditItem = (item: InventoryItem) => {
          setSelectedItem(item);
          setItemForm({
               name: item.name,
               category: item.category,
               brand: item.brand || '',
               sku: item.sku,
               description: item.description,
               unit: item.unit,
               currentStock: item.currentStock,
               minStock: item.minStock,
               maxStock: item.maxStock,
               unitPrice: item.unitPrice,
               location: item.location
          });
          setShowAddModal(true);
     };

     const handleUpdateItem = () => {
          if (!selectedItem) return;

          if (!itemForm.name || !itemForm.category || !itemForm.sku) {
               alert('Please fill in all required fields');
               return;
          }

          const updatedItem: InventoryItem = {
               ...selectedItem,
               name: itemForm.name,
               category: itemForm.category,
               brand: itemForm.brand || undefined,
               sku: itemForm.sku,
               description: itemForm.description,
               unit: itemForm.unit,
               currentStock: itemForm.currentStock,
               minStock: itemForm.minStock,
               maxStock: itemForm.maxStock,
               unitPrice: itemForm.unitPrice,
               totalValue: itemForm.currentStock * itemForm.unitPrice,
               location: itemForm.location,
               lastUpdated: new Date().toISOString(),
               status: itemForm.currentStock === 0 ? 'out_of_stock' :
                    itemForm.currentStock <= itemForm.minStock ? 'low_stock' : 'in_stock'
          };

          setInventoryItems(prev => prev.map(item =>
               item.id === selectedItem.id ? updatedItem : item
          ));
          setShowAddModal(false);
          setSelectedItem(null);
          resetItemForm();
     };

     const handleDeleteItem = (itemId: string) => {
          if (confirm('Are you sure you want to delete this item?')) {
               setInventoryItems(prev => prev.filter(item => item.id !== itemId));
          }
     };

     const handleAddBrand = () => {
          setShowAddBrandModal(true);
     };

     const handleAddSingleBrand = () => {
          if (!brandForm.currentName.trim()) {
               alert('Please enter a brand name');
               return;
          }

          const brandName = brandForm.currentName.trim();

          // Check if already in the added list
          if (brandForm.addedBrands.includes(brandName)) {
               alert('This brand is already in the list');
               return;
          }

          // Check if already exists in global brands
          const existingNames = brands.map(b => b.name.toLowerCase());
          if (existingNames.includes(brandName.toLowerCase())) {
               alert('This brand already exists');
               return;
          }

          setBrandForm(prev => ({
               ...prev,
               currentName: '',
               addedBrands: [...prev.addedBrands, brandName]
          }));
     };

     const handleRemoveBrand = (brandName: string) => {
          setBrandForm(prev => ({
               ...prev,
               addedBrands: prev.addedBrands.filter(name => name !== brandName)
          }));
     };

     const handleSaveBrands = () => {
          if (brandForm.addedBrands.length === 0) {
               alert('Please add at least one brand');
               return;
          }

          // Create new brands
          const newBrands: Brand[] = brandForm.addedBrands.map(name => ({
               id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
               name: name,
               createdDate: new Date().toISOString(),
               itemCount: 0
          }));

          setBrands(prev => [...prev, ...newBrands]);
          setShowAddBrandModal(false);
          setBrandForm({ currentName: '', addedBrands: [] });
          alert(`Successfully added ${newBrands.length} brand(s)!`);
     };

     const resetItemForm = () => {
          setItemForm({
               name: '',
               category: '',
               brand: '',
               sku: '',
               description: '',
               unit: 'pieces',
               currentStock: 0,
               minStock: 0,
               maxStock: 0,
               unitPrice: 0,
               location: ''
          });
     };

     return (
          <div className="container-fluid p-4">
               {/* Header */}
               <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                         <h2 className="mb-1">
                              <RiBox3Line className="me-2" />
                              Inventory Items
                         </h2>
                         <p className="text-muted mb-0">Manage and track all laboratory inventory items</p>
                    </div>
                    <div className="d-flex gap-2">
                         <button className="btn btn-outline-primary btn-sm">
                              <RiDownloadLine className="me-1" />
                              Export Items
                         </button>
                         <button className="btn btn-outline-secondary btn-sm">
                              <RiUploadLine className="me-1" />
                              Import Items
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

               {/* Items Table */}
               <PrimeTable
                    column={inventoryColumns}
                    data={inventoryItems}
                    filtering={true}
                    handleSeverSideProcessing={false}
                    serverSideFiltering={false}
               />

               {/* Add Item Modal */}
               {showAddModal && (
                    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                         <div className="modal-dialog modal-lg">
                              <div className="modal-content">
                                   <div className="modal-header">
                                        <h5 className="modal-title">
                                             {selectedItem ? 'Edit Inventory Item' : 'Add Inventory Item'}
                                        </h5>
                                        <button
                                             type="button"
                                             className="btn-close"
                                             onClick={() => {
                                                  setShowAddModal(false);
                                                  setSelectedItem(null);
                                                  resetItemForm();
                                             }}
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
                                                            {CATEGORIES.map(category => (
                                                                 <option key={category} value={category}>{category}</option>
                                                            ))}
                                                       </select>
                                                  </div>
                                                  <div className="mb-3">
                                                       <label className="form-label">Brand</label>
                                                       <select
                                                            className="form-select"
                                                            value={itemForm.brand}
                                                            onChange={(e) => setItemForm(prev => ({ ...prev, brand: e.target.value }))}
                                                       >
                                                            <option value="">Select brand (optional)</option>
                                                            {brands.map(brand => (
                                                                 <option key={brand.id} value={brand.name}>{brand.name}</option>
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
                                        >
                                             {selectedItem ? 'Update Item' : 'Add Item'}
                                        </button>
                                   </div>
                              </div>
                         </div>
                    </div>
               )}

               {/* Add Brand Modal */}
               {showAddBrandModal && (
                    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                         <div className="modal-dialog modal-lg">
                              <div className="modal-content">
                                   <div className="modal-header">
                                        <h5 className="modal-title">Add Brands</h5>
                                        <button
                                             type="button"
                                             className="btn-close"
                                             onClick={() => {
                                                  setShowAddBrandModal(false);
                                                  setBrandForm({ currentName: '', addedBrands: [] });
                                             }}
                                        ></button>
                                   </div>
                                   <div className="modal-body">
                                        <div className="mb-3">
                                             <label className="form-label">Brand Name</label>
                                             <div className="input-group">
                                                  <input
                                                       type="text"
                                                       className="form-control"
                                                       value={brandForm.currentName}
                                                       onChange={(e) => setBrandForm(prev => ({ ...prev, currentName: e.target.value }))}
                                                       placeholder="Enter brand name"
                                                       onKeyPress={(e) => e.key === 'Enter' && handleAddSingleBrand()}
                                                  />
                                                  <button
                                                       className="btn btn-outline-primary"
                                                       type="button"
                                                       onClick={handleAddSingleBrand}
                                                       disabled={!brandForm.currentName.trim()}
                                                  >
                                                       Add
                                                  </button>
                                             </div>
                                        </div>

                                        {brandForm.addedBrands.length > 0 && (
                                             <div className="mb-3">
                                                  <label className="form-label">Brands to Add ({brandForm.addedBrands.length})</label>
                                                  <div className="list-group" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                                       {brandForm.addedBrands.map((brand, index) => (
                                                            <div key={index} className="list-group-item d-flex justify-content-between align-items-center py-2">
                                                                 <small className="text-muted mb-0">{brand}</small>
                                                                 <button
                                                                      className="btn btn-sm btn-outline-danger ms-2"
                                                                      onClick={() => handleRemoveBrand(brand)}
                                                                      title="Remove brand"
                                                                 >
                                                                      <RiDeleteBinLine size={12} />
                                                                 </button>
                                                            </div>
                                                       ))}
                                                  </div>
                                             </div>
                                        )}
                                   </div>
                                   <div className="modal-footer">
                                        <button
                                             type="button"
                                             className="btn btn-secondary btn-sm"
                                             onClick={() => {
                                                  setShowAddBrandModal(false);
                                                  setBrandForm({ currentName: '', addedBrands: [] });
                                             }}
                                        >
                                             Cancel
                                        </button>
                                        <button
                                             type="button"
                                             className="btn btn-primary btn-sm"
                                             onClick={handleSaveBrands}
                                             disabled={brandForm.addedBrands.length === 0}
                                        >
                                             Save Brands ({brandForm.addedBrands.length})
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
                                                  <p><strong>Brand:</strong> {selectedItem.brand || 'Not specified'}</p>
                                                  <p><strong>Category:</strong> {selectedItem.category}</p>
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
          </div>
     );
}