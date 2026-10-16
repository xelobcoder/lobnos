"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { customFetch, customFetchMutation } from "../../../components/Auth/customFetch";
import { useApplication } from "../../../components/Auth/useApplicationContext";
import { MODULE_LABELS, ModuleName } from "./provisioningForm";
import FacilityNav from "./FacilityNav";

export interface SubscriptionPlan {
     code: string;
     name: string;
     description: string;
     currency: string;
     monthlyPrice: string;
     modules: ModuleName[];
     branchMode: "single" | "multiple";
     rank: number;
     active: boolean;
}

interface UpgradeRequest {
     id: number;
     tenantId: number;
     organizationName?: string | null;
     fromPlanCode: string | null;
     toPlanCode: string;
     status: string;
     requestedAt: string;
     requestedByEmail?: string | null;
     decisionReason?: string | null;
}

const MODULE_NAMES = Object.keys(MODULE_LABELS) as ModuleName[];
const normalizeRole = (role: unknown) => String(role || "").toLowerCase().replace(/[\s_-]/g, "");
const errorMessage = (error: unknown) => error instanceof Error ? error.message : "Unable to manage subscription plans.";
const blankPlan = (): SubscriptionPlan => ({
     code: "", name: "", description: "", currency: "GHS", monthlyPrice: "0.00",
     modules: [], branchMode: "single", rank: 1, active: false,
});

