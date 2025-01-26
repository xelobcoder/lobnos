import LaboratoryAscensionStages from "../../../components/operations/Laboratory/LaboratoryAscensionStages";
import { LaboratoryStagesProvider } from "../../../components/operations/Laboratory/LaboratoryStagesContext";
import ValidationAscensionTable from "../../../components/operations/Laboratory/AsensionValidationTable";
import { useApplicationSettings } from "../../../components/Auth/useApplicationContext";
import PrimeLayout from '../../../components/Layout/PrimeLayout'

export default function AscensionValidationStage() {
  const { applicationsettings } = useApplicationSettings();
  const { user } = applicationsettings

  return (
    <PrimeLayout>
      <LaboratoryStagesProvider>
        <LaboratoryAscensionStages employeeid={user?.employeeid} ascension_stage={'VALIDATION'} />
        <ValidationAscensionTable />
      </LaboratoryStagesProvider>
    </PrimeLayout>
  )
}