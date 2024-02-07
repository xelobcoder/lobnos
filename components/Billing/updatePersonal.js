import React, { useState } from 'react';

export default function UpdatePersonal({ clientDetails }) {
  const { firstname, middlename, lastname, dob, agetype, mobile_number, email, gender, age, patientid } = clientDetails;
  return (
    <>
      {(clientDetails && Object.keys(clientDetails).length > 0) && (
        <div>
          <div className='card my-2'>
            <div className='card-header d-flex justify-content-between bg-secondary text-white'>
              <h5 >Personal information</h5>
            </div>
            <div className='card-body m-0 px-3' style={{ display: 'grid', gridTemplateColumns: "30% auto", gridGap: '0px' }}>
              <div className='m-0 p-0'>
                <svg xmlns="http://www.w3.org/2000/svg" width="70" height="70" fill="currentColor" className="bi bi-person-fill" viewBox="0 0 16 16">
                  <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6" />
                </svg>
                <h6 className="text-capitalize lims-text-color">
                  {firstname} {middlename} {lastname}
                </h6>
                <h6>{patientid}</h6>
              </div>
              <div className="grid-50 p-0">
                <div className='d-flex'>
                  <p>DOB:</p>
                  <p>{new Date(dob).toLocaleDateString()}</p>
                </div>
                <div className='d-flex'>
                  <p>Gender:</p>
                  <p>{gender}</p>
                </div>
                {/* age */}
                <div className='d-flex'>
                  <p>Age:</p>
                  <p>
                    {age} {agetype}
                  </p>
                </div>
                {/* phone */}
                <div className='d-flex'>
                  <p>Phone:</p>
                  <p>{mobile_number}</p>
                </div>
                {/* email */}
                <div className='d-flex'>
                  <p>Email:</p>
                  <p>{email}</p>
                </div>
              </div>
            </div>
            <div >
            </div>
          </div>
        </div>
      )}
    </>
  )
}
