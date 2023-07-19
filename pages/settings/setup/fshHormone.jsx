import React from 'react'
import CHEMISTRY_LAYOUT_SETUP from '../../../components/setup/biochemistry/Layout'
import PARAMETER_DISPLAY_COMPONENT from '../../../components/setup/parameterDisplay'

export default function FshHormone() {
  const defaultParameters = [{
    parameter: 'FSH',
    unit: 'U/L',
    value: '',
    upper: '',
    lower: '',
    gender: 'male',
  },
  {
    parameter: 'FSH',
    unit: 'U/L',
    value: '',
    upper: '',
    lower: '',
    gender: 'female'
  }
  ]
  return (
    <CHEMISTRY_LAYOUT_SETUP>
      <PARAMETER_DISPLAY_COMPONENT
        parameterdata={defaultParameters}
        category={'FSHHORMONE'}
        createTarget={'FSH'}
        testname={'FOLLICLE STIMULATING HORMONE'}
      >

      </PARAMETER_DISPLAY_COMPONENT>
    </CHEMISTRY_LAYOUT_SETUP>
  )
}
