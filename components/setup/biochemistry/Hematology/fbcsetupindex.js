import React, { useState } from 'react';
import FullBloodCountSetup from './fullbloodcount';
import FBCLISTPARAMETERS from './fullcountsetuplist';

export default function Fbcsetupindex() {
 return (
  <React.Fragment>
   <div style={{ display: 'grid', gridTemplateColumns: '30% auto' }}>
    <div>
     <FullBloodCountSetup />
    </div>
    <div>
     <FBCLISTPARAMETERS />
    </div>
   </div>
  </React.Fragment>
 )
}
