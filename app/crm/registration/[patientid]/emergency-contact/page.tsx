"use client";
import React from 'react';
import { useParams } from 'next/navigation';
import RegistrationForm from '../../../../../components/registration/RegistrationForm';

export default function PageEmergencyContact() {
     const { patientid } = useParams();
     const id = patientid ? Number(patientid) : undefined;

     return (
          <div className="container-fluid px-2 py-2">
               <RegistrationForm patientid={id} initialStep={2} />
          </div>
     );
}
