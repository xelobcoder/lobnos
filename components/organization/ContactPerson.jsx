import React from 'react'
import {
  TextField,
  Box,
  Button,
  InputAdornment,
} from '@mui/material';

import {
  Person,
  Email,
}
  from '@mui/icons-material'
export default function ContactPerson() {
  return (
    <>
      <Box sx={{ mt: 3, ml: 10, mr: 10 }}>
        <form style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <TextField
            label="Contact Person"
            variant="outlined"
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
            variant="outlined"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Email />
                </InputAdornment>
              ),
            }}
          />
          <input className='form-control' type='file'></input>

          <Button
            type="submit"
            variant="contained"
            className='custom-button'
            color="primary"
            style={{ marginTop: '16px', marginBottom: '20px' }}
          >
            Submit
          </Button>
        </form>
      </Box>
    </>
  )
}
