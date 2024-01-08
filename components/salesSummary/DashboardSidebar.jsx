import React from 'react'
import { AssignmentInd, House } from '@mui/icons-material'
import Link from 'next/link'
export default function DashboardSidebar({auth}) {
  const { email, username, role } = auth;
  return (
    <>
      <div className='settings-sidebar'>
      <div className='head'>
        <Link  href={'/'} >
            PLS
          </Link>
        </div>
        <div className='user'>
          <span>{username}({role})</span>
        </div>
        <div className='contents'>
          <ul>
            <li>
              <div className='icons'>
                <AssignmentInd />
              </div>
              <div className='text'>
                <Link title='registration' href="/dashboard" >
                  sales
                </Link>
              </div>
            </li>
            <li>
              <div className='icons'>
                <House/>
              </div>
              <div className='text'>
                <Link title='registration' href="/dashboard/organization" >
                  organization
                </Link>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </>
  )
}
