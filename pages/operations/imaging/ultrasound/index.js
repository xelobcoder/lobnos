import UltrasoundLayout from '../../../../components/Layout/ImagingLayout';
import { UltrasoundStagesProvider } from '../../../../components/operations/Ultrasound/UltrasoundContext';
import UltrasoundAscensionFiltering from '../../../../components/operations/Ultrasound/UtrasoundFiltering';
import AscentionUltrasoundUnCompletedTable from '../../../../components/operations/Ultrasound/UncompletedUltrasoundWaitingListTable';
import { useApplicationSettings } from '../../../../components/Auth/useApplicationContext';
import PrimeLayout from '../../../../components/Layout/PrimeLayout';


export default function UltrasonograhyWaitingList() {
  const { applicationsettings } = useApplicationSettings();
  const { employeeid, username, role } = applicationsettings.user;

  if (!employeeid) return null

  return (
    <PrimeLayout>
      <UltrasoundStagesProvider>
        <UltrasoundAscensionFiltering ascension_stage={'ULTRASOUND_UNCOMPLETED'} employeeid={employeeid} />
        <AscentionUltrasoundUnCompletedTable />
      </UltrasoundStagesProvider>
    </PrimeLayout>
  )
}