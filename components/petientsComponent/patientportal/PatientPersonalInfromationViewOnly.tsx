"use client"
import React, { useEffect, useState } from 'react';
import { fetchPatientPersonalInfo } from '../../Auth/customFetch';
import { RiUser3Line, RiCalendarLine, RiMailLine, RiPhoneLine, RiWhatsappLine, RiUserHeartLine, RiBriefcaseLine, RiIdCardLine, RiEditLine } from '@remixicon/react';
import styles from './PatientPersonalInformationViewOnly.module.css';

interface PersonalInformation {
    patientid: number;
    fullpatientid: string;
    designation: string;
    firstname: string;
    lastname: string;
    middlename: string;
    email: string;
    dob: string;
    age: number;
    gender: string;
    occupation: string;
    maritalstatus: string;
    mobile: number;
    whatappcontact: string;
    patientOrganization: string;
}

const PatientPersonalInformationViewOnly = ({ patientid }: {patientid: string | number}) => {
    const [personalInfo, setPersonalInfo] = useState<PersonalInformation | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchPatientPersonalInfo(patientid)
            .then((response: any) => {
                if (response?.result) {
                    setPersonalInfo(response.result);
                    setError(null);
                } else {
                    setPersonalInfo(null);
                    setError('No personal information available');
                }
                setLoading(false)
            }).catch((err) => {
                setLoading(false);
                setError('Failed to load personal information');
            })
    }, [patientid]);

    if (loading) return <div className={styles.loading}><div className="spinner-border spinner-border-sm text-primary" role="status"></div></div>;
    if (error) return <div className={styles.error}>{error}</div>;
    if (!personalInfo) return <div className={styles.error}>No personal information available</div>;

    const infoItems = [
        { icon: <RiIdCardLine size={16} />, label: 'Patient ID', value: personalInfo.fullpatientid },
        { icon: <RiUser3Line size={16} />, label: 'Name', value: `${personalInfo.designation || ''} ${personalInfo.firstname || ''} ${personalInfo.lastname || ''}` },
        { icon: <RiCalendarLine size={16} />, label: 'Birth Date', value: personalInfo.dob ? new Date(personalInfo.dob).toLocaleDateString() : '-' },
        { icon: <RiUser3Line size={16} />, label: 'Gender', value: personalInfo.gender },
        { icon: <RiPhoneLine size={16} />, label: 'Phone', value: personalInfo.mobile },
        { icon: <RiWhatsappLine size={16} />, label: 'WhatsApp', value: personalInfo.whatappcontact },
        { icon: <RiMailLine size={16} />, label: 'Email', value: personalInfo.email },
        { icon: <RiUserHeartLine size={16} />, label: 'Marital', value: personalInfo.maritalstatus },
        { icon: <RiBriefcaseLine size={16} />, label: 'Occupation', value: personalInfo.occupation }
    ];

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.headerTitle}>Personal Information</div>
                <a href={`/crm/registration/${patientid}/personal-information`}
                    className={styles.editButton}>
                    <RiEditLine size={16} />
                </a>
            </div>
            <div className={styles.infoGrid}>
                {infoItems.map((item, index) => (
                    <div key={index} className={styles.infoItem}>
                        <span className={styles.icon}>{item.icon}</span>
                        <span className={styles.label}>{item.label}:</span>
                        <span className={styles.value}>{item.value || '-'}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PatientPersonalInformationViewOnly;
