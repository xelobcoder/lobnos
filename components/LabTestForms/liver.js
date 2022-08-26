import { useState } from "react";
import { TextField, Button } from "@mui/material";

export default function LiverTest() {
 const [data, setData] = useState({
  alt: '',
  ast: '',
  alp: '',
  total_bilirubin: '',
  direct_bilirubin: '',
  indirect_bilirubin: '',
  albumin: '',
  globulin: '',
  total_protein: '',
  ggt: '',
  comment: '',
 })
 return (
  <>
   <div className="p-4" >
    <div>
     <form>
      {/* alt */}
      <div className="form-group">
       <TextField sx={{ width: '100%', marginTop: '30px' }} size="small" label="alt" variant="outlined" type='number' value={data.alt} onChange={(e) => setData({ ...data, alt: e.target.value })} />
      </div>
      {/* ast */}
      <div className="form-group">
       <TextField sx={{ width: '100%', marginTop: '30px' }} size="small" label="ast" variant="outlined" type='number' value={data.ast} onChange={(e) => setData({ ...data, ast: e.target.value })} />
      </div>
      {/* alp */}
      <div className="form-group">
       <TextField sx={{ width: '100%', marginTop: '30px' }} size="small" label="alp" variant="outlined" type='number' value={data.alp} onChange={(e) => setData({ ...data, alp: e.target.value })} />
      </div>
      {/* total_bilirubin */}
      <div className="form-group">
       <TextField sx={{ width: '100%', marginTop: '30px' }} size="small" label="total bilirubin" variant="outlined" type='number' value={data.total_bilirubin} onChange={(e) => setData({ ...data, total_bilirubin: e.target.value })} />
      </div>
      {/* direct_bilirubin */}
      <div className="form-group">
       <TextField sx={{ width: '100%', marginTop: '30px' }} size="small" label="direct bilirubin" variant="outlined" type='number' value={data.direct_bilirubin} onChange={(e) => setData({ ...data, direct_bilirubin: e.target.value })} />
      </div>
      {/* indirect_bilirubin */}
      <div className="form-group">
       <TextField sx={{ width: '100%', marginTop: '30px' }} size="small" label="indirect bilirubin" variant="outlined" type='number' value={data.indirect_bilirubin} onChange={(e) => setData({ ...data, indirect_bilirubin: e.target.value })} />
      </div>
      {/* albumin */}
      <div className="form-group">
       <TextField sx={{ width: '100%', marginTop: '30px' }} size="small" label="albumin" variant="outlined" type='number' value={data.albumin} onChange={(e) => setData({ ...data, albumin: e.target.value })} />
      </div>
      {/* globulin */}
      <div className="form-group">
       <TextField sx={{ width: '100%', marginTop: '30px' }} size="small" label="globulin" variant="outlined" type='number' value={data.globulin} onChange={(e) => setData({ ...data, globulin: e.target.value })} />
      </div>
      {/* total_protein */}
      <div className="form-group">
       <TextField sx={{ width: '100%', marginTop: '30px' }} size="small" label="total protein" variant="outlined" type='number' value={data.total_protein} onChange={(e) => setData({ ...data, total_protein: e.target.value })} />
      </div>
      {/* ggt */}
      <div className="form-group">
       <TextField sx={{ width: '100%', marginTop: '30px' }} size="small" label="ggt" variant="outlined" type='number' value={data.ggt} onChange={(e) => setData({ ...data, ggt: e.target.value })} />
      </div>
      {/* comment */}
      <div className="form-group mt-4">
       <textarea className="form-control" value={data.comment} onChange={(e) => setData({ ...data, comment: e.target.value })} placeholder="comment"></textarea>
      </div>
      {/* submit */}
      <div className="form-group mt-3">
       <Button variant="contained" color="primary" onClick={() => { }}>Submit</Button>
      </div>
     </form>
    </div>
   </div>
  </>
 )
}