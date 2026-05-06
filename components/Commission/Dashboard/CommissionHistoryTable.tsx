"use client";

import React, { useState } from "react";
import { CommissionTracking } from "../../../lib/commission/commissionApi";
import {
     formatCurrency,
     getStatusBadgeClass,
} from "../../../lib/commission/commissionHelpers";
import { RiArrowUpDownLine, RiEyeLine } from "@remixicon/react";


interface CommissionHistoryTableProps {
     commissions: CommissionTracking[];
     loading?: boolean;
     onViewDetails?: (commission: CommissionTracking) => void;
}

type SortField = "calculated_at" | "service_amount" | "final_commission" | "status";
type SortOrder = "asc" | "desc";

export default function CommissionHistoryTable({
     commissions,
     loading = false,
     onViewDetails,
}: CommissionHistoryTableProps) {
     const [sortField, setSortField] = useState<SortField>("calculated_at");
     const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

     const handleSort = (field: SortField) => {
          if (sortField === field) {
               setSortOrder(sortOrder === "asc" ? "desc" : "asc");
          } else {
               setSortField(field);
               setSortOrder("desc");
          }
     };

     const sortedCommissions = [...commissions].sort((a, b) => {
          let aValue: any = a[sortField];
          let bValue: any = b[sortField];

          if (typeof aValue === "string") {
               aValue = new Date(aValue).getTime();
               bValue = new Date(bValue).getTime();
          }

          if (sortOrder === "asc") {
               return aValue > bValue ? 1 : -1;
          } else {
               return aValue < bValue ? 1 : -1;
          }
     });

     const SortIcon = ({ field }: { field: SortField }) => {
          if (sortField !== field) return null;
          return (
               <RiArrowUpDownLine
                    size={14}
                    className="ms-1"
                    style={{
                         transform: sortOrder === "asc" ? "rotate(180deg)" : "rotate(0deg)",
                    }}
               />
          );
     };

     if (loading) {
          return (
               <div className="card border-0 shadow-sm">
                    <div className="card-body">
                         <div className="placeholder-glow">
                              <div style={{ height: "400px" }}></div>
                         </div>
                    </div>
               </div>
          );
     }

     if (commissions.length === 0) {
          return (
               <div className="card border-0 shadow-sm">
                    <div className="card-body text-center py-5">
                         <p className="text-muted mb-0">
                              No commission history available yet.
                         </p>
                    </div>
               </div>
          );
     }

     const totalCommission = commissions.reduce(
          (sum, c) => sum + c.final_commission,
          0
     );

     return (
          <div className="card border-0 shadow-sm">
               <div className="card-header bg-light py-3">
                    <h5 className="mb-0">Commission History</h5>
               </div>
               <div className="table-responsive">
                    <table className="table table-hover table-striped mb-0">
                         <thead className="table-light sticky-top">
                              <tr>
                                   <th style={{ cursor: "pointer" }} onClick={() => handleSort("calculated_at")}>
                                        Date <SortIcon field="calculated_at" />
                                   </th>
                                   <th>Service</th>
                                   <th
                                        style={{ cursor: "pointer" }}
                                        onClick={() => handleSort("service_amount")}
                                   >
                                        Amount <SortIcon field="service_amount" />
                                   </th>
                                   <th>Type</th>
                                   <th
                                        style={{ cursor: "pointer" }}
                                        onClick={() => handleSort("final_commission")}
                                   >
                                        Commission <SortIcon field="final_commission" />
                                   </th>
                                   <th onClick={() => handleSort("status")} style={{ cursor: "pointer" }}>
                                        Status <SortIcon field="status" />
                                   </th>
                                   <th style={{ width: "80px" }}>Actions</th>
                              </tr>
                         </thead>
                         <tbody>
                              {sortedCommissions.map((commission) => (
                                   <tr key={commission.id}>
                                        <td className="small">
                                             {new Date(commission.calculated_at).toLocaleDateString()}
                                        </td>
                                        <td className="fw-medium small">
                                             Service #{commission.service_id}
                                        </td>
                                        <td>{formatCurrency(commission.service_amount)}</td>
                                        <td>
                                             <span className="badge bg-light text-dark small">
                                                  {commission.commission_type}
                                             </span>
                                        </td>
                                        <td className="fw-bold text-success">
                                             {formatCurrency(commission.final_commission)}
                                        </td>
                                        <td>
                                             <span className={`badge ${getStatusBadgeClass(commission.status)}`}>
                                                  {commission.status.charAt(0).toUpperCase() +
                                                       commission.status.slice(1)}
                                             </span>
                                        </td>
                                        <td>
                                             <button
                                                  className="btn btn-sm btn-outline-primary"
                                                  onClick={() =>
                                                       onViewDetails && onViewDetails(commission)
                                                  }
                                                  title="View details"
                                             >
                                                  <RiEyeLine size={16} />
                                             </button>
                                        </td>
                                   </tr>
                              ))}
                         </tbody>
                    </table>
               </div>
               <div className="card-footer bg-light py-2 small">
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
          </div>
     );
}
