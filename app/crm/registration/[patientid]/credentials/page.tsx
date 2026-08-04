"use client";
import React from 'react';
import { useParams } from 'next/navigation';
import PatientCredentials from '../../../../../components/registration/PersonalRegistrationForms/PatientCredentials';
import { toast } from 'react-toastify';

export default function PageCredentials() {
     const { patientid } = useParams();
     const id = patientid ? Number(patientid) : undefined;

     if (!id) {
          return <div className="container-fluid px-4 py-3">No patient selected.</div>;
     }

     return (
          <div className="container-fluid px-4 py-3">
               <PatientCredentials patientid={id} />
          </div>
     );
}
