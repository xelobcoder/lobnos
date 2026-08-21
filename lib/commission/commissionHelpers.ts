import * as yup from "yup";
import { CommissionConfig, CommissionTier, CommissionAssignment, CommissionDefault } from "./commissionApi";


export const commissionConfigSchema = yup.object().shape({
     name: yup
          .string()
          .required("Configuration name is required")
          .min(3, "Name must be at least 3 characters"),
     description: yup.string().nullable(),
     commission_type: yup
          .string()
          .oneOf(
               [
                    "percentage",
                    "fixed",
                    "tiered",
                    "hybrid",
                    "sliding_scale",
                    "volume",
                    "quota",
                    "accelerating",
               ],
               "Invalid commission type"
          )
          .required("Commission type is required"),
     percentage_rate: yup
          .number()
          .typeError("Percentage rate must be a number")
          .nullable()
          .min(0, "Cannot be negative")
          .max(100, "Cannot exceed 100%")
          .when("commission_type", {
               is: (type: string) =>
                    type === "percentage" ||
                    type === "hybrid" ||
                    type === "sliding_scale",
               then: (schema) => schema.required("Percentage rate is required"),
               otherwise: (schema) => schema.nullable(),
          }),
     sliding_max_percentage: yup
          .number()
          .typeError("Maximum percentage rate must be a number")
          .nullable()
          .min(0, "Cannot be negative")
          .max(100, "Cannot exceed 100%")
          .when("commission_type", {
               is: "sliding_scale",
               then: (schema) => schema.required("Maximum percentage rate is required"),
               otherwise: (schema) => schema.nullable(),
          }),
     fixed_component: yup
          .number()
          .typeError("Fixed amount must be a number")
          .nullable()
          .min(0, "Cannot be negative")
          .when("commission_type", {
               is: (type: string) => type === "fixed" || type === "hybrid",
               then: (schema) => schema.required("Fixed amount is required"),
               otherwise: (schema) => schema.nullable(),
          }),
     min_commission: yup
          .number()
          .typeError("Minimum commission must be a number")
          .nullable()
          .min(0, "Cannot be negative"),
     max_commission: yup
          .number()
          .typeError("Maximum commission must be a number")
          .nullable()
          .min(0, "Cannot be negative")
          .test(
               "max-greater-than-min",
               "Maximum must be greater than minimum",
               function (value) {
                    const { min_commission } = this.parent;
                    if (value && min_commission && value < min_commission) {
                         return false;
                    }
                    return true;
               }
          ),
     period_cap: yup
          .number()
          .typeError("Period cap must be a number")
          .nullable()
          .min(0, "Cannot be negative"),
     period_cap_reset: yup.string().oneOf([
          "daily",
          "weekly",
          "monthly",
          "quarterly",
          "yearly",
     ]),
     volume_period: yup
          .string()
          .oneOf(["daily", "weekly", "monthly", "quarterly", "yearly"], "Invalid volume period")
          .nullable()
          .when("commission_type", {
               is: "volume",
               then: (schema) => schema.required("Volume period is required"),
               otherwise: (schema) => schema.nullable(),
          }),
     quota_target: yup
          .number()
          .typeError("Quota target must be a number")
          .nullable()
          .min(0, "Cannot be negative")
          .when("commission_type", {
               is: "quota",
               then: (schema) => schema.required("Quota target is required"),
               otherwise: (schema) => schema.nullable(),
          }),
     effective_from: yup.string().required("Effective from is required"),
     effective_to: yup.string().nullable(),
     is_active: yup.boolean().required("Active status is required"),
});

export const commissionAssignmentSchema = yup.object().shape({
     commission_config_id: yup
          .number()
          .required("Commission config is required")
          .positive("Must select a valid configuration"),
     scope_type: yup
          .string()
          .oneOf(
               ["clinician", "organization", "system"],
               "Invalid scope type"
          )
          .required("Scope type is required"),
     scope_id: yup.number().nullable(),
     scope_ids: yup.array().of(yup.number()).nullable(),
     service_id: yup.number().nullable(),
     service_category: yup.string().nullable(),
     priority: yup
          .number()
          .required("Priority is required")
          .min(1, "Priority must be at least 1")
          .max(10, "Priority cannot exceed 10"),
     assigned_from: yup.string().required("Assigned from is required"),
     assigned_to: yup.string().nullable(),
     is_active: yup.boolean().required("Active status is required"),
});

