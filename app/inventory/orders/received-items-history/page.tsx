'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { RiDownloadLine, RiArrowLeftLine, RiArrowUpLine, RiArrowDownLine, RiInboxLine, RiEyeLine } from '@remixicon/react';
import { customFetch, currencyFormatter } from '../../../../components/Auth/customFetch';
import PrimeTable from '../../../../components/accessories/Datatables/PrimeTable';

interface OrderData {
     id: string;
     order_number: string;
     supplier_id: string;
     order_date: string;
     expected_delivery_date: string;
     status: string;
     total_amount: number;
     communication_method: string | null;
     communication_notes: string | null;
     notes: string;
     created_by: string | null;
     created_at: string;
     updated_at: string;
     supplier_name: string;
     items_count: number;
     received_items_count: number;
     items?: any[];
}

interface ReceivedItemHistoryFilters {
     startDate: string;
     endDate: string;
     itemName: string;
     supplierName: string;
     orderNumber: string;
}

const STATUS_BADGES = {
     '': { label: 'Ordered', color: 'secondary' },
     ordered: { label: 'Ordered', color: 'secondary' },
     partially_received: { label: 'Partially Received', color: 'warning' },
     received: { label: 'Received', color: 'success' },
     cancelled: { label: 'Cancelled', color: 'danger' }
};

