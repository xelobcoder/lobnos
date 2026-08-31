"use client"

import { useApplicationSettings } from "../../../components/Auth/useApplicationContext";
import LaboratoryAscensionStages from "../../../components/operations/Laboratory/LaboratoryAscensionStages";
import { LaboratoryStagesProvider } from "../../../components/operations/Laboratory/LaboratoryStagesContext";
import ValidatedResultTable from "../../../components/operations/Laboratory/validatedResultTable";

export default function ValidatedResult() {
     const { applicationsettings } = useApplicationSettings();
     const { user, branchid } = applicationsettings
     return (
          <div className="p-2 container-fluid">
               <LaboratoryStagesProvider>
                    <LaboratoryAscensionStages clinicianId={user?.clinicianid} employeeid={user?.employeeid} branchid={branchid} ascension_stage={'VALIDATED'} />
                    <ValidatedResultTable employeeid={user?.employeeid} />
               </LaboratoryStagesProvider>
          </div>
     )
}
