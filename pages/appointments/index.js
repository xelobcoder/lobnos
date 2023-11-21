import React from 'react'
import SettingsLayout from "../../components/settingsComponents/SettingsLayout";
import SidebarFrontPage from '../../components/frontpagesidebar';

export default function Appointment() {
  return (
    <>
      <SettingsLayout sidebar={<SidebarFrontPage />}>
        <h1>Appointment</h1>
        <div style={{ marginLeft: '5%', marginRight: '5%', height: '100%' }} >
          <embed width='100%' height='90%' src='http://localhost:5000/billing/receipt?billingid=196&&testid=5&&testname=cardiac_enzymes'>
          </embed>
        </div>
      </SettingsLayout>
    </>
  )
}


