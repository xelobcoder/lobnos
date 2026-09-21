"use client";

import { RiAddLine, RiBankCardLine, RiUserSettingsLine } from "@remixicon/react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import ReportShell from "../../../components/accounting/ReportShell";
import { customFetch, customFetchMutation } from "../../../components/Auth/customFetch";

type PaymentAccount = {
     id: number;
     name: string;
     account_type: "cash" | "bank" | "mobile_money" | "other";
     currency: string;
     gl_account_code: string;
     branchid: number | null;
     users: Array<{ employeeid: number; username?: string; role?: string; can_pay: boolean; can_view: boolean; can_reconcile: boolean }>;
};

const EMPTY_ACCOUNT = { name: "", account_type: "cash", currency: "GHS", gl_account_code: "acc-1000" };
const EMPTY_ACCESS = { accountId: "", employeeid: "", canPay: true, canView: true, canReconcile: false };

export default function PaymentAccountsPage() {
     const [accounts, setAccounts] = useState<PaymentAccount[]>([]);
     const [employees, setEmployees] = useState<any[]>([]);
     const [chart, setChart] = useState<any[]>([]);
     const [accountForm, setAccountForm] = useState(EMPTY_ACCOUNT);
     const [accessForm, setAccessForm] = useState(EMPTY_ACCESS);
     const [busy, setBusy] = useState(false);

     const load = useCallback(async () => {
          try {
               const [accountsResponse, optionsResponse] = await Promise.all([
                    customFetch("expenses/payment-accounts/manage"),
                    customFetch("expenses/payment-accounts/options"),
               ]);
               if (!accountsResponse?.success) throw new Error(accountsResponse?.message || "Unable to load payment accounts");
               if (!optionsResponse?.success) throw new Error(optionsResponse?.message || "Unable to load account options");
               setAccounts(accountsResponse.data || []);
               setEmployees(optionsResponse.data?.employees || []);
               setChart(optionsResponse.data?.ledgerAccounts || []);
          } catch (error: any) {
               toast.error(error?.message || "Unable to load payment-account controls");
          }
     }, []);

     useEffect(() => { load(); }, [load]);

     const assetAccounts = chart;

     const createAccount = async () => {
          if (!accountForm.name.trim() || !accountForm.gl_account_code) {
               toast.error("Enter an account name and choose its ledger account");
               return;
          }
          setBusy(true);
          try {
               const response = await customFetchMutation("expenses/payment-accounts", "POST", accountForm);
               if (!response?.success) throw new Error(response?.message || "Unable to create account");
               toast.success("Payment account created");
               setAccountForm(EMPTY_ACCOUNT);
               await load();
          } catch (error: any) {
               toast.error(error?.message || "Unable to create payment account");
          } finally {
               setBusy(false);
          }
     };

     const grantAccess = async () => {
          if (!accessForm.accountId || !accessForm.employeeid) {
               toast.error("Choose an account and an employee");
               return;
          }
          setBusy(true);
          try {
               const response = await customFetchMutation(`expenses/payment-accounts/${accessForm.accountId}/access`, "PUT", {
                    employeeid: Number(accessForm.employeeid),
                    can_pay: accessForm.canPay,
                    can_view: accessForm.canView,
                    can_reconcile: accessForm.canReconcile,
               });
               if (!response?.success) throw new Error(response?.message || "Unable to assign account access");
               toast.success("Payment-account access saved");
               setAccessForm(EMPTY_ACCESS);
               await load();
          } catch (error: any) {
               toast.error(error?.message || "Unable to assign account access");
          } finally {
               setBusy(false);
          }
     };

     return (
          <ReportShell title="Payment Accounts" subtitle="Control where expense payments come from and who may use each source">
               <div className="alert alert-info"><strong>Two controls are required before a user can pay an expense:</strong> assign <strong>Can pay</strong> on the payment account here, then grant <strong>Pay expenses</strong> with an amount limit under <a href="/accounting/delegations">Delegated Authority</a>.</div>
               <div className="row g-3 mb-4">
                    <div className="col-xl-6">
                         <section className="card border-0 shadow-sm h-100">
                              <div className="card-body">
                                   <h2 className="h6 d-flex align-items-center gap-2 mb-3"><RiBankCardLine size={20} /> Create payment source</h2>
                                   <div className="row g-3">
                                        <div className="col-md-6"><label className="form-label">Account name</label><input className="form-control" value={accountForm.name} onChange={(event) => setAccountForm({ ...accountForm, name: event.target.value })} placeholder="Main Cash, Ecobank, MTN MoMo" /></div>
                                        <div className="col-md-3"><label className="form-label">Type</label><select className="form-select" value={accountForm.account_type} onChange={(event) => setAccountForm({ ...accountForm, account_type: event.target.value })}><option value="cash">Cash</option><option value="bank">Bank</option><option value="mobile_money">Mobile money</option><option value="other">Other</option></select></div>
                                        <div className="col-md-3"><label className="form-label">Currency</label><input className="form-control" maxLength={3} value={accountForm.currency} onChange={(event) => setAccountForm({ ...accountForm, currency: event.target.value.toUpperCase() })} /></div>
                                        <div className="col-12"><label className="form-label">Posts to ledger account</label><select className="form-select" value={accountForm.gl_account_code} onChange={(event) => setAccountForm({ ...accountForm, gl_account_code: event.target.value })}>{assetAccounts.map((account) => <option key={account.account_code} value={account.account_code}>{account.account_code} - {account.name}</option>)}</select></div>
                                        <div className="col-12"><button className="btn btn-primary d-inline-flex align-items-center gap-2" disabled={busy} onClick={createAccount}><RiAddLine size={18} /> Create account</button></div>
                                   </div>
                              </div>
                         </section>
                    </div>
                    <div className="col-xl-6">
                         <section className="card border-0 shadow-sm h-100">
                              <div className="card-body">
                                   <h2 className="h6 d-flex align-items-center gap-2 mb-3"><RiUserSettingsLine size={20} /> Assign account access</h2>
                                   <div className="row g-3">
                                        <div className="col-md-6"><label className="form-label">Payment account</label><select className="form-select" value={accessForm.accountId} onChange={(event) => setAccessForm({ ...accessForm, accountId: event.target.value })}><option value="">Select account</option>{accounts.map((account) => <option key={account.id} value={account.id}>{account.name}</option>)}</select></div>
                                        <div className="col-md-6"><label className="form-label">Employee</label><select className="form-select" value={accessForm.employeeid} onChange={(event) => setAccessForm({ ...accessForm, employeeid: event.target.value })}><option value="">Select employee</option>{employees.map((employee) => <option key={employee.employeeid} value={employee.employeeid}>{employee.fullname || employee.username} - {employee.role}</option>)}</select></div>
                                        <div className="col-12 d-flex flex-wrap gap-4">{([["canPay", "Can pay"], ["canView", "Can view"], ["canReconcile", "Can reconcile"]] as const).map(([field, label]) => <label className="form-check" key={field}><input className="form-check-input" type="checkbox" checked={accessForm[field]} onChange={(event) => setAccessForm({ ...accessForm, [field]: event.target.checked })} /><span className="form-check-label">{label}</span></label>)}</div>
                                        <div className="col-12"><button className="btn btn-outline-primary" disabled={busy} onClick={grantAccess}>Save access</button></div>
                                   </div>
                              </div>
                         </section>
                    </div>
               </div>

               <div className="row g-3">
                    {accounts.map((account) => (
                         <div className="col-lg-6" key={account.id}>
                              <article className="card border h-100">
                                   <div className="card-body">
                                        <div className="d-flex justify-content-between gap-3"><div><h3 className="h6 mb-1">{account.name}</h3><div className="text-muted text-capitalize">{account.account_type.replace("_", " ")} · {account.currency}</div></div><code>{account.gl_account_code}</code></div>
                                        <hr />
                                        {account.users.length ? account.users.map((user) => <div className="d-flex justify-content-between align-items-center border-bottom py-2" key={user.employeeid}><div><strong>{user.username || `Employee ${user.employeeid}`}</strong><small className="text-muted d-block text-capitalize">{user.role}</small></div><div className="small">{user.can_pay ? "Pay" : ""}{user.can_view ? " · View" : ""}{user.can_reconcile ? " · Reconcile" : ""}</div></div>) : <p className="text-muted mb-0">No users assigned.</p>}
                                   </div>
                              </article>
                         </div>
                    ))}
               </div>
          </ReportShell>
     );
}
