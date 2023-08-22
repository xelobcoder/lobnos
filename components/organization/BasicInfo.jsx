import React, { useState } from 'react'
import {TextField,InputAdornment} from '@mui/material';

import { AccountCircle,LocationOn,Phone,Language,Email, DirectionsTransit} from '@mui/icons-material'

export default function OrganizatioBasic({data,handleChange}) {

  return (
    <>
      <form
        style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
      >
        <TextField
          label="Organization Name"
          variant="outlined"
          size='small'
          value={data.name}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <AccountCircle />
              </InputAdornment>
            ),
          }}
          onChange={(event) => handleChange(event, 'name')}
        />
        <TextField
          label="Location"
          variant="outlined"
          size='small'
          value={data.location}
          onChange={(event) => handleChange(event, 'location')}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LocationOn />
              </InputAdornment>
            ),
          }}
        />
        <TextField
          label="Street Name"
          onChange={(event) => handleChange(event, 'street')}
          value={data.street}
          variant="outlined"
          size='small'
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LocationOn />
              </InputAdornment>
            ),
          }}
        />
        <TextField
          label="Mobile Number"
          onChange={(event) => handleChange(event, 'mobile')}
          value={data.mobile}
          variant="outlined"
          size='small'
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Phone />
              </InputAdornment>
            ),
          }}
        />

        <TextField
          label="Address"
          variant="outlined"
          size='small'
          value={data.address}
          onChange={(event) => handleChange(event, 'address')}
          multiline
          rows={2}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LocationOn />
              </InputAdornment>
            ),
          }}
        />
        <TextField
          label="Website"
          value={data.website}
          onChange={(event) => handleChange(event, 'website')}
          variant="outlined"
          size='small'
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Language />
              </InputAdornment>
            ),
          }}
        />
        <TextField
          label="Email"
          value={data.email}
          onChange={(event) => handleChange(event, 'email')}
          variant="outlined"
          size='small'
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Email />
              </InputAdornment>
            ),
          }}
        />
         <TextField
          label="Gps Mapping"
          value={data.gpsMapping}
          onChange={(event) => handleChange(event, 'gpsMapping')}
          variant="outlined"
          size='small'
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Email />
              </InputAdornment>
            ),
          }}
        />
         <TextField
          label="region"
          value={data.region}
          onChange={(event) => handleChange(event, 'region')}
          variant="outlined"
          size='small'
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LocationOn/>
              </InputAdornment>
            ),
          }}
        />
         <TextField
          label="district"
          value={data.district}
          onChange={(event) => handleChange(event, 'district')}
          variant="outlined"
          size='small'
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <DirectionsTransit/>
              </InputAdornment>
            ),
          }}
        />
      </form>
    </>
  )
}
