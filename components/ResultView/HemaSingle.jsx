import React from 'react';
import Malaria from '../ResutlUI/Malaria';
import BloodGrouping from '../ResutlUI/BloodGrouping';
import PregnancyTestUI from '../ResutlUI/PregnancyTestUI';
import UrinalysisUI from '../ResutlUI/UrinalysisUI';
import HepatitisBProfileUI from '../ResutlUI/HepatitisBProfile';
import EsrResultUI from '../ResutlUI/Esr';

export default function HemaSingle({ result, testname }) {


  const testTemplates = {
    malaria: <Malaria result={result} testname={testname} />,
    blood_grouping: <BloodGrouping result={result} testname={testname} />,
    pregnancy_test: <PregnancyTestUI result={result} testname={testname} />,
    urinalysis: <UrinalysisUI result={result} testname={testname} />,
    hepatitis_b_profile: <HepatitisBProfileUI result={result} testname={testname} />,
    esr: <EsrResultUI result={result} testname={testname} />
  };

  return (
    <>
      {testTemplates[testname]}
    </>
  );
}
