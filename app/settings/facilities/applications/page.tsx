"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { z } from "zod";
import { customFetch, customFetchMutation } from "../../../../components/Auth/customFetch";
import { useApplication } from "../../../../components/Auth/useApplicationContext";
import FacilityNav from "../FacilityNav";
import WebsiteEnquiries from "../WebsiteEnquiries";
import { MarketplaceApplication, marketplaceApplicationsSchema } from "../marketplaceApplications";

const tenantsSchema = z.array(z.object({
     tenantId: z.number().int().positive(), platformId: z.string(), name: z.string(), status: z.string(),
}));
type Tenant = z.infer<typeof tenantsSchema>[number];
const message = (error: unknown) => error instanceof Error ? error.message : "Unable to manage website applications.";

export default function WebsiteApplicationsPage() {
     const application = useApplication();
     const isSuperAdmin = String(application?.user?.role || "").toLowerCase().replace(/[\s_-]/g, "") === "superadmin";
     const [status, setStatus] = useState("pending");
     const [rows, setRows] = useState<MarketplaceApplication[]>([]);
     const [tenants, setTenants] = useState<Tenant[]>([]);
     const [selected, setSelected] = useState<MarketplaceApplication | null>(null);
     const [tenantId, setTenantId] = useState("");
     const [identityConfirmed, setIdentityConfirmed] = useState(false);
     const [reason, setReason] = useState("");
     const [loading, setLoading] = useState(true);
     const [busy, setBusy] = useState(false);
     const [error, setError] = useState("");
     const [notice, setNotice] = useState("");
     const [refresh, setRefresh] = useState(0);

     useEffect(() => {
          if (!isSuperAdmin) { setLoading(false); return; }
          let active = true;
          setLoading(true);
          setError("");
          void Promise.all([
               customFetch(`marketplace/platform/facilities?status=${status}`),
               customFetch("platform/facilities"),
          ]).then(([applications, organizations]) => {
               if (!active) return;
               if (applications?.status !== "success") throw new Error(applications?.message || applications?.error || "Unable to load website applications.");
               if (organizations?.status !== "success") throw new Error(organizations?.message || organizations?.error || "Unable to load provisioned facilities.");
               const parsedRows = marketplaceApplicationsSchema.safeParse(applications.result);
               const parsedTenants = tenantsSchema.safeParse(organizations.result);
               if (!parsedRows.success || !parsedTenants.success) throw new Error("The server returned invalid facility data.");
               setRows(parsedRows.data);
               setTenants(parsedTenants.data.filter(tenant => tenant.status === "active"));
               setSelected(null);
          }).catch(failure => { if (active) { setError(message(failure)); setRows([]); } })
               .finally(() => { if (active) setLoading(false); });
          return () => { active = false; };
     }, [isSuperAdmin, status, refresh]);

     const mutate = async (facility: MarketplaceApplication, action: "approve" | "suspend" | "link-tenant", body: object, success: string) => {
          if (busy) return;
          setBusy(true);
          setError("");
          setNotice("");
          try {
               const response = await customFetchMutation(`marketplace/platform/facilities/${facility.id}/${action}`, "POST", body);
               if (response?.status !== "success") throw new Error(response?.message || response?.error || "The server did not confirm the application change.");
               setNotice(success);
               setRefresh(value => value + 1);
          } catch (failure) {
               setError(message(failure));
          } finally {
               setBusy(false);
          }
     };
     const select = (facility: MarketplaceApplication) => {
          setSelected(facility); setTenantId(""); setIdentityConfirmed(false); setReason(""); setError(""); setNotice("");
     };
     const link = (event: FormEvent) => {
          event.preventDefault();
          if (!selected || !identityConfirmed || !tenantId) return;
          void mutate(selected, "link-tenant", { tenantId: Number(tenantId), identityConfirmed, catalogMappings: [] },
               `${selected.name} is linked to its PLS facility. Live PLS catalog prices are now authoritative.`);
     };
     const suspend = (event: FormEvent) => {
          event.preventDefault();
          if (!selected || reason.trim().length < 3) return;
          void mutate(selected, "suspend", { reason: reason.trim() }, `${selected.name} was suspended from the public marketplace.`);
     };

     if (!isSuperAdmin) return <main className="p-2"><div className="alert alert-danger" role="alert">Only an authorized platform super administrator can review website applications.</div></main>;

     return <main className="p-2" aria-busy={loading || busy}>
          <FacilityNav />
          <h1 className="h4 mb-3">Website applications &amp; enquiries</h1>
          <WebsiteEnquiries />
          <div className="d-flex flex-wrap justify-content-between gap-3 mb-3">
               <div><h2 className="h5">Laboratory registration applications</h2><p className="text-muted mb-0">Review independent laboratory applications, approve marketplace access, and provision or link PLS facilities.</p></div>
               <div className="d-flex gap-2">
                    <label className="visually-hidden" htmlFor="application-status">Application status</label>
                    <select id="application-status" className="form-select" value={status} disabled={busy} onChange={event => setStatus(event.target.value)}>
                         <option value="pending">Pending applications</option><option value="approved">Approved facilities</option><option value="suspended">Suspended facilities</option>
                    </select>
                    <button className="btn btn-outline-secondary" disabled={loading || busy} onClick={() => setRefresh(value => value + 1)}>Refresh</button>
               </div>
          </div>
          {error && <div className="alert alert-danger" role="alert">{error}</div>}
          {notice && <div className="alert alert-success" role="status">{notice}</div>}
          {loading ? <p role="status">Loading website applications...</p> : !rows.length ? <div className="alert alert-light border">No {status} website applications.</div> :
               <div className="table-responsive"><table className="table table-hover bg-white">
                    <thead><tr><th>Facility</th><th>Location</th><th>Contact</th><th>Status</th><th>Integration</th><th>Actions</th></tr></thead>
                    <tbody>{rows.map(facility => <tr key={facility.id}>
                         <td><strong>{facility.name}</strong><div className="small text-muted">{facility.slug}</div></td>
                         <td>{facility.locality}, {facility.region}</td><td>{facility.contact_email}<div>{facility.phone}</div></td>
                         <td>{facility.status}</td><td>{facility.integration_state === "linked" ? `PLS tenant ${facility.linked_tenant_id}` : facility.integration_state.replace(/_/g, " ")}</td>
                         <td><button className="btn btn-sm btn-outline-primary" disabled={busy} onClick={() => select(facility)}>Review application</button></td>
                    </tr>)}</tbody>
               </table></div>}
          {selected && <section className="bg-white border rounded p-3 mt-3" aria-label="Application review">
               <div className="d-flex justify-content-between"><h2 className="h5">{selected.name}</h2><button className="btn-close" aria-label="Close application review" disabled={busy} onClick={() => setSelected(null)} /></div>
               <dl className="row">
                    <dt className="col-sm-3">Address</dt><dd className="col-sm-9">{selected.address}</dd>
                    <dt className="col-sm-3">Description</dt><dd className="col-sm-9">{selected.description}</dd>
                    <dt className="col-sm-3">Submitted</dt><dd className="col-sm-9">{new Date(selected.created_at).toLocaleString()}</dd>
               </dl>
               {selected.status === "pending" && <div>
                    <p>Approval enables the independent facility dashboard and public marketplace listing. It does not create a PLS tenant, copy test prices, or verify payments.</p>
                    <button className="btn btn-primary" disabled={busy} onClick={() => void mutate(selected, "approve", {}, `${selected.name} was approved. Select Approved facilities to provision or link it.`)}>{busy ? "Saving..." : "Approve application"}</button>
               </div>}
               {selected.status === "approved" && selected.integration_state === "independent" && <>
                    <h3 className="h6 border-top pt-3">Provision a new PLS facility</h3>
                    <p>Review the submitted company details, select the official location and modules, and create a separate PLS administrator password. The website password is never retrieved or reused.</p>
                    <Link className={`btn btn-primary${busy ? " disabled" : ""}`} href={`/settings/facilities?application=${selected.id}`}>Review and provision PLS facility</Link>
                    <form className="border-top pt-3 mt-3" onSubmit={link}>
                         <h3 className="h6">Link an existing PLS facility</h3>
                         <label htmlFor="application-tenant" className="form-label">Provisioned facility</label>
                         <select id="application-tenant" className="form-select mb-2" value={tenantId} disabled={busy} required onChange={event => setTenantId(event.target.value)}>
                              <option value="">Select the matching facility</option>{tenants.map(tenant => <option key={tenant.tenantId} value={tenant.tenantId}>{tenant.name} ({tenant.platformId})</option>)}
                         </select>
                         <label className="form-check mb-2"><input type="checkbox" className="form-check-input" checked={identityConfirmed} disabled={busy} onChange={event => setIdentityConfirmed(event.target.checked)} /><span className="form-check-label">I verified that the application and PLS tenant belong to the same laboratory.</span></label>
                         <p className="small text-muted">Existing independent catalog entries require a controlled catalog migration before linking; no catalog or booking history is discarded.</p>
                         <button className="btn btn-outline-primary" disabled={busy || !tenantId || !identityConfirmed}>Confirm tenant link</button>
                    </form>
               </>}
               {selected.integration_state === "provisioning" && <div className="alert alert-warning" role="status">Provisioning is in progress. Refresh the application list after it completes.</div>}
               {selected.status === "approved" && selected.integration_state === "provision_failed" && <div className="alert alert-warning" role="status">
                    <h3 className="h6">Facility provisioning failed</h3>
                    <p>The failed tenant database will be removed before another attempt. Review the details and provide a new administrator password.</p>
                    <Link className={`btn btn-warning${busy ? " disabled" : ""}`} href={`/settings/facilities?application=${selected.id}`}>Retry facility provisioning</Link>
               </div>}
               {selected.status === "approved" && <form className="border-top pt-3 mt-3" onSubmit={suspend}>
                    <h3 className="h6">Suspend marketplace access</h3>
                    <label htmlFor="application-suspend-reason" className="form-label">Reason</label>
                    <input id="application-suspend-reason" className="form-control mb-2" value={reason} disabled={busy} minLength={3} maxLength={500} required onChange={event => setReason(event.target.value)} />
                    <button className="btn btn-outline-danger" disabled={busy || reason.trim().length < 3}>Suspend marketplace facility</button>
               </form>}
          </section>}
     </main>;
}
