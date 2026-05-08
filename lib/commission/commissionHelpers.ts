import * as yup from "yup";
import { CommissionConfig, CommissionAssignment, CommissionDefault } from "./commissionApi";

// ===================== Validation Schemas =====================

export const commissionConfigSchema = yup.object().shape({
     name: yup
          .string()
          .required("Configuration name is required")
          .min(3, "Name must be at least 3 characters"),
     commission_type: yup
          .string()
          .oneOf(
               ["percentage", "fixed", "tiered", "hybrid"],
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
               is: (type: string) => type === "percentage" || type === "hybrid",
               then: (schema) => schema.required("Percentage rate is required"),
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
          .min(0, "Cannot be negative"),
     max_commission: yup
          .number()
          .typeError("Maximum commission must be a number")
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
          .min(0, "Cannot be negative"),
     period_cap_reset: yup.string().oneOf([
          "daily",
          "weekly",
          "monthly",
          "quarterly",
          "yearly",
     ]),
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
     scope_id: yup.number().when("scope_type", {
          is: (type: string) => type !== "system",
          then: (schema) => schema.required("Scope ID is required").positive(),
          otherwise: (schema) => schema.nullable(),
     }),
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
     };
     return descriptions[type] || "";
}

// ===================== Calculation Helpers =====================

export function calculateCommissionPreview(
     serviceAmount: number,
     config: CommissionConfig
): {
     raw: number;
     afterMinCap: number;
     afterMaxCap: number;
     description: string;
} {
     if (serviceAmount <= 0) {
          return {
               raw: 0,
               afterMinCap: 0,
               afterMaxCap: 0,
               description: "Invalid service amount",
          };
     }

     let raw = 0;

     if (config.commission_type === "percentage") {
          raw = serviceAmount * ((config.percentage_rate || 0) / 100);
     } else if (config.commission_type === "fixed") {
          raw = config.fixed_component || 0;
     } else if (config.commission_type === "hybrid") {
          const percentPart = serviceAmount * ((config.percentage_rate || 0) / 100);
          const fixedPart = config.fixed_component || 0;
          raw = percentPart + fixedPart;
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
