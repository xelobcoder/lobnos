import React from 'react'
import { AssignmentInd } from '@mui/icons-material'
import Link from 'next/link'
export default function DashboardSidebar() {
  return (
    <>
      <div className='settings-sidebar'>
        <div className='contents'>
          <ul>
            <li>
              <div className='icons'>
                <AssignmentInd />
              </div>
              <div className='text'>
                <Link title='registration' href="/billing/payment/sales" >
                  Registration
                </Link>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </>
  )
}
