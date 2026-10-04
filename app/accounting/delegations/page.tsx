
"use client";

import {
     RiDeleteBinLine,
     RiEditLine,
     RiShieldCheckLine,
     RiShieldUserLine,
     RiTimeLine,
     RiUser3Line,
     RiWallet3Line,
} from "@remixicon/react";
import dayjs from "dayjs";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import PrimeTable from "../../../components/accessories/Datatables/PrimeTable";
import ReportShell from "../../../components/accounting/ReportShell";
import { currencyFormatter, customFetch } from "../../../components/Auth/customFetch";
import { useApplicationSettings } from "../../../components/Auth/useApplicationContext";
import { accountingApi } from "../../../lib/accounting/accountingApi";

const PERMISSION_LABELS: Record<string, string> = {
     "expense.create": "Create expenses",
     "expense.view": "View expenses",
     "expense.edit": "Edit expenses",
     "expense.submit": "Submit expenses",
     "expense.approve": "Approve expenses",
     "expense.reject": "Reject expenses",
     "expense.pay": "Pay expenses",
     "expense.cancel": "Cancel expenses",
     "expense.reverse": "Reverse expenses",
     "expense.override_approval": "Override self-approval control",
     "expense.override_sod": "Override approval/payment separation",
     "expense.view_audit": "View expense audit trail",
     "expense.configure": "Configure expense workflow controls",
     "payment_account.manage": "Manage payment accounts and access",
     "purchase_order.approve": "Approve purchase orders",
     "purchase_order.pay": "Pay purchase orders / suppliers",
     "inventory.adjust": "Adjust inventory",
     "accounting.journal.approve": "Approve journal entries",
     "accounting.journal.post": "Post journal entries",
     "accounting.period.close": "Close accounting periods",
     "billing.refund.approve": "Approve refunds",
};

const AMOUNT_BOUND = [
     "expense.approve",
     "expense.pay",
     "purchase_order.pay",
];

const BRANCH_SCOPED = [
     "expense.pay",
     "expense.override_approval",
     "expense.override_sod",
     "accounting.daily_close.submit",
     "accounting.daily_close.manager_approve",
     "accounting.daily_close.finalize",
     "accounting.daily_close.view_audit",
     "accounting.financial_correction.execute",
];

const rowsFrom = <T,>(value: unknown): T[] => {
     if (Array.isArray(value)) return value as T[];
     const data = (value as { data?: unknown } | null)?.data;
     return Array.isArray(data) ? data as T[] : [];
};

