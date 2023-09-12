import Link from 'next/link'
import React from 'react'

export default function SideBarMapView({linkers}) {
  return (
    <div id='sidebarmap'>
      <ul>
        {
          linkers.map((item, index) => {
            return (
              <Link key={index} href={item.link} className='linker'>
                <div className='content'>
                  <span>{item.icon}</span>
                  <span>{item.title}</span>
                </div>
              </Link>
            )
          })
        }
      </ul>
    </div>
  )
}
