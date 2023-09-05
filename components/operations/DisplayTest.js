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
import Image from 'next/image';
import { Button } from '@mui/material';
import RandomBloodSugar from '../LabTestForms/randomsugar';
import FastingSugar from '../LabTestForms/fastingSugar';
import FullBloodCountEntry from '../LabTestForms/FullBloodCountEntry';
import HemoglobinElectrophoresisForm from '../LabTestForms/HeamoglobinElectophoresis';
import StoolAnalysis from '../LabTestForms/stoolAnalysis';
import BleedingNClotting from '../LabTestForms/bleedingnclotting';
import SemenAnalysis from '../LabTestForms/SemenAnalysis';
import LHHormone from '../LabTestForms/LHHormone';
import FSHHormone from '../LabTestForms/FSHHormone';
import Helicobacter_Pylori from '../LabTestForms/helicobacter_pylori';

export default function DisplayTest() {
  const { operationsKey } = useContext(OperationsContext);

  const componentsList = {
    aids: <AIDS clientdata={operationsKey} />,
    liver_function_test: <LiverTest clientdata={operationsKey} />,
    renal_function_test: <RenalResults clientdata={operationsKey} />,
    hepatitis_b: <HepatitisB clientdata={operationsKey} />,
    widal: <Widal clientdata={operationsKey} />,
    gpd: <G6PD clientdata={operationsKey} />,
    cardiac_enzymes: <CardiacEnzymes clientdata={operationsKey} />,
    urinalysis: <Urinalysis clientdata={operationsKey} />,
    hepatitis_b_profile: <HEPATITISBPROFILE clientdata={operationsKey} />,
    hepatitis_b: <HepatitisB clientdata={operationsKey} />,
    hepatitis_c: <HepatitisC clientdata={operationsKey} />,
    blood_grouping: <BloodGroup clientdata={operationsKey} />,
    estimated_sedimentation_rate_: <ESR clientdata={operationsKey} />,
    lipid_profile: <LipidProfile clientdata={operationsKey} />,
    glycated_heamoglobin: <HbA1c clientdata={operationsKey} />,
    pregnancy_test: <Pregnancy clientdata={operationsKey} />,
    malaria: <Malaria clientdata={operationsKey} />,
    thyroid_functional_test: <ThyroidTest clientdata={operationsKey} />,
    betahcg: <BetaHcg clientdata={operationsKey} />,
    random_blood_sugar: <RandomBloodSugar clientdata={operationsKey} type={'random blood sugar'} />,
    fasting_blood_sugar: <FastingSugar clientdata={operationsKey} type={'fasting blood sugar'} />,
    full_blood_count: <FullBloodCountEntry clientdata={operationsKey} />,
    haemoglobin_electrophoresis: <HemoglobinElectrophoresisForm clientdata={operationsKey} />,
    stool_analysis: <StoolAnalysis clientdata={operationsKey} />,
    clotting_and_bleeding_time: <BleedingNClotting clientdata={operationsKey} />,
    semen_analysis: <SemenAnalysis clientdata={operationsKey} />,
    follicle_stimulating_hormone: <FSHHormone clientdata={operationsKey} />,
    luteinizing_hormone: <LHHormone clientdata={operationsKey} />,
    helicobacter_pylori: <Helicobacter_Pylori clientdata={operationsKey} />
  }
  return (
    <div>
      {operationsKey?.display ? componentsList[(operationsKey.test).toLowerCase()] : <>
        <div className='d-flex justify-content-center m-4 '>
          <div>
            <div className='d-flex justify-content-center'>
              <Image src='/../public/download.png'
                width={200}
                height={200}
                alt={'No patient selected'}
              />
            </div>
            <h4 className='lims-text text-uppercase mt-3 alert alert-warning'>select a test to continue </h4>
            <div className='d-flex justify-content-center'>
              <Button>read instructions </Button>
            </div>
          </div>
        </div>

      </>}
    </div>
  )
}
