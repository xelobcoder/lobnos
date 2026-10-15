"use client";

import FacilityPicker from "../FacilityPicker";
import FacilitySmsProvider from "../FacilitySmsProvider";

export default function FacilitySmsPage() {
     return (
          <FacilityPicker title="SMS configuration" description="Set up the Arkesel SMS account each facility uses to send messages.">
               {(facility) => <FacilitySmsProvider facility={facility} />}
          </FacilityPicker>
     );
}