export default function ReceivedItemsHistoryPage() {
     const router = useRouter();
     const [orders, setOrders] = useState<OrderData[]>([]);
     const [filteredOrders, setFilteredOrders] = useState<OrderData[]>([]);
     const [loading, setLoading] = useState(true);
     const [filters, setFilters] = useState<ReceivedItemHistoryFilters>({
          startDate: '',
          endDate: '',
          itemName: '',
          supplierName: '',
          orderNumber: ''
     });
     // Modal states for viewing order items
     const [selectedOrder, setSelectedOrder] = useState<OrderData | null>(null);
     const [orderItems, setOrderItems] = useState<any[]>([]);
     const [showItemsModal, setShowItemsModal] = useState(false);
     const [loadingItems, setLoadingItems] = useState(false);

     // Load orders data from API
     useEffect(() => {
          const loadOrders = async () => {
               try {
                    setLoading(true);
                    const response = await customFetch('inventory/orders?status=received');

                    if (response.success) {
                         // Load detailed data for each order to enable item name filtering
                         const ordersWithDetails = await Promise.all(
                              response.data.map(async (order: any) => {
                                   try {
                                        const detailResponse = await customFetch(`inventory/orders/${order.id}`);
                                        const items = detailResponse.success ? detailResponse.data.items || [] : [];
                                        return {
                                             ...order,
                                             items: items
                                        };
                                   } catch (error) {
                                        console.warn(`Failed to load details for order ${order.id}:`, error);
                                        return {
                                             ...order,
                                             items: []
                                        };
                                   }
                              })
                         );

                         setOrders(ordersWithDetails);
                         setFilteredOrders(ordersWithDetails);
                    } else {
                         toast.error('Failed to load orders data');
                         setOrders([]);
                         setFilteredOrders([]);
                    }
               } catch (error) {
                    console.error('Error loading orders:', error);
                    toast.error('Failed to load orders data');
                    setOrders([]);
                    setFilteredOrders([]);
               } finally {
                    setLoading(false);
               }
          };

          loadOrders();
     }, []);

     // Filter and search functionality
     useEffect(() => {
          let filtered = orders.filter(order => {
               const matchesDateRange = (!filters.startDate || order.order_date >= filters.startDate) &&
                    (!filters.endDate || order.order_date <= filters.endDate);
               const matchesSupplier = !filters.supplierName ||
                    order.supplier_name.toLowerCase().includes(filters.supplierName.toLowerCase());
               const matchesOrderNumber = !filters.orderNumber ||
                    order.order_number.toLowerCase().includes(filters.orderNumber.toLowerCase());
               const matchesItemName = !filters.itemName ||
                    (order.items && order.items.some((item: any) =>
                         item.item_name && item.item_name.toLowerCase().includes(filters.itemName.toLowerCase())
                    ));

               return matchesDateRange && matchesSupplier && matchesOrderNumber && matchesItemName;
          });

          setFilteredOrders(filtered);
     }, [filters, orders]);

     const handleViewOrderItems = async (order: OrderData) => {
          try {
               setLoadingItems(true);
               setSelectedOrder(order);

               // Fetch detailed order data including items
               const response = await customFetch(`inventory/orders/${order.id}`);

               if (response.success) {
                    const orderData = response.data;
                    setOrderItems(orderData.items || []);
                    setShowItemsModal(true);
               } else {
                    toast.error('Failed to load order items');
               }
          } catch (error) {
               console.error('Error loading order items:', error);
               toast.error('Failed to load order items');
          } finally {
               setLoadingItems(false);
          }
     };

     const orderColumns = [
          {
               Header: 'Order Date',
               accessor: 'order_date',
               Cell: ({ value }) => (
                    <div className="small">
                         <div className="fw-bold">{new Date(value).toLocaleDateString()}</div>
                         <div className="text-muted">{new Date(value).toLocaleTimeString()}</div>
                    </div>
               )
          },
          {
               Header: 'Order Number',
               accessor: 'order_number',
               Cell: ({ value, row }) => (
                    <div className="small">
                         <div className="fw-bold">{value}</div>
                         <div className="text-muted">ID: {row.original.id}</div>
                    </div>
               )
          },
          {
               Header: 'Supplier',
               accessor: 'supplier_name',
               Cell: ({ value, row }) => (
                    <div>
                         <div className="fw-bold">{value}</div>
                         <div className="small text-muted">
                              ID: {row.original.supplier_id}
                         </div>
                    </div>
               )
          },
          {
               Header: 'Items',
               accessor: 'items_count',
               Cell: ({ value }) => (
                    <span className="badge bg-primary">{value || 0}</span>
               )
          },
          {
               Header: 'Received',
               accessor: 'received_items_count',
               Cell: ({ value }) => (
                    <span className={`badge ${value > 0 ? 'bg-success' : 'bg-warning'}`}>
                         {value || 0}
                    </span>
               )
          },
          {
               Header: 'Status',
               accessor: 'status',
               Cell: ({ value }) => {
                    const badge = STATUS_BADGES[value as keyof typeof STATUS_BADGES] || STATUS_BADGES[''];
                    return (
                         <span className={`badge bg-${badge.color}`}>
                              {badge.label}
                         </span>
                    );
               }
          },
          {
               Header: 'Total Amount',
               accessor: 'total_amount',
               Cell: ({ value }) => (
                    <span className="fw-bold">
                         {currencyFormatter.format(value || 0)}
                    </span>
               )
          },
          {
               Header: 'Expected Delivery',
               accessor: 'expected_delivery_date',
               Cell: ({ value }) => (
                    <span className={`badge ${new Date(value) < new Date() ? 'bg-danger' : 'bg-info'}`}>
                         {value ? new Date(value).toLocaleDateString() : 'Not set'}
                    </span>
               )
          },
          {
               Header: 'Actions',
               accessor: 'id',
               Cell: ({ row }) => (
                    <button
                         className="btn btn-sm btn-outline-info"
                         onClick={() => handleViewOrderItems(row.original)}
                         disabled={loadingItems && selectedOrder?.id === row.original.id}
                    >
                         {loadingItems && selectedOrder?.id === row.original.id ? (
                              <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                         ) : (
                              <RiEyeLine size={14} className="me-1" />
                         )}
                         View Items
                    </button>
               )
          }
     ];

     const clearFilters = () => {
          setFilters({
               startDate: '',
               endDate: '',
               itemName: '',
               supplierName: '',
               orderNumber: ''
          });
     };

     const exportToCSV = () => {
          const headers = [
               'Order Number', 'Supplier Name', 'Order Date', 'Expected Delivery',
               'Status', 'Total Amount', 'Items Count', 'Received Items Count', 'Notes'
          ];

          const csvData = filteredOrders.map(order => [
               order.order_number,
               order.supplier_name,
               new Date(order.order_date).toLocaleDateString(),
               order.expected_delivery_date ? new Date(order.expected_delivery_date).toLocaleDateString() : 'Not set',
               order.status,
               order.total_amount,
               order.items_count,
               order.received_items_count,
               order.notes || ''
          ]);

          const csvContent = [headers, ...csvData]
               .map(row => row.map(field => `"${field}"`).join(','))
               .join('\n');

          const blob = new Blob([csvContent], { type: 'text/csv' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `orders-history-${new Date().toISOString().split('T')[0]}.csv`;
          a.click();
          window.URL.revokeObjectURL(url);
     };



     const handleServerSideProcessing = async (pagination) => {
          try {

               const { start_date, end_date, supplier_name, order_number, item_name, page, count, sortby = "DESC" } = pagination
               const params = new URLSearchParams({
                    page: page.toString(),
                    count: count.toString(),
                    sortby: sortby,
                    status: 'received',
                    start_date: start_date || '',
                    end_date: end_date || '',
                    supplier_name: supplier_name || '',
                    order_number: order_number || '',
                    item_name: item_name || ''
               });


               const endpoint = `inventory/orders?${params.toString()}`;
               const response = await customFetch(endpoint);

               if (response.success) {
                    const transformedOrders = response.data.map((order: any) => ({
                         id: order.id,
                         order_number: order.id,
                         supplier_id: order.supplier_id,
                         order_date: order.order_date,
                         expected_delivery_date: order.expected_delivery_date,
                         status: order.status,
                         total_amount: order.total_amount || 0,
                         communication_method: order.communication_method || null,
                         communication_notes: order.communication_notes || null,
                         notes: order.notes || '',
                         created_by: order.created_by || null,
                         created_at: order.created_at,
                         updated_at: order.updated_at,
                         supplier_name: order.supplier_name || '',
                         items_count: order.items_count || 0,
                         received_items_count: order.received_items_count || 0,
                         items: order.items || []
                    }));
                    return { result: transformedOrders, error: false };
               } else {
                    return { result: [], error: false };
               }
          } catch (error) {
               console.error('Error in server-side processing:', error);
               return { result: [], error: true };
          }
     };

     if (loading) {
          return (
               <div className="container-fluid py-4">
                    <div className="d-flex justify-content-center align-items-center" style={{ height: '200px' }}>
                         <div className="spinner-border text-primary" role="status">
                              <span className="visually-hidden">Loading...</span>
                         </div>
                    </div>
               </div>
          );
     }

     return (
          <div className="container-fluid py-4">
               <div className="row mb-4">
                    <div className="col-12">
                         <div className="d-flex justify-content-between align-items-center">
                              <div>
                                   <h2 className="mb-1">Orders History</h2>
                                   <p className="text-muted mb-0">View and track all purchase orders</p>
                              </div>
                              <div className="d-flex gap-2">
                                   <button
                                        className="btn btn-outline-primary btn-sm"
                                        onClick={exportToCSV}
                                        disabled={filteredOrders.length === 0}
                                   >
                                        <RiDownloadLine className="me-1" />
                                        Export CSV
                                   </button>
                                   <button
                                        className="btn btn-outline-secondary btn-sm"
                                        onClick={() => router.back()}
                                   >
                                        <RiArrowLeftLine className="me-1" />
                                        Back
                                   </button>
                              </div>
                         </div>
                    </div>
               </div>

               {/* Filters */}
               <div className="mb-4 border rounded p-3">
                    <h5 className="mb-3">Filters</h5>
                    <div className="row g-3">
                         <div className="col-md-2">
                              <label className="form-label">Start Date</label>
                              <input
                                   type="date"
                                   className="form-control"
                                   value={filters.startDate}
                                   onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                              />
                         </div>
                         <div className="col-md-2">
                              <label className="form-label">End Date</label>
                              <input
                                   type="date"
                                   className="form-control"
                                   value={filters.endDate}
                                   onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                              />
                         </div>
                         <div className="col-md-2">
                              <label className="form-label">Item Name</label>
                              <input
                                   type="text"
                                   className="form-control"
                                   placeholder="Search item names..."
                                   value={filters.itemName}
                                   onChange={(e) => setFilters(prev => ({ ...prev, itemName: e.target.value }))}
                              />
                         </div>
                         <div className="col-md-2">
                              <label className="form-label">Supplier</label>
                              <input
                                   type="text"
                                   className="form-control"
                                   placeholder="Search suppliers..."
                                   value={filters.supplierName}
                                   onChange={(e) => setFilters(prev => ({ ...prev, supplierName: e.target.value }))}
                              />
                         </div>
                         <div className="col-md-2">
                              <label className="form-label">Order Number</label>
                              <input
                                   type="text"
                                   className="form-control"
                                   placeholder="Search orders..."
                                   value={filters.orderNumber}
                                   onChange={(e) => setFilters(prev => ({ ...prev, orderNumber: e.target.value }))}
                              />
                         </div>
                    </div>
                    <div className="row mt-3">
                         <div className="col-12">
                              <button
                                   className="btn btn-outline-secondary btn-sm me-2"
                                   onClick={clearFilters}
                              >
                                   Clear Filters
                              </button>
                              <span className="text-muted">
                                   Showing {filteredOrders.length} of {orders.length} orders
                              </span>
                         </div>
                    </div>
               </div>

               {/* Results Table */}
               <div className="mb-4">
                    <h5 className="mb-3">Orders ({filteredOrders.length})</h5>
                    <PrimeTable
                         column={orderColumns}
                         data={filteredOrders}
                         urlparams={filters}
                         filtering={true}
                         handleSeverSideProcessing={handleServerSideProcessing}
                         serverSideFiltering={true}
                    />
               </div>

               {/* Order Items Modal */}
               {showItemsModal && selectedOrder && (
                    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                         <div className="modal-dialog modal-xl">
                              <div className="modal-content">
                                   <div className="modal-header">
                                        <h5 className="modal-title">
                                             Items Ordered - {selectedOrder.order_number}
                                        </h5>
                                        <button
                                             type="button"
                                             className="btn-close"
                                             onClick={() => {
                                                  setShowItemsModal(false);
                                                  setSelectedOrder(null);
                                                  setOrderItems([]);
                                             }}
                                        ></button>
                                   </div>
                                   <div className="modal-body">
                                        {loadingItems ? (
                                             <div className="d-flex justify-content-center align-items-center py-4">
                                                  <div className="spinner-border text-primary" role="status">
                                                       <span className="visually-hidden">Loading items...</span>
                                                  </div>
                                             </div>
                                        ) : orderItems.length === 0 ? (
                                             <div className="text-center py-4">
                                                  <div className="text-muted">
                                                       <RiInboxLine className="fs-1 mb-2" />
                                                       <p>No items found for this order.</p>
                                                  </div>
                                             </div>
                                        ) : (
                                             <div className="table-responsive">
                                                  <table className="table table-sm">
                                                       <thead>
                                                            <tr>
                                                                 <th>Item Name</th>
                                                                 <th>Brand</th>
                                                                 <th>SKU</th>
                                                                 <th>Quantity Ordered</th>
                                                                 <th>Quantity Received</th>
                                                                 <th>Unit Price</th>
                                                                 <th>Line Total</th>
                                                                 <th>Status</th>
                                                            </tr>
                                                       </thead>
                                                       <tbody>
                                                            {orderItems.map((item: any, index: number) => (
                                                                 <tr key={index}>
                                                                      <td>{item.item_name || 'N/A'}</td>
                                                                      <td>{item.brand_name || 'N/A'}</td>
                                                                      <td>{item.sku || 'N/A'}</td>
                                                                      <td className="text-center">{item.quantity_ordered || 0}</td>
                                                                      <td className="text-center">{item.quantity_received || 0}</td>
                                                                      <td className="text-end">{currencyFormatter.format(item.unit_price || 0)}</td>
                                                                      <td className="text-end fw-bold">{currencyFormatter.format(item.line_total || 0)}</td>
                                                                      <td>
                                                                           <span className={`badge ${item.status === 'received' ? 'bg-success' : item.status === 'partially_received' ? 'bg-warning' : 'bg-secondary'}`}>
                                                                                {item.status || 'ordered'}
                                                                           </span>
                                                                      </td>
                                                                 </tr>
                                                            ))}
                                                       </tbody>
                                                  </table>
                                             </div>
                                        )}
                                   </div>
                                   <div className="modal-footer">
                                        <button
                                             type="button"
                                             className="btn btn-secondary btn-sm"
                                             onClick={() => {
                                                  setShowItemsModal(false);
                                                  setSelectedOrder(null);
                                                  setOrderItems([]);
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