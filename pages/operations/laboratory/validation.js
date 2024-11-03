import LaboratoryLayout from "../../../components/Layout/LaboratoryLayout";
import LaboratoryAscensionStages from "../../../components/operations/Laboratory/LaboratoryAscensionStages";
import { LaboratoryStagesProvider } from "../../../components/operations/Laboratory/LaboratoryStagesContext";
import ValidationAscensionTable from "../../../components/operations/Laboratory/AsensionValidationTable";
import { useApplicationSettings } from "../../../components/Auth/useApplicationContext";


export default function AscensionValidationStage() {
  const { applicationsettings } = useApplicationSettings();
  const { user } = applicationsettings

  return (
    <LaboratoryLayout>
      <LaboratoryStagesProvider>
        <LaboratoryAscensionStages employeeid={user?.employeeid} ascension_stage={'VALIDATION'} />
        <ValidationAscensionTable />
      </LaboratoryStagesProvider>
    </LaboratoryLayout>
  )
}