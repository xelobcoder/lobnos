import React from 'react'
import ClinicianFiltering from '../../../components/accessories/SectorFileringComponents/ClinicianFiltering'
import { handleSelectionClinicianAnalytics } from '../../../components/serverActions/ActionFiltering'

export default function ClinicianAnalytics() {
   
    return (
        <div className='col-4'>
            <ClinicianFiltering onSelect={handleSelectionClinicianAnalytics} />
        </div>
    )
}
