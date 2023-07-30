import React from 'react'

export default function EmmergencyContactInformation({ data, setData }) {
  return (
    <>
      <div className='card br-5 mt-4'>
        <div className='card-header p-3'>
          <h5 className='btn btn-danger text-white'>
            emmergency contact information
          </h5>
        </div>
        <div className='card-body'>
          <div className="mb-3">
            <label htmlFor="emergencyName" className="form-label">
              Emergency contact name
            </label>
            <input
              type="text"
              className="custom-input"
              id="emergencyName"
              name="emergencyName"
              tabIndex={25}
              value={data.emmergencyInformation.emergencyName}
              onChange={(e) => {
                setData({ ...data, emmergencyInformation: { ...data.emmergencyInformation, emmergencyContact: e.target.value } });
              }}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="relationship" className="form-label">
              Relationship
            </label>
            <input
              type="text"
              className="custom-input"
              id="relationship"
              name="relationship"
              tabIndex={26}
              value={data.emmergencyInformation.relationship}
              onChange={(e) => setData({ ...data, emmergencyInformation: { ...data.emmergencyInformation, relationship: e.target.value } })}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="emergencyContactNumber" className="form-label">
              Emergency contact number
            </label>
            <input
              type="tel"
              inputMode="tel"
              className="custom-input"
              minLength={10}
              maxLength={10}
              id="emergencyContactNumber"
              name="emergencyContactNumber"
              tabIndex={27}
              value={data.emmergencyInformation.emergencyContactNumber}
              onChange={(e) =>
                setData({ ...data, emmergencyInformation: { ...data.emmergencyInformation, emergencyContactNumber: e.target.value } })
              }
            />

          </div>
          <div className="mb-3">
            <label htmlFor="location" className="form-label">
              location
            </label>
            <input
              type="text"
              className="custom-input"
              id="location"
              name="location"
              tabIndex={28}
              value={data.emmergencyInformation.location}
              onChange={(e) => {
                setData({ ...data, emmergencyInformation: { ...data.emmergencyInformation, location: e.target.value } });
              }}
            />
            <div className="mb-3">
              <label htmlFor="address" className="form-label">
                address
              </label>
              <input
                type="text"
                className="custom-input"
                id="address"
                name="address"
                tabIndex={29}
                value={data.emmergencyInformation.address}
                onChange={(e) => {
                  setData({ ...data, emmergencyInformation: { ...data.emmergencyInformation, address: e.target.value } });
                }}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="occupation" className="form-label">
                Occupation
              </label>
              <input
                type="text"
                className="custom-input"
                id="occupation"
                name="occupation"
                tabIndex={30}
                value={data.emmergencyInformation.occupation}
                onChange={(e) => {
                  setData({ ...data, emmergencyInformation: { ...data.emmergencyInformation, occupation: e.target.value } });
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
