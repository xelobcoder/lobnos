import React from 'react'
import BasicInformationClinician from '../../../components/Clinicians/BasicInformationClinician'
import SideBarMapView from '../../../components/Clinicians/SideBarMapView'
import SidebarLayoutMap from '../../../components/Clinicians/SidebarLayoutMap'
import { MedicalInformation, AddBox } from '@mui/icons-material'
export default function ClinicianUpdateForm() {
  const linkers = [
    { title: "clinicians", link: "/clinician", icon: <MedicalInformation /> },
    { title: "new clinician", link: "/clinician/new", icon: <AddBox /> },
  ];
  return (
    <>
      <SidebarLayoutMap sidebar={<SideBarMapView linkers={linkers} />}>
        <div className='container '>
          <h2 className='alert alert-info mt-2 text-capitalize'>Update clinician information</h2>
          <BasicInformationClinician />
        </div>
      </SidebarLayoutMap>
    </>
  )
}
