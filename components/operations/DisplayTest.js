import React, { useContext } from 'react';
import OperationsContext from '../../components/operations/OperationsContext';
import AIDS from '../LabTestForms/aids';
import LiverTest from '../LabTestForms/liver';
import RenalResults from '../LabTestForms/renal';

export default function DisplayTest() {
  const { operationsKey } = useContext(OperationsContext);

  const componentsList = {
    aids : <AIDS />,
    liver_function_test : <LiverTest/>,
    renal_function_test : <RenalResults/>
  }
  return (
    <div>
      {operationsKey?.display && componentsList[operationsKey.test]}
    </div>
  )
}
