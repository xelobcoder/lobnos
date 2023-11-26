import React from 'react'
import SettingsLayout from "../../components/settingsComponents/SettingsLayout";
import SidebarFrontPage from '../../components/frontpagesidebar';

export default function Appointment() {
  return (
    <>
      <SettingsLayout sidebar={<SidebarFrontPage />}>
        <embed src="http://localhost:5000/billing/result/pdf?billingid=206&&testname=syphilis&&testid=57" type='application/pdf'
          width="100%" height="100%" style={{ border: 0 }} allowfullscreen="" loading="lazy"></embed>
      </SettingsLayout>
    </>
  )
}


