import { useState } from 'react';
import { Input } from '@mui/material';
import CheckBox from '@mui/material';
function TEST_DETAILS({ data }) {

 const dessociate = (test) => {
  return test.split(',');
 }

 const Listing = () => {
   return dessociate(data).map((item, index) => {
      return (
        <>
          <ul key={index} className="list-group">
            <li className='list-group-item' style={{borderRadius:'0px'}}>
              <div className="1">{index + 1}</div>
              <div>{item}</div>
            </li>
          </ul>
        </>
      )
    })
 }

 return (
  <>
   <h2>test details</h2>
   <hr></hr>
   <label> select all  <input type='checkbox' /></label>
   <ul>
    {
     <Listing test={data} />
    }
   </ul>
  </>
 )
}



export default TEST_DETAILS;