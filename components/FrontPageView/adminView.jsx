import React from 'react'
import Link from 'next/link';

export default function FrontPageAdminView() {
  return (
    <div>
      <ul style={{ display: 'grid', gridTemplateColumns: '30% 30% 30%', gridGap: '20px' }}>
        <Link className='bg-primary p-4  text-white text-center' href="/registration">
          Registration & Billing
        </Link>
        <Link className='bg-primary p-4  text-white text-center' href="/operations/laboratory">
          Laboratory
        </Link>
        <Link className='bg-primary p-4  text-white text-center' href="/operations/imaging/ultrasound">
          Imaging
        </Link>
        <Link className='bg-primary p-4  text-white text-center' href="/inventory">
          Inventory
        </Link>
        <Link className='bg-primary p-4  text-white text-center' href="/">
          Supplies
        </Link>
        <Link className='bg-primary p-4  text-white text-center' href="/settings/emailsetting">
          Email Management
        </Link>
        <Link className='bg-primary p-4  text-white text-center' href="/settings/sms">
          SMS Management
        </Link>
        <Link className='bg-primary p-4  text-white text-center' href="/instructions">
          Instructions
        </Link>
      </ul>
    </div>
  )
}
