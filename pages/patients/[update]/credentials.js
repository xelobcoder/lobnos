import React, { useState } from 'react'
import PatientRecordsLayout from '../../../components/petientsComponent/PatientRecordsLayout'
import PatientCredentialsUpdate from '../../../components/petientsComponent/PatientCredentialsUpdate'

export default function PatientCredentialsInformation() {
  const [credentials, setCredentials] = useState({ username: '', npassword: '', nppassword: '', opassword: '' })
  const [error, setError] = useState('')
  console.log(credentials)

  const handleSubmit = function () {
    let errorCount = 0;
    const { nppassword, npassword } = credentials;
    if (nppassword !== npassword) {
      setError('New Password mismatch');
      errorCount++;
    }

    if (Object.values(credentials).includes('')) {
      setError('All fields are required');
      errorCount++;
    }

    if (errorCount == 0) {
      setError('')
    }
  }
  return (
    <>
      <PatientRecordsLayout>
        <h3> {" "}Add credentials</h3>
        {error != '' &&
          <div>
            <span className='bg-danger p-2 text-white rounded'>
              {error}
            </span>
          </div>}
        <PatientCredentialsUpdate data={credentials} setData={setCredentials} />
        <div>
          <button type='button' onClick={(ev) => { handleSubmit() }} className='mt-3 btn btn-primary'>update credentials</button>
        </div>
      </PatientRecordsLayout>
    </>
  )
}
