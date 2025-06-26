'use client';

import React from 'react';
import PatientFiltered from '../accessories/SectorFileringComponents/CustomerFiltering';

interface FilterClientProps {
    getSelectedPatient: (options: any) => Promise<void>;
}

export const FilterClient = ({ getSelectedPatient }: FilterClientProps) => {
    return (
        <div className="col-lg-4 col-md-8 col-sm-12 mb-4">
            <PatientFiltered getSelectedPatient={getSelectedPatient} isDisabled={false} />
        </div>
    );
};