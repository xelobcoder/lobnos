import { useState, useEffect } from 'react'
import PersonalInformationRegistration from '../../../components/registration/PersonalInfomationRegistration'
import { patientRegistrationDefaultData } from '../../../components/Auth/registerclient';
import PatientRecordsLayout from '../../../components/petientsComponent/PatientRecordsLayout';
import { getDataAndUpdateState } from '../../../components/Auth/customFetch';
import { useSearchParams } from 'next/navigation';
import { ToastContainer, toast } from 'react-toastify';
import Loader from '../../../components/accessories/Loader';
import { Tabs, Tab } from 'react-bootstrap'
import { getRegistrationFields } from '../../../components/registration/fields/Util';
import Addressing from '../../../components/registration/Addressing';
import EmmergencyContactInformation from '../../../components/registration/EmmergencyContactInformation';
import PatientCredentialsInformation from '../../../components/registration/fields/credentials';
import Header from '../../../components/header';
import PatientResultSettings from '../../../components/petientsComponent/PatientResultSettings';

export default function Update() {
  const { personalInformation, addressingInformation, emmergencyInformation } = patientRegistrationDefaultData;
  const [data, setData] = useState(personalInformation);
  const [fields, setFields] = useState([]);
  const [isloading, setLoading] = useState(false);
  const patientid = useSearchParams().get("patientid");
  const [events, setEvents] = useState("personal")


  useEffect(() => {
    getRegistrationFields(setFields, toast);
    if (patientid != undefined) {
      getDataAndUpdateState(
        setData,
        `register/personalinformation?patientid=${patientid}`,
        false,
        setLoading
      );
    }
  }, [patientid])


  const rendering = () => {
    if (isloading) return <Loader />
    else {
      return (
        <div className='container'>
          <Tabs defaultActiveKey={events} onSelect={(key) => { setEvents(key) }}>
            <Tab eventKey={'personal'} title='Personal information'>
              <div className='bg-white br-5 p-2'>
                {events == "personal" && <PersonalInformationRegistration method='PUT'  defaultData={data} fields={fields.length > 0 ? fields[0]['fields'] : {}} toast={toast} />}
              </div>
            </Tab>
            <Tab eventKey={'addressing'} title='Addressing information'>
              <div className='bg-white br-5 p-2'>
                {events == "addressing" && < Addressing patientid={patientid} defaultData={addressingInformation} fields={fields.length > 0 ? fields[1]['fields'] : {}} toast={toast} />}
              </div>
            </Tab>
            <Tab eventKey={'emmergency'} title='Emmergency information'>
              <div className='bg-white br-5 p-2' >
                {events == "emmergency" && <EmmergencyContactInformation patientid={patientid} defaultData={emmergencyInformation} fields={fields.length > 0 ? fields[2]['fields'] : {}} toast={toast} />}
              </div>
            </Tab>
            <Tab eventKey={'credentials'} title='Credentials'>
              <div className='bg-white br-5 p-2' >
                {events == "credentials" && <PatientCredentialsInformation toast={toast} patientid={patientid} />}
              </div>
            </Tab>
            <Tab eventKey={'result'} title={'Result settings'}>
              <div className='bg-white br-5 p-2' >
                {events == "result" && <PatientResultSettings toast={toast}/>}
              </div>
            </Tab>
          </Tabs>
        </div>
      )
    }
  }

 


  return (
    <PatientRecordsLayout>
    <Header />
    <ToastContainer />
    {rendering()}
  </PatientRecordsLayout>
  )
}
