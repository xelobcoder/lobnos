import { AnalyticsSharp, Home, ProductionQuantityLimits, Queue } from '@mui/icons-material'
import Link from 'next/link'
import React from 'react'

export default function UltrasoundHomePage() {
  return (
    <div>
      <h1 className='text-center'>{new Date().toDateString()}</h1>
      <h2 className='text-center text-success'>---------------Ultrasound Department <Home fontSize='large' /> -----------------</h2>
      <div className='container d-flex justify-content-between' >
        <Link href={'./ultrasound/waitinglist'}>
          <button className='btn btn-primary p-5'>
            <Queue />
            <h4 className='text-capitalize'>waiting list</h4>
          </button>
        </Link>
        <Link href={'./ultrasound/processedlist'}>
          <button className='btn btn-warning p-5'>
            <ProductionQuantityLimits />
            <h4 className='text-capitalize'>Processed list</h4>
          </button>
        </Link>

        <button className='btn btn-secondary p-5'>
          <AnalyticsSharp />
          <h4 className='text-capitalize'>Analytics || charts</h4>
        </button>
      </div>
    </div>
  )
}
