"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { customFetch, customFetchMutation } from "../../../../components/Auth/customFetch";

interface Transaction {
     reference: string; provider: string; billingId: number | null; amountMinor: number; currency: string;
     status: string; needsReview: boolean; reviewReason: string | null; fulfilled: boolean; createdAt: string;
}
interface EventRow { id: number; source: string; event_type: string; from_status: string | null; to_status: string | null; detail: string | null; created_at: string }

const STATUSES = ["initiated", "pending", "succeeded", "failed", "cancelled", "expired", "refund_pending", "refunded"];
const money = (minor: number, currency: string) => `${(minor / 100).toFixed(2)} ${currency}`;
const message = (error: unknown) => error instanceof Error ? error.message : "Request failed. Please try again.";

export default function TenantGatewayTransactionsPage() {
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
               const response = await customFetch(`payments/gateway/transactions?${query}`);
               if (response?.status !== "success" || !Array.isArray(response.result?.items)) throw new Error(response?.message || "Unable to load transactions.");
               setItems(response.result.items);
          } catch (failure) { setError(message(failure)); }
     }, [status, reviewOnly]);
     useEffect(() => { void load(); }, [load]);

     const verify = async (reference: string) => {
          if (busy) return;
          setBusy(true); setError(""); setNotice("");
          try {
               const response = await customFetchMutation(`payments/gateway/transactions/${encodeURIComponent(reference)}/verify`, "POST", {});
               if (response?.status !== "success") throw new Error(response?.message || "The server did not complete the request.");
               setNotice(`Checked ${reference} with the provider.`);
               await load();
          } catch (failure) { setError(message(failure)); } finally { setBusy(false); }
     };

     const open = async (reference: string) => {
          try {
               const response = await customFetch(`payments/gateway/transactions/${encodeURIComponent(reference)}`);
               if (response?.status !== "success") throw new Error(response?.message || "Unable to load the transaction.");
               setSelected({ reference, events: response.result.events ?? [] });
          } catch (failure) { setError(message(failure)); }
     };

     return (
          <div className="container py-4" aria-busy={busy}>
               <div className="d-flex justify-content-between align-items-center mb-3">
                    <h1 className="h4 mb-0">Online payment transactions</h1>
                    <Link href="/settings/payment-gateways" className="btn btn-outline-secondary btn-sm">Provider settings</Link>
               </div>
               <div className="d-flex flex-wrap gap-2 align-items-end mb-3">
                    <div><label htmlFor="tgStatus" className="form-label">Status</label>
                         <select id="tgStatus" className="form-select" value={status} onChange={(event) => setStatus(event.target.value)}>
                              <option value="">All</option>
                              {STATUSES.map((item) => <option key={item} value={item}>{item.replace("_", " ")}</option>)}
                         </select></div>
                    <div className="form-check mb-2"><input id="tgReview" type="checkbox" className="form-check-input" checked={reviewOnly} onChange={(event) => setReviewOnly(event.target.checked)} />
                         <label htmlFor="tgReview" className="form-check-label">Needs review only</label></div>
                    <button className="btn btn-outline-secondary" onClick={() => void load()} disabled={busy}>Refresh</button>
               </div>
               {error && <div className="alert alert-danger" role="alert">{error}</div>}
               {notice && <div className="alert alert-success" role="status">{notice}</div>}
               {items.length === 0 ? <p className="text-muted">No online payments yet.</p> : <div className="table-responsive"><table className="table table-sm align-middle">
                    <thead><tr><th>Reference</th><th>Provider</th><th>Bill</th><th>Amount</th><th>Status</th><th>Applied to bill</th><th>Actions</th></tr></thead>
                    <tbody>{items.map((item) => <tr key={item.reference}>
                         <td className="font-monospace">{item.reference}</td><td className="text-capitalize">{item.provider}</td><td>{item.billingId ?? "-"}</td>
                         <td>{money(item.amountMinor, item.currency)}</td>
                         <td><span className="text-capitalize">{item.status.replace("_", " ")}</span>{item.needsReview && <span className="badge bg-warning text-dark ms-2" title={item.reviewReason ?? ""}>Needs review</span>}</td>
                         <td>{item.fulfilled ? "Yes" : "No"}</td>
                         <td className="text-nowrap">
                              <button className="btn btn-sm btn-outline-secondary me-1" onClick={() => void open(item.reference)}>History</button>
                              <button className="btn btn-sm btn-outline-primary" disabled={busy} onClick={() => void verify(item.reference)}>Verify now</button>
                         </td></tr>)}</tbody></table></div>}
               {selected && <div className="border-top pt-3">
                    <h2 className="h6 fw-semibold">History for <span className="font-monospace">{selected.reference}</span></h2>
                    <ul className="list-unstyled small">{selected.events.map((event) => <li key={event.id}>{String(event.created_at).replace("T", " ").slice(0, 19)} · {event.source} · {event.event_type}{event.to_status ? ` (${event.from_status ?? "-"} → ${event.to_status})` : ""}{event.detail ? ` — ${event.detail}` : ""}</li>)}</ul>
                    <button className="btn btn-sm btn-outline-secondary" onClick={() => setSelected(null)}>Close</button>
               </div>}
          </div>
     );
}
