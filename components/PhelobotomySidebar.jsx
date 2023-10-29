import React from 'react'
import Link from 'next/link'
import { Analytics, Book, CalendarMonth } from '@mui/icons-material'
export default function PhelobotomySidebar() {
  return (
    <div className='settings-sidebar'>
      <div className='contents'>
        <ul>
          <li>
            <div className='icons'>
              <CalendarMonth />
            </div>
            <div className='text'>
              <Link href="/phelobotomy">
                phelobotomy
              </Link>
            </div>
          </li>
          <li>
            <div className='icons'>
              <Book />
            </div>
            <div className='text'>
              <Link href="/phelobotomy/rejected">
                rejected samples
              </Link>
            </div>
          </li>
          <li>
            <div className='icons'>
              <Analytics/>
            </div>
            <div className='text'>
              <Link href="/phelobotomy/analytics">
                Analytics
              </Link>
            </div>
          </li>
        </ul>
      </div>
    </div>
  )
}
