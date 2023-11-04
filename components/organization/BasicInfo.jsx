import React, { useCallback, useEffect, useState } from 'react';
import { regions, organizationDefaultBasicInfo, validateFormData, handleResponse, customFetch, getDataAndUpdateState, customPost } from '../Auth/customFetch';
import { useRouter } from 'next/router';


export default function OrganizationBasic({ titleshow = true }) {
  const [data, setData] = useState(organizationDefaultBasicInfo);
  const [message, setMessage] = useState('Add new organization');
  const organizationid = useRouter().query.id;



  const handleChange = (e) => {
    const { name, value } = e.target;
    setData({ ...data, [name]: value });
  }

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!organizationid) { await validateFormData(data, false, ['name', 'location', 'street', 'address', 'region'], 'new/organizations', handleResponse); }
    else {
      const updateInfo = await customPost('organization/update/basic', 'PUT', data);
      alert(updateInfo?.message)
    }
  }

  const getOrganizationData = useCallback(() => {
    customFetch(`organization/basic?id=${organizationid}`)
      .then((response) => {
        const { statusCode, status, result } = response;
        (statusCode === 200 && status == 'success') && setData(result[0]);
      }).catch((err) => { setData(organizationDefaultBasicInfo); alert('error getting data;') })
  }, [organizationid])


  useEffect(() => {
    if (organizationid) {
      setMessage('update organization basic information');
      getOrganizationData();
    }
  }, [organizationid, getOrganizationData])




  return (
    <>
      {titleshow && (<div className='alert alert-primary mx-2 my-1'>{message}</div>)}
      <form className='mx-2 bg-white my-2 px-3 py-2 br-5 grid-50'>
        <div className='form-row'>
          <label>organization name</label>
          <input
            className='custom-input'
            type='text'
            placeholder='organization name'
            name='name'
            value={data.name}
            onChange={handleChange}
          />
        </div>

        <div className='form-row'>
          <label>location</label>
          <input
            className='custom-input'
            type='text'
            placeholder='location'
            name='location'
            value={data.location}
            onChange={handleChange}
          />
        </div>

        <div className='form-row'>
          <label>street name</label>
          <input
            className='custom-input'
            type='text'
            placeholder='street name'
            name='street'
            value={data.street}
            onChange={handleChange}
          />
        </div>

        <div className='form-row'>
          <label>mobile number</label>
          <input
            className='custom-input'
            type='tel'
            inputMode='tel'
            placeholder='0595964565'
            name='mobile'
            value={data.mobile}
            onChange={handleChange}
          />
        </div>
        <div className='form-row'>
          <label>address</label>
          <input
            className='custom-input'
            type='text'
            placeholder='kalpohin lowcost 30A'
            name='address'
            value={data.address}
            onChange={handleChange}
          />
        </div>
        <div className='form-row'>
          <label>Email address</label>
          <input
            className='custom-input'
            type='email'
            placeholder='mylab@ymail.com'
            name='email'
            value={data.email}
            onChange={handleChange}
          />
        </div>

        <div className='form-row'>
          <label>website</label>
          <input
            className='custom-input'
            type='text'
            placeholder='mylab.com'
            name='website'
            value={data.website}
            onChange={handleChange}
          />
        </div>

        <div className='form-row'>
          <label>Gps Address</label>
          <input
            className='custom-input'
            type='text'
            placeholder='NS-1004-383'
            name='gpsmapping'
            value={data.gpsmapping}
            onChange={handleChange}
          />
        </div>

        <div className='form-row'>
          <label>region</label>
          <select
            className='custom-input'
            name='region'
            value={data.region}
            onChange={handleChange}
          >
            <option>select a region</option>
            {regions.map((item, index) => {
              return (<option key={index} value={item}>{item}</option>)
            })}
          </select>
        </div>
      </form>
      <button
        type='button'
        className='mt-3 btn btn-primary mx-4'
        onClick={handleSubmit}
      >
        save organization
      </button>
    </>
  )
}
