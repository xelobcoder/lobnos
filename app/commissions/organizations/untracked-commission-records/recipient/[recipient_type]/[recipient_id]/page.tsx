"use client";
import { RiFileListLine, RiCalendarEventLine, RiRefreshLine, RiUserLine, RiBuildingLine } from "@remixicon/react";
import dayjs from "dayjs";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import PrimeTable from "../../../../../../../components/accessories/Datatables/PrimeTable";
import { currencyFormatter, customPost, customFetch } from "../../../../../../../components/Auth/customFetch";
import DateFilterReusable from "../../../../../../../components/operations/Laboratory/ResuableFilter/DateFilterReusable";

interface UntrackedService {
     serviceid: number;
     totalpayable: string;
     paidamount: string;
     status: string;
     paymentstatus: string;
     serviceAddedOn: string;
     serviceCategory: string;
     clinicianId: number | null;
     organizationId: number | null;
     test_name: string;
     clinician_name: string | null;
     organization_name: string | null;
}

export default function RecipientUntrackedServicesPage({
     params,
}: {
     params: {
          recipient_type: string;
          recipient_id: string;
     };
}) {
     const today = dayjs().format("YYYY-MM-DD");
     const defaultStart = dayjs(`${dayjs().year()}-01-01`).format("YYYY-MM-DD");
     const [data, setData] = useState<UntrackedService[]>([]);
     const [startDate, setStartDate] = useState(defaultStart);
     const [endDate, setEndDate] = useState(today);
     const [loading, setLoading] = useState(true);
     const [filtering, setFiltering] = useState(false);
     const [recipientName, setRecipientName] = useState<string>("");
     const [dateFilter, setDateFilter] = useState("This Year");

     const handleDateRangeChange = (start: string, end: string) => {
          setStartDate(start);
          setEndDate(end);
     };

     const recipientType = params.recipient_type;
     const recipientId = params.recipient_id;

     const fetchServices = async () => {
          setLoading(true);
          try {
               const response = await customFetch(
                    `commission-payments/untracked/services?page=1&count=10&recipient_type=${encodeURIComponent(
                         recipientType,
                    )}&recipient_id=${encodeURIComponent(recipientId)}&startDate=${encodeURIComponent(
                         startDate,
                    )}&endDate=${encodeURIComponent(endDate)}`,
               );
               if (response && (response.status === true || response.status === "success" || response.success === true)) {
                    setData(response.data || []);
                    if (response.data && response.data.length > 0) {
                         const name = response.data[0].clinician_name || response.data[0].organization_name;
                         setRecipientName(name || "");
                    } else {
                         setRecipientName("");
                    }
               } else {
                    setData([]);
                    setRecipientName("");
               }
          } catch (error) {
               console.error(error);
               setData([]);
          } finally {
               setLoading(false);
          }
     };

     useEffect(() => {
          fetchServices();
     }, [recipientType, recipientId, startDate, endDate]);

     const handleServerSideProcessing = async ({
          page,
          count,
          sortby,
          startDate: forcedStartDate,
          endDate: forcedEndDate,
     }: {
          page: number;
          count: number;
          sortby?: string;
          startDate?: string;
          endDate?: string;
     }) => {
          try {
               const requestStart = forcedStartDate || startDate;
               const requestEnd = forcedEndDate || endDate;
               const url = `commission-payments/untracked/services?page=${page}&count=${count}&recipient_type=${encodeURIComponent(
                    recipientType,
               )}&recipient_id=${encodeURIComponent(recipientId)}&startDate=${encodeURIComponent(
                    requestStart,
               )}&endDate=${encodeURIComponent(requestEnd)}${sortby ? `&sortby=${encodeURIComponent(sortby)}` : ""}`;
               const response = await customFetch(url);
               if (response && (response.status === true || response.status === "success" || response.success === true)) {
                    return { result: response.data || [] };
               }
               return { result: [] };
          } catch (err: any) {
               return { result: [], error: err.message || true };
          }
     };

     const columns = [
          { Header: "Service ID", accessor: "serviceid" },
          {
               Header: "Test / Category",
               accessor: "test_name",
               Cell: ({ row }: any) => (
                    <div>
                         <div>{row.original.test_name}</div>
                         <small className="text-muted">{row.original.serviceCategory}</small>
                    </div>
               ),
          },
          {
               Header: "Total Payable",
               accessor: "totalpayable",
               Cell: ({ row }: any) => currencyFormatter.format(Number(row.original.totalpayable)),
          },
          {
               Header: "Paid Amount",
               accessor: "paidamount",
               Cell: ({ row }: any) => currencyFormatter.format(Number(row.original.paidamount)),
          },
          {
               Header: "Status",
               accessor: "status",
               Cell: ({ row }: any) => (
                    <span className={`badge bg-${row.original.status === 'active' ? 'success' : 'secondary'}`}>
                         {row.original.status}
                    </span>
               ),
          },
          {
               Header: "Payment Status",
               accessor: "paymentstatus",
               Cell: ({ row }: any) => (
                    <span className={`badge bg-${row.original.paymentstatus === 'paid' ? 'success' : 'warning'}`}>
                         {row.original.paymentstatus}
                    </span>
               ),
          },
          {
               Header: "Added On",
               accessor: "serviceAddedOn",
               Cell: ({ row }: any) => dayjs(row.original.serviceAddedOn).format("YYYY-MM-DD HH:mm"),
          },
          {
               Header: "Actions",
               id: "actions",
               disableSortBy: true,
               Cell: ({ row }: any) => (
                    <button
                         className="btn btn-sm btn-primary"
                         onClick={() => handleTrackRecord(row.original)}
                    >
                         Track Record
                    </button>
               ),
          },
     ];

     const summary = data.reduce(
          (acc, item) => {
               acc.totalPayable += Number(item.totalpayable);
               acc.totalPaid += Number(item.paidamount);
               acc.totalServices += 1;
               return acc;
          },
          { totalPayable: 0, totalPaid: 0, totalServices: 0 }
     );

     const handleTrackRecord = async (service: UntrackedService) => {
          try {
               const response = await customPost(
                    "commission-payments/untracked/services",
                    "POST",
                    {
                         serviceid: service.serviceid,
                         recipient_type: recipientType,
                         recipient_id: parseInt(recipientId),
                    }
               );

               const success = response && (response.status === true || response.status === "success" || response.success === true);
               if (success) {
                    const message = response?.message || "Service tracked successfully";
                    const trackingId = response?.data?.tracking_id;
                    toast.success(trackingId ? `${message} (Tracking ID: ${trackingId})` : message);
                    await fetchServices();
               } else {
                    toast.error(response?.message || "Failed to track service");
               }
          } catch (error) {
               console.error("Error tracking service:", error);
               toast.error("Error tracking service");
          }
     };

     return (
          <div className="container-fluid px-4 py-3">
               <nav aria-label="breadcrumb" className="mb-3">
                    <ol className="breadcrumb">
                         <li className="breadcrumb-item">
                              <a href="/organization/untracked-commission-records">Untracked Services</a>
                         </li>
                         <li className="breadcrumb-item active" aria-current="page">
                              {recipientType} {recipientId}
                         </li>
                    </ol>
               </nav>

               <div className="card mb-4" style={{ borderRadius: "0.75rem", borderColor: "var(--bs-border-color)" }}>
                    <div className="card-header py-3 px-4" style={{ backgroundColor: "var(--bs-tertiary-bg)", borderColor: "var(--bs-border-color)" }}>
                         <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center">
                              <h2 className="fs-6 fw-semibold text-body-emphasis mb-3 mb-lg-0 d-flex align-items-center">
                                   <RiFileListLine size={22} style={{ color: "oklch(0.646 0.222 41.116)" }} className="me-2 flex-shrink-0" />
                                   Untracked Services for {recipientType}
                                   {recipientName && (
                                        <span className="ms-2 badge bg-primary">{recipientName}</span>
                                   )}
                              </h2>
                              <div className="d-flex flex-column flex-sm-row align-items-stretch align-items-sm-center gap-2">
                                   <div className="d-flex gap-2 flex-wrap">
                                        <DateFilterReusable
                                             value={dateFilter}
                                             onChange={setDateFilter}
                                             onDateRangeChange={handleDateRangeChange}
                                             label="Filter by"
                                        />
                                        <button
                                             className="btn btn-sm btn-primary d-flex align-items-center"
                                             onClick={() => fetchServices()}
                                             disabled={filtering || loading}
                                        >
                                             <RiRefreshLine size={16} className="me-1" />
                                             Apply Filter
                                        </button>
                                        <button
                                             className="btn btn-sm btn-outline-secondary d-flex align-items-center"
                                             onClick={() => fetchServices()}
                                             disabled={loading || filtering}
                                        >
                                             <RiRefreshLine size={16} className="me-1" />
                                             {loading ? "Refreshing..." : "Refresh"}
                                        </button>
                                   </div>
                              </div>
                         </div>
                    </div>

                    <div className="card-body p-4">
                         <p className="text-muted mb-0">
                              {recipientType === "clinician" ? (
                                   <RiUserLine size={16} className="me-1" />
                              ) : (
                                   <RiBuildingLine size={16} className="me-1" />
                              )}
                              Viewing untracked services for {recipientName || `${recipientType} ID: ${recipientId}`}
                         </p>
                    </div>

                    <div className="row g-3 mb-4">
                         <div className="col-md-4">
                              <div className="border rounded h-100" style={{ borderColor: "var(--bs-border-color)" }}>
                                   <div className="p-3">
                                        <div className="d-flex align-items-center mb-2">
                                             <RiFileListLine size={20} className="text-primary me-2" />
                                             <h6 className="mb-0 fw-bold">Total Services</h6>
                                        </div>
                                        <div className="fs-4 fw-bold text-primary">{summary.totalServices}</div>
                                   </div>
                              </div>
                         </div>
                         <div className="col-md-4">
                              <div className="border rounded h-100" style={{ borderColor: "var(--bs-border-color)" }}>
                                   <div className="p-3">
                                        <div className="d-flex align-items-center mb-2">
                                             <span className="text-success me-2" style={{ fontSize: "20px" }}>₵</span>
                                             <h6 className="mb-0 fw-bold">Total Payable</h6>
                                        </div>
                                        <div className="fs-4 fw-bold text-success">{currencyFormatter.format(summary.totalPayable)}</div>
                                   </div>
                              </div>
                         </div>
                         <div className="col-md-4">
                              <div className="border rounded h-100" style={{ borderColor: "var(--bs-border-color)" }}>
                                   <div className="p-3">
                                        <div className="d-flex align-items-center mb-2">
                                             <span className="text-info me-2" style={{ fontSize: "20px" }}>₵</span>
                                             <h6 className="mb-0 fw-bold">Total Paid</h6>
                                        </div>
                                        <div className="fs-4 fw-bold text-info">{currencyFormatter.format(summary.totalPaid)}</div>
                                   </div>
                              </div>
                         </div>
                    </div>

                    <div className="card" style={{ borderRadius: "0.75rem", borderColor: "var(--bs-border-color)" }}>
                         <div className="card-header py-3 px-4" style={{ backgroundColor: "var(--bs-tertiary-bg)", borderColor: "var(--bs-border-color)" }}>
                              <h6 className="mb-0 fw-semibold text-body-emphasis">Service Records</h6>
                         </div>
                         <div className="card-body p-0">
                              <div className="table-responsive">
                                   <PrimeTable
                                        column={columns}
                                        data={data}
                                        filtering={true}
                                        serverSideFiltering={true}
                                        urlparams={{ startDate, endDate }}
                                        handleSeverSideProcessing={handleServerSideProcessing}
                                   />
                              </div>
                         </div>
                    </div>
               </div>
               );
          </div>
     );
}
