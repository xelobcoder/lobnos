"use client";
import { RiLockLine, RiLockUnlockLine } from "@remixicon/react";
import dayjs from "dayjs";
import React, { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import PrimeTable from "../../../components/accessories/Datatables/PrimeTable";
import ReportShell from "../../../components/accounting/ReportShell";
import { currencyFormatter } from "../../../components/Auth/customFetch";
import { useApplication } from "../../../components/Auth/useApplicationContext";
import { accountingApi, AccountingPeriod, PeriodStatus } from "../../../lib/accounting/accountingApi";

const STATUS_STYLES: Record<PeriodStatus, string> = {
     open: "bg-success",
     soft_closed: "bg-warning text-dark",
     closed: "bg-secondary",
     locked: "bg-dark",
};

export default function AccountingPeriodsPage() {
     const employeeid = useApplication()?.user?.employeeid;
     const [rows, setRows] = useState<any[]>([]);
     const [loading, setLoading] = useState(false);
     const [busy, setBusy] = useState<string | null>(null);

     const load = useCallback(async () => {
          setLoading(true);
          try {
               const response = await accountingApi.periods();
               const periods: AccountingPeriod[] = response?.result || [];

               const withTotals = await Promise.all(
                    periods.map(async (period) => {
                         const totals = await accountingApi.periodTotals(period.period_code);
                         return {
                              ...period,
                              debits: totals?.result?.debits || 0,
                              credits: totals?.result?.credits || 0,
                              entries: totals?.result?.entries || 0,
                         };
                    })
               );

               setRows(withTotals);
          } catch (error: any) {
               toast.error(error?.message || "Unable to load accounting periods");
          } finally {
               setLoading(false);
          }
     }, []);

     useEffect(() => {
          load();
     }, [load]);

     const changeStatus = async (periodCode: string, status: PeriodStatus) => {
          if (!employeeid) {
               toast.error("Your employee id is missing from the session");
               return;
          }

          setBusy(periodCode);
          try {
               const response: any = await accountingApi.setPeriodStatus(periodCode, status, employeeid);
               if (response?.status === "error") toast.error(response?.message || "Unable to change the period status");
               else {
                    toast.success(`${periodCode} is now ${status.replace("_", " ")}`);
                    await load();
               }
          } catch (error: any) {
               toast.error(error?.message || "Unable to change the period status");
          } finally {
               setBusy(null);
          }
     };

     const money = (value: number) => currencyFormatter.format(Number(value || 0));

     const column = [
          { Header: "Period", accessor: "period_code", Cell: ({ value }: any) => <span className="fw-semibold">{value}</span> },
          {
               Header: "Range",
               accessor: "period_start",
               Cell: ({ row }: any) => (
                    <span className="text-muted small text-nowrap">
                         {dayjs(row.original.period_start).format("DD MMM")} - {dayjs(row.original.period_end).format("DD MMM YYYY")}
                    </span>
               ),
          },
          {
               Header: "Status",
               accessor: "status",
               Cell: ({ value }: any) => <span className={`badge ${STATUS_STYLES[value as PeriodStatus]}`}>{String(value).replace("_", " ")}</span>,
          },
          { Header: "Entries", accessor: "entries", Cell: ({ value }: any) => <span className="d-block text-end">{value}</span> },
          { Header: "Debits", accessor: "debits", Cell: ({ value }: any) => <span className="d-block text-end">{money(value)}</span> },
          {
               Header: "Credits",
               accessor: "credits",
               Cell: ({ row }: any) => {
                    const unbalanced = Math.abs(Number(row.original.debits) - Number(row.original.credits)) > 0.01;
                    return <span className={`d-block text-end ${unbalanced ? "text-danger fw-semibold" : ""}`}>{money(row.original.credits)}</span>;
               },
          },
          {
               Header: "Actions",
               accessor: "id",
               Cell: ({ row }: any) => {
                    const period = row.original as AccountingPeriod;
                    return (
                         <div className="btn-group btn-group-sm">
                              {period.status !== "open" && (
                                   <button className="btn btn-outline-success" disabled={busy === period.period_code} onClick={() => changeStatus(period.period_code, "open")}>
                                        <RiLockUnlockLine size={14} /> Reopen
                                   </button>
                              )}
                              {period.status === "open" && (
                                   <button className="btn btn-outline-warning" disabled={busy === period.period_code} onClick={() => changeStatus(period.period_code, "soft_closed")}>
                                        Soft close
                                   </button>
                              )}
                              {period.status !== "closed" && period.status !== "locked" && (
                                   <button className="btn btn-outline-secondary" disabled={busy === period.period_code} onClick={() => changeStatus(period.period_code, "closed")}>
                                        Close
                                   </button>
                              )}
                              {period.status === "closed" && (
                                   <button className="btn btn-outline-dark" disabled={busy === period.period_code} onClick={() => changeStatus(period.period_code, "locked")}>
                                        <RiLockLine size={14} /> Lock
                                   </button>
                              )}
                         </div>
                    );
               },
          },
     ];

     return (
          <ReportShell
               title="Accounting Periods"
               subtitle="Closing a period stops new postings landing in it. A period only closes when its debits equal its credits."
          >
               {loading && <div className="text-muted small mb-2">Loading periods...</div>}
               <PrimeTable column={column} data={rows} filtering isExpoerted handleSeverSideProcessing={undefined} />
          </ReportShell>
     );
}
