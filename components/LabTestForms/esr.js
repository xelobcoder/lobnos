import { TextField, Button } from "@mui/material";
import { useState } from "react";
export default function ESR() {
  const [result, setResult] = useState('');
  const [comment, setComment] = useState('');
  const handleResult = (e) => {
    console.log(result, comment)
  }
  return (
    <>
      <div className="p-2" style={{ width: '100%', marginTop: '0px' }}>
        <h5>Erthrocyte Sedimentation Rate (ESR)</h5>
        <div style={{ width: '100%' }}>
          <label>value</label>
          <TextField type='number' sx={{ width: '100%' }} size="small" label="ESR" variant="outlined" value={result} onChange={(e) => setResult(e.target.value)} />
        </div>
        <div className="mt-3">
          <label>comment</label>
          <textarea className="form-control" value={comment} onChange={(e) => setComment(e.target.value)}>

          </textarea>
        </div>
        <Button onClick={(e) => handleResult(e)} className="mt-3" variant='contained' color='primary' type='button'>save result</Button>
      </div>
      <div className="p-2">
        <div className="d-flex justify-content-between alert alert-warning">
          The normal range for erythrocyte sedimentation rate (ESR) can vary depending on factors such as age, gender, and medical condition. However, here is a general guideline for the reference ranges of ESR in adults:
          <br></br>

          For males:
          <br></br>

          Normal ESR range: 0-15 mm/hr (men under 50 years)
          <br></br>
          Normal ESR range: 0-20 mm/hr (men over 50 years)
          <br></br>
          For females:
          <br></br>

          Normal ESR range: 0-20 mm/hr (women under 50 years)
          <br></br>
          Normal ESR range: 0-30 mm/hr (women over 50 years)
          <br></br>
          It is important to note that ESR is a nonspecific marker of inflammation and can be influenced by various factors, such as infections, autoimmune conditions, and other underlying medical conditions. The reference ranges may also vary slightly depending on the laboratory and testing method used. The interpretation of ESR results should be done in conjunction with other clinical information and under the guidance of a qualified healthcare professional for accurate diagnosis and management of a patient condition.
        </div>
      </div>
    </>
  )
}