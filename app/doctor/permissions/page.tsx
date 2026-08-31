"use client";

import { RiEyeLine, RiFileListLine, RiShieldUserLine } from "@remixicon/react";
import { useApplicationSettings } from "../../../components/Auth/useApplicationContext";

export default function DoctorPermissionsPage() {
     const { applicationsettings } = useApplicationSettings();
     const currentUser = applicationsettings?.user?.user || applicationsettings?.user;
     const permissions = [
          "View only test requests assigned to your clinician account.",
          "Open assigned requests and read entered result values.",
          "Add or update clinician comments on assigned requests.",
          "Result entry and validation remain locked to laboratory staff.",
     ];

     return (
          <div className="container-fluid px-4 py-3">
               <div className="mb-4">
                    <h2 className="h5 mb-1 d-flex align-items-center gap-2">
                         <RiShieldUserLine size={22} /> Permissions
                    </h2>
                    <div className="text-muted small">{currentUser?.username || "Clinician"}</div>
               </div>

               <div className="card border-0 shadow-sm">
                    <div className="card-header bg-white fw-semibold">Portal Access</div>
                    <div className="card-body">
                         <div className="row g-3">
                              {permissions.map((permission) => (
                                   <div className="col-md-6" key={permission}>
                                        <div className="border rounded-2 p-3 h-100 d-flex gap-3">
                                             <RiEyeLine size={22} className="text-primary flex-shrink-0" />
                                             <div>{permission}</div>
                                        </div>
                                   </div>
                              ))}
                         </div>
                         <div className="alert alert-info mt-4 mb-0 d-flex gap-2">
                              <RiFileListLine size={20} className="flex-shrink-0" />
                              <div>Use Tests Sent to review requests, result status, result values, and comments.</div>
                         </div>
                    </div>
               </div>
          </div>
     );
}
