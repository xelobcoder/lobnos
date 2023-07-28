import React from 'react'
import Header from '../header'
import SettingsSidebar from './sidebars'

export default function SettingsLayout({ children }) {
  return (
    <>
      <div>
        <div className='wrapper'>
          <div className='side'>
            <SettingsSidebar />
          </div>
          <div className='main'>
            {children}
          </div>
        </div>
      </div>
    </>
  )
}
