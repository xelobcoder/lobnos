"use client";

import React from "react";
import Link from "next/link";
import { toast } from "react-toastify";
import { customFetch, customPost } from "../../../../components/Auth/customFetch";
import { useApplicationSettings } from "../../../../components/Auth/useApplicationContext";

interface DiscountLimitRule {
  id?: number;
  role: string;
  is_active: number | boolean;
  max_discount_per_transaction: string | number;
  min_transaction_total_for_discount: string | number | null;
  max_discount_per_day: string | number;
  max_surcharge_per_transaction: string | number;
  min_transaction_total_for_surcharge: string | number | null;
  max_surcharge_per_day: string | number;
  updated_by_employeeid?: number;
}

interface DiscountUsageRecord {
  id: number;
  usage_date: string;
  employeeid: number;
  role: string;
  discount_total: string;
  surcharge_total: string;
  created_at: string;
  updated_at: string;
}

const recommendedRoles = [
  "customer service representative",
  "scientist",
  "accountant",
  "manager",
];

const escalationChainLabel =
  "Customer Service Representative / Scientist → Accountant → Manager";

const normalizeRule = (
  partial?: Partial<DiscountLimitRule> | null,
  roleName?: string
): DiscountLimitRule => ({
  id: partial?.id,
  role: (partial?.role || roleName || "").toLowerCase(),
  is_active: partial?.is_active ?? 1,
  max_discount_per_transaction: partial?.max_discount_per_transaction ?? "0",
  min_transaction_total_for_discount:
    partial?.min_transaction_total_for_discount ?? "0",
  max_discount_per_day: partial?.max_discount_per_day ?? "0",
  max_surcharge_per_transaction: partial?.max_surcharge_per_transaction ?? "0",
  min_transaction_total_for_surcharge:
    partial?.min_transaction_total_for_surcharge ?? "0",
  max_surcharge_per_day: partial?.max_surcharge_per_day ?? "0",
  updated_by_employeeid: partial?.updated_by_employeeid,
});

