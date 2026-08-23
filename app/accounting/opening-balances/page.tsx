"use client";
import { RiAddLine, RiDeleteBinLine } from "@remixicon/react";
import dayjs from "dayjs";
import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import ReportShell from "../../../components/accounting/ReportShell";
import { currencyFormatter } from "../../../components/Auth/customFetch";
import DateFilterReusable from "../../../components/operations/Laboratory/ResuableFilter/DateFilterReusable";
import { useApplication } from "../../../components/Auth/useApplicationContext";
import { accountingApi, ChartAccount } from "../../../lib/accounting/accountingApi";

interface Row {
     accountCode: string;
     debit: number;
     credit: number;
}

const EMPTY: Row = { accountCode: "", debit: 0, credit: 0 };

export default function OpeningBalancesPage() {
     const employeeid = useApplication()?.user?.employeeid;
     const [asOf, setAsOf] = useState(dayjs().startOf("year").format("YYYY-MM-DD"));
     const [dateFilter, setDateFilter] = useState("This Year");
     const [accounts, setAccounts] = useState<ChartAccount[]>([]);
     const [rows, setRows] = useState<Row[]>([{ ...EMPTY }, { ...EMPTY }]);
     const [busy, setBusy] = useState(false);

     useEffect(() => {
          accountingApi.accounts().then((response) => setAccounts(response?.result || []));
     }, []);

     const { debits, credits, balanced } = useMemo(() => {
          const debitTotal = rows.reduce((total, row) => total + Number(row.debit || 0), 0);
          const creditTotal = rows.reduce((total, row) => total + Number(row.credit || 0), 0);
          return {
               debits: debitTotal,
               credits: creditTotal,
               balanced: Math.abs(debitTotal - creditTotal) < 0.01 && debitTotal > 0,
          };
     }, [rows]);

     const update = (index: number, patch: Partial<Row>) =>
          setRows((current) => current.map((row, position) => (position === index ? { ...row, ...patch } : row)));

     const submit = async () => {
          if (!employeeid) {
               toast.error("Your employee id is missing from the session");
               return;
          }
          if (!balanced) {
               toast.error("Debits must equal credits");
               return;
          }

          setBusy(true);
          try {
               const response: any = await accountingApi.openingBalances(
                    asOf,
                    rows.filter((row) => row.accountCode && (row.debit || row.credit)),
                    employeeid
               );
               if (response?.status === "error") toast.error(response?.message || "Unable to post opening balances");
               else toast.success("Opening balances posted");
          } catch (error: any) {
               toast.error(error?.message || "Unable to post opening balances");
          } finally {
               setBusy(false);
          }
     };

     return (
          <ReportShell
               title="Opening Balances"
               subtitle="For onboarding a lab that was already trading. Only accepted while the ledger is otherwise empty."
               actions={
                    <button className="btn btn-sm btn-primary" onClick={submit} disabled={busy || !balanced}>
                         {busy ? "Posting..." : "Post opening balances"}
                    </button>
               }
               filters={
                    <>
                         <div className="col-12 col-md-6">
                              <DateFilterReusable
                                   value={dateFilter}
                                   onChange={setDateFilter}
                                   onDateRangeChange={(start) => setAsOf(start)}
                                   label="Period"
                                   className="w-100"
                                   disabled={busy}
                              />
                         </div>
                    </>
               }
          >
               <div className="alert alert-info py-2">
                    Enter the closing figures from your previous system. This can only be done once, before any other
                    transaction has been posted.
               </div>

               <div className="d-flex justify-content-end mb-2">
                    <button className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1" onClick={() => setRows((c) => [...c, { ...EMPTY }])}>
                         <RiAddLine size={16} /> Add line
                    </button>
               </div>

               <div className="table-responsive">
                    <table className="table align-middle">
                         <thead className="table-light">
                              <tr>
                                   <th style={{ minWidth: 280 }}>Account</th>
                                   <th className="text-end" style={{ width: 170 }}>Debit</th>
                                   <th className="text-end" style={{ width: 170 }}>Credit</th>
                                   <th style={{ width: 60 }} />
                              </tr>
                         </thead>
                         <tbody>
                              {rows.map((row, index) => (
                                   <tr key={index}>
                                        <td>
                                             <select
                                                  className="form-select form-select-sm"
                                                  value={row.accountCode}
                                                  onChange={(e) => update(index, { accountCode: e.target.value })}
                                             >
                                                  <option value="">Select account</option>
                                                  {accounts.map((account) => (
                                                       <option key={account.account_code} value={account.account_code}>
                                                            {account.account_code} - {account.name}
                                                       </option>
                                                  ))}
                                             </select>
                                        </td>
                                        <td>
                                             <input
                                                  type="number"
                                                  min={0}
                                                  step="0.01"
                                                  className="form-control form-control-sm text-end"
                                                  value={row.debit || ""}
                                                  onChange={(e) => update(index, { debit: Number(e.target.value), credit: 0 })}
                                             />
                                        </td>
                                        <td>
                                             <input
                                                  type="number"
                                                  min={0}
                                                  step="0.01"
                                                  className="form-control form-control-sm text-end"
                                                  value={row.credit || ""}
                                                  onChange={(e) => update(index, { credit: Number(e.target.value), debit: 0 })}
                                             />
                                        </td>
                                        <td className="text-end">
                                             <button
                                                  className="btn btn-sm btn-outline-danger"
                                                  disabled={rows.length <= 2}
                                                  onClick={() => setRows((current) => current.filter((_, position) => position !== index))}
                                             >
                                                  <RiDeleteBinLine size={14} />
                                             </button>
                                        </td>
                                   </tr>
                              ))}
                         </tbody>
                         <tfoot className="table-light">
                              <tr>
                                   <th>Totals</th>
                                   <th className="text-end">{currencyFormatter.format(debits)}</th>
                                   <th className="text-end">{currencyFormatter.format(credits)}</th>
                                   <th />
                              </tr>
                              <tr>
                                   <td colSpan={4} className={balanced ? "text-success" : "text-danger"}>
                                        {balanced ? "Balanced" : `Out by ${currencyFormatter.format(Math.abs(debits - credits))}`}
                                   </td>
                              </tr>
                         </tfoot>
                    </table>
               </div>

               <div className="d-flex justify-content-between align-items-center border-top pt-3 mt-2 flex-wrap gap-2">
                    <div className="small">
                         {balanced ? (
                              <span className="text-success">
                                   Balanced at {currencyFormatter.format(debits)} — ready to post.
                              </span>
                         ) : debits === 0 && credits === 0 ? (
                              <span className="text-muted">Enter your closing balances from the previous system.</span>
                         ) : (
                              <span className="text-danger">
                                   Debits and credits differ by {currencyFormatter.format(Math.abs(debits - credits))}. Posting stays
                                   disabled until they match.
                              </span>
                         )}
                    </div>

                    <button className="btn btn-primary" onClick={submit} disabled={busy || !balanced}>
                         {busy ? "Posting..." : "Post opening balances"}
                    </button>
               </div>
          </ReportShell>
     );
}
