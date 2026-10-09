"use client";

import FacilityManagement from "../FacilityManagement";
import FacilityPicker from "../FacilityPicker";

export default function FacilityPaymentsPage() {
     return (
          <FacilityPicker title="Payments and subscriptions" description="Select a facility to manage access, subscription schedules and payments.">
               {(facility, onStatusChange) => <FacilityManagement facility={facility} onStatusChange={onStatusChange} />}
          </FacilityPicker>
     );
}