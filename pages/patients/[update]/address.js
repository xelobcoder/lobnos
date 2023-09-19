import React, { useEffect, useState } from 'react'
import PatientRecordsLayout from '../../../components/petientsComponent/PatientRecordsLayout'
import Addressing from '../../../components/registration/Addressing'
import { patientRegistrationDefaultData, submitFormData } from '../../../components/Auth/registerclient'
import { Update } from '@mui/icons-material'
import { useRouter } from 'next/router'
import { customPost, customFetch } from '../../../components/Auth/customFetch'

export default function AddressPatientUpdateRecord() {
  const [data, setData] = useState(patientRegistrationDefaultData)
  const patientid = useRouter().query.update;

  const getResponse = async function () {
    const response = await customFetch(`register/addressingformation?patientid=${patientid}`);
    const { statusCode, status, result } = response;
    if (statusCode == 200 && status == 'success') {
      setData({...data, addressingInformation: result });
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
        <div className='m-2'>
          <h4 className='text-capitalize'>
            <Update color='info' /> {" "}
            Update patient addressing information
          </h4>
        </div>
        <Addressing data={data} card={false}  setData={setData}/>
        <div style={{ marginLeft: '20px' }}>
          <button className='btn btn-primary' type='button' onClick={(ev) => { submitFormData(`register/addressinginformation?patientid=${patientid}`, data.addressingInformation) }}>
            update addressing information
          </button>
        </div>
      </PatientRecordsLayout>
    </>
  )
}
