import React, { useState } from 'react';
import LiverPanel from '../liver';
import FullBloodCountSetup from './fullbloodcount';
import FBCLISTPARAMETERS from './fullcountsetuplist';

export default function Fbcsetupindex() {
 return (
  <React.Fragment>
   <div >
   <LiverPanel/>
   {/* <FullBloodCountSetup/> */}
   </div>
  </React.Fragment>
 )
}
