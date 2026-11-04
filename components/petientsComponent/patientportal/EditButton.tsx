import React from 'react';
import { RiEditLine } from '@remixicon/react';
import { useRouter } from 'next/navigation';
import styles from './EditButton.module.css';

const EditButton = ({ patientid, section }: {patientid: string | number; section: string}) => {
    const router = useRouter();

    const sectionMap: Record<string, string> = {
        personal: 'personal-information',
        address: 'addressing-information',
        emergency: 'emergency-contact',
        credentials: 'credentials',
        settings: 'settings',
    };

    const handleEdit = () => {
        const pathSection = sectionMap[section] || 'personal-information';
        router.push(`/crm/registration/${patientid}/${pathSection}`);
    };

    return (
        <button
            onClick={handleEdit}
            className={styles.editButton}
        >
            <RiEditLine size={16} />
            <span>Edit</span>
        </button>
    );
};

export default EditButton;