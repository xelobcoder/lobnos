import UltrasoundLayout from '../../../../components/Layout/ImagingLayout';
import { UltrasoundStagesProvider } from '../../../../components/operations/Ultrasound/UltrasoundContext';
import UltrasoundAscensionFiltering from '../../../../components/operations/Ultrasound/UtrasoundFiltering';
import AscentionUltrasoundUnCompletedTable from '../../../../components/operations/Ultrasound/UncompletedUltrasoundWaitingListTable';
import { useApplicationSettings } from '../../../../components/Auth/useApplicationContext';


export default function UltrasonograhyCompletedList() {
  const { applicationsettings } = useApplicationSettings();
  const { employeeid, username, role } = applicationsettings.user;

  if (!employeeid) return null

  return (
    <UltrasoundLayout>
      <UltrasoundStagesProvider>
        <UltrasoundAscensionFiltering  employeeid={employeeid} ascension_stage={'ULTRASOUND_COMPLETED'} />
        <AscentionUltrasoundUnCompletedTable />
      
      </UltrasoundStagesProvider>
    </UltrasoundLayout>
  )
}