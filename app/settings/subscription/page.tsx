"use client";

import { useCallback, useEffect, useState } from "react";
import { customFetch, customFetchMutation } from "../../../components/Auth/customFetch";
import { useApplicationSettings } from "../../../components/Auth/useApplicationContext";
import { roleAllowed } from "../../../components/Auth/roles";
import { MODULE_LABELS, ModuleName } from "../facilities/provisioningForm";
import type { SubscriptionPlan } from "../facilities/SubscriptionPlansEditor";

interface TenantPlanView extends SubscriptionPlan {
     isCurrent: boolean;
     isUpgrade: boolean;
     isDowngrade: boolean;
}

interface SubscriptionOverview {
     current: {
          planCode: string | null;
          planName: string | null;
          currency: string;
          monthlyTotal: string;
          branchMode: string;
          modules: { module: ModuleName; enabled: boolean }[];
     };
     plans: TenantPlanView[];
     pendingRequest: { id: number; toPlanCode: string; requestedAt: string } | null;
}

const errorMessage = (error: unknown) => error instanceof Error ? error.message : "Unable to load your subscription.";

export default function MySubscriptionPage() {
     const { applicationsettings } = useApplicationSettings();
     const canView = roleAllowed(applicationsettings?.user?.role, ["admin"]);
     const [overview, setOverview] = useState<SubscriptionOverview | null>(null);
     const [loading, setLoading] = useState(true);
     const [busy, setBusy] = useState(false);
     const [error, setError] = useState("");
     const [notice, setNotice] = useState("");

     const load = useCallback(async () => {
          const response = await customFetch("subscription/plan");
          if (response?.status !== "success" || !response.result?.current) {
               throw new Error(response?.message || response?.error || "Unable to load your subscription.");
          }
          setOverview(response.result);
     }, []);

     useEffect(() => {
          if (!canView) {
               setLoading(false);
               return;
          }
          load().catch(failure => setError(errorMessage(failure))).finally(() => setLoading(false));
     }, [canView, load]);

     const requestUpgrade = async (plan: TenantPlanView) => {
          if (busy || !window.confirm(`Request an upgrade to ${plan.name} (${plan.currency} ${plan.monthlyPrice} / month)?`)) return;
          setBusy(true);
          setError("");
          setNotice("");
          try {
               const response = await customFetchMutation("subscription/upgrade-requests", "POST", { planCode: plan.code });
               if (response?.status !== "success") throw new Error(response?.message || response?.error || "Unable to request the upgrade.");
               await load();
               setNotice(`Upgrade to ${plan.name} requested. It takes effect once the platform team approves it.`);
          } catch (failure) {
               setError(errorMessage(failure));
          } finally {
               setBusy(false);
          }
     };

     if (!canView) return <main className="p-3"><div className="alert alert-danger" role="alert">Only an administrator can view the subscription.</div></main>;

     const current = overview?.current;
     const upgrades = overview?.plans.filter(plan => plan.isUpgrade) || [];
     const pending = overview?.pendingRequest;

     return (
          <main className="p-3" aria-busy={loading || busy}>
               <h1 className="h4 mb-3">My subscription</h1>
               {error && <div className="alert alert-danger" role="alert">{error}</div>}
               {notice && <div className="alert alert-success" role="status">{notice}</div>}
               {loading ? <p role="status">Loading your subscription...</p> : current && <>
                    <section className="card border-0 shadow-sm mb-3" aria-label="Current plan">
                         <div className="card-body">
                              <h2 className="h6 text-muted mb-1">Current plan</h2>
                              <p className="h5 mb-1">{current.planName || "Custom plan"}</p>
                              <p className="mb-2">{current.currency} {current.monthlyTotal} / month &middot; <span className="text-capitalize">{current.branchMode}</span> branch{current.branchMode === "multiple" ? "es" : ""}</p>
                              <div className="d-flex flex-wrap gap-2">
                                   {current.modules.map(item => <span key={item.module} className={`badge ${item.enabled ? "bg-success" : "bg-light text-muted border"}`}>
                                        {MODULE_LABELS[item.module] || item.module}{item.enabled ? "" : " (not subscribed)"}</span>)}
                              </div>
                         </div>
                    </section>
                    {pending && <div className="alert alert-info" role="status">Upgrade to <strong>{pending.toPlanCode}</strong> requested on {new Date(pending.requestedAt).toLocaleDateString()} and awaiting approval.</div>}
                    <h2 className="h6">Available upgrades</h2>
                    {!upgrades.length ? <p className="text-muted">No higher plans are available.</p> : <div className="row g-3">
                         {upgrades.map(plan => <div className="col-md-4" key={plan.code}>
                              <div className="card h-100 border-0 shadow-sm"><div className="card-body d-flex flex-column">
                                   <h3 className="h6">{plan.name}</h3>
                                   <p className="h5">{plan.currency} {plan.monthlyPrice}<small className="text-muted"> / month</small></p>
                                   {plan.description && <p className="small text-muted">{plan.description}</p>}
                                   <ul className="small ps-3 mb-3">{plan.modules.map(item => <li key={item}>{MODULE_LABELS[item] || item}</li>)}</ul>
                                   <button type="button" className="btn btn-primary mt-auto" disabled={busy || Boolean(pending)} onClick={() => void requestUpgrade(plan)}>Request upgrade</button>
                              </div></div>
                         </div>)}
                    </div>}
               </>}
          </main>
     );
}
