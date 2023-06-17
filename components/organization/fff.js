import React from 'react'
import {
  TextField,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  InputAdornment,
  Container,
} from  '@mui/material';

import {
  AccountCircle,
  LocationOn,
  Phone,
  Person,
  Language,
  Email,
  MonetizationOn,
  AttachMoney,
  Image,
}
  from '@mui/icons-material'



export default function Organization() {
  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission logic here
  };

  return (
    <div>
      <Box sx={{mt:3,ml:10,mr:10}}>
        <form
          style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
          onSubmit={handleSubmit}
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
          <FormControl variant="outlined">
            <InputLabel htmlFor="payment-module">Payment Module</InputLabel>
            <Select
              label="Payment Module"
              inputProps={{
                name: 'payment-module',
                id: 'payment-module',
              }}
            >
              <MenuItem value="credit-card">Credit Card</MenuItem>
              <MenuItem value="mobile-money">Mobile Money</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="Commission (%)"
            variant="outlined"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <AttachMoney />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            label="Momo Number"
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
            label="Organization Image"
            variant="outlined"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  {/* <Image /> */}
                </InputAdornment>
              ),
            }}
          />

          <Button
            type="submit"
            variant="contained"
            color="primary"
            style={{ marginTop: '16px' }}
          >
            Submit
          </Button>
        </form>
      </Box>
    </div>
  )
}
