"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Button, Dropdown, Form, Modal } from "react-bootstrap";
import dayjs from "dayjs";
import PrimeTable from "../../accessories/Datatables/PrimeTable";
import { customFetch } from "../../Auth/customFetch";
import Loader from "../../accessories/Loader";
import SingleWorkFlowResultDeliveryModal from "./singleWorkFlowDeliveryResult";
import BulkWorkFlowResultDeliveryModal from "./bulkWorkFlowDeliveryResult";
import DateFilterReusable from "./ResuableFilter/DateFilterReusable";
import {
     RiAlertLine,
     RiCheckLine,
     RiExternalLinkLine,
     RiInboxArchiveLine,
     RiTruckLine,
} from "@remixicon/react";

import { customPost } from '../../Auth/customFetch'

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
     const [showReasonModal, setShowReasonModal] = useState(false);
     const [selectedNotDeliveredRow, setSelectedNotDeliveredRow] = useState(null);
     const [notDeliveredReason, setNotDeliveredReason] = useState("");
     const [savingReason, setSavingReason] = useState(false);
     const [dateFilter, setDateFilter] = useState("");
     const [dateRange, setDateRange] = useState({ startDate: "", endDate: "" });

     const buildQueryString = (page = 1, count = 10, selectedDateRange = dateRange) => {
          const params = new URLSearchParams({
               page: String(page),
               count: String(count),
          });

          if (selectedDateRange?.startDate) params.set("startDate", selectedDateRange.startDate);
          if (selectedDateRange?.endDate) params.set("endDate", selectedDateRange.endDate);

          return params.toString();
     };

     const loadUndelivered = async (page = 1, count = 10, selectedDateRange = dateRange) => {
          const queryString = buildQueryString(page, count, selectedDateRange);
          const response = await customFetch(
               `result/delivery/record/result/undelivered?${queryString}`,
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

     const handleDateFilterSelection = (value) => {
          setDateFilter(value);
     };

     const handleDateRangeSelection = async (startDate, endDate) => {
          const nextRange = { startDate, endDate };
          setDateRange(nextRange);
          setLoading(true);

          try {
               await loadUndelivered(1, 10, nextRange);
          } catch (error) {
               console.error("Failed to filter undelivered results", error);
               setRows([]);
          } finally {
               setLoading(false);
          }
     };

     const handleResetDateFilter = async () => {
          setDateFilter("");
          setDateRange({ startDate: "", endDate: "" });
          setLoading(true);

          try {
               await loadUndelivered(1, 10, { startDate: "", endDate: "" });
          } catch (error) {
               console.error("Failed to reset undelivered result filters", error);
               setRows([]);
          } finally {
               setLoading(false);
          }
     };

     const handleOpenReasonModal = (row) => {
          setSelectedNotDeliveredRow(row);
          setNotDeliveredReason("");
          setShowReasonModal(true);
     };

     const handleSubmitNotDeliveredReason = async () => {
          const trimmedReason = notDeliveredReason.trim();
          if (!trimmedReason) {
               alert("Please provide a reason why the result was not delivered.");
               return;
          }

          if (trimmedReason.length > 500) {
               alert("Reason cannot exceed 500 characters.");
               return;
          }

          const billingid = selectedNotDeliveredRow?.billingid;
          const ascensionid = selectedNotDeliveredRow?.ascensionid ?? selectedNotDeliveredRow?.ascension_id;

          if (!billingid || !ascensionid) {
               alert("Unable to record reason without a billing or ascension reference.");
               return;
          }

          const payload = {
               billingid: Number(billingid),
               delivered_mode: "not_delivered",
               delivered_by_employeeid: Number(employeeid),
               delivered_at: new Date(),
               ascensionid: Number(ascensionid),
               notes: null,
               failurenotes: trimmedReason || null,
          };

          try {
               setSavingReason(true);
               const response = await customPost("result/delivery/record", "POST", payload);
               const success = response?.status === true || response?.statusCode === 200 || response?.status === "success";

               if (success) {
                    alert("Reason recorded successfully.");
                    setShowReasonModal(false);
                    setSelectedNotDeliveredRow(null);
                    setNotDeliveredReason("");
                    await loadUndelivered(1, 10, dateRange);
               } else {
                    alert("Failed to record the reason.");
               }
          } catch (error) {
               console.error("Failed to record not delivered reason", error);
               alert("Failed to record the reason.");
          } finally {
               setSavingReason(false);
          }
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
                    Header: "Failure Notes",
                    accessor: "failurenotes",
                    Cell: ({ value }) => (
                         <div style={{ width: '200px', textOverflow: "ellipsis", whiteSpace: "nowrap", overflow: "hidden" }} >
                              {value ? (
                                   <span className="text-danger">{value}</span>
                              ) : (
                                   <span className="text-muted small">N/A</span>
                              )}
                         </div>
                    )
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
                         <Dropdown>
                              <Dropdown.Toggle
                                   size="sm"
                                   variant="outline-secondary"
                                   className="d-inline-flex align-items-center justify-content-center"
                                   style={{ width: 36, height: 32, padding: 0 }}
                                   aria-label="Row actions"
                              >
                                   <span className="fs-5 lh-1">⋮</span>
                              </Dropdown.Toggle>

                              <Dropdown.Menu>
                                   <Dropdown.Item
                                        onClick={() => {
                                             setSelectedRow(row.original);
                                             setShowDeliveryModal(true);
                                        }}
                                   >
                                        <span className="d-inline-flex align-items-center gap-2">
                                             <RiTruckLine size={16} />
                                             Record Delivery
                                        </span>
                                   </Dropdown.Item>
                                   <Dropdown.Item onClick={() => handleOpenReasonModal(row.original)}>
                                        <span className="d-inline-flex align-items-center gap-2">
                                             <RiAlertLine size={16} />
                                             Record Not Delivered Reason
                                        </span>
                                   </Dropdown.Item>
                                   <Dropdown.Item
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
                                        <span className="d-inline-flex align-items-center gap-2">
                                             <RiExternalLinkLine size={16} />
                                             Open Visit
                                        </span>
                                   </Dropdown.Item>
                              </Dropdown.Menu>
                         </Dropdown>
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

               <Modal show={showReasonModal} onHide={() => {
                    setShowReasonModal(false);
                    setSelectedNotDeliveredRow(null);
                    setNotDeliveredReason("");
               }} centered>
                    <Modal.Header closeButton>
                         <Modal.Title>Record Why Result Was Not Delivered</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                         <Form>
                              <Form.Group className="mb-2">
                                   <Form.Label>Reason</Form.Label>
                                   <Form.Control
                                        as="textarea"
                                        rows={4}
                                        value={notDeliveredReason}
                                        onChange={(e) => setNotDeliveredReason(e.target.value)}
                                        placeholder="Enter the reason the result could not be delivered"
                                   />
                              </Form.Group>
                         </Form>
                    </Modal.Body>
                    <Modal.Footer>
                         <Button variant="secondary" onClick={() => {
                              setShowReasonModal(false);
                              setSelectedNotDeliveredRow(null);
                              setNotDeliveredReason("");
                         }} disabled={savingReason}>
                              Cancel
                         </Button>
                         <Button variant="warning" onClick={handleSubmitNotDeliveredReason} disabled={savingReason}>
                              {savingReason ? "Saving..." : "Save Reason"}
                         </Button>
                    </Modal.Footer>
               </Modal>

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

               <div className="border rounded p-3 mb-3 bg-light-subtle">
                    <div className="d-flex flex-wrap align-items-end justify-content-between gap-2">
                         <div className="flex-grow-1" style={{ minWidth: 260 }}>
                              <label className="form-label small mb-1">Filter by delivery date</label>
                              <DateFilterReusable
                                   value={dateFilter}
                                   onChange={handleDateFilterSelection}
                                   onDateRangeChange={handleDateRangeSelection}
                                   className="w-100"
                                   label="Filter by"
                              />
                         </div>
                         <button
                              type="button"
                              className="btn btn-outline-secondary btn-sm"
                              onClick={handleResetDateFilter}
                              disabled={loading}
                         >
                              Clear Filter
                         </button>
                    </div>
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
                              const result = await loadUndelivered(currentPage, currentCount, dateRange);
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
