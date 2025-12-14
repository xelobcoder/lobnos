'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { RiShoppingCartLine, RiAddLine, RiEditLine, RiDeleteBinLine, RiEyeLine, RiSendPlaneLine, RiCheckLine, RiMailLine, RiFilterLine, RiCloseLine, RiInboxArchiveLine, RiMoneyDollarCircleLine } from '@remixicon/react';
import PrimeTable from '../../../components/accessories/Datatables/PrimeTable';
import { currencyFormatter, customFetch, customPost } from '../../../components/Auth/customFetch';
import { useApplication, useApplicationSettings } from '../../../components/Auth/useApplicationContext';
import { toast } from 'react-toastify';

interface Supplier {
     id: string;
     name: string;
     contact: string;
     email: string;
     phone: string;
     address?: string;
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
     discountRate: number;
     taxRate: number;
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
     status: 'ordered' | 'partially_received' | 'received' | 'cancelled';
     orderDate: string;
     expectedDeliveryDate?: string;
     actualDeliveryDate?: string;
     totalAmount: number | undefined;
     taxAmount: number | undefined;
     discountAmount: number | undefined;
     shippingCost: number | undefined;
     finalAmount: number | undefined;
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
     paymentHistory?: any[];
     totalPaid?: number;
     totalPending?: number;
     remainingBalance?: number;
     createdAt: string;
     updatedAt: string;
}

const STATUS_BADGES = {
     '': { label: 'Ordered', color: 'secondary' },
     ordered: { label: 'Ordered', color: 'secondary' },
     partially_received: { label: 'Partially Received', color: 'warning' },
     received: { label: 'Received', color: 'success' },
     cancelled: { label: 'Cancelled', color: 'danger' }
};

