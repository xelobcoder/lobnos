"use client";

import { FormEvent, useEffect, useState } from "react";
import { customFetch, customFetchMutation } from "../../../../../components/Auth/customFetch";

interface ProviderView { provider: string; configured: boolean; enabled: boolean; currency: string }

const LABELS: Record<string, string> = { paystack: "Paystack", hubtel: "Hubtel", payswitch: "PaySwitch" };
const message = (error: unknown) => error instanceof Error ? error.message : "Online payment failed. Please try again.";

// Starts a hosted checkout on the facility's own merchant account. The server prices the bill; this page never marks anything paid.
export default function BillOnlinePayment({ billingId, outstanding }: { billingId: number; outstanding: number }) {
     const [providers, setProviders] = useState<ProviderView[]>([]);
     const [provider, setProvider] = useState("");
     const [email, setEmail] = useState("");
     const [amount, setAmount] = useState("");
     const [busy, setBusy] = useState(false);
     const [error, setError] = useState("");
     const [link, setLink] = useState("");

     useEffect(() => {
          let active = true;
          customFetch("payments/gateway/providers").then((response) => {
               if (!active || response?.status !== "success") return;
               const usable = (response.result.providers as ProviderView[]).filter((item) => item.configured && item.enabled);
               setProviders(usable);
               setProvider(usable[0]?.provider ?? "");
          }).catch(() => undefined);
          return () => { active = false; };
     }, []);

     if (providers.length === 0 || !(outstanding > 0)) return null;

     const submit = async (event: FormEvent) => {
          event.preventDefault();
          if (busy) return;
          setBusy(true); setError(""); setLink("");
          try {
               const body: Record<string, unknown> = { provider, email: email.trim() };
               if (amount.trim()) body.amount = Number(amount);
               const response = await customFetchMutation(`payments/gateway/bills/${billingId}/checkout`, "POST", body);
               const url: string | null = response?.result?.transaction?.checkoutUrl ?? null;
               if (response?.status !== "success" || !url) throw new Error(response?.message || "The server did not start the payment.");
               if (!/^https:\/\//i.test(url)) throw new Error("The provider did not return a secure checkout link.");
               setLink(url);
          } catch (failure) { setError(message(failure)); } finally { setBusy(false); }
     };

     return (
          <section className="card border-0 shadow-sm mt-4" aria-busy={busy}>
               <div className="card-body">
                    <h2 className="h6 fw-semibold">Collect payment online</h2>
                    <p className="text-muted small mb-3">Create a secure payment link for the patient. The bill is credited only after the payment is confirmed with the provider.</p>
                    {error && <div className="alert alert-danger" role="alert">{error}</div>}
                    {link && <div className="alert alert-success" role="status">
                         Payment link ready: <a href={link} target="_blank" rel="noopener noreferrer">open checkout</a>
                         <button type="button" className="btn btn-sm btn-outline-secondary ms-2" onClick={() => void navigator.clipboard?.writeText(link)}>Copy link</button>
                    </div>}
                    <form onSubmit={submit} className="row g-3 align-items-end">
                         <div className="col-md-3"><label htmlFor="boProvider" className="form-label">Provider</label>
                              <select id="boProvider" className="form-select" value={provider} onChange={(event) => setProvider(event.target.value)} disabled={busy}>
                                   {providers.map((item) => <option key={item.provider} value={item.provider}>{LABELS[item.provider] ?? item.provider}</option>)}
                              </select></div>
                         <div className="col-md-4"><label htmlFor="boEmail" className="form-label">Payer email</label>
                              <input id="boEmail" type="email" className="form-control" value={email} onChange={(event) => setEmail(event.target.value)} maxLength={254} required disabled={busy} /></div>
                         <div className="col-md-3"><label htmlFor="boAmount" className="form-label">Amount (blank = full balance)</label>
                              <input id="boAmount" type="number" min="0.01" step="0.01" max={outstanding} className="form-control" value={amount} onChange={(event) => setAmount(event.target.value)} disabled={busy} /></div>
                         <div className="col-md-2"><button className="btn btn-primary w-100" disabled={busy || !provider}>{busy ? "Creating..." : "Create link"}</button></div>
                    </form>
               </div>
          </section>
     );
}
