"use client";

import { RiCalendarEventLine, RiRefreshLine, RiLoader4Line } from "@remixicon/react";
import dayjs from "dayjs";
import { useState, useEffect } from "react";
import { useApplicationSettings } from "../../../../components/Auth/useApplicationContext";
import { customFetch } from "../../../../components/Auth/customFetch";
import DateFilterReusable from "../../../../components/operations/Laboratory/ResuableFilter/DateFilterReusable";

interface OutstandingResponse {
     allOutstandings: Array<{ total_outstanding: string | null }>;
     byPatient: Array<{
          patientid: number;
          patient_name: string;
          invoices: number;
          total_billed: string;
          total_paid: string;
          total_outstanding: string;
     }>;
     byBillingOrTransaction: Array<{
          billingid: number;
          patientid: number;
          billing_status: string;
          billing_date: string;
          total_billed: string;
          total_paid: string;
          total_outstanding: string;
     }>;
     byServiceCategory: Array<{
          serviceCategory: string;
          services: number;
          total_billed: string;
          total_paid: string;
          total_outstanding: string;
     }>;
     byBranch: Array<{
          branchid: number;
          name: string;
          invoices: number;
          total_billed: string;
          total_paid: string;
          total_outstanding: string;
     }>;
     byOrganization: Array<{
          organizationId: number;
          name: string;
          invoices: number;
          total_billed: string;
          total_paid: string;
          total_outstanding: string;
     }>;
     byAgingRange: Array<{
          aging_bucket: string;
          services: number;
          total_outstanding: string;
     }>;
     reconciliation: Array<{
          billingid: number;
          billing_outstanding: string;
          services_outstanding: string;
          difference: string;
     }>;
     top20Debtors: Array<{
          patientid: number;
          total_outstanding: string;
          patient_name: string;
     }>;
}

