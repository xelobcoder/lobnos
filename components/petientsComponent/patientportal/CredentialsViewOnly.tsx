"use client"
import React from 'react';
import { RiUserLine, RiLockLine } from '@remixicon/react';
import styles from './CredentialsViewOnly.module.css';
import EditButton from './EditButton';

const CredentialsViewOnly = ({patientid}) => {
    const credentialItems = [
        { icon: <RiUserLine size={16} />, label: 'Username', value: '••••••••' },
        { icon: <RiLockLine size={16} />, label: 'Password', value: '••••••••' }
    ];

    return (
        <div className={styles.container}>
            <div className="d-flex justify-content-between">
                <div className={styles.header}>
                    <div className={styles.headerTitle}>Login Credentials</div>
                </div>
                <div>
                    <EditButton patientid={patientid} section="credentials" />
                </div>
            </div>
            <div className={styles.infoGrid}>
                {credentialItems.map((item, index) => (
                    <div key={index} className={styles.infoItem}>
                        <span className={styles.icon}>{item.icon}</span>
                        <span className={styles.label}>{item.label}:</span>
                        <span className={styles.value}>{item.value}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CredentialsViewOnly;