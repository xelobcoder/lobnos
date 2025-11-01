'use client'
import React from 'react'
import { useRouter } from 'next/navigation'
import ClinicianFiltering from '../../../components/accessories/SectorFileringComponents/ClinicianFiltering';

export default function ClinicianAnalytics() {
    const router = useRouter();

    const handleSelectionClinicianAnalytics = (value: any) => {
        if (!value || !value?.id) return;
        router.push(`/clinicians-analytics/${value?.id}/overall`);
    }
    return (
        <div className='col-4'>
            <ClinicianFiltering onSelect={handleSelectionClinicianAnalytics} isBulk={true} />
        </div>
    )
}
