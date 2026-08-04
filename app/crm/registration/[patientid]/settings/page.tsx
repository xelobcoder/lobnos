"use client";
import React from 'react';
import { useParams } from 'next/navigation';
import { FormProvider, useForm } from 'react-hook-form';
import PatientSettings from '../../../../../components/registration/PersonalRegistrationForms/PatientSettings';

export default function PageSettings() {
     const { patientid } = useParams();
     const id = patientid ? Number(patientid) : undefined;
     const methods = useForm({
          defaultValues: {
               mode: 'hardcopy',
               notify: false,
               method: 'None',
               authenticationMode: 'email',
          },
     });

     if (!id) {
          return <div className="container-fluid px-4 py-3">No patient selected.</div>;
     }

     return (
          <div className="container-fluid px-4 py-3">
               <FormProvider {...methods}>
                    <form onSubmit={(e) => e.preventDefault()}>
                         <PatientSettings patientid={id} />
                    </form>
               </FormProvider>
          </div>
     );
}
