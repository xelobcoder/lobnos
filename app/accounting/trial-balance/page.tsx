"use client";
import { RiCheckboxCircleLine, RiErrorWarningLine } from "@remixicon/react";
import dayjs from "dayjs";
import React, { useCallback, useEffect, useState } from "react";
import ReportShell, { formatRange } from "../../../components/accounting/ReportShell";
import { currencyFormatter } from "../../../components/Auth/customFetch";
import DateFilterReusable from "../../../components/operations/Laboratory/ResuableFilter/DateFilterReusable";
import { accountingApi, TrialBalanceRow } from "../../../lib/accounting/accountingApi";

function money(value: number): string {
     return currencyFormatter.format(Number(value || 0));
}

export default function TrialBalancePage() {
     const [asOf, setAsOf] = useState(dayjs().format("YYYY-MM-DD"));
     const [dateFilter, setDateFilter] = useState("Today");
     const [rows, setRows] = useState<TrialBalanceRow[]>([]);
     const [totals, setTotals] = useState({ debits: 0, credits: 0, balanced: true });
     const [loading, setLoading] = useState(false);
     const [error, setError] = useState<string | null>(null);

     // a trial balance is cumulative to a date, not a movement over a range
     const load = useCallback(async () => {
          setLoading(true);
          setError(null);
          try {
               const response = await accountingApi.trialBalance(undefined, asOf);
               if (response?.result) {
                    setRows((response.result.rows || []).filter((row) => row.debits !== 0 || row.credits !== 0));
                    setTotals(response.result.totals || { debits: 0, credits: 0, balanced: true });
               } else {
                    setError(response?.message || "Unable to load the trial balance");
               }
          } catch (err: any) {
               setError(err?.message || "Unable to load the trial balance");
          } finally {
               setLoading(false);
          }
     }, [asOf]);

     useEffect(() => {
          load();
     }, [load]);

     const groups = ["asset", "liability", "equity", "revenue", "expense"].map((type) => ({
          type,
          label: { asset: "Assets", liability: "Liabilities", equity: "Equity", revenue: "Income", expense: "Expenses" }[type],
          rows: rows.filter((row) => row.type === type),
     })).filter((group) => group.rows.length > 0);

     return (
          <ReportShell
               title="Trial Balance"
               subtitle="Every account with a balance, cumulative to the reporting date"
               reportTitle="TRIAL BALANCE"
               range={formatRange(asOf, asOf)}
               filters={
                    <>
                         <div className="col-12 col-md-6">
                              <DateFilterReusable
                                   value={dateFilter}
                                   onChange={setDateFilter}
                                   onDateRangeChange={(start: string, end: string) => setAsOf(end || start)}
                                   label="As at"
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
                              <h4>Total Debits</h4>
                              <hr/>
                              <h3 className="fw-bold">{money(totals.debits)}</h3>
                         </div>
                    </div>
                    <div className="col-6 col-md-3">
                         <div className="border rounded p-4">
                              <h4>Total Credits</h4>
                              <hr/>
                              <h3 className="fw-bold">{money(totals.credits)}</h3>
                         </div>
                    </div>
                    <div className="col-6 col-md-3">
                         <div className="border rounded p-4">
                              <h4>Difference</h4>
                              <hr/>
                              <h3 className={`fw-bold ${totals.balanced ? "text-success" : "text-danger"}`}>
                                   {money(Math.abs(totals.debits - totals.credits))}
                              </h3>
                         </div>
                    </div>
                    <div className="col-6 col-md-3">
                         <div className="border rounded p-4">
                              <h4>Status</h4>
                              <hr/>
                              <h3 className={`fw-bold ${totals.balanced ? "text-success" : "text-danger"}`}>
                                   {totals.balanced ? "Balanced" : "Out of balance"}
                              </h3>
                         </div>
                    </div>
               </div>

               <div className={`alert d-flex align-items-center gap-2 py-2 ${totals.balanced ? "alert-success" : "alert-danger"}`}>
                    {totals.balanced ? <RiCheckboxCircleLine size={18} /> : <RiErrorWarningLine size={18} />}
                    <span>
                         <strong>{totals.balanced ? "Debits = Credits" : "Debits \u2260 Credits"}</strong>
                         <span className="ms-2">
                              {money(totals.debits)} / {money(totals.credits)}
                         </span>
                         {!totals.balanced && (
                              <strong className="ms-2">out by {money(Math.abs(totals.debits - totals.credits))}</strong>
                         )}
                    </span>
               </div>

               <div className="table-responsive">
                    <table className="table align-middle mb-0">
                         <thead className="table-light">
                              <tr>
                                   <th>Account</th>
                                   <th>Debit</th>
                                   <th>Credit</th>
                              </tr>
                         </thead>
                         <tbody>
                              {groups.map((group) => (
                                   <React.Fragment key={group.type}>
                                        <tr className="table-secondary">
                                             <td colSpan={3} className="fw-bold text-uppercase" style={{ letterSpacing: "0.04em" }}>{group.label}</td>
                                        </tr>
                                        {group.rows.map((row) => (
                                             <tr key={row.account_code}>
                                                  <td>
                                                       <a className="text-decoration-none" href={`/accounting/general-ledger?accountCode=${row.account_code}&to=${asOf}`}>
                                                            <span className="text-muted me-2">{row.account_code}</span>{row.name}
                                                       </a>
                                                  </td>
                                                  <td>{row.debits ? money(row.debits) : ""}</td>
                                                  <td>{row.credits ? money(row.credits) : ""}</td>
                                             </tr>
                                        ))}
                                   </React.Fragment>
                              ))}
                              {groups.length === 0 && !loading && (
                                   <tr><td colSpan={3} className="text-muted py-4">No postings in this period</td></tr>
                              )}
                         </tbody>
                         <tfoot className="table-light">
                              <tr>
                                   <th>Total</th>
                                   <th>{money(totals.debits)}</th>
                                   <th>{money(totals.credits)}</th>
                              </tr>
                         </tfoot>
                    </table>
               </div>

               {!totals.balanced && (
                    <p className="text-danger small mt-2 mb-0">
                         An unbalanced trial balance means a journal reached one side of the ledger and not the other. Check
                         Posting Exceptions for failed or dead-letter entries.
                    </p>
               )}
          </ReportShell>
     );
}
