import React from 'react'

export default function PatientCredentialsUpdate() {
  return (
    <>
      <form autoCapitalize='off' autoComplete='off' id='patient-credentials-form' >
        <div className='form-row'>
          <label>username
            <span className='text-danger'>*</span>
          </label>
          <input className='form-control' type='text' placeholder='Enter username here' required />
        </div>
        <div className='form-row'>
          <label>password
            <span className='text-danger'>*</span>
          </label>
          <input className='form-control' type='password' placeholder='Enter password here' required />
        </div>
        <div className='form-row'>
          <label>confirm password
            <span className='text-danger'>*</span>
          </label>
          <input className='form-control' type='password' placeholder='confirm password' required />
        </div>
        <div>
          <button className='mt-3 btn btn-primary'>update credentials</button>
        </div>
      </form>
    </>
  )
}
