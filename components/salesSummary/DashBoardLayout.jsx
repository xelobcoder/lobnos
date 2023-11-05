import React from 'react'
import SettingsLayout from '../settingsComponents/SettingsLayout'
import DashboardSidebar from './DashboardSidebar'

export default function DashBoardLayoutSales({ children }) {
  return (
    <>
      <SettingsLayout sidebar={<DashboardSidebar />}>
        <div className='px-2'>{children}</div>
      </SettingsLayout>
    </>
  )
}
