import React from 'react'
import BasicInformationClinician from '../../../components/Clinicians/BasicInformationClinician'
import SettingsLayout from '../../../components/settingsComponents/SettingsLayout'
import SidebarFrontPage from '../../../components/frontpagesidebar'
export default function ClinicianUpdateForm() {

  return (
    <SettingsLayout sidebar={<SidebarFrontPage />}>
       <div className='card mx-2 my-2'>
            <div className='card-header bg-secondary text-white'>
              <h4>Update Basic information</h4>
            </div>
            <div className='card-body'>
            <BasicInformationClinician />
            </div>
        </div>
    </SettingsLayout>
  )
}
