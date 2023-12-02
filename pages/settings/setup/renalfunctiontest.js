import React from 'react'
import CHEMISTRY_LAYOUT_SETUP from '../../../components/setup/biochemistry/Layout'
import PARAMETER_DISPLAY_COMPONENT from '../../../components/setup/parameterDisplay';
import renalparameters from '../../../components/setup/biochemistry/renalparameters';

export default function Renalfunctiontest() {
  return (
    <div>
      <CHEMISTRY_LAYOUT_SETUP>
        <PARAMETER_DISPLAY_COMPONENT parameterdata={renalparameters}  testname={'renal_function_test'}/>
      </CHEMISTRY_LAYOUT_SETUP>
    </div>
  )
}