export default function DelegationsPage() {
     const { applicationsettings } = useApplicationSettings();
     const activeBranchId = applicationsettings?.branchid ?? applicationsettings?.user?.branchid ?? applicationsettings?.user?.branch ?? null;
     const [permissions, setPermissions] = useState<string[]>([]);
     const [rows, setRows] = useState<any[]>([]);
     const [employees, setEmployees] = useState<any[]>([]);
     const [branches, setBranches] = useState<any[]>([]);
     const [busy, setBusy] = useState(false);
     const [editingId, setEditingId] = useState<number | null>(null);

     const [form, setForm] = useState({
          employeeid: "",
          permission: "",
          branchid: activeBranchId == null ? "" : String(activeBranchId),
          minAmount: "",
          maxAmount: "",
          expiresAt: "",
          notes: "",
     });

     const load = useCallback(async () => {
          try {
               const [permsRes, listRes, employeesRes, branchesRes] = await Promise.all([
                    accountingApi.authorityPermissions(),
                    accountingApi.delegations(true),
                    accountingApi.authorityEmployees(),
                    customFetch("branches?count=200&page=1"),
               ]);

               const permissionsResult = permsRes?.result;
               const delegationsResult = listRes?.result;
               const employeesResult = employeesRes?.result;

               setPermissions(rowsFrom<string>(permissionsResult));
               setRows(rowsFrom<any>(delegationsResult));
               setEmployees(rowsFrom<any>(employeesResult));
               setBranches(rowsFrom<any>(branchesRes?.result));

               const employeeRows = rowsFrom<any>(employeesResult);
               if (!employeeRows.length) {
                    toast.warn(
                         "No employees were returned, so the person list is empty"
                    );
               }
          } catch (error: any) {
               toast.error(error?.message || "Unable to load delegations");
          }
     }, []);

     useEffect(() => {
          load();
     }, [load]);

     const amountBound = AMOUNT_BOUND.includes(form.permission);
     const branchRequired = BRANCH_SCOPED.includes(form.permission);

     const selectedPermissionLabel =
          PERMISSION_LABELS[form.permission] || form.permission;

     const grant = async () => {
          if (!form.employeeid || !form.permission) {
               toast.error("Choose a person and a permission");
               return;
          }

          if (branchRequired && !form.branchid) {
               toast.error("Choose the branch this authority should cover");
               return;
          }

          if (
               amountBound &&
               form.minAmount &&
               form.maxAmount &&
               Number(form.minAmount) > Number(form.maxAmount)
          ) {
               toast.error("The lower limit cannot exceed the upper limit");
               return;
          }

          setBusy(true);

          try {
               const payload = {
                    employeeid: Number(form.employeeid),
                    permission: form.permission,
                    branchid: branchRequired && form.branchid ? Number(form.branchid) : null,
                    minAmount:
                         amountBound && form.minAmount !== ""
                              ? Number(form.minAmount)
                              : null,
                    maxAmount:
                         amountBound && form.maxAmount !== ""
                              ? Number(form.maxAmount)
                              : null,
                    expiresAt: form.expiresAt || null,
                    notes: form.notes || null,
               };
               const response: any = editingId
                    ? await accountingApi.reviseDelegation(editingId, payload)
                    : await accountingApi.grantDelegation(payload);

               if (response?.status === "error") {
                    toast.error(
                         response?.message ||
                         "Unable to grant the delegation"
                    );
               } else {
                    toast.success(editingId ? "Delegation updated" : "Authority delegated");

                    setForm({
                         employeeid: "",
                         permission: "",
                         branchid: activeBranchId == null ? "" : String(activeBranchId),
                         minAmount: "",
                         maxAmount: "",
                         expiresAt: "",
                         notes: "",
                    });
                    setEditingId(null);

                    await load();
               }
          } catch (error: any) {
               toast.error(
                    error?.message || "Unable to grant the delegation"
               );
          } finally {
               setBusy(false);
          }
     };

     const edit = (delegation: any) => {
          setEditingId(Number(delegation.id));
          setForm({
               employeeid: String(delegation.employeeid),
               permission: String(delegation.permission),
               branchid: delegation.branchid == null ? "" : String(delegation.branchid),
               minAmount: delegation.min_amount == null ? "" : String(delegation.min_amount),
               maxAmount: delegation.max_amount == null ? "" : String(delegation.max_amount),
               expiresAt: delegation.expires_at ? dayjs(delegation.expires_at).format("YYYY-MM-DD") : "",
               notes: delegation.notes || "",
          });
          window.scrollTo({ top: 0, behavior: "smooth" });
     };

     const cancelEdit = () => {
          setEditingId(null);
          setForm({ employeeid: "", permission: "", branchid: activeBranchId == null ? "" : String(activeBranchId), minAmount: "", maxAmount: "", expiresAt: "", notes: "" });
     };

     const revoke = async (id: number) => {
          setBusy(true);

          try {
               const response: any =
                    await accountingApi.revokeDelegation(id);

               if (response?.status === "error") {
                    toast.error(
                         response?.message || "Unable to revoke"
                    );
               } else {
                    toast.success("Delegation revoked");
                    await load();
               }
          } catch (error: any) {
               toast.error(error?.message || "Unable to revoke");
          } finally {
               setBusy(false);
          }
     };

     const money = (value: any) =>
          value == null
               ? null
               : currencyFormatter.format(Number(value));

     const activeCount = rows.length;

     const expiringCount = rows.filter((row) => {
          if (!row.expires_at) return false;

          const expiry = dayjs(row.expires_at);
          return (
               expiry.isAfter(dayjs()) &&
               expiry.diff(dayjs(), "day") <= 30
          );
     }).length;

     const paymentDelegations = rows.filter((row) =>
          AMOUNT_BOUND.includes(row.permission)
     ).length;

     const permissionGroups = useMemo(() => {
          return permissions.reduce(
               (groups: Record<string, string[]>, permission) => {
                    const prefix = permission.split(".")[0] || "other";

                    if (!groups[prefix]) {
                         groups[prefix] = [];
                    }

                    groups[prefix].push(permission);

                    return groups;
               },
               {}
          );
     }, [permissions]);

     const column = [
          {
               Header: "Person",
               accessor: "username",
               Cell: ({ row }: any) => (
                    <div className="d-flex align-items-center gap-3 py-1">
                         <div
                              className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                              style={{
                                   width: 38,
                                   height: 38,
                                   background: "#eef6f0",
                                   color: "#2e7d32",
                              }}
                         >
                              <RiUser3Line size={18} />
                         </div>

                         <div>
                              <div className="fw-semibold text-dark">
                                   {row.original.username ||
                                        `Employee ${row.original.employeeid}`}
                              </div>

                              <div className="small text-muted text-capitalize">
                                   {row.original.role || "Staff"}
                              </div>
                         </div>
                    </div>
               ),
          },

          {
               Header: "Delegated authority",
               accessor: "permission",
               Cell: ({ value }: any) => (
                    <div>
                         <span className="fw-semibold text-dark">
                              {PERMISSION_LABELS[value] || value}
                         </span>

                         <div className="small text-muted mt-1">
                              {value?.split(".")[0]
                                   ? value.split(".")[0].replaceAll("_", " ")
                                   : "Authority"}
                         </div>
                    </div>
               ),
          },

          {
               Header: "Branch scope",
               accessor: "branchid",
               Cell: ({ row }: any) => {
                    const branchId = row.original.branchid;
                    if (branchId == null) {
                         return BRANCH_SCOPED.includes(row.original.permission)
                              ? <span className="text-danger fw-semibold">Missing branch</span>
                              : <span className="text-muted">All branches</span>;
                    }
                    const branch = branches.find((item) => Number(item.branchid) === Number(branchId));
                    return <span>{branch?.name || `Branch ${branchId}`}</span>;
               },
          },

          {
               Header: "Payment limit",
               accessor: "max_amount",
               Cell: ({ row }: any) => {
                    if (!AMOUNT_BOUND.includes(row.original.permission)) {
                         return (
                              <span className="badge bg-light text-secondary border">
                                   Not applicable
                              </span>
                         );
                    }

                    const min = money(row.original.min_amount);
                    const max = money(row.original.max_amount);

                    if (!min && !max) {
                         return (
                              <span className="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle">
                                   No ceiling
                              </span>
                         );
                    }

                    return (
                         <div className="d-flex align-items-center gap-2">
                              <RiWallet3Line
                                   size={15}
                                   className="text-muted"
                              />

                              <span className="small fw-medium">
                                   {min || "0.00"}{" "}
                                   <span className="text-muted">to</span>{" "}
                                   {max || "No ceiling"}
                              </span>
                         </div>
                    );
               },
          },

          {
               Header: "Validity",
               accessor: "expires_at",
               Cell: ({ value }: any) => {
                    if (!value) {
                         return (
                              <span className="badge bg-success-subtle text-success-emphasis border border-success-subtle">
                                   Permanent
                              </span>
                         );
                    }

                    const expired = dayjs(value).isBefore(dayjs(), "day");

                    if (expired) {
                         return (
                              <span className="badge bg-danger-subtle text-danger-emphasis border border-danger-subtle">
                                   Expired
                              </span>
                         );
                    }

                    const daysRemaining = dayjs(value).diff(
                         dayjs(),
                         "day"
                    );

                    return (
                         <div>
                              <div className="small fw-semibold">
                                   {dayjs(value).format("DD MMM YYYY")}
                              </div>

                              {daysRemaining <= 30 && (
                                   <div className="small text-warning mt-1">
                                        Expires in {daysRemaining} day
                                        {daysRemaining === 1 ? "" : "s"}
                                   </div>
                              )}
                         </div>
                    );
               },
          },

          {
               Header: "Granted",
               accessor: "granted_at",
               Cell: ({ value }: any) => (
                    <div className="d-flex align-items-center gap-2 text-nowrap">
                         <RiTimeLine
                              size={15}
                              className="text-muted"
                         />
                         <span className="small">
                              {dayjs(value).format("DD MMM YYYY")}
                         </span>
                    </div>
               ),
          },

          {
               Header: "Actions",
               accessor: "id",
               Cell: ({ row }: any) => (
                    <div className="d-flex gap-2">
                         <button type="button" className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1" disabled={busy} onClick={() => edit(row.original)}><RiEditLine size={15} /> Edit</button>
                         <button
                              type="button"
                              className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1"
                              disabled={busy}
                              onClick={() => revoke(row.original.id)}
                         >
                              <RiDeleteBinLine size={15} />
                              Revoke
                         </button>
                    </div>
               ),
          },
     ];

     return (
          <ReportShell
               title="Delegated Authority"
               subtitle="Control who can approve, pay, and perform sensitive financial actions on behalf of the facility."
          >
               {/* Header / security message */}
               <div
                    className="rounded-3 p-4 mb-4"
                    style={{
                         background:
                              "linear-gradient(135deg, #f1f8f3 0%, #ffffff 100%)",
                         border: "1px solid #dcebdd",
                    }}
               >
                    <div className="d-flex align-items-start gap-3">
                         <div
                              className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
                              style={{
                                   width: 46,
                                   height: 46,
                                   background: "#2e7d32",
                                   color: "#fff",
                              }}
                         >
                              <RiShieldCheckLine size={24} />
                         </div>

                         <div>
                              <h6 className="mb-1 fw-bold">
                                   Financial authority controls
                              </h6>

                              <p className="text-muted mb-0 small">
                                   Delegate specific financial permissions
                                   to staff while maintaining separation of
                                   duties and payment limits. Delegated
                                   authority should only be granted when
                                   required for the employee&apos;s role.
                              </p>
                         </div>
                    </div>
               </div>

               {/* Summary cards */}
               <div className="row g-3 mb-4">
                    <div className="col-12 col-md-4">
                         <div className="card border-0 shadow-sm h-100">
                              <div className="card-body p-3">
                                   <div className="d-flex justify-content-between align-items-start">
                                        <div>
                                             <div className="small text-muted mb-1">
                                                  Active delegations
                                             </div>
                                             <div className="fs-4 fw-bold">
                                                  {activeCount}
                                             </div>
                                        </div>

                                        <div
                                             className="rounded-3 d-flex align-items-center justify-content-center"
                                             style={{
                                                  width: 42,
                                                  height: 42,
                                                  background: "#eef6f0",
                                                  color: "#2e7d32",
                                             }}
                                        >
                                             <RiShieldUserLine size={21} />
                                        </div>
                                   </div>
                              </div>
                         </div>
                    </div>

                    <div className="col-12 col-md-4">
                         <div className="card border-0 shadow-sm h-100">
                              <div className="card-body p-3">
                                   <div className="d-flex justify-content-between align-items-start">
                                        <div>
                                             <div className="small text-muted mb-1">
                                                  Payment authorities
                                             </div>
                                             <div className="fs-4 fw-bold">
                                                  {paymentDelegations}
                                             </div>
                                        </div>

                                        <div
                                             className="rounded-3 d-flex align-items-center justify-content-center"
                                             style={{
                                                  width: 42,
                                                  height: 42,
                                                  background: "#f1f5f9",
                                                  color: "#475569",
                                             }}
                                        >
                                             <RiWallet3Line size={21} />
                                        </div>
                                   </div>
                              </div>
                         </div>
                    </div>

                    <div className="col-12 col-md-4">
                         <div className="card border-0 shadow-sm h-100">
                              <div className="card-body p-3">
                                   <div className="d-flex justify-content-between align-items-start">
                                        <div>
                                             <div className="small text-muted mb-1">
                                                  Expiring within 30 days
                                             </div>
                                             <div className="fs-4 fw-bold">
                                                  {expiringCount}
                                             </div>
                                        </div>

                                        <div
                                             className="rounded-3 d-flex align-items-center justify-content-center"
                                             style={{
                                                  width: 42,
                                                  height: 42,
                                                  background: "#fff7ed",
                                                  color: "#c2410c",
                                             }}
                                        >
                                             <RiTimeLine size={21} />
                                        </div>
                                   </div>
                              </div>
                         </div>
                    </div>
               </div>

               {/* Grant authority */}
               <div className="card border-0 shadow-sm mb-4">
                    <div className="card-header bg-white border-bottom p-4">
                         <div className="d-flex align-items-center gap-3">
                              <div
                                   className="rounded-3 d-flex align-items-center justify-content-center"
                                   style={{
                                        width: 40,
                                        height: 40,
                                        background: "#eef6f0",
                                        color: "#2e7d32",
                                   }}
                              >
                                   <RiShieldUserLine size={20} />
                              </div>

                              <div>
                                   <h5 className="mb-1 fw-bold">
                                        {editingId ? "Edit authority" : "Grant authority"}
                                   </h5>

                                   <p className="small text-muted mb-0">
                                        Assign a specific financial
                                        permission to an employee.
                                   </p>
                              </div>
                         </div>
                    </div>

                    <div className="card-body p-4">
                         <div className="row g-3">
                              {/* Employee */}
                              <div className="col-12 col-lg-4">
                                   <label className="form-label fw-semibold small">
                                        Employee
                                   </label>

                                   <select
                                        className="form-select"
                                        value={form.employeeid}
                                        disabled={editingId !== null}
                                        onChange={(e) =>
                                             setForm({
                                                  ...form,
                                                  employeeid:
                                                       e.target.value,
                                             })
                                        }
                                   >
                                        <option value="">
                                             {employees.length
                                                  ? "Select employee"
                                                  : "No employees available"}
                                        </option>

                                        {employees.map(
                                             (employee: any) => (
                                                  <option
                                                       key={
                                                            employee.employeeid
                                                       }
                                                       value={
                                                            employee.employeeid
                                                       }
                                                  >
                                                       {employee.fullname ||
                                                            employee.username}{" "}
                                                       —{" "}
                                                       {employee.role}
                                                  </option>
                                             )
                                        )}
                                   </select>
                              </div>

                              {/* Permission */}
                              <div className="col-12 col-lg-4">
                                   <label className="form-label fw-semibold small">
                                        Authority
                                   </label>

                                   <select
                                        className="form-select"
                                        value={form.permission}
                                        disabled={editingId !== null}
                                        onChange={(e) =>
                                             setForm({
                                                  ...form,
                                                  permission:
                                                       e.target.value,
                                             })
                                        }
                                   >
                                        <option value="">
                                             Select authority
                                        </option>

                                        {Object.entries(
                                             permissionGroups
                                        ).map(
                                             ([
                                                  group,
                                                  groupPermissions,
                                             ]) => (
                                                  <optgroup
                                                       key={group}
                                                       label={group
                                                            .replaceAll(
                                                                 "_",
                                                                 " "
                                                            )
                                                            .replace(
                                                                 /^./,
                                                                 (
                                                                      char
                                                                 ) =>
                                                                      char.toUpperCase()
                                                            )}
                                                  >
                                                       {groupPermissions.map(
                                                            (
                                                                 permission
                                                            ) => (
                                                                 <option
                                                                      key={
                                                                           permission
                                                                      }
                                                                      value={
                                                                           permission
                                                                      }
                                                                 >
                                                                      {PERMISSION_LABELS[
                                                                           permission
                                                                      ] ||
                                                                           permission}
                                                                 </option>
                                                            )
                                                       )}
                                                  </optgroup>
                                             )
                                        )}
                                   </select>
                              </div>

                              {branchRequired && (
                                   <div className="col-12 col-lg-4">
                                        <label className="form-label fw-semibold small">Branch scope <span className="text-danger">*</span></label>
                                        <select
                                             className="form-select"
                                             value={form.branchid}
                                             onChange={(e) => setForm({ ...form, branchid: e.target.value })}
                                             required
                                        >
                                             <option value="">Select branch</option>
                                             {form.branchid && !branches.some((branch: any) => Number(branch.branchid) === Number(form.branchid)) && (
                                                  <option value={form.branchid}>Active branch ({form.branchid})</option>
                                             )}
                                             {branches.map((branch: any) => (
                                                  <option key={branch.branchid} value={branch.branchid}>{branch.name}</option>
                                             ))}
                                        </select>
                                        <div className="form-text">This payment authority will only work for expenses in the selected branch.</div>
                                   </div>
                              )}

                              {/* Expiry */}
                              <div className="col-12 col-lg-4">
                                   <label className="form-label fw-semibold small">
                                        Expiry date
                                   </label>

                                   <input
                                        type="date"
                                        className="form-control"
                                        value={form.expiresAt}
                                        onChange={(e) =>
                                             setForm({
                                                  ...form,
                                                  expiresAt:
                                                       e.target.value,
                                             })
                                        }
                                   />
                              </div>

                              {/* Amount limits */}
                              {amountBound && (
                                   <>
                                        <div className="col-12">
                                             <div
                                                  className="rounded-3 p-3"
                                                  style={{
                                                       background:
                                                            "#fafafa",
                                                       border: "1px solid #e9ecef",
                                                  }}
                                             >
                                                  <div className="d-flex align-items-center gap-2 mb-3">
                                                       <RiWallet3Line
                                                            size={18}
                                                            className="text-success"
                                                       />

                                                       <div>
                                                            <div className="fw-semibold small">
                                                                 Payment
                                                                 authority
                                                            </div>

                                                            <div className="text-muted small">
                                                                 Define the
                                                                 amount this
                                                                 person is
                                                                 permitted
                                                                 to handle.
                                                            </div>
                                                       </div>
                                                  </div>

                                                  <div className="row g-3">
                                                       <div className="col-12 col-md-6">
                                                            <label className="form-label small text-muted">
                                                                 Minimum
                                                                 amount
                                                            </label>

                                                            <div className="input-group">
                                                                 <span className="input-group-text">
                                                                      GHS
                                                                 </span>

                                                                 <input
                                                                      type="number"
                                                                      min={
                                                                           0
                                                                      }
                                                                      step="0.01"
                                                                      className="form-control"
                                                                      placeholder="0.00"
                                                                      value={
                                                                           form.minAmount
                                                                      }
                                                                      onChange={(
                                                                           e
                                                                      ) =>
                                                                           setForm(
                                                                                {
                                                                                     ...form,
                                                                                     minAmount:
                                                                                          e
                                                                                               .target
                                                                                               .value,
                                                                                }
                                                                           )
                                                                      }
                                                                 />
                                                            </div>
                                                       </div>

                                                       <div className="col-12 col-md-6">
                                                            <label className="form-label small text-muted">
                                                                 Maximum
                                                                 amount
                                                            </label>

                                                            <div className="input-group">
                                                                 <span className="input-group-text">
                                                                      GHS
                                                                 </span>

                                                                 <input
                                                                      type="number"
                                                                      min={
                                                                           0
                                                                      }
                                                                      step="0.01"
                                                                      className="form-control"
                                                                      placeholder="No ceiling"
                                                                      value={
                                                                           form.maxAmount
                                                                      }
                                                                      onChange={(
                                                                           e
                                                                      ) =>
                                                                           setForm(
                                                                                {
                                                                                     ...form,
                                                                                     maxAmount:
                                                                                          e
                                                                                               .target
                                                                                               .value,
                                                                                }
                                                                           )
                                                                      }
                                                                 />
                                                            </div>
                                                       </div>
                                                  </div>

                                                  <div className="small text-muted mt-2">
                                                       Leave both limits
                                                       blank to allow the
                                                       delegated authority
                                                       without an amount
                                                       ceiling.
                                                  </div>
                                             </div>
                                        </div>
                                   </>
                              )}

                              {/* Notes */}
                              <div className="col-12">
                                   <label className="form-label fw-semibold small">
                                        Reason / internal note
                                   </label>

                                   <input
                                        type="text"
                                        className="form-control"
                                        placeholder="e.g. Temporary payment authority for Tamale branch"
                                        value={form.notes}
                                        onChange={(e) =>
                                             setForm({
                                                  ...form,
                                                  notes: e.target.value,
                                             })
                                        }
                                   />
                              </div>

                              {/* Action */}
                              <div className="col-12 d-flex justify-content-between align-items-center pt-2">
                                   <div className="small text-muted">
                                        {form.permission
                                             ? `Selected: ${selectedPermissionLabel}`
                                             : "Select an employee and authority to continue"}
                                   </div>

                                   <div className="d-flex gap-2">
                                        {editingId && <button type="button" className="btn btn-outline-secondary px-4" onClick={cancelEdit} disabled={busy}>Cancel edit</button>}
                                        <button
                                             type="button"
                                             className="btn btn-success px-4 d-flex align-items-center gap-2"
                                             onClick={grant}
                                             disabled={busy}
                                        >
                                             <RiShieldCheckLine size={17} />

                                             {busy
                                                  ? "Saving..."
                                                  : editingId ? "Save changes" : "Grant authority"}
                                        </button>
                                   </div>
                              </div>
                         </div>
                    </div>
               </div>

               {/* Existing delegations */}
               <div className="card border-0 shadow-sm">
                    <div className="card-header bg-white border-bottom p-4">
                         <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                              <div>
                                   <h5 className="mb-1 fw-bold">
                                        Active delegations
                                   </h5>

                                   <p className="small text-muted mb-0">
                                        Review and revoke delegated
                                        financial authorities.
                                   </p>
                              </div>

                              <span className="badge rounded-pill bg-light text-dark border px-3 py-2">
                                   {rows.length}{" "}
                                   {rows.length === 1
                                        ? "delegation"
                                        : "delegations"}
                              </span>
                         </div>
                    </div>

                    <div className="card-body p-0">
                         <PrimeTable
                              column={column}
                              data={rows}
                              filtering
                              isExpoerted
                              handleSeverSideProcessing={
                                   undefined
                              }
                         />
                    </div>
               </div>
          </ReportShell>
     );
}