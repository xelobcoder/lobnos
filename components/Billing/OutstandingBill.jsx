import React from 'react'

export default function ClientOutstandingBill() {
  return (
    <div className='container pointer d-flex'>
      <div>
        Amount last Dued:400 
      </div>
      <div>
        || Amount Paid:343
      </div>
      <div className='text-danger'>
        || Outstanding Debt: 57.00
      </div>
      <div>
        ||Last Transaction: 12/12/2022
      </div>

    </div>
  )
}
