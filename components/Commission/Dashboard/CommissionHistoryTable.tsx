"use client";

import React from "react";
import { CommissionTracking } from "../../../lib/commission/commissionApi";
import {
     formatCurrency,
     getStatusBadgeClass,
} from "../../../lib/commission/commissionHelpers";
import PrimeTable from "../../accessories/Datatables/PrimeTable";
import { RiEyeLine } from "@remixicon/react";


interface CommissionHistoryTableProps {
     commissions: CommissionTracking[];
     loading?: boolean;
     onViewDetails?: (commission: CommissionTracking) => void;
}

export default function CommissionHistoryTable({
     commissions,
     loading = false,
     onViewDetails,
}: CommissionHistoryTableProps) {
     if (loading) {
          return (
               <div className="py-4">
                    <div className="placeholder-glow">
                         <div style={{ height: "400px" }}></div>
                    </div>
               </div>
          );
     }

     if (commissions.length === 0) {
          return (
               <div className="text-center py-5 border-top border-bottom">
                    <p className="text-muted mb-0">
                         No commission history available yet.
                    </p>
               </div>
          );
     }

     const totalCommission = commissions.reduce(
          (sum, c) => sum + c.final_commission,
          0
     );
     const columns = [
          {
               Header: "Date",
               accessor: "calculated_at",
               Cell: ({ value }: { value: string }) => <span className="small">{new Date(value).toLocaleDateString()}</span>,
          },
          {
               Header: "Service",
               accessor: "service_id",
               Cell: ({ value }: { value: number }) => <span className="fw-medium small">Service #{value}</span>,
          },
          {
               Header: "Amount",
               accessor: "service_amount",
               Cell: ({ value }: { value: number }) => formatCurrency(value),
          },
          {
               Header: "Type",
               accessor: "commission_type",
               Cell: ({ value }: { value: string }) => <span className="badge bg-light text-dark small">{value}</span>,
          },
          {
               Header: "Commission",
               accessor: "final_commission",
               Cell: ({ value }: { value: number }) => <span className="fw-bold text-success">{formatCurrency(value)}</span>,
          },
          {
               Header: "Status",
               accessor: "status",
               Cell: ({ value }: { value: CommissionTracking["status"] }) => <span className={`badge ${getStatusBadgeClass(value)}`}>{value.charAt(0).toUpperCase() + value.slice(1)}</span>,
          },
          {
               Header: "Actions",
               accessor: "actions",
               disableSortBy: true,
               Cell: ({ row }: any) => (
                    <button className="btn btn-sm btn-outline-primary" onClick={() => onViewDetails?.(row.original)} title="View details">
                         <RiEyeLine size={16} />
                    </button>
               ),
          },
     ];

     return (
          <section>
               <div className="mb-3">
                    <h5 className="mb-0">Commission History</h5>
               </div>
               <PrimeTable column={columns} data={commissions} filtering={false} 
                handleSeverSideProcessing={undefined} serverSideFiltering={true}
               />
               <div className="border-top mt-3 pt-2 small">
                    <div className="row g-2">
                         <div className="col-md-4">
                              <div className="d-flex justify-content-between">
                                   <span>Total Records:</span>
                                   <span className="fw-bold">{commissions.length}</span>
                              </div>
                         </div>
                         <div className="col-md-4">
                              <div className="d-flex justify-content-between">
                                   <span>Total Amount:</span>
                                   <span className="fw-bold">
                                        {formatCurrency(
                                             commissions.reduce((sum, c) => sum + c.service_amount, 0)
                                        )}
                                   </span>
                              </div>
                         </div>
                         <div className="col-md-4">
                              <div className="d-flex justify-content-between">
                                   <span>Total Commission:</span>
                                   <span className="fw-bold text-success">
                                        {formatCurrency(totalCommission)}
                                   </span>
                              </div>
                         </div>
                    </div>
               </div>
          </section>
     );
}
