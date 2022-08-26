import { useState } from "react";
import { TextField, Button } from "@mui/material";
export default function FastingSugar() {
 const [fasting, setFasting] = useState('');
 const [comment, setComment] = useState('');
 return (
  <>
   <div className="p-4">
    <div style={{ width: "50%", marginTop: "30px" }}>
     <TextField size="small" label="fasting sugar" variant="outlined" type='number'
      value={fasting} onChange={(e) => setFasting(e.target.value)} />
    </div>
    <div className="col-md-6 mt-3">
     <textarea className="form-control" value={comment}
      onChange={(e) => setComment(e.target.value)} placeholder="comment"></textarea>
    </div>
    <Button className="mt-3" variant='contained' color='primary' type='button'>save result</Button>
   </div>
  </>
 )
}