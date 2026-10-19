"use client";

import { useApplication } from "../../../../components/Auth/useApplicationContext";
import FacilityGatewayTransactions from "../FacilityGatewayTransactions";
import FacilityNav from "../FacilityNav";

const normalizeRole = (role: unknown) => String(role || "").toLowerCase().replace(/[\s_-]/g, "");

export default function GatewayTransactionsPage() {
     const application = useApplication();
     const isSuperAdmin = normalizeRole(application?.user?.role) === "superadmin";
     return (
          <div className="p-3">
               <h1 className="h4">Online payment transactions</h1>
               <FacilityNav />
               {isSuperAdmin ? <FacilityGatewayTransactions /> : <p className="alert alert-warning" role="alert">Only platform super administrators can view online payments.</p>}
          </div>
     );
}
