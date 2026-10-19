"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { customFetch, customFetchMutation } from "../../../components/Auth/customFetch";

interface ProviderView {
     provider: string;
     configured: boolean;
     enabled: boolean;
     currency: string;
     fields: Record<string, boolean>;
     webhookUrl: string;
}

const LABELS: Record<string, string> = { paystack: "Paystack", hubtel: "Hubtel", payswitch: "PaySwitch" };
const FIELD_LABELS: Record<string, string> = {
     secretKey: "Secret key", clientId: "Client ID", clientSecret: "Client secret", merchantAccount: "Merchant account number",
     apiUser: "API user", apiKey: "API key", merchantId: "Merchant ID",
};
const HELP: Record<string, string> = {
     paystack: "Add the webhook URL below in your Paystack dashboard (Settings > API Keys & Webhooks).",
     hubtel: "Hubtel notifications are sent to a per-payment callback address that PLS supplies automatically.",
     payswitch: "PaySwitch notifications are sent to a per-payment callback address that PLS supplies automatically.",
};
const message = (error: unknown) => error instanceof Error ? error.message : "Request failed. Please try again.";

function ProviderCard({ view, encryptionAvailable, onSaved }: { view: ProviderView; encryptionAvailable: boolean; onSaved: () => void }) {
     const [values, setValues] = useState<Record<string, string>>({});
     const [enabled, setEnabled] = useState(view.enabled);
     const [currency, setCurrency] = useState(view.currency);
     const [busy, setBusy] = useState(false);
     const [error, setError] = useState("");
     const [notice, setNotice] = useState("");

     const save = async (event: FormEvent) => {
          event.preventDefault();
          if (busy) return;
          setBusy(true); setError(""); setNotice("");
          try {
               const credentials = Object.fromEntries(Object.entries(values).filter(([, value]) => value.trim() !== ""));
               const response = await customFetchMutation(`payments/gateway/providers/${view.provider}`, "PUT", { enabled, currency: currency.trim().toUpperCase(), credentials });
               if (response?.status !== "success") throw new Error(response?.message || "Unable to save.");
               setValues({});
               setNotice("Saved. Credentials are stored encrypted and are never shown again.");
               onSaved();
          } catch (failure) { setError(message(failure)); } finally { setBusy(false); }
     };

     const remove = async () => {
          if (busy || !window.confirm(`Remove the ${LABELS[view.provider]} credentials? Online payments through it will stop.`)) return;
          setBusy(true); setError(""); setNotice("");
          try {
               const response = await customFetchMutation(`payments/gateway/providers/${view.provider}`, "DELETE", {});
               if (response?.status !== "success") throw new Error(response?.message || "Unable to remove.");
               onSaved();
          } catch (failure) { setError(message(failure)); } finally { setBusy(false); }
     };

     const id = `gw-${view.provider}`;
     return (
          <section className="card mb-4" aria-busy={busy}>
               <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                         <h2 className="h5 mb-0">{LABELS[view.provider] ?? view.provider}</h2>
                         <span className={`badge ${view.configured && view.enabled ? "text-bg-success" : view.configured ? "text-bg-warning" : "text-bg-secondary"}`}>
                              {view.configured ? (view.enabled ? "Active" : "Configured, disabled") : "Not configured"}
                         </span>
                    </div>
                    <p className="text-muted small">{HELP[view.provider]}</p>
                    {view.provider === "paystack" && (
                         <p className="small">Webhook URL: <code>{view.webhookUrl}</code></p>
                    )}
                    {error && <div className="alert alert-danger" role="alert">{error}</div>}
                    {notice && <div className="alert alert-success" role="status">{notice}</div>}
                    <form onSubmit={save} className="row g-3" autoComplete="off">
                         {Object.entries(view.fields).map(([name, stored]) => (
                              <div className="col-md-4" key={name}>
                                   <label htmlFor={`${id}-${name}`} className="form-label">{FIELD_LABELS[name] ?? name}</label>
                                   <input id={`${id}-${name}`} type="password" className="form-control" autoComplete="new-password" maxLength={200}
                                        placeholder={stored ? "Saved - leave blank to keep" : "Not set"} value={values[name] ?? ""}
                                        onChange={(event) => setValues((current) => ({ ...current, [name]: event.target.value }))} disabled={busy || !encryptionAvailable} />
                              </div>
                         ))}
                         <div className="col-md-2">
                              <label htmlFor={`${id}-currency`} className="form-label">Currency</label>
                              <input id={`${id}-currency`} className="form-control" maxLength={3} value={currency} onChange={(event) => setCurrency(event.target.value)} disabled={busy} />
                         </div>
                         <div className="col-md-3 d-flex align-items-end">
                              <div className="form-check form-switch">
                                   <input id={`${id}-enabled`} className="form-check-input" type="checkbox" role="switch" checked={enabled} onChange={(event) => setEnabled(event.target.checked)} disabled={busy} />
                                   <label htmlFor={`${id}-enabled`} className="form-check-label">Accept patient payments</label>
                              </div>
                         </div>
                         <div className="col-12 d-flex gap-2">
                              <button className="btn btn-primary" disabled={busy || !encryptionAvailable}>{busy ? "Saving..." : "Save"}</button>
                              {view.configured && <button type="button" className="btn btn-outline-danger" onClick={remove} disabled={busy}>Remove credentials</button>}
                         </div>
                    </form>
               </div>
          </section>
     );
}

// Each facility connects its own merchant accounts; patient payments settle there, not with PLS.
export default function PaymentGatewaySettingsPage() {
     const [providers, setProviders] = useState<ProviderView[]>([]);
     const [encryptionAvailable, setEncryptionAvailable] = useState(true);
     const [error, setError] = useState("");
     const [loading, setLoading] = useState(true);

     const load = useCallback(async () => {
          try {
               const response = await customFetch("payments/gateway/providers");
               if (response?.status !== "success") throw new Error(response?.message || "Unable to load payment providers.");
               setProviders(response.result.providers);
               setEncryptionAvailable(response.result.encryptionAvailable !== false);
               setError("");
          } catch (failure) { setError(message(failure)); } finally { setLoading(false); }
     }, []);
     useEffect(() => { void load(); }, [load]);

     return (
          <div className="container py-4">
               <div className="d-flex justify-content-between align-items-center mb-3">
                    <h1 className="h4 mb-0">Online payments</h1>
                    <Link href="/settings/payment-gateways/transactions" className="btn btn-outline-secondary btn-sm">View online transactions</Link>
               </div>
               <p className="text-muted">Connect this facility&apos;s own Paystack, Hubtel or PaySwitch merchant account so patients can pay their bills online. Money goes straight to your account; a bill is credited only after PLS confirms the payment with the provider.</p>
               {!encryptionAvailable && <div className="alert alert-warning" role="alert">Credential encryption is not configured on the server (PAYMENT_CREDENTIAL_KEY). Credentials cannot be saved until it is set.</div>}
               {error && <div className="alert alert-danger" role="alert">{error}</div>}
               {loading ? <p>Loading...</p> : providers.map((view) => (
                    <ProviderCard key={`${view.provider}-${String(view.configured)}-${String(view.enabled)}`} view={view} encryptionAvailable={encryptionAvailable} onSaved={load} />
               ))}
          </div>
     );
}
