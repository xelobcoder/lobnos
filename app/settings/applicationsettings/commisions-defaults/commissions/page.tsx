"use client";

import React from "react";
import Link from "next/link";
import { RiSettings4Line, RiTeamLine, RiCheckLine } from "@remixicon/react";


export default function CommissionsOverviewPage() {
     return (
          <div className="container-fluid px-4 py-3">
               <div className="mb-4">
                    <h1 className="h3 mb-1">Commission Management</h1>
                    <p className="text-muted">
                         Configure and manage commission calculations for your organization
                    </p>
               </div>

               <div className="row g-3 mb-4">
                    {/* Configurations Card */}
                    <div className="col-md-6 col-lg-4">
                         <Link href="/settings/applicationsettings/commisions-defaults/commissions/configs">
                              <div className="card h-100 border-0 shadow-sm hover-shadow cursor-pointer">
                                   <div className="card-body">
                                        <div className="d-flex align-items-center mb-3">
                                             <div
                                                  className="rounded-circle p-2"
                                                  style={{ backgroundColor: "rgba(79, 172, 254, 0.1)" }}
                                             >
                                                  <RiSettings4Line
                                                       size={24}
                                                       style={{ color: "rgb(79, 172, 254)" }}
                                                  />
                                             </div>
                                        </div>
                                        <h5 className="card-title fw-bold">Configurations</h5>
                                        <p className="card-text text-muted small mb-0">
                                             Create commission rules with different types (percentage, fixed,
                                             tiered, hybrid) and caps
                                        </p>
                                   </div>
                              </div>
                         </Link>
                    </div>

                    {/* Assignments Card */}
                    <div className="col-md-6 col-lg-4">
                         <Link href="/settings/applicationsettings/commisions-defaults/commissions/assignments">
                              <div className="card h-100 border-0 shadow-sm hover-shadow cursor-pointer">
                                   <div className="card-body">
                                        <div className="d-flex align-items-center mb-3">
                                             <div
                                                  className="rounded-circle p-2"
                                                  style={{ backgroundColor: "rgba(34, 197, 94, 0.1)" }}
                                             >
                                                  <RiTeamLine size={24} style={{ color: "rgb(34, 197, 94)" }} />
                                             </div>
                                        </div>
                                        <h5 className="card-title fw-bold">Assignments</h5>
                                        <p className="card-text text-muted small mb-0">
                                             Assign configurations to clinicians, organizations, or system-wide
                                             with priority-based resolution
                                        </p>
                                   </div>
                              </div>
                         </Link>
                    </div>

                    {/* Defaults Card */}
                    <div className="col-md-6 col-lg-4">
                         <Link href="/settings/applicationsettings/commisions-defaults">
                              <div className="card h-100 border-0 shadow-sm hover-shadow cursor-pointer">
                                   <div className="card-body">
                                        <div className="d-flex align-items-center mb-3">
                                             <div
                                                  className="rounded-circle p-2"
                                                  style={{ backgroundColor: "rgba(239, 68, 68, 0.1)" }}
                                             >
                                                  <RiCheckLine size={24} style={{ color: "rgb(239, 68, 68)" }} />
                                             </div>
                                        </div>
                                        <h5 className="card-title fw-bold">Defaults</h5>
                                        <p className="card-text text-muted small mb-0">
                                             Set fallback commission defaults for when no specific assignment
                                             matches
                                        </p>
                                   </div>
                              </div>
                         </Link>
                    </div>
               </div>

               {/* Info Section */}
               <div className="card border-0 shadow-sm">
                    <div className="card-header bg-light py-3">
                         <h5 className="mb-0">Quick Start Guide</h5>
                    </div>
                    <div className="card-body">
                         <div className="row">
                              <div className="col-lg-6 mb-3 mb-lg-0">
                                   <h6 className="fw-bold mb-2">Step 1: Create a Configuration</h6>
                                   <p className="text-muted small mb-0">
                                        Go to <strong>Configurations</strong> and create commission rules. You
                                        can use percentage, fixed amounts, tiered rates, or hybrid models. Set
                                        minimum/maximum caps and period limits.
                                   </p>
                              </div>
                              <div className="col-lg-6">
                                   <h6 className="fw-bold mb-2">Step 2: Assign to Recipients</h6>
                                   <p className="text-muted small mb-0">
                                        Go to <strong>Assignments</strong> and assign your configurations to
                                        clinicians, organizations, or use system-wide. Higher priority
                                        assignments override lower ones automatically.
                                   </p>
                              </div>
                         </div>
                         <hr className="my-3" />
                         <div className="row">
                              <div className="col-lg-6 mb-3 mb-lg-0">
                                   <h6 className="fw-bold mb-2">Step 3: Set Defaults (Optional)</h6>
                                   <p className="text-muted small mb-0">
                                        Go to <strong>Defaults</strong> to set fallback configurations that
                                        apply when no explicit assignment matches a service.
                                   </p>
                              </div>
                              <div className="col-lg-6">
                                   <h6 className="fw-bold mb-2">That's It!</h6>
                                   <p className="text-muted small mb-0">
                                        Commissions are automatically calculated whenever services are billed.
                                        View them in clinician dashboards and finance reports.
                                   </p>
                              </div>
                         </div>
                    </div>
               </div>
          </div>
     );
}
