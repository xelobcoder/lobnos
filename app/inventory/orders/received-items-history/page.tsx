'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { RiDownloadLine, RiArrowLeftLine, RiEyeLine, RiInboxLine, RiFilterLine } from '@remixicon/react';
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
     total_cost?: number;
     total_received_quantity?: number;
     total_transaction_cost?: number;
}

interface ReceivedItemHistoryFilters {
     startDate: string;
     endDate: string;
     itemName: string;
     supplierId: string;
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
          supplierId: '',
          orderNumber: ''
     });

     const [selectedOrder, setSelectedOrder] = useState<OrderData | null>(null);
     const [receipts, setReceipts] = useState<any[]>([]);
     const [showReceiptsModal, setShowReceiptsModal] = useState(false);
     const [loadingReceipts, setLoadingReceipts] = useState(false);
     const [showFiltersOffcanvas, setShowFiltersOffcanvas] = useState(false);

     const loadOrders = async (filterParams?: Partial<ReceivedItemHistoryFilters>) => {
          try {
               setLoading(true);
               let endpoint = 'inventory/orders/received/report?page=1&count=10&sortby=DESC';
               if (filterParams) {
                    const params = new URLSearchParams();
                    if (filterParams.startDate) params.append('startDate', filterParams.startDate);
                    if (filterParams.endDate) params.append('endDate', filterParams.endDate);
                    if (filterParams.supplierId) params.append('supplier_id', filterParams.supplierId);
                    if (filterParams.orderNumber) params.append('order_number', filterParams.orderNumber);
                    if (filterParams.itemName) params.append('item_name', filterParams.itemName);

                    if (params.toString()) {
                         endpoint += `&${params.toString()}`;
                    }
               }

               const response = await customFetch(endpoint);

               if (response.success) {
                    const ordersData = response.data.map((order: any) => ({
                         id: order.id,
                         order_number: order.order_number,
                         supplier_id: order.supplier?.id || '',
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
                         supplier_name: order.supplier?.name || '',
                         items_count: order.items?.length || 0,
                         received_items_count: order.total_received_quantity || 0,
                         items: order.items || [],
                         total_cost: order.total_cost || 0,
                         total_received_quantity: order.total_received_quantity || 0,
                         total_transaction_cost: order.total_transaction_cost || 0
                    }));

                    setOrders(ordersData);
                    setFilteredOrders(ordersData);
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

     // Load orders data from API
     useEffect(() => {
          loadOrders();
     }, []);

     const handleViewReceipts = (order: OrderData) => {
          setLoadingReceipts(true);
          setSelectedOrder(order);

          // Extract all receipts from all items in the order
          const allReceipts: any[] = [];
          order.items?.forEach((item: any) => {
               if (item.receipts && item.receipts.length > 0) {
                    item.receipts.forEach((receipt: any) => {
                         allReceipts.push({
                              ...receipt,
                              item_name: item.inventory_item?.name || 'N/A',
                              item_sku: item.inventory_item?.sku || 'N/A',
                              item_unit: item.inventory_item?.unit || 'N/A',
                              quantity_ordered: item.quantity_ordered || 0
                         });
                    });
               }
          });

          setReceipts(allReceipts);
          setShowReceiptsModal(true);
          setLoadingReceipts(false);
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
               accessor: 'total_transaction_cost',
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
                         onClick={() => handleViewReceipts(row.original)}
                         disabled={loadingReceipts && selectedOrder?.id === row.original.id}
                    >
                         {loadingReceipts && selectedOrder?.id === row.original.id ? (
                              <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                         ) : (
                              <RiEyeLine size={14} className="me-1" />
                         )}
                         View Receipts
                    </button>
               )
          }
     ];

     const clearFilters = () => {
          setFilters({
               startDate: '',
               endDate: '',
               itemName: '',
               supplierId: '',
               orderNumber: ''
          });
          // Reload data without filters
          loadOrders();
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
               order.total_transaction_cost || 0,
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


               const endpoint = `inventory/orders/received/report?${params.toString()}`;
               const response = await customFetch(endpoint);

               if (response.success) {
                    const transformedOrders = response.data.map((order: any) => ({
                         id: order.id,
                         order_number: order.order_number,
                         supplier_id: order.supplier?.id || '',
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
                         supplier_name: order.supplier?.name || '',
                         items_count: order.items?.length || 0,
                         received_items_count: order.total_received_quantity || 0,
                         items: order.items || [],
                         total_cost: order.total_cost || 0,
                         total_received_quantity: order.total_received_quantity || 0,
                         total_transaction_cost: order.total_transaction_cost || 0
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
                                   <h4 className="mb-1">Orders History</h4>
                                   <p className="text-muted mb-0 small">View and track all purchase orders</p>
                              </div>
                              <div className="d-flex gap-2">
                                   <button
                                        className="btn btn-outline-info btn-sm"
                                        onClick={() => setShowFiltersOffcanvas(true)}
                                   >
                                        <RiFilterLine className="me-1" />
                                        Filters
                                   </button>
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

               {/* Filters Off-canvas */}
               <div
                    className={`offcanvas offcanvas-end ${showFiltersOffcanvas ? 'show' : ''}`}
                    style={{ visibility: showFiltersOffcanvas ? 'visible' : 'hidden' }}
                    tabIndex={-1}
                    id="filtersOffcanvas"
               >
                    <div className="offcanvas-header">
                         <h5 className="offcanvas-title">Filters</h5>
                         <button
                              type="button"
                              className="btn-close"
                              onClick={() => setShowFiltersOffcanvas(false)}
                         ></button>
                    </div>
                    <div className="offcanvas-body">
                         <div className="row g-3">
                              <div className="col-12">
                                   <label className="form-label">Start Date</label>
                                   <input
                                        type="date"
                                        className="form-control"
                                        value={filters.startDate}
                                        onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                                   />
                              </div>
                              <div className="col-12">
                                   <label className="form-label">End Date</label>
                                   <input
                                        type="date"
                                        className="form-control"
                                        value={filters.endDate}
                                        onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                                   />
                              </div>
                              <div className="col-12">
                                   <label className="form-label">Item Name</label>
                                   <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Search item names..."
                                        value={filters.itemName}
                                        onChange={(e) => setFilters(prev => ({ ...prev, itemName: e.target.value }))}
                                   />
                              </div>
                              <div className="col-12">
                                   <label className="form-label">Supplier ID</label>
                                   <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Enter supplier ID (e.g., SUP-001)..."
                                        value={filters.supplierId}
                                        onChange={(e) => setFilters(prev => ({ ...prev, supplierId: e.target.value }))}
                                   />
                              </div>
                              <div className="col-12">
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
                         <div className="mt-3">
                              <button
                                   className="btn btn-primary btn-sm me-2"
                                   onClick={() => {
                                        // Trigger server-side filtering by reloading data with current filters
                                        loadOrders(filters);
                                        // Close the off-canvas after applying filters
                                        setShowFiltersOffcanvas(false);
                                   }}
                              >
                                   <RiFilterLine className="me-1" />
                                   Apply Filters
                              </button>
                              <button
                                   className="btn btn-outline-secondary btn-sm me-2"
                                   onClick={clearFilters}
                              >
                                   Clear Filters
                              </button>
                              <span className="text-muted d-block mt-2">
                                   Showing {filteredOrders.length} of {orders.length} orders
                              </span>
                         </div>
                    </div>
               </div>

               {/* Off-canvas Backdrop */}
               {showFiltersOffcanvas && (
                    <div
                         className="offcanvas-backdrop show"
                         onClick={() => setShowFiltersOffcanvas(false)}
                    ></div>
               )}

               {/* Results Table */}
               <div className="mb-4">
                    <h5 className="mb-3">Orders ({filteredOrders.length})</h5>
                    <PrimeTable
                         column={orderColumns}
                         data={filteredOrders}
                         filtering={false}
                         serverSideFiltering={true}
                         handleSeverSideProcessing={handleServerSideProcessing}
                    />
               </div>

               {/* Receipts Modal */}
               {showReceiptsModal && selectedOrder && (
                    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                         <div className="modal-dialog modal-xl modal-dialog-scrollable">
                              <div className="modal-content">
                                   <div className="modal-header">
                                        <h5 className="modal-title">
                                             Received Receipts - {selectedOrder.order_number}
                                        </h5>
                                        <button
                                             type="button"
                                             className="btn-close"
                                             onClick={() => {
                                                  setShowReceiptsModal(false);
                                                  setSelectedOrder(null);
                                                  setReceipts([]);
                                             }}
                                        ></button>
                                   </div>
                                   <div className="modal-body">
                                        <div className="row mb-3">
                                             <div className="col-md-6">
                                                  <div className="card bg-light">
                                                       <div className="card-body">
                                                            <h6 className="card-title">Order Summary</h6>
                                                            <p className="mb-1"><strong>Total Items:</strong> {selectedOrder.items_count}</p>
                                                            <p className="mb-1"><strong>Total Received:</strong> {selectedOrder.total_received_quantity}</p>
                                                            <p className="mb-0"><strong>Total Transaction Cost:</strong> {currencyFormatter.format(selectedOrder.total_transaction_cost || 0)}</p>
                                                       </div>
                                                  </div>
                                             </div>
                                             <div className="col-md-6">
                                                  <div className="card bg-light">
                                                       <div className="card-body">
                                                            <h6 className="card-title">Receipts Summary</h6>
                                                            <p className="mb-1"><strong>Total Receipts:</strong> {receipts.length}</p>
                                                            <p className="mb-0"><strong>Items with Receipts:</strong> {new Set(receipts.map(r => r.item_name)).size}</p>
                                                       </div>
                                                  </div>
                                             </div>
                                        </div>
                                        {receipts.length === 0 ? (
                                             <div className="text-center py-4">
                                                  <div className="text-muted">
                                                       <RiInboxLine className="fs-1 mb-2" />
                                                       <p>No receipts found for this order.</p>
                                                  </div>
                                             </div>
                                        ) : (
                                             <div className="table-responsive">
                                                  <table className="table table-sm">
                                                       <thead>
                                                            <tr>
                                                                 <th>Item Details</th>
                                                                 <th>Receipt Info</th>
                                                                 <th>Batch & Expiry</th>
                                                                 <th>Quantities</th>
                                                                 <th>Pricing</th>
                                                                 <th>Status</th>
                                                                 <th>Transaction</th>
                                                            </tr>
                                                       </thead>
                                                       <tbody>
                                                            {receipts.map((receipt: any, index: number) => (
                                                                 <tr key={index}>
                                                                      <td>
                                                                           <div className="small">
                                                                                <div className="fw-bold">{receipt.item_name}</div>
                                                                                <div className="text-muted">SKU: {receipt.item_sku}</div>
                                                                                <div className="text-muted">Unit: {receipt.item_unit}</div>
                                                                           </div>
                                                                      </td>
                                                                      <td>
                                                                           <div className="small">
                                                                                <div className="fw-bold">{receipt.receipt_number}</div>
                                                                                <div className="text-muted">
                                                                                     Received: {new Date(receipt.received_date).toLocaleDateString()}
                                                                                </div>
                                                                                <div className="text-muted">
                                                                                     By: {receipt.transactions?.[0]?.employee?.full_name || receipt.received_by}
                                                                                </div>
                                                                           </div>
                                                                      </td>
                                                                      <td>
                                                                           <div className="small">
                                                                                <div className="fw-bold">Batch: {receipt.batch_number}</div>
                                                                                <div className="text-muted">
                                                                                     Expiry: {receipt.expiry_date ? new Date(receipt.expiry_date).toLocaleDateString() : 'N/A'}
                                                                                </div>
                                                                           </div>
                                                                      </td>
                                                                      <td className="text-center">
                                                                           <div className="small">
                                                                                <div className="fw-bold">{receipt.quantity_received}</div>
                                                                                <div className="text-muted">Ordered: {receipt.quantity_ordered}</div>
                                                                           </div>
                                                                      </td>
                                                                      <td className="text-end">
                                                                           <div className="small">
                                                                                <div className="fw-bold">{currencyFormatter.format(receipt.unit_price || 0)}</div>
                                                                                <div className="text-muted">
                                                                                     Tax: {(receipt.tax_rate || 0)}% | Disc: {(receipt.discount_rate || 0)}%
                                                                                </div>
                                                                           </div>
                                                                      </td>
                                                                      <td>
                                                                           <span className={`badge ${receipt.condition_status === 'good' ? 'bg-success' : receipt.condition_status === 'damaged' ? 'bg-danger' : 'bg-warning'}`}>
                                                                                {receipt.condition_status || 'unknown'}
                                                                           </span>
                                                                           {receipt.quality_check_passed === 1 && (
                                                                                <div className="mt-1">
                                                                                     <span className="badge bg-info">QC Passed</span>
                                                                                </div>
                                                                           )}
                                                                      </td>
                                                                      <td>
                                                                           {receipt.transactions && receipt.transactions.length > 0 && (
                                                                                <div className="small">
                                                                                     <div className="fw-bold">
                                                                                          Stock: {receipt.transactions[0].previous_stock} → {receipt.transactions[0].new_stock}
                                                                                     </div>
                                                                                     <div className="text-muted">
                                                                                          Cost: {currencyFormatter.format(receipt.transactions[0].total_cost || 0)}
                                                                                     </div>
                                                                                     <div className="text-muted">
                                                                                          By: {receipt.transactions[0].employee?.full_name || receipt.transactions[0].performed_by}
                                                                                     </div>
                                                                                </div>
                                                                           )}
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
                                                  setShowReceiptsModal(false);
                                                  setSelectedOrder(null);
                                                  setReceipts([]);
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