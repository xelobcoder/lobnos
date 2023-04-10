import React, { useContext } from 'react';
import OperationsContext from '../../components/operations/OperationsContext';
import AIDS from '../LabTestForms/aids';
import LiverTest from '../LabTestForms/liver';
import RenalResults from '../LabTestForms/renal';
import HepatitisB from '../LabTestForms/hepB.';
import Widal from '../LabTestForms/widal';
import G6PD from '../LabTestForms/g6pd';
import CardiacEnzymes from '../LabTestForms/cardiacenzyme';
import Urinalysis from '../LabTestForms/urinalysis';

export default function DisplayTest() {
  const { operationsKey } = useContext(OperationsContext);

  const componentsList = {
    aids: <AIDS />,
    liver_function_test: <LiverTest />,
    renal_function_test: <RenalResults />,
    hepatitis_b: <HepatitisB />,
    widal: <Widal />,
    gpd: <G6PD />,
    cardiac_enzymens: <CardiacEnzymes />,
    urinanalysis: <Urinalysis/>
  }
  return (
    <div>
      {operationsKey?.display && componentsList[operationsKey.test]}
    </div>
  )
}
