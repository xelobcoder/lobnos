import React from 'react'
import CHEMISTRY_LAYOUT_SETUP from '../../../components/setup/biochemistry/Layout'
import PARAMETER_DISPLAY_COMPONENT from '../../../components/setup/parameterDisplay';
import thyroidparameters from '../../../components/setup/biochemistry/thyroidparameter';

export default function THYROID_TEST_SETUP() {
  return (
    <>
      <CHEMISTRY_LAYOUT_SETUP>
        <PARAMETER_DISPLAY_COMPONENT
          testname={'THYROID HORMONE'}
          parameterdata={thyroidparameters} category='THYROID_SETUP' createTarget={'thyroid'} />
      </CHEMISTRY_LAYOUT_SETUP>
    </>
  )
}
