"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { RiArrowLeftLine, RiDownloadLine, RiPrinterLine, RiRefreshLine } from "@remixicon/react";
import { customFetch } from "../../../components/Auth/customFetch";
import { useApplication, useApplicationSettings } from "../../../components/Auth/useApplicationContext";
import LaboratoryReport, { LaboratoryReportData } from "../../../components/ResultView/LaboratoryReport";
import { createLaboratoryReportPdf, laboratoryReportFilename } from "../../../lib/laboratoryReportPdf";
import { quickResultRows } from "../../../lib/patientPortal";

type StageStatus = "completed" | "bypassed" | "in_progress" | "pending" | "rejected";

interface TimelineStep {
     key: string;
     label: string;
     status: StageStatus;
     at: string | null;
     startedAt?: string | null;
     by?: string | null;
     mode?: string | null;
     note?: string | null;
}

interface ClinicianTest {
     ascensionid: number;
     testid: number;
     testname: string;
     current_stage: string;
     blockedReason: string | null;
     approved: boolean;
     reportUnavailable: boolean;
     timeline: TimelineStep[];
}

interface ClinicianResults {
     billingid: number;
     patientid: number;
     patient: {
          fullpatientid?: string; firstname?: string; middlename?: string; lastname?: string;
          gender?: string; age?: number | string; agetype?: string; billedon?: string; payment_status?: string;
     } | null;
     tests: ClinicianTest[];
     reports: LaboratoryReportData[];
}

const PRINT_ONLY_REPORT = `
@media print {
     @page { size: A4 portrait; margin: 5mm; }
     body * { visibility: hidden !important; }
     #pls-doctor-report, #pls-doctor-report * { visibility: visible !important; }
     #pls-doctor-report { position: absolute !important; left: 0 !important; top: 0 !important; width: 100%; }
     #pls-doctor-report [data-laboratory-report] { break-before: page; width: 100%; margin: 0; }
     #pls-doctor-report [data-laboratory-report]:first-child { break-before: auto; }
     #pls-doctor-report thead { display: table-header-group; }
     #pls-doctor-report tr { break-inside: avoid; }
}`;

const STATUS_STYLE: Record<StageStatus, { badge: string; label: string }> = {
     completed: { badge: "bg-success", label: "Done" },
     bypassed: { badge: "bg-secondary", label: "Not required" },
     in_progress: { badge: "bg-info text-dark", label: "In progress" },
     pending: { badge: "bg-light text-muted border", label: "Pending" },
     rejected: { badge: "bg-danger", label: "Rejected" },
};

function formatDateTime(value?: string | null) {
     if (!value) return "";
     const date = new Date(value);
     return Number.isNaN(date.getTime()) ? "" : date.toLocaleString();
}

function stageBadge(test: ClinicianTest) {
     if (test.approved) return "bg-success";
     const stage = (test.current_stage || "").toLowerCase();
     if (stage.includes("completed")) return "bg-primary";
     if (stage.includes("pending")) return "bg-warning text-dark";
     return "bg-info text-dark";
}

function TestTimeline({ test }: { test: ClinicianTest }) {
     return (
          <div className="d-flex flex-wrap gap-2">
               {test.timeline.map((step) => {
                    const style = STATUS_STYLE[step.status] || STATUS_STYLE.pending;
                    const at = formatDateTime(step.at);
                    const startedAt = formatDateTime(step.startedAt);
                    return (
                         <div key={step.key} className="border rounded p-2" style={{ minWidth: 170, flex: "1 1 170px" }}>
                              <div className="d-flex justify-content-between align-items-center gap-2">
                                   <span className="fw-semibold" style={{ fontSize: "0.85rem" }}>{step.label}</span>
                                   <span className={`badge ${style.badge}`}>{style.label}</span>
                              </div>
                              <div className="text-muted mt-1" style={{ fontSize: "0.8rem" }}>
                                   {at ? <div>{at}</div> : startedAt ? <div>Started {startedAt}</div> : <div>—</div>}
                                   {step.by && <div>By {step.by}</div>}
                                   {step.mode && <div>Mode: {step.mode}</div>}
                                   {step.note && <div className="text-danger">{step.note}</div>}
                              </div>
                         </div>
                    );
               })}
          </div>
     );
}

