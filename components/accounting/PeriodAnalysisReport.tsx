"use client";
import dayjs from "dayjs";
import { RiBarChartLine } from "@remixicon/react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import AccountingSummary from "./AccountingSummary";
import PrimeTable from "../accessories/Datatables/PrimeTable";
import ReportShell, { formatRange } from "./ReportShell";
import { currencyFormatter } from "../Auth/customFetch";
import DateFilterReusable from "../operations/Laboratory/ResuableFilter/DateFilterReusable";
import { accountingApi } from "../../lib/accounting/accountingApi";

interface Props {
     type: "revenue" | "expense";
     title: string;
     subtitle: string;
}

export default function PeriodAnalysisReport({ type, title, subtitle }: Props) {
     const currentYear = dayjs().year();
     const [from, setFrom] = useState(dayjs(`${currentYear}-01-01`).format("YYYY-MM-DD"));
     const [to, setTo] = useState(dayjs().format("YYYY-MM-DD"));
     const [dateFilter, setDateFilter] = useState("This Year");
     const [rows, setRows] = useState<any[]>([]);
     const [periods, setPeriods] = useState<string[]>([]);
     const [totals, setTotals] = useState<Record<string, number>>({});
     const [loading, setLoading] = useState(false);
     const latestRequest = useRef(0);

     const load = useCallback(async () => {
          const requestId = ++latestRequest.current;
          setLoading(true);
          try {
               const response =
                    type === "revenue"
                         ? await accountingApi.revenueAnalysis(from, to)
                         : await accountingApi.expenseAnalysis(from, to);

               const result = response?.result;
               if (requestId !== latestRequest.current) return;
               setPeriods(result?.periods || []);
               setTotals(result?.totals || {});
               setRows(
                    (result?.rows || []).map((row: any) => ({
                         ...row,
                         ...Object.fromEntries((result?.periods || []).map((period: string) => [period, row.periods[period] || 0])),
                    }))
               );
          } finally {
               if (requestId === latestRequest.current) setLoading(false);
          }
     }, [type, from, to]);

     useEffect(() => {
          load();
     }, [load]);

     const money = (value: number) => currencyFormatter.format(Number(value || 0));

     const column = [
          {
               Header: "Account",
               accessor: "accountCode",
               Cell: ({ row }: any) => (
                    <a className="text-decoration-none" href={`/accounting/general-ledger?accountCode=${row.original.accountCode}&from=${from}&to=${to}`}>
                         <span className="text-muted me-2">{row.original.accountCode}</span>
                         {row.original.accountName}
                    </a>
               ),
          },
          ...periods.map((period) => ({
               Header: dayjs(`${period}-01`).format("MMM YY"),
               accessor: period,
               Cell: ({ value }: any) => <span className="">{value ? money(value) : "-"}</span>,
          })),
          {
               Header: "Total",
               accessor: "total",
               Cell: ({ value }: any) => <span className=" fw-semibold">{money(value)}</span>,
          },
     ];

     return (
          <ReportShell
               title={title}
               subtitle={subtitle}
               reportTitle={title}
               range={formatRange(from, to)}
               filters={
                    <>
                         <div className="col-12 col-md-6">
                              <DateFilterReusable value={dateFilter} onChange={setDateFilter} onDateRangeChange={(start, end) => { setFrom(start); setTo(end); }} label="Period" className="w-100" />
                         </div>
                         {/* <div className="col-12 col-md-3">
                              <button className="btn btn-sm btn-primary w-100" onClick={load} disabled={loading}>
                                   {loading ? "Running..." : "Run report"}
                              </button>
                         </div> */}
                    </>
               }
          >
               <AccountingSummary
                    columnClassName="col-12 col-sm-6 col-xl-3"
                    metrics={[
                         { label: "Total for period", value: money(totals.total || 0), Icon: RiBarChartLine, variant: type === "revenue" ? "success" : "warning", subtitle: type === "revenue" ? "Revenue recognized in period" : "Expenses recorded in period" },
                    ]}
               />

               {loading && <div className="small text-muted mb-2" role="status">Updating report…</div>}
               <PrimeTable column={column} data={rows} filtering handleSeverSideProcessing={undefined} />
          </ReportShell>
     );
}
