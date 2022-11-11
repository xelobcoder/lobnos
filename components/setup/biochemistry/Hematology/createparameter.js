import React, { useState, useEffect } from 'react';
import { Button } from '@mui/material';


export default function CREATE_PARAMS_SETUP(props) {
  const { testname, setupdata, nd } = props;
  const [paramsOpts, setparamsOpts] = useState({
    unit: '',
    parameter: '',
    upper: 0,
    lower:0
  });

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




  return (
    <>
      {
        error ? <Message type='success' message='here ua come' /> : null
      }
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
              <input className='form-control' value={paramsOpts.parameter} onChange={(e) => setparamsOpts({ ...paramsOpts, parameter: e.target.value })} type='text' />
            </li>
            <li>
              <input className='form-control' value={paramsOpts.unit} type='text' onChange={(e) => { setparamsOpts({ ...paramsOpts, unit: e.target.value }) }} />
            </li>
            <li>
              <input className='form-control' value={paramsOpts.upper} type='number'onChange={(e) => { setparamsOpts({ ...paramsOpts, upper: e.target.value }) }} />
            </li>
            <li>
              <input className='form-control' value={paramsOpts.lower} type='number' onChange={(e) => { setparamsOpts({ ...paramsOpts, lower: e.target.value }) }}/>
            </li>
            <li>
              <Button variant='contained' size='large' onClick={(e) => nd(paramsOpts)}> add</Button>
            </li>
          </ul>
        </div>
      </div>
    </>
  )
}