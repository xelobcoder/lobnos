import React from 'react';
import { IconButton } from '@mui/material';
import { Home } from '@mui/icons-material';

export default function Addressing({ setData, data, card }) {
  return (
    <>
      <div className={card ? 'card mt-4' : 'none'} id="card-border">
        <div className="card-header">
          {card && (
            <h5 className='btn btn-danger text-white'>
              <IconButton sx={{ color: 'white' }}>
                <Home />
              </IconButton>
              Address Information
            </h5>
          )}
        </div>
        <div className="card-body grid-2">
          <div className="form-row">
            <label>Area</label>
            <input
              className="custom-input"
              value={data.addressingInformation.area}
              onChange={(e) => setData({ ...data, addressingInformation: { ...data.addressingInformation, area: e.target.value } })}
              placeholder="Area"
              type='text'
            />
          </div>
          <div className="form-row">
            <label>Region</label>
            <input
              className="custom-input"
              value={data.addressingInformation.region}
              onChange={(e) => setData({ ...data, addressingInformation: { ...data.addressingInformation, region: e.target.value } })}
              placeholder="Region"
              type='text'
            />
          </div>
          <div className="form-row">
            <label>GPS Location or Landmark</label>
            <input
              className="custom-input"
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
              className="custom-input"
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
