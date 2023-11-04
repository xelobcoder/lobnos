import React, { useState } from 'react'
import { useCallback } from 'react';
import { customFetch, customPost } from '../Auth/customFetch';
import { useEffect } from 'react';


export default function ContactPerson({ organizationid }) {
  const defaultData = { name: '', email: '', mobile: '' };
  const [data, setData] = useState(defaultData);

  const contactDetails = useCallback(async () => {
    const response = await customFetch(`organization/contactperson?id=${organizationid}`);
    const { status, statusCode, result } = response;
    if (statusCode == 200 && status == 'success' && result.length > 0) {
      setData(result[0])
    }
  }, [organizationid])

  const handleChange = (event, target) => {
    const { value } = event.target;
    setData({ ...data, [target]: value });
  }

  useEffect(() => {
    contactDetails()
  }, [organizationid, contactDetails]);


  const handleSubmit = async function () {
    let postResponse = await customPost(`organization/update/contact`, 'PUT', data);
    const { statusCode, status, message } = postResponse;
    (statusCode === 200 & status == 'success') && alert(message);
  }


  return (
    <>
      <form className='p-2' >
        <div className='alert alert-primary'>update contact person</div>
        <div id='registration' className='p-3'>
          <div className='form-row'>
            <label>contact person</label>
            <input
              className='form-control'
              value={data.name}
              onChange={(event) => handleChange(event, 'name')}

            />
          </div>
          <div className='form-row'>
            <label>email </label>
            <input
              label="Contact Person Email"
              className='form-control'
              value={data.email}
              onChange={(event) => handleChange(event, 'email')}

            />
          </div>
          <div>
            <label>mobile number</label>
            <input
              label="Contact Phone Number"
              className='form-control'
              value={data.mobile}
              onChange={(event) => handleChange(event, 'mobile')}

            />
          </div>
          <div className='form-row mt-3'>
            <button type='button' className='btn btn-primary' onClick={(ev) => { handleSubmit() }}>
              save changes
            </button>
          </div>
        </div>
      </form>
    </>
  )
}
