import React from 'react'
import Link from 'next/link'
export default function FrontPageSonographerView() {
  return (
    <div>
      <ul style={{ display: 'grid', gridTemplateColumns: '30% 30% 30%', gridGap: '20px' }}>
        <Link className='bg-primary p-4  text-white text-center' href="/operations/imaging/ultrasound">
          Imaging
        </Link>
        <Link className='bg-primary p-4  text-white text-center' href="/instructions">
          Instructions
        </Link>
      </ul>
    </div>
  )
}
