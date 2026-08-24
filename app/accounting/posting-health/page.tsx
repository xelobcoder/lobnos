"use client";
import { RiRefreshLine, RiRestartLine } from "@remixicon/react";
import dayjs from "dayjs";
import React, { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import PrimeTable from "../../../components/accessories/Datatables/PrimeTable";
import ReportShell from "../../../components/accounting/ReportShell";
import { accountingApi, OutboxHealth } from "../../../lib/accounting/accountingApi";

const STATUS_STYLES: Record<string, string> = {
     pending: "bg-info text-dark",
     posted: "bg-success",
     failed: "bg-warning text-dark",
     dead_letter: "bg-danger",
};

export default function PostingExceptionsPage() {
     const [health, setHealth] = useState<OutboxHealth | null>(null);
     const [rows, setRows] = useState<any[]>([]);
     const [status, setStatus] = useState("failed");
     const [loading, setLoading] = useState(false);
     const [busy, setBusy] = useState<number | null>(null);

     const handleSeverSideProcessing = useCallback(
          async ({ page, count }: { page: number; count: number }) => {
               const response = await accountingApi.outbox({
                    status: status || undefined,
                    page: page || 1,
                    count: count || 25,
               });
               const data = response?.result?.data || [];
               setRows(data);
               return { result: data };
          },
          [status]
     );

     const load = useCallback(async () => {
          setLoading(true);
          try {
               const healthRes = await accountingApi.outboxHealth();
               setHealth(healthRes?.result || null);
               await handleSeverSideProcessing({ page: 1, count: 25 });
          } catch (error: any) {
               toast.error(error?.message || "Unable to load posting exceptions");
          } finally {
               setLoading(false);
          }
     }, [handleSeverSideProcessing]);

     useEffect(() => {
          load();
     }, [load]);

     const replay = async (id: number) => {
          setBusy(id);
          try {
               const response: any = await accountingApi.replayOutbox(id);
               if (response?.status === "error") toast.error(response?.message || "Replay failed");
               else {
                    toast.success("Replayed");
                    await load();
               }
          } catch (error: any) {
               toast.error(error?.message || "Replay failed");
          } finally {
               setBusy(null);
          }
     };

     const tiles = [
          { label: "Pending", value: health?.pending ?? 0, tone: "" },
          { label: "Failed", value: health?.failed ?? 0, tone: health?.failed ? "text-warning" : "" },
          { label: "Dead letter", value: health?.deadLetter ?? 0, tone: health?.deadLetter ? "text-danger" : "" },
          {
               label: "Oldest waiting",
               value: health?.oldestPendingMinutes == null ? "-" : `${health.oldestPendingMinutes} min`,
               tone: (health?.oldestPendingMinutes || 0) > 10 ? "text-warning" : "",
          },
     ];

     const column = [
          {
               Header: "Created",
               accessor: "created_at",
               Cell: ({ value }: any) => <span className="text-nowrap small">{dayjs(value).format("DD MMM HH:mm")}</span>,
          },
          {
               Header: "Source",
               accessor: "source_module",
               Cell: ({ row }: any) => (
                    <div>
                         <div className="text-capitalize">{row.original.source_module}</div>
                         <small className="text-muted">
                              {row.original.source_table}#{row.original.source_ref || row.original.source_pk}
                         </small>
                    </div>
               ),
          },
          { Header: "Type", accessor: "transaction_type" },
          {
               Header: "Status",
               accessor: "status",
               Cell: ({ value }: any) => (
                    <span className={`badge ${STATUS_STYLES[value] || "bg-light text-dark"}`}>{String(value).replace("_", " ")}</span>
               ),
          },
          { Header: "Attempts", accessor: "attempts", Cell: ({ value }: any) => <span className="d-block text-center">{value}</span> },
          {
               Header: "Last error",
               accessor: "last_error",
               Cell: ({ value }: any) => <span className="small text-danger">{value || "-"}</span>,
          },
          {
               Header: "Actions",
               accessor: "id",
               Cell: ({ row }: any) =>
                    row.original.status === "failed" || row.original.status === "dead_letter" ? (
                         <button
                              className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1"
                              disabled={busy === row.original.id}
                              onClick={() => replay(row.original.id)}
                         >
                              <RiRestartLine size={14} /> Replay
                         </button>
                    ) : (
                         <span className="text-muted small">-</span>
                    ),
          },
     ];

     return (
          <ReportShell
               title="Posting Exceptions"
               subtitle="Business records commit immediately; the ledger catches up on a sweep every 60 seconds."
               actions={
                    <button className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1" onClick={load} disabled={loading}>
                         <RiRefreshLine size={16} /> Refresh
                    </button>
               }
               filters={
                    <div className="col-6 col-md-3">
                         <label className="form-label mb-1 small text-muted">Status</label>
                         <select className="form-select custom-select" value={status} onChange={(e) => setStatus(e.target.value)}>
                              <option value="">All</option>
                              <option value="pending">Pending</option>
                              <option value="failed">Failed</option>
                              <option value="dead_letter">Dead letter</option>
                              <option value="posted">Posted</option>
                         </select>
                    </div>
               }
               >
                    <div className="row g-2 mb-3">
                    {tiles.map((tile) => (
                         <div className="col-6 col-md-3" key={tile.label}>
                              <div className="border rounded p-4">
                                   <h5 className="text-uppercase">{tile.label}</h5>
                                   <hr/>
                                   <div className={`fs-5 fw-bold ${tile.tone}`}>{tile.value}</div>
                              </div>
                         </div>
                    ))}
               </div>

               {(health?.deadLetter || 0) > 0 && (
                    <div className="alert alert-danger py-2">
                         Dead-letter rows have exhausted their retries and will not be picked up again. Fix the cause, then replay them.
                    </div>
               )}

               <PrimeTable
                    column={column}
                    data={rows}
                    filtering
                    serverSideFiltering
                    handleSeverSideProcessing={handleSeverSideProcessing}
               />
          </ReportShell>
     );
}
