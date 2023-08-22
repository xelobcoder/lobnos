import React, { useState } from 'react'
import { TextField, Box, Button, InputAdornment } from '@mui/material';

import { Person, Email } from '@mui/icons-material';

export default function ContactPerson({ data, handleChange }) {
  return (
    <>
      <form style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <TextField
          label="Contact Person"
          variant="outlined"
          size='small'
          value={data.person}
          onChange={(event) => handleChange(event, 'person')}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Person />
              </InputAdornment>
            ),
          }}
        />
        <TextField
          label="Contact Person Email"
          value={data.contactEmail}
          onChange={(event) => handleChange(event, 'contactEmail')}
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
          label="Contact Phone Number"
          value={data.contactPerson}
          onChange={(event) => handleChange(event, 'contactPerson')}
          variant="outlined"
          size='small'
          type='number'
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Email />
              </InputAdornment>
            ),
          }}
        />
      </form>
    </>
  )
}
