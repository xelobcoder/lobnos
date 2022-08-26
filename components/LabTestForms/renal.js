import { TextField, Button } from "@mui/material";
import { useState } from "react";
export default function RenalResults() {
 const [data, setData] = useState({
  sodium: "",
  potassium: "",
  chloride: "",
  urea: "",
  creatinine: "",
  bicarbonate: "",
  calcium: "",
  magnesium: "",
  phosphorus: "",
  comment: "",
 })

 const handleResult = (e) => {
  console.log(data)
 }
 return (
  <>
   <div className="p-4">
    <div>
     <form>
      <div className="form-group">
       <TextField sx={{ width: '100%', marginTop: '30px' }} size="small" label="sodium" variant="outlined" type='number' value={data.sodium} onChange={(e) => setData({ ...data, sodium: e.target.value })} />
      </div>
      <div className="form-group">
       <TextField sx={{ width: '100%', marginTop: '30px' }} size="small" label="potassium" variant="outlined" type='number' value={data.potassium} onChange={(e) => setData({ ...data, potassium: e.target.value })} />
      </div>
      <div className="form-group">
       <TextField sx={{ width: '100%', marginTop: '30px' }} size="small" label="chloride" variant="outlined" type='number' value={data.chloride} onChange={(e) => setData({ ...data, chloride: e.target.value })} />
      </div>
      <div className="form-group">
       <TextField sx={{ width: '100%', marginTop: '30px' }} size="small" label="urea" variant="outlined" type='number' value={data.urea} onChange={(e) => setData({ ...data, urea: e.target.value })} />
      </div>
      <div className="form-group">
       <TextField sx={{ width: '100%', marginTop: '30px' }} size="small" label="creatinine" variant="outlined" type='number' value={data.creatinine} onChange={(e) => setData({ ...data, creatinine: e.target.value })} />
      </div>
      <div className="form-group">
       <TextField sx={{ width: '100%', marginTop: '30px' }} size="small" label="bicarbonate" variant="outlined" type='number' value={data.bicarbonate} onChange={(e) => setData({ ...data, bicarbonate: e.target.value })} />
      </div>
      <div className="form-group">
       <TextField sx={{ width: '100%', marginTop: '30px' }} size="small" label="calcium" variant="outlined" type='number' value={data.calcium} onChange={(e) => setData({ ...data, calcium: e.target.value })} />
      </div>
      <div className="form-group">
       <TextField sx={{ width: '100%', marginTop: '30px' }} size="small" label="magnesium" variant="outlined" type='number' value={data.magnesium} onChange={(e) => setData({ ...data, magnesium: e.target.value })} />
      </div>
      <div className="form-group">
       <TextField sx={{ width: '100%', marginTop: '30px' }} size="small" label="phosphorus" variant="outlined" type='number' value={data.phosphorus} onChange={(e) => setData({ ...data, phosphorus: e.target.value })} />
      </div>
      <div className="form-group mt-4">
       <textarea className="form-control" value={data.comment} onChange={(e) => setData({ ...data, comment: e.target.value })} placeholder="comment"></textarea>
      </div>
      <div>
       <Button className="btn btn-primary mt-4" onClick={(e) => handleResult(e)}>save result</Button>
      </div>
     </form>
    </div>
   </div>
  </>
 )
}