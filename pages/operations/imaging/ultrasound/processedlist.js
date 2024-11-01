import UltrasoundLayout from '../../../../components/Layout/ImagingLayout';
import { UltrasoundStagesProvider } from '../../../../components/operations/Ultrasound/UltrasoundContext';
import UltrasoundAscensionFiltering from '../../../../components/operations/Ultrasound/UtrasoundFiltering';
import AscentionUltrasoundUnCompletedTable from '../../../../components/operations/Ultrasound/UncompletedUltrasoundWaitingListTable';
import AuthContext from '../../../../components/Auth/useAuthentification';
import { useContext } from 'react';

export default function UltrasonograhyCompletedList() {
  const { auth } = useContext(AuthContext);
  if (!auth?.employeeid) return null;

  return (
    <UltrasoundLayout>
      <UltrasoundStagesProvider>
        <UltrasoundAscensionFiltering  employeeid={auth.employeeid} ascension_stage={'ULTRASOUND_COMPLETED'} />
        <AscentionUltrasoundUnCompletedTable />
      
      </UltrasoundStagesProvider>
    </UltrasoundLayout>
  )
}