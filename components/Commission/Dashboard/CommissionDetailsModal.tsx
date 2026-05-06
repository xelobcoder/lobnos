"use client";

import React from "react";
import { CommissionTracking } from "../../../lib/commission/commissionApi";
import { formatCurrency, getStatusBadgeClass } from "../../../lib/commission/commissionHelpers";
import { RiCloseLine } from "react-icons/ri";

interface CommissionDetailsModalProps {
     commission: CommissionTracking | null;
     isOpen: boolean;
     onClose: () => void;
}

export default function CommissionDetailsModal({
     commission,
     isOpen,
     onClose,
}: CommissionDetailsModalProps) {
     if (!isOpen || !commission) return null;

     return (
          <div
               className="modal d-block"
               tabIndex={-1}
               style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          >
               <div className="modal-dialog modal-lg modal-dialog-centered">
                    <div className="modal-content">
                         <div className="modal-header border-0 d-flex justify-content-between align-items-center">
                              <h5 className="modal-title fw-bold">Commission Details</h5>
                              <button
                                   type="button"
                                   className="btn-close"
                                   onClick={onClose}
                                   aria-label="Close"
                              ></button>
                         </div>

                         <div className="modal-body">
                              {/* Header Info */}
                              <div className="mb-4 p-3 rounded bg-light">
                                   <div className="row g-3">
                                        <div className="col-md-6">
                                             <small className="text-muted d-block mb-1">Service ID</small>
                                             <h6 className="fw-bold mb-0">#{commission.service_id}</h6>
                                        </div>
                                        <div className="col-md-6">
                                             <small className="text-muted d-block mb-1">Status</small>
                                             <span className={`badge ${getStatusBadgeClass(commission.status)}`}>
                                                  {commission.status.charAt(0).toUpperCase() +
                                                       commission.status.slice(1)}
                                             </span>
                                        </div>
                                        <div className="col-md-6">
                                             <small className="text-muted d-block mb-1">
                                                  Calculated At
                                             </small>
                                             <h6 className="fw-bold mb-0">
                                                  {new Date(commission.calculated_at).toLocaleString()}
                                             </h6>
                                        </div>
                                        <div className="col-md-6">
                                             <small className="text-muted d-block mb-1">Currency</small>
                                             <h6 className="fw-bold mb-0">{commission.currency}</h6>
                                        </div>
                                   </div>
                              </div>

                              {/* Service & Commission Amounts */}
                              <h6 className="fw-bold mb-3">Service & Commission</h6>
                              <div className="row g-3 mb-4">
                                   <div className="col-md-6">
                                        <div className="p-3 rounded border">
                                             <small className="text-muted d-block mb-1">
                                                  Service Amount
                                             </small>
                                             <h5 className="fw-bold mb-0">
                                                  {formatCurrency(commission.service_amount)}
                                             </h5>
                                        </div>
                                   </div>
                                   <div className="col-md-6">
                                        <div className="p-3 rounded border bg-success-light">
                                             <small className="text-muted d-block mb-1">
                                                  Final Commission
                                             </small>
                                             <h5 className="fw-bold mb-0 text-success">
                                                  {formatCurrency(commission.final_commission)}
                                             </h5>
                                        </div>
                                   </div>
                              </div>

                              {/* Commission Calculation Breakdown */}
                              <h6 className="fw-bold mb-3">Calculation Breakdown</h6>
                              <div className="border rounded p-3 mb-4 bg-light">
                                   <div className="small">
                                        <div className="d-flex justify-content-between mb-2">
                                             <span>Commission Type:</span>
                                             <span className="fw-bold">{commission.commission_type}</span>
                                        </div>

                                        {commission.percentage_rate_applied !== null && commission.percentage_rate_applied !== undefined && (
                                             <div className="d-flex justify-content-between mb-2">
                                                  <span>Rate Applied:</span>
                                                  <span className="fw-bold">
                                                       {commission.percentage_rate_applied}%
                                                  </span>
                                             </div>
                                        )}

                                        {commission.fixed_amount_applied !== null && commission.fixed_amount_applied !== undefined && (
                                             <div className="d-flex justify-content-between mb-2">
                                                  <span>Fixed Component:</span>
                                                  <span className="fw-bold">
                                                       {formatCurrency(commission.fixed_amount_applied)}
                                                  </span>
                                             </div>
                                        )}

                                        <hr className="my-2" />

                                        <div className="d-flex justify-content-between mb-2">
                                             <span>Raw Commission:</span>
                                             <span className="fw-bold">
                                                  {formatCurrency(commission.commission_due)}
                                             </span>
                                        </div>
                                   </div>
                              </div>

                              {/* Cap Adjustments */}
                              <h6 className="fw-bold mb-3">Cap Adjustments</h6>
                              <div className="border rounded p-3 bg-light">
                                   <div className="small">
                                        <div className="d-flex justify-content-between mb-2">
                                             <span>Min Cap Adjustment:</span>
                                             <span
                                                  className={`fw-bold ${commission.min_cap_adjustment > 0
                                                            ? "text-warning"
                                                            : "text-muted"
                                                       }`}
                                             >
                                                  {commission.min_cap_adjustment > 0
                                                       ? `+${formatCurrency(commission.min_cap_adjustment)}`
                                                       : "-"}
                                             </span>
                                        </div>

                                        <div className="d-flex justify-content-between mb-2">
                                             <span>Max Cap Adjustment:</span>
                                             <span
                                                  className={`fw-bold ${commission.max_cap_adjustment > 0
                                                            ? "text-danger"
                                                            : "text-muted"
                                                       }`}
                                             >
                                                  {commission.max_cap_adjustment > 0
                                                       ? `-${formatCurrency(commission.max_cap_adjustment)}`
                                                       : "-"}
                                             </span>
                                        </div>

                                        <div className="d-flex justify-content-between">
                                             <span>Period Cap Adjustment:</span>
                                             <span
                                                  className={`fw-bold ${commission.period_cap_adjustment > 0
                                                            ? "text-danger"
                                                            : "text-muted"
                                                       }`}
                                             >
                                                  {commission.period_cap_adjustment > 0
                                                       ? `-${formatCurrency(commission.period_cap_adjustment)}`
                                                       : "-"}
                                             </span>
                                        </div>
                                   </div>
                              </div>

                              {/* Recipient & Config Info */}
                              {(commission.recipient_type || commission.recipient_id || commission.config_id) && (
                                   <div className="mt-4">
                                        <h6 className="fw-bold mb-3">Configuration Info</h6>
                                        <div className="row g-3">
                                             {commission.recipient_type && (
                                                  <div className="col-md-6">
                                                       <small className="text-muted d-block mb-1">
                                                            Recipient Type
                                                       </small>
                                                       <h6 className="fw-bold mb-0">
                                                            {commission.recipient_type}
                                                       </h6>
                                                  </div>
                                             )}
                                             {commission.recipient_id && (
                                                  <div className="col-md-6">
                                                       <small className="text-muted d-block mb-1">
                                                            Recipient ID
                                                       </small>
                                                       <h6 className="fw-bold mb-0">
                                                            #{commission.recipient_id}
                                                       </h6>
                                                  </div>
                                             )}
                                             {commission.config_id && (
                                                  <div className="col-md-6">
                                                       <small className="text-muted d-block mb-1">
                                                            Config ID
                                                       </small>
                                                       <h6 className="fw-bold mb-0">#{commission.config_id}</h6>
                                                  </div>
                                             )}
                                        </div>
                                   </div>
                              )}
                         </div>

                         <div className="modal-footer border-0">
                              <button
                                   type="button"
                                   className="btn btn-secondary"
                                   onClick={onClose}
                              >
                                   Close
                              </button>
                         </div>
                    </div>
               </div>
          </div>
     );
}
