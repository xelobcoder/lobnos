import { Autocomplete, TextField, Button } from "@mui/material";
import { useState } from "react";
import CommentSection from "./commentSection";

export default function HepatitisC() {
  const option = ['', 'reactive', 'non reactive'];
  const [result, setResults] = useState('');
  // handle results
  const handleResult = (e) => {
    console.log(result);
  }
  return (
    <>
      <div className="p-4">
        <div>
          <form>
            <Autocomplete
              options={option}
              getOptionLabel={(option) => option}
              value={result}
              size='small'
              onChange={(event, newValue) => { setResults(newValue) }}
              renderInput={(params) => <TextField {...params} label="Hepatitis C test" variant="outlined" />}
            >
            </Autocomplete>
            <CommentSection/>
          </form>
          <Button variant='contained' onClick={(e) => handleResult(e)} color='primary' sx={{ mt: 2 }}>save results</Button>
        </div>
      </div>
    </>
  )
}