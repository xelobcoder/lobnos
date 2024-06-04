import { OperationsProvider } from '../../components/operations/OperationsContext';
import OperationsLayout from '../../components/operations/OperationsLayout';
import ResultEnteredSidePanel from '../../components/operations/ResultEnteredSidePanel';
import AllresultSecondPanel from '../../components/operations/AllresultSecondPanel';
import LaboratoryLayout from '../../components/Layout/LaboratoryLayout';


export default function Enteredresult() {
  return (
    <LaboratoryLayout>
      <OperationsProvider>
        <OperationsLayout
          componentTwo={<AllresultSecondPanel/>}
          componentOne={<ResultEnteredSidePanel />}
          // componentThree={<DisplayTest />}
        >
        </OperationsLayout>
      </OperationsProvider>
    </LaboratoryLayout>
  )
}
