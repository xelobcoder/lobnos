"use client";

import { useApplication } from "../../../components/Auth/useApplicationContext";
import { roleAllowed } from "../../../components/Auth/roles";
import FinancialDaySettingsWorkspace from "../../../components/settings/FinancialDaySettingsWorkspace";

export default function FinancialDaySettingsPage() {
     const application = useApplication();
     const role = application?.user?.role;
     if (!role) return <div role="status">Verifying settings access...</div>;
     if (!roleAllowed(role, ["admin", "owner"]))
          return (
               <div className="alert alert-warning" role="alert">
                    Only an administrator or owner can manage financial-day settings.
               </div>
          );
     const contextKey = `${application?.branchid ?? application?.user?.branch ?? ""}:${application?.user?.employeeid ?? ""}`;
     return <FinancialDaySettingsWorkspace key={contextKey} />;
}
