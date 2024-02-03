import React from 'react'

export default function PersonalInformation({ data }) {
  const { clientname, gender, age, clinician, patientid, billingid } = data
  return (
    <>
      <div>
        <h6 className="result-section-header fw-bold">Personal Information</h6>
        <div className="grid-50">
          <div className="left">
            <div className="result-sampling-details">
              <div className="left">patientid: </div>
              <div className="right">{patientid}</div>
            </div>
            <div className="result-sampling-details">
              <div className="left">fullname: </div>
              <div className="right">{clientname}</div>
            </div>
            <div className="result-sampling-details">
              <div className="left">gender: </div>
              <div className="right">{gender}</div>
            </div>
          </div>
          <div className="right">
            <div className="result-sampling-details">
              <div className="left">billingid: </div>
              <div className="right">{billingid}</div>
            </div>
            <div className="result-sampling-details">
              <div className="left">age: </div>
              <div className="right">{age}</div>
            </div>
            <div className="result-sampling-details">
              <div className="left">refering clinician: </div>
              <div className="right">{clinician}</div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
