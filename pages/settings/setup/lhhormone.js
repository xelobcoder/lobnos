import React from 'react'
import CHEMISTRY_LAYOUT_SETUP from '../../../components/setup/biochemistry/Layout'
import PARAMETER_DISPLAY_COMPONENT from '../../../components/setup/parameterDisplay'

export default function LeutinizingHormoneSetUpPage() {
  const defaultParameters = [{
    parameter: 'LH',
    unit:'U/L',
    value: '',
    upper: '',
    lower: '',
    gender: 'male',
  },
  {
    parameter: 'LH',
    unit:'U/L',
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
          category="LHHORMONE"
          createTarget={"lh"}
          testname={"LEUTINIZING HORMONE"}
        />
      </CHEMISTRY_LAYOUT_SETUP>
    </>
  );
}
