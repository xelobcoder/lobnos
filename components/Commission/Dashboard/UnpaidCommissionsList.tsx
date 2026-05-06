"use client";

import React, { useState } from "react";
import { CommissionTracking } from "../../../lib/commission/commissionApi";
import { formatCurrency, getStatusBadgeClass } from "../../../lib/commission/commissionHelpers";
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
               <div className="card border-0 shadow-sm">
                    <div className="card-body">
                         <div className="placeholder-glow">
                              <div className="placeholder" style={{ height: "300px" }}></div>
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
                              No unpaid commissions at this time. Great job staying on top!
                         </p>
                    </div>
               </div>
          );
     }

     const totalUnpaid = commissions.reduce(
          (sum, c) => sum + c.final_commission,
          0
     );

     return (
          <div className="card border-0 shadow-sm">
               <div className="card-header bg-light py-3 d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">Unpaid Commissions</h5>
                    <span className="badge bg-danger">{commissions.length}</span>
               </div>
               <div className="table-responsive">
                    <table className="table table-hover table-striped mb-0">
                         <thead className="table-light">
                              <tr>
                                   <th>Service</th>
                                   <th>Amount</th>
                                   <th>Commission</th>
                                   <th>Status</th>
                                   <th style={{ width: "80px" }}>Actions</th>
                              </tr>
                         </thead>
                         <tbody>
                              {commissions.map((commission) => (
                                   <tr key={commission.id}>
                                        <td className="fw-medium">Service #{commission.service_id}</td>
                                        <td>{formatCurrency(commission.service_amount)}</td>
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
                                                  onClick={() => onViewDetails && onViewDetails(commission)}
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
                    <div className="d-flex justify-content-between">
                         <span>Total Unpaid:</span>
                         <span className="fw-bold text-success">
                              {formatCurrency(totalUnpaid)}
                         </span>
                    </div>
               </div>
          </div>
     );
}
