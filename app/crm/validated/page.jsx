"use client"
import { useApplicationSettings } from "../../../components/Auth/useApplicationContext";
import LaboratoryAscensionStages from "../../../components/operations/Laboratory/LaboratoryAscensionStages";
import { LaboratoryStagesProvider } from "../../../components/operations/Laboratory/LaboratoryStagesContext";
import ValidatedResultTable from "../../../components/operations/Laboratory/validatedResultTable";

export default function CrmValidatedResults() {
  const { applicationsettings } = useApplicationSettings();
  const { user, branchid } = applicationsettings || {};

  return (
    <div className="p-2 container-fluid">
      <LaboratoryStagesProvider>
        <LaboratoryAscensionStages
          employeeid={user?.employeeid}
          branchid={branchid}
          ascension_stage={'VALIDATED'}
        />
        <ValidatedResultTable employeeid={user?.employeeid} mode="crm" />
      </LaboratoryStagesProvider>
    </div>
  );
}

