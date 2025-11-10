'use client';

import React, { useState, useEffect } from 'react';
import { RiShoppingCartLine, RiAddLine, RiEditLine, RiDeleteBinLine, RiEyeLine, RiSendPlaneLine, RiCheckLine, RiMailLine, RiDownloadLine, RiFilterLine } from '@remixicon/react';
import PrimeTable from '../../../components/accessories/Datatables/PrimeTable';
import { customFetch, customPost } from '../../../components/Auth/customFetch';
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
     status: 'draft' | 'ordered' | 'partially_received' | 'received' | 'cancelled';
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
     draft: { label: 'Draft', color: 'secondary' },
     ordered: { label: 'Ordered', color: 'primary' },
     partially_received: { label: 'Partially Received', color: 'warning' },
     received: { label: 'Received', color: 'success' },
     cancelled: { label: 'Cancelled', color: 'danger' }
};

export default function PurchaseOrdersPage() {
     const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
     const [suppliers, setSuppliers] = useState<Supplier[]>([]);
     const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
     const [showReceiveModal, setShowReceiveModal] = useState(false);
     const [receivingOrder, setReceivingOrder] = useState<PurchaseOrder | null>(null);
     const [searchTerm, setSearchTerm] = useState('');
     const [filterStatus, setFilterStatus] = useState<string>('all');
     const [loading, setLoading] = useState(false);

     // Order modal states
     const [showOrderModal, setShowOrderModal] = useState(false);
     const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null);

     // Receiving form state
     const [receiveForm, setReceiveForm] = useState({
          invoiceNumber: '',
          receivedDate: new Date().toISOString().split('T')[0],
          receivedTime: new Date().toTimeString().slice(0, 5),
          items: [] as ReceivedItem[],
          notes: ''
     });

     // Form states
     const [orderForm, setOrderForm] = useState({
          supplierId: '',
          supplierName: '',
          supplierEmail: '',
          supplierContact: '',
          items: [] as OrderItem[],
          expectedDeliveryDate: '',
          notes: '',
          status: 'draft' as 'draft' | 'ordered' | 'partially_received' | 'received' | 'cancelled',
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
                    // Transform API response to match interface
                    const transformedOrders = response.data.orders.map((order: any) => ({
                         id: order.id,
                         orderNumber: order.order_number,
                         supplierId: order.supplier_id,
                         supplierName: order.supplier_name,
                         supplierEmail: order.supplier_email,
                         supplierContact: order.supplier_contact,
                         supplierPhone: order.supplier_phone,
                         supplierAddress: order.supplier_address,
                         items: [], // Not provided in current API response
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
                         emailSent: false, // Will be determined by sent_at
                         emailSentDate: order.sent_at,
                         communicationMethod: 'email', // Default
                         communicationNotes: '',
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
               // Build query parameters for server-side filtering
               const params = new URLSearchParams({
                    page: page.toString(),
                    count: count.toString(),
                    sortby: sortby
               });

               const endpoint = `inventory/orders?${params.toString()}`;
               const response = await customFetch(endpoint);

               if (response.success) {
                    // Transform API response to match interface
                    const transformedOrders = response.data.orders.map((order: any) => ({
                         id: order.id,
                         orderNumber: order.order_number,
                         supplierId: order.supplier_id,
                         supplierName: order.supplier_name,
                         supplierEmail: order.supplier_email,
                         supplierContact: order.supplier_contact,
                         supplierPhone: order.supplier_phone,
                         supplierAddress: order.supplier_address,
                         items: [], // Not provided in current API response
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
                         emailSent: false, // Will be determined by sent_at
                         emailSentDate: order.sent_at,
                         communicationMethod: 'email', // Default
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
               Cell: ({ value }) => (
                    <span className={`badge bg-${STATUS_BADGES[value].color}`}>
                         {STATUS_BADGES[value].label}
                    </span>
               )
          },
          {
               Header: 'Items',
               accessor: 'items',
               Cell: ({ value, row }) => (
                    <div>
                         <div>{row.original.items_count || (value && value.length) || 0} item(s)</div>
                         {value && value.length > 0 && (
                              <small className="text-muted">
                                   {value.map((item: OrderItem) => `${item.itemName}${item.brand ? ` (${item.brand})` : ''} (${item.quantity})`).join(', ')}
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
               Header: 'Expected Delivery',
               accessor: 'expectedDeliveryDate',
               Cell: ({ value }) => value ? new Date(value).toLocaleDateString() : 'Not set'
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
                         >
                              <RiEditLine size={14} />
                         </button>
                         {row.original.status === 'draft' && (
                              <button
                                   className="btn btn-sm btn-outline-success"
                                   title="Send Email"
                                   onClick={() => handleSendEmail(row.original)}
                              >
                                   <RiMailLine size={14} />
                              </button>
                         )}
                         {row.original.status === 'ordered' && (
                              <button
                                   className="btn btn-sm btn-outline-success"
                                   title="Mark as Received"
                                   onClick={() => handleReceiveOrder(row.original)}
                              >
                                   <RiCheckLine size={14} />
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
                    items: orderForm.items.map(item => ({
                         item_id: item.itemId,
                         quantity: item.quantity,
                         notes: item.notes
                    })),
                    expected_delivery_date: orderForm.expectedDeliveryDate || undefined,
                    notes: orderForm.notes,
                    status: orderForm.status,
                    communication_method: orderForm.communicationMethod,
                    communication_notes: orderForm.communicationNotes
               };

               const response = await customPost('inventory/orders', 'POST', orderData);

               if (response.success) {
                    await loadPurchaseOrders(); // Reload orders
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
          // Note: Full order items are not available in the current API response
          // Only summary information (items_count) is provided
          toast.warning('Order editing is limited. Full item details are not available in the current view.');

          setOrderForm({
               supplierId: order.supplierId,
               supplierName: order.supplierName,
               supplierEmail: order.supplierEmail,
               supplierContact: order.supplierContact,
               items: [], // Items not available in current API response
               expectedDeliveryDate: order.expectedDeliveryDate || '',
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
                    items: orderForm.items.map(item => ({
                         item_id: item.itemId,
                         quantity: item.quantity
                    })),
                    status: orderForm.status,
                    expected_delivery_date: orderForm.expectedDeliveryDate || null,
                    notes: orderForm.notes,
                    communication_method: orderForm.communicationMethod,
                    communication_notes: orderForm.communicationNotes
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

          // Update order status and email sent flag
          setPurchaseOrders(prev => prev.map(o =>
               o.id === order.id
                    ? { ...o, status: 'ordered', emailSent: true, emailSentDate: new Date().toISOString(), communicationMethod: 'email' }
                    : o
          ));

          // Open email client
          window.open(mailtoLink, '_blank');

          toast.success(`Email sent to ${order.supplierEmail} for order ${order.orderNumber}`);
     };

     const handleReceiveOrder = (order: PurchaseOrder) => {
          // Note: Full order items are not available in the current API response
          // Only summary information (items_count, received_items_count) is provided
          toast.warning('Receiving items is not available. Full item details are not provided in the current API response.');
          // In a real implementation, you would need to fetch the full order details first
     };

     const handleProcessReceiving = () => {
          if (!receivingOrder) return;

          // Validate form
          if (!receiveForm.invoiceNumber.trim()) {
               toast.error('Please enter an invoice number');
               return;
          }

          const hasIncompleteItems = receiveForm.items.some(item =>
               item.receivedQuantity <= 0 || item.unitPrice <= 0 ||
               !item.batchNumber.trim() || !item.expiryDate.trim()
          );

          if (hasIncompleteItems) {
               toast.error('Please complete all item details (quantity, price, batch number, expiry date)');
               return;
          }

          // Calculate if this is a partial receive
          const totalOrdered = receiveForm.items.reduce((sum, item) => sum + item.orderedQuantity, 0);
          const totalReceived = receiveForm.items.reduce((sum, item) => sum + item.receivedQuantity, 0);
          const isPartialReceive = totalReceived < totalOrdered;

          // Update order status
          const newStatus = isPartialReceive ? 'partially_received' : 'received';
          const receivedDateTime = `${receiveForm.receivedDate}T${receiveForm.receivedTime}:00Z`;

          setPurchaseOrders(prev => prev.map(order =>
               order.id === receivingOrder.id
                    ? {
                         ...order,
                         status: newStatus,
                         actualDeliveryDate: receivedDateTime,
                         invoiceNumber: receiveForm.invoiceNumber,
                         receivedNotes: receiveForm.notes
                    }
                    : order
          ));

          // Update inventory stock levels with batch tracking
          setInventoryItems(prev => prev.map(item => {
               const receivedItem = receiveForm.items.find(ri => ri.itemId === item.id);
               if (receivedItem) {
                    // Create new batch entry
                    const newBatch: Batch = {
                         id: `batch-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                         batchNumber: receivedItem.batchNumber,
                         quantity: receivedItem.receivedQuantity,
                         unitPrice: receivedItem.unitPrice,
                         totalValue: receivedItem.totalValue,
                         expiryDate: receivedItem.expiryDate,
                         supplierId: receivingOrder.supplierId,
                         supplierName: receivingOrder.supplierName,
                         receivedDate: `${receiveForm.receivedDate}T${receiveForm.receivedTime}:00Z`,
                         purchaseOrderNumber: receivingOrder.orderNumber,
                         invoiceNumber: receiveForm.invoiceNumber
                    };

                    // Add batch to existing batches
                    const updatedBatches = [...item.batches, newBatch];

                    // Calculate totals from all batches
                    const totalStock = updatedBatches.reduce((sum, batch) => sum + batch.quantity, 0);
                    const totalValue = updatedBatches.reduce((sum, batch) => sum + batch.totalValue, 0);
                    const avgPrice = totalStock > 0 ? totalValue / totalStock : 0;

                    // Find earliest expiry date
                    const earliestExpiry = updatedBatches.length > 0 ?
                         updatedBatches
                              .filter(batch => batch.expiryDate)
                              .sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime())[0]?.expiryDate
                         : undefined;

                    return {
                         ...item,
                         batches: updatedBatches,
                         currentStock: totalStock,
                         unitPrice: avgPrice,
                         totalValue: totalValue,
                         expiryDate: earliestExpiry,
                         lastUpdated: new Date().toISOString(),
                         status: totalStock === 0 ? 'out_of_stock' :
                              totalStock <= item.minStock ? 'low_stock' : 'in_stock'
                    };
               }
               return item;
          }));

          // Create transaction record (simulate adding to transactions)
          // In a real app, this would call an API to create the transaction
          const transactionItems = receiveForm.items.map(item => ({
               itemId: item.itemId,
               itemName: item.itemName,
               quantity: item.receivedQuantity,
               unit: item.unit,
               unitPrice: item.unitPrice,
               totalValue: item.totalValue
          }));

          // Here you would typically dispatch to a global state or API
          console.log('Creating transaction:', {
               type: 'addition',
               items: transactionItems,
               supplier: receivingOrder.supplierName,
               purchaseOrderNumber: receivingOrder.orderNumber,
               invoiceNumber: receiveForm.invoiceNumber,
               receivedDate: receivedDateTime,
               batchNumber: receiveForm.items[0]?.batchNumber, // Use first batch as primary
               expiryDate: receiveForm.items[0]?.expiryDate, // Use first expiry as primary
               notes: `Received items for PO ${receivingOrder.orderNumber}. ${receiveForm.notes}`
          });

          setShowReceiveModal(false);
          setReceivingOrder(null);
          toast.success(`Order ${receivingOrder.orderNumber} ${isPartialReceive ? 'partially ' : ''}received successfully!`);
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

     const generateOrderEmail = (order: PurchaseOrder): string => {
          let emailBody = `Dear ${order.supplierContact},\n\n`;
          emailBody += `Please find below our purchase order details:\n\n`;
          emailBody += `Order Number: ${order.orderNumber}\n`;
          emailBody += `Order Date: ${new Date(order.orderDate).toLocaleDateString()}\n`;
          emailBody += `Expected Delivery: ${order.expectedDeliveryDate ? new Date(order.expectedDeliveryDate).toLocaleDateString() : 'TBD'}\n\n`;

          // Check if full items are available
          if (order.items && order.items.length > 0) {
               emailBody += `Items Ordered:\n`;
               order.items.forEach((item, index) => {
                    emailBody += `${index + 1}. ${item.itemName}\n`;
                    if (item.brand) emailBody += `   Brand: ${item.brand}\n`;
                    emailBody += `   SKU: ${item.sku}\n`;
                    emailBody += `   Quantity: ${item.quantity} ${item.unit}\n\n`;
               });
          } else {
               emailBody += `Items Ordered: ${order.items_count || 0} item(s) total\n\n`;
               emailBody += `Note: Detailed item list is not available in this view.\n\n`;
          }

          emailBody += `Please provide pricing and availability information.\n\n`;
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
               status: 'draft',
               communicationMethod: 'email',
               communicationNotes: ''
          });
          setSelectedOrder(null);
     };

     const getOrderStats = () => {
          const draftCount = purchaseOrders.filter(o => o.status === 'draft').length;
          const orderedCount = purchaseOrders.filter(o => o.status === 'ordered').length;
          const receivedCount = purchaseOrders.filter(o => o.status === 'received').length;
          const totalItems = purchaseOrders.reduce((sum, order) => sum + (order.items_count || 0), 0);

          return { draftCount, orderedCount, receivedCount, totalItems };
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
                                   <h5 className="card-title">{stats.draftCount}</h5>
                                   <p className="card-text text-muted small">Draft Orders</p>
                              </div>
                         </div>
                    </div>
                    <div className="col-md-3 mb-3">
                         <div className="card h-100">
                              <div className="card-body text-center">
                                   <RiSendPlaneLine size={32} className="text-primary mb-2" />
                                   <h5 className="card-title">{stats.orderedCount}</h5>
                                   <p className="card-text text-muted small">Ordered</p>
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
                                   <div className="text-info mb-2" style={{ fontSize: '32px' }}>📦</div>
                                   <h5 className="card-title">{stats.totalItems}</h5>
                                   <p className="card-text text-muted small">Total Items Ordered</p>
                              </div>
                         </div>
                    </div>
               </div>

               {/* Filters */}
               <div className="card mb-4">
                    <div className="card-body">
                         <div className="row">
                              <div className="col-md-6">
                                   <div className="d-flex gap-2">
                                        <button className="btn btn-outline-secondary btn-sm">
                                             <RiFilterLine className="me-1" />
                                             Filter
                                        </button>
                                        <div className="ms-auto">
                                             <span className="text-muted">
                                                  Orders loaded
                                             </span>
                                        </div>
                                   </div>
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
                                                  <div className="mb-3">
                                                       <label className="form-label">Order Status</label>
                                                       <select
                                                            className="form-select"
                                                            value={orderForm.status}
                                                            onChange={(e) => setOrderForm(prev => ({ ...prev, status: e.target.value as any }))}
                                                       >
                                                            <option value="draft">Draft</option>
                                                            <option value="ordered">Ordered</option>
                                                            <option value="cancelled">Cancelled</option>
                                                       </select>
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
                                                  <p><strong>Status:</strong>
                                                       <span className={`badge bg-${STATUS_BADGES[selectedOrder.status].color} ms-2`}>
                                                            {STATUS_BADGES[selectedOrder.status].label}
                                                       </span>
                                                  </p>
                                                  <p><strong>Order Date:</strong> {new Date(selectedOrder.orderDate).toLocaleString()}</p>
                                                  <p><strong>Expected Delivery:</strong> {selectedOrder.expectedDeliveryDate ? new Date(selectedOrder.expectedDeliveryDate).toLocaleDateString() : 'Not set'}</p>
                                                  {selectedOrder.actualDeliveryDate && (
                                                       <p><strong>Actual Delivery:</strong> {new Date(selectedOrder.actualDeliveryDate).toLocaleDateString()}</p>
                                                  )}
                                             </div>
                                             <div className="col-md-6">
                                                  <p><strong>Created By:</strong> {selectedOrder.createdBy}</p>
                                                  <p><strong>Email Sent:</strong>
                                                       {selectedOrder.emailSent ? (
                                                            <span className="text-success">
                                                                 <RiCheckLine size={16} className="me-1" />
                                                                 {selectedOrder.emailSentDate ? new Date(selectedOrder.emailSentDate).toLocaleString() : 'Yes'}
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
                                                                      <th>Quantity</th>
                                                                      <th>Unit</th>
                                                                 </tr>
                                                            </thead>
                                                            <tbody>
                                                                 {selectedOrder.items.map((item, index) => (
                                                                      <tr key={index}>
                                                                           <td>{item.itemName}</td>
                                                                           <td>{item.brand || 'Not specified'}</td>
                                                                           <td>{item.sku}</td>
                                                                           <td>{item.quantity}</td>
                                                                           <td>{item.unit}</td>
                                                                      </tr>
                                                                 ))}
                                                            </tbody>
                                                       </table>
                                                  </div>
                                             ) : (
                                                  <div className="alert alert-info">
                                                       <small>Full item details are not available in the current view. Total items: {selectedOrder.items_count || 0}</small>
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
                                        {selectedOrder.status === 'draft' && (
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
                                        {selectedOrder.status === 'ordered' && (
                                             <button
                                                  type="button"
                                                  className="btn btn-success btn-sm"
                                                  onClick={() => {
                                                       handleReceiveOrder(selectedOrder);
                                                       setSelectedOrder(null);
                                                  }}
                                             >
                                                  <RiCheckLine size={14} className="me-1" />
                                                  Mark as Received
                                             </button>
                                        )}
                                   </div>
                              </div>
                         </div>
                    </div>
               )}

               {/* Receive Items Modal */}
               {showReceiveModal && receivingOrder && (
                    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                         <div className="modal-dialog modal-xl">
                              <div className="modal-content">
                                   <div className="modal-header">
                                        <h5 className="modal-title">
                                             Receive Items - {receivingOrder.orderNumber}
                                        </h5>
                                        <button
                                             type="button"
                                             className="btn-close"
                                             onClick={() => {
                                                  setShowReceiveModal(false);
                                                  setReceivingOrder(null);
                                             }}
                                        ></button>
                                   </div>
                                   <div className="modal-body">
                                        <div className="row">
                                             <div className="col-md-6">
                                                  <div className="mb-3">
                                                       <label className="form-label">Invoice Number *</label>
                                                       <input
                                                            type="text"
                                                            className="form-control"
                                                            value={receiveForm.invoiceNumber}
                                                            onChange={(e) => setReceiveForm(prev => ({ ...prev, invoiceNumber: e.target.value }))}
                                                            placeholder="e.g., INV-2025-0456"
                                                       />
                                                  </div>
                                                  <div className="row">
                                                       <div className="col-md-6">
                                                            <div className="mb-3">
                                                                 <label className="form-label">Received Date *</label>
                                                                 <input
                                                                      type="date"
                                                                      className="form-control"
                                                                      value={receiveForm.receivedDate}
                                                                      onChange={(e) => setReceiveForm(prev => ({ ...prev, receivedDate: e.target.value }))}
                                                                 />
                                                            </div>
                                                       </div>
                                                       <div className="col-md-6">
                                                            <div className="mb-3">
                                                                 <label className="form-label">Received Time *</label>
                                                                 <input
                                                                      type="time"
                                                                      className="form-control"
                                                                      value={receiveForm.receivedTime}
                                                                      onChange={(e) => setReceiveForm(prev => ({ ...prev, receivedTime: e.target.value }))}
                                                                 />
                                                            </div>
                                                       </div>
                                                  </div>
                                             </div>
                                             <div className="col-md-6">
                                                  <div className="mb-3">
                                                       <label className="form-label">Receiving Notes</label>
                                                       <textarea
                                                            className="form-control"
                                                            rows={3}
                                                            value={receiveForm.notes}
                                                            onChange={(e) => setReceiveForm(prev => ({ ...prev, notes: e.target.value }))}
                                                            placeholder="Notes about the delivery, condition of items, etc."
                                                       />
                                                  </div>
                                             </div>
                                        </div>

                                        <div className="mb-3">
                                             <label className="form-label">Items Received</label>
                                             <div className="table-responsive">
                                                  <table className="table table-sm">
                                                       <thead>
                                                            <tr>
                                                                 <th>Item</th>
                                                                 <th>Ordered</th>
                                                                 <th>Received</th>
                                                                 <th>Unit Price</th>
                                                                 <th>Batch Number</th>
                                                                 <th>Expiry Date</th>
                                                                 <th>Total Value</th>
                                                            </tr>
                                                       </thead>
                                                       <tbody>
                                                            {receiveForm.items.map((item, index) => (
                                                                 <tr key={index}>
                                                                      <td>
                                                                           <div>
                                                                                <div className="fw-bold">{item.itemName}</div>
                                                                                {item.brand && <small className="text-muted">Brand: {item.brand}</small>}
                                                                                <br />
                                                                                <small className="text-muted">{item.sku}</small>
                                                                           </div>
                                                                      </td>
                                                                      <td>{item.orderedQuantity} {item.unit}</td>
                                                                      <td>
                                                                           <input
                                                                                type="number"
                                                                                className="form-control form-control-sm"
                                                                                style={{ width: '80px' }}
                                                                                value={item.receivedQuantity}
                                                                                onChange={(e) => {
                                                                                     const updatedItems = [...receiveForm.items];
                                                                                     updatedItems[index].receivedQuantity = parseInt(e.target.value) || 0;
                                                                                     updatedItems[index].totalValue = updatedItems[index].receivedQuantity * updatedItems[index].unitPrice;
                                                                                     setReceiveForm(prev => ({ ...prev, items: updatedItems }));
                                                                                }}
                                                                                min="0"
                                                                           />
                                                                      </td>
                                                                      <td>
                                                                           <input
                                                                                type="number"
                                                                                className="form-control form-control-sm"
                                                                                style={{ width: '100px' }}
                                                                                value={item.unitPrice}
                                                                                onChange={(e) => {
                                                                                     const updatedItems = [...receiveForm.items];
                                                                                     updatedItems[index].unitPrice = parseFloat(e.target.value) || 0;
                                                                                     updatedItems[index].totalValue = updatedItems[index].receivedQuantity * updatedItems[index].unitPrice;
                                                                                     setReceiveForm(prev => ({ ...prev, items: updatedItems }));
                                                                                }}
                                                                                min="0"
                                                                                step="0.01"
                                                                           />
                                                                      </td>
                                                                      <td>
                                                                           <input
                                                                                type="text"
                                                                                className="form-control form-control-sm"
                                                                                style={{ width: '120px' }}
                                                                                value={item.batchNumber}
                                                                                onChange={(e) => {
                                                                                     const updatedItems = [...receiveForm.items];
                                                                                     updatedItems[index].batchNumber = e.target.value;
                                                                                     setReceiveForm(prev => ({ ...prev, items: updatedItems }));
                                                                                }}
                                                                                placeholder="Batch-001"
                                                                           />
                                                                      </td>
                                                                      <td>
                                                                           <input
                                                                                type="date"
                                                                                className="form-control form-control-sm"
                                                                                style={{ width: '130px' }}
                                                                                value={item.expiryDate}
                                                                                onChange={(e) => {
                                                                                     const updatedItems = [...receiveForm.items];
                                                                                     updatedItems[index].expiryDate = e.target.value;
                                                                                     setReceiveForm(prev => ({ ...prev, items: updatedItems }));
                                                                                }}
                                                                           />
                                                                      </td>
                                                                      <td className="fw-bold">
                                                                           ${item.totalValue.toFixed(2)}
                                                                      </td>
                                                                 </tr>
                                                            ))}
                                                       </tbody>
                                                       <tfoot>
                                                            <tr>
                                                                 <td colSpan={6} className="text-end fw-bold">Total Value:</td>
                                                                 <td className="fw-bold">${receiveForm.items.reduce((sum, item) => sum + item.totalValue, 0).toFixed(2)}</td>
                                                            </tr>
                                                       </tfoot>
                                                  </table>
                                             </div>
                                        </div>
                                   </div>
                                   <div className="modal-footer">
                                        <button
                                             type="button"
                                             className="btn btn-secondary btn-sm"
                                             onClick={() => {
                                                  setShowReceiveModal(false);
                                                  setReceivingOrder(null);
                                             }}
                                        >
                                             Cancel
                                        </button>
                                        <button
                                             type="button"
                                             className="btn btn-success btn-sm"
                                             onClick={handleProcessReceiving}
                                        >
                                             <RiCheckLine size={14} className="me-1" />
                                             Process Receiving
                                        </button>
                                   </div>
                              </div>
                         </div>
                    </div>
               )}
          </div>
     );
}