"use client";

import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { toast } from "react-toastify";
import {
     CommissionConfig,
     CommissionTier,
     createCommissionConfig,
     updateCommissionConfig,
     getCommissionConfig,
} from "../../../lib/commission/commissionApi";
import {
     commissionConfigSchema,
     getCommissionTypeDescription,
     calculateCommissionPreview,
     formatCurrency,
} from "../../../lib/commission/commissionHelpers";
import { useApplicationSettings } from "../../Auth/useApplicationContext";
import Loader from "../../isLoading";
import TierBuilder from "./TierBuilder";

interface CommissionConfigFormProps {
     configId?: number;
     onSaved?: (config: CommissionConfig) => void;
     onCancel?: () => void;
}

export default function CommissionConfigForm({
     configId,
     onSaved,
     onCancel,
}: CommissionConfigFormProps) {
     const { applicationsettings } = useApplicationSettings();
     const [loading, setLoading] = useState(configId ? true : false);
     const [saving, setSaving] = useState(false);
     const [serviceAmount, setServiceAmount] = useState(100);
     const [tiers, setTiers] = useState<CommissionTier[]>([]);
     const [showTierBuilder, setShowTierBuilder] = useState(false);

     const {
          control,
          watch,
          handleSubmit,
          setValue,
          formState: { errors },
     } = useForm<CommissionConfig>({
          resolver: yupResolver(commissionConfigSchema),
          defaultValues: {
               commission_type: "percentage",
               percentage_rate: 10,
               min_commission: 0,
               max_commission: 1000,
               period_cap: 5000,
               period_cap_reset: "monthly",
               is_active: true,
               tenantId: applicationsettings?.tenantid || 1,
          },
     });

     const commissionType = watch("commission_type");
     const tenantId = applicationsettings?.tenantid || 1;

     // Load existing config
     useEffect(() => {
          if (configId) {
               const fetchConfig = async () => {
                    try {
                         const response = await getCommissionConfig(configId, tenantId);
                         if (response?.status === "success") {
                              const config = response.result;
                              setValue("name", config.name);
                              setValue("commission_type", config.commission_type);
                              setValue("percentage_rate", config.percentage_rate);
                              setValue("fixed_component", config.fixed_component);
                              setValue("min_commission", config.min_commission);
                              setValue("max_commission", config.max_commission);
                              setValue("period_cap", config.period_cap);
                              setValue("period_cap_reset", config.period_cap_reset);
                              setValue("effective_from", config.effective_from);
                              setValue("effective_to", config.effective_to);
                              setValue("is_active", config.is_active);
                              if (config.tiers) {
                                   setTiers(config.tiers);
                              }
                         }
                    } catch (error) {
                         toast.error("Failed to load configuration");
                    } finally {
                         setLoading(false);
                    }
               };
               fetchConfig();
          }
     }, [configId, tenantId, setValue]);

     const onSubmit = async (data: CommissionConfig) => {
          try {
               setSaving(true);
               const payload: CommissionConfig = {
                    ...data,
                    tenantId,
                    percentage_rate:
                         data.commission_type === "tiered" || data.commission_type === "fixed" ? null : data.percentage_rate ?? null,
                    fixed_component:
                         data.commission_type === "tiered" ? null : data.fixed_component ?? null,
                    tiers: data.commission_type === "tiered" ? tiers : undefined,
               };

               const response = configId
                    ? await updateCommissionConfig(configId, tenantId, payload)
                    : await createCommissionConfig(payload);

               if (response?.status === "success") {
                    toast.success(
                         configId
                              ? "Configuration updated successfully"
                              : "Configuration created successfully"
                    );
                    if (onSaved) {
                         onSaved(response.result);
                    }
               } else {
                    toast.error(response?.message || "Failed to save configuration");
               }
          } catch (error: any) {
               toast.error(error?.message || "An error occurred");
          } finally {
               setSaving(false);
          }
     };

     if (loading) {
          return <Loader />;
     }

     const currentConfig: CommissionConfig = {
          commission_type: commissionType,
          tenantId,
          name: "",
          is_active: true,
     };

     const preview = calculateCommissionPreview(serviceAmount, {
          ...currentConfig,
          percentage_rate: watch("percentage_rate"),
          fixed_component: watch("fixed_component"),
          min_commission: watch("min_commission"),
          max_commission: watch("max_commission"),
     });

     return (
          <div className="card">
               <div className="card-body">
                    <form onSubmit={handleSubmit(onSubmit)}>
                         {/* Configuration Name */}
                         <div className="mb-3">
                              <label htmlFor="name" className="form-label fw-medium">
                                   Configuration Name <span className="text-danger">*</span>
                              </label>
                              <Controller
                                   name="name"
                                   control={control}
                                   render={({ field }) => (
                                        <input
                                             {...field}
                                             type="text"
                                             className={`form-control ${errors.name ? "is-invalid" : ""}`}
                                             placeholder="e.g., Specialist Doctor Commission"
                                        />
                                   )}
                              />
                              {errors.name && (
                                   <div className="invalid-feedback d-block">{errors.name.message}</div>
                              )}
                         </div>

                         {/* Commission Type */}
                         <div className="mb-3">
                              <label htmlFor="commission_type" className="form-label fw-medium">
                                   Commission Type <span className="text-danger">*</span>
                              </label>
                              <Controller
                                   name="commission_type"
                                   control={control}
                                   render={({ field }) => (
                                        <select
                                             {...field}
                                             className={`form-select ${errors.commission_type ? "is-invalid" : ""
                                                  }`}
                                        >
                                             <option value="percentage">Percentage (%)</option>
                                             <option value="fixed">Fixed Amount</option>
                                             <option value="tiered">Tiered</option>
                                             <option value="hybrid">Hybrid (% + Fixed)</option>
                                        </select>
                                   )}
                              />
                              {errors.commission_type && (
                                   <div className="invalid-feedback d-block">
                                        {errors.commission_type.message}
                                   </div>
                              )}
                              <small className="text-muted d-block mt-1">
                                   {getCommissionTypeDescription(commissionType)}
                              </small>
                         </div>

                         {/* Commission Type Fields */}
                         {(commissionType === "percentage" || commissionType === "hybrid") && (
                              <div className="mb-3">
                                   <label htmlFor="percentage_rate" className="form-label fw-medium">
                                        Percentage Rate (%)
                                        {commissionType === "percentage" && (
                                             <span className="text-danger">*</span>
                                        )}
                                   </label>
                                   <Controller
                                        name="percentage_rate"
                                        control={control}
                                        render={({ field }) => (
                                             <div className="input-group">
                                                  <input
                                                       {...field}
                                                       type="number"
                                                       step="0.01"
                                                       className={`form-control ${errors.percentage_rate ? "is-invalid" : ""
                                                            }`}
                                                       placeholder="0.00"
                                                  />
                                                  <span className="input-group-text">%</span>
                                             </div>
                                        )}
                                   />
                                   {errors.percentage_rate && (
                                        <div className="invalid-feedback d-block">
                                             {errors.percentage_rate.message}
                                        </div>
                                   )}
                              </div>
                         )}

                         {(commissionType === "fixed" || commissionType === "hybrid") && (
                              <div className="mb-3">
                                   <label htmlFor="fixed_component" className="form-label fw-medium">
                                        Fixed Amount
                                        {commissionType === "fixed" && (
                                             <span className="text-danger">*</span>
                                        )}
                                   </label>
                                   <Controller
                                        name="fixed_component"
                                        control={control}
                                        render={({ field }) => (
                                             <div className="input-group">
                                                  <span className="input-group-text">GHS</span>
                                                  <input
                                                       {...field}
                                                       type="number"
                                                       step="0.01"
                                                       className={`form-control ${errors.fixed_component ? "is-invalid" : ""
                                                            }`}
                                                       placeholder="0.00"
                                                  />
                                             </div>
                                        )}
                                   />
                                   {errors.fixed_component && (
                                        <div className="invalid-feedback d-block">
                                             {errors.fixed_component.message}
                                        </div>
                                   )}
                              </div>
                         )}

                         {/* Tiered Configuration */}
                         {commissionType === "tiered" && (
                              <div className="mb-3">
                                   <div className="d-flex justify-content-between align-items-center mb-2">
                                        <label className="form-label fw-medium mb-0">
                                             Commission Tiers
                                        </label>
                                        <button
                                             type="button"
                                             className="btn btn-sm btn-primary"
                                             onClick={() => setShowTierBuilder(!showTierBuilder)}
                                        >
                                             {showTierBuilder ? "Hide" : "Configure"} Tiers
                                        </button>
                                   </div>
                                   {showTierBuilder && (
                                        <TierBuilder tiers={tiers} onTiersChange={setTiers} />
                                   )}
                                   {tiers.length > 0 && (
                                        <div className="alert alert-info mt-2 small">
                                             {tiers.length} tier(s) configured
                                        </div>
                                   )}
                              </div>
                         )}

                         {/* Commission Caps */}
                         <div className="row">
                              <div className="col-md-6 mb-3">
                                   <label htmlFor="min_commission" className="form-label fw-medium">
                                        Minimum Commission
                                   </label>
                                   <Controller
                                        name="min_commission"
                                        control={control}
                                        render={({ field }) => (
                                             <div className="input-group">
                                                  <span className="input-group-text">GHS</span>
                                                  <input
                                                       {...field}
                                                       type="number"
                                                       step="0.01"
                                                       className={`form-control ${errors.min_commission ? "is-invalid" : ""
                                                            }`}
                                                       placeholder="0.00"
                                                  />
                                             </div>
                                        )}
                                   />
                                   {errors.min_commission && (
                                        <div className="invalid-feedback d-block">
                                             {errors.min_commission.message}
                                        </div>
                                   )}
                                   <small className="text-muted">Minimum amount per service</small>
                              </div>

                              <div className="col-md-6 mb-3">
                                   <label htmlFor="max_commission" className="form-label fw-medium">
                                        Maximum Commission
                                   </label>
                                   <Controller
                                        name="max_commission"
                                        control={control}
                                        render={({ field }) => (
                                             <div className="input-group">
                                                  <span className="input-group-text">GHS</span>
                                                  <input
                                                       {...field}
                                                       type="number"
                                                       step="0.01"
                                                       className={`form-control ${errors.max_commission ? "is-invalid" : ""
                                                            }`}
                                                       placeholder="0.00"
                                                  />
                                             </div>
                                        )}
                                   />
                                   {errors.max_commission && (
                                        <div className="invalid-feedback d-block">
                                             {errors.max_commission.message}
                                        </div>
                                   )}
                                   <small className="text-muted">Maximum amount per service</small>
                              </div>
                         </div>

                         {/* Period Cap */}
                         <div className="row">
                              <div className="col-md-6 mb-3">
                                   <label htmlFor="period_cap" className="form-label fw-medium">
                                        Period Cap
                                   </label>
                                   <Controller
                                        name="period_cap"
                                        control={control}
                                        render={({ field }) => (
                                             <div className="input-group">
                                                  <span className="input-group-text">GHS</span>
                                                  <input
                                                       {...field}
                                                       type="number"
                                                       step="0.01"
                                                       className={`form-control ${errors.period_cap ? "is-invalid" : ""
                                                            }`}
                                                       placeholder="0.00"
                                                  />
                                             </div>
                                        )}
                                   />
                                   {errors.period_cap && (
                                        <div className="invalid-feedback d-block">
                                             {errors.period_cap.message}
                                        </div>
                                   )}
                                   <small className="text-muted">Max per period</small>
                              </div>

                              <div className="col-md-6 mb-3">
                                   <label htmlFor="period_cap_reset" className="form-label fw-medium">
                                        Period Reset Frequency
                                   </label>
                                   <Controller
                                        name="period_cap_reset"
                                        control={control}
                                        render={({ field }) => (
                                             <select {...field} className="form-select">
                                                  <option value="daily">Daily</option>
                                                  <option value="weekly">Weekly</option>
                                                  <option value="monthly">Monthly</option>
                                                  <option value="quarterly">Quarterly</option>
                                                  <option value="yearly">Yearly</option>
                                             </select>
                                        )}
                                   />
                              </div>
                         </div>

                         {/* Validity Period */}
                         <div className="row">
                              <div className="col-md-6 mb-3">
                                   <label htmlFor="effective_from" className="form-label fw-medium">
                                        Effective From
                                   </label>
                                   <Controller
                                        name="effective_from"
                                        control={control}
                                        render={({ field }) => (
                                             <input
                                                  {...field}
                                                  type="date"
                                                  className="form-control"
                                             />
                                        )}
                                   />
                              </div>

                              <div className="col-md-6 mb-3">
                                   <label htmlFor="effective_to" className="form-label fw-medium">
                                        Effective To
                                   </label>
                                   <Controller
                                        name="effective_to"
                                        control={control}
                                        render={({ field }) => (
                                             <input
                                                  {...field}
                                                  type="date"
                                                  className="form-control"
                                             />
                                        )}
                                   />
                              </div>
                         </div>

                         {/* Active Status */}
                         <div className="mb-3">
                              <div className="form-check">
                                   <Controller
                                        name="is_active"
                                        control={control}
                                        render={({ field }) => (
                                             <input
                                                  {...field}
                                                  type="checkbox"
                                                  className="form-check-input"
                                                  id="is_active"
                                                  checked={field.value}
                                             />
                                        )}
                                   />
                                   <label className="form-check-label" htmlFor="is_active">
                                        Active
                                   </label>
                              </div>
                         </div>

                         {/* Preview Section */}
                         <div className="border rounded p-3 mb-3 bg-light">
                              <h6 className="fw-bold mb-2">Commission Preview</h6>
                              <div className="mb-2">
                                   <label htmlFor="serviceAmount" className="form-label small">
                                        Test Service Amount (for preview):
                                   </label>
                                   <div className="input-group input-group-sm">
                                        <span className="input-group-text">GHS</span>
                                        <input
                                             type="number"
                                             id="serviceAmount"
                                             className="form-control"
                                             value={serviceAmount}
                                             onChange={(e) =>
                                                  setServiceAmount(parseFloat(e.target.value) || 0)
                                             }
                                        />
                                   </div>
                              </div>
                              <div className="small">
                                   <div className="d-flex justify-content-between mb-1">
                                        <span>Raw Calculation:</span>
                                        <span className="fw-bold">{formatCurrency(preview.raw)}</span>
                                   </div>
                                   <div className="d-flex justify-content-between mb-1">
                                        <span>After Min Cap:</span>
                                        <span className="fw-bold">{formatCurrency(preview.afterMinCap)}</span>
                                   </div>
                                   <div className="d-flex justify-content-between">
                                        <span>Final Commission:</span>
                                        <span className="fw-bold text-success">
                                             {formatCurrency(preview.afterMaxCap)}
                                        </span>
                                   </div>
                              </div>
                         </div>

                         {/* Action Buttons */}
                         <div className="d-flex gap-2 pt-3">
                              <button
                                   type="submit"
                                   className="btn btn-primary"
                                   disabled={saving}
                              >
                                   {saving ? (
                                        <>
                                             <span
                                                  className="spinner-border spinner-border-sm me-2"
                                                  role="status"
                                                  aria-hidden="true"
                                             ></span>
                                             Saving...
                                        </>
                                   ) : (
                                        "Save Configuration"
                                   )}
                              </button>
                              {onCancel && (
                                   <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={onCancel}
                                   >
                                        Cancel
                                   </button>
                              )}
                         </div>
                    </form>
               </div>
          </div>
     );
}
