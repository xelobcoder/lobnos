import React, { useState } from 'react';
import LiverPanel from '../liver';
import FullBloodCountSetup from './fullbloodcount';
import FBCLISTPARAMETERS from './fullcountsetuplist';
import CREATE_PARAMS_SETUP from './createParameter';

export default function Fbcsetupindex() {
 return (
  <React.Fragment>
   <div >
    {/* <LiverPanel/> */}
    {/* <FullBloodCountSetup/> */}
    <CREATE_PARAMS_SETUP />
   </div>
  </React.Fragment>
 )
}
