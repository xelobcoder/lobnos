import SidebarFrontPage from "../../components/frontpagesidebar";
import { useEffect, useState } from "react";
import { Tab, Tabs } from 'react-bootstrap';
import { patientRegistrationDefaultData } from "../../components/Auth/registerclient";
import Addressing from "../../components/registration/Addressing";
import PersonalInfomationRegistration from "../../components/registration/PersonalInfomationRegistration";
import EmmergencyContactInformation from "../../components/registration/EmmergencyContactInformation";
import SettingsLayout from "../../components/settingsComponents/SettingsLayout";
import { getRegistrationFields } from "../../components/registration/fields/Util";
import { ToastContainer, toast } from 'react-toastify';



export default function Registration() {
  const { personalInformation, emmergencyInformation, addressingInformation } = patientRegistrationDefaultData;
  const [fields, setFields] = useState([]);



  useEffect(() => {
    getRegistrationFields(setFields);
  }, [])





  return (
    <>
      <SettingsLayout sidebar={<SidebarFrontPage />}>
        <ToastContainer />
        <Tabs>
          <Tab eventKey='basic' title='Basic information' >
            <div className="border bg-white p-1 mb-2">
              <PersonalInfomationRegistration fields={fields.length > 0 ? fields[0]['fields'] : {}} toast={toast}
                defaultData={personalInformation} />
            </div>
          </Tab>
          <Tab eventKey='addressing' title='Address information'>
            <div className="border bg-white p-1 mb-2">
              <Addressing fields={fields.length > 0 ? fields[1]['fields'] : {}} defaultData={addressingInformation} toast={toast} />
            </div>
          </Tab>
          <Tab eventKey='emmergency' title='Emmergency contact information'>
            <div className="border bg-white p-1 mb-2" >
              <EmmergencyContactInformation fields={fields.length > 0 ? fields[2]['fields'] : {}} defaultData={emmergencyInformation} toast={toast} />
            </div>
          </Tab>
        </Tabs>
      </SettingsLayout>
    </>
  );
}

