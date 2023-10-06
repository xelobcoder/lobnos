import React from 'react'
import OrganizationList from '../../components/organization/List'
import SettingsLayout from '../../components/settingsComponents/SettingsLayout'
import SidebarFrontPage from '../../components/frontpagesidebar'


export default function OrganizationMainPage() {
  return (
    <div>
      <SettingsLayout sidebar={<SidebarFrontPage />}>
        <OrganizationList />
      </SettingsLayout>
    </div>
  )
}
