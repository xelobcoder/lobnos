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
          Laboratory Operations
        </Link>
        <Link className='bg-primary p-4  text-white text-center' href="/operations/imaging/ultrasound">
          Medical Imaging
        </Link>
        <Link className='bg-primary p-4  text-white text-center' href="/phelobotomy">
          Phelobotomy
        </Link>
        <Link className='bg-primary p-4  text-white text-center' href="/administration/approval">
          Result Approval
        </Link>
        <Link className='bg-primary p-4  text-white text-center' href="/inventory">
          Inventory Mangement
        </Link>
        <Link className='bg-primary p-4  text-white text-center' href="/supplier">
          Purchase Mangement
        </Link>
        <Link className='bg-primary p-4  text-white text-center' href="/dashboard">
          DashBoard 
        </Link>
        <Link className='bg-primary p-4  text-white text-center' href="/settings/applicationsettings">
         Application Settings
        </Link>
        <Link className='bg-primary p-4  text-white text-center' href="/instructions">
          Instructions
        </Link>
      </ul>
    </div>
  )
}
