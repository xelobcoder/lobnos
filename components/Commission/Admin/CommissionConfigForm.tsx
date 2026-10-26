"use client";

import React, { useState, useEffect, useRef } from "react";
import { useForm, Controller, Resolver } from "react-hook-form";
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
     formatCommissionType,
     calculateCommissionPreview,
     formatCurrency,
     validateCommissionTierRanges,
} from "../../../lib/commission/commissionHelpers";
import { useApplicationSettings } from "../../Auth/useApplicationContext";
import Loader from "../../isLoading";
import TierBuilder from "./TierBuilder";
import s from "./CommissionConfigWorkspace.module.css";

interface CommissionConfigFormProps {
     configId?: number;
     onSaved?: (config: CommissionConfig) => void;
     onCancel?: () => void;
}

type ValidityPeriodPreset = "custom" | "1-month" | "3-months" | "6-months" | "1-year" | "2-years";

interface CommissionTypeGuide {
     summary: string;
     calculation: string;
     setup: string[];
     example?: string;
     notes?: string[];
}

const commissionTypeGuides: Record<string, CommissionTypeGuide> = {
     percentage: {
          summary: "Pays one percentage of the commissionable amount for every eligible service.",
          calculation: "Commission = commissionable amount x percentage rate / 100.",
          setup: ["Enter the percentage rate.", "Use minimum, maximum, or period caps only when required."],
     },
     fixed: {
          summary: "Pays the same fixed amount for every eligible service, regardless of the service value.",
          calculation: "Commission = fixed amount.",
          setup: ["Enter the fixed amount in GHS.", "Use caps only when the fixed payment still needs a limit."],
     },
     tiered: {
          summary: "Selects one tier from the service amount and applies only that tier's rate or fixed amount.",
          calculation: "A GHS 150 service in a GHS 100 to GHS 200 tier uses that tier only.",
          setup: ["Create ranges using a minimum and exclusive maximum boundary.", "Use a blank maximum only for the final open-ended tier."],
     },
     hybrid: {
          summary: "Combines a percentage payment with a fixed payment for each eligible service.",
          calculation: "Commission = (commissionable amount x percentage rate / 100) + fixed amount.",
          setup: ["Enter both the percentage rate and fixed amount.", "Apply caps to the combined commission, not to each component separately."],
     },
     sliding_scale: {
          summary: "Uses a rate that can increase from the base rate toward the maximum rate as performance improves.",
          calculation: "The engine compares the configured performance period and chooses a rate between the base and maximum.",
          setup: ["Set the base percentage and the highest permitted percentage.", "Choose the period reset frequency used for performance comparison."],
     },
     volume: {
          summary: "Selects a rate from the number of eligible services completed within the selected period.",
          calculation: "The engine counts distinct eligible tracked services, includes the current service, then selects one volume tier.",
          setup: [
               "Choose the counting period. A monthly rule resets at the beginning of each month; a daily rule resets each day. The same rule can therefore pay different rates as the recipient's volume increases within a period.",
               "Create tier boundaries as service counts, not currency values. For example, [0, 51) covers services 0 through 50, [51, 101) covers services 51 through 100, and [101, unlimited) covers service 101 onward.",
               "Keep every boundary continuous. The next tier must start exactly where the prior tier ends, so 0-50, 50-200, and 200-unlimited are valid half-open ranges with no gaps or overlaps.",
               "Choose Percentage when the payment should scale with the current service amount. Choose Fixed when every service in that volume tier should pay the same GHS amount.",
          ],
          example: "Example: with monthly tiers of [0, 51) at 3%, [51, 101) at 5%, and [101, unlimited) at 8%, the 76th eligible service is in the 5% tier. A GHS 250 service therefore pays GHS 12.50 in commission.",
          notes: [
               "Only distinct eligible tracked services count. Submitting the same service repeatedly does not create additional volume.",
               "Volume selects one rate for the current service; it does not retroactively recalculate earlier services using the new rate.",
               "Use the preview's Eligible Service Count to test which tier will apply before saving the rule.",
          ],
     },
     quota: {
          summary: "Selects a rate from progress toward a target such as revenue, completed tests, or another supplied quota metric.",
          calculation: "Achievement = actual quota value / quota target x 100; the matching achievement tier determines the rate.",
          setup: ["Enter the quota target in GHS.", "Use achievement percentages, such as 80, 100, and 120, as tier boundaries."],
     },
     accelerating: {
          summary: "Applies increasing percentage rates to every performance segment reached, rather than selecting one tier.",
          calculation: "Each segment is calculated separately, then the segment commissions are added together.",
          setup: ["Use GHS performance ranges as tier boundaries.", "Accelerating tiers always use percentages; fixed tier amounts are not supported."],
     },
};

