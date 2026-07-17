"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { customFetch, currencyFormatter } from "../../../../components/Auth/customFetch";
import DateFilterReusable from "../../../../components/operations/Laboratory/ResuableFilter/DateFilterReusable";
import { RiRefreshLine, RiLoader4Line, RiErrorWarningLine, RiInbox2Line } from "@remixicon/react";
import { useApplication } from "../../../../components/Auth/useApplicationContext";

const SHADCN_PRIMARY = "#3B82F6";
const SHADCN_FOREGROUND = "#0F172A";
const SHADCN_MUTED_FOREGROUND = "#64748B";
const SHADCN_BORDER = "#E2E8F0";
const SHADCN_CARD_BG = "#FFFFFF";
const SHADCN_MUTED_BG = "#F8FAFC";

interface ServiceDetailEntry {
     serviceId?: string;
     serviceName?: string;
     patientName?: string;
     serviceDate?: string;
     amount?: number;
     status?: string;
     [key: string]: any;
}

const getDefaultDateRange = () => {
     const today = new Date();
     const endDate = today.toISOString().split("T")[0];
     const startDateObj = new Date(today);
     startDateObj.setDate(today.getDate() - 29);
     const startDate = startDateObj.toISOString().split("T")[0];
     return { startDate, endDate };
};