export default function OutstandingPaymentsBreakDown() {
     const defaultstartdate = dayjs().startOf("month").format("YYYY-MM-DD");
     const defaultenddate = dayjs().endOf("month").format("YYYY-MM-DD");
     const [data, setData] = useState<OutstandingResponse | null>(null);
     const [loading, setLoading] = useState(false);
     const [error, setError] = useState<string | null>(null);
     const [startDate, setStartDate] = useState(defaultstartdate);
     const [endDate, setEndDate] = useState(defaultenddate);
     const [dateFilter, setDateFilter] = useState("");

     const { applicationsettings } = useApplicationSettings();
     const { user } = applicationsettings || {};

     const formatCurrency = (value: string | number | undefined | null): string => {
          if (value === null || value === undefined) return "GHS 0.00";
          const num = typeof value === "string" ? parseFloat(value) : value;
          if (isNaN(num)) return "GHS 0.00";
          return new Intl.NumberFormat("en-GH", {
               style: "currency",
               currency: "GHS",
               minimumFractionDigits: 2,
               maximumFractionDigits: 2,
          }).format(num);
     };

     const fetchOutstandingData = async () => {
          if (!user?.employeeid) return;
          setLoading(true);
          setError(null);

          try {
               const endpoint = `outstanding/report/combined?startdate=${startDate}&enddate=${endDate}&employeeid=${user.employeeid}&tenantId=${user.tenantid}`;
               const response = await customFetch(endpoint);
               if (response?.result) {
                    setData(response.result);
               } else {
                    setData(null);
               }
          } catch (err) {
               setError("Error fetching outstanding payments");
               setData(null);
          } finally {
               setLoading(false);
          }
     };

     useEffect(() => {
          fetchOutstandingData();
     }, [user?.employeeid, startDate, endDate]);

     const handleResetFilters = () => {
          setStartDate(dayjs().startOf("month").format("YYYY-MM-DD"));
          setEndDate(dayjs().endOf("month").format("YYYY-MM-DD"));
          setDateFilter("");
     };

     const COLOR_ACCENT = "oklch(0.646 0.222 41.116)";
     const COLOR_BORDER = "var(--bs-border-color)";

     return (
          <div className="container-fluid px-4 py-3">
               {/* Header Section */}
               <div
                    className="card mb-4"
                    style={{ borderRadius: "0.75rem", borderColor: COLOR_BORDER }}
               >
                    <div
                         className="card-header py-3 px-4"
                         style={{
                              backgroundColor: "var(--bs-tertiary-bg)",
                              borderColor: COLOR_BORDER,
                         }}
                    >
                         <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center">
                              <h2 className="fs-6 fw-semibold text-body-emphasis mb-3 mb-lg-0 d-flex align-items-center">
                                   <RiCalendarEventLine
                                        size={22}
                                        style={{ color: COLOR_ACCENT }}
                                        className="me-2 flex-shrink-0"
                                   />
                                   Outstanding Payments Breakdown
                              </h2>

                              {/* Date Filters */}
                              <div className="d-flex flex-column flex-sm-row align-items-stretch align-items-sm-center gap-2 mt-2 mt-lg-0">
                                   <div style={{ minWidth: '250px' }}>
                                        <DateFilterReusable
                                             value={dateFilter}
                                             onChange={setDateFilter}
                                             onDateRangeChange={(start, end) => {
                                                  setStartDate(start);
                                                  setEndDate(end);
                                             }}
                                             label="Date Range Filter"
                                             className="w-100"
                                        />
                                   </div>

                                   <button
                                        onClick={fetchOutstandingData}
                                        className="btn btn-sm btn-primary d-flex align-items-center"
                                        disabled={loading}
                                   >
                                        <RiRefreshLine size={16} className="me-1" />
                                        {loading ? "Loading..." : "Refresh"}
                                   </button>

                                   <button
                                        onClick={handleResetFilters}
                                        className="btn btn-sm btn-outline-secondary d-flex align-items-center"
                                   >
                                        <RiRefreshLine size={16} className="me-1" />
                                        Reset
                                   </button>
                              </div>
                         </div>
                    </div>

                    {/* Content Section */}
                    <div className="card-body p-4">
                         {loading ? (
                              <div
                                   className="d-flex flex-column justify-content-center align-items-center"
                                   style={{ minHeight: "300px" }}
                              >
                                   <RiLoader4Line
                                        size={48}
                                        className="animate-spin mb-3"
                                        style={{ color: COLOR_ACCENT }}
                                   />
                                   <p className="text-muted">Loading outstanding payments data...</p>
                              </div>
                         ) : error ? (
                              <div
                                   className="d-flex flex-column justify-content-center align-items-center text-center"
                                   style={{ minHeight: "300px" }}
                              >
                                   <p className="text-danger fw-bold mb-2">{error}</p>
                                   <p className="text-muted">Please try again or contact support.</p>
                              </div>
                         ) : !data ? (
                              <div
                                   className="d-flex flex-column justify-content-center align-items-center text-center"
                                   style={{ minHeight: "300px" }}
                              >
                                   <p className="text-muted mb-3">No data available for the selected period.</p>
                              </div>
                         ) : (
                              <>
                                   {/* Metric Cards */}
                                   <div className="row g-3 mb-4">
                                        {/* Total Outstanding */}
                                        {data.allOutstandings && data.allOutstandings.length > 0 && (
                                             <div className="col-12 col-sm-6 col-md-3">
                                                  <div
                                                       className="border rounded p-4 h-100 text-white"
                                                       style={{ backgroundColor: "#dc2626" }}
                                                  >
                                                       <h6 className="mb-4 fw-bold opacity-75">Total Outstanding</h6>
                                                       <p className="fw-bold display-6 m-0">
                                                            {formatCurrency(data.allOutstandings[0].total_outstanding || "0")}
                                                       </p>
                                                  </div>
                                             </div>
                                        )}

                                        {/* By Patient Summary */}
                                        {data.byPatient && data.byPatient.length > 0 && (
                                             <div className="col-12 col-sm-6 col-md-3">
                                                  <div
                                                       className="border rounded p-4 h-100 text-white"
                                                       style={{  backgroundColor: "#2563eb" }}
                                                  >
                                                       <h6 className="mb-4 fw-bold opacity-75">By Patient</h6>
                                                       <p className="fw-bold display-6 m-0">{data.byPatient.length}</p>
                                                       <small className="opacity-75 d-block mt-2">patients with outstanding</small>
                                                  </div>
                                             </div>
                                        )}

                                        {/* By Service Category Summary */}
                                        {data.byServiceCategory && data.byServiceCategory.length > 0 && (
                                             <div className="col-12 col-sm-6 col-md-3">
                                                  <div
                                                       className="border rounded p-4 h-100 text-white"
                                                       style={{ backgroundColor: "#f59e0b" }}
                                                  >
                                                       <h6 className="mb-4 fw-bold opacity-75">Service Categories</h6>
                                                       <p className="fw-bold display-6 m-0">{data.byServiceCategory.length}</p>
                                                       <small className="opacity-75 d-block mt-2">categories</small>
                                                  </div>
                                             </div>
                                        )}

                                        {/* Top Debtors Summary */}
                                        {data.top20Debtors && data.top20Debtors.length > 0 && (
                                             <div className="col-12 col-sm-6 col-md-3">
                                                  <div
                                                       className="border rounded p-4 h-100 text-white"
                                                       style={{ backgroundColor: "#10b981" }}
                                                  >
                                                       <h6 className="mb-4 fw-bold opacity-75">Top Debtors</h6>
                                                       <p className="fw-bold display-6 m-0">
                                                            {data.top20Debtors.filter((d) => parseFloat(d.total_outstanding) > 0).length}
                                                       </p>
                                                       <small className="opacity-75 d-block mt-2">with outstanding balance</small>
                                                  </div>
                                             </div>
                                        )}
                                   </div>

                                   {/* Data Tables */}
                                   {/* By Patient Table */}
                                   {data.byPatient && data.byPatient.length > 0 && (
                                        <div className="card mb-4" style={{ borderRadius: "0.75rem", borderColor: COLOR_BORDER }}>
                                             <div className="card-header py-3 px-4" style={{ backgroundColor: "var(--bs-tertiary-bg)" }}>
                                                  <h6 className="mb-0 fw-bold">Outstanding by Patient</h6>
                                             </div>
                                             <div className="card-body p-3">
                                                  <div className="table-responsive">
                                                       <table className="table table-sm table-hover table-striped text-start">
                                                            <thead className="sticky-top bg-body-tertiary">
                                                                 <tr>
                                                                      <th className="text-start">Patient ID</th>
                                                                      <th className="text-start">Patient Name</th>
                                                                      <th className="text-start">Invoices</th>
                                                                      <th className="text-start">Total Billed</th>
                                                                      <th className="text-start">Total Paid</th>
                                                                      <th className="text-start">Outstanding</th>
                                                                 </tr>
                                                            </thead>
                                                            <tbody>
                                                                 {data.byPatient.map((item, index) => (
                                                                      <tr key={index}>
                                                                           <td className="text-start">{item.patientid}</td>
                                                                           <td className="text-start">{item.patient_name || "N/A"}</td>
                                                                           <td className="text-start">{item.invoices}</td>
                                                                           <td className="text-start">{formatCurrency(item.total_billed)}</td>
                                                                           <td className="text-start">{formatCurrency(item.total_paid)}</td>
                                                                           <td className="text-start fw-bold" style={{ color: COLOR_ACCENT }}>
                                                                                {formatCurrency(item.total_outstanding)}
                                                                           </td>
                                                                      </tr>
                                                                 ))}
                                                            </tbody>
                                                       </table>
                                                  </div>
                                             </div>
                                        </div>
                                   )}

                                   {/* By Service Category Table */}
                                   {data.byServiceCategory && data.byServiceCategory.length > 0 && (
                                        <div className="card mb-4" style={{ borderRadius: "0.75rem", borderColor: COLOR_BORDER }}>
                                             <div className="card-header py-3 px-4" style={{ backgroundColor: "var(--bs-tertiary-bg)" }}>
                                                  <h6 className="mb-0 fw-bold">Outstanding by Service Category</h6>
                                             </div>
                                             <div className="card-body p-3">
                                                  <div className="table-responsive">
                                                       <table className="table table-sm table-hover table-striped text-start">
                                                            <thead className="sticky-top bg-body-tertiary">
                                                                 <tr>
                                                                      <th className="text-start">Service Category</th>
                                                                      <th className="text-start">Services</th>
                                                                      <th className="text-start">Total Billed</th>
                                                                      <th className="text-start">Total Paid</th>
                                                                      <th className="text-start">Outstanding</th>
                                                                      <th className="text-center">Action</th>
                                                                 </tr>
                                                            </thead>
                                                            <tbody>
                                                                 {data.byServiceCategory.map((item, index) => (
                                                                      <tr key={index}>
                                                                           <td className="text-start">{item.serviceCategory}</td>
                                                                           <td className="text-start">{item.services}</td>
                                                                           <td className="text-start">{formatCurrency(item.total_billed)}</td>
                                                                           <td className="text-start">{formatCurrency(item.total_paid)}</td>
                                                                           <td className="text-start fw-bold" style={{ color: COLOR_ACCENT }}>
                                                                                {formatCurrency(item.total_outstanding)}
                                                                           </td>
                                                                           <td className="text-start">
                                                                                <button
                                                                                     className="btn btn-sm btn-outline-primary"
                                                                                     onClick={() => window.open(`outstanding-payments-breakdown/category-details?category=${encodeURIComponent(item.serviceCategory)}&startdate=${startDate}&enddate=${endDate}&&isOpenSideBarShow=false`, '_blank')}
                                                                                >
                                                                                     View Details
                                                                                </button>
                                                                           </td>
                                                                      </tr>
                                                                 ))}
                                                            </tbody>
                                                       </table>
                                                  </div>
                                             </div>
                                        </div>
                                   )}

                                   {/* By Aging Range Table */}
                                   {data.byAgingRange && data.byAgingRange.length > 0 && (
                                        <div className="card mb-4" style={{ borderRadius: "0.75rem", borderColor: COLOR_BORDER }}>
                                             <div className="card-header py-3 px-4" style={{ backgroundColor: "var(--bs-tertiary-bg)" }}>
                                                  <h6 className="mb-0 fw-bold">Outstanding by Aging Range</h6>
                                             </div>
                                             <div className="card-body p-3">
                                                  <div className="table-responsive">
                                                       <table className="table table-sm table-hover table-striped text-start">
                                                            <thead className="sticky-top bg-body-tertiary">
                                                                 <tr>
                                                                      <th className="text-start">Aging Bucket</th>
                                                                      <th className="text-start">Services</th>
                                                                      <th className="text-start">Outstanding</th>
                                                                 </tr>
                                                            </thead>
                                                            <tbody>
                                                                 {data.byAgingRange.map((item, index) => (
                                                                      <tr key={index}>
                                                                           <td className="text-start">{item.aging_bucket}</td>
                                                                           <td className="text-start">{item.services}</td>
                                                                           <td className="text-start fw-bold" style={{ color: COLOR_ACCENT }}>
                                                                                {formatCurrency(item.total_outstanding)}
                                                                           </td>
                                                                      </tr>
                                                                 ))}
                                                            </tbody>
                                                       </table>
                                                  </div>
                                             </div>
                                        </div>
                                   )}

                                   {/* By Branch Table */}
                                   {data.byBranch && data.byBranch.length > 0 && (
                                        <div className="card mb-4" style={{ borderRadius: "0.75rem", borderColor: COLOR_BORDER }}>
                                             <div className="card-header py-3 px-4" style={{ backgroundColor: "var(--bs-tertiary-bg)" }}>
                                                  <h6 className="mb-0 fw-bold">Outstanding by Branch</h6>
                                             </div>
                                             <div className="card-body p-3">
                                                  <div className="table-responsive">
                                                       <table className="table table-sm table-hover table-striped text-start">
                                                            <thead className="sticky-top bg-body-tertiary">
                                                                 <tr>
                                                                      <th className="text-start">Branch ID</th>
                                                                      <th className="text-start">Branch Name</th>
                                                                      <th className="text-start">Invoices</th>
                                                                      <th className="text-start">Total Billed</th>
                                                                      <th className="text-start">Total Paid</th>
                                                                      <th className="text-start">Outstanding</th>
                                                                 </tr>
                                                            </thead>
                                                            <tbody>
                                                                 {data.byBranch.map((item, index) => (
                                                                      <tr key={index}>
                                                                           <td className="text-start">{item.branchid}</td>
                                                                           <td className="text-start">{item.name}</td>
                                                                           <td className="text-start">{item.invoices}</td>
                                                                           <td className="text-start">{formatCurrency(item.total_billed)}</td>
                                                                           <td className="text-start">{formatCurrency(item.total_paid)}</td>
                                                                           <td className="text-start fw-bold" style={{ color: COLOR_ACCENT }}>
                                                                                {formatCurrency(item.total_outstanding)}
                                                                           </td>
                                                                      </tr>
                                                                 ))}
                                                            </tbody>
                                                       </table>
                                                  </div>
                                             </div>
                                        </div>
                                   )}

                                   {/* By Organization Table */}
                                   {Array.isArray(data.byOrganization) && data.byOrganization.length > 0 && (
                                        <div className="card mb-4" style={{ borderRadius: "0.75rem", borderColor: COLOR_BORDER }}>
                                             <div className="card-header py-3 px-4" style={{ backgroundColor: "var(--bs-tertiary-bg)" }}>
                                                  <h6 className="mb-0 fw-bold">Outstanding by Organization</h6>
                                             </div>
                                             <div className="card-body p-3">
                                                  <div className="table-responsive">
                                                       <table className="table table-sm table-hover table-striped text-start">
                                                            <thead className="sticky-top bg-body-tertiary">
                                                                 <tr>
                                                                      <th className="text-start">Organization Name</th>
                                                                      <th className="text-start">Transactions</th>
                                                                      <th className="text-start">Total Billed</th>
                                                                      <th className="text-start">Total Paid</th>
                                                                      <th className="text-start">Outstanding</th>
                                                                 </tr>
                                                            </thead>
                                                            <tbody>
                                                                 {data.byOrganization.map((item, index) => (
                                                                      <tr key={index}>
                                                                           <td className="text-start fw-semibold">{item.name}</td>
                                                                           <td className="text-start">{item.invoices}</td>
                                                                           <td className="text-start">{formatCurrency(item.total_billed)}</td>
                                                                           <td className="text-start">{formatCurrency(item.total_paid)}</td>
                                                                           <td className="text-start fw-bold" style={{ color: COLOR_ACCENT }}>
                                                                                {formatCurrency(item.total_outstanding)}
                                                                           </td>
                                                                      </tr>
                                                                 ))}
                                                            </tbody>
                                                       </table>
                                                  </div>
                                             </div>
                                        </div>
                                   )}

                                   {/* Top 20 Debtors Table */}
                                   {data.top20Debtors && data.top20Debtors.length > 0 && (
                                        <div className="card mb-4" style={{ borderRadius: "0.75rem", borderColor: COLOR_BORDER }}>
                                             <div className="card-header py-3 px-4" style={{ backgroundColor: "var(--bs-tertiary-bg)" }}>
                                                  <h6 className="mb-0 fw-bold">Top 20 Debtors</h6>
                                             </div>
                                             <div className="card-body p-3">
                                                  <div className="table-responsive">
                                                       <table className="table table-sm table-hover table-striped text-start">
                                                            <thead className="sticky-top bg-body-tertiary">
                                                                 <tr>
                                                                      <th className="text-start">Rank</th>
                                                                      <th className="text-start">Patient ID</th>
                                                                      <th className="text-start">Patient Name</th>
                                                                      <th className="text-start">Outstanding Amount</th>
                                                                 </tr>
                                                            </thead>
                                                            <tbody>
                                                                 {data.top20Debtors
                                                                      .filter((item) => parseFloat(item.total_outstanding) > 0)
                                                                      .map((item, index) => (
                                                                           <tr key={index}>
                                                                                <td className="text-start fw-bold">{index + 1}</td>
                                                                                <td className="text-start">{item.patientid}</td>
                                                                                <td className="text-start">{item.patient_name || "N/A"}</td>
                                                                                <td className="text-start fw-bold" style={{ color: COLOR_ACCENT }}>
                                                                                     {formatCurrency(item.total_outstanding)}
                                                                                </td>
                                                                           </tr>
                                                                      ))}
                                                            </tbody>
                                                       </table>
                                                  </div>
                                             </div>
                                        </div>
                                   )}

                                   {/* Reconciliation Table */}
                                   {data.reconciliation && data.reconciliation.length > 0 && (
                                        <div className="card mb-4" style={{ borderRadius: "0.75rem", borderColor: COLOR_BORDER }}>
                                             <div className="card-header py-3 px-4" style={{ backgroundColor: "var(--bs-tertiary-bg)" }}>
                                                  <h6 className="mb-0 fw-bold">Reconciliation Report</h6>
                                             </div>
                                             <div className="card-body p-3">
                                                  <div className="table-responsive">
                                                       <table className="table table-sm table-hover table-striped text-start">
                                                            <thead className="sticky-top bg-body-tertiary">
                                                                 <tr>
                                                                      <th className="text-start">Billing ID</th>
                                                                      <th className="text-start">Billing Outstanding</th>
                                                                      <th className="text-start">Services Outstanding</th>
                                                                      <th className="text-start">Difference</th>
                                                                 </tr>
                                                            </thead>
                                                            <tbody>
                                                                 {data.reconciliation.map((item, index) => (
                                                                      <tr key={index}>
                                                                           <td className="text-start">{item.billingid}</td>
                                                                           <td className="text-start">{formatCurrency(item.billing_outstanding)}</td>
                                                                           <td className="text-start">{formatCurrency(item.services_outstanding)}</td>
                                                                           <td className="text-start fw-bold" style={{ color: COLOR_ACCENT }}>
                                                                                {formatCurrency(item.difference)}
                                                                           </td>
                                                                      </tr>
                                                                 ))}
                                                            </tbody>
                                                       </table>
                                                  </div>
                                             </div>
                                        </div>
                                   )}
                              </>
                         )}
                    </div>
               </div>


               <style>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
          </div>
     );
}
