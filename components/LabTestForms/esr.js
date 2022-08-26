import { TextField, Button } from "@mui/material";
import { useState } from "react";
export default function ESR() {
 const [result, setResult] = useState('');
 const [comment, setComment] = useState('');
 const handleResult = (e) => {
  console.log(result,comment)
 }
 return (
  <>
   <div className="p-4" style={{ width: '100%', marginTop: '30px' }}>
    <div style={{width:'100%'}}>
     <TextField type='number' sx={{width:'50%'}} size="small" label="ESR" variant="outlined" value={result} onChange={(e) => setResult(e.target.value)} />
    </div>
    <div className="col-md-6 mt-3">
     <textarea className="form-control" value={comment} onChange={(e) => setComment(e.target.value)}>

     </textarea>
    </div>
    <Button onClick={(e) => handleResult(e)} className="mt-3" variant='contained' color='primary' type='button'>save result</Button>
   </div>
  </>
 )
}