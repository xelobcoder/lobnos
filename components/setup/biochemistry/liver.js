import { useState,useMemo} from 'react';
import parameters from './livercountparameters';
import { Button } from '@mui/material';


import PARAMETER_DISPLAY_COMPONENT from '../parameterDisplay.js';

function LiverPanel() {
  const [liverpanel, setLiverpanel] = useState(parameters);
 

  return (
    <>
      <PARAMETER_DISPLAY_COMPONENT parameterdata={liverpanel} category='LIVER_SETUP'/>
    </>
  )
}

export default LiverPanel;
