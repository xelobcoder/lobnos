import React from 'react';
import CloseIcon from '@mui/icons-material/Close';
import { Container } from '@mui/material';
import { Button } from 'react-bootstrap';

export default function ADD_NEW_SUPPLIER({ newsupplier, controllerName, controllerCommodity, controllerAddress, handleSubmit, viewhandler, rawdata }) {
 const { name, commodity, address } = newsupplier;

 // send data to server


 return (
  <div style={{ marginTop: '20px' }}>
   <div id='newsupllier' className='mt-2='>
    <div id='close-btn'>
     <CloseIcon color='white'
      onClick={(ev) => viewhandler()}
      fontSize='medium'></CloseIcon>
    </div>
    <form>
     <div className='form-group'>
      <input className='custom-input' value={name} list='customers' name='name' placeholder='supplier name'
       onChange={(ev) => controllerName(ev, 'name')}
      />
      {/* using the datalsit to display list of all suplliers saved by the facility for easier entering  */}
      <datalist id='customers'>
       {
        rawdata.length === 0 ? null : (
         rawdata.map((item, index) => {
          return (
           <option key={index} value={item.name} />
          )
         })
        )
       }
      </datalist>
     </div>
     <div className='form-group'>
      <input className='custom-input' value={commodity} id='commodity' list='mycommodity' placeholder='commodity name'
       onChange={(ev) => controllerCommodity(ev, 'commodity')}
      />
      <datalist id='mycommodity'>
       {
        rawdata.length === 0 ? null : (
         rawdata.map((item, index) => {
          return (
           <option key={index} value={item.commodity} />
          )
         }
         )
        )
       }
      </datalist>

     </div>
     <div className='form-group'>
      <input className='custom-input' id='addx' value={address} placeholder='address' onChange={(ev) => controllerAddress(ev, 'address')}
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
