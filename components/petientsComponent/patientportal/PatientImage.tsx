"use client"
import React, { useEffect, useState } from 'react';
import styles from './PatientImage.module.css';

export default function PatientImage({ patientid = 1 }) {
    const [preview, setPreview] = useState<string | null>(null);
    const tenantId = 3;

    useEffect(() => {
        const fetchSavedImage = async () => {
            try {
                const response = await fetch(`${process.env.BASEURL}patients/images?tenantId=${tenantId}&patientid=${patientid}`);
                const data = await response.json();
                
                if (data?.imagePath) {
                    const imageUrl = `${process.env.BASEURL}/patient/images/${data.imagePath}?tenantId=${tenantId}`;
                    const imageResponse = await fetch(imageUrl);
                    if (imageResponse.ok) {
                        const blob = await imageResponse.blob();
                        const objectUrl = URL.createObjectURL(blob);
                        setPreview(objectUrl);
                    }
                }
            } catch (error) {
                console.error('Error loading saved image:', error);
                setPreview(null);
            }
        };

        if (patientid) {
            fetchSavedImage();
        }

        return () => {
            if (preview && preview.startsWith('blob:')) {
                URL.revokeObjectURL(preview);
            }
        };
    }, [patientid]);

    return (
        <div className={styles.imageWrapper}>
            {preview ? (
                <img 
                    src={preview} 
                    alt="Patient" 
                    className={styles.patientImage}
                />
            ) : (
                <div className={styles.placeholderImage}>
                    <svg className={styles.placeholderIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                </div>
            )}
        </div>
    );
}
