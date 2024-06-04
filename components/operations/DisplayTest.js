import { useContext } from 'react';
import OperationsContext from '../../components/operations/OperationsContext';
import { getTestComponent } from '../LabTestForms/ComponentsTestFormsList.js';

export default function DisplayTest() {
  const { operationsKey, employeeid } = useContext(OperationsContext);
  let Component = operationsKey?.test && getTestComponent(operationsKey?.test.toLowerCase());


  return (
    <div>
      {operationsKey?.display && <Component employeeid={employeeid} clientdata={operationsKey} />}
    </div>
  )
}
