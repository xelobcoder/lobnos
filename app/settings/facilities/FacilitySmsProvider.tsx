"use client";

import { FormEvent, useEffect, useState } from "react";
import { z } from "zod";
import { customFetch, customFetchMutation } from "../../../components/Auth/customFetch";
import type { ManagedFacility } from "./FacilityManagement";

const settingsSchema = z.object({
     configured: z.boolean(),
     providerType: z.string().optional(),
     apiKey: z.string().optional(),
     senderId: z.string().optional(),
     baseUrl: z.string().optional(),
     isActive: z.boolean().optional(),
     updatedBy: z.number().nullable().optional(),
     updatedAt: z.union([z.string(), z.number(), z.null()]).optional(),
});
type Settings = z.infer<typeof settingsSchema>;

const DEFAULT_BASE_URL = "https://sms.arkesel.com";
const failureMessage = (error: unknown) => error instanceof Error ? error.message : "Unable to update the SMS configuration.";

// Each facility sends SMS with its own Arkesel account; the stored API key is never returned to the browser.
export default function FacilitySmsProvider({ facility }: { facility: ManagedFacility }) {
     const [settings, setSettings] = useState<Settings>({ configured: false });
     const [senderId, setSenderId] = useState("");
     const [baseUrl, setBaseUrl] = useState(DEFAULT_BASE_URL);
     const [apiKey, setApiKey] = useState("");
     const [isActive, setIsActive] = useState(true);
     const [loading, setLoading] = useState(true);
     const [busy, setBusy] = useState(false);
     const [error, setError] = useState("");
     const [notice, setNotice] = useState("");
     const [refresh, setRefresh] = useState(0);
     const endpoint = `platform/facilities/${facility.tenantId}/sms-provider`;

     useEffect(() => {
          let active = true;
          setLoading(true);
          setError("");
          setNotice("");
          setApiKey("");
          void customFetch(endpoint).then(response => {
               if (!active) return;
               if (response?.status !== "success" || !response.result || !("settings" in response.result)) {
                    throw new Error(response?.message || response?.error || "Unable to load the SMS configuration.");
               }
               const parsed = settingsSchema.safeParse(response.result.settings);
               if (!parsed.success) throw new Error("The server returned an invalid SMS configuration.");
               setSettings(parsed.data);
               setSenderId(parsed.data.senderId || "");
               setBaseUrl(parsed.data.baseUrl || DEFAULT_BASE_URL);
               setIsActive(parsed.data.configured ? Boolean(parsed.data.isActive) : true);
          }).catch(failure => { if (active) setError(failureMessage(failure)); })
               .finally(() => { if (active) setLoading(false); });
          return () => { active = false; };
     }, [endpoint, refresh]);

     const save = async (event: FormEvent) => {
          event.preventDefault();
          if (loading || busy) return;
          setError("");
          setNotice("");
          const sender = senderId.trim();
          const url = baseUrl.trim().replace(/\/+$/, "");
          const key = apiKey.trim();
          if (!sender || sender.length > 11) {
               setError("The sender ID is required and may not exceed 11 characters.");
               return;
          }
          let host: URL;
          try {
               host = new URL(url);
          } catch {
               setError("Enter the Arkesel base URL as a full HTTPS address.");
               return;
          }
          if (host.protocol !== "https:" || !(host.hostname === "arkesel.com" || host.hostname.endsWith(".arkesel.com"))) {
               setError("The base URL must use HTTPS on an arkesel.com host.");
               return;
          }
          if (!settings.configured && !key) {
               setError("An API key is required when configuring SMS for this facility for the first time.");
               return;
          }
          setBusy(true);
          try {
               const response = await customFetchMutation(endpoint, "PUT", {
                    providerType: "arkesel", senderId: sender, baseUrl: url, isActive,
                    ...(key ? { apiKey: key } : {}),
               });
               if (response?.status !== "success") throw new Error(response?.message || response?.error || "The server did not confirm the SMS configuration.");
               const parsed = settingsSchema.safeParse(response.result?.settings);
               if (!parsed.success) throw new Error("The server returned an invalid saved SMS configuration.");
               setSettings(parsed.data);
               setApiKey("");
               setNotice(`SMS configuration saved for ${facility.name}. This facility now sends with its own Arkesel account.`);
          } catch (failure) {
               setError(failureMessage(failure));
          } finally {
               setBusy(false);
          }
     };

     return <section className="border rounded bg-white p-3 mt-3" aria-label="SMS configuration">
          <div className="d-flex justify-content-between gap-2">
               <h2 className="h5">Arkesel SMS account</h2>
               <button type="button" className="btn btn-sm btn-outline-secondary" disabled={loading || busy} onClick={() => setRefresh(value => value + 1)}>Reload configuration</button>
          </div>
          <p className="small text-muted">Each facility sends SMS with its own Arkesel credentials stored in its own database. The saved API key is never displayed again; leave it blank to keep the current key.</p>
          {error && <div className="alert alert-danger" role="alert">{error}</div>}
          {notice && <div className="alert alert-success" role="status">{notice}</div>}
          {loading ? <p role="status">Loading SMS configuration...</p> : <form onSubmit={save}>
               <div className="mb-3">
                    {settings.configured
                         ? <span className={`badge ${settings.isActive ? "bg-success" : "bg-secondary"}`}>{settings.isActive ? "Configured and active" : "Configured but disabled"}</span>
                         : <span className="badge bg-warning text-dark">Not configured - SMS is disabled for this facility</span>}
                    {settings.configured && settings.apiKey && <span className="ms-2 small text-muted">Stored key: {settings.apiKey}</span>}
               </div>
               <fieldset disabled={busy}>
                    <div className="row g-3">
                         <div className="col-md-6">
                              <label htmlFor="sms-sender-id" className="form-label">Sender ID</label>
                              <input id="sms-sender-id" className="form-control" value={senderId} maxLength={11} required onChange={event => setSenderId(event.target.value)} />
                              <small className="text-muted">The approved Arkesel sender name shown to recipients (up to 11 characters).</small>
                         </div>
                         <div className="col-md-6">
                              <label htmlFor="sms-base-url" className="form-label">Arkesel base URL</label>
                              <input id="sms-base-url" type="url" className="form-control" value={baseUrl} maxLength={500} required onChange={event => setBaseUrl(event.target.value)} />
                              <small className="text-muted">HTTPS on an arkesel.com host, without a trailing path.</small>
                         </div>
                         <div className="col-12">
                              <label htmlFor="sms-api-key" className="form-label">API key{settings.configured ? " (leave blank to keep the current key)" : ""}</label>
                              <input id="sms-api-key" type="password" autoComplete="new-password" className="form-control" value={apiKey} maxLength={500} placeholder={settings.configured ? "Unchanged" : "Facility Arkesel API key"} onChange={event => setApiKey(event.target.value)} />
                         </div>
                         <div className="col-12 form-check ms-2">
                              <input id="sms-active" type="checkbox" className="form-check-input" checked={isActive} onChange={event => setIsActive(event.target.checked)} />
                              <label htmlFor="sms-active" className="form-check-label">Allow this facility to send SMS</label>
                         </div>
                    </div>
                    <button type="submit" className="btn btn-primary mt-3" disabled={busy}>{busy ? "Saving..." : "Save SMS configuration"}</button>
               </fieldset>
          </form>}
     </section>;
}
