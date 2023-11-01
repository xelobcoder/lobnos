import React, { useContext, useState } from 'react';
import { regions, organizationDefaultBasicInfo, validateFormData } from '../Auth/customFetch';
import { OrgContext } from './OrganizationWrapperLayout';

export default function OrganizationBasic() {
  const [data, setData] = useState(organizationDefaultBasicInfo);
  const {userContext,setContext} = useContext(OrgContext);
  console.log(userContext)

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData({ ...data, [name]: value });
  }

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    await validateFormData(data, true, [], 'new/organizations', (response) => {
      console.log(response);
    });
  }

  return (
    <>
      <form className='mx-2 bg-white my-2 px-3 py-2 br-5'>
        <div className='form-row'>
          <label>organization name</label>
          <input
            className='form-control'
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
            className='form-control'
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
            className='form-control'
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
            className='form-control'
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
            className='form-control'
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
            className='form-control'
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
            className='form-control'
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
            className='form-control'
            type='text'
            placeholder='NS-1004-383'
            name='gpsMapping'
            value={data.gpsMapping}
            onChange={handleChange}
          />
        </div>

        <div className='form-row'>
          <label>region</label>
          <select
            className='form-control'
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

        <div className='form-row'>
          <button
            type='button'
            className='mt-3 btn btn-primary'
            onClick={handleSubmit}
          >
            save organization
          </button>
        </div>
      </form>
    </>
  )
}
