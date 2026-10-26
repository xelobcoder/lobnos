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
     max_amount_exclusive?: number | null;
     tier_type: "percentage" | "fixed";
     tier_value: number;
     sort_order: number;
}

export interface CommissionConfig {
     id?: number;
     name: string;
     description?: string | null;
     commission_base?: "gross" | "outsourced_net" | null;
     commission_type: "percentage" | "fixed" | "tiered" | "hybrid" | "sliding_scale" | "volume" | "quota" | "accelerating";
     percentage_rate?: number | null;
     sliding_max_percentage?: number | null;
     fixed_component?: number | null;
     min_commission?: number | null;
     max_commission?: number | null;
     period_cap?: number | null;
     period_cap_reset?: "daily" | "weekly" | "monthly" | "quarterly" | "yearly";
     volume_period?: "daily" | "weekly" | "monthly" | "quarterly" | "yearly" | null;
     quota_target?: number | null;
     effective_from: string;
     effective_to?: string | null;
     is_active: boolean;
     tiers?: CommissionTier[];
}

// ===================== Commission Assignment Types =====================
export interface CommissionAssignment {
     id?: number;
     commission_config_id: number;
     scope_type: "clinician" | "organization" | "system";
     scope_id: number | null;
     recipient_name?: string;
     service_id?: number | null;
     service_category?: string | null;
     priority: number;
     assigned_from?: string;
     assigned_to?: string;
     is_active: boolean | number;
}

export interface CommissionAssignmentParams {
     page: number;
     count: number;
     filterType?: string;
     filterName?: string;
     status?: string;
     commission_config_id?: number;
     sortby?: "ASC" | "DESC";
}

// ===================== Commission Default Types =====================
export interface CommissionDefault {
     id?: number;
     recipient_type: "clinician" | "organization";
     recipient_id?: number;
     commission_config_id: number;
     is_active: boolean | number;
     created_at?: string;
     updated_at?: string;
     config?: CommissionConfig;
}

export type CommissionDefaultResponse = CommissionDefault | CommissionDefault[];

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

export async function getCommissionConfigs(): Promise<ApiResponse<CommissionConfig[]>> {
     return customFetch(`commission/configs`);
}

export async function getCommissionConfig(
     id: number
): Promise<ApiResponse<CommissionConfig>> {
     return customFetch(`commission/configs/${id}`);
}

export async function updateCommissionConfig(
     id: number,
     config: Partial<CommissionConfig>
): Promise<ApiResponse<CommissionConfig>> {
     return customPost(`commission/configs/${id}`, "PUT", config);
}

export async function deleteCommissionConfig(
     id: number
): Promise<ApiResponse<any>> {
     return customPost(`commission/configs/${id}`, "DELETE", {});
}

// ===================== Commission Assignment API =====================
export async function createCommissionAssignment(
     assignment: CommissionAssignment | CommissionAssignment[]
): Promise<ApiResponse<CommissionAssignment | CommissionAssignment[]>> {
     return customPost("commission/assignments", "POST", assignment);
}

export async function getCommissionAssignments(
     params: CommissionAssignmentParams
): Promise<ApiResponse<CommissionAssignment[]>> {
     const { page, count, filterType, filterName, status, commission_config_id, sortby = "DESC" } = params;
     let url = `commission/assignments?page=${page}&count=${count}&sortby=${sortby}`;
     if (filterType && filterType !== "all") url += `&filterType=${filterType}`;
     if (filterName) url += `&filterName=${encodeURIComponent(filterName)}`;
     if (status) url += `&status=${encodeURIComponent(status)}`;
     if (commission_config_id) url += `&commission_config_id=${commission_config_id}`;
     return customFetch(url);
}

export async function getCommissionAssignment(
     id: number
): Promise<ApiResponse<CommissionAssignment>> {
     return customFetch(`commission/assignments/${id}`);
}

export async function updateCommissionAssignment(
     id: number,
     assignment: Partial<CommissionAssignment>
): Promise<ApiResponse<CommissionAssignment>> {
     return customPost(
          `commission/assignments/${id}`,
          "PUT",
          assignment
     );
}

export async function deleteCommissionAssignment(
     id: number
): Promise<ApiResponse<any>> {
     return customPost(`commission/assignments/${id}`, "DELETE", {});
}

// ===================== Commission Default API =====================
export async function createCommissionDefault(
     defaultConfig: CommissionDefault
): Promise<ApiResponse<CommissionDefault>> {
     return customPost("commission/defaults", "POST", defaultConfig);
}

export async function getCommissionDefaults(
     recipientType?: string,
     recipientId?: number
): Promise<ApiResponse<CommissionDefaultResponse>> {
     let url = `commission/defaults?`;
     if (recipientType) url += `&recipient_type=${recipientType}`;
     if (recipientId) url += `&recipient_id=${recipientId}`;
     return customFetch(url);
}

export async function getCommissionDefault(
     id: number
): Promise<ApiResponse<CommissionDefault>> {
     return customFetch(`commission/defaults/${id}`);
}

export async function updateCommissionDefault(
     id: number,
     defaultConfig: Partial<CommissionDefault>
): Promise<ApiResponse<CommissionDefault>> {
     return customPost(
          `commission/defaults/${id}`,
          "PUT",
          defaultConfig
     );
}

export async function deleteCommissionDefault(
     id: number
): Promise<ApiResponse<any>> {
     return customPost(`commission/defaults/${id}`, "DELETE", {});
}

// ===================== Commission Tracking API =====================
export async function getUnpaidCommissions(
     recipientType: string,
     recipientId: number,
     limit: number = 100
): Promise<ApiResponse<CommissionTracking[]>> {
     return customFetch(
          `commission/tracking/unpaid?recipientType=${recipientType}&recipientId=${recipientId}&limit=${limit}`
     );
}

export async function getCommissionSummary(
     recipientType: string,
     recipientId: number
): Promise<ApiResponse<any>> {
     return customFetch(
          `commission/tracking/summary?recipientType=${recipientType}&recipientId=${recipientId}`
     );
}

export async function getCommissionByStatus(
     status: string,
     recipientType: string,
     recipientId: number
): Promise<ApiResponse<CommissionTracking[]>> {
     return customFetch(
          `commission/tracking/status/${status}?recipientType=${recipientType}&recipientId=${recipientId}`
     );
}

export async function updateCommissionStatus(
     id: number,
     status: string,
     notes?: string
): Promise<ApiResponse<CommissionTracking>> {
     return customPost(`commission/tracking/${id}/status`, "PUT", {
          status,
          notes,
     });
}
