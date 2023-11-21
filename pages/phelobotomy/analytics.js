import React from 'react'
import SettingsLayout from '../../components/settingsComponents/SettingsLayout'
import PhelobotomySidebar from '../../components/PhelobotomySidebar'

export default function PhelobotomyAnalyticPage() {
  return (
    <>
      <SettingsLayout sidebar={<PhelobotomySidebar />}>
        <h1>PhelobotomyAnalyticPage</h1>
        {/* time series of samples taken every one hour,
        samples taken by client, how many was totally rejeccted and accepted, how many samples are in 
        dispute */}
      </SettingsLayout>
    </>
  )
}