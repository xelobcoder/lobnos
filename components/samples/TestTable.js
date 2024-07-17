import { Typography } from '@mui/material'
import React from 'react'

export default function TestTable({ testsource }) {
  console.log(testsource)
  return (
    <>
      <div className='card br-7 m-3'>
        <div className='card-header'>
          <Typography variant='h6' className='btn btn-danger'>
            rejected test
          </Typography>
        </div>
        <div className='card-header '>
          <div className='d-flex justify-content-between'>
            <span>
              category
            </span>
            <span>
              testname
            </span>
          </div>
        </div>
        <div className='card-body p-0'>
          {testsource.map((item, index) => {
            return (
              <>
                <div style={{cursor:"pointer"}} className='list-group-item d-flex p-2 justify-content-between'>
                  <span>
                    {item.category}
                  </span>
                  <span>
                    {item.testname}
                  </span>
                </div>
              </>
            )
          })}
        </div>
      </div>
    </>
  )
}
