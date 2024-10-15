import LaboratoryLayout from "../../../components/Layout/LaboratoryLayout";
import LaboratoryAscensionStages from "../../../components/operations/Laboratory/LaboratoryAscensionStages";
import { LaboratoryStagesProvider } from "../../../components/operations/Laboratory/LaboratoryStagesContext";
import ValidationAscensionTable from "../../../components/operations/Laboratory/AsensionValidationTable";

export default function AscensionValidationStage() {
  return (
    <LaboratoryLayout>
      <LaboratoryStagesProvider>
        <LaboratoryAscensionStages ascension_stage={'VALIDATION'} />
        <ValidationAscensionTable />
      </LaboratoryStagesProvider>
    </LaboratoryLayout>
  )
}