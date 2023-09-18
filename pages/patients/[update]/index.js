import React from 'react'
import PersonalInformationRegistration from '../../../components/registration/PersonalInfomationRegistration'
import { patientRegistrationDefaultData } from '../../../components/Auth/registerclient';
import { Info } from '@mui/icons-material';
import PatientRecordsLayout from '../../../components/petientsComponent/PatientRecordsLayout';
import { useRouter } from 'next/router';

export default function Update() {

  return (
    <>
      <PatientRecordsLayout>
        <h4 className='m-3 text-capitalize'>
          <Info color='info' /> {" "}
          Update client personal information</h4>
        <PersonalInformationRegistration card={false} data={patientRegistrationDefaultData} />
        <div className='m-3'>
          <button className='btn btn-primary'>update information</button>
        </div>
      </PatientRecordsLayout>
    </>
  )
}
