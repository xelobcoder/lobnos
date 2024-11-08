import { useApplicationSettings } from "../../../components/Auth/useApplicationContext";
import LaboratoryLayout from "../../../components/Layout/LaboratoryLayout";
import LaboratoryAscensionStages from "../../../components/operations/Laboratory/LaboratoryAscensionStages";
import { LaboratoryStagesProvider } from "../../../components/operations/Laboratory/LaboratoryStagesContext";
import ValidatedResultTable from "../../../components/operations/Laboratory/validatedResultTable";

export default function ValidatedResult() {
     const { applicationsettings } = useApplicationSettings();
     const { user } = applicationsettings
     return (
          <LaboratoryLayout>
               <LaboratoryStagesProvider>
                    <LaboratoryAscensionStages employeeid={user?.employeeid} ascension_stage={'VALIDATED'} />
                    <ValidatedResultTable/>
               </LaboratoryStagesProvider>
          </LaboratoryLayout>
     )
}