const toOptionalNumber = (value: unknown): number | null => {
     if (value === null || value === undefined || value === "") {
          return null;
     }

     const numberValue = Number(value);
     return Number.isFinite(numberValue) ? numberValue : null;
};

const toDateInputValue = (value: unknown): string => {
     if (!value) {
          return "";
     }

     const dateValue = String(value);
     return /^\d{4}-\d{2}-\d{2}/.test(dateValue) ? dateValue.slice(0, 10) : "";
};

const formatLocalDate = (date: Date): string => {
     const year = date.getFullYear();
     const month = String(date.getMonth() + 1).padStart(2, "0");
     const day = String(date.getDate()).padStart(2, "0");
     return `${year}-${month}-${day}`;
};

const calculateEffectiveTo = (effectiveFrom: string, preset: ValidityPeriodPreset): string => {
     if (preset === "custom" || !effectiveFrom) {
          return "";
     }

     const endDate = new Date(`${effectiveFrom}T00:00:00`);
     const monthsToAdd: Record<Exclude<ValidityPeriodPreset, "custom">, number> = {
          "1-month": 1,
          "3-months": 3,
          "6-months": 6,
          "1-year": 12,
          "2-years": 24,
     };
     endDate.setMonth(endDate.getMonth() + monthsToAdd[preset]);
     endDate.setDate(endDate.getDate() - 1);
     return formatLocalDate(endDate);
};

const normalizeCommissionTiers = (tiers: CommissionTier[] = []): CommissionTier[] =>
     tiers.map((tier, index) => ({
          min_amount_inclusive: toOptionalNumber(tier.min_amount_inclusive) ?? 0,
          max_amount_exclusive: toOptionalNumber(tier.max_amount_exclusive),
          tier_type: tier.tier_type,
          tier_value: toOptionalNumber(tier.tier_value) ?? 0,
          sort_order: toOptionalNumber(tier.sort_order) ?? index + 1,
     }));

