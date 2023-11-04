import React from 'react';
import { regions } from '../Auth/customFetch';

export default function Addressing({ setData, data, card}) {
  return (
    <>
      <div className={card ? 'card mt-1' : 'none p-2'} >
        <div className="card-header">
          {card && (
            <h5>
              Address Information
            </h5>
          )}
        </div>
        <div className={`card-body grid-2 chaplain`}>
          <div className="form-row">
            <label>Area</label>
            <input
              className="form-control"
              value={data.addressingInformation.area}
              onChange={(e) => setData({ ...data, addressingInformation: { ...data.addressingInformation, area: e.target.value } })}
              placeholder="Area"
              type='text'
            />
          </div>
          <div className="form-row">
            <label>Region</label>
            <select
              className="form-control"
              value={data.addressingInformation.region}
              onChange={(e) => setData({ ...data, addressingInformation: { ...data.addressingInformation, region: e.target.value } })}
            >
              <option>select region</option>
              {
                regions.map((item, index) => { return (<option value={item} key={index}>{item}</option>) })
              }
            </select>
          </div>
          <div className="form-row">
            <label>GPS Location or Landmark</label>
            <input
              className="form-control"
              value={data.addressingInformation.gpsLocation}
              onChange={(e) => setData({ ...data, addressingInformation: { ...data.addressingInformation, gpsLocation: e.target.value } })}
              placeholder="GPS Location"
              type='text'
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
              value={data.addressingInformation.address}
              onChange={(e) => {
                setData({ ...data, addressingInformation: { ...data.addressingInformation, address: e.target.value } });
              }}
            />
          </div>
        </div>
      </div>
    </>
  )
}
