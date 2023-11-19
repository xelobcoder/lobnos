import React from 'react'
import SettingsLayout from '../../components/settingsComponents/SettingsLayout'
import PhelobotomySidebar from '../../components/PhelobotomySidebar'
export default function ReejectedSamplesPage() {
  return (
    <SettingsLayout sidebar={<PhelobotomySidebar />}>
      <div>
      <h1>Rejected Samples Page </h1>
    </div>
    </SettingsLayout>
  )
}
