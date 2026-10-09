"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { customFetch, customFetchMutation } from "../../../components/Auth/customFetch";
import { useApplication } from "../../../components/Auth/useApplicationContext";
import FacilityManagement from "./FacilityManagement";

interface Country { id: number; country_name: string }
interface State { id: number; country_id: number; state_name: string }
interface District { id: number; state_id: number; district_name: string }
interface LocationOptions { countries: Country[]; states: State[]; districts: District[] }
interface Facility { tenantId: number; platformId: string; name: string; databaseName: string; status: string; isControlTenant?: boolean }
interface ProvisionedFacility { organizationIdentifier: string; tenantId: number; databaseName: string; adminUsername: string }
interface FacilityForm {
     companyName: string; email: string; phone: string; address: string;
     countryId: string; stateId: string; districtId: string;
     adminName: string; adminEmail: string; adminPassword: string; licenseDays: string;
}

const EMPTY_FORM: FacilityForm = {
     companyName: "", email: "", phone: "", address: "", countryId: "", stateId: "", districtId: "",
     adminName: "", adminEmail: "", adminPassword: "", licenseDays: "365",
};
const errorMessage = (error: unknown) => error instanceof Error ? error.message : "Facility onboarding failed. Please try again.";
const normalizeRole = (role: unknown) => String(role || "").toLowerCase().replace(/[\s_-]/g, "");

