"use client";

import FacilityManagement from "../FacilityManagement";
import FacilityPicker from "../FacilityPicker";
import FacilityOnlinePayment from "../FacilityOnlinePayment";

export default function FacilityPaymentsPage() {
     return (
          <FacilityPicker title="Payments and subscriptions" description="Select a facility to manage access, subscription schedules and payments.">
               {(facility, onStatusChange) => <>
                    <FacilityManagement facility={facility} onStatusChange={onStatusChange} />
                    <FacilityOnlinePayment key={facility.tenantId} facility={facility} />
               </>}
          </FacilityPicker>
     );
}