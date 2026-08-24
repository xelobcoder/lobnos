"use client";
import { RiBankLine, RiCheckboxCircleLine, RiErrorWarningLine, RiMagicLine, RiUploadLine } from "@remixicon/react";
import dayjs from "dayjs";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";
import ReportShell from "../../../components/accounting/ReportShell";
import { currencyFormatter } from "../../../components/Auth/customFetch";
import { accountingApi, BankAccount } from "../../../lib/accounting/accountingApi";

function money(value: number): string {
     return currencyFormatter.format(Number(value || 0));
}

function parseStatement(rows: unknown[][]) {
     const lines: Array<{ txnDate: string; description?: string; reference?: string; amount: number }> = [];
     const problems: string[] = [];

     rows.forEach((row, index) => {
          const parts = row.map((part) => String(part ?? "").trim());
          if (parts.length < 2) return;

          const rawDate = row[0];
          const excelDate = typeof rawDate === "number" ? XLSX.SSF.parse_date_code(rawDate) : null;
          const date = rawDate instanceof Date
               ? dayjs(rawDate)
               : excelDate
                    ? dayjs(new Date(excelDate.y, excelDate.m - 1, excelDate.d, excelDate.H, excelDate.M, excelDate.S))
                    : dayjs(String(rawDate), ["YYYY-MM-DD", "DD/MM/YYYY", "DD-MM-YYYY", "MM/DD/YYYY"], false);
          if (!date.isValid()) {
               if (index > 0 || !/date/i.test(parts[0])) problems.push(`Line ${index + 1}: unreadable date "${parts[0]}"`);
               return;
          }

          let amount = NaN;
          if (parts.length >= 5) {
               const debit = Number(String(parts[3]).replace(/[^0-9.-]/g, ""));
               const credit = Number(String(parts[4]).replace(/[^0-9.-]/g, ""));
               amount = (isFinite(credit) ? credit : 0) - (isFinite(debit) ? debit : 0);
          } else {
               amount = Number(String(parts[parts.length - 1]).replace(/[^0-9.-]/g, ""));
          }

          if (!isFinite(amount) || amount === 0) {
               problems.push(`Line ${index + 1}: unreadable amount`);
               return;
          }

          lines.push({
               txnDate: date.format("YYYY-MM-DD"),
               description: parts[1] || undefined,
               reference: parts.length >= 4 ? parts[2] : undefined,
               amount,
          });
     });

     return { lines, problems };
}

async function readExcelFile(file: File) {
     const workbook = XLSX.read(await file.arrayBuffer(), { type: "array", cellDates: true });
     const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
     if (!firstSheet) throw new Error("The workbook has no worksheet");
     return parseStatement(XLSX.utils.sheet_to_json(firstSheet, { header: 1, raw: true, defval: "" }) as unknown[][]);
}

