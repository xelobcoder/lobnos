import React from 'react';
import { OperationsProvider } from '../../../components/operations/OperationsContext';
import OperationsLayout from '../../../components/operations/OperationsLayout';
import DisplayTest from '../../../components/operations/DisplayTest';
import OperationsTestCollection from '../../../components/operations/OperationsTestCollection';
import TestPreview from '../../../components/operations/TestPreview';

export default function OPERATIONS() {
  return (
    <>
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
