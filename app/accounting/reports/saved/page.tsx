"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
     DatasetMeta,
     ReportResult,
     SavedReport,
     deleteSavedReport,
     downloadSavedReport,
     fetchReportDatasets,
     listSavedReports,
     runSavedReport,
} from "../../../../lib/reports/reportApi";

function formatCell(value: unknown): string {
     if (value === null || value === undefined || value === "") return "—";
     if (typeof value === "number") return value.toLocaleString("en-GB", { maximumFractionDigits: 2 });
     if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}T/.test(value)) return value.slice(0, 10);
     return String(value);
}

function formatDate(value: string | null | undefined): string {
     if (!value) return "—";
     const date = new Date(value);
     return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" });
}

function ResultTable({ result, title }: { result: ReportResult; title: string }) {
     return (
          <div className="border rounded p-2 mb-3">
               <div className="d-flex justify-content-between align-items-center mb-2">
                    <h3 className="h6 mb-0">{title}</h3>
                    <span className="text-muted small">{result.rows.length} row{result.rows.length === 1 ? "" : "s"}{result.grouped ? " · grouped" : ""}</span>
               </div>
               <div className="table-responsive" style={{ maxHeight: "55vh" }}>
                    <table className="table table-sm table-striped align-middle mb-0">
                         <caption className="visually-hidden">{title}</caption>
                         <thead className="table-light" style={{ position: "sticky", top: 0, zIndex: 1 }}>
                              <tr>{result.columns.map((column) => <th key={column.key} scope="col" className="text-nowrap">{column.label}</th>)}</tr>
                         </thead>
                         <tbody>
                              {result.rows.map((row, index) => (
                                   <tr key={index}>
                                        {result.columns.map((column) => (
                                             <td key={column.key} className={column.type === "money" || column.type === "number" || column.type === "count" ? "text-end text-nowrap" : ""}>
                                                  {formatCell(row[column.key])}
                                             </td>
                                        ))}
                                   </tr>
                              ))}
                              {result.rows.length === 0 && (
                                   <tr><td colSpan={result.columns.length} className="text-center text-muted py-3">No rows match this report.</td></tr>
                              )}
                         </tbody>
                    </table>
               </div>
          </div>
     );
}

