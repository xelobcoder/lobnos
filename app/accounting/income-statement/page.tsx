"use client";
import dayjs from "dayjs";
import {useSearchParams} from "next/navigation";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { RiBarChartLine, RiMoneyDollarCircleLine, RiRefund2Line, RiWalletLine } from "@remixicon/react";
import AccountingSummary from "../../../components/accounting/AccountingSummary";
import ReportShell, { formatRange } from "../../../components/accounting/ReportShell";
import { currencyFormatter } from "../../../components/Auth/customFetch";
import DateFilterReusable from "../../../components/operations/Laboratory/ResuableFilter/DateFilterReusable";
import { accountingApi, IncomeStatement, TrialBalanceRow } from "../../../lib/accounting/accountingApi";

function money(value: number): string {
     return currencyFormatter.format(Number(value || 0));
}

export default function IncomeStatementPage() {
     const searchParams=useSearchParams();
     const currentYear = dayjs().year();
     const [from, setFrom] = useState(searchParams.get("from")||dayjs(`${currentYear}-01-01`).format("YYYY-MM-DD"));
     const [to, setTo] = useState(searchParams.get("to")||dayjs().format("YYYY-MM-DD"));
     const [dateFilter, setDateFilter] = useState(searchParams.get("from")?"Custom Range":"This Year");
     const [statement, setStatement] = useState<IncomeStatement | null>(null);
     const [loading, setLoading] = useState(true);
     const [error, setError] = useState<string | null>(null);
     const [loadedRange, setLoadedRange] = useState({ from, to });
     const latestRequest = useRef(0);

     const load = useCallback(async () => {
          const requestId = ++latestRequest.current;
          setLoading(true);
          setError(null);
          setStatement(null);
          try {
               const response = await accountingApi.incomeStatement(from, to);
               if (requestId !== latestRequest.current) return;
               if (response?.status === "success" && response.result?.totals &&
                    ["revenue","costOfSales","operatingExpenses"].every(key => Array.isArray(response.result[key as "revenue" | "costOfSales" | "operatingExpenses"])) &&
                    ["revenue","costOfSales","grossProfit","operatingExpenses","netProfit"].every(key =>
                         typeof response.result.totals[key as keyof IncomeStatement["totals"]] === "number" &&
                         Number.isFinite(response.result.totals[key as keyof IncomeStatement["totals"]]))) {
                    setStatement(response.result);
                    setLoadedRange({ from, to });
               } else {
                    setError(response?.message || "Unable to load the profit and loss");
               }
          } catch (err) {
               if (requestId === latestRequest.current) setError(err instanceof Error ? err.message : "Unable to load the profit and loss");
          } finally {
               if (requestId === latestRequest.current) setLoading(false);
          }
     }, [from, to]);

     useEffect(() => {
          void load();
          return () => { latestRequest.current++; };
     }, [load]);

     const totals = statement?.totals;
     const ready = !!statement && !loading && !error && loadedRange.from === from && loadedRange.to === to;

     const section = (label: string, rows: TrialBalanceRow[], total: number) => (
          <>
               <tr className="table-secondary">
                    <td colSpan={2} className="fw-bold text-uppercase" style={{ letterSpacing: "0.04em" }}>
                         {label}
                    </td>
               </tr>
               {rows.length === 0 && (
                    <tr>
                         <td className="ps-4 text-muted small">None</td>
                         <td />
                    </tr>
               )}
               {rows.map((row) => (
                    <tr key={row.account_code}>
                         <td className="ps-4">
                              <a className="text-decoration-none" href={`/accounting/general-ledger?accountCode=${row.account_code}&from=${from}&to=${to}`}>
                                   <span className="text-muted me-2">{row.account_code}</span>
                                   {row.name}
                              </a>
                         </td>
                         <td className="text-end">{money(row.balance)}</td>
                    </tr>
               ))}
               <tr>
                    <td className="ps-4 fw-semibold">Total {label.toLowerCase()}</td>
                    <td className="text-end fw-semibold border-top">{money(total)}</td>
               </tr>
          </>
     );

     return (
          <ReportShell basis="accrual"
               exportable={ready}
               title="Profit &amp; Loss"
               subtitle="Revenue less cost of sales and operating expenses"
               reportTitle="PROFIT &amp; LOSS"
               range={formatRange(loadedRange.from, loadedRange.to)}
               filters={
                    <>
                         <div className="col-12 col-md-5">
                              <label className="form-label mb-1 small text-muted">Period</label>
                              <DateFilterReusable
                                   value={dateFilter}
                                   onChange={setDateFilter}
                                   onDateRangeChange={(start, end) => {
                                        if (start) setFrom(start);
                                        if (end) setTo(end);
                                   }}
                                   label="Period"
                                   className="w-100"
                              />
                         </div>

                    </>
               }
          >
               {error && <div role="alert" className="alert alert-danger py-2">{error}<button type="button" className="btn btn-sm btn-outline-danger ms-3" onClick={load}>Retry profit and loss</button></div>}
               {!ready && !error && <p role="status">Loading profit and loss for the selected period...</p>}
               {ready && <>
               <AccountingSummary
                    rowClassName="row g-2 mb-3"
                    columnClassName="col-6 col-md-3"
                    metrics={[
                         { label: "Total Revenue", value: money(totals?.revenue || 0), Icon: RiMoneyDollarCircleLine, variant: "primary", subtitle: "Income recognized" },
                         { label: "Gross Profit", value: money(totals?.grossProfit || 0), Icon: RiBarChartLine, variant: "success", subtitle: "Revenue less cost of sales" },
                         { label: "Operating Expenses", value: money(totals?.operatingExpenses || 0), Icon: RiWalletLine, variant: "warning", subtitle: "Operating costs" },
                         { label: "Net Profit", value: money(totals?.netProfit || 0), Icon: RiRefund2Line, variant: (totals?.netProfit || 0) < 0 ? "danger" : "info", subtitle: "After costs and expenses" },
                    ]}
               />

               <div className="table-responsive">
                    <table className="table align-middle mb-0">
                         <tbody>
                              {section("Revenue", statement?.revenue || [], totals?.revenue || 0)}
                              {section("Cost of Sales", statement?.costOfSales || [], totals?.costOfSales || 0)}
                              <tr className="table-light">
                                   <td className="fw-bold text-uppercase">Gross Profit</td>
                                   <td className="text-end fw-bold border-top">{money(totals?.grossProfit || 0)}</td>
                              </tr>
                              {section("Operating Expenses", statement?.operatingExpenses || [], totals?.operatingExpenses || 0)}
                              <tr className="table-light">
                                   <td className="fw-bold text-uppercase">Net Profit</td>
                                   <td className={`text-end fw-bold border-top border-dark ${(totals?.netProfit || 0) < 0 ? "text-danger" : ""}`}>
                                        {money(totals?.netProfit || 0)}
                                   </td>
                              </tr>
                         </tbody>
                    </table>
               </div>
               </>}
          </ReportShell>
     );
}
