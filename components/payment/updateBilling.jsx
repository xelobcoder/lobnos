import { TextField, Autocomplete, Button ,CircularProgress} from '@mui/material'
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
    }, 2000);
  };


  return (
    <div>
      <form>
        <TextField
          size="large"
          type="number"
          label="client billing id"
          value={data?.billing}
          className="mt-3" sx={{ width: '100%' }}
        />

        <TextField
          size="large"
          type="number"
          label="Amount due"
          value={data?.billing}
          className="mt-3" sx={{ width: '100%' }}
        />

        <TextField
          size="large"
          type="number"
          label="Amount paid"
          value={data?.billing}
          className="mt-3" sx={{ width: '100%' }}
        />

        <TextField
          size="large"
          type="number"
          label="Discount"
          value={data?.billing}
          className="mt-3" sx={{ width: '100%' }}
        />

        <TextField
          size="large"
          type="number"
          label="pay"
          value={data?.billing}
          className="mt-3" sx={{ width: '100%' }}
        />

        <Autocomplete
          options={options}
          value={selectedValue}
          className="mt-3" sx={{ width: '100%' }}
          onChange={handleSelect}
          renderInput={(params) => (
            <TextField {...params} label="Payment Method" variant="outlined" />
          )}
        />

        <Button
          variant="contained"
          color="primary"
          sx={{ width: '100%',marginTop:'20px' }}
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
