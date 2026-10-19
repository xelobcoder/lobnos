"use client";

import { useEffect, useMemo, useState } from "react";
import { RiLoader4Line } from "@remixicon/react";
import { customFetch } from "../../../components/Auth/customFetch";
import { useApplicationSettings } from "../../../components/Auth/useApplicationContext";
import DateFilterReusable from "../../../components/operations/Laboratory/ResuableFilter/DateFilterReusable";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

type ClinicianRequest = {
     patientid: number;
     patient_details?: string;
     billingid: number;
     billedon?: string;
     ascension_date?: string;
     ascensionid: number;
     testid?: number;
     testname?: string;
     total_tests?: number;
     tests_with_stage?: string;
     payment_status?: string;
     fullpatientid?: string;
     firstname?: string;
     middlename?: string;
     lastname?: string;
     collection?: string | null;
     processing?: string | null;
     ready?: string | null;
     approvalStatus?: number | null;
     resultEntryEnd?: string | null;
};

function patientName(item?: ClinicianRequest) {
     if (!item) return "";
     return [item.firstname, item.middlename, item.lastname].filter(Boolean).join(" ").trim() || item.patient_details || `Patient #${item.patientid}`;
}

function requestStatus(item: ClinicianRequest) {
     if (Number(item.approvalStatus) === 1) return "Approved";
     if (item.resultEntryEnd) return "Result entered";
     if (item.ready) return "Ready";
     if (item.processing) return "Processing";
     if (item.collection) return "Collected";
     return "Pending";
}

function getStageTextClass(stage: string) {
     const normalized = (stage || "").trim().toLowerCase();
     if (normalized.includes("pending")) return "text-warning";
     if (normalized.includes("paid") || normalized.includes("completed") || normalized.includes("done")) return "text-success";
     if (normalized.includes("partial")) return "text-info";
     if (normalized.includes("cancel") || normalized.includes("rejected") || normalized.includes("failed")) return "text-danger";
     return "text-muted";
}

function formatElapsed(ascensionDateStr: string) {
     if (!ascensionDateStr) return "N/A";
     const ascensionDate = new Date(ascensionDateStr);
     if (Number.isNaN(ascensionDate.getTime())) return "Invalid date";

     const diffMs = Date.now() - ascensionDate.getTime();
     if (diffMs < 0) return "0m";

     const minutes = Math.floor(diffMs / 60000);
     const hours = Math.floor(minutes / 60);
     const days = Math.floor(hours / 24);
     const leftoverMinutes = minutes % 60;
     const leftoverHours = hours % 24;

     let out = "";
     if (days > 0) out += `${days}d `;
     if (leftoverHours > 0 || days > 0) out += `${leftoverHours}h `;
     out += `${leftoverMinutes}m`;
     return out;
}

function parseBreakdown(testsWithStage: string) {
     const counts = { processing: 0, completed: 0, collected: 0, validated: 0, other: 0 };
     if (!testsWithStage) return counts;

     testsWithStage
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean)
          .forEach((item) => {
               const match = item.match(/\(([^)]+)\)$/);
               const stage = (match?.[1] || "").trim().toLowerCase();
               if (stage.includes("processing") || stage.includes("processed")) counts.processing += 1;
               else if (stage.includes("collected")) counts.collected += 1;
               else if (stage.includes("validated") || stage.includes("approved")) counts.validated += 1;
               else if (stage.includes("completed") || stage.includes("done")) counts.completed += 1;
               else counts.other += 1;
          });

     return counts;
}

