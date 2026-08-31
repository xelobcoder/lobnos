"use client";

import { RiBarChartBoxLine, RiMoneyDollarCircleLine } from "@remixicon/react";
import { useApplicationSettings } from "../../../components/Auth/useApplicationContext";

export default function DoctorCommissionPage() {
     const { applicationsettings } = useApplicationSettings();
     const currentUser = applicationsettings?.user?.user || applicationsettings?.user;

     return (
          <div className="container-fluid px-4 py-3">
               <div className="mb-4">
                    <h2 className="h5 mb-1 d-flex align-items-center gap-2">
                         <RiMoneyDollarCircleLine size={22} /> Commission
                    </h2>
                    <div className="text-muted small">{currentUser?.username || "Clinician"}</div>
               </div>

               <div className="card border-0 shadow-sm">
                    <div className="card-body p-4">
                         <div className="d-flex gap-3 align-items-start">
                              <RiBarChartBoxLine size={28} className="text-primary flex-shrink-0" />
                              <div>
                                   <h3 className="h6 fw-semibold mb-2">Commission Summary</h3>
                                   <p className="text-muted mb-0">
                                        Commission reporting will use your clinician account only. Tests Sent is available now for assigned requests and result review.
                                   </p>
                              </div>
                         </div>
                    </div>
               </div>
          </div>
     );
}
