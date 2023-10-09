import React, { useState, useEffect } from 'react'
import { customPost, getInstitutionUsers, handleChangeWithState } from '../Auth/customFetch'

export default function AddBranchComponent({ data, update, target }) {
  const [employees, setEmployees] = useState([]);
  // get emeployess
  useEffect(() => { getInstitutionUsers(setEmployees) }, []);

  const handleSubmit = async function () {
    let response = await customPost('branches', target === 'POST' ? 'POST' : 'PUT', data);
    const { status, message, statusCode } = response;
    alert(message);
  }

  return (
    <div>
      <div className='container mt-3'>
        <form>
          <div className='form-row'>
            <label className='text-primary'>branch name</label>
            <input type='text' onChange={(ev) => handleChangeWithState(ev, 'name', update, data)} value={data?.name} className='custom-input' required placeholder='eg. Buipe Branch' />
          </div>


          {/* tel */}
          <div className='form-row'>
            <label className='text-primary'>contact</label>
            <input multiple type='tel' onChange={(ev) => handleChangeWithState(ev, 'contact', update, data)} value={data?.contact} className='custom-input' required placeholder='eg.02400000000' maxLength={10} minLength={10} />
          </div>


          <div className='form-row'>
            <label className='text-primary'>Email</label>
            <input type='email' onChange={(ev) => handleChangeWithState(ev, 'email', update, data)} className='custom-input' value={data?.email} required placeholder='eg.tiifuofficial@gmail.com' />
          </div>


          {/* address */}
          <div className='form-row'>
            <label className='text-primary'>Address</label>
            <textarea rows={5} className='form-control' onChange={(ev) => handleChangeWithState(ev, 'address', update, data)} value={data?.address} placeholder='eg. Tamale Kalpohin Lowcost 30A opposite Jolly Friends Bar' />
          </div>


          <div className='form-row'>
            <label className='text-primary' >Branch Manager</label>
            <select className='form-control' onChange={(ev) => handleChangeWithState(ev, 'managerid', update, data)} value={data?.managerid}>
              <option>select Branch Manager</option>
              {employees.map((item, index) => { return (<option key={index} value={item?.EMPLOYEEID} >{item?.USERNAME}</option>) })}
            </select>
          </div>


          <div className='form-row mt-2'>
            <button type='button' className='btn btn-primary' onClick={(ev) => handleSubmit(ev)}>save information </button>
          </div>

        </form>
      </div>
    </div>
  )
}
