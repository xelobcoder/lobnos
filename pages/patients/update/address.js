import React from 'react'
import PatientRecordsLayout from '../../../components/petientsComponent/PatientRecordsLayout'
import Addressing from '../../../components/registration/Addressing'
import { patientRegistrationDefaultData } from '../../../components/Auth/registerclient'
import { Update } from '@mui/icons-material'

export default function AddressPatientUpdateRecord() {
  return (
    <>
      <PatientRecordsLayout>
        <div className='m-3'>
          <h4 className='text-capitalize'>
            <Update color='info' /> {" "}
            Update patient addressing information
          </h4>
        </div>
        <Addressing data={patientRegistrationDefaultData} card={false} />
      </PatientRecordsLayout>
    </>
  )
}