export const commissionDefaultSchema = yup.object().shape({
     recipient_type: yup
          .string()
          .oneOf(["clinician", "organization"], "Invalid recipient type")
          .required("Recipient type is required"),
     recipient_id: yup
          .number()
          .required("Recipient is required")
          .positive("Must select a valid recipient"),
     commission_config_id: yup
          .number()
          .required("Commission config is required")
          .positive("Must select a valid configuration"),
     is_active: yup.boolean(),
});

// ===================== Formatting & Display Helpers =====================

export function formatCommissionType(type: string): string {
     const typeMap: { [key: string]: string } = {
          percentage: "Percentage (%)",
          fixed: "Fixed Amount",
          tiered: "Tiered",
          hybrid: "Hybrid (% + Fixed)",
          sliding_scale: "Sliding Scale",
          volume: "Volume",
          quota: "Quota",
          accelerating: "Accelerating",
     };
     return typeMap[type] || type;
}

export function formatPeriodReset(period: string | undefined): string {
     if (!period) return "N/A";
     return period.charAt(0).toUpperCase() + period.slice(1);
}

export function formatScopeType(scope: string): string {
     const scopeMap: { [key: string]: string } = {
          clinician: "Clinician",
          organization: "Organization",
          system: "System-wide",
     };
     return scopeMap[scope] || scope;
}

export function getCommissionTypeDescription(type: string): string {
     const descriptions: { [key: string]: string } = {
          percentage:
               "Calculate commission as a percentage of service amount",
          fixed: "Fixed commission amount for all services",
          tiered: "Different rates based on service amount tiers",
          hybrid: "Combine percentage and fixed components",
          sliding_scale: "Performance-based rates that increase when targets are met",
          volume: "Layered rates based on eligible service volume in a period",
          quota: "Rate selection based on target achievement percentage",
          accelerating: "Progressive percentage rates across performance bands",
     };
     return descriptions[type] || "";
}

export function validateCommissionTierRanges(tiers: CommissionTier[]): string | null {
     if (tiers.length === 0) {
          return "Add at least one tier for this commission type";
     }

     const sortedTiers = [...tiers].sort(
          (first, second) => first.min_amount_inclusive - second.min_amount_inclusive
     );
     let expectedMinimum = 0;

     for (const tier of sortedTiers) {
          const maximum = tier.max_amount_exclusive ?? null;

          if (!Number.isFinite(tier.min_amount_inclusive) || tier.min_amount_inclusive < 0) {
               return "Each tier minimum must be a valid non-negative number";
          }
          if (tier.min_amount_inclusive < expectedMinimum) {
               return "Tier ranges overlap. Each tier must begin where the previous tier ends";
          }
          if (tier.min_amount_inclusive > expectedMinimum) {
               return "Tier ranges cannot contain gaps. Each tier must begin where the previous tier ends";
          }
          if (maximum === null) {
               if (tier !== sortedTiers[sortedTiers.length - 1]) {
                    return "An unbounded tier must be the final tier";
               }
               return null;
          }
          if (!Number.isFinite(maximum) || maximum <= tier.min_amount_inclusive) {
               return "Each tier maximum must be greater than its minimum";
          }

          expectedMinimum = maximum;
     }

     return null;
}

// ===================== Calculation Helpers =====================

