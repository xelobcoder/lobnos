"use client";
import dayjs from "dayjs";
import React, { useCallback, useEffect, useState } from "react";
import { currencyFormatter } from "../../../components/Auth/customFetch";
import DateFilterReusable from "../../../components/operations/Laboratory/ResuableFilter/DateFilterReusable";
import { accountingApi, IncomeStatement, TrialBalanceRow } from "../../../lib/accounting/accountingApi";

function Section({ title, rows, total }: { title: string; rows: TrialBalanceRow[]; total: number }) {
     return (
          <>
               <tr className="table-secondary">
                    <td colSpan={2} className="fw-semibold">{title}</td>
               </tr>
               {rows.length === 0 && (
                    <tr>
                         <td colSpan={2} className="text-muted small">None</td>
                    </tr>
               )}
               {rows.map((row) => (
                    <tr key={row.account_code}>
                         <td className="ps-4">
                              <span className="text-muted me-2">{row.account_code}</span>
                              {row.name}
                         </td>
                         <td className="text-end">{currencyFormatter.format(row.balance)}</td>
                    </tr>
               ))}
               <tr>
                    <td className="fw-semibold">Total {title.toLowerCase()}</td>
                    <td className="text-end fw-semibold">{currencyFormatter.format(total)}</td>
               </tr>
          </>
     );
}

export default function IncomeStatementPage() {
     const currentYear = dayjs().year();
     const [from, setFrom] = useState(dayjs(`${currentYear}-01-01`).format("YYYY-MM-DD"));
     const [to, setTo] = useState(dayjs().format("YYYY-MM-DD"));
     const [dateFilter, setDateFilter] = useState("This Year");
     const [statement, setStatement] = useState<IncomeStatement | null>(null);
     const [loading, setLoading] = useState(false);
     const [error, setError] = useState<string | null>(null);

     const load = useCallback(async () => {
          setLoading(true);
          setError(null);
          try {
               const response = await accountingApi.incomeStatement(from, to);
               if (response?.result) setStatement(response.result);
               else setError(response?.message || "Unable to load the profit and loss");
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

     return (
          <div className="container-fluid py-4">
               <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-4">
                    <div>
                         <h4 className="mb-0">Profit &amp; Loss</h4>
                         <small className="text-muted">Revenue less cost of sales and operating expenses</small>
                    </div>
                    <div style={{ minWidth: "220px" }}>
                         <DateFilterReusable
                              value={dateFilter}
                              onChange={setDateFilter}
                              onDateRangeChange={(start, end) => { setFrom(start); setTo(end); }}
                              label="Period"
                              className="w-100"
                              disabled={loading}
                         />
                    </div>
               </div>

               {error && <div className="alert alert-danger">{error}</div>}

               <div className="row g-3 mb-4">
                    <div className="col-12 col-md-4">
                         <div className="card shadow-sm">
                              <div className="card-body py-3">
                                   <div className="small text-muted">Gross Profit</div>
                                   <div className="fs-5 fw-semibold">{currencyFormatter.format(totals?.grossProfit || 0)}</div>
                              </div>
                         </div>
                    </div>
                    <div className="col-12 col-md-4">
                         <div className="card shadow-sm">
                              <div className="card-body py-3">
                                   <div className="small text-muted">Operating Expenses</div>
                                   <div className="fs-5 fw-semibold">{currencyFormatter.format(totals?.operatingExpenses || 0)}</div>
                              </div>
                         </div>
                    </div>
                    <div className="col-12 col-md-4">
                         <div className="card shadow-sm">
                              <div className="card-body py-3">
                                   <div className="small text-muted">Net Profit</div>
                                   <div className={`fs-5 fw-semibold ${(totals?.netProfit || 0) < 0 ? "text-danger" : "text-success"}`}>
                                        {currencyFormatter.format(totals?.netProfit || 0)}
                                   </div>
                              </div>
                         </div>
                    </div>
               </div>

               <div className="card shadow-sm">
                    <div className="table-responsive">
                         <table className="table align-middle mb-0">
                              <tbody>
                                   <Section title="Revenue" rows={statement?.revenue || []} total={totals?.revenue || 0} />
                                   <Section title="Cost of Sales" rows={statement?.costOfSales || []} total={totals?.costOfSales || 0} />
                                   <tr className="table-light">
                                        <td className="fw-semibold">Gross Profit</td>
                                        <td className="text-end fw-semibold">{currencyFormatter.format(totals?.grossProfit || 0)}</td>
                                   </tr>
                                   <Section title="Operating Expenses" rows={statement?.operatingExpenses || []} total={totals?.operatingExpenses || 0} />
                                   <tr className="table-light">
                                        <td className="fw-semibold">Net Profit</td>
                                        <td className={`text-end fw-semibold ${(totals?.netProfit || 0) < 0 ? "text-danger" : ""}`}>
                                             {currencyFormatter.format(totals?.netProfit || 0)}
                                        </td>
                                   </tr>
                              </tbody>
                         </table>
                    </div>
               </div>
          </div>
     );
}
