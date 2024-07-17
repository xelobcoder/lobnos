import { OperationsProvider } from '../../../components/operations/OperationsContext';
import OperationsLayout from '../../../components/operations/OperationsLayout';
import DisplayTest from '../../../components/operations/DisplayTest';
import OperationsTestCollection from '../../../components/operations/OperationsTestCollection';
import TestPreview from '../../../components/operations/TestPreview';
import Header from '../../../components/header';

export default function OPERATIONS() {
  return (
    <>
      <Header/>
      <OperationsProvider>
        <OperationsLayout
          componentOne={<OperationsTestCollection />}
          componentTwo={<TestPreview />}
          componentThree={<DisplayTest/>}>
        </OperationsLayout>
      </OperationsProvider>
    </>
  )
}
