"use client";
import { RiCheckboxCircleLine, RiErrorWarningLine } from "@remixicon/react";
import { RiArrowLeftRightLine, RiBankLine, RiScales3Line } from "@remixicon/react";
import dayjs from "dayjs";
import React, { useCallback, useEffect, useRef, useState } from "react";
import AccountingSummary from "../../../components/accounting/AccountingSummary";
import ReportShell, { formatRange } from "../../../components/accounting/ReportShell";
import { currencyFormatter } from "../../../components/Auth/customFetch";
import { accountingApi, TrialBalanceRow } from "../../../lib/accounting/accountingApi";

function money(value: number): string {
     return currencyFormatter.format(Number(value || 0));
}

export default function TrialBalancePage() {
     const [asOf, setAsOf] = useState(dayjs().format("YYYY-MM-DD"));
     const [rows, setRows] = useState<TrialBalanceRow[]>([]);
     const [totals, setTotals] = useState({ debits: 0, credits: 0, balanced: true });
     const [loading, setLoading] = useState(false);
     const [error, setError] = useState<string | null>(null);
     const latestRequest = useRef(0);

     // a trial balance is cumulative to a date, not a movement over a range
     const load = useCallback(async () => {
          const requestId = ++latestRequest.current;
          setLoading(true);
          setError(null);
          try {
               const response = await accountingApi.trialBalance(undefined, asOf);
               if (requestId !== latestRequest.current) return;
               if (response?.result) {
                    setRows((response.result.rows || []).filter((row) => row.debits !== 0 || row.credits !== 0));
                    setTotals(response.result.totals || { debits: 0, credits: 0, balanced: true });
               } else {
                    setError(response?.message || "Unable to load the trial balance");
               }
          } catch (err: any) {
               setError(err?.message || "Unable to load the trial balance");
          } finally {
               if (requestId === latestRequest.current) setLoading(false);
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
               subtitle="Cumulative account balances through the selected date. Earlier postings remain included."
               reportTitle="TRIAL BALANCE"
               range={formatRange(asOf, asOf)}
               filters={
                    <>
                         <div className="col-12 col-md-6">
                              <label htmlFor="trial-balance-as-of" className="form-label mb-1 small text-muted">As at date</label>
                              <input
                                   id="trial-balance-as-of"
                                   type="date"
                                   className="form-control"
                                   value={asOf}
                                   max={dayjs().format("YYYY-MM-DD")}
                                   onChange={(event) => setAsOf(event.target.value)}
                              />
                         </div>
                    </>
               }
          >
               {error && <div className="alert alert-danger py-2">{error}</div>}

               <AccountingSummary
                    rowClassName="row g-2 mb-3"
                    columnClassName="col-6 col-md-3"
                    metrics={[
                         { label: "Total Debits", value: money(totals.debits), Icon: RiArrowLeftRightLine, variant: "primary", subtitle: "Debit balance total" },
                         { label: "Total Credits", value: money(totals.credits), Icon: RiBankLine, variant: "success", subtitle: "Credit balance total" },
                         { label: "Difference", value: money(Math.abs(totals.debits - totals.credits)), Icon: RiScales3Line, variant: totals.balanced ? "info" : "danger", subtitle: "Debits compared with credits" },
                         { label: "Status", value: totals.balanced ? "Balanced" : "Out of balance", Icon: totals.balanced ? RiCheckboxCircleLine : RiErrorWarningLine, variant: totals.balanced ? "success" : "danger", subtitle: "Trial balance check" },
                    ]}
               />

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
