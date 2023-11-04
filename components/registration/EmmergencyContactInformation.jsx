import React from 'react';

export default function EmmergencyContactInformation({ data, setData, card }) {
  return (
    <>
      <div className={card === true ? `card m-0 p-0` : 'none p-2'}>
      <div className="card-header">
          {card && (
            <h5>
             Emmergency Contact Information
            </h5>
          )}
        </div>
        <div className='card-body grid-2 chaplain'>
          <div className="form-row">
            <label htmlFor="emergencyName" className="form-label">
              Emergency Contact Name
            </label>
            <input
              type="text"
              className="form-control"
              id="emergencyName"
              name="emergencyName"
              value={data.emmergencyInformation.emergencyName}
              onChange={(e) => {
                setData({ ...data, emmergencyInformation: { ...data.emmergencyInformation, emergencyName: e.target.value } });
              }}
            />
          </div>
          <div className="form-row">
            <label htmlFor="relationship" className="form-label">
              Relationship
            </label>
            <input
              type="text"
              className="form-control"
              id="relationship"
              name="relationship"
              value={data.emmergencyInformation.relationship}
              onChange={(e) => setData({ ...data, emmergencyInformation: { ...data.emmergencyInformation, relationship: e.target.value } })}
            />
          </div>
          <div className="form-row">
            <label htmlFor="emergencyContactNumber" className="form-label">
              Emergency Contact Number
            </label>
            <input
              type="tel"
              inputMode="tel"
              className="form-control"
              minLength={10}
              maxLength={10}
              id="emergencyContactNumber"
              name="emergencyContactNumber"
              value={data.emmergencyInformation.emergencyContactNumber}
              onChange={(e) =>
                setData({ ...data, emmergencyInformation: { ...data.emmergencyInformation, emergencyContactNumber: e.target.value } })
              }
            />
          </div>
          <div className="form-row">
            <label htmlFor="location" className="form-label">
              Location
            </label>
            <input
              type="text"
              className="form-control"
              id="location"
              name="location"
              value={data.emmergencyInformation.location}
              onChange={(e) => {
                setData({ ...data, emmergencyInformation: { ...data.emmergencyInformation, location: e.target.value } });
              }}
            />
          </div>
          <div className="form-row">
            <label htmlFor="address" className="form-label">
              Address
            </label>
            <input
              type="text"
              className="form-control"
              id="address"
              name="address"
              value={data.emmergencyInformation.address}
              onChange={(e) => {
                setData({ ...data, emmergencyInformation: { ...data.emmergencyInformation, address: e.target.value } });
              }}
            />
          </div>
          <div className="form-row">
            <label htmlFor="occupation" className="form-label">
              Occupation
            </label>
            <input
              type="text"
              className="form-control"
              id="occupation"
              name="occupation"
              value={data.emmergencyInformation.occupation}
              onChange={(e) => {
                setData({ ...data, emmergencyInformation: { ...data.emmergencyInformation, occupation: e.target.value } });
              }}
            />
          </div>
        </div>
      </div>
    </>
  )
}