export function calculateCommissionPreview(
     serviceAmount: number,
     config: CommissionConfig,
     tierMetric: number = 0
): {
     raw: number;
     afterMinCap: number;
     afterMaxCap: number;
     description: string;
     achievementPercentage?: number;
     selectedTier?: CommissionTier;
     breakdown?: Array<{
          minAmount: number;
          maxAmount: number;
          rate: number;
          commission: number;
     }>;
} {
     if (serviceAmount <= 0) {
          return {
               raw: 0,
               afterMinCap: 0,
               afterMaxCap: 0,
               description: "Invalid service amount",
               breakdown: [],
          };
     }

     let raw = 0;
     let selectedTier: CommissionTier | undefined;
     let achievementPercentage: number | undefined;
     let breakdown: Array<{
          minAmount: number;
          maxAmount: number;
          rate: number;
          commission: number;
     }> = [];

     const getMatchingTier = (metric: number) =>
          config.tiers
               ?.slice()
               .sort((first, second) => first.sort_order - second.sort_order)
               .find((tier) =>
                    metric >= tier.min_amount_inclusive &&
                    (tier.max_amount_exclusive == null || metric < tier.max_amount_exclusive)
               );
     const calculateTierValue = (tier: CommissionTier) =>
          tier.tier_type === "percentage"
               ? serviceAmount * (tier.tier_value / 100)
               : tier.tier_value;

     if (config.commission_type === "percentage") {
          raw = serviceAmount * ((config.percentage_rate || 0) / 100);
     } else if (config.commission_type === "sliding_scale") {
          const baseRate = config.percentage_rate || 0;
          const maximumRate = config.sliding_max_percentage ?? baseRate;
          const progressPercentage = Math.min(100, Math.max(0, tierMetric));
          const appliedRate = baseRate + ((maximumRate - baseRate) * progressPercentage) / 100;
          raw = serviceAmount * (appliedRate / 100);
     } else if (config.commission_type === "fixed") {
          raw = config.fixed_component || 0;
     } else if (config.commission_type === "hybrid") {
          const percentPart = serviceAmount * ((config.percentage_rate || 0) / 100);
          const fixedPart = config.fixed_component || 0;
          raw = percentPart + fixedPart;
     } else if (config.commission_type === "tiered") {
          selectedTier = getMatchingTier(serviceAmount);
          raw = selectedTier ? calculateTierValue(selectedTier) : 0;
     } else if (config.commission_type === "volume") {
          selectedTier = getMatchingTier(tierMetric);
          raw = selectedTier ? calculateTierValue(selectedTier) : 0;
     } else if (config.commission_type === "quota") {
          achievementPercentage = config.quota_target && config.quota_target > 0
               ? (tierMetric / config.quota_target) * 100
               : 0;
          const tier = getMatchingTier(achievementPercentage);
          selectedTier = tier;
          raw = selectedTier ? calculateTierValue(selectedTier) : 0;
     } else if (config.commission_type === "accelerating") {
          breakdown = (config.tiers || []).reduce<typeof breakdown>((segments, tier) => {
               const segmentEnd = tier.max_amount_exclusive ?? tierMetric;
               const segmentValue = Math.max(0, Math.min(tierMetric, segmentEnd) - tier.min_amount_inclusive);
               if (segmentValue > 0) {
                    segments.push({
                         minAmount: tier.min_amount_inclusive,
                         maxAmount: tier.min_amount_inclusive + segmentValue,
                         rate: tier.tier_value,
                         commission: (segmentValue * tier.tier_value) / 100,
                    });
               }
               return segments;
          }, []);
          raw = breakdown.reduce((total, segment) => total + segment.commission, 0);
     }

     let afterMinCap = raw;
     if (config.min_commission && raw < config.min_commission) {
          afterMinCap = config.min_commission;
     }

     let afterMaxCap = afterMinCap;
     if (config.max_commission && afterMinCap > config.max_commission) {
          afterMaxCap = config.max_commission;
     }

     return {
          raw: parseFloat(raw.toString()),
          afterMinCap: parseFloat(afterMinCap.toString()),
          afterMaxCap: parseFloat(afterMaxCap.toString()),
          description: `Service: GHS ${serviceAmount} → Commission: GHS ${afterMaxCap}`,
          achievementPercentage,
          selectedTier,
          breakdown,
     };
}

export function formatCurrency(amount: number): string {
     return new Intl.NumberFormat("en-GH", {
          style: "currency",
          currency: "GHS",
          minimumFractionDigits: 2,
     }).format(amount);
}

// ===================== Status & State Helpers =====================

export function getStatusBadgeClass(status: string): string {
     const statusMap: { [key: string]: string } = {
          pending: "bg-warning",
          approved: "bg-info",
          paid: "bg-success",
          voided: "bg-danger",
          adjusted: "bg-secondary",
     };
     return statusMap[status] || "bg-secondary";
}

export function isConfigActive(config: CommissionConfig): boolean {
     if (!config.is_active) return false;

     const today = new Date();
     today.setHours(0, 0, 0, 0);

     if (config.effective_from) {
          const from = new Date(config.effective_from);
          if (from > today) return false;
     }

     if (config.effective_to) {
          const to = new Date(config.effective_to);
          if (to < today) return false;
     }

     return true;
}

export function getConfigStatus(config: CommissionConfig): {
     status: string;
     label: string;
     color: string;
} {
     if (!config.is_active) {
          return { status: "inactive", label: "Inactive", color: "secondary" };
     }

     const today = new Date();
     today.setHours(0, 0, 0, 0);

     if (config.effective_from) {
          const from = new Date(config.effective_from);
          if (from > today) {
               return { status: "pending", label: "Pending", color: "warning" };
          }
     }

     if (config.effective_to) {
          const to = new Date(config.effective_to);
          if (to < today) {
               return { status: "expired", label: "Expired", color: "danger" };
          }
     }

     return { status: "active", label: "Active", color: "success" };
}
