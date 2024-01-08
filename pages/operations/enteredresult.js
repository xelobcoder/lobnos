import { OperationsProvider } from '../../components/operations/OperationsContext';
import OperationsLayout from '../../components/operations/OperationsLayout';
import DisplayTest from '../../components/operations/DisplayTest';
import Header from "../../components/header"
import ResultEnteredSidePanel from '../../components/operations/ResultEnteredSidePanel';
import AllresultSecondPanel from '../../components/operations/AllresultSecondPanel';



export default function Enteredresult() {
  return (
    <>
      <Header/>
      <OperationsProvider>
        <OperationsLayout
          componentTwo={<AllresultSecondPanel/>}
          componentOne={<ResultEnteredSidePanel />}
          componentThree={ <DisplayTest />}>
        </OperationsLayout>
      </OperationsProvider>
    </>
  )
}
