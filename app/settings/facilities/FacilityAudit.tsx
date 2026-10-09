"use client";

import { useCallback, useEffect, useState } from "react";
import { customFetch } from "../../../components/Auth/customFetch";
import { actionLabel, actorLabel, AuditEvent, formatDateTime, parseDetails, sourceLabel, statusLabel, summarizeDetails } from "./auditFormat";

interface AuditPage { events: AuditEvent[]; page: number; pageSize: number; total: number }

export default function FacilityAudit({ tenantId, revision = 0 }: { tenantId: number; revision?: number }) {
     const [page, setPage] = useState(1);
     const [data, setData] = useState<AuditPage | null>(null);
     const [loading, setLoading] = useState(false);
     const [error, setError] = useState("");
     const load = useCallback(async () => {
          setLoading(true);
          setError("");
          try {
               const response = await customFetch(`platform/facilities/${tenantId}/audit?page=${page}&pageSize=20`);
               if (response?.status !== "success" || !Array.isArray(response.result?.events) ||
                    !Number.isSafeInteger(response.result.total)) {
                    throw new Error(response?.message || response?.error || "Unable to load facility audit history.");
               }
               setData(response.result);
          } catch (failure) {
               setError(failure instanceof Error ? failure.message : "Unable to load facility audit history.");
               setData(null);
          } finally {
               setLoading(false);
          }
     }, [tenantId, page]);
     useEffect(() => { void load(); }, [load, revision]);
     return (
          <section className="mt-3" aria-busy={loading}>
               <div className="d-flex justify-content-between align-items-center mb-3">
                    <h2 className="h5 fw-semibold mb-0">Facility audit history</h2>
                    <button type="button" className="btn btn-sm btn-outline-secondary" disabled={loading} onClick={() => void load()}>Refresh audit</button>
               </div>
               {error && <div className="alert alert-danger" role="alert">{error}</div>}
               {loading && <p role="status">Loading audit history...</p>}
               {data && <><div className="table-responsive">
                    <table className="table table-sm">
                         <thead><tr><th>When</th><th>Event</th><th>Actor</th><th>Change / reason</th><th>Details</th></tr></thead>
                         <tbody>{data.events.map((event) => {
                              const summary = summarizeDetails(event);
                              const details = parseDetails(event.details);
                              return <tr key={`${event.source}-${event.id}`}>
                                   <td>{formatDateTime(event.createdAt)}</td>
                                   <td><span className="fw-semibold">{actionLabel(event)}</span><div className="small text-muted">{sourceLabel(event.source)}</div></td>
                                   <td>{actorLabel(event)}</td>
                                   <td>{(event.fromStatus || event.toStatus) && <div>{statusLabel(event.fromStatus)} → {statusLabel(event.toStatus)}</div>}
                                        {event.reason && <div>Reason: {event.reason}</div>}
                                        {summary.map((item) => <div key={item.label}><span className="text-muted">{item.label}:</span> {item.value}</div>)}</td>
                                   <td>{details != null && <details><summary>Raw details</summary><pre className="small text-wrap">{typeof details === "string" ? details : JSON.stringify(details, null, 2)}</pre></details>}</td>
                              </tr>;
                         })}</tbody>
                    </table>
               </div>
                    {data.events.length === 0 && <p>No audit events recorded for this facility.</p>}
                    <div className="d-flex justify-content-between align-items-center gap-2">
                         <span className="small text-muted">Page {data.page} / {Math.max(1, Math.ceil(data.total / data.pageSize))} ({data.total} events)</span>
                         <div><button type="button" className="btn btn-sm btn-outline-secondary me-2" disabled={loading || page <= 1} onClick={() => setPage(page - 1)}>Previous audit page</button><button type="button" className="btn btn-sm btn-outline-secondary" disabled={loading || page * data.pageSize >= data.total} onClick={() => setPage(page + 1)}>Next audit page</button></div>
                    </div>
               </>}
          </section>
     );
}