export default function SavedReportsPage() {
     const [reports, setReports] = useState<SavedReport[]>([]);
     const [datasets, setDatasets] = useState<DatasetMeta[]>([]);
     const [loading, setLoading] = useState(true);
     const [error, setError] = useState<string | null>(null);
     const [notice, setNotice] = useState<string | null>(null);
     const [busyId, setBusyId] = useState("");
     const [result, setResult] = useState<{ id: string; title: string; data: ReportResult } | null>(null);

     const datasetLabels = useMemo(() => new Map(datasets.map((dataset) => [dataset.id, dataset.label])), [datasets]);

     const load = useCallback(async () => {
          setLoading(true);
          setError(null);
          try {
               const [loadedReports, loadedDatasets] = await Promise.all([listSavedReports(), fetchReportDatasets()]);
               setReports(loadedReports);
               setDatasets(loadedDatasets);
          } catch (loadError: any) {
               setError(loadError?.message || "Unable to load saved reports.");
          } finally {
               setLoading(false);
          }
     }, []);

     useEffect(() => {
          let active = true;
          Promise.all([listSavedReports(), fetchReportDatasets()])
               .then(([loadedReports, loadedDatasets]) => {
                    if (!active) return;
                    setReports(loadedReports);
                    setDatasets(loadedDatasets);
               })
               .catch((loadError: any) => {
                    if (active) setError(loadError?.message || "Unable to load saved reports.");
               })
               .finally(() => {
                    if (active) setLoading(false);
               });
          return () => { active = false; };
     }, []);

     const run = async (report: SavedReport) => {
          setBusyId(report.id);
          setError(null);
          setNotice(null);
          try {
               const data = await runSavedReport(report.id);
               setResult({ id: report.id, title: report.name, data });
          } catch (runError: any) {
               setError(runError?.message || "Unable to run the report.");
          } finally {
               setBusyId("");
          }
     };

     const download = async (report: SavedReport, format: "csv" | "xlsx") => {
          setBusyId(report.id);
          setError(null);
          setNotice(null);
          try {
               await downloadSavedReport(report.id, format, report.name);
          } catch (downloadError: any) {
               setError(downloadError?.message || "The export could not be created.");
          } finally {
               setBusyId("");
          }
     };

     const remove = async (report: SavedReport) => {
          if (!window.confirm(`Delete “${report.name}”? The saved definition is removed; no source data is affected.`)) return;
          setBusyId(report.id);
          setError(null);
          try {
               await deleteSavedReport(report.id);
               setReports((current) => current.filter((entry) => entry.id !== report.id));
               if (result?.id === report.id) setResult(null);
               setNotice(`Deleted “${report.name}”.`);
          } catch (removeError: any) {
               setError(removeError?.message || "Unable to delete the report.");
          } finally {
               setBusyId("");
          }
     };

     return (
          <div className="container-fluid py-4">
               <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-3">
                    <div>
                         <h1 className="h3 mb-1">Saved reports</h1>
                         <p className="text-muted mb-0">Re-run, export or delete reports saved by you or shared with the facility.</p>
                    </div>
                    <div className="d-flex gap-2">
                         <Link className="btn btn-outline-secondary btn-sm" href="/accounting/reports">Reports centre</Link>
                         <Link className="btn btn-primary btn-sm" href="/accounting/reports/builder">Build a report</Link>
                    </div>
               </div>

               {error && (
                    <div className="alert alert-danger d-flex justify-content-between align-items-center" role="alert">
                         <span>{error}</span>
                         <div className="d-flex gap-2">
                              <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => void load()}>Retry</button>
                              <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => setError(null)}>Dismiss</button>
                         </div>
                    </div>
               )}
               {notice && (
                    <div className="alert alert-success d-flex justify-content-between align-items-center" role="status">
                         <span>{notice}</span>
                         <button type="button" className="btn btn-sm btn-outline-success" onClick={() => setNotice(null)}>Dismiss</button>
                    </div>
               )}

               {result && <ResultTable result={result.data} title={result.title} />}

               <div className="card">
                    <div className="card-body">
                         {loading && <p className="text-muted mb-0" role="status">Loading saved reports…</p>}
                         {!loading && reports.length === 0 && (
                              <div className="text-center text-muted py-4" role="status">
                                   <p className="mb-1">No saved reports yet.</p>
                                   <Link href="/accounting/reports/builder">Build the first one</Link>.
                              </div>
                         )}
                         {!loading && reports.length > 0 && (
                              <div className="table-responsive">
                                   <table className="table table-hover align-middle mb-0">
                                        <caption className="visually-hidden">Saved reports</caption>
                                        <thead className="table-light">
                                             <tr>
                                                  <th scope="col">Name</th>
                                                  <th scope="col">Dataset</th>
                                                  <th scope="col">Visibility</th>
                                                  <th scope="col">Updated</th>
                                                  <th scope="col" className="text-end">Actions</th>
                                             </tr>
                                        </thead>
                                        <tbody>
                                             {reports.map((report) => (
                                                  <tr key={report.id}>
                                                       <td>
                                                            <div className="fw-semibold">{report.name}</div>
                                                            {report.description && <div className="text-muted small">{report.description}</div>}
                                                       </td>
                                                       <td className="text-nowrap">{datasetLabels.get(report.dataset) ?? report.dataset}</td>
                                                       <td>
                                                            <span className={`badge ${report.visibility === "facility" ? "text-bg-info" : "text-bg-secondary"} fw-normal`}>
                                                                 {report.visibility === "facility" ? "Facility" : "Private"}
                                                            </span>
                                                       </td>
                                                       <td className="text-nowrap">{formatDate(report.updated_at)}</td>
                                                       <td className="text-end text-nowrap">
                                                            <div className="btn-group btn-group-sm" role="group" aria-label={`Actions for ${report.name}`}>
                                                                 <button type="button" className="btn btn-outline-primary" onClick={() => void run(report)} disabled={busyId === report.id}>
                                                                      {busyId === report.id ? "Working…" : "Run"}
                                                                 </button>
                                                                 <button type="button" className="btn btn-outline-secondary" onClick={() => void download(report, "xlsx")} disabled={busyId === report.id}>Excel</button>
                                                                 <button type="button" className="btn btn-outline-secondary" onClick={() => void download(report, "csv")} disabled={busyId === report.id}>CSV</button>
                                                                 <button type="button" className="btn btn-outline-danger" onClick={() => void remove(report)} disabled={busyId === report.id}>Delete</button>
                                                            </div>
                                                       </td>
                                                  </tr>
                                             ))}
                                        </tbody>
                                   </table>
                              </div>
                         )}
                    </div>
               </div>
          </div>
     );
}
