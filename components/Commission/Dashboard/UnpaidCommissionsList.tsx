"use client";

import React from "react";
import { CommissionTracking } from "../../../lib/commission/commissionApi";
import { formatCurrency, getStatusBadgeClass } from "../../../lib/commission/commissionHelpers";
import PrimeTable from "../../accessories/Datatables/PrimeTable";
import { RiEyeLine } from "@remixicon/react";


interface UnpaidCommissionsListProps {
     commissions: CommissionTracking[];
     loading?: boolean;
     onViewDetails?: (commission: CommissionTracking) => void;
}

export default function UnpaidCommissionsList({
     commissions,
     loading = false,
     onViewDetails,
}: UnpaidCommissionsListProps) {
     if (loading) {
          return (
               <div className="py-4">
                    <div className="placeholder-glow">
                         <div className="placeholder" style={{ height: "300px" }}></div>
                    </div>
               </div>
          );
     }

     if (commissions.length === 0) {
          return (
               <div className="text-center py-5 border-top border-bottom">
                    <p className="text-muted mb-0">
                         No unpaid commissions at this time. Great job staying on top!
                    </p>
               </div>
          );
     }

     const totalUnpaid = commissions.reduce(
          (sum, c) => sum + c.final_commission,
          0
     );
     const columns = [
          {
               Header: "Service",
               accessor: "service_id",
               Cell: ({ value }: { value: number }) => <span className="fw-medium">Service #{value}</span>,
          },
          {
               Header: "Amount",
               accessor: "service_amount",
               Cell: ({ value }: { value: number }) => formatCurrency(value),
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
               <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="mb-0">Unpaid Commissions</h5>
                    <span className="badge bg-danger">{commissions.length}</span>
               </div>
               <PrimeTable
                    column={columns}
                    data={commissions}
                    filtering={false}
                    handleSeverSideProcessing={undefined}
               />
               <div className="border-top mt-3 pt-2 small">
                    <div className="d-flex justify-content-between">
                         <span>Total Unpaid:</span>
                         <span className="fw-bold text-success">
                              {formatCurrency(totalUnpaid)}
                         </span>
                    </div>
               </div>
          </section>
     );
}
