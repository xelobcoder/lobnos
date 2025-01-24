import UltrasoundLayout from '../../../../components/Layout/ImagingLayout';
import { UltrasoundStagesProvider } from '../../../../components/operations/Ultrasound/UltrasoundContext';
import UltrasoundAscensionFiltering from '../../../../components/operations/Ultrasound/UtrasoundFiltering';
import AscentionUltrasoundUnCompletedTable from '../../../../components/operations/Ultrasound/UncompletedUltrasoundWaitingListTable';
import { useApplicationSettings } from '../../../../components/Auth/useApplicationContext';
import PrimeLayout from '../../../../components/Layout/PrimeLayout';
import Authorization from '../../../../components/accessories/authorization';


export default function UltrasonograhyCompletedList() {
  const { applicationsettings } = useApplicationSettings();
  const { employeeid, username, role } = applicationsettings.user;

  if (!employeeid) return null

  if (employeeid && ['admin', 'sonographer'].includes(role) === false) {
    return <Authorization />
  }

  return (
    <PrimeLayout>
      <UltrasoundStagesProvider>
        <UltrasoundAscensionFiltering employeeid={employeeid} ascension_stage={'ULTRASOUND_COMPLETED'} />
        <AscentionUltrasoundUnCompletedTable />
      </UltrasoundStagesProvider>
    </PrimeLayout>
  )
}