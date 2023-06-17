import React from 'react'
import {
  TextField,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  InputAdornment,
} from '@mui/material';

import {
  Phone,
  AttachMoney,
  AccountBalance,
}
  from '@mui/icons-material'

export default function PaymentModule() {
  return (
    <>
      <Box sx={{ mt: 3, ml: 10, mr: 10 }}>
        <form
          style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
        >
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
            label='bank Account'
            variant='outlined'
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <AccountBalance/>
                </InputAdornment>
              ),
            }}
          />

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
