"use client"
import React, { useEffect, useState } from 'react';
import { customFetch } from '../../Auth/customFetch';
import { RiMapPinLine, RiBuilding2Line, RiRoadMapLine } from '@remixicon/react';
import styles from './AddressViewOnly.module.css';
import EditButton from './EditButton';

interface AddressInformation {
    keyid: number;
    patientid: number;
    area: string;
    region: string;
    gpsLocation: string;
    address: string;
    country: string | null;
    district: string;
}

const AddressViewOnly = ({ patientid }: {patientid: string | number}) => {
    const [addressInfo, setAddressInfo] = useState<AddressInformation | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAddressInfo = async () => {
            try {
                const response = await customFetch(`register/addressingformation?patientid=${patientid}`);
                setAddressInfo(response.result);
            } catch (err) {
                setError('Failed to load address information');
                console.error('Error fetching address info:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchAddressInfo();
    }, [patientid]);

    if (loading) return <div className={styles.loading}><div className="spinner-border spinner-border-sm text-primary" role="status"></div></div>;
    if (error) return <div className={styles.error}>{error}</div>;
    if (!addressInfo) return <div className={styles.error}>No address information available</div>;

    const addressItems = [
        { icon: <RiMapPinLine size={16} />, label: 'Address', value: addressInfo.address },
        { icon: <RiBuilding2Line size={16} />, label: 'Area', value: addressInfo.area },
        { icon: <RiRoadMapLine size={16} />, label: 'District', value: addressInfo.district },
        { icon: <RiMapPinLine size={16} />, label: 'Region', value: addressInfo.region },
        { icon: <RiMapPinLine size={16} />, label: 'Country', value: addressInfo.country },
        { icon: <RiMapPinLine size={16} />, label: 'GPS Location', value: addressInfo.gpsLocation }
    ];

    return (
        <div className={styles.container}>
         <div className="d-flex justify-content-between">
         <div className={styles.header}>
                <div className={styles.headerTitle}>Address Information</div>
            </div>
            <div>
            <EditButton patientid={patientid} section="address" />
            </div>
         </div>
            <div className={styles.infoGrid}>
                {addressItems.map((item, index) => (
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

export default AddressViewOnly;