function ResultTable({ report }: { report: LaboratoryReportData }) {
     const rows = quickResultRows(report.records);
     if (!rows.length) return <div className="text-muted">No tabular values. See the formal report.</div>;
     return (
          <div className="table-responsive">
               <table className="table table-sm table-bordered align-middle mb-0">
                    <thead className="table-light">
                         <tr><th>Parameter</th><th>Value</th><th>Unit</th><th>Reference range</th><th>Flag</th></tr>
                    </thead>
                    <tbody>
                         {rows.map((row, index) => (
                              <tr key={`${row.name}-${index}`} className={row.flag ? "table-warning" : ""}>
                                   <td>{row.name}</td>
                                   <td className="fw-semibold">{row.rich ? <span className="fw-normal text-muted">See formal report</span> : row.value || "—"}</td>
                                   <td>{row.rich ? "" : row.units}</td>
                                   <td>{row.reference}</td>
                                   <td>{row.flag === "H" ? <span className="badge bg-danger">High</span> : row.flag === "L" ? <span className="badge bg-warning text-dark">Low</span> : ""}</td>
                              </tr>
                         ))}
                    </tbody>
               </table>
          </div>
     );
}

export default function DoctorRequestResultsPage() {
     const searchParams = useSearchParams();
     const billingid = Number(searchParams?.get("billingid"));
     const validBill = Number.isSafeInteger(billingid) && billingid > 0;
     const { applicationsettings } = useApplicationSettings();
     const app = useApplication();
     const user = applicationsettings?.user;
     const clinicianid = Number(user?.clinicianid ?? user?.id ?? user?.employeeid ?? 0);

     const [data, setData] = useState<ClinicianResults | null>(null);
     const [loading, setLoading] = useState(false);
     const [error, setError] = useState("");
     const [view, setView] = useState<"table" | "report">("table");
     const [exporting, setExporting] = useState(false);
     const [pdf, setPdf] = useState<string | null>(null);
     const reportRef = useRef<HTMLDivElement>(null);

     const load = useCallback(async () => {
          if (!validBill || !clinicianid) return;
          setLoading(true);
          setError("");
          try {
               const response = await customFetch(`clinician-portal/results/${billingid}?clinicianid=${clinicianid}`);
               if (response?.status === "success" && response.result) setData(response.result);
               else {
                    setData(null);
                    setError(response?.message || response?.error || "Unable to load this request.");
               }
          } catch {
               setError("Unable to load this request. Please try again.");
          } finally {
               setLoading(false);
          }
     }, [billingid, clinicianid, validBill]);

     useEffect(() => { load(); }, [load]);
     useEffect(() => { setPdf(null); }, [data]);
     useEffect(() => () => { if (pdf) URL.revokeObjectURL(pdf); }, [pdf]);

     const reportsByAscension = useMemo(() => {
          const map = new Map<number, LaboratoryReportData>();
          (data?.reports || []).forEach((report: any) => map.set(Number(report.ascensionid), report));
          return map;
     }, [data]);

     const exportPdf = async () => {
          if (exporting || !reportRef.current) return;
          setExporting(true);
          setError("");
          try {
               const elements = Array.from(reportRef.current.querySelectorAll<HTMLElement>(".result"));
               const blob = await createLaboratoryReportPdf(elements);
               setPdf(URL.createObjectURL(blob));
          } catch (reason) {
               setError(reason instanceof Error && reason.message ? reason.message : "Unable to generate the PDF.");
          } finally {
               setExporting(false);
          }
     };

     const patient = data?.patient;
     const patientName = [patient?.firstname, patient?.middlename, patient?.lastname].filter(Boolean).join(" ");
     const hasReports = !!data?.reports?.length;
     const approvedCount = data?.tests.filter((test) => test.approved).length || 0;

     return (
          <div className="p-2 container-fluid">
               <style>{PRINT_ONLY_REPORT}</style>
               <div className="d-flex flex-wrap justify-content-between align-items-start gap-2 mb-3">
                    <div>
                         <Link href="/doctor/requested-test" className="d-inline-flex align-items-center gap-1">
                              <RiArrowLeftLine size={16} /> Back to requested tests
                         </Link>
                         <h3 className="mt-2 mb-0" style={{ fontWeight: 700 }}>Request #{validBill ? billingid : "—"}</h3>
                         {patient && (
                              <div className="text-muted" style={{ fontSize: "0.9rem" }}>
                                   {patientName || `Patient #${data?.patientid}`}
                                   {patient.fullpatientid ? ` • ${patient.fullpatientid}` : ""}
                                   {patient.gender ? ` • ${patient.gender}` : ""}
                                   {patient.age ? ` • ${patient.age} ${patient.agetype || ""}` : ""}
                                   {patient.billedon ? ` • Requested ${formatDateTime(patient.billedon)}` : ""}
                              </div>
                         )}
                    </div>
                    <div className="d-flex flex-wrap gap-2">
                         <button className="btn btn-outline-secondary d-flex align-items-center gap-1" onClick={load} disabled={loading}>
                              <RiRefreshLine size={16} /> {loading ? "Loading..." : "Refresh"}
                         </button>
                         {hasReports && (
                              <>
                                   <div className="btn-group" role="group" aria-label="Result view">
                                        <button className={`btn ${view === "table" ? "btn-primary" : "btn-outline-primary"}`} onClick={() => setView("table")}>Table</button>
                                        <button className={`btn ${view === "report" ? "btn-primary" : "btn-outline-primary"}`} onClick={() => setView("report")}>Report</button>
                                   </div>
                                   <button className="btn btn-outline-primary d-flex align-items-center gap-1" onClick={() => window.print()} disabled={exporting}>
                                        <RiPrinterLine size={16} /> Print
                                   </button>
                                   <button className="btn btn-primary d-flex align-items-center gap-1" onClick={exportPdf} disabled={exporting}>
                                        <RiDownloadLine size={16} /> {exporting ? "Preparing PDF..." : "Generate PDF"}
                                   </button>
                              </>
                         )}
                    </div>
               </div>

               {!validBill && <div className="alert alert-danger">This request link is not valid.</div>}
               {validBill && !clinicianid && <div className="alert alert-warning">Clinician profile not found.</div>}
               {error && <div className="alert alert-danger">{error}</div>}
               {loading && !data && (
                    <div className="text-center py-5">
                         <div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div>
                    </div>
               )}

               {pdf && (
                    <div className="card mb-3">
                         <div className="card-body">
                              <a href={pdf} download={laboratoryReportFilename(billingid)} className="btn btn-primary mb-2">Download PDF</a>
                              <iframe src={pdf} title="Laboratory report PDF" style={{ width: "100%", height: 600, border: 0 }} />
                         </div>
                    </div>
               )}

               {data && (
                    <>
                         <div className="d-flex flex-wrap gap-2 mb-3">
                              <span className="badge bg-primary">Tests: {data.tests.length}</span>
                              <span className="badge bg-success">Results ready: {approvedCount}</span>
                              <span className="badge bg-secondary">Awaiting results: {data.tests.length - approvedCount}</span>
                         </div>
                         {!data.tests.length && <div className="alert alert-secondary">No laboratory tests on this request are linked to you.</div>}

                         {view === "table" && data.tests.map((test) => {
                              const report = reportsByAscension.get(test.ascensionid);
                              return (
                                   <div key={test.ascensionid} className="card border-0 shadow-sm mb-3">
                                        <div className="card-header bg-white d-flex flex-wrap justify-content-between align-items-center gap-2">
                                             <span className="fw-semibold">{test.testname}</span>
                                             <span className={`badge ${stageBadge(test)}`}>{test.approved ? "Results ready" : test.current_stage}</span>
                                        </div>
                                        <div className="card-body">
                                             <TestTimeline test={test} />
                                             {test.blockedReason && <div className="text-muted mt-2" style={{ fontSize: "0.85rem" }}>Next step: {test.blockedReason}</div>}
                                             <div className="mt-3">
                                                  {report ? <ResultTable report={report} />
                                                       : test.approved && test.reportUnavailable ? <div className="alert alert-warning mb-0">The result is validated but could not be loaded. Please refresh or contact the laboratory.</div>
                                                            : test.approved ? <div className="text-muted">Results are shown in the formal report for this test.</div>
                                                                 : <div className="text-muted">Results will appear here once the laboratory has validated them.</div>}
                                             </div>
                                        </div>
                                   </div>
                              );
                         })}
                    </>
               )}

               {/* Rendered off-screen in table view so Print and PDF always use the formal laboratory report. */}
               {hasReports && (
                    <div
                         id="pls-doctor-report"
                         ref={reportRef}
                         style={view === "report" ? { overflowX: "auto" } : { position: "absolute", left: -10000, top: 0, width: 900 }}
                         aria-hidden={view !== "report"}
                    >
                         {data!.reports.map((report) => (
                              <LaboratoryReport key={report.ascensionid} data={report}
                                   billingPrefix={app?.settings?.billingidPrefix || ""} showWatermark={app?.settings?.show_watermark === 1} />
                         ))}
                    </div>
               )}
          </div>
     );
}
