"use client";

import { useEffect, useState } from "react";
import { customFetch } from "../../../components/Auth/customFetch";
import { WebsiteEnquiry, websiteEnquiriesSchema } from "./enquirySchemas";

export default function WebsiteEnquiries() {
     const [formType, setFormType] = useState("all");
     const [page, setPage] = useState(1);
     const [rows, setRows] = useState<WebsiteEnquiry[]>([]);
     const [hasMore, setHasMore] = useState(false);
     const [selected, setSelected] = useState<WebsiteEnquiry | null>(null);
     const [loading, setLoading] = useState(true);
     const [error, setError] = useState("");
     const [refresh, setRefresh] = useState(0);

     useEffect(() => {
          let active = true;
          setLoading(true);
          setError("");
          setSelected(null);
          void customFetch(`marketplace/platform/enquiries?formType=${formType}&page=${page}`)
               .then(response => {
                    if (!active) return;
                    if (response?.status !== "success") throw new Error(response?.message || response?.error || "Unable to load website enquiries.");
                    const parsed = websiteEnquiriesSchema.safeParse(response.result);
                    if (!parsed.success || parsed.data.page !== page) throw new Error("The server returned invalid enquiry data.");
                    setRows(parsed.data.enquiries);
                    setHasMore(parsed.data.hasMore);
               })
               .catch(failure => {
                    if (active) {
                         setError(failure instanceof Error ? failure.message : "Unable to load website enquiries.");
                         setRows([]);
                         setHasMore(false);
                    }
               })
               .finally(() => { if (active) setLoading(false); });
          return () => { active = false; };
     }, [formType, page, refresh]);

     return <section className="bg-white border rounded p-3 mb-4" aria-labelledby="website-enquiries-title" aria-busy={loading}>
          <div className="d-flex flex-wrap justify-content-between gap-3 mb-3">
               <div><h2 id="website-enquiries-title" className="h5">Demo requests &amp; contact enquiries</h2><p className="text-muted mb-0">Messages submitted through the corporate website. These are separate from laboratory registration applications.</p></div>
               <div className="d-flex gap-2">
                    <label className="visually-hidden" htmlFor="enquiry-type">Enquiry type</label>
                    <select id="enquiry-type" className="form-select" value={formType} disabled={loading} onChange={event => { setFormType(event.target.value); setPage(1); }}>
                         <option value="all">All enquiries</option><option value="demo">Demo requests</option><option value="contact">Contact enquiries</option>
                    </select>
                    <button className="btn btn-outline-secondary" disabled={loading} onClick={() => setRefresh(value => value + 1)}>Refresh enquiries</button>
               </div>
          </div>
          {error ? <div className="alert alert-danger" role="alert">{error}</div> : loading ? <p role="status">Loading website enquiries...</p> : <>
               {!rows.length ? <p role="status">No {formType === "demo" ? "demo requests" : formType === "contact" ? "contact enquiries" : "website enquiries"} on this page.</p> :
                    <div className="table-responsive"><table className="table table-hover">
                         <caption className="visually-hidden">Website demo requests and contact enquiries, newest first</caption>
                         <thead><tr><th scope="col">Received</th><th scope="col">Type</th><th scope="col">Contact</th><th scope="col">Organization</th><th scope="col">Status</th><th scope="col">Details</th></tr></thead>
                         <tbody>{rows.map(enquiry => <tr key={enquiry.id}>
                              <td>{new Date(enquiry.receivedAt).toLocaleString()}</td>
                              <td>{enquiry.formType === "demo" ? "Demo request" : "Contact enquiry"}</td>
                              <td><strong>{enquiry.fullName}</strong><div>{enquiry.workEmail}</div><div>{enquiry.phone}</div></td>
                              <td>{enquiry.organization || "Not provided"}</td><td>{enquiry.status}</td>
                              <td><button className="btn btn-sm btn-outline-primary" onClick={() => setSelected(enquiry)}>View request <span className="visually-hidden">#{enquiry.id}</span></button></td>
                         </tr>)}</tbody>
                    </table></div>}
               <div className="d-flex align-items-center gap-3">
                    <button className="btn btn-outline-secondary" disabled={page === 1} onClick={() => setPage(value => value - 1)}>Previous enquiries</button>
                    <span>Page {page}</span>
                    <button className="btn btn-outline-secondary" disabled={!hasMore} onClick={() => setPage(value => value + 1)}>Next enquiries</button>
               </div>
          </>}
          {selected && <section className="border-top pt-3 mt-3" aria-label="Enquiry details">
               <div className="d-flex justify-content-between gap-3"><h3 className="h6">{selected.formType === "demo" ? "Demo request" : "Contact enquiry"} #{selected.id}: {selected.fullName}</h3><button className="btn-close" aria-label="Close enquiry details" onClick={() => setSelected(null)} /></div>
               <dl className="row">
                    <dt className="col-sm-3">Email</dt><dd className="col-sm-9">{selected.workEmail}</dd>
                    <dt className="col-sm-3">Phone</dt><dd className="col-sm-9">{selected.phone || "Not provided"}</dd>
                    <dt className="col-sm-3">Organization</dt><dd className="col-sm-9">{selected.organization || "Not provided"}</dd>
                    <dt className="col-sm-3">Country</dt><dd className="col-sm-9">{selected.country || "Not provided"}</dd>
                    <dt className="col-sm-3">Facility type</dt><dd className="col-sm-9">{selected.facilityType || "Not provided"}</dd>
                    <dt className="col-sm-3">Number of facilities</dt><dd className="col-sm-9">{selected.facilitiesCount || "Not provided"}</dd>
                    <dt className="col-sm-3">Interests</dt><dd className="col-sm-9">{selected.interests.join(", ") || "Not provided"}</dd>
                    <dt className="col-sm-3">Subject</dt><dd className="col-sm-9">{selected.subject || "Not provided"}</dd>
                    <dt className="col-sm-3">Submitted</dt><dd className="col-sm-9">{new Date(selected.submittedAt).toLocaleString()}</dd>
                    <dt className="col-sm-3">Message</dt><dd className="col-sm-9" style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>{selected.message}</dd>
               </dl>
          </section>}
     </section>;
}