export default function BankReconciliationPage() {
     const params = useSearchParams();
     const [accounts, setAccounts] = useState<BankAccount[]>([]);
     const [bankAccountId, setBankAccountId] = useState<number | null>(null);
     const [from, setFrom] = useState(dayjs().startOf("month").format("YYYY-MM-DD"));
     const [to, setTo] = useState(dayjs().format("YYYY-MM-DD"));
     const [statementBalance, setStatementBalance] = useState("");

     const [statementLines, setStatementLines] = useState<any[]>([]);
     const [ledgerLines, setLedgerLines] = useState<any[]>([]);
     const [summary, setSummary] = useState<any>(null);
     const [selectedStatement, setSelectedStatement] = useState<number | null>(null);
     const [selectedLedger, setSelectedLedger] = useState<number | null>(null);

     const [selectedFile, setSelectedFile] = useState<File | null>(null);
     const [parsed, setParsed] = useState<{ lines: Array<{ txnDate: string; description?: string; reference?: string; amount: number }>; problems: string[] }>({ lines: [], problems: [] });
     const [busy, setBusy] = useState(false);

     useEffect(() => {
          accountingApi.bankAccounts().then((response) => {
               const list = response?.result || [];
               setAccounts(list);

               const requested = Number(params?.get("account"));
               const preferred = list.find((account) => account.id === requested) || list[0];
               if (preferred) setBankAccountId(Number(preferred.id));
          });
          // eslint-disable-next-line react-hooks/exhaustive-deps
     }, []);

     const load = useCallback(async () => {
          if (!bankAccountId) return;
          setBusy(true);
          try {
               const [linesRes, ledgerRes, summaryRes] = await Promise.all([
                    accountingApi.bankStatementLines(bankAccountId, { from, to, count: 200 }),
                    accountingApi.bankUnmatchedLedger(bankAccountId, from, to),
                    accountingApi.bankSummary(bankAccountId, to, Number(statementBalance || 0)),
               ]);

               setStatementLines(linesRes?.result?.data || []);
               setLedgerLines(ledgerRes?.result || []);
               setSummary(summaryRes?.result || null);
          } catch (error: any) {
               toast.error(error?.message || "Unable to load the reconciliation");
          } finally {
               setBusy(false);
          }
     }, [bankAccountId, from, to, statementBalance]);

     useEffect(() => {
          load();
     }, [load]);

     const runImport = async () => {
          if (!bankAccountId) return;
          if (parsed.lines.length === 0) {
               toast.error("Nothing readable to import");
               return;
          }

          setBusy(true);
          try {
               if (!selectedFile) {
                    toast.error("Select an Excel workbook before importing");
                    return;
               }

               const response: any = await accountingApi.importBankExcel(bankAccountId, selectedFile);
               if (response?.status === "error") toast.error(response?.message || "Import failed");
               else {
                    toast.success(`Imported ${response?.result?.imported}, skipped ${response?.result?.skipped} duplicates`);
                    if (response?.result?.problems?.length) {
                         toast.warn(response.result.problems.slice(0, 3).join("; "));
                    }
                    setSelectedFile(null);
                    setParsed({ lines: [], problems: [] });
                    await load();
               }
          } catch (error: any) {
               toast.error(error?.message || "Import failed");
          } finally {
               setBusy(false);
          }
     };

     const autoMatch = async () => {
          if (!bankAccountId) return;
          setBusy(true);
          try {
               const suggestions = await accountingApi.bankSuggestions(bankAccountId, from, to);
               const pairs = (suggestions?.result || []).map((s: any) => ({
                    statementLineId: s.statementLineId,
                    journalLineId: s.journalLineId,
               }));

               if (pairs.length === 0) {
                    toast.info("No confident matches found");
                    return;
               }

               const response: any = await accountingApi.bankMatchMany(pairs);
               toast.success(`Matched ${response?.result?.matched} of ${pairs.length}`);
               await load();
          } catch (error: any) {
               toast.error(error?.message || "Auto-match failed");
          } finally {
               setBusy(false);
          }
     };

     const matchSelected = async () => {
          if (!selectedStatement || !selectedLedger) {
               toast.error("Pick one statement line and one ledger posting");
               return;
          }

          setBusy(true);
          try {
               const response: any = await accountingApi.bankMatch(selectedStatement, selectedLedger);
               if (response?.status === "error") toast.error(response?.message || "Unable to match");
               else {
                    toast.success("Matched");
                    setSelectedStatement(null);
                    setSelectedLedger(null);
                    await load();
               }
          } catch (error: any) {
               toast.error(error?.message || "Unable to match");
          } finally {
               setBusy(false);
          }
     };

     const act = async (id: number, action: "unmatch" | "ignore") => {
          setBusy(true);
          try {
               await (action === "unmatch" ? accountingApi.bankUnmatch(id) : accountingApi.bankIgnore(id));
               await load();
          } catch (error: any) {
               toast.error(error?.message || `Unable to ${action}`);
          } finally {
               setBusy(false);
          }
     };

     const unmatchedStatement = statementLines.filter((line) => line.status === "unmatched");
     const reconciled = summary && Math.abs(summary.difference) < 0.01;

     return (
          <ReportShell
               title="Bank Reconciliation"
               subtitle="Match the ledger against the bank statement and explain the difference"
               filters={
                    <>
                         <div className="col-12 col-md-3">
                              <label className="form-label mb-1 small text-muted">Bank account</label>
                              <select
                                   className="form-select form-select-sm"
                                   value={bankAccountId ?? ""}
                                   onChange={(e) => setBankAccountId(Number(e.target.value))}
                              >
                                   {accounts.length === 0 && <option value="">No bank accounts set up</option>}
                                   {accounts.map((account) => (
                                        <option key={account.id} value={account.id}>
                                             {account.name} ({account.gl_account_code})
                                        </option>
                                   ))}
                              </select>
                         </div>
                         <div className="col-6 col-md-2">
                              <label className="form-label mb-1 small text-muted">From</label>
                              <input type="date" className="form-control form-control-sm" value={from} onChange={(e) => setFrom(e.target.value)} />
                         </div>
                         <div className="col-6 col-md-2">
                              <label className="form-label mb-1 small text-muted">To</label>
                              <input type="date" className="form-control form-control-sm" value={to} onChange={(e) => setTo(e.target.value)} />
                         </div>
                         <div className="col-6 col-md-2">
                              <label className="form-label mb-1 small text-muted">Statement balance</label>
                              <input
                                   type="number"
                                   step="0.01"
                                   className="form-control form-control-sm text-end"
                                   placeholder="0.00"
                                   value={statementBalance}
                                   onChange={(e) => setStatementBalance(e.target.value)}
                              />
                         </div>
                         <div className="col-6 col-md-3 d-flex gap-2">
                              <button className="btn btn-sm btn-primary flex-fill" onClick={load} disabled={busy || !bankAccountId}>
                                   {busy ? "Working..." : "Refresh"}
                              </button>
                              <button className="btn btn-sm btn-outline-primary flex-fill d-inline-flex align-items-center justify-content-center gap-1" onClick={autoMatch} disabled={busy || !bankAccountId}>
                                   <RiMagicLine size={16} /> Auto-match
                              </button>
                         </div>
                    </>
               }
          >
               {accounts.length === 0 && (
                    <div className="alert alert-warning d-flex align-items-center justify-content-between flex-wrap gap-2 py-2">
                         <span>No bank accounts have been set up yet, so there is nothing to reconcile.</span>
                         <Link className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1" href="/accounting/bank-accounts">
                              <RiBankLine size={16} /> Set up bank accounts
                         </Link>
                    </div>
               )}


               {summary && (
                    <div className={`alert py-3 ${reconciled ? "alert-success" : "alert-danger"}`}>
                         <div className="d-flex align-items-center gap-2 mb-2">
                              {reconciled ? <RiCheckboxCircleLine size={18} /> : <RiErrorWarningLine size={18} />}
                              <strong>{reconciled ? "Reconciled" : "Not reconciled"}</strong>
                         </div>

                         <table className="table table-sm mb-0 bg-transparent" style={{ maxWidth: 460 }}>
                              <tbody>
                                   <tr>
                                        <td>Ledger balance</td>
                                        <td className="text-end">{money(summary.glBalance)}</td>
                                   </tr>
                                   <tr>
                                        <td>Less deposits not yet on the statement</td>
                                        <td className="text-end">({money(summary.outstandingDeposits)})</td>
                                   </tr>
                                   <tr>
                                        <td>Add payments not yet cleared</td>
                                        <td className="text-end">{money(summary.outstandingPayments)}</td>
                                   </tr>
                                   <tr className="fw-semibold border-top">
                                        <td>Adjusted balance</td>
                                        <td className="text-end">{money(summary.adjustedBankBalance)}</td>
                                   </tr>
                                   <tr>
                                        <td>Statement balance</td>
                                        <td className="text-end">{money(summary.statementBalance)}</td>
                                   </tr>
                                   <tr className="fw-bold border-top">
                                        <td>Difference</td>
                                        <td className="text-end">{money(summary.difference)}</td>
                                   </tr>
                              </tbody>
                         </table>

                         {!reconciled && (
                              <small className="d-block mt-2">
                                   {summary.unmatchedStatementLines} statement line(s) and {summary.unmatchedLedgerLines} ledger
                                   posting(s) are still unexplained.
                              </small>
                         )}
                    </div>
               )}

               <div className="row g-3">
                    <div className="col-12 col-lg-6">
                         <div className="card border-0 shadow-sm h-100">
                              <div className="card-header bg-white d-flex justify-content-between align-items-center">
                                   <span className="fw-semibold">Unmatched statement lines ({unmatchedStatement.length})</span>
                              </div>
                              <div className="table-responsive" style={{ maxHeight: 420, overflowY: "auto" }}>
                                   <table className="table table-sm table-hover align-middle mb-0">
                                        <tbody>
                                             {unmatchedStatement.length === 0 && (
                                                  <tr>
                                                       <td className="text-center text-muted py-4">Nothing outstanding on the statement</td>
                                                  </tr>
                                             )}
                                             {unmatchedStatement.map((line) => (
                                                  <tr
                                                       key={line.id}
                                                       className={selectedStatement === line.id ? "table-primary" : ""}
                                                       style={{ cursor: "pointer" }}
                                                       onClick={() => setSelectedStatement(line.id)}
                                                  >
                                                       <td>
                                                            <div className="small text-muted">
                                                                 {dayjs(line.txn_date).format("DD MMM YYYY")}
                                                                 {line.reference ? ` \u00b7 ${line.reference}` : ""}
                                                            </div>
                                                            {line.description || "No description"}
                                                       </td>
                                                       <td className={`text-end ${Number(line.amount) < 0 ? "text-danger" : ""}`}>
                                                            {money(line.amount)}
                                                       </td>
                                                       <td className="text-end">
                                                            <button
                                                                 className="btn btn-sm btn-outline-secondary"
                                                                 disabled={busy}
                                                                 onClick={(event) => {
                                                                      event.stopPropagation();
                                                                      act(line.id, "ignore");
                                                                 }}
                                                            >
                                                                 Ignore
                                                            </button>
                                                       </td>
                                                  </tr>
                                             ))}
                                        </tbody>
                                   </table>
                              </div>
                         </div>
                    </div>

                    <div className="col-12 col-lg-6">
                         <div className="card border-0 shadow-sm h-100">
                              <div className="card-header bg-white d-flex justify-content-between align-items-center">
                                   <span className="fw-semibold">Unmatched ledger postings ({ledgerLines.length})</span>
                                   <button className="btn btn-sm btn-primary" onClick={matchSelected} disabled={busy || !selectedStatement || !selectedLedger}>
                                        Match selected
                                   </button>
                              </div>
                              <div className="table-responsive" style={{ maxHeight: 420, overflowY: "auto" }}>
                                   <table className="table table-sm table-hover align-middle mb-0">
                                        <tbody>
                                             {ledgerLines.length === 0 && (
                                                  <tr>
                                                       <td className="text-center text-muted py-4">Everything in this range is matched</td>
                                                  </tr>
                                             )}
                                             {ledgerLines.map((line) => (
                                                  <tr
                                                       key={line.journal_line_id}
                                                       className={selectedLedger === line.journal_line_id ? "table-primary" : ""}
                                                       style={{ cursor: "pointer" }}
                                                       onClick={() => setSelectedLedger(line.journal_line_id)}
                                                  >
                                                       <td>
                                                            <div className="small text-muted">
                                                                 {dayjs(line.occurred_at).format("DD MMM YYYY")} &middot; {line.source_module}
                                                            </div>
                                                            {line.description || `Journal #${line.journal_entry_id}`}
                                                       </td>
                                                       <td className={`text-end ${line.signedAmount < 0 ? "text-danger" : ""}`}>
                                                            {money(line.signedAmount)}
                                                       </td>
                                                  </tr>
                                             ))}
                                        </tbody>
                                   </table>
                              </div>
                         </div>
                    </div>
               </div>

               <div className="card border-0 shadow-sm mt-3">
                    <div className="card-header bg-white d-flex justify-content-between align-items-center">
                         <span className="fw-semibold d-inline-flex align-items-center gap-2">
                              <RiUploadLine size={18} /> Import statement
                         </span>
                         <Link className="btn btn-sm btn-outline-secondary" href="/accounting/bank-accounts">
                              Excel format guide
                         </Link>
                    </div>
                    <div className="card-body">
                         <input
                              type="file"
                              className="form-control"
                              accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                              onChange={async (event) => {
                                   const file = event.target.files?.[0] || null;
                                   setSelectedFile(file);
                                   setParsed({ lines: [], problems: [] });
                                   if (!file) return;
                                   if (!/\.xlsx$/i.test(file.name)) {
                                        toast.error("Only .xlsx Excel workbooks are accepted");
                                        event.currentTarget.value = "";
                                        setSelectedFile(null);
                                        return;
                                   }
                                   try {
                                        setParsed(await readExcelFile(file));
                                   } catch (error: any) {
                                        toast.error(error?.message || "Unable to read the Excel file");
                                   }
                              }}
                         />

                         <div className="d-flex justify-content-between align-items-center mt-2 flex-wrap gap-2">
                              <div className="small">
                                   {parsed.lines.length > 0 && (
                                        <span className="text-success">{parsed.lines.length} line(s) ready. </span>
                                   )}
                                   {selectedFile && <span className="text-muted">{selectedFile.name}. </span>}
                                   {parsed.problems.length > 0 && (
                                        <span className="text-danger">{parsed.problems.slice(0, 3).join("; ")}</span>
                                   )}
                                   {parsed.lines.length === 0 && parsed.problems.length === 0 && (
                                        <span className="text-muted">
                                             Select an Excel workbook (.xlsx). The first worksheet is read and a header row is skipped
                                             automatically.
                                        </span>
                                   )}
                              </div>
                              <button
                                   className="btn btn-primary"
                                   onClick={runImport}
                                   disabled={busy || !bankAccountId || parsed.lines.length === 0}
                              >
                                   {busy ? "Importing..." : `Import ${parsed.lines.length} line(s)`}
                              </button>
                         </div>
                    </div>
               </div>
          </ReportShell>
     );
}
