'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { RiArrowLeftLine, RiFileTextLine } from '@remixicon/react';
import { toast } from 'react-toastify';
import { customPost, customFetch, customFile, currencyFormatter } from '../../../../../components/Auth/customFetch';
import { useApplicationSettings } from '../../../../../components/Auth/useApplicationContext';
import { InventoryItem, ReceivedItem, PurchaseOrder } from './types';

export default function ReceiveOrderedItemsPage() {
     const params = useParams();
     const router = useRouter();
     const orderId = params?.orderid as string;
     const { applicationsettings } = useApplicationSettings();
     const { branchid, user } = applicationsettings || {};
     const employeeid = user?.employeeid;

     const [order, setOrder] = useState<PurchaseOrder | null>(null);
     const [loading, setLoading] = useState(true);
     const [submitting, setSubmitting] = useState(false);
     const [viewMode, setViewMode] = useState<'list' | 'table'>('table');

     const [receiveForm, setReceiveForm] = useState({
          invoiceNumber: '',
          receivedDate: new Date().toISOString().split('T')[0],
          receivedTime: new Date().toTimeString().slice(0, 5),
          notes: '',
          receiptImages: [] as File[],
          conditionStatus: 'good',
          qualityCheckPassed: true,
          items: [] as ReceivedItem[]
     });

     useEffect(() => {
          if (orderId && branchid && employeeid) {
               loadOrderDetails();
          }
     }, [orderId, branchid, employeeid]);

     const loadOrderDetails = async () => {
          try {
               // Use the specific order ID endpoint as requested
               const response = await customFetch(`inventory/orders/${orderId}?branchid=${branchid}&employeeid=${employeeid}`);

               if (response.success) {
                    const apiOrderData = response.data;

                    // Map API response (snake_case) to our interface (camelCase)
                    const orderData: PurchaseOrder = {
                         id: apiOrderData.id,
                         orderNumber: apiOrderData.order_number || apiOrderData.id,
                         supplierId: apiOrderData.supplier_id,
                         supplierName: apiOrderData.supplier?.name || apiOrderData.supplier_name || 'Unknown Supplier',
                         supplierEmail: apiOrderData.supplier?.email || apiOrderData.supplier_email || '',
                         supplierContact: apiOrderData.supplier?.contact || apiOrderData.supplier_contact || '',
                         supplierPhone: apiOrderData.supplier?.phone || apiOrderData.supplier_phone || '',
                         supplierAddress: apiOrderData.supplier?.address || apiOrderData.supplier_address || '',
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
                         paymentTerms: apiOrderData.payment_terms,
                         notes: apiOrderData.notes,
                         createdBy: apiOrderData.created_by,
                         approvedBy: apiOrderData.approved_by || null,
                         approvedAt: apiOrderData.approved_at || null,
                         sentAt: apiOrderData.sent_at || null,
                         communicationMethod: apiOrderData.communication_method,
                         communicationNotes: apiOrderData.communication_notes,
                         createdAt: apiOrderData.created_at,
                         updatedAt: apiOrderData.updated_at,
                         itemsCount: apiOrderData.items_count || 0,
                         receivedItemsCount: apiOrderData.received_items_count || 0
                    };

                    setOrder(orderData);
                    const initialItems: ReceivedItem[] = orderData.items.map((item: any) => ({
                         id: item.id,
                         itemId: item.inventory_item_id,
                         itemName: item.item_name,
                         brand: item.brand_name,
                         selectedBrand: item.brand_name || '',
                         sku: item.item_sku,
                         orderedQuantity: item.quantity_ordered,
                         quantityReceived: item.quantity_received || 0,
                         receivedQuantity: 0,
                         remainingQuantity: item.quantity_ordered - (item.quantity_received || 0),
                         unitPrice: item.unit_price || 0,
                         discountRate: item.discount_rate || 0,
                         taxRate: item.tax_rate || 0,
                         batchNumber: '',
                         expiryDate: '',
                         unit: item.unit || 'units',
                         totalValue: 0,
                         availableBrands: [],
                         status: item.status || 'ordered'
                    }));
                    setReceiveForm(prev => ({ ...prev, items: initialItems }));

                    // Load brands for all items
                    await loadBrandsForItems(initialItems);
               }
          } catch (error) {
               console.error('Error loading order:', error);
               toast.error('Error loading order details');
          } finally {
               setLoading(false);
          }
     };

     const loadBrandsForItems = async (items: ReceivedItem[]) => {
          try {
               // Load brands for each item in parallel
               const brandPromises = items.map(async (item) => {
                    try {
                         const response = await customFetch(`inventory/brands?inventory_item_id=${item.itemId}&branchid=${branchid}&employeeid=${employeeid}`);
                         if (response.success) {
                              return {
                                   itemId: item.itemId,
                                   brands: response.data || []
                              };
                         }
                         return {
                              itemId: item.itemId,
                              brands: []
                         };
                    } catch (error) {
                         console.error(`Error loading brands for item ${item.itemId}:`, error);
                         return {
                              itemId: item.itemId,
                              brands: []
                         };
                    }
               });

               const brandResults = await Promise.all(brandPromises);

               // Update items with loaded brands
               setReceiveForm(prev => ({
                    ...prev,
                    items: prev.items.map(item => {
                         const brandResult = brandResults.find(result => result.itemId === item.itemId);
                         const availableBrands = brandResult ? brandResult.brands.map((brand: any) => brand.name) : [];
                         let selectedBrand = item.selectedBrand || '';

                         // Auto-select brand if:
                         // 1. Only one brand is available, or
                         // 2. The ordered brand matches one of the available brands
                         if (!selectedBrand && availableBrands.length > 0) {
                              if (availableBrands.length === 1) {
                                   selectedBrand = availableBrands[0];
                              } else if (item.brand && availableBrands.includes(item.brand)) {
                                   selectedBrand = item.brand;
                              }
                         }

                         return {
                              ...item,
                              availableBrands,
                              selectedBrand
                         };
                    })
               }));
          } catch (error) {
               console.error('Error loading brands for items:', error);
               // Don't show error toast as this is not critical functionality
          }
     };

     const handleProcessReceiving = async () => {
          if (!receiveForm.invoiceNumber || !receiveForm.receivedDate || !receiveForm.receivedTime) {
               toast.error('Please fill in all required fields');
               return;
          }

          const itemsToReceive = receiveForm.items.filter(item => item.status !== 'received');
          const completedItems = itemsToReceive.filter(item =>
               item.receivedQuantity > 0 && item.unitPrice > 0 && item.batchNumber && item.expiryDate
          );

          const itemsWithQuantity = itemsToReceive.filter(item => item.receivedQuantity > 0);
          const invalidItems = itemsWithQuantity.filter(item =>
               !item.unitPrice || !item.batchNumber || !item.expiryDate
          );

          if (invalidItems.length > 0) {
               toast.error('Please complete all required fields for items with received quantity > 0');
               return;
          }

          setSubmitting(true);
          try {
               const payload = {
                    received_by: employeeid,
                    received_date: receiveForm.receivedDate,
                    receipts: receiveForm.items.map(item => ({
                         order_item_id: item.id,
                         quantity_received: item.receivedQuantity,
                         discount_rate: item.discountRate,
                         tax_rate: item.taxRate,
                         batch_number: item.batchNumber,
                         expiry_date: item.expiryDate,
                         unit_price: item.unitPrice,
                         condition_status: receiveForm.conditionStatus,
                         quality_check_passed: receiveForm.qualityCheckPassed,
                         notes: receiveForm.notes || "Received in good condition"
                    })).filter(item => item.quantity_received > 0),
               };

               if (payload.receipts.length === 0) {
                    toast.error('No items to receive. Please enter received quantities.');
                    setSubmitting(false);
                    return;
               }

               const response = await customPost(`inventory/orders/${orderId}/receive`, 'POST', payload);
               if (response.success) {
                    toast.success('Items received successfully!');

                    // Upload receipt images if any were selected
                    if (receiveForm.receiptImages.length > 0) {
                         await uploadReceiptImages(response.data);
                    }

                    // router.push('/inventory/orders');
               } else {
                    toast.error(response.message || 'Failed to process receiving');
               }
          } catch (error) {
               console.error('Error processing receiving:', error);
               toast.error('Error processing receiving');
          } finally {
               setSubmitting(false);
          }
     };

     const uploadReceiptImages = async (responseData: any) => {
          try {
               // Extract receipt IDs from the response
               // Assuming the response contains receipt information
               const receipts = responseData?.receipts || responseData?.data?.receipts || [];
               const receiptIds = receipts.map((receipt: any) => receipt.id || receipt.receipt_id);

               if (receiptIds.length === 0) {
                    console.warn('No receipt IDs found in response, skipping image upload');
                    return;
               }

               // Upload images for each receipt
               const uploadPromises = receiptIds.map(async (receiptId: string) => {
                    const formData = new FormData();
                    receiveForm.receiptImages.forEach((file) => {
                         formData.append('images', file);
                    });

                    try {
                         const result = await customFile(`receipts/${receiptId}/upload-image`, formData);
                         if (!result.success) {
                              console.error(`Failed to upload images for receipt ${receiptId}:`, result.message);
                         }
                         return result;
                    } catch (error) {
                         console.error(`Error uploading images for receipt ${receiptId}:`, error);
                         return { success: false, error: error };
                    }
               });

               const uploadResults = await Promise.all(uploadPromises);
               const successfulUploads = uploadResults.filter(result => result.success).length;

               if (successfulUploads === receiptIds.length) {
                    toast.success(`Receipt images uploaded successfully for ${successfulUploads} receipt(s)`);
               } else if (successfulUploads > 0) {
                    toast.warning(`Images uploaded for ${successfulUploads}/${receiptIds.length} receipts`);
               } else {
                    toast.error('Failed to upload receipt images');
               }
          } catch (error) {
               console.error('Error uploading receipt images:', error);
               toast.error('Error uploading receipt images');
          }
     };

     if (loading) {
          return (
               <div className="min-vh-100 bg-light d-flex align-items-center justify-content-center">
                    <div className="text-center">
                         <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }} role="status">
                              <span className="visually-hidden">Loading...</span>
                         </div>
                         <div className="mt-3">
                              <h5 className="text-muted">Loading Order Details...</h5>
                              <small className="text-muted">Please wait while we fetch the order information</small>
                         </div>
                    </div>
               </div>
          );
     }

     if (!order) {
          return (
               <div className="min-vh-100 bg-light d-flex align-items-center justify-content-center">
                    <div className="text-center">
                         <div className="alert alert-warning shadow-sm" role="alert">
                              <RiFileTextLine size={48} className="text-warning mb-3" />
                              <h5 className="alert-heading">Order Not Found</h5>
                              <p className="mb-3">The requested order could not be found or has been deleted.</p>
                              <button
                                   className="btn btn-outline-primary"
                                   onClick={() => router.push('/inventory/orders')}
                              >
                                   <RiArrowLeftLine className="me-2" />
                                   Back to Orders
                              </button>
                         </div>
                    </div>
               </div>
          );
     }

     const totalReceived = receiveForm.items.reduce((sum, item) => sum + item.totalValue, 0);
     const completedItems = receiveForm.items.filter(item => {
          // Items with quantity_received = 0 are considered completed
          const remaining = item.orderedQuantity - item.quantityReceived;
          if (item.receivedQuantity === 0 && remaining === 0) return true;
          // Items with quantity_received > 0 must have all required fields
          return item.receivedQuantity > 0 && item.unitPrice > 0 && item.batchNumber && item.expiryDate;
     }).length;
     const fullyReceivedItems = receiveForm.items.filter(item => item.status === 'received').length;
     const totalItemsToReceive = receiveForm.items.length - fullyReceivedItems; return (
          <div className="container-fluid py-4">
               <div className="row">
                    <div className="col-12">
                         <div className="card shadow-sm" style={{ margin: 0 }}>
                              <div className="card-header d-flex align-items-center justify-content-between">
                                   <div className="d-flex align-items-center">
                                        <button
                                             className="btn btn-link text-primary p-0 me-3"
                                             onClick={() => router.push('/inventory/orders')}
                                        >
                                             <RiArrowLeftLine size={20} />
                                        </button>
                                        <div className="me-3">
                                             <h5 className="mb-1">Receive Ordered Items</h5>
                                             <small className="text-muted">
                                                  Order #{order?.orderNumber} | Expected: {order?.expectedDeliveryDate ? new Date(order.expectedDeliveryDate).toLocaleDateString() : 'N/A'}
                                             </small>
                                        </div>
                                        <div className="badge bg-info me-2">
                                             <strong>Progress:</strong> {completedItems} / {totalItemsToReceive} items completed
                                        </div>
                                        <div className="border border-success fw-bold px-2 py-1">
                                             <strong>Total:</strong> {currencyFormatter.format(totalReceived)}
                                        </div>
                                   </div>
                                   <div className="d-flex gap-2">
                                        <button
                                             className="btn btn-secondary btn-sm"
                                             onClick={() => router.push('/inventory/orders')}
                                        >
                                             Cancel
                                        </button>
                                        <button
                                             className="btn btn-primary btn-sm"
                                             onClick={handleProcessReceiving}
                                             disabled={submitting || totalItemsToReceive === 0 || (() => {
                                                  const itemsWithQuantity = receiveForm.items.filter(item => item.receivedQuantity > 0 && item.status !== 'received');
                                                  const invalidItems = itemsWithQuantity.filter(item =>
                                                       !item.unitPrice || !item.batchNumber || !item.expiryDate
                                                  );
                                                  return invalidItems.length > 0;
                                             })()}
                                        >
                                             {submitting ? (
                                                  <>
                                                       <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                                       Processing...
                                                  </>
                                             ) : (
                                                  receiveForm.receiptImages.length > 0
                                                       ? 'Process Receiving & Upload Images'
                                                       : 'Process Receiving'
                                             )}
                                        </button>
                                   </div>
                              </div>
                              <div className="card-header bg-light border-top">
                                   <div className="d-flex flex-wrap align-items-center gap-3">
                                        <div>
                                             <strong className="small">Status:</strong>
                                             <span className={`badge ms-2 small ${order.status === 'ordered' ? 'bg-warning' : 'bg-secondary'}`}>
                                                  {order.status}
                                             </span>
                                        </div>
                                        <div>
                                             <strong className="small">Supplier:</strong> <span className="small">{order.supplierName}</span>
                                        </div>
                                        <div>
                                             <strong className="small">Contact:</strong> <span className="small">{order.supplierContact || 'N/A'}</span>
                                        </div>
                                        <div>
                                             <strong className="small">Email:</strong> <span className="small">{order.supplierEmail || 'N/A'}</span>
                                        </div>
                                        <div>
                                             <strong className="small">Phone:</strong> <span className="small">{order.supplierPhone || 'N/A'}</span>
                                        </div>
                                        <div>
                                             <strong className="small">Order Date:</strong> <span className="small">{new Date(order.orderDate).toLocaleDateString()}</span>
                                        </div>
                                        <div>
                                             <strong className="small">Items Count:</strong> <span className="small">{order.itemsCount}</span>
                                        </div>
                                        <div>
                                             <strong className="small">Received:</strong> <span className="small">{order.receivedItemsCount || 0}</span>
                                        </div>
                                   </div>
                              </div>
                              <div className="card-body">
                                   <div className="mb-4">
                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                             <h6 className="text-muted mb-0">Items to Receive</h6>
                                             <div className="btn-group btn-group-sm" role="group">
                                                  <button
                                                       type="button"
                                                       className={`btn ${viewMode === 'list' ? 'btn-primary' : 'btn-outline-primary'}`}
                                                       onClick={() => setViewMode('list')}
                                                  >
                                                       List
                                                  </button>
                                                  <button
                                                       type="button"
                                                       className={`btn ${viewMode === 'table' ? 'btn-primary' : 'btn-outline-primary'}`}
                                                       onClick={() => setViewMode('table')}
                                                  >
                                                       Table
                                                  </button>
                                             </div>
                                        </div>

                                        {viewMode === 'list' ? (
                                             <div className="list-group">
                                                  {receiveForm.items.map((item, index) => (
                                                       <div key={item.itemId} className="list-group-item">
                                                            <div className="d-flex justify-content-between align-items-start mb-2">
                                                                 <div className="flex-grow-1">
                                                                      <h6 className="mb-1">
                                                                           <strong>{item.itemName}</strong>
                                                                           <small className="text-muted ms-2">({item.unit})</small>
                                                                           <span className={`badge ms-2 small ${item.status === 'received' ? 'bg-success' : item.status === 'partially_received' ? 'bg-warning' : 'bg-secondary'}`}>
                                                                                {item.status.replace('_', ' ')}
                                                                           </span>
                                                                      </h6>
                                                                      <small className="text-muted">SKU: {item.sku} | Ordered: {item.orderedQuantity}</small>
                                                                      <div className="mt-1">
                                                                           <small className="text-info">Received: {item.quantityReceived} | Remaining: {item.remainingQuantity}</small>
                                                                      </div>
                                                                 </div>
                                                                 <div className="text-end">
                                                                      <strong className="text-success">{currencyFormatter.format(item.totalValue)}</strong>
                                                                 </div>
                                                            </div>

                                                            <div className="row g-1">
                                                                 <div className="col-3">
                                                                      <label className="form-label small">Brand</label>
                                                                      <select
                                                                           className="form-select form-select-sm"
                                                                           value={item.selectedBrand || ''}
                                                                           disabled={item.status === 'received'}
                                                                           onChange={(e) => {
                                                                                const value = e.target.value;
                                                                                setReceiveForm(prev => {
                                                                                     const newItems = [...prev.items];
                                                                                     newItems[index].selectedBrand = value;
                                                                                     return { ...prev, items: newItems };
                                                                                });
                                                                           }}
                                                                      >
                                                                           <option value="">Select Brand</option>
                                                                           {item.availableBrands && item.availableBrands.map((brand, brandIndex) => (
                                                                                <option key={brandIndex} value={brand}>{brand}</option>
                                                                           ))}
                                                                      </select>
                                                                 </div>
                                                                 <div className="col-2">
                                                                      <label className="form-label small">Qty <span className="text-danger">*</span></label>
                                                                      <input
                                                                           type="number"
                                                                           className="form-control form-control-sm"
                                                                           min="0"
                                                                           max={item.remainingQuantity}
                                                                           value={item.receivedQuantity}
                                                                           disabled={item.status === 'received'}
                                                                           onChange={(e) => {
                                                                                const value = parseInt(e.target.value) || 0;
                                                                                setReceiveForm(prev => {
                                                                                     const newItems = [...prev.items];
                                                                                     newItems[index].receivedQuantity = value;
                                                                                     newItems[index].totalValue = value * newItems[index].unitPrice;
                                                                                     return { ...prev, items: newItems };
                                                                                });
                                                                           }}
                                                                      />
                                                                 </div>
                                                                 <div className="col-2">
                                                                      <label className="form-label small">Price <span className="text-danger">*</span></label>
                                                                      <input
                                                                           type="number"
                                                                           className="form-control form-control-sm"
                                                                           min="0"
                                                                           step="0.01"
                                                                           value={item.unitPrice}
                                                                           disabled={item.status === 'received'}
                                                                           onChange={(e) => {
                                                                                const value = parseFloat(e.target.value) || 0;
                                                                                setReceiveForm(prev => {
                                                                                     const newItems = [...prev.items];
                                                                                     newItems[index].unitPrice = value;
                                                                                     newItems[index].totalValue = newItems[index].receivedQuantity * value;
                                                                                     return { ...prev, items: newItems };
                                                                                });
                                                                           }}
                                                                      />
                                                                 </div>
                                                                 <div className="col-1">
                                                                      <label className="form-label small">Disc %</label>
                                                                      <input
                                                                           type="number"
                                                                           className="form-control form-control-sm"
                                                                           min="0"
                                                                           step="0.01"
                                                                           value={item.discountRate}
                                                                           disabled={item.status === 'received'}
                                                                           onChange={(e) => {
                                                                                const value = parseFloat(e.target.value) || 0;
                                                                                setReceiveForm(prev => {
                                                                                     const newItems = [...prev.items];
                                                                                     newItems[index].discountRate = value;
                                                                                     return { ...prev, items: newItems };
                                                                                });
                                                                           }}
                                                                      />
                                                                 </div>
                                                                 <div className="col-1">
                                                                      <label className="form-label small">Tax %</label>
                                                                      <input
                                                                           type="number"
                                                                           className="form-control form-control-sm"
                                                                           min="0"
                                                                           step="0.01"
                                                                           value={item.taxRate}
                                                                           disabled={item.status === 'received'}
                                                                           onChange={(e) => {
                                                                                const value = parseFloat(e.target.value) || 0;
                                                                                setReceiveForm(prev => {
                                                                                     const newItems = [...prev.items];
                                                                                     newItems[index].taxRate = value;
                                                                                     return { ...prev, items: newItems };
                                                                                });
                                                                           }}
                                                                      />
                                                                 </div>
                                                                 <div className="col-2">
                                                                      <label className="form-label small">Batch <span className="text-danger">*</span></label>
                                                                      <input
                                                                           type="text"
                                                                           className="form-control form-control-sm"
                                                                           value={item.batchNumber}
                                                                           disabled={item.status === 'received'}
                                                                           onChange={(e) => {
                                                                                const value = e.target.value;
                                                                                setReceiveForm(prev => {
                                                                                     const newItems = [...prev.items];
                                                                                     newItems[index].batchNumber = value;
                                                                                     return { ...prev, items: newItems };
                                                                                });
                                                                           }}
                                                                           placeholder="Batch #"
                                                                      />
                                                                 </div>
                                                                 <div className="col-1">
                                                                      <label className="form-label small">Expiry <span className="text-danger">*</span></label>
                                                                      <input
                                                                           type="date"
                                                                           className="form-control form-control-sm"
                                                                           value={item.expiryDate}
                                                                           disabled={item.status === 'received'}
                                                                           onChange={(e) => {
                                                                                const value = e.target.value;
                                                                                setReceiveForm(prev => {
                                                                                     const newItems = [...prev.items];
                                                                                     newItems[index].expiryDate = value;
                                                                                     return { ...prev, items: newItems };
                                                                                });
                                                                           }}
                                                                      />
                                                                 </div>
                                                            </div>
                                                            <div className="row g-1 mt-2">
                                                                 <div className="col-8">
                                                                      {item.availableBrands && item.availableBrands.length > 0 && (
                                                                           <small className="text-info">
                                                                                Brands: {item.availableBrands.join(', ')}
                                                                           </small>
                                                                      )}
                                                                 </div>
                                                                 <div className="col-4 text-end">
                                                                      <div className="d-flex gap-1 justify-content-end">
                                                                           <button
                                                                                className="btn btn-outline-secondary btn-sm"
                                                                                disabled={item.status === 'received'}
                                                                                onClick={() => {
                                                                                     setReceiveForm(prev => {
                                                                                          const newItems = [...prev.items];
                                                                                          newItems[index].receivedQuantity = item.remainingQuantity;
                                                                                          newItems[index].totalValue = item.remainingQuantity * newItems[index].unitPrice;
                                                                                          return { ...prev, items: newItems };
                                                                                     });
                                                                                }}
                                                                                title="Receive remaining quantity"
                                                                           >
                                                                                Receive All
                                                                           </button>
                                                                           <button
                                                                                className="btn btn-outline-danger btn-sm"
                                                                                disabled={item.status === 'received'}
                                                                                onClick={() => {
                                                                                     setReceiveForm(prev => {
                                                                                          const newItems = [...prev.items];
                                                                                          newItems[index].receivedQuantity = 0;
                                                                                          newItems[index].unitPrice = 0;
                                                                                          newItems[index].discountRate = 0;
                                                                                          newItems[index].taxRate = 0;
                                                                                          newItems[index].batchNumber = '';
                                                                                          newItems[index].expiryDate = '';
                                                                                          newItems[index].totalValue = 0;
                                                                                          return { ...prev, items: newItems };
                                                                                     });
                                                                                }}
                                                                                title="Clear all fields"
                                                                           >
                                                                                Clear
                                                                           </button>
                                                                      </div>
                                                                 </div>
                                                            </div>
                                                       </div>
                                                  ))}
                                             </div>
                                        ) : (
                                             <div className="table-responsive">
                                                  <table className="table table-striped table-hover">
                                                       <thead className="table-light">
                                                            <tr>
                                                                 <th style={{ width: '20%' }}>Item</th>
                                                                 <th style={{ width: '5%' }}>Status</th>
                                                                 <th style={{ width: '8%' }}>Progress</th>
                                                                 <th style={{ width: '12%' }}>Brand</th>
                                                                 <th style={{ width: '8%' }}>Receive Qty</th>
                                                                 <th style={{ width: '8%' }}>Unit Price</th>
                                                                 <th style={{ width: '6%' }}>Discount</th>
                                                                 <th style={{ width: '6%' }}>Tax</th>
                                                                 <th style={{ width: '10%' }}>Batch</th>
                                                                 <th style={{ width: '10%' }}>Expiry</th>
                                                                 <th style={{ width: '8%' }}>Total</th>
                                                            </tr>
                                                       </thead>
                                                       <tbody>
                                                            {receiveForm.items.map((item, index) => (
                                                                 <tr key={item.itemId}>
                                                                      <td>
                                                                           <div>
                                                                                <strong>{item.itemName}</strong>
                                                                                <br />
                                                                                <small className="text-muted">
                                                                                     {item.unit} | SKU: {item.sku}
                                                                                </small>
                                                                                {item.availableBrands && item.availableBrands.length > 0 && (
                                                                                     <>
                                                                                          <br />
                                                                                          <small className="text-info">
                                                                                               {item.availableBrands.length} brand{item.availableBrands.length > 1 ? 's' : ''} available
                                                                                          </small>
                                                                                     </>
                                                                                )}
                                                                           </div>
                                                                      </td>
                                                                      <td>
                                                                           <span className={`badge ${item.status === 'received' ? 'bg-success' : item.status === 'partially_received' ? 'bg-warning' : 'bg-secondary'}`}>
                                                                                {item.status === 'partially_received' ? 'Partial' : item.status === 'received' ? 'Done' : 'Pending'}
                                                                           </span>
                                                                      </td>
                                                                      <td className="text-center">
                                                                           <div className="small">
                                                                                <div className="fw-bold">{item.quantityReceived}/{item.orderedQuantity}</div>
                                                                                <div className="text-muted">({item.remainingQuantity} left)</div>
                                                                           </div>
                                                                      </td>
                                                                      <td>
                                                                           <select
                                                                                className="form-select form-select-sm"
                                                                                value={item.selectedBrand || ''}
                                                                                disabled={item.status === 'received'}
                                                                                onChange={(e) => {
                                                                                     const value = e.target.value;
                                                                                     setReceiveForm(prev => {
                                                                                          const newItems = [...prev.items];
                                                                                          newItems[index].selectedBrand = value;
                                                                                          return { ...prev, items: newItems };
                                                                                     });
                                                                                }}
                                                                           >
                                                                                <option value="">Select Brand</option>
                                                                                {item.availableBrands && item.availableBrands.map((brand, brandIndex) => (
                                                                                     <option key={brandIndex} value={brand}>{brand}</option>
                                                                                ))}
                                                                           </select>
                                                                      </td>
                                                                      <td>
                                                                           <input
                                                                                type="number"
                                                                                className="form-control form-control-sm"
                                                                                min="0"
                                                                                max={item.remainingQuantity}
                                                                                value={item.receivedQuantity}
                                                                                disabled={item.status === 'received'}
                                                                                onChange={(e) => {
                                                                                     const value = parseInt(e.target.value) || 0;
                                                                                     setReceiveForm(prev => {
                                                                                          const newItems = [...prev.items];
                                                                                          newItems[index].receivedQuantity = value;
                                                                                          newItems[index].totalValue = value * newItems[index].unitPrice;
                                                                                          return { ...prev, items: newItems };
                                                                                     });
                                                                                }}
                                                                           />
                                                                      </td>
                                                                      <td>
                                                                           <input
                                                                                type="number"
                                                                                className="form-control form-control-sm"
                                                                                min="0"
                                                                                step="0.01"
                                                                                value={item.unitPrice}
                                                                                disabled={item.status === 'received'}
                                                                                onChange={(e) => {
                                                                                     const value = parseFloat(e.target.value) || 0;
                                                                                     setReceiveForm(prev => {
                                                                                          const newItems = [...prev.items];
                                                                                          newItems[index].unitPrice = value;
                                                                                          newItems[index].totalValue = newItems[index].receivedQuantity * value;
                                                                                          return { ...prev, items: newItems };
                                                                                     });
                                                                                }}
                                                                           />
                                                                      </td>
                                                                      <td>
                                                                           <input
                                                                                type="number"
                                                                                className="form-control form-control-sm"
                                                                                min="0"
                                                                                step="0.01"
                                                                                value={item.discountRate}
                                                                                disabled={item.status === 'received'}
                                                                                onChange={(e) => {
                                                                                     const value = parseFloat(e.target.value) || 0;
                                                                                     setReceiveForm(prev => {
                                                                                          const newItems = [...prev.items];
                                                                                          newItems[index].discountRate = value;
                                                                                          return { ...prev, items: newItems };
                                                                                     });
                                                                                }}
                                                                           />
                                                                      </td>
                                                                      <td>
                                                                           <input
                                                                                type="number"
                                                                                className="form-control form-control-sm"
                                                                                min="0"
                                                                                step="0.01"
                                                                                value={item.taxRate}
                                                                                disabled={item.status === 'received'}
                                                                                onChange={(e) => {
                                                                                     const value = parseFloat(e.target.value) || 0;
                                                                                     setReceiveForm(prev => {
                                                                                          const newItems = [...prev.items];
                                                                                          newItems[index].taxRate = value;
                                                                                          return { ...prev, items: newItems };
                                                                                     });
                                                                                }}
                                                                           />
                                                                      </td>
                                                                      <td>
                                                                           <input
                                                                                type="text"
                                                                                className="form-control form-control-sm"
                                                                                value={item.batchNumber}
                                                                                disabled={item.status === 'received'}
                                                                                onChange={(e) => {
                                                                                     const value = e.target.value;
                                                                                     setReceiveForm(prev => {
                                                                                          const newItems = [...prev.items];
                                                                                          newItems[index].batchNumber = value;
                                                                                          return { ...prev, items: newItems };
                                                                                     });
                                                                                }}
                                                                                placeholder="Batch #"
                                                                           />
                                                                      </td>
                                                                      <td>
                                                                           <input
                                                                                type="date"
                                                                                className="form-control form-control-sm"
                                                                                value={item.expiryDate}
                                                                                disabled={item.status === 'received'}
                                                                                onChange={(e) => {
                                                                                     const value = e.target.value;
                                                                                     setReceiveForm(prev => {
                                                                                          const newItems = [...prev.items];
                                                                                          newItems[index].expiryDate = value;
                                                                                          return { ...prev, items: newItems };
                                                                                     });
                                                                                }}
                                                                           />
                                                                      </td>
                                                                      <td className="text-end">
                                                                           <strong className="text-success">{currencyFormatter.format(item.totalValue)}</strong>
                                                                      </td>
                                                                 </tr>
                                                            ))}
                                                       </tbody>
                                                  </table>
                                             </div>
                                        )}
                                   </div>
                              </div>
                              <div className='border-top p-2'>
                                   <div className=''>Receiving Details</div>
                              </div>
                              <div className="card-body border-top">
                                   <div className="row g-3">
                                        <div className="col-md-3">
                                             <label className="form-label">Invoice Number <span className="text-danger">*</span></label>
                                             <input
                                                  type="text"
                                                  className="form-control"
                                                  value={receiveForm.invoiceNumber}
                                                  onChange={(e) => setReceiveForm(prev => ({ ...prev, invoiceNumber: e.target.value }))}
                                                  placeholder="Enter invoice number"
                                             />
                                        </div>
                                        <div className="col-md-2">
                                             <label className="form-label">Received Date <span className="text-danger">*</span></label>
                                             <input
                                                  type="date"
                                                  className="form-control"
                                                  value={receiveForm.receivedDate}
                                                  onChange={(e) => setReceiveForm(prev => ({ ...prev, receivedDate: e.target.value }))}
                                             />
                                        </div>
                                        <div className="col-md-2">
                                             <label className="form-label">Received Time <span className="text-danger">*</span></label>
                                             <input
                                                  type="time"
                                                  className="form-control"
                                                  value={receiveForm.receivedTime}
                                                  onChange={(e) => setReceiveForm(prev => ({ ...prev, receivedTime: e.target.value }))}
                                             />
                                        </div>
                                        <div className="col-md-2">
                                             <label className="form-label">Condition Status</label>
                                             <select
                                                  className="form-select"
                                                  value={receiveForm.conditionStatus}
                                                  onChange={(e) => setReceiveForm(prev => ({ ...prev, conditionStatus: e.target.value }))}
                                             >
                                                  <option value="good">Good</option>
                                                  <option value="acceptable">Acceptable</option>
                                                  <option value="damaged">Damaged</option>
                                                  <option value="expired">Expired</option>
                                             </select>
                                        </div>
                                        <div className="col-md-3">
                                             <label className="form-label">Receipt Images</label>
                                             <input
                                                  type="file"
                                                  className="form-control"
                                                  multiple
                                                  accept="image/*"
                                                  onChange={(e) => {
                                                       const files = Array.from(e.target.files || []);
                                                       // Validate file types and sizes
                                                       const validFiles = files.filter(file => {
                                                            const isValidType = file.type.startsWith('image/');
                                                            const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB limit
                                                            return isValidType && isValidSize;
                                                       });

                                                       if (validFiles.length !== files.length) {
                                                            toast.warning('Some files were skipped. Only images under 5MB are allowed.');
                                                       }

                                                       setReceiveForm(prev => ({ ...prev, receiptImages: validFiles }));
                                                  }}
                                             />
                                             <small className="text-muted">Upload receipt images (max 5MB each)</small>
                                             {receiveForm.receiptImages.length > 0 && (
                                                  <div className="mt-1">
                                                       <small className="text-success">
                                                            {receiveForm.receiptImages.length} file(s) selected
                                                       </small>
                                                  </div>
                                             )}
                                        </div>
                                   </div>
                                   <div className="row mt-3">
                                        <div className="col-md-6">
                                             <label className="form-label">Notes</label>
                                             <textarea
                                                  className="form-control"
                                                  rows={3}
                                                  value={receiveForm.notes}
                                                  onChange={(e) => setReceiveForm(prev => ({ ...prev, notes: e.target.value }))}
                                                  placeholder="Additional notes..."
                                             />
                                        </div>
                                        <div className="col-md-6 d-flex align-items-center">
                                             <div className="form-check">
                                                  <input
                                                       className="form-check-input"
                                                       type="checkbox"
                                                       id="qualityCheckPassed"
                                                       checked={receiveForm.qualityCheckPassed}
                                                       onChange={(e) => setReceiveForm(prev => ({ ...prev, qualityCheckPassed: e.target.checked }))}
                                                  />
                                                  <label className="form-check-label" htmlFor="qualityCheckPassed">
                                                       Quality Check Passed
                                                  </label>
                                             </div>
                                        </div>
                                   </div>
                              </div>
                         </div>
                    </div>
               </div>

          </div>
     );
}
