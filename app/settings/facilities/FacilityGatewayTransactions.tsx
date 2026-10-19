"use client";

import { useCallback, useEffect, useState } from "react";
import { customFetch, customFetchMutation } from "../../../components/Auth/customFetch";

interface Transaction {
     reference: string; provider: string; tenantId: number; periodStart: string | null; amountMinor: number; currency: string;
     status: string; needsReview: boolean; reviewReason: string | null; fulfilled: boolean; createdAt: string;
}
interface EventRow { id: number; source: string; event_type: string; from_status: string | null; to_status: string | null; detail: string | null; created_at: string }

const STATUSES = ["initiated", "pending", "succeeded", "failed", "cancelled", "expired", "refund_pending", "refunded"];
const money = (minor: number, currency: string) => `${(minor / 100).toFixed(2)} ${currency}`;
const message = (error: unknown) => error instanceof Error ? error.message : "Request failed. Please try again.";

export default function FacilityGatewayTransactions() {
     const [items, setItems] = useState<Transaction[]>([]);
     const [status, setStatus] = useState("");
     const [reviewOnly, setReviewOnly] = useState(false);
     const [busy, setBusy] = useState(false);
     const [error, setError] = useState("");
     const [notice, setNotice] = useState("");
     const [selected, setSelected] = useState<{ reference: string; events: EventRow[] } | null>(null);

     const load = useCallback(async () => {
          setError("");
          const query = new URLSearchParams({ pageSize: "50" });
          if (status) query.set("status", status);
          if (reviewOnly) query.set("needsReview", "true");
          try {
               const response = await customFetch(`platform/payments/transactions?${query}`);
               if (response?.status !== "success" || !Array.isArray(response.result?.items)) throw new Error(response?.message || "Unable to load transactions.");
               setItems(response.result.items);
          } catch (failure) {
               setError(message(failure));
          }
     }, [status, reviewOnly]);
     useEffect(() => { void load(); }, [load]);

     const act = async (path: string, success: string) => {
          if (busy) return;
          setBusy(true);
          setError("");
          setNotice("");
          try {
               const response = await customFetchMutation(path, "POST", {});
               if (response?.status !== "success") throw new Error(response?.message || "The server did not complete the request.");
               setNotice(success);
               await load();
          } catch (failure) {
               setError(message(failure));
          } finally {
               setBusy(false);
          }
     };

     const open = async (reference: string) => {
          try {
               const response = await customFetch(`platform/payments/transactions/${encodeURIComponent(reference)}`);
               if (response?.status !== "success") throw new Error(response?.message || "Unable to load the transaction.");
               setSelected({ reference, events: response.result.events ?? [] });
          } catch (failure) {
               setError(message(failure));
          }
     };

     return (
          <section className="mt-3" aria-busy={busy}>
               <div className="d-flex flex-wrap gap-2 align-items-end mb-3">
                    <div><label htmlFor="gwStatus" className="form-label">Status</label>
                         <select id="gwStatus" className="form-select" value={status} onChange={(event) => setStatus(event.target.value)}>
                              <option value="">All</option>
                              {STATUSES.map((item) => <option key={item} value={item}>{item.replace("_", " ")}</option>)}
                         </select></div>
                    <div className="form-check mb-2"><input id="gwReview" type="checkbox" className="form-check-input" checked={reviewOnly} onChange={(event) => setReviewOnly(event.target.checked)} />
                         <label htmlFor="gwReview" className="form-check-label">Needs review only</label></div>
                    <button className="btn btn-outline-secondary" onClick={() => void load()} disabled={busy}>Refresh</button>
                    <button className="btn btn-outline-primary" onClick={() => void act("platform/payments/reconcile", "Reconciliation completed.")} disabled={busy}>Reconcile open payments</button>
               </div>
               {error && <div className="alert alert-danger" role="alert">{error}</div>}
               {notice && <div className="alert alert-success" role="status">{notice}</div>}
               {items.length === 0 ? <p className="text-muted">No gateway transactions.</p> : <div className="table-responsive"><table className="table table-sm align-middle">
                    <thead><tr><th>Reference</th><th>Provider</th><th>Tenant</th><th>Period</th><th>Amount</th><th>Status</th><th>Applied</th><th>Actions</th></tr></thead>
                    <tbody>{items.map((item) => <tr key={item.reference}>
                         <td className="font-monospace">{item.reference}</td><td className="text-capitalize">{item.provider}</td><td>{item.tenantId}</td>
                         <td>{item.periodStart ?? "-"}</td><td>{money(item.amountMinor, item.currency)}</td>
                         <td><span className="text-capitalize">{item.status.replace("_", " ")}</span>{item.needsReview && <span className="badge bg-warning text-dark ms-2" title={item.reviewReason ?? ""}>Needs review</span>}</td>
                         <td>{item.fulfilled ? "Yes" : "No"}</td>
                         <td className="text-nowrap">
                              <button className="btn btn-sm btn-outline-secondary me-1" onClick={() => void open(item.reference)}>History</button>
                              <button className="btn btn-sm btn-outline-primary" disabled={busy} onClick={() => void act(`platform/payments/transactions/${encodeURIComponent(item.reference)}/verify`, `Verified ${item.reference} with the provider.`)}>Verify now</button>
                         </td></tr>)}</tbody></table></div>}
               {selected && <div className="border-top pt-3">
                    <h3 className="h6 fw-semibold">History for <span className="font-monospace">{selected.reference}</span></h3>
                    <ul className="list-unstyled small">{selected.events.map((event) => <li key={event.id}>{String(event.created_at).replace("T", " ").slice(0, 19)} · {event.source} · {event.event_type}{event.to_status ? ` (${event.from_status ?? "-"} → ${event.to_status})` : ""}{event.detail ? ` — ${event.detail}` : ""}</li>)}</ul>
                    <button className="btn btn-sm btn-outline-secondary" onClick={() => setSelected(null)}>Close</button>
               </div>}
          </section>
     );
}
