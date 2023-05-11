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
import HEPATITISBPROFILE from '../LabTestForms/hepatitisBprofile.jsx';
import BloodGroup from '../LabTestForms/bloodgroup';
import ESR from '../LabTestForms/esr';
import LipidProfile from '../LabTestForms/lipidprofile';
import HbA1c from '../LabTestForms/HbA1c';
import Pregnancy from '../LabTestForms/pregnancy';
import Malaria from '../LabTestForms/malaria';
import BetaHcg from '../LabTestForms/BetaHcg';

export default function DisplayTest() {
  const { operationsKey } = useContext(OperationsContext);
console.log(operationsKey)
  const componentsList = {
    aids: <AIDS clientdata={operationsKey} />,
    liver_function_test: <LiverTest clientdata={operationsKey}/>,
    renal_function_test: <RenalResults clientdata={operationsKey} />,
    hepatitis_b: <HepatitisB  clientdata={operationsKey}/>,
    widal: <Widal clientdata={operationsKey} />,
    gpd: <G6PD  clientdata={operationsKey}/>,
    cardiac_enzymes: <CardiacEnzymes clientdata={operationsKey} />,
    urinalysis: <Urinalysis clientdata={operationsKey} />,
    hepatitis_b_profile: <HEPATITISBPROFILE  clientdata={operationsKey}/>,
    hepatitis_b: <HepatitisB clientdata={operationsKey} />,
    hepatitis_c: <HepatitisC clientdata={operationsKey} />,
    blood_grouping: <BloodGroup clientdata={operationsKey} />,
    estimated_sedimentation_rate_: <ESR  clientdata={operationsKey}/>,
    lipid_profile: <LipidProfile  clientdata={operationsKey}/>,
    glycated_heamoglobin: <HbA1c clientdata={operationsKey} />,
    pregnancy_test: <Pregnancy clientdata={operationsKey}/>,
    malaria: <Malaria clientdata={operationsKey}/>,
    thyroid_functional_test: <ThyroidTest clientdata={operationsKey}/>,
    betahcg: <BetaHcg clientdata={operationsKey}/>,
  }
  return (
    <div>
      {operationsKey?.display && componentsList[(operationsKey.test).toLowerCase()]}
    </div>
  )
}
