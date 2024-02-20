import SidebarFrontPage from "../../components/frontpagesidebar";
import { useEffect, useState } from "react";
import { patientRegistrationDefaultData } from "../../components/Auth/registerclient";
import PersonalInfomationRegistration from "../../components/registration/PersonalInfomationRegistration";
import SettingsLayout from "../../components/settingsComponents/SettingsLayout";
import { getRegistrationFields } from "../../components/registration/fields/Util";
import { ToastContainer, toast } from 'react-toastify';
import { Settings } from "@mui/icons-material";
import { Form } from 'react-bootstrap';
import { useRouter } from "next/navigation";


export default function Registration() {
  const { personalInformation } = patientRegistrationDefaultData;
  const [fields, setFields] = useState([]);
  const [expanded, setExpaned] = useState(false);
  const router = useRouter();



  useEffect(() => {
    getRegistrationFields(setFields);
  }, [])





  return (
    <>
      <SettingsLayout sidebar={<SidebarFrontPage />}>
        <ToastContainer />
        <div className="d-flex justify-content-between">
          <h5 className="fw-bold mt-2">Patient Registration</h5>
          <div className="d-flex justify-content-between">
            <Form.Switch value={expanded} type='switch' style={{ fontSize: '25px' }} onClick={(ev) => setExpaned(ev.target.checked)} />
            <button onClick={(ev) => { router.push('/registration/settings') }} className="btn btn-secondary mb-1">
              <Settings />
            </button>
          </div>
        </div>
        <div className="border bg-white p-1 mb-2">
          <PersonalInfomationRegistration expanded={expanded} fields={fields.length > 0 ? fields[0]['fields'] : {}} toast={toast}
            defaultData={personalInformation} />
        </div>
      </SettingsLayout>
    </>
  );
}

 