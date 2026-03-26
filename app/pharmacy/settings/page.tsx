'use client';
import React, { useState, useEffect } from 'react';
import {
     RiSettings3Line,
     RiAddLine,
     RiAddCircleLine,
     RiCloseLine,
     RiSaveLine,
     RiLoader4Line,
     RiSearchLine,
     RiEdit2Line,
     RiDeleteBinLine,
     RiAlarmWarningLine,
     RiCheckLine,
     RiTruckLine,
     RiPhoneLine,
     RiMailLine,
     RiMapPinLine,
     RiMedicineBottleLine,
} from '@remixicon/react';
import { customFetch, customPost, currencyFormatter } from '../../../components/Auth/customFetch';
import { toast } from 'react-toastify';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Drug {
     id: number;
     name: string;
     genericName?: string;
     strength?: string;
     form: string;
     category: string;
     unit: string;
     costPrice: number;
     sellingPrice: number;
     stockQty: number;
     minQty: number;
     expiryDate?: string;
     supplier?: string;
}

interface DrugForm {
     name: string;
     genericName: string;
     strength: string;
     form: string;
     category: string;
     unit: string;
     costPrice: string;
     sellingPrice: string;
     stockQty: string;
     minQty: string;
     expiryDate: string;
     supplier: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const FORM_OPTIONS = ['Tablet', 'Capsule', 'Syrup', 'Injection', 'Sachet', 'Cream', 'Drops', 'Inhaler', 'Suppository', 'Patch', 'Other'];
const UNIT_OPTIONS = ['tablet', 'capsule', 'bottle', 'sachet', 'vial', 'ampoule', 'tube', 'pack', 'patch', 'inhaler'];
const FORM_COLORS: Record<string, string> = {
     Tablet: '#1E88E5', Capsule: '#8E24AA', Syrup: '#43A047',
     Injection: '#E53935', Sachet: '#FB8C00', default: '#546E7A',
};

const EMPTY_FORM: DrugForm = {
     name: '', genericName: '', strength: '', form: 'Tablet',
     category: '', unit: 'tablet', costPrice: '', sellingPrice: '',
     stockQty: '', minQty: '30', expiryDate: '', supplier: '',
};

// ─── Mock data (replace with API when backend ready) ─────────────────────────
const MOCK_DRUGS: Drug[] = [
     { id: 1, name: 'Paracetamol', genericName: 'Acetaminophen', strength: '500mg', form: 'Tablet', category: 'Analgesic', unit: 'tablet', costPrice: 0.40, sellingPrice: 0.80, stockQty: 500, minQty: 50, expiryDate: '2026-12-01', supplier: 'MedPharm' },
     { id: 2, name: 'Amoxicillin', strength: '250mg', form: 'Capsule', category: 'Antibiotic', unit: 'capsule', costPrice: 1.20, sellingPrice: 2.50, stockQty: 200, minQty: 30, expiryDate: '2026-08-15', supplier: 'PharmaGH' },
     { id: 3, name: 'Ibuprofen', strength: '400mg', form: 'Tablet', category: 'NSAID', unit: 'tablet', costPrice: 0.60, sellingPrice: 1.20, stockQty: 300, minQty: 50, expiryDate: '2027-01-20', supplier: 'MedPharm' },
     { id: 4, name: 'Metronidazole', strength: '400mg', form: 'Tablet', category: 'Antibiotic', unit: 'tablet', costPrice: 0.70, sellingPrice: 1.50, stockQty: 150, minQty: 30, expiryDate: '2026-09-10', supplier: 'PharmaGH' },
     { id: 5, name: 'ORS Sachet', genericName: 'Oral Rehydration', strength: '20.5g', form: 'Sachet', category: 'Rehydration', unit: 'sachet', costPrice: 1.50, sellingPrice: 3.00, stockQty: 400, minQty: 50, expiryDate: '2027-03-01', supplier: 'UNICEF Supply' },
     { id: 6, name: 'Chloroquine', strength: '250mg', form: 'Tablet', category: 'Antimalarial', unit: 'tablet', costPrice: 1.00, sellingPrice: 2.00, stockQty: 90, minQty: 30, expiryDate: '2026-06-15', supplier: 'MedPharm' },
     { id: 7, name: 'Vitamin C', genericName: 'Ascorbic Acid', strength: '200mg', form: 'Tablet', category: 'Supplement', unit: 'tablet', costPrice: 0.25, sellingPrice: 0.50, stockQty: 600, minQty: 100, expiryDate: '2027-06-01', supplier: 'HealthLine' },
     { id: 8, name: 'Coartem', genericName: 'Artemether/Lum', strength: '80/480', form: 'Tablet', category: 'Antimalarial', unit: 'pack', costPrice: 9.00, sellingPrice: 18.00, stockQty: 80, minQty: 20, expiryDate: '2026-11-01', supplier: 'PharmaGH' },
     { id: 9, name: 'Omeprazole', strength: '20mg', form: 'Capsule', category: 'Antacid', unit: 'capsule', costPrice: 1.80, sellingPrice: 3.50, stockQty: 45, minQty: 50, expiryDate: '2026-10-20', supplier: 'MedPharm' },
     { id: 10, name: 'Cough Syrup', genericName: 'Dextromethorphan', strength: '100ml', form: 'Syrup', category: 'Respiratory', unit: 'bottle', costPrice: 6.00, sellingPrice: 12.00, stockQty: 60, minQty: 15, expiryDate: '2027-02-01', supplier: 'HealthLine' },
];

// ─── Supplier Types ───────────────────────────────────────────────────────────

interface Supplier {
     id: number;
     name: string;
     contactPerson?: string;
     phone?: string;
     email?: string;
     address?: string;
     city?: string;
     notes?: string;
}

interface SupplierForm {
     name: string;
     contactPerson: string;
     phone: string;
     email: string;
     address: string;
     city: string;
     notes: string;
}

const EMPTY_SUPPLIER: SupplierForm = {
     name: '', contactPerson: '', phone: '', email: '', address: '', city: '', notes: '',
};

const MOCK_SUPPLIERS: Supplier[] = [
     { id: 1, name: 'MedPharm', contactPerson: 'Kofi Mensah', phone: '0244 000 001', email: 'orders@medpharm.gh', address: '12 Pharmacy Lane', city: 'Accra' },
     { id: 2, name: 'PharmaGH', contactPerson: 'Akosua Boateng', phone: '0244 000 002', email: 'orders@pharmagh.com', address: '34 Medical Street', city: 'Kumasi' },
     { id: 3, name: 'HealthLine', contactPerson: 'James Asante', phone: '0244 000 003', email: 'sales@healthline.gh', address: '5 Clinic Road', city: 'Takoradi' },
     { id: 4, name: 'UNICEF Supply', city: 'Accra', notes: 'International NGO supplier' },
];

// ─── Formulary Modal ──────────────────────────────────────────────────────────
function DrugFormModal({
     drug,
     drugs,
     saving,
     onSave,
     onClose,
}: {
     drug: DrugForm;
     drugs: Drug[];
     saving: boolean;
     onSave: (form: DrugForm, e: React.FormEvent) => void;
     onClose: () => void;
}) {
     const [form, setForm] = useState<DrugForm>(drug);
     const field = (key: keyof DrugForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
          setForm(f => ({ ...f, [key]: e.target.value }));

     return (
          <div
               className="modal d-block"
               tabIndex={-1}
               style={{ background: 'rgba(0,0,0,0.6)', zIndex: 1050 }}
               onClick={e => { if (e.target === e.currentTarget) onClose(); }}
          >
               <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
                    <div className="modal-content" style={{ borderRadius: '12px' }}>
                         <div
                              className="modal-header py-3 px-4"
                              style={{ background: '#8E24AA', color: '#fff', borderRadius: '12px 12px 0 0' }}
                         >
                              <h5 className="modal-title mb-0 d-flex align-items-center gap-2">
                                   {form.name ? <RiEdit2Line size={20} /> : <RiAddCircleLine size={20} />}
                                   {form.name ? `Edit: ${form.name}` : 'Add New Drug to Formulary'}
                              </h5>
                              <button className="btn btn-sm p-0 text-white opacity-75" onClick={onClose}>
                                   <RiCloseLine size={22} />
                              </button>
                         </div>

                         <form onSubmit={e => onSave(form, e)}>
                              <div className="modal-body p-4">
                                   <p className="text-muted small mb-3">Fields marked <span className="text-danger">*</span> are required.</p>
                                   <div className="row g-3">
                                        {/* Drug name */}
                                        <div className="col-md-6">
                                             <label className="form-label fw-medium small">Drug Name <span className="text-danger">*</span></label>
                                             <input
                                                  type="text"
                                                  className="form-control shadow-none"
                                                  placeholder="e.g. Amoxicillin"
                                                  value={form.name}
                                                  onChange={field('name')}
                                                  required
                                                  autoFocus
                                             />
                                        </div>
                                        {/* Generic name */}
                                        <div className="col-md-6">
                                             <label className="form-label fw-medium small">Generic / INN Name</label>
                                             <input
                                                  type="text"
                                                  className="form-control shadow-none"
                                                  placeholder="e.g. Amoxicillin trihydrate"
                                                  value={form.genericName}
                                                  onChange={field('genericName')}
                                             />
                                        </div>
                                        {/* Strength */}
                                        <div className="col-md-4">
                                             <label className="form-label fw-medium small">Strength / Concentration</label>
                                             <input
                                                  type="text"
                                                  className="form-control shadow-none"
                                                  placeholder="e.g. 500mg, 100ml"
                                                  value={form.strength}
                                                  onChange={field('strength')}
                                             />
                                        </div>
                                        {/* Form */}
                                        <div className="col-md-4">
                                             <label className="form-label fw-medium small">Dosage Form <span className="text-danger">*</span></label>
                                             <select className="form-select shadow-none" value={form.form} onChange={field('form')}>
                                                  {FORM_OPTIONS.map(fo => <option key={fo}>{fo}</option>)}
                                             </select>
                                        </div>
                                        {/* Unit */}
                                        <div className="col-md-4">
                                             <label className="form-label fw-medium small">Dispensing Unit <span className="text-danger">*</span></label>
                                             <select className="form-select shadow-none" value={form.unit} onChange={field('unit')}>
                                                  {UNIT_OPTIONS.map(u => <option key={u}>{u}</option>)}
                                             </select>
                                        </div>
                                        {/* Category */}
                                        <div className="col-md-6">
                                             <label className="form-label fw-medium small">Category / Therapeutic Class</label>
                                             <input
                                                  type="text"
                                                  className="form-control shadow-none"
                                                  placeholder="e.g. Antibiotic, Analgesic"
                                                  value={form.category}
                                                  list="cat-list"
                                                  onChange={field('category')}
                                             />
                                             <datalist id="cat-list">
                                                  {Array.from(new Set(drugs.map(d => d.category))).sort().map(c => (
                                                       <option key={c} value={c} />
                                                  ))}
                                             </datalist>
                                        </div>
                                        {/* Supplier */}
                                        <div className="col-md-6">
                                             <label className="form-label fw-medium small">Supplier</label>
                                             <input
                                                  type="text"
                                                  className="form-control shadow-none"
                                                  placeholder="e.g. PharmaGH"
                                                  value={form.supplier}
                                                  onChange={field('supplier')}
                                             />
                                        </div>

                                        <div className="col-12"><hr className="my-0" /></div>

                                        {/* Pricing */}
                                        <div className="col-md-6">
                                             <label className="form-label fw-medium small">Cost Price (GHS)</label>
                                             <div className="input-group">
                                                  <span className="input-group-text bg-transparent">GHS</span>
                                                  <input
                                                       type="number" min={0} step="0.01"
                                                       className="form-control shadow-none"
                                                       placeholder="0.00"
                                                       value={form.costPrice}
                                                       onChange={field('costPrice')}
                                                  />
                                             </div>
                                        </div>
                                        <div className="col-md-6">
                                             <label className="form-label fw-medium small">Selling Price (GHS) <span className="text-danger">*</span></label>
                                             <div className="input-group">
                                                  <span className="input-group-text bg-transparent">GHS</span>
                                                  <input
                                                       type="number" min={0.01} step="0.01"
                                                       className="form-control shadow-none"
                                                       placeholder="0.00"
                                                       value={form.sellingPrice}
                                                       onChange={field('sellingPrice')}
                                                       required
                                                  />
                                             </div>
                                             {form.costPrice && form.sellingPrice && parseFloat(form.sellingPrice) > 0 && (
                                                  <p className="text-muted small mt-1 mb-0">
                                                       Margin: <strong className="text-success">
                                                            {(((parseFloat(form.sellingPrice) - parseFloat(form.costPrice)) / parseFloat(form.sellingPrice)) * 100).toFixed(1)}%
                                                       </strong>
                                                  </p>
                                             )}
                                        </div>

                                        <div className="col-12"><hr className="my-0" /></div>

                                        {/* Stock levels */}
                                        <div className="col-md-4">
                                             <label className="form-label fw-medium small">Opening Stock Qty</label>
                                             <input
                                                  type="number" min={0}
                                                  className="form-control shadow-none"
                                                  placeholder="0"
                                                  value={form.stockQty}
                                                  onChange={field('stockQty')}
                                             />
                                        </div>
                                        <div className="col-md-4">
                                             <label className="form-label fw-medium small">Reorder Level (min qty)</label>
                                             <input
                                                  type="number" min={1}
                                                  className="form-control shadow-none"
                                                  placeholder="30"
                                                  value={form.minQty}
                                                  onChange={field('minQty')}
                                             />
                                        </div>
                                        <div className="col-md-4">
                                             <label className="form-label fw-medium small">Expiry Date</label>
                                             <input
                                                  type="date"
                                                  className="form-control shadow-none"
                                                  value={form.expiryDate}
                                                  min={new Date().toISOString().split('T')[0]}
                                                  onChange={field('expiryDate')}
                                             />
                                        </div>
                                   </div>
                              </div>

                              <div className="modal-footer justify-content-between px-4 pb-3 pt-2">
                                   <button type="button" className="btn btn-outline-secondary btn-sm" onClick={onClose}>
                                        <RiCloseLine size={16} className="me-1" /> Cancel
                                   </button>
                                   <button
                                        type="submit"
                                        className="btn btn-primary btn-sm d-flex align-items-center gap-1"
                                        style={{ background: '#8E24AA', border: 'none' }}
                                        disabled={saving}
                                   >
                                        {saving
                                             ? <><RiLoader4Line size={16} style={{ animation: 'spin 1s linear infinite' }} /> Saving…</>
                                             : <><RiSaveLine size={16} /> Save Drug</>
                                        }
                                   </button>
                              </div>
                         </form>
                    </div>
               </div>
          </div>
     );
}

// ─── Supplier Modal ─────────────────────────────────────────────────────────
function SupplierFormModal({
     supplier,
     saving,
     onSave,
     onClose,
}: {
     supplier: SupplierForm;
     saving: boolean;
     onSave: (form: SupplierForm, e: React.FormEvent) => void;
     onClose: () => void;
}) {
     const [form, setForm] = useState<SupplierForm>(supplier);
     const field = (key: keyof SupplierForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
          setForm(f => ({ ...f, [key]: e.target.value }));

     return (
          <div
               className="modal d-block"
               tabIndex={-1}
               style={{ background: 'rgba(0,0,0,0.6)', zIndex: 1050 }}
               onClick={e => { if (e.target === e.currentTarget) onClose(); }}
          >
               <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: 560 }}>
                    <div className="modal-content" style={{ borderRadius: '12px' }}>
                         <div
                              className="modal-header py-3 px-4"
                              style={{ background: '#546E7A', color: '#fff', borderRadius: '12px 12px 0 0' }}
                         >
                              <h5 className="modal-title mb-0 d-flex align-items-center gap-2">
                                   {form.name ? <RiEdit2Line size={20} /> : <RiAddCircleLine size={20} />}
                                   {form.name ? `Edit: ${form.name}` : 'Add Supplier'}
                              </h5>
                              <button className="btn btn-sm p-0 text-white opacity-75" onClick={onClose}>
                                   <RiCloseLine size={22} />
                              </button>
                         </div>

                         <form onSubmit={e => onSave(form, e)}>
                              <div className="modal-body p-4">
                                   <div className="row g-3">
                                        <div className="col-12">
                                             <label className="form-label fw-medium small">Supplier Name <span className="text-danger">*</span></label>
                                             <input type="text" className="form-control shadow-none" placeholder="e.g. PharmaGH" value={form.name} onChange={field('name')} required autoFocus />
                                        </div>
                                        <div className="col-md-6">
                                             <label className="form-label fw-medium small">Contact Person</label>
                                             <input type="text" className="form-control shadow-none" placeholder="Full name" value={form.contactPerson} onChange={field('contactPerson')} />
                                        </div>
                                        <div className="col-md-6">
                                             <label className="form-label fw-medium small">Phone</label>
                                             <input type="tel" className="form-control shadow-none" placeholder="e.g. 0244 000 000" value={form.phone} onChange={field('phone')} />
                                        </div>
                                        <div className="col-md-6">
                                             <label className="form-label fw-medium small">Email</label>
                                             <input type="email" className="form-control shadow-none" placeholder="orders@supplier.com" value={form.email} onChange={field('email')} />
                                        </div>
                                        <div className="col-md-6">
                                             <label className="form-label fw-medium small">City / Town</label>
                                             <input type="text" className="form-control shadow-none" placeholder="e.g. Accra" value={form.city} onChange={field('city')} />
                                        </div>
                                        <div className="col-12">
                                             <label className="form-label fw-medium small">Address</label>
                                             <input type="text" className="form-control shadow-none" placeholder="Street address" value={form.address} onChange={field('address')} />
                                        </div>
                                        <div className="col-12">
                                             <label className="form-label fw-medium small">Notes</label>
                                             <textarea className="form-control shadow-none" rows={2} placeholder="Payment terms, lead time, etc." value={form.notes} onChange={field('notes')} />
                                        </div>
                                   </div>
                              </div>

                              <div className="modal-footer justify-content-between px-4 pb-3 pt-2">
                                   <button type="button" className="btn btn-outline-secondary btn-sm" onClick={onClose}>
                                        <RiCloseLine size={16} className="me-1" /> Cancel
                                   </button>
                                   <button
                                        type="submit"
                                        className="btn btn-primary btn-sm d-flex align-items-center gap-1"
                                        style={{ background: '#546E7A', border: 'none' }}
                                        disabled={saving}
                                   >
                                        {saving
                                             ? <><RiLoader4Line size={16} style={{ animation: 'spin 1s linear infinite' }} /> Saving…</>
                                             : <><RiSaveLine size={16} /> Save Supplier</>
                                        }
                                   </button>
                              </div>
                         </form>
                    </div>
               </div>
          </div>
     );
}

// ─── Main Settings Page ───────────────────────────────────────────────────────
export default function PharmacySettingsPage() {
     const [drugs, setDrugs] = useState<Drug[]>(MOCK_DRUGS);
     const [loading, setLoading] = useState(false);
     const [search, setSearch] = useState('');
     const [saving, setSaving] = useState(false);

     // Modal state: null = closed, EMPTY_FORM = adding, Drug fields = editing
     const [modalDrug, setModalDrug] = useState<DrugForm | null>(null);
     const [editingId, setEditingId] = useState<number | null>(null);

     // Delete confirm
     const [deleteTarget, setDeleteTarget] = useState<Drug | null>(null);
     const [deleting, setDeleting] = useState(false);

     // Tab + Suppliers
     const [activeTab, setActiveTab] = useState<'formulary' | 'suppliers'>('formulary');
     const [suppliers, setSuppliers] = useState<Supplier[]>(MOCK_SUPPLIERS);
     const [supplierSearch, setSupplierSearch] = useState('');
     const [supplierModal, setSupplierModal] = useState<SupplierForm | null>(null);
     const [supplierEditingId, setSupplierEditingId] = useState<number | null>(null);
     const [supplierSaving, setSupplierSaving] = useState(false);
     const [supplierDeleteTarget, setSupplierDeleteTarget] = useState<Supplier | null>(null);
     const [supplierDeleting, setSupplierDeleting] = useState(false);

     useEffect(() => {
          const load = async () => {
               setLoading(true);
               try {
                    const res = await customFetch('pharmacy/drugs?count=200');
                    if (res?.status === 'success' && Array.isArray(res.result)) {
                         setDrugs(res.result);
                    }
               } catch {
                    // stays on mock data
               } finally {
                    setLoading(false);
               }
          };
          load();
     }, []);

     const filtered = drugs.filter(d => {
          const q = search.toLowerCase();
          return !q ||
               d.name.toLowerCase().includes(q) ||
               d.genericName?.toLowerCase().includes(q) ||
               d.category.toLowerCase().includes(q) ||
               d.form.toLowerCase().includes(q) ||
               d.supplier?.toLowerCase().includes(q);
     });

     const filteredSuppliers = suppliers.filter(s => {
          const q = supplierSearch.toLowerCase();
          return !q ||
               s.name.toLowerCase().includes(q) ||
               s.contactPerson?.toLowerCase().includes(q) ||
               s.city?.toLowerCase().includes(q) ||
               s.email?.toLowerCase().includes(q);
     });

     // ── Open add modal ─────────────────────────────────────────────────────
     const openAdd = () => { setEditingId(null); setModalDrug({ ...EMPTY_FORM }); };

     // ── Open edit modal ────────────────────────────────────────────────────
     const openEdit = (drug: Drug) => {
          setEditingId(drug.id);
          setModalDrug({
               name: drug.name,
               genericName: drug.genericName ?? '',
               strength: drug.strength ?? '',
               form: drug.form,
               category: drug.category,
               unit: drug.unit,
               costPrice: String(drug.costPrice),
               sellingPrice: String(drug.sellingPrice),
               stockQty: String(drug.stockQty),
               minQty: String(drug.minQty),
               expiryDate: drug.expiryDate ?? '',
               supplier: drug.supplier ?? '',
          });
     };

     // ── Save (add or edit) ─────────────────────────────────────────────────
     const handleSave = async (form: DrugForm, e: React.FormEvent) => {
          e.preventDefault();
          if (!form.name.trim()) { toast.error('Drug name is required'); return; }
          if (!form.sellingPrice || parseFloat(form.sellingPrice) <= 0) {
               toast.error('Selling price must be greater than 0'); return;
          }
          setSaving(true);

          const payload = {
               name: form.name.trim(),
               genericName: form.genericName.trim() || undefined,
               strength: form.strength.trim() || undefined,
               form: form.form,
               category: form.category.trim() || 'General',
               unit: form.unit,
               costPrice: parseFloat(form.costPrice) || 0,
               sellingPrice: parseFloat(form.sellingPrice) || 0,
               stockQty: parseInt(form.stockQty) || 0,
               minQty: parseInt(form.minQty) || 30,
               expiryDate: form.expiryDate || undefined,
               supplier: form.supplier.trim() || undefined,
          };

          try {
               if (editingId !== null) {
                    // Edit
                    try {
                         const res = await customPost(`pharmacy/drugs/${editingId}`, 'PUT', payload);
                         if (res?.status !== 'success') throw new Error();
                    } catch { /* offline */ }
                    setDrugs(prev => prev.map(d =>
                         d.id === editingId ? { ...d, ...payload } : d
                    ));
                    toast.success(`${payload.name} updated`);
               } else {
                    // Add
                    try {
                         const res = await customPost('pharmacy/drugs', 'POST', payload);
                         if (res?.status !== 'success') throw new Error();
                    } catch { /* offline */ }
                    const newDrug: Drug = { id: Date.now(), ...payload };
                    setDrugs(prev => [newDrug, ...prev]);
                    toast.success(`${payload.name} added to formulary`);
               }
               setModalDrug(null);
               setEditingId(null);
          } catch {
               toast.error('Failed to save. Please try again.');
          } finally {
               setSaving(false);
          }
     };

     // ── Delete ─────────────────────────────────────────────────────────────
     const handleDelete = async () => {
          if (!deleteTarget) return;
          setDeleting(true);
          try {
               try {
                    const res = await customPost(`pharmacy/drugs/${deleteTarget.id}`, 'DELETE', {});
                    if (res?.status !== 'success') throw new Error();
               } catch { /* offline */ }
               setDrugs(prev => prev.filter(d => d.id !== deleteTarget.id));
               toast.success(`${deleteTarget.name} removed from formulary`);
               setDeleteTarget(null);
          } catch {
               toast.error('Failed to delete drug.');
          } finally {
               setDeleting(false);
          }
     };

     // ── Supplier handlers ──────────────────────────────────────────────────
     const openAddSupplier = () => { setSupplierEditingId(null); setSupplierModal({ ...EMPTY_SUPPLIER }); };
     const openEditSupplier = (s: Supplier) => {
          setSupplierEditingId(s.id);
          setSupplierModal({
               name: s.name,
               contactPerson: s.contactPerson ?? '',
               phone: s.phone ?? '',
               email: s.email ?? '',
               address: s.address ?? '',
               city: s.city ?? '',
               notes: s.notes ?? '',
          });
     };

     const handleSupplierSave = async (form: SupplierForm, e: React.FormEvent) => {
          e.preventDefault();
          if (!form.name.trim()) { toast.error('Supplier name is required'); return; }
          setSupplierSaving(true);
          const payload = {
               name: form.name.trim(),
               contactPerson: form.contactPerson.trim() || undefined,
               phone: form.phone.trim() || undefined,
               email: form.email.trim() || undefined,
               address: form.address.trim() || undefined,
               city: form.city.trim() || undefined,
               notes: form.notes.trim() || undefined,
          };
          try {
               if (supplierEditingId !== null) {
                    try {
                         const res = await customPost(`pharmacy/suppliers/${supplierEditingId}`, 'PUT', payload);
                         if (res?.status !== 'success') throw new Error();
                    } catch { /* offline */ }
                    setSuppliers(prev => prev.map(s => s.id === supplierEditingId ? { ...s, ...payload } : s));
                    toast.success(`${payload.name} updated`);
               } else {
                    try {
                         const res = await customPost('pharmacy/suppliers', 'POST', payload);
                         if (res?.status !== 'success') throw new Error();
                    } catch { /* offline */ }
                    setSuppliers(prev => [{ id: Date.now(), ...payload }, ...prev]);
                    toast.success(`${payload.name} added`);
               }
               setSupplierModal(null);
               setSupplierEditingId(null);
          } catch {
               toast.error('Failed to save supplier.');
          } finally {
               setSupplierSaving(false);
          }
     };

     const handleSupplierDelete = async () => {
          if (!supplierDeleteTarget) return;
          setSupplierDeleting(true);
          try {
               try {
                    const res = await customPost(`pharmacy/suppliers/${supplierDeleteTarget.id}`, 'DELETE', {});
                    if (res?.status !== 'success') throw new Error();
               } catch { /* offline */ }
               setSuppliers(prev => prev.filter(s => s.id !== supplierDeleteTarget.id));
               toast.success(`${supplierDeleteTarget.name} removed`);
               setSupplierDeleteTarget(null);
          } catch {
               toast.error('Failed to remove supplier.');
          } finally {
               setSupplierDeleting(false);
          }
     };

     // ─────────────────────────────────────────────────────────────────────────
     return (
          <div className="py-2">
               {/* Header */}
               <div className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom">
                    <div>
                         <h4 className="mb-0 fw-bold" style={{ color: '#546E7A' }}>
                              <RiSettings3Line size={22} className="me-2" style={{ color: '#546E7A' }} />
                              Pharmacy Settings
                         </h4>
                         <p className="text-muted mb-0 small">Manage drug formulary and suppliers</p>
                    </div>
                    {activeTab === 'formulary' ? (
                         <button
                              className="btn btn-sm btn-primary d-flex align-items-center gap-1"
                              style={{ background: '#8E24AA', border: 'none' }}
                              onClick={openAdd}
                         >
                              <RiAddLine size={16} /> Add Drug
                         </button>
                    ) : (
                         <button
                              className="btn btn-sm btn-primary d-flex align-items-center gap-1"
                              style={{ background: '#546E7A', border: 'none' }}
                              onClick={openAddSupplier}
                         >
                              <RiAddLine size={16} /> Add Supplier
                         </button>
                    )}
               </div>

               {/* Tabs */}
               <ul className="nav nav-tabs mb-3">
                    <li className="nav-item">
                         <button
                              className={`nav-link ${activeTab === 'formulary' ? 'active fw-semibold' : 'text-muted'}`}
                              style={{ border: 'none', background: 'none', cursor: 'pointer' }}
                              onClick={() => setActiveTab('formulary')}
                         >
                              <RiMedicineBottleLine size={15} className="me-1" /> Drug Formulary
                         </button>
                    </li>
                    <li className="nav-item">
                         <button
                              className={`nav-link ${activeTab === 'suppliers' ? 'active fw-semibold' : 'text-muted'}`}
                              style={{ border: 'none', background: 'none', cursor: 'pointer' }}
                              onClick={() => setActiveTab('suppliers')}
                         >
                              <RiTruckLine size={15} className="me-1" /> Suppliers
                         </button>
                    </li>
               </ul>

               {/* ─── Drug Formulary Tab ──────────────────────────────────────── */}
               {activeTab === 'formulary' && (<>
                    {/* Summary strip */}
                    <div className="row g-2 mb-3">
                         {[
                              { label: 'Total Drugs', value: drugs.length, color: '#1E88E5' },
                              { label: 'Categories', value: new Set(drugs.map(d => d.category)).size, color: '#546E7A' },
                              { label: 'Low / Out', value: drugs.filter(d => d.stockQty < d.minQty).length, color: '#FB8C00' },
                              {
                                   label: 'Avg Margin',
                                   value: drugs.length
                                        ? (drugs.reduce((s, d) => s + (d.sellingPrice - d.costPrice) / d.sellingPrice * 100, 0) / drugs.length).toFixed(1) + '%'
                                        : '—',
                                   color: '#43A047'
                              },
                         ].map((m, i) => (
                              <div key={i} className="col-6 col-md-3">
                                   <div className="border rounded p-2 h-100" style={{ borderLeft: `3px solid ${m.color}` }}>
                                        <p className="text-muted small mb-1">{m.label}</p>
                                        <p className="fw-bold mb-0 fs-6" style={{ color: m.color }}>{m.value}</p>
                                   </div>
                              </div>
                         ))}
                    </div>

                    {/* Search */}
                    <div className="input-group input-group-sm mb-3" style={{ maxWidth: 380 }}>
                         <span className="input-group-text bg-transparent border-end-0">
                              <RiSearchLine size={15} className="text-muted" />
                         </span>
                         <input
                              type="text"
                              className="form-control border-start-0 shadow-none"
                              placeholder="Search drug, category, form, supplier…"
                              value={search}
                              onChange={e => setSearch(e.target.value)}
                         />
                         {search && (
                              <button className="btn btn-outline-secondary border-start-0" onClick={() => setSearch('')}>
                                   <RiCloseLine size={14} />
                              </button>
                         )}
                    </div>

                    {/* Formulary table */}
                    {loading ? (
                         <div className="text-center py-5 text-muted">
                              <RiLoader4Line size={36} style={{ animation: 'spin 1s linear infinite', color: '#8E24AA' }} className="mb-2" />
                              <p>Loading formulary…</p>
                         </div>
                    ) : filtered.length === 0 ? (
                         <div className="text-center py-5 text-muted">
                              <RiSettings3Line size={48} className="mb-2 opacity-25" />
                              <p className="mb-2">{search ? 'No drugs match your search.' : 'No drugs in formulary yet.'}</p>
                              {!search && (
                                   <button
                                        className="btn btn-primary btn-sm"
                                        style={{ background: '#8E24AA', border: 'none' }}
                                        onClick={openAdd}
                                   >
                                        <RiAddLine size={16} className="me-1" /> Add First Drug
                                   </button>
                              )}
                         </div>
                    ) : (
                         <div className="card border-0 shadow-sm" style={{ borderRadius: '8px' }}>
                              <div className="table-responsive">
                                   <table className="table table-sm table-hover small mb-0 text-start">
                                        <thead className="sticky-top" style={{ background: 'var(--bs-tertiary-bg)' }}>
                                             <tr>
                                                  <th className="ps-3">Drug</th>
                                                  <th>Form</th>
                                                  <th>Category</th>
                                                  <th className="text-end">Cost</th>
                                                  <th className="text-end">Sell Price</th>
                                                  <th className="text-center">Margin</th>
                                                  <th className="text-center">Min Qty</th>
                                                  <th>Expiry</th>
                                                  <th>Supplier</th>
                                                  <th className="pe-3 text-end">Actions</th>
                                             </tr>
                                        </thead>
                                        <tbody>
                                             {filtered.map(drug => {
                                                  const formColor = FORM_COLORS[drug.form] ?? FORM_COLORS.default;
                                                  const margin = drug.sellingPrice > 0
                                                       ? ((drug.sellingPrice - drug.costPrice) / drug.sellingPrice * 100).toFixed(1)
                                                       : '—';
                                                  const expiringSoon = (() => {
                                                       if (!drug.expiryDate) return false;
                                                       const exp = new Date(drug.expiryDate);
                                                       const soon = new Date();
                                                       soon.setMonth(soon.getMonth() + 3);
                                                       return exp <= soon;
                                                  })();
                                                  return (
                                                       <tr key={drug.id}>
                                                            <td className="ps-3">
                                                                 <span className="fw-medium">{drug.name}</span>
                                                                 {drug.strength && <span className="text-muted"> {drug.strength}</span>}
                                                                 {drug.genericName && (
                                                                      <div className="text-muted" style={{ fontSize: '0.7rem' }}>{drug.genericName}</div>
                                                                 )}
                                                            </td>
                                                            <td>
                                                                 <span className="badge" style={{ background: `${formColor}18`, color: formColor, fontSize: '0.7rem' }}>
                                                                      {drug.form}
                                                                 </span>
                                                            </td>
                                                            <td className="text-muted">{drug.category}</td>
                                                            <td className="text-end text-muted">{currencyFormatter.format(drug.costPrice)}</td>
                                                            <td className="text-end fw-medium">{currencyFormatter.format(drug.sellingPrice)}</td>
                                                            <td className="text-center">
                                                                 <span className="badge bg-success-subtle text-success" style={{ fontSize: '0.68rem' }}>
                                                                      {margin}%
                                                                 </span>
                                                            </td>
                                                            <td className="text-center text-muted">{drug.minQty} {drug.unit}</td>
                                                            <td>
                                                                 {drug.expiryDate ? (
                                                                      <span className={expiringSoon ? 'text-danger fw-semibold' : ''}>
                                                                           {new Date(drug.expiryDate).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
                                                                           {expiringSoon && <RiAlarmWarningLine size={12} className="ms-1" />}
                                                                      </span>
                                                                 ) : <span className="text-muted">—</span>}
                                                            </td>
                                                            <td className="text-muted">{drug.supplier ?? '—'}</td>
                                                            <td className="pe-3 text-end">
                                                                 <div className="d-flex justify-content-end gap-1">
                                                                      <button
                                                                           className="btn btn-sm btn-outline-primary py-0 px-2"
                                                                           style={{ fontSize: '0.72rem' }}
                                                                           onClick={() => openEdit(drug)}
                                                                           title="Edit drug"
                                                                      >
                                                                           <RiEdit2Line size={13} className="me-1" />Edit
                                                                      </button>
                                                                      <button
                                                                           className="btn btn-sm btn-outline-danger py-0 px-2"
                                                                           style={{ fontSize: '0.72rem' }}
                                                                           onClick={() => setDeleteTarget(drug)}
                                                                           title="Remove from formulary"
                                                                      >
                                                                           <RiDeleteBinLine size={13} />
                                                                      </button>
                                                                 </div>
                                                            </td>
                                                       </tr>
                                                  );
                                             })}
                                        </tbody>
                                        <tfoot>
                                             <tr className="border-top fw-bold" style={{ background: 'var(--bs-tertiary-bg)' }}>
                                                  <td colSpan={10} className="ps-3 pe-3 py-2">
                                                       {filtered.length} drug{filtered.length !== 1 ? 's' : ''} shown
                                                  </td>
                                             </tr>
                                        </tfoot>
                                   </table>
                              </div>
                         </div>
                    )}
               </>)} {/* ─── end formulary tab ─── */}

               {/* ─── Suppliers Tab ──────────────────────────────────────────── */}
               {activeTab === 'suppliers' && (<>
                    {/* Supplier summary */}
                    <div className="row g-2 mb-3">
                         {[
                              { label: 'Total Suppliers', value: suppliers.length, color: '#546E7A' },
                              { label: 'Cities Covered', value: new Set(suppliers.map(s => s.city).filter(Boolean)).size, color: '#1E88E5' },
                              { label: 'With Drugs Listed', value: suppliers.filter(s => drugs.some(d => d.supplier === s.name)).length, color: '#43A047' },
                              { label: 'Drugs in Formulary', value: drugs.length, color: '#8E24AA' },
                         ].map((m, i) => (
                              <div key={i} className="col-6 col-md-3">
                                   <div className="border rounded p-2 h-100" style={{ borderLeft: `3px solid ${m.color}` }}>
                                        <p className="text-muted small mb-1">{m.label}</p>
                                        <p className="fw-bold mb-0 fs-6" style={{ color: m.color }}>{m.value}</p>
                                   </div>
                              </div>
                         ))}
                    </div>

                    {/* Supplier search */}
                    <div className="input-group input-group-sm mb-3" style={{ maxWidth: 380 }}>
                         <span className="input-group-text bg-transparent border-end-0">
                              <RiSearchLine size={15} className="text-muted" />
                         </span>
                         <input
                              type="text"
                              className="form-control border-start-0 shadow-none"
                              placeholder="Search supplier, city, contact…"
                              value={supplierSearch}
                              onChange={e => setSupplierSearch(e.target.value)}
                         />
                         {supplierSearch && (
                              <button className="btn btn-outline-secondary border-start-0" onClick={() => setSupplierSearch('')}>
                                   <RiCloseLine size={14} />
                              </button>
                         )}
                    </div>

                    {/* Supplier table */}
                    {filteredSuppliers.length === 0 ? (
                         <div className="text-center py-5 text-muted">
                              <RiTruckLine size={48} className="mb-2 opacity-25" />
                              <p className="mb-2">{supplierSearch ? 'No suppliers match your search.' : 'No suppliers added yet.'}</p>
                              {!supplierSearch && (
                                   <button
                                        className="btn btn-primary btn-sm"
                                        style={{ background: '#546E7A', border: 'none' }}
                                        onClick={openAddSupplier}
                                   >
                                        <RiAddLine size={16} className="me-1" /> Add First Supplier
                                   </button>
                              )}
                         </div>
                    ) : (
                         <div className="card border-0 shadow-sm" style={{ borderRadius: '8px' }}>
                              <div className="table-responsive">
                                   <table className="table table-sm table-hover small mb-0 text-start">
                                        <thead className="sticky-top" style={{ background: 'var(--bs-tertiary-bg)' }}>
                                             <tr>
                                                  <th className="ps-3">Supplier</th>
                                                  <th>Contact Person</th>
                                                  <th>Phone</th>
                                                  <th>Email</th>
                                                  <th>City</th>
                                                  <th className="text-center">Drugs</th>
                                                  <th className="pe-3 text-end">Actions</th>
                                             </tr>
                                        </thead>
                                        <tbody>
                                             {filteredSuppliers.map(sup => {
                                                  const drugCount = drugs.filter(d => d.supplier === sup.name).length;
                                                  return (
                                                       <tr key={sup.id}>
                                                            <td className="ps-3">
                                                                 <span className="d-flex align-items-center gap-1 fw-medium">
                                                                      <RiTruckLine size={14} className="text-muted flex-shrink-0" />
                                                                      {sup.name}
                                                                 </span>
                                                                 {sup.notes && <div className="text-muted" style={{ fontSize: '0.7rem' }}>{sup.notes}</div>}
                                                            </td>
                                                            <td className="text-muted">{sup.contactPerson || '—'}</td>
                                                            <td>
                                                                 {sup.phone
                                                                      ? <a href={`tel:${sup.phone}`} className="text-decoration-none text-muted d-flex align-items-center gap-1">
                                                                           <RiPhoneLine size={13} /> {sup.phone}
                                                                      </a>
                                                                      : <span className="text-muted">—</span>
                                                                 }
                                                            </td>
                                                            <td>
                                                                 {sup.email
                                                                      ? <a href={`mailto:${sup.email}`} className="text-decoration-none text-muted d-flex align-items-center gap-1">
                                                                           <RiMailLine size={13} /> {sup.email}
                                                                      </a>
                                                                      : <span className="text-muted">—</span>
                                                                 }
                                                            </td>
                                                            <td>
                                                                 {sup.city
                                                                      ? <span className="d-flex align-items-center gap-1 text-muted">
                                                                           <RiMapPinLine size={13} /> {sup.city}
                                                                      </span>
                                                                      : <span className="text-muted">—</span>
                                                                 }
                                                            </td>
                                                            <td className="text-center">
                                                                 {drugCount > 0
                                                                      ? <span className="badge bg-success-subtle text-success">{drugCount}</span>
                                                                      : <span className="badge bg-secondary-subtle text-secondary">0</span>
                                                                 }
                                                            </td>
                                                            <td className="pe-3 text-end">
                                                                 <div className="d-flex justify-content-end gap-1">
                                                                      <button
                                                                           className="btn btn-sm btn-outline-primary py-0 px-2"
                                                                           style={{ fontSize: '0.72rem' }}
                                                                           onClick={() => openEditSupplier(sup)}
                                                                           title="Edit supplier"
                                                                      >
                                                                           <RiEdit2Line size={13} className="me-1" />Edit
                                                                      </button>
                                                                      <button
                                                                           className="btn btn-sm btn-outline-danger py-0 px-2"
                                                                           style={{ fontSize: '0.72rem' }}
                                                                           onClick={() => setSupplierDeleteTarget(sup)}
                                                                           title="Remove supplier"
                                                                      >
                                                                           <RiDeleteBinLine size={13} />
                                                                      </button>
                                                                 </div>
                                                            </td>
                                                       </tr>
                                                  );
                                             })}
                                        </tbody>
                                        <tfoot>
                                             <tr className="border-top fw-bold" style={{ background: 'var(--bs-tertiary-bg)' }}>
                                                  <td colSpan={7} className="ps-3 pe-3 py-2">
                                                       {filteredSuppliers.length} supplier{filteredSuppliers.length !== 1 ? 's' : ''} shown
                                                  </td>
                                             </tr>
                                        </tfoot>
                                   </table>
                              </div>
                         </div>
                    )}
               </>)}

               {/* ════ Add / Edit Modal ════ */}
               {modalDrug !== null && (
                    <DrugFormModal
                         drug={modalDrug}
                         drugs={drugs}
                         saving={saving}
                         onSave={handleSave}
                         onClose={() => { setModalDrug(null); setEditingId(null); }}
                    />
               )}

               {/* ════ Delete Confirm Modal ════ */}
               {deleteTarget && (
                    <div
                         className="modal d-block"
                         tabIndex={-1}
                         style={{ background: 'rgba(0,0,0,0.6)', zIndex: 1050 }}
                         onClick={e => { if (e.target === e.currentTarget) setDeleteTarget(null); }}
                    >
                         <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: 380 }}>
                              <div className="modal-content" style={{ borderRadius: '12px' }}>
                                   <div className="modal-body p-4 text-center">
                                        <RiDeleteBinLine size={40} className="mb-3 text-danger" />
                                        <h5 className="fw-bold mb-1">Remove Drug?</h5>
                                        <p className="text-muted small mb-3">
                                             <strong>{deleteTarget.name}</strong>{deleteTarget.strength ? ` ${deleteTarget.strength}` : ''} will be removed
                                             from the formulary. This cannot be undone.
                                        </p>
                                        <div className="d-flex justify-content-center gap-2">
                                             <button
                                                  className="btn btn-outline-secondary btn-sm"
                                                  onClick={() => setDeleteTarget(null)}
                                             >
                                                  <RiCloseLine size={15} className="me-1" /> Cancel
                                             </button>
                                             <button
                                                  className="btn btn-danger btn-sm d-flex align-items-center gap-1"
                                                  onClick={handleDelete}
                                                  disabled={deleting}
                                             >
                                                  {deleting
                                                       ? <><RiLoader4Line size={15} style={{ animation: 'spin 1s linear infinite' }} /> Removing…</>
                                                       : <><RiCheckLine size={15} /> Yes, Remove</>
                                                  }
                                             </button>
                                        </div>
                                   </div>
                              </div>
                         </div>
                    </div>
               )}

               {/* ════ Supplier Add / Edit Modal ════ */}
               {supplierModal !== null && (
                    <SupplierFormModal
                         supplier={supplierModal}
                         saving={supplierSaving}
                         onSave={handleSupplierSave}
                         onClose={() => { setSupplierModal(null); setSupplierEditingId(null); }}
                    />
               )}

               {/* ════ Supplier Delete Confirm ════ */}
               {supplierDeleteTarget && (
                    <div
                         className="modal d-block"
                         tabIndex={-1}
                         style={{ background: 'rgba(0,0,0,0.6)', zIndex: 1050 }}
                         onClick={e => { if (e.target === e.currentTarget) setSupplierDeleteTarget(null); }}
                    >
                         <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: 380 }}>
                              <div className="modal-content" style={{ borderRadius: '12px' }}>
                                   <div className="modal-body p-4 text-center">
                                        <RiTruckLine size={40} className="mb-3" style={{ color: '#546E7A' }} />
                                        <h5 className="fw-bold mb-1">Remove Supplier?</h5>
                                        <p className="text-muted small mb-3">
                                             <strong>{supplierDeleteTarget.name}</strong> will be removed from the supplier list.
                                             {drugs.some(d => d.supplier === supplierDeleteTarget.name) && (
                                                  <span className="d-block mt-1 text-warning">
                                                       <RiAlarmWarningLine size={13} className="me-1" />
                                                       This supplier is linked to drugs in the formulary.
                                                  </span>
                                             )}
                                        </p>
                                        <div className="d-flex justify-content-center gap-2">
                                             <button
                                                  className="btn btn-outline-secondary btn-sm"
                                                  onClick={() => setSupplierDeleteTarget(null)}
                                             >
                                                  <RiCloseLine size={15} className="me-1" /> Cancel
                                             </button>
                                             <button
                                                  className="btn btn-danger btn-sm d-flex align-items-center gap-1"
                                                  onClick={handleSupplierDelete}
                                                  disabled={supplierDeleting}
                                             >
                                                  {supplierDeleting
                                                       ? <><RiLoader4Line size={15} style={{ animation: 'spin 1s linear infinite' }} /> Removing…</>
                                                       : <><RiCheckLine size={15} /> Yes, Remove</>
                                                  }
                                             </button>
                                        </div>
                                   </div>
                              </div>
                         </div>
                    </div>
               )}

               <style>{`
                    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
               `}</style>
          </div>
     );
}
