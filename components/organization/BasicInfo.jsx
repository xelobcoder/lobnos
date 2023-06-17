import React from 'react'
import {
  TextField,
  Box,
  Button,
  InputAdornment
} from  '@mui/material';

import {
  AccountCircle,
  LocationOn,
  Phone,
  Language,
  Email
}
  from '@mui/icons-material'



export default function OrganizatioBasic() {
  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission logic here
  };

  return (
    <div>
      <Box sx={{mt:3,ml:10,mr:10}}>
        <form
          style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
        >
          <TextField
            label="Organization Name"
            variant="outlined"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <AccountCircle />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            label="Location"
            variant="outlined"
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
            variant="outlined"
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
            variant="outlined"
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
            multiline
            rows={4}
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
            variant="outlined"
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
            variant="outlined"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Email />
                </InputAdornment>
              ),
            }}
          />
        
        
          <Button
            type="submit"
            variant="contained"
            className='custom-button'
            color="primary"
            style={{ marginTop: '16px',marginBottom:'20px' }}
          >
            Submit
          </Button>
        </form>
      </Box>
    </div>
  )
}
