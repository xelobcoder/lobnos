"use client"
import { useApplicationSettings } from "../../../../components/Auth/useApplicationContext";
import LaboratoryAscensionStages from "../../../../components/operations/Laboratory/LaboratoryAscensionStages";
import { LaboratoryStagesProvider } from "../../../../components/operations/Laboratory/LaboratoryStagesContext";
import ValidatedResultTable from "../../../../components/operations/Laboratory/validatedResultTable";

export default function ValidatedResult() {
     const { applicationsettings } = useApplicationSettings();
     const { user } = applicationsettings
     return (
          <div className="p-2 container-fluid">
               <LaboratoryStagesProvider>
                    <LaboratoryAscensionStages employeeid={user?.employeeid} ascension_stage={'VALIDATED'} />
                    <ValidatedResultTable  employeeid={user?.employeeid}/>
               </LaboratoryStagesProvider>
          </div>
     )
}
