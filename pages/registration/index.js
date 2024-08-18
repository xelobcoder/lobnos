import { useEffect, useState } from "react";
import { patientRegistrationDefaultData } from "../../components/Auth/registerclient";
import PersonalInfomationRegistration from "../../components/registration/PersonalInfomationRegistration";
import { getRegistrationFields } from "../../components/registration/fields/Util";
import { ToastContainer, toast } from 'react-toastify';
import { Settings } from "@mui/icons-material";
import { Form } from 'react-bootstrap';
import { useRouter } from "next/navigation";
import FrontDeskLayout from "../../components/Layout/FrontDeskLayout";
import Loader from '../../components/accessories/Loader';


export default function Registration() {
  const { personalInformation } = patientRegistrationDefaultData;
  const [fields, setFields] = useState();
  const [expanded, setExpaned] = useState(true);
  const [isloading, setLoading] = useState(true);
  const router = useRouter();


  const getFields = async () => {
    try {
      setLoading(true);
      await getRegistrationFields(setFields);
      setLoading(false);
    } catch (err) {
      setLoading(false);
   }
  } 

  useEffect(() => {
    getFields();
  }, [])




  const renderingView = () => {
    if (isloading) return <Loader />
    else {
      return (<div className="border bg-white p-1 mb-2">
        <PersonalInfomationRegistration 
          expanded={expanded} 
          fields={fields.length > 0 ? fields[0]['fields'] : {}}
          toast={toast}
          defaultData={personalInformation} />
      </div>)
    }
  }


  return (
    <FrontDeskLayout>
      <ToastContainer theme="colored" className="text-sm" position="top-center" />
        <div className="d-flex justify-content-between">
          <h5 className="fw-bold mt-2">Patient Registration</h5>
          <div className="d-flex justify-content-between">
            <Form.Switch value={expanded} type='switch' style={{ fontSize: '25px' }} onClick={(ev) => setExpaned(ev.target.checked)} />
            <button onClick={(ev) => { router.push('/registration/settings') }} className="btn btn-secondary mb-1">
              <Settings />
          </button>
        </div>
      </div>
      {renderingView()}
    </FrontDeskLayout>
  );
}

 