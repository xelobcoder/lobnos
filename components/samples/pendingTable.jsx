import React, { useState } from 'react'
import { Button, Typography } from '@mui/material';
import TableDisplay from '../accessories/TableDisplay';
import Accord from '../accessories/Accord';

export default function PendingTableSample({ data, approvalStatus }) {
 

  return (
    <div>
      <div className='alert alert-info'>
        <span className='text-danger'>Note:</span> Please check the sample list before accepting or rejecting the sample
      </div>

      {/* using mui accoridon */}
      <diov className='list-group'>
        {data.map((item, index) => {
          return (
            <Accord key={index} data={item}  statusHandler={approvalStatus}/>
          )
        })}
      </diov>
    </div>
  )
}
