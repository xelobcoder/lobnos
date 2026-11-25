"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { customFetch, customFetchMutation } from "../../../components/Auth/customFetch";
import { useApplication } from "../../../components/Auth/useApplicationContext";
import { MODULE_LABELS, ModuleName } from "./provisioningForm";

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
     const [planSearch, setPlanSearch] = useState("");

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

     const search = planSearch.trim().toLowerCase();
     const visiblePlans = plans.filter(plan =>
          `${plan.name} ${plan.code} ${plan.description} ${plan.modules.map(module => MODULE_LABELS[module] || module).join(" ")}`
               .toLowerCase().includes(search));
     const activePlans = plans.filter(plan => plan.active).length;

     return (
          <main className="p-3" aria-busy={loading || busy}>
               <header className="border rounded p-3 mb-3 bg-white shadow-none">
                    <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
                         <div>
                              <p className="small text-primary text-uppercase fw-semibold mb-1">Platform administration / billing</p>
                              <h1 className="h4 mb-1">Subscription plans</h1>
                              <p className="text-muted mb-0">Build and maintain facility tiers with clear monthly pricing, module access, and branch limits.</p>
                         </div>
                         <a className="btn btn-primary flex-shrink-0" href="#plan-editor">Create plan</a>
                    </div>
               </header>
               {error && <div className="alert alert-danger" role="alert">{error}</div>}
               {notice && <div className="alert alert-success" role="status">{notice}</div>}
               {loading ? <section className="border rounded p-3 bg-white shadow-none" role="status">Loading subscription plans...</section> : <>
                    <div className="row g-3 mb-3" aria-label="Subscription plan summary">
                         {[
                              { label: "Total plans", value: plans.length, detail: "Configured tiers" },
                              { label: "Active plans", value: activePlans, detail: "Available to facilities" },
                              { label: "Pending upgrades", value: requests.length, detail: "Awaiting a decision" },
                         ].map(metric => <div className="col-12 col-md-4" key={metric.label}>
                              <article className="border rounded p-3 bg-white shadow-none h-100">
                                   <p className="small text-muted mb-1">{metric.label}</p>
                                   <p className="h3 fw-semibold mb-1">{metric.value.toLocaleString()}</p>
                                   <p className="small text-muted mb-0">{metric.detail}</p>
                              </article>
                         </div>)}
                    </div>

                    <section className="border rounded p-3 mb-3 bg-white shadow-none" aria-labelledby="plans-heading">
                         <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end gap-3 mb-3">
                              <div>
                                   <h2 id="plans-heading" className="h5 mb-1">Plan catalog</h2>
                                   <p className="small text-muted mb-0">{visiblePlans.length} of {plans.length} plans shown</p>
                              </div>
                              <div className="col-12 col-md-5 col-lg-4">
                                   <label htmlFor="plan-search" className="form-label">Search plans</label>
                                   <input id="plan-search" type="search" className="form-control" value={planSearch}
                                        onChange={event => setPlanSearch(event.target.value)} placeholder="Name, code, module" />
                              </div>
                         </div>
                         <div className="table-responsive">
                              <table className="table table-hover mb-0 align-middle">
                                   <thead><tr><th scope="col">Plan</th><th scope="col">Monthly price</th><th scope="col">Included modules</th><th scope="col">Branches</th><th scope="col">Actions</th></tr></thead>
                                   <tbody>
                                        {visiblePlans.map(plan => <tr key={plan.code}>
                                             <td><strong>{plan.name}</strong><div className="small text-muted">{plan.code}</div>
                                                  <div className="d-flex flex-wrap gap-1 mt-1">
                                                       <span className={`badge ${plan.active ? "bg-success" : "bg-secondary"}`}>{plan.active ? "Active" : "Inactive"}</span>
                                                       <span className="badge bg-light text-dark border">Tier {plan.rank}</span>
                                                  </div>
                                                  {plan.description && <div className="small text-muted mt-1">{plan.description}</div>}</td>
                                             <td className="text-nowrap fw-semibold">{plan.currency} {plan.monthlyPrice}<span className="small text-muted fw-normal"> / month</span></td>
                                             <td><div className="d-flex flex-wrap gap-1">{plan.modules.map(item =>
                                                  <span key={item} className="badge bg-light text-dark border">{MODULE_LABELS[item] || item}</span>)}</div></td>
                                             <td className="text-nowrap"><span className="badge bg-light text-dark border">{plan.branchMode === "multiple" ? "Multiple branches" : "Single branch"}</span></td>
                                             <td><button type="button" className="btn btn-sm btn-primary" disabled={busy} onClick={() => edit(plan)}>Edit</button></td>
                                        </tr>)}
                                        {!visiblePlans.length && <tr><td colSpan={5} className="text-center text-muted py-4">
                                             {plans.length ? "No plans match your search." : "No plans yet. Create a plan to define your first facility tier."}
                                        </td></tr>}
                                   </tbody>
                              </table>
                         </div>
                    </section>

                    <section id="plan-editor" className="border rounded mb-3 bg-white shadow-none" aria-labelledby="plan-editor-heading">
                         <div className="border-bottom p-3">
                              <h2 id="plan-editor-heading" className="h5 mb-1">{isNew ? "Create a plan" : `Edit ${draft.name || draft.code}`}</h2>
                              <p className="small text-muted mb-0">Set pricing, included features, and facility capacity for this tier.</p>
                         </div>
                         <form className="p-3" onSubmit={save}>
                              <div className="row g-3">
                                   <div className="col-12 col-md-3"><label htmlFor="plan-code" className="form-label">Plan code</label>
                                        <input id="plan-code" className="form-control" value={draft.code} disabled={!isNew} maxLength={32} required
                                             pattern="[a-z][a-z0-9_-]{1,31}" title="Use 2-32 lowercase letters, numbers, hyphens, or underscores; start with a letter."
                                             onChange={event => setDraft({ ...draft, code: event.target.value.toLowerCase() })} /></div>
                                   <div className="col-12 col-md-5"><label htmlFor="plan-name" className="form-label">Plan name</label>
                                        <input id="plan-name" className="form-control" value={draft.name} maxLength={60} required
                                             onChange={event => setDraft({ ...draft, name: event.target.value })} /></div>
                                   <div className="col-6 col-md-2"><label htmlFor="plan-currency" className="form-label">Currency</label>
                                        <input id="plan-currency" className="form-control text-uppercase" value={draft.currency} maxLength={3} minLength={3} required pattern="[A-Za-z]{3}"
                                             onChange={event => setDraft({ ...draft, currency: event.target.value.toUpperCase() })} /></div>
                                   <div className="col-6 col-md-2"><label htmlFor="plan-price" className="form-label">Monthly price</label>
                                        <input id="plan-price" className="form-control" inputMode="decimal" value={draft.monthlyPrice} required
                                             pattern="(?:0|[1-9]\d{0,9})(?:\.\d{1,2})?" title="Enter a nonnegative amount with up to two decimal places."
                                             onChange={event => setDraft({ ...draft, monthlyPrice: event.target.value })} /></div>
                                   <div className="col-12"><label htmlFor="plan-description" className="form-label">Description</label>
                                        <textarea id="plan-description" className="form-control" rows={2} value={draft.description} maxLength={300}
                                             onChange={event => setDraft({ ...draft, description: event.target.value })} /></div>
                                   <div className="col-6 col-md-3"><label htmlFor="plan-rank" className="form-label">Tier rank</label>
                                        <input id="plan-rank" type="number" min={0} step={1} className="form-control" value={draft.rank}
                                             onChange={event => setDraft({ ...draft, rank: Number(event.target.value) })} /></div>
                                   <div className="col-6 col-md-3"><label htmlFor="plan-branch" className="form-label">Branch access</label>
                                        <select id="plan-branch" className="form-select" value={draft.branchMode} onChange={event => setDraft({ ...draft, branchMode: event.target.value as "single" | "multiple" })}>
                                             <option value="single">Single branch</option><option value="multiple">Multiple branches</option></select></div>
                                   <div className="col-12 col-md-6 d-flex align-items-end"><div className="form-check form-switch mb-2">
                                        <input id="plan-active" type="checkbox" className="form-check-input" checked={draft.active} onChange={event => setDraft({ ...draft, active: event.target.checked })} />
                                        <label htmlFor="plan-active" className="form-check-label">Offer this plan to facilities</label></div></div>
                                   <div className="col-12">
                                        <fieldset className="border rounded p-3">
                                             <legend className="float-none w-auto px-2 fs-6 mb-0">Included modules</legend>
                                             <div className="row g-2">{MODULE_NAMES.map(moduleName => <div className="col-12 col-sm-6 col-lg-4" key={moduleName}>
                                                  <label htmlFor={`plan-module-${moduleName}`} className="d-flex align-items-center gap-2 border rounded p-2 h-100">
                                                       <input id={`plan-module-${moduleName}`} type="checkbox" className="form-check-input mt-0 flex-shrink-0"
                                                            checked={draft.modules.includes(moduleName)} onChange={() => toggleModule(moduleName)} />
                                                       <span>{MODULE_LABELS[moduleName]}</span>
                                                  </label>
                                             </div>)}</div>
                                        </fieldset>
                                   </div>
                              </div>
                              <div className="mt-3 d-flex flex-wrap gap-2">
                                   <button type="submit" className="btn btn-primary" disabled={busy}>{busy ? "Saving..." : isNew ? "Create plan" : "Save changes"}</button>
                                   {!isNew && <button type="button" className="btn btn-secondary" disabled={busy} onClick={() => { setDraft(blankPlan()); setIsNew(true); }}>Cancel editing</button>}
                              </div>
                         </form>
                    </section>

                    <section className="border rounded p-3 bg-white shadow-none" aria-labelledby="upgrade-requests-heading">
                         <div className="d-flex justify-content-between align-items-center gap-2 mb-3">
                              <div>
                                   <h2 id="upgrade-requests-heading" className="h5 mb-1">Pending upgrade requests</h2>
                                   <p className="small text-muted mb-0">Review facility requests to move to a higher tier.</p>
                              </div>
                              <span className="badge bg-warning text-dark">{requests.length} pending</span>
                         </div>
                         {!requests.length ? <p className="text-muted mb-0">There are no upgrade requests waiting for review.</p> : <ul className="list-unstyled d-grid gap-2 mb-0">
                              {requests.map(request => <li key={request.id} className="border rounded p-3 d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3">
                                   <div>
                                        <strong>{request.organizationName || `Facility ${request.tenantId}`}</strong>
                                        <div className="small mt-1">{request.fromPlanCode || "Custom"} <span className="text-muted" aria-hidden="true">→</span> <strong>{request.toPlanCode}</strong></div>
                                        <div className="small text-muted mt-1">{request.requestedByEmail || "Requester unavailable"} · {new Date(request.requestedAt).toLocaleString()}</div>
                                   </div>
                                   <div className="d-flex gap-2 flex-shrink-0">
                                        <button type="button" className="btn btn-sm btn-success" disabled={busy} onClick={() => void decide(request, true)}>Approve</button>
                                        <button type="button" className="btn btn-sm btn-danger" disabled={busy} onClick={() => void decide(request, false)}>Reject</button>
                                   </div>
                              </li>)}
                         </ul>}
                    </section>
               </>}
          </main>
     );
}
