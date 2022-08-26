import { useState } from "react";
import { TextField, Button } from "@mui/material";

export default function CardiacEnzymes() {
 const [data, setData] = useState({
  LDH: '',
  MYOGLOBIN: '',
  TROPONIN: '',
  CK_MB: '',
  AST: '',
 })
 const handleResult = (e) => {
  setData({ ...data, [e.target.name]: e.target.value })
 }
 return (
  <>
   <div className="p-4" >
    <div>
     <form>
      {/* LDH */}
      <div className="form-group">
       <TextField sx={{ width: '100%', marginTop: '30px' }} size="small" label="LDH" variant="outlined" type='number' value={data.LDH} onChange={(e) => setData({ ...data, LDH: e.target.value })} />
      </div>
      {/* MYOGLOBIN */}
      <div className="form-group">
       <TextField sx={{ width: '100%', marginTop: '30px' }} size="small" label="MYOGLOBIN" variant="outlined" type='number' value={data.MYOGLOBIN} onChange={(e) => setData({ ...data, MYOGLOBIN: e.target.value })} />
      </div>
      {/* TROPONIN */}
      <div className="form-group">
       <TextField sx={{ width: '100%', marginTop: '30px' }} size="small" label="TROPONIN" variant="outlined" type='number' value={data.TROPONIN} onChange={(e) => setData({ ...data, TROPONIN: e.target.value })} />
      </div>
      {/* CK_MB */}
      <div className="form-group">
       <TextField sx={{ width: '100%', marginTop: '30px' }} size="small" label="CK_MB" variant="outlined" type='number' value={data.CK_MB} onChange={(e) => setData({ ...data, CK_MB: e.target.value })} />
      </div>
      {/* AST */}
      <div className="form-group">
       <TextField sx={{ width: '100%', marginTop: '30px' }} size="small" label="AST" variant="outlined" type='number' value={data.AST} onChange={(e) => setData({ ...data, AST: e.target.value })} />
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