import React from 'react'

export default function CompanyFooter({ details }) {
  return (
    <div className='company-view-result'>
      <div className='wrapper'>
        <div className='line'>
          {details?.name}  {details?.address}  {details?.street}
        </div>
        <div className='line'>
          0{details?.phonenumber} || 0{details?.alternativenumber} || {details?.website}
        </div>
        <div className='line'>
          {details?.motto}
        </div>
      </div>
    </div>
  )
}
