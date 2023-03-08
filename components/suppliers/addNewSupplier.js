import React from 'react';
import CloseIcon from '@mui/icons-material/Close';
import { Container } from '@mui/material';
import { Button } from 'react-bootstrap';

export default function ADD_NEW_SUPPLIER({ newsupplier, controllerName, controllerCommodity, controllerAddress, handleSubmit ,viewhandler}) {
 const { name, commodity, address } = newsupplier;

 // send data to server


 return (
  <div style={{ marginTop: '20px' }}>
   <div id='newsupllier' className='mt-2='>
    <div id='close-btn'>
     <CloseIcon color='white' 
     onClick= {(ev) => viewhandler()}
     fontSize='medium'></CloseIcon>
    </div>
    <form>
     <div className='form-group'>
      <input className='form-control' value={name} id='name' placeholder='supplier name'
       onChange={(ev) => controllerName(ev, 'name')}
      />
     </div>
     <div className='form-group'>
      <input className='form-control' value={commodity} id='commodity' placeholder='commodity name'
       onChange={(ev) => controllerCommodity(ev, 'commodity')}
      />
     </div>
     <div className='form-group'>
      <input className='form-control' id='addx' value={address} placeholder='address' onChange={(ev) => controllerAddress(ev, 'address')}
      />
     </div>
     <div className='form-group'>
      <Button onClick={(ev) => handleSubmit(ev)}>submit</Button>
     </div>
    </form>
   </div>
  </div>
 )
}
