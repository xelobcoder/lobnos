import React from 'react'
import PatientRecordsLayout from '../../../components/petientsComponent/PatientRecordsLayout'
import PatientResultSettings from '../../../components/petientsComponent/PatientResultSettings'

export default function ResultsettingsPatient() {
  return (
    <>
      <PatientRecordsLayout>
        <PatientResultSettings />
      </PatientRecordsLayout>
    </>
  )
}
