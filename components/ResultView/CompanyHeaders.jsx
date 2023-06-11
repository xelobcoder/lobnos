import React, { useEffect, useState } from 'react'
import { customFetch } from '../Auth/customFetch';
import Image from 'next/image';


export default function CompanyHeaders() {
  return (
    <div>
      <div className='company-view-result'>
        <div className='logo'>
          <Image src={`${process.env.BASEURL}/settings/companyprofile/images`} width={100} height={100} alt='company Logo' />
        </div>
      </div>
    </div>
  )
}
