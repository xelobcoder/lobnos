"use client";

import { RiHospitalLine } from "@remixicon/react";
import FacilityPicker from "../FacilityPicker";
import MedicalDevicesInterfacing from "../../../../components/settings/MedicalDevicesInterfacing";

export default function FacilityMedicalDevicesPage() {
     return <FacilityPicker title="Medical Device Interfacing" description="Select a facility to manage its medical analyzer devices and connection settings.">
          {(facility) => <section aria-labelledby="facility-devices-heading" aria-describedby="facility-devices-description" className="text-start">
               <header className="border-bottom pb-3 mb-3">
                    <div className="row g-3 align-items-center">
                         <div className="col-12 col-lg-6">
                              <div className="d-flex align-items-center gap-2 mb-1">
                                   <RiHospitalLine size={22} className="text-primary flex-shrink-0" aria-hidden="true" />
                                   <h3 id="facility-devices-heading" className="h5 fw-semibold mb-0 text-break">{facility.name}</h3>
                              </div>
                              <p id="facility-devices-description" className="small text-muted mb-0">Device configurations are saved to this facility only.</p>
                         </div>
                         <div className="col-12 col-lg-6">
                              <p className="small mb-1 fw-semibold">Before using an analyzer</p>
                              <p className="small text-muted mb-0">The facility needs its device interfacing module enabled and a valid license. Adding a device does not enable the module or activate a license.</p>
                         </div>
                    </div>
               </header>
               <MedicalDevicesInterfacing key={facility.tenantId} platform endpoint={`platform/facilities/${facility.tenantId}/medical-devices`} />
          </section>}
     </FacilityPicker>;
}
