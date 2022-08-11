import {
  FormControl,
  Button,
  Input,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from '@mui/material'
import { useState } from 'react'

const Mobilemoney = function () {
  return (
    <>
      <div className="grid-split">
        <TextField
          type="tel"
          minLength="10"
          variant="filled"
          label="mobile money number"
          maxLength="10"
        />
        <TextField
          type="text"
          label="receiver name as on momo"
          id="receivername"
          variant="filled"
        ></TextField>
      </div>
    </>
  )
}

const BankDetails = function () {
  return (
    <>
      <div className="grid-split">
        <TextField type="text" label="Bank name" variant="filled"></TextField>
        <TextField
          type="number"
          label="Account Number"
          variant="filled"
        ></TextField>
      </div>
      <div className="grid-split">
        <TextField
          type="text"
          label="Account Name"
          variant="filled"
        ></TextField>
        <TextField type="text" label="Bank Branch" variant="filled"></TextField>
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
  return <>{state === 'mobile money' ? <Mobilemoney /> : <BankDetails />}</>
}

export default function Opay(props) {
  const [paymentmethod, setPaymentmethod] = useState('mobilemoney')

  const handleChange = (e, payment) => {
    setPaymentmethod(payment)
  }

  return (
    <>
      <div className="grid-split">
        <FormControl variant="filled">
          <InputLabel>payment module</InputLabel>
          <Select
            onChange={(e) => {
              handleChange(e, e.target.value)
            }}
          >
            <MenuItem value={'cash'}>cash</MenuItem>
            <MenuItem value={'bank transfer'}>Bank transfer</MenuItem>
            <MenuItem value={'mobile money'}>Mobile money</MenuItem>
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
