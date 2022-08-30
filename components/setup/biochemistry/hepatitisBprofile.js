import { useState } from "react";
import { Autocomplete, TextField, Typography, Button } from "@mui/material";

function HEPATITISBPROFILE() {
 const options = ['', 'reactive', 'non reactive'];
 const [results, setResults] = useState({
  HBsAg: '',
  HBsAb: '',
  HBeAg: '',
  HBeAb: '',
  HBcAb: '',
 });
 return (
  <>
   <div className="p-4">
    <form>
     <Typography variant='h6'>HEPATITIS B PROFILE</Typography>
     <div className="mb-3">
      <Typography variant='body1'>
       <strong>HBsAg</strong>
      </Typography>
      <Autocomplete sx={{ mt: 2 }} options={options} size='small' getOptionLabel={(option) => option} renderInput={(params) => <TextField {...params} label='results' />} onChange={(e) => { setResults({ ...results, HBsAg: e.target.value }) }} />
     </div>
     <div className="mb-3">
      <Typography variant='body1'>
       <strong>HBsAb</strong>
      </Typography>
      <Autocomplete sx={{ mt: 2 }} options={options} size='small' getOptionLabel={(option) => option} renderInput={(params) => <TextField {...params} label='results' />} onChange={(e) => { setResults({ ...results, HBsAb: e.target.value }) }} />
     </div>
     <div className="mb-3">
      <Typography variant='body1'>
       <strong>HBeAg</strong>
      </Typography>
      <Autocomplete sx={{ mt: 2 }} options={options} size='small' getOptionLabel={(option) => option} renderInput={(params) => <TextField {...params} label='results' />} onChange={(e) => { setResults({ ...results, HBeAg: e.target.value }) }} />
     </div>
     <div className="mb-3">
      <Typography variant='body1'>
       <strong>HBeAb</strong>
      </Typography>
      <Autocomplete sx={{ mt: 2 }} options={options} size='small' getOptionLabel={(option) => option} renderInput={(params) => <TextField {...params} label='results' />} onChange={(e) => { setResults({ ...results, HBeAb: e.target.value }) }} />
     </div>
     <div className="mb-3">
      <Typography variant='body1'>
       <strong>HBcAb</strong>
      </Typography>
      <Autocomplete sx={{ mt: 2 }} options={options} size='small' getOptionLabel={(option) => option} renderInput={(params) => <TextField {...params} label='results' />} onChange={(e) => { setResults({ ...results, HBcAb: e.target.value }) }} />
     </div>
     <Button variant='contained' sx={{ mt: 4 }} color='primary' onClick={() => setResults({})}> save result </Button>
    </form>
   </div>
  </>
 )
}


export default HEPATITISBPROFILE;