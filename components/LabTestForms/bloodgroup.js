import { Autocomplete, TextField, Container, Button } from "@mui/material";
import { useState } from "react";

export default function BloodGroup() {
 const option = ['', 'A', 'B', 'AB', 'O'];
 const optionRhesus = ['', 'positive', 'negative'];
 const [group, setGroup] = useState('');
 const [rhesus, setRhesus] = useState('');

 return (
  <>
   <div className="p-4">
    <div style={{ width: '50%',marginTop:'30px' }}>
     <Autocomplete size="small"
      options={option} getOptionLabel={(option) => option}
      renderInput={(params) => <TextField {...params} label="blood group" variant="outlined" />}
      value={group} onChange={(e, newValue) => setGroup(newValue)}>

     </Autocomplete>
    </div>
    <div style={{ width: '50%',marginTop:'30px'}}>
     <Autocomplete size="small"
      options={optionRhesus}
      getOptionLabel={(option) => option}
      renderInput={(params) => <TextField {...params} label="rhesus" variant="outlined" />}
      value={rhesus} onChange={(e, newValue) => { setRhesus(newValue) }}
     >
     </Autocomplete>
    </div>
    <div>
     <Button className="mt-3" variant='contained' color='primary' type='button'>save result</Button>
    </div>
   </div>
  </>
 )
}