import React from 'react'
import style from '../../styles/patients.module.css';
import Link from 'next/link';
import { useRouter } from 'next/router';
export default function PatientRecordsLayout({ children }) {
  const patientid = useRouter().query.update;

  return (
    <>
      <ul className={style.ul} >
        <Link href={'/patients'}>Dashboard</Link>
        <Link href={`/patients/${patientid}`} >personal Information</Link >
        <Link href={`/patients/${patientid}/address`}>Address Information</Link >
        <Link href={`/patients/${patientid}/resultsettings`} >results settings</Link >
        <Link href={`/patients/${patientid}/credentials`}>credentials</Link >
      </ul>
      <div className='container'>
        {children}
      </div>
    </>
  )
}