export default function ClinicianServiceDetailsPage() {
     const searchParams = useSearchParams();
     const clinicianId = searchParams.get("clinicianId");
     const initialStartDate = searchParams.get("startDate") || getDefaultDateRange().startDate;
     const initialEndDate = searchParams.get("endDate") || getDefaultDateRange().endDate;
     const employeeid = useApplication()?.user?.employeeid;

     const [data, setData] = useState<ServiceDetailEntry[]>([]);
     const [loading, setLoading] = useState<boolean>(true);
     const [error, setError] = useState<string | null>(null);
     const [dateFilter, setDateFilter] = useState<string>("");
     const [startDate, setStartDate] = useState<string>(initialStartDate);
     const [endDate, setEndDate] = useState<string>(initialEndDate);

     const fetchDetails = useCallback(async (fetchStartDate: string, fetchEndDate: string) => {
          if (!clinicianId) {
               setError("Clinician ID is required.");
               setData([]);
               setLoading(false);
               return;
          }

          if (!fetchStartDate || !fetchEndDate) {
               setError("Please select a valid date range.");
               setData([]);
               setLoading(false);
               return;
          }

          if (new Date(fetchStartDate) > new Date(fetchEndDate)) {
               setError("Start date cannot be after end date.");
               setData([]);
               setLoading(false);
               return;
          }

          setLoading(true);
          setError(null);

          try {
               const url = `financials/billing/summary?key=clinicianServiceDetails&clinicianId=${clinicianId}&startDate=${fetchStartDate}&endDate=${fetchEndDate}&&employeeid=${employeeid}`;
               const response = await customFetch(url);

               if (!response || !Array.isArray(response)) {
                    throw new Error("Invalid service details response from the API.");
               }

               setData(response.map((item: any) => ({
                    serviceId: item.serviceId || item.id || item.reference || "",
                    serviceName: item.serviceName || item.name || item.description || "",
                    patientName: item.patientName || item.clientName || item.patient || "",
                    serviceDate: item.serviceDate || item.date || "",
                    amount: item.amount ? parseFloat(item.amount) : item.total ? parseFloat(item.total) : 0,
                    status: item.status || item.state || "",
                    ...item,
               })));
          } catch (err) {
               setData([]);
               setError(err instanceof Error ? err.message : "An unknown error occurred while loading service details.");
          } finally {
               setLoading(false);
          }
     }, [clinicianId]);

     useEffect(() => {
          fetchDetails(startDate, endDate);
     }, [fetchDetails, startDate, endDate]);

     const handleLoadDetails = () => fetchDetails(startDate, endDate);
     const handleReset = () => {
          const { startDate: defaultStartDate, endDate: defaultEndDate } = getDefaultDateRange();
          setStartDate(defaultStartDate);
          setEndDate(defaultEndDate);
          setDateFilter("");
          fetchDetails(defaultStartDate, defaultEndDate);
     };

     const renderBody = () => {
          if (loading) {
               return (
                    <div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '300px' }}>
                         <RiLoader4Line size={48} className="animate-spin mb-3" style={{ color: SHADCN_PRIMARY }} />
                         <p className="text-muted">Loading service details...</p>
                    </div>
               );
          }

          if (error) {
               return (
                    <div className="d-flex flex-column justify-content-center align-items-center text-center" style={{ minHeight: '300px' }}>
                         <RiErrorWarningLine size={48} className="mb-3 text-danger" />
                         <h5 className="fw-medium mb-1">Unable to load services</h5>
                         <p className="text-muted px-3">{error}</p>
                    </div>
               );
          }

          if (data.length === 0) {
               return (
                    <div className="d-flex flex-column justify-content-center align-items-center text-center" style={{ minHeight: '300px' }}>
                         <RiInbox2Line size={48} className="mb-3 text-muted" />
                         <h5 className="fw-medium mb-1">No service records found</h5>
                         <p className="text-muted px-3">No services were found for this allocation within the selected range.</p>
                    </div>
               );
          }

          return (
               <div className="table-responsive">
                    <table className="table table-sm table-hover table-striped small text-start">
                         <thead className="sticky-top bg-body-tertiary">
                              <tr>
                                   <th>Service</th>
                                   <th className="text-end">Date</th>
                                   <th className="text-end">Patient</th>
                                   <th className="text-end">Amount</th>
                                   <th className="text-end">Status</th>
                              </tr>
                         </thead>
                         <tbody>
                              {data.map((item, index) => (
                                   <tr key={`${item.serviceId || index}-${index}`}>
                                        <td>{item.serviceName || item.serviceId || 'N/A'}</td>
                                        <td className="text-end">{item.serviceDate || 'N/A'}</td>
                                        <td className="text-end">{item.patientName || 'N/A'}</td>
                                        <td className="text-end">{currencyFormatter.format(item.amount || 0)}</td>
                                        <td className="text-end">{item.status || 'N/A'}</td>
                                   </tr>
                              ))}
                         </tbody>
                    </table>
               </div>
          );
     };

     return (
          <div className="container-fluid px-4 py-3">
               <div className="card shadow-sm" style={{ borderRadius: '0.75rem', borderColor: SHADCN_BORDER, backgroundColor: SHADCN_CARD_BG }}>
                    <div className="card-header py-3 px-4" style={{ backgroundColor: SHADCN_MUTED_BG, borderBottom: `1px solid ${SHADCN_BORDER}` }}>
                         <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
                              <div>
                                   <h2 className="fs-6 fw-semibold mb-1">Clinician Service Details</h2>
                                   <p className="small text-muted mb-0">
                                        Showing services for clinician ID {clinicianId ?? 'N/A'} from {startDate} to {endDate}.
                                   </p>
                              </div>
                              <div className="d-flex flex-wrap align-items-center gap-2">
                                   <DateFilterReusable
                                        value={dateFilter}
                                        onChange={setDateFilter}
                                        onDateRangeChange={(newStartDate, newEndDate) => {
                                             setStartDate(newStartDate);
                                             setEndDate(newEndDate);
                                        }}
                                        label="Filter by"
                                        className="w-auto"
                                   />
                                   <button onClick={handleLoadDetails} className="btn btn-sm btn-primary d-flex align-items-center" type="button" style={{ fontSize: '0.875rem', padding: '0.25rem 0.5rem' }}>
                                        <RiRefreshLine size={16} className="me-1" /> Load
                                   </button>
                                   <button onClick={handleReset} className="btn btn-sm btn-outline-secondary d-flex align-items-center" type="button" style={{ fontSize: '0.875rem', padding: '0.25rem 0.5rem' }}>
                                        Reset
                                   </button>
                              </div>
                         </div>
                    </div>
                    <div className="card-body p-3 p-md-4">
                         {renderBody()}
                    </div>
               </div>
          </div>
     );
}
