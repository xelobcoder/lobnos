"use client";
import { RiCheckboxCircleLine, RiErrorWarningLine } from "@remixicon/react";
import dayjs from "dayjs";
import React, { useCallback, useEffect, useState } from "react";
import PrimeTable from "../../../components/accessories/Datatables/PrimeTable";
import ReportShell, { formatRange } from "../../../components/accounting/ReportShell";
import { currencyFormatter } from "../../../components/Auth/customFetch";
import DateFilterReusable from "../../../components/operations/Laboratory/ResuableFilter/DateFilterReusable";
import { accountingApi, TrialBalanceRow } from "../../../lib/accounting/accountingApi";

const TYPE_LABELS: Record<string, string> = {
     asset: "Assets",
     liability: "Liabilities",
     equity: "Equity",
     revenue: "Income",
     expense: "Expenses",
};

export default function TrialBalancePage() {
     const currentYear = dayjs().year();
     const [from, setFrom] = useState(dayjs(`${currentYear}-01-01`).format("YYYY-MM-DD"));
     const [to, setTo] = useState(dayjs().format("YYYY-MM-DD"));
     const [dateFilter, setDateFilter] = useState("This Year");
     const [rows, setRows] = useState<TrialBalanceRow[]>([]);
     const [totals, setTotals] = useState({ debits: 0, credits: 0, balanced: true });
     const [loading, setLoading] = useState(false);

     const load = useCallback(async () => {
          setLoading(true);
          try {
               const response = await accountingApi.trialBalance(from, to);
               setRows((response?.result?.rows || []).filter((row) => row.debits !== 0 || row.credits !== 0));
               setTotals(response?.result?.totals || { debits: 0, credits: 0, balanced: true });
          } finally {
               setLoading(false);
          }
     }, [from, to]);

     useEffect(() => {
          load();
     }, [load]);

     const column = [
          {
               Header: "Account",
               accessor: "account_code",
               Cell: ({ row }: any) => (
                    <a
                         className="text-decoration-none"
                         href={`/accounting/general-ledger?accountCode=${row.original.account_code}&from=${from}&to=${to}`}
                    >
                         <span className="text-muted me-2">{row.original.account_code}</span>
                         {row.original.name}
                    </a>
               ),
          },
          {
               Header: "Type",
               accessor: "type",
               Cell: ({ value }: any) => <span className="badge bg-light text-dark">{TYPE_LABELS[value] || value}</span>,
          },
          {
               Header: "Debit",
               accessor: "debits",
               Cell: ({ value }: any) => (
                    <span className="d-block text-end">{value ? currencyFormatter.format(Number(value)) : "-"}</span>
               ),
          },
          {
               Header: "Credit",
               accessor: "credits",
               Cell: ({ value }: any) => (
                    <span className="d-block text-end">{value ? currencyFormatter.format(Number(value)) : "-"}</span>
               ),
          },
          {
               Header: "Balance",
               accessor: "balance",
               Cell: ({ value }: any) => (
                    <span className={`d-block text-end fw-semibold ${Number(value) < 0 ? "text-danger" : ""}`}>
                         {currencyFormatter.format(Number(value))}
                    </span>
               ),
          },
     ];

     return (
          <ReportShell
               title="Trial Balance"
               subtitle="Every account with its debit and credit movement for the period"
               reportTitle="Trial Balance"
               range={formatRange(from, to)}
               filters={
                    <>
                         <div className="col-12 col-md-6">
                              <DateFilterReusable
                                   value={dateFilter}
                                   onChange={setDateFilter}
                                   onDateRangeChange={(start, end) => { setFrom(start); setTo(end); }}
                                   label="Period"
                                   className="w-100"
                                   disabled={loading}
                              />
                         </div>
                         <div className="col-12 col-md-3">
                              <button className="btn btn-sm btn-primary w-100" onClick={load} disabled={loading}>
                                   {loading ? "Running..." : "Run report"}
                              </button>
                         </div>
                    </>
               }
          >
               <div className={`alert d-flex align-items-center gap-2 py-2 ${totals.balanced ? "alert-success" : "alert-danger"}`}>
                    {totals.balanced ? <RiCheckboxCircleLine size={18} /> : <RiErrorWarningLine size={18} />}
                    <span>
                         {totals.balanced ? "Debits = Credits" : "Debits do not equal credits - check Posting Exceptions"}
                         <strong className="ms-2">
                              {currencyFormatter.format(totals.debits)} / {currencyFormatter.format(totals.credits)}
                         </strong>
                    </span>
               </div>

               <PrimeTable column={column} data={rows} filtering isExpoerted handleSeverSideProcessing={undefined} />
          </ReportShell>
     );
}
