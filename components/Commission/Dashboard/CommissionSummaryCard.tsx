"use client";

import React from "react";
import { formatCurrency } from "../../../lib/commission/commissionHelpers";
import { RiArrowUpLine, RiArrowDownLine, RiCheckLine } from "@remixicon/react";

export interface CommissionSummaryData {
     totalEarned: number;
     totalPaid: number;
     unpaidAmount: number;
     pendingApproval: number;
     currentPeriodUsed: number;
     currentPeriodCap: number;
     currentPeriodRemaining: number;
}

interface CommissionSummaryCardProps {
     data: CommissionSummaryData;
     loading?: boolean;
}

export default function CommissionSummaryCard({
     data,
     loading = false,
}: CommissionSummaryCardProps) {
     if (loading) {
          return (
               <div className="row g-3 mb-4">
                    {[1, 2, 3, 4].map((i) => (
                         <div key={i} className="col-md-6 col-lg-3">
                              <div className="card h-100 placeholder-glow">
                                   <div className="card-body">
                                        <div className="placeholder" style={{ height: "60px" }}></div>
                                        <div className="placeholder" style={{ height: "30px" }}></div>
                                   </div>
                              </div>
                         </div>
                    ))}
               </div>
          );
     }

     const paidPercentage =
          data.totalEarned > 0
               ? Math.round((data.totalPaid / data.totalEarned) * 100)
               : 0;

     const periodUsagePercentage =
          data.currentPeriodCap > 0
               ? Math.round(
                    (data.currentPeriodUsed / data.currentPeriodCap) * 100
               )
               : 0;

     return (
          <div className="row g-3 mb-4">
               {/* Total Earned Card */}
               <div className="col-md-6 col-lg-3">
                    <div className="card h-100 border-0 shadow-sm">
                         <div className="card-body">
                              <div className="d-flex justify-content-between align-items-start mb-2">
                                   <h6 className="text-muted small fw-semibold mb-0">Total Earned</h6>
                                   <div
                                        className="rounded-circle p-2"
                                        style={{ backgroundColor: "rgba(79, 172, 254, 0.1)" }}
                                   >
                                        <RiArrowUpLine
                                             size={16}
                                             style={{ color: "rgb(79, 172, 254)" }}
                                        />
                                   </div>
                              </div>
                              <h3 className="fw-bold mb-2">{formatCurrency(data.totalEarned)}</h3>
                              <small className="text-muted">
                                   {data.totalEarned > 0
                                        ? `${paidPercentage}% paid (${formatCurrency(data.totalPaid)})`
                                        : "No commissions earned yet"}
                              </small>
                         </div>
                    </div>
               </div>

               {/* Unpaid Commission Card */}
               <div className="col-md-6 col-lg-3">
                    <div className="card h-100 border-0 shadow-sm">
                         <div className="card-body">
                              <div className="d-flex justify-content-between align-items-start mb-2">
                                   <h6 className="text-muted small fw-semibold mb-0">Unpaid</h6>
                                   <div
                                        className="rounded-circle p-2"
                                        style={{ backgroundColor: "rgba(239, 68, 68, 0.1)" }}
                                   >
                                        <RiArrowDownLine
                                             size={16}
                                             style={{ color: "rgb(239, 68, 68)" }}
                                        />
                                   </div>
                              </div>
                              <h3 className="fw-bold mb-2 text-danger">
                                   {formatCurrency(data.unpaidAmount)}
                              </h3>
                              <small className="text-muted">Ready for payment</small>
                         </div>
                    </div>
               </div>

               {/* Pending Approval Card */}
               <div className="col-md-6 col-lg-3">
                    <div className="card h-100 border-0 shadow-sm">
                         <div className="card-body">
                              <div className="d-flex justify-content-between align-items-start mb-2">
                                   <h6 className="text-muted small fw-semibold mb-0">
                                        Pending Approval
                                   </h6>
                                   <div
                                        className="rounded-circle p-2"
                                        style={{ backgroundColor: "rgba(251, 191, 36, 0.1)" }}
                                   >
                                        <RiCheckLine
                                             size={16}
                                             style={{ color: "rgb(251, 191, 36)" }}
                                        />
                                   </div>
                              </div>
                              <h3 className="fw-bold mb-2 text-warning">
                                   {formatCurrency(data.pendingApproval)}
                              </h3>
                              <small className="text-muted">Awaiting approval</small>
                         </div>
                    </div>
               </div>

               {/* Period Cap Usage Card */}
               <div className="col-md-6 col-lg-3">
                    <div className="card h-100 border-0 shadow-sm">
                         <div className="card-body">
                              <div className="d-flex justify-content-between align-items-start mb-2">
                                   <h6 className="text-muted small fw-semibold mb-0">
                                        Period Cap Usage
                                   </h6>
                                   <div
                                        className="rounded-circle p-2"
                                        style={{ backgroundColor: "rgba(34, 197, 94, 0.1)" }}
                                   >
                                        <span style={{ color: "rgb(34, 197, 94)", fontSize: "16px" }}>
                                             %
                                        </span>
                                   </div>
                              </div>
                              <div className="d-flex align-items-baseline gap-2 mb-2">
                                   <h3 className="fw-bold mb-0">{periodUsagePercentage}%</h3>
                                   <small className="text-muted">
                                        {formatCurrency(data.currentPeriodUsed)} / {formatCurrency(data.currentPeriodCap)}
                                   </small>
                              </div>
                              <div className="progress" style={{ height: "6px" }}>
                                   <div
                                        className={`progress-bar ${periodUsagePercentage > 90
                                                  ? "bg-danger"
                                                  : periodUsagePercentage > 70
                                                       ? "bg-warning"
                                                       : "bg-success"
                                             }`}
                                        role="progressbar"
                                        style={{ width: `${Math.min(periodUsagePercentage, 100)}%` }}
                                   ></div>
                              </div>
                              <small className="text-muted d-block mt-1">
                                   {formatCurrency(data.currentPeriodRemaining)} remaining
                              </small>
                         </div>
                    </div>
               </div>
          </div>
     );
}
