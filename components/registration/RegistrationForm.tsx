'use client';

import RegistrationWizard from "./RegistrationWizard";

export default function RegistrationForm({ patientid, initialStep }: { patientid?: number; initialStep?: number }) {
    return (
        <RegistrationWizard initialPatientId={patientid} initialStep={initialStep} />
    );
}