export default function SubscriptionPlansEditor() {
     const application = useApplication();
     const isSuperAdmin = normalizeRole(application?.user?.role) === "superadmin";
     const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
     const [requests, setRequests] = useState<UpgradeRequest[]>([]);
     const [draft, setDraft] = useState<SubscriptionPlan>(blankPlan());
     const [isNew, setIsNew] = useState(true);
     const [loading, setLoading] = useState(true);
     const [busy, setBusy] = useState(false);
     const [error, setError] = useState("");
     const [notice, setNotice] = useState("");

     const load = useCallback(async () => {
          const [planResponse, requestResponse] = await Promise.all([
               customFetch("platform/facilities/plans"),
               customFetch("platform/facilities/upgrade-requests?status=pending"),
          ]);
          if (planResponse?.status !== "success" || !Array.isArray(planResponse.result)) {
               throw new Error(planResponse?.message || planResponse?.error || "Unable to load subscription plans.");
          }
          setPlans(planResponse.result);
          setRequests(requestResponse?.status === "success" && Array.isArray(requestResponse.result) ? requestResponse.result : []);
     }, []);

     useEffect(() => {
          if (!isSuperAdmin) {
               setLoading(false);
               return;
          }
          load().catch(failure => setError(errorMessage(failure))).finally(() => setLoading(false));
     }, [isSuperAdmin, load]);

     const edit = (plan: SubscriptionPlan) => {
          setDraft({ ...plan, modules: [...plan.modules] });
          setIsNew(false);
          setError("");
          setNotice("");
     };

     const toggleModule = (moduleName: ModuleName) => setDraft(current => ({
          ...current,
          modules: current.modules.includes(moduleName)
               ? current.modules.filter(item => item !== moduleName)
               : [...current.modules, moduleName],
     }));

     const save = async (event: FormEvent<HTMLFormElement>) => {
          event.preventDefault();
          if (busy) return;
          const code = draft.code.trim().toLowerCase();
          if (!/^[a-z][a-z0-9_-]{1,31}$/.test(code)) return setError("Plan code must start with a letter and use 2-32 lowercase letters, numbers, - or _.");
          if (!draft.name.trim()) return setError("Plan name is required.");
          if (!draft.modules.length) return setError("Select at least one module.");
          if (!/^(0|[1-9]\d{0,9})(?:\.\d{1,2})?$/.test(draft.monthlyPrice)) return setError("Use a nonnegative price with at most two decimal places.");
          if (draft.active && Number(draft.monthlyPrice) <= 0) return setError("Set a price above zero before activating the plan.");
          setBusy(true);
          setError("");
          setNotice("");
          try {
               const response = await customFetchMutation(`platform/facilities/plans/${encodeURIComponent(code)}`, "PUT", {
                    name: draft.name.trim(),
                    description: draft.description.trim(),
                    currency: draft.currency.trim().toUpperCase(),
                    monthlyPrice: draft.monthlyPrice,
                    modules: draft.modules,
                    branchMode: draft.branchMode,
                    rank: Number(draft.rank),
                    active: draft.active,
               });
               if (response?.status !== "success") throw new Error(response?.message || response?.error || "Unable to save the plan.");
               await load();
               setNotice(`Plan "${draft.name.trim()}" saved.`);
               setDraft(blankPlan());
               setIsNew(true);
          } catch (failure) {
               setError(errorMessage(failure));
          } finally {
               setBusy(false);
          }
     };

     const decide = async (request: UpgradeRequest, approve: boolean) => {
          if (busy) return;
          let body: Record<string, string> | undefined;
          if (!approve) {
               const reason = window.prompt("Reason for rejecting this upgrade request (3-500 characters):") || "";
               if (reason.trim().length < 3) return;
               body = { reason: reason.trim() };
          }
          setBusy(true);
          setError("");
          setNotice("");
          try {
               const response = await customFetchMutation(
                    `platform/facilities/upgrade-requests/${request.id}/${approve ? "approve" : "reject"}`, "POST", body || {});
               if (response?.status !== "success") throw new Error(response?.message || response?.error || "Unable to update the request.");
               await load();
               setNotice(approve ? "Upgrade approved and applied." : "Upgrade request rejected.");
          } catch (failure) {
               setError(errorMessage(failure));
          } finally {
               setBusy(false);
          }
     };

     if (!isSuperAdmin) return <main className="p-2"><div className="alert alert-danger" role="alert">Only an authorized platform super administrator can manage subscription plans.</div></main>;

     return (
          <main className="p-2" aria-busy={loading || busy}>
               <FacilityNav />
               <h1 className="h4 mb-2">Subscription plans</h1>
               <p className="text-muted">Bundle modules into tiers such as Basic, Professional and Enterprise with one monthly price. Higher rank means a higher tier; facilities can only request upgrades to a higher tier.</p>
               {error && <div className="alert alert-danger" role="alert">{error}</div>}
               {notice && <div className="alert alert-success" role="status">{notice}</div>}
               {loading ? <p role="status">Loading plans...</p> : <>
                    <section className="card border-0 shadow-sm mb-3" aria-label="Plans">
                         <div className="table-responsive">
                              <table className="table mb-0 align-middle">
                                   <thead><tr><th>Rank</th><th>Plan</th><th>Price / month</th><th>Modules</th><th>Branches</th><th>Status</th><th /></tr></thead>
                                   <tbody>
                                        {plans.map(plan => <tr key={plan.code}>
                                             <td>{plan.rank}</td>
                                             <td><strong>{plan.name}</strong><div className="small text-muted">{plan.code}</div></td>
                                             <td>{plan.currency} {plan.monthlyPrice}</td>
                                             <td>{plan.modules.map(item => MODULE_LABELS[item] || item).join(", ")}</td>
                                             <td className="text-capitalize">{plan.branchMode}</td>
                                             <td><span className={`badge ${plan.active ? "bg-success" : "bg-secondary"}`}>{plan.active ? "Active" : "Inactive"}</span></td>
                                             <td><button type="button" className="btn btn-sm btn-outline-primary" onClick={() => edit(plan)}>Edit</button></td>
                                        </tr>)}
                                        {!plans.length && <tr><td colSpan={7} className="text-muted">No plans yet.</td></tr>}
                                   </tbody>
                              </table>
                         </div>
                    </section>

                    <section className="card border-0 shadow-sm mb-3" aria-label="Plan editor">
                         <form className="card-body" onSubmit={save}>
                              <h2 className="h6">{isNew ? "Create plan" : `Edit ${draft.name || draft.code}`}</h2>
                              <div className="row g-3">
                                   <div className="col-md-3"><label htmlFor="plan-code" className="form-label">Code</label>
                                        <input id="plan-code" className="form-control" value={draft.code} disabled={!isNew} onChange={event => setDraft({ ...draft, code: event.target.value })} /></div>
                                   <div className="col-md-5"><label htmlFor="plan-name" className="form-label">Name</label>
                                        <input id="plan-name" className="form-control" value={draft.name} maxLength={60} onChange={event => setDraft({ ...draft, name: event.target.value })} /></div>
                                   <div className="col-md-2"><label htmlFor="plan-currency" className="form-label">Currency</label>
                                        <input id="plan-currency" className="form-control text-uppercase" value={draft.currency} maxLength={3} onChange={event => setDraft({ ...draft, currency: event.target.value.toUpperCase() })} /></div>
                                   <div className="col-md-2"><label htmlFor="plan-price" className="form-label">Monthly price</label>
                                        <input id="plan-price" className="form-control" inputMode="decimal" value={draft.monthlyPrice} onChange={event => setDraft({ ...draft, monthlyPrice: event.target.value })} /></div>
                                   <div className="col-12"><label htmlFor="plan-description" className="form-label">Description</label>
                                        <input id="plan-description" className="form-control" value={draft.description} maxLength={300} onChange={event => setDraft({ ...draft, description: event.target.value })} /></div>
                                   <div className="col-md-3"><label htmlFor="plan-rank" className="form-label">Tier rank</label>
                                        <input id="plan-rank" type="number" min={0} className="form-control" value={draft.rank} onChange={event => setDraft({ ...draft, rank: Number(event.target.value) })} /></div>
                                   <div className="col-md-3"><label htmlFor="plan-branch" className="form-label">Branch mode</label>
                                        <select id="plan-branch" className="form-select" value={draft.branchMode} onChange={event => setDraft({ ...draft, branchMode: event.target.value as "single" | "multiple" })}>
                                             <option value="single">Single branch</option><option value="multiple">Multiple branches</option></select></div>
                                   <div className="col-md-3 d-flex align-items-end"><div className="form-check">
                                        <input id="plan-active" type="checkbox" className="form-check-input" checked={draft.active} onChange={event => setDraft({ ...draft, active: event.target.checked })} />
                                        <label htmlFor="plan-active" className="form-check-label">Active (offered to facilities)</label></div></div>
                                   <div className="col-12"><div className="form-label">Included modules</div>
                                        <div className="d-flex flex-wrap gap-3">{MODULE_NAMES.map(moduleName => <div className="form-check" key={moduleName}>
                                             <input id={`plan-module-${moduleName}`} type="checkbox" className="form-check-input" checked={draft.modules.includes(moduleName)} onChange={() => toggleModule(moduleName)} />
                                             <label htmlFor={`plan-module-${moduleName}`} className="form-check-label">{MODULE_LABELS[moduleName]}</label></div>)}</div></div>
                              </div>
                              <div className="mt-3 d-flex gap-2">
                                   <button type="submit" className="btn btn-primary" disabled={busy}>{busy ? "Saving..." : "Save plan"}</button>
                                   {!isNew && <button type="button" className="btn btn-outline-secondary" onClick={() => { setDraft(blankPlan()); setIsNew(true); }}>New plan</button>}
                              </div>
                         </form>
                    </section>

                    <section className="card border-0 shadow-sm" aria-label="Pending upgrade requests">
                         <div className="card-body">
                              <h2 className="h6">Pending upgrade requests</h2>
                              {!requests.length ? <p className="text-muted mb-0">No pending requests.</p> : <ul className="list-group list-group-flush">
                                   {requests.map(request => <li key={request.id} className="list-group-item d-flex justify-content-between align-items-center gap-2">
                                        <span>{request.organizationName || `Facility ${request.tenantId}`}: {request.fromPlanCode || "custom"} &rarr; <strong>{request.toPlanCode}</strong>
                                             <span className="small text-muted ms-2">{request.requestedByEmail || ""} {new Date(request.requestedAt).toLocaleString()}</span></span>
                                        <span className="d-flex gap-2">
                                             <button type="button" className="btn btn-sm btn-success" disabled={busy} onClick={() => void decide(request, true)}>Approve</button>
                                             <button type="button" className="btn btn-sm btn-outline-danger" disabled={busy} onClick={() => void decide(request, false)}>Reject</button>
                                        </span>
                                   </li>)}
                              </ul>}
                         </div>
                    </section>
               </>}
          </main>
     );
}
