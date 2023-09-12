import React from 'react'
import SidebarLayoutMap from '../../components/Clinicians/SidebarLayoutMap'
import SideBarMapView from '../../components/Clinicians/SideBarMapView';
import { MedicalInformation, AddBox } from '@mui/icons-material';
import BasicInformationClinician from '../../components/Clinicians/BasicInformationClinician';

export default function NewClinicianPage() {
  const linkers = [
    { title: "clinicians", link: "/clinician", icon: <MedicalInformation /> },
    { title: "new clinician", link: "/clinician/new", icon: <AddBox /> },
  ];

  return (
    <SidebarLayoutMap sidebar={<SideBarMapView linkers={linkers} />}>
       <div className='container '>
          <h2 className='alert alert-info mt-2 text-capitalize'>add new clinician</h2>
          <BasicInformationClinician />
        </div>
    </SidebarLayoutMap>
  )
}
