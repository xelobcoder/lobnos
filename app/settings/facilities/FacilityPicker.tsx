"use client";

import { ReactNode, useCallback, useEffect, useState } from "react";
import { customFetch } from "../../../components/Auth/customFetch";
import { useApplication } from "../../../components/Auth/useApplicationContext";
import FacilityNav from "./FacilityNav";
import type { ManagedFacility } from "./FacilityManagement";

const normalizeRole = (role: unknown) => String(role || "").toLowerCase().replace(/[\s_-]/g, "");

// Super-admin gate, facility list and selection shared by the payments and audit subpages.
export default function FacilityPicker({ title, description, children }: {
     title: string;
     description: string;
     children: (facility: ManagedFacility, onStatusChange: (tenantId: number, status: string) => void) => ReactNode;
}) {
     const application = useApplication();
     const isSuperAdmin = normalizeRole(application?.user?.role) === "superadmin";
     const [facilities, setFacilities] = useState<ManagedFacility[]>([]);
     const [loading, setLoading] = useState(true);
     const [error, setError] = useState("");
     const [query, setQuery] = useState("");
     const [selected, setSelected] = useState<number | null>(null);

     const load = useCallback(async () => {
          setLoading(true);
          setError("");
          try {
               const response = await customFetch("platform/facilities");
               if (response?.status !== "success" || !Array.isArray(response.result)) {
                    throw new Error(response?.message || response?.error || "Unable to load facilities.");
               }
               setFacilities(response.result);
          } catch (failure) {
               setError(failure instanceof Error ? failure.message : "Unable to load facilities.");
          } finally {
               setLoading(false);
          }
     }, []);
     useEffect(() => {
          if (isSuperAdmin) void load();
          else setLoading(false);
     }, [isSuperAdmin, load]);

     if (!isSuperAdmin) return (
          <main className="p-2">
               <h1 className="h4 fw-semibold mb-3">Client platform</h1>
               <div className="alert alert-danger" role="alert">Only an authorized platform super administrator can access facility management.</div>
          </main>
     );
     const needle = query.trim().toLowerCase();
     const visible = facilities.filter((facility) => [facility.name, facility.platformId, String(facility.tenantId)]
          .some((value) => String(value).toLowerCase().includes(needle)));
     const facility = facilities.find((item) => item.tenantId === selected);
     return (
          <main className="p-2">
               <h1 className="h4 fw-semibold mb-1">Client platform</h1>
               <p className="text-muted small">{description}</p>
               <FacilityNav />
               <h2 className="h5 fw-semibold">{title}</h2>
               {error && <div className="alert alert-danger d-flex justify-content-between gap-2" role="alert"><span>{error}</span><button type="button" className="btn btn-sm btn-outline-danger" onClick={() => void load()}>Retry</button></div>}
               {loading && <p role="status">Loading facilities...</p>}
               <div className="row g-2 mb-3">
                    <div className="col-md-5"><label htmlFor="facility-picker-search" className="form-label">Search facilities</label><input id="facility-picker-search" type="search" className="form-control" placeholder="Name, organization identifier or tenant ID" value={query} onChange={(event) => setQuery(event.target.value)} /></div>
                    <div className="col-md-7"><label htmlFor="facility-picker" className="form-label">Facility</label>
                         <select id="facility-picker" className="form-select" value={selected ?? ""} disabled={loading} onChange={(event) => setSelected(event.target.value ? Number(event.target.value) : null)}>
                              <option value="">{visible.length ? "Select a facility" : "No matching facilities"}</option>
                              {visible.map((item) => <option key={item.tenantId} value={item.tenantId}>{item.name} ({item.platformId}) - {item.status}</option>)}
                         </select></div>
               </div>
               {facility
                    ? <div key={facility.tenantId}>{children(facility, (tenantId, status) => setFacilities((current) => current.map((item) => item.tenantId === tenantId ? { ...item, status } : item)))}</div>
                    : !loading && <p className="text-muted">Select a facility to continue.</p>}
          </main>
     );
}