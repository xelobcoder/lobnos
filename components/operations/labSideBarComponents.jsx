import React from 'react'
import Link from 'next/link'
import { Science, LocalHospital, History } from '@mui/icons-material'
export default function LabSideBarComponents() {
  return (
    <div className='settings-sidebar'>
      <div className='contents'>
        <ul>
          <li>
            <div className='icons'>
              <LocalHospital />
            </div>
            <div className='text'>
              <Link href="/phelobotomy">
                Phelobotomy
              </Link>
            </div>
          </li>
          <li>
            <div className='icons'>
              <Science />
            </div>
            <div className='text'>
              <Link href="/sample">
                Sample
              </Link>
            </div>
          </li>
          <li>
            <div className='icons'>
              <History />
            </div>
            <div className='text'>
              <Link href="/operations/enteredresult">
                Entered results
              </Link>
            </div>
          </li>
        </ul>
      </div>
    </div>
  )
}
