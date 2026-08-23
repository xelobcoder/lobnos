"use client";
import dayjs from "dayjs";
import React, { useCallback, useEffect, useState } from "react";
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

     const load = useCallback(async () => {
          setLoading(true);
          try {
               const response =
                    type === "revenue"
                         ? await accountingApi.revenueAnalysis(from, to)
                         : await accountingApi.expenseAnalysis(from, to);

               const result = response?.result;
               setPeriods(result?.periods || []);
               setTotals(result?.totals || {});
               setRows(
                    (result?.rows || []).map((row: any) => ({
                         ...row,
                         ...Object.fromEntries((result?.periods || []).map((period: string) => [period, row.periods[period] || 0])),
                    }))
               );
          } finally {
               setLoading(false);
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
               Cell: ({ value }: any) => <span className="d-block text-end">{value ? money(value) : "-"}</span>,
          })),
          {
               Header: "Total",
               accessor: "total",
               Cell: ({ value }: any) => <span className="d-block text-end fw-semibold">{money(value)}</span>,
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
                              <DateFilterReusable value={dateFilter} onChange={setDateFilter} onDateRangeChange={(start, end) => { setFrom(start); setTo(end); }} label="Period" className="w-100" disabled={loading} />
                         </div>
                         <div className="col-12 col-md-3">
                              <button className="btn btn-sm btn-primary w-100" onClick={load} disabled={loading}>
                                   {loading ? "Running..." : "Run report"}
                              </button>
                         </div>
                    </>
               }
          >
               <div className="d-flex justify-content-end mb-2">
                    <div className="border rounded p-2 text-end">
                         <div className="small text-muted">Total for period</div>
                         <div className="fs-5 fw-semibold">{money(totals.total || 0)}</div>
                    </div>
               </div>

               <PrimeTable column={column} data={rows} filtering isExpoerted handleSeverSideProcessing={undefined} />
          </ReportShell>
     );
}
