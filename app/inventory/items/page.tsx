'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { RiBox3Line, RiAddLine, RiEditLine, RiDeleteBinLine, RiEyeLine, RiInboxLine, RiHistoryLine, RiBarChartLine } from '@remixicon/react';
import PrimeTable from '../../../components/accessories/Datatables/PrimeTable';
import { customFetch, customPost } from '../../../components/Auth/customFetch';
import { useApplicationSettings } from '../../../components/Auth/useApplicationContext';
import { toast } from 'react-toastify';


interface InventoryItem {
     id: string;
     name: string;
     category: string;
     brand?: string; // Simple brand name
     supplier?: string;
     sku: string;
     description: string;
     consumption_unit: string; // Changed from unit
     currentStock: number;
     minStock: number;
     maxStock: number;
     unitPrice: number;
     totalValue: number;
     location: string;
     expiryDate?: string;
     lastUpdated: string;
     status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'expired';
     // Additional fields from API
     category_id?: string;
     brand_id?: string;
     supplier_id?: string;
     location_id?: string;
     batch_number?: string;
     is_active?: boolean;
     created_at?: string;
     updated_at?: string;
     category_name?: string;
     brand_name?: string;
     supplier_name?: string;
     location_name?: string;
     consumption_unit_name?: string; // Added
}

