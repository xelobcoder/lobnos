import React from 'react'
import SettingsLayout from "../../components/settingsComponents/SettingsLayout";
import SidebarFrontPage from '../../components/frontpagesidebar';

export default function Appointment() {
  return (
    <>
      <SettingsLayout sidebar={<SidebarFrontPage />}>
        <embed src="http://localhost:5000/billing/result/pdf?billingid=288&&testid=10&&testname=liver_function_test" type='application/pdf'
          width="100%" height="100%" style={{ border: 50 }} allowfullscreen="" loading="lazy"></embed>
      </SettingsLayout>
    </>
  )
}


