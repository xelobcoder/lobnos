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
import ThyroidTest from '../LabTestForms/thyroid';
import HepatitisC from '../LabTestForms/hepC';
import HEPATITISBPROFILE from '../LabTestForms/hepatitisBprofile';
import BloodGroup from '../LabTestForms/bloodgroup';
import ESR from '../LabTestForms/esr';

export default function DisplayTest() {
  const { operationsKey } = useContext(OperationsContext);

  const componentsList = {
    aids: <AIDS />,
    liver_function_test: <LiverTest />,
    renal_function_test: <RenalResults />,
    hepatitis_b: <HepatitisB />,
    widal: <Widal />,
    gpd: <G6PD />,
    cardiac_enzymes: <CardiacEnzymes />,
    urinanalysis: <Urinalysis />,
    thyroid_test: <ThyroidTest />,
    hepatitis_b_profile: <HEPATITISBPROFILE/>,
    hepatitis_b: <HepatitisB/>,
    hepatitis_c: <HepatitisC/>,
    blood_grouping: <BloodGroup/>,
    erythrocyte_sedimentation_rate: <ESR/>,
  }
  return (
    <div>
      {operationsKey?.display && componentsList[(operationsKey.test).toLowerCase()]}
    </div>
  )
}
