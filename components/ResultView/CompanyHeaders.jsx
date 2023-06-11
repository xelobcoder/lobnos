import React, { useEffect, useState } from 'react'
import { customFetch } from '../Auth/customFetch';
import Image from 'next/image';


export default function CompanyHeaders({ details }) {
  return (
    <div>
      <div className='company-logo'>
        <div className='logo'>
          <Image src={`${process.env.BASEURL}/settings/companyprofile/images`} width={100} height={100} alt='company Logo' />
        </div>
        <div>
          <div className='company-name'>
            {details?.name}
          </div>
          <div>
            {details?.address} || {details?.email} || {details?.website}
          </div>
          <div>
            Contact us: 0{details?.phonenumber} || 0{details?.alternativenumber}
          </div>
        </div>
      </div>
    </div>
  )
}
