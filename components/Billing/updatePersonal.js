import React from 'react';
import { ClientContextConsumer } from './cxtProvider';

export default function UpdatePersonal({ handleview }) {
  return (
    <>
      <ClientContextConsumer>
        {
          clientDetails => {
            return (
              <>
                <div>
                  {clientDetails.length > 0 && (
                    <div className='card my-2'>
                      <div className='card-header d-flex justify-content-between'>
                        <h4 >Personal information</h4>
                        <div className="billing-other-side">
                          <button className='btn btn-sm btn-outline-primary' onClick={() => handleview()}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-plus-lg" viewBox="0 0 16 16">
                              <path fillRule="evenodd" d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2" />
                            </svg>
                            Update Test
                          </button >
                        </div>
                      </div>
                      <div className='card-body m-0 px-3' style={{ display: 'grid', gridTemplateColumns: "20% auto"}}>
                        <div className='m-0 p-0'>
                          <svg xmlns="http://www.w3.org/2000/svg" width="70" height="70" fill="currentColor" className="bi bi-person-fill" viewBox="0 0 16 16">
                            <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6" />
                          </svg>
                          <h6 className="text-capitalize lims-text-color">
                            {clientDetails[0]["FIRSTNAME"]} {clientDetails[0]["MIDDLENAME"]} {clientDetails[0]["LASTNAME"]}
                          </h6>
                          <h6>{clientDetails[0]["patientid"]}</h6>
                        </div>
                        <div className="d-flex justify-content-between lims-text-color my-3">
                          <div className='d-flex'>
                            <p>DOB:</p>
                            <p>{clientDetails[0]["DOB"].slice(0, 10)}</p>
                          </div>
                          <div className='d-flex'>
                            <p>Gender:</p>
                            <p>{clientDetails[0]["GENDER"]}</p>
                          </div>
                          {/* age */}
                          <div className='d-flex'>
                            <p>Age:</p>
                            <p>
                              {clientDetails[0]["AGE"]} {clientDetails[0]["AGETYPE"]}
                            </p>
                          </div>
                          {/* phone */}
                          <div className='d-flex'>
                            <p>Phone:</p>
                            <p>{clientDetails[0]["MOBILE_NUMBER"]}</p>
                          </div>
                          {/* email */}
                          <div className='d-flex'>
                            <p>Email:</p>
                            <p>{clientDetails[0]["EMAIL"]}</p>
                          </div>
                        </div>
                      </div>
                      <div >
                      </div>
                    </div>
                  )}
                </div>
              </>
            )
          }
        }
      </ClientContextConsumer>
    </>
  );
}
