import { RiAlarmWarningLine } from '@remixicon/react';
import React from 'react'

export default function Authorization() {
  return (
    <div className='container d-flex justify-content-center mt-2  ' >
      <div className='p-3 my-3 br-5 '>
        <div className='d-flex justify-content-center'>
          <RiAlarmWarningLine className="text-danger" style={{ height: '100px', width: '100px' }} />
        </div>
        <h1 className='text-danger'>Access Denied!!!!</h1>
      </div>
    </div>
  )
}
