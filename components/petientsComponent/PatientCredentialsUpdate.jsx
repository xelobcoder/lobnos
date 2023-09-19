import React from 'react'
import { handleChangeWithState } from '../Auth/customFetch'

export default function PatientCredentialsUpdate({ data, setData }) {
  return (
    <>
      <form method='PUT' aria-label='patient credentials update form' autoCapitalize='off' autoComplete='off' id='patient-credentials-form' >
        <div className='form-row'>
          <label>username
            <span className='text-danger'> *</span>
          </label>
          <input value={data.username} onChange={(ev) => handleChangeWithState(ev, 'username', setData, data)} className='form-control' type='text' placeholder='Enter username here' required />
        </div>
        <div className='form-row'>
          <label>old password
            <span className='text-danger'> *</span>
          </label>
          <input value={data.opassword} className='form-control' onChange={(ev) => handleChangeWithState(ev, 'opassword', setData, data)} type='password' placeholder='Enter password here' required />
        </div>
        <div className='form-row'>
          <label> new password
            <span className='text-danger'> *</span>
          </label>
          <input value={data.npassword} className='form-control' onChange={(ev) => handleChangeWithState(ev, 'npassword', setData, data)} type='password' placeholder='Enter password here' required />
        </div>
        <div className='form-row'>
          <label>confirm new password
            <span className='text-danger'> *</span>
          </label>
          <input value={data.nppassword} className='form-control' onChange={(ev) => handleChangeWithState(ev, 'nppassword', setData, data)} type='password' placeholder='confirm password' required />
        </div>
      </form>
    </>
  )
}
