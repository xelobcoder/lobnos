import React from 'react'
import SettingsSidebarLayout from './sidebars'

export default function SettingsLayout({ children }) {
  return (
    <>
      <div>
        <div className='wrapper'>
          <div className='side'>
            <SettingsSidebarLayout />
          </div>
          <div className='main'>
            {children}
          </div>
        </div>
      </div>
    </>
  )
}
