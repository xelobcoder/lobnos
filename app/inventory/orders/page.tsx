'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { RiShoppingCartLine, RiAddLine, RiEditLine, RiDeleteBinLine, RiEyeLine, RiSendPlaneLine, RiCheckLine, RiMailLine, RiDownloadLine, RiFilterLine, RiCloseLine, RiInboxArchiveLine } from '@remixicon/react';
import PrimeTable from '../../../components/accessories/Datatables/PrimeTable';
import { currencyFormatter, customFetch, customPost } from '../../../components/Auth/customFetch';
import { useApplicationSettings } from '../../../components/Auth/useApplicationContext';
import { toast } from 'react-toastify';

interface Supplier {
     id: string;
     name: string;
     contact: string;
     email: string;
     phone: string;
}

interface Batch {
     id: string;
     batchNumber: string;
     quantity: number;
     unitPrice: number;
     totalValue: number;
     expiryDate: string;
     supplierId: string;
     supplierName: string;
     receivedDate: string;
     purchaseOrderNumber: string;
     invoiceNumber: string;
}

interface InventoryItem {
     id: string;
     name: string;
     category: string;
     brand?: string; // Manufacturer/Brand name
     supplier: string;
     sku: string;
     description: string;
     unit: string;
     batches: Batch[];
     currentStock: number; // Calculated from batches
     minStock: number;
     maxStock: number;
     unitPrice: number; // Average or latest price
     totalValue: number; // Calculated from batches
     location: string;
     expiryDate?: string; // Earliest expiry from batches
     lastUpdated: string;
     status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'expired';
}

interface OrderItem {
     id: string;
     order_id: string;
     inventory_item_id: string;
     item_name: string;
     item_description?: string;
     sku: string;
     category_name?: string;
     brand_name?: string;
     supplier_sku?: string;
     quantity_ordered: number;
     quantity_received: number;
     quantity_rejected: number;
     unit_price: number;
     tax_rate: number;
     discount_rate: number;
     line_total: number;
     unit: string;
     batch_number?: string;
     expiry_date?: string;
     status: string;
     received_at?: string;
     notes?: string;
     created_at: string;
     updated_at: string;
}

interface FormOrderItem {
     itemId: string;
     itemName: string;
     brand?: string;
     sku: string;
     quantity: number;
     unit: string;
     notes?: string;
}

interface ReceivedItem {
     itemId: string;
     itemName: string;
     brand?: string;
     sku: string;
     orderedQuantity: number;
     receivedQuantity: number;
     unitPrice: number;
     batchNumber: string;
     expiryDate: string;
     unit: string;
     totalValue: number;
}

interface PurchaseOrder {
     id: string;
     orderNumber: string;
     supplierId: string;
     supplierName: string;
     supplierEmail: string;
     supplierContact: string;
     supplierPhone?: string;
     supplierAddress?: string;
     items: OrderItem[];
     status: 'ordering' | 'received' | 'cancelled';
     orderDate: string;
     expectedDeliveryDate?: string;
     actualDeliveryDate?: string;
     totalAmount: number;
     taxAmount: number;
     discountAmount: number;
     shippingCost: number;
     finalAmount: number;
     currency: string;
     paymentTerms?: string;
     notes?: string;
     createdBy: string;
     approvedBy?: string;
     approvedAt?: string;
     sentAt?: string;
     emailSent: boolean;
     emailSentDate?: string;
     communicationMethod?: 'email' | 'phone_call' | 'whatsapp' | 'pdf_attachment' | 'in_person' | 'fax' | 'other';
     communicationNotes?: string;
     items_count?: number;
     received_items_count?: number;
     createdAt: string;
     updatedAt: string;
}

const STATUS_BADGES = {
     '': { label: 'Ordering', color: 'secondary' },
     ordering: { label: 'Ordering', color: 'secondary' },
     received: { label: 'Received', color: 'success' },
     cancelled: { label: 'Cancelled', color: 'danger' }
};

