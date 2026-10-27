"use client"
import React from 'react'
import OrganizationBasicForm from '../../../components/organization/BasicOrganizationForm';
import Link from 'next/link';
import styles from '../../../components/organization/OrganizationWorkspace.module.css';

export default function Index() {
  return (
    <main className={styles.workspace}>
      <Link href="/organization" className={styles.back}>← Organizations</Link>
      <header className={styles.header}><div><span className={styles.eyebrow}>REFERRAL PARTNERS</span><h1>Add an organization</h1><p>Record the organization’s contact and location details. You can manage contact people and payment arrangements after saving.</p></div></header>
      <section className={styles.formPanel}><OrganizationBasicForm organizationid={null} /></section>
    </main>
  );
}
