import { Autocomplete, Button, TextField } from "@mui/material";
import { useState } from "react";
export default function G6PD() {
 const [result, setResult] = useState('');
 const option = ['', 'full defect', 'partial defect', 'normal'];
 const handleResult = (e) => {
  console.log(result)
 }
 return (
  <>
   <div className="p-4">
    <Autocomplete size='small'
     options={option}
     getOptionLabel={(option) => option}
     renderInput={(params) => <TextField {...params} label="g6pd" variant="outlined" />}
     value={result} onChange={(e, newValue) => { setResult(newValue) }}>
    </Autocomplete>
  
    <Button type='button' variant="contained" color="primary"
     sx={{ mt: 3 }} onClick={(e) => { handleResult(e) }}>save results
    </Button>
   </div>
  </>
 )
}