export default function DoctorTestsSentPage() {
     const { applicationsettings } = useApplicationSettings();
     const router = useRouter();
     const clinicianid = Number(
          applicationsettings?.user?.clinicianid ??
          applicationsettings?.user?.id ??
          applicationsettings?.user?.employeeid ??
          0
     );

     const todayDate = new Date().toISOString().slice(0, 10);
     const [dateFilter, setDateFilter] = useState<string>("Today");
     const [dateFrom, setDateFrom] = useState<string>(todayDate);
     const [dateTo, setDateTo] = useState<string>(todayDate);
     const [filterCategory, setFilterCategory] = useState<{ section: string; value: string }>({ section: "", value: "" });
     const [requests, setRequests] = useState<ClinicianRequest[]>([]);
     const [loading, setLoading] = useState(true);
     const [pagination, setPagination] = useState({ page: 1, count: 10, total: 0, totalPages: 0 });

     const loadRequests = async (page = pagination.page) => {
          if (!clinicianid) {
               toast.error("Clinician profile not found.");
               setLoading(false);
               return;
          }

          setLoading(true);
          try {
               // Clinician-scoped: the server binds clinician sessions to their own requests.
               let url = `clinician-portal/requests?clinicianid=${clinicianid}`;
               url += `&from=${dateFrom || todayDate}&to=${dateTo || todayDate}`;

               const response = await customFetch(url);
               const result = Array.isArray(response?.result) ? response.result : [];
               if (response?.status === "error") toast.error(response?.message || "Failed to load clinician requests");
               setRequests(result);
          } catch (error) {
               console.error(error);
               toast.error("Failed to load clinician requests");
          } finally {
               setLoading(false);
          }
     };

     const filteredRequests = useMemo(() => {
          const q = filterCategory.value.trim().toLowerCase();
          if (!q) return requests;
          return requests.filter((request) => {
               const patient = patientName(request).toLowerCase();
               const patientid = String(request.patientid || "");
               const billingid = String(request.billingid || "");
               const testname = `${request.testname || ""} ${request.tests_with_stage || ""}`.toLowerCase();
               return patient.includes(q) || patientid.includes(q) || billingid.includes(q) || testname.includes(q);
          });
     }, [filterCategory.value, requests]);

     const openRequest = (patientid: number, billingid: number) => {
          if (!patientid || !billingid) return;
          window.open(`/doctor/results?patientid=${patientid}&billingid=${billingid}&isOpenSideBarShow=false`, '_blank');
     };

     useEffect(() => {
          if (clinicianid) {
               loadRequests(1);
          }
     }, [clinicianid]);

     const today = new Date();
     const day = today.getDate();
     const month = today.toLocaleString("default", { month: "long" });
     const year = today.getFullYear();
     const weekday = today.toLocaleString("default", { weekday: "short" });

     const handleResetFilters = () => {
          setDateFilter("Today");
          setDateFrom(todayDate);
          setDateTo(todayDate);
          setFilterCategory({ section: "", value: "" });
     };

     return (
          <div>
               <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-2">
                    <div>
                         <h3 style={{ fontWeight: 700, fontSize: "1.5rem", margin: 0 }}>Requested Tests</h3>
                         <div className="text-muted" style={{ fontSize: "0.9rem" }}>
                              Today: {day} {month} {year} [{weekday}]
                         </div>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                         <span className="badge bg-primary">Requests: {filteredRequests.length}</span>
                         <button
                              onClick={() => loadRequests(1)}
                              className="btn btn-primary d-flex align-items-center gap-2"
                              disabled={loading}
                              style={{ padding: "0.5rem 1rem", whiteSpace: "nowrap" }}
                         >
                              <RiLoader4Line size={16} className={loading ? "animate-spin" : ""} />
                              {loading ? "Loading..." : "Refresh"}
                         </button>
                    </div>
               </div>

               <div className="card">
                    <div className="card-body">
                         <div className="d-flex align-items-center gap-2 flex-nowrap" style={{ overflowX: "auto", paddingBottom: "0.25rem" }}>
                              <div style={{ minWidth: 200, flex: "0 0 auto" }}>
                                   <select
                                        onChange={(ev) => {
                                             const nextValue = ev.target.value;
                                             if (nextValue === "none") {
                                                  setFilterCategory({ section: "", value: "" });
                                                  return;
                                             }
                                             setFilterCategory({ section: nextValue, value: filterCategory.value });
                                        }}
                                        className="form-select"
                                        value={filterCategory.section || "none"}
                                        style={{ padding: "0.5rem 0.75rem" }}
                                   >
                                        <option value="none">Filter By</option>
                                        <option value="patientname">Patient Name</option>
                                        <option value="patientid">Patient ID</option>
                                        <option value="billingid">Billing ID</option>
                                        <option value="testname">Test Name</option>
                                   </select>
                              </div>

                              <div style={{ minWidth: 220, flex: "0 0 auto" }}>
                                   <input
                                        className="form-control"
                                        value={filterCategory.value}
                                        onChange={(ev) => setFilterCategory((prev) => ({ ...prev, value: ev.target.value }))}
                                        placeholder="Enter value"
                                        style={{ padding: "0.5rem 0.75rem" }}
                                   />
                              </div>

                              <div style={{ minWidth: 220, flex: "0 0 auto" }}>
                                   <DateFilterReusable
                                        value={dateFilter}
                                        onChange={setDateFilter}
                                        onDateRangeChange={(startDate, endDate) => {
                                             setDateFrom(startDate);
                                             setDateTo(endDate);
                                        }}
                                        label="Date Range"
                                        className=""
                                   />
                              </div>

                              <div style={{ flex: "1 1 auto" }} />

                              <button
                                   onClick={() => loadRequests(1)}
                                   className="btn btn-outline-primary d-flex align-items-center gap-2"
                                   disabled={loading}
                                   title="Load"
                                   style={{ flex: "0 0 auto", padding: "0.5rem 1rem", whiteSpace: "nowrap" }}
                              >
                                   <span>↻</span>
                                   {loading ? "Loading..." : "Load"}
                              </button>

                              <button
                                   onClick={handleResetFilters}
                                   className="btn btn-outline-secondary d-flex align-items-center gap-2"
                                   title="Reset"
                                   style={{ flex: "0 0 auto", padding: "0.5rem 1rem", whiteSpace: "nowrap" }}
                              >
                                   <span>🔄</span>
                                   Reset
                              </button>
                         </div>
                    </div>
               </div>

               <div className="mt-3">
                    {loading ? (
                         <div className="text-center py-5">
                              <div className="spinner-border text-primary" role="status">
                                   <span className="visually-hidden">Loading...</span>
                              </div>
                              <p className="mt-2 mb-0">Loading requests...</p>
                         </div>
                    ) : filteredRequests.length === 0 ? (
                         <div className="alert alert-secondary" role="alert">
                              No requests found for the selected filters.
                         </div>
                    ) : (
                         <div className="card border-0 shadow-sm">
                              <div className="card-header bg-white fw-semibold">Requests</div>
                              <div className="card-body p-0">
                                   <div className="table-responsive">
                                        <table className="table table-bordered table-striped align-middle mb-0">
                                             <thead className="table-light">
                                                  <tr>
                                                       <th style={{ minWidth: 260 }}>Patient</th>
                                                       <th style={{ minWidth: 160 }}>Request</th>
                                                       <th style={{ minWidth: 260 }}>Progress</th>
                                                       <th style={{ width: 140 }}>Action</th>
                                                  </tr>
                                             </thead>
                                             <tbody>
                                                  {filteredRequests.map((request) => {
                                                       const breakdown = parseBreakdown(request.tests_with_stage || "");
                                                       const status = requestStatus(request);
                                                       const isPaymentPending = (request.payment_status || "").toLowerCase() === "pending";
                                                       return (
                                                            <tr key={`${request.patientid}-${request.billingid}-${request.ascensionid}`} className={isPaymentPending ? "bg-danger-subtle border-start border-4 border-danger" : ""}>
                                                                 <td>
                                                                      <div className="fw-semibold">{patientName(request)}</div>
                                                                      <div className="text-muted" style={{ fontSize: "0.85rem" }}>
                                                                           ID: {request.patientid} • Billing: {request.billingid}
                                                                      </div>
                                                                      <div className="text-muted" style={{ fontSize: "0.85rem" }}>
                                                                           Billed: {request.billedon ? new Date(request.billedon).toLocaleString() : "N/A"}
                                                                      </div>
                                                                 </td>
                                                                 <td>
                                                                      <div>{request.ascension_date ? new Date(request.ascension_date).toLocaleString() : "N/A"}</div>
                                                                      <div className="fw-semibold mt-1">{formatElapsed(request.ascension_date || "")}</div>
                                                                      <div className={`mt-1 text-capitalize ${getStageTextClass(status)}`}>{status}</div>
                                                                 </td>
                                                                 <td>
                                                                      <div className="fw-semibold mb-2">Total: {request.total_tests ?? 0}</div>
                                                                      <div className="text-muted mb-2" style={{ fontSize: "0.85rem" }}>
                                                                           Collected: {breakdown.collected} | Validated: {breakdown.validated} | Processing: {breakdown.processing} | Completed: {breakdown.completed} | Other: {breakdown.other}
                                                                      </div>
                                                                      <div className="mt-2">
                                                                           {(request.tests_with_stage || "")
                                                                                .split(",")
                                                                                .map((t) => t.trim())
                                                                                .filter(Boolean)
                                                                                .map((t, index) => {
                                                                                     const match = t.match(/^(.*)\s*\((.*)\)$/);
                                                                                     const name = match ? match[1] : t;
                                                                                     const stage = match ? match[2] : "unknown";
                                                                                     return (
                                                                                          <div key={`${name}-${index}`} className="d-flex justify-content-between align-items-center py-1 border-bottom">
                                                                                               <div style={{ minWidth: 0 }} className="text-truncate">{name}</div>
                                                                                               <div className={`text-capitalize ms-2 ${getStageTextClass(stage)}`} style={{ fontSize: "0.85rem" }}>{stage}</div>
                                                                                          </div>
                                                                                     );
                                                                                })}
                                                                      </div>
                                                                 </td>
                                                                 <td>
                                                                      <button
                                                                           onClick={() => openRequest(request.patientid, request.billingid)}
                                                                           className={`btn btn-sm ${isPaymentPending ? "btn-primary" : "btn-outline-primary"} w-100`}
                                                                      >
                                                                           Open
                                                                      </button>
                                                                 </td>
                                                            </tr>
                                                       );
                                                  })}
                                             </tbody>
                                        </table>
                                   </div>
                              </div>
                              <div className="card-footer bg-white d-flex justify-content-between align-items-center">
                                   <button className="btn btn-sm btn-outline-secondary" disabled={pagination.page <= 1 || loading} onClick={() => loadRequests(pagination.page - 1)}>Previous</button>
                                   <span className="small text-muted">Page {pagination.page} of {pagination.totalPages || 1} • {pagination.total} records</span>
                                   <button className="btn btn-sm btn-outline-secondary" disabled={pagination.page >= pagination.totalPages || loading} onClick={() => loadRequests(pagination.page + 1)}>Next</button>
                              </div>
                         </div>
                    )}
               </div>
          </div>
     );
}
