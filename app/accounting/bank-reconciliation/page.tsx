"use client";
import { RiBankLine, RiCheckboxCircleLine, RiErrorWarningLine, RiMagicLine, RiUploadLine } from "@remixicon/react";
import dayjs from "dayjs";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";
import ReportShell from "../../../components/accounting/ReportShell";
import { currencyFormatter } from "../../../components/Auth/customFetch";
import { accountingApi, BankAccount } from "../../../lib/accounting/accountingApi";
import { parseBankStatement, type BankDateFormat } from "../../../lib/accounting/bankStatement";

function money(value: number): string {
     return currencyFormatter.format(Number(value || 0));
}

async function readExcelFile(file: File, format: BankDateFormat) {
     const workbook = XLSX.read(await file.arrayBuffer(), { type: "array", cellDates: true });
     const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
     if (!firstSheet) throw new Error("The workbook has no worksheet");
     return parseBankStatement(XLSX.utils.sheet_to_json(firstSheet, { header: 1, raw: true, defval: "" }) as unknown[][], format, !!workbook.Workbook?.WBProps?.date1904);
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
     const [dateFormat, setDateFormat] = useState<BankDateFormat>("DMY");
     const [statementPage, setStatementPage] = useState(1);
     const [statementTotal, setStatementTotal] = useState<number | null>(null);
     const [loadError, setLoadError] = useState("");
     const latestRequest = useRef(0);
     const latestPreview = useRef(0);
     const [previewLoading, setPreviewLoading] = useState(false);
     const context = JSON.stringify([bankAccountId, from, to, statementBalance, statementPage]);
     const [loadedContext, setLoadedContext] = useState("");
     const ready = !!summary && !busy && !loadError && loadedContext === context;

     const readPreview = async (file: File, format: BankDateFormat) => {
          const requestId = ++latestPreview.current;
          setPreviewLoading(true);
          setParsed({ lines: [], problems: [] });
          try {
               const preview = await readExcelFile(file, format);
               if (requestId === latestPreview.current) setParsed(preview);
          } catch (error) {
               if (requestId === latestPreview.current) toast.error(error instanceof Error ? error.message : "Unable to read the Excel file");
          } finally {
               if (requestId === latestPreview.current) setPreviewLoading(false);
          }
     };

     useEffect(() => {
          let active = true;
          accountingApi.bankAccounts().then((response) => {
               if (!active) return;
               if (response?.status !== "success" || !Array.isArray(response.result)) throw new Error(response?.message || "Unable to load bank accounts");
               const list = response.result;
               setAccounts(list);

               const requested = Number(params?.get("account"));
               const preferred = list.find((account) => account.id === requested) || list[0];
               if (preferred) setBankAccountId(Number(preferred.id));
          }).catch(error => { if (active) setLoadError(error instanceof Error ? error.message : "Unable to load bank accounts"); });
          return () => { active = false; };
          // eslint-disable-next-line react-hooks/exhaustive-deps
     }, []);

     const load = useCallback(async () => {
          if (!bankAccountId) return;
          const requestId = ++latestRequest.current;
          setBusy(true);
          setLoadError("");
          setSummary(null);
          setStatementLines([]);
          setLedgerLines([]);
          setSelectedStatement(null);
          setSelectedLedger(null);
          try {
               const [linesRes, ledgerRes, summaryRes] = await Promise.all([
                    accountingApi.bankStatementLines(bankAccountId, { from, to, status: "unmatched", page: statementPage, count: 200 }),
                    accountingApi.bankUnmatchedLedger(bankAccountId, from, to),
                    accountingApi.bankSummary(bankAccountId, to, Number(statementBalance || 0)),
               ]);

               if (requestId !== latestRequest.current) return;
               if (linesRes?.status !== "success" || !Array.isArray(linesRes.result?.data) || !Number.isSafeInteger(Number(linesRes.result.total)) ||
                    ledgerRes?.status !== "success" || !Array.isArray(ledgerRes.result) || summaryRes?.status !== "success" || !summaryRes.result ||
                    !["glBalance", "outstandingDeposits", "outstandingPayments", "adjustedBankBalance", "statementBalance", "difference"].every(key =>
                         typeof summaryRes.result[key] === "number" && Number.isFinite(summaryRes.result[key])))
                    throw new Error("The reconciliation is unavailable or incomplete. No balance has been verified.");
               setStatementTotal(Number(linesRes.result.total));
               const lastPage = Math.max(1, Math.ceil(Number(linesRes.result.total) / 200));
               if (statementPage > lastPage) { setStatementPage(lastPage); return; }
               setStatementLines(linesRes.result.data);
               setLedgerLines(ledgerRes.result);
               setSummary(summaryRes.result);
               setLoadedContext(context);
          } catch (error) {
               if (requestId === latestRequest.current) setLoadError(error instanceof Error ? error.message : "Unable to load the reconciliation");
          } finally {
               if (requestId === latestRequest.current) setBusy(false);
          }
     }, [bankAccountId, from, to, statementBalance, statementPage, context]);

     useEffect(() => {
          void load();
          return () => { latestRequest.current++; };
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

               if (parsed.problems.length > 0) throw new Error("Correct all statement preview errors before importing.");
               const response: any = await accountingApi.importBankExcel(bankAccountId, selectedFile, dateFormat);
               if (response?.status !== "success") throw new Error(response?.message || "Import failed");
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
          if (!bankAccountId || !ready) return;
          setBusy(true);
          try {
               const suggestions = await accountingApi.bankSuggestions(bankAccountId, from, to);
               if (suggestions?.status !== "success" || !Array.isArray(suggestions.result)) throw new Error(suggestions?.message || "Unable to load matching suggestions");
               const pairs = (suggestions?.result || []).map((s: any) => ({
                    statementLineId: s.statementLineId,
                    journalLineId: s.journalLineId,
               }));

               if (pairs.length === 0) {
                    toast.info("No confident matches found");
                    return;
               }

               const response: any = await accountingApi.bankMatchMany(pairs);
               if (response?.status !== "success") throw new Error(response?.message || "Auto-match failed");
               toast.success(`Matched ${response?.result?.matched} of ${pairs.length}`);
               await load();
          } catch (error: any) {
               toast.error(error?.message || "Auto-match failed");
          } finally {
               setBusy(false);
          }
     };

     const matchSelected = async () => {
          if (!ready) { toast.error("Wait for the selected reconciliation to load before matching."); return; }
          if (!selectedStatement || !selectedLedger) {
               toast.error("Pick one statement line and one ledger posting");
               return;
          }

          setBusy(true);
          try {
               const response: any = await accountingApi.bankMatch(selectedStatement, selectedLedger);
               if (response?.status !== "success") throw new Error(response?.message || "Unable to match");
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
          if (!ready) { toast.error("Wait for the selected reconciliation to load."); return; }
          setBusy(true);
          try {
               const response = await (action === "unmatch" ? accountingApi.bankUnmatch(id) : accountingApi.bankIgnore(id));
               if (response?.status !== "success") throw new Error(response?.message || `Unable to ${action}`);
               await load();
          } catch (error: any) {
               toast.error(error?.message || `Unable to ${action}`);
          } finally {
               setBusy(false);
          }
     };

     const unmatchedStatement = ready ? statementLines.filter((line) => line.status === "unmatched") : [];
     const reconciled = ready && summary && Math.round(Number(summary.difference) * 100) === 0;

     return (
          <ReportShell
               exportable={ready}
               title="Bank Reconciliation"
               subtitle="Match the ledger against the bank statement and explain the difference"
               filters={
                    <>
                         <div className="col-12 col-md-3">
                              <label className="form-label mb-1 small text-muted">Bank account</label>
                              <select
                                   className="form-select form-select-sm"
                                   value={bankAccountId ?? ""}
                                   onChange={(e) => { setSummary(null); setBankAccountId(Number(e.target.value)); setStatementPage(1); }}
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
                              <input type="date" className="form-control form-control-sm" value={from} onChange={(e) => { setSummary(null); setFrom(e.target.value); setStatementPage(1); }} />
                         </div>
                         <div className="col-6 col-md-2">
                              <label className="form-label mb-1 small text-muted">To</label>
                              <input type="date" className="form-control form-control-sm" value={to} onChange={(e) => { setSummary(null); setTo(e.target.value); setStatementPage(1); }} />
                         </div>
                         <div className="col-6 col-md-2">
                              <label className="form-label mb-1 small text-muted">Statement balance</label>
                              <input
                                   type="number"
                                   step="0.01"
                                   className="form-control form-control-sm text-end"
                                   placeholder="0.00"
                                   value={statementBalance}
                                   onChange={(e) => { setSummary(null); setStatementBalance(e.target.value); }}
                              />
                         </div>
                         <div className="col-6 col-md-3 d-flex gap-2">
                              <button className="btn btn-sm btn-primary flex-fill" onClick={load} disabled={busy || !bankAccountId}>
                                   {busy ? "Working..." : "Refresh"}
                              </button>
                              <button className="btn btn-sm btn-outline-primary flex-fill d-inline-flex align-items-center justify-content-center gap-1" onClick={autoMatch} disabled={!ready || !bankAccountId}>
                                   <RiMagicLine size={16} /> Auto-match
                              </button>
                         </div>
                    </>
               }
          >
               <div className="mb-3"><Link href="/accounting/control-history" className="btn btn-sm btn-outline-secondary">View control history</Link></div>
               {loadError && <div role="alert" className="alert alert-danger">{loadError}<button type="button" className="btn btn-sm btn-outline-danger ms-2" onClick={load}>Retry reconciliation</button></div>}
               {busy && <p role="status">Updating reconciliation...</p>}
               {!loadError && accounts.length === 0 && (
                    <div className="alert alert-warning d-flex align-items-center justify-content-between flex-wrap gap-2 py-2">
                         <span>No bank accounts have been set up yet, so there is nothing to reconcile.</span>
                         <Link className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1" href="/accounting/bank-accounts">
                              <RiBankLine size={16} /> Set up bank accounts
                         </Link>
                    </div>
               )}


               {ready && summary && (
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
                                   <span className="fw-semibold">Unmatched statement lines ({statementTotal ?? "not verified"})</span>
                              </div>
                              <div className="table-responsive" style={{ maxHeight: 420, overflowY: "auto" }}>
                                   <table className="table table-sm table-hover align-middle mb-0">
                                        <tbody>
                                             {unmatchedStatement.length === 0 && !busy && !loadError && statementTotal === 0 && (
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
                              <nav className="d-flex align-items-center gap-2 p-2" aria-label="Statement pagination">
                                   <button type="button" className="btn btn-sm btn-outline-secondary" disabled={busy || statementPage === 1} onClick={() => setStatementPage(page => page - 1)}>Previous statement page</button>
                                   <span>Page {statementPage} of {Math.max(1, Math.ceil((statementTotal || 0) / 200))} · {unmatchedStatement.length} shown</span>
                                   <button type="button" className="btn btn-sm btn-outline-secondary" disabled={busy || statementTotal == null || statementPage * 200 >= statementTotal} onClick={() => setStatementPage(page => page + 1)}>Next statement page</button>
                              </nav>
                         </div>
                    </div>

                    <div className="col-12 col-lg-6">
                         <div className="card border-0 shadow-sm h-100">
                              <div className="card-header bg-white d-flex justify-content-between align-items-center">
                                   <span className="fw-semibold">Unmatched ledger postings ({ledgerLines.length})</span>
                                   <button className="btn btn-sm btn-primary" onClick={matchSelected} disabled={!ready || !selectedStatement || !selectedLedger}>
                                        Match selected
                                   </button>
                              </div>
                              <div className="table-responsive" style={{ maxHeight: 420, overflowY: "auto" }}>
                                   <table className="table table-sm table-hover align-middle mb-0">
                                        <tbody>
                                             {ledgerLines.length === 0 && !busy && !loadError && summary && (
                                                  <tr>
                                                       <td className="text-center text-muted py-4">Everything in this range is matched</td>
                                                  </tr>
                                             )}
                                             {(ready ? ledgerLines : []).map((line) => (
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
                         <label htmlFor="bank-text-date-format" className="form-label">Text date format in workbook</label>
                         <select id="bank-text-date-format" className="form-select mb-2" value={dateFormat} disabled={busy} onChange={event => {
                              const format = event.target.value as BankDateFormat;
                              setDateFormat(format); setParsed({ lines: [], problems: [] });
                              if (selectedFile) void readPreview(selectedFile, format);
                         }}><option value="DMY">DD/MM/YYYY (day first)</option><option value="MDY">MM/DD/YYYY (month first)</option><option value="YMD">YYYY/MM/DD (year first)</option></select>
                         <input
                              type="file"
                              className="form-control"
                              accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                              onChange={async (event) => {
                                   const file = event.target.files?.[0] || null;
                                   setSelectedFile(file);
                                   setParsed({ lines: [], problems: [] });
                                   latestPreview.current++;
                                   setPreviewLoading(false);
                                   if (!file) return;
                                   if (!/\.xlsx$/i.test(file.name)) {
                                        toast.error("Only .xlsx Excel workbooks are accepted");
                                        event.currentTarget.value = "";
                                        setSelectedFile(null);
                                        return;
                                   }
                                   void readPreview(file, dateFormat);
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
                                   disabled={busy || previewLoading || !bankAccountId || parsed.lines.length === 0 || parsed.problems.length > 0}
                              >
                                   {busy ? "Importing..." : `Import ${parsed.lines.length} line(s)`}
                              </button>
                         </div>
                    </div>
               </div>
          </ReportShell>
     );
}
