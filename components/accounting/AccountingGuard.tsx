"use client";
import React from "react";
import { useApplication } from "../Auth/useApplicationContext";
import { roleAllowed } from "../Auth/roles";

const ACCOUNTING_ROLES = ["admin", "super_admin", "super-admin", "accountant"];
const OWNER_ROLES = ["admin", "super_admin", "super-admin"];

/**
 * Client-side gate for the accounting module. The server enforces the same rule, so this only
 * spares people a screen of failed requests.
 *
 * `ownerOnly` guards the screens that hand out authority — an accountant who could delegate to
 * themselves would defeat every other permission check.
 */
export default function AccountingGuard({
     children,
     ownerOnly = false,
}: {
     children: React.ReactNode;
     ownerOnly?: boolean;
}) {
     const user = useApplication()?.user;
     const role = String(user?.role || "").toLowerCase().trim();

     if (!user) {
          return (
               <div className="container-fluid py-5 text-center text-muted">
                    Checking your access...
               </div>
          );
     }

     const allowed = roleAllowed(role, ownerOnly ? OWNER_ROLES : ACCOUNTING_ROLES);

     if (!allowed) {
          return (
               <div className="container-fluid py-5">
                    <div className="card border-0 shadow-sm mx-auto" style={{ maxWidth: 520 }}>
                         <div className="card-body text-center py-5">
                              <h5 className="mb-2">{ownerOnly ? "Administrators only" : "Accounting is restricted"}</h5>
                              <p className="text-muted mb-0">
                                   {ownerOnly
                                        ? "Only an administrator can delegate or revoke authority."
                                        : "Only administrators and accountants can open this section. Ask an administrator if you need access."}
                              </p>
                         </div>
                    </div>
               </div>
          );
     }

     return <>{children}</>;
}

export function useIsAccountingOwner(): boolean {
     const user = useApplication()?.user;
     return roleAllowed(user?.role, OWNER_ROLES);
}
