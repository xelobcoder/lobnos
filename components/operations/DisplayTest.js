import React, { useContext } from 'react';
import OperationsContext from '../../components/operations/OperationsContext';
import AIDS from '../LabTestForms/aids';
import LiverTest from '../LabTestForms/liver';
import RenalResults from '../LabTestForms/renal';
import HepatitisB from '../LabTestForms/hepB';
import Widal from '../LabTestForms/widal';
import G6PD from '../LabTestForms/g6pd';
import CardiacEnzymes from '../LabTestForms/cardiacenzyme';
import Urinalysis from '../LabTestForms/urinalysis';
import ThyroidTest from '../LabTestForms/thyroid';
import HepatitisC from '../LabTestForms/hepC';
import HEPATITISBPROFILE from '../LabTestForms/hepatitisBprofile';
import BloodGroup from '../LabTestForms/bloodgroup';
import ESR from '../LabTestForms/esr';
import LipidProfile from '../LabTestForms/lipidprofile';
import HbA1c from '../LabTestForms/HbA1c';

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
    hepatitis_b_profile: <HEPATITISBPROFILE />,
    hepatitis_b: <HepatitisB clientdata={operationsKey} />,
    hepatitis_c: <HepatitisC clientdata={operationsKey} />,
    blood_grouping: <BloodGroup clientdata={operationsKey} />,
    erythrocyte_sedimentation_rate: <ESR />,
    lipid_profile: <LipidProfile />,
    glycated_heamoglobin: <HbA1c clientdata={operationsKey} />
  }
  return (
    <div>
      {operationsKey?.display && componentsList[(operationsKey.test).toLowerCase()]}
    </div>
  )
}
