import { Shop2Outlined, ShoppingBag } from '@mui/icons-material'
import React from 'react'

export default function TopComponentBillingButton({cart}) {
  return (
    <div className='container d-flex justify-content-end mt-2 gap-2'>
      <button className='btn btn-success'>
        snap organization
      </button>
      <button className='btn btn-success'>
        snap clinician
      </button>
      <button className='btn btn-light text-primary'>
        cart <ShoppingBag/>
        <span className='badge primary'>{cart} </span>
      </button>
    </div>
  )
}
