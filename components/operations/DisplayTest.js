import React, { useContext, useState } from 'react';
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
import RandomBloodSugar from '../LabTestForms/randomsugar';
import FastingSugar from '../LabTestForms/fastingSugar';
import FullBloodCountEntry from '../LabTestForms/FullBloodCountEntry';
import HemoglobinElectrophoresisForm from '../LabTestForms/HeamoglobinElectophoresis';
import StoolAnalysis from '../LabTestForms/stoolAnalysis';
import BleedingNClotting from '../LabTestForms/bleedingnclotting';
import SemenAnalysis from '../LabTestForms/SemenAnalysis';
import FSHHormone from '../LabTestForms/FSHHormone';
import Helicobacter_Pylori from '../LabTestForms/helicobacter_pylori';
import UseSingleHormoneHook from '../LabTestForms/useSingleHormoneHook';
import PatientTrendModalJsx from './PatientTrendModalJsx/PatientTrendModal.jsx';
import Syphilis from '../LabTestForms/syphilis.jsx';

export default function DisplayTest() {
  const { operationsKey, updateOperations } = useContext(OperationsContext);
  const [showtrend, setshowtrend] = useState(false);
  const closeTrend = () => { setshowtrend(false) }

  const componentsList = {
    aids: <AIDS clientdata={operationsKey} />,
    liver_function_test: <LiverTest clientdata={operationsKey} />,
    renal_function_test: <RenalResults clientdata={operationsKey} />,
    hepatitis_b: <HepatitisB clientdata={operationsKey} />,
    syphilis: <Syphilis clientdata={operationsKey} />,
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
    luteinizing_hormone: <UseSingleHormoneHook clientdata={operationsKey} testname={'LH'} testHeader={'Leutinizing Hormone(LH)'} />,
    helicobacter_pylori: <Helicobacter_Pylori clientdata={operationsKey} />,
    prostate_specific_antigen_test: <UseSingleHormoneHook
      clientdata={operationsKey} testHeader={'prostate specific antigen test(PSA)'} testname={'PSA'} />
  }

  return (
    <>
      <div>
        {operationsKey?.display &&
          (<div className='d-flex justify-content-end mx-1 my-1 gap-1 pointer '>
          <button onClick={(ev) => { setshowtrend(true) }} className='btn btn-primary btn-sm'>
            <span className='mx-2'>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-graph-up-arrow" viewBox="0 0 16 16">
                <path fillRule="evenodd" d="M0 0h1v15h15v1H0zm10 3.5a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-1 0V4.9l-3.613 4.417a.5.5 0 0 1-.74.037L7.06 6.767l-3.656 5.027a.5.5 0 0 1-.808-.588l4-5.5a.5.5 0 0 1 .758-.06l2.609 2.61L13.445 4H10.5a.5.5 0 0 1-.5-.5" />
              </svg>
            </span>
            Patient Trend
          </button>
          {showtrend && ( <PatientTrendModalJsx show={showtrend} hide={closeTrend} data={operationsKey} />)}
        </div>)}
        {operationsKey?.display ? componentsList[(operationsKey.test).toLowerCase()] :
          <>
        <div className='d-flex justify-content-center m-4 '>
          <div>
                <div className='d-flex justify-content-center'>
                <svg width="256px" height="256px" viewBox="-102.4 -102.4 1228.80 1228.80" className="icon" version="1.1" xmlns="http://www.w3.org/2000/svg" fill="#000000"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round" stroke="#CCCCCC" strokeWidth="204.8"><path d="M227.7 180.4h455.2v22.8H227.7z" fill="#446EB1"></path><path d="M666 196.6l17-16.2 136.4 159.4-17 16.2L666 196.6zM227.7 203.2h22.8V795h-22.8z" fill="#446EB1"></path><path d="M250.5 203.2v594.7h546.2V363.3H660.2V203.2H250.5z" fill="#E1F0FF"></path><path d="M796.7 339.7h22.8v455.2h-22.8zM227.7 794.9h591.8v22.8H227.7z" fill="#446EB1"></path><path d="M500.8 430.8h204.8v22.8H500.8zM341.5 521.8h364.2v22.8H341.5zM341.5 612.9h364.2v22.8H341.5zM341.5 703.9h364.2v22.8H341.5z" fill="#6D9EE8"></path><path d="M660.2 203.2H683v159.3h-22.8z" fill="#446EB1"></path><path d="M682.9 339.7h113.8v22.8H682.9zM442.3 277.3h15.3L440 347.7l-22.8-99h-36.6l-26.5 99-19.9-99H296L334.8 408h37.4l26.2-94.2 23.4 94.2h34.5l44.5-159.3h-58.6v28.6h0.1z" fill="#446EB1"></path></g><g id="SVGRepo_iconCarrier"><path d="M227.7 180.4h455.2v22.8H227.7z" fill="#446EB1"></path><path d="M666 196.6l17-16.2 136.4 159.4-17 16.2L666 196.6zM227.7 203.2h22.8V795h-22.8z" fill="#446EB1"></path><path d="M250.5 203.2v594.7h546.2V363.3H660.2V203.2H250.5z" fill="#E1F0FF"></path><path d="M796.7 339.7h22.8v455.2h-22.8zM227.7 794.9h591.8v22.8H227.7z" fill="#446EB1"></path><path d="M500.8 430.8h204.8v22.8H500.8zM341.5 521.8h364.2v22.8H341.5zM341.5 612.9h364.2v22.8H341.5zM341.5 703.9h364.2v22.8H341.5z" fill="#6D9EE8"></path><path d="M660.2 203.2H683v159.3h-22.8z" fill="#446EB1"></path><path d="M682.9 339.7h113.8v22.8H682.9zM442.3 277.3h15.3L440 347.7l-22.8-99h-36.6l-26.5 99-19.9-99H296L334.8 408h37.4l26.2-94.2 23.4 94.2h34.5l44.5-159.3h-58.6v28.6h0.1z" fill="#446EB1"></path></g></svg>
            </div>
                <h4 className='lims-text text-capitalize mt-2 alert alert-info'>select a test to continue </h4>
              </div>
            </div>
          </>
        }
      </div>
    </>
  )
}
