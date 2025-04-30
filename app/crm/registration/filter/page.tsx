'use client';

import React from 'react';
import PatientFiltered from '../../../../components/accessories/SectorFileringComponents/CustomerFiltering';
import { useRouter } from 'next/navigation';

export default function FilterPage() {
    const router = useRouter();

    const handlePatientSelect = async (options: any) => {
        const hasPatientid = typeof options === "object" && options.hasOwnProperty("patientid");
        if (!hasPatientid) return;
        const { patientid } = options;

        router.push(`/registration?patientid=${patientid}`);
    };

    return (
        <div className="container py-4">
            <div className="row">
                <div className="col-lg-6 col-md-8 col-sm-12 mx-auto">
                    <h2 className="mb-4">Patient Search</h2>
                    <PatientFiltered 
                        getSelectedPatient={handlePatientSelect} 
                        isDisabled={false} 
                    />
                </div>
            </div>
        </div>
    );
}