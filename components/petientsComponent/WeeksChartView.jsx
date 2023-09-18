import dynamic from 'next/dynamic';
import React, { useImperativeHandle, forwardRef, useState, useContext } from 'react'
import { PatientContext } from '../../pages/patients';



export default function ChartView() {
  const { initials, updateInitials } = useContext(PatientContext);
  const { displayChart, chartTarget, rerunChart } = initials;
  console.log(initials)
  return (
    <>
      {displayChart &&
        <div className='mt-1 mb-2'>
         
        </div>
      }
    </>
  )
}