interface InventoryCategory {
     id: string;
     name: string;
     description: string;
     item_count: number;
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

const STATUS_BADGES = {
     in_stock: { label: 'In Stock', color: 'success' },
     low_stock: { label: 'Low Stock', color: 'warning' },
     out_of_stock: { label: 'Out of Stock', color: 'danger' },
     expired: { label: 'Expired', color: 'secondary' }
};

export default function InventoryItemsPage() {
     const router = useRouter();
     const { branchid, user } = useApplicationSettings().applicationsettings || {};
     const employeeid = user?.employeeid;
     const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
     const [categories, setCategories] = useState<InventoryCategory[]>([]);
     const [suppliers, setSuppliers] = useState<Supplier[]>([]);
     const [brands, setBrands] = useState<Brand[]>([]);
     const [storageLocations, setStorageLocations] = useState<StorageLocation[]>([]);
     const [showAddModal, setShowAddModal] = useState(false);
     const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
     const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
     const [showAddBrandModal, setShowAddBrandModal] = useState(false);
     const [selectedItemForBrand, setSelectedItemForBrand] = useState<InventoryItem | null>(null);
     const [existingBrandsForItem, setExistingBrandsForItem] = useState<any[]>([]);
     const [loading, setLoading] = useState(false);
     const [error, setError] = useState<string | null>(null);
     const [availableStock, setAvailableStock] = useState<any>(null);
     const [loadingStock, setLoadingStock] = useState(false);

     // Form states
     const [itemForm, setItemForm] = useState({
          name: '',
          category: '',
          sku: '',
          description: '',
          consumption_unit: 'pieces', // Changed from unit
          currentStock: 0,
          minStock: 0,
          maxStock: 0,
          location_id: '',
          expiryDate: '',
          batchNumber: ''
     });

     const [brandForm, setBrandForm] = useState({
          currentName: '',
          addedBrands: [] as string[]
     });

     // Load data from APIs
     const loadInventoryItems = async () => {
          try {
               setLoading(true);
               setError(null);
               const response = await customFetch(`inventory/items?branchid=${branchid}&employeeid=${employeeid}`);
               if (response.success) {
                    // Transform API data to match interface
                    const transformedData = (response.data || []).map((item: any) => ({
                         ...item,
                         currentStock: item.current_stock,
                         minStock: item.min_stock,
                         maxStock: item.max_stock,
                         lastUpdated: item.last_updated,
                         category: item.category_name,
                         location: item.location_name,
                         brand: item.brand_name,
                         supplier: item.supplier_name,
                         consumption_unit: item.consumption_unit,
                         consumption_unit_name: item.consumption_unit_name
                    }));
                    setInventoryItems(transformedData);
               } else {
                    setError(response.error?.message || 'Failed to load inventory items');
               }
          } catch (err) {
               setError('Failed to load inventory items');
               console.error('Error loading inventory items:', err);
          } finally {
               setLoading(false);
          }
     };

     const loadCategories = async () => {
          try {
               const response = await customFetch(`inventory/categories?branchid=${branchid}&employeeid=${employeeid}`);
               if (response.success) {
                    setCategories(response.data || []);
               }
          } catch (err) {
               console.error('Error loading categories:', err);
          }
     };

     const loadSuppliers = async () => {
          try {
               const response = await customFetch(`inventory/suppliers?branchid=${branchid}&employeeid=${employeeid}`);
               if (response.success) {
                    setSuppliers(response.data || []);
               }
          } catch (err) {
               console.error('Error loading suppliers:', err);
          }
     };

     const loadBrands = async () => {
          try {
               const response = await customFetch(`inventory/brands?branchid=${branchid}&employeeid=${employeeid}`);
               if (response.success) {
                    setBrands(response.data || []);
               }
          } catch (err) {
               console.error('Error loading brands:', err);
          }
     };

     const loadStorageLocations = async () => {
          try {
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
               setStorageLocations(mappedLocations);
          } catch (err) {
               console.error('Error loading storage locations:', err);
          }
     };

     // Load all data on component mount
     useEffect(() => {
          if (branchid && employeeid) {
               loadInventoryItems();
               loadCategories();
               loadSuppliers();
               loadBrands();
               loadStorageLocations();
          }
     }, [branchid, employeeid]);

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

               const endpoint = `inventory/items?${params.toString()}`;
               const response = await customFetch(endpoint);

               if (response.success) {
                    // Transform API data to match interface
                    const transformedData = (response.data || []).map((item: any) => ({
                         ...item,
                         currentStock: item.current_stock,
                         minStock: item.min_stock,
                         maxStock: item.max_stock,
                         lastUpdated: item.last_updated,
                         category: item.category_name,
                         location: item.location_name,
                         brand: item.brand_name,
                         supplier: item.supplier_name,
                         consumption_unit: item.consumption_unit,
                         consumption_unit_name: item.consumption_unit_name
                    }));

                    return { result: transformedData, error: false };
               } else {
                    return { result: [], error: true };
               }
          } catch (error) {
               console.error('Error in server-side processing:', error);
               return { result: [], error: true };
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
                         <span className="fw-bold">{row.original.currentStock} {row.original.consumption_unit}</span>
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
                    <span>
                         {STATUS_BADGES[value].label}
                    </span>
               )
          },
          {
               Header: 'Location',
               accessor: 'location_name',
               Cell: ({ value }) => value || 'Not assigned'
          },
          {
               Header: 'Actions',
               accessor: 'id',
               Cell: ({ row }) => (
                    <div className="d-flex gap-1">
                         <button
                              className="btn btn-sm btn-outline-success"
                              title="Add Brand"
                              onClick={() => handleAddBrand(row.original)}
                         >
                              <RiAddLine size={14} />
                         </button>
                         <button
                              className="btn btn-sm btn-outline-info"
                              title="View Details"
                              onClick={() => handleViewItem(row.original)}
                         >
                              <RiEyeLine size={14} />
                         </button>
                         <button
                              className="btn btn-sm btn-outline-warning"
                              title="View History"
                              onClick={() => handleViewHistory(row.original)}
                         >
                              <RiHistoryLine size={14} />
                         </button>
                         <button
                              className="btn btn-sm btn-outline-secondary"
                              title="View Analytics"
                              onClick={() => router.push(`/inventory/analytics/inventoryitems/${row.original.id}`)}
                         >
                              <RiBarChartLine size={14} />
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

     const handleAddItem = async () => {
          if (!itemForm.name || !itemForm.sku) {
               toast.error('Please fill in all required fields (name and SKU)');
               return;
          }

          try {
               setLoading(true);
               setError(null);

               // Find IDs for selected references
               const selectedCategory = categories.find(c => c.name === itemForm.category);

               const itemData = {
                    name: itemForm.name,
                    sku: itemForm.sku,
                    description: itemForm.description,
                    category_id: selectedCategory?.id,
                    consumption_unit: itemForm.consumption_unit,
                    current_stock: itemForm.currentStock,
                    min_stock: itemForm.minStock,
                    max_stock: itemForm.maxStock,
                    location_id: itemForm.location_id || undefined,
                    expiry_date: itemForm.expiryDate || undefined,
                    batch_number: itemForm.batchNumber || undefined,
                    branchid: branchid,
                    employeeid: employeeid
               };

               const response = await customPost('inventory/items', 'POST', itemData);

               if (response.success) {
                    setInventoryItems(prev => [response.data, ...prev]);
                    setShowAddModal(false);
                    resetItemForm();
                    toast.success('Item added successfully!');
               } else {
                    setError(response.error?.message || 'Failed to add item');
                    toast.error(response.error?.message || 'Failed to add item');
                    if (response.error?.details) {
                         toast.error(`Validation errors: ${response.error.details.map(d => d.message).join(', ')}`);
                    }
               }
          } catch (err) {
               setError('Failed to add item');
               console.error('Error adding item:', err);
               toast.error('Failed to add item');
          } finally {
               setLoading(false);
          }
     };

     const handleUpdateItem = async () => {
          if (!editingItem) return;

          if (!itemForm.name || !itemForm.sku) {
               toast.error('Please fill in all required fields (name and SKU)');
               return;
          }

          try {
               setLoading(true);
               setError(null);

               // Find IDs for selected references
               const selectedCategory = categories.find(c => c.name === itemForm.category);

               const itemData = {
                    name: itemForm.name,
                    sku: itemForm.sku,
                    description: itemForm.description,
                    category_id: selectedCategory?.id,
                    consumption_unit: itemForm.consumption_unit,
                    min_stock: itemForm.minStock,
                    max_stock: itemForm.maxStock,
                    location_id: itemForm.location_id || undefined,
                    expiry_date: itemForm.expiryDate || undefined,
                    batch_number: itemForm.batchNumber || undefined,
                    branchid: branchid,
                    employeeid: employeeid
               };

               const response = await customPost(`inventory/items/${editingItem.id}`, 'PUT', itemData);

               if (response.success) {
                    setInventoryItems(prev => prev.map(item =>
                         item.id === editingItem.id ? response.data : item
                    ));
                    setShowAddModal(false);
                    setEditingItem(null);
                    resetItemForm();
                    toast.success('Item updated successfully!');
               } else {
                    setError(response.error?.message || 'Failed to update item');
                    toast.error(response.error?.message || 'Failed to update item');
                    if (response.error?.details) {
                         toast.error(`Validation errors: ${response.error.details.map(d => d.message).join(', ')}`);
                    }
               }
          } catch (err) {
               setError('Failed to update item');
               console.error('Error updating item:', err);
               toast.error('Failed to update item');
          } finally {
               setLoading(false);
          }
     };

     const handleDeleteItem = async (itemId: string) => {
          if (!confirm('Are you sure you want to delete this item?')) return;

          try {
               setLoading(true);
               setError(null);

               const response = await customPost(`inventory/items/${itemId}`, 'DELETE', { branchid, employeeid });

               if (response.success) {
                    setInventoryItems(prev => prev.filter(item => item.id !== itemId));
                    toast.success('Item deleted successfully!');
               } else {
                    setError(response.error?.message || 'Failed to delete item');
                    toast.error(`Failed to delete item: ${response.error?.message}`);
               }
          } catch (err) {
               setError('Failed to delete item');
               console.error('Error deleting item:', err);
               toast.error('Failed to delete item');
          } finally {
               setLoading(false);
          }
     };

     const handleEditItem = (item: any) => {
          setItemForm({
               name: item.name || '',
               category: item.category || '',
               sku: item.sku || '',
               description: item.description || '',
               consumption_unit: item.consumption_unit || 'pieces',
               currentStock: item.currentStock || 0,
               minStock: item.minStock || 0,
               maxStock: item.maxStock || 0,
               location_id: item.location_id || '',
               expiryDate: item.expiryDate || '',
               batchNumber: item.batchNumber || ''
          });
          setEditingItem(item);
          setShowAddModal(true);
     };

     const handleAddBrand = async (item: InventoryItem) => {
          setSelectedItemForBrand(item);

          try {
               // Load existing brands for this item
               const response = await customFetch(`inventory/brands?inventory_item_id=${item.id}&branchid=${branchid}&employeeid=${employeeid}`);
               if (response.success) {
                    setExistingBrandsForItem(response.data || []);
               } else {
                    setExistingBrandsForItem([]);
               }
          } catch (err) {
               console.error('Error loading existing brands:', err);
               setExistingBrandsForItem([]);
          }

          setShowAddBrandModal(true);
     };

     const handleViewItem = async (item: InventoryItem) => {
          setSelectedItem(item);
          setAvailableStock(null);

          // Load available stock data
          try {
               setLoadingStock(true);
               const response = await customFetch(`inventory/transactions/available-stock/${item.id}?branchid=${branchid}&employeeid=${employeeid}`);

               if (response.success) {
                    setAvailableStock(response.data);
               } else {
                    console.error('Failed to load available stock:', response.error);
                    toast.error('Failed to load batch information');
               }
          } catch (error) {
               console.error('Error loading available stock:', error);
               toast.error('Failed to load batch information');
          } finally {
               setLoadingStock(false);
          }
     };

     const handleViewHistory = (item: InventoryItem) => {
          router.push(`/inventory/items/${item.id}/history`);
     };

     const handleAddSingleBrand = () => {
          if (!brandForm.currentName.trim()) {
               toast.error('Please enter a brand name');
               return;
          }

          const brandName = brandForm.currentName.trim();

          // Check if already in the added list
          if (brandForm.addedBrands.includes(brandName)) {
               toast.error('This brand is already in the list');
               return;
          }

          // Check if already exists in global brands
          const existingNames = brands.map(b => b.name.toLowerCase());
          if (existingNames.includes(brandName.toLowerCase())) {
               toast.error('This brand already exists');
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

     const handleDeleteBrand = async (brandId: string) => {
          if (!confirm('Are you sure you want to delete this brand?')) return;

          try {
               setLoading(true);
               const response = await customPost(`inventory/brands/${brandId}`, 'DELETE', { branchid, employeeid });

               if (response.success) {
                    // Remove from existing brands list
                    setExistingBrandsForItem(prev => prev.filter(brand => brand.id !== brandId));
                    toast.success('Brand deleted successfully!');
               } else {
                    toast.error(response.error?.message || 'Failed to delete brand');
               }
          } catch (err) {
               console.error('Error deleting brand:', err);
               toast.error('Failed to delete brand');
          } finally {
               setLoading(false);
          }
     };

     const handleSaveBrands = async () => {
          if (brandForm.addedBrands.length === 0) {
               toast.error('Please add at least one brand');
               return;
          }

          if (!selectedItemForBrand) {
               toast.error('No inventory item selected');
               return;
          }

          try {
               setLoading(true);

               // Save each brand with inventory_item_id
               const brandPromises = brandForm.addedBrands.map(brandName =>
                    customPost('inventory/brands', 'POST', {
                         name: brandName,
                         inventory_item_id: selectedItemForBrand.id,
                         branchid: branchid,
                         employeeid: employeeid
                    })
               );

               const results = await Promise.all(brandPromises);

               // Check if all brands were saved successfully
               const successCount = results.filter(result => result.success).length;

               if (successCount === brandForm.addedBrands.length) {
                    setBrands(prev => [...prev, ...brandForm.addedBrands.map((name, index) => ({
                         id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                         name: name,
                         createdDate: new Date().toISOString(),
                         itemCount: 1
                    }))]);
                    setShowAddBrandModal(false);
                    setBrandForm({ currentName: '', addedBrands: [] });
                    setSelectedItemForBrand(null);
                    setExistingBrandsForItem([]);
                    toast.success(`Successfully added ${successCount} brand(s)!`);
               } else {
                    toast.error(`Failed to save some brands. ${successCount} saved, ${brandForm.addedBrands.length - successCount} failed.`);
               }
          } catch (err) {
               console.error('Error saving brands:', err);
               toast.error('Failed to save brands');
          } finally {
               setLoading(false);
          }
     };

     const resetItemForm = () => {
          setItemForm({
               name: '',
               category: '',
               sku: '',
               description: '',
               consumption_unit: 'pieces',
               currentStock: 0,
               minStock: 0,
               maxStock: 0,
               location_id: '',
               expiryDate: '',
               batchNumber: ''
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
                         <button
                              className="btn btn-outline-primary btn-sm"
                              onClick={() => {
                                   setEditingItem(null);
                                   setShowAddModal(true);
                              }}
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
                    handleSeverSideProcessing={handleServerSideProcessing}
                    serverSideFiltering={true}
               />

               {/* Add Item Modal */}
               {showAddModal && (
                    <div className="modal show d-block" >
                         <div className="modal-dialog modal-xl">
                              <div className="modal-content">
                                   <div className="modal-header">
                                        <h5 className="modal-title">
                                             {editingItem ? `Edit Inventory Item: ${editingItem.name}` : 'Add Inventory Item'}
                                        </h5>
                                        <button
                                             type="button"
                                             className="btn-close"
                                             onClick={() => {
                                                  setShowAddModal(false);
                                                  setEditingItem(null);
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
                                                            {categories.map(category => (
                                                                 <option key={category.id} value={category.name}>{category.name}</option>
                                                            ))}
                                                       </select>
                                                  </div>
                                             </div>
                                             <div className="col-md-6">
                                                  <div className="mb-3">
                                                       <label className="form-label">Consumption Unit</label>
                                                       <select
                                                            className="form-select"
                                                            value={itemForm.consumption_unit}
                                                            onChange={(e) => setItemForm(prev => ({ ...prev, consumption_unit: e.target.value }))}
                                                       >
                                                            <option value="pieces">Pieces</option>
                                                            <option value="boxes">Boxes</option>
                                                            <option value="bottles">Bottles</option>
                                                            <option value="packs">Packs</option>
                                                            <option value="liters">Liters</option>
                                                            <option value="kg">Kilograms</option>
                                                            <option value="ml">Milliliters</option>
                                                            <option value="tubes">Tubes</option>
                                                       </select>
                                                  </div>
                                                  <div className="row">
                                                       {!editingItem && (
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
                                                       )}
                                                       {editingItem && (
                                                            <div className="col-4">
                                                                 <div className="mb-3">
                                                                      <label className="form-label">Current Stock</label>
                                                                      <div className="form-control bg-light">
                                                                           {itemForm.currentStock} {itemForm.consumption_unit}
                                                                      </div>
                                                                      <small className="text-muted">Stock quantity cannot be edited directly</small>
                                                                 </div>
                                                            </div>
                                                       )}
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
                                             </div>
                                        </div>
                                        <div className="row">
                                             <div className="col-md-6">
                                                  <div className="mb-3">
                                                       <label className="form-label">Storage Location</label>
                                                       <select
                                                            className="form-select"
                                                            value={itemForm.location_id}
                                                            onChange={(e) => setItemForm(prev => ({ ...prev, location_id: e.target.value }))}
                                                       >
                                                            <option value="">Select storage location</option>
                                                            {storageLocations.filter(loc => loc.is_active !== false).map(location => (
                                                                 <option key={location.id} value={location.id}>
                                                                      {location.name} {location.temperature_controlled ? '(Temp. Controlled)' : ''}
                                                                 </option>
                                                            ))}
                                                       </select>
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
                                             className="btn btn-outline-secondary btn-sm"
                                             onClick={() => {
                                                  setShowAddModal(false);
                                                  setEditingItem(null);
                                                  resetItemForm();
                                             }}
                                        >
                                             Cancel
                                        </button>
                                        <button
                                             type="button"
                                             className="btn btn-outline-primary btn-sm"
                                             onClick={editingItem ? handleUpdateItem : handleAddItem}
                                        >
                                             {editingItem ? 'Update Item' : 'Add Item'}
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
                                        <h5 className="modal-title">
                                             Add Brands for {selectedItemForBrand?.name}
                                        </h5>
                                        <button
                                             type="button"
                                             className="btn-close"
                                             onClick={() => {
                                                  setShowAddBrandModal(false);
                                                  setBrandForm({ currentName: '', addedBrands: [] });
                                                  setSelectedItemForBrand(null);
                                                  setExistingBrandsForItem([]);
                                             }}
                                        ></button>
                                   </div>
                                   <div className="modal-body">
                                        {/* Existing Brands Section */}
                                        {existingBrandsForItem.length > 0 && (
                                             <div className="mb-4">
                                                  <h6 className="text-primary mb-3">Existing Brands ({existingBrandsForItem.length})</h6>
                                                  <div className="row">
                                                       {existingBrandsForItem.map((brand, index) => (
                                                            <div key={brand.id || index} className="col-md-6 mb-2">
                                                                 <div className="card border-primary">
                                                                      <div className="card-body py-2 px-3">
                                                                           <div className="d-flex justify-content-between align-items-center">
                                                                                <span className="fw-medium">{brand.name}</span>
                                                                                <div className="d-flex gap-1">
                                                                                     <small className="text-muted me-2">
                                                                                          {brand.created_at ? new Date(brand.created_at).toLocaleDateString() : ''}
                                                                                     </small>
                                                                                     <button
                                                                                          className="btn btn-sm btn-outline-danger"
                                                                                          onClick={() => handleDeleteBrand(brand.id)}
                                                                                          title="Delete brand"
                                                                                          disabled={loading}
                                                                                     >
                                                                                          <RiDeleteBinLine size={12} />
                                                                                     </button>
                                                                                </div>
                                                                           </div>
                                                                      </div>
                                                                 </div>
                                                            </div>
                                                       ))}
                                                  </div>
                                                  <hr className="my-4" />
                                             </div>
                                        )}

                                        {/* Add New Brands Section */}
                                        <div className="mb-3">
                                             <label className="form-label">Add New Brand</label>
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
                                                       className="btn btn-outline-primary btn-sm"
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
                                             className="btn btn-outline-secondary btn-sm"
                                             onClick={() => {
                                                  setShowAddBrandModal(false);
                                                  setBrandForm({ currentName: '', addedBrands: [] });
                                                  setSelectedItemForBrand(null);
                                                  setExistingBrandsForItem([]);
                                             }}
                                        >
                                             Cancel
                                        </button>
                                        <button
                                             type="button"
                                             className="btn btn-outline-primary btn-sm"
                                             onClick={handleSaveBrands}
                                             disabled={brandForm.addedBrands.length === 0 || loading}
                                        >
                                             {loading ? 'Saving...' : `Save Brands (${brandForm.addedBrands.length})`}
                                        </button>
                                   </div>
                              </div>
                         </div>
                    </div>
               )}

               {/* Item Details Modal */}
               {selectedItem && (
                    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                         <div className="modal-dialog modal-xl">
                              <div className="modal-content">
                                   <div className="modal-header">
                                        <h5 className="modal-title">Item Details - {selectedItem.name}</h5>
                                        <button
                                             type="button"
                                             className="btn-close"
                                             onClick={() => {
                                                  setSelectedItem(null);
                                                  setAvailableStock(null);
                                             }}
                                        ></button>
                                   </div>
                                   <div className="modal-body">
                                        <div className="row mb-3">
                                             <div className="col-md-6">
                                                  <div className="card bg-light">
                                                       <div className="card-body">
                                                            <h6 className="card-title">Item Information</h6>
                                                            <p className="mb-1 small"><strong>SKU:</strong> {selectedItem.sku}</p>
                                                            <p className="mb-1 small"><strong>Brand:</strong> {selectedItem.brand || 'Not specified'}</p>
                                                            <p className="mb-1 small"><strong>Category:</strong> {selectedItem.category}</p>
                                                            <p className="mb-1 small"><strong>Location:</strong> {selectedItem.location_name || 'Not assigned'}</p>
                                                            <p className="mb-0 small"><strong>Status:</strong>
                                                                 <span>
                                                                      {STATUS_BADGES[selectedItem.status].label}
                                                                 </span>
                                                            </p>
                                                       </div>
                                                  </div>
                                             </div>
                                             <div className="col-md-6">
                                                  <div className="card bg-light">
                                                       <div className="card-body">
                                                            <h6 className="card-title">Stock Information</h6>
                                                            <p className="mb-1 small"><strong>Current Stock:</strong> {selectedItem.currentStock} {selectedItem.consumption_unit}</p>
                                                            <p className="mb-0 small"><strong>Stock Range:</strong> {selectedItem.minStock} - {selectedItem.maxStock} {selectedItem.consumption_unit}</p>
                                                       </div>
                                                  </div>
                                             </div>
                                        </div>
                                        {selectedItem.description && (
                                             <div className="card bg-light mb-3">
                                                  <div className="card-body">
                                                       <h6 className="card-title">Description</h6>
                                                       <p className="mb-0 small">{selectedItem.description}</p>
                                                  </div>
                                             </div>
                                        )}

                                        {/* Available Stock/Batches Section */}
                                        <div className="mt-4">
                                             <h6 className="text-primary mb-3">
                                                  <span className="fas fa-boxes me-2"></span>
                                                  Available Stock & Batches
                                             </h6>

                                             {loadingStock ? (
                                                  <div className="text-center py-4">
                                                       <div className="text-muted">
                                                            <div className="spinner-border spinner-border-sm mb-2" role="status">
                                                                 <span className="visually-hidden">Loading...</span>
                                                            </div>
                                                            <p className="mb-0 small">Loading batch information...</p>
                                                       </div>
                                                  </div>
                                             ) : availableStock ? (
                                                  <div>
                                                       {/* Item Summary */}
                                                       <div className="card mb-3">
                                                            <div className="card-body py-2">
                                                                 <div className="row text-center">
                                                                      <div className="col-6">
                                                                           <strong className="text-info">{availableStock.item?.current_stock || 0}</strong>
                                                                           <br />
                                                                           <small className="text-muted">Total Stock ({availableStock.item?.consumption_unit || 'units'})</small>
                                                                      </div>
                                                                      <div className="col-6">
                                                                           <strong className="text-success">{availableStock.available_batches?.length || 0}</strong>
                                                                           <br />
                                                                           <small className="text-muted">Active Batches</small>
                                                                      </div>
                                                                 </div>
                                                            </div>
                                                       </div>

                                                       {/* Batches Table */}
                                                       {availableStock.available_batches && availableStock.available_batches.length > 0 ? (
                                                            <div className="table-responsive">
                                                                 <table className="table table-sm">
                                                                      <thead>
                                                                           <tr>
                                                                                <th>Batch Details</th>
                                                                                <th>Available Qty</th>
                                                                                <th>Received</th>
                                                                                <th>Consumed</th>
                                                                                <th>Dates</th>
                                                                           </tr>
                                                                      </thead>
                                                                      <tbody>
                                                                           {availableStock.available_batches.map((batch: any, index: number) => (
                                                                                <tr key={index}>
                                                                                     <td className="text-start">
                                                                                          <div className="small">
                                                                                               <div className="fw-bold">{batch.batch_number}</div>
                                                                                               <div className="text-muted">Brand: {batch.brand_name || 'N/A'}</div>
                                                                                          </div>
                                                                                     </td>
                                                                                     <td className="text-start">
                                                                                          <div className="small">
                                                                                               <div className="fw-bold text-success">{batch.available_quantity}</div>
                                                                                               <div className="text-muted">{availableStock.item?.consumption_unit || 'units'}</div>
                                                                                          </div>
                                                                                     </td>
                                                                                     <td className="text-start">
                                                                                          <div className="small fw-bold">{batch.total_received}</div>
                                                                                     </td>
                                                                                     <td className="text-start">
                                                                                          <div className="small fw-bold">{batch.total_consumed}</div>
                                                                                     </td>
                                                                                     <td className="text-start">
                                                                                          <div className="small">
                                                                                               <div className="fw-bold">
                                                                                                    {batch.expiry_date ? new Date(batch.expiry_date).toLocaleDateString() : 'N/A'}
                                                                                               </div>
                                                                                               <div className="text-muted">
                                                                                                    Last Received: {batch.last_received ? new Date(batch.last_received).toLocaleDateString() : 'N/A'}
                                                                                               </div>
                                                                                          </div>
                                                                                     </td>
                                                                                </tr>
                                                                           ))}
                                                                      </tbody>
                                                                 </table>
                                                            </div>
                                                       ) : (
                                                            <div className="text-center py-4">
                                                                 <div className="text-muted">
                                                                      <RiInboxLine className="fs-1 mb-2" />
                                                                      <p className="mb-0 small">No batch information available</p>
                                                                 </div>
                                                            </div>
                                                       )}
                                                  </div>
                                             ) : (
                                                  <div className="text-center py-4">
                                                       <div className="text-muted">
                                                            <RiInboxLine className="fs-1 mb-2" />
                                                            <p className="mb-0 small">Failed to load batch information</p>
                                                       </div>
                                                  </div>
                                             )}
                                        </div>
                                   </div>
                                   <div className="modal-footer">
                                        <button
                                             type="button"
                                             className="btn btn-outline-secondary btn-sm"
                                             onClick={() => {
                                                  setSelectedItem(null);
                                                  setAvailableStock(null);
                                             }}
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