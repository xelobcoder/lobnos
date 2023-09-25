import React from 'react'
import SettingsSidebarLayout from './sidebars'

export default function SettingsLayout({ children, sidebar }) {
  return (
    <>
      <div>
        <div className='wrapper'>
          <div className='side'>
            {sidebar || <SettingsSidebarLayout />}
          </div>
          <div className='main'>
            {children}
          </div>
        </div>
      </div>
    </>
  )
}
