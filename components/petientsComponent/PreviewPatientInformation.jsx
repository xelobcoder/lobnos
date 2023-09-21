import React, { useEffect, useState } from 'react'
import { customFetch } from '../Auth/customFetch';
import { useContext } from 'react';
import { PatientContext } from '../../pages/patients';

export default function PreviewPatientInformation({ patientid }) {
  const [data, setData] = useState({});
  const { initials, updateInitials } = useContext(PatientContext)

  let getData = async function (patientid) {
    let response = await customFetch(`register/personalinformation?patientid=${patientid}`);
    const { status, statusCode, result } = response;
    if (statusCode == 200 && status == 'success') {
      setData(result);
    }
  }

  console.log(data)

  useEffect(() => {
    if (initials.runquery) { getData(patientid) }
  }, [initials.runquery, patientid])
  return (
    <>
      <div className='card br-5 mb-2 mt-2'>
        <div className='card-header '>
          Patient information summary
        </div>
        <div className='card-body' style={{display:'grid',gridTemplateColumns:'auto auto',gridGap:'10px,20%'}}>
          <ul className='d-flex justify-content'>
            <li className='text-capitalize '>fullname: </li>
            <li className='text-capitalize text-primary'> {data?.firstname} {data?.middlename} {data?.lastname}</li>
          </ul>
          <ul className='d-flex'>
            <li className='text-capitalize'>Email:</li>
            <li className='text-capitalize text-primary'>{data?.email}</li>
          </ul>
          <ul className='d-flex'>
            <li className='text-capitalize'>date of birth: </li>
            <li className='text-capitalize text-primary'>{data?.dob}</li>
          </ul>
          <ul className='d-flex'>
            <li className='text-capitalize'>age: </li>
            <li className='text-capitalize text-primary'>{data?.age} {data?.agetype}</li>
          </ul>
          <ul className='d-flex'>
            <li className='text-capitalize'>mobile number: </li>
            <li className='text-capitalize text-primary'>0{data?.mobile}</li>
          </ul>
          <ul className='d-flex'>
            <li className='text-capitalize'>gender:</li>
            <li className='text-capitalize text-primary'>{data?.gender}</li>
          </ul>
          <ul className='d-flex'>
            <li className='text-capitalize'>marital status:</li>
            <li className='text-capitalize text-primary'>{data?.maritalstatus}</li>
          </ul>
          <ul className='d-flex'>
            <li className='text-capitalize'>Registration Date:</li>
            <li className='text-capitalize text-primary'>{data?.date}</li>
          </ul>
        </div>
      </div>
    </>
  )
}
