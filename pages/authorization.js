import { Dangerous } from '@mui/icons-material'
import React from 'react'

export default function Authorization() {
  return (
    <div className='container d-flex justify-content-center mt-2  ' >
      <div className='p-3 my-3 br-5 '>
        <div className='d-flex justify-content-center'>
          <Dangerous color='error' sx={{ height: '100px', width: '100px' }} />
        </div>
        <h1 className='text-danger'>Please you do not have the Authorization to view this page</h1>
      </div>
    </div>
  )
}
