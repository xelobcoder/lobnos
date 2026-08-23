"use client";
import dayjs from "dayjs";
import React, { useState } from "react";
import { toast } from "react-toastify";
import ReportShell from "../../../components/accounting/ReportShell";
import { currencyFormatter } from "../../../components/Auth/customFetch";
import { useApplication } from "../../../components/Auth/useApplicationContext";
import { accountingApi } from "../../../lib/accounting/accountingApi";

export default function YearEndClosePage() {
     const employeeid = useApplication()?.user?.employeeid;
     const [fiscalYear, setFiscalYear] = useState(dayjs().year() - 1);
     const [result, setResult] = useState<any>(null);
     const [busy, setBusy] = useState(false);

     const close = async () => {
          if (!employeeid) {
               toast.error("Your employee id is missing from the session");
               return;
          }

          setBusy(true);
          try {
               const response: any = await accountingApi.closeFiscalYear(fiscalYear, employeeid);
               if (response?.status === "error") {
                    toast.error(response?.message || "Unable to close the year");
               } else {
                    setResult(response?.result);
                    toast.success(response?.result?.alreadyClosed ? "This year was already closed" : "Year closed");
               }
          } catch (error: any) {
               toast.error(error?.message || "Unable to close the year");
          } finally {
               setBusy(false);
          }
     };

     const money = (value: number) => currencyFormatter.format(Number(value || 0));

     return (
          <ReportShell
               title="Year-End Close"
               subtitle="Sweeps every income and expense balance into retained earnings, dated 31 December."
               filters={
                    <>
                         <div className="col-6 col-md-3">
                              <label className="form-label mb-1 small text-muted">Fiscal year</label>
                              <input
                                   type="number"
                                   className="form-control form-control-sm"
                                   value={fiscalYear}
                                   onChange={(e) => setFiscalYear(Number(e.target.value))}
                              />
                         </div>
                         <div className="col-12 col-md-3">
                              <button className="btn btn-sm btn-primary w-100" onClick={close} disabled={busy}>
                                   {busy ? "Closing..." : `Close ${fiscalYear}`}
                              </button>
                         </div>
                    </>
               }
          >
               <div className="alert alert-warning py-2">
                    Close prior years first. Balances are read as at year end with no lower bound, so an unclosed earlier year
                    would be swept in a second time.
               </div>

               {result ? (
                    <div className="table-responsive">
                         <table className="table align-middle">
                              <tbody>
                                   <tr>
                                        <td>Fiscal year</td>
                                        <td className="text-end fw-semibold">{result.fiscalYear}</td>
                                   </tr>
                                   <tr>
                                        <td>Income closed</td>
                                        <td className="text-end">{money(result.revenueClosed)}</td>
                                   </tr>
                                   <tr>
                                        <td>Expenses closed</td>
                                        <td className="text-end">{money(result.expensesClosed)}</td>
                                   </tr>
                                   <tr className="table-light">
                                        <td className="fw-semibold">Transferred to retained earnings</td>
                                        <td className={`text-end fw-semibold ${result.netProfit < 0 ? "text-danger" : ""}`}>
                                             {money(result.netProfit)}
                                        </td>
                                   </tr>
                                   <tr>
                                        <td>Journal entry</td>
                                        <td className="text-end">#{result.journalEntryId}</td>
                                   </tr>
                              </tbody>
                         </table>
                         {result.alreadyClosed && (
                              <p className="text-muted small mb-0">
                                   This year had already been closed, so the existing entry is shown rather than a new one.
                              </p>
                         )}
                    </div>
               ) : (
                    <p className="text-muted mb-0">Choose a fiscal year and run the close to see the resulting entry.</p>
               )}
          </ReportShell>
     );
}
