"use client";

import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { CommissionConfig, getCommissionConfigs, deleteCommissionConfig } from "../../../lib/commission/commissionApi";
import {
     formatCommissionType,
     formatPeriodReset,
     getConfigStatus,
     formatCurrency,
} from "../../../lib/commission/commissionHelpers";
import { useApplicationSettings } from "../../Auth/useApplicationContext";
import Loader from "../../isLoading";
import { RiEdit2Line, RiDeleteBin6Line } from "@remixicon/react";

interface CommissionConfigListProps {
     onEdit?: (config: CommissionConfig) => void;
     onDelete?: () => void;
     refreshTrigger?: number;
}

export default function CommissionConfigList({
     onEdit,
     onDelete,
     refreshTrigger,
}: CommissionConfigListProps) {
     const { applicationsettings } = useApplicationSettings();
     const [configs, setConfigs] = useState<CommissionConfig[]>([]);
     const [loading, setLoading] = useState(true);
     const [deleting, setDeleting] = useState<number | null>(null);

     const tenantId = applicationsettings?.tenantid || 1;

     useEffect(() => {
          fetchConfigs();
     }, [tenantId, refreshTrigger]);

     const fetchConfigs = async () => {
          try {
               setLoading(true);
               const response = await getCommissionConfigs(tenantId);
               if (response?.status === "success") {
                    setConfigs(response.result || []);
               }
          } catch (error) {
               toast.error("Failed to load configurations");
               setConfigs([]);
          } finally {
               setLoading(false);
          }
     };

     const handleDelete = async (id: number) => {
          if (!window.confirm("Are you sure you want to delete this configuration?")) {
               return;
          }

          try {
               setDeleting(id);
               const response = await deleteCommissionConfig(id, tenantId);
               if (response?.status === "success") {
                    toast.success("Configuration deleted successfully");
                    setConfigs(configs.filter((c) => c.id !== id));
                    if (onDelete) onDelete();
               } else {
                    toast.error(response?.message || "Failed to delete configuration");
               }
          } catch (error: any) {
               toast.error(error?.message || "An error occurred");
          } finally {
               setDeleting(null);
          }
     };

     if (loading) {
          return <Loader />;
     }

     if (configs.length === 0) {
          return (
               <div className="alert alert-info">
                    <p className="mb-0">No commission configurations found.</p>
                    <small className="text-muted">Create a new configuration to get started.</small>
               </div>
          );
     }

     return (
          <div className="table-responsive">
               <table className="table table-hover table-striped">
                    <thead className="table-light">
                         <tr>
                              <th>Name</th>
                              <th>Type</th>
                              <th>Rate</th>
                              <th>Caps</th>
                              <th>Period Cap</th>
                              <th>Status</th>
                              <th style={{ width: "140px" }}>Actions</th>
                         </tr>
                    </thead>
                    <tbody>
                         {configs.map((config) => {
                              const status = getConfigStatus(config);
                              return (
                                   <tr key={config.id}>
                                        <td className="fw-medium">{config.name}</td>
                                        <td>
                                             <span className="badge bg-light text-dark">
                                                  {formatCommissionType(config.commission_type)}
                                             </span>
                                        </td>
                                        <td>
                                             {config.commission_type === "percentage" && config.percentage_rate && (
                                                  <span>{config.percentage_rate}%</span>
                                             )}
                                             {config.commission_type === "fixed" && config.fixed_component && (
                                                  <span>{formatCurrency(config.fixed_component)}</span>
                                             )}
                                             {config.commission_type === "tiered" && (
                                                  <span className="text-muted small">Multiple tiers</span>
                                             )}
                                             {config.commission_type === "hybrid" && (
                                                  <span>
                                                       {config.percentage_rate}% + {formatCurrency(config.fixed_component || 0)}
                                                  </span>
                                             )}
                                        </td>
                                        <td>
                                             {config.min_commission || config.max_commission ? (
                                                  <span className="small">
                                                       {config.min_commission && `Min: ${formatCurrency(config.min_commission)}`}
                                                       {config.min_commission && config.max_commission && " | "}
                                                       {config.max_commission && `Max: ${formatCurrency(config.max_commission)}`}
                                                  </span>
                                             ) : (
                                                  <span className="text-muted">None</span>
                                             )}
                                        </td>
                                        <td>
                                             {config.period_cap ? (
                                                  <span className="small">
                                                       {formatCurrency(config.period_cap)} / {formatPeriodReset(config.period_cap_reset)}
                                                  </span>
                                             ) : (
                                                  <span className="text-muted">None</span>
                                             )}
                                        </td>
                                        <td>
                                             <span className={`badge bg-${status.color}`}>{status.label}</span>
                                        </td>
                                        <td>
                                             <button
                                                  className="btn btn-sm btn-outline-primary me-1"
                                                  onClick={() => onEdit && onEdit(config)}
                                                  title="Edit"
                                             >
                                                  <RiEdit2Line size={16} />
                                             </button>
                                             <button
                                                  className="btn btn-sm btn-outline-danger"
                                                  onClick={() => handleDelete(config.id!)}
                                                  disabled={deleting === config.id}
                                                  title="Delete"
                                             >
                                                  {deleting === config.id ? (
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
