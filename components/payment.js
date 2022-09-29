import {
  FormControl,
  Button,
  Input,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from '@mui/material'
import { Container } from '@mui/system';
import { useState } from 'react'

const Mobilemoney = function () {
  const [mobile, setMobile] = useState(0);
  const [receivername, setReceivername] = useState('');
  return (
    <>
      <div className="grid-split">
        <TextField
          type="tel"
          minLength="10"
          value={mobile}
          placeholder="0505050505"
          variant="outlined"
          label="mobile money number"
          onChange={(e) => setMobile(e.target.value)}
          maxLength="10"
        />
        <TextField
          type="text"
          label="receiver name as on momo"
          id="receivername"
          placeholder='John Doe'
          value={receivername}
          onChange={(e) => setReceivername(e.target.value)}
          variant="outlined"
        ></TextField>
      </div>
    </>
  )
}

const BankDetails = function () {
  return (
    <>
      <div className="grid-split">
        <TextField type="text" label="Bank name" variant="outlined"></TextField>
        <TextField
          type="number"
          label="Account Number"
          variant="outlined"
        ></TextField>
      </div>
      <div className="grid-split">
        <TextField
          type="text"
          label="Account Name"
          variant="outlined"
        ></TextField>
        <TextField type="text" label="Bank Branch" variant="outlined"></TextField>
      </div>
    </>
  )
}

const Opanel = function (name, html) {
  return (
    <div className="--lobnos-card --w-xxl-p ">
      <div className="--lobnos-header">{name}</div>
      <div className="--lobnos-body">{html()}</div>
    </div>
  )
}

const PaymentGroup = ({ state }) => {
  return (<>{state === 'mobile money' ? <Mobilemoney /> : <BankDetails />}</>)
}

export default function Opay(props) {
  const [paymentmethod, setPaymentmethod] = useState('mobile money')

  const handleChange = (e, payment) => {
    setPaymentmethod(payment)
  }

  return (
    <>
        <div className="grid-split">
          <FormControl variant="filled">
            <InputLabel>payment module</InputLabel>
            <Select
              value={paymentmethod}
              onChange={(e) => {
                handleChange(e, e.target.value)
              }}
            >
              <MenuItem value='cash'>cash</MenuItem>
              <MenuItem value='bank transfer'>Bank transfer</MenuItem>
              <MenuItem value='mobile money'>Mobile money</MenuItem>
            </Select>
          </FormControl>
        </div>
        <div>
          {paymentmethod === 'cash' ? null : (
            <PaymentGroup state={paymentmethod} />
          )}
        </div>
    </>
  )
}
