"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { customFetch, customFetchMutation } from "../../../components/Auth/customFetch";
import type { ManagedFacility } from "./FacilityManagement";

interface ProviderInfo { provider: string; configured: boolean }
interface OpenPeriod { periodStart: string; periodEnd: string; amount: string; currency: string; status: string }

const LABELS: Record<string, string> = { paystack: "Paystack", hubtel: "Hubtel", payswitch: "PaySwitch" };
const today = () => new Date().toISOString().slice(0, 10);
const message = (error: unknown) => error instanceof Error ? error.message : "Online payment failed. Please try again.";

// Starts a hosted checkout. The amount is priced by the server; a redirect or this page never marks anything paid.
export default function FacilityOnlinePayment({ facility }: { facility: ManagedFacility }) {
     const [providers, setProviders] = useState<ProviderInfo[]>([]);
     const [periods, setPeriods] = useState<OpenPeriod[]>([]);
     const [provider, setProvider] = useState("");
     const [periodStart, setPeriodStart] = useState("");
     const [email, setEmail] = useState("");
     const [busy, setBusy] = useState(false);
     const [error, setError] = useState("");
     const [notice, setNotice] = useState("");

     const load = useCallback(async () => {
          setError("");
          try {
               const [providerResponse, subscription] = await Promise.all([
                    customFetch("platform/payments/providers"),
                    customFetch(`platform/facilities/${facility.tenantId}/subscription?asOf=${today()}`),
               ]);
               if (providerResponse?.status !== "success") throw new Error(providerResponse?.message || "Unable to load payment providers.");
               const all = providerResponse.result as ProviderInfo[];
               const configured = all.filter((item) => item.configured);
               setProviders(all);
               setProvider((current) => configured.some((item) => item.provider === current) ? current : configured[0]?.provider ?? "");
               const list: OpenPeriod[] = subscription?.status === "success" && Array.isArray(subscription.result?.periods) ? subscription.result.periods : [];
               setPeriods(list.filter((item) => item.status !== "paid"));
          } catch (failure) {
               setError(message(failure));
          }
     }, [facility.tenantId]);
     useEffect(() => { void load(); }, [load]);

     const submit = async (event: FormEvent) => {
          event.preventDefault();
          if (busy) return;
          setBusy(true);
          setError("");
          setNotice("");
          try {
               const response = await customFetchMutation(`platform/facilities/${facility.tenantId}/gateway-payments`, "POST", { provider, periodStart, email: email.trim() });
               if (response?.status !== "success" || !response.result?.transaction) throw new Error(response?.message || "The server did not start the payment.");
               const url: string | null = response.result.transaction.checkoutUrl;
               if (!url || !/^https:\/\//i.test(url)) throw new Error("The provider did not return a secure checkout link.");
               setNotice(`Checkout started (reference ${response.result.transaction.reference}). Opening the provider page; the period is marked paid only after the server verifies the payment.`);
               window.open(url, "_blank", "noopener,noreferrer");
          } catch (failure) {
               setError(message(failure));
          } finally {
               setBusy(false);
          }
     };

     if (!["active", "suspended"].includes(facility.status) || facility.isControlTenant) return null;
     return (
          <section className="border-top pt-3 mt-4" aria-busy={busy}>
               <h3 className="h6 fw-semibold">Pay online</h3>
               {error && <div className="alert alert-danger" role="alert">{error}</div>}
               {notice && <div className="alert alert-success" role="status">{notice}</div>}
               <ul className="list-inline mb-3" aria-label="Payment providers">
                    {providers.map((item) => (
                         <li key={item.provider} className="list-inline-item">
                              <span className={`badge ${item.configured ? "text-bg-success" : "text-bg-secondary"}`}>
                                   {LABELS[item.provider] ?? item.provider}: {item.configured ? "configured" : "not configured"}
                              </span>
                         </li>
                    ))}
               </ul>
               {!providers.some((item) => item.configured) ? <p className="text-muted">No online payment provider is configured on the server. Set the provider credentials in the server environment to enable one.</p>
                    : periods.length === 0 ? <p className="text-muted">There are no unpaid periods to pay.</p>
                         : <form onSubmit={submit} className="row g-3 align-items-end">
                              <div className="col-md-4"><label htmlFor="gwPeriod" className="form-label">Period</label>
                                   <select id="gwPeriod" className="form-select" value={periodStart} onChange={(event) => setPeriodStart(event.target.value)} required disabled={busy}>
                                        <option value="">Select a period</option>
                                        {periods.map((item) => <option key={item.periodStart} value={item.periodStart}>{item.periodStart} - {item.periodEnd} ({item.amount} {item.currency})</option>)}
                                   </select></div>
                              <div className="col-md-3"><label htmlFor="gwProvider" className="form-label">Provider</label>
                                   <select id="gwProvider" className="form-select" value={provider} onChange={(event) => setProvider(event.target.value)} required disabled={busy}>
                                        {providers.map((item) => <option key={item.provider} value={item.provider} disabled={!item.configured}>{LABELS[item.provider] ?? item.provider}{item.configured ? "" : " (not configured)"}</option>)}
                                   </select></div>
                              <div className="col-md-3"><label htmlFor="gwEmail" className="form-label">Payer email</label>
                                   <input id="gwEmail" type="email" className="form-control" value={email} onChange={(event) => setEmail(event.target.value)} maxLength={254} required disabled={busy} /></div>
                              <div className="col-md-2"><button className="btn btn-primary w-100" disabled={busy || !periodStart || !provider}>{busy ? "Starting..." : "Pay online"}</button></div>
                         </form>}
          </section>
     );
}
