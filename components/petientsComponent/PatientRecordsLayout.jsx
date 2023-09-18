import React from 'react'
import style from '../../styles/patients.module.css';
import Link from 'next/link';
export default function PatientRecordsLayout({ children }) {
  return (
    <>
      <ul className={style.ul} >
        <Link href={'/patients/update'} >personal Information</Link >
        <Link href={'/patients/update/address'}>Address Information</Link >
        <Link href={'/patients/update/resultsettings'} >Result settings</Link >
        <Link href={'/patients/update/credentials'}>credentials</Link >
      </ul>
      <div className='container'>
        {children}
      </div>
    </>
  )
}
