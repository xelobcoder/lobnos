'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
     RiArrowLeftLine,
     RiCheckboxCircleLine,
     RiErrorWarningLine,
     RiInboxArchiveLine,
     RiLoader4Line,
} from '@remixicon/react';
import { toast } from 'react-toastify';
import { currencyFormatter, customFetch, customPost } from '../../../../../components/Auth/customFetch';
import { useApplicationSettings } from '../../../../../components/Auth/useApplicationContext';
import ExportPdfButton from '../../../../../components/reports/ExportPdfButton';

type ReceiveItem = {
     id: string;
     itemId: string;
     itemName: string;
     sku: string;
     inventoryDomain: 'lab' | 'pharmacy';
     orderedQuantity: number;
     quantityReceived: number;
     remainingQuantity: number;
     receiveNow: number;
     purchaseUnitPrice: number;
     consumptionUnit: string;
     previousWholesalePrice: number;
     previousSalePrice: number;
     wholesalePrice: number;
     salePrice: number;
     changePricing: boolean;
     pricingMode: 'percentage' | 'fixed' | 'manual';
     adjustmentValue: number;
     automaticBatch: boolean;
     batchNumber: string;
     expiryDate: string;
     status: string;
};

type OrderDetails = {
     id: string;
     orderNumber: string;
     supplierName: string;
     status: string;
     items: ReceiveItem[];
};

type PriceDialogState = {
     itemIndex: number;
     enabled: boolean;
     mode: 'percentage' | 'fixed' | 'manual';
     adjustmentValue: number;
     wholesalePrice: number;
     retailPrice: number;
};

