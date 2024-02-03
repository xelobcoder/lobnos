import React, { useEffect, useState } from 'react'
import { customFetch } from '../Auth/customFetch';
import Image from 'next/image';


export default function CompanyHeaders({ details }) {
  const { email, phonenumber, website, address, name, alternativenumber } = details
  return (
    <div>
      <div className="company-logo">
        <div className="logo">
          <Image src={`${process.env.BASEURL}/settings/companyprofile/images`} width={100} height={100} alt="company Logo" />
        </div>
        <div>
          <div className="company-name">{name}</div>
          <div>
            {address} || {email} || {website}
          </div>
          <div>
            Contact us: 0{phonenumber} || 0{alternativenumber}
          </div>
        </div>
      </div>
    </div>
  )
}
