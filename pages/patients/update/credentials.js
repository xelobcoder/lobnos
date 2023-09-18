import React from 'react'
import PatientRecordsLayout from '../../../components/petientsComponent/PatientRecordsLayout'
import PatientCredentialsUpdate from '../../../components/petientsComponent/PatientCredentialsUpdate'
import { CreditCardOutlined, Password } from '@mui/icons-material'

export default function PatientCredentialsInformation() {
  return (
    <>
      <PatientRecordsLayout>
        <h3><Password color='error'/> {" "}Add credentials</h3>
        <PatientCredentialsUpdate />
      </PatientRecordsLayout>
    </>
  )
}
