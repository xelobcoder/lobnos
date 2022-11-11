import React, { useState, useEffect, useCallback } from 'react';
import LiverPanel from '../liver';
import FullBloodCountSetup from './fullbloodcount';
import FBCLISTPARAMETERS from './fullcountsetuplist';
import CREATE_PARAMS_SETUP from './createParameter';
import LIST_PARAMETERS from './paramList';
import Message from '../../../accessories/message';

export default function Fbcsetupindex() {
 const [setupdata, setData] = useState([]);
 const [message, setMessage] = useState({ display: false, message: '', width: '', type: '' });


 // loads data from db of the params and their units and limits
 const loadparams_data = async function () {
  let endpoint = `http://localhost:3000/api/test/setup/createparams?testname=fbc`;
  let getdata = async function () {
   const api = await fetch(endpoint);
   const response = await api.json();
   return response;
  }

  getdata().then((t) => { setData(t) }).catch((err) => { console.log(err) })
 }


 useEffect(() => {
  loadparams_data();
 }, [])


 // fires up anytime a click to add paramter happens
 // set display messaage to false
 const fire = useCallback(() => { setMessage({ ...message, display: false }) }, [message.display])

 const addparameter = useCallback((data) => {
  const { parameter, unit, lower, upper } = data;

  if (parameter && unit && lower && upper) {
   // push data to db
   const pushdata = async function () {
    let getter = await fetch('http://localhost:3000/api/test/setup/createparams', { method: 'POST', body: JSON.stringify({ parameterDetails: data, testname: 'fbc' }) })
    let response = getter.json();
    return response;
   }
   pushdata().then((ev) => {
    setMessage({
     display: true,
     message: ev.message,
     type: 'success',
     width: 'large'
    })
   })
    .catch((_err) => { console.log(_err) })
  }
 })



 return (
  <React.Fragment>
   <div >
    {/* <LiverPanel/> */}
    {/* <FullBloodCountSetup/> */}
    {
     message.display ? <Message type={message.type} width={message.width} controller={fire} message={message.message} displaytime={500000} /> : null
    }
    <CREATE_PARAMS_SETUP nd={addparameter} />
    <LIST_PARAMETERS setupdata={setupdata} />
   </div>
  </React.Fragment>
 )
}
