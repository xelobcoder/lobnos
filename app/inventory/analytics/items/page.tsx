'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { RiStoreLine, RiAlertLine, RiBox3Line, RiRefreshLine, RiBarChartBoxLine, RiMoneyDollarCircleLine } from '@remixicon/react';
import { currencyFormatter, customFetch } from '../../../../components/Auth/customFetch';
import { useApplicationSettings } from '../../../../components/Auth/useApplicationContext';

const COLOR_ACCENT = 'oklch(0.646 0.222 41.116)';
const COLOR_BORDER = 'var(--bs-border-color)';

const STATUS_COLORS = {
     in_stock: "#16a34a",
     low_stock: "#f59e0b",
     out_of_stock: "#ef4444",
     expired: "#6b7280"
};

const STATUS_ICONS = {
     in_stock: <RiStoreLine size={20} />,
     low_stock: <RiAlertLine size={20} />,
     out_of_stock: <RiBox3Line size={20} />,
     expired: <RiAlertLine size={20} />
};

interface InventoryItem {
     id: string;
     name: string;
     category: string;
     brand?: string;
     supplier?: string;
     sku: string;
     description: string;
     consumption_unit: string;
     currentStock: number;
     minStock: number;
     maxStock: number;
     unitPrice: number;
     totalValue: number;
     location: string;
     expiryDate?: string;
     lastUpdated: string;
     status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'expired';
     category_name?: string;
     brand_name?: string;
     supplier_name?: string;
     location_name?: string;
     consumption_unit_name?: string;
}

interface ItemAnalyticsModule {
     title: string;
     description: string;
     path: string;
     icon: React.ReactNode;
     color: string;
     category: string;
     itemId: string;
     stockLevel: number;
     unit: string;
     value: number;
}

