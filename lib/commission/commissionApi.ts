import { customFetch, customPost } from "../../components/Auth/customFetch";

// ===================== API Response Types =====================
export interface ApiResponse<T> {
     status: string;
     statusCode: number;
     message: string;
     result: T;
}

// ===================== Commission Config Types =====================
export interface CommissionTier {
     min_amount_inclusive: number;
     max_amount_exclusive: number | null;
     tier_type: "percentage" | "fixed";
     tier_value: number;
     sort_order: number;
}

export interface CommissionConfig {
     id?: number;
     tenantId: number;
     name: string;
     commission_type: "percentage" | "fixed" | "tiered" | "hybrid";
     percentage_rate?: number;
     fixed_component?: number;
     min_commission?: number;
     max_commission?: number;
     period_cap?: number;
     period_cap_reset?: "daily" | "weekly" | "monthly" | "quarterly" | "yearly";
     effective_from?: string;
     effective_to?: string;
     is_active: boolean;
     tiers?: CommissionTier[];
}

// ===================== Commission Assignment Types =====================
export interface CommissionAssignment {
     id?: number;
     tenantId: number;
     commission_config_id: number;
     scope_type: "clinician" | "organization" | "system";
     scope_id: number | null;
     service_id?: number | null;
     service_category?: string | null;
     priority: number;
     assigned_from?: string;
     assigned_to?: string;
     is_active: boolean;
}

// ===================== Commission Default Types =====================
export interface CommissionDefault {
     id?: number;
     tenantId: number;
     recipient_type: "clinician" | "organization";
     recipient_id: number;
     commission_config_id: number;
     is_active: boolean;
}

// ===================== Commission Tracking Types =====================
export interface CommissionTracking {
     id: number;
     service_id: number;
     service_amount: number;
     commission_type: string;
     percentage_rate_applied?: number;
     fixed_amount_applied?: number;
     commission_due: number;
     min_cap_adjustment: number;
     max_cap_adjustment: number;
     period_cap_adjustment: number;
     final_commission: number;
     recipient_type: string;
     recipient_id: number;
     status: "pending" | "approved" | "paid" | "voided" | "adjusted";
     currency: string;
     calculated_at: string;
     config_id: number;
     assignment_id?: number;
}

// ===================== Commission Config API =====================
export async function createCommissionConfig(
     config: CommissionConfig
): Promise<ApiResponse<CommissionConfig>> {
     return customPost("commission/configs", "POST", config);
}

export async function getCommissionConfigs(
     tenantId: number
): Promise<ApiResponse<CommissionConfig[]>> {
     return customFetch(`commission/configs?tenantId=${tenantId}`);
}

export async function getCommissionConfig(
     id: number,
     tenantId: number
): Promise<ApiResponse<CommissionConfig>> {
     return customFetch(`commission/configs/${id}?tenantId=${tenantId}`);
}

export async function updateCommissionConfig(
     id: number,
     tenantId: number,
     config: Partial<CommissionConfig>
): Promise<ApiResponse<CommissionConfig>> {
     return customPost(`commission/configs/${id}?tenantId=${tenantId}`, "PUT", config);
}

export async function deleteCommissionConfig(
     id: number,
     tenantId: number
): Promise<ApiResponse<any>> {
     return customPost(`commission/configs/${id}?tenantId=${tenantId}`, "DELETE", {});
}

// ===================== Commission Assignment API =====================
export async function createCommissionAssignment(
     assignment: CommissionAssignment
): Promise<ApiResponse<CommissionAssignment>> {
     return customPost("commission/assignments", "POST", assignment);
}

export async function getCommissionAssignments(
     tenantId: number,
     configId?: number
): Promise<ApiResponse<CommissionAssignment[]>> {
     let url = `commission/assignments?tenantId=${tenantId}`;
     if (configId) url += `&commission_config_id=${configId}`;
     return customFetch(url);
}

export async function getCommissionAssignment(
     id: number,
     tenantId: number
): Promise<ApiResponse<CommissionAssignment>> {
     return customFetch(`commission/assignments/${id}?tenantId=${tenantId}`);
}

export async function updateCommissionAssignment(
     id: number,
     tenantId: number,
     assignment: Partial<CommissionAssignment>
): Promise<ApiResponse<CommissionAssignment>> {
     return customPost(
          `commission/assignments/${id}?tenantId=${tenantId}`,
          "PUT",
          assignment
     );
}

export async function deleteCommissionAssignment(
     id: number,
     tenantId: number
): Promise<ApiResponse<any>> {
     return customPost(`commission/assignments/${id}?tenantId=${tenantId}`, "DELETE", {});
}

// ===================== Commission Default API =====================
export async function createCommissionDefault(
     defaultConfig: CommissionDefault
): Promise<ApiResponse<CommissionDefault>> {
     return customPost("commission/defaults", "POST", defaultConfig);
}

export async function getCommissionDefaults(
     tenantId: number,
     recipientType?: string,
     recipientId?: number
): Promise<ApiResponse<CommissionDefault[]>> {
     let url = `commission/defaults?tenantId=${tenantId}`;
     if (recipientType) url += `&recipient_type=${recipientType}`;
     if (recipientId) url += `&recipient_id=${recipientId}`;
     return customFetch(url);
}

export async function getCommissionDefault(
     id: number,
     tenantId: number
): Promise<ApiResponse<CommissionDefault>> {
     return customFetch(`commission/defaults/${id}?tenantId=${tenantId}`);
}

export async function updateCommissionDefault(
     id: number,
     tenantId: number,
     defaultConfig: Partial<CommissionDefault>
): Promise<ApiResponse<CommissionDefault>> {
     return customPost(
          `commission/defaults/${id}?tenantId=${tenantId}`,
          "PUT",
          defaultConfig
     );
}

export async function deleteCommissionDefault(
     id: number,
     tenantId: number
): Promise<ApiResponse<any>> {
     return customPost(`commission/defaults/${id}?tenantId=${tenantId}`, "DELETE", {});
}

// ===================== Commission Tracking API =====================
export async function getUnpaidCommissions(
     tenantId: number,
     recipientType: string,
     recipientId: number,
     limit: number = 100
): Promise<ApiResponse<CommissionTracking[]>> {
     return customFetch(
          `commission/tracking/unpaid?tenantId=${tenantId}&recipientType=${recipientType}&recipientId=${recipientId}&limit=${limit}`
     );
}

export async function getCommissionSummary(
     tenantId: number,
     recipientType: string,
     recipientId: number
): Promise<ApiResponse<any>> {
     return customFetch(
          `commission/tracking/summary?tenantId=${tenantId}&recipientType=${recipientType}&recipientId=${recipientId}`
     );
}

export async function getCommissionByStatus(
     tenantId: number,
     status: string,
     recipientType: string,
     recipientId: number
): Promise<ApiResponse<CommissionTracking[]>> {
     return customFetch(
          `commission/tracking/status/${status}?tenantId=${tenantId}&recipientType=${recipientType}&recipientId=${recipientId}`
     );
}

export async function updateCommissionStatus(
     id: number,
     tenantId: number,
     status: string,
     notes?: string
): Promise<ApiResponse<CommissionTracking>> {
     return customPost(`commission/tracking/${id}/status?tenantId=${tenantId}`, "PUT", {
          status,
          notes,
     });
}
