import { TextField, Autocomplete, Button } from '@mui/material'
import React, { useState } from 'react'



const options = ['cash', 'mobile money', 'cheque', 'bank transfer'];


export default function UpdateBilling({ data }) {
  const [selectedValue, setSelectedValue] = useState(null);

  const handleSelect = (event, value) => {
    setSelectedValue(value);
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
          variant="outlined"
          className="mt-3"
          color="primary"
          sx={{ width: '100%' }}
          size="large"
        >
          save changes
        </Button>
      </form>
    </div>
  );
}
