"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
     { href: "/settings/facilities", label: "Provisioning" },
     { href: "/settings/facilities/applications", label: "Website applications" },
     { href: "/settings/facilities/payments", label: "Payments & subscriptions" },
     { href: "/settings/facilities/audit", label: "Audit logs" },
];

export default function FacilityNav() {
     const pathname = (usePathname() || "").replace(/\/$/, "");
     return (
          <nav aria-label="Client platform sections" className="mb-3">
               <ul className="nav nav-tabs">
                    {TABS.map((tab) => <li className="nav-item" key={tab.href}>
                         <Link href={tab.href} className={`nav-link${pathname === tab.href ? " active" : ""}`} aria-current={pathname === tab.href ? "page" : undefined}>{tab.label}</Link>
                    </li>)}
               </ul>
          </nav>
     );
}