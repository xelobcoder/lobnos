import { useState } from "react";
import { TextField, Button } from "@mui/material";
export default function ThyroidTest() {
 const [data, setData] = useState({
  TSH: '',
  T3: '',
  T4: '',
  comment: '',
 })

 const handleResult = (e) => {
  console.log(data)
 }
 return (
  <>
   <div className="p-4">
    <div>
     <form>
      {/* TSH */}
      <div className="form-group">
       <TextField sx={{ width: '100%', marginTop: '30px' }} size="small" label="TSH" variant="outlined" type='number' value={data.TSH} onChange={(e) => setData({ ...data, TSH: e.target.value })} />
      </div>
      {/* T3 */}
      <div className="form-group">
       <TextField sx={{ width: '100%', marginTop: '30px' }} size="small" label="T3" variant="outlined" type='number' value={data.T3} onChange={(e) => setData({ ...data, T3: e.target.value })} />
      </div>
      {/* T4 */}
      <div className="form-group">
       <TextField sx={{ width: '100%', marginTop: '30px' }} size="small" label="T4" variant="outlined" type='number' value={data.T4} onChange={(e) => setData({ ...data, T4: e.target.value })} />
      </div>
      {/* comment */}
      <div className="form-group mt-3">
       <textarea className="form-control" value={data.comment} onChange={(e) => setData({ ...data, comment: e.target.value })} placeholder="comment"></textarea>
      </div>
      {/* save result */}
      <div className="form-group">
       <Button className="mt-3" variant='contained' onClick={(e) => handleResult(e)} color='primary' type='button'>save result</Button>
      </div>
     </form>
    </div>
   </div>
  </>
 )
}