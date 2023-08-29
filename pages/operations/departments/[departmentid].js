import React, { useContext } from 'react';
import { OperationsProvider } from '../../../components/operations/OperationsContext';
import OperationsContext from '../../../components/operations/OperationsContext';
import OperationsLayout from '../../../components/operations/OperationsLayout';
import DisplayTest from '../../../components/operations/DisplayTest';

export default function OPERATIONS() {
  return (
    <>
      <OperationsProvider>
        <OperationsLayout>
          <DisplayTest/>
        </OperationsLayout>
      </OperationsProvider>
    </>
  )
}
