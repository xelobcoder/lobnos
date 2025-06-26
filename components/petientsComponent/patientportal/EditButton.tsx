import React from 'react';
import { RiEditLine } from '@remixicon/react';
import { useRouter } from 'next/navigation';
import styles from './EditButton.module.css';

const EditButton = ({ patientid, section }) => {
    const router = useRouter();

    const handleEdit = () => {
        router.push(`/registration?patientid=${patientid}&section=${section}`);
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