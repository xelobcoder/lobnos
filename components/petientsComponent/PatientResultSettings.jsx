import React from 'react'

export default function PatientResultSettings() {
  return (
    <>
      <form>
        <div className='form-row'>
          <label>mode of receiving result</label>
          <select className='form-control'>
            <option value='hardcopy'>hard copy</option>
            <option value='WhatApp'>whatApp</option>
            <option value='Email'>Email</option>
          </select>
        </div>
        <div className='form-row'>
          <button className='btn btn-primary mt-3'>
            update settings
          </button>
        </div>
      </form>
    </>
  )
}
