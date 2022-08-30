import { useState } from "react";
import { Autocomplete, TextField, Typography, Button } from "@mui/material";
function AIDS() {
 const [results, setResults] = useState("");
 const options = ['reactive', 'non reactive'];

 return (
  <>
   <div className="p-4">
    <div className="mb-3">
     <Typography variant='h6'>A.I.D.S</Typography>
    </div>
    <form>
     <Autocomplete options={options} onChange={(e, newValue) => setResults(newValue)} value={results} size='small' renderInput={(params) => <TextField {...params} label='results' />}
      getOptionLabel={(option) => option}
     />
     <Button variant='contained' sx={{ mt: 4 }} color='primary' onClick={() => setResults('')}> save result </Button>
    </form>
   </div>
  </>
 )
}


export default AIDS;