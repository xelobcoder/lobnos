'use client';

import { useEffect, useState } from 'react';
import { RiInboxArchiveLine, RiPriceTag3Line } from '@remixicon/react';
import { toast } from 'react-toastify';
import { customFetch, customFetchMutation } from '../../../components/Auth/customFetch';

export type PharmacyStockUpItem = {
     inventoryItemId: string;
     name: string;
     unit: string;
     availableStock: number;
     wholesalePrice: number;
     salePrice: number;
     batchTracking?:boolean;
};

type Supplier = { id: string; name: string };
type PriceMode = 'percentage' | 'fixed' | 'manual';

type Props = {
     items: PharmacyStockUpItem[];
     employeeId: number;
     onClose: () => void;
     onCompleted: () => void | Promise<void>;
};

const currency = new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS' });

export default function PharmacyStockUpModal({ items, employeeId, onClose, onCompleted }: Props) {
     const [itemIndex, setItemIndex] = useState(0);
     const [suppliers, setSuppliers] = useState<Supplier[]>([]);
     const [supplierId, setSupplierId] = useState('');
     const [quantity, setQuantity] = useState(1);
     const [unitCost, setUnitCost] = useState(0);
     const [expiryDate, setExpiryDate] = useState('');
     const [batchNumber,setBatchNumber]=useState('');
     const [changePricing, setChangePricing] = useState(false);
     const [showPriceDialog, setShowPriceDialog] = useState(false);
     const [priceMode, setPriceMode] = useState<PriceMode>('percentage');
     const [adjustmentValue, setAdjustmentValue] = useState(0);
     const [wholesalePrice, setWholesalePrice] = useState(0);
     const [retailPrice, setRetailPrice] = useState(0);
     const [submitting, setSubmitting] = useState(false);

     const item = items[itemIndex];

     useEffect(() => {
          customFetch('inventory/suppliers?count=500')
               .then((response) => response?.success && setSuppliers(response.data || []))
               .catch(() => setSuppliers([]));
     }, []);

     useEffect(() => {
          if (!item) return;
          setSupplierId('');
          setQuantity(1);
          setUnitCost(0);
          setExpiryDate('');setBatchNumber('');
          setChangePricing(false);
          setShowPriceDialog(false);
          setAdjustmentValue(0);
          setWholesalePrice(Number(item.wholesalePrice || 0));
          setRetailPrice(Number(item.salePrice || 0));
          setPriceMode(item.wholesalePrice > 0 && item.salePrice > 0 ? 'percentage' : 'manual');
     }, [item]);

     if (!item) return null;

     const updatePrices = (mode: PriceMode, value: number) => {
          setPriceMode(mode);
          setAdjustmentValue(value);
          if (mode === 'manual') return;
          setWholesalePrice(Number((mode === 'percentage' ? item.wholesalePrice * (1 + value / 100) : item.wholesalePrice + value).toFixed(2)));
          setRetailPrice(Number((mode === 'percentage' ? item.salePrice * (1 + value / 100) : item.salePrice + value).toFixed(2)));
     };

     const receiveStock = async () => {
          if(item.batchTracking!==false&&(!expiryDate||expiryDate<new Date().toISOString().slice(0,10)||!batchNumber.trim())){toast.error('Enter the manufacturer batch number and a valid expiry date.');return;}
          if (!Number.isInteger(quantity) || quantity <= 0) {
               toast.error('Enter a whole quantity greater than zero.');
               return;
          }
          if (!Number.isFinite(unitCost) || unitCost < 0) {
               toast.error('Enter a valid unit cost.');
               return;
          }
          if (changePricing && (wholesalePrice < 0 || retailPrice < 0)) {
               toast.error('Wholesale and retail prices cannot be negative.');
               return;
          }

          setSubmitting(true);
          try {
               const response = await customFetchMutation(`inventory/items/${item.inventoryItemId}/stock-up`, 'POST', {
                    supplier_id: supplierId || undefined,
                    quantity,
                    unit_price: unitCost,
                    received_by: employeeId,
                    expiry_date: expiryDate || undefined,
                    batch_number:batchNumber.trim()||undefined,
                    change_pricing: changePricing,
                    price_policy: changePricing ? (priceMode === 'manual' ? 'replace' : 'increase') : 'maintain',
                    new_wholesale_price: changePricing ? wholesalePrice : undefined,
                    new_sale_price: changePricing ? retailPrice : undefined,
               });
               if (!response?.success) throw new Error(response?.error?.message || 'Stock could not be received.');
               toast.success(`${item.name} stocked successfully. Batch and expiry details recorded.`);
               if (itemIndex < items.length - 1) setItemIndex((current) => current + 1);
               else {
                    await onCompleted();
                    onClose();
               }
          } catch (error: any) {
               toast.error(error.message || 'Stock could not be received.');
          } finally {
               setSubmitting(false);
          }
     };

     return (
          <>
               <div className="modal d-block" role="dialog" aria-modal="true" style={{ backgroundColor: 'rgba(23, 33, 38, 0.5)', zIndex: 1060 }}>
                    <div className="modal-dialog modal-lg mt-3">
                         <div className="modal-content" style={{ borderRadius: '6px' }}>
                              <div className="modal-header">
                                   <div>
                                        <h2 className="modal-title h5 mb-1">Stock up {item.name}</h2>
                                        <div className="text-muted">Current stock: {item.availableStock} {item.unit}{items.length > 1 ? ` · Item ${itemIndex + 1} of ${items.length}` : ''}</div>
                                   </div>
                                   <button type="button" className="btn-close" onClick={onClose} aria-label="Close" />
                              </div>
                              <div className="modal-body">
                                   <div className="row g-3">
                                        <div className="col-md-6"><label className="form-label fw-semibold" htmlFor="stock-supplier">Supplier</label><select id="stock-supplier" className="form-select form-select-lg" value={supplierId} onChange={(event) => setSupplierId(event.target.value)}><option value="">General Supplier</option>{suppliers.filter((supplier) => supplier.id !== 'SUP-GENERAL').map((supplier) => <option key={supplier.id} value={supplier.id}>{supplier.name}</option>)}</select></div>
                                        <div className="col-md-3"><label className="form-label fw-semibold" htmlFor="stock-quantity">Quantity</label><input id="stock-quantity" type="number" min="1" className="form-control form-control-lg" value={quantity} onChange={(event) => setQuantity(Number(event.target.value) || 0)} /></div>
                                        <div className="col-md-3"><label className="form-label fw-semibold" htmlFor="stock-cost">Unit cost</label><input id="stock-cost" type="number" min="0" step="0.01" className="form-control form-control-lg" value={unitCost} onChange={(event) => setUnitCost(Number(event.target.value) || 0)} /></div>
                                        <div className="col-md-6"><label className="form-label fw-semibold" htmlFor="manufacturer-batch">Manufacturer batch number</label><input id="manufacturer-batch" className="form-control form-control-lg" value={batchNumber} maxLength={100} onChange={event=>setBatchNumber(event.target.value)}/></div><div className="col-md-6"><label className="form-label fw-semibold" htmlFor="stock-expiry">Expiry date</label><input id="stock-expiry" min={new Date().toISOString().slice(0,10)} required={item.batchTracking!==false} type="date" className="form-control form-control-lg" value={expiryDate} onChange={(event) => setExpiryDate(event.target.value)} /></div>
                                        <div className="col-md-6 d-flex align-items-end"><button type="button" className={`btn btn-lg w-100 d-flex justify-content-center align-items-center gap-2 ${changePricing ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setShowPriceDialog(true)}><RiPriceTag3Line size={20} />{changePricing ? 'Edit price change' : 'Change prices'}</button></div>
                                   </div>
                                   <div className="alert alert-light border mt-4 mb-0">Batch number will be generated automatically. Leaving supplier blank uses General Supplier.</div>
                              </div>
                              <div className="modal-footer"><button type="button" className="btn btn-outline-secondary btn-lg" onClick={onClose}>Cancel</button><button type="button" className="btn btn-success btn-lg d-flex align-items-center gap-2" disabled={submitting} onClick={receiveStock}><RiInboxArchiveLine size={20} />{submitting ? 'Receiving...' : 'Receive stock'}</button></div>
                         </div>
                    </div>
               </div>

               {showPriceDialog && (
                    <div className="modal d-block" role="dialog" aria-modal="true" style={{ backgroundColor: 'rgba(23, 33, 38, 0.6)', zIndex: 1070 }}>
                         <div className="modal-dialog mt-3">
                              <div className="modal-content" style={{ borderRadius: '6px' }}>
                                   <div className="modal-header"><div><h3 className="modal-title h5 mb-1">Change selling prices</h3><div className="text-muted">{item.name}</div></div><button type="button" className="btn-close" onClick={() => setShowPriceDialog(false)} aria-label="Close" /></div>
                                   <div className="modal-body">
                                        <div className="row g-3 mb-4"><div className="col-6"><div className="border bg-light p-3"><span className="text-muted d-block">Current wholesale</span><strong className="fs-5">{currency.format(item.wholesalePrice)}</strong></div></div><div className="col-6"><div className="border bg-light p-3"><span className="text-muted d-block">Current retail</span><strong className="fs-5">{currency.format(item.salePrice)}</strong></div></div></div>
                                        <div className="form-check form-switch mb-4"><input id="change-pricing" className="form-check-input" type="checkbox" checked={changePricing} onChange={(event) => setChangePricing(event.target.checked)} /><label className="form-check-label fw-semibold" htmlFor="change-pricing">Change prices with this stock receipt</label></div>
                                        {changePricing && <><label className="form-label fw-semibold" htmlFor="stock-price-mode">Pricing method</label><select id="stock-price-mode" className="form-select form-select-lg mb-3" value={priceMode} onChange={(event) => updatePrices(event.target.value as PriceMode, adjustmentValue)}><option value="percentage">Increase by percentage</option><option value="fixed">Increase by fixed amount</option><option value="manual">Enter prices manually</option></select>{priceMode !== 'manual' && <div className="mb-3"><label className="form-label fw-semibold" htmlFor="stock-adjustment">{priceMode === 'percentage' ? 'Percentage increase' : 'Fixed increase amount'}</label><input id="stock-adjustment" type="number" min="0" step="0.01" className="form-control form-control-lg" value={adjustmentValue} onChange={(event) => updatePrices(priceMode, Number(event.target.value) || 0)} /></div>}<div className="row g-3"><div className="col-6"><label className="form-label fw-semibold" htmlFor="stock-wholesale">New wholesale</label><input id="stock-wholesale" type="number" min="0" step="0.01" className="form-control form-control-lg" value={wholesalePrice} disabled={priceMode !== 'manual'} onChange={(event) => setWholesalePrice(Number(event.target.value) || 0)} /></div><div className="col-6"><label className="form-label fw-semibold" htmlFor="stock-retail">New retail</label><input id="stock-retail" type="number" min="0" step="0.01" className="form-control form-control-lg" value={retailPrice} disabled={priceMode !== 'manual'} onChange={(event) => setRetailPrice(Number(event.target.value) || 0)} /></div></div><div className="alert alert-success mt-3 mb-0"><span className="d-block">Expected profit per item</span><strong className="fs-5">{currency.format(retailPrice - unitCost)}</strong></div></>}
                                   </div>
                                   <div className="modal-footer"><button type="button" className="btn btn-outline-secondary btn-lg" onClick={() => setShowPriceDialog(false)}>Cancel</button><button type="button" className="btn btn-primary btn-lg" onClick={() => setShowPriceDialog(false)}>Apply prices</button></div>
                              </div>
                         </div>
                    </div>
               )}
          </>
     );
}
