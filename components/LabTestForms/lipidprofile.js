import { useState } from "react";
import { TextField, Button } from "@mui/material";

export default function LipidProfile() {
 const [data, setData] = useState({
  total_cholesterol: 0,
  hdl_cholesterol: '',
  ldl_cholesterol: '',
  non_hdl_cholesterol: '',
  triglycerides: 0,
  vldl_cholesterol: '',
  t_chol_ratio: 0,
  comment: '',
 });
 return (
  <>
   <div className="p-4">
    <div>
     <form>
      {/* total cholesterol */}
      <div className="form-group">
       <TextField sx={{ width: '100%', marginTop: '30px' }} size="small" label="total cholesterol" variant="outlined" type='number' value={data.total_cholesterol} onChange={(e) => setData({ ...data, total_cholesterol: e.target.value })} />
      </div>
      {/* hdl cholesterol */}
      <div className="form-group">
       <TextField sx={{ width: '100%', marginTop: '30px' }} size="small" label="hdl cholesterol" variant="outlined" type='number' value={data.hdl_cholesterol} onChange={(e) => setData({ ...data, hdl_cholesterol: e.target.value })} />
      </div>
      {/* ldl cholesterol */}
      <div className="form-group">
       <TextField sx={{ width: '100%', marginTop: '30px' }} size="small" label="ldl cholesterol" variant="outlined" type='number' value={data.ldl_cholesterol} onChange={(e) => setData({ ...data, ldl_cholesterol: e.target.value })} />
      </div>
      {/* non hdl cholesterol */}
      <div className="form-group">
       <TextField sx={{ width: '100%', marginTop: '30px' }} size="small" label="non hdl cholesterol" variant="outlined" type='number' value={data.non_hdl_cholesterol} onChange={(e) => setData({ ...data, non_hdl_cholesterol: e.target.value })} />
      </div>
      {/* triglycerides */}
      <div className="form-group">
       <TextField sx={{ width: '100%', marginTop: '30px' }} size="small" label="triglycerides" variant="outlined" type='number' value={data.triglycerides} onChange={(e) => setData({ ...data, triglycerides: e.target.value })} />
      </div>
      {/* vldl cholesterol */}
      <div className="form-group">
       <TextField sx={{ width: '100%', marginTop: '30px' }} size="small" label="vldl cholesterol" variant="outlined" type='number' value={data.vldl_cholesterol} onChange={(e) => setData({ ...data, vldl_cholesterol: e.target.value })} />
      </div>
      {/* t chol ratio */}
      <div className="form-group">
       <TextField sx={{ width: '100%', marginTop: '30px' }} size="small" label="t chol ratio" variant="outlined" type='number' value={data.t_chol_ratio} onChange={(e) => setData({ ...data, t_chol_ratio: e.target.value })} />
      </div>
      {/* comment */}
      <div className="form-group">
       <textarea className="form-control mt-3" placeholder="comment" value={data.comment}
        onChange={(e) => setData({ ...data, comment: e.target.value })}>

       </textarea>
      </div>
      {/* submit button */}
      <div className="form-group mt-3">
       <Button variant="contained" color="primary" onClick={() => {
        console.log(data);
       }}>
        Submit
       </Button>
      </div>
     </form>
    </div>
   </div>
  </>
 )
}