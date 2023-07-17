import React,{useState} from 'react';
import CHEMISTRY_LAYOUT_SETUP from '../../../components/setup/biochemistry/Layout';
import parameters from '../../../components/setup/biochemistry/livercountparameters';

import PARAMETER_DISPLAY_COMPONENT from '../../../components/setup/parameterDisplay';
export default function Liverfunctiontest() {
  const [liverpanel, setLiverpanel] = useState(parameters);
  return (
    <div>
      <CHEMISTRY_LAYOUT_SETUP>
        <PARAMETER_DISPLAY_COMPONENT parameterdata={liverpanel} category='LIVER_SETUP' createTarget={'liver'} testname={'LIVER FUNCTION TEST'}/>
      </CHEMISTRY_LAYOUT_SETUP>
    </div>
  )
}
