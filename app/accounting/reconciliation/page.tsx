"use client";
import dayjs from "dayjs";
import React, { useCallback, useEffect, useRef, useState } from "react";
import ReportShell from "../../../components/accounting/ReportShell";
import DateFilterReusable from "../../../components/operations/Laboratory/ResuableFilter/DateFilterReusable";
import { currencyFormatter } from "../../../components/Auth/customFetch";
import { accountingApi } from "../../../lib/accounting/accountingApi";

interface Line {
     ledger: "AR" | "AP";
     label: string;
     control: string;
     subledger: number;
     generalLedger: number;
     difference: number;
}

export default function ReconciliationPage() {
     const [asOf, setAsOf] = useState(dayjs().format("YYYY-MM-DD"));
     const [dateFilter, setDateFilter] = useState("Today");
     const [lines, setLines] = useState<Line[]>([]);
     const [balanced, setBalanced] = useState(true);
     const [loading, setLoading] = useState(false);
     const [coverage, setCoverage] = useState<any>(null);
     const latestRequest = useRef(0);
     const uninitialized = coverage?.initialization === 'opening_balances_required' || coverage?.goLive === null;
     const coverageGaps = coverage?.lines?.some((line: any) => line.missingPreGoLive > 0 || line.missingPostGoLive > 0);

     useEffect(() => {
          accountingApi
               .ledgerCoverage()
               .then((res) => setCoverage(res?.result || null))
               .catch(() => setCoverage(null));
     }, []);

     const load = useCallback(async () => {
          const requestId = ++latestRequest.current;
          setLoading(true);
          try {
               const [ar, ap, trial] = await Promise.all([
                    accountingApi.subledgerReconcile("AR", asOf),
                    accountingApi.subledgerReconcile("AP", asOf),
                    accountingApi.trialBalance(undefined, asOf),
               ]);

               if (requestId !== latestRequest.current) return;
               setLines([
                    {
                         ledger: "AR",
                         label: "Accounts Receivable",
                         control: "acc-1002",
                         subledger: ar?.result?.subledger || 0,
                         generalLedger: ar?.result?.generalLedger || 0,
                         difference: ar?.result?.difference || 0,
                    },
                    {
                         ledger: "AP",
                         label: "Accounts Payable",
                         control: "acc-2000",
                         subledger: ap?.result?.subledger || 0,
                         generalLedger: ap?.result?.generalLedger || 0,
                         difference: ap?.result?.difference || 0,
                    },
               ]);

               setBalanced(trial?.result?.totals?.balanced ?? true);
          } finally {
               if (requestId === latestRequest.current) setLoading(false);
          }
     }, [asOf]);

     useEffect(() => {
          load();
     }, [load]);

     const money = (value: number) => currencyFormatter.format(Number(value || 0));

     return (
          <ReportShell
               title="Reconciliation"
               subtitle="Each subledger against its control account in the general ledger"
               reportTitle="Control Account Reconciliation"
               range={`As at ${dayjs(asOf).format("D MMMM YYYY")}`}
               filters={
                    <>
                         <div className="col-12 col-md-6">
                              <DateFilterReusable
                                   value={dateFilter}
                                   onChange={setDateFilter}
                                   onDateRangeChange={(_, end) => setAsOf(end)}
                                   label="Period"
                                   className="w-100"
                              />
                         </div>
                    </>
               }
          >
               <div className={`alert py-2 ${!coverage || uninitialized || coverageGaps ? "alert-warning" : balanced ? "alert-success" : "alert-danger"}`} role="status">
                    {!coverage ? "Checking ledger coverage before confirming reconciliation." : uninitialized
                         ? "Opening balances required. The ledger has no posted entries. Its zero balances do not reconcile the existing operational documents."
                         : coverageGaps ? "Ledger coverage is incomplete. Equal debits and credits do not confirm that every operational balance has been recognized."
                         : balanced ? "Trial balance is in balance. Total posted debits equal total posted credits."
                         : "Trial balance is out of balance. Review Posting Exceptions before trusting these figures."}
               </div>

               <div className="table-responsive">
                    <table className="table align-middle">
                         <thead className="table-light">
                              <tr>
                                   <th>Reconciliation</th>
                                   <th>Control account</th>
                                   <th className="text-end">Subledger</th>
                                   <th className="text-end">General ledger</th>
                                   <th className="text-end">Difference</th>
                                   <th>Result</th>
                              </tr>
                         </thead>
                         <tbody>
                              {lines.map((line) => {
                                   const outOfBalance = Math.abs(line.difference) > 0.01;
                                   return (
                                        <tr key={line.ledger}>
                                             <td className="fw-semibold">{line.label}</td>
                                             <td className="text-muted">{line.control}</td>
                                             <td className="text-end">{money(line.subledger)}</td>
                                             <td className="text-end">{money(line.generalLedger)}</td>
                                             <td className={`text-end ${outOfBalance ? "text-danger fw-semibold" : ""}`}>
                                                  {money(line.difference)}
                                             </td>
                                             <td>
                                                  <span className={`badge ${!coverage || uninitialized || coverageGaps ? "bg-warning text-dark" : outOfBalance ? "bg-danger" : "bg-success"}`}>
                                                       {!coverage ? "Checking coverage" : uninitialized ? "Opening balances required" : outOfBalance ? "Investigate" : coverageGaps ? "Review coverage" : "Reconciled"}
                                                  </span>
                                             </td>
                                        </tr>
                                   );
                              })}
                         </tbody>
                    </table>
               </div>

               <h6 className="fw-semibold mt-4">Ledger coverage by module</h6>
               <p className="text-muted small">
                    Operational documents compared with ledger postings. Documents dated before go-live
                    {coverage?.goLive ? ` (${dayjs(coverage.goLive).format("D MMM YYYY")})` : ""} need an opening-balance
                    decision; any after go-live should be zero.
               </p>
               <div className="table-responsive">
                    <table className="table table-sm align-middle">
                         <thead className="table-light">
                              <tr>
                                   <th>Document</th>
                                   <th className="text-end">Total</th>
                                   <th className="text-end">Posted</th>
                                   <th className="text-end">Missing (before go-live)</th>
                                   <th className="text-end">Missing (after go-live)</th>
                                   <th className="text-end">Amount missing</th>
                              </tr>
                         </thead>
                         <tbody>
                              {(coverage?.lines || []).map((l: any) => (
                                   <tr key={l.document}>
                                        <td>
                                             <span className="text-capitalize text-muted me-1">{l.module}:</span>
                                             {l.document}
                                        </td>
                                        <td className="text-end">{l.total}</td>
                                        <td className="text-end">{l.posted}</td>
                                        <td className="text-end text-muted">{l.missingPreGoLive}</td>
                                        <td className={`text-end ${l.missingPostGoLive ? "text-danger fw-semibold" : ""}`}>
                                             {l.missingPostGoLive}
                                        </td>
                                        <td className="text-end">{money(l.amountMissingPostGoLive)}</td>
                                   </tr>
                              ))}
                              {!coverage && (
                                   <tr>
                                        <td colSpan={6} className="text-center text-muted">
                                             Coverage is unavailable.
                                        </td>
                                   </tr>
                              )}
                         </tbody>
                    </table>
               </div>
               {coverage?.billDrift?.length > 0 && (
                    <div className="alert alert-warning py-2 small">
                         {coverage.billDrift.length} bill(s) differ from their ledger receivable. Largest: bill #
                         {coverage.billDrift[0].billingid} ({money(coverage.billDrift[0].difference)}).
                    </div>
               )}

               <p className="text-muted small mb-0">
                    A difference means a posting reached one side and not the other. Check Posting Exceptions for failed or
                    dead-letter rows covering the same period.
               </p>
          </ReportShell>
     );
}
