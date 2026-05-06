"use client";

import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
     CommissionAssignment,
     CommissionConfig,
     getCommissionAssignments,
     deleteCommissionAssignment,
     getCommissionConfigs,
} from "../../../lib/commission/commissionApi";
import {
     formatScopeType,
} from "../../../lib/commission/commissionHelpers";
import { useApplicationSettings } from "../../Auth/useApplicationContext";
import Loader from "../../isLoading";
import { RiEdit2Line, RiDeleteBin6Line } from "@remixicon/react";


interface CommissionAssignmentListProps {
     onEdit?: (assignment: CommissionAssignment) => void;
     onDelete?: () => void;
     refreshTrigger?: number;
}

export default function CommissionAssignmentList({
     onEdit,
     onDelete,
     refreshTrigger,
}: CommissionAssignmentListProps) {
     const { applicationsettings } = useApplicationSettings();
     const [assignments, setAssignments] = useState<CommissionAssignment[]>([]);
     const [configMap, setConfigMap] = useState<{ [key: number]: CommissionConfig }>({});
     const [loading, setLoading] = useState(true);
     const [deleting, setDeleting] = useState<number | null>(null);

     const tenantId = applicationsettings?.tenantid || 1;

     useEffect(() => {
          fetchData();
     }, [tenantId, refreshTrigger]);

     const fetchData = async () => {
          try {
               setLoading(true);

               // Fetch assignments
               const assignmentsResponse = await getCommissionAssignments(tenantId);
               if (assignmentsResponse?.status === "success") {
                    setAssignments(assignmentsResponse.result || []);
               }

               // Fetch configs for mapping
               const configsResponse = await getCommissionConfigs(tenantId);
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
               toast.error("Failed to load assignments");
               setAssignments([]);
          } finally {
               setLoading(false);
          }
     };

     const handleDelete = async (id: number) => {
          if (!window.confirm("Are you sure you want to delete this assignment?")) {
               return;
          }

          try {
               setDeleting(id);
               const response = await deleteCommissionAssignment(id, tenantId);
               if (response?.status === "success") {
                    toast.success("Assignment deleted successfully");
                    setAssignments(assignments.filter((a) => a.id !== id));
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

     const getConfigName = (configId: number): string => {
          return configMap[configId]?.name || `Config #${configId}`;
     };

     if (loading) {
          return <Loader />;
     }

     if (assignments.length === 0) {
          return (
               <div className="alert alert-info">
                    <p className="mb-0">No commission assignments found.</p>
                    <small className="text-muted">Create a new assignment to get started.</small>
               </div>
          );
     }

     return (
          <div className="table-responsive">
               <table className="table table-hover table-striped">
                    <thead className="table-light">
                         <tr>
                              <th>Configuration</th>
                              <th>Scope</th>
                              <th>Priority</th>
                              <th>Service Filter</th>
                              <th>Valid From</th>
                              <th>Status</th>
                              <th style={{ width: "140px" }}>Actions</th>
                         </tr>
                    </thead>
                    <tbody>
                         {assignments.map((assignment) => {
                              const isActive =
                                   assignment.is_active &&
                                   (!assignment.assigned_from ||
                                        new Date(assignment.assigned_from) <= new Date()) &&
                                   (!assignment.assigned_to ||
                                        new Date(assignment.assigned_to) >= new Date());

                              return (
                                   <tr key={assignment.id}>
                                        <td className="fw-medium">{getConfigName(assignment.commission_config_id)}</td>
                                        <td>
                                             <span className="badge bg-light text-dark">
                                                  {formatScopeType(assignment.scope_type)}
                                                  {assignment.scope_id && ` #${assignment.scope_id}`}
                                             </span>
                                        </td>
                                        <td>
                                             <span className="badge bg-secondary">{assignment.priority}</span>
                                        </td>
                                        <td>
                                             {assignment.service_id && (
                                                  <small>Service #{assignment.service_id}</small>
                                             )}
                                             {assignment.service_category && (
                                                  <small>{assignment.service_category}</small>
                                             )}
                                             {!assignment.service_id && !assignment.service_category && (
                                                  <span className="text-muted">All services</span>
                                             )}
                                        </td>
                                        <td>
                                             {assignment.assigned_from ? (
                                                  <small>{new Date(assignment.assigned_from).toLocaleDateString()}</small>
                                             ) : (
                                                  <span className="text-muted">-</span>
                                             )}
                                        </td>
                                        <td>
                                             {isActive ? (
                                                  <span className="badge bg-success">Active</span>
                                             ) : !assignment.is_active ? (
                                                  <span className="badge bg-secondary">Inactive</span>
                                             ) : (
                                                  <span className="badge bg-warning">Expired</span>
                                             )}
                                        </td>
                                        <td>
                                             <button
                                                  className="btn btn-sm btn-outline-primary me-1"
                                                  onClick={() => onEdit && onEdit(assignment)}
                                                  title="Edit"
                                             >
                                                  <RiEdit2Line size={16} />
                                             </button>
                                             <button
                                                  className="btn btn-sm btn-outline-danger"
                                                  onClick={() => handleDelete(assignment.id!)}
                                                  disabled={deleting === assignment.id}
                                                  title="Delete"
                                             >
                                                  {deleting === assignment.id ? (
                                                       <span
                                                            className="spinner-border spinner-border-sm"
                                                            role="status"
                                                            aria-hidden="true"
                                                       ></span>
                                                  ) : (
                                                       <RiDeleteBin6Line size={16} />
                                                  )}
                                             </button>
                                        </td>
                                   </tr>
                              );
                         })}
                    </tbody>
               </table>
          </div>
     );
}
