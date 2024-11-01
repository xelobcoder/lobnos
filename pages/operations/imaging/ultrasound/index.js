import UltrasoundLayout from '../../../../components/Layout/ImagingLayout';
import { UltrasoundStagesProvider } from '../../../../components/operations/Ultrasound/UltrasoundContext';
import UltrasoundAscensionFiltering from '../../../../components/operations/Ultrasound/UtrasoundFiltering';
import AscentionUltrasoundUnCompletedTable from '../../../../components/operations/Ultrasound/UncompletedUltrasoundWaitingListTable';
import { useContext } from 'react';
import AuthContext from '../../../../components/Auth/useAuthentification';

export default function UltrasonograhyWaitingList() {
  const { auth } = useContext(AuthContext);

  if (!auth?.employeeid) return null

  return (
    <UltrasoundLayout>
      <UltrasoundStagesProvider>
        <UltrasoundAscensionFiltering ascension_stage={'ULTRASOUND_UNCOMPLETED'} employeeid={auth.employeeid} />
        <AscentionUltrasoundUnCompletedTable />
      </UltrasoundStagesProvider>
    </UltrasoundLayout>
  )
}