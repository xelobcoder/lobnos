import UltrasoundLayout from '../../../../components/Layout/ImagingLayout';
import { UltrasoundStagesProvider } from '../../../../components/operations/Ultrasound/UltrasoundContext';
import UltrasoundAscensionFiltering from '../../../../components/operations/Ultrasound/UtrasoundFiltering';
import AscentionUltrasoundUnCompletedTable from '../../../../components/operations/Ultrasound/UncompletedUltrasoundWaitingListTable';

export default function UltrasonograhyWaitingList() {


  return (
    <UltrasoundLayout>
      <UltrasoundStagesProvider>
        <UltrasoundAscensionFiltering ascension_stage={'ULTRASOUND_UNCOMPLETED'} />
        <AscentionUltrasoundUnCompletedTable />
      </UltrasoundStagesProvider>
    </UltrasoundLayout>
  )
}