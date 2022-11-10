import React, { useState, useEffect } from 'react';
import LiverPanel from '../liver';
import FullBloodCountSetup from './fullbloodcount';
import FBCLISTPARAMETERS from './fullcountsetuplist';
import CREATE_PARAMS_SETUP from './createParameter';
import LIST_PARAMETERS from './paramList';

export default function Fbcsetupindex() {
 const [setupdata, setData] = useState([]);
 // loads data from db of the params and their units and limits
 const loadparams_data = async function () {
  let endpoint = `http://localhost:3000/api/test/setup/createparams?testname=fbc`;
  let getdata = async function () {
   let api = await fetch(endpoint);
   let response = await api.json();
   return response;
  }

  getdata().then((t) => { setData(t) }).catch((err) => { console.log(err) })
 }


 useEffect(() => {
  loadparams_data();

 }, [])
 return (
  <React.Fragment>
   <div >
    {/* <LiverPanel/> */}
    {/* <FullBloodCountSetup/> */}
    <CREATE_PARAMS_SETUP />
    <LIST_PARAMETERS setupdata={setupdata} />
   </div>
  </React.Fragment>
 )
}
