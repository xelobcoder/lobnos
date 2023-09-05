import React from 'react'
import VersionFooter from '../accessories/VersionFooter';
export default function CompanyFooter({ details }) {
  return (
    <>
      <div className='company-view-result'>
        <div className='wrapper'>
          <div className='line d-flex text-center'>
            {details?.name}  {details?.address}  {details?.street}
          </div>
          {/* <div className='line'>
            0{details?.phonenumber} || 0{details?.alternativenumber} || {details?.website}
          </div> */}
          <div className='line'>
            {details?.motto}
          </div>
        </div>
      </div>
      <VersionFooter/>
    </>
  )
}
