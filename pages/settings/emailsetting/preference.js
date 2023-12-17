import React, { useState, useEffect } from 'react'
import EmailSidebarJSX from '../../../components/settingsComponents/EmailSidebar';
import { customFetch, customPost, emailPreference, handleResponse } from '../../../components/Auth/customFetch';
import { Form,Switch } from 'react-bootstrap';
import MainSettingsLayoutView from '../../../components/settingsComponents/MainSettingsLayoutView';
import { ToastContainer, toast } from 'react-toastify';
import ISLOADING from "../../../components/isLoading";

export default function EmailPreference() {
  const [preference, setPreference] = useState(emailPreference);
  const [loading, setLoading] = useState(true);

  const handleSubmit = async (ev) => {
    const pushPreference = await customPost('applicationssettings/emailpreference', 'POST', preference);
    handleResponse(pushPreference,toast)
  }


  async function getPreference() {
    try {
      const response = await customFetch('applicationssettings/emailpreference');
      const { statusCode, status, message, result } = response;
      if (statusCode === 200 && status === 'success' && result) {
        if (Object.keys(result).length > 0) {
          setPreference(result);
        }
      }
      setLoading(false);
    } catch (err) {
      setLoading(false);
      toast.error(err.message ||"something went wrong");
    }
  }


  const handleChangeWithState = (value, key) => {
    setPreference({ ...preference, [key]: value ? 'Yes' : 'No' });
  };

  useEffect(() => { getPreference() }, []);


  return (
    <>
      <MainSettingsLayoutView sidebar={<EmailSidebarJSX />}>
        <ToastContainer/>
        {loading ?
          <ISLOADING />
          :
          (
                <Form className='container br-5'>
          <h5 className='text-capitalize mt-2'>update email preferences</h5>
<div className='alert alert-info'> Send email  notification when the following events occur. toggle to activate or deactivate</div>
              <div className='list-group'>
              {Object.keys(preference).map((key) => (
               <div key={key} className='list-group-item d-flex justify-content-between p-3'>
                  <span className='fw-light text-md-start'>{` ${key.replace(/^\w/, c => c.toUpperCase())}`}</span>
                  <Switch
                    onChange={(ev) => handleChangeWithState(ev.target.checked, key)}
                    checked={preference[key] === 'Yes' }
                    className='float-end'
              />
            </div>
          ))}
        </div>

          <button type='button' className='btn btn-primary mt-2 btn-sm mx-1' onClick={handleSubmit}>
            update preference
          </button>
        </Form>
        )}
      </MainSettingsLayoutView>
    </>
  )
}
