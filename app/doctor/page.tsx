"use client";

import Link from "next/link";
import { RiFileListLine, RiMoneyDollarCircleLine, RiShieldUserLine, RiStethoscopeLine } from "@remixicon/react";
import { useApplicationSettings } from "../../components/Auth/useApplicationContext";

export default function DoctorPortalPage() {
     const { applicationsettings } = useApplicationSettings();
     const currentUser = applicationsettings?.user?.user || applicationsettings?.user;
     const cards = [
          { title: "Tests Sent", href: "/doctor/test-sent", icon: RiFileListLine, description: "View requests assigned to you and read entered results." },
          { title: "Permissions", href: "/doctor/permissions", icon: RiShieldUserLine, description: "Review your portal access and allowed actions." },
          { title: "Commission", href: "/doctor/commission", icon: RiMoneyDollarCircleLine, description: "View commission and financial summaries." },
     ];

     return (
          <div className="container-fluid px-4 py-3">
               <div className="mb-4">
                    <h2 className="h5 mb-1 d-flex align-items-center gap-2">
                         <RiStethoscopeLine size={22} /> Doctor Portal Overview
                    </h2>
                    <div className="text-muted small">{currentUser?.username || "Clinician"}</div>
               </div>

               <div className="row g-3">
                    {cards.map((card) => {
                         const Icon = card.icon;
                         return (
                              <div className="col-md-6 col-xl-4" key={card.href}>
                                   <Link href={card.href} className="text-decoration-none text-reset">
                                        <div className="card border-0 shadow-sm h-100">
                                             <div className="card-body">
                                                  <Icon size={28} className="text-primary mb-3" />
                                                  <h3 className="h6 fw-semibold">{card.title}</h3>
                                                  <p className="text-muted small mb-0">{card.description}</p>
                                             </div>
                                        </div>
                                   </Link>
                              </div>
                         );
                    })}
               </div>
          </div>
     );
}
