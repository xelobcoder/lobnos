"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { customFetch, customFetchMutation } from "../../../components/Auth/customFetch";

export interface ManagedFacility {
     tenantId: number;
     platformId: string;
     name: string;
     status: string;
     isControlTenant?: boolean;
}
type Frequency = "daily" | "weekly" | "monthly" | "yearly";
interface Plan { frequency: Frequency; amount: string; currency: string; startDate: string }
interface Payment {
     id: number; periodStart: string; periodEnd: string; amount: string; currency: string;
     paidAt: string; reference: string; notes: string; voidedAt?: string | null; voidReason?: string | null;
}
interface Period {
     periodStart: string; periodEnd: string; dueDate: string; amount: string; currency: string;
     status: "paid" | "unpaid" | "overdue";
     payment: { id: number; paidAt: string; reference: string; notes: string } | null;
}
interface Subscription {
     plan: Plan | null; periods: Period[]; history: Payment[];
     window?: { from: string; to: string }; isControlTenant?: boolean;
}
const today = () => {
     const date = new Date();
     return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};
const failureMessage = (error: unknown) => error instanceof Error ? error.message : "Client management failed. Please try again.";
const extractResult = (response: { status?: string; result?: unknown; message?: string; error?: string }, fallback: string) => {
     if (response?.status !== "success") throw new Error(response?.message || response?.error || fallback);
};

