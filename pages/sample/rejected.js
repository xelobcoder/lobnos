import React from 'react'
import SettingsLayout from '../../components/settingsComponents/SettingsLayout'
import LabSideBarComponents from '../../components/operations/labSideBarComponents'
import RejectedSamplesComponent from '../../components/samples/rejectedListView'
export default function RejectedSamplesPage() {



  return (
    <SettingsLayout sidebar={<LabSideBarComponents />}>
      <RejectedSamplesComponent />
    </SettingsLayout>
  )
}