import React from 'react'
import SettingsLayout from '../../components/settingsComponents/SettingsLayout'
import PhelobotomySidebar from '../../components/PhelobotomySidebar'
import RejectedSamplesComponent from '../../components/samples/rejectedListView'
export default function ReejectedSamplesPage() {
  return (
    <SettingsLayout sidebar={<PhelobotomySidebar />}>
      <RejectedSamplesComponent />
    </SettingsLayout>
  )
}
