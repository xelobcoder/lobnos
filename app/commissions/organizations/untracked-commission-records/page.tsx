"use client";
import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import PrimeTable from "../../../../../components/accessories/Datatables/PrimeTable";
import { customFetch, currencyFormatter, customPost } from "../../../../../components/Auth/customFetch";
import { toast } from "react-toastify";

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

export default function UntrackedCommissionRecordsPage() {
     const today = dayjs().format("YYYY-MM-DD");
     const defaultStart = dayjs(`${dayjs().year()}-01-01`).format("YYYY-MM-DD");
     const [data, setData] = useState<UntrackedService[]>([]);
     const [startDate, setStartDate] = useState(defaultStart);
     const [endDate, setEndDate] = useState(today);
     const [loading, setLoading] = useState(true);
     const [filtering, setFiltering] = useState(false);

     const fetchInitialServices = async () => {
          setLoading(true);
          try {
               const response = await customFetch(
                    `commission-payments/untracked/services?page=1&count=10&startDate=${encodeURIComponent(
                         startDate,
                    )}&endDate=${encodeURIComponent(endDate)}`,
               );
               if (response && (response.status === true || response.status === "success" || response.success === true)) {
                    setData(response.data || []);
               } else {
                    setData([]);
               }
          } catch (error) {
               console.error(error);
               setData([]);
          } finally {
               setLoading(false);
          }
     };

     useEffect(() => {
          fetchInitialServices();
     }, [startDate, endDate]);

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
               const url = `commission-payments/untracked/services?page=${page}&count=${count}&startDate=${encodeURIComponent(
                    requestStart,
               )}&endDate=${encodeURIComponent(requestEnd)}${sortby ? `&sortby=${encodeURIComponent(sortby)}` : ""}`;
               const response = await customFetch(url);
               if (response && (response.status === true || response.status === "success" || response.success === true)) {
                    return { result: response.data || [], error: false };
               }
               return { result: [], error: false };
          } catch (err: any) {
               return { result: [], error: true };
          }
     };

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
          const recipientType = service.clinicianId ? "clinician" : "organization";
          const recipientId = service.clinicianId || service.organizationId;

          if (!recipientId) {
               toast.error("No recipient found for this service");
               return;
          }

          try {
               const response = await customPost(
                    "commission-payments/untracked/services",
                    "POST",
                    {
                         serviceid: service.serviceid,
                         recipient_type: recipientType,
                         recipient_id: recipientId,
                    }
               );

               const success = response && (response.status === true || response.status === "success" || response.success === true);
               if (success) {
                    const message = response?.message || "Service tracked successfully";
                    const trackingId = response?.data?.tracking_id;
                    toast.success(trackingId ? `${message} (Tracking ID: ${trackingId})` : message);
                    await fetchInitialServices();
               } else {
                    toast.error(response?.message || "Failed to track service");
               }
          } catch (error) {
               console.error("Error tracking service:", error);
               toast.error("Error tracking service");
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
               Header: "Recipient",
               accessor: "clinician_name",
               Cell: ({ row }: any) => row.original.clinician_name || row.original.organization_name || "N/A",
          },
          {
               Header: "View",
               id: "view",
               disableSortBy: true,
               Cell: ({ row }: any) => {
                    const recipientType = row.original.clinicianId ? "clinician" : "organization";
                    const recipientId = row.original.clinicianId || row.original.organizationId;

                    if (!recipientId) {
                         return "N/A";
                    }

                    return (
                         <a
                              href={`/organization/untracked-commission-records/recipient/${recipientType}/${recipientId}`}
                              className="btn btn-sm btn-outline-primary"
                         >
                              View {recipientType}
                         </a>
                    );
               },
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

     return (
          <div className="container-fluid px-4 py-3">
               <div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-4">
                    <div>
                         <h1 className="h5 mb-1">Untracked Commission Services</h1>
                         <p className="text-muted mb-0">Records that have not been tracked by the commission module.</p>
                    </div>
                    <div className="d-flex gap-2 flex-wrap">
                         <button
                              className="btn btn-sm btn-outline-secondary"
                              onClick={() => fetchInitialServices()}
                              disabled={loading || filtering}
                         >
                              {loading ? "Refreshing..." : "Refresh"}
                         </button>
                    </div>
               </div>

               <div className="border rounded p-3 mb-4">
                    <div className="row g-3 align-items-end">
                         <div className="col-auto">
                              <label className="form-label small mb-1">Start Date</label>
                              <input
                                   type="date"
                                   className="form-control form-control-sm"
                                   value={startDate}
                                   onChange={(e) => setStartDate(e.target.value)}
                              />
                         </div>
                         <div className="col-auto">
                              <label className="form-label small mb-1">End Date</label>
                              <input
                                   type="date"
                                   className="form-control form-control-sm"
                                   value={endDate}
                                   min={startDate}
                                   onChange={(e) => setEndDate(e.target.value)}
                              />
                         </div>
                         <div className="col-auto">
                              <button
                                   className="btn btn-sm btn-primary"
                                   onClick={() => fetchInitialServices()}
                                   disabled={filtering || loading}
                              >
                                   Apply Filter
                              </button>
                         </div>
                    </div>
               </div>

               <div className="border rounded p-3 mb-4">
                    <div className="row g-3 text-muted small">
                         <div className="col-sm-4">Total Services: {summary.totalServices}</div>
                         <div className="col-sm-4">Total Payable: {currencyFormatter.format(summary.totalPayable)}</div>
                         <div className="col-sm-4">Total Paid: {currencyFormatter.format(summary.totalPaid)}</div>
                    </div>
               </div>

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
     );
}
