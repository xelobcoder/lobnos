"use client";

import { FormEvent, useEffect, useState } from "react";
import { z } from "zod";
import { customFetch, customFetchMutation } from "../../../components/Auth/customFetch";
import type { ManagedFacility } from "./FacilityManagement";

const profileSchema = z.object({
     slug: z.string(), name: z.string(), region: z.string(), locality: z.string(),
     description: z.string(), currency: z.string(),
     published: z.boolean(), catalogPublished: z.boolean(),
     website: z.string().optional(), facilityLoginUrl: z.string().optional(),
     patientPortalUrl: z.string().optional(), panelIds: z.array(z.number().int().positive()).optional(),
});
type Profile = z.infer<typeof profileSchema>;
const failureMessage = (error: unknown) => error instanceof Error ? error.message : "Unable to update the public facility profile.";

export default function FacilityPublication({ facility }: { facility: ManagedFacility }) {
     const [profile, setProfile] = useState<Profile>({
          slug: "", name: facility.name, region: "", locality: "", description: "", currency: "GHS",
          published: false, catalogPublished: false, panelIds: [],
     });
     const [panelIds, setPanelIds] = useState("");
     const [loading, setLoading] = useState(true);
     const [busy, setBusy] = useState(false);
     const [error, setError] = useState("");
     const [notice, setNotice] = useState("");
     const [refresh, setRefresh] = useState(0);
     const endpoint = `platform/facilities/${facility.tenantId}/public-profile`;

     useEffect(() => {
          let active = true;
          setLoading(true);
          setError("");
          setNotice("");
          void customFetch(endpoint).then(response => {
               if (!active) return;
               if (response?.status !== "success" || !response.result || !("profile" in response.result)) {
                    throw new Error(response?.message || response?.error || "Unable to load the public profile.");
               }
               if (response.result.profile === null) {
                    setProfile({ slug: "", name: facility.name, region: "", locality: "", description: "", currency: "GHS", published: false, catalogPublished: false, panelIds: [] });
                    setPanelIds("");
                    return;
               }
               const parsed = profileSchema.safeParse(response.result.profile);
               if (!parsed.success) throw new Error("The server returned an invalid public profile.");
               setProfile(parsed.data);
               setPanelIds((parsed.data.panelIds || []).join(", "));
          }).catch(failure => { if (active) setError(failureMessage(failure)); })
               .finally(() => { if (active) setLoading(false); });
          return () => { active = false; };
     }, [endpoint, facility.name, refresh]);

     const save = async (event: FormEvent) => {
          event.preventDefault();
          if (loading || busy) return;
          setError("");
          setNotice("");
          const identifiers = panelIds.trim() ? panelIds.split(",").map(value => value.trim()) : [];
          if (identifiers.some(value => !/^[1-9]\d*$/.test(value) || !Number.isSafeInteger(Number(value))) ||
               new Set(identifiers.map(Number)).size !== identifiers.length) {
               setError("Panel identifiers must be unique positive tariff IDs separated by commas.");
               return;
          }
          setBusy(true);
          try {
               const response = await customFetchMutation(endpoint, "PUT", {
                    ...profile,
                    website: profile.website?.trim() || undefined,
                    facilityLoginUrl: profile.facilityLoginUrl?.trim() || undefined,
                    patientPortalUrl: profile.patientPortalUrl?.trim() || undefined,
                    panelIds: identifiers.map(Number),
               });
               if (response?.status !== "success") throw new Error(response?.message || response?.error || "The server did not confirm publication.");
               const parsed = profileSchema.safeParse(response.result?.profile);
               if (!parsed.success) throw new Error("The server returned an invalid saved public profile.");
               setProfile(parsed.data);
               setNotice("Public profile saved. The website uses the approved login destination and live PLS catalog.");
          } catch (failure) {
               setError(failureMessage(failure));
          } finally {
               setBusy(false);
          }
     };
     return <section className="border-top pt-3 mt-3" aria-labelledby="website-publication-title" aria-busy={loading || busy}>
          <div className="d-flex justify-content-between gap-2"><h2 id="website-publication-title" className="h5 fw-semibold">Website directory, catalog and client login</h2><button type="button" className="btn btn-sm btn-outline-secondary" disabled={loading || busy} onClick={() => setRefresh(value => value + 1)}>Reload profile</button></div>
          <p className="small text-muted">Publish this active PLS facility explicitly. Prices remain sourced from its own test configuration. Only approved destinations are displayed; no tenant credentials are shared with the website.</p>
          {error && <div className="alert alert-danger" role="alert">{error}</div>}
          {notice && <div className="alert alert-success" role="status">{notice}</div>}
          {loading ? <p role="status">Loading public profile...</p> : <form onSubmit={save}>
               <fieldset disabled={busy}>
                    <div className="row g-3">
                         {(["slug", "name", "region", "locality", "currency"] as const).map(field => <div className="col-md-6" key={field}>
                              <label className="form-label text-capitalize" htmlFor={`public-${field}`}>{field === "slug" ? "Public URL slug" : field}</label>
                              <input id={`public-${field}`} className="form-control" value={profile[field]} required maxLength={field === "currency" ? 3 : field === "slug" ? 80 : field === "region" ? 120 : 160} pattern={field === "slug" ? "[a-z0-9]+(-[a-z0-9]+)*" : field === "currency" ? "[A-Z]{3}" : undefined} onChange={event => setProfile(current => ({ ...current, [field]: event.target.value }))} />
                         </div>)}
                         <div className="col-12"><label htmlFor="public-description" className="form-label">Public description</label><textarea id="public-description" className="form-control" value={profile.description} maxLength={3000} onChange={event => setProfile(current => ({ ...current, description: event.target.value }))} /></div>
                         {(["facilityLoginUrl", "website", "patientPortalUrl"] as const).map(field => <div className="col-12" key={field}>
                              <label htmlFor={`public-${field}`} className="form-label">{field === "facilityLoginUrl" ? "Approved client login URL" : field === "website" ? "Facility website URL" : "Approved patient portal URL"}</label>
                              <input id={`public-${field}`} type="url" className="form-control" value={profile[field] || ""} maxLength={2048} onChange={event => setProfile(current => ({ ...current, [field]: event.target.value }))} />
                         </div>)}
                         <div className="col-12"><label htmlFor="public-panel-ids" className="form-label">Test panel tariff IDs (optional)</label><input id="public-panel-ids" className="form-control" value={panelIds} onChange={event => setPanelIds(event.target.value)} /><small className="text-muted">Comma-separated configured test tariff IDs to label as panels; all other configured tariffs remain individual tests. No prices are copied or overridden.</small></div>
                    </div>
                    <p className="small text-muted mt-3">Use clean HTTPS URLs without credentials, query parameters or fragments. Local loopback HTTP requires explicit development permission on both the backend and website. Website login hosts must be included in its approved host list.</p>
                    <label className="form-check"><input className="form-check-input" type="checkbox" checked={profile.published} disabled={facility.status !== "active" && !profile.published} onChange={event => setProfile(current => ({ ...current, published: event.target.checked, catalogPublished: event.target.checked && current.catalogPublished }))} /><span className="form-check-label">Publish this facility in the website directory</span></label>
                    <label className="form-check mb-3"><input className="form-check-input" type="checkbox" checked={profile.catalogPublished} disabled={!profile.published} onChange={event => setProfile(current => ({ ...current, catalogPublished: event.target.checked }))} /><span className="form-check-label">Publish live PLS tests, panels and prices</span></label>
                    <button className="btn btn-primary" disabled={busy}>{busy ? "Saving..." : "Save website publication"}</button>
               </fieldset>
          </form>}
     </section>;
}
