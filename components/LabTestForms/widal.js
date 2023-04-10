import { Card, CardContent, CardHeader, Typography, Button } from '@mui/material';
import { useState } from 'react';




function Widal() {
 const [widal, setWidal] = useState({
   typhiO: '1/20',
   typhiH: '1/20',
   paratyphiBH: '',
   paratyphiAH: '',
   comment: '' 
 });


 const [loading, setLoading] = useState(false);

 const handleSave = (e) => {
  e.preventDefault();
  console.log(widal);
 }

 return (
  <>
   <div className='p-3'>
    <div className='form-row'>
     <div className='form-group'>
      <label>typhi o</label>
      <select value={widal.typhiO} className='custom-input'
       onChange={(e) => setWidal({ ...widal,typhiO: e.target.value })}>
       <option>select</option>
       <option value='1/20'>1/20</option>
       <option value='1/80'>1/80</option>
       <option value='1/160'>1/160</option>
      </select>
     </div>
     {/* typhi H */}
     <div className='form-group '>
      <label>typhi H</label>
      <select className='custom-input' value={widal.typhiH}
       onChange={(w) => { setWidal({ ...Widal, typhiH: w.target.value  }) }}>
       <option>select</option>
       <option value='1/20'>1/20</option>
       <option value='1/80'>1/80</option>
       <option value='1/160'>1/160</option>
      </select>
     </div>
     {/* paratyphi BH */}
     <div className='form-group '>
      <label>paratyphi BH</label>
      <select className='custom-input' value={widal.paratyphiBH}
       onChange={(e) => setWidal({ ...widal,paratyphiBH: e.target.value  })}>
       <option>select</option>
       <option value='1/20'>1/20</option>
       <option value='1/80'>1/80</option>
       <option value='1/160'>1/160</option>
      </select>
     </div>
     {/* paratyphi AH */}
     <div className='form-group '>
      <label>paratyphi AH</label>
      <select className='custom-input' value={widal.paratyphiAH}
       onChange={(e) => setWidal({ ...widal, paratyphiAH: e.target.value })}>
       <option>select</option>
       <option value='1/20'>1/20</option>
       <option value='1/80'>1/80</option>
       <option value='1/160'>1/160</option>
      </select>
     </div>
     <div>
      <div className='form-group '>
       <label>comments</label>
       <textarea className='custom-textarea' value={widal.comment}
        onChange={(e) => setWidal({...widal,comment:e.target.value})}
       >

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