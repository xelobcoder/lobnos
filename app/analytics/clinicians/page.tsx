'use client'
import React from 'react'
import ClinicianFiltering from '../../../components/accessories/SectorFileringComponents/ClinicianFiltering'
import { useRouter } from 'next/navigation'

export default function ClinicianAnalytics() {
    const router = useRouter();

    const handleSelectionClinicianAnalytics = (value: any) => {
        if (!value || !value?.id) return;
        router.push(`/analytics/clinicians/${value?.id}/overall`);
    }
    return (
        <div className='col-4'>
            <ClinicianFiltering onSelect={handleSelectionClinicianAnalytics} isBulk={true} />
        </div>
    )
}
