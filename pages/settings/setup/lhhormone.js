import React from 'react'
import CHEMISTRY_LAYOUT_SETUP from '../../../components/setup/biochemistry/Layout'
import PARAMETER_DISPLAY_COMPONENT from '../../../components/setup/parameterDisplay';
import { defaultHormonesParameters } from '../../../components/Auth/customFetch';

export default function LeutinizingHormoneSetUpPage() {
 
  return (
    <>
      <CHEMISTRY_LAYOUT_SETUP>
        <PARAMETER_DISPLAY_COMPONENT
          parameterdata={defaultHormonesParameters}
          gender={true}
          testname={"luteinizing_hormone"}
        />
      </CHEMISTRY_LAYOUT_SETUP>
    </>
  );
}
