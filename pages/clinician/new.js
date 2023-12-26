import React from 'react'
import BasicInformationClinician from '../../components/Clinicians/BasicInformationClinician';
import SettingsLayout from '../../components/settingsComponents/SettingsLayout';
import SidebarFrontPage from '../../components/frontpagesidebar';

export default function NewClinicianPage() {

  return (
    <SettingsLayout sidebar={<SidebarFrontPage />}>
       <div className='card mx-2 my-2'>
          <div className='card-header bg-secondary text-white'>
            <h4>New clinician</h4>
          </div>
          <div className='card-body'>
            <BasicInformationClinician />
          </div>
       </div>
  </SettingsLayout>
  )
}
