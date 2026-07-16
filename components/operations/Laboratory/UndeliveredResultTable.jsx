"use client";

import React, { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import PrimeTable from "../../accessories/Datatables/PrimeTable";
import { customFetch } from "../../Auth/customFetch";
import Loader from "../../accessories/Loader";
import SingleWorkFlowResultDeliveryModal from "./singleWorkFlowDeliveryResult";
import BulkWorkFlowResultDeliveryModal from "./bulkWorkFlowDeliveryResult";
import {
     RiAlertLine,
     RiCheckLine,
     RiExternalLinkLine,
     RiInboxArchiveLine,
     RiTruckLine,
} from "@remixicon/react";

const normalizeRecords = (records) => {
     if (!Array.isArray(records)) return [];

     return records.map((item) => ({
          ...item,
          fullname: `${item.firstname || ""} ${item.lastname || ""}`.trim(),
          ascension_id: item.ascensionid,
          current_stage: "COMPLETED + VALIDATED",
          delivery_state: item.delivered_mode ? "DELIVERED" : "PENDING DELIVERY",
     }));
};

export default function UndeliveredResultTable({ employeeid }) {
     const [rows, setRows] = useState([]);
     const [loading, setLoading] = useState(true);
     const [totalCount, setTotalCount] = useState(0);
     const [showDeliveryModal, setShowDeliveryModal] = useState(false);
     const [selectedRow, setSelectedRow] = useState(null);
     const [selectedRows, setSelectedRows] = useState(new Set());
     const [showBulkDeliveryModal, setShowBulkDeliveryModal] = useState(false);

     const loadUndelivered = async (page = 1, count = 10) => {
          const response = await customFetch(
               `result/delivery/record/result/undelivered?page=${page}&count=${count}`,
          );

          const dataset = response?.records?.dataset;
          const normalized = normalizeRecords(dataset);
          setRows(normalized);
          setTotalCount(Number(response?.records?.totalcount || 0));

          return normalized;
     };

     useEffect(() => {
          const initialize = async () => {
               try {
                    setLoading(true);
                    await loadUndelivered(1, 10);
               } catch (error) {
                    console.error("Failed to load undelivered results", error);
                    setRows([]);
               } finally {
                    setLoading(false);
               }
          };

          initialize();
     }, []);

     const handleRowSelection = (ascensionid) => {
          setSelectedRows((prev) => {
               const next = new Set(prev);
               if (next.has(ascensionid)) {
                    next.delete(ascensionid);
               } else {
                    next.add(ascensionid);
               }
               return next;
          });
     };

     const handleSelectAll = () => {
          if (rows.length > 0 && selectedRows.size === rows.length) {
               setSelectedRows(new Set());
               return;
          }
          setSelectedRows(new Set(rows.map((item) => item.ascensionid)));
     };

     const handleBulkDeliveryUpdate = () => {
          if (selectedRows.size === 0) {
               alert("Please select at least one result to update.");
               return;
          }
          setShowBulkDeliveryModal(true);
     };

     const columns = useMemo(
          () => [
               {
                    Header: () => (
                         <input
                              type="checkbox"
                              className="form-check-input"
                              checked={rows.length > 0 && selectedRows.size === rows.length}
                              onChange={handleSelectAll}
                         />
                    ),
                    id: "selection",
                    accessor: "ascensionid",
                    disableSortBy: true,
                    Cell: ({ row }) => (
                         <input
                              type="checkbox"
                              className="form-check-input"
                              checked={selectedRows.has(row.original.ascensionid)}
                              onChange={() => handleRowSelection(row.original.ascensionid)}
                         />
                    ),
               },
               {
                    Header: "Patient",
                    accessor: "fullname",
                    Cell: ({ row }) => (
                         <div>
                              <div className="fw-bold text-uppercase">{row.original.fullname}</div>
                              <small className="text-muted">{row.original.designation || ""}</small>
                         </div>
                    ),
               },
               {
                    Header: "Patient ID",
                    accessor: "fullpatientid",
               },
               {
                    Header: "Billing/Ascension",
                    accessor: "ascensionid",
                    Cell: ({ row }) => (
                         <div>
                              <div>Bill: {row.original.billingid}</div>
                              <div>Ascension: {row.original.ascensionid}</div>
                         </div>
                    ),
               },
               {
                    Header: "Requested Delivery",
                    accessor: "requested_mode",
                    Cell: ({ value, row }) => (
                         <div>
                              <span className="badge text-bg-info text-uppercase">
                                   {(value || "not set").toString()}
                              </span>
                              {row.original.requested_mode_detail ? (
                                   <div className="text-muted small mt-1">
                                        {row.original.requested_mode_detail}
                                   </div>
                              ) : null}
                         </div>
                    ),
               },
               {
                    Header: "Current Stage",
                    accessor: "current_stage",
                    Cell: ({ row }) => (
                         <div className="d-flex flex-column gap-1">
                              <span className="badge text-bg-success d-inline-flex align-items-center gap-1">
                                   <RiCheckLine size={14} />
                                   Completed
                              </span>
                              <span className="badge text-bg-primary d-inline-flex align-items-center gap-1">
                                   <RiCheckLine size={14} />
                                   Validated
                              </span>
                              <span className="badge text-bg-warning text-dark d-inline-flex align-items-center gap-1">
                                   <RiAlertLine size={14} />
                                   Pending Delivery
                              </span>
                         </div>
                    ),
               },
               {
                    Header: "Created",
                    accessor: "created_at",
                    Cell: ({ value }) =>
                         value ? dayjs(value).format("DD-MM-YYYY hh:mm A") : "N/A",
               },
               {
                    Header: "Action",
                    id: "action",
                    Cell: ({ row }) => (
                         <div className="d-flex gap-2">
                              <button
                                   className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1"
                                   onClick={() => {
                                        setSelectedRow(row.original);
                                        setShowDeliveryModal(true);
                                   }}
                              >
                                   <RiTruckLine size={16} />
                                   Record Delivery
                              </button>
                              <button
                                   type="button"
                                   className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1"
                                   onClick={() => {
                                        const patientid = row.original.patientid;
                                        const billingid = row.original.billingid;
                                        window.open(
                                             `/operations/laboratory/main/dailyRequest/visit?billingid=${encodeURIComponent(billingid)}&patientid=${encodeURIComponent(patientid)}&&isOpenSideBarShow=false`,
                                             "_blank",
                                             "noopener,noreferrer",
                                        );
                                   }}
                              >
                                   <RiExternalLinkLine size={16} />
                                   Open Visit
                              </button>
                         </div>
                    ),
               },
          ],
          [rows, selectedRows],
     );

     if (loading) return <Loader />;

     return (
          <div>
               {showBulkDeliveryModal ? (
                    <BulkWorkFlowResultDeliveryModal
                         show={showBulkDeliveryModal}
                         onHide={() => setShowBulkDeliveryModal(false)}
                         employeeid={Number(employeeid)}
                         items={rows.filter((item) => selectedRows.has(item.ascensionid))}
                         onSuccess={async () => {
                              setSelectedRows(new Set());
                              await loadUndelivered(1, 10);
                         }}
                    />
               ) : null}

               {selectedRow ? (
                    <SingleWorkFlowResultDeliveryModal
                         key={String(selectedRow.ascensionid)}
                         item={selectedRow}
                         employeeid={Number(employeeid)}
                         workflow={"resultDelivery"}
                         show={showDeliveryModal}
                         onHide={() => {
                              setShowDeliveryModal(false);
                              setSelectedRow(null);
                         }}
                         onSuccess={async () => {
                              setShowDeliveryModal(false);
                              setSelectedRow(null);
                              setSelectedRows(new Set());
                              await loadUndelivered(1, 10);
                         }}
                    />
               ) : null}

               <div className="d-flex flex-wrap align-items-center justify-content-between mb-3 gap-2">
                    <div>
                         <h5 className="mb-1 d-flex align-items-center gap-2">
                              <RiInboxArchiveLine size={20} />
                              Undelivered Laboratory Results
                         </h5>
                         <small className="text-muted">
                              Completed and validated results that are pending delivery to clients.
                         </small>
                    </div>
                    <span className="badge text-bg-dark">Total Undelivered: {totalCount}</span>
               </div>

               <div className="d-flex flex-wrap align-items-center justify-content-between mb-3 gap-2">
                    <div className="d-flex align-items-center gap-2">
                         <button
                              type="button"
                              className="btn btn-sm btn-primary d-inline-flex align-items-center gap-1"
                              onClick={handleBulkDeliveryUpdate}
                              disabled={selectedRows.size === 0}
                         >
                              <RiTruckLine size={16} />
                              Bulk Update Delivery ({selectedRows.size})
                         </button>
                    </div>
                    {selectedRows.size > 0 ? (
                         <small className="text-muted">{selectedRows.size} selected on current page</small>
                    ) : null}
               </div>

               <PrimeTable
                    column={columns}
                    data={rows}
                    filtering={true}
                    serverSideFiltering={true}
                    urlparams={{}}
                    handleSeverSideProcessing={async (pagination) => {
                         try {
                              const currentPage = Number(pagination?.page || 1);
                              const currentCount = Number(pagination?.count || 10);
                              const result = await loadUndelivered(currentPage, currentCount);
                              return { result, error: false };
                         } catch (error) {
                              console.error("Failed server-side processing for undelivered results", error);
                              return { result: [], error: true };
                         }
                    }}
               />
          </div>
     );
}
