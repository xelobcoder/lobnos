import React, { useState ,useEffect} from 'react'
import { customFetch, customPost, defaultSmsSettings, handleResponse } from '../../components/Auth/customFetch';
import SmsUpdateComponent from '../../components/settingsComponents/smsUpdateComponent'
import MainSettingsLayoutView from '../../components/settingsComponents/MainSettingsLayoutView';


export default function SMS_SETTINGS() {
  const [data, setData] = useState(defaultSmsSettings);

  const handleSubmit = async function () {
    const push = await customPost('applicationsettings/smsupdate', 'PUT', data);
    handleResponse(push)
  }

  const sms = async function () {
    try {
      const data = await customFetch(`applicationsettings/smsupdate`)
      setData(data)
    } catch (err) {
      console.log(err)
    }
  }

  useEffect(() => {
    sms();
  }, [])



  return (
    <MainSettingsLayoutView>
      <SmsUpdateComponent handleSubmit={handleSubmit} data={data} setData={setData} />
    </MainSettingsLayoutView>
  )
}
