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
        <Link className='bg-primary p-4  text-white text-center' href="/dashboard">
          DashBoard 
        </Link>
        <Link className='bg-primary p-4  text-white text-center' href="/authentication/users">
          Users
        </Link>
        <Link className='bg-primary p-4  text-white text-center' href="/settings/applicationsettings">
         Application Settings
        </Link>
        <Link aria-disabled className='bg-primary p-4  text-white text-center' href="/expense/expenseslist">
          Expenses
        </Link>
        <Link aria-disabled className='bg-secondary p-4  text-white text-center' href="/upgrade">
          Inventory Mangement
        </Link>
        <Link className='bg-secondary p-4  text-white text-center' href="/upgrade" >
          Purchase Mangement
        </Link>
        <Link className='bg-secondary p-4  text-white text-center' href="/upgrade">
          Result Analysis
        </Link>
        <Link className='bg-secondary p-4  text-white text-center' href="/upgrade">
           Email Services
        </Link>
        <Link className='bg-secondary p-4  text-white text-center' href="/upgrade">
          {" Doctor's"} Portal
        </Link>
        <Link className='bg-secondary p-4  text-white text-center' href="/upgrade">
          {" Patient's"} Portal
        </Link>

        {/* <Link className='bg-secondary p-4  text-white text-center' href="/instructions">
          Instructions
        </Link> */}
      </ul>
    </div>
  )
}