export default function ReceiveOrderedItemsPage() {
     const params = useParams();
     const router = useRouter();
     const orderId = String(params?.orderid || '');
     const { applicationsettings } = useApplicationSettings();
     const { branchid, user } = applicationsettings || {};
     const employeeid = user?.employeeid;

     const [order, setOrder] = useState<OrderDetails | null>(null);
     const [receivedDate, setReceivedDate] = useState(new Date().toISOString().split('T')[0]);
     const [conditionStatus, setConditionStatus] = useState('good');
     const [notes, setNotes] = useState('');
     const [loading, setLoading] = useState(true);
     const [submitting, setSubmitting] = useState(false);
     const [error, setError] = useState('');
     const [priceDialog, setPriceDialog] = useState<PriceDialogState | null>(null);

     useEffect(() => {
          if (!orderId || !branchid || !employeeid) return;
          let active = true;

          (async () => {
               setLoading(true);
               setError('');
               try {
                    const orderResponse = await customFetch(`inventory/orders/${orderId}?branchid=${branchid}&employeeid=${employeeid}`);
                    if (!active) return;
                    if (!orderResponse?.success) throw new Error(orderResponse?.error?.message || 'Order could not be loaded.');

                    const data = orderResponse.data;
                    const items: ReceiveItem[] = (data.items || []).map((item: any) => {
                         return {
                              id: item.id,
                              itemId: item.inventory_item_id,
                              itemName: item.item_name,
                              sku: item.item_sku,
                              inventoryDomain: item.inventory_domain || 'lab',
                              orderedQuantity: Number(item.quantity_ordered || 0),
                              quantityReceived: Number(item.quantity_received || 0),
                              remainingQuantity: Math.max(0, Number(item.quantity_ordered || 0) - Number(item.quantity_received || 0)),
                              receiveNow: 0,
                              purchaseUnitPrice: Number(item.unit_price || 0),
                              consumptionUnit: item.consumption_unit || 'unit',
                              previousWholesalePrice: Number(item.wholesale_price || 0),
                              previousSalePrice: Number(item.sale_price || 0),
                              wholesalePrice: Number(item.wholesale_price || 0),
                              salePrice: Number(item.sale_price || 0),
                              changePricing: false,
                              pricingMode: Number(item.wholesale_price || 0) > 0 && Number(item.sale_price || 0) > 0 ? 'percentage' : 'manual',
                              adjustmentValue: 0,
                              automaticBatch: true,
                              batchNumber: '',
                              expiryDate: '',
                              status: item.status,
                         };
                    });

                    setOrder({
                         id: data.id,
                         orderNumber: data.order_number || data.id,
                         supplierName: data.supplier?.name || data.supplier_name || 'Supplier',
                         status: data.status,
                         items,
                    });
               } catch (loadError: any) {
                    if (active) setError(loadError.message || 'Order could not be loaded.');
               } finally {
                    if (active) setLoading(false);
               }
          })();

          return () => { active = false; };
     }, [orderId, branchid, employeeid]);

     const updateItem = (index: number, updates: Partial<ReceiveItem>) => {
          setOrder((current) => current ? {
               ...current,
               items: current.items.map((item, itemIndex) => itemIndex === index ? { ...item, ...updates } : item),
          } : current);
     };

     const receiveAllRemaining = () => {
          setOrder((current) => current ? {
               ...current,
               items: current.items.map((item) => item.status === 'received' ? item : { ...item, receiveNow: item.remainingQuantity }),
          } : current);
     };

     const openPriceDialog = (itemIndex: number) => {
          if (!order) return;
          const item = order.items[itemIndex];
          setPriceDialog({
               itemIndex,
               enabled: item.changePricing,
               mode: item.pricingMode,
               adjustmentValue: item.adjustmentValue,
               wholesalePrice: item.wholesalePrice,
               retailPrice: item.salePrice,
          });
     };

     const updatePriceDialog = (updates: Partial<PriceDialogState>) => {
          setPriceDialog((current) => {
               if (!current || !order) return current;
               const next = { ...current, ...updates };
               const item = order.items[current.itemIndex];
               if (next.mode !== 'manual' && (updates.mode !== undefined || updates.adjustmentValue !== undefined)) {
                    next.wholesalePrice = Number((next.mode === 'percentage' ? item.previousWholesalePrice * (1 + next.adjustmentValue / 100) : item.previousWholesalePrice + next.adjustmentValue).toFixed(2));
                    next.retailPrice = Number((next.mode === 'percentage' ? item.previousSalePrice * (1 + next.adjustmentValue / 100) : item.previousSalePrice + next.adjustmentValue).toFixed(2));
               }
               return next;
          });
     };

     const savePriceDialog = () => {
          if (!priceDialog) return;
          updateItem(priceDialog.itemIndex, {
               changePricing: priceDialog.enabled,
               pricingMode: priceDialog.mode,
               adjustmentValue: priceDialog.adjustmentValue,
               wholesalePrice: priceDialog.wholesalePrice,
               salePrice: priceDialog.retailPrice,
          });
          setPriceDialog(null);
     };

     const selectedItems = order?.items.filter((item) => item.status !== 'received' && item.receiveNow > 0) || [];
     const totalPurchaseCost = selectedItems.reduce((sum, item) => sum + item.receiveNow * item.purchaseUnitPrice, 0);

     const submitReceiving = async () => {
          if (!order || submitting || selectedItems.length === 0) return;
          const invalidItem = selectedItems.find((item) => item.purchaseUnitPrice <= 0);
          if (invalidItem) {
               toast.error(`Enter the unit cost for ${invalidItem.itemName}.`);
               return;
          }
          const missingManualBatch = selectedItems.find((item) => !item.automaticBatch && !item.batchNumber.trim());
          if (missingManualBatch) {
               toast.error(`Enter a batch number for ${missingManualBatch.itemName}, or enable automatic batch generation.`);
               return;
          }

          setSubmitting(true);
          setError('');
          try {
               const response = await customPost(`inventory/orders/${order.id}/receive`, 'POST', {
                    received_by: employeeid,
                    received_date: receivedDate,
                    receipts: selectedItems.map((item) => ({
                         order_item_id: item.id,
                         quantity_received: item.receiveNow,
                         received_date: receivedDate,
                         batch_number: item.automaticBatch ? undefined : item.batchNumber.trim() || undefined,
                         expiry_date: item.expiryDate || undefined,
                         unit_price: item.purchaseUnitPrice,
                         units_per_purchase_unit: 1,
                         new_wholesale_price: item.changePricing ? item.wholesalePrice : undefined,
                         new_sale_price: item.changePricing ? item.salePrice : undefined,
                         price_policy: item.changePricing ? (item.pricingMode === 'manual' ? 'replace' : 'increase') : 'maintain',
                         condition_status: conditionStatus,
                         quality_check_passed: conditionStatus === 'good' || conditionStatus === 'acceptable',
                         notes: notes.trim() || undefined,
                    })),
               });
               if (!response?.success) throw new Error(response?.error?.message || response?.message || 'Stock could not be received.');
               toast.success('Stock received successfully.');
               router.push('/inventory/orders');
          } catch (submitError: any) {
               setError(submitError.message || 'Stock could not be received.');
          } finally {
               setSubmitting(false);
          }
     };

     if (loading) {
          return <main className="min-vh-100 d-flex align-items-center justify-content-center"><div className="text-center"><RiLoader4Line size={36} className="spin mb-2" /><div>Loading order...</div></div></main>;
     }

     if (!order) {
          return <main className="container py-4"><div className="alert alert-danger">{error || 'Order not found.'}</div><button className="btn btn-outline-dark" onClick={() => router.push('/inventory/orders')}><RiArrowLeftLine size={18} /> Back to orders</button></main>;
     }

     const dialogItem = priceDialog ? order.items[priceDialog.itemIndex] : null;

     return (
          <main className="container-fluid py-3 px-lg-4 min-vh-100" style={{ backgroundColor: '#f3f6f4' }} data-pdf-root>
               <header className="d-flex flex-wrap align-items-center justify-content-between gap-3 border-bottom pb-3 mb-3">
                    <div className="d-flex align-items-center gap-3">
                         <button type="button" className="btn btn-outline-dark" onClick={() => router.push('/inventory/orders')} aria-label="Back to orders"><RiArrowLeftLine size={20} /></button>
                         <div><h1 className="h4 mb-1">Receive stock</h1><div className="text-muted">{order.orderNumber} · {order.supplierName}</div></div>
                    </div>
                    <div className="d-flex flex-wrap align-items-center gap-2">
                         <ExportPdfButton
                              title="Receive Stock"
                              subtitle={`${order.orderNumber} · ${order.supplierName}`}
                              filters={[`Order: ${order.orderNumber}`, `Supplier: ${order.supplierName}`, `Status: ${order.status}`]}
                              getSpec={() => ({
                                   notes: [
                                        `Received date: ${receivedDate}`,
                                        `Condition: ${conditionStatus}`,
                                        ...(notes.trim() ? [`Notes: ${notes.trim()}`] : []),
                                        `Items selected to receive: ${selectedItems.length}`,
                                        `Total purchase cost: ${currencyFormatter.format(totalPurchaseCost)}`,
                                   ],
                                   tables: [{
                                        heading: 'Order items',
                                        head: ['Inventory item', 'SKU', 'Remaining', 'Quantity received', 'Unit cost', 'Expiry date', 'Batch number', 'Wholesale', 'Retail', 'Status'],
                                        body: order.items.map((item) => [
                                             item.itemName,
                                             item.sku || '',
                                             `${item.remainingQuantity} ${item.consumptionUnit}`,
                                             item.status === 'received' ? 'Received' : `${item.receiveNow} ${item.consumptionUnit}`,
                                             currencyFormatter.format(item.purchaseUnitPrice),
                                             item.expiryDate || '',
                                             item.automaticBatch ? 'Automatic' : item.batchNumber,
                                             currencyFormatter.format(item.changePricing ? item.wholesalePrice : item.previousWholesalePrice),
                                             currencyFormatter.format(item.changePricing ? item.salePrice : item.previousSalePrice),
                                             item.status || '',
                                        ]),
                                   }],
                              })}
                         />
                         <button type="button" className="btn btn-outline-primary" onClick={receiveAllRemaining}>Receive all remaining</button>
                    </div>
               </header>

               {error && <div className="alert alert-danger d-flex gap-2"><RiErrorWarningLine size={20} />{error}</div>}

               <section className="receiving-surface bg-white border">
                    <table className="table align-middle mb-0 receiving-table">
                         <thead><tr><th>Inventory item</th><th>Quantity received</th><th>Unit cost</th><th>Expiry date</th><th>Batch number</th><th>Pricing</th></tr></thead>
                         <tbody>{order.items.map((item, index) => {
                              const disabled = item.status === 'received';
                              const consumptionCost = item.purchaseUnitPrice;
                              return <tr key={item.id} className={disabled ? 'table-success' : ''}>
                                   <td data-label="Item" className="item-column"><strong>{item.itemName}</strong><div className="item-meta">SKU {item.sku}</div><div className="stock-meta">{item.remainingQuantity} {item.consumptionUnit} remaining</div>{!disabled && <button type="button" className="btn btn-link p-0 fw-semibold" onClick={() => updateItem(index, { receiveNow: item.remainingQuantity })}>Receive all remaining</button>}</td>
                                   <td data-label="Quantity">{disabled ? <span className="d-inline-flex align-items-center gap-1 text-success fw-semibold"><RiCheckboxCircleLine size={20} /> Received</span> : <div className="quantity-control"><input aria-label={`Quantity for ${item.itemName}`} type="number" min="0" max={item.remainingQuantity} className="form-control form-control-lg" value={item.receiveNow} onChange={(event) => updateItem(index, { receiveNow: Math.min(item.remainingQuantity, Number(event.target.value) || 0) })} /><span>{item.consumptionUnit}</span></div>}</td>
                                   <td data-label="Unit cost"><div className="money-input"><span>GH₵</span><input aria-label={`Unit cost for ${item.itemName}`} type="number" min="0" step="0.01" className="form-control form-control-lg" disabled={disabled} value={item.purchaseUnitPrice} onChange={(event) => updateItem(index, { purchaseUnitPrice: Number(event.target.value) || 0 })} /></div></td>
                                   <td data-label="Expiry"><input aria-label={`Expiry for ${item.itemName}`} type="date" className="form-control form-control-lg" disabled={disabled} value={item.expiryDate} onChange={(event) => updateItem(index, { expiryDate: event.target.value })} /></td>
                                   <td data-label="Batch"><div className="form-check form-switch"><input id={`auto-batch-${item.id}`} className="form-check-input" type="checkbox" disabled={disabled} checked={item.automaticBatch} onChange={(event) => updateItem(index, { automaticBatch: event.target.checked })} /><label className="form-check-label fw-semibold" htmlFor={`auto-batch-${item.id}`}>Automatic</label></div>{!item.automaticBatch && <input aria-label={`Batch for ${item.itemName}`} className="form-control mt-2" placeholder="Enter batch number" value={item.batchNumber} onChange={(event) => updateItem(index, { batchNumber: event.target.value })} />}</td>
                                   <td data-label="Pricing"><div className="pricing-summary"><div><span>Wholesale</span><strong>{currencyFormatter.format(item.changePricing ? item.wholesalePrice : item.previousWholesalePrice)}</strong></div><div><span>Retail</span><strong>{currencyFormatter.format(item.changePricing ? item.salePrice : item.previousSalePrice)}</strong></div><button type="button" className={`btn fw-semibold ${item.changePricing ? 'btn-primary' : 'btn-outline-primary'}`} disabled={disabled} onClick={() => openPriceDialog(index)}>{item.changePricing ? 'Edit price change' : 'Change prices'}</button></div></td>
                              </tr>;
                         })}</tbody>
                    </table>
               </section>

               {priceDialog && dialogItem && (
                    <div className="modal d-block" role="dialog" aria-modal="true" style={{ backgroundColor: 'rgba(23, 33, 38, 0.5)', zIndex: 1060 }}>
                         <div className="modal-dialog mt-3">
                              <div className="modal-content price-dialog">
                                   <div className="modal-header"><div><h2 className="modal-title h5 mb-1">Change selling prices</h2><div className="text-muted">{dialogItem.itemName}</div></div><button type="button" className="btn-close" onClick={() => setPriceDialog(null)} aria-label="Close" /></div>
                                   <div className="modal-body">
                                        <div className="current-price-panel mb-4"><div><span>Current wholesale</span><strong>{currencyFormatter.format(dialogItem.previousWholesalePrice)}</strong></div><div><span>Current retail</span><strong>{currencyFormatter.format(dialogItem.previousSalePrice)}</strong></div></div>
                                        <div className="form-check form-switch mb-4"><input id="enable-price-change" className="form-check-input" type="checkbox" checked={priceDialog.enabled} onChange={(event) => updatePriceDialog({ enabled: event.target.checked })} /><label className="form-check-label fw-semibold" htmlFor="enable-price-change">Change prices when this stock is received</label></div>
                                        {priceDialog.enabled && <>
                                             <label className="form-label fw-semibold" htmlFor="price-change-method">How should prices change?</label>
                                             <select id="price-change-method" className="form-select form-select-lg mb-3" value={priceDialog.mode} onChange={(event) => updatePriceDialog({ mode: event.target.value as PriceDialogState['mode'] })}><option value="percentage">Increase by percentage</option><option value="fixed">Increase by fixed amount</option><option value="manual">Enter prices manually</option></select>
                                             {priceDialog.mode !== 'manual' && <div className="mb-3"><label className="form-label fw-semibold" htmlFor="price-adjustment">{priceDialog.mode === 'percentage' ? 'Percentage increase' : 'Fixed increase amount'}</label><input id="price-adjustment" type="number" min="0" step="0.01" className="form-control form-control-lg" value={priceDialog.adjustmentValue} onChange={(event) => updatePriceDialog({ adjustmentValue: Number(event.target.value) || 0 })} /></div>}
                                             <div className="row g-3"><div className="col-6"><label className="form-label fw-semibold" htmlFor="new-wholesale">New wholesale</label><input id="new-wholesale" type="number" min="0" step="0.01" className="form-control form-control-lg" value={priceDialog.wholesalePrice} disabled={priceDialog.mode !== 'manual'} onChange={(event) => updatePriceDialog({ wholesalePrice: Number(event.target.value) || 0 })} /></div><div className="col-6"><label className="form-label fw-semibold" htmlFor="new-retail">New retail</label><input id="new-retail" type="number" min="0" step="0.01" className="form-control form-control-lg" value={priceDialog.retailPrice} disabled={priceDialog.mode !== 'manual'} onChange={(event) => updatePriceDialog({ retailPrice: Number(event.target.value) || 0 })} /></div></div>
                                             <div className="profit-preview mt-3"><span>Expected profit per item</span><strong>{currencyFormatter.format(priceDialog.retailPrice - dialogItem.purchaseUnitPrice)}</strong></div>
                                        </>}
                                   </div>
                                   <div className="modal-footer"><button type="button" className="btn btn-outline-secondary btn-lg" onClick={() => setPriceDialog(null)}>Cancel</button><button type="button" className="btn btn-primary btn-lg" onClick={savePriceDialog}>Apply prices</button></div>
                              </div>
                         </div>
                    </div>
               )}

               <details className="border rounded p-3 mt-3">
                    <summary className="fw-semibold">Additional receiving details</summary>
                    <div className="row g-3 mt-1">
                         <div className="col-md-3"><label className="form-label">Received date</label><input type="date" className="form-control" value={receivedDate} onChange={(event) => setReceivedDate(event.target.value)} /></div>
                         <div className="col-md-3"><label className="form-label">Condition</label><select className="form-select" value={conditionStatus} onChange={(event) => setConditionStatus(event.target.value)}><option value="good">Good</option><option value="acceptable">Acceptable</option><option value="damaged">Damaged</option><option value="expired">Expired</option></select></div>
                         <div className="col-md-6"><label className="form-label">Notes</label><textarea className="form-control" rows={2} value={notes} onChange={(event) => setNotes(event.target.value)} /></div>
                    </div>
               </details>

               <footer className="position-sticky bottom-0 bg-white border-top mt-4 py-3 d-flex flex-wrap justify-content-between align-items-center gap-3" style={{ zIndex: 10 }}>
                    <div><strong>{selectedItems.length} item{selectedItems.length === 1 ? '' : 's'} selected</strong><div className="text-muted">Purchase subtotal before tax/discount: {currencyFormatter.format(totalPurchaseCost)}</div></div>
                    <button type="button" className="btn btn-success btn-lg px-5 d-flex align-items-center gap-2" disabled={submitting || selectedItems.length === 0} onClick={submitReceiving}>{submitting ? <RiLoader4Line size={20} className="spin" /> : <RiInboxArchiveLine size={20} />} Receive stock</button>
               </footer>

               <style jsx>{`
                    .receiving-surface { border-radius: 6px; overflow: hidden; }
                    .receiving-table { width: 100%; table-layout: fixed; --table-accent: #176b4d; font-size: 1rem; }
                    .receiving-table thead { position: sticky; top: 0; z-index: 2; }
                    .receiving-table th { background: #e6f0ea; color: #173f31; padding: 14px; border-color: #cbdcd2; font-size: .94rem; font-weight: 700; }
                    .receiving-table th:nth-child(1) { width: 22%; }
                    .receiving-table th:nth-child(2) { width: 15%; }
                    .receiving-table th:nth-child(3) { width: 13%; }
                    .receiving-table th:nth-child(4) { width: 15%; }
                    .receiving-table th:nth-child(5) { width: 15%; }
                    .receiving-table th:nth-child(6) { width: 20%; }
                    .receiving-table td { padding: 16px 14px; border-color: #e0e8e3; vertical-align: middle; overflow-wrap: anywhere; }
                    .receiving-table tbody tr:nth-child(even) td { background: #fafcfb; }
                    .receiving-table tbody tr:hover td { background: #eef6f1; }
                    .receiving-table .item-column { border-left: 5px solid var(--table-accent); }
                    .item-column strong { font-size: 1.06rem; }
                    .item-meta, .stock-meta { color: #52665c; font-size: .86rem; margin-top: 3px; }
                    .quantity-control { display: grid; grid-template-columns: minmax(72px, 1fr) auto; gap: 8px; align-items: center; }
                    .quantity-control span { font-weight: 600; color: #4d5e55; }
                    .money-input { position: relative; }
                    .money-input span { position: absolute; left: 11px; top: 12px; z-index: 1; color: #52665c; font-size: .9rem; }
                    .money-input input { padding-left: 42px; }
                    .pricing-summary { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
                    .pricing-summary > div { background: #f2f6f3; border: 1px solid #d8e3dc; padding: 8px; border-radius: 4px; }
                    .pricing-summary span { display: block; color: #627269; font-size: .78rem; }
                    .pricing-summary strong { display: block; margin-top: 2px; }
                    .pricing-summary button { grid-column: 1 / -1; }
                    .price-dialog { border-radius: 6px; font-size: 1rem; }
                    .current-price-panel { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
                    .current-price-panel > div, .profit-preview { background: #eef5f1; border: 1px solid #d2e1d8; border-radius: 4px; padding: 14px; }
                    .current-price-panel span, .profit-preview span { display: block; color: #56685e; margin-bottom: 4px; }
                    .current-price-panel strong, .profit-preview strong { font-size: 1.2rem; color: #174b37; }
                    .spin { animation: spin 1s linear infinite; }
                    @keyframes spin { to { transform: rotate(360deg); } }
                    @media (max-width: 900px) {
                         .receiving-surface { border: 0 !important; background: transparent !important; }
                         .receiving-table, .receiving-table tbody, .receiving-table tr, .receiving-table td { display: block; width: 100%; }
                         .receiving-table { table-layout: auto; }
                         .receiving-table thead { display: none; }
                         .receiving-table tr { background: #fff; border: 1px solid #cedbd3; border-left: 5px solid var(--table-accent); border-radius: 6px; margin-bottom: 14px; padding: 6px 14px; }
                         .receiving-table td, .receiving-table .item-column { border: 0; border-bottom: 1px solid #e4ebe7; padding: 13px 0; display: grid; grid-template-columns: 130px minmax(0, 1fr); gap: 12px; align-items: center; }
                         .receiving-table td:last-child { border-bottom: 0; }
                         .receiving-table td::before { content: attr(data-label); font-weight: 700; color: #3d5046; }
                         .receiving-table .item-column { display: block; }
                         .receiving-table .item-column::before { display: none; }
                         .pricing-summary { width: 100%; }
                    }
               `}</style>
          </main>
     );
}