"use client";

import { useApplication } from "../../../../components/Auth/useApplicationContext";
import FacilityGatewayTransactions from "../FacilityGatewayTransactions";

const normalizeRole = (role: unknown) => String(role || "").toLowerCase().replace(/[\s_-]/g, "");

export default function GatewayTransactionsPage() {
     const application = useApplication();
     const isSuperAdmin = normalizeRole(application?.user?.role) === "superadmin";
     return (
          <div className="p-3">
               <header className="border rounded p-3 bg-white shadow-none">
                    <h1 className="h4 mb-0">Online payment transactions</h1>
               </header>
               {isSuperAdmin ? <FacilityGatewayTransactions /> : <p className="alert alert-warning" role="alert">Only platform super administrators can view online payments.</p>}
          </div>
     );
}
