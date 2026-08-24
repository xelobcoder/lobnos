"use client";
import { RiDeleteBinLine, RiShieldUserLine } from "@remixicon/react";
import dayjs from "dayjs";
import React, { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import PrimeTable from "../../../components/accessories/Datatables/PrimeTable";
import ReportShell from "../../../components/accounting/ReportShell";
import AccountingGuard from "../../../components/accounting/AccountingGuard";
import { currencyFormatter } from "../../../components/Auth/customFetch";
import { accountingApi } from "../../../lib/accounting/accountingApi";

const PERMISSION_LABELS: Record<string, string> = {
     "expense.approve": "Approve expenses",
     "expense.pay": "Pay expenses",
     "purchase_order.approve": "Approve purchase orders",
     "purchase_order.pay": "Pay purchase orders / suppliers",
     "inventory.adjust": "Adjust inventory",
     "accounting.journal.approve": "Approve journal entries",
     "accounting.journal.post": "Post journal entries",
     "accounting.period.close": "Close accounting periods",
     "billing.refund.approve": "Approve refunds",
};

const AMOUNT_BOUND = ["expense.pay", "purchase_order.pay"];

export default function DelegationsPage() {
     return (
          <AccountingGuard ownerOnly>
               <DelegationsScreen />
          </AccountingGuard>
     );
}

function DelegationsScreen() {
     const [permissions, setPermissions] = useState<string[]>([]);
     const [rows, setRows] = useState<any[]>([]);
     const [employees, setEmployees] = useState<any[]>([]);
     const [busy, setBusy] = useState(false);

     const [form, setForm] = useState({
          employeeid: "",
          permission: "",
          minAmount: "",
          maxAmount: "",
          expiresAt: "",
          notes: "",
     });

     const load = useCallback(async () => {
          try {
               const [permsRes, listRes, employeesRes] = await Promise.all([
                    accountingApi.authorityPermissions(),
                    accountingApi.delegations(true),
                    accountingApi.authorityEmployees(),
               ]);
               setPermissions(permsRes?.result || []);
               setRows(listRes?.result?.data || listRes?.result || []);
               setEmployees(employeesRes?.result || []);

               if (!employeesRes?.result?.length) {
                    toast.warn("No employees were returned, so the person list is empty");
               }
          } catch (error: any) {
               toast.error(error?.message || "Unable to load delegations");
          }
     }, []);

     useEffect(() => {
          load();
     }, [load]);

     const amountBound = AMOUNT_BOUND.includes(form.permission);

     const grant = async () => {
          if (!form.employeeid || !form.permission) {
               toast.error("Choose a person and a permission");
               return;
          }
          if (amountBound && form.minAmount && form.maxAmount && Number(form.minAmount) > Number(form.maxAmount)) {
               toast.error("The lower limit cannot exceed the upper limit");
               return;
          }

          setBusy(true);
          try {
               const response: any = await accountingApi.grantDelegation({
                    employeeid: Number(form.employeeid),
                    permission: form.permission,
                    minAmount: amountBound && form.minAmount !== "" ? Number(form.minAmount) : null,
                    maxAmount: amountBound && form.maxAmount !== "" ? Number(form.maxAmount) : null,
                    expiresAt: form.expiresAt || null,
                    notes: form.notes || null,
               });

               if (response?.status === "error") toast.error(response?.message || "Unable to grant the delegation");
               else {
                    toast.success("Authority delegated");
                    setForm({ employeeid: "", permission: "", minAmount: "", maxAmount: "", expiresAt: "", notes: "" });
                    await load();
               }
          } catch (error: any) {
               toast.error(error?.message || "Unable to grant the delegation");
          } finally {
               setBusy(false);
          }
     };

     const revoke = async (id: number) => {
          setBusy(true);
          try {
               const response: any = await accountingApi.revokeDelegation(id);
               if (response?.status === "error") toast.error(response?.message || "Unable to revoke");
               else {
                    toast.success("Delegation revoked");
                    await load();
               }
          } catch (error: any) {
               toast.error(error?.message || "Unable to revoke");
          } finally {
               setBusy(false);
          }
     };

     const money = (value: any) => (value == null ? null : currencyFormatter.format(Number(value)));

     const column = [
          {
               Header: "Person",
               accessor: "username",
               Cell: ({ row }: any) => (
                    <div>
                         <div className="fw-semibold">{row.original.username || `Employee ${row.original.employeeid}`}</div>
                         <small className="text-muted text-capitalize">{row.original.role}</small>
                    </div>
               ),
          },
          {
               Header: "Authority",
               accessor: "permission",
               Cell: ({ value }: any) => PERMISSION_LABELS[value] || value,
          },
          {
               Header: "Payment limits",
               accessor: "max_amount",
               Cell: ({ row }: any) => {
                    if (!AMOUNT_BOUND.includes(row.original.permission)) return <span className="text-muted">-</span>;
                    const min = money(row.original.min_amount);
                    const max = money(row.original.max_amount);
                    if (!min && !max) return <span className="text-warning">No limit</span>;
                    return (
                         <span>
                              {min || "0.00"} &ndash; {max || "no ceiling"}
                         </span>
                    );
               },
          },
          {
               Header: "Expires",
               accessor: "expires_at",
               Cell: ({ value }: any) => (value ? dayjs(value).format("DD MMM YYYY") : <span className="text-muted">Never</span>),
          },
          {
               Header: "Granted",
               accessor: "granted_at",
               Cell: ({ value }: any) => <span className="text-nowrap small">{dayjs(value).format("DD MMM YYYY")}</span>,
          },
          {
               Header: "Actions",
               accessor: "id",
               Cell: ({ value }: any) => (
                    <button className="btn btn-sm btn-outline-danger" disabled={busy} onClick={() => revoke(value)}>
                         <RiDeleteBinLine size={14} /> Revoke
                    </button>
               ),
          },
     ];

     return (
          <ReportShell
               title="Delegated Authority"
               subtitle="Grant specific approval and payment powers to staff, with limits on how much they may pay"
          >
               <div className="alert alert-info py-4 d-flex align-items-center gap-2">
                    <RiShieldUserLine size={18} />
                    <span>
                         Administrators always hold every authority. Everyone else can only do what is delegated here, and a
                         payment outside the delegated band is refused even when the person holds the permission.
                    </span>
               </div>

               <div className="card border-0 shadow-sm mb-3">
                    <div className="card-body">
                         <div className="row g-2 align-items-end">
                              <div className="col-12 col-md-3">
                                   <label className="form-label mb-1 small text-muted">Person</label>
                                   <select
                                        className="form-select  custom-select"
                                        value={form.employeeid}
                                        onChange={(e) => setForm({ ...form, employeeid: e.target.value })}
                                   >
                                        <option value="">
                                             {employees.length ? "Select employee" : "No employees available"}
                                        </option>
                                        {employees.map((employee: any) => (
                                             <option key={employee.employeeid} value={employee.employeeid}>
                                                  {employee.fullname || employee.username} &mdash; {employee.role}
                                             </option>
                                        ))}
                                   </select>
                              </div>

                              <div className="col-12 col-md-3">
                                   <label className="form-label mb-1 small text-muted">Authority</label>
                                   <select
                                        className="form-select  custom-select"
                                        value={form.permission}
                                        onChange={(e) => setForm({ ...form, permission: e.target.value })}
                                   >
                                        <option value="">Select authority</option>
                                        {permissions.map((permission) => (
                                             <option key={permission} value={permission}>
                                                  {PERMISSION_LABELS[permission] || permission}
                                             </option>
                                        ))}
                                   </select>
                              </div>

                              <div className="col-6 col-md-2">
                                   <label className="form-label mb-1 small text-muted">Pay from</label>
                                   <input
                                        type="number"
                                        min={0}
                                        step="0.01"
                                        className="form-control custom-input"
                                        placeholder="0.00"
                                        disabled={!amountBound}
                                        value={form.minAmount}
                                        onChange={(e) => setForm({ ...form, minAmount: e.target.value })}
                                   />
                              </div>

                              <div className="col-6 col-md-2">
                                   <label className="form-label mb-1 small text-muted">Pay up to</label>
                                   <input
                                        type="number"
                                        min={0}
                                        step="0.01"
                                        className="form-control custom-input"
                                        placeholder="No ceiling"
                                        disabled={!amountBound}
                                        value={form.maxAmount}
                                        onChange={(e) => setForm({ ...form, maxAmount: e.target.value })}
                                   />
                              </div>

                              <div className="col-6 col-md-2">
                                   <label className="form-label mb-1 small text-muted">Expires</label>
                                   <input
                                        type="date"
                                        className="form-control custom-input"
                                        value={form.expiresAt}
                                        onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
                                   />
                              </div>

                              <div className="col-12 col-md-10">
                                   <label className="form-label mb-1 small text-muted">Note</label>
                                   <input
                                        type="text"
                                        className="form-control custom-input"
                                        placeholder="e.g. Approved by the CEO for the Tamale branch"
                                        value={form.notes}
                                        onChange={(e) => setForm({ ...form, notes: e.target.value })}
                                   />
                              </div>

                              <div className="col-12 col-md-2">
                                   <button className="btn btn-outline-primary" onClick={grant} disabled={busy}>
                                        {busy ? "Saving..." : "Delegate"}
                                   </button>
                              </div>
                         </div>

                         {amountBound && (
                              <small className="text-muted d-block mt-2">
                                   Leave the limits blank to delegate payment with no ceiling.
                              </small>
                         )}
                    </div>
               </div>

               <PrimeTable column={column} data={rows} filtering isExpoerted handleSeverSideProcessing={undefined} />
          </ReportShell>
     );
}
