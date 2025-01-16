"use client"
import React from 'react'
import PatientFiltered from '../../../components/accessories/SectorFileringComponents/CustomerFiltering'
import { useRouter } from 'next/navigation'

export default function ConsultationgloFieldSettingsPage() {
     const router = useRouter();
     const handleSelectedPatient = (selected: any) => {
          const { patientid } = selected;
          if (patientid) {
               router.push(`/doctor/consultation/${patientid}`)
          }
     }

     return (
          <div>
               <PatientFiltered isDisabled={false} getSelectedPatient={handleSelectedPatient} />
          </div>
     )
}
