"use client"
import React, { useEffect, useState } from 'react';
import { customFetch } from '../../Auth/customFetch';
import { RiUserLine, RiPhoneLine, RiUserHeartLine, RiBriefcaseLine, RiMapPinLine } from '@remixicon/react';
import styles from './EmergencyContactViewOnly.module.css';
import EditButton from './EditButton';

interface EmergencyContact {
    keyid: number;
    patientid: number;
    emmergencyContactName: string;
    emmergencyContactNumber: string;
    relationship: string;
    occupation: string;
    address: string;
}

const EmergencyContactViewOnly = ({ patientid }: {patientid: string | number}) => {
    const [contactInfo, setContactInfo] = useState<EmergencyContact | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchContactInfo = async () => {
            try {
                const response = await customFetch(`register/emmergencycontactinformation?patientid=${patientid}`);
                setContactInfo(response.result);
            } catch (err) {
                setError('Failed to load emergency contact information');
                console.error('Error fetching emergency contact:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchContactInfo();
    }, [patientid]);

    if (loading) return <div className={styles.loading}><div className="spinner-border spinner-border-sm text-primary" role="status"></div></div>;
    if (error) return <div className={styles.error}>{error}</div>;
    if (!contactInfo) return <div className={styles.error}>No emergency contact available</div>;

    const contactItems = [
        { icon: <RiUserLine size={16} />, label: 'Name', value: contactInfo.emmergencyContactName },
        { icon: <RiPhoneLine size={16} />, label: 'Phone', value: contactInfo.emmergencyContactNumber },
        { icon: <RiUserHeartLine size={16} />, label: 'Relationship', value: contactInfo.relationship },
        { icon: <RiBriefcaseLine size={16} />, label: 'Occupation', value: contactInfo.occupation },
        { icon: <RiMapPinLine size={16} />, label: 'Address', value: contactInfo.address }
    ];

    return (
        <div className={styles.container}>
            <div className="d-flex justify-content-between">
                <div className={styles.header}>
                    <div className={styles.headerTitle}>Emergency Contact</div>
                </div>
                <div>
                    <EditButton patientid={patientid} section="emergency" />
                </div>
            </div>
            <div className={styles.infoGrid}>
                {contactItems.map((item, index) => (
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

export default EmergencyContactViewOnly;