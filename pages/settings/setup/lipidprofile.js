import React from 'react'
import CHEMISTRY_LAYOUT_SETUP from '../../../components/setup/biochemistry/Layout';
import PARAMETER_DISPLAY_COMPONENT from '../../../components/setup/parameterDisplay';
import lipidprofile from '../../../components/setup/biochemistry/lipidparameters';

export default function LIPIDPROFILESETUP() {
  return (
    <div>
      <CHEMISTRY_LAYOUT_SETUP>
        <PARAMETER_DISPLAY_COMPONENT parameterdata={lipidprofile} testname={'lipid_profile'} />
      </CHEMISTRY_LAYOUT_SETUP>
    </div>
  )
}
