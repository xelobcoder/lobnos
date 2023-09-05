import React from 'react';
import { OperationsProvider } from '../../components/operations/OperationsContext';
import OperationsLayout from '../../components/operations/OperationsLayout';
import DisplayTest from '../../components/operations/DisplayTest';
import ResultEnteredSidePanel from '../../components/operations/ResultEnteredSidePanel';
import AllresultSecondPanel from '../../components/operations/AllresultSecondPanel';


export default function Enteredresult() {
  return (
    <>
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
