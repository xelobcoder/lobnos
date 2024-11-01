import LaboratoryLayout from "../../../components/Layout/LaboratoryLayout";
import LaboratoryAscensionStages from "../../../components/operations/Laboratory/LaboratoryAscensionStages";
import { LaboratoryStagesProvider } from "../../../components/operations/Laboratory/LaboratoryStagesContext";
import ValidationAscensionTable from "../../../components/operations/Laboratory/AsensionValidationTable";
import { useContext } from "react";
import AuthContext from "../../../components/Auth/useAuthentification";

export default function AscensionValidationStage() {
  const { auth } = useContext(AuthContext);
  return (
    <LaboratoryLayout>
      <LaboratoryStagesProvider>
        <LaboratoryAscensionStages employeeid={auth?.employeeid} ascension_stage={'VALIDATION'} />
        <ValidationAscensionTable />
      </LaboratoryStagesProvider>
    </LaboratoryLayout>
  )
}