import { Card, CardContent, CardHeader, Typography, Button } from '@mui/material';
import { useState } from 'react';
const Header = ({ patientid, fullname }) => {
 return (
  <>
   <div>

   </div>
  </>
 )
}




function Widal({ patientid, fullname }) {
 const [widal, setWidal] = useState({
  patientid: patientid,
  fullname: fullname,
  widal: {
   typhiO: '1/20',
   typhiH: '1/20',
   paratyphiBH: '',
   paratyphiAH: '',
  },
 });


 const [loading, setLoading] = useState(false);

 const handleSave = (e) => {
  e.preventDefault();
  console.log(widal);
 }

 return (
  <>
   <div>
    <Header patientid={patientid} fullname={fullname} />
   </div>
   <hr></hr>
   <div className='p-4'>
    <label>test for salmonella typhi infection</label>
    <div className='form-row'>
     <div className='form-group col-md-6'>
      <label>typhi o</label>
      <select value={widal.widal.typhiO} className='form-control'
       onChange={(e) => setWidal({ ...widal, widal: { ...widal, typhiO: e.target.value } })}>
       <option>select</option>
       <option value='1/20'>1/20</option>
       <option value='1/80'>1/80</option>
       <option value='1/160'>1/160</option>
      </select>
     </div>
     {/* typhi H */}
     <div className='form-group col-md-6'>
      <label>typhi H</label>
      <select className='form-control' value={widal.widal.typhiH}
       onChange={(w) => { setWidal({ ...Widal, widal: { ...widal, typhiH: w.target.value } }) }}>
       <option>select</option>
       <option value='1/20'>1/20</option>
       <option value='1/80'>1/80</option>
       <option value='1/160'>1/160</option>
      </select>
     </div>
     {/* paratyphi BH */}
     <div className='form-group col-md-6'>
      <label>paratyphi BH</label>
      <select className='form-control' value={widal.widal.paratyphiBH}
       onChange={(e) => setWidal({ ...widal, widal: { ...widal, paratyphiBH: e.target.value } })}>
       <option>select</option>
       <option value='1/20'>1/20</option>
       <option value='1/80'>1/80</option>
       <option value='1/160'>1/160</option>
      </select>
     </div>
     {/* paratyphi AH */}
     <div className='form-group col-md-6'>
      <label>paratyphi AH</label>
      <select className='form-control' value={widal.widal.paratyphiAH}
       onChange={(e) => setWidal({ ...widal, widal: { ...widal, paratyphiAH: e.target.value } })}>
       <option>select</option>
       <option value='1/20'>1/20</option>
       <option value='1/80'>1/80</option>
       <option value='1/160'>1/160</option>
      </select>
     </div>
     <div>
      <div className='form-group col-md-6'>
       <label>comments</label>
       <textarea className='form-control'>

       </textarea>
      </div>
     </div>
     <Button type='button' onClick={(e) => handleSave(e)}
      variant='contained' color='primary' sx={{ mt: 2 }}>save information</Button>
    </div>
   </div>
  </>
 )
}


export default Widal;