"use client";
import dayjs from "dayjs";
import React, { useCallback, useEffect, useState } from "react";
import PrimeTable from "../../../../components/accessories/Datatables/PrimeTable";
import ReportShell, { formatRange } from "../../../../components/accounting/ReportShell";
import { currencyFormatter } from "../../../../components/Auth/customFetch";
import DateFilterReusable from "../../../../components/operations/Laboratory/ResuableFilter/DateFilterReusable";
import { accountingApi } from "../../../../lib/accounting/accountingApi";

export default function BranchPerformancePage() {
     const currentYear = dayjs().year();
     const [from, setFrom] = useState(dayjs(`${currentYear}-01-01`).format("YYYY-MM-DD"));
     const [to, setTo] = useState(dayjs().format("YYYY-MM-DD"));
     const [dateFilter, setDateFilter] = useState("This Year");
     const [rows, setRows] = useState<any[]>([]);
     const [loading, setLoading] = useState(false);

     const load = useCallback(async () => {
          setLoading(true);
          try {
               const response = await accountingApi.branchPerformance(from, to);
               setRows(response?.result || []);
          } finally {
               setLoading(false);
          }
     }, [from, to]);

     useEffect(() => {
          load();
     }, [load]);

     const money = (value: number) => currencyFormatter.format(Number(value || 0));

     const column = [
          {
               Header: "Branch",
               accessor: "branchid",
               Cell: ({ value }: any) => (value ? `Branch ${value}` : <span className="text-muted">Unassigned</span>),
          },
          { Header: "Revenue", accessor: "revenue", Cell: ({ value }: any) => <span className="d-block text-end">{money(value)}</span> },
          { Header: "Cost of Sales", accessor: "costOfSales", Cell: ({ value }: any) => <span className="d-block text-end">{money(value)}</span> },
          { Header: "Gross Profit", accessor: "grossProfit", Cell: ({ value }: any) => <span className="d-block text-end">{money(value)}</span> },
          {
               Header: "Operating Expenses",
               accessor: "operatingExpenses",
               Cell: ({ value }: any) => <span className="d-block text-end">{money(value)}</span>,
          },
          {
               Header: "Net Profit",
               accessor: "netProfit",
               Cell: ({ value }: any) => (
                    <span className={`d-block text-end fw-semibold ${Number(value) < 0 ? "text-danger" : "text-success"}`}>{money(value)}</span>
               ),
          },
     ];

     return (
          <ReportShell
               title="Branch Performance"
               subtitle="Revenue and cost by branch, from the branch dimension on journal lines"
               reportTitle="Branch Performance"
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
               <div className="alert alert-info py-2">
                    Supplier and inventory postings do not carry a branch yet, so their cost appears under Unassigned.
               </div>

               <PrimeTable column={column} data={rows} filtering isExpoerted handleSeverSideProcessing={undefined} />
          </ReportShell>
     );
}
