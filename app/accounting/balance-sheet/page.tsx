"use client";
import { RiCheckboxCircleLine, RiErrorWarningLine } from "@remixicon/react";
import dayjs from "dayjs";
import React, { useCallback, useEffect, useRef, useState } from "react";
import ReportShell from "../../../components/accounting/ReportShell";
import { currencyFormatter } from "../../../components/Auth/customFetch";
import DateFilterReusable from "../../../components/operations/Laboratory/ResuableFilter/DateFilterReusable";
import { accountingApi, BalanceSheet, TrialBalanceRow } from "../../../lib/accounting/accountingApi";

function money(value: number): string {
     return currencyFormatter.format(Number(value || 0));
}

export default function BalanceSheetPage() {
     const [asOf, setAsOf] = useState(dayjs().format("YYYY-MM-DD"));
     const [dateFilter, setDateFilter] = useState("Today");
     const [sheet, setSheet] = useState<BalanceSheet | null>(null);
     const [loading, setLoading] = useState(true);
     const [error, setError] = useState<string | null>(null);
     const [loadedAsOf, setLoadedAsOf] = useState<string | null>(null);
     const latestRequest = useRef(0);

     const load = useCallback(async () => {
          const requestId = ++latestRequest.current;
          setLoading(true);
          setError(null);
          setSheet(null);
          setLoadedAsOf(null);
          try {
               const response = await accountingApi.balanceSheet(asOf);
               if (requestId !== latestRequest.current) return;
               if (response?.status !== "success" || !response.result?.totals ||
                    !["assets","liabilities","equity"].every(key => Array.isArray(response.result[key as "assets" | "liabilities" | "equity"])) ||
                    !["assets","liabilities","equity","retainedProfit","liabilitiesAndEquity","difference"].every(key => {
                         const value = response.result.totals[key as keyof BalanceSheet["totals"]];
                         return typeof value === "number" && Number.isFinite(value);
                    })) throw new Error(response?.message || "The balance sheet is unavailable or incomplete.");
               setSheet(response.result);
               setLoadedAsOf(asOf);
          } catch (err) {
               if (requestId === latestRequest.current) setError(err instanceof Error ? err.message : "Unable to load the balance sheet");
          } finally {
               if (requestId === latestRequest.current) setLoading(false);
          }
     }, [asOf]);

     useEffect(() => {
          void load();
          return () => { latestRequest.current++; };
     }, [load]);

     const totals = sheet?.totals;
     const ready = !!sheet && !loading && !error && loadedAsOf === asOf;
     const outOfBalance = !!totals && (Math.round(totals.difference * 100) !== 0 ||
          Math.round(totals.assets * 100) !== Math.round(totals.liabilitiesAndEquity * 100));

     const assets = (sheet?.assets || []).filter((row) => row.balance !== 0);
     const liabilities = (sheet?.liabilities || []).filter((row) => row.balance !== 0);
     const equity = (sheet?.equity || []).filter((row) => row.balance !== 0);

     const currentAssets = assets.filter(row => row.statement_classification === "current");
     const nonCurrentAssets = assets.filter(row => row.statement_classification === "non_current");
     const otherAssets = assets.filter(row => !["current","non_current"].includes(row.statement_classification || ""));
     const nonCurrentLiabilities = liabilities.filter(row => row.statement_classification === "non_current");
     const currentLiabilities = liabilities.filter(row => row.statement_classification === "current");
     const otherLiabilities = liabilities.filter(row => !["current","non_current"].includes(row.statement_classification || ""));

     const line = (row: TrialBalanceRow) => {
          const isContra = row.type === "asset" && row.normal_balance === "credit";
          return (
               <tr key={row.account_code}>
                    <td className="ps-5">
                         {isContra ? "Less: " : ""}
                         {row.name}
                    </td>
                    <td className="text-end">{money(isContra ? -row.balance : row.balance)}</td>
               </tr>
          );
     };

     const group = (label: string, rows: TrialBalanceRow[]) => {
          if (rows.length === 0) return null;
          return (
               <>
                    <tr>
                         <td className="ps-4 fw-semibold pt-3">{label}</td>
                         <td />
                    </tr>
                    {rows.map(line)}
               </>
          );
     };

     const heading = (label: string) => (
          <tr className="table-secondary">
               <td colSpan={2} className="fw-bold text-uppercase" style={{ letterSpacing: "0.04em" }}>
                    {label}
               </td>
          </tr>
     );

     const total = (label: string, value: number, strong = false) => (
          <tr className={strong ? "table-light" : ""}>
               <td className={`fw-semibold ${strong ? "text-uppercase" : "ps-4"}`}>{label}</td>
               <td className="text-end fw-semibold border-top">{money(value)}</td>
          </tr>
     );

     const totalAssets = totals?.assets || 0;
     const totalLiabilities = totals?.liabilities || 0;
     const totalEquity = (totals?.equity || 0) + (totals?.retainedProfit || 0);

     return (
          <ReportShell basis="accrual"
               exportable={ready}
               title="Balance Sheet"
               subtitle="Assets against liabilities and equity, classified into current and non-current"
               reportTitle="BALANCE SHEET"
               range={`As at ${dayjs(asOf).format("D MMMM YYYY")}`}
               filters={
                    <>
                         <div className="col-12 col-md-6">
                              <DateFilterReusable
                                   value={dateFilter}
                                   onChange={setDateFilter}
                                   onDateRangeChange={(_start: string, end: string) => setAsOf(end || _start)}
                                   label="As at"
                                   className="w-100"
                              />
                         </div>

                    </>
               }
          >
               {error && <div role="alert" className="alert alert-danger py-2">{error}<button type="button" className="btn btn-sm btn-outline-danger ms-3" onClick={load}>Retry balance sheet</button></div>}
               {!ready && !error && <p role="status">Loading balance sheet for the selected date...</p>}
               {ready && <>
               {(otherAssets.length > 0 || otherLiabilities.length > 0) && <p role="alert" className="alert alert-warning">Some accounts have no current/non-current classification. They are shown as unclassified, not inferred from their account numbers.</p>}
               <div className={`alert d-flex align-items-center gap-2 py-4 ${outOfBalance ? "alert-danger alert-danger-subtle" : "alert-success alert-success-subtle"}`}>
                    {outOfBalance ? <RiErrorWarningLine size={18} /> : <RiCheckboxCircleLine size={18} />}
                    <span>
                         <strong>Balance check: {outOfBalance ? "FAIL" : "PASS"}</strong>
                         <span className="ms-2">
                              Assets {money(totalAssets)} = Liabilities + Equity {money(totals?.liabilitiesAndEquity || 0)}
                         </span>
                         {outOfBalance && <strong className="ms-2">difference {money(totals?.difference || 0)}</strong>}
                    </span>
               </div>

               <div className="table-responsive">
                    <table className="table align-middle mb-0">
                         <tbody>
                              {heading("Assets")}
                              {group("Current Assets", currentAssets)}
                              {group("Non-current Assets", nonCurrentAssets)}
                              {group("Unclassified Assets", otherAssets)}
                              {total("Total Assets", totalAssets, true)}

                              {heading("Liabilities")}
                              {group("Current Liabilities", currentLiabilities)}
                              {group("Non-current Liabilities", nonCurrentLiabilities)}
                              {group("Unclassified Liabilities", otherLiabilities)}
                              {total("Total Liabilities", totalLiabilities, true)}

                              {heading("Equity")}
                              {equity.map(line)}
                              <tr>
                                   <td className="ps-5">Current Year Profit</td>
                                   <td className={`text-end ${(totals?.retainedProfit || 0) < 0 ? "text-danger" : ""}`}>
                                        {money(totals?.retainedProfit || 0)}
                                   </td>
                              </tr>
                              {total("Total Equity", totalEquity, true)}

                              <tr className="table-light">
                                   <td className="fw-bold text-uppercase">Total Liabilities + Equity</td>
                                   <td className="text-end fw-bold border-top border-dark">
                                        {money(totals?.liabilitiesAndEquity || 0)}
                                   </td>
                              </tr>
                         </tbody>
                    </table>
               </div>

               <p className="text-muted small mt-3 mb-0">
                    Current Year Profit is income less expenses for the period and sits in equity until the year-end close moves
                    it into retained earnings.
               </p>
               </>}
          </ReportShell>
     );
}
