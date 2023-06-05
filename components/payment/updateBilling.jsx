import { TextField, Autocomplete, Button, CircularProgress } from '@mui/material'
import React, { useState } from 'react'
import { customPost } from '../Auth/customFetch';



const options = ['cash', 'mobile money', 'cheque', 'bank transfer'];


export default function UpdateBilling({ data, close,refresh }) {
  const [isLoading, setIsLoading] = useState(false);
  const [paymentInfo, setpaymentInfo] = useState(data || {})


  const handleSaveChanges = () => {
    // Perform save changes logic here
    setIsLoading(true);
    try {
      const sendPayment = async function () {
        const pushResponse = await customPost(
          "billing/payment/update",
          "POST",
          paymentInfo
        );
        const { status, statusCode, message } = pushResponse;
        if (status == "success" && statusCode == 200) {
          setIsLoading(false);
          alert(message);
          close({ update: false, billid: null, filteringData: {} });
          refresh(true);
          setTimeout(() => {
            refresh(false);
          }, 1000);
        }
      };

      sendPayment();
    } catch (err) {
      console.log(err);
    }
  };





  return (
    <div>
      <h3>Update Payment</h3>
      <form>
        <TextField
          size="large"
          type="number" variant="standard"
          label="client billing id"
          value={paymentInfo?.billingid}
          className="mt-3" sx={{ width: '100%' }}
          disabled
        />
        <TextField
          size="large"
          type="number" variant="standard"
          label="Amount due"
          value={paymentInfo?.payable}
          className="mt-3" sx={{ width: '100%', color: 'red' }}
          disabled
        />
        <TextField
          size="large"
          type="number" variant="standard"
          label="Amount paid"
          value={paymentInfo?.paid_amount}
          className="mt-3" sx={{ width: '100%' }}
          disabled
        />

        <TextField
          size="large"
          type="number"
          label="Discount"
          value={paymentInfo?.discount}
          variant="standard"
          className="mt-3" sx={{ width: '100%' }}
          disabled
        />

        <TextField
          size="large"
          type="number"
          label="pay"
          variant="standard"
          value={paymentInfo?.pay}
          onChange={(event) => {
            const { value } = event.target;

            if (value > paymentInfo.outstanding || value < 0) {
              setpaymentInfo({ ...paymentInfo, pay: paymentInfo.outstanding })
            } else {
              setpaymentInfo({ ...paymentInfo, pay: value })
            }
          }}
          className="mt-3" sx={{ width: '100%' }}
          disabled = {data.outstanding == 0 ?  true : false}
        />

        <Autocomplete
          options={options}
          value={paymentInfo.paymentMode}
          onChange={(event, value) => setpaymentInfo({ ...paymentInfo, paymentMode: value })}
          variant="standard"
          disabled = {data.outstanding == 0 ?  true : false}
          className="mt-3" sx={{ width: '100%' }}
          renderInput={(params) => (
            <TextField {...params} label="Payment Method" variant="standard" />
          )}
        />

        <Button
          variant="contained"
          color="primary"
          sx={{ width: '20%', marginTop: '20px' }}
          size="large"
          onClick={handleSaveChanges}
          disabled = {data.outstanding == 0 ?  true : false}
        >
          {isLoading ? <CircularProgress size={24} color="primary" /> : 'Save Changes'}
        </Button>
      </form>
    </div>
  );
}
