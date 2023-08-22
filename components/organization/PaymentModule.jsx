import React, { useState } from 'react'
import {
  TextField,
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
  BrandingWatermark,
  AccountBox,
  SaveAs,
}
  from '@mui/icons-material'
import { Spinner } from 'react-bootstrap';


export default function PaymentModule({data,handleChange,handleSubmit}) {

  return (
    <>
      <form
        style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
      >
        <FormControl variant="outlined"
        size='small'>
          <InputLabel htmlFor="payment-module">Payment Module</InputLabel>
          <Select
            value={data.module}
            onChange={(event) => handleChange(event, 'module')}
            label="Payment Module"
            inputProps={{
              name: 'payment-module',
              id: 'payment-module',
            }}
          >
            <MenuItem value="credit-card">Credit Card</MenuItem>
            <MenuItem value="mobile-money">Mobile Money</MenuItem>
            <MenuItem value='cash'>Cash</MenuItem>
          </Select>
        </FormControl>
        <TextField
          label="Commission (%)"
          variant="outlined"
          size='small'
          value={data.commission}
          onChange={(event) => handleChange(event, 'commission')}
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
          size='small'
          value={data.momo}
          onChange={(event) => handleChange(event, 'momo')}
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
          size='small'
          type='number'
          value={data.account}
          onChange={(event) => handleChange(event, 'account')}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <AccountBalance />
              </InputAdornment>
            ),
          }}
        />
        <TextField
          label='bank Name'
          variant='outlined'
          size='small'
          value={data.bankName}
          onChange={(event) => handleChange(event, 'bankName')}
          type='text'
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <AccountBalance />
              </InputAdornment>
            ),
          }}
        />
        <TextField
          label='Branch'
          variant='outlined'
          size='small'
          value={data.branch}
          onChange={(event) => handleChange(event, 'branch')}
          InputProps={{
            startAdornment: (
              <InputAdornment position='start'>
                <BrandingWatermark />
              </InputAdornment>
            )
          }}
        />
        <TextField
          label='Account Name'
          value={data.accountName}
          onChange={(event) => handleChange(event, 'accountName')}
          variant='outlined'
          size='small'
          InputProps={{
            startAdornment: (
              <InputAdornment position='start'>
                <AccountBox />
              </InputAdornment>
            )
          }}
        />

        <Button
          type="button"
          variant="contained"
          className='custom-button'
          color="primary"
          onClick={handleSubmit}
          startIcon={<SaveAs/>}
          style={{ marginTop: '16px', marginBottom: '20px' }}
        >
          Submit
        </Button>
      </form>
    </>
  )
}
