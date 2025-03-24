"use client"
import React, { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { RiImageAddLine } from '@remixicon/react';
import styles from './PatientImageUpload.module.css';

const PatientImageUpload = ({ defaultImage = null }) => {
    const formContext = useFormContext();
    const [preview, setPreview] = useState(defaultImage);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result);
            };
            reader.readAsDataURL(file);
            if (formContext) {
                formContext.setValue('patientImage', file);
            }
        }
    };

    return (
        <div className={styles.patientImageUpload}>
            <label className="pls-label required fs-6">Patient Photo</label>
            <div className={styles.uploadContainer}>
                <div className={styles.previewArea}>
                    {preview ? (
                        <img src={preview} alt="Preview" className={styles.imagePreview} />
                    ) : (
                        <div className={styles.placeholder}>
                            <RiImageAddLine size={40} color="#6c757d" />
                            <p className={styles.placeholderText}>Click to upload photo</p>
                        </div>
                    )}
                </div>
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className={styles.fileInput}
                    {...(formContext && { ...formContext.register('patientImage') })}
                />
            </div>
        </div>
    );
};

export default PatientImageUpload;