export default function FacilityOnboardingPage() {
     const application = useApplication();
     const isSuperAdmin = normalizeRole(application?.user?.role) === "superadmin";
     const [form, setForm] = useState<FacilityForm>(EMPTY_FORM);
     const [options, setOptions] = useState<LocationOptions>({ countries: [], states: [], districts: [] });
     const [facilities, setFacilities] = useState<Facility[]>([]);
     const [loading, setLoading] = useState(true);
     const [busy, setBusy] = useState(false);
     const [error, setError] = useState("");
     const [created, setCreated] = useState<ProvisionedFacility | null>(null);
     const [selectedTenantId, setSelectedTenantId] = useState<number | null>(null);

     const load = useCallback(async () => {
          setLoading(true);
          setError("");
          try {
               const [locations, organizations] = await Promise.all([
                    customFetch("platform/facilities/options"),
                    customFetch("platform/facilities"),
               ]);
               if (locations?.status !== "success" || !locations.result ||
                    !Array.isArray(locations.result.countries) || !Array.isArray(locations.result.states) ||
                    !Array.isArray(locations.result.districts)) {
                    throw new Error(locations?.message || locations?.error || "Unable to load facility location options.");
               }
               if (organizations?.status !== "success" || !Array.isArray(organizations.result)) {
                    throw new Error(organizations?.message || organizations?.error || "Unable to load facilities.");
               }
               setOptions(locations.result);
               setFacilities(organizations.result);
          } catch (failure) {
               setError(errorMessage(failure));
          } finally {
               setLoading(false);
          }
     }, []);

     useEffect(() => {
          if (isSuperAdmin) void load();
          else setLoading(false);
     }, [isSuperAdmin, load]);

     const update = (field: keyof FacilityForm, value: string) => {
          setForm((current) => ({
               ...current, [field]: value,
               ...(field === "countryId" ? { stateId: "", districtId: "" } : {}),
               ...(field === "stateId" ? { districtId: "" } : {}),
          }));
     };

     const submit = async (event: FormEvent<HTMLFormElement>) => {
          event.preventDefault();
          if (busy) return;
          setError("");
          setCreated(null);
          const licenseDays = Number(form.licenseDays);
          if (!Number.isInteger(licenseDays) || licenseDays < 1 || licenseDays > 3650) {
               setError("License duration must be between 1 and 3650 days.");
               return;
          }
          if (!/^[0-9]{7,10}$/.test(form.phone.trim()) || Number(form.phone.trim()) > 4294967295) {
               setError("Company phone must contain 7 to 10 digits only and must not exceed 4294967295.");
               return;
          }
          if (new TextEncoder().encode(form.adminPassword).length > 72) {
               setError("The initial password must not exceed 72 UTF-8 bytes.");
               return;
          }
          if (!form.companyName.trim() || !form.address.trim() || !form.adminName.trim()) {
               setError("Company name, address, and administrator name cannot be blank.");
               return;
          }
          setBusy(true);
          try {
               const response = await customFetchMutation("platform/facilities", "POST", {
                    companyName: form.companyName.trim(), email: form.email.trim(), phone: form.phone.trim(),
                    address: form.address.trim(), countryId: Number(form.countryId), stateId: Number(form.stateId),
                    districtId: Number(form.districtId), adminName: form.adminName.trim(),
                    adminEmail: form.adminEmail.trim(), adminPassword: form.adminPassword, licenseDays,
               });
               if (response?.status !== "success" || !response.result?.organizationIdentifier ||
                    !response.result?.adminUsername || !response.result?.databaseName ||
                    !Number.isSafeInteger(response.result.tenantId)) {
                    throw new Error(response?.message || response?.error || "The server did not confirm facility provisioning.");
               }
               setCreated(response.result);
               setForm(EMPTY_FORM);
               setFacilities((current) => [{
                    tenantId: response.result.tenantId, platformId: response.result.organizationIdentifier,
                    name: form.companyName.trim(), databaseName: response.result.databaseName, status: "active",
               }, ...current]);
          } catch (failure) {
               setForm((current) => ({ ...current, adminPassword: "" }));
               setError(errorMessage(failure));
          } finally {
               setBusy(false);
          }
     };

     if (!isSuperAdmin) return (
          <div className="container-fluid py-4">
               <h1 className="h4">Client platform</h1>
               <div className="alert alert-danger" role="alert">Only an authorized platform super administrator can access facility onboarding.</div>
          </div>
     );

     const states = options.states.filter((state) => Number(state.country_id) === Number(form.countryId));
     const districts = options.districts.filter((district) => Number(district.state_id) === Number(form.stateId));
     const selectedFacility = facilities.find((facility) => facility.tenantId === selectedTenantId);
     return (
          <main className="container-fluid py-4" aria-busy={busy}>
               <h1 className="h4">Client platform</h1>
               <p className="text-muted">Provision facilities, manage client access, and track subscription payments.</p>
               {error && <div className="alert alert-danger" role="alert">{error}</div>}
               {loading && <p role="status">Loading facility configuration...</p>}
               {!loading && error && options.countries.length === 0 && <button type="button" className="btn btn-outline-primary mb-3" onClick={() => void load()}>Retry loading</button>}
               {created && (
                    <section className="alert alert-success" role="status">
                         <h2 className="h5">Facility ready</h2>
                         <dl className="row mb-0">
                              <dt className="col-sm-4">Organization identifier</dt><dd className="col-sm-8">{created.organizationIdentifier}</dd>
                              <dt className="col-sm-4">Internal tenant ID</dt><dd className="col-sm-8">{created.tenantId}</dd>
                              <dt className="col-sm-4">Database</dt><dd className="col-sm-8">{created.databaseName}</dd>
                              <dt className="col-sm-4">Administrator username</dt><dd className="col-sm-8"><strong>{created.adminUsername}</strong></dd>
                         </dl>
                         <p className="mb-0">Share the username and the password you chose securely with the facility administrator. Email delivery requires the facility email provider to be configured.</p>
                    </section>
               )}
               <details className="mb-4" open={facilities.length === 0 && !loading}>
                    <summary className="h5 mb-3">Provision a new facility</summary>
               <form onSubmit={submit} className="card shadow-sm mb-4">
                    <fieldset disabled={loading || busy || options.countries.length === 0} className="card-body">
                         <legend className="h5">Company information</legend>
                         <div className="row g-3">
                              {([
                                   ["companyName", "Company name", "text"], ["email", "Company email", "email"],
                                   ["phone", "Company phone", "tel"], ["address", "Company address", "text"],
                              ] as const).map(([field, label, type]) => (
                                   <div key={field} className="col-md-6">
                                        <label htmlFor={field} className="form-label">{label}</label>
                                        <input id={field} type={type} className="form-control" value={form[field]} onChange={(event) => update(field, event.target.value)} maxLength={field === "address" ? 200 : field === "phone" ? 10 : 100} minLength={field === "phone" ? 7 : 1} pattern={field === "phone" ? "[0-9]{7,10}" : undefined} required />
                                        {field === "phone" && <small className="text-muted">7 to 10 digits only, without spaces or a plus sign.</small>}
                                   </div>
                              ))}
                              <div className="col-md-4">
                                   <label htmlFor="countryId" className="form-label">Country</label>
                                   <select id="countryId" className="form-select" value={form.countryId} onChange={(event) => update("countryId", event.target.value)} required>
                                        <option value="">Select country</option>
                                        {options.countries.map((country) => <option key={country.id} value={country.id}>{country.country_name}</option>)}
                                   </select>
                              </div>
                              <div className="col-md-4">
                                   <label htmlFor="stateId" className="form-label">State / region</label>
                                   <select id="stateId" className="form-select" value={form.stateId} disabled={!form.countryId} onChange={(event) => update("stateId", event.target.value)} required>
                                        <option value="">Select state / region</option>
                                        {states.map((state) => <option key={state.id} value={state.id}>{state.state_name}</option>)}
                                   </select>
                              </div>
                              <div className="col-md-4">
                                   <label htmlFor="districtId" className="form-label">District</label>
                                   <select id="districtId" className="form-select" value={form.districtId} disabled={!form.stateId} onChange={(event) => update("districtId", event.target.value)} required>
                                        <option value="">Select district</option>
                                        {districts.map((district) => <option key={district.id} value={district.id}>{district.district_name}</option>)}
                                   </select>
                              </div>
                         </div>
                         <h2 className="h5 mt-4">Initial facility administrator</h2>
                         <div className="row g-3">
                              <div className="col-md-6"><label htmlFor="adminName" className="form-label">Administrator name</label><input id="adminName" className="form-control" value={form.adminName} onChange={(event) => update("adminName", event.target.value)} maxLength={100} required /></div>
                              <div className="col-md-6"><label htmlFor="adminEmail" className="form-label">Administrator email</label><input id="adminEmail" type="email" className="form-control" value={form.adminEmail} onChange={(event) => update("adminEmail", event.target.value)} maxLength={200} required /></div>
                              <div className="col-md-6"><label htmlFor="adminPassword" className="form-label">Initial password</label><input id="adminPassword" type="password" autoComplete="new-password" className="form-control" value={form.adminPassword} onChange={(event) => update("adminPassword", event.target.value)} minLength={12} maxLength={72} required /><small className="text-muted">Use at least 12 characters. Passwords are not displayed in the result.</small></div>
                              <div className="col-md-6"><label htmlFor="licenseDays" className="form-label">License duration (days)</label><input id="licenseDays" type="number" className="form-control" value={form.licenseDays} onChange={(event) => update("licenseDays", event.target.value)} min={1} max={3650} required /></div>
                         </div>
                         <p className="text-muted mt-3">Provisioning may take several minutes. Do not submit again or close this page while setup is running.</p>
                         <button type="submit" className="btn btn-primary">{busy ? "Provisioning facility..." : "Create and provision facility"}</button>
                    </fieldset>
               </form>
               </details>
               <section className="card shadow-sm">
                    <div className="card-body">
                         <h2 className="h5">Registered facilities</h2>
                         <div className="table-responsive">
                              <table className="table">
                                   <thead><tr><th>Company</th><th>Organization identifier</th><th>Tenant ID</th><th>Status</th><th>Management</th></tr></thead>
                                   <tbody>{facilities.map((facility) => <tr key={facility.platformId}><td>{facility.name}</td><td>{facility.platformId}</td><td>{facility.tenantId}</td><td>{facility.status}</td><td><button type="button" className="btn btn-sm btn-outline-primary" onClick={() => setSelectedTenantId(facility.tenantId)}>Manage {facility.name}</button></td></tr>)}</tbody>
                              </table>
                              {!loading && facilities.length === 0 && <p className="text-muted">No facilities loaded.</p>}
                         </div>
                    </div>
               </section>
               {selectedFacility && <FacilityManagement key={selectedFacility.tenantId} facility={selectedFacility} onStatusChange={(tenantId, status) => setFacilities((current) => current.map((facility) => facility.tenantId === tenantId ? { ...facility, status } : facility))} />}
          </main>
     );
}