const toNullableNumber = (value: string | number | null | undefined) => {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const toNonNegativeNumberOrNull = (value: string | number | null | undefined) => {
  const parsed = toNullableNumber(value);
  if (parsed === null) return null;
  if (parsed < 0) return null;
  return parsed;
};

export default function DiscountLimitsPage() {
  const { applicationsettings } = useApplicationSettings();
  const employeeid = applicationsettings?.user?.employeeid;

  const [discountRules, setDiscountRules] = React.useState<DiscountLimitRule[]>(
    []
  );
  const [usageRecords, setUsageRecords] = React.useState<DiscountUsageRecord[]>(
    []
  );
  const [loadingRules, setLoadingRules] = React.useState(false);
  const [loadingUsage, setLoadingUsage] = React.useState(false);
  const [savingRole, setSavingRole] = React.useState<string | null>(null);
  const [usageDate, setUsageDate] = React.useState<string>(
    new Date().toISOString().slice(0, 10)
  );
  const [usageRoleFilter, setUsageRoleFilter] = React.useState<string>("");

  const loadDiscountRules = async () => {
    if (!employeeid) return;
    setLoadingRules(true);
    try {
      const response: any = await customFetch(
        `billing/discount-limits?employeeid=${employeeid}`
      );
      const existing = Array.isArray(response?.rules) ? response.rules : [];
      const ruleMap = new Map<string, DiscountLimitRule>(
        existing.map((rule: DiscountLimitRule) => [
          String(rule.role || "").toLowerCase(),
          rule,
        ])
      );
      const merged = recommendedRoles.map((role) =>
        normalizeRule(ruleMap.get(role), role)
      );
      setDiscountRules(merged);
    } catch (error) {
      toast.error("Failed to load discount limit rules");
    } finally {
      setLoadingRules(false);
    }
  };

  const loadDailyUsage = async (role = usageRoleFilter, date = usageDate) => {
    if (!employeeid) return;
    setLoadingUsage(true);
    try {
      const params = new URLSearchParams();
      params.set("employeeid", String(employeeid));
      if (date) params.set("date", date);
      if (role) params.set("role", role);
      const response: any = await customFetch(
        `billing/discount-limits/daily-usage?${params.toString()}`
      );
      setUsageRecords(Array.isArray(response?.usage) ? response.usage : []);
    } catch (error) {
      toast.error("Failed to load discount daily usage");
    } finally {
      setLoadingUsage(false);
    }
  };

  const handleRuleFieldChange = (
    role: string,
    field: keyof DiscountLimitRule,
    value: string | number | boolean
  ) => {
    setDiscountRules((prev) =>
      prev.map((rule) =>
        rule.role === role
          ? {
              ...rule,
              [field]: value,
            }
          : rule
      )
    );
  };

  const handleSaveRule = async (role: string) => {
    if (!employeeid) {
      toast.error("Employee session not found");
      return;
    }

    const targetRule = discountRules.find((rule) => rule.role === role);
    if (!targetRule) return;

    const maxDiscountTx = toNonNegativeNumberOrNull(targetRule.max_discount_per_transaction);
    const maxDiscountDay = toNonNegativeNumberOrNull(targetRule.max_discount_per_day);
    const minTotalDiscount = toNonNegativeNumberOrNull(targetRule.min_transaction_total_for_discount);
    const maxSurchargeTx = toNonNegativeNumberOrNull(targetRule.max_surcharge_per_transaction);
    const maxSurchargeDay = toNonNegativeNumberOrNull(targetRule.max_surcharge_per_day);
    const minTotalSurcharge = toNonNegativeNumberOrNull(targetRule.min_transaction_total_for_surcharge);

    if (
      maxDiscountTx === null ||
      maxDiscountDay === null ||
      maxSurchargeTx === null ||
      maxSurchargeDay === null
    ) {
      toast.error("All max limits must be valid non-negative numbers.");
      return;
    }

    if (maxDiscountTx > maxDiscountDay) {
      toast.error("Max discount per transaction cannot exceed max discount per day.");
      return;
    }

    if (maxSurchargeTx > maxSurchargeDay) {
      toast.error("Max surcharge per transaction cannot exceed max surcharge per day.");
      return;
    }

    if (minTotalDiscount !== null && minTotalDiscount < 0) {
      toast.error("Min transaction total for discount must be 0 or greater.");
      return;
    }

    if (minTotalSurcharge !== null && minTotalSurcharge < 0) {
      toast.error("Min transaction total for surcharge must be 0 or greater.");
      return;
    }

    setSavingRole(role);
    try {
      const payload = {
        role: targetRule.role,
        is_active: Boolean(targetRule.is_active),
        max_discount_per_transaction: maxDiscountTx,
        min_transaction_total_for_discount: minTotalDiscount,
        max_discount_per_day: maxDiscountDay,
        max_surcharge_per_transaction: maxSurchargeTx,
        min_transaction_total_for_surcharge: minTotalSurcharge,
        max_surcharge_per_day: maxSurchargeDay,
        updated_by_employeeid: employeeid,
      };

      const response: any = await customPost(
        `billing/discount-limits?employeeid=${employeeid}`,
        "POST",
        payload
      );
      if (response?.status === true || response?.success === true) {
        toast.success(`${targetRule.role} rule saved`);
        await loadDiscountRules();
        await loadDailyUsage();
      } else {
        toast.error(response?.message || "Failed to save discount rule");
      }
    } catch (error) {
      toast.error("Failed to save discount rule");
    } finally {
      setSavingRole(null);
    }
  };

  React.useEffect(() => {
    if (!employeeid) return;
    loadDiscountRules();
    loadDailyUsage();
  }, [employeeid]);

  return (
    <div className="container-fluid p-4">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <div>
          <h2 className="mb-1">Discount Limits</h2>
          <div className="text-muted">
            Configure role-based discount/surcharge limits and review daily usage.
          </div>
        </div>
        <div className="d-flex gap-2">
          <Link
            href="/settings/applicationsettings"
            className="btn btn-outline-secondary"
          >
            Back to Settings
          </Link>
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={() => {
              loadDiscountRules();
              loadDailyUsage();
            }}
            disabled={loadingRules || loadingUsage}
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="alert alert-info">
        <div className="fw-semibold mb-1">Escalation chain</div>
        <div>{escalationChainLabel}</div>
        <div className="small mt-2">
          Admin is unlimited and is not configured here. Values are absolute amounts (not percentages).
        </div>
      </div>

      <div className="row g-4">
        <div className="col-12 col-xl-7">
          <div className="card">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0">Role Rules</h5>
                {loadingRules ? <span className="text-muted">Loading...</span> : null}
              </div>

              <div className="d-grid gap-3">
                {discountRules.map((rule) => (
                  <div key={rule.role} className="border rounded p-3">
                    <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
                      <div>
                        <div className="fw-semibold text-capitalize">{rule.role}</div>
                        <div className="text-muted small">
                          Controls who can discount or surcharge within limits.
                        </div>
                      </div>
                      <div className="form-check form-switch">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          role="switch"
                          checked={Number(rule.is_active) === 1 || rule.is_active === true}
                          onChange={(e) =>
                            handleRuleFieldChange(
                              rule.role,
                              "is_active",
                              e.target.checked ? 1 : 0
                            )
                          }
                        />
                        <label className="form-check-label">
                          {Number(rule.is_active) === 1 || rule.is_active === true
                            ? "Active"
                            : "Inactive"}
                        </label>
                      </div>
                    </div>

                    <div className="row g-3">
                      <div className="col-md-4">
                        <label className="form-label small text-muted">
                          Max Discount / Transaction (Amount)
                        </label>
                        <input
                          type="number"
                          min={0}
                          step="0.01"
                          className="form-control"
                          value={rule.max_discount_per_transaction}
                          onChange={(e) =>
                            handleRuleFieldChange(
                              rule.role,
                              "max_discount_per_transaction",
                              e.target.value
                            )
                          }
                        />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label small text-muted">
                          Min Total For Discount (Amount)
                        </label>
                        <input
                          type="number"
                          min={0}
                          step="0.01"
                          className="form-control"
                          value={rule.min_transaction_total_for_discount ?? ""}
                          onChange={(e) =>
                            handleRuleFieldChange(
                              rule.role,
                              "min_transaction_total_for_discount",
                              e.target.value
                            )
                          }
                        />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label small text-muted">
                          Max Discount / Day (Amount)
                        </label>
                        <input
                          type="number"
                          min={0}
                          step="0.01"
                          className="form-control"
                          value={rule.max_discount_per_day}
                          onChange={(e) =>
                            handleRuleFieldChange(
                              rule.role,
                              "max_discount_per_day",
                              e.target.value
                            )
                          }
                        />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label small text-muted">
                          Max Surcharge / Transaction (Amount)
                        </label>
                        <input
                          type="number"
                          min={0}
                          step="0.01"
                          className="form-control"
                          value={rule.max_surcharge_per_transaction}
                          onChange={(e) =>
                            handleRuleFieldChange(
                              rule.role,
                              "max_surcharge_per_transaction",
                              e.target.value
                            )
                          }
                        />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label small text-muted">
                          Min Total For Surcharge (Amount)
                        </label>
                        <input
                          type="number"
                          min={0}
                          step="0.01"
                          className="form-control"
                          value={rule.min_transaction_total_for_surcharge ?? ""}
                          onChange={(e) =>
                            handleRuleFieldChange(
                              rule.role,
                              "min_transaction_total_for_surcharge",
                              e.target.value
                            )
                          }
                        />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label small text-muted">
                          Max Surcharge / Day (Amount)
                        </label>
                        <input
                          type="number"
                          min={0}
                          step="0.01"
                          className="form-control"
                          value={rule.max_surcharge_per_day}
                          onChange={(e) =>
                            handleRuleFieldChange(
                              rule.role,
                              "max_surcharge_per_day",
                              e.target.value
                            )
                          }
                        />
                      </div>
                    </div>

                    <div className="mt-3 d-flex justify-content-end">
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => handleSaveRule(rule.role)}
                        disabled={savingRole === rule.role}
                      >
                        {savingRole === rule.role ? "Saving..." : "Save Rule"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-xl-5">
          <div className="card">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0">Daily Usage</h5>
                {loadingUsage ? <span className="text-muted">Loading...</span> : null}
              </div>

              <div className="row g-2 mb-3">
                <div className="col-sm-6">
                  <label className="form-label small text-muted">Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={usageDate}
                    onChange={(e) => setUsageDate(e.target.value)}
                  />
                </div>
                <div className="col-sm-6">
                  <label className="form-label small text-muted">Role</label>
                  <select
                    className="form-select"
                    value={usageRoleFilter}
                    onChange={(e) => setUsageRoleFilter(e.target.value)}
                  >
                    <option value="">All roles</option>
                    {recommendedRoles.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-12">
                  <button
                    type="button"
                    className="btn btn-outline-primary"
                    onClick={() => loadDailyUsage()}
                  >
                    Load Usage
                  </button>
                </div>
              </div>

              <div className="table-responsive">
                <table className="table table-sm align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>Role</th>
                      <th>Employee</th>
                      <th>Discount</th>
                      <th>Surcharge</th>
                      <th>Updated</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usageRecords.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-muted text-center py-4">
                          {loadingUsage
                            ? "Loading usage..."
                            : "No usage records found for the selected filters."}
                        </td>
                      </tr>
                    ) : (
                      usageRecords.map((item) => (
                        <tr key={item.id}>
                          <td className="text-capitalize">{item.role}</td>
                          <td>{item.employeeid}</td>
                          <td>{item.discount_total}</td>
                          <td>{item.surcharge_total}</td>
                          <td>
                            {new Date(
                              item.updated_at || item.created_at
                            ).toLocaleString()}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
