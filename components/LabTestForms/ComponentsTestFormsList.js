import AIDS from '../LabTestForms/aids';
import HepatitisB from '../LabTestForms/hepB';
import Widal from '../LabTestForms/widal';
import G6PD from '../LabTestForms/g6pd';
import Urinalysis from '../LabTestForms/urinalysis';
import HepatitisC from '../LabTestForms/hepC';
import HEPATITISBPROFILE from '../LabTestForms/hepatitisBprofile.jsx';
import BloodGroup from '../LabTestForms/bloodgroup';
import ESR from '../LabTestForms/esr';
import HbA1c from '../LabTestForms/HbA1c';
import Pregnancy from '../LabTestForms/pregnancy';
import Malaria from '../LabTestForms/malaria';
import BetaHcg from '../LabTestForms/BetaHcg';
import SugarHook from '../LabTestForms/SugarHook.js';
import HemoglobinElectrophoresisForm from '../LabTestForms/HeamoglobinElectophoresis';
import StoolAnalysis from '../LabTestForms/stoolAnalysis';
import BleedingNClotting from '../LabTestForms/bleedingnclotting';
import SemenAnalysis from '../LabTestForms/SemenAnalysis';
import Helicobacter_Pylori from '../LabTestForms/helicobacter_pylori';
// import UseSingleHormoneHook from '../LabTestForms/useSingleHormoneHook';
import Syphilis from '../LabTestForms/syphilis.jsx';
import UseChemistryTestHook from '../LabTestForms/useChemistryTestHook.jsx';
import CreateTestRule from './testrule.js';


const componentsList = {
  aids: AIDS ,
  liver_function_test: UseChemistryTestHook ,
  renal_function_test: UseChemistryTestHook ,
  hepatitis_b: HepatitisB ,
  syphilis: Syphilis ,
  widal: Widal ,
  gpd: G6PD ,
  cardiac_enzymes: UseChemistryTestHook ,
  urinalysis: Urinalysis ,
  hepatitis_b_profile: HEPATITISBPROFILE ,
  hepatitis_b: HepatitisB ,
  hepatitis_c: HepatitisC ,
  blood_grouping: BloodGroup ,
  estimated_sedimentation_rate_: ESR ,
  lipid_profile: UseChemistryTestHook ,
  glycated_heamoglobin: HbA1c ,
  pregnancy_test: Pregnancy ,
  malaria: Malaria ,
  thyroid_functional_test: UseChemistryTestHook ,
  betahcg: BetaHcg ,
  random_blood_sugar: SugarHook ,
  fasting_blood_sugar: SugarHook,
  full_blood_count: UseChemistryTestHook ,
  haemoglobin_electrophoresis: HemoglobinElectrophoresisForm ,
  stool_analysis: StoolAnalysis ,
  clotting_and_bleeding_time: BleedingNClotting ,
  semen_analysis: SemenAnalysis ,
  follicle_stimulating_hormone: UseChemistryTestHook ,
  luteinizing_hormone: UseChemistryTestHook ,
  helicobacter_pylori: Helicobacter_Pylori ,
  prostate_specific_antigen_test:UseChemistryTestHook,
  beta_thalassemia: UseChemistryTestHook,
}


export const getTestComponent = function (testname) { 
  if (componentsList[testname] != undefined) {
    return componentsList[testname];
  } else {
    return CreateTestRule;
   }
}