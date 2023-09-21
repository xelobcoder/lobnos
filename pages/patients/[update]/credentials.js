import React, { useContext, useState } from 'react'
import PatientRecordsLayout from '../../../components/petientsComponent/PatientRecordsLayout'
import PatientCredentialsUpdate from '../../../components/petientsComponent/PatientCredentialsUpdate';
import PatientProvider from '../index';
import { useRouter } from 'next/router';
import { customPost } from '../../../components/Auth/customFetch';

export default function PatientCredentialsInformation() {
  const patientid = useRouter().query.update;

  const [credentials, setCredentials] = useState({ username: parseInt(patientid), npassword: '', nppassword: '', opassword: '' })
  const [error, setError] = useState('')

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
      setError('');
      customPost('patients/updatecredentials', 'POST', credentials)
        .then((response) => {
          const { statusCode, status, message } = response;
          // alert(message)
          if (statusCode == 404) { setError(message)}
        })
        .catch((err) => console.log(err))
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
