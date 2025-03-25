"use client"
import React, { useEffect, useState } from 'react';
import { customFetch } from '../../Auth/customFetch';
import { RiBellLine, RiMailLine, RiCheckLine, RiCloseLine, RiShieldLine } from '@remixicon/react';
import styles from './CommunicationsViewOnly.module.css';

interface NotificationSettings {
    id: number;
    patientid: number;
    mode: string;
    method: string;
    notify: number;
    _read: boolean | null;
    read_on: string | null;
    authenticated: number;
    authenticationMode: string | null;
    emailAuthenticated: string;
}

const CommunicationsViewOnly = ({ patientid }) => {
    const [settings, setSettings] = useState<NotificationSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await customFetch(`patients/notifications?patientid=${patientid}`);
                setSettings(response);
            } catch (err) {
                setError('Failed to load notification settings');
                console.error('Error fetching settings:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchSettings();
    }, [patientid]);

    if (loading) return <div className={styles.loading}><div className="spinner-border spinner-border-sm text-primary" role="status"></div></div>;
    if (error) return <div className={styles.error}>{error}</div>;
    if (!settings) return <div className={styles.error}>No notification settings available</div>;

    const getStatusIcon = (value: number | string) => {
        return value === 1 || value === "true" ? 
            <RiCheckLine size={16} className={styles.statusIconEnabled} /> : 
            <RiCloseLine size={16} className={styles.statusIconDisabled} />;
    };

    const settingsItems = [
        { icon: <RiBellLine size={16} />, label: 'Notifications', value: settings.notify === 1 ? 'Enabled' : 'Disabled', status: getStatusIcon(settings.notify) },
        { icon: <RiMailLine size={16} />, label: 'Mode', value: settings.mode || 'Not set' },
        { icon: <RiMailLine size={16} />, label: 'Method', value: settings.method || 'Not set' },
        { icon: <RiShieldLine size={16} />, label: 'Authentication', value: settings.authenticated === 1 ? 'Enabled' : 'Disabled', status: getStatusIcon(settings.authenticated) },
        { icon: <RiMailLine size={16} />, label: 'Email Auth', value: settings.emailAuthenticated === 'true' ? 'Verified' : 'Not Verified', status: getStatusIcon(settings.emailAuthenticated) }
    ];

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.headerTitle}>Communication Settings</div>
            </div>
            <div className={styles.infoGrid}>
                {settingsItems.map((item, index) => (
                    <div key={index} className={styles.infoItem}>
                        <span className={styles.icon}>{item.icon}</span>
                        <span className={styles.label}>{item.label}:</span>
                        <span className={styles.value}>{item.value}</span>
                        {item.status && <span className={styles.status}>{item.status}</span>}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CommunicationsViewOnly;