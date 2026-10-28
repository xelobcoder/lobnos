"use client";
import { RiAddLine } from "@remixicon/react";
import dayjs from "dayjs";
import Link from "next/link";
import React, { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import PrimeTable from "../../../components/accounting/AccountingTable";
import ReportShell from "../../../components/accounting/ReportShell";
import { useApplication } from "../../../components/Auth/useApplicationContext";
import { accountingApi, ManualJournalStatus } from "../../../lib/accounting/accountingApi";

const STATUS_STYLES: Record<ManualJournalStatus, string> = {
     draft: "bg-light text-dark",
     submitted: "bg-info text-dark",
     approved: "bg-primary",
     posted: "bg-success",
     void: "bg-secondary",
};

export default function ManualJournalsPage() {
     const employeeid = useApplication()?.user?.employeeid;
     const [status, setStatus] = useState<ManualJournalStatus | "">("");
     const [rows, setRows] = useState<any[]>([]);
     const [busy, setBusy] = useState<number | null>(null);

     const handleSeverSideProcessing = useCallback(
          async ({ page, count }: { page: number; count: number }) => {
               const response = await accountingApi.manualJournals({
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

     useEffect(() => {
          handleSeverSideProcessing({ page: 1, count: 25 });
     }, [handleSeverSideProcessing]);

     const act = async (id: number, action: "submit" | "approve" | "post" | "void") => {
          if (!employeeid) {
               toast.error("Your employee id is missing from the session");
               return;
          }

          setBusy(id);
          try {
               const call = {
                    submit: () => accountingApi.submitManualJournal(id, employeeid),
                    approve: () => accountingApi.approveManualJournal(id, employeeid),
                    post: () => accountingApi.postManualJournal(id, employeeid),
                    void: () => accountingApi.voidManualJournal(id, employeeid),
               }[action];

               const response: any = await call();
               if (response?.status === "error") toast.error(response?.message || `Unable to ${action} the journal`);
               else {
                    toast.success(`Journal ${action === "void" ? "voided" : `${action}ed`}`);
                    await handleSeverSideProcessing({ page: 1, count: 25 });
               }
          } catch (error: any) {
               toast.error(error?.message || `Unable to ${action} the journal`);
          } finally {
               setBusy(null);
          }
     };

     const column = [
          { Header: "Journal", accessor: "journal_no", Cell: ({ value }: any) => <span className="fw-semibold">{value}</span> },
          {
               Header: "Date",
               accessor: "journal_date",
               Cell: ({ value }: any) => <span className="text-nowrap">{dayjs(value).format("DD MMM YYYY")}</span>,
          },
          { Header: "Description", accessor: "description" },
          { Header: "Reference", accessor: "reference", Cell: ({ value }: any) => value || "-" },
          {
               Header: "Status",
               accessor: "status",
               Cell: ({ value }: any) => <span className={`badge ${STATUS_STYLES[value as ManualJournalStatus]}`}>{value}</span>,
          },
          {
               Header: "Actions",
               accessor: "id",
               Cell: ({ row }: any) => {
                    const journal = row.original;
                    return (
                         <div className="btn-group btn-group-sm">
                              {journal.status === "draft" && (
                                   <button className="btn btn-outline-primary" disabled={busy === journal.id} onClick={() => act(journal.id, "submit")}>
                                        Submit
                                   </button>
                              )}
                              {journal.status === "submitted" && (
                                   <button className="btn btn-outline-primary" disabled={busy === journal.id} onClick={() => act(journal.id, "approve")}>
                                        Approve
                                   </button>
                              )}
                              {journal.status === "approved" && (
                                   <button className="btn btn-outline-success" disabled={busy === journal.id} onClick={() => act(journal.id, "post")}>
                                        Post
                                   </button>
                              )}
                              {journal.status !== "posted" && journal.status !== "void" && (
                                   <button className="btn btn-outline-secondary" disabled={busy === journal.id} onClick={() => act(journal.id, "void")}>
                                        Void
                                   </button>
                              )}
                              {journal.status === "posted" && <span className="text-muted small">Immutable</span>}
                         </div>
                    );
               },
          },
     ];

     return (
          <ReportShell
               title="Journal Entries"
               subtitle="A journal must be approved by someone other than the person who submitted it."
               actions={
                    <Link href="/accounting/manual-journals/new" className="btn btn-sm btn-primary d-inline-flex align-items-center gap-1">
                         <RiAddLine size={16} /> New journal
                    </Link>
               }
               filters={
                    <div className="col-6 col-md-3">
                         <label className="form-label mb-1 small text-muted">Status</label>
                         <select
                              className="form-select form-select-sm"
                              value={status}
                              onChange={(event) => setStatus(event.target.value as ManualJournalStatus | "")}
                         >
                              <option value="">All statuses</option>
                              <option value="draft">Draft</option>
                              <option value="submitted">Submitted</option>
                              <option value="approved">Approved</option>
                              <option value="posted">Posted</option>
                              <option value="void">Void</option>
                         </select>
                    </div>
               }
          >
               <PrimeTable
                    column={column}
                    data={rows}
                    filtering
                    isExpoerted
                    serverSideFiltering
                    handleSeverSideProcessing={handleSeverSideProcessing}
               />
          </ReportShell>
     );
}
