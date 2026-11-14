"use client";

import { useParams } from 'next/navigation';
import RegistrationForm from '../../../../../components/registration/RegistrationForm';

export default function PhoneContactsPage() {
     const { patientid } = useParams<{ patientid: string }>();

     return (
          <div className="container-fluid px-2 py-2">
               <RegistrationForm patientid={Number(patientid)} initialStep={1} />
          </div>
     );
}
