import React, { useState } from 'react'
import { Button, Typography } from '@mui/material';
import TableDisplay from '../accessories/TableDisplay';
import Accord from '../accessories/Accord';
import { useEffect } from 'react';

export default function PendingTableSample({ data, setShow,removeClient }) {
  // this is trigger after the pending sample list of a client becomes zero
  // this will remove the client from the sample list 

  return (
    <div>
      <div className='alert alert-info'>
        <span className='text-danger'>Note:</span> Please check the sample list before accepting or rejecting the sample. <br/>
        If pending count is greater than 0 and the sample list is empty please contact the lab admin, it means the sample was collected or received.
        kindly update that at the phelobotomy unit to proceed further. <br/>
       <em>At all time ,verify the pending count is equal to the sample list count</em>
      </div>

      {/* using mui accordion */}
      <div className='list-group'>
        {data.map((item, index) => {
          return (
            <Accord key={index} data={item}   removeClient={removeClient}/>
          )
        })}
      </div>
    </div>
  )
}
