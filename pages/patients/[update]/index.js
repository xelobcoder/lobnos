import React, { useState, useEffect } from 'react'
import PersonalInformationRegistration from '../../../components/registration/PersonalInfomationRegistration'
import { patientRegistrationDefaultData ,submitFormData} from '../../../components/Auth/registerclient';
import { Info } from '@mui/icons-material';
import PatientRecordsLayout from '../../../components/petientsComponent/PatientRecordsLayout';
import { useRouter } from 'next/router';
import { customFetch, customPost } from '../../../components/Auth/customFetch';

export default function Update() {
  const [personalInformation, setPersonalInformation] = useState(patientRegistrationDefaultData);
  const [error, setError] = useState('');
  const patientid = useRouter().query.update;

  const getResponse = async function () {
    const response = await customFetch(`register/personalinformation?patientid=${patientid}`);
    const { statusCode, status, result } = response;
    if (statusCode == 200 && status == 'success') {
      setPersonalInformation({ ...personalInformation,personalInformation: result });
    }
  }
  useEffect(() => {
    try {
      getResponse();
    } catch (err) {
      console.log(err)
    }
  }, [patientid])


 


  return (
    <>
      <PatientRecordsLayout>
        <div className='container'>
          <h4 className='p-2 text-capitalize'>
            <Info color='info' /> {" "}
            Update client personal information</h4>
          {
            error &&
            <div className='p-2 col-12'>
              <span style={{ marginLeft: '20px' }} className='alert alert-danger col-8'>
                {error}
              </span>
            </div>
          }
          <PersonalInformationRegistration card={false} setError={setError} setData={setPersonalInformation}
            data={personalInformation} />
          <div className='m-3'>
            <button className='btn btn-primary' onClick={(ev) => { submitFormData(`register/personalinformation?patientid=${patientid}`,personalInformation.personalInformation) }}>update information</button>
          </div>
        </div>
      </PatientRecordsLayout>
    </>
  )
}
