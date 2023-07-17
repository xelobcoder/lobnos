import React from 'react'
import CHEMISTRY_LAYOUT_SETUP from '../../../components/setup/biochemistry/Layout'
import PARAMETER_DISPLAY_COMPONENT from '../../../components/setup/parameterDisplay';
import electrophoresisData from '../../../components/setup/biochemistry/electrophoresisParams';

export default function ElectrophoresisSetUp() {
  return (
    <div>
      <CHEMISTRY_LAYOUT_SETUP>
        <PARAMETER_DISPLAY_COMPONENT parameterdata={electrophoresisData} category='ELECTROPHORESIS_SETUP' createTarget={'electrophoresis'} testname={'HAEMOGLOBIN ELECTROPHORESIS'} >
        </PARAMETER_DISPLAY_COMPONENT>
      </CHEMISTRY_LAYOUT_SETUP>
    </div>
  )
}
