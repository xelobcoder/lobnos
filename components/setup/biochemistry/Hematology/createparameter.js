import React, { useState, useEffect } from 'react';
import { Button } from '@mui/material';


export default function CREATE_PARAMS_SETUP(props) {
 const [paramsOpts, setparamsOpts] = useState('');
 const [error, setErorr] = useState(false);



 const Message = function ({ type, message }) {
  const error = 'alert alert-danger';
  const success = 'alert alert-success';
  return (
   <>
    <div className='container'>
     <div className={type === 'error' ? error : success}>
      {message}
     </div>
    </div>
   </>
  )
 }



 const Form = function () {
  return (
   <>
    <div>
     <div className='_params_top'>
      <ul className='_list_add_params'>
       <li>parameter name</li>
       <li>unit</li>
       <li>upper</li>
       <li>lower</li>
       <li></li>
      </ul>
     <ul className='_list_add_params'>
       <li>
        <input className='form-control' type='text' />
       </li>
       <li>
        <input className='form-control' type='text' />
       </li>
       <li>
        <input className='form-control' type='number' />
       </li>
       <li>
        <input className='form-control' type='number' />
       </li>
       <li>
        <Button variant='contained' size='large'> add</Button>
       </li>
      </ul>
     </div>
    </div>
   </>
  )
 }


 return (
  <>
   {
    error ? <Message type='success' message='here ua come' /> : null
   }
   <Form />
  </>
 )
}