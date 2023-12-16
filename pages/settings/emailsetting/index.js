import { useCallback, useEffect, useState } from 'react'
import EmailSidebarJSX from '../../../components/settingsComponents/EmailSidebar'
import MainSettingsLayoutView from '../../../components/settingsComponents/MainSettingsLayoutView'
import { ToastContainer, toast } from 'react-toastify'
import ISLOADING from '../../../components/isLoading';
import { customFetch, customPost } from '../../../components/Auth/customFetch';
export default function ApplicationEmailSettings() {
  const [loading, setLoading] = useState(true);
  const defaultSettings = {
    provider: "",
    email: "",
    apppassword: "",
    verificationSubject: "",
    readySubject: "",
   sampleSubject:""
  }
  const [settings, setSettings] = useState(defaultSettings);

  const updateSettings = async (ev) => { 
    if (Object.values(settings).includes('')) {
      toast.error('please fill all the fields')
      return
    }
    const pushRequest = await customPost(`applicationssettings/email/emailsettings`, 'PUT', settings);
     
    const { statusCode, status, message } = pushRequest;
    if (statusCode === 200 && status === 'success') {
      toast.success(message);
      return
    }
    
    if (statusCode === 400 && status === 'error') {
      toast.error(message)
      return
    }
  }



  const getGeneralSettings = useCallback(async () => {
    try {
      const response = await customFetch(`applicationssettings/email/emailsettings`);
    const { statusCode, status, message, result } = response;
    if (statusCode === 200 && status === 'success' && result.length > 0) {
      setSettings(result[0]);
    }
    setLoading(false);
    } catch (err) {
      toast.error("something went wrong", { autoClose: 5000 });
      setLoading(false);
   }
  }, []);

  useEffect(() => { 
    getGeneralSettings();
  }, [getGeneralSettings])

  return (
    <MainSettingsLayoutView sidebar={<EmailSidebarJSX />} >
      <ToastContainer/>
      {loading && <ISLOADING/>}
      {!loading && (
        <div className='my-2 mx-2' >
        <h5>Update Email Settings</h5>
        <div className='alert-info alert py-2'>
          All this information are vital for sending email notifications to clients.  All the information are encrypted and stored for security purposes.
        </div>
        <form >
          <div className='my-2 mx-1'>
            <label>Service Provider</label>
            <input type='text' className='custom-input' value={settings.provider} onChange={(ev) => { setSettings({ ...settings, provider: ev.target.value }) }} required placeholder='eg: gmail,github,yahoo,mailtrap etc' />
          </div>
          <div className='my-2 mx-1'>
            <label>Application email</label>
            <input type='email' className='custom-input' value={settings.email} onChange={(ev) => { setSettings({ ...settings,email: ev.target.value }) }} required placeholder='yourapp@example.com' />
          </div>
          <div className='my-2 mx-1'>
            <label>Application password</label>
            <input type='apppassword' className='custom-input' value={settings.apppassword}
              onChange={(ev) => { setSettings({ ...settings, apppassword: ev.target.value }) }}
              required placeholder='your-email-apppassword' />
          </div>
          <div className='my-2 mx-1'>
            <label>Email verification Subject <span className='text-danger'>(please keep it brief as possible)</span></label>
            <textarea rows={2} className='form-control' value={ settings.verificationSubject} onChange={(ev) => { setSettings({ ...settings, verificationSubject: ev.target.value }) }} required />
          </div>
          <div className='my-2 mx-1'>
            <label>result ready and approved Subject <span className='text-danger'>(please keep it brief as possible)</span></label>
            <textarea rows={2} className='form-control' value={settings.readySubject} onChange={(ev) => { setSettings({ ...settings, readySubject: ev.target.value }) }} required />
          </div>
          <div className='my-2 mx-1'>
            <label> sample rejection subject <span className='text-danger'>(please keep it brief as possible)</span></label>
            <textarea rows={2}  className='form-control' value={settings.sampleSubject} onChange={(ev) => { setSettings({ ...settings,sampleSubject: ev.target.value }) }} required />
          </div>
          <div className='my-2 mx-1'>
            <button type='button' onClick={updateSettings} className='btn btn-primary btn-sm'>update information</button>
          </div>
        </form>
      </div>
)}
    </MainSettingsLayoutView>
  )
}