export default function PurchaseOrdersPage() {
     const router = useRouter();
     const { applicationsettings } = useApplicationSettings();
     const employeeid = applicationsettings?.user?.employeeid;
     const branchid = applicationsettings?.branchid;
     const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
     const [suppliers, setSuppliers] = useState<Supplier[]>([]);
     const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
     const [searchTerm, setSearchTerm] = useState('');
     const [supplierIdFilter, setSupplierIdFilter] = useState('');
     const [orderIdFilter, setOrderIdFilter] = useState('');
     const [showFilterOffcanvas, setShowFilterOffcanvas] = useState(false);
     const [filterStatus, setFilterStatus] = useState<string>('all');
     const [startDateFilter, setStartDateFilter] = useState('');
     const [endDateFilter, setEndDateFilter] = useState('');
     const [refreshTrigger, setRefreshTrigger] = useState(0);
     const [loading, setLoading] = useState(false);
     const [tableRef, setTableRef] = useState(null);

     const [showOrderModal, setShowOrderModal] = useState(false);
     const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null);

     const [showPaymentModal, setShowPaymentModal] = useState(false);
     const [selectedOrderForPayment, setSelectedOrderForPayment] = useState<PurchaseOrder | null>(null);

     const [orderForm, setOrderForm] = useState({
          supplierId: '',
          supplierName: '',
          supplierEmail: '',
          supplierContact: '',
          items: [] as FormOrderItem[],
          expectedDeliveryDate: '',
          notes: '',
          status: 'ordered' as 'ordered' | 'partially_received' | 'received' | 'cancelled',
          communicationMethod: 'email' as 'email' | 'phone_call' | 'whatsapp' | 'pdf_attachment' | 'in_person' | 'fax' | 'other',
          communicationNotes: ''
     });

     const [paymentForm, setPaymentForm] = useState({
          supplier_id: '',
          purchase_order_id: '',
          created_by: '',
          payment_amount: 0,
          payment_date: new Date().toISOString().split('T')[0],
          payment_method: 'bank_transfer',
          reference_number: '',
          payment_notes: ''
     });

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

     const loadInventoryItems = async () => {
          try {
               const response = await customFetch(`inventory/items?branchid=${branchid}&employeeid=${employeeid}`);
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
               const response = await customFetch(`inventory/orders?branchid=${branchid}&employeeid=${employeeid}`);
               if (response.success) {
                    await loadSuppliers();

                    const transformedOrders = response.data.map((order: any) => {
                         const supplier = suppliers.find(s => s.id === order.supplier_id);

                         return {
                              id: order.id,
                              orderNumber: order.order_number || order.id,
                              supplierId: order.supplier_id,
                              supplierName: order.supplier_name || supplier?.name || 'Unknown Supplier',
                              supplierEmail: order.supplier_email || supplier?.email || '',
                              supplierContact: order.supplier_contact || supplier?.contact || '',
                              supplierPhone: order.supplier_phone || supplier?.phone || '',
                              supplierAddress: order.supplier_address || supplier?.address || '',
                              items: order.items || [],
                              status: order.status,
                              orderDate: order.order_date,
                              expectedDeliveryDate: order.expected_delivery_date,
                              actualDeliveryDate: order.actual_delivery_date || null,
                              totalAmount: order.total_amount || 0,
                              taxAmount: order.tax_amount || 0,
                              discountAmount: order.discount_amount || 0,
                              shippingCost: order.shipping_cost || 0,
                              finalAmount: order.final_amount || 0,
                              currency: order.currency || 'GHS',
                              paymentTerms: order.payment_terms || '',
                              notes: order.notes || '',
                              createdBy: order.created_by,
                              approvedBy: order.approved_by || null,
                              approvedAt: order.approved_at || null,
                              sentAt: order.sent_at || null,
                              emailSent: false,
                              emailSentDate: order.sent_at || null,
                              communicationMethod: order.communication_method,
                              communicationNotes: order.communication_notes,
                              items_count: order.items_count || 0,
                              received_items_count: order.received_items_count || 0,
                              paymentHistory: order.payment_history || [],
                              totalPaid: order.total_paid || 0,
                              totalPending: order.total_pending || 0,
                              remainingBalance: order.remaining_balance || 0,
                              createdAt: order.created_at,
                              updatedAt: order.updated_at
                         };
                    });
                    setPurchaseOrders(transformedOrders);
               }
          } catch (err) {
               console.error('Error loading purchase orders:', err);
          } finally {
               setLoading(false);
          }
     };

     const handleServerSideProcessing = async (params: { page: number; count: number; sortby?: string; filters?: any }) => {
          try {
               const { page, count, sortby = 'DESC', filters = {} } = params;

               const queryParams = new URLSearchParams({
                    page: page.toString(),
                    count: count.toString(),
                    sortby: sortby
               });

               // Add existing filters
               Object.keys(filters).forEach(key => {
                    if (filters[key] && filters[key] !== '') {
                         queryParams.append(key, filters[key]);
                    }
               });

               // Add custom filters
               if (searchTerm) queryParams.append('search', searchTerm);
               if (supplierIdFilter) queryParams.append('supplier_id', supplierIdFilter);
               if (orderIdFilter) queryParams.append('order_id', orderIdFilter);
               if (filterStatus !== 'all') queryParams.append('status', filterStatus);
               if (startDateFilter) queryParams.append('start_date', startDateFilter);
               if (endDateFilter) queryParams.append('end_date', endDateFilter);

               // Add required parameters
               queryParams.append('branchid', branchid);
               queryParams.append('employeeid', employeeid);

               const endpoint = `inventory/orders?${queryParams.toString()}`;
               const response = await customFetch(endpoint);

               if (response.success) {
                    if (suppliers.length === 0) {
                         await loadSuppliers();
                    }

                    const ordersData = response?.data || [];

                    const transformedOrders = ordersData.map((order: any) => {
                         const supplier = suppliers.find(s => s.id === order.supplier_id);

                         return {
                              id: order.id,
                              orderNumber: order.order_number || order.id,
                              supplierId: order.supplier_id,
                              supplierName: order.supplier_name || supplier?.name || 'Unknown Supplier',
                              supplierEmail: order.supplier_email || supplier?.email || '',
                              supplierContact: order.supplier_contact || supplier?.contact || '',
                              supplierPhone: order.supplier_phone || supplier?.phone || '',
                              supplierAddress: order.supplier_address || supplier?.address || '',
                              items: order.items || [],
                              status: order.status,
                              orderDate: order.order_date,
                              expectedDeliveryDate: order.expected_delivery_date,
                              actualDeliveryDate: order.actual_delivery_date || null,
                              totalAmount: order.total_amount || 0,
                              taxAmount: order.tax_amount || 0,
                              discountAmount: order.discount_amount || 0,
                              shippingCost: order.shipping_cost || 0,
                              finalAmount: order.final_amount || 0,
                              currency: order.currency || 'GHS',
                              paymentTerms: order.payment_terms || '',
                              notes: order.notes || '',
                              createdBy: order.created_by,
                              approvedBy: order.approved_by || null,
                              approvedAt: order.approved_at || null,
                              sentAt: order.sent_at || null,
                              emailSent: false,
                              emailSentDate: order.sent_at || null,
                              communicationMethod: order.communication_method,
                              communicationNotes: order.communication_notes,
                              items_count: order.items_count || 0,
                              received_items_count: order.received_items_count || 0,
                              paymentHistory: order.payment_history || [],
                              totalPaid: order.total_paid || 0,
                              totalPending: order.total_pending || 0,
                              remainingBalance: order.remaining_balance || 0,
                              createdAt: order.created_at,
                              updatedAt: order.updated_at
                         };
                    });
                    return {
                         result: transformedOrders,
                         error: false,
                         totalRecords: response.data?.total || response.data?.totalRecords || transformedOrders.length
                    };
               } else {
                    return {
                         result: [],
                         error: true,
                         totalRecords: 0
                    };
               }
          } catch (error) {
               console.error('Error in server-side processing:', error);
               return {
                    result: [],
                    error: true,
                    totalRecords: 0
               };
          }
     };

     useEffect(() => {
          if (branchid && employeeid) {
               loadSuppliers();
               loadInventoryItems();
               loadPurchaseOrders();
          }
     }, [branchid, employeeid]);

     // Trigger table refresh when filters change
     useEffect(() => {
          if (refreshTrigger > 0) {
               // Force table to refresh with new filters
               const refreshTable = async () => {
                    try {
                         const result = await handleServerSideProcessing({ page: 1, count: 10, sortby: 'DESC' });
                         if (result && result.result) {
                              setPurchaseOrders(result.result);
                         }
                    } catch (error) {
                         console.error('Error refreshing table with filters:', error);
                    }
               };
               refreshTable();
          }
     }, [refreshTrigger]);

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
                    <span>{row.original.currency} {currencyFormatter.format((value || 0).toFixed(2))}</span>
               )
          },
          {
               Header: 'Remaining Balance',
               accessor: 'remainingBalance',
               Cell: ({ value, row }) => (
                    <span className={`fw-bold ${value > 0 ? 'text-danger' : 'text-success'}`}>
                         {row.original.currency} {currencyFormatter.format((value || 0).toFixed(2))}
                    </span>
               )
          },
          {
               Header: 'Pending Approvals',
               accessor: 'totalPending',
               Cell: ({ value, row }) => (
                    <span className={`fw-bold ${value > 0 ? 'text-warning' : 'text-muted'}`}>
                         {row.original.currency} {currencyFormatter.format((value || 0).toFixed(2))}
                    </span>
               )
          },
          {
               Header: 'Actions',
               accessor: 'id',
               Cell: ({ row }) => (
                    row.original.status !== 'received' ? (
                         <div className="d-flex gap-1">
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
                              {row.original.status !== 'received' && (
                                   <button
                                        className="btn btn-sm btn-outline-danger"
                                        title="Delete Order"
                                        onClick={() => handleDeleteOrder(row.original.id)}
                                   >
                                        <RiDeleteBinLine size={14} />
                                   </button>
                              )}
                         </div>
                    ) : (
                         <div className="d-flex gap-1">
                              {(row.original.totalPending || 0) < (row.original.totalAmount || 0) && (
                                   <button
                                        className="btn btn-sm btn-outline-info"
                                        title="Make Payment"
                                        onClick={() => handleMakePayment(row.original)}
                                   >
                                        Make Payment       <RiMoneyDollarCircleLine size={14} />
                                   </button>
                              )}
                              <span className="text-muted small">
                                   {(row.original.totalPending || 0) >= (row.original.totalAmount || 0) ? 'All payments pending' : 'Completed'}
                              </span>
                         </div>
                    )
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
                         discount_rate: item.discountRate,
                         tax_rate: item.taxRate,
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

     const handleEditOrder = async (order: PurchaseOrder) => {
          if (order.status === 'received' || order.status === 'cancelled') {
               toast.error(`Cannot edit orders with ${order.status} status`);
               return;
          }

          try {
               setLoading(true);

               const response = await customFetch(`inventory/orders/${order.id}?branchid=${branchid}&employeeid=${employeeid}`);

               if (response.success) {
                    const apiOrderData = response.data;

                    const formatDateForInput = (dateString: string | null | undefined): string => {
                         if (!dateString) return '';
                         const date = new Date(dateString);
                         return date.toISOString().split('T')[0];
                    };

                    setOrderForm({
                         supplierId: apiOrderData.supplier_id,
                         supplierName: apiOrderData.supplier_name || '',
                         supplierEmail: apiOrderData.supplier_email || '',
                         supplierContact: apiOrderData.supplier_contact || '',
                         items: apiOrderData.items ? apiOrderData.items.map((item: any) => ({
                              itemId: item.inventory_item_id,
                              itemName: item.item_name,
                              brand: item.brand_name,
                              sku: item.sku,
                              quantity: item.quantity_ordered,
                              unit: item.unit,
                              discountRate: item.discount_rate || 0,
                              taxRate: item.tax_rate || 0,
                              notes: item.notes
                         })) : [],
                         expectedDeliveryDate: formatDateForInput(apiOrderData.expected_delivery_date),
                         notes: apiOrderData.notes || '',
                         status: apiOrderData.status,
                         communicationMethod: apiOrderData.communication_method || 'email',
                         communicationNotes: apiOrderData.communication_notes || ''
                    });

                    const freshOrder: PurchaseOrder = {
                         id: apiOrderData.id,
                         orderNumber: apiOrderData.order_number || apiOrderData.id,
                         supplierId: apiOrderData.supplier_id,
                         supplierName: apiOrderData.supplier_name || '',
                         supplierEmail: apiOrderData.supplier_email || '',
                         supplierContact: apiOrderData.supplier_contact || '',
                         supplierPhone: apiOrderData.supplier_phone || '',
                         supplierAddress: apiOrderData.supplier_address || '',
                         items: apiOrderData.items || [],
                         status: apiOrderData.status,
                         orderDate: apiOrderData.order_date,
                         expectedDeliveryDate: apiOrderData.expected_delivery_date,
                         actualDeliveryDate: apiOrderData.actual_delivery_date || null,
                         totalAmount: apiOrderData.total_amount || 0,
                         taxAmount: apiOrderData.tax_amount || 0,
                         discountAmount: apiOrderData.discount_amount || 0,
                         shippingCost: apiOrderData.shipping_cost || 0,
                         finalAmount: apiOrderData.final_amount || 0,
                         currency: apiOrderData.currency || 'GHS',
                         paymentTerms: apiOrderData.payment_terms || '',
                         notes: apiOrderData.notes || '',
                         createdBy: apiOrderData.created_by,
                         approvedBy: apiOrderData.approved_by || null,
                         approvedAt: apiOrderData.approved_at || null,
                         sentAt: apiOrderData.sent_at || null,
                         emailSent: false,
                         emailSentDate: apiOrderData.sent_at || null,
                         communicationMethod: apiOrderData.communication_method || 'email',
                         communicationNotes: apiOrderData.communication_notes || '',
                         items_count: apiOrderData.items_count || 0,
                         received_items_count: apiOrderData.received_items_count || 0,
                         paymentHistory: apiOrderData.payment_history || [],
                         totalPaid: apiOrderData.total_paid || 0,
                         totalPending: apiOrderData.total_pending || 0,
                         remainingBalance: apiOrderData.remaining_balance || 0,
                         createdAt: apiOrderData.created_at,
                         updatedAt: apiOrderData.updated_at
                    };

                    setSelectedOrder(freshOrder);
                    setShowOrderModal(true);
               } else {
                    toast.error('Failed to load order details for editing');
               }
          } catch (error) {
               console.error('Error loading order for editing:', error);
               toast.error('Failed to load order details for editing');
          } finally {
               setLoading(false);
          }
     };

     const handleUpdateOrder = async () => {
          if (!selectedOrder) return;

          try {
               const orderData = {
                    supplier_id: orderForm.supplierId,
                    expected_delivery_date: orderForm.expectedDeliveryDate || null,
                    items: orderForm.items.map(item => ({
                         inventory_item_id: item.itemId,
                         quantity_ordered: item.quantity,
                         discount_rate: item.discountRate,
                         tax_rate: item.taxRate,
                         notes: item.notes
                    })),
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
          const emailBody = generateOrderEmail(order);
          const mailtoLink = `mailto:${order.supplierEmail}?subject=Purchase Order ${order.orderNumber}&body=${encodeURIComponent(emailBody)}`;

          setPurchaseOrders(prev => prev.map(o =>
               o.id === order.id
                    ? { ...o, emailSent: true, emailSentDate: new Date().toISOString(), communicationMethod: 'email' }
                    : o
          ));

          window.open(mailtoLink, '_blank');

          toast.success(`Email sent to ${order.supplierEmail} for order ${order.orderNumber}`);
     };

     const handleReceiveOrder = (order: PurchaseOrder) => {
          router.push(`/inventory/orders/receive-ordered-items/${order.id}`);
     };

     const handleMakePayment = (order: PurchaseOrder) => {
          setSelectedOrderForPayment(order);
          setPaymentForm({
               supplier_id: order.supplierId,
               purchase_order_id: order.id,
               created_by: employeeid,
               payment_amount: order.totalPending || 0,
               payment_date: new Date().toISOString().split('T')[0],
               payment_method: 'bank_transfer',
               reference_number: '',
               payment_notes: `Payment for purchase order ${order.orderNumber}`
          });
          setShowPaymentModal(true);
     };

     const handleCreatePayment = async () => {
          if (!paymentForm.supplier_id || !paymentForm.purchase_order_id || paymentForm.payment_amount <= 0) {
               toast.error('Please fill in all required payment details');
               return;
          }

          const maxAllowed = selectedOrderForPayment?.totalPending || 0;
          const tentativeRemainingAmount = (selectedOrderForPayment?.totalAmount || 0) - (selectedOrderForPayment?.totalPending || 0);
          if (paymentForm.payment_amount > tentativeRemainingAmount) {
               toast.error(`Payment amount cannot exceed pending payments (${tentativeRemainingAmount.toFixed(2)})`);
               return;
          }

          try {
               setLoading(true);
               const response = await customPost('inventory/supplier-payments/payments', 'POST', paymentForm);

               if (response.success) {
                    toast.success('Payment created successfully!');
                    setShowPaymentModal(false);
                    resetPaymentForm();
               } else {
                    toast.error(`Failed to create payment: ${response.error?.message || 'Unknown error'}`);
               }
          } catch (err) {
               console.error('Error creating payment:', err);
               toast.error('Failed to create payment');
          } finally {
               setLoading(false);
          }
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

          emailBody += `Total Amount: ${order.currency} ${(order.totalAmount || 0).toFixed(2)}\n`;
          emailBody += `Tax: ${order.currency} ${(order.taxAmount || 0).toFixed(2)}\n`;
          emailBody += `Discount: ${order.currency} ${(order.discountAmount || 0).toFixed(2)}\n`;
          emailBody += `Shipping: ${order.currency} ${(order.shippingCost || 0).toFixed(2)}\n`;
          emailBody += `Final Amount: ${order.currency} ${(order.finalAmount || 0).toFixed(2)}\n\n`;

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
               status: 'ordered',
               communicationMethod: 'email',
               communicationNotes: ''
          });
          setSelectedOrder(null);
     };

     const resetPaymentForm = () => {
          setPaymentForm({
               supplier_id: '',
               purchase_order_id: '',
               created_by: '',
               payment_amount: 0,
               payment_date: new Date().toISOString().split('T')[0],
               payment_method: 'bank_transfer',
               reference_number: '',
               payment_notes: ''
          });
          setSelectedOrderForPayment(null);
     };

     const getOrderStats = () => {
          const orderingCount = purchaseOrders.filter(o => o.status === 'ordered' || o.status === 'partially_received').length;
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
                         <button
                              className="btn btn-outline-primary btn-sm"
                              onClick={() => setShowFilterOffcanvas(true)}
                         >
                              <RiFilterLine className="me-1" />
                              Filters
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

               {/* Orders Table */}
               <PrimeTable
                    column={orderColumns}
                    data={purchaseOrders}
                    filtering={true}
                    handleSeverSideProcessing={handleServerSideProcessing}
                    serverSideFiltering={true}
               />

               {/* Filter Offcanvas */}
               <div className={`offcanvas offcanvas-end ${showFilterOffcanvas ? 'show' : ''}`} style={{ visibility: showFilterOffcanvas ? 'visible' : 'hidden' }}>
                    <div className="offcanvas-header">
                         <h5 className="offcanvas-title">
                              <RiFilterLine className="me-2" />
                              Filter Purchase Orders
                         </h5>
                         <button
                              type="button"
                              className="btn-close"
                              onClick={() => setShowFilterOffcanvas(false)}
                         ></button>
                    </div>
                    <div className="offcanvas-body">
                         <div className="mb-3">
                              <label className="form-label">Search</label>
                              <input
                                   type="text"
                                   className="form-control"
                                   placeholder="Search orders..."
                                   value={searchTerm}
                                   onChange={(e) => setSearchTerm(e.target.value.trim())}
                              />
                         </div>
                         <div className="mb-3">
                              <label className="form-label">Supplier ID</label>
                              <input
                                   type="text"
                                   className="form-control"
                                   placeholder="Enter supplier ID..."
                                   value={supplierIdFilter}
                                   onChange={(e) => setSupplierIdFilter(e.target.value.trim())}
                              />
                         </div>
                         <div className="mb-3">
                              <label className="form-label">Order ID</label>
                              <input
                                   type="text"
                                   className="form-control"
                                   placeholder="Enter order ID..."
                                   value={orderIdFilter}
                                   onChange={(e) => setOrderIdFilter(e.target.value.trim())}
                              />
                         </div>
                         <div className="mb-3">
                              <label className="form-label">Status</label>
                              <select
                                   className="form-select"
                                   value={filterStatus}
                                   onChange={(e) => setFilterStatus(e.target.value)}
                              >
                                   <option value="all">All Status</option>
                                   <option value="ordered">Ordered</option>
                                   <option value="partially_received">Partially Received</option>
                                   <option value="received">Received</option>
                                   <option value="cancelled">Cancelled</option>
                              </select>
                         </div>
                         <div className="mb-3">
                              <label className="form-label">Start Date</label>
                              <input
                                   type="date"
                                   className="form-control"
                                   value={startDateFilter}
                                   onChange={(e) => setStartDateFilter(e.target.value)}
                              />
                         </div>
                         <div className="mb-3">
                              <label className="form-label">End Date</label>
                              <input
                                   type="date"
                                   className="form-control"
                                   value={endDateFilter}
                                   onChange={(e) => setEndDateFilter(e.target.value)}
                              />
                         </div>
                    </div>
                    <div className="offcanvas-footer mx-3 py-2">
                         <button
                              type="button"
                              className="btn btn-secondary btn-sm mx-2"
                              onClick={() => {
                                   setSearchTerm('');
                                   setSupplierIdFilter('');
                                   setOrderIdFilter('');
                                   setFilterStatus('all');
                                   setStartDateFilter('');
                                   setEndDateFilter('');
                                   setRefreshTrigger(prev => prev + 1);
                              }}
                         >
                              Clear Filters
                         </button>
                         <button
                              type="button"
                              className="btn btn-primary btn-sm"
                              onClick={() => {
                                   setShowFilterOffcanvas(false);
                                   setRefreshTrigger(prev => prev + 1);
                              }}
                         >
                              Apply Filters
                         </button>
                    </div>
               </div>

               {/* Backdrop for Offcanvas */}
               {showFilterOffcanvas && (
                    <div
                         className="offcanvas-backdrop show"
                         onClick={() => setShowFilterOffcanvas(false)}
                    ></div>
               )}

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
                                                                                unit: 'pieces',
                                                                                discountRate: 0,
                                                                                taxRate: 0
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
                                                  <p><strong>Total Amount:</strong> {selectedOrder.currency} {(selectedOrder.totalAmount || 0).toFixed(2)}</p>
                                                  <p><strong>Tax Amount:</strong> {selectedOrder.currency} {(selectedOrder.taxAmount || 0).toFixed(2)}</p>
                                                  <p><strong>Discount:</strong> {selectedOrder.currency} {(selectedOrder.discountAmount || 0).toFixed(2)}</p>
                                                  <p><strong>Shipping Cost:</strong> {selectedOrder.currency} {(selectedOrder.shippingCost || 0).toFixed(2)}</p>
                                                  <p><strong>Final Amount:</strong> {selectedOrder.currency} {(selectedOrder.finalAmount || 0).toFixed(2)}</p>
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

               {/* Payment Modal */}
               {showPaymentModal && selectedOrderForPayment && (
                    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                         <div className="modal-dialog modal-lg">
                              <div className="modal-content">
                                   <div className="modal-header">
                                        <h5 className="modal-title">
                                             <RiMoneyDollarCircleLine className="me-2" />
                                             Make Payment - Order {selectedOrderForPayment.orderNumber}
                                        </h5>
                                        <button
                                             type="button"
                                             className="btn-close"
                                             onClick={() => {
                                                  setShowPaymentModal(false);
                                                  resetPaymentForm();
                                             }}
                                        ></button>
                                   </div>
                                   <div className="modal-body">
                                        {/* Full Payment Notice */}
                                        {(selectedOrderForPayment?.totalPaid || 0) >= (selectedOrderForPayment?.totalAmount || 0) && (
                                             <div className="alert alert-success mb-4">
                                                  <h6 className="alert-heading mb-2">
                                                       <RiCheckLine size={20} className="me-2" />
                                                       Payment Complete
                                                  </h6>
                                                  <p className="mb-0">
                                                       This order has been fully paid. All payment fields have been disabled.
                                                  </p>
                                             </div>
                                        )}

                                        {/* Payment History */}
                                        {selectedOrderForPayment.paymentHistory && selectedOrderForPayment.paymentHistory.length > 0 && (
                                             <div className="mb-4">
                                                  <h6 className="text-primary mb-3">
                                                       <RiMoneyDollarCircleLine className="me-2" />
                                                       Payment History
                                                  </h6>
                                                  <div className="table-responsive">
                                                       <table className="table table-sm table-striped">
                                                            <thead>
                                                                 <tr>
                                                                      <th>Date</th>
                                                                      <th>Amount</th>
                                                                      <th>Method</th>
                                                                      <th>Status</th>
                                                                      <th>Reference</th>
                                                                 </tr>
                                                            </thead>
                                                            <tbody>
                                                                 {selectedOrderForPayment.paymentHistory.map((payment: any, index: number) => (
                                                                      <tr key={index}>
                                                                           <td>{new Date(payment.payment_date).toLocaleDateString()}</td>
                                                                           <td className="fw-bold">{selectedOrderForPayment.currency} {payment.payment_amount.toFixed(2)}</td>
                                                                           <td>{payment.payment_method.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</td>
                                                                           <td>
                                                                                <span className={`badge bg-${payment.payment_status === 'pending' ? 'warning' : 'success'}`}>
                                                                                     {payment.payment_status}
                                                                                </span>
                                                                           </td>
                                                                           <td>{payment.reference_number || 'N/A'}</td>
                                                                      </tr>
                                                                 ))}
                                                            </tbody>
                                                       </table>
                                                  </div>
                                             </div>
                                        )}

                                        <div className="row">
                                             <div className="col-md-6">
                                                  <div className="mb-3">
                                                       <label className="form-label">Supplier</label>
                                                       <input
                                                            type="text"
                                                            className="form-control"
                                                            value={selectedOrderForPayment.supplierName}
                                                            readOnly
                                                       />
                                                  </div>
                                                  <div className="mb-3">
                                                       <label className="form-label">Purchase Order</label>
                                                       <input
                                                            type="text"
                                                            className="form-control"
                                                            value={selectedOrderForPayment.orderNumber}
                                                            readOnly
                                                       />
                                                  </div>
                                                  <div className="mb-3">
                                                       <label className="form-label">Order Total</label>
                                                       <div className="input-group">
                                                            <span className="input-group-text">{selectedOrderForPayment.currency}</span>
                                                            <input
                                                                 type="text"
                                                                 className="form-control"
                                                                 value={(selectedOrderForPayment.finalAmount || 0).toFixed(2)}
                                                                 readOnly
                                                                 disabled
                                                            />
                                                       </div>
                                                       <small className="text-muted">
                                                            Total: {selectedOrderForPayment.currency} {(selectedOrderForPayment.totalAmount! || 0).toFixed(2)} +
                                                            Tax: {selectedOrderForPayment.currency} {(selectedOrderForPayment.taxAmount! || 0).toFixed(2)} -
                                                            Discount: {selectedOrderForPayment.currency} {(selectedOrderForPayment.discountAmount! || 0).toFixed(2)} +
                                                            Shipping: {selectedOrderForPayment.currency} {(selectedOrderForPayment.shippingCost! || 0).toFixed(2)}
                                                       </small>
                                                  </div>
                                                  <div className="mb-3">
                                                       <label className="form-label">Total Paid</label>
                                                       <div className="input-group">
                                                            <span className="input-group-text">{selectedOrderForPayment.currency}</span>
                                                            <input
                                                                 type="text"
                                                                 className="form-control text-success"
                                                                 value={(selectedOrderForPayment.totalPaid || 0).toFixed(2)}
                                                                 readOnly
                                                                 disabled
                                                            />
                                                       </div>
                                                  </div>
                                                  <div className="mb-3">
                                                       <label className="form-label">Total Pending Payments Awaiting Approval</label>
                                                       <div className="input-group">
                                                            <span className="input-group-text">{selectedOrderForPayment.currency}</span>
                                                            <input
                                                                 type="text"
                                                                 className="form-control text-warning"
                                                                 value={(selectedOrderForPayment.totalPending || 0).toFixed(2)}
                                                                 readOnly
                                                                 disabled
                                                            />
                                                       </div>
                                                       <small className="text-muted">Payments awaiting approval/processing</small>
                                                  </div>
                                                  <div className="mb-3">
                                                       <label className="form-label fw-bold">Remaining Balance to be Paid</label>
                                                       <div className="input-group">
                                                            <span className="input-group-text">{selectedOrderForPayment.currency}</span>
                                                            <input
                                                                 type="text"
                                                                 className="form-control fw-bold text-danger"
                                                                 value={(((selectedOrderForPayment.totalAmount ?? 0) - (selectedOrderForPayment.totalPending ?? 0)) || (selectedOrderForPayment.finalAmount ?? 0)).toFixed(2)}
                                                                 readOnly
                                                                 disabled
                                                            />
                                                       </div>
                                                       <small className="text-muted">
                                                            Amount still owed for this order
                                                       </small>
                                                  </div>
                                                  <div className="mb-3">
                                                       <label className="form-label">Payment Amount *</label>
                                                       <div className="input-group">
                                                            <span className="input-group-text">{selectedOrderForPayment.currency}</span>
                                                            <input
                                                                 type="number"
                                                                 className="form-control"
                                                                 value={paymentForm.payment_amount}
                                                                 onChange={(e) => setPaymentForm(prev => ({ ...prev, payment_amount: parseFloat(e.target.value) || 0 }))}
                                                                 min="0"
                                                                 step="0.01"
                                                                 max={selectedOrderForPayment.totalPending || 0}
                                                                 required
                                                                 disabled={(selectedOrderForPayment?.totalPaid || 0) >= (selectedOrderForPayment?.totalAmount || 0)}
                                                            />
                                                       </div>
                                                       <small className="text-muted">Enter the amount you want to pay now (max: {(selectedOrderForPayment.totalPending || 0).toFixed(2)})</small>
                                                  </div>
                                             </div>
                                             <div className="col-md-6">
                                                  <div className="mb-3">
                                                       <label className="form-label">Payment Date</label>
                                                       <input
                                                            type="date"
                                                            className="form-control"
                                                            value={paymentForm.payment_date}
                                                            disabled
                                                       />
                                                  </div>
                                                  <div className="mb-3">
                                                       <label className="form-label">Payment Method *</label>
                                                       <select
                                                            className="form-select"
                                                            value={paymentForm.payment_method}
                                                            onChange={(e) => setPaymentForm(prev => ({ ...prev, payment_method: e.target.value }))}
                                                            required
                                                            disabled={(selectedOrderForPayment?.totalPaid || 0) >= (selectedOrderForPayment?.totalAmount || 0)}
                                                       >
                                                            <option value="bank_transfer">Bank Transfer</option>
                                                            <option value="cash">Cash</option>
                                                            <option value="check">Check</option>
                                                            <option value="credit_card">Credit Card</option>
                                                            <option value="debit_card">Debit Card</option>
                                                            <option value="wire_transfer">Wire Transfer</option>
                                                            <option value="other">Other</option>
                                                       </select>
                                                  </div>
                                                  <div className="mb-3">
                                                       <label className="form-label">Reference Number</label>
                                                       <input
                                                            type="text"
                                                            className="form-control"
                                                            value={paymentForm.reference_number}
                                                            onChange={(e) => setPaymentForm(prev => ({ ...prev, reference_number: e.target.value }))}
                                                            placeholder="Check number, transaction ID, etc."
                                                            disabled={(selectedOrderForPayment?.totalPaid || 0) >= (selectedOrderForPayment?.totalAmount || 0)}
                                                       />
                                                  </div>
                                             </div>
                                             <div className="col-md-12">
                                                  <div className="mb-3">
                                                       <label className="form-label">Payment Notes</label>
                                                       <textarea
                                                            className="form-control"
                                                            rows={3}
                                                            value={paymentForm.payment_notes}
                                                            onChange={(e) => setPaymentForm(prev => ({ ...prev, payment_notes: e.target.value }))}
                                                            placeholder="Additional payment details..."
                                                            disabled={(selectedOrderForPayment?.totalPaid || 0) >= (selectedOrderForPayment?.totalAmount || 0)}
                                                       />
                                                  </div>
                                             </div>
                                        </div>
                                   </div>
                                   <div className="modal-footer">
                                        <button
                                             type="button"
                                             className="btn btn-secondary btn-sm"
                                             onClick={() => {
                                                  setShowPaymentModal(false);
                                                  resetPaymentForm();
                                             }}
                                             disabled={(selectedOrderForPayment?.totalPaid || 0) >= (selectedOrderForPayment?.totalAmount || 0)}
                                        >
                                             Cancel
                                        </button>
                                        <button
                                             type="button"
                                             className="btn btn-success btn-sm"
                                             onClick={handleCreatePayment}
                                             disabled={loading || (selectedOrderForPayment?.totalPaid || 0) >= (selectedOrderForPayment?.totalAmount || 0)}
                                        >
                                             {loading ? 'Creating Payment...' : 'Create Payment'}
                                        </button>
                                   </div>
                              </div>
                         </div>
                    </div>
               )}

          </div>
     );
}