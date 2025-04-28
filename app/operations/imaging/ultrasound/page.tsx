"use client";
import { UltrasoundStagesProvider } from "../../../../components/operations/Ultrasound/UltrasoundContext";
import UltrasoundAscensionFiltering from "../../../../components/operations/Ultrasound/UtrasoundFiltering";
import AscentionUltrasoundUnCompletedTable from "../../../../components/operations/Ultrasound/UncompletedUltrasoundWaitingListTable";
import { useApplicationSettings } from "../../../../components/Auth/useApplicationContext";

export default function UltrasonograhyWaitingList() {
  const { applicationsettings } = useApplicationSettings();
  const { employeeid, username, role } = applicationsettings.user;

  if (!employeeid) return null;

  return (
    <UltrasoundStagesProvider>
      <UltrasoundAscensionFiltering
        ascension_stage={"ULTRASOUND_UNCOMPLETED"}
        employeeid={employeeid}
      />
      <AscentionUltrasoundUnCompletedTable />
    </UltrasoundStagesProvider>
  );
}
