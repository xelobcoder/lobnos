"use client";

import FacilityAudit from "../FacilityAudit";
import FacilityPicker from "../FacilityPicker";

export default function FacilityAuditPage() {
     return (
          <FacilityPicker title="Audit logs" description="Review activation, subscription and payment changes for a facility.">
               {(facility) => <FacilityAudit tenantId={facility.tenantId} />}
          </FacilityPicker>
     );
}