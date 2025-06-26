"use client"
import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { useFormContext } from 'react-hook-form';
import { RiImageAddLine } from '@remixicon/react';
import styles from './PatientImageUpload.module.css';

const PatientImageUpload = ({ 
  defaultImage = null,
  tenantId = 3,
  maxSizeMB = 5,
  patientid
}) => {
    const formContext = useFormContext();
    const [preview, setPreview] = useState(defaultImage);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSavedImage = async () => {
            try {
                const response = await fetch(`${process.env.BASEURL}patients/images?tenantId=${tenantId}&patientid=${patientid}`);
                const data = await response.json();
                
                if (data?.imagePath) {
                    const imageUrl = `${process.env.BASEURL}/patient/images/${data.imagePath}?tenantId=${tenantId}&patientid=${patientid}`;
                    const imageResponse = await fetch(imageUrl);
                    if (imageResponse.ok) {
                        const blob = await imageResponse.blob();
                        const objectUrl = URL.createObjectURL(blob);
                        setPreview(objectUrl);
                        formContext?.setValue('patientImage', imageUrl);
                    }
                }
            } catch (error) {
                console.error('Error loading saved image:', error);
                setPreview(defaultImage);
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
    }, [patientid, formContext, defaultImage]);

    const handleImageChange = async (file) => {
        if (!file) return;
        
        if (file.size > maxSizeMB * 1024 * 1024) {
            setError(`Image must be smaller than ${maxSizeMB}MB`);
            return;
        }

        try {
            setIsUploading(true);
            setError(null);
            
            const reader = new FileReader();
            reader.onloadend = () => setPreview(reader.result);
            reader.readAsDataURL(file);

            const formData = new FormData();
            formData.append('file', file);
            
            console.log('Starting upload...', {
                file: file.name,
                size: file.size,
                type: file.type
            });

            const response = await fetch(`${process.env.BASEURL}storage/prime/uploads?tenantId=${tenantId}&&evaluation=${patientid}&&category=patients&&patientid=${patientid}`, {
                method: 'POST',
                body: formData,
            });

            const responseBody = await response.text();
            console.log('Server response:', response.status, responseBody);

            if (!response.ok) {
                throw new Error(`Upload failed: ${response.status} - ${responseBody}`);
            }

            const data = JSON.parse(responseBody);
            if (data.url) {
                formContext?.setValue('patientImage', data.url);
                console.log('Upload successful:', data.url);
            }
        } catch (error) {
            console.error('Upload error:', error);
            setError(error.message || 'Failed to upload image. Please try again.');
            setPreview(defaultImage);
        } finally {
            setIsUploading(false);
        }
    };

    const onDrop = useCallback((acceptedFiles) => {
        handleImageChange(acceptedFiles[0]);
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.jpeg', '.jpg', '.png', '.gif']
        },
        multiple: false,
        disabled: isUploading
    });

    return (
        <div className={styles.patientImageUpload}>
            <label className="pls-label required fs-6">Patient Photo</label>
            <div 
                {...getRootProps()}
                className={`${styles.uploadContainer} ${isDragActive ? styles.dragging : ''}`}
            >
                <input {...getInputProps()} />
                <div className={styles.previewArea}>
                    {isUploading ? (
                        <div className={styles.placeholder} aria-busy="true">
                            <div className="spinner-border text-secondary" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    ) : preview ? (
                        <img 
                          src={preview} 
                          alt="Patient preview" 
                          className={styles.imagePreview} 
                        />
                    ) : (
                        <div className={styles.placeholder}>
                            <RiImageAddLine size={40} color="#6c757d" aria-hidden="true" />
                            <p className={styles.placeholderText}>Click to upload photo</p>
                        </div>
                    )}
                </div>
                {error && <p className={styles.errorText}>{error}</p>}
            </div>
        </div>
    );
};

export default PatientImageUpload;