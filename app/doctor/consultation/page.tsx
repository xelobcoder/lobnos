"use client"
import React from 'react'
import PatientFiltered from '../../../components/accessories/SectorFileringComponents/CustomerFiltering'
import { redirect } from 'next/navigation'

export default function ConsultationgloFieldSettingsPage() {
     const handleSelectedPatient = (selected: any) => {
          const { patientid } = selected;
          if (patientid) {
               redirect('/doctor/consultation/${patientid}')
          }
     }

     return (
          <div>
               <PatientFiltered isDisabled={false} getSelectedPatient={handleSelectedPatient} />
          </div>
     )
}
