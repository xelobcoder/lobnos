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
     const latestRequest = useRef(0);

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
               <div className={`alert py-2 ${balanced ? "alert-success" : "alert-danger"}`}>
                    {balanced
                         ? "Trial balance is in balance: total debits equal total credits."
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
                                                  <span className={`badge ${outOfBalance ? "bg-danger" : "bg-success"}`}>
                                                       {outOfBalance ? "Investigate" : "Reconciled"}
                                                  </span>
                                             </td>
                                        </tr>
                                   );
                              })}
                         </tbody>
                    </table>
               </div>

               <p className="text-muted small mb-0">
                    A difference means a posting reached one side and not the other. Check Posting Exceptions for failed or
                    dead-letter rows covering the same period.
               </p>
          </ReportShell>
     );
}
