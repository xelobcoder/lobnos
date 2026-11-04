"use client";
import { RiAddLine, RiDeleteBinLine, RiCheckboxCircleLine, RiErrorWarningLine } from "@remixicon/react";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { currencyFormatter } from "../../../../components/Auth/customFetch";
import DateFilterReusable from "../../../../components/operations/Laboratory/ResuableFilter/DateFilterReusable";
import styles from "./page.module.css";
import themeContrast from "../../../../styles/theme-contrast.module.css";
import { useApplication } from "../../../../components/Auth/useApplicationContext";
import { accountingApi, ChartAccount, ManualJournalLine } from "../../../../lib/accounting/accountingApi";

const EMPTY_LINE: ManualJournalLine = { account_code: "", direction: "debit", amount: 0, line_description: "" };

export default function NewManualJournalPage() {
     const router = useRouter();
     const employeeid = useApplication()?.user?.employeeid;

     const [journalDate, setJournalDate] = useState(dayjs().format("YYYY-MM-DD"));
     const [dateFilter, setDateFilter] = useState("Today");
     const [description, setDescription] = useState("");
     const [reference, setReference] = useState("");
     const [notes, setNotes] = useState("");
     const [lines, setLines] = useState<ManualJournalLine[]>([{ ...EMPTY_LINE }, { ...EMPTY_LINE, direction: "credit" }]);
     const [saving, setSaving] = useState(false);
     const [accounts, setAccounts] = useState<ChartAccount[]>([]);

     useEffect(() => {
          accountingApi.accounts().then((response) => setAccounts(response?.result || []));
     }, []);

     const { debits, credits, balanced } = useMemo(() => {
          const debitTotal = lines
               .filter((line) => line.direction === "debit")
               .reduce((total, line) => total + Number(line.amount || 0), 0);
          const creditTotal = lines
               .filter((line) => line.direction === "credit")
               .reduce((total, line) => total + Number(line.amount || 0), 0);

          return {
               debits: debitTotal,
               credits: creditTotal,
               balanced: Math.abs(debitTotal - creditTotal) < 0.01 && debitTotal > 0,
          };
     }, [lines]);

     const updateLine = (index: number, patch: Partial<ManualJournalLine>) => {
          setLines((current) => current.map((line, position) => (position === index ? { ...line, ...patch } : line)));
     };

     const save = async () => {
          if (!employeeid) {
               toast.error("Your employee id is missing from the session");
               return;
          }
          if (!description.trim()) {
               toast.error("Give the journal a description");
               return;
          }
          if (!balanced) {
               toast.error("Debits must equal credits before the journal can be saved");
               return;
          }
          if (lines.some((line) => !line.account_code)) {
               toast.error("Every line needs an account");
               return;
          }

          setSaving(true);
          try {
               const response: any = await accountingApi.createManualJournal({
                    journalDate,
                    description: description.trim(),
                    reference: reference.trim() || undefined,
                    notes: notes.trim() || undefined,
                    employeeid,
                    lines: lines.map((line) => ({ ...line, amount: Number(line.amount) })),
               });

               if (response?.status === "error") {
                    toast.error(response?.message || "Unable to save the journal");
               } else {
                    toast.success("Draft journal created");
                    router.push("/accounting/manual-journals");
               }
          } catch (error: any) {
               toast.error(error?.message || "Unable to save the journal");
          } finally {
               setSaving(false);
          }
     };

     return (
          <div className={`container-fluid py-4 ${themeContrast.controls}`}>
               <div className="mb-4">
                    <h4 className="mb-0">New Manual Journal</h4>
                    <small className="text-muted">Saved as a draft. It still needs to be submitted, approved and posted.</small>
               </div>

               <div className="card shadow-sm mb-3">
                    <div className="card-body">
                         <div className="row g-3">
                              <div className="col-12 col-md-3">
                                   <DateFilterReusable
                                        value={dateFilter}
                                        onChange={setDateFilter}
                                        onDateRangeChange={(start) => setJournalDate(start)}
                                        label="Journal date"
                                        className="w-100"
                                        disabled={saving}
                                   />
                              </div>
                              <div className="col-12 col-md-6">
                                   <label className="form-label small">Description</label>
                                   <input
                                        type="text"
                                        className="form-control"
                                        placeholder="e.g. Accrue December rent"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                   />
                              </div>
                              <div className="col-12 col-md-3">
                                   <label className="form-label small">Reference</label>
                                   <input type="text" className="form-control" value={reference} onChange={(e) => setReference(e.target.value)} />
                              </div>
                              <div className="col-12">
                                   <label className="form-label small">Notes</label>
                                   <textarea className="form-control" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
                              </div>
                         </div>
                    </div>
               </div>

               <div className="card shadow-sm mb-3">
                    <div className="card-header bg-body d-flex justify-content-between align-items-center">
                         <span className="fw-semibold">Lines</span>
                         <button
                              className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
                              onClick={() => setLines((current) => [...current, { ...EMPTY_LINE }])}
                         >
                              <RiAddLine size={16} /> Add line
                         </button>
                    </div>

                    <div className="table-responsive">
                         <table className="table align-middle mb-0">
                              <thead className={styles.tableHead}>
                                   <tr>
                                        <th style={{ minWidth: 240 }}>Account</th>
                                        <th style={{ width: 140 }}>Direction</th>
                                        <th style={{ width: 160 }} className="text-end">Amount</th>
                                        <th>Line description</th>
                                        <th style={{ width: 60 }} />
                                   </tr>
                              </thead>
                              <tbody>
                                   {lines.map((line, index) => (
                                        <tr key={index}>
                                             <td>
                                                  <select
                                                       className="form-select form-select-sm"
                                                       value={line.account_code}
                                                       onChange={(e) => updateLine(index, { account_code: e.target.value })}
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
                                                  <select
                                                       className="form-select form-select-sm"
                                                       value={line.direction}
                                                       onChange={(e) => updateLine(index, { direction: e.target.value as "debit" | "credit" })}
                                                  >
                                                       <option value="debit">Debit</option>
                                                       <option value="credit">Credit</option>
                                                  </select>
                                             </td>
                                             <td>
                                                  <input
                                                       type="number"
                                                       min={0}
                                                       step="0.01"
                                                       className="form-control form-control-sm text-end"
                                                       value={line.amount || ""}
                                                       onChange={(e) => updateLine(index, { amount: Number(e.target.value) })}
                                                  />
                                             </td>
                                             <td>
                                                  <input
                                                       type="text"
                                                       className="form-control form-control-sm"
                                                       value={line.line_description || ""}
                                                       onChange={(e) => updateLine(index, { line_description: e.target.value })}
                                                  />
                                             </td>
                                             <td className="text-end">
                                                  <button
                                                       className="btn btn-sm btn-outline-danger"
                                                       disabled={lines.length <= 2}
                                                       onClick={() => setLines((current) => current.filter((_, position) => position !== index))}
                                                  >
                                                       <RiDeleteBinLine size={16} />
                                                  </button>
                                             </td>
                                        </tr>
                                   ))}
                              </tbody>
                              <tfoot className={styles.summaryFooter}>
                                   <tr>
                                        <th colSpan={2} className={styles.summaryHeading}>Journal summary</th>
                                        <th className={styles.summaryAmounts}>
                                             <div><span>Debit</span><strong>{currencyFormatter.format(debits)}</strong></div>
                                             <div><span>Credit</span><strong>{currencyFormatter.format(credits)}</strong></div>
                                        </th>
                                        <th colSpan={2}>
                                             <span className={`${styles.summaryStatus} ${balanced ? styles.summaryBalanced : styles.summaryUnbalanced}`}>
                                                  {balanced ? <RiCheckboxCircleLine size={28} /> : <RiErrorWarningLine size={28} />}
                                                  <span>
                                                       <strong>{balanced ? "Balanced" : "Out of balance"}</strong>
                                                       <small>{balanced ? "Ready to submit for approval" : `Difference: ${currencyFormatter.format(Math.abs(debits - credits))}`}</small>
                                                  </span>
                                             </span>
                                        </th>
                                   </tr>
                              </tfoot>
                         </table>
                    </div>
               </div>

               <div className="d-flex justify-content-end gap-2">
                    <button className="btn btn-outline-secondary" onClick={() => router.push("/accounting/manual-journals")}>
                         Cancel
                    </button>
                    <button className="btn btn-primary" onClick={save} disabled={saving || !balanced}>
                         {saving ? "Saving..." : "Save draft"}
                    </button>
               </div>
          </div>
     );
}