export default function FacilityManagement({ facility, onStatusChange }: {
     facility: ManagedFacility;
     onStatusChange: (tenantId: number, status: string) => void;
}) {
     const endpoint = `platform/facilities/${facility.tenantId}`;
     const [data, setData] = useState<Subscription | null>(null);
     const [plan, setPlan] = useState<Plan>({ frequency: "monthly", amount: "", currency: "", startDate: today() });
     const [asOf, setAsOf] = useState(today());
     const [loading, setLoading] = useState(true);
     const [busy, setBusy] = useState(false);
     const [error, setError] = useState("");
     const [notice, setNotice] = useState("");
     const [reason, setReason] = useState("");
     const [periodStart, setPeriodStart] = useState("");
     const [paidAt, setPaidAt] = useState(today());
     const [reference, setReference] = useState("");
     const [notes, setNotes] = useState("");
     const [voidId, setVoidId] = useState<number | null>(null);
     const [voidReason, setVoidReason] = useState("");
     const [queryDate, setQueryDate] = useState(asOf);

     const load = useCallback(async () => {
          setLoading(true);
          setError("");
          try {
               const response = await customFetch(`${endpoint}/subscription?asOf=${queryDate}`);
               extractResult(response, "Unable to load the client subscription.");
               if (!response.result || !Array.isArray(response.result.periods) || !Array.isArray(response.result.history)) {
                    throw new Error("The server returned an invalid subscription response.");
               }
               setData(response.result);
               if (response.result.plan) setPlan(response.result.plan);
          } catch (failure) {
               setError(failureMessage(failure));
               setData(null);
          } finally {
               setLoading(false);
          }
     }, [endpoint, queryDate]);

     useEffect(() => { void load(); }, [load]);

     const mutate = async (method: string, suffix: string, body: object, success: string) => {
          if (busy) return false;
          setBusy(true);
          setError("");
          setNotice("");
          try {
               const response = await customFetchMutation(`${endpoint}/${suffix}`, method, body);
               extractResult(response, "The server did not confirm the change.");
               setNotice(success);
               return true;
          } catch (failure) {
               setError(failureMessage(failure));
               return false;
          } finally {
               setBusy(false);
          }
     };

     const savePlan = async (event: FormEvent) => {
          event.preventDefault();
          if (!/^(?:0|[1-9]\d{0,9})(?:\.\d{1,2})?$/.test(plan.amount) || !/[1-9]/.test(plan.amount)) {
               setError("Enter a positive amount with at most two decimal places.");
               return;
          }
          if (await mutate("PUT", "subscription", { ...plan, currency: plan.currency.toUpperCase() }, "Subscription schedule saved. Existing payments remain in history.")) {
               setPeriodStart("");
               await load();
          }
     };

     const changeStatus = async (event: FormEvent) => {
          event.preventDefault();
          const status = facility.status === "active" ? "suspended" : "active";
          if (!reason.trim()) { setError("Enter a reason for the access change."); return; }
          if (await mutate("PATCH", "status", { status, reason: reason.trim() }, status === "active" ? "Client activated." : "Client deactivated.")) {
               onStatusChange(facility.tenantId, status);
               setReason("");
          }
     };

     const recordPayment = async (event: FormEvent) => {
          event.preventDefault();
          if (await mutate("POST", "payments", { periodStart, paidAt, reference: reference.trim(), notes: notes.trim() }, "Payment recorded for the selected period.")) {
               setPeriodStart(""); setReference(""); setNotes("");
               await load();
          }
     };

     const voidPayment = async (event: FormEvent) => {
          event.preventDefault();
          if (voidId === null || !voidReason.trim()) { setError("Enter a reason to void the payment."); return; }
          if (await mutate("DELETE", `payments/${voidId}`, { reason: voidReason.trim() }, "Payment voided. The correction is retained in history.")) {
               setVoidId(null); setVoidReason("");
               await load();
          }
     };

     const disabled = busy || loading;
     const isControl = facility.isControlTenant || data?.isControlTenant;
     return (
          <section className="card shadow-sm mt-4" aria-busy={disabled}>
               <div className="card-body">
                    <h2 className="h5">Manage client: {facility.name}</h2>
                    <p className="text-muted">{facility.platformId} / {facility.tenantId} / Status: <strong>{facility.status}</strong></p>
                    {error && <div className="alert alert-danger" role="alert">{error}</div>}
                    {notice && <div className="alert alert-success" role="status">{notice}</div>}
                    <h3 className="h6">Client access</h3>
                    <p className="text-muted">Deactivation blocks client access. Payment tracking does not automatically activate or deactivate the client.</p>
                    {isControl ? <p>The platform control facility cannot be deactivated here.</p> :
                         ["active", "suspended"].includes(facility.status) ? (
                              <form onSubmit={changeStatus} className="row g-2 align-items-end mb-4">
                                   <div className="col-md-8"><label htmlFor="accessReason" className="form-label">Reason for access change</label><input id="accessReason" className="form-control" value={reason} onChange={(event) => setReason(event.target.value)} maxLength={500} required disabled={disabled} /></div>
                                   <div className="col-md-4"><button className={`btn ${facility.status === "active" ? "btn-outline-danger" : "btn-outline-success"}`} disabled={disabled}>{facility.status === "active" ? "Deactivate client" : "Activate client"}</button></div>
                              </form>
                         ) : <p className="text-muted">Access cannot be changed while the facility is {facility.status}.</p>}
                    <div className="d-flex justify-content-between flex-wrap align-items-end gap-2 mb-3">
                         <h3 className="h6 mb-0">Subscription and payments</h3>
                         <form onSubmit={(event) => { event.preventDefault(); setPeriodStart(""); setQueryDate(asOf); if (asOf === queryDate) void load(); }} className="d-flex gap-2 align-items-end">
                              <div><label htmlFor="asOf" className="form-label">View periods around</label><input id="asOf" type="date" className="form-control" value={asOf} onChange={(event) => setAsOf(event.target.value)} required disabled={disabled} /></div>
                              <button className="btn btn-outline-secondary" disabled={disabled}>Refresh periods</button>
                         </form>
                    </div>
                    {loading && <p role="status">Loading subscription...</p>}
                    {!loading && !data && <button className="btn btn-outline-primary" onClick={() => void load()} disabled={busy}>Retry subscription</button>}
                    {data && <>
                         {!data.plan && <p className="alert alert-info">No payment schedule is configured for this client.</p>}
                         <form onSubmit={savePlan} className="mb-4">
                              <fieldset disabled={disabled}>
                                   <legend className="h6">Payment schedule</legend>
                                   <div className="row g-3">
                                        <div className="col-md-3"><label htmlFor="frequency" className="form-label">Billing frequency</label><select id="frequency" className="form-select" value={plan.frequency} onChange={(event) => setPlan({ ...plan, frequency: event.target.value as Frequency })}><option value="daily">Daily</option><option value="weekly">Weekly</option><option value="monthly">Monthly</option><option value="yearly">Yearly</option></select></div>
                                        <div className="col-md-3"><label htmlFor="subscriptionAmount" className="form-label">Amount per period</label><input id="subscriptionAmount" inputMode="decimal" className="form-control" value={plan.amount} onChange={(event) => setPlan({ ...plan, amount: event.target.value })} pattern="(?:0|[1-9][0-9]{0,9})(?:\.[0-9]{1,2})?" required /></div>
                                        <div className="col-md-3"><label htmlFor="currency" className="form-label">Currency (3-letter code)</label><input id="currency" className="form-control text-uppercase" value={plan.currency} onChange={(event) => setPlan({ ...plan, currency: event.target.value.toUpperCase() })} pattern="[A-Z]{3}" maxLength={3} required placeholder="GHS" /></div>
                                        <div className="col-md-3"><label htmlFor="planStartDate" className="form-label">Schedule start date</label><input id="planStartDate" type="date" className="form-control" value={plan.startDate} onChange={(event) => setPlan({ ...plan, startDate: event.target.value })} required /></div>
                                   </div>
                                   <p className="text-muted mt-2">Each payment covers one full period, due at its start. Saving a changed schedule preserves previous payment records.</p>
                                   <button className="btn btn-primary">Save payment schedule</button>
                              </fieldset>
                         </form>
                         <h3 className="h6">Payment periods</h3>
                         {data.window && <p className="text-muted">Showing {data.window.from} to {data.window.to}. Change the viewing date to inspect another range.</p>}
                         <div className="table-responsive">
                              <table className="table">
                                   <thead><tr><th>Period</th><th>Due date</th><th>Amount</th><th>Payment status</th><th>Action</th></tr></thead>
                                   <tbody>{data.periods.map((period) => <tr key={period.periodStart}>
                                        <td>{period.periodStart} - {period.periodEnd}</td><td>{period.dueDate}</td><td>{period.currency} {period.amount}</td>
                                        <td><span className={`badge ${period.status === "paid" ? "bg-success" : period.status === "overdue" ? "bg-danger" : "bg-secondary"}`}>{period.status}</span></td>
                                        <td>{period.status !== "paid" && <button type="button" className="btn btn-sm btn-outline-primary" disabled={disabled} onClick={() => { setPeriodStart(period.periodStart); setPaidAt(today()); setReference(""); setNotes(""); }}>Mark paid</button>}</td>
                                   </tr>)}</tbody>
                              </table>
                         </div>
                         {data.periods.length === 0 && <p>No payment periods in this range.</p>}
                         {periodStart && <form onSubmit={recordPayment} className="border rounded p-3 mb-3">
                              <fieldset disabled={disabled}>
                                   <legend className="h6">Record full payment: {periodStart}</legend>
                                   <div className="row g-3">
                                        <div className="col-md-4"><label htmlFor="paidAt" className="form-label">Payment date</label><input id="paidAt" type="date" className="form-control" value={paidAt} onChange={(event) => setPaidAt(event.target.value)} max={today()} required /></div>
                                        <div className="col-md-4"><label htmlFor="paymentReference" className="form-label">Payment reference</label><input id="paymentReference" className="form-control" value={reference} onChange={(event) => setReference(event.target.value)} maxLength={100} /></div>
                                        <div className="col-md-4"><label htmlFor="paymentNotes" className="form-label">Payment notes</label><input id="paymentNotes" className="form-control" value={notes} onChange={(event) => setNotes(event.target.value)} maxLength={500} /></div>
                                   </div>
                                   <button className="btn btn-success mt-3">Confirm payment received</button>
                                   <button type="button" className="btn btn-outline-secondary mt-3 ms-2" onClick={() => setPeriodStart("")}>Cancel</button>
                              </fieldset>
                         </form>}
                         <h3 className="h6">Payment history</h3>
                         <div className="table-responsive">
                              <table className="table"><thead><tr><th>Period</th><th>Amount</th><th>Paid on</th><th>Reference / notes</th><th>Status / correction</th></tr></thead>
                                   <tbody>{data.history.map((payment) => <tr key={payment.id}>
                                        <td>{payment.periodStart} - {payment.periodEnd}</td><td>{payment.currency} {payment.amount}</td><td>{payment.paidAt}</td>
                                        <td>{payment.reference}<div className="text-muted">{payment.notes}</div></td>
                                        <td>{payment.voidedAt ? <>Voided<div className="text-muted">{payment.voidReason}</div></> : <button type="button" className="btn btn-sm btn-outline-danger" disabled={disabled} onClick={() => { setVoidId(payment.id); setVoidReason(""); }}>Void payment</button>}</td>
                                   </tr>)}</tbody>
                              </table>
                         </div>
                         {data.history.length === 0 && <p>No recorded payments.</p>}
                         {voidId !== null && <form onSubmit={voidPayment} className="border rounded p-3">
                              <label htmlFor="voidReason" className="form-label">Reason for voiding payment #{voidId}</label>
                              <input id="voidReason" className="form-control" value={voidReason} onChange={(event) => setVoidReason(event.target.value)} maxLength={500} required disabled={disabled} />
                              <button className="btn btn-danger mt-3" disabled={disabled}>Confirm void payment</button>
                              <button type="button" className="btn btn-outline-secondary mt-3 ms-2" disabled={disabled} onClick={() => setVoidId(null)}>Cancel</button>
                         </form>}
                    </>}
               </div>
          </section>
     );
}
