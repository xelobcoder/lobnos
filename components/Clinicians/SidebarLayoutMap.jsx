import React from 'react'
import SideBarMapView from './SideBarMapView'

export default function SidebarLayoutMap({ sidebar, children }) {
  return (
    <>
      <div className='wrapper'>
        <div className='side'>{sidebar}</div>
        <div className='main'>{children}</div>
      </div>
    </>
  )
}