export default function PurchaseOrdersPage() {
     const router = useRouter();
     const { applicationsettings } = useApplicationSettings();
     const employeeid = applicationsettings?.user?.employeeid;
     const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
     const [suppliers, setSuppliers] = useState<Supplier[]>([]);
     const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
     const [searchTerm, setSearchTerm] = useState('');
     const [filterStatus, setFilterStatus] = useState<string>('all');
     const [loading, setLoading] = useState(false);

     // Order modal states
     const [showOrderModal, setShowOrderModal] = useState(false);
     const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null);

     // Form states
     const [orderForm, setOrderForm] = useState({
          supplierId: '',
          supplierName: '',
          supplierEmail: '',
          supplierContact: '',
          items: [] as FormOrderItem[],
          expectedDeliveryDate: '',
          notes: '',
          status: 'ordering' as 'ordering' | 'received' | 'cancelled',
          communicationMethod: 'email' as 'email' | 'phone_call' | 'whatsapp' | 'pdf_attachment' | 'in_person' | 'fax' | 'other',
          communicationNotes: ''
     });

     // Load data from APIs
     const loadSuppliers = async () => {
          try {
               const response = await customFetch('inventory/suppliers');
               if (response.success) {
                    setSuppliers(response.data || []);
               }
          } catch (err) {
               console.error('Error loading suppliers:', err);
          }
     };

     const loadInventoryItems = async () => {
          try {
               const response = await customFetch('inventory/items');
               if (response.success) {
                    setInventoryItems(response.data || []);
               }
          } catch (err) {
               console.error('Error loading inventory items:', err);
          }
     };

     const loadPurchaseOrders = async () => {
          try {
               setLoading(true);
               const response = await customFetch('inventory/orders');
               if (response.success) {
                    const transformedOrders = response.data.orders.map((order: any) => ({
                         id: order.id,
                         orderNumber: order.order_number,
                         supplierId: order.supplier_id,
                         supplierName: order.supplier_name,
                         supplierEmail: order.supplier_email,
                         supplierContact: order.supplier_contact,
                         supplierPhone: order.supplier_phone,
                         supplierAddress: order.supplier_address,
                         items: order.items || [],
                         status: order.status,
                         orderDate: order.order_date,
                         expectedDeliveryDate: order.expected_delivery_date,
                         actualDeliveryDate: order.actual_delivery_date,
                         totalAmount: order.total_amount,
                         taxAmount: order.tax_amount,
                         discountAmount: order.discount_amount,
                         shippingCost: order.shipping_cost,
                         finalAmount: order.final_amount,
                         currency: order.currency,
                         paymentTerms: order.payment_terms,
                         notes: order.notes,
                         createdBy: order.created_by,
                         approvedBy: order.approved_by,
                         approvedAt: order.approved_at,
                         sentAt: order.sent_at,
                         emailSent: false,
                         emailSentDate: order.sent_at,
                         communicationMethod: order.communication_method,
                         communicationNotes: order.communication_notes || '',
                         items_count: order.items_count,
                         received_items_count: order.received_items_count,
                         createdAt: order.created_at,
                         updatedAt: order.updated_at
                    }));
                    setPurchaseOrders(transformedOrders);
               }
          } catch (err) {
               console.error('Error loading purchase orders:', err);
          } finally {
               setLoading(false);
          }
     };

     const handleServerSideProcessing = async ({ page, count, sortby = 'DESC' }: { page: number; count: number; sortby?: string }) => {
          try {
               const params = new URLSearchParams({
                    page: page.toString(),
                    count: count.toString(),
                    sortby: sortby
               });

               const endpoint = `inventory/orders?${params.toString()}`;
               const response = await customFetch(endpoint);

               if (response.success) {
                    const transformedOrders = response.data.orders.map((order: any) => ({
                         id: order.id,
                         orderNumber: order.order_number,
                         supplierId: order.supplier_id,
                         supplierName: order.supplier_name,
                         supplierEmail: order.supplier_email,
                         supplierContact: order.supplier_contact,
                         supplierPhone: order.supplier_phone,
                         supplierAddress: order.supplier_address,
                         items: order.items || [],
                         status: order.status,
                         orderDate: order.order_date,
                         expectedDeliveryDate: order.expected_delivery_date,
                         actualDeliveryDate: order.actual_delivery_date,
                         totalAmount: order.total_amount,
                         taxAmount: order.tax_amount,
                         discountAmount: order.discount_amount,
                         shippingCost: order.shipping_cost,
                         finalAmount: order.final_amount,
                         currency: order.currency,
                         paymentTerms: order.payment_terms,
                         notes: order.notes,
                         createdBy: order.created_by,
                         approvedBy: order.approved_by,
                         approvedAt: order.approved_at,
                         sentAt: order.sent_at,
                         emailSent: false,
                         emailSentDate: order.sent_at,
                         communicationMethod: 'email',
                         communicationNotes: '',
                         items_count: order.items_count,
                         received_items_count: order.received_items_count,
                         createdAt: order.created_at,
                         updatedAt: order.updated_at
                    }));
                    return { result: transformedOrders, error: false };
               } else {
                    return { result: [], error: true };
               }
          } catch (error) {
               console.error('Error in server-side processing:', error);
               return { result: [], error: true };
          }
     };

     // Load all data on component mount
     useEffect(() => {
          loadSuppliers();
          loadInventoryItems();
          loadPurchaseOrders();
     }, []);

     const orderColumns = [
          {
               Header: 'Order Number',
               accessor: 'orderNumber',
          },
          {
               Header: 'Supplier',
               accessor: 'supplierName',
               Cell: ({ value, row }) => (
                    <div>
                         <div className="fw-bold">{value}</div>
                         <small className="text-muted">{row.original.supplierEmail}</small>
                    </div>
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
               Header: 'Items',
               accessor: 'items',
               Cell: ({ value, row }) => (
                    <div>
                         <div>{row.original.items_count || (value && value.length) || 0} item(s)</div>
                         {value && value.length > 0 && (
                              <small className="text-muted">
                                   {value.map((item: any) => `${item.item_name}${item.brand_name ? ` (${item.brand_name})` : ''} (${item.quantity_ordered})`).join(', ')}
                              </small>
                         )}
                    </div>
               )
          },
          {
               Header: 'Communication',
               accessor: 'communicationMethod',
               Cell: ({ row }) => (
                    <div>
                         <div className="fw-bold">
                              {row.original.communicationMethod ?
                                   row.original.communicationMethod.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) :
                                   'Not specified'
                              }
                         </div>
                         {row.original.emailSent && (
                              <small className="text-success">
                                   <RiCheckLine size={12} className="me-1" />
                                   Sent
                              </small>
                         )}
                    </div>
               )
          },
          {
               Header: 'Total Amount',
               accessor: 'totalAmount',
               Cell: ({ value, row }) => (
                    <span>{row.original.currency} {currencyFormatter.format(value.toFixed(2))}</span>
               )
          },
          {
               Header: 'Final Amount',
               accessor: 'finalAmount',
               Cell: ({ value, row }) => <span className="fw-bold"> {(currencyFormatter.format(value.toFixed(2)))}</span>

          },
          {
               Header: 'Actions',
               accessor: 'id',
               Cell: ({ row }) => (
                    <div className="d-flex gap-1">
                         <button
                              className="btn btn-sm btn-outline-info"
                              title="View Details"
                              onClick={() => setSelectedOrder(row.original)}
                         >
                              <RiEyeLine size={14} />
                         </button>
                         <button
                              className="btn btn-sm btn-outline-primary"
                              title="Edit Order"
                              onClick={() => handleEditOrder(row.original)}
                              disabled={row.original.status === 'received' || row.original.status === 'cancelled'}
                         >
                              <RiEditLine size={14} />
                         </button>
                         {row.original.status !== 'received' && row.original.status !== 'cancelled' && (
                              <button
                                   className="btn btn-sm btn-outline-success"
                                   title="Receive Order"
                                   onClick={() => handleReceiveOrder(row.original)}
                              >
                                   <RiInboxArchiveLine size={14} />
                              </button>
                         )}
                         {row.original.status !== 'received' && row.original.status !== 'cancelled' && (
                              <button
                                   className="btn btn-sm btn-outline-success"
                                   title="Send Email"
                                   onClick={() => handleSendEmail(row.original)}
                              >
                                   <RiMailLine size={14} />
                              </button>
                         )}
                         {row.original.status !== 'received' && row.original.status !== 'cancelled' && (
                              <button
                                   className="btn btn-sm btn-outline-warning"
                                   title="Cancel Order"
                                   onClick={() => handleCancelOrder(row.original)}
                              >
                                   <RiCloseLine size={14} className="me-1" />

                              </button>
                         )}
                         <button
                              className="btn btn-sm btn-outline-danger"
                              title="Delete Order"
                              onClick={() => handleDeleteOrder(row.original.id)}
                         >
                              <RiDeleteBinLine size={14} />
                         </button>
                    </div>
               )
          }
     ];

     const handleCreateOrder = async () => {
          if (!orderForm.supplierId || orderForm.items.length === 0) {
               toast.error('Please select a supplier and add at least one item');
               return;
          }

          try {
               setLoading(true);
               const orderData = {
                    supplier_id: orderForm.supplierId,
                    expected_delivery_date: orderForm.expectedDeliveryDate || undefined,
                    items: orderForm.items.map(item => ({
                         inventory_item_id: item.itemId,
                         quantity_ordered: item.quantity,
                         notes: item.notes
                    })),
                    notes: orderForm.notes
               };

               const response = await customPost('inventory/orders', 'POST', orderData);

               if (response.success) {
                    await loadPurchaseOrders();
                    setShowOrderModal(false);
                    resetOrderForm();
                    toast.success('Order created successfully!');
               } else {
                    toast.error(`Failed to create order: ${response.error?.message || 'Unknown error'}`);
               }
          } catch (err) {
               console.error('Error creating order:', err);
               toast.error('Failed to create order');
          } finally {
               setLoading(false);
          }
     };

     const handleEditOrder = (order: PurchaseOrder) => {
          // Prevent editing orders that are received or cancelled
          if (order.status === 'received' || order.status === 'cancelled') {
               toast.error(`Cannot edit orders with ${order.status} status`);
               return;
          }

          // Format dates for input fields (YYYY-MM-DD)
          const formatDateForInput = (dateString: string | null | undefined): string => {
               if (!dateString) return '';
               const date = new Date(dateString);
               return date.toISOString().split('T')[0];
          };

          setOrderForm({
               supplierId: order.supplierId,
               supplierName: order.supplierName,
               supplierEmail: order.supplierEmail,
               supplierContact: order.supplierContact,
               items: order.items.map((item: any) => ({
                    itemId: item.inventory_item_id,
                    itemName: item.item_name,
                    brand: item.brand_name,
                    sku: item.sku,
                    quantity: item.quantity_ordered,
                    unit: item.unit,
                    notes: item.notes
               })),
               expectedDeliveryDate: formatDateForInput(order.expectedDeliveryDate),
               notes: order.notes || '',
               status: order.status,
               communicationMethod: order.communicationMethod || 'email',
               communicationNotes: order.communicationNotes || ''
          });
          setSelectedOrder(order);
          setShowOrderModal(true);
     };

     const handleUpdateOrder = async () => {
          if (!selectedOrder) return;

          try {
               const orderData = {
                    supplier_id: orderForm.supplierId,
                    expected_delivery_date: orderForm.expectedDeliveryDate || null,
                    notes: orderForm.notes
               };

               const response = await customPost(`inventory/orders/${selectedOrder.id}`, 'PUT', orderData as any);

               if (response.success) {
                    toast.success('Order updated successfully!');
                    await loadPurchaseOrders();
                    setShowOrderModal(false);
                    setSelectedOrder(null);
                    resetOrderForm();
               } else {
                    toast.error('Failed to update order: ' + (response.message || 'Unknown error'));
               }
          } catch (error) {
               console.error('Error updating order:', error);
               toast.error('Failed to update order. Please try again.');
          }
     };

     const handleSendEmail = (order: PurchaseOrder) => {
          // Simulate email sending
          const emailBody = generateOrderEmail(order);
          const mailtoLink = `mailto:${order.supplierEmail}?subject=Purchase Order ${order.orderNumber}&body=${encodeURIComponent(emailBody)}`;

          // Update order email sent flag (keep status as ordering)
          setPurchaseOrders(prev => prev.map(o =>
               o.id === order.id
                    ? { ...o, emailSent: true, emailSentDate: new Date().toISOString(), communicationMethod: 'email' }
                    : o
          ));

          // Open email client
          window.open(mailtoLink, '_blank');

          toast.success(`Email sent to ${order.supplierEmail} for order ${order.orderNumber}`);
     };

     const handleReceiveOrder = (order: PurchaseOrder) => {
          router.push(`/inventory/orders/receive-ordered-items/${order.id}`);
     };

     const handleDeleteOrder = async (orderId: string) => {
          if (confirm('Are you sure you want to delete this order?')) {
               try {
                    const response = await customPost(`inventory/orders/${orderId}`, 'DELETE', {} as any);

                    if (response.success) {
                         toast.success('Order deleted successfully!');
                         await loadPurchaseOrders();
                    } else {
                         toast.error('Failed to delete order: ' + (response.message || 'Unknown error'));
                    }
               } catch (error) {
                    console.error('Error deleting order:', error);
                    toast.error('Failed to delete order. Please try again.');
               }
          }
     };

     const handleCancelOrder = async (order: PurchaseOrder) => {
          const reason = prompt('Please enter the reason for cancelling this order:');
          if (!reason || !reason.trim()) {
               toast.error('Cancellation reason is required');
               return;
          }

          try {
               const cancelData = {
                    cancelled_by: employeeid,
                    reason: reason.trim()
               };

               const response = await customPost(`inventory/orders/${order.id}/cancel`, 'POST', cancelData);

               if (response.success) {
                    // Update the order status locally
                    setPurchaseOrders(prev => prev.map(o =>
                         o.id === order.id
                              ? { ...o, status: 'cancelled' }
                              : o
                    ));
                    toast.success('Order cancelled successfully!');
               } else {
                    toast.error(`Failed to cancel order: ${response.error?.message || 'Unknown error'}`);
               }
          } catch (error) {
               console.error('Error cancelling order:', error);
               toast.error('Failed to cancel order. Please try again.');
          }
     };

     const generateOrderEmail = (order: PurchaseOrder): string => {
          let emailBody = `Dear ${order.supplierContact},\n\n`;
          emailBody += `Please find below our purchase order details:\n\n`;
          emailBody += `Order Number: ${order.orderNumber}\n`;
          emailBody += `Order Date: ${new Date(order.orderDate).toLocaleDateString()}\n`;
          emailBody += `Expected Delivery: ${order.expectedDeliveryDate ? new Date(order.expectedDeliveryDate).toLocaleDateString() : 'TBD'}\n\n`;

          if (order.items && order.items.length > 0) {
               emailBody += `Items Ordered:\n`;
               order.items.forEach((item: any, index) => {
                    emailBody += `${index + 1}. ${item.item_name}\n`;
                    if (item.brand_name) emailBody += `   Brand: ${item.brand_name}\n`;
                    emailBody += `   SKU: ${item.sku}\n`;
                    emailBody += `   Quantity: ${item.quantity_ordered} ${item.unit}\n`;
                    emailBody += `   Unit Price: ${item.unit_price}\n\n`;
               });
          } else {
               emailBody += `Items Ordered: ${order.items_count || 0} item(s) total\n\n`;
          }

          emailBody += `Total Amount: ${order.currency} ${order.totalAmount.toFixed(2)}\n`;
          emailBody += `Tax: ${order.currency} ${order.taxAmount.toFixed(2)}\n`;
          emailBody += `Discount: ${order.currency} ${order.discountAmount.toFixed(2)}\n`;
          emailBody += `Shipping: ${order.currency} ${order.shippingCost.toFixed(2)}\n`;
          emailBody += `Final Amount: ${order.currency} ${order.finalAmount.toFixed(2)}\n\n`;

          if (order.notes) {
               emailBody += `Notes: ${order.notes}\n\n`;
          }
          emailBody += `Please confirm receipt of this order and provide an estimated delivery date if not already specified.\n\n`;
          emailBody += `Best regards,\nLab Management Team`;

          return emailBody;
     };

     const resetOrderForm = () => {
          setOrderForm({
               supplierId: '',
               supplierName: '',
               supplierEmail: '',
               supplierContact: '',
               items: [],
               expectedDeliveryDate: '',
               notes: '',
               status: 'ordering',
               communicationMethod: 'email',
               communicationNotes: ''
          });
          setSelectedOrder(null);
     };

     const getOrderStats = () => {
          const orderingCount = purchaseOrders.filter(o => o.status === 'ordering').length;
          const receivedCount = purchaseOrders.filter(o => o.status === 'received').length;
          const cancelledCount = purchaseOrders.filter(o => o.status === 'cancelled').length;
          const totalItems = purchaseOrders.reduce((sum, order) => sum + (order.items_count || 0), 0);

          return { orderingCount, receivedCount, cancelledCount, totalItems };
     };

     const stats = getOrderStats();

     return (
          <div className="container-fluid p-4">
               {/* Header */}
               <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                         <h2 className="mb-1">
                              <RiShoppingCartLine className="me-2" />
                              Purchase Orders
                         </h2>
                         <p className="text-muted mb-0">Manage purchase orders and supplier communications</p>
                    </div>
                    <div className="d-flex gap-2">
                         <button className="btn btn-outline-primary btn-sm">
                              <RiDownloadLine className="me-1" />
                              Export Orders
                         </button>
                         <button
                              className="btn btn-primary btn-sm"
                              onClick={() => setShowOrderModal(true)}
                         >
                              <RiAddLine className="me-1" />
                              Create Order
                         </button>
                    </div>
               </div>

               {/* Statistics Cards */}
               <div className="row mb-4">
                    <div className="col-md-3 mb-3">
                         <div className="card h-100">
                              <div className="card-body text-center">
                                   <RiShoppingCartLine size={32} className="text-secondary mb-2" />
                                   <h5 className="card-title">{stats.orderingCount}</h5>
                                   <p className="card-text text-muted small">Ordering</p>
                              </div>
                         </div>
                    </div>
                    <div className="col-md-3 mb-3">
                         <div className="card h-100">
                              <div className="card-body text-center">
                                   <RiCheckLine size={32} className="text-success mb-2" />
                                   <h5 className="card-title">{stats.receivedCount}</h5>
                                   <p className="card-text text-muted small">Received</p>
                              </div>
                         </div>
                    </div>
                    <div className="col-md-3 mb-3">
                         <div className="card h-100">
                              <div className="card-body text-center">
                                   <div className="text-danger mb-2" style={{ fontSize: '32px' }}>❌</div>
                                   <h5 className="card-title">{stats.cancelledCount}</h5>
                                   <p className="card-text text-muted small">Cancelled</p>
                              </div>
                         </div>
                    </div>
                    <div className="col-md-3 mb-3">
                         <div className="card h-100">
                              <div className="card-body text-center">
                                   <div className="text-info mb-2" style={{ fontSize: '32px' }}>📦</div>
                                   <h5 className="card-title">{stats.totalItems}</h5>
                                   <p className="card-text text-muted small">Total Items Ordered</p>
                              </div>
                         </div>
                    </div>
               </div>

               {/* Orders Table */}
               <PrimeTable
                    column={orderColumns}
                    data={purchaseOrders}
                    filtering={true}
                    handleSeverSideProcessing={handleServerSideProcessing}
                    serverSideFiltering={true}
               />

               {/* Create/Edit Order Modal */}
               {showOrderModal && (
                    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                         <div className="modal-dialog modal-xl">
                              <div className="modal-content">
                                   <div className="modal-header">
                                        <h5 className="modal-title">
                                             {selectedOrder ? 'Edit Purchase Order' : 'Create Purchase Order'}
                                        </h5>
                                        <button
                                             type="button"
                                             className="btn-close"
                                             onClick={() => {
                                                  setShowOrderModal(false);
                                                  resetOrderForm();
                                             }}
                                        ></button>
                                   </div>
                                   <div className="modal-body">
                                        <div className="row">
                                             <div className="col-md-6">
                                                  <div className="mb-3">
                                                       <label className="form-label">Supplier *</label>
                                                       <select
                                                            className="form-select"
                                                            value={orderForm.supplierId}
                                                            onChange={(e) => {
                                                                 const selectedSupplier = suppliers.find(s => s.id === e.target.value);
                                                                 if (selectedSupplier) {
                                                                      setOrderForm(prev => ({
                                                                           ...prev,
                                                                           supplierId: selectedSupplier.id,
                                                                           supplierName: selectedSupplier.name,
                                                                           supplierEmail: selectedSupplier.email,
                                                                           supplierContact: selectedSupplier.contact
                                                                      }));
                                                                 }
                                                            }}
                                                       >
                                                            <option value="">Select supplier</option>
                                                            {suppliers.map(supplier => (
                                                                 <option key={supplier.id} value={supplier.id}>
                                                                      {supplier.name} - {supplier.email}
                                                                 </option>
                                                            ))}
                                                       </select>
                                                  </div>
                                                  <div className="mb-3">
                                                       <label className="form-label">Supplier Contact</label>
                                                       <input
                                                            type="text"
                                                            className="form-control"
                                                            value={orderForm.supplierContact}
                                                            readOnly
                                                       />
                                                  </div>
                                                  <div className="mb-3">
                                                       <label className="form-label">Expected Delivery Date</label>
                                                       <input
                                                            type="date"
                                                            className="form-control"
                                                            value={orderForm.expectedDeliveryDate}
                                                            onChange={(e) => setOrderForm(prev => ({ ...prev, expectedDeliveryDate: e.target.value }))}
                                                       />
                                                  </div>
                                             </div>
                                             <div className="col-md-6">
                                                  <div className="mb-3">
                                                       <label className="form-label">Communication Method</label>
                                                       <select
                                                            className="form-select"
                                                            value={orderForm.communicationMethod}
                                                            onChange={(e) => setOrderForm(prev => ({ ...prev, communicationMethod: e.target.value as any }))}
                                                       >
                                                            <option value="email">Email</option>
                                                            <option value="phone_call">Phone Call</option>
                                                            <option value="whatsapp">WhatsApp</option>
                                                            <option value="pdf_attachment">PDF Attachment</option>
                                                            <option value="in_person">In Person</option>
                                                            <option value="fax">Fax</option>
                                                            <option value="other">Other</option>
                                                       </select>
                                                  </div>
                                                  <div className="mb-3">
                                                       <label className="form-label">Communication Notes</label>
                                                       <textarea
                                                            className="form-control"
                                                            rows={2}
                                                            value={orderForm.communicationNotes}
                                                            onChange={(e) => setOrderForm(prev => ({ ...prev, communicationNotes: e.target.value }))}
                                                            placeholder="Details about how the order was communicated..."
                                                       />
                                                  </div>
                                             </div>
                                             <div className="col-md-6">
                                                  <div className="mb-3">
                                                       <label className="form-label">Items</label>
                                                       <div className="border rounded p-3" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                                            {orderForm.items.map((item, index) => (
                                                                 <div key={index} className="d-flex gap-2 mb-2 align-items-center">
                                                                      <select
                                                                           className="form-select form-select-sm"
                                                                           value={item.itemId}
                                                                           onChange={(e) => {
                                                                                const selectedItem = inventoryItems.find(i => i.id === e.target.value);
                                                                                if (selectedItem) {
                                                                                     const updatedItems = [...orderForm.items];
                                                                                     updatedItems[index] = {
                                                                                          ...updatedItems[index],
                                                                                          itemId: selectedItem.id,
                                                                                          itemName: selectedItem.name,
                                                                                          brand: selectedItem.brand,
                                                                                          sku: selectedItem.sku,
                                                                                          unit: selectedItem.unit
                                                                                     };
                                                                                     setOrderForm(prev => ({ ...prev, items: updatedItems }));
                                                                                }
                                                                           }}
                                                                      >
                                                                           <option value="">Select item</option>
                                                                           {inventoryItems.map(invItem => (
                                                                                <option key={invItem.id} value={invItem.id}>
                                                                                     {invItem.name} ({invItem.sku})
                                                                                </option>
                                                                           ))}
                                                                      </select>
                                                                      <input
                                                                           type="number"
                                                                           className="form-control form-control-sm"
                                                                           style={{ width: '80px' }}
                                                                           placeholder="Qty"
                                                                           value={item.quantity}
                                                                           onChange={(e) => {
                                                                                const updatedItems = [...orderForm.items];
                                                                                updatedItems[index].quantity = parseInt(e.target.value) || 0;
                                                                                setOrderForm(prev => ({ ...prev, items: updatedItems }));
                                                                           }}
                                                                           min="1"
                                                                      />
                                                                      <span className="text-muted small">{item.unit}</span>
                                                                      <button
                                                                           className="btn btn-sm btn-outline-danger"
                                                                           onClick={() => {
                                                                                const updatedItems = orderForm.items.filter((_, i) => i !== index);
                                                                                setOrderForm(prev => ({ ...prev, items: updatedItems }));
                                                                           }}
                                                                      >
                                                                           <RiDeleteBinLine size={12} />
                                                                      </button>
                                                                 </div>
                                                            ))}
                                                            <button
                                                                 className="btn btn-sm btn-outline-primary"
                                                                 onClick={() => {
                                                                      setOrderForm(prev => ({
                                                                           ...prev,
                                                                           items: [...prev.items, {
                                                                                itemId: '',
                                                                                itemName: '',
                                                                                sku: '',
                                                                                quantity: 1,
                                                                                unit: 'pieces'
                                                                           }]
                                                                      }));
                                                                 }}
                                                            >
                                                                 <RiAddLine size={14} className="me-1" />
                                                                 Add Item
                                                            </button>
                                                       </div>
                                                  </div>
                                             </div>
                                        </div>
                                        <div className="mb-3">
                                             <label className="form-label">Notes</label>
                                             <textarea
                                                  className="form-control"
                                                  rows={3}
                                                  value={orderForm.notes}
                                                  onChange={(e) => setOrderForm(prev => ({ ...prev, notes: e.target.value }))}
                                                  placeholder="Order notes, special instructions..."
                                             />
                                        </div>
                                   </div>
                                   <div className="modal-footer">
                                        <button
                                             type="button"
                                             className="btn btn-secondary btn-sm"
                                             onClick={() => {
                                                  setShowOrderModal(false);
                                                  resetOrderForm();
                                             }}
                                        >
                                             Cancel
                                        </button>
                                        <button
                                             type="button"
                                             className="btn btn-primary btn-sm"
                                             onClick={selectedOrder ? handleUpdateOrder : handleCreateOrder}
                                        >
                                             {selectedOrder ? 'Update Order' : 'Create Order'}
                                        </button>
                                   </div>
                              </div>
                         </div>
                    </div>
               )}

               {/* Order Details Modal */}
               {selectedOrder && !showOrderModal && (
                    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                         <div className="modal-dialog modal-xl">
                              <div className="modal-content">
                                   <div className="modal-header">
                                        <h5 className="modal-title">Purchase Order Details - {selectedOrder.orderNumber}</h5>
                                        <button
                                             type="button"
                                             className="btn-close"
                                             onClick={() => setSelectedOrder(null)}
                                        ></button>
                                   </div>
                                   <div className="modal-body">
                                        <div className="row">
                                             <div className="col-md-6">
                                                  <p><strong>Order Number:</strong> {selectedOrder.orderNumber}</p>
                                                  <p><strong>Supplier:</strong> {selectedOrder.supplierName}</p>
                                                  <p><strong>Contact:</strong> {selectedOrder.supplierContact}</p>
                                                  <p><strong>Email:</strong> {selectedOrder.supplierEmail}</p>
                                                  {selectedOrder.supplierPhone && <p><strong>Phone:</strong> {selectedOrder.supplierPhone}</p>}
                                                  <p><strong>Status:</strong>
                                                       {(() => {
                                                            const badge = STATUS_BADGES[selectedOrder.status as keyof typeof STATUS_BADGES] || STATUS_BADGES[''];
                                                            return (
                                                                 <span className={`badge bg-${badge.color} ms-2`}>
                                                                      {badge.label}
                                                                 </span>
                                                            );
                                                       })()}

                                                  </p>
                                                  <p><strong>Order Date:</strong> {new Date(selectedOrder.orderDate).toLocaleString()}</p>
                                                  <p><strong>Expected Delivery:</strong> {selectedOrder.expectedDeliveryDate ? new Date(selectedOrder.expectedDeliveryDate).toLocaleDateString() : 'Not set'}</p>
                                                  {selectedOrder.actualDeliveryDate && (
                                                       <p><strong>Actual Delivery:</strong> {new Date(selectedOrder.actualDeliveryDate).toLocaleDateString()}</p>
                                                  )}
                                             </div>
                                             <div className="col-md-6">
                                                  <p><strong>Total Amount:</strong> {selectedOrder.currency} {selectedOrder.totalAmount.toFixed(2)}</p>
                                                  <p><strong>Tax Amount:</strong> {selectedOrder.currency} {selectedOrder.taxAmount.toFixed(2)}</p>
                                                  <p><strong>Discount:</strong> {selectedOrder.currency} {selectedOrder.discountAmount.toFixed(2)}</p>
                                                  <p><strong>Shipping Cost:</strong> {selectedOrder.currency} {selectedOrder.shippingCost.toFixed(2)}</p>
                                                  <p><strong>Final Amount:</strong> {selectedOrder.currency} {selectedOrder.finalAmount.toFixed(2)}</p>
                                                  <p><strong>Created By:</strong> {selectedOrder.createdBy}</p>
                                                  {selectedOrder.approvedBy && <p><strong>Approved By:</strong> {selectedOrder.approvedBy}</p>}
                                                  <p><strong>Email Sent:</strong>
                                                       {selectedOrder.sentAt ? (
                                                            <span className="text-success">
                                                                 <RiCheckLine size={16} className="me-1" />
                                                                 {new Date(selectedOrder.sentAt).toLocaleString()}
                                                            </span>
                                                       ) : (
                                                            <span className="text-warning">Not sent</span>
                                                       )}
                                                  </p>
                                                  {selectedOrder.communicationMethod && (
                                                       <p><strong>Communication Method:</strong> {selectedOrder.communicationMethod.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
                                                  )}
                                                  {selectedOrder.communicationNotes && (
                                                       <p><strong>Communication Notes:</strong> {selectedOrder.communicationNotes}</p>
                                                  )}
                                                  {selectedOrder.notes && <p><strong>Notes:</strong> {selectedOrder.notes}</p>}
                                             </div>
                                        </div>
                                        <div className="mt-3">
                                             <h6>Order Items:</h6>
                                             {selectedOrder.items && selectedOrder.items.length > 0 ? (
                                                  <div className="table-responsive">
                                                       <table className="table table-sm">
                                                            <thead>
                                                                 <tr>
                                                                      <th>Item Name</th>
                                                                      <th>Brand</th>
                                                                      <th>SKU</th>
                                                                      <th>Qty Ordered</th>
                                                                      <th>Qty Received</th>
                                                                      <th>Unit Price</th>
                                                                      <th>Line Total</th>
                                                                      <th>Status</th>
                                                                 </tr>
                                                            </thead>
                                                            <tbody>
                                                                 {selectedOrder.items.map((item: any, index) => (
                                                                      <tr key={index}>
                                                                           <td>{item.item_name}</td>
                                                                           <td>{item.brand_name || 'Not specified'}</td>
                                                                           <td>{item.sku}</td>
                                                                           <td>{item.quantity_ordered}</td>
                                                                           <td>{item.quantity_received}</td>
                                                                           <td>{item.unit_price}</td>
                                                                           <td>{item.line_total}</td>
                                                                           <td><span className="badge bg-info">{item.status}</span></td>
                                                                      </tr>
                                                                 ))}
                                                            </tbody>
                                                       </table>
                                                  </div>
                                             ) : (
                                                  <div className="alert alert-info">
                                                       <small>No item details available. Total items: {selectedOrder.items_count || 0}</small>
                                                  </div>
                                             )}
                                        </div>
                                   </div>
                                   <div className="modal-footer">
                                        <button
                                             type="button"
                                             className="btn btn-secondary btn-sm"
                                             onClick={() => setSelectedOrder(null)}
                                        >
                                             Close
                                        </button>
                                        {selectedOrder.status !== 'received' && selectedOrder.status !== 'cancelled' && (
                                             <button
                                                  type="button"
                                                  className="btn btn-success btn-sm"
                                                  onClick={() => {
                                                       handleSendEmail(selectedOrder);
                                                       setSelectedOrder(null);
                                                  }}
                                             >
                                                  <RiMailLine size={14} className="me-1" />
                                                  Send Email
                                             </button>
                                        )}
                                   </div>
                              </div>
                         </div>
                    </div>
               )}

          </div>
     );
}