"use client";
import Link from "next/link";
import { RiTeamLine, RiStethoscopeLine, RiArrowRightLine } from "@remixicon/react";
export default function Page() {
     return (
          <div className="container-fluid px-4 py-4">
               <div className="row mb-4">
                    <div className="col-12 col-md-8 mx-auto">
                         <div className="border rounded p-4 bg-white shadow-sm mb-4 text-center">
                              <h1 className="fs-4 fw-bold mb-2 d-flex align-items-center justify-content-center gap-2">
                                   <RiTeamLine size={28} style={{ color: "#2563eb" }} />
                                   Commissions Center
                              </h1>
                              <p className="text-muted mb-0">
                                   Access and manage all commission records for organizations and clinicians in one place.
                              </p>
                         </div>
                    </div>
               </div>
               <div className="row g-4 justify-content-center">
                    <div className="col-12 col-md-6 col-lg-5">
                         <div className="border rounded h-100 bg-body p-4 d-flex flex-column align-items-start justify-content-between shadow-sm">
                              <div className="d-flex align-items-center mb-3">
                                   <RiTeamLine size={32} className="me-2" style={{ color: "#2563eb" }} />
                                   <h2 className="fs-5 fw-semibold mb-0">Organization Commissions</h2>
                              </div>
                              <p className="text-muted mb-3">
                                   View, track, and manage all commission records and payments for organizations. Includes untracked services and paid commission history.
                              </p>
                              <Link href="/commissions/organization" className="btn btn-primary d-flex align-items-center mt-auto">
                                   Go to Organization Commissions <RiArrowRightLine size={18} className="ms-2" />
                              </Link>
                         </div>
                    </div>
                    <div className="col-12 col-md-6 col-lg-5">
                         <div className="border rounded h-100 bg-body p-4 d-flex flex-column align-items-start justify-content-between shadow-sm">
                              <div className="d-flex align-items-center mb-3">
                                   <RiStethoscopeLine size={32} className="me-2" style={{ color: "#ea580c" }} />
                                   <h2 className="fs-5 fw-semibold mb-0">Clinician Commissions</h2>
                              </div>
                              <p className="text-muted mb-3">
                                   View, track, and manage all commission records and payments for clinicians. Includes untracked services and paid commission history.
                              </p>
                              <Link href="/commissions/clinicians" className="btn btn-outline-primary d-flex align-items-center mt-auto">
                                   Go to Clinician Commissions <RiArrowRightLine size={18} className="ms-2" />
                              </Link>
                         </div>
                    </div>
               </div>
          </div>
     );
}
