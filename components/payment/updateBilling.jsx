import { TextField, Autocomplete, Button, CircularProgress } from '@mui/material'
import React, { useState } from 'react'



const options = ['cash', 'mobile money', 'cheque', 'bank transfer'];


export default function UpdateBilling({ data }) {
  const [selectedValue, setSelectedValue] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSelect = (event, value) => {
    setSelectedValue(value);
  };

  const handleSaveChanges = () => {
    // Perform save changes logic here
    setIsLoading(true);

    // Simulating an asynchronous operation
    setTimeout(() => {
      // Reset the loading state after the operation is completed
      setIsLoading(false);
    }, 30000);
  };





  return (
    <div>
      <h3>Update Payment</h3>
      <form>
        <TextField
          size="large"
          type="number" variant="standard"
          label="client billing id"
          value={data?.billingid}
          className="mt-3" sx={{ width: '100%' }}
          disabled
        />
        <TextField
          size="large"
          type="number" variant="standard"
          label="Amount due"
          value={data?.payable}
          className="mt-3" sx={{ width: '100%' }}
          disabled
        />
        <TextField
          size="large"
          type="number" variant="standard"
          label="Amount paid"
          value={data?.paid_amount}
          className="mt-3" sx={{ width: '100%' }}
          disabled
        />

        <TextField
          size="large"
          type="number"
          label="Discount"
          value={data?.discount}
          variant="standard"
          className="mt-3" sx={{ width: '100%' }}
          disabled
        />

        <TextField
          size="large"
          type="number"
          label="pay"
          variant="standard"
          value={data?.pay}
          className="mt-3" sx={{ width: '100%' }}
        />

        <Autocomplete
          options={options}
          value={selectedValue}
          onChange={handleSelect}
          variant="standard"
          className="mt-3" sx={{ width: '100%' }}
          renderInput={(params) => (
            <TextField {...params} label="Payment Method"  variant="standard" />
          )}
        />

        <Button
          variant="contained"
          color="primary"
          sx={{ width: '20%', marginTop: '20px' }}
          size="large"
          disabled={isLoading}
          onClick={handleSaveChanges}
        >
          {isLoading ? <CircularProgress size={24} color="primary" /> : 'Save Changes'}
        </Button>
      </form>
    </div>
  );
}
