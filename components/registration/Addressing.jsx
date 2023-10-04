import React from 'react'
import { IconButton } from '@mui/material';
import { Home } from '@mui/icons-material';

export default function Addressing({ setData, data, card }) {
  return (
    <>
      <div className={card  ? 'card mt-4' : 'none'} id="card-border">
        <div className="card-header">
          {
            card &&
            <h5 className='btn btn-danger text-white'>
              <IconButton sx={{ color: 'white' }}>
                <Home />
              </IconButton>
              Address Information
            </h5>
          }
        </div>
        <div className="card-body">
          <label>Area</label>
          <input className="custom-input"
            value={data.addressingInformation.area}
            onChange={(e) => setData({ ...data, addressingInformation: { ...data.addressingInformation, area: e.target.value } })}
            placeholder="area"
            tabIndex={21}
            type='text' />
          <label>Region</label>
          <input className="custom-input"
            value={data.addressingInformation.region}
            onChange={(e) => setData({ ...data, addressingInformation: { ...data.addressingInformation, region: e.target.value } })}
            placeholder="region"
            tabIndex={22}
            type='text' />
          <label>GPS Location  or landmark</label>
          <input className="custom-input"
            value={data.addressingInformation.gpsLocation}
            onChange={(e) => setData({ ...data, addressingInformation: { ...data.addressingInformation, gpsLocation: e.target.value } })}
            tabIndex={23}
            placeholder="gps location" type='text' />
          <div className="mb-3">
            <label htmlFor="emergencyName" className="form-label">
              Address
            </label>
            <input
              type="text"
              className="custom-input"
              id="emergencyName"
              name="emergencyName"
              tabIndex={24}
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
