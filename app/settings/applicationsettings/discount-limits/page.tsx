"use client";

import React from "react";
import Link from "next/link";
import { toast } from "react-toastify";
import { customFetch, customPost } from "../../../../components/Auth/customFetch";
import { useApplicationSettings } from "../../../../components/Auth/useApplicationContext";
import PrimeTable from "../../../../components/accessories/Datatables/PrimeTable";

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

interface Employee {
  employeeid: number;
  username: string;
  role: string;
  email?: string;
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

  const [employees, setEmployees] = React.useState<Employee[]>([]);
  const [loadingEmployees, setLoadingEmployees] = React.useState(false);
  const [interestedUserId, setInterestedUserId] = React.useState<number | "">("");

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
  const [usageTableVersion, setUsageTableVersion] = React.useState(0);
  const [showUsageFilters, setShowUsageFilters] = React.useState(false);

  const employeeLabelById = React.useMemo(() => {
    const map = new Map<number, string>();
    employees.forEach((e) => {
      if (e?.employeeid != null) {
        map.set(Number(e.employeeid), String(e.username || e.employeeid));
      }
    });
    return map;
  }, [employees]);

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

  const fetchDailyUsage = async ({
    role,
    date,
    interestedUserId: interested,
    page = 1,
    count = 10,
    sortby = "DESC",
  }: {
    role?: string;
    date?: string;
    interestedUserId?: number | "";
    page?: number;
    count?: number;
    sortby?: string;
  }) => {
    if (!employeeid) return [];
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("count", String(count));
    params.set("employeeid", String(employeeid));
  
    if (date) {
      params.set("date", date);
    }

    const allSelected = !role && interested === "";
    if (!allSelected) {
      params.set("employeeid", String(employeeid));
      params.set("sortby", String(sortby));
      if (date) params.set("date", date);
      if (role) params.set("role", role);
      if (interested !== "") params.set("interestedUserId", String(interested));
    }
    const response: any = await customFetch(
      `billing/discount-limits/daily-usage?${params.toString()}`
    );
    return Array.isArray(response?.usage) ? response.usage : [];
  };

  const loadDailyUsage = async (role = usageRoleFilter, date = usageDate) => {
    if (!employeeid) return;
    setLoadingUsage(true);
    try {
      const usage = await fetchDailyUsage({
        role,
        date,
        interestedUserId,
        page: 1,
        count: 10,
        sortby: "DESC",
      });
      setUsageRecords(usage);
    } catch {
      toast.error("Failed to load discount daily usage");
    } finally {
      setLoadingUsage(false);
    }
  };

  const handleUsageServerSideProcessing = async (params: {
    page: number;
    count: number;
    sortby?: string;
    date?: string;
    role?: string;
    interestedUserId?: number | "";
  }) => {
    try {
      const usage = await fetchDailyUsage({
        page: params.page,
        count: params.count,
        sortby: params.sortby || "DESC",
        date: params.date ?? usageDate,
        role: params.role ?? usageRoleFilter,
        interestedUserId:
          params.interestedUserId !== undefined
            ? params.interestedUserId
            : interestedUserId,
      });
      return { result: usage, error: false };
    } catch {
      return { result: [], error: true };
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
  }, [employeeid]);

  React.useEffect(() => {
    const fetchEmployees = async () => {
      if (!employeeid) return;
      setLoadingEmployees(true);
      try {
        const response: any = await customFetch("logins");
        if (response?.status === "success" && Array.isArray(response?.result)) {
          setEmployees(response.result);
        } else {
          setEmployees([]);
        }
      } catch {
        setEmployees([]);
      } finally {
        setLoadingEmployees(false);
      }
    };
    fetchEmployees();
  }, [employeeid]);

  React.useEffect(() => {
    if (!employeeid) return;
    setUsageTableVersion((v) => v + 1);
    loadDailyUsage();
  }, [employeeid, usageDate, usageRoleFilter, interestedUserId]);

  const usageColumns = React.useMemo(
    () => [
      {
        Header: "Role",
        accessor: "role",
        Cell: ({ value }: { value: string }) => (
          <span className="text-capitalize">{value}</span>
        ),
      },
      {
        Header: "Employee",
        accessor: "employeeid",
        Cell: ({ value }: { value: number }) => {
          const label = employeeLabelById.get(Number(value));
          return label ? `${label} (#${value})` : value;
        },
      },
      {
        Header: "Discount",
        accessor: "discount_total",
      },
      {
        Header: "Surcharge",
        accessor: "surcharge_total",
      },
      {
        Header: "Updated",
        accessor: "updated_at",
        Cell: ({ row }: any) =>
          new Date(
            row?.original?.updated_at || row?.original?.created_at
          ).toLocaleString(),
      },
    ],
    [employeeLabelById]
  );

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
              setUsageTableVersion((v) => v + 1);
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
        <div className="col-12">
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

        <div className="col-12">
          <div className="card">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0">Daily Usage</h5>
                <div className="d-flex align-items-center gap-2">
                  {loadingUsage ? <span className="text-muted">Loading...</span> : null}
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => setShowUsageFilters((v) => !v)}
                  >
                    {showUsageFilters ? "Hide Filters" : "Show Filters"}
                  </button>
                </div>
              </div>

              {showUsageFilters ? (
                <div className="border rounded p-3 mb-3 bg-body-tertiary">
                  <div className="row g-2 align-items-end">
                    <div className="col-sm-4">
                      <label className="form-label small text-muted">Date</label>
                      <input
                        type="date"
                        className="form-control"
                        value={usageDate}
                        onChange={(e) => setUsageDate(e.target.value)}
                      />
                    </div>
                    <div className="col-sm-4">
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
                    <div className="col-sm-4">
                      <label className="form-label small text-muted">
                        User {loadingEmployees ? "(loading...)" : ""}
                      </label>
                      <select
                        className="form-select"
                        value={interestedUserId === "" ? "" : String(interestedUserId)}
                        onChange={(e) => {
                          const next = e.target.value;
                          setInterestedUserId(next ? Number(next) : "");
                        }}
                      >
                        <option value="">All users</option>
                        {employees.map((u) => (
                          <option key={u.employeeid} value={String(u.employeeid)}>
                            {u.username} (#{u.employeeid})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-12 d-flex justify-content-end">
                      <button
                        type="button"
                        className="btn btn-outline-primary"
                        onClick={() => {
                          setUsageTableVersion((v) => v + 1);
                          loadDailyUsage();
                        }}
                      >
                        Load Usage
                      </button>
                    </div>
                  </div>
                </div>
              ) : null}

              <PrimeTable
                key={`${employeeid || "na"}-${usageDate || "na"}-${usageRoleFilter || "all"}-${interestedUserId || "all"}-${usageTableVersion}`}
                column={usageColumns}
                data={usageRecords}
                handleSeverSideProcessing={handleUsageServerSideProcessing}
                serverSideFiltering={true}
                urlparams={{
                  date: usageDate,
                  role: usageRoleFilter,
                  interestedUserId,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