export default function CommissionConfigForm({
     configId,
     onSaved,
     onCancel,
}: CommissionConfigFormProps) {
     const [loading, setLoading] = useState(configId ? true : false);
     const [saving, setSaving] = useState(false);
     const [loadError, setLoadError] = useState("");
     const [saveError, setSaveError] = useState("");
     const [revision, setRevision] = useState(0);
     const saveLock = useRef(false);
     const [serviceAmount, setServiceAmount] = useState(100);
     const [volumeServiceCount, setVolumeServiceCount] = useState(1);
     const [actualQuotaValue, setActualQuotaValue] = useState(100000);
     const [performanceAmount, setPerformanceAmount] = useState(100);
     const [slidingScaleProgress, setSlidingScaleProgress] = useState(0);
     const [validityPeriodPreset, setValidityPeriodPreset] = useState<ValidityPeriodPreset>("custom");
     const [tiers, setTiers] = useState<CommissionTier[]>([]);
     const [showTierBuilder, setShowTierBuilder] = useState(false);

     const {
          control,
          watch,
          handleSubmit,
          setValue,
          formState: { errors },
     } = useForm<CommissionConfig>({
          resolver: yupResolver(commissionConfigSchema) as Resolver<CommissionConfig>,
          defaultValues: {
               name: "",
               description: "",
               commission_type: "percentage",
               percentage_rate: 10,
               sliding_max_percentage: 15,
               min_commission: 0,
               max_commission: 1000,
               period_cap: 5000,
               period_cap_reset: "monthly",
               volume_period: "monthly",
               quota_target: 100000,
               effective_from: new Date().toISOString().split("T")[0],
               is_active: true,
          },
     });

     const commissionType = watch("commission_type");
     const commissionTypeGuide = commissionTypeGuides[commissionType];

     // Load existing config
     useEffect(() => {
          if (configId) {
               const fetchConfig = async () => {
                    setLoading(true); setLoadError("");
                    try {
                         const response = await getCommissionConfig(configId);
                         if (response?.status === "success" && response.result) {
                              const config = response.result;
                              setValue("name", config.name);
                              setValue("description", config.description || "");
                              setValue("commission_type", config.commission_type);
                              setValue("percentage_rate", toOptionalNumber(config.percentage_rate));
                              setValue("sliding_max_percentage", toOptionalNumber(config.sliding_max_percentage));
                              setValue("fixed_component", toOptionalNumber(config.fixed_component));
                              setValue("min_commission", toOptionalNumber(config.min_commission));
                              setValue("max_commission", toOptionalNumber(config.max_commission));
                              setValue("period_cap", toOptionalNumber(config.period_cap));
                              setValue("period_cap_reset", config.period_cap_reset);
                              setValue("volume_period", config.volume_period || "monthly");
                              setValue("quota_target", toOptionalNumber(config.quota_target));
                              setValue("effective_from", toDateInputValue(config.effective_from));
                              setValue("effective_to", toDateInputValue(config.effective_to));
                              setValue("is_active", Number(config.is_active) === 1);
                              if (config.tiers) {
                                   setTiers(normalizeCommissionTiers(config.tiers));
                              }
                         } else { throw new Error(response?.message || "Failed to load configuration"); }
                    } catch (error) {
                         setLoadError("Failed to load configuration. Retry before editing this rule.");
                    } finally {
                         setLoading(false);
                    }
               };
               fetchConfig();
          }
     }, [configId, setValue, revision]);

     const onSubmit = async (data: CommissionConfig) => {
          if (saveLock.current) return;
          setSaveError("");
          const configData = { ...data };
          delete configData.commission_base;
          const requiresTiers = ["tiered", "volume", "quota", "accelerating"].includes(data.commission_type);
          const tierRangeError = requiresTiers ? validateCommissionTierRanges(tiers) : null;
          if (tierRangeError) {
               setSaveError(tierRangeError);
               return;
          }

          try {
               saveLock.current = true;
               setSaving(true);
               const payload: CommissionConfig = {
                    ...configData,
                    description: data.description || null,
                    percentage_rate:
                         data.commission_type === "fixed" || data.commission_type === "tiered" || data.commission_type === "volume" || data.commission_type === "quota" || data.commission_type === "accelerating"
                              ? null
                              : data.percentage_rate ?? null,
                    sliding_max_percentage:
                         data.commission_type === "sliding_scale" ? data.sliding_max_percentage ?? null : null,
                    fixed_component:
                         data.commission_type === "tiered" || data.commission_type === "sliding_scale" || data.commission_type === "volume" || data.commission_type === "quota" || data.commission_type === "accelerating"
                              ? null
                              : data.fixed_component ?? null,
                    volume_period:
                         data.commission_type === "volume" ? data.volume_period ?? "monthly" : null,
                    quota_target:
                         data.commission_type === "quota" ? data.quota_target ?? null : null,
                    tiers: ["tiered", "volume", "quota", "accelerating"].includes(data.commission_type) ? tiers : undefined,
               };

               const response = configId
                    ? await updateCommissionConfig(configId, payload)
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
                    setSaveError(response?.message || "Failed to save configuration");
               }
          } catch (error: any) {
               setSaveError(error?.message || "An error occurred");
          } finally {
               saveLock.current = false;
               setSaving(false);
          }
     };

     if (loading) {
          return <Loader />;
     }

     const currentConfig: CommissionConfig = {
          commission_type: commissionType,
          name: "",
          effective_from: "",
          is_active: true,
     };

     const tierMetric = commissionType === "volume"
          ? volumeServiceCount
          : commissionType === "quota"
               ? actualQuotaValue
               : commissionType === "accelerating"
                    ? performanceAmount
                    : commissionType === "sliding_scale"
                         ? slidingScaleProgress
                         : 0;

     const preview = calculateCommissionPreview(serviceAmount, {
          ...currentConfig,
          percentage_rate: watch("percentage_rate"),
          sliding_max_percentage: watch("sliding_max_percentage"),
          fixed_component: watch("fixed_component"),
          min_commission: watch("min_commission"),
          max_commission: watch("max_commission"),
          quota_target: watch("quota_target"),
          tiers,
     }, tierMetric);

     const tierMetricLabel = commissionType === "volume"
          ? "Eligible Service Count"
          : commissionType === "quota"
               ? "Actual Quota Value"
               : commissionType === "accelerating"
                    ? "Performance Amount"
                    : commissionType === "sliding_scale"
                         ? "Performance Progress (%)"
                         : null;
     const tierMetricPrefix = commissionType === "volume" || commissionType === "sliding_scale" ? null : "GHS";
     const requiresTiersForPreview = ["tiered", "volume", "quota", "accelerating"].includes(commissionType);

     const handleTierMetricChange = (value: number) => {
          if (commissionType === "volume") {
               setVolumeServiceCount(value);
          } else if (commissionType === "quota") {
               setActualQuotaValue(value);
          } else if (commissionType === "accelerating") {
               setPerformanceAmount(value);
          } else if (commissionType === "sliding_scale") {
               setSlidingScaleProgress(Math.min(100, value));
          }
     };

     const handleValidityPeriodChange = (preset: ValidityPeriodPreset) => {
          setValidityPeriodPreset(preset);
          if (preset !== "custom") {
               setValue("effective_to", calculateEffectiveTo(watch("effective_from"), preset));
          }
     };

     if (loadError) return <div role="alert" className="alert alert-danger">{loadError}<div className="d-flex gap-2 mt-3"><button type="button" className="btn btn-outline-secondary" onClick={() => setRevision(v => v + 1)}>Retry configuration</button><button type="button" className="btn btn-outline-secondary" onClick={onCancel}>Back to configurations</button></div></div>;
     return (
          <div className={`${s.form} card`}>
               <div className="card-body">
                    <form onSubmit={handleSubmit(onSubmit)}>
                         {saveError && <div role="alert" className="alert alert-danger">{saveError}</div>}
                         <fieldset disabled={saving}>
                         <div className="row g-4">
                              <div className="col-lg-8">
                                   {/* Configuration Name */}
                                   <div className="mb-3">
                                        <label htmlFor="name" className="form-label fw-semibold">
                                             Configuration Name <span className="text-danger">*</span>
                                        </label>
                                        <Controller
                                             name="name"
                                             control={control}
                                             render={({ field }) => (
                                                  <input
                                                       {...field}
                                                       id={field.name}
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

                                   <div className="mb-3">
                                        <label htmlFor="description" className="form-label fw-semibold">
                                             Description
                                        </label>
                                        <Controller
                                             name="description"
                                             control={control}
                                             render={({ field }) => (
                                                  <textarea
                                                       {...field}
                                                       id={field.name}
                                                       value={field.value || ""}
                                                       className="form-control"
                                                       rows={2}
                                                       placeholder="Optional commission description"
                                                  />
                                             )}
                                        />
                                   </div>

                                   <div className="row">
                                        <div className="col-12 mb-3">
                                             <label htmlFor="commission_type" className="form-label fw-semibold">
                                                  Commission Type <span className="text-danger">*</span>
                                             </label>
                                             <Controller
                                                  name="commission_type"
                                                  control={control}
                                                  render={({ field }) => (
                                                       <select
                                                            {...field}
                                                            id={field.name}
                                                            className={`form-select ${errors.commission_type ? "is-invalid" : ""}`}
                                                       >
                                                            <option value="percentage">Percentage (%)</option>
                                                            <option value="fixed">Fixed Amount</option>
                                                            <option value="tiered">Tiered</option>
                                                            <option value="hybrid">Hybrid (% + Fixed)</option>
                                                            <option value="sliding_scale">Sliding Scale</option>
                                                            <option value="volume">Volume</option>
                                                            <option value="quota">Quota</option>
                                                            <option value="accelerating">Accelerating</option>
                                                       </select>
                                                  )}
                                             />
                                             {errors.commission_type && (
                                                  <div className="invalid-feedback d-block">
                                                       {errors.commission_type.message}
                                                  </div>
                                             )}
                                        </div>
                                   </div>

                                   {/* Commission Type Fields */}
                                   {(commissionType === "percentage" || commissionType === "hybrid" || commissionType === "sliding_scale") && (
                                        <div className="mb-3">
                                             <label htmlFor="percentage_rate" className="form-label fw-semibold">
                                                  {commissionType === "sliding_scale" ? "Base Percentage Rate (%)" : "Percentage Rate (%)"}
                                                  {(commissionType === "percentage" || commissionType === "sliding_scale") && (
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
                                                                 id={field.name}
                                                                 value={field.value ?? ""}
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

                                   {commissionType === "sliding_scale" && (
                                        <div className="mb-3">
                                             <label htmlFor="sliding_max_percentage" className="form-label fw-semibold">
                                                  Maximum Percentage Rate (%) <span className="text-danger">*</span>
                                             </label>
                                             <Controller
                                                  name="sliding_max_percentage"
                                                  control={control}
                                                  render={({ field }) => (
                                                       <div className="input-group">
                                                            <input
                                                                 {...field}
                                                                 id={field.name}
                                                                 value={field.value ?? ""}
                                                                 type="number"
                                                                 step="0.01"
                                                                 className={`form-control ${errors.sliding_max_percentage ? "is-invalid" : ""
                                                                      }`}
                                                                 placeholder="0.00"
                                                            />
                                                            <span className="input-group-text">%</span>
                                                       </div>
                                                  )}
                                             />
                                             {errors.sliding_max_percentage && (
                                                  <div className="invalid-feedback d-block">
                                                       {errors.sliding_max_percentage.message}
                                                  </div>
                                             )}
                                             <small className="text-muted">
                                                  The rate will increase up to this maximum if performance improves.
                                             </small>
                                        </div>
                                   )}

                                   {(commissionType === "fixed" || commissionType === "hybrid") && (
                                        <div className="mb-3">
                                             <label htmlFor="fixed_component" className="form-label fw-semibold">
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
                                                                 id={field.name}
                                                                 value={field.value ?? ""}
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

                                   {commissionType === "tiered" || commissionType === "volume" || commissionType === "quota" || commissionType === "accelerating" ? (
                                        <div className="mb-3">
                                             <div className="d-flex justify-content-between align-items-center mb-2">
                                                  <label className="form-label fw-semibold mb-0">
                                                       {commissionType === "volume"
                                                            ? "Volume Tiers"
                                                            : commissionType === "quota"
                                                                 ? "Quota Tiers"
                                                                 : commissionType === "accelerating"
                                                                      ? "Accelerating Tiers"
                                                                      : "Commission Tiers"}
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
                                                  <TierBuilder
                                                       tiers={tiers}
                                                       onTiersChange={setTiers}
                                                       commissionType={commissionType}
                                                  />
                                             )}
                                             {tiers.length > 0 && (
                                                  <div className="alert alert-info mt-2 small">
                                                       {tiers.length} tier(s) configured
                                                  </div>
                                             )}
                                        </div>
                                   ) : null}

                                   {commissionType === "volume" && (
                                        <div className="mb-3">
                                             <label htmlFor="volume_period" className="form-label fw-semibold">
                                                  Volume Period <span className="text-danger">*</span>
                                             </label>
                                             <Controller
                                                  name="volume_period"
                                                  control={control}
                                                  render={({ field }) => (
                                                       <select {...field} id={field.name} value={field.value ?? "monthly"} className="form-select">
                                                            <option value="daily">Daily</option>
                                                            <option value="weekly">Weekly</option>
                                                            <option value="monthly">Monthly</option>
                                                            <option value="quarterly">Quarterly</option>
                                                            <option value="yearly">Yearly</option>
                                                       </select>
                                                  )}
                                             />
                                        </div>
                                   )}

                                   {commissionType === "quota" && (
                                        <div className="mb-3">
                                             <label htmlFor="quota_target" className="form-label fw-semibold">
                                                  Quota Target <span className="text-danger">*</span>
                                             </label>
                                             <Controller
                                                  name="quota_target"
                                                  control={control}
                                                  render={({ field }) => (
                                                       <div className="input-group">
                                                            <span className="input-group-text">GHS</span>
                                                            <input
                                                                 {...field}
                                                                 id={field.name}
                                                                 value={field.value ?? ""}
                                                                 type="number"
                                                                 step="0.01"
                                                                 className={`form-control ${errors.quota_target ? "is-invalid" : ""}`}
                                                                 placeholder="0.00"
                                                            />
                                                       </div>
                                                  )}
                                             />
                                             {errors.quota_target && (
                                                  <div className="invalid-feedback d-block">
                                                       {errors.quota_target.message}
                                                  </div>
                                             )}
                                        </div>
                                   )}

                                   {/* Commission Caps */}
                                   <div className="row">
                                        <div className="col-md-6 mb-3">
                                             <label htmlFor="min_commission" className="form-label fw-semibold">
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
                                                                 id={field.name}
                                                                 value={field.value ?? ""}
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
                                             <label htmlFor="max_commission" className="form-label fw-semibold">
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
                                                                 id={field.name}
                                                                 value={field.value ?? ""}
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
                                             <label htmlFor="period_cap" className="form-label fw-semibold">
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
                                                                 id={field.name}
                                                                 value={field.value ?? ""}
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
                                             <label htmlFor="period_cap_reset" className="form-label fw-semibold">
                                                  Period Reset Frequency
                                             </label>
                                             <Controller
                                                  name="period_cap_reset"
                                                  control={control}
                                                  render={({ field }) => (
                                                       <select {...field} id={field.name} className="form-select">
                                                            <option value="daily">Daily</option>
                                                            <option value="weekly">Weekly</option>
                                                            <option value="monthly">Monthly</option>
                                                            <option value="quarterly">Quarterly</option>
                                                            <option value="yearly">Yearly</option>
                                                       </select>
                                                  )}
                                             />
                                             {commissionType === "sliding_scale" && (
                                                  <small className="text-muted d-block mt-1">
                                                       This defines the period used to compare performance improvement.
                                                  </small>
                                             )}
                                        </div>
                                   </div>

                                   {/* Validity Period */}
                                   <div className="mb-3">
                                        <label htmlFor="validity_period" className="form-label fw-semibold">
                                             Validity Period Helper
                                        </label>
                                        <select
                                             id="validity_period"
                                             className="form-select"
                                             value={validityPeriodPreset}
                                             onChange={(event) => handleValidityPeriodChange(event.target.value as ValidityPeriodPreset)}
                                        >
                                             <option value="custom">Custom end date</option>
                                             <option value="1-month">One month</option>
                                             <option value="3-months">Three months</option>
                                             <option value="6-months">Six months</option>
                                             <option value="1-year">One year</option>
                                             <option value="2-years">Two years</option>
                                        </select>
                                        <small className="text-muted">Sets Effective To from Effective From. You can switch back to Custom to enter any end date.</small>
                                   </div>

                                   <div className="row">
                                        <div className="col-md-6 mb-3">
                                             <label htmlFor="effective_from" className="form-label fw-semibold">
                                                  Effective From
                                             </label>
                                             <Controller
                                                  name="effective_from"
                                                  control={control}
                                                  render={({ field }) => (
                                                       <input
                                                            {...field}
                                                            id={field.name}
                                                            value={field.value ?? ""}
                                                            type="date"
                                                            className="form-control"
                                                            onChange={(event) => {
                                                                 field.onChange(event);
                                                                 if (validityPeriodPreset !== "custom") {
                                                                      setValue("effective_to", calculateEffectiveTo(event.target.value, validityPeriodPreset));
                                                                 }
                                                            }}
                                                       />
                                                  )}
                                             />
                                        </div>

                                        <div className="col-md-6 mb-3">
                                             <label htmlFor="effective_to" className="form-label fw-semibold">
                                                  Effective To
                                             </label>
                                             <Controller
                                                  name="effective_to"
                                                  control={control}
                                                  render={({ field }) => (
                                                       <input
                                                            {...field}
                                                            id={field.name}
                                                            value={field.value ?? ""}
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
                                                  render={({ field: { value, ...field } }) => (
                                                       <input
                                                            {...field}
                                                            type="checkbox"
                                                            className="form-check-input"
                                                            id="is_active"
                                                            checked={value}
                                                       />
                                                  )}
                                             />
                                             <label className="form-check-label" htmlFor="is_active">
                                                  Active
                                             </label>
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
                                                  disabled={saving}
                                                  onClick={onCancel}
                                             >
                                                  Cancel
                                             </button>
                                        )}
                                   </div>
                              </div>

                              <div className="col-lg-4">
                                   {/* Preview Section */}
                                   <div className="border rounded p-3 mb-3 bg-white">
                                        <h6 className="fw-bold mb-2">Commission Preview</h6>
                                        <div className="mb-2">
                                             <label htmlFor="serviceAmount" className="form-label fw-semibold small">
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
                                        {tierMetricLabel && (
                                             <div className="mb-2">
                                                  <label htmlFor="tierMetric" className="form-label fw-semibold small">
                                                       {tierMetricLabel} (for preview):
                                                  </label>
                                                  <div className="input-group input-group-sm">
                                                       {tierMetricPrefix && <span className="input-group-text">{tierMetricPrefix}</span>}
                                                       <input
                                                            type="number"
                                                            id="tierMetric"
                                                            min="0"
                                                            max={commissionType === "sliding_scale" ? 100 : undefined}
                                                            className="form-control"
                                                            value={tierMetric}
                                                            onChange={(e) => handleTierMetricChange(parseFloat(e.target.value) || 0)}
                                                       />
                                                  </div>
                                             </div>
                                        )}
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
                                        {requiresTiersForPreview && tiers.length === 0 && (
                                             <div className="alert alert-warning small py-2 mb-0">
                                                  Configure at least one tier to calculate this preview.
                                             </div>
                                        )}
                                        {requiresTiersForPreview && tiers.length > 0 && commissionType !== "accelerating" && !preview.selectedTier && (
                                             <div className="alert alert-warning small py-2 mb-0">
                                                  No configured tier matches the current preview value.
                                             </div>
                                        )}
                                        {commissionType === "quota" && (
                                             <div className="border-top mt-3 pt-2 small">
                                                  <div className="d-flex justify-content-between mb-1">
                                                       <span>Quota Target:</span>
                                                       <span className="fw-medium">{formatCurrency(watch("quota_target") || 0)}</span>
                                                  </div>
                                                  <div className="d-flex justify-content-between mb-1">
                                                       <span>Achievement:</span>
                                                       <span className="fw-medium">{(preview.achievementPercentage || 0).toFixed(1)}%</span>
                                                  </div>
                                                  <div className="d-flex justify-content-between">
                                                       <span>Selected Tier:</span>
                                                       <span className="fw-medium">
                                                            {preview.selectedTier
                                                                 ? `${preview.selectedTier.min_amount_inclusive}%+ at ${preview.selectedTier.tier_value}${preview.selectedTier.tier_type === "percentage" ? "%" : " GHS"}`
                                                                 : "No matching tier"}
                                                       </span>
                                                  </div>
                                             </div>
                                        )}
                                        {commissionType === "accelerating" && preview.breakdown && preview.breakdown.length > 0 && (
                                             <div className="border-top mt-3 pt-2 small">
                                                  <div className="fw-medium mb-1">Progressive Calculation</div>
                                                  {preview.breakdown.map((segment) => (
                                                       <div
                                                            key={`${segment.minAmount}-${segment.maxAmount}-${segment.rate}`}
                                                            className="d-flex justify-content-between mb-1"
                                                       >
                                                            <span>
                                                                 {formatCurrency(segment.minAmount)} - {formatCurrency(segment.maxAmount)} at {segment.rate}%
                                                            </span>
                                                            <span className="fw-medium">{formatCurrency(segment.commission)}</span>
                                                       </div>
                                                  ))}
                                             </div>
                                        )}
                                   </div>


                                   <details className="border rounded p-3 bg-white">
                                        <summary className="fw-medium mb-3">How this calculation works</summary>
                                        <h5 className="fs-6 mb-2">
                                             {formatCommissionType(commissionType)}
                                        </h5>
                                        <p className="text-muted small mb-3">
                                             {commissionTypeGuide?.summary}
                                        </p>
                                        <div className="border-top pt-3 small">
                                             <div className="fw-medium mb-1">Calculation</div>
                                             <p className="mb-3">{commissionTypeGuide?.calculation}</p>
                                             <div className="fw-medium mb-1">Configure It</div>
                                             <ul className="ps-3 mb-0 text-muted">
                                                  {commissionTypeGuide?.setup.map((item) => (
                                                       <li key={item} className="mb-1">{item}</li>
                                                  ))}
                                             </ul>
                                        </div>
                                        {commissionTypeGuide?.example && (
                                             <div className="border-top mt-3 pt-3 small">
                                                  <div className="fw-medium mb-1">Worked Example</div>
                                                  <p className="mb-0 text-muted">{commissionTypeGuide.example}</p>
                                             </div>
                                        )}
                                        {commissionTypeGuide?.notes && (
                                             <div className="border-top mt-3 pt-3 small">
                                                  <div className="fw-medium mb-1">Important Notes</div>
                                                  <ul className="ps-3 mb-0 text-muted">
                                                       {commissionTypeGuide.notes.map((note) => (
                                                            <li key={note} className="mb-1">{note}</li>
                                                       ))}
                                                  </ul>
                                             </div>
                                        )}
                                        {commissionType === "accelerating" && (
                                             <div className="border-top mt-3 pt-3 small text-muted">
                                                  A GHS 25,000 performance amount with 3%, 5%, and 8% bands pays each portion at its own rate, not the highest rate on the full amount.
                                             </div>
                                        )}
                                   </details>
                              </div>
                         </div>
                    </fieldset>
                    </form>
               </div>
          </div>
     );
}
