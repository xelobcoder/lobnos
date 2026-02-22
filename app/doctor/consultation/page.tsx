"use client"
import React from 'react'
import PatientFiltered from '../../../components/accessories/SectorFileringComponents/CustomerFiltering'
import {useRouter} from 'next/navigation'
import { plsEncryption } from '../../../lib/encryption';

export default function ConsultationgloFieldSettingsPage() {
     const router = useRouter();
     const handleSelectedPatient = (selected: any) => {
          if (selected && selected?.patientid) {
               const patientid = selected.patientid;
               router.push(`/doctor/consultation/${plsEncryption(patientid.toString())}`);
          }
     }

     return (
          <div className='col-5'>
               <PatientFiltered isDisabled={false} getSelectedPatient={handleSelectedPatient} />
          </div>
     )
}
