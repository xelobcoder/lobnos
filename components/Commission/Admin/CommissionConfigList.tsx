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
import PrimeTable from "../../accessories/Datatables/PrimeTable";
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
     const [configs, setConfigs] = useState<CommissionConfig[]>([]);
     const [loading, setLoading] = useState(true);
     const [deleting, setDeleting] = useState<number | null>(null);

     useEffect(() => {
          fetchConfigs();
     }, [refreshTrigger]);

     const fetchConfigs = async () => {
          try {
               setLoading(true);
               const response = await getCommissionConfigs();
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
               const response = await deleteCommissionConfig(id);
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

     const columns = [
          {
               Header: "Name",
               accessor: "name",
               Cell: ({ value }: { value: string }) => <span className="fw-medium">{value}</span>,
          },
          {
               Header: "Type",
               accessor: "commission_type",
               Cell: ({ value }: { value: string }) => (
                    <span className="badge bg-light text-dark">{formatCommissionType(value)}</span>
               ),
          },
          {
               Header: "Rate",
               accessor: "rate",
               disableSortBy: true,
               Cell: ({ row }: any) => {
                    const config = row.original as CommissionConfig;
                    if (config.commission_type === "percentage") return <span>{config.percentage_rate}%</span>;
                    if (config.commission_type === "fixed") return <span>{formatCurrency(config.fixed_component || 0)}</span>;
                    if (config.commission_type === "hybrid") return <span>{config.percentage_rate}% + {formatCurrency(config.fixed_component || 0)}</span>;
                    if (config.commission_type === "sliding_scale") return <span>{config.percentage_rate}% - {config.sliding_max_percentage}%</span>;
                    const tierLabels: Record<string, string> = {
                         tiered: "Multiple tiers",
                         volume: "Volume tiers",
                         quota: "Quota tiers",
                         accelerating: "Progressive tiers",
                    };
                    return <span className="text-muted small">{tierLabels[config.commission_type]}</span>;
               },
          },
          {
               Header: "Caps",
               accessor: "caps",
               disableSortBy: true,
               Cell: ({ row }: any) => {
                    const config = row.original as CommissionConfig;
                    return config.min_commission || config.max_commission ? (
                         <span className="small">
                              {config.min_commission && `Min: ${formatCurrency(config.min_commission)}`}
                              {config.min_commission && config.max_commission && " | "}
                              {config.max_commission && `Max: ${formatCurrency(config.max_commission)}`}
                         </span>
                    ) : <span className="text-muted">None</span>;
               },
          },
          {
               Header: "Period Cap",
               accessor: "period_cap",
               Cell: ({ row }: any) => {
                    const config = row.original as CommissionConfig;
                    return config.period_cap ? <span className="small">{formatCurrency(config.period_cap)} / {formatPeriodReset(config.period_cap_reset)}</span> : <span className="text-muted">None</span>;
               },
          },
          {
               Header: "Status",
               accessor: "is_active",
               Cell: ({ row }: any) => {
                    const status = getConfigStatus(row.original as CommissionConfig);
                    return <span className={`badge bg-${status.color}`}>{status.label}</span>;
               },
          },
          {
               Header: "Actions",
               accessor: "actions",
               disableSortBy: true,
               Cell: ({ row }: any) => {
                    const config = row.original as CommissionConfig;
                    return (
                         <div className="d-flex gap-1">
                              <button className="btn btn-sm btn-outline-primary" onClick={() => onEdit?.(config)} title="Edit">
                                   <RiEdit2Line size={16} />
                              </button>
                              <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(config.id!)} disabled={deleting === config.id} title="Delete">
                                   {deleting === config.id ? <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" /> : <RiDeleteBin6Line size={16} />}
                              </button>
                         </div>
                    );
               },
          },
     ];

     return (
          <PrimeTable handleSeverSideProcessing={undefined} serverSideFiltering={true} column={columns} data={configs} filtering={false} />
     );
}