export default function ItemAnalyticsOverview() {
     const { branchid, user } = useApplicationSettings().applicationsettings || {};
     const employeeid = user?.employeeid;
     const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
     const [loading, setLoading] = useState(true);
     const [error, setError] = useState<string | null>(null);

     useEffect(() => {
          if (branchid && employeeid) {
               loadInventoryItems();
          }
     }, [branchid, employeeid]);

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
                    setError('Failed to load inventory items');
                    toast.error('Failed to load inventory items');
               }
          } catch (error) {
               console.error('Error loading inventory items:', error);
               setError('Error loading inventory items');
               toast.error('Error loading inventory items');
          } finally {
               setLoading(false);
          }
     };

     const getItemAnalyticsPath = (itemId: string) => {
          return `/inventory/analytics/inventoryitems/${itemId}`;
     };

     const getStatusColor = (status: string) => {
          switch (status) {
               case 'in_stock': return "#16a34a";
               case 'low_stock': return "#f59e0b";
               case 'out_of_stock': return "#ef4444";
               case 'expired': return "#6b7280";
               default: return "#6b7280";
          }
     };

     const getStatusIcon = (status: string) => {
          switch (status) {
               case 'in_stock': return <RiStoreLine size={32} />;
               case 'low_stock': return <RiAlertLine size={32} />;
               case 'out_of_stock': return <RiBox3Line size={32} />;
               case 'expired': return <RiAlertLine size={32} />;
               default: return <RiBox3Line size={32} />;
          }
     };

     const itemAnalyticsModules: ItemAnalyticsModule[] = inventoryItems.map((item) => ({
          title: item.name,
          description: `${item.description} • SKU: ${item.sku}`,
          path: `/inventory/analytics/inventoryitems/${item.id}`,
          icon: getStatusIcon(item.status),
          color: getStatusColor(item.status),
          category: item.category || 'Uncategorized',
          itemId: item.id,
          stockLevel: item.currentStock,
          unit: item.consumption_unit_name || item.consumption_unit,
          value: item.totalValue || 0
     }));

     if (loading) {
          return (
               <div className="container-fluid p-4">
                    <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
                         <div className="text-center">
                              <div className="spinner-border text-primary mb-3" role="status">
                                   <span className="visually-hidden">Loading...</span>
                              </div>
                              <h6 className="text-muted mb-2">LOADING ITEM ANALYTICS...</h6>
                              <p className="text-muted small mb-0">FETCHING INVENTORY ITEMS FOR ANALYSIS</p>
                         </div>
                    </div>
               </div>
          );
     }

     if (error) {
          return (
               <div className="container-fluid p-4">
                    <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
                         <div className="text-center">
                              <RiAlertLine size={48} className="text-danger mb-3" />
                              <h6 className="text-danger mb-2">ERROR LOADING ITEMS</h6>
                              <p className="text-muted small mb-0">{error}</p>
                              <button
                                   className="btn btn-outline-primary btn-sm mt-3"
                                   onClick={loadInventoryItems}
                              >
                                   <RiRefreshLine className="me-1" />
                                   Retry
                              </button>
                         </div>
                    </div>
               </div>
          );
     }

     return (
          <div className="container-fluid p-4">
               {/* Header */}
               <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                         <h2 className="mb-1">
                              <RiBarChartBoxLine className="me-2" />
                              Item Analytics
                         </h2>
                         <p className="text-muted mb-0">Detailed analytics for individual inventory items</p>
                    </div>
                    <div className="d-flex gap-2">
                         <button
                              className="btn btn-outline-secondary btn-sm"
                              onClick={loadInventoryItems}
                              disabled={loading}
                         >
                              <RiRefreshLine className="me-1" />
                              Refresh Data
                         </button>
                    </div>
               </div>

               {/* Summary Statistics */}
               <div className="row g-3 mb-4">
                    <div className="col-md-3">
                         <div className="border rounded p-3 h-100" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                              <div className="d-flex align-items-center mb-2">
                                   <RiBox3Line size={20} className="me-2 text-primary" />
                                   <span className="fw-medium text-muted small">Total Items</span>
                              </div>
                              <div className="fs-4 fw-bold text-primary">{inventoryItems.length.toLocaleString()}</div>
                              <div className="small text-muted">Items available for analysis</div>
                         </div>
                    </div>
                    <div className="col-md-3">
                         <div className="border rounded p-3 h-100" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                              <div className="d-flex align-items-center mb-2">
                                   <RiStoreLine size={20} className="me-2 text-success" />
                                   <span className="fw-medium text-muted small">In Stock</span>
                              </div>
                              <div className="fs-4 fw-bold text-success">
                                   {inventoryItems.filter(item => item.status === 'in_stock').length}
                              </div>
                              <div className="small text-muted">Items currently available</div>
                         </div>
                    </div>
                    <div className="col-md-3">
                         <div className="border rounded p-3 h-100" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                              <div className="d-flex align-items-center mb-2">
                                   <RiAlertLine size={20} className="me-2 text-warning" />
                                   <span className="fw-medium text-muted small">Low Stock</span>
                              </div>
                              <div className="fs-4 fw-bold text-warning">
                                   {inventoryItems.filter(item => item.status === 'low_stock').length}
                              </div>
                              <div className="small text-muted">Items needing attention</div>
                         </div>
                    </div>
                    <div className="col-md-3">
                         <div className="border rounded p-3 h-100" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                              <div className="d-flex align-items-center mb-2">
                                   <RiMoneyDollarCircleLine size={20} className="me-2 text-info" />
                                   <span className="fw-medium text-muted small">Total Value</span>
                              </div>
                              <div className="fs-4 fw-bold text-info">
                                   {currencyFormatter.format(inventoryItems.reduce((sum, item) => sum + (item.totalValue || 0), 0))}
                              </div>
                              <div className="small text-muted">Combined inventory value</div>
                         </div>
                    </div>
               </div>

               {/* Item Analytics Cards */}
               <div className="mb-4">
                    <h5 className="mb-3 fw-semibold">Select Item for Analytics</h5>
                    <div className="row g-3">
                         {inventoryItems.map((item) => (
                              <div key={item.id} className="col-md-6 col-lg-4">
                                   <div className="border rounded p-3 h-100" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                                        <div className="d-flex align-items-start mb-3">
                                             <div className="me-3">
                                                  <div className="rounded-circle d-flex align-items-center justify-content-center"
                                                       style={{
                                                            width: '48px',
                                                            height: '48px',
                                                            backgroundColor: STATUS_COLORS[item.status],
                                                            color: 'white'
                                                       }}>
                                                       {STATUS_ICONS[item.status]}
                                                  </div>
                                             </div>
                                             <div className="flex-grow-1">
                                                  <h6 className="fw-bold mb-1">{item.name}</h6>
                                                  <p className="small text-muted mb-1">SKU: {item.sku}</p>
                                                  <p className="small text-muted mb-2">{item.description}</p>
                                             </div>
                                        </div>

                                        <div className="row g-2 mb-3">
                                             <div className="col-6">
                                                  <div className="small text-muted">Stock</div>
                                                  <div className="fw-medium">{item.currentStock} {item.consumption_unit_name || item.consumption_unit}</div>
                                             </div>
                                             <div className="col-6">
                                                  <div className="small text-muted">Value</div>
                                                  <div className="fw-medium">{currencyFormatter.format(item.totalValue || 0)}</div>
                                             </div>
                                             <div className="col-6">
                                                  <div className="small text-muted">Category</div>
                                                  <div className="fw-medium">{item.category}</div>
                                             </div>
                                             <div className="col-6">
                                                  <div className="small text-muted">Location</div>
                                                  <div className="fw-medium">{item.location}</div>
                                             </div>
                                        </div>

                                        <div className="mb-3">
                                             <div className="small text-muted mb-1">
                                                  • {item.brand || 'No brand specified'}
                                             </div>
                                             <div className="small text-muted mb-1">
                                                  • {item.supplier || 'No supplier specified'}
                                             </div>
                                             <div className="small text-muted">
                                                  • Last updated: {new Date(item.lastUpdated).toLocaleDateString()}
                                             </div>
                                        </div>

                                        <Link
                                             href={getItemAnalyticsPath(item.id)}
                                             className="btn btn-sm w-100"
                                             style={{
                                                  backgroundColor: STATUS_COLORS[item.status],
                                                  borderColor: STATUS_COLORS[item.status]
                                             }}
                                        >
                                             <RiBarChartBoxLine className="me-1" size={16} />
                                             View Analytics
                                        </Link>
                                   </div>
                              </div>
                         ))}
                    </div>
               </div>

               {inventoryItems.length === 0 && (
                    <div className="text-center py-5">
                         <RiBox3Line size={48} className="text-muted mb-3" />
                         <h6 className="text-muted mb-2">No Inventory Items Found</h6>
                         <p className="text-muted small mb-0">Add inventory items to access detailed analytics</p>
                    </div>
               )}
          </div>
     );
}