"use client";

import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
     CommissionAssignment,
     CommissionConfig,
     deleteCommissionAssignment,
     getCommissionConfigs,
} from "../../../lib/commission/commissionApi";
import {
     formatScopeType,
} from "../../../lib/commission/commissionHelpers";
import { handleServerSideCommissionAssignments } from "../../serverActions/ActionFiltering";
import { useApplicationSettings } from "../../Auth/useApplicationContext";
import PrimeTable from "../../accessories/Datatables/PrimeTable";
import { RiEdit2Line, RiDeleteBin6Line } from "@remixicon/react";

interface CommissionAssignmentListProps {
     onEdit?: (assignment: CommissionAssignment) => void;
     onDelete?: () => void;
     refreshTrigger?: number;
     filterType?: string;
     filterName?: string;
     status?: string;
}

export default function CommissionAssignmentList({
     onEdit,
     onDelete,
     refreshTrigger,
     filterType: propsFilterType,
     filterName: propsFilterName,
     status: propsStatus,
}: CommissionAssignmentListProps) {
     const [assignments, setAssignments] = useState<CommissionAssignment[]>([]);
     const [configMap, setConfigMap] = useState<{ [key: number]: CommissionConfig }>({});
     const [deleting, setDeleting] = useState<number | null>(null);

     useEffect(() => {
          fetchConfigs();
     }, []);

     useEffect(() => {
          const timer = setTimeout(() => {
               loadInitialData();
          }, 300);
          return () => clearTimeout(timer);
     }, [refreshTrigger, propsFilterType, propsFilterName, propsStatus]);

     const fetchConfigs = async () => {
          try {
               const configsResponse = await getCommissionConfigs();
               if (configsResponse?.status === "success") {
                    const configs = configsResponse.result || [];
                    const map: { [key: number]: CommissionConfig } = {};
                    configs.forEach((config) => {
                         if (config.id) {
                              map[config.id] = config;
                         }
                    });
                    setConfigMap(map);
               }
          } catch (error) {
               toast.error("Failed to load configurations");
          }
     };

     const loadInitialData = async () => {
          try {
               const response = await handleServerSideProcessing({
                    page: 1,
                    count: 10,
                    filterType: propsFilterType,
                    filterName: propsFilterName,
                    status: propsStatus,
                    sortby: "DESC"
               });
               if (response && !response.error) {
                    setAssignments(response.result);
               }
          } catch (error) {
               toast.error("Failed to load initial assignments");
          }
     };

     const handleServerSideProcessing = async (pagination) => {
          const { page, count, filterType, filterName, status, sortby } = pagination;
          return await handleServerSideCommissionAssignments({
               page,
               count,
               filterType: filterType === "all" ? undefined : filterType,
               filterName: filterName || undefined,
               status: status === "all" ? undefined : status,
               sortby,
          });
     };

     const handleDelete = async (id: number) => {
          if (!window.confirm("Are you sure you want to delete this assignment?")) {
               return;
          }

          try {
               setDeleting(id);
               const response = await deleteCommissionAssignment(id);
               if (response?.status === "success") {
                    toast.success("Assignment deleted successfully");
                    if (onDelete) onDelete();
               } else {
                    toast.error(response?.message || "Failed to delete assignment");
               }
          } catch (error: any) {
               toast.error(error?.message || "An error occurred");
          } finally {
               setDeleting(null);
          }
     };

     const columns = [
          {
               Header: "Configuration",
               accessor: "commission_config_id",
               Cell: ({ value }) => configMap[value]?.name || `Config #${value}`,
          },
          {
               Header: "Recipient / Scope",
               accessor: "recipient_name",
               Cell: ({ row }) => {
                    const assignment = row.original;
                    return (
                         <div className="d-flex flex-column">
                              {assignment.recipient_name && (
                                   <span className="fw-medium">{assignment.recipient_name}</span>
                              )}
                              <span className="badge bg-light text-dark align-self-start">
                                   {formatScopeType(assignment.scope_type)}
                                   {assignment.scope_id && ` #${assignment.scope_id}`}
                              </span>
                         </div>
                    );
               },
          },
          {
               Header: "Priority",
               accessor: "priority",
               Cell: ({ value }) => <span className="badge bg-secondary">{value}</span>,
          },
          {
               Header: "Service Filter",
               accessor: "service_filter",
               Cell: ({ row }) => {
                    const assignment = row.original;
                    return (
                         <>
                              {assignment.service_id && (
                                   <small className="d-block">Service #{assignment.service_id}</small>
                              )}
                              {assignment.service_category && (
                                   <small className="d-block">{assignment.service_category}</small>
                              )}
                              {!assignment.service_id && !assignment.service_category && (
                                   <span className="text-muted">All services</span>
                              )}
                         </>
                    );
               },
          },
          {
               Header: "Valid From",
               accessor: "assigned_from",
               Cell: ({ value }) => value ? new Date(value).toLocaleDateString() : "-",
          },
          {
               Header: "Status",
               accessor: "is_active",
               Cell: ({ row }) => {
                    const assignment = row.original;
                    const isActiveValue = Boolean(assignment.is_active);
                    const isActive =
                         isActiveValue &&
                         (!assignment.assigned_from ||
                              new Date(assignment.assigned_from) <= new Date()) &&
                         (!assignment.assigned_to ||
                              new Date(assignment.assigned_to) >= new Date());

                    if (isActive) return <span className="badge bg-success">Active</span>;
                    if (!isActiveValue) return <span className="badge bg-secondary">Inactive</span>;
                    return <span className="badge bg-warning">Expired</span>;
               },
          },
          {
               Header: "Actions",
               accessor: "actions",
               disableSortBy: true,
               Cell: ({ row }) => (
                    <div className="d-flex gap-1">
                         <button
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => onEdit && onEdit(row.original)}
                              title="Edit"
                         >
                              <RiEdit2Line size={16} />
                         </button>
                         <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleDelete(row.original.id)}
                              disabled={deleting === row.original.id}
                              title="Delete"
                         >
                              {deleting === row.original.id ? (
                                   <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                              ) : (
                                   <RiDeleteBin6Line size={16} />
                              )}
                         </button>
                    </div>
               ),
          },
     ];

     return (
          <div className="card border-0 shadow-sm">
               <div className="card-body p-0">
                    <PrimeTable
                         column={columns}
                         data={assignments}
                         serverSideFiltering={true}
                         handleSeverSideProcessing={handleServerSideProcessing}
                         urlparams={{
                              filterType: propsFilterType,
                              filterName: propsFilterName,
                              status: propsStatus,
                              refreshTrigger
                         }}
                         filtering={false}
                    />
               </div>
          </div>
     );
}
