import React from 'react'
import PatientRecordsLayout from '../../../components/petientsComponent/PatientRecordsLayout'
import PatientCredentialsUpdate from '../../../components/petientsComponent/PatientCredentialsUpdate'

export default function PatientCredentialsInformation() {
  return (
    <>
      <PatientRecordsLayout>
        <PatientCredentialsUpdate />
      </PatientRecordsLayout>
    </>
  )
}
