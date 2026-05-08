"use client";

import React, { useState } from "react";
import { CommissionTier } from "../../../lib/commission/commissionApi";
import { RiAddLine, RiEdit2Line, RiDeleteBin6Line } from "@remixicon/react";


interface TierBuilderProps {
     tiers: CommissionTier[];
     onTiersChange: (tiers: CommissionTier[]) => void;
}

export default function TierBuilder({ tiers, onTiersChange }: TierBuilderProps) {
     const [editingIndex, setEditingIndex] = useState<number | null>(null);
     const [formData, setFormData] = useState<CommissionTier>({
          min_amount_inclusive: 0,
          max_amount_exclusive: null,
          tier_type: "percentage",
          tier_value: 0,
          sort_order: 1,
     });

     const handleAddTier = () => {
          const newTier: CommissionTier = {
               ...formData,
               sort_order: Math.max(...tiers.map((t) => t.sort_order), 0) + 1,
          };

          if (editingIndex !== null) {
               const updated = [...tiers];
               updated[editingIndex] = newTier;
               onTiersChange(updated);
               setEditingIndex(null);
          } else {
               onTiersChange([...tiers, newTier]);
          }

          setFormData({
               min_amount_inclusive: 0,
               max_amount_exclusive: null,
               tier_type: "percentage",
               tier_value: 0,
               sort_order: 1,
          });
     };

     const handleDeleteTier = (index: number) => {
          onTiersChange(tiers.filter((_, i) => i !== index));
     };

     const handleEditTier = (index: number) => {
          setFormData(tiers[index]);
          setEditingIndex(index);
     };

     const handleCancel = () => {
          setEditingIndex(null);
          setFormData({
               min_amount_inclusive: 0,
               max_amount_exclusive: null,
               tier_type: "percentage",
               tier_value: 0,
               sort_order: 1,
          });
     };

     return (
          <div className="border rounded p-3 bg-white">
               {/* Form */}
               <div className="mb-4 pb-3 border-bottom">
                    <h6 className="fw-semibold mb-3">
                         {editingIndex !== null ? "Edit Tier" : "Add New Tier"}
                    </h6>

                    <div className="row g-3">
                         <div className="col-md-3">
                              <label className="form-label small fw-medium">Min Amount</label>
                              <div className="input-group input-group-sm">
                                   <span className="input-group-text">GHS</span>
                                   <input
                                        type="number"
                                        className="form-control"
                                        value={formData.min_amount_inclusive}
                                        onChange={(e) =>
                                             setFormData({
                                                  ...formData,
                                                  min_amount_inclusive: parseFloat(e.target.value) || 0,
                                             })
                                        }
                                   />
                              </div>
                         </div>

                         <div className="col-md-3">
                              <label className="form-label small fw-medium">Max Amount</label>
                              <div className="input-group input-group-sm">
                                   <span className="input-group-text">GHS</span>
                                   <input
                                        type="number"
                                        className="form-control"
                                        placeholder="Empty = No limit"
                                        value={formData.max_amount_exclusive ?? ""}
                                        onChange={(e) =>
                                             setFormData({
                                                  ...formData,
                                                  max_amount_exclusive: e.target.value
                                                       ? parseFloat(e.target.value)
                                                       : null,
                                             })
                                        }
                                   />
                              </div>
                         </div>

                         <div className="col-md-2">
                              <label className="form-label small fw-medium">Type</label>
                              <select
                                   className="form-select form-select-sm"
                                   value={formData.tier_type}
                                   onChange={(e) =>
                                        setFormData({
                                             ...formData,
                                             tier_type: e.target.value as "percentage" | "fixed",
                                        })
                                   }
                              >
                                   <option value="percentage">Percentage</option>
                                   <option value="fixed">Fixed</option>
                              </select>
                         </div>

                         <div className="col-md-2">
                              <label className="form-label small fw-medium">
                                   Rate {formData.tier_type === "percentage" ? "(%)" : "(GHS)"}
                              </label>
                              <input
                                   type="number"
                                   step="0.01"
                                   className="form-control form-control-sm"
                                   value={formData.tier_value}
                                   onChange={(e) =>
                                        setFormData({
                                             ...formData,
                                             tier_value: parseFloat(e.target.value) || 0,
                                        })
                                   }
                              />
                         </div>

                         <div className="col-md-2 d-flex align-items-end gap-1">
                              <button
                                   type="button"
                                   className="btn btn-sm btn-success flex-grow-1"
                                   onClick={handleAddTier}
                              >
                                   <RiAddLine className="me-1" />
                                   {editingIndex !== null ? "Update" : "Add"}
                              </button>
                              {editingIndex !== null && (
                                   <button
                                        type="button"
                                        className="btn btn-sm btn-secondary"
                                        onClick={handleCancel}
                                   >
                                        Cancel
                                   </button>
                              )}
                         </div>
                    </div>
               </div>

               {/* Tiers List */}
               {tiers.length > 0 ? (
                    <div>
                         <h6 className="fw-semibold mb-2">Configured Tiers</h6>
                         <div className="table-responsive">
                              <table className="table table-sm table-hover mb-0">
                                   <thead className="table-light">
                                        <tr>
                                             <th>Min Amount</th>
                                             <th>Max Amount</th>
                                             <th>Type</th>
                                             <th>Rate</th>
                                             <th style={{ width: "120px" }}>Actions</th>
                                        </tr>
                                   </thead>
                                   <tbody>
                                        {tiers.map((tier, index) => (
                                             <tr key={index}>
                                                  <td>GHS {tier.min_amount_inclusive}</td>
                                                  <td>
                                                       {tier.max_amount_exclusive === null
                                                            ? "Unlimited"
                                                            : `GHS ${tier.max_amount_exclusive}`}
                                                  </td>
                                                  <td>
                                                       <span className="badge bg-info">
                                                            {tier.tier_type === "percentage" ? "%" : "GHS"}
                                                       </span>
                                                  </td>
                                                  <td className="fw-semibold">
                                                       {tier.tier_value}
                                                       {tier.tier_type === "percentage" ? "%" : ""}
                                                  </td>
                                                  <td>
                                                       <button
                                                            type="button"
                                                            className="btn btn-sm btn-outline-primary me-1"
                                                            onClick={() => handleEditTier(index)}
                                                            title="Edit"
                                                       >
                                                            <RiEdit2Line />
                                                       </button>
                                                       <button
                                                            type="button"
                                                            className="btn btn-sm btn-outline-danger"
                                                            onClick={() => handleDeleteTier(index)}
                                                            title="Delete"
                                                       >
                                                            <RiDeleteBin6Line />
                                                       </button>
                                                  </td>
                                             </tr>
                                        ))}
                                   </tbody>
                              </table>
                         </div>
                    </div>
               ) : (
                    <div className="alert alert-info mb-0">
                         No tiers added yet. Add tiers above to configure tiered commissions.
                    </div>
               )}
          </div>
     );
}
