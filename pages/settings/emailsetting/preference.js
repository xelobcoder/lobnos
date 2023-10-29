import React, { useState, useEffect } from 'react'
import EmailSidebarJSX from '../../../components/settingsComponents/EmailSidebar';
import { customFetch, customPost, emailPreference, handleChangeWithState, handleResponse } from '../../../components/Auth/customFetch';
import MainSettingsLayoutView from '../../../components/settingsComponents/MainSettingsLayoutView';

export default function EmailPreference() {
  const [preference, setPreference] = useState(emailPreference);

  const handleSubmit = async (ev) => {
    const pushPreference = await customPost('applicationssettings/emailpreference', 'POST', preference);
    handleResponse(pushPreference)
  }


  async function getPreference() {
    console.log(preference)
    const response = await customFetch('applicationssettings/emailpreference');
    if (response.length > 0) { setPreference(response[0]) }
  }

  useEffect(() => { getPreference() }, []);

  return (
    <>
      <MainSettingsLayoutView sidebar={<EmailSidebarJSX />}>
        <form className='container  br-5'>
          <h2 className='text-capitalize mt-2'>update preference</h2>
          <p className='alert alert-warning mt-2'>
            update when email will sent. This will be the general settings of the client.
            However this can be disabled for a patient at the patient portal by the patient or at the  adminstrative level
          </p>
          <div className='form-row br-5 pt-2 border-bottom pointer'>
            <label className='text-primary'>Send Email when registration is done</label>
            <br />
            <input onChange={(ev) => handleChangeWithState(ev, 'registration', setPreference, preference)} type='radio' name='registration' value={'Yes'} /> Yes <br />
            <input onChange={(ev) => handleChangeWithState(ev, 'registration', setPreference, preference)} type='radio' name='registration' value='No' /> No <br />
          </div>
          <div className='form-row br-5 pt-2 border-bottom pointer'>
            <label className='text-primary'>Send Email when result is done</label>
            <br />
            <input onChange={(ev) => handleChangeWithState(ev, 'result', setPreference, preference)} type='radio' name='result' value='Yes' /> Yes <br />
            <input onChange={(ev) => handleChangeWithState(ev, 'result', setPreference, preference)} type='radio' name='result' value='No' /> No <br />
          </div>
          <div className='form-row br-5 pt-2 border-bottom pointer'>
            <label className='text-primary'>Send Email when sample is rejected</label>
            <br />
            <input type='radio' onChange={(ev) => handleChangeWithState(ev, 'rejection', setPreference, preference)} name='rejection' value='Yes' /> Yes <br />
            <input type='radio' onChange={(ev) => handleChangeWithState(ev, 'rejection', setPreference, preference)} name='rejection' value='No' /> No <br />
          </div>
          <div className='form-row br-5 pt-2 border-bottom pointer'>
            <label className='text-primary'>Send Email when result is approved</label>
            <br />
            <input type='radio' onChange={(ev) => handleChangeWithState(ev, 'approval', setPreference, preference)} name='approval' value='Yes' /> Yes <br />
            <input type='radio' onChange={(ev) => handleChangeWithState(ev, 'approval', setPreference, preference)} name='approval' value='No' /> No <br />
          </div>
          <div className='form-row br-5 pt-2 border-bottom pointer'>
            <label className='text-primary'>Send invoice of transactions</label>
            <br />
            <input type='radio' onChange={(ev) => handleChangeWithState(ev, 'transactions', setPreference, preference)} name='transactions' value='Yes' /> Yes <br />
            <input type='radio' onChange={(ev) => handleChangeWithState(ev, 'transactions', setPreference, preference)} name='transactions' value='No' /> No <br />
          </div>
          <div className='form-row br-5 pt-2 border-bottom pointer'>
            <label className='text-primary'>Send message on birthday of clients </label>
            <br />
            <input type='radio' onChange={(ev) => handleChangeWithState(ev, 'birthday', setPreference, preference)} name='birthday' value='Yes' /> Yes <br />
            <input type='radio' onChange={(ev) => handleChangeWithState(ev, 'birthday', setPreference, preference)} name='birthday' value='No' /> No <br />
          </div>
          <button type='button' className='btn btn-primary mt-2' onClick={(ev) => { handleSubmit(ev) }}>
            update preference
          </button>
        </form>
      </MainSettingsLayoutView>
    </>
  )
}
