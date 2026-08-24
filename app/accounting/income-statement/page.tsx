"use client";
import dayjs from "dayjs";
import React, { useCallback, useEffect, useState } from "react";
import ReportShell, { formatRange } from "../../../components/accounting/ReportShell";
import { currencyFormatter } from "../../../components/Auth/customFetch";
import DateFilterReusable from "../../../components/operations/Laboratory/ResuableFilter/DateFilterReusable";
import { accountingApi, IncomeStatement, TrialBalanceRow } from "../../../lib/accounting/accountingApi";

function money(value: number): string {
     return currencyFormatter.format(Number(value || 0));
}

export default function IncomeStatementPage() {
     const currentYear = dayjs().year();
     const [from, setFrom] = useState(dayjs(`${currentYear}-01-01`).format("YYYY-MM-DD"));
     const [to, setTo] = useState(dayjs().format("YYYY-MM-DD"));
     const [dateFilter, setDateFilter] = useState("This Year");
     const [statement, setStatement] = useState<IncomeStatement | null>(null);
     const [loading, setLoading] = useState(false);
     const [error, setError] = useState<string | null>(null);
     const [loadedRange, setLoadedRange] = useState({ from, to });

     const load = useCallback(async () => {
          setLoading(true);
          setError(null);
          try {
               const response = await accountingApi.incomeStatement(from, to);
               if (response?.result) {
                    setStatement(response.result);
                    setLoadedRange({ from, to });
               } else {
                    setError(response?.message || "Unable to load the profit and loss");
               }
          } catch (err: any) {
               setError(err?.message || "Unable to load the profit and loss");
          } finally {
               setLoading(false);
          }
     }, [from, to]);

     useEffect(() => {
          load();
     }, [load]);

     const totals = statement?.totals;

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
          <ReportShell
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
               {error && <div className="alert alert-danger py-2">{error}</div>}

               <div className="row g-2 mb-3">
                    <div className="col-6 col-md-3">
                         <div className="border rounded p-4">
                              <h4 >Total Revenue</h4>
                              <hr />
                              <h3 className=" fw-bold">{money(totals?.revenue || 0)}</h3>
                         </div>
                    </div>
                    <div className="col-6 col-md-3">
                         <div className="border rounded p-4">
                              <h4>Gross Profit</h4>
                              <hr />
                              <h3 className=" fw-bold">{money(totals?.grossProfit || 0)}</h3>
                         </div>
                    </div>
                    <div className="col-6 col-md-3">
                         <div className="border rounded p-4">
                              <h4>Operating Expenses</h4>
                              <hr />
                              <h3 className=" fw-bold">{money(totals?.operatingExpenses || 0)}</h3>
                         </div>
                    </div>
                    <div className="col-6 col-md-3">
                         <div className="border rounded p-4">
                              <h4>Net Profit</h4>
                              <hr />
                              <h3 className={` fw-bold ${(totals?.netProfit || 0) < 0 ? "text-danger" : "text-success"}`}>
                                   {money(totals?.netProfit || 0)}
                              </h3>
                         </div>
                    </div>
               </div>

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
          </ReportShell>
     );
}
