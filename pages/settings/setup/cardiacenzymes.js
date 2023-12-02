import React from 'react'
import PARAMETER_DISPLAY_COMPONENT from '../../../components/setup/parameterDisplay';
import cardiacenzymes from '../../../components/setup/biochemistry/cardiacenzymes';
import CHEMISTRY_LAYOUT_SETUP from '../../../components/setup/biochemistry/Layout';

export default function Cardiacenzymes() {
  return (
    <>
      <CHEMISTRY_LAYOUT_SETUP>
        <PARAMETER_DISPLAY_COMPONENT parameterdata={cardiacenzymes}
          testname={'cardiac_enzymes'}
         />
      </CHEMISTRY_LAYOUT_SETUP>
    </>
  )
}
