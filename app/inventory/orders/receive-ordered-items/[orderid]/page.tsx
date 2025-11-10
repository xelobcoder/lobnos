'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { RiArrowLeftLine, RiFileTextLine } from '@remixicon/react';
import { toast } from 'react-toastify';
import { customPost, customFetch, customFile, currencyFormatter } from '../../../../../components/Auth/customFetch';
import { useApplication } from '../../../../../components/Auth/useApplicationContext';


interface ReceivedItem {
     id: string;
     itemId: string;
     itemName: string;
     brand?: string;
     selectedBrand?: string;
     sku: string;
     orderedQuantity: number;
     receivedQuantity: number;
     unitPrice: number;
     batchNumber: string;
     expiryDate: string;
     unit: string;
     totalValue: number;
     availableBrands?: string[];
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
     items: any[];
     status: string;
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
     createdBy?: string;
     approvedBy?: string;
     approvedAt?: string;
     sentAt?: string;
     communicationMethod?: string;
     communicationNotes?: string;
     createdAt: string;
     updatedAt?: string;
     itemsCount?: number;
     receivedItemsCount?: number;
}

export default function ReceiveOrderedItemsPage() {
     const params = useParams();
     const router = useRouter();
     const orderId = params.orderid as string;
     const employeeid = useApplication()?.user?.employeeid;

     const [order, setOrder] = useState<PurchaseOrder | null>(null);
     const [loading, setLoading] = useState(true);
     const [submitting, setSubmitting] = useState(false);

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
          loadOrderDetails();
     }, [orderId]);

     const loadOrderDetails = async () => {
          try {
               // Use the specific order ID endpoint as requested
               const response = await customFetch(`inventory/orders/${orderId}`);

               if (response.success) {
                    const apiOrderData = response.data.order;

                    // Map API response (snake_case) to our interface (camelCase)
                    const orderData: PurchaseOrder = {
                         id: apiOrderData.id,
                         orderNumber: apiOrderData.order_number,
                         supplierId: apiOrderData.supplier_id,
                         supplierName: apiOrderData.supplier_name,
                         supplierEmail: apiOrderData.supplier_email,
                         supplierContact: apiOrderData.supplier_contact,
                         supplierPhone: apiOrderData.supplier_phone,
                         supplierAddress: apiOrderData.supplier_address,
                         items: apiOrderData.items,
                         status: apiOrderData.status,
                         orderDate: apiOrderData.order_date,
                         expectedDeliveryDate: apiOrderData.expected_delivery_date,
                         actualDeliveryDate: apiOrderData.actual_delivery_date,
                         totalAmount: apiOrderData.total_amount,
                         taxAmount: apiOrderData.tax_amount,
                         discountAmount: apiOrderData.discount_amount,
                         shippingCost: apiOrderData.shipping_cost,
                         finalAmount: apiOrderData.final_amount,
                         currency: apiOrderData.currency,
                         paymentTerms: apiOrderData.payment_terms,
                         notes: apiOrderData.notes,
                         createdBy: apiOrderData.created_by,
                         approvedBy: apiOrderData.approved_by,
                         approvedAt: apiOrderData.approved_at,
                         sentAt: apiOrderData.sent_at,
                         communicationMethod: apiOrderData.communication_method,
                         communicationNotes: apiOrderData.communication_notes,
                         createdAt: apiOrderData.created_at,
                         updatedAt: apiOrderData.updated_at,
                         itemsCount: apiOrderData.items_count,
                         receivedItemsCount: apiOrderData.received_items_count
                    };

                    setOrder(orderData);
                    const initialItems: ReceivedItem[] = orderData.items.map((item: any) => ({
                         id: item.id,
                         itemId: item.inventory_item_id,
                         itemName: item.item_name,
                         brand: item.brand_name,
                         selectedBrand: item.brand_name || '',
                         sku: item.sku,
                         orderedQuantity: item.quantity_ordered,
                         receivedQuantity: 0,
                         unitPrice: item.unit_price || 0,
                         batchNumber: '',
                         expiryDate: '',
                         unit: item.unit || 'units',
                         totalValue: 0,
                         availableBrands: []
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
                         const response = await customFetch(`inventory/brands?inventory_item_id=${item.itemId}`);
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

          const completedItems = receiveForm.items.filter(item =>
               item.receivedQuantity > 0 && item.unitPrice > 0 && item.batchNumber && item.expiryDate
          );

          if (completedItems.length !== receiveForm.items.length) {
               toast.error('Please complete all item details before processing');
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
                         batch_number: item.batchNumber,
                         expiry_date: item.expiryDate,
                         unit_price: item.unitPrice,
                         condition_status: receiveForm.conditionStatus,
                         quality_check_passed: receiveForm.qualityCheckPassed,
                         notes: receiveForm.notes || "Received in good condition"
                    }))
               };

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
     const completedItems = receiveForm.items.filter(item =>
          item.receivedQuantity > 0 && item.unitPrice > 0 && item.batchNumber && item.expiryDate
     ).length; return (
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
                                             <strong>Progress:</strong> {completedItems} / {receiveForm.items.length} items completed
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
                                             disabled={submitting || completedItems !== receiveForm.items.length}
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
                                             <span className={`badge ms-2 small ${order.status === 'ordering' ? 'bg-warning' : 'bg-secondary'}`}>
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
                                   <div className="row">
                                        {/* Left Column - Receiving Information */}
                                        <div className="col-md-3">
                                             {/* Receiving Information */}
                                             <div className="mb-4">
                                                  <h6 className="text-muted">Receiving Information</h6>
                                                  <div className="border rounded p-3">
                                                       <div className="mb-3">
                                                            <label className="form-label">Invoice Number <span className="text-danger">*</span></label>
                                                            <input
                                                                 type="text"
                                                                 className="form-control"
                                                                 value={receiveForm.invoiceNumber}
                                                                 onChange={(e) => setReceiveForm(prev => ({ ...prev, invoiceNumber: e.target.value }))}
                                                                 placeholder="Enter invoice number"
                                                            />
                                                       </div>
                                                       <div className="row">
                                                            <div className="col-sm-6">
                                                                 <label className="form-label">Received Date <span className="text-danger">*</span></label>
                                                                 <input
                                                                      type="date"
                                                                      className="form-control"
                                                                      value={receiveForm.receivedDate}
                                                                      onChange={(e) => setReceiveForm(prev => ({ ...prev, receivedDate: e.target.value }))}
                                                                 />
                                                            </div>
                                                            <div className="col-sm-6">
                                                                 <label className="form-label">Received Time <span className="text-danger">*</span></label>
                                                                 <input
                                                                      type="time"
                                                                      className="form-control"
                                                                      value={receiveForm.receivedTime}
                                                                      onChange={(e) => setReceiveForm(prev => ({ ...prev, receivedTime: e.target.value }))}
                                                                 />
                                                            </div>
                                                       </div>
                                                       <div className="mt-3">
                                                            <label className="form-label">Notes</label>
                                                            <textarea
                                                                 className="form-control"
                                                                 rows={3}
                                                                 value={receiveForm.notes}
                                                                 onChange={(e) => setReceiveForm(prev => ({ ...prev, notes: e.target.value }))}
                                                                 placeholder="Additional notes..."
                                                            />
                                                       </div>
                                                       <div className="mt-3">
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
                                                       <div className="mt-3">
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
                                                       <div className="mt-3">
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
                                                            <small className="text-muted">Upload receipt images from supplier (max 5MB each, images only)</small>
                                                            {receiveForm.receiptImages.length > 0 && (
                                                                 <div className="mt-2">
                                                                      <small className="text-success">
                                                                           {receiveForm.receiptImages.length} file(s) selected:
                                                                      </small>
                                                                      <div className="mt-1">
                                                                           {receiveForm.receiptImages.map((file, index) => (
                                                                                <small key={index} className="text-muted d-block">
                                                                                     • {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                                                                                </small>
                                                                           ))}
                                                                      </div>
                                                                 </div>
                                                            )}
                                                       </div>
                                                  </div>
                                             </div>
                                        </div>

                                        {/* Middle Column - Items List */}
                                        <div className="col-md-9">
                                             <div className="mb-4">
                                                  <h6 className="text-muted">Items to Receive</h6>
                                                  <div className="list-group">
                                                       {receiveForm.items.map((item, index) => (
                                                            <div key={item.itemId} className="list-group-item">
                                                                 <div className="d-flex justify-content-between align-items-start mb-3">
                                                                      <div>
                                                                           <h6 className="mb-1">
                                                                                <strong>{item.itemName}</strong>
                                                                                <small className="text-muted ms-2">({item.unit})</small>
                                                                           </h6>
                                                                           <small className="text-muted">Ordered Brand: {item.brand || 'N/A'} | SKU: {item.sku} | Ordered: {item.orderedQuantity}</small>
                                                                           {item.selectedBrand && (
                                                                                <div className="mt-1">
                                                                                     <small className="text-primary fw-medium">
                                                                                          Selected Brand: {item.selectedBrand}
                                                                                     </small>
                                                                                </div>
                                                                           )}
                                                                           {item.availableBrands && item.availableBrands.length > 0 && (
                                                                                <div className="mt-1">
                                                                                     <small className="text-info">
                                                                                          Available Brands: {item.availableBrands.join(', ')}
                                                                                     </small>
                                                                                </div>
                                                                           )}
                                                                      </div>
                                                                      <div className="text-end">
                                                                           <strong className="text-success">{currencyFormatter.format(item.totalValue)}</strong>
                                                                      </div>
                                                                 </div>

                                                                 <div className="row g-2">
                                                                      <div className="col-md-2">
                                                                           <label className="form-label small">Brand</label>
                                                                           <select
                                                                                className="form-select form-select-sm"
                                                                                value={item.selectedBrand || ''}
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
                                                                      <div className="col-md-2">
                                                                           <label className="form-label small">Received Qty <span className="text-danger">*</span></label>
                                                                           <input
                                                                                type="number"
                                                                                className="form-control form-control-sm"
                                                                                min="0"
                                                                                max={item.orderedQuantity}
                                                                                value={item.receivedQuantity}
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
                                                                      <div className="col-md-2">
                                                                           <label className="form-label small">Unit Price <span className="text-danger">*</span></label>
                                                                           <input
                                                                                type="number"
                                                                                className="form-control form-control-sm"
                                                                                min="0"
                                                                                step="0.01"
                                                                                value={item.unitPrice}
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
                                                                      <div className="col-md-3">
                                                                           <label className="form-label small">Batch Number <span className="text-danger">*</span></label>
                                                                           <input
                                                                                type="text"
                                                                                className="form-control form-control-sm"
                                                                                value={item.batchNumber}
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
                                                                      <div className="col-md-3">
                                                                           <label className="form-label small">Expiry Date <span className="text-danger">*</span></label>
                                                                           <input
                                                                                type="date"
                                                                                className="form-control form-control-sm"
                                                                                value={item.expiryDate}
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
                                                            </div>
                                                       ))}
                                                  </div>
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
