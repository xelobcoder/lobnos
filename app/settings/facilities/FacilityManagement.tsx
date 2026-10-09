"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { customFetch, customFetchMutation } from "../../../components/Auth/customFetch";
import PrimeTable from "../../../components/accessories/Datatables/PrimeTable";
import { ModuleConfigurationForm, MODULE_LABELS, ModuleName } from "./provisioningForm";

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
     moduleConfiguration?: ModuleConfigurationForm & { monthlyTotal: string } | null;
     plan: Plan | null; periods: Period[]; history: Payment[];
     schedule: (Plan & { endDate: string | null })[];
     window?: { from: string; to: string; label?: string } | null; isControlTenant?: boolean;
     overdueBeforeWindow: number; historyTruncated: boolean;
}
const today = () => {
     const date = new Date();
     return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};
const failureMessage = (error: unknown) => error instanceof Error ? error.message : "Client management failed. Please try again.";
const extractResult = (response: { status?: string; result?: unknown; message?: string; error?: string }, fallback: string) => {
     if (response?.status !== "success") throw new Error(response?.message || response?.error || fallback);
};

export default function FacilityManagement({ facility, onStatusChange, mode = "full" }: {
     facility: ManagedFacility;
     mode?: "access" | "full";
     onStatusChange: (tenantId: number, status: string) => void;
}) {
     const endpoint = `platform/facilities/${facility.tenantId}`;
     const showPayments = mode === "full";
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

     useEffect(() => { if (showPayments) void load(); else setLoading(false); }, [load, showPayments]);

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
          if (reason.trim().length < 3) { setError("Enter a reason of at least 3 characters for the access change."); return; }
          if (await mutate("PATCH", "status", { status, reason: reason.trim() }, status === "active" ? "Client activated." : "Client deactivated.")) {
               onStatusChange(facility.tenantId, status);
               setReason("");
          }
     };

     const recordPayment = async (event: FormEvent) => {
          event.preventDefault();
          if (!reference.trim()) { setError("Enter a payment reference."); return; }
          if (await mutate("POST", "payments", { periodStart, paidAt, reference: reference.trim(), notes: notes.trim() }, "Payment recorded for the selected period.")) {
               setPeriodStart(""); setReference(""); setNotes("");
               await load();
          }
     };

     const voidPayment = async (event: FormEvent) => {
          event.preventDefault();
          if (voidId === null || voidReason.trim().length < 3) { setError("Enter a reason of at least 3 characters to void the payment."); return; }
          if (await mutate("DELETE", `payments/${voidId}`, { reason: voidReason.trim() }, "Payment voided. The correction is retained in history.")) {
               setVoidId(null); setVoidReason("");
               await load();
          }
     };

     const disabled = busy || loading;
     const isControl = facility.isControlTenant || data?.isControlTenant;
     const scheduleColumns = [
          { Header: "Start", accessor: "startDate" },
          { Header: "End", accessor: "endDate", Cell: ({ value }) => value || "Ongoing" },
          { Header: "Frequency", accessor: "frequency" },
          {
               Header: "Amount per period",
               accessor: "amount",
               Cell: ({ row }) => `${row.original.currency} ${row.original.amount}`,
          },
     ];
     const periodColumns = [
          {
               Header: "Period",
               accessor: "periodStart",
               Cell: ({ row }) => `${row.original.periodStart} - ${row.original.periodEnd}`,
          },
          { Header: "Due date", accessor: "dueDate" },
          {
               Header: "Amount",
               accessor: "amount",
               Cell: ({ row }) => `${row.original.currency} ${row.original.amount}`,
          },
          {
               Header: "Payment status",
               accessor: "status",
               Cell: ({ value }) => (
                    <span className={`fw-semibold text-capitalize ${value === "paid" ? "text-success" : value === "overdue" ? "text-danger" : "text-secondary"}`}>
                         {value}
                    </span>
               ),
          },
          {
               Header: "Action",
               id: "action",
               Cell: ({ row }) => row.original.status !== "paid" && (
                    <button
                         type="button"
                         className="btn btn-sm btn-outline-primary"
                         disabled={disabled}
                         onClick={() => {
                              setPeriodStart(row.original.periodStart);
                              setPaidAt(today());
                              setReference("");
                              setNotes("");
                         }}
                    >
                         Mark paid
                    </button>
               ),
          },
     ];
     const paymentColumns = [
          {
               Header: "Period",
               accessor: "periodStart",
               Cell: ({ row }) => `${row.original.periodStart} - ${row.original.periodEnd}`,
          },
          {
               Header: "Amount",
               accessor: "amount",
               Cell: ({ row }) => `${row.original.currency} ${row.original.amount}`,
          },
          { Header: "Paid on", accessor: "paidAt" },
          {
               Header: "Reference / notes",
               accessor: "reference",
               Cell: ({ row }) => (
                    <span>
                         {row.original.reference}
                         {row.original.notes && <span className="d-block text-muted">{row.original.notes}</span>}
                    </span>
               ),
          },
          {
               Header: "Status / correction",
               id: "correction",
               Cell: ({ row }) => row.original.voidedAt ? (
                    <span>
                         Voided
                         {row.original.voidReason && <span className="d-block text-muted">{row.original.voidReason}</span>}
                    </span>
               ) : (
                    <button
                         type="button"
                         className="btn btn-sm btn-outline-danger"
                         disabled={disabled}
                         onClick={() => { setVoidId(row.original.id); setVoidReason(""); }}
                    >
                         Void payment
                    </button>
               ),
          },
     ];
     return (
          <section className="mt-3" aria-busy={disabled}>
               <div className="border-bottom py-3 mb-3">
                    <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2">
                         <div>
                              <h2 className="h5 fw-semibold mb-1">Manage client: {facility.name}</h2>
                              <p className="small text-muted mb-0"><span className="font-monospace">{facility.platformId}</span> <span className="mx-1">·</span> Tenant {facility.tenantId}</p>
                         </div>
                         <span className={`fw-semibold text-capitalize ${facility.status.toLowerCase() === "active" ? "text-success" : "text-secondary"}`}>{facility.status}</span>
                    </div>
               </div>
               <div>
                    {error && <div className="alert alert-danger" role="alert">{error}</div>}
                    {notice && <div className="alert alert-success" role="status">{notice}</div>}
                    <h3 className="h6 fw-semibold">Client access</h3>
                    <p className="text-muted">Deactivation blocks client access. Payment tracking does not automatically activate or deactivate the client.</p>
                    {isControl ? <div className="alert alert-info">This is the backend-configured platform home facility, where platform super administrators sign in. It is protected from deactivation to prevent locking you out. This label is not a payment status or a new-client category.</div> :
                         ["active", "suspended"].includes(facility.status) ? (
                              <form onSubmit={changeStatus} className="row g-2 align-items-end mb-4">
                                   <div className="col-md-8"><label htmlFor="accessReason" className="form-label">Reason for access change</label><input id="accessReason" className="form-control" value={reason} onChange={(event) => setReason(event.target.value)} minLength={3} maxLength={500} required disabled={disabled} /></div>
                                   <div className="col-md-4"><button className={`btn ${facility.status === "active" ? "btn-outline-danger" : "btn-outline-success"}`} disabled={disabled}>{facility.status === "active" ? "Deactivate client" : "Activate client"}</button></div>
                              </form>
                         ) : <p className="text-muted">Access cannot be changed while the facility is {facility.status}.</p>}
                    {showPayments && <>
                    <div className="d-flex justify-content-between flex-wrap align-items-end gap-2 mb-3">
                         <h3 className="h6 fw-semibold mb-0">Subscription and payments</h3>
                         <form onSubmit={(event) => { event.preventDefault(); setPeriodStart(""); setQueryDate(asOf); if (asOf === queryDate) void load(); }} className="d-flex gap-2 align-items-end">
                              <div><label htmlFor="asOf" className="form-label">View periods around</label><input id="asOf" type="date" className="form-control" value={asOf} onChange={(event) => setAsOf(event.target.value)} required disabled={disabled} /></div>
                              <button className="btn btn-outline-secondary" disabled={disabled}>Refresh periods</button>
                         </form>
                    </div>
                    {loading && <p role="status">Loading subscription...</p>}
                    {!loading && !data && <button className="btn btn-outline-primary" onClick={() => void load()} disabled={busy}>Retry subscription</button>}
                    {data && <>
                         {data.moduleConfiguration && <section className="border rounded p-3 mb-3">
                              <h3 className="h6">Activated modules and monthly costs</h3>
                              <p>Branch support: {data.moduleConfiguration.branchMode === "multiple" ? "Multiple branches" : "Single branch"}</p>
                              <table className="table"><thead><tr><th>Module</th><th>Status</th><th>Monthly price</th></tr></thead><tbody>
                                   {(Object.keys(MODULE_LABELS) as ModuleName[]).map(module => <tr key={module}><td>{MODULE_LABELS[module]}</td><td>{data.moduleConfiguration!.modules[module].enabled ? "Activated" : "Not activated"}</td><td>{data.moduleConfiguration!.currency} {data.moduleConfiguration!.modules[module].monthlyPrice}</td></tr>)}
                              </tbody></table>
                              <p className="fw-semibold">Enabled modules total: {data.moduleConfiguration.currency} {data.moduleConfiguration.monthlyTotal} / month</p>
                              <button type="button" className="btn btn-outline-primary" disabled={disabled || Number(data.moduleConfiguration.monthlyTotal) === 0} onClick={() => setPlan(current => ({ ...current, frequency: "monthly", amount: data.moduleConfiguration!.monthlyTotal, currency: data.moduleConfiguration!.currency }))}>Use module total for monthly schedule</button>
                              <p className="text-muted small mt-2">This fills the schedule form. Save it to apply the amount; existing payments are not changed.</p>
                         </section>}
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
                                   <p className="text-muted mt-2">Each payment covers one full period, due at its start. A later start date schedules a change on an existing period boundary. Earlier unpaid periods and payment history remain owed or recorded. Correcting the latest schedule cannot invalidate existing payments; void affected payments first if needed.</p>
                                   <button className="btn btn-primary">Save payment schedule</button>
                              </fieldset>
                         </form>
                         {data.schedule?.length > 0 && <div className="table-responsive mb-3">
                              <h3 className="h6">Scheduled plans</h3>
                              <PrimeTable column={scheduleColumns} data={data.schedule} filtering={true} serverSideFiltering={false} handleSeverSideProcessing={null} />
                         </div>}
                         <h3 className="h6">Payment periods</h3>
                         {data.window && <p className="text-muted">Showing {data.window.from} to {data.window.to}. Change the viewing date to inspect another range.</p>}
                         {data.overdueBeforeWindow > 0 && <p className="alert alert-warning">{data.overdueBeforeWindow} unpaid overdue periods exist before this displayed range. Choose an earlier viewing date to review them.</p>}
                         {data.periods.length > 0
                              ? <PrimeTable column={periodColumns} data={data.periods} filtering={true} serverSideFiltering={false} handleSeverSideProcessing={null} />
                              : <p className="text-muted">No payment periods in this range.</p>}
                         {periodStart && <form onSubmit={recordPayment} className="border-top pt-3 mb-3">
                              <fieldset disabled={disabled}>
                                   <legend className="h6">Record full payment: {periodStart}</legend>
                                   <div className="row g-3">
                                        <div className="col-md-4"><label htmlFor="paidAt" className="form-label">Payment date</label><input id="paidAt" type="date" className="form-control" value={paidAt} onChange={(event) => setPaidAt(event.target.value)} max={today()} required /></div>
                                        <div className="col-md-4"><label htmlFor="paymentReference" className="form-label">Payment reference</label><input id="paymentReference" className="form-control" value={reference} onChange={(event) => setReference(event.target.value)} maxLength={100} required /></div>
                                        <div className="col-md-4"><label htmlFor="paymentNotes" className="form-label">Payment notes</label><input id="paymentNotes" className="form-control" value={notes} onChange={(event) => setNotes(event.target.value)} maxLength={500} /></div>
                                   </div>
                                   <button className="btn btn-success mt-3">Confirm payment received</button>
                                   <button type="button" className="btn btn-outline-secondary mt-3 ms-2" onClick={() => setPeriodStart("")}>Cancel</button>
                              </fieldset>
                         </form>}
                         <h3 className="h6">Payment history</h3>
                         {data.historyTruncated && <p className="alert alert-info">Showing the latest 500 payment records. Older records are retained by the server but are not included in this view.</p>}
                         {data.history.length > 0
                              ? <PrimeTable column={paymentColumns} data={data.history} filtering={true} serverSideFiltering={false} handleSeverSideProcessing={null} />
                              : <p className="text-muted">No recorded payments.</p>}
                         {voidId !== null && <form onSubmit={voidPayment} className="border-top pt-3">
                              <label htmlFor="voidReason" className="form-label">Reason for voiding payment #{voidId}</label>
                              <input id="voidReason" className="form-control" value={voidReason} onChange={(event) => setVoidReason(event.target.value)} minLength={3} maxLength={500} required disabled={disabled} />
                              <button className="btn btn-danger mt-3" disabled={disabled}>Confirm void payment</button>
                              <button type="button" className="btn btn-outline-secondary mt-3 ms-2" disabled={disabled} onClick={() => setVoidId(null)}>Cancel</button>
                         </form>}
                    </>}
                    </>}
               </div>
          </section>
     );
}
