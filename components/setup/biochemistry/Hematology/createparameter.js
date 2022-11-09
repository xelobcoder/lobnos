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
    <div className='_fbc'>
     <div className='wrapperx'>
      <div className='fbc_header'>
       <ul className='_list'>
        <li>parameter name</li>
        <li>unit</li>
        <li>upper</li>
        <li>lower</li>
       </ul>
      </div>
      <div className='fbc_header'>
       <div className='parameter-list'>
        <ul className='_list'>
         <li>
          <input className='form-control' style={{ width: '250px' }} type='text' />
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
        </ul>
       </div>
      </div>
     </div>
     <Button variant='contained' sx={{ mt: 5 }} size='large'> add parameter</Button>
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