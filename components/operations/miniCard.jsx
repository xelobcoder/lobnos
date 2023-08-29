import React from 'react';
import { useRouter } from 'next/router';

export default function MiniCard({ colorIndex, size, icon, text, number, link }) {
  const colorview = {
    0: 'bg-primary text-white',
    1: 'bg-warning text-white',
    2: 'bg-success text-white',
    3: 'bg-info text-white',
    4: 'bg-secondary text-white',
    5: 'bg-danger text-white',
    6: 'bg-primary text-white',
    7: 'bg-success text-white',
    8: 'bg-primary text-white',
    9: 'bg-secondary text-white'
  }

  const router = useRouter();
  return (
    <div className={`minicard  ${colorview[colorIndex]}`} onClick={() => router.push(link)}>
      <div className={`icon`}>
        {icon}
      </div>
      <div className='mini-rest'>
        <div className='text'>
          {text}
        </div>
        <div className='number'>
          {number == 1 ? `${number} case pending ` : `${number} cases pending`}
        </div>
      </div>
    </div>
  )
}
