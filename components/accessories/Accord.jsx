import { ArrowDropDown } from "@mui/icons-material"
import { IconButton } from "@mui/material"

import React, { useState } from 'react'

export default function Accord({ data }) {
  console.log(data)
  const [show, setShow] = useState(false);
  return (
    <>
      <div className='list-group-item'>
        <div className="first-row">
          <div className='accord-grid'  >
            <IconButton 
            color="primary"
            size='small'
            
            onClick={() => setShow(!show)}>
              <ArrowDropDown />
            </IconButton>
            <h6>
              {data.FULLNAME}
            </h6>
            <div>
              <span className="badge bg-warning p-2 rounded-pill">
                {data.SAMPLE_STATUS}
              </span>
            </div>
            <h6>
              {data.BILLINGID}
            </h6>
            <h6>
              {data.DATE.slice(0, 10)}
            </h6>
          </div>
        </div>
        {show && <div className="second-row">
          <div className="card rounded">
            <div className="card-header">
              <h6>Sample list</h6>
            </div>
            <div className="card-body">

            </div>
          </div>
        </div>}
      </div>
    </>
  )
}
