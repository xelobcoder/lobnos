import React from 'react'
import CHEMISTRY_LAYOUT_SETUP from '../../../components/setup/biochemistry/Layout';
import PARAMETER_DISPLAY_COMPONENT from '../../../components/setup/parameterDisplay';
export default function PSAHormoneSetup() {
  const defaultParameters = [{
    parameter: '  PSA',
    unit: 'U/L',
    value: '',
    upper: '',
    lower: '',
    gender: 'male',
  },
  {
    parameter: 'PSA',
    unit: 'U/L',
    value: '',
    upper: '',
    lower: '',
    gender: 'female'
  }
  ]
  return (
    <>
      <CHEMISTRY_LAYOUT_SETUP>
        <PARAMETER_DISPLAY_COMPONENT
          parameterdata={defaultParameters}
          category="PSAHORMONE"
          createTarget={"psa"}
          testname={"PROSTATE SPECIFIC ANTIGEN TEST"}
        />
      </CHEMISTRY_LAYOUT_SETUP>
    </>
  )
}
