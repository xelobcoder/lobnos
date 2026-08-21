"use client";

import React, { useState } from "react";
import { CommissionTier } from "../../../lib/commission/commissionApi";
import { validateCommissionTierRanges } from "../../../lib/commission/commissionHelpers";
import PrimeTable from "../../accessories/Datatables/PrimeTable";
import { RiAddLine, RiEdit2Line, RiDeleteBin6Line } from "@remixicon/react";


interface TierBuilderProps {
     tiers: CommissionTier[];
     onTiersChange: (tiers: CommissionTier[]) => void;
     commissionType: "tiered" | "volume" | "quota" | "accelerating";
}

export default function TierBuilder({ tiers, onTiersChange, commissionType }: TierBuilderProps) {
     const [editingIndex, setEditingIndex] = useState<number | null>(null);
     const [formData, setFormData] = useState<CommissionTier>({
          min_amount_inclusive: 0,
          max_amount_exclusive: null,
          tier_type: "percentage",
          tier_value: 0,
          sort_order: 1,
     });
     const isVolumeTier = commissionType === "volume";
     const isQuotaTier = commissionType === "quota";
     const isAcceleratingTier = commissionType === "accelerating";
     const [tierError, setTierError] = useState<string | null>(null);
     const boundaryLabel = isVolumeTier
          ? "Service Count"
          : isQuotaTier
               ? "Achievement (%)"
               : isAcceleratingTier
                    ? "Performance Amount"
                    : "Service Amount";
     const boundaryPrefix = isVolumeTier || isQuotaTier ? "" : "GHS";

     const handleAddTier = () => {
          const newTier: CommissionTier = {
               ...formData,
               tier_type: isAcceleratingTier ? "percentage" : formData.tier_type,
               sort_order: Math.max(...tiers.map((t) => t.sort_order), 0) + 1,
          };
          const updatedTiers = editingIndex !== null
               ? tiers.map((tier, index) => index === editingIndex ? newTier : tier)
               : [...tiers, newTier];
          const validationError = validateCommissionTierRanges(updatedTiers);

          if (validationError) {
               setTierError(validationError);
               return;
          }

          if (editingIndex !== null) {
               onTiersChange(updatedTiers);
               setEditingIndex(null);
          } else {
               onTiersChange(updatedTiers);
          }

          setTierError(null);

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
          setTierError(null);
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

     const columns = [
          {
               Header: `Minimum ${boundaryLabel}`,
               accessor: "min_amount_inclusive",
               Cell: ({ value }: { value: number }) => <span>{boundaryPrefix ? `${boundaryPrefix} ` : ""}{value}</span>,
          },
          {
               Header: `Maximum ${boundaryLabel}`,
               accessor: "max_amount_exclusive",
               Cell: ({ value }: { value: number | null | undefined }) => (
                    <span>{value == null ? "Unlimited" : `${boundaryPrefix ? `${boundaryPrefix} ` : ""}${value}`}</span>
               ),
          },
          {
               Header: "Type",
               accessor: "tier_type",
               Cell: ({ value }: { value: CommissionTier["tier_type"] }) => (
                    <span className="badge bg-info">{value === "percentage" ? "%" : "GHS"}</span>
               ),
          },
          {
               Header: "Rate",
               accessor: "tier_value",
               Cell: ({ row }: any) => {
                    const tier = row.original as CommissionTier;
                    return <span className="fw-semibold">{tier.tier_value}{tier.tier_type === "percentage" ? "%" : ""}</span>;
               },
          },
          {
               Header: "Actions",
               accessor: "actions",
               disableSortBy: true,
               Cell: ({ row }: any) => {
                    const tierIndex = tiers.indexOf(row.original as CommissionTier);
                    return (
                         <div className="d-flex gap-1">
                              <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => handleEditTier(tierIndex)} title="Edit">
                                   <RiEdit2Line />
                              </button>
                              <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteTier(tierIndex)} title="Delete">
                                   <RiDeleteBin6Line />
                              </button>
                         </div>
                    );
               },
          },
     ];

     return (
          <div className="border rounded p-3 bg-white">
               {/* Form */}
               <div className="mb-4 pb-3 border-bottom">
                    <h6 className="fw-semibold mb-3">
                         {editingIndex !== null ? "Edit Tier" : "Add New Tier"}
                    </h6>

                    <div className="row g-3">
                         <div className="col-md-3">
                              <label className="form-label small fw-medium">Minimum {boundaryLabel}</label>
                              <div className="input-group input-group-sm">
                                   {boundaryPrefix && <span className="input-group-text">{boundaryPrefix}</span>}
                                   <input
                                        type="number"
                                        min="0"
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
                              <label className="form-label small fw-medium">Maximum {boundaryLabel}</label>
                              <div className="input-group input-group-sm">
                                   {boundaryPrefix && <span className="input-group-text">{boundaryPrefix}</span>}
                                   <input
                                        type="number"
                                        min="0"
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
                              {isAcceleratingTier ? (
                                   <input
                                        type="text"
                                        className="form-control form-control-sm"
                                        value="Percentage"
                                        readOnly
                                   />
                              ) : (
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
                              )}
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
                    {tierError && <div className="text-danger small mt-2">{tierError}</div>}
               </div>

               {/* Tiers List */}
               {tiers.length > 0 ? (
                    <div>
                         <h6 className="fw-semibold mb-2">Configured Tiers</h6>
                         <PrimeTable column={columns} data={tiers} filtering={false} />
                    </div>
               ) : (
                    <div className="alert alert-info mb-0">
                         Tier ranges use [minimum, maximum): shared boundaries are allowed, and the final tier may have no maximum.
                    </div>
               )}
          </div>
     );
}
