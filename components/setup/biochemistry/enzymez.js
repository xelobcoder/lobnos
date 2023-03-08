import cardiacparameters from './cardiacenzymes';
import { useState } from 'react';
import PARAMETER_DISPLAY_COMPONENT from '../parameterDisplay';


export default function CARDIAC_ENZYMES_SETUP() {
 const [parameter, setParameter] = useState(cardiacparameters);
 return (
  <>
   <PARAMETER_DISPLAY_COMPONENT  parameterdata={parameter} category='CARDIAC_ENZYMES'/>
  </>